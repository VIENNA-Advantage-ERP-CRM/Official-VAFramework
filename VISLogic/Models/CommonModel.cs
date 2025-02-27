﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.DataContracts;

namespace VISLogic.Models
{
    public class CommonModel
    {
        public dynamic GetVerDetails(Ctx ctx, dynamic od)
        {
            List<string> colNames = new List<string>();
            List<string> dbColNames = new List<string>();
            List<object> oldValues = new List<object>();
            // create list of default columns for which Version change details not required
            List<string> defColNames = new List<string>(new string[] { "Created", "CreatedBy", "Updated", "UpdatedBy", "Export_ID" });
            dynamic data = new ExpandoObject();
            string TableName = od.TName.Value;
            // Get original table name by removing "_Ver" suffix from the end
            string origTableName = TableName.Substring(0, TableName.Length - 4);
            var RecID = od.RID.Value;
            // Get parent table ID
            int AD_Table_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName = '" + origTableName + "'", null, null));
            MTable tbl = new MTable(ctx, AD_Table_ID, null);
            DataSet dsColumns = null;
            // check if Maintain Version is marked on table
            if (tbl.IsMaintainVersions())
                dsColumns = DB.ExecuteDataset("SELECT Name, ColumnName, AD_Column_ID, AD_Reference_ID FROM AD_Column WHERE AD_Table_ID = " + AD_Table_ID);
            // else get columns on which maintain version is marked
            else
                dsColumns = DB.ExecuteDataset("SELECT Name, ColumnName, AD_Column_ID, AD_Reference_ID FROM AD_Column WHERE AD_Table_ID = " + AD_Table_ID + " AND IsMaintainVersions = 'Y'");
            // return if maintain version not found either on table or column level
            if (!(dsColumns != null && dsColumns.Tables[0].Rows.Count > 0))
                return data;

            DataSet dsFields = DB.ExecuteDataset("SELECT Name, AD_Column_ID FROM AD_Field WHERE AD_Tab_ID = " + Util.GetValueOfInt(od.TabID.Value));
            StringBuilder sbSQL = new StringBuilder("");
            // check if table has single key
            if (tbl.IsSingleKey())
                sbSQL.Append(origTableName + "_ID = " + od[(origTableName + "_ID").ToLower()].Value);
            else
            {
                string[] keyCols = tbl.GetKeyColumns();
                for (int w = 0; w < keyCols.Length; w++)
                {
                    if (w == 0)
                    {
                        if (keyCols[w] != null)
                            sbSQL.Append(keyCols[w] + " = " + od[(keyCols[w]).ToLower()]);
                        else
                            sbSQL.Append(" NVL(" + keyCols[w] + ",0) = 0");
                    }
                    else
                    {
                        if (keyCols[w] != null)
                            sbSQL.Append(" AND " + keyCols[w] + " = " + od[(keyCols[w]).ToLower()]);
                        else
                            sbSQL.Append(" AND NVL(" + keyCols[w] + ",0) = 0");
                    }
                }
            }

            POInfo inf = POInfo.GetPOInfo(ctx, Util.GetValueOfInt(od.TblID.Value));
            // Get SQL Query from PO Info for selected table
            string sqlCol = GetSQLQuery(ctx, Util.GetValueOfInt(od.TblID.Value), inf.GetPoInfoColumns());

            //DataSet dsRec = DB.ExecuteDataset("SELECT * FROM " + TableName + " WHERE " + sbSQL.ToString() + " AND RecordVersion < " + od["recordversion"].Value + " ORDER BY RecordVersion DESC");
            //DataSet dsRec = DB.ExecuteDataset("SELECT * FROM " + TableName + " WHERE " + sbSQL.ToString() + " AND RecordVersion = " + Util.GetValueOfInt(od["oldversion"].Value));
            // get data from Version table according to the Record Version 
            DataSet dsRec = DB.ExecuteDataset(sqlCol + " WHERE " + sbSQL.ToString() + " AND RecordVersion = " + Util.GetValueOfInt(od["oldversion"].Value));
            DataRow dr = null;

            if (dsRec != null && dsRec.Tables[0].Rows.Count > 0)
            {
                dr = dsRec.Tables[0].Rows[0];
            }
            else
            {
                VAdvantage.Logging.VLogger.Get().SaveError("", "No record found against version " + Util.GetValueOfInt(od["oldversion"].Value) + " for table " + origTableName);
                return data;
            }

            StringBuilder sbColName = new StringBuilder("");
            StringBuilder sbColValue = new StringBuilder("");
            for (int i = 0; i < dsColumns.Tables[0].Rows.Count; i++)
            {
                sbColName.Clear();
                sbColValue.Clear();
                sbColName.Append(Util.GetValueOfString(dsColumns.Tables[0].Rows[i]["ColumnName"]));
                if (!dr.Table.Columns.Contains(sbColName.ToString()))
                    continue;

                if (defColNames.Contains(sbColName.ToString()) || (sbColName.ToString() == origTableName + "_ID") || (sbColName.ToString() == origTableName + "_Ver_ID"))
                    continue;

                if (Util.GetValueOfInt(dsColumns.Tables[0].Rows[i]["AD_Reference_ID"]) == 20)
                    dr[sbColName.ToString()] = (Util.GetValueOfString(dr[sbColName.ToString()]) == "Y") ? true : false;

                var val = od[sbColName.ToString().ToLower()];
                // Commented null check so that if any column value is set to null, even then it shows the old value in the Version Tab Panel
                //if (val != null)
                //{

                // VIS0008 check applied if column exists, then only compare
                if (od.ContainsKey(sbColName.ToString().ToLower()))
                {
                    if (Util.GetValueOfString(dr[sbColName.ToString()]).ToLower() != Util.GetValueOfString(od[sbColName.ToString().ToLower()].Value).ToLower())
                    {
                        colNames.Add(Util.GetValueOfString(dsColumns.Tables[0].Rows[i]["Name"]));
                        dbColNames.Add(sbColName.ToString());
                        // get text for column based on different reference types
                        if (dr.Table.Columns.Contains(sbColName.ToString() + "_TXT"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_TXT"]));
                        else if (dr.Table.Columns.Contains(sbColName.ToString() + "_LOC"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_LOC"]));
                        else if (dr.Table.Columns.Contains(sbColName.ToString() + "_LTR"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_LTR"]));
                        else if (dr.Table.Columns.Contains(sbColName.ToString() + "_ASI"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_ASI"]));
                        else if (dr.Table.Columns.Contains(sbColName.ToString() + "_ACT"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_ACT"]));
                        else if (dr.Table.Columns.Contains(sbColName.ToString() + "_CTR"))
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString() + "_CTR"]));
                        else
                            sbColValue.Append(Util.GetValueOfString(dr[sbColName.ToString()]));

                        oldValues.Add(sbColValue.ToString());
                    }
                }
                //}
            }

            data.ColumnNames = colNames;
            data.OldVals = oldValues;
            data.DBColNames = dbColNames;

            return data;
        }


        public string GetSQLQuery(Ctx m_ctx, int _AD_Table_ID, POInfoColumn[] m_columns)
        {
            StringBuilder _querySQL = new StringBuilder("");
            if (m_columns.Length > 0)
            {
                _querySQL.Append("SELECT ");
                MTable tbl = new MTable(m_ctx, _AD_Table_ID, null);
                // append all columns from table and get comma separated string
                _querySQL.Append(tbl.GetSelectColumns());
                foreach (var column in m_columns)
                {
                    // check if column name length is less than 26, then only add this column in selection column
                    // else only ID will be displayed
                    // as limitation in oracle to restrict column name to 30 characters
                    if ((column.ColumnName.Length + 4) < 30)
                    {
                        // for Lookup type of columns
                        if (DisplayType.IsLookup(column.DisplayType))
                        {
                            VLookUpInfo lookupInfo = VLookUpFactory.GetLookUpInfo(m_ctx, 0, column.DisplayType,
                                column.AD_Column_ID, Env.GetLanguage(m_ctx), column.ColumnName, column.AD_Reference_Value_ID,
                                column.IsParent, column.ValidationCode);

                            if (lookupInfo != null && lookupInfo.displayColSubQ != null && lookupInfo.displayColSubQ.Trim() != "")
                            {
                                if (lookupInfo.queryDirect.Length > 0)
                                {
                                    // create columnname as columnname_TXT for lookup type of columns
                                    lookupInfo.displayColSubQ = " (SELECT MAX(" + lookupInfo.displayColSubQ + ") " + lookupInfo.queryDirect.Substring(lookupInfo.queryDirect.LastIndexOf(" FROM " + lookupInfo.tableName + " "), lookupInfo.queryDirect.Length - (lookupInfo.queryDirect.LastIndexOf(" FROM " + lookupInfo.tableName + " "))) + ") AS " + column.ColumnName + "_TXT";

                                    lookupInfo.displayColSubQ = lookupInfo.displayColSubQ.Replace("@key", tbl.GetTableName() + "." + column.ColumnName);
                                }
                                _querySQL.Append(", " + lookupInfo.displayColSubQ);
                            }
                        }
                        // VIS0008
                        // Changed to pick data from subquery in case of Location, Locator, Attribute and Account References
                        // case for Location type of columns
                        else if (column.DisplayType == DisplayType.Location)
                        {
                            // Change done to pick full address with help of function created in the database
                            _querySQL.Append(", (SELECT Get_Location(l.C_Location_ID) FROM C_Location l WHERE l.C_Location_ID = " + tbl.GetTableName() + "." + column.ColumnName + ") AS " + column.ColumnName + "_LOC");
                        }
                        // case for Locator type of columns
                        else if (column.DisplayType == DisplayType.Locator)
                        {
                            _querySQL.Append(", (SELECT Value FROM M_Locator WHERE M_Locator_ID = " + tbl.GetTableName() + "." + column.ColumnName + ") AS " + column.ColumnName + "_LTR");
                        }
                        // case for Attribute Set Instance & General Attribute columns
                        else if (column.DisplayType == DisplayType.PAttribute)
                        {
                            _querySQL.Append(", (SELECT Description FROM M_AttributeSetInstance WHERE M_AttributeSetInstance_ID = " + tbl.GetTableName() + "." + column.ColumnName + ") AS " + column.ColumnName + "_ASI");
                        }
                        else if (column.DisplayType == DisplayType.GAttribute)
                        {
                            _querySQL.Append(", (SELECT Description FROM C_GenAttributeSetInstance WHERE C_GenAttributeSetInstance_ID = " + tbl.GetTableName() + "." + column.ColumnName + ") AS " + column.ColumnName + "_ASI");
                        }
                        // case for Account type of columns
                        else if (column.DisplayType == DisplayType.Account)
                        {
                            _querySQL.Append(", (SELECT Description FROM C_ValidCombination WHERE C_ValidCombination_ID = " + tbl.GetTableName() + "." + column.ColumnName + ") AS " + column.ColumnName + "_ACT");
                        }
                    }
                }
                // Append FROM table name to query
                _querySQL.Append(" FROM " + tbl.GetTableName());
            }
            return _querySQL.ToString();
        }

        /// <summary>
        /// function to check versions against table
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="rowData"></param>
        /// <returns>True/False</returns>
        public bool HasVersions(Ctx ctx, SaveRecordIn rowData)
        {
            if (rowData != null)
            {
                MTable tbl = new MTable(ctx, rowData.AD_Table_ID, null);

                StringBuilder sbSql = new StringBuilder("SELECT COUNT(AD_Table_ID) FROM AD_Table WHERE TableName = '" + rowData.TableName + "_Ver'");

                int Count = Util.GetValueOfInt(DB.ExecuteScalar(sbSql.ToString(), null, null));

                if (Count > 0)
                {
                    if (tbl.IsSingleKey())
                    {
                        if (rowData.Record_ID > 0)
                        {
                            sbSql.Clear();
                            sbSql.Append(@"SELECT COUNT(" + rowData.TableName + "_ID) FROM " + rowData.TableName + "_Ver " +
                                " WHERE " + rowData.TableName + "_ID = " + rowData.Record_ID + " AND COALESCE(ProcessedVersion,'N') != 'Y' AND VersionLog IS NULL AND TRUNC(VersionValidFrom) >= TRUNC(SYSDATE)");
                            Count = Util.GetValueOfInt(DB.ExecuteScalar(sbSql.ToString()));
                            if (Count > 0)
                                return true;
                        }
                        return false;
                    }
                    else
                    {
                        sbSql.Clear();

                        string[] keyCols = tbl.GetKeyColumns();
                        bool hasCols = false;
                        for (int w = 0; w < keyCols.Length; w++)
                        {
                            hasCols = true;
                            if (w == 0)
                            {
                                sbSql.Append(@"SELECT COUNT(" + keyCols[w] + ") FROM " + rowData.TableName + "_Ver WHERE ");

                                if (keyCols[w] != null)
                                    sbSql.Append(keyCols[w] + " = " + rowData.RowData[keyCols[w].ToLower()]);
                                else
                                    sbSql.Append(" NVL(" + keyCols[w] + ",0) = 0");
                            }
                            else
                            {
                                if (keyCols[w] != null)
                                    sbSql.Append(" AND " + keyCols[w] + " = " + rowData.RowData[keyCols[w].ToLower()]);
                                else
                                    sbSql.Append(" AND NVL(" + keyCols[w] + ",0) = 0");
                            }
                        }
                        if (hasCols)
                        {
                            sbSql.Append(" AND COALESCE(ProcessedVersion,'N') != 'Y' AND VersionLog IS NULL AND TRUNC(VersionValidFrom) >= TRUNC(SYSDATE)");
                            Count = Util.GetValueOfInt(DB.ExecuteScalar(sbSql.ToString()));
                            if (Count > 0)
                                return true;
                        }
                    }
                }
            }
            return false;
        }

        /// <summary>
        /// Get Dataset for the query passed in the parameter
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="sql"></param>
        /// <returns>Dataset for query passed in parameter</returns>
        public DataSet GetIDTextData(Ctx ctx, string sql)
        {
            DataSet dsIDText = DB.ExecuteDataset(sql, null, null);
            if (dsIDText != null && dsIDText.Tables[0].Rows.Count > 0)
                return dsIDText;

            return dsIDText;
        }
        /// <summary>
        /// Get Theme list
        /// </summary>
        /// <returns>dynamic list</returns>
        public List<dynamic> GetThemes()
        {
            List<dynamic> retObj = new List<dynamic>();
            string qry = " SELECT PrimaryColor, OnPrimaryColor, SecondaryColor, OnSecondaryColor " +
                                " , IsDefault, AD_Theme_ID  FROM AD_Theme WHERE IsActive='Y'";
            DataSet ds = DB.ExecuteDataset(qry);

            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataRow dr in ds.Tables[0].Rows)
                {
                    dynamic obj = new ExpandoObject();
                    obj.Id = Util.GetValueOfString(dr["AD_Theme_ID"]);
                    obj.PColor = Util.GetValueOfString(dr["PrimaryColor"]);
                    obj.OnPColor = Util.GetValueOfString(dr["OnPrimaryColor"]);
                    obj.SColor = Util.GetValueOfString(dr["SecondaryColor"]);
                    obj.OnSColor = Util.GetValueOfString(dr["OnSecondaryColor"]);
                    obj.IsDefault = Util.GetValueOfString(dr["IsDefault"]);
                    retObj.Add(obj);
                }

            }
            return retObj;
        }

        /// <summary>
        /// Check role acess for Personal Lock, Personal Access And Shared Records
        /// </summary>
        /// <param name="columnName"></param>
        /// <param name="roleID"></param>
        /// <returns></returns>
        public string CheckAccessForAction(string columnName, int roleID)
        {
            return Util.GetValueOfString(DB.ExecuteScalar("SELECT " + columnName + " FROM AD_ROLE WHERE AD_role_ID=" + roleID));
        }

        /// <summary>
        /// Check Table map with any window and get their ID
        /// </summary>
        /// <param name="tableID"></param>
        /// <param name="actionType"></param>
        /// <param name="actionName"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<dynamic> CheckTableMapWithAction(int tableID, string actionType, string actionName,Ctx ctx)
        {
            var DyObjectsList = new List<dynamic>();
            string[] actions = actionName.Split(';');
            string formattedString = "'" + string.Join("','", actions) + "'";
            string sql = "";
            string action = "";
             bool baseLanguage = Env.IsBaseLanguage(ctx, "");// GlobalVariable.IsBaseLanguage();
           
            if (actionType == "WIW")
            {
                if (baseLanguage)
                {
                    sql = @"SELECT w.AD_Window_ID AS ID,w.displayName AS Name FROM AD_Window w"; 
                            //INNER JOIN AD_Window w ON  AD_Tab.AD_Window_ID=w.ad_window_id";
                    
                }
                else
                {
                    sql = @"SELECT w.AD_Window_ID AS ID,wt.Name FROM AD_Window w                           
                            INNER JOIN AD_Window_Trl wt ON (w.AD_Window_ID=wt.AD_Window_ID AND wt.AD_Language='" + VAdvantage.Utility.Env.GetAD_Language(ctx) + "')";
                }
                sql += " WHERE w.Name IN (" + formattedString + ") ORDER BY w.Name";
                action = "W";


            }
            else if (actionType == "FOM")
            {
                if (baseLanguage)
                {
                    sql = "SELECT DisplayName AS NAME, AD_Form_ID AS ID FROM AD_Form WHERE NAME IN (" + formattedString + ") ORDER BY DisplayName ";
                }
                else {
                    sql = "SELECT AD_Form_Trl.NAME, AD_Form.AD_Form_ID AS ID FROM AD_Form INNER JOIN AD_Form_Trl ON (AD_Form.AD_Form_ID=AD_Form_Trl.AD_FORM_ID AND AD_Form_Trl.AD_Language='" + VAdvantage.Utility.Env.GetAD_Language(ctx) + "')  WHERE AD_Form.NAME IN (" + formattedString + ") ORDER BY AD_Form_Trl.NAME ";
                }
                action = "X";
            }
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    dynamic DyObj = new ExpandoObject();
                    DyObj.ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["ID"]);
                    DyObj.Name = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]);
                    DyObj.ActionType = action;
                    DyObjectsList.Add(DyObj);
                }
            }
            return DyObjectsList;

        }

        /// <summary>
        /// Getting Ad_Form_ID
        /// </summary>
        /// <param name="formName">Name</param>
        /// <returns>Ad_Form_ID</returns>
        public int GetFormID(string formName) {
            string sql = "SELECT AD_Form_ID FROM AD_Form WHERE IsActive='Y' AND Name = '" + formName + "'";
            int formID = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            return formID;
        }

        /// <summary>
        /// Getting AD_Process_ID
        /// </summary>
        /// <param name="processName">Name</param>
        /// <returns>AD_Process_ID</returns>
        public int GetProcessID(string processName) {
            string sql = "SELECT AD_Process_ID FROM AD_Process WHERE IsActive='Y' AND Value = '" + processName + "'";
            int processID = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            return processID;
        }
    }
}
