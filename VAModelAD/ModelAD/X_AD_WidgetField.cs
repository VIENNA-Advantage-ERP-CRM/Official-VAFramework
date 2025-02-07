namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_WidgetField
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_WidgetField : PO{public X_AD_WidgetField (Context ctx, int AD_WidgetField_ID, Trx trxName) : base (ctx, AD_WidgetField_ID, trxName){/** if (AD_WidgetField_ID == 0){SetAD_Widget_ID (0);SetAD_WidgetField_ID (0);SetControl_Type (null);SetName (null);SetSeqNo (0.0);// @SQL=SELECT COALESCE(MAX(SeqNo),0)+10 AS DefaultValue FROM AD_WidgetField WHERE AD_Widget_ID =@AD_Widget_ID@
} */
}public X_AD_WidgetField (Ctx ctx, int AD_WidgetField_ID, Trx trxName) : base (ctx, AD_WidgetField_ID, trxName){/** if (AD_WidgetField_ID == 0){SetAD_Widget_ID (0);SetAD_WidgetField_ID (0);SetControl_Type (null);SetName (null);SetSeqNo (0.0);// @SQL=SELECT COALESCE(MAX(SeqNo),0)+10 AS DefaultValue FROM AD_WidgetField WHERE AD_Widget_ID =@AD_Widget_ID@
} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_WidgetField (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_WidgetField (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_WidgetField (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_WidgetField(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 28011098314825L;/** Last Updated Timestamp 10/15/2024 11:46:38 AM */
public static long updatedMS = 1728972998036L;/** AD_Table_ID=1002642 */
public static int Table_ID; // =1002642;
/** TableName=AD_WidgetField */
public static String Table_Name="AD_WidgetField";
protected static KeyNamePair model;protected Decimal accessLevel = new Decimal(6);/** AccessLevel
@return 6 - System - Client 
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_WidgetField[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Field.
@param AD_Field_ID Field on a tab in a window */
public void SetAD_Field_ID (int AD_Field_ID){if (AD_Field_ID <= 0) Set_Value ("AD_Field_ID", null);else
Set_Value ("AD_Field_ID", AD_Field_ID);}/** Get Field.
@return Field on a tab in a window */
public int GetAD_Field_ID() {Object ii = Get_Value("AD_Field_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Image.
@param AD_Image_ID Image or Icon */
public void SetAD_Image_ID (int AD_Image_ID){if (AD_Image_ID <= 0) Set_Value ("AD_Image_ID", null);else
Set_Value ("AD_Image_ID", AD_Image_ID);}/** Get Image.
@return Image or Icon */
public int GetAD_Image_ID() {Object ii = Get_Value("AD_Image_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Tab.
@param AD_Tab_ID Tab within a Window */
public void SetAD_Tab_ID (int AD_Tab_ID){if (AD_Tab_ID <= 0) Set_Value ("AD_Tab_ID", null);else
Set_Value ("AD_Tab_ID", AD_Tab_ID);}/** Get Tab.
@return Tab within a Window */
public int GetAD_Tab_ID() {Object ii = Get_Value("AD_Tab_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Widget.
@param AD_Widget_ID Widget */
public void SetAD_Widget_ID (int AD_Widget_ID){if (AD_Widget_ID < 1) throw new ArgumentException ("AD_Widget_ID is mandatory.");Set_ValueNoCheck ("AD_Widget_ID", AD_Widget_ID);}/** Get Widget.
@return Widget */
public int GetAD_Widget_ID() {Object ii = Get_Value("AD_Widget_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set AD_WidgetField_ID.
@param AD_WidgetField_ID AD_WidgetField_ID */
public void SetAD_WidgetField_ID (int AD_WidgetField_ID){if (AD_WidgetField_ID < 1) throw new ArgumentException ("AD_WidgetField_ID is mandatory.");Set_ValueNoCheck ("AD_WidgetField_ID", AD_WidgetField_ID);}/** Get AD_WidgetField_ID.
@return AD_WidgetField_ID */
public int GetAD_WidgetField_ID() {Object ii = Get_Value("AD_WidgetField_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Badge Style.
@param BadgeStyle Badge Style */
public void SetBadgeStyle (String BadgeStyle){if (BadgeStyle != null && BadgeStyle.Length > 800){log.Warning("Length > 800 - truncated");BadgeStyle = BadgeStyle.Substring(0,800);}Set_Value ("BadgeStyle", BadgeStyle);}/** Get Badge Style.
@return Badge Style */
public String GetBadgeStyle() {return (String)Get_Value("BadgeStyle");}/** Set Badge Value.
@param BadgeValue Badge Value */
public void SetBadgeValue (String BadgeValue){if (BadgeValue != null && BadgeValue.Length > 800){log.Warning("Length > 800 - truncated");BadgeValue = BadgeValue.Substring(0,800);}Set_Value ("BadgeValue", BadgeValue);}/** Get Badge Value.
@return Badge Value */
public String GetBadgeValue() {return (String)Get_Value("BadgeValue");}
/** Control_Type AD_Reference_ID=1000664 */
public static int CONTROL_TYPE_AD_Reference_ID=1000664;/** Badge = BG */
public static String CONTROL_TYPE_Badge = "BG";/** Button = BT */
public static String CONTROL_TYPE_Button = "BT";/** Label = LB */
public static String CONTROL_TYPE_Label = "LB";/** Link = LN */
public static String CONTROL_TYPE_Link = "LN";/** Is test a valid value.
@param test testvalue
@returns true if valid **/
public bool IsControl_TypeValid (String test){return test.Equals("BG") || test.Equals("BT") || test.Equals("LB") || test.Equals("LN");}/** Set Control Type.
@param Control_Type Control Type */
public void SetControl_Type (String Control_Type){if (Control_Type == null) throw new ArgumentException ("Control_Type is mandatory");if (!IsControl_TypeValid(Control_Type))
throw new ArgumentException ("Control_Type Invalid value - " + Control_Type + " - Reference_ID=1000664 - BG - BT - LB - LN");if (Control_Type.Length > 2){log.Warning("Length > 2 - truncated");Control_Type = Control_Type.Substring(0,2);}Set_Value ("Control_Type", Control_Type);}/** Get Control Type.
@return Control Type */
public String GetControl_Type() {return (String)Get_Value("Control_Type");}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_Value ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set HTML Style.
@param HTMLStyle HTML style for field */
public void SetHTMLStyle (String HTMLStyle){if (HTMLStyle != null && HTMLStyle.Length > 250){log.Warning("Length > 250 - truncated");HTMLStyle = HTMLStyle.Substring(0,250);}Set_Value ("HTMLStyle", HTMLStyle);}/** Get HTML Style.
@return HTML style for field */
public String GetHTMLStyle() {return (String)Get_Value("HTMLStyle");}/** Set Apply Data Source.
@param IsApplyDataSource Show most frequent list and lookup of window */
public void SetIsApplyDataSource (Boolean IsApplyDataSource){Set_Value ("IsApplyDataSource", IsApplyDataSource);}/** Get Apply Data Source.
@return Show most frequent list and lookup of window */
public Boolean IsApplyDataSource() {Object oo = Get_Value("IsApplyDataSource");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Badge.
@param IsBadge Badge */
public void SetIsBadge (Boolean IsBadge){Set_Value ("IsBadge", IsBadge);}/** Get Badge.
@return Badge */
public Boolean IsBadge() {Object oo = Get_Value("IsBadge");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Same Line.
@param IsSameLine Displayed on same line as previous field */
public void SetIsSameLine (Boolean IsSameLine){Set_Value ("IsSameLine", IsSameLine);}/** Get Same Line.
@return Displayed on same line as previous field */
public Boolean IsSameLine() {Object oo = Get_Value("IsSameLine");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Name.
@param Name Alphanumeric identifier of the entity. */
public void SetName (String Name){if (Name == null) throw new ArgumentException ("Name is mandatory.");if (Name.Length > 100){log.Warning("Length > 100 - truncated");Name = Name.Substring(0,100);}Set_Value ("Name", Name);}/** Get Name.
@return Alphanumeric identifier of the entity. */
public String GetName() {return (String)Get_Value("Name");}/** Set On Click.
@param OnClick On Click */
public void SetOnClick (String OnClick){Set_Value ("OnClick", OnClick);}/** Get On Click.
@return On Click */
public String GetOnClick() {return (String)Get_Value("OnClick");}/** Set Prefix.
@param Prefix Prefix before the sequence number */
public void SetPrefix (String Prefix){if (Prefix != null && Prefix.Length > 250){log.Warning("Length > 250 - truncated");Prefix = Prefix.Substring(0,250);}Set_Value ("Prefix", Prefix);}/** Get Prefix.
@return Prefix before the sequence number */
public String GetPrefix() {return (String)Get_Value("Prefix");}/** Set Sequence.
@param SeqNo Method of ordering elements; lowest number comes first */
public void SetSeqNo (Decimal? SeqNo){if (SeqNo == null) throw new ArgumentException ("SeqNo is mandatory.");Set_Value ("SeqNo", (Decimal?)SeqNo);}/** Get Sequence.
@return Method of ordering elements; lowest number comes first */
public Decimal GetSeqNo() {Object bd =Get_Value("SeqNo");if (bd == null) return Env.ZERO;return  Convert.ToDecimal(bd);}/** Set Suffix.
@param Suffix Suffix after the number */
public void SetSuffix (String Suffix){if (Suffix != null && Suffix.Length > 250){log.Warning("Length > 250 - truncated");Suffix = Suffix.Substring(0,250);}Set_Value ("Suffix", Suffix);}/** Get Suffix.
@return Suffix after the number */
public String GetSuffix() {return (String)Get_Value("Suffix");}/** Set Top.
@param Top Define range between one to ten */
public void SetTop (int Top){Set_Value ("Top", Top);}/** Get Top.
@return Define range between one to ten */
public int GetTop() {Object ii = Get_Value("Top");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Sql WHERE.
@param WhereClause Fully qualified SQL WHERE clause */
public void SetWhereClause (String WhereClause){if (WhereClause != null && WhereClause.Length > 250){log.Warning("Length > 250 - truncated");WhereClause = WhereClause.Substring(0,250);}Set_Value ("WhereClause", WhereClause);}/** Get Sql WHERE.
@return Fully qualified SQL WHERE clause */
public String GetWhereClause() {return (String)Get_Value("WhereClause");}}
}