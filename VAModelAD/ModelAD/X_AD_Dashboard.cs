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

    /** Generated Model for AD_Dashboard
     *  Home dashboard header - a named, ordered set of widgets assigned to roles.
     *  @version Vienna Framework 1.1.1 - $Id$ */
    public class X_AD_Dashboard : PO
    {
        public X_AD_Dashboard(Context ctx, int AD_Dashboard_ID, Trx trxName) : base(ctx, AD_Dashboard_ID, trxName) { }
        public X_AD_Dashboard(Ctx ctx, int AD_Dashboard_ID, Trx trxName) : base(ctx, AD_Dashboard_ID, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard(Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_Dashboard(Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName) { }

        /** Static Constructor - Set Table ID By Table Name */
        static X_AD_Dashboard() { Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID, Table_Name); }

        /** Serial Version No */
        static long serialVersionUID = 30000000000001L;
        /** AD_Table_ID resolved at load from Table_Name */
        public static int Table_ID;
        /** TableName=AD_Dashboard */
        public static String Table_Name = "AD_Dashboard";
        protected static KeyNamePair model;
        /** AccessLevel = 7 - System/Client/Organization */
        protected Decimal accessLevel = new Decimal(7);

        protected override int Get_AccessLevel() { return Convert.ToInt32(accessLevel.ToString()); }
        protected override POInfo InitPO(Context ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        protected override POInfo InitPO(Ctx ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        public override String ToString() { StringBuilder sb = new StringBuilder("X_AD_Dashboard[").Append(Get_ID()).Append("]"); return sb.ToString(); }

        /** Set AD_Dashboard_ID (primary key). */
        public void SetAD_Dashboard_ID(int AD_Dashboard_ID)
        {
            if (AD_Dashboard_ID < 1) throw new ArgumentException("AD_Dashboard_ID is mandatory.");
            Set_ValueNoCheck("AD_Dashboard_ID", AD_Dashboard_ID);
        }
        public int GetAD_Dashboard_ID() { Object ii = Get_Value("AD_Dashboard_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Name. */
        public void SetName(String Name)
        {
            if (Name == null) throw new ArgumentException("Name is mandatory.");
            if (Name != null && Name.Length > 60) { log.Warning("Length > 60 - truncated"); Name = Name.Substring(0, 60); }
            Set_Value("Name", Name);
        }
        public String GetName() { return (String)Get_Value("Name"); }

        /** Set Description. */
        public void SetDescription(String Description)
        {
            if (Description != null && Description.Length > 255) { log.Warning("Length > 255 - truncated"); Description = Description.Substring(0, 255); }
            Set_Value("Description", Description);
        }
        public String GetDescription() { return (String)Get_Value("Description"); }

        /** Set Export. */
        public void SetExport_ID(String Export_ID)
        {
            if (Export_ID != null && Export_ID.Length > 50) { log.Warning("Length > 50 - truncated"); Export_ID = Export_ID.Substring(0, 50); }
            Set_Value("Export_ID", Export_ID);
        }
        public String GetExport_ID() { return (String)Get_Value("Export_ID"); }

        /** Set User/Contact - owner of a user-created dashboard (null = role dashboard maintained in the dictionary). */
        public void SetAD_User_ID(int AD_User_ID)
        {
            if (AD_User_ID < 0) Set_Value("AD_User_ID", null);   // -1 = shared (no owner); 0 is SuperUser
            else Set_Value("AD_User_ID", AD_User_ID);
        }
        public int GetAD_User_ID() { Object ii = Get_Value("AD_User_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }
    }
}
