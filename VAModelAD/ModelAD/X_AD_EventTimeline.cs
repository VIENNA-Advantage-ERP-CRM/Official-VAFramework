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

    /** Generated Model for AD_EventTimeline
     *  Record Timeline event row - one lifecycle event (Created / Updated /
     *  DocAction / Workflow / Shared) against a (AD_Table_ID, Record_ID).
     *  @version Vienna Framework 1.1.1 - $Id$ */
    public class X_AD_EventTimeline : PO
    {
        public X_AD_EventTimeline(Context ctx, int AD_EventTimeline_ID, Trx trxName) : base(ctx, AD_EventTimeline_ID, trxName) { }
        public X_AD_EventTimeline(Ctx ctx, int AD_EventTimeline_ID, Trx trxName) : base(ctx, AD_EventTimeline_ID, trxName) { }
        /** Load Constructor */
        public X_AD_EventTimeline(Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_EventTimeline(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_EventTimeline(Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName) { }

        /** Static Constructor - Set Table ID By Table Name */
        static X_AD_EventTimeline() { Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID, Table_Name); }

        /** Serial Version No */
        static long serialVersionUID = 30000000000001L;
        /** AD_Table_ID resolved at load from Table_Name */
        public static int Table_ID;
        /** TableName=AD_EventTimeline */
        public static String Table_Name = "AD_EventTimeline";
        protected static KeyNamePair model;
        /** AccessLevel = 3 - Client/Organization */
        protected Decimal accessLevel = new Decimal(3);

        protected override int Get_AccessLevel() { return Convert.ToInt32(accessLevel.ToString()); }
        protected override POInfo InitPO(Context ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        protected override POInfo InitPO(Ctx ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        public override String ToString() { StringBuilder sb = new StringBuilder("X_AD_EventTimeline[").Append(Get_ID()).Append("]"); return sb.ToString(); }

        /** Set AD_EventTimeline_ID (primary key). */
        public void SetAD_EventTimeline_ID(int AD_EventTimeline_ID)
        {
            if (AD_EventTimeline_ID < 1) throw new ArgumentException("AD_EventTimeline_ID is mandatory.");
            Set_ValueNoCheck("AD_EventTimeline_ID", AD_EventTimeline_ID);
        }
        public int GetAD_EventTimeline_ID() { Object ii = Get_Value("AD_EventTimeline_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Table/View. */
        public void SetAD_Table_ID(int AD_Table_ID)
        {
            if (AD_Table_ID <= 0) Set_Value("AD_Table_ID", null);
            else Set_Value("AD_Table_ID", AD_Table_ID);
        }
        public int GetAD_Table_ID() { Object ii = Get_Value("AD_Table_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Record ID (row within AD_Table_ID). */
        public void SetRecord_ID(int Record_ID) { Set_Value("Record_ID", Record_ID); }
        public int GetRecord_ID() { Object ii = Get_Value("Record_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Event Type (Created / Updated / DocAction / Workflow / Shared). */
        public void SetEventType(String EventType)
        {
            if (EventType == null) throw new ArgumentException("EventType is mandatory.");
            if (EventType.Length > 20) { log.Warning("Length > 20 - truncated"); EventType = EventType.Substring(0, 20); }
            Set_Value("EventType", EventType);
        }
        public String GetEventType() { return (String)Get_Value("EventType"); }

        /** Set Event Date (when the event occurred). */
        public void SetEventDate(DateTime? EventDate) { Set_Value("EventDate", EventDate); }
        public DateTime? GetEventDate() { return (DateTime?)Get_Value("EventDate"); }

        /** Set User/Contact (actor). */
        public void SetAD_User_ID(int AD_User_ID)
        {
            if (AD_User_ID <= 0) Set_Value("AD_User_ID", null);
            else Set_Value("AD_User_ID", AD_User_ID);
        }
        public int GetAD_User_ID() { Object ii = Get_Value("AD_User_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Document Status (for DocAction events). */
        public void SetDocStatus(String DocStatus)
        {
            if (DocStatus != null && DocStatus.Length > 2) { log.Warning("Length > 2 - truncated"); DocStatus = DocStatus.Substring(0, 2); }
            Set_Value("DocStatus", DocStatus);
        }
        public String GetDocStatus() { return (String)Get_Value("DocStatus"); }

        /** Set Workflow Node (for Workflow events). */
        public void SetAD_WF_Node_ID(int AD_WF_Node_ID)
        {
            if (AD_WF_Node_ID <= 0) Set_Value("AD_WF_Node_ID", null);
            else Set_Value("AD_WF_Node_ID", AD_WF_Node_ID);
        }
        public int GetAD_WF_Node_ID() { Object ii = Get_Value("AD_WF_Node_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Description (render-ready note line). */
        public void SetDescription(String Description)
        {
            if (Description != null && Description.Length > 2000) { log.Warning("Length > 2000 - truncated"); Description = Description.Substring(0, 2000); }
            Set_Value("Description", Description);
        }
        public String GetDescription() { return (String)Get_Value("Description"); }

        /** Set Reference ID (optional drill-down to AD_ChangeLog / WF audit). */
        public void SetReference_ID(int Reference_ID) { Set_Value("Reference_ID", Reference_ID); }
        public int GetReference_ID() { Object ii = Get_Value("Reference_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }
    }
}
