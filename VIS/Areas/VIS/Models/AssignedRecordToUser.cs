/************************************************************
* Module Name    : VA114
* Purpose        :  Assign Record To User
* chronological  : Development
* Created Date   : 12 December 2024
* Created by     : Yashit(VAI058)
***********************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class AssignedRecordToUser
    {
        private static VLogger _log = VLogger.GetVLogger(typeof(AssignedRecordToUser).FullName);
        /// <summary>
        /// Assign Record To User
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_User_ID"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>

        public string AssignRecordToUser(Ctx ctx, int AD_User_ID, int AD_Window_ID, int AD_Table_ID, List<int> Record_ID)
        {
            int recordSaved = 0;
            string recordIds = string.Join(",", Record_ID);

            // Start a transaction
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("assignRecord" + DateTime.Now.Ticks);

            try
            {
                // SQL query to check for existing assignments
                string sql = @"SELECT Record_ID,AD_Table_ID,AD_User_ID,AD_Window_ID 
                       FROM VIS_AssignedRecordToUser 
                       WHERE Record_ID IN (" + recordIds + ")";
                DataSet ds = DB.ExecuteDataset(sql, null, trx);

                if (ds != null && ds.Tables.Count > 0)
                {
                    DataTable dt = ds.Tables[0];

                    // Iterate through provided record IDs
                    foreach (int recordId in Record_ID)
                    {
                        // Check if the record is already assigned to a user
                        DataRow[] existingAssignments = dt.Select($"Record_ID = {recordId}");

                        if (existingAssignments.Length == 0) // If not assigned
                        {
                            recordSaved = 1;

                            // Create a new assignment
                            MVISAssignedRecordToUser mclass = new MVISAssignedRecordToUser(ctx, 0, trx);
                            mclass.SetAD_Table_ID(AD_Table_ID);
                            mclass.SetAD_Window_ID(AD_Window_ID);
                            mclass.SetAD_User_ID(AD_User_ID);
                            mclass.SetRecord_ID(recordId);
                            mclass.SetAD_Client_ID(ctx.GetAD_Client_ID());
                            mclass.SetAD_Org_ID(ctx.GetAD_Org_ID());

                            // Attempt to save the record
                            if (!mclass.Save(trx))
                            {
                                // Retrieve and log the error
                                ValueNamePair vp = VLogger.RetrieveError();
                                StringBuilder error = new StringBuilder("Error: ");

                                if (vp != null && !string.IsNullOrEmpty(vp.GetName()))
                                {
                                    error.Append("Status Not Saved" + vp.GetName());
                                }

                                trx.Rollback();
                                _log.SaveError("RecordNotassignedtouser", "");
                                return error.ToString();
                            }
                        }
                    }

                    if (recordSaved == 1)
                    {
                        // Commit the transaction after saving
                        trx.Commit();
                        return "01"; // Success: Record(s) assigned
                    }
                    else
                    {
                        return "02"; //  records already assigned (already assigned)
                    }
                }
                else
                {
                    return "-1"; // Dataset is null or no records to process
                }
            }
            catch (Exception ex)
            {
                // Log the exception and rollback the transaction
                trx.Rollback();
                _log.SaveError("AssignRecordToUserError", ex.Message);
                return ex.Message;
            }
            finally
            {
                trx.Close();
            }
        }


        /// <summary>
        /// Get Count of Assigned Record To User 
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="pageSize"></param>
        /// <param name="pageNo"></param>
        /// <returns></returns>
        public List<AssignRecordDetail> AssignRecordToUserWidget(Ctx ctx, int pageSize, int pageNo, bool getAll)
        {
            List<AssignRecordDetail> list = new List<AssignRecordDetail>();
            string sql = null;
            string sqlcount = null;
            int totalWindowcount = 0;
            if (DB.IsOracle())
            {
                sql = @"SELECT adw.DisplayName,adw.AD_Window_ID,asr.AD_Table_ID,asr.AD_User_ID, COUNT(*) AS RecordCount,tab.TableName,
                            LISTAGG(asr.Record_ID, ',') WITHIN GROUP (ORDER BY asr.Record_ID) AS RecordIDs,SUM(COUNT(*)) OVER (PARTITION BY asr.AD_User_ID) AS total_recordcount
                            FROM VIS_AssignedRecordToUser asr
                            INNER JOIN AD_Table tab ON (tab.AD_Table_ID = asr.AD_Table_ID)
                            INNER JOIN AD_Window adw ON asr.AD_Window_ID = adw.AD_Window_ID WHERE asr.AD_User_ID = " + ctx.GetAD_User_ID() + " AND asr.IsActive = 'Y'  AND asr.Status = 'PDN' GROUP BY tab.TableName, adw.DisplayName, adw.AD_Window_ID, asr.AD_Table_ID, asr.AD_User_ID";
                if (pageNo == 1)
                {
                    sqlcount = @"SELECT  COUNT(*) FROM (" + sql + ")";
                    totalWindowcount = Util.GetValueOfInt(DB.ExecuteScalar(sqlcount));
                }
            }
            else
            {
                sql = @"SELECT adw.DisplayName,adw.AD_Window_ID,asr.AD_Table_ID,asr.AD_User_ID,COUNT(*) AS RecordCount,tab.TableName,
                        STRING_AGG(asr.Record_ID::TEXT, ',') AS RecordIDs,SUM(COUNT(*)) OVER (PARTITION BY asr.AD_User_ID) AS total_recordcount
                        FROM VIS_AssignedRecordToUser asr
                         INNER JOIN AD_Table tab ON (tab.AD_Table_ID = asr.AD_Table_ID)
                        INNER JOIN AD_Window adw ON asr.AD_Window_ID = adw.AD_Window_ID WHERE asr.AD_User_ID = " + ctx.GetAD_User_ID() + " AND asr.IsActive = 'Y'  AND  asr.Status = 'PDN' GROUP BY tab.TableName,adw.DisplayName, adw.AD_Window_ID, asr.AD_Table_ID, asr.AD_User_ID";
                if (pageNo == 1)
                {
                    sqlcount = @"SELECT  COUNT(*) FROM (" + sql + ")";
                    totalWindowcount = Util.GetValueOfInt(DB.ExecuteScalar(sqlcount));
                }
            }
            DataSet ds = null;
            if (getAll)
            {
                ds = DB.ExecuteDataset(sql);
            }
            else
            {
                ds = DB.ExecuteDataset(sql, null, null, pageSize, pageNo);
            }
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    AssignRecordDetail obj = new AssignRecordDetail
                    {
                        WindowName = Util.GetValueOfString(row["DisplayName"]),
                        Count = Util.GetValueOfInt(row["RecordCount"]),
                        WindowID = Util.GetValueOfInt(row["AD_Window_id"]),
                        TableID = Util.GetValueOfInt(row["AD_Table_ID"]),
                        TableName = Util.GetValueOfString(row["TableName"]),
                        Record_ID = Util.GetValueOfString(row["RecordIDs"]),
                        AD_User_ID = Util.GetValueOfInt(row["AD_User_ID"]),
                        TotalWindowcount = totalWindowcount,
                        totalRecordCount = Util.GetValueOfInt(row["total_recordcount"]),
                    };
                    list.Add(obj); // Add to the list
                }
            }
            return list;
        }
        /// <summary>
        /// Set status of User - PENDING = PDN,DONE = DNE,DELETED = DLT
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="status"></param>
        /// <param name="VIS_AssignedRecordToUser_ID"></param>
        /// <returns></returns>
        public string SetStatus(Ctx ctx, int AD_Window_ID, int AD_Table_ID, int Record_ID, string status)
        {

            string sql = @"UPDATE VIS_AssignedRecordToUser SET Status='" + status + "' WHERE  Record_ID=" + Record_ID + " AND AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID;
            int update = DB.ExecuteQuery(sql);
            //MVISAssignedRecordToUser mclass = new MVISAssignedRecordToUser(ctx, VIS_AssignedRecordToUser_ID, null);
            //mclass.SetStatus(status);
            //mclass.Save();
            if (update >= 1)
            {
                return Msg.GetMsg(ctx, "SetStatus");
            }
            else
            {
                StringBuilder error = new StringBuilder("Error:");
                ValueNamePair vp = VLogger.RetrieveError();
                if (vp != null && !string.IsNullOrEmpty(vp.GetName()))
                {
                    error.Append("Error:Status Not Saved" + vp.GetName());
                }
                _log.SaveError("StatusNotSaved", error.ToString());
                return error.ToString();
            }
        }
        /// <summary>
        /// Delete Record
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public string DeleteRecord(Ctx ctx, int AD_Window_ID, int AD_Table_ID, int Record_ID)
        {

            string sql = @"DELETE FROM VIS_AssignedRecordToUser WHERE Record_ID=" + Record_ID + " AND AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID;
            int count = DB.ExecuteQuery(sql);
            if (count > 0)
            {
                return Msg.GetMsg(ctx, "RecordDeleted");
            }
            else
            {
                StringBuilder error = new StringBuilder("Error:");
                ValueNamePair vp = VLogger.RetrieveError();
                if (vp != null && !string.IsNullOrEmpty(vp.GetName()))
                {
                    error.Append("Error:Record Not Delete" + vp.GetName());
                }
                _log.SaveError("RecordNotDelete", error.ToString());
                return error.ToString();
            }
        }
    }

    public class AssignRecordDetail
    {
        public string WindowName;
        public string TableName;
        public int WindowID;
        public int TableID;
        public int Count;
        public string Record_ID;
        public int AD_User_ID;
        public int TotalWindowcount = 0;
        public int totalRecordCount;
    }
}