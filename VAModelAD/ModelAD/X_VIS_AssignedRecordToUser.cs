namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for VIS_AssignedRecordToUser
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_VIS_AssignedRecordToUser : PO{public X_VIS_AssignedRecordToUser (Context ctx, int VIS_AssignedRecordToUser_ID, Trx trxName) : base (ctx, VIS_AssignedRecordToUser_ID, trxName){/** if (VIS_AssignedRecordToUser_ID == 0){SetVIS_AssignedRecordToUser_ID (0);} */
}public X_VIS_AssignedRecordToUser (Ctx ctx, int VIS_AssignedRecordToUser_ID, Trx trxName) : base (ctx, VIS_AssignedRecordToUser_ID, trxName){/** if (VIS_AssignedRecordToUser_ID == 0){SetVIS_AssignedRecordToUser_ID (0);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AssignedRecordToUser (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AssignedRecordToUser (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AssignedRecordToUser (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_VIS_AssignedRecordToUser(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 28013431282485L;/** Last Updated Timestamp 11/11/2024 11:49:26 AM */
public static long updatedMS = 1731305965696L;/** AD_Table_ID=1001663 */
public static int Table_ID; // =1001663;
/** TableName=VIS_AssignedRecordToUser */
public static String Table_Name="VIS_AssignedRecordToUser";
protected static KeyNamePair model;protected Decimal accessLevel = new Decimal(3);/** AccessLevel
@return 3 - Client - Org 
*/
protected override int Get_AccessLevel(){return Convert.ToInt32(accessLevel.ToString());}/** Load Meta Data
@param ctx context
@return PO Info
*/
protected override POInfo InitPO (Context ctx){POInfo poi = POInfo.GetPOInfo (ctx, Table_ID);return poi;}/** Load Meta Data
@param ctx context
@return PO Info
*/
protected override POInfo InitPO (Ctx ctx){POInfo poi = POInfo.GetPOInfo (ctx, Table_ID);return poi;}/** Info
@return info
*/
public override String ToString(){StringBuilder sb = new StringBuilder ("X_VIS_AssignedRecordToUser[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Table/View.
@param AD_Table_ID Database Table information */
public void SetAD_Table_ID (int AD_Table_ID){if (AD_Table_ID <= 0) Set_Value ("AD_Table_ID", null);else
Set_Value ("AD_Table_ID", AD_Table_ID);}/** Get Table/View.
@return Database Table information */
public int GetAD_Table_ID() {Object ii = Get_Value("AD_Table_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set User/Contact.
@param AD_User_ID User within the system - Internal or Customer/Prospect Contact. */
public void SetAD_User_ID (int AD_User_ID){if (AD_User_ID <= 0) Set_Value ("AD_User_ID", null);else
Set_Value ("AD_User_ID", AD_User_ID);}/** Get User/Contact.
@return User within the system - Internal or Customer/Prospect Contact. */
public int GetAD_User_ID() {Object ii = Get_Value("AD_User_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Screen.
@param AD_Window_ID Data entry or display window */
public void SetAD_Window_ID (int AD_Window_ID){if (AD_Window_ID <= 0) Set_Value ("AD_Window_ID", null);else
Set_Value ("AD_Window_ID", AD_Window_ID);}/** Get Screen.
@return Data entry or display window */
public int GetAD_Window_ID() {Object ii = Get_Value("AD_Window_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set Record ID.
@param Record_ID Direct internal record ID */
public void SetRecord_ID (int Record_ID){if (Record_ID <= 0) Set_Value ("Record_ID", null);else
Set_Value ("Record_ID", Record_ID);}/** Get Record ID.
@return Direct internal record ID */
public int GetRecord_ID() {Object ii = Get_Value("Record_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set VIS_AssignedRecordToUser_ID.
@param VIS_AssignedRecordToUser_ID VIS_AssignedRecordToUser_ID */
public void SetVIS_AssignedRecordToUser_ID (int VIS_AssignedRecordToUser_ID){if (VIS_AssignedRecordToUser_ID < 1) throw new ArgumentException ("VIS_AssignedRecordToUser_ID is mandatory.");Set_ValueNoCheck ("VIS_AssignedRecordToUser_ID", VIS_AssignedRecordToUser_ID);}/** Get VIS_AssignedRecordToUser_ID.
@return VIS_AssignedRecordToUser_ID */
public int GetVIS_AssignedRecordToUser_ID() {Object ii = Get_Value("VIS_AssignedRecordToUser_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}}
}