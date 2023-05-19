using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAdvantage.Process
{
	public class IndexValidate : ProcessEngine.SvrProcess
	{


		private int p_AD_TableIndex_ID = 0;


		protected override void Prepare()
		{
			p_AD_TableIndex_ID = GetRecord_ID();
		}


		protected override String DoIt()
		{
			MTableIndex index = new MTableIndex(GetCtx(), p_AD_TableIndex_ID, Get_TrxName());
			log.Info(index.ToString());

			return ValidateTableIndex(GetCtx(), index, Get_TrxName(), GetProcessInfo());
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

			//var dsMetaData;
		//	if (dsMetaData == null)
		//	{
			//	var dsMetaData = md.GetForeignKeys("", schema, tableName);
			//}


			

			String catalog = "REFERENCE";
			//String schema = DB.GetSchema();
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

					//DataSet dsCol = md.GetIndexInfo(catalog, schema, dbIndexName);
					//foreach (DataRow drCol in dsCol.Tables[0].Rows)
					//{
					String columnName = dr["COLUMN_NAME"].ToString();
					int pos = Utility.Util.GetValueOfInt(dr["ORDINAL_POSITION"]);
					if (pos > 0)
					{
						indexColsFromDB[pos - 1] = columnName;
						ascOrDescColsFromDB[pos - 1] = dr["ASC_OR_DESC"].ToString();
					}
					//}
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
				return Msg.GetMsg(ctx, "CreatedIndexSuccess");
			}
			else
			{
				//Found the index in DB
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
						if (string.Compare(indexCols[j].GetColumnName(),indexColsFromDB[j],true) ==0)
							continue;
						else if (string.Compare(indexCols[j].GetColumnName(),indexColFromDBWithAscOrDesc,true) ==0)
							continue;
						else if ((indexColsFromDB[j].StartsWith("\"")) && (indexColsFromDB[j].EndsWith("\"")))
						{
							/* EDB returns varchar index columns wrapped with double quotes, hence comparing
							 * after stripping the quotes
							 */
							String cname = indexColsFromDB[j].Substring(1, indexColsFromDB[j].Length - 1);
							if (string.Compare(cname,indexCols[j].GetColumnName(),true)==0)
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
					return Msg.GetMsg(ctx, "NoChangesToIndex");
			}
		}
	}
}


