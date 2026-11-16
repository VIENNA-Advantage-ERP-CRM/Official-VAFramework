using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using VAdvantage.Classes;
using VAdvantage.Utility;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.PushNotif;
using static VAModelAD.AIHelper.AIPayload;

namespace VAdvantage.Model
{
    public class MAppointmentsInfo : X_AppointmentsInfo
    {

        public MAppointmentsInfo(Context ctx, int AppointmentsInfo_ID, Trx trxName)
            : base(ctx, AppointmentsInfo_ID, trxName)
        {
            /** if (AppointmentsInfo_ID == 0)
            {
            SetAppointmentsInfo_ID (0);
            }
             */
        }
        public MAppointmentsInfo(Ctx ctx, int AppointmentsInfo_ID, Trx trxName)
            : base(ctx, AppointmentsInfo_ID, trxName)
        {
            /** if (AppointmentsInfo_ID == 0)
            {
            SetAppointmentsInfo_ID (0);
            }
             */
        }
        /** Load Constructor 
        @param ctx context
        @param rs result set 
        @param trxName transaction
        */
        public MAppointmentsInfo(Context ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName)
        {
        }
        /** Load Constructor 
        @param ctx context
        @param rs result set 
        @param trxName transaction
        */
        public MAppointmentsInfo(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName)
        {
        }
        /** Load Constructor 
        @param ctx context
        @param rs result set 
        @param trxName transaction
        */
        public MAppointmentsInfo(Ctx ctx, IDataReader dr, Trx trxName)
            : base(ctx, dr, trxName)
        {
        }

