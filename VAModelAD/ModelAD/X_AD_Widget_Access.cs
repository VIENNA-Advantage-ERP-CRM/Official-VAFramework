namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_Widget_Access
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_Widget_Access : PO{public X_AD_Widget_Access (Context ctx, int AD_Widget_Access_ID, Trx trxName) : base (ctx, AD_Widget_Access_ID, trxName){/** if (AD_Widget_Access_ID == 0){SetAD_Role_ID (0);SetAD_Widget_Access_ID (0);SetAD_Widget_ID (0);} */
}public X_AD_Widget_Access (Ctx ctx, int AD_Widget_Access_ID, Trx trxName) : base (ctx, AD_Widget_Access_ID, trxName){/** if (AD_Widget_Access_ID == 0){SetAD_Role_ID (0);SetAD_Widget_Access_ID (0);SetAD_Widget_ID (0);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget_Access (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget_Access (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget_Access (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_Widget_Access(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 28008270587584L;/** Last Updated Timestamp 9/12/2024 6:17:50 PM */
public static long updatedMS = 1726145270795L;/** AD_Table_ID=1001348 */
public static int Table_ID; // =1001348;
/** TableName=AD_Widget_Access */
public static String Table_Name="AD_Widget_Access";
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_Widget_Access[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Role.
@param AD_Role_ID Responsibility Role */
public void SetAD_Role_ID (int AD_Role_ID){if (AD_Role_ID < 0) throw new ArgumentException ("AD_Role_ID is mandatory.");Set_ValueNoCheck ("AD_Role_ID", AD_Role_ID);}/** Get Role.
@return Responsibility Role */
public int GetAD_Role_ID() {Object ii = Get_Value("AD_Role_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set AD_Widget_Access_ID.
@param AD_Widget_Access_ID AD_Widget_Access_ID */
public void SetAD_Widget_Access_ID (int AD_Widget_Access_ID){if (AD_Widget_Access_ID < 1) throw new ArgumentException ("AD_Widget_Access_ID is mandatory.");Set_ValueNoCheck ("AD_Widget_Access_ID", AD_Widget_Access_ID);}/** Get AD_Widget_Access_ID.
@return AD_Widget_Access_ID */
public int GetAD_Widget_Access_ID() {Object ii = Get_Value("AD_Widget_Access_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Widget.
@param AD_Widget_ID Widget */
public void SetAD_Widget_ID (int AD_Widget_ID){if (AD_Widget_ID < 1) throw new ArgumentException ("AD_Widget_ID is mandatory.");Set_ValueNoCheck ("AD_Widget_ID", AD_Widget_ID);}/** Get Widget.
@return Widget */
public int GetAD_Widget_ID() {Object ii = Get_Value("AD_Widget_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}}
}