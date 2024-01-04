/********************************************************
 * Class Name     : TableIndexConstraints
 * Purpose        : Create and Delete Constraints
 * Class Used     : AD_TableIndex
 * Chronological  : Development
 * Ruby           : 13-Oct-2023
  ******************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;
namespace VAdvantage.Process
{
	/// <summary>
	/// Used to create or delete constraints for Ad_TableIndex 
	/// </summary>
	public class TableIndexConstraints : ProcessEngine.SvrProcess
	{
		private int p_AD_TableIndex_ID = 0;
		private int p_AD_Table_ID = 0;
		private bool p_Delete = false;

		protected override void Prepare()
		{
			ProcessInfoParameter[] para = GetParameter();
			for (int i = 0; i < para.Length; i++)
			{
				String name = para[i].GetParameterName();
				if (para[i].GetParameter() == null)
				{
					break;
				}
				else if (name.Equals("AD_TableIndex_ID"))
					p_AD_TableIndex_ID = Utility.Util.GetValueOfInt((Decimal)para[i].GetParameter());
				else if (name.Equals("AD_Table_ID"))
					p_AD_Table_ID = Utility.Util.GetValueOfInt((Decimal)para[i].GetParameter());
				else if (name.Equals("Delete"))
					p_Delete = Utility.Util.GetValueOfBool("Y".Equals(para[i].GetParameter()));
				else
					log.Log(Level.SEVERE, "Unknown Parameter: " + name);
			}
		}

		protected override String DoIt()
		{
			Ctx ctx = GetCtx();
			if (p_AD_Table_ID == 0 || p_AD_TableIndex_ID == 0)
			{
				throw new Exception(Msg.GetMsg(ctx, "VISSelectConstraint"));
			}
			MTableIndex index = new MTableIndex(ctx, p_AD_TableIndex_ID, Get_TrxName());
			string tableName = index.GetTblName();
			string indexName = index.GetName();
			log.Info(index.ToString());
			if (p_AD_TableIndex_ID > 0 && !p_Delete)   //Create Constraints
			{
				return ValidateTableIndex(ctx, index, Get_TrxName(), GetProcessInfo());
			}
			if (p_AD_TableIndex_ID > 0 && p_Delete)    //Delete Contraints
			{
				int aValue = DB.ExecuteQuery("ALTER TABLE " + tableName + " DROP CONSTRAINT " + indexName);
				if (aValue < 0)
				{
					return Msg.GetMsg(ctx, "NotExistConstraints");
				}
				else
				{
					MIndexColumn[] indexCols = index.GetColumns(true, true);//Fetch column details
					if (indexCols != null && indexCols.Length > 0)
					{
						for (int i = 0; i < indexCols.Length; i++)
						{
							int rvalue = DB.ExecuteQuery("DELETE FROM AD_IndexColumn WHERE AD_IndexColumn_ID=" + Utility.Util.GetValueOfInt(indexCols[i].GetAD_IndexColumn_ID()));
							if (rvalue < 0)
								return Msg.GetMsg(ctx, "DeleteIndexColumnFailed");
						}
					}
					int dValue = DB.ExecuteQuery("DELETE FROM AD_TableIndex WHERE AD_TableIndex_ID=" + p_AD_TableIndex_ID);
					if (dValue < 0)
						return Msg.GetMsg(ctx, "DeleteTableIndexFailed");
					return Msg.GetMsg(ctx, "DeleteConstraintSuccess");
				}
			}
			return Msg.GetMsg(ctx, "Failed");
		}

		public static String ValidateTableIndex(Ctx ctx, MTableIndex index, Trx trxName, ProcessInfo pi)
		{
			Trx trx = trxName;
			if (trx == null)
			{
				trx = Trx.GetTrx("vidatetable");
			}
			String schema = DB.GetSchema();
			String tableName = index.GetTblName();
			DatabaseMetaData md = new DatabaseMetaData();
			String catalog = "REFERENCE";
			String[] indexColsFromDB = new String[30];
			String[] ascOrDescColsFromDB = new String[30];
			int numIndexColsFromDB = 0;
			bool indexNUniqueInDB = true;
			bool found = false;
			DataSet rs = md.GetTableIndexColumns(catalog, schema, tableName);
			foreach (DataRow dr in rs.Tables[0].Rows)
			{
				String dbIndexName = dr["INDEX_NAME"].ToString();
				if (dbIndexName == null)
					continue;
				if (string.Compare(index.GetName(), dbIndexName, true) == 0)
				{
					found = true;
					indexNUniqueInDB = Util.GetValueOfBool(dr["NON_UNIQUE"]);
					String columnName = dr["COLUMN_NAME"].ToString();
					int pos = Utility.Util.GetValueOfInt(dr["ORDINAL_POSITION"]);
					if (pos > 0)
					{
						indexColsFromDB[pos - 1] = columnName;
						ascOrDescColsFromDB[pos - 1] = dr["ASC_OR_DESC"].ToString();
					}
				}
			}

			MIndexColumn[] indexCols = index.GetColumns(true, true);
			bool modified = false;
			if (indexCols.Length <= 0)
				throw new Exception(Msg.GetMsg(ctx, "NoIndexColumnsSpecified"));
			else if (!found)
			{
				String sql = index.GetDDL();
				int rvalue = DB.ExecuteQuery(sql, null, trxName);
				if (pi != null)
					pi.AddLog(0, null, new Decimal(rvalue), sql);
				if (rvalue < 0)
					return Msg.GetMsg(ctx, "CreatedIndexFailed");
				return Msg.GetMsg(ctx, "CreatedIndexSuccess");
			}
			else
			{
				for (int i = 0; i < 30; i++)
				{
					if (indexColsFromDB[i] != null)
						numIndexColsFromDB++;
					else
						break;
				}

				if (numIndexColsFromDB != indexCols.Length)
					modified = true;
				else if (!indexNUniqueInDB != index.IsUnique())
					modified = true;
				else
				{
					for (int j = 0; j < indexCols.Length; j++)
					{
						String indexColFromDBWithAscOrDesc = indexColsFromDB[j];
						String ascOrDesc = ascOrDescColsFromDB[j];
						if (ascOrDesc != null && ascOrDesc.Equals("D"))
							indexColFromDBWithAscOrDesc = indexColFromDBWithAscOrDesc + " DESC";
						else if (ascOrDesc != null && ascOrDesc.Equals("A"))
							indexColFromDBWithAscOrDesc = indexColFromDBWithAscOrDesc + " ASC";

						/*what if they are returned in a diff sequence ?*/
						if (string.Compare(indexCols[j].GetColumnName(), indexColsFromDB[j], true) == 0)
							continue;
						else if (string.Compare(indexCols[j].GetColumnName(), indexColFromDBWithAscOrDesc, true) == 0)
							continue;
						else if ((indexColsFromDB[j].StartsWith("\"")) && (indexColsFromDB[j].EndsWith("\"")))
						{
							String cname = indexColsFromDB[j].Substring(1, indexColsFromDB[j].Length - 1);
							if (string.Compare(cname, indexCols[j].GetColumnName(), true) == 0)
								continue;
							else
							{
								modified = true;
								break;
							}
						}
						else
						{
							modified = true;
							break;
						}
					}
				}

				if (modified)
				{
					String sql = index.GetDropDDL();
					int rvalue = DB.ExecuteQuery(sql, null, trxName);
					if (pi != null)
						pi.AddLog(0, null, new Decimal(rvalue), sql);

					sql = index.GetDDL();
					rvalue = DB.ExecuteQuery(sql, null, trxName);
					if (pi != null)
						pi.AddLog(0, null, new Decimal(rvalue), sql);
					if (rvalue == -1)
						throw new Exception(Msg.GetMsg(ctx, "FailedModifyIndex"));
					else
						return Msg.GetMsg(ctx, "ModifiedIndexSuccess");
				}
				else
				{
					return Msg.GetMsg(ctx, "NoChangesToIndex");
				}
			}
		}
	}
}
