namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_UserHomeWidget
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_UserHomeWidget : PO{public X_AD_UserHomeWidget (Context ctx, int AD_UserHomeWidget_ID, Trx trxName) : base (ctx, AD_UserHomeWidget_ID, trxName){/** if (AD_UserHomeWidget_ID == 0){SetAD_Role_ID (0);SetAD_UserHomeWidget_ID (0);} */
}public X_AD_UserHomeWidget (Ctx ctx, int AD_UserHomeWidget_ID, Trx trxName) : base (ctx, AD_UserHomeWidget_ID, trxName){/** if (AD_UserHomeWidget_ID == 0){SetAD_Role_ID (0);SetAD_UserHomeWidget_ID (0);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_UserHomeWidget (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_UserHomeWidget (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_UserHomeWidget (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_UserHomeWidget(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 27996860587775L;/** Last Updated Timestamp 5/3/2024 4:51:11 PM */
public static long updatedMS = 1714735270986L;/** AD_Table_ID=1001347 */
public static int Table_ID; // =1001347;
/** TableName=AD_UserHomeWidget */
public static String Table_Name="AD_UserHomeWidget";
protected static KeyNamePair model;protected Decimal accessLevel = new Decimal(7);/** AccessLevel
@return 7 - System - Client - Org 
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_UserHomeWidget[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Role.
@param AD_Role_ID Responsibility Role */
public void SetAD_Role_ID (int AD_Role_ID){if (AD_Role_ID < 0) throw new ArgumentException ("AD_Role_ID is mandatory.");Set_Value ("AD_Role_ID", AD_Role_ID);}/** Get Role.
@return Responsibility Role */
public int GetAD_Role_ID() {Object ii = Get_Value("AD_Role_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set AD_UserHomeWidget_ID.
@param AD_UserHomeWidget_ID AD_UserHomeWidget_ID */
public void SetAD_UserHomeWidget_ID (int AD_UserHomeWidget_ID){if (AD_UserHomeWidget_ID < 1) throw new ArgumentException ("AD_UserHomeWidget_ID is mandatory.");Set_ValueNoCheck ("AD_UserHomeWidget_ID", AD_UserHomeWidget_ID);}/** Get AD_UserHomeWidget_ID.
@return AD_UserHomeWidget_ID */
public int GetAD_UserHomeWidget_ID() {Object ii = Get_Value("AD_UserHomeWidget_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set User/Contact.
@param AD_User_ID User within the system - Internal or Customer/Prospect Contact. */
public void SetAD_User_ID (int AD_User_ID){if (AD_User_ID <= 0) Set_Value ("AD_User_ID", null);else
Set_Value ("AD_User_ID", AD_User_ID);}/** Get User/Contact.
@return User within the system - Internal or Customer/Prospect Contact. */
public int GetAD_User_ID() {Object ii = Get_Value("AD_User_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set AD_WidgetSize_ID.
@param AD_WidgetSize_ID AD_WidgetSize_ID */
public void SetAD_WidgetSize_ID (int AD_WidgetSize_ID){if (AD_WidgetSize_ID <= 0) Set_Value ("AD_WidgetSize_ID", null);else
Set_Value ("AD_WidgetSize_ID", AD_WidgetSize_ID);}/** Get AD_WidgetSize_ID.
@return AD_WidgetSize_ID */
public int GetAD_WidgetSize_ID() {Object ii = Get_Value("AD_WidgetSize_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set SRNO.
@param SRNO SRNO */
public void SetSRNO (int SRNO){Set_Value ("SRNO", SRNO);}/** Get SRNO.
@return SRNO */
public int GetSRNO() {Object ii = Get_Value("SRNO");if (ii == null) return 0;return Convert.ToInt32(ii);}}
}