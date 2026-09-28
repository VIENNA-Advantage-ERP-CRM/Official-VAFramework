namespace ViennaAdvantage.Model
{
    /** Generated Model - DO NOT CHANGE */
    using System;
    using System.Text;
    using VAdvantage.DataBase;
    using VAdvantage.Common;
    using VAdvantage.Classes;
    using VAdvantage.Process;
    using VAdvantage.Model;
    using VAdvantage.Utility;
    using System.Data;

    /** Generated Model for AD_Dashboard_Access
     *  Role assignment of a dashboard: which roles see it, which may change it, tab order and the role default.
     *  @version Vienna Framework 1.1.1 - $Id$ */
    public class X_AD_Dashboard_Access : PO
    {
        public X_AD_Dashboard_Access(Context ctx, int AD_Dashboard_Access_ID, Trx trxName) : base(ctx, AD_Dashboard_Access_ID, trxName) { }
        public X_AD_Dashboard_Access(Ctx ctx, int AD_Dashboard_Access_ID, Trx trxName) : base(ctx, AD_Dashboard_Access_ID, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard_Access(Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard_Access(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard_Access(Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName) { }

        /** Static Constructor - Set Table ID By Table Name */
        static X_AD_Dashboard_Access() { Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID, Table_Name); }

        /** Serial Version No */
        static long serialVersionUID = 30000000000001L;
        /** AD_Table_ID resolved at load from Table_Name */
        public static int Table_ID;
        /** TableName=AD_Dashboard_Access */
        public static String Table_Name = "AD_Dashboard_Access";
        protected static KeyNamePair model;
        /** AccessLevel = 7 - System/Client/Organization */
        protected Decimal accessLevel = new Decimal(7);

        protected override int Get_AccessLevel() { return Convert.ToInt32(accessLevel.ToString()); }
        protected override POInfo InitPO(Context ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        protected override POInfo InitPO(Ctx ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        public override String ToString() { StringBuilder sb = new StringBuilder("X_AD_Dashboard_Access[").Append(Get_ID()).Append("]"); return sb.ToString(); }

        /** Set AD_Dashboard_Access_ID (primary key). */
        public void SetAD_Dashboard_Access_ID(int AD_Dashboard_Access_ID)
        {
            if (AD_Dashboard_Access_ID < 1) throw new ArgumentException("AD_Dashboard_Access_ID is mandatory.");
            Set_ValueNoCheck("AD_Dashboard_Access_ID", AD_Dashboard_Access_ID);
        }
        public int GetAD_Dashboard_Access_ID() { Object ii = Get_Value("AD_Dashboard_Access_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Dashboard. */
        public void SetAD_Dashboard_ID(int AD_Dashboard_ID)
        {
            if (AD_Dashboard_ID < 1) throw new ArgumentException("AD_Dashboard_ID is mandatory.");
            // parent link, not updateable in the dictionary: Set_Value would drop it
            Set_ValueNoCheck("AD_Dashboard_ID", AD_Dashboard_ID);
        }
        public int GetAD_Dashboard_ID() { Object ii = Get_Value("AD_Dashboard_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Role. */
        public void SetAD_Role_ID(int AD_Role_ID)
        {
            if (AD_Role_ID < 1) throw new ArgumentException("AD_Role_ID is mandatory.");
            Set_Value("AD_Role_ID", AD_Role_ID);
        }
        public int GetAD_Role_ID() { Object ii = Get_Value("AD_Role_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Default - the dashboard opened first for this role. */
        public void SetIsDefault(Boolean IsDefault) { Set_Value("IsDefault", IsDefault); }
        public Boolean IsDefault() { Object oo = Get_Value("IsDefault"); if (oo != null) { if (oo.GetType() == typeof(Boolean)) return (Boolean)oo; return "Y".Equals(oo); } return false; }

        /** Set Read Write - the role may change the shared dashboard (layout, name, roles). */
        public void SetIsReadWrite(Boolean IsReadWrite) { Set_Value("IsReadWrite", IsReadWrite); }
        public Boolean IsReadWrite() { Object oo = Get_Value("IsReadWrite"); if (oo != null) { if (oo.GetType() == typeof(Boolean)) return (Boolean)oo; return "Y".Equals(oo); } return false; }

        /** Set Sequence (tab order). */
        public void SetSeqNo(int SeqNo) { Set_Value("SeqNo", SeqNo); }
        public int GetSeqNo() { Object ii = Get_Value("SeqNo"); if (ii == null) return 0; return Convert.ToInt32(ii); }
    }
}