        /// <summary>
        /// This function is called before final saving of records
        /// </summary>
        /// <returns>bool type true if can be saved</returns>
        protected override bool BeforeSave(bool newRecord)
        {
            if (!string.IsNullOrEmpty(GetEmailToInfo()))
            {
                string emails = GetEmailToInfo();
                List<string> emailList = emails.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(e => e.Trim().ToLower()).Where(e => e.Length > 0).Distinct().ToList();

                if (emailList.Count > 0)
                {
                    // One address can belong to several users (e.g. a login user and a contact, or
                    // users of other tenants): prefer a user of this tenant, then active, then login users
                    StringBuilder sql = new StringBuilder("SELECT AD_User_ID, LOWER(Email) AS Email FROM AD_User WHERE LOWER(Email) IN (");
                    sql.Append(string.Join(",", emailList.Select(e => $"'{e.Replace("'", "''")}'")));
                    sql.Append(") ORDER BY CASE WHEN AD_Client_ID = ").Append(GetAD_Client_ID()).Append(" THEN 0 ELSE 1 END,")
                        .Append(" CASE WHEN IsActive = 'Y' THEN 0 ELSE 1 END,")
                        .Append(" CASE WHEN IsLoginUser = 'Y' THEN 0 ELSE 1 END, AD_User_ID");
                    DataSet ds1 = DB.ExecuteDataset(sql.ToString());
                    if (ds1 != null && ds1.Tables.Count > 0 && ds1.Tables[0].Rows.Count > 0)
                    {
                        Dictionary<string, int> userDict = new Dictionary<string, int>();
                        foreach (DataRow r in ds1.Tables[0].Rows)
                        {
                            string email = Util.GetValueOfString(r["Email"]);
                            if (!userDict.ContainsKey(email))
                            {
                                userDict.Add(email, Util.GetValueOfInt(r["AD_User_ID"]));
                            }
                        }

                        // Attendees already set are kept first; they are stored separated by ';'
                        List<int> contactList = new List<int>();
                        string contacts = GetAttendeeInfo();
                        if (!string.IsNullOrWhiteSpace(contacts))
                        {
                            foreach (string idStr in contacts.Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries))
                            {
                                int id = Util.GetValueOfInt(idStr.Trim());
                                if (id > 0 && !contactList.Contains(id))
                                {
                                    contactList.Add(id);
                                }
                            }
                        }

                        List<string> otherEmails = new List<string>();
                        foreach (string email in emailList)
                        {
                            if (userDict.TryGetValue(email, out int userId))
                            {
                                if (!contactList.Contains(userId))
                                {
                                    contactList.Add(userId);
                                }
                            }
                            else
                            {
                                otherEmails.Add(email);
                            }
                        }

                        // Update info
                        SetAttendeeInfo(string.Join(";", contactList));
                        SetEmailToInfo(string.Join(",", otherEmails));
                    }
                }
            }
            return true;
        }

        /* 	After Save
         *	@param newRecord new
         *	@param success success
         *	@return true if can be saved
         */
        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (!success)
                return success;

            #region Push Notification

            string type, title, body;

            if (IsTask())
            {
                string priorityValue = $@"SELECT Name FROM AD_Ref_List WHERE AD_Reference_ID = 
                                            (SELECT AD_Reference_ID FROM AD_Reference WHERE Name = '_PriorityRule')
                                            AND Value = '{GetPriorityKey()}' AND IsActive = 'Y'";
                string priority = Util.GetValueOfString(DB.ExecuteScalar(priorityValue));
                type = "T";
                title = Msg.GetMsg(GetCtx(), "Task");
                body = GetSubject() + " (" + priority + ")";
            }
            else
            {
                type = "A";
                title = Msg.GetMsg(GetCtx(), "Appointment");
                body = GetSubject() + " (" + GetStartDate().Value.ToLocalTime() + ")";
            }

            if (newRecord)
            {
                PushNotification.SendNotificationToUser(GetAD_User_ID(), GetAD_Window_ID(), GetRecord_ID(), title, body, type);
            }
            // Checking if notification is read by user 
            else if (Is_ValueChanged("IsRead") && IsRead())
            {
                int creatorUserId = GetCreatedBy();

                string name = GetUserNameFromUserID(GetAD_User_ID());

                body = GetSubject() + " (" + Msg.GetMsg(GetCtx(), "AcceptedBy") + " " + name + ")" +
                    " (" + GetStartDate().Value.ToLocalTime() + ")";

                PushNotification.SendNotificationToUser(creatorUserId, GetAD_Window_ID(), GetRecord_ID(), title, body, type);
            }

            #endregion

            string threadID = Common.Common.GetThreadID(Util.GetValueOfInt(GetAD_Table_ID()), GetRecord_ID(), Common.Common.GetRecordOrg(GetCtx(), Util.GetValueOfInt(GetAD_Table_ID()), GetRecord_ID()));
            if (!string.IsNullOrEmpty(threadID))
            {
                if (!ExecuteThreadAction(actionType: newRecord ? ActionType.New : ActionType.Update, tableID: Util.GetValueOfInt(GetAD_Table_ID()), recordID: Util.GetValueOfInt(GetRecord_ID()),
                    attachmentID: Util.GetValueOfInt(GetAppointmentsInfo_ID()), userID: GetAD_User_ID(), ctx: GetCtx(), threadID: threadID, attachmentType: type))
                {
                    log.SaveError("", "Error in execution of insert/update data against appointment thread : " + GetAppointmentsInfo_ID());
                }
            }

            return true;
        }

        /// <summary>
        /// Run after delete
        /// </summary>
        /// <param name="success"></param>
        /// <returns></returns>
        protected override bool AfterDelete(bool success)
        {
            if (!success)
                return success;

            // VIS264 - Send notification if user rejected appointment

            string title, body;
            string type = "T";

            // VIS264 - Check if it is appointment
            if (!IsTask())
            {
                type = "A";
                title = Msg.GetMsg(GetCtx(), "Appointment");

                int creatorUserId = GetCreatedBy();
                string name = GetUserNameFromUserID(GetAD_User_ID());

                body = GetSubject() + " (" + Msg.GetMsg(GetCtx(), "RejectedBy") + " " + name + ")" +
                    " (" + GetStartDate().Value.ToLocalTime() + ")";

                PushNotification.SendNotificationToUser(creatorUserId, GetAD_Window_ID(), GetRecord_ID(), title, body, type);
            }

            string threadID = Common.Common.GetThreadID(Util.GetValueOfInt(GetAD_Table_ID()), GetRecord_ID(), Common.Common.GetRecordOrg(GetCtx(), Util.GetValueOfInt(GetAD_Table_ID()), GetRecord_ID()));
            if (!string.IsNullOrEmpty(threadID))
            {
                if (!ExecuteThreadAction(actionType: ActionType.Delete, tableID: Util.GetValueOfInt(GetAD_Table_ID()), recordID: Util.GetValueOfInt(GetRecord_ID()),
                    attachmentID: Util.GetValueOfInt(GetAppointmentsInfo_ID()), userID: GetAD_User_ID(), ctx: GetCtx(), threadID: threadID, attachmentType: type))
                {
                    log.SaveError("", "Error in execution of insert/update data against appointment thread : " + GetAppointmentsInfo_ID());
                }
            }

            return true;
        }

        /// <summary>
        /// Get user name from user id
        /// </summary>
        /// <param name="v"></param>
        /// <returns></returns>
        private string GetUserNameFromUserID(int userId)
        {
            string userName = $"SELECT Name FROM AD_User WHERE AD_User_ID = {GetAD_User_ID()} AND IsActive = 'Y'";
            return Util.GetValueOfString(DB.ExecuteScalar(userName));
        }
    }
}
