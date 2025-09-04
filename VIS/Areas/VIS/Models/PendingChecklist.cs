/************************************************************
* Module Name    : Framework
* Purpose        :  Pending Checklist
* chronological  : Development
* Created Date   : 29 Jan 2025
* Created by     : Yashit(VAI058)
***********************************************************/
using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Text;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class PendingChecklist
    {
        /// <summary>
        /// Pending Checklist Count
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<PendingCheckListCount> PendingChecklistWidget(Ctx ctx)
        {
            DataSet ds = null;
            List<TableRecordId> recordIds = new List<TableRecordId>();
            DataSet LinkColumn = null;
            bool baseLanguage = Env.IsBaseLanguage(ctx, "");
            StringBuilder sql = new StringBuilder();
            //Get Checklist Assignment
            if (baseLanguage)
            {
                sql.Append(@"SELECT DISTINCT
	                         adt.TableName, ads.AD_Window_ID , ads.AD_Table_ID, aw.DisplayName AS windowname,ads.AD_Tab_ID,at.Name AS TabName,at.TabLevel
                        FROM
	                        AD_Table  adt
	                        INNER JOIN AD_SurveyAssignment ads ON (ads.AD_Table_ID = adt.AD_Table_ID)
                            INNER JOIN AD_Window aw ON (ads.AD_Window_ID = aw.AD_Window_ID) 
                             INNER JOIN AD_Tab at ON(at.AD_Tab_ID=ads.AD_Tab_ID)
                        ");
                ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "adt", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO) + @" AND
                            ads.AD_Window_ID IN (
                            SELECT a.AD_Window_ID FROM AD_SurveyAssignment a
                            )");
            }
            else
            {
                string lang = VAdvantage.Utility.Env.GetAD_Language(ctx);
                sql.Append(@"SELECT DISTINCT
	                         COALESCE(wt.Name, aw.DisplayName) AS windowname,adt.TableName, ads.AD_Window_ID , ads.AD_Table_ID,ads.AD_Tab_ID,COALESCE(wtb.Name, at.Name) AS TabName,at.Tablevel
                        FROM
	                        AD_Table  adt
	                        INNER JOIN AD_SurveyAssignment ads ON (ads.AD_Table_ID = adt.AD_Table_ID)
                            INNER JOIN AD_Window aw ON (ads.AD_Window_ID = aw.AD_Window_ID) 
                             INNER JOIN AD_Tab at ON(at.AD_Tab_ID=ads.AD_Tab_ID)
                             LEFT JOIN AD_Tab_Trl wtb ON (ads.AD_Tab_ID = wtb.AD_Tab_ID AND wtb.AD_Language = '" + lang + "')" +
                             "LEFT JOIN AD_Window_Trl wt ON (ads.AD_Window_ID = wt.AD_Window_ID AND wt.AD_Language = '" + lang + "')");
                ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "adt", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO) + @" AND
                            ads.AD_Window_ID IN (
                            SELECT a.AD_Window_ID FROM AD_SurveyAssignment a
                            )");
            }

            sql.Clear();



            // Step 1: Extract AD_Table_ID and Record_IDs
            if (ds != null && ds.Tables.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    int AD_Table_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Table_ID"]);
                    string tableName = Util.GetValueOfString(ds.Tables[0].Rows[i]["TableName"]);
                    int AD_TAB_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Tab_ID"]);
                    string TabName = Util.GetValueOfString(ds.Tables[0].Rows[i]["TabName"]);
                    int TabLevel = Util.GetValueOfInt(ds.Tables[0].Rows[i]["Tablevel"]);
                    int AD_Window_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Window_ID"]);

                    //Where clause on tab
                    sql.Append(@"SELECT
                       WhereClause
                    FROM
                        AD_Tab 
                    WHERE
                          AD_Tab_ID=" + AD_TAB_ID);

                    string WhereClause = Util.GetValueOfString(DB.ExecuteScalar(sql.ToString()));
                    if (WhereClause.Contains("@"))
                    {
                        WhereClause = Env.ParseContext(ctx, Util.GetValueOfInt(ctx.GetContext("SelectedWindow")), WhereClause, false);
                    }
                    sql.Clear();

                    LinkColumn = GetLinkColumn(AD_Table_ID, AD_TAB_ID);

                    if (!string.IsNullOrEmpty(WhereClause))
                    {
                        if (LinkColumn.Tables.Count > 0 && LinkColumn.Tables[0] != null)
                        {
                            if (LinkColumn.Tables[0].Rows.Count > 0)
                            {
                                sql.Append(@"SELECT DISTINCT " + tableName + "_ID AS Record_ID FROM " + tableName + " WHERE IsActive = 'Y' AND " + WhereClause +
                                          " AND " + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + " IS NOT NULL ");
                            }
                            else
                            {
                                sql.Append(@"SELECT DISTINCT " + tableName + "_ID AS Record_ID FROM " + tableName + " WHERE IsActive = 'Y' AND " + WhereClause + " ");

                            }
                        }
                    }
                    else
                    {

                        if (LinkColumn.Tables.Count > 0 && LinkColumn.Tables[0] != null)
                        {
                            if (LinkColumn.Tables[0].Rows.Count > 0)
                            {
                                //sql.Append(@"SELECT DISTINCT " + tableName + "_ID AS Record_ID FROM " + tableName + " WHERE IsActive='Y' AND " + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + " IS NOT NULL ");
                                sql.Append(@"SELECT DISTINCT " + tableName + "_ID AS Record_ID," + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + " AS parentID FROM " + tableName + " WHERE IsActive='Y' AND " + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + " IS NOT NULL ");
                            }
                            else
                            {
                                sql.Append(@"SELECT DISTINCT " + tableName + "_ID AS Record_ID FROM " + tableName + " WHERE IsActive='Y'  ");

                            }
                        }

                    }
                    if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["Tablevel"]) > 0)
                    {
                        //if tab level is greater than 0 then we have to find header tab headerwhereclause and headertablename
                        string s = @"SELECT adt.AD_Tab_ID,adt.whereClause,adt.AD_Table_ID ,at.Tablename FROM AD_Tab adt
                                  INNER JOIN AD_Table at ON (at.AD_Table_ID=adt.AD_Table_ID)
                                    WHERE adt.AD_Window_ID = " + AD_Window_ID + " ORDER BY adt.SEQNO ASC";
                        DataSet d = DB.ExecuteDataset(s);
                        string headerwhereclause = Util.GetValueOfString(d.Tables[0].Rows[0]["whereClause"]);
                        string headertablename = Util.GetValueOfString(d.Tables[0].Rows[0]["Tablename"]);

                        if (headerwhereclause.Contains("@"))
                        {
                            headerwhereclause = Env.ParseContext(ctx, Util.GetValueOfInt(ctx.GetContext("SelectedWindow")), headerwhereclause, false);
                        }

                        string ss = @"SELECT " + headertablename + "_ID FROM " + headertablename + " WHERE " + headerwhereclause + "";

                        string mrole = MRole.GetDefault(ctx).AddAccessSQL(ss, headertablename, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);
                        sql.Append(@" AND " + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + " IN ");
                        sql.Append("(" + mrole + ")");
                    }


                    DataSet dsresponseTableRecordID = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), tableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO));

                    List<int> recordIdList = new List<int>();
                    List<int> parentIdList = new List<int>();
                    if (dsresponseTableRecordID != null && dsresponseTableRecordID.Tables.Count > 0)
                    {
                        foreach (DataRow row in dsresponseTableRecordID.Tables[0].Rows)
                        {
                            int recordId = Util.GetValueOfInt(row[$"Record_ID"]);
                            int parentId;
                            if (LinkColumn.Tables[0].Rows.Count > 0)
                            {
                                parentId = Util.GetValueOfInt(row[$"parentID"]);
                                parentIdList.Add(parentId);
                            }
                            recordIdList.Add(recordId);
                        }
                    }
                    recordIds.Add(new TableRecordId
                    {

                        TableName = tableName,
                        AD_table_ID = AD_Table_ID,
                        RecordIds = recordIdList,
                        AD_TAB_ID = AD_TAB_ID,
                        TabName = TabName,
                        TabLevel = TabLevel,
                        AD_Window_ID = AD_Window_ID,
                        ParentIds = parentIdList,
                    });

                    sql.Clear();
                }
            }


            // Step 2: Get Response Data
            sql.Append(@"SELECT
                        adsr.AD_Table_ID,
                        adsr.Record_ID,
                        adsr.AD_Window_ID,
                        aw.DisplayName AS windowname,
                        COUNT(*) OVER (PARTITION BY adsr.AD_Window_ID, adsr.AD_Table_ID) AS response_count
                    FROM
                        AD_SurveyResponse adsr
                    INNER JOIN
                        AD_Window aw ON aw.AD_Window_ID = adsr.AD_Window_ID
                    ");

            DataSet responseDs = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "adsr", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO) + @" GROUP BY
                        adsr.AD_Table_ID,
                        adsr.Record_ID,
                        adsr.AD_Window_ID,
                        aw.DisplayName ORDER BY aw.DisplayName");

            // Step 3: Extract AD_Table_ID and Record_ID pairs from responseDs
            HashSet<(int AD_Table_ID, int Record_ID)> responseRecords = new HashSet<(int, int)>();
            Dictionary<int, string> windowNames = new Dictionary<int, string>();

            if (responseDs != null && responseDs.Tables.Count > 0)
            {
                foreach (DataRow row in responseDs.Tables[0].Rows)
                {
                    int WindowId = Util.GetValueOfInt(row["AD_Window_ID"]);
                    string WindowName = Util.GetValueOfString(row["windowname"]);
                    int responseADTableID = Util.GetValueOfInt(row["AD_Table_ID"]);
                    int responseRecordID = Util.GetValueOfInt(row["Record_ID"]);

                    responseRecords.Add((responseADTableID, responseRecordID));

                    if (!windowNames.ContainsKey(WindowId))
                        windowNames[WindowId] = WindowName;
                }
            }

            // Step 4: Filter out recordIds that are present in responseDs
            List<TableRecordId> filteredRecordIds = new List<TableRecordId>();

            foreach (var record in recordIds)
            {
                List<int> filteredIDs = record.RecordIds
                    .Where(recordId => !responseRecords.Contains((record.AD_table_ID, recordId)))
                    .ToList();

                List<int> filteredParentIDs = record.ParentIds != null ? record.ParentIds
               .Where(parentId => !responseRecords.Contains((record.AD_table_ID, parentId))).ToList() : new List<int>();

                if (filteredIDs.Count > 0)
                {
                    filteredRecordIds.Add(new TableRecordId
                    {
                        AD_table_ID = record.AD_table_ID,
                        AD_Window_ID = record.AD_Window_ID,
                        AD_TAB_ID = record.AD_TAB_ID,
                        RecordIds = filteredIDs,
                        TableName = record.TableName,
                        TabName = record.TabName,
                        TabLevel = record.TabLevel,
                        ParentIds = filteredParentIDs
                    });
                }
            }

            // Step 5: Create a list of PendingCheckListCount
            List<PendingCheckListCount> finallist = new List<PendingCheckListCount>();

            // Dictionary to store Window ID -> Dictionary<AD_Table_ID, List of Unique RecordIds>
            Dictionary<int, Dictionary<int, HashSet<int>>> windowToTableMap = new Dictionary<int, Dictionary<int, HashSet<int>>>();

            foreach (var record in filteredRecordIds)
            {
                var matchingRows = ds.Tables[0].AsEnumerable()
                    .Where(row => Util.GetValueOfInt(row["AD_Table_ID"]) == record.AD_table_ID)
                    .Select(row => new
                    {
                        WindowID = Util.GetValueOfInt(row["AD_Window_ID"]),
                        TableName = Util.GetValueOfString(row["TableName"]),
                        TabName = Util.GetValueOfString(row["TabName"]),
                        TabLevel = Util.GetValueOfString(row["TabLevel"]),
                        AD_TAB_ID = Util.GetValueOfInt(row["AD_Tab_ID"])
                    })
                    .ToList();

                foreach (var row in matchingRows)
                {
                    int windowID = row.WindowID;
                    int tableID = record.AD_table_ID;
                    string tableName = row.TableName;
                    int AD_TAB_ID = row.AD_TAB_ID;
                    if (windowID == 0) continue;

                    // Ensure WindowID exists
                    if (!windowToTableMap.ContainsKey(windowID))
                    {
                        windowToTableMap[windowID] = new Dictionary<int, HashSet<int>>();
                    }

                    // Ensure TableID exists in WindowID
                    if (!windowToTableMap[windowID].ContainsKey(AD_TAB_ID))
                    {
                        windowToTableMap[windowID][AD_TAB_ID] = new HashSet<int>();
                    }

                    // Add Unique Record IDs
                    foreach (var recordId in record.RecordIds)
                    {
                        if (windowID == record.AD_Window_ID)
                        {
                            windowToTableMap[windowID][AD_TAB_ID].Add(recordId);
                        }
                    }
                }
            }

            // Convert Dictionary to List<PendingCheckListCount>
            foreach (var entry in windowToTableMap)
            {
                int windowID = entry.Key;
                string windowName = "";
                string linkColumn = "";
                /*     var dsWindowName = ds.Tables[0].AsEnumerable()
                              .Where(row => Util.GetValueOfInt(row["AD_Window_ID"]) == windowID)
                              .Select(row => Util.GetValueOfString(row["windowname"]))
                              .FirstOrDefault();
                     windowName = !string.IsNullOrEmpty(dsWindowName) ? dsWindowName : "Unknown";*/
                var dsWindowName = ds.Tables[0].AsEnumerable()
                    .FirstOrDefault(row => Util.GetValueOfInt(row["AD_Window_ID"]) == windowID);
                //.Where(row => Util.GetValueOfInt(row["AD_Window_ID"]) == windowID)
                //.Select(row => Util.GetValueOfString(row["windowname"]))
                //.FirstOrDefault();

                if (dsWindowName != null)
                {
                    windowName = Util.GetValueOfString(dsWindowName["windowname"]);
                    int tableId = Util.GetValueOfInt(dsWindowName["AD_Table_ID"]);
                    int tabId = Util.GetValueOfInt(dsWindowName["AD_Tab_ID"]);
                    LinkColumn = GetLinkColumn(tableId, tabId);
                    if (LinkColumn != null && LinkColumn.Tables.Count > 0 && LinkColumn.Tables[0].Rows.Count > 0)
                    {
                        linkColumn = Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]); // or whatever the actual column name is
                    }
                    // Use windowName, linkColumn, etc.
                }

                //  Generate Final TableRecordIds List
                List<TableRecordId> tableRecordIds = new List<TableRecordId>();
                int totalCount = 0;

                foreach (var tableEntry in entry.Value)
                {
                    var tableInfo = recordIds.FirstOrDefault(r => r.AD_TAB_ID == tableEntry.Key);//r => r.AD_Window_ID == windowID && r.AD_table_ID == tableEntry.Key
                    tableRecordIds.Add(new TableRecordId
                    {
                        TabLevel = (int)(tableInfo?.TabLevel),
                        TabName = tableInfo?.TabName ?? "Unknown",
                        TableName = tableInfo?.TableName ?? "Unknown",
                        AD_table_ID = tableEntry.Key,
                        RecordIds = tableEntry.Value.ToList(),
                        ParentIds = tableInfo.ParentIds,
                    });
                    totalCount += tableEntry.Value.Count;
                }
                if (totalCount > 0)
                {
                    //  Add to final list
                    finallist.Add(new PendingCheckListCount
                    {
                        WindowID = windowID,
                        windowname = windowName,
                        count = totalCount, // Correct count using unique records
                        TableRecordIds = tableRecordIds,
                        HeadTable = linkColumn
                    });
                }

            }

            // Return final list
            return finallist;

        }

        /// <summary>
        /// Zoom Child Tab Records
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_table_ID"></param>
        /// <param name="RecordIds"></param>
        /// <returns></returns>
        public object ZoomChildTabRecords(Ctx ctx, int AD_Window_ID, int AD_table_ID, string RecordIds)
        {
            dynamic obj = new ExpandoObject();
            //string recordIds = string.Join(",", RecordIds);
            DataSet LinkColumn = null;
            StringBuilder sql = new StringBuilder();
            DataSet ds = null;
            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@AD_Window_ID", AD_Window_ID);
            param[1] = new SqlParameter("@AD_Table_ID", AD_table_ID);

            //AD_Tab_ID,TableName
            sql.Append(@"SELECT at.AD_Tab_ID,adt.TableName FROM AD_Tab at
                            INNER JOIN AD_Window aw ON(aw.AD_Window_ID = at.AD_Window_ID)
                            INNER JOIN AD_Table adt ON(adt.AD_Table_ID=at.AD_Table_ID)
                            WHERE aw.AD_Window_ID = @AD_Window_ID AND at.AD_Table_ID = @AD_Table_ID");
            ds = DB.ExecuteDataset(sql.ToString(), param, null);
            sql.Clear();

            int AD_Tab_ID = Util.GetValueOfInt(ds.Tables[0].Rows[0]["AD_Tab_ID"]);

            //Get Link Columns on Tab if Not then on Table
            LinkColumn = GetLinkColumn(AD_table_ID, AD_Tab_ID);

            if (LinkColumn != null && LinkColumn.Tables.Count > 0 && LinkColumn.Tables[0].Rows.Count > 0)
            {
                string tablename = Util.GetValueOfString(ds.Tables[0].Rows[0]["TableName"]);
                sql.Append(@"SELECT DISTINCT(" + Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]) + ") FROM " + tablename + " WHERE IsActive='Y'");

                ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), tablename, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO) +
                    " AND " + tablename + "_ID IN(" + RecordIds + ")");
                StringBuilder result = new StringBuilder();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        if (row[0] == null || row[0] == DBNull.Value)
                        {
                            continue;
                        }
                        result.Append(Util.GetValueOfString(row[0]) + ",");
                    }
                }

                // Remove the trailing comma and space
                string finalResult = result.ToString().TrimEnd(',');
                obj.RecordIds = finalResult;
                obj.LinkColumn = Util.GetValueOfString(LinkColumn.Tables[0].Rows[0]["ColumnName"]);
            }

            return obj;
        }
        /// <summary>
        /// Get Link Column on Tab if not then table
        /// </summary>
        /// <param name="AD_table_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <returns></returns>
        public DataSet GetLinkColumn(int AD_table_ID, int AD_Tab_ID)
        {
            SqlParameter[] param = null;
            DataSet LinkColumn = null;
            StringBuilder sql = new StringBuilder();
            param = new SqlParameter[1];
            param[0] = new SqlParameter("@AD_Tab_ID", AD_Tab_ID);
            // Case 1: Link column on tab
            sql.Append(@"SELECT ac.ColumnName FROM AD_Tab at
             INNER JOIN AD_Column ac ON ac.AD_Column_ID = at.AD_Column_ID
             WHERE at.AD_Tab_ID =@AD_Tab_ID");

            LinkColumn = DB.ExecuteDataset(sql.ToString(), param);
            sql.Clear();

            // If no valid data is found, check in the table column
            if (LinkColumn == null || LinkColumn.Tables.Count == 0 || LinkColumn.Tables[0].Rows.Count == 0)
            {
                param = new SqlParameter[1];
                param[0] = new SqlParameter("@AD_table_ID", AD_table_ID);
                // Clear existing dataset before new assignment
                LinkColumn.Clear();

                sql.Append(@"SELECT ac.ColumnName FROM AD_Table adt 
                 INNER JOIN AD_Column ac ON ac.AD_Table_ID = adt.AD_Table_ID
                 WHERE ac.IsParent = 'Y' 
                 AND adt.AD_Table_ID =@AD_table_ID");

                LinkColumn = DB.ExecuteDataset(sql.ToString(), param);
                sql.Clear();
            }
            return LinkColumn;
        }
    }

    public class TableRecordId
    {
        public string TableName { get; set; }
        public string TabName { get; set; }
        public int TabLevel { get; set; }
        public int AD_table_ID { get; set; }

        public int AD_TAB_ID { get; set; }
        public List<int> RecordIds { get; set; }
        public List<int> ParentIds { get; set; }
        public int AD_Window_ID { get; set; }
    }

    public class PendingCheckListCount
    {
        public int WindowID { get; set; }
        public string windowname { get; set; }
        public int count { get; set; }
        public List<TableRecordId> TableRecordIds { get; set; }
        public string HeadTable { get; set; }
    }
}