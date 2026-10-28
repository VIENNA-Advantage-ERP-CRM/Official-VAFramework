using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAModelAD.ProcessAD
{
    public class MultipleEmailSendLink : SvrProcess
    {
        private Ctx _ctx = null;
        private int mailTemplate_ID = 0;
        private string url = null;
        private PO _po = null;
        List<string> warnings = new List<string>();
        string warning;
        protected override void Prepare()
        {
            _ctx = GetCtx();
        }


        /// <summary>
        /// Send url link of reset password
        /// </summary>
        /// <returns></returns>
        /// <summary>
        /// Send create-password link to all users where IsLoginUser = 'N'
        /// </summary>
        /// <returns>summary message</returns>
        protected override string DoIt()
        {
            // ---------- Step 1: resolve application url and mail template (once) ----------
            try
            {
                url = _ctx.GetApplicationUrl();
                url = url.Substring(0, url.LastIndexOf("/")) + "/Areas/VIS/WebPages/CreatePassword.aspx";

                // template of current client
                mailTemplate_ID = Util.GetValueOfInt(DB.ExecuteScalar(
                    "SELECT R_MAILTEXT_ID FROM AD_MailTemplateSetting WHERE ISACTIVE ='Y' AND MailTemplateKey='OUC' AND AD_CLIENT_ID=" + _ctx.GetAD_Client_ID()));

                // fall back to System template
                if (mailTemplate_ID == 0)
                {
                    mailTemplate_ID = Util.GetValueOfInt(DB.ExecuteScalar(
                        "SELECT R_MAILTEXT_ID FROM AD_MailTemplateSetting WHERE ISACTIVE ='Y' AND MailTemplateKey='OUC' AND AD_CLIENT_ID=0"));

                    if (mailTemplate_ID == 0)
                        return Msg.GetMsg(GetCtx(), "VIS_TemplateNotFound");
                }
            }
            catch (Exception ex)
            {
                VLogger.Get().SaveError("EmailSendLinkProcess ", ex.Message);
                return ex.Message;
            }

            // ---------- Step 2: get all users where IsLoginUser = 'N' ----------
            // Recommended: add  AND IsActive = 'Y' AND AD_Client_ID = <current client>
            string userSql = "SELECT AD_User_ID,Name FROM AD_User WHERE IsLoginUser = 'N' AND IsActive = 'Y'";
            userSql = MRole.GetDefault(GetCtx()).AddAccessSQL(userSql, "AD_User", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);
            // string userSql = "SELECT AD_User_ID FROM AD_User WHERE IsLoginUser = 'N' AND IsActive = 'Y' AND AD_Client_ID = " + GetAD_Client_ID();

            DataSet ds = DB.ExecuteDataset(userSql);
            if (ds == null || ds.Tables[0].Rows.Count == 0)
            {
                return Msg.GetMsg(GetCtx(), "NoRecordFound");   // use a suitable message key
            }
            Dictionary<int, string> users = new Dictionary<int, string>();
           // List<int> userIDs = new List<int>();
            foreach (DataRow row in ds.Tables[0].Rows)
            {
                int userID = Util.GetValueOfInt(row["AD_User_ID"]);
                string userName = Util.GetValueOfString(row["Name"]);
                users.Add(userID, userName);
            }

            // ---------- Step 3: send mail to each user ----------
            int sent = 0;
            List<string> failed = new List<string>();

            //foreach (int userID in userIDs)
             foreach (KeyValuePair<int, string> user in users)
             {
                int userID = user.Key;
                string userName = user.Value;
                try
                {
                    string result = SendMailToUser(userID, out warning);   // null = success, otherwise reason

                    if (result == null)
                    {
                        sent++;
                        if (!string.IsNullOrEmpty(warning))
                          // warnings.Add("UserID " + userID + ": " + warning);
                           warnings.Add("UserName " + userName + ": " + warning);
                    }
                    else
                    {
                       // failed.Add("UserID " + userID + " (" + result + ")");
                       //log.Fine("UserID " + userID + ": " + result);
                        failed.Add("UserName " + userName + " (" + result + ")");                        
                        log.Fine("UserName " + userName + ": " + result);
                    }
                }
                catch (Exception ex)
                {
                    // one user failing must not stop the others
                    VLogger.Get().SaveError("EmailSendLinkProcess ", ex.Message);
                    failed.Add("UserName " + userName + " (" + ex.Message + ")");
                }
            }

            // ---------- Step 4: summary ----------
            string msg = Msg.GetMsg(GetCtx(), "VIS_MailSendSuccessfully") + ": " + sent + " / " + users.Count;
            if (warnings.Count > 0)
                msg += ". " + string.Join("; ", warnings);
            if (failed.Count > 0)
            {
                msg += ". Failed: " + string.Join("; ", failed);
            }
            return msg;
        }
       
        /// <summary>
        /// Send create-password mail to one user.
        /// </summary>
        /// <param name="userID">AD_User_ID</param>
        /// <param name="warning">set when mail was sent but some roles have no org access</param>
        /// <returns>null if mail sent, otherwise the reason it was skipped/failed</returns>
        private string SendMailToUser(int userID, out string warning)
        {
            warning = null;

            // ---------- 1. Role and organization access check ----------
            string sql = @"SELECT AD_User_Roles.AD_ROLE_ID, AD_ROLE.IsUseUserOrgAccess, AD_ROLE.Name 
                   FROM AD_User_Roles 
                   INNER JOIN AD_Role ON (AD_User_Roles.AD_ROLE_ID = AD_Role.AD_ROLE_ID) 
                   WHERE AD_User_Roles.AD_User_ID=" + userID;
            sql = MRole.GetDefault(GetCtx()).AddAccessSQL(sql, "AD_User_Roles", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);
            DataSet dataSet = DB.ExecuteDataset(sql);

            if (dataSet == null || dataSet.Tables[0].Rows.Count == 0)
                return Msg.GetMsg(GetCtx(), "VIS_RoleRequired");

            int totalRole = dataSet.Tables[0].Rows.Count;   // all roles assigned to user
            int count = 0;                                  // roles that have org access
            string message = "";                            // roles that do NOT have org access

            foreach (DataRow r in dataSet.Tables[0].Rows)
            {
                string roleName = Util.GetValueOfString(r["Name"]);
                int orgCount;

                if (Util.GetValueOfString(r["IsUseUserOrgAccess"]) == "Y")
                {
                    orgCount = Util.GetValueOfInt(DB.ExecuteScalar(
                        "SELECT COUNT(AD_Org_ID) FROM AD_User_OrgAccess WHERE ISACTIVE ='Y' AND AD_User_ID =" + userID));
                }
                else
                {
                    orgCount = Util.GetValueOfInt(DB.ExecuteScalar(
                        "SELECT COUNT(AD_Org_ID) FROM AD_Role_OrgAccess WHERE ISACTIVE ='Y' AND AD_ROLE_ID=" + r["AD_ROLE_ID"]));
                }

                if (orgCount == 0)
                    message += roleName + ", ";
                else
                    count++;
            }

            if (message.EndsWith(", "))
                message = message.Substring(0, message.Length - 2);

            // no role has org access -> skip this user
            if (count == 0)
            {
                return Msg.GetMsg(GetCtx(), "VIS_AssingedRole") + ": \"" + message + "\" " + Msg.GetMsg(GetCtx(), "VIS_DoNotOrgAccess");
            }

            // ---------- 2. Email validation ----------
            MUser usr = new MUser(GetCtx(), userID, Get_TrxName());
            string email = usr.GetEMail();

            if (string.IsNullOrEmpty(email))
                return Msg.GetMsg(GetCtx(), "MandatoryEmailAddress");

            string emailCountSql = "SELECT COUNT(AD_User_ID) FROM AD_User WHERE LOWER(Email) = LOWER('" + email.Replace("'", "''") + "')" +
                                   " AND IsActive = 'Y' AND AD_Client_ID = " + GetAD_Client_ID() +
                                   " AND AD_User_ID != " + userID;
            if (Util.GetValueOfInt(DB.ExecuteScalar(emailCountSql)) > 0)
                return Msg.GetMsg(GetCtx(), "EmailShouldBeUnique");

            // ---------- 3. Build the mail ----------
            MTable table = MTable.Get(GetCtx(), MUser.Table_ID);
            PO po = table.GetPO(GetCtx(), userID, Get_TrxName());

            MMailText mtext = new MMailText(_ctx, mailTemplate_ID, Get_TrxName());
            mtext.SetPO(po, true);

            string queryString = "?ID=" + SecureEngine.Encrypt(userID.ToString())
                               + "&lang=" + _ctx.GetAD_Language()
                               + "&path=" + _ctx.GetApplicationUrl();

            EMail objMail = new EMail(GetCtx(), "", "", "", "", "", "", true, false);
            objMail.SetMessageHTML(mtext.GetMailText()
                    .Replace("@ClickHereLink@", "<a href='" + url + queryString + "'>Click Here</a>"));
            objMail.SetSubject(mtext.GetMailHeader());
            objMail.AddTo(email, "");

            // ---------- 4. Send ----------
            string res1 = objMail.Send();
            if (res1 != "OK")
            {
                string error;
                if (res1 == "AuthenticationFailed.")
                    error = Msg.GetMsg(GetCtx(), "AuthenticationFailed");
                else if (res1 == "ConfigurationIncompleteOrNotFound")
                    error = Msg.GetMsg(GetCtx(), "ConfigurationIncompleteOrNotFound");
                else
                    error = res1;

                log.Fine(error);
                return error;
            }

            // ---------- 5. Mark user as login user ----------
            DB.ExecuteQuery("UPDATE AD_User SET IsLoginUser='Y' WHERE AD_User_ID=" + userID, null, Get_TrxName());

            // ---------- 6. totalRole check (from old code) ----------
            // mail sent, but some assigned roles have no org access
            if (totalRole - count > 0)
            {
                warning = Msg.GetMsg(GetCtx(), "VIS_MailSendSuccessfully") + " " + Msg.GetMsg(GetCtx(), "VIS_But") + " "
                        + (totalRole - count) + " " + Msg.GetMsg(GetCtx(), "Role") + ": \"" + message + "\" "
                        + Msg.GetMsg(GetCtx(), "VIS_OutOfAssign") + " " + totalRole + " "
                        + Msg.GetMsg(GetCtx(), "VIS_NotHaveOrgAccess");
            }

            return null;   // success
        }
    }
}
