using BaseLibrary.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
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
    public class SubscribeModel
    {
        private static VLogger _log = VLogger.GetVLogger(typeof(SubscribeModel).FullName);

        Ctx _ctx = null;
        public SubscribeModel()
        {

        }


        public SubscribeModel(Ctx ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Insert Multiple Subscription
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public object InsertMultipleSubscription(Ctx ctx, int AD_Window_ID, List<int> Record_ID, int AD_Table_ID)
        {
            dynamic obj = new ExpandoObject();
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("InsertMultipleSubscription" + DateTime.Now.Ticks);
            StringBuilder sql = new StringBuilder(@"SELECT Record_ID, AD_Table_ID, AD_Window_ID, AD_User_ID 
                    FROM CM_Subscribe
                    WHERE Record_ID IN(");

            List<SqlParameter> parameters = new List<SqlParameter>();
            int insertedCount = 0;

            for (int i = 0; i < Record_ID.Count; i++)
            {
                sql.Append("@recordId" + i + ",");
                parameters.Add(new SqlParameter("@recordId" + i, Record_ID[i]));
            }


            sql.Remove(sql.Length - 1, 1); // Removes the last character (comma)


            parameters.Add(new SqlParameter("@AD_Table_ID", AD_Table_ID));
            parameters.Add(new SqlParameter("@AD_Window_ID", AD_Window_ID));
            parameters.Add(new SqlParameter("@AD_User_ID", ctx.GetAD_User_ID()));


            sql.Append(@") 
                    AND AD_Table_ID = @AD_Table_ID
                    AND AD_Window_ID = @AD_Window_ID
                    AND AD_User_ID = @AD_User_ID");

            DataSet ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "CM_Subscribe", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO), parameters.ToArray());
            if (ds != null && ds.Tables.Count > 0)
            {
                DataTable dt = ds.Tables[0];
                foreach (int rec_ID in Record_ID)
                {
                    DataRow[] existingRecord = dt.Select($"Record_ID = {rec_ID} ");

                    if (existingRecord.Length > 0)
                    {
                        continue;
                    }

                    X_CM_Subscribe subs = new X_CM_Subscribe(_ctx, 0, null);
                    subs.SetAD_Client_ID(_ctx.GetAD_Client_ID());
                    subs.SetAD_Org_ID(_ctx.GetAD_Org_ID());
                    subs.SetAD_Window_ID(AD_Window_ID);
                    subs.SetAD_Table_ID(AD_Table_ID);
                    subs.SetRecord_ID(rec_ID);
                    subs.SetAD_User_ID(_ctx.GetAD_User_ID());

                    if (subs.Save(trx))
                    {

                        insertedCount++;
                    }
                    else
                    {
                        // Retrieve and log the error
                        ValueNamePair vp = VLogger.RetrieveError();
                        StringBuilder error = new StringBuilder("Error: ");

                        if (vp != null && !string.IsNullOrEmpty(vp.GetName()))
                        {
                            error.Append("VIS_RecordNotSubscribed" + vp.GetName());
                        }

                        trx.Rollback();
                        _log.SaveError("VIS_RecordNotSubscribed", "");
                        obj.Count = 0;
                        obj.Error = Msg.GetMsg(ctx, "VIS_RecordNotSubscribed");
                        return obj;
                    }
                }
                trx.Commit();
                if (insertedCount > 0)               // Returns the number of successfully inserted records
                {
                    obj.Count = insertedCount;
                    obj.Error = "";
                    return obj;

                }
                else
                {
                    obj.Count = insertedCount;          //insertedCount=0
                    obj.Error = Msg.GetMsg(ctx, "VIS_RecordAlreadySubscribed");
                    return obj;
                }
            }
            obj.Count = insertedCount;   //insertedCount=0
            obj.Error = obj.Error = Msg.GetMsg(ctx, "VIS_DatasetIsNull");
            return obj;

        }

        public int InsertSubscription(int win_ID, int rec_ID, int table_ID)
        {
            X_CM_Subscribe subs = new X_CM_Subscribe(_ctx, 0, null);
            subs.SetAD_Client_ID(_ctx.GetAD_Client_ID());
            subs.SetAD_Org_ID(_ctx.GetAD_Org_ID());
            subs.SetAD_Window_ID(win_ID);
            subs.SetAD_Table_ID(table_ID);
            subs.SetRecord_ID(rec_ID);
            subs.SetAD_User_ID(_ctx.GetAD_User_ID());
            if (!subs.Save())
            {
                return 0;
            }
            return 1;
        }
        public int DeleteSubscription(int AD_Window_ID, int Record_ID, int AD_Table_ID)
        {


            if (Util.GetValueOfInt(DB.ExecuteScalar("SELECT Count(*) FROM CM_Subscribe WHERE  AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID)) > 0)
            {
                if (DB.ExecuteQuery("delete from CM_Subscribe where  AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID) != 1)
                {
                    return 0;
                }
            }
            else
            {
                return 2;
            }
            return 1;
        }

        /// <summary>
        /// Delete Multiple Subscription
        /// </summary>
        /// <param name="ct"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="Record_IDs"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public int DeleteMultipleSubscription(Ctx ct, int AD_Window_ID, List<int> Record_IDs, int AD_Table_ID)
        {
            StringBuilder sql = new StringBuilder("DELETE FROM CM_Subscribe WHERE Record_ID IN ( ");

            List<SqlParameter> parameters = new List<SqlParameter>();
            for (int i = 0; i < Record_IDs.Count; i++)
            {
                sql.Append("@recordId" + i + ",");
                parameters.Add(new SqlParameter("@recordId" + i, Record_IDs[i]));
            }
            sql.Remove(sql.Length - 1, 1); // Removes the last character (comma)
            sql.Append(@") 
                    AND AD_Table_ID = @AD_Table_ID
                    AND AD_Window_ID = @AD_Window_ID
                    AND AD_User_ID = @AD_User_ID");

            parameters.Add(new SqlParameter("@AD_Table_ID", AD_Table_ID));
            parameters.Add(new SqlParameter("@AD_Window_ID", AD_Window_ID));
            parameters.Add(new SqlParameter("@AD_User_ID", ct.GetAD_User_ID()));

            // Execute the query with parameters
            int deletedRows = DB.ExecuteQuery(MRole.GetDefault(ct).AddAccessSQL(sql.ToString(), "CM_Subscribe", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO), parameters.ToArray(), null);

            // Return the number of rows deleted (if any)
            return deletedRows > 0 ? deletedRows : 0;
        }

        /// <summary>
        /// Subscribe All Records 
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="AD_Record_ID"></param>
        /// <returns></returns>
        public string SubscribeAll(Ctx ctx, int AD_Window_ID, int AD_Tab_ID, int AD_Table_ID, int AD_Record_ID)
        {
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("SubscribeAll" + DateTime.Now.Ticks);

            //mTable.
            StringBuilder sql = new StringBuilder();

            sql.Append(@"SELECT
                       WhereClause
                    FROM
                        AD_Tab 
                    WHERE
                          AD_Tab_ID=" + AD_Tab_ID);

            //Search where clause
            string WhereClause = Util.GetValueOfString(DB.ExecuteScalar(sql.ToString()));

            MTable table = MTable.Get(ctx, AD_Table_ID);
            string[] KeyColumns = table.GetKeyColumns();
            PO _po = table.GetPO(ctx, AD_Record_ID, null);

            sql.Clear();
            string TableName = table.GetTableName();
            string keyColumn = KeyColumns[0];
            sql.Append($@"SELECT " + ctx.GetAD_Client_ID() + ", " + ctx.GetAD_Org_ID() + ", " + ctx.GetAD_User_ID() + ", " + TableName + "." + keyColumn + " AS Record_ID , " + AD_Table_ID + " , " + AD_Window_ID + " from " + TableName + " ");

            if (!string.IsNullOrEmpty(WhereClause))
            {
                //Get records that are not present in cm_subscribe
                WhereClause = VAdvantage.Common.Common.ParseContextByPO(WhereClause, _po);
                sql.Append(@" WHERE " + WhereClause + " ");
                sql.Append(@" AND NOT EXISTS (SELECT 1 
                                FROM CM_Subscribe cs
                                WHERE cs.Record_ID=" + TableName + "." + keyColumn + " AND cs.AD_Table_ID=" + AD_Table_ID + " AND cs.AD_Window_ID=" + AD_Window_ID + " AND cs.ad_user_ID=" + ctx.GetAD_User_ID() + ")");
            }
            else
            {
                //Get records that are not present in cm_subscribe
                sql.Append(@" WHERE NOT EXISTS (SELECT 1 
                                FROM CM_Subscribe cs
                                WHERE cs.Record_ID=" + TableName + "." + keyColumn + " AND cs.AD_Table_ID=" + AD_Table_ID + " AND cs.AD_Window_ID=" + AD_Window_ID + " AND cs.ad_user_ID=" + ctx.GetAD_User_ID() + ")");
            }

            DataSet missingRecordIDs = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), TableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO));

            if (missingRecordIDs != null && missingRecordIDs.Tables.Count > 0 && missingRecordIDs.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in missingRecordIDs.Tables[0].Rows)
                {
                    X_CM_Subscribe subs = new X_CM_Subscribe(ctx, 0, trx);
                    subs.SetAD_Client_ID(ctx.GetAD_Client_ID());
                    subs.SetAD_Org_ID(ctx.GetAD_Org_ID());
                    subs.SetAD_Window_ID(AD_Window_ID);
                    subs.SetAD_Table_ID(AD_Table_ID);
                    subs.SetRecord_ID(Util.GetValueOfInt(row["Record_ID"]));
                    subs.SetAD_User_ID(ctx.GetAD_User_ID());
                    if (!subs.Save(trx))
                    {
                        // Retrieve and log the error
                        ValueNamePair vp = VLogger.RetrieveError();
                        StringBuilder error = new StringBuilder("Error: ");

                        if (vp != null && !string.IsNullOrEmpty(vp.GetName()))
                        {
                            error.Append("VIS_RecordNotSubscribed" + vp.GetName());
                        }

                        trx.Rollback();
                        _log.SaveError("VIS_RecordNotSubscribed", "");
                        return error.ToString();
                    }
                }
                trx.Commit();
                return "1";   // Records Subscribed
            }
            // DataSet ds = DB.ExecuteDataset(sql.ToString());
            //StringBuilder insert = new StringBuilder();
            //insert.Append(@"INSERT INTO CM_Subscribe (AD_Client_id,AD_Org_ID,AD_User_ID,Record_ID, AD_Table_ID, AD_Window_ID) VALUES ");
            //insert.Append(sql);
            //int count = DB.ExecuteQuery(insert.ToString());

            return "2"; //No record to subscribed or records are already subscribed
        }
        /// <summary>
        /// Get Unread Message Count
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public int UnreadMessageCount(Ctx ctx)
        {
            string sql = @"SELECT SUM(Unreadmessagecount) FROM CM_Subscribe WHERE AD_User_ID = @value";
            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@value", ctx.GetAD_User_ID());
            int count = Util.GetValueOfInt(DB.ExecuteScalar(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "CM_Subscribe", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO), param, null));
            return count;
        }
    }
}