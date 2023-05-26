namespace VAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_DirectQueryLog
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_DirectQueryLog : PO{public X_AD_DirectQueryLog (Context ctx, int AD_DirectQueryLog_ID, Trx trxName) : base (ctx, AD_DirectQueryLog_ID, trxName){/** if (AD_DirectQueryLog_ID == 0){SetAD_DirectQueryLog_ID (0);SetRecordCount (0);SetSqlQuery (null);} */
}public X_AD_DirectQueryLog (Ctx ctx, int AD_DirectQueryLog_ID, Trx trxName) : base (ctx, AD_DirectQueryLog_ID, trxName){/** if (AD_DirectQueryLog_ID == 0){SetAD_DirectQueryLog_ID (0);SetRecordCount (0);SetSqlQuery (null);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_DirectQueryLog (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_DirectQueryLog (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_DirectQueryLog (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_DirectQueryLog(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 27967203050513L;/** Last Updated Timestamp 5/26/2023 10:38:53 AM */
public static long updatedMS = 1685077733724L;/** AD_Table_ID=1001321 */
public static int Table_ID; // =1001321;
/** TableName=AD_DirectQueryLog */
public static String Table_Name="AD_DirectQueryLog";
protected static KeyNamePair model;protected Decimal accessLevel = new Decimal(4);/** AccessLevel
@return 4 - System 
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_DirectQueryLog[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set AD_DirectQueryLog_ID.
@param AD_DirectQueryLog_ID AD_DirectQueryLog_ID */
public void SetAD_DirectQueryLog_ID (int AD_DirectQueryLog_ID){if (AD_DirectQueryLog_ID < 1) throw new ArgumentException ("AD_DirectQueryLog_ID is mandatory.");Set_ValueNoCheck ("AD_DirectQueryLog_ID", AD_DirectQueryLog_ID);}/** Get AD_DirectQueryLog_ID.
@return AD_DirectQueryLog_ID */
public int GetAD_DirectQueryLog_ID() {Object ii = Get_Value("AD_DirectQueryLog_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Role.
@param AD_Role_ID Responsibility Role */
public void SetAD_Role_ID (int AD_Role_ID){if (AD_Role_ID <= 0) Set_Value ("AD_Role_ID", null);else
Set_Value ("AD_Role_ID", AD_Role_ID);}/** Get Role.
@return Responsibility Role */
public int GetAD_Role_ID() {Object ii = Get_Value("AD_Role_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Session.
@param AD_Session_ID User Session Online or Web */
public void SetAD_Session_ID (int AD_Session_ID){if (AD_Session_ID <= 0) Set_Value ("AD_Session_ID", null);else
Set_Value ("AD_Session_ID", AD_Session_ID);}/** Get Session.
@return User Session Online or Web */
public int GetAD_Session_ID() {Object ii = Get_Value("AD_Session_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Table/View.
@param AD_Table_ID Database Table information */
public void SetAD_Table_ID (int AD_Table_ID){if (AD_Table_ID <= 0) Set_Value ("AD_Table_ID", null);else
Set_Value ("AD_Table_ID", AD_Table_ID);}/** Get Table/View.
@return Database Table information */
public int GetAD_Table_ID() {Object ii = Get_Value("AD_Table_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set Record Count.
@param RecordCount Number of Records */
public void SetRecordCount (int RecordCount){Set_Value ("RecordCount", RecordCount);}/** Get Record Count.
@return Number of Records */
public int GetRecordCount() {Object ii = Get_Value("RecordCount");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Sql Query.
@param SqlQuery Sql Query */
public void SetSqlQuery (String SqlQuery){if (SqlQuery == null) throw new ArgumentException ("SqlQuery is mandatory.");if (SqlQuery.Length > 2000){log.Warning("Length > 2000 - truncated");SqlQuery = SqlQuery.Substring(0,2000);}Set_Value ("SqlQuery", SqlQuery);}/** Get Sql Query.
@return Sql Query */
public String GetSqlQuery() {return (String)Get_Value("SqlQuery");}}
}