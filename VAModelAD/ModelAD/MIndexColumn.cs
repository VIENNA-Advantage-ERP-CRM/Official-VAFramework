using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
	public class MIndexColumn : X_AD_IndexColumn
	{
		
		/** Column name AD_Client_ID */
		public static  String COLUMNNAME_AD_Client_ID = "AD_Client_ID";

		/** Column name AD_IndexColumn_ID */
		public static  String COLUMNNAME_AD_IndexColumn_ID = "AD_IndexColumn_ID";

		/** Column name AD_IndexColumn_UU */
		public static String COLUMNNAME_AD_IndexColumn_UU = "AD_IndexColumn_UU";

		/** Column name AD_Org_ID */
		public static  String COLUMNNAME_AD_Org_ID = "AD_Org_ID";

		/** Column name AD_TableIndex_ID */
		public static String COLUMNNAME_AD_TableIndex_ID = "AD_TableIndex_ID";

		/** Column name ColumnSQL */
		public static  String COLUMNNAME_ColumnSQL = "ColumnSQL";
	
		/** Column name SeqNo */
		public static  String COLUMNNAME_SeqNo = "SeqNo";

		/// <summary>
		/// Std constructor
		/// </summary>
		/// <param name="ctx">context</param>
		/// <param name="AD_IndexColumn_ID">id </param>
		/// <param name="trxName">transaction</param>
		public MIndexColumn(Ctx ctx, int AD_IndexColumn_ID, Trx trxName) : base(ctx, AD_IndexColumn_ID, trxName)
		{
		}

		/// <summary>
		/// Load constructor
		/// </summary>
		/// <param name="ctx"></param>
		/// <param name="dr"></param>
		/// <param name="trxName"></param>
		public MIndexColumn(Ctx ctx, DataRow dr, Trx trxName) : base(ctx, dr, trxName)
		{

		}

		/// <summary>
		/// parent constructor
		/// </summary>
		/// <param name="parent"></param>
		/// <param name="column"></param>
		/// <param name="seqNo"></param>
		public MIndexColumn(MTableIndex parent, MColumn column, int seqNo) : this(parent.GetCtx(), 0, parent.Get_Trx())
		{
			SetClientOrg(parent);
			SetAD_TableIndex_ID(parent.GetAD_TableIndex_ID());
			SetAD_Column_ID(column.GetAD_Column_ID());
			SetSeqNo(seqNo);
			//setEntityType(parent.getEntityType());
		}

		/// <summary>
		/// Get ColumnName
		/// </summary>
		/// <returns></returns>
		public String GetColumnName()
		{
			String sql = GetColumnSQL();        // Function Index
			if (sql != null && sql.Length > 0)
				return sql;
			int AD_Column_ID = GetAD_Column_ID();
			return MColumn.GetColumnName(GetCtx(), AD_Column_ID, Get_TrxName());
		}

		/// <summary>
		/// String representation
		/// </summary>
		/// <returns></returns>
		public new String ToString()
		{
			StringBuilder sb = new StringBuilder("MIndexColumn[");
			sb.Append(Get_ID()).Append("-").Append(GetAD_Column_ID()).Append("]");
			return sb.ToString();
		}
	}
}
