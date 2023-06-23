using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
	public class MTableIndex : X_AD_TableIndex
	{

		/** Load Meta Data */

		/** Column name AD_Client_ID */
		public static  String COLUMNNAME_AD_Client_ID = "AD_Client_ID";

		/** Column name AD_Org_ID */
		public static String COLUMNNAME_AD_Org_ID = "AD_Org_ID";

	
		/** Column name AD_Table_ID */
		public static  String COLUMNNAME_AD_Table_ID = "AD_Table_ID";

		/** Column name AD_TableIndex_ID */
		public static  String COLUMNNAME_AD_TableIndex_ID = "AD_TableIndex_ID";

		/** Column name AD_TableIndex_UU */
		public static  String COLUMNNAME_AD_TableIndex_UU = "AD_TableIndex_UU";

		/** Column name Created */
		public static String COLUMNNAME_Created = "Created";

		public static  String COLUMNNAME_Description = "Description";

		/** Column name EntityType */
		public static  String COLUMNNAME_EntityType = "EntityType";

		/** Column name Help */
		public static  String COLUMNNAME_Help = "Help";

		/** Column name IsCreateConstraint */
		public static  String COLUMNNAME_IsCreateConstraint = "IsCreateConstraint";

		/** Column name IsKey */
		public static  String COLUMNNAME_IsKey = "IsKey";

		public static  String COLUMNNAME_IsUnique = "IsUnique";

		public static  String COLUMNNAME_Name = "Name";

		/** Column name Processing */
		public static  String COLUMNNAME_Processing = "Processing";

		public static  String COLUMNNAME_TableIndexDrop = "TableIndexDrop";


		/// <summary>
		/// Get Active Index of Table
		/// </summary>
		/// <param name="table"></param>
		/// <returns></returns>
		public static MTableIndex[] Get(MTable table)
		{
			List<MTableIndex> list = new List<MTableIndex>();
			DataSet ds = DB.ExecuteDataset("SELECT * FROM " + MTableIndex.Table_Name + " WHERE AD_Table_ID = " + table.GetAD_Table_ID(), null, table.Get_Trx());
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(new MTableIndex(table.GetCtx(), ds.Tables[0].Rows[i], table.Get_Trx()));
			}
			return list.ToArray();
		}

		/// <summary>
		/// Get Table Index with Where Clause
		/// </summary>
		/// <param name="ctx"></param>
		/// <param name="whereClause"></param>
		/// <returns></returns>
		public static List<MTableIndex> GetTableIndexesByQuery(Ctx ctx, String whereClause)
		{
			//Query query = new Query(ctx, MTableIndex.Table_Name, whereClause, null);
			//List<MTableIndex> list = query.< MTableIndex > list();
			//return list;
			List<MTableIndex> list = new List<MTableIndex>();
			DataSet ds = DB.ExecuteDataset("SELECT * FROM " + MTableIndex.Table_Name + " WHERE " + whereClause, null, null);
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(new MTableIndex(ctx, ds.Tables[0].Rows[i], null));
			}
			return list;
		}

/// <summary>
/// Std Constructor
/// </summary>
/// <param name="ctx"></param>
/// <param name="AD_TableIndex_ID"></param>
/// <param name="trxName"></param>
	public MTableIndex(Ctx ctx, int AD_TableIndex_ID, Trx trxName):base(ctx,AD_TableIndex_ID,trxName)
	{
		
		if (AD_TableIndex_ID == 0)
			SetInitialDefaults();
	}

		public MTableIndex(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName)
		{

			
		}

		/// <summary>
		/// Set the initial defaults for a new record
		/// </summary>
		private void SetInitialDefaults()
		{
			SetEntityType(ENTITYTYPE_UserMaintained);
			SetIsUnique(false);
			SetIsCreateConstraint(false);
		}

	

	/// <summary>
	/// parent constructor
	/// </summary>
	/// <param name="parent"></param>
	/// <param name="name"></param>
	public MTableIndex(MTable parent, String name):this(parent.GetCtx(),0,parent.Get_TrxName())
	{
		SetClientOrg(parent);
		SetAD_Table_ID(parent.GetAD_Table_ID());
		SetEntityType(parent.GetEntityType());
		SetName(name);
	}

	/** Lines				*/
	private MIndexColumn[] m_columns = null;

	/** Index Create DDL	*/
	private String m_ddl = null;

	private String m_whereClause = "";

		/// <summary>
		/// Get Index Column
		/// </summary>
		/// <param name="reload"></param>
		/// <returns></returns>
		public MIndexColumn[] GetColumns(bool reload)
		{
			return GetColumns(reload, false);
		}

		/// <summary>
		///  Get index columns
		/// </summary>
		/// <param name="reload"></param>
		/// <param name="activeOnly"></param>
		/// <returns></returns>
		public MIndexColumn[] GetColumns(bool reload, bool activeOnly)
		{
			StringBuilder where = new StringBuilder(MIndexColumn.COLUMNNAME_AD_TableIndex_ID).Append("=").Append(GetAD_TableIndex_ID());
			if (activeOnly)
				where.Append(" AND IsActive='Y'");
			String whereClause = where.ToString();

			if (m_columns != null && !reload && string.Equals(m_whereClause, whereClause, StringComparison.OrdinalIgnoreCase))
				return m_columns;

			m_whereClause = whereClause;
			List<MIndexColumn> lst = new List<MIndexColumn>();
			DataSet ds = DB.ExecuteDataset("SELECT * FROM " + MIndexColumn.Table_Name + " WHERE " + whereClause + " ORDER BY " + MIndexColumn.COLUMNNAME_SeqNo, null, Get_Trx());
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				lst.Add(new MIndexColumn(GetCtx(), ds.Tables[0].Rows[i], Get_Trx()));
			}

			m_columns = lst.ToArray();
			return m_columns;
		}

	/**
	 * Get table name
	 * @return table name
	 */
	public String  GetTblName()
	{
		int AD_Table_ID = GetAD_Table_ID();
		return MTable.GetTableName(GetCtx(), AD_Table_ID);
	}

	/**
	 * Get SQL DDL
	 * @return DDL
	 */
	private String CreateDDL()
	{
		StringBuilder sql = null;
		if (!IsCreateConstraint())
		{
			sql = new StringBuilder("CREATE ");
			if (IsUnique())
				sql.Append("UNIQUE ");
			sql.Append("INDEX ").Append(GetName())
				.Append(" ON ").Append(GetTblName())
				.Append(CreateColumnList());
		}
		else if (IsUnique())
		{
			sql = new StringBuilder("ALTER TABLE ").Append(GetTblName()).Append(" ADD CONSTRAINT ").Append(GetName());
			//if (isKey())
			//	sql.Append(" PRIMARY KEY");
			//else
				sql.Append(" UNIQUE");
			sql.Append(CreateColumnList());
		}
		else
		{
			String errMsg = Msg.GetMsg(GetCtx(), "NeitherTableIndexNorUniqueConstraint", new Object[] { GetTblName() });
			log.Severe(errMsg);
			throw new Exception(errMsg);
		}

		return sql.ToString();
	}

	private String CreateColumnList()
	{
		GetColumns(false, true);
		if (m_columns.Length <= 0)
			throw new Exception(Msg.GetMsg(GetCtx(), "NoIndexColumnsSpecified"));
		StringBuilder columnList = new StringBuilder(" (");
		for (int i = 0; i < m_columns.Length; i++)
		{
			MIndexColumn ic = m_columns[i];
			if (i > 0)
				columnList.Append(",");
			columnList.Append(ic.GetColumnName());
		}
		columnList.Append(")");
		return columnList.ToString();
	}

		/// <summary>
		/// Get SQL index create DDL
		/// </summary>
		/// <returns></returns>
		public String GetDDL()
		{
			if (m_ddl == null)
				m_ddl = CreateDDL();
			return m_ddl;
		}

	/// <summary>
	/// Get Drop Sql
	/// </summary>
	/// <returns></returns>
	public String GetDropDDL()
	{
		String sql = null;
		if (IsCreateConstraint())
			sql = "ALTER TABLE " + GetTblName() + " DROP CONSTRAINT " + GetName() + " CASCADE";
		else
			sql = "DROP INDEX " + GetName();
		return sql;
	}

		public  string IsValidIdentifier(string identifier)
		{
			if (String.IsNullOrEmpty(identifier))
				return "InvalidIdentifierEmpty";
			// unquoted identifiers cannot contain spaces
			if (identifier.Contains(" "))
				return "InvalidIdentifierSpaces";
			// first character of identifier must be alphabetic
			if (! System.Text.RegularExpressions.Regex.IsMatch(identifier.Substring(0, 1) ,"[a-zA-Z]"))
				return "InvalidIdentifierFirstCharAlpha";
			// names must contain just alphanumeric and underscore
			if (!System.Text.RegularExpressions.Regex.IsMatch(identifier,"^[a-zA-Z0-9_]*$"))
				return "InvalidIdentifierJustAlpha";
			return null;
		}

		protected override bool BeforeSave(bool newRecord)
		{
			String error = IsValidIdentifier(GetName());
			if (!String.IsNullOrEmpty(error))
			{
				log.SaveError("Error", Msg.GetMsg(GetCtx(), error) + " [Name]");
				return false;
			}
			return true;
		}
			
		/// <summary>
		/// String representation
		/// </summary>
		/// <returns></returns>
	public new String ToString()
	{
		StringBuilder sb = new StringBuilder("MTableIndex[");
		sb.Append(Get_ID()).Append("-")
			.Append(GetName())
			.Append(",AD_Table_ID=").Append(GetAD_Table_ID())
			.Append("]");
		return sb.ToString();
	}
}
}
