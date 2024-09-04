namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_Widget
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_Widget : PO{public X_AD_Widget (Context ctx, int AD_Widget_ID, Trx trxName) : base (ctx, AD_Widget_ID, trxName){/** if (AD_Widget_ID == 0){SetAD_Widget_ID (0);} */
}public X_AD_Widget (Ctx ctx, int AD_Widget_ID, Trx trxName) : base (ctx, AD_Widget_ID, trxName){/** if (AD_Widget_ID == 0){SetAD_Widget_ID (0);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_Widget (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_Widget(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 28007038681623L;/** Last Updated Timestamp 8/29/2024 12:06:05 PM */
public static long updatedMS = 1724913364834L;/** AD_Table_ID=1001344 */
public static int Table_ID; // =1001344;
/** TableName=AD_Widget */
public static String Table_Name="AD_Widget";
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_Widget[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set ModuleInfo.
@param AD_ModuleInfo_ID ModuleInfo */
public void SetAD_ModuleInfo_ID (int AD_ModuleInfo_ID){if (AD_ModuleInfo_ID <= 0) Set_Value ("AD_ModuleInfo_ID", null);else
Set_Value ("AD_ModuleInfo_ID", AD_ModuleInfo_ID);}/** Get ModuleInfo.
@return ModuleInfo */
public int GetAD_ModuleInfo_ID() {Object ii = Get_Value("AD_ModuleInfo_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Widget.
@param AD_Widget_ID Widget */
public void SetAD_Widget_ID (int AD_Widget_ID){if (AD_Widget_ID < 1) throw new ArgumentException ("AD_Widget_ID is mandatory.");Set_ValueNoCheck ("AD_Widget_ID", AD_Widget_ID);}/** Get Widget.
@return Widget */
public int GetAD_Widget_ID() {Object ii = Get_Value("AD_Widget_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Screen.
@param AD_Window_ID Data entry or display window */
public void SetAD_Window_ID (String AD_Window_ID){if (AD_Window_ID != null && AD_Window_ID.Length > 1000){log.Warning("Length > 1000 - truncated");AD_Window_ID = AD_Window_ID.Substring(0,1000);}Set_Value ("AD_Window_ID", AD_Window_ID);}/** Get Screen.
@return Data entry or display window */
public String GetAD_Window_ID() {return (String)Get_Value("AD_Window_ID");}/** Set Display Name.
@param DisplayName Window Name */
public void SetDisplayName (String DisplayName){if (DisplayName != null && DisplayName.Length > 100){log.Warning("Length > 100 - truncated");DisplayName = DisplayName.Substring(0,100);}Set_Value ("DisplayName", DisplayName);}/** Get Display Name.
@return Window Name */
public String GetDisplayName() {return (String)Get_Value("DisplayName");}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set HTML Style.
@param HTMLStyle HTML style for field */
public void SetHTMLStyle (String HTMLStyle){if (HTMLStyle != null && HTMLStyle.Length > 250){log.Warning("Length > 250 - truncated");HTMLStyle = HTMLStyle.Substring(0,250);}Set_Value ("HTMLStyle", HTMLStyle);}/** Get HTML Style.
@return HTML style for field */
public String GetHTMLStyle() {return (String)Get_Value("HTMLStyle");}/** Set Home Page.
@param HomePage Home Page */
public void SetHomePage (Boolean HomePage){Set_Value ("HomePage", HomePage);}/** Get Home Page.
@return Home Page */
public Boolean IsHomePage() {Object oo = Get_Value("HomePage");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Show Advanced.
@param IsShowAdvanced Show Advanced Tabs */
public void SetIsShowAdvanced (Boolean IsShowAdvanced){Set_Value ("IsShowAdvanced", IsShowAdvanced);}/** Get Show Advanced.
@return Show Advanced Tabs */
public Boolean IsShowAdvanced() {Object oo = Get_Value("IsShowAdvanced");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Show Random Color.
@param IsShowRandomColor Show Random Color */
public void SetIsShowRandomColor (Boolean IsShowRandomColor){Set_Value ("IsShowRandomColor", IsShowRandomColor);}/** Get Show Random Color.
@return Show Random Color */
public Boolean IsShowRandomColor() {Object oo = Get_Value("IsShowRandomColor");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Single Row Layout.
@param IsSingleRow Default for toggle between Single- and Multi-Row (Grid) Layout */
public void SetIsSingleRow (Boolean IsSingleRow){Set_Value ("IsSingleRow", IsSingleRow);}/** Get Single Row Layout.
@return Default for toggle between Single- and Multi-Row (Grid) Layout */
public Boolean IsSingleRow() {Object oo = Get_Value("IsSingleRow");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Window.
@param IsWindow Window */
public void SetIsWindow (Boolean IsWindow){Set_Value ("IsWindow", IsWindow);}/** Get Window.
@return Window */
public Boolean IsWindow() {Object oo = Get_Value("IsWindow");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Name.
@param Name Alphanumeric identifier of the entity */
public void SetName (String Name){if (Name != null && Name.Length > 100){log.Warning("Length > 100 - truncated");Name = Name.Substring(0,100);}Set_Value ("Name", Name);}/** Get Name.
@return Alphanumeric identifier of the entity */
public String GetName() {return (String)Get_Value("Name");}
/** WidgetType AD_Reference_ID=1001050 */
public static int WIDGETTYPE_AD_Reference_ID=1001050;/** Customized Widget = C */
public static String WIDGETTYPE_CustomizedWidget = "C";/** Dynamic Widget = D */
public static String WIDGETTYPE_DynamicWidget = "D";/** Is test a valid value.
@param test testvalue
@returns true if valid **/
public bool IsWidgetTypeValid (String test){return test == null || test.Equals("C") || test.Equals("D");}/** Set Widget Type.
@param WidgetType Widget Type */
public void SetWidgetType (String WidgetType){if (!IsWidgetTypeValid(WidgetType))
throw new ArgumentException ("WidgetType Invalid value - " + WidgetType + " - Reference_ID=1001050 - C - D");if (WidgetType != null && WidgetType.Length > 1){log.Warning("Length > 1 - truncated");WidgetType = WidgetType.Substring(0,1);}Set_Value ("WidgetType", WidgetType);}/** Get Widget Type.
@return Widget Type */
public String GetWidgetType() {return (String)Get_Value("WidgetType");}}
}