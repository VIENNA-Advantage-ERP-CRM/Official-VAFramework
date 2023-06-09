namespace ViennaAdvantage.Model{
/** Generated Model - DO NOT CHANGE */
using System;using System.Text;using VAdvantage.DataBase;using VAdvantage.Common;using VAdvantage.Classes;using VAdvantage.Process;using VAdvantage.Model;using VAdvantage.Utility;using System.Data;/** Generated Model for AD_TableIndex
 *  @author Raghu (Updated) 
 *  @version Vienna Framework 1.1.1 - $Id$ */
public class X_AD_TableIndex : PO{public X_AD_TableIndex (Context ctx, int AD_TableIndex_ID, Trx trxName) : base (ctx, AD_TableIndex_ID, trxName){/** if (AD_TableIndex_ID == 0){SetAD_TableIndex_ID (0);SetAD_Table_ID (0);SetEntityType (null);SetIsCreateConstraint (false);// N
SetIsUnique (false);SetName (null);} */
}public X_AD_TableIndex (Ctx ctx, int AD_TableIndex_ID, Trx trxName) : base (ctx, AD_TableIndex_ID, trxName){/** if (AD_TableIndex_ID == 0){SetAD_TableIndex_ID (0);SetAD_Table_ID (0);SetEntityType (null);SetIsCreateConstraint (false);// N
SetIsUnique (false);SetName (null);} */
}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_TableIndex (Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_TableIndex (Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName){}/** Load Constructor 
@param ctx context
@param rs result set 
@param trxName transaction
*/
public X_AD_TableIndex (Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName){}/** Static Constructor 
 Set Table ID By Table Name
 added by ->Harwinder */
static X_AD_TableIndex(){ Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID,Table_Name);}/** Serial Version No */
static long serialVersionUID = 27965912805526L;/** Last Updated Timestamp 5/11/2023 12:14:48 PM */
public static long updatedMS = 1683787488737L;/** AD_Table_ID=909 */
public static int Table_ID; // =909;
/** TableName=AD_TableIndex */
public static String Table_Name="AD_TableIndex";
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
public override String ToString(){StringBuilder sb = new StringBuilder ("X_AD_TableIndex[").Append(Get_ID()).Append("]");return sb.ToString();}/** Set Table Index.
@param AD_TableIndex_ID Table Index */
public void SetAD_TableIndex_ID (int AD_TableIndex_ID){if (AD_TableIndex_ID < 1) throw new ArgumentException ("AD_TableIndex_ID is mandatory.");Set_ValueNoCheck ("AD_TableIndex_ID", AD_TableIndex_ID);}/** Get Table Index.
@return Table Index */
public int GetAD_TableIndex_ID() {Object ii = Get_Value("AD_TableIndex_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Table/View.
@param AD_Table_ID Database Table information */
public void SetAD_Table_ID (int AD_Table_ID){if (AD_Table_ID < 1) throw new ArgumentException ("AD_Table_ID is mandatory.");Set_ValueNoCheck ("AD_Table_ID", AD_Table_ID);}/** Get Table/View.
@return Database Table information */
public int GetAD_Table_ID() {Object ii = Get_Value("AD_Table_ID");if (ii == null) return 0;return Convert.ToInt32(ii);}/** Set Description.
@param Description Optional short description of the record */
public void SetDescription (String Description){if (Description != null && Description.Length > 255){log.Warning("Length > 255 - truncated");Description = Description.Substring(0,255);}Set_Value ("Description", Description);}/** Get Description.
@return Optional short description of the record */
public String GetDescription() {return (String)Get_Value("Description");}
/** EntityType AD_Reference_ID=389 */
public static int ENTITYTYPE_AD_Reference_ID=389;/** Set Entity Type.
@param EntityType Dictionary Entity Type; Determines ownership and synchronization */
public void SetEntityType (String EntityType){if (EntityType.Length > 4){log.Warning("Length > 4 - truncated");EntityType = EntityType.Substring(0,4);}Set_Value ("EntityType", EntityType);}/** Get Entity Type.
@return Dictionary Entity Type; Determines ownership and synchronization */
public String GetEntityType() {return (String)Get_Value("EntityType");}/** Set Export.
@param Export_ID Export */
public void SetExport_ID (String Export_ID){if (Export_ID != null && Export_ID.Length > 50){log.Warning("Length > 50 - truncated");Export_ID = Export_ID.Substring(0,50);}Set_ValueNoCheck ("Export_ID", Export_ID);}/** Get Export.
@return Export */
public String GetExport_ID() {return (String)Get_Value("Export_ID");}/** Set Comment.
@param Help Comment, Help or Hint */
public void SetHelp (String Help){if (Help != null && Help.Length > 2000){log.Warning("Length > 2000 - truncated");Help = Help.Substring(0,2000);}Set_Value ("Help", Help);}/** Get Comment.
@return Comment, Help or Hint */
public String GetHelp() {return (String)Get_Value("Help");}/** Set Create Constraint.
@param IsCreateConstraint Create Database Constraint */
public void SetIsCreateConstraint (Boolean IsCreateConstraint){Set_Value ("IsCreateConstraint", IsCreateConstraint);}/** Get Create Constraint.
@return Create Database Constraint */
public Boolean IsCreateConstraint() {Object oo = Get_Value("IsCreateConstraint");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Unique.
@param IsUnique Unique */
public void SetIsUnique (Boolean IsUnique){Set_Value ("IsUnique", IsUnique);}/** Get Unique.
@return Unique */
public Boolean IsUnique() {Object oo = Get_Value("IsUnique");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}/** Set Name.
@param Name Alphanumeric identifier of the entity */
public void SetName (String Name){if (Name == null) throw new ArgumentException ("Name is mandatory.");if (Name.Length > 60){log.Warning("Length > 60 - truncated");Name = Name.Substring(0,60);}Set_Value ("Name", Name);}/** Get Name.
@return Alphanumeric identifier of the entity */
public String GetName() {return (String)Get_Value("Name");}/** Get Record ID/ColumnName
@return ID/ColumnName pair */
public KeyNamePair GetKeyNamePair() {return new KeyNamePair(Get_ID(), GetName());}/** Set Process Now.
@param Processing Process Now */
public void SetProcessing (Boolean Processing){Set_Value ("Processing", Processing);}/** Get Process Now.
@return Process Now */
public Boolean IsProcessing() {Object oo = Get_Value("Processing");if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo);}return false;}}
}