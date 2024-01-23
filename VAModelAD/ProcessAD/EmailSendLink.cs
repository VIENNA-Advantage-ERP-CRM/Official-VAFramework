/*******************************************************
* Module Name  : VIS
* Purpose      : Send mail to user to reset their password
* Window Used  : User
* Chronological: Development
* Created By   : Karamjit Singh
* Created On   : 10-Jan-2024
 ******************************************************/

using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAModelAD.ProcessAD
{

    /// <summary>
    /// Email send to user for reset password.
    /// </summary>
    public class EmailSendLink: SvrProcess
    {
        private Ctx _ctx = null;
        string url = null;
        private int mailTemplate_ID;
        private PO _po = null;
        /// <summary>
        /// Prepare - e.g., get Parameters.
        /// </summary>
        protected override void Prepare()
        {
            _ctx = GetCtx();
            
        }
        /// <summary>
        /// Send url link of reset password
        /// </summary>
        /// <returns></returns>
        protected override String DoIt()
        {
            string message = "";
            int count = 0;
            string sql = @"SELECT AD_User_Roles.AD_ROLE_ID,AD_ROLE.IsUseUserOrgAccess,AD_ROLE.Name FROM AD_User_Roles 
                           INNER JOIN AD_Role ON (AD_User_Roles.AD_ROLE_ID=AD_Role.AD_ROLE_ID) 
                           WHERE AD_User_Roles.AD_User_ID=" + GetRecord_ID();
            sql = MRole.GetDefault(GetCtx()).AddAccessSQL(sql, "AD_User_Roles", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);
            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables[0].Rows.Count > 0)
            {
                int totalRole = dataSet.Tables[0].Rows.Count;
                for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
                {
                    string roleName = Util.GetValueOfString(dataSet.Tables[0].Rows[i]["Name"]);
                    if (Util.GetValueOfString(dataSet.Tables[0].Rows[i]["IsUseUserOrgAccess"]) == "Y")
                    {
                        int userOrgCount = Util.GetValueOfInt(DB.ExecuteScalar(@"SELECT COUNT(AD_Org_ID) FROM AD_User_OrgAccess WHERE AD_User_ID =" + GetRecord_ID()));
                        if (userOrgCount == 0)
                        {
                            message += roleName + ", ";
                        }
                        else
                        {
                            count++;
                        }
                    }
                    else
                    {
                        int roleOrgCount = Util.GetValueOfInt(DB.ExecuteScalar(@"SELECT COUNT(AD_Org_ID) FROM AD_Role_OrgAccess WHERE AD_ROLE_ID=" + dataSet.Tables[0].Rows[i]["AD_ROLE_ID"]));
                        if (roleOrgCount == 0)
                        {
                            message += roleName + ", ";
                        }
                        else
                        {
                            count++;
                        }
                    }
                }
                if (count > 0)
                {
                    StringBuilder str = new StringBuilder();
                    DataSet ds = null;
                    str.Clear();
                    str.Append("SELECT Email FROM AD_User WHERE ISACTIVE ='Y' AND AD_USER_ID=" + GetRecord_ID());
                    ds = DB.ExecuteDataset(str.ToString(), null, Get_Trx());
                    if (ds != null && ds.Tables[0].Rows.Count > 0)
                    {
                        string Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        if (!string.IsNullOrEmpty(Email))
                        {
                            url = _ctx.GetApplicationUrl();
                            url = url.Substring(0, url.LastIndexOf("/"));
                            url = url + "/Areas/VIS/WebPages/CreatePassword.aspx";
                            mailTemplate_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT R_MAILTEXT_ID FROM AD_MailTemplateSetting WHERE MailTemplateKey='OUC' AND AD_CLIENT_ID="+_ctx.GetAD_Client_ID()));
                            GetPO();
                            MMailText mtext = new MMailText(_ctx, mailTemplate_ID, Get_TrxName());
                            mtext.SetPO(_po, true);
                            EMail objMail = new EMail(GetCtx(), "", "", "", "", "", "", true, false);
                            string queryString = "?ID=" + SecureEngine.Encrypt(GetRecord_ID().ToString()) + "&lang=" + _ctx.GetAD_Language();
                            objMail.SetMessageHTML(mtext.GetMailText()
                                                  .Replace("@ClickHereLink@", "<a href='" + url + queryString + "'>Click Here</a>"));
                            objMail.SetSubject(mtext.GetMailHeader());
                            objMail.AddTo(Email, "");
                            string res1 = objMail.Send();
                            StringBuilder res = new StringBuilder();
                            if (res1 != "OK")           // if mail not sent....
                            {
                                if (res1 == "AuthenticationFailed.")
                                {
                                    res.Append("AuthenticationFailed");
                                    log.Fine(res.ToString());
                                }
                                else if (res1 == "ConfigurationIncompleteOrNotFound")
                                {
                                    res.Append("ConfigurationIncompleteOrNotFound");
                                    log.Fine(res.ToString());
                                }
                                else
                                {
                                    res.Append(" " + Msg.GetMsg(GetCtx(), "MailNotSentTo") + Email);
                                    log.Fine(res.ToString());
                                }
                            }
                            else
                            {
                                if (!res.ToString().Contains("MailSent"))
                                {                                   
                                    String Sql = "UPDATE AD_User SET IsLoginUser='Y'  WHERE AD_User_ID=" + GetRecord_ID();
                                    DB.ExecuteQuery(Sql);
                                    res.Append("MailSent");
                                    if (totalRole - count > 0)
                                    {
                                        return Msg.GetMsg(GetCtx(), "MailSendSuccessfully") +" " + Msg.GetMsg(GetCtx(), "But")+ " " + Util.GetValueOfString(totalRole - count) +" "+ Msg.GetMsg(GetCtx(), "Role/RolesOutOf") +" "+ Util.GetValueOfString(totalRole) + ", " +
                                           Msg.GetMsg(GetCtx(), "DoNotOrgAccess");
                                    }
                                    else
                                    {
                                        return Msg.GetMsg(GetCtx(), "MailSendSuccessfully");
                                    }                                
                                }
                            }
                        }
                        else
                        {
                            log.Fine("Enter Email Address");
                            return "";
                        }
                    }
                }
                else
                {
                    if (message.Length > 0 && message.EndsWith(", "))
                    {
                        message = message.Substring(0, message.Length - 2);
                    }
                    return Msg.GetMsg(GetCtx(), "OrgAccessMandatory") +" "+ message +" "+ Msg.GetMsg(GetCtx(), "DoNotOrgAccess");
                }
            }
            return Msg.GetMsg(GetCtx(), "RoleRequired");
        }

        /// <summary>
        /// Get Persistent Object
        /// </summary>
        /// <returns>po</returns>
        public PO GetPO()
        {
            if (_po != null)
                return _po;
            if (GetRecord_ID() == 0)
                return null;

            MTable table = MTable.Get(GetCtx(), GetTable_ID());
            _po = table.GetPO(GetCtx(), GetRecord_ID(), Get_TrxName());
            return _po;
        }
    }
}
