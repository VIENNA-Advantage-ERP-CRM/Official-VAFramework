namespace VAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for VIS_AdditionalInformation
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_VIS_AdditionalInformation : PO{public X_VIS_AdditionalInformation (Context ctx, int VIS_AdditionalInformation_ID, Trx trxName) : base (ctx, VIS_AdditionalInformation_ID, trxName){/** if (VIS_AdditionalInformation_ID == 0){SetAD_Table_ID (0);SetRecord_ID (0);SetVIS_AdditionalInformation_ID (0);} */
}public X_VIS_AdditionalInformation (Ctx ctx, int VIS_AdditionalInformation_ID, Trx trxName) : base (ctx, VIS_AdditionalInformation_ID, trxName){/** if (VIS_AdditionalInformation_ID == 0){SetAD_Table_ID (0);SetRecord_ID (0);SetVIS_AdditionalInformation_ID (0);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AdditionalInformation (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AdditionalInformation (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_VIS_AdditionalInformation (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_VIS_AdditionalInformation(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 28040044256982L;/** Last Updated Timestamp 9/15/2025 12:19:00 PM */
public static long updatedMS = 1757918940193L;/** AD_Table_ID=1001384 */
public static int Table_ID; // =1001384;
/** TableName=VIS_AdditionalInformation */
public static String Table_Name="VIS_AdditionalInformation";
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_VIS_AdditionalInformation[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Table/View.
@param AD_Table_ID Database Table information */
public void SetAD_Table_ID (int AD_Table_ID){if (AD_Table_ID < 1) throw new ArgumentException ("AD_Table_ID is mandatory.");Set_Value ("AD_Table_ID", AD_Table_ID);}/** Get Table/View.
@return Database Table information */
public int GetAD_Table_ID() {Object ii = Get_Value("AD_Table_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set Record ID.
@param Record_ID Direct internal record ID */
public void SetRecord_ID (int Record_ID){if (Record_ID < 0) throw new ArgumentException ("Record_ID is mandatory.");Set_Value ("Record_ID", Record_ID);}/** Get Record ID.
@return Direct internal record ID */
public int GetRecord_ID() {Object ii = Get_Value("Record_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Additional Information.
@param VIS_AdditionalInformation_ID Additional information record */
public void SetVIS_AdditionalInformation_ID (int VIS_AdditionalInformation_ID){if (VIS_AdditionalInformation_ID < 1) throw new ArgumentException ("VIS_AdditionalInformation_ID is mandatory.");Set_ValueNoCheck ("VIS_AdditionalInformation_ID", VIS_AdditionalInformation_ID);}/** Get Additional Information.
@return Additional information record */
public int GetVIS_AdditionalInformation_ID() {Object ii = Get_Value("VIS_AdditionalInformation_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Information Data.
@param VIS_InfoData This column contains data for the information. */
public void SetVIS_InfoData (String VIS_InfoData){Set_Value ("VIS_InfoData", VIS_InfoData);}/** Get Information Data.
@return This column contains data for the information. */
public String GetVIS_InfoData() {return (String)Get_Value("VIS_InfoData");}}
}