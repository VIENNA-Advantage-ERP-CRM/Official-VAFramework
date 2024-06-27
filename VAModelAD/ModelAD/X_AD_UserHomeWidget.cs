namespace ViennaAdvantage.Model{
    /** Generated Model - DO NOT CHANGE */
    using System;
    using System.Text;
    using VAdvantage.DataBase;
    using VAdvantage.Common;
    using VAdvantage.Classes;
    using VAdvantage.Process;
    using VAdvantage.Model;
    using VAdvantage.Utility;
    using System.Data;/** Generated Model for AD_UserHomeWidget
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
    public class X_AD_UserHomeWidget : PO
    {
        public X_AD_UserHomeWidget(Context ctx, int AD_UserHomeWidget_ID, Trx trxName) : base(ctx, AD_UserHomeWidget_ID, trxName)
        {/** if (AD_UserHomeWidget_ID == 0){SetAD_UserHomeWidget_ID (0);} */
        }
        public X_AD_UserHomeWidget(Ctx ctx, int AD_UserHomeWidget_ID, Trx trxName) : base(ctx, AD_UserHomeWidget_ID, trxName)
        {/** if (AD_UserHomeWidget_ID == 0){SetAD_UserHomeWidget_ID (0);} */
        }/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
        public X_AD_UserHomeWidget(Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
        public X_AD_UserHomeWidget(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
        public X_AD_UserHomeWidget(Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName) { }/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
        static X_AD_UserHomeWidget() { Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID, Table_Name); }/** Serial Version No */
        static long serialVersionUID = 27997819700586L;/** Last Updated Timestamp 5/14/2024 7:16:24 PM */
        public static long updatedMS = 1715694383797L;/** AD_Table_ID=1001347 */
        public static int Table_ID; // =1001347;
        /** TableName=AD_UserHomeWidget */
        public static String Table_Name = "AD_UserHomeWidget";
        protected static KeyNamePair model; protected Decimal accessLevel = new Decimal(7);/** AccessLevel
@return 7 - System - Client - Org 
*/
        protected override int Get_AccessLevel() { return Convert.ToInt32(accessLevel.ToString()); }/** Load Meta Data
@param ctx context
@return PO Info
*/
        protected override POInfo InitPO(Context ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }/** Load Meta Data
@param ctx context
@return PO Info
*/
        protected override POInfo InitPO(Ctx ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }/** Info
@return info
*/
        public override String ToString() { StringBuilder sb = new StringBuilder("X_AD_UserHomeWidget[").Append(Get_ID()).Append("]"); return sb.ToString(); }/** Set Role.
@param AD_Role_ID Responsibility Role */
        public void SetAD_Role_ID(int AD_Role_ID)
        {
                Set_Value("AD_Role_ID", AD_Role_ID);
        }/** Get Role.
@return Responsibility Role */
        public int GetAD_Role_ID() { Object ii = Get_Value("AD_Role_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }/** Set AD_UserHomeWidget_ID.
@param AD_UserHomeWidget_ID AD_UserHomeWidget_ID */
        public void SetAD_UserHomeWidget_ID(int AD_UserHomeWidget_ID) { if (AD_UserHomeWidget_ID < 1) throw new ArgumentException("AD_UserHomeWidget_ID is mandatory."); Set_ValueNoCheck("AD_UserHomeWidget_ID", AD_UserHomeWidget_ID); }/** Get AD_UserHomeWidget_ID.
@return AD_UserHomeWidget_ID */
        public int GetAD_UserHomeWidget_ID() { Object ii = Get_Value("AD_UserHomeWidget_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }/** Set User/Contact.
@param AD_User_ID User within the system - Internal or Customer/Prospect Contact. */
        public void SetAD_User_ID(int AD_User_ID)
        {
            if (AD_User_ID <= 0) Set_Value("AD_User_ID", null);
            else
                Set_Value("AD_User_ID", AD_User_ID);
        }/** Get User/Contact.
@return User within the system - Internal or Customer/Prospect Contact. */
        public int GetAD_User_ID() { Object ii = Get_Value("AD_User_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }/** Set Additional Info.
@param AdditionalInfo Additional Info */
        public void SetAdditionalInfo(String AdditionalInfo) { if (AdditionalInfo != null && AdditionalInfo.Length > 1000) { log.Warning("Length > 1000 - truncated"); AdditionalInfo = AdditionalInfo.Substring(0, 1000); } Set_Value("AdditionalInfo", AdditionalInfo); }/** Get Additional Info.
@return Additional Info */
        public String GetAdditionalInfo() { return (String)Get_Value("AdditionalInfo"); }/** Set Component ID.
@param ComponentID Component ID */
        public void SetComponentID(int ComponentID) { Set_Value("ComponentID", ComponentID); }/** Get Component ID.
@return Component ID */
        public int GetComponentID() { Object ii = Get_Value("ComponentID"); if (ii == null) return 0; return Convert.ToInt32(ii); }
        /** ComponentType AD_Reference_ID=1001046 */
        public static int COMPONENTTYPE_AD_Reference_ID = 1001046;/** KPI = K */
        public static String COMPONENTTYPE_KPI = "K";/** Links = L */
        public static String COMPONENTTYPE_Links = "L";/** View = V */
        public static String COMPONENTTYPE_View = "V";/** Widget = W */
        public static String COMPONENTTYPE_Widget = "W";/** Is test a valid value.*/
        public static String COMPONENTTYPE_Charts = "C";/** Is test a valid value.
@param test testvalue
@returns true if valid **/
        public bool IsComponentTypeValid(String test) { return test == null || test.Equals("C") || test.Equals("K") || test.Equals("L") || test.Equals("V") || test.Equals("W"); }/** Set Component Type.
@param ComponentType Component Type */
        public void SetComponentType(String ComponentType)
        {
            if (!IsComponentTypeValid(ComponentType))
                throw new ArgumentException("ComponentType Invalid value - " + ComponentType + " - Reference_ID=1001046 - K - L - V - W - C"); if (ComponentType != null && ComponentType.Length > 1) { log.Warning("Length > 1 - truncated"); ComponentType = ComponentType.Substring(0, 1); }
            Set_Value("ComponentType", ComponentType);
        }/** Get Component Type.
@return Component Type */
        public String GetComponentType() { return (String)Get_Value("ComponentType"); }/** Set Export.
@param Export_ID Export */
        public void SetExport_ID(String Export_ID) { if (Export_ID != null && Export_ID.Length > 50) { log.Warning("Length > 50 - truncated"); Export_ID = Export_ID.Substring(0, 50); } Set_Value("Export_ID", Export_ID); }/** Get Export.
@return Export */
        public String GetExport_ID() { return (String)Get_Value("Export_ID"); }/** Set SRNO.
@param SRNO SRNO */
        public void SetSRNO(int SRNO) { Set_Value("SRNO", SRNO); }/** Get SRNO.
@return SRNO */
        public int GetSRNO() { Object ii = Get_Value("SRNO"); if (ii == null) return 0; return Convert.ToInt32(ii); }
    }
}