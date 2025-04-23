using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Web;
using System.Windows.Forms;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;
using ViennaAdvantage.Model;


namespace VIS.Models
{
    public class UserSetting
    {
        public string Msg { get; set; }
        public bool IsSaved { get; set; }
    }
    public class LoginData
    {
        public string Name { get; set; }
        public int RecKey { get; set; }
    }
    public class DefaultLoginData
    {
        public int AD_Role_ID { get; set; }
        public int AD_Client_ID { get; set; }
        public int AD_Org_ID { get; set; }
        public int M_Warehouse_ID { get; set; }
    }
    public class UserPreferenceModel
    {
        public bool AutoCommitControl { get; set; }
        public bool AutoLoginControl { get; set; }
        public bool ShowAccountingTabControl { get; set; }
        public bool ShowAdvancedTabControl { get; set; }
        public bool ShowTranslationTabControl { get; set; }
        public bool StorePasswordControl { get; set; }
        public bool AutoNewRecordControl { get; set; }
        public bool CahceWindowControl { get; set; }
        public bool PreviewPrintControl { get; set; }
        public string PrinterControl { get; set; }
        public bool DictionaryMaintenenceControl { get; set; }
        public bool TraceFileControl { get; set; }
        public ListBox ListBoxControl { get; set; }

        public string ConnectionDetail { get; set; }
        public bool ErrorOnly { get; set; }
        public DateTime? Date { get; set; }
        public String[] Context { get; set; }
        //user setting property
        public bool SMS { get; set; }
        public bool Email { get; set; }
        public bool Notice { get; set; }
        public bool Fax { get; set; }
        public string EmailUserName { get; set; }
        public string EmailPws { get; set; }

        public bool IsVAAPIModuleInstall { get; set; } = false;


        public UserPreferenceModel GetUserSettings(Ctx ctx, int ad_User_Id)
        {

            MUser user = new MUser(ctx, ad_User_Id, null);
            UserPreferenceModel obj = new UserPreferenceModel();
            obj.EmailUserName = user.GetEMailUser();
            obj.EmailPws = user.GetEMailUserPW();
            var type = user.GetNotificationType();
            obj.SMS = user.IsSms();
            obj.Email = user.IsEmail();

            if (type == X_AD_User.NOTIFICATIONTYPE_NoticePlusFaxEMail)
            {
                obj.Notice = true;
                obj.Fax = true;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_EMailPlusNotice)
            {
                obj.Email = true;
                obj.Notice = true;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_EMailPlusFaxEMail)
            {
                obj.Email = true;
                obj.Fax = true;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_None)
            {
                obj.Notice = false;
                obj.Fax = false;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_Notice)
            {
                obj.Notice = true;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_FaxEMail)
            {
                obj.Fax = true;
            }
            else if (type == X_AD_User.NOTIFICATIONTYPE_EMail)
            {
                obj.Email = true;
            }
            if (Env.IsModuleInstalled("VAAPI_"))
            {
                obj.IsVAAPIModuleInstall = true;
            }
            return obj;
        }


        /// <summary>
        /// save prefrence into database as well as in server context
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="pref"></param>
        /// <returns></returns>
        public bool SavePrefrence(Ctx ctx, Dictionary<string, object> pref)
        {
            MUserPreference preference = null;
            MUser user = MUser.Get(ctx);
            preference = user.GetPreference();
            preference.SetIsAutoCommit(pref["IsAutoCommit"].Equals("Y") ? true : false);
            ctx.SetAutoCommit(pref["IsAutoCommit"].Equals("Y") ? true : false);
            preference.SetIsShowAcct(pref["IsShowAcct"].Equals("Y") ? true : false);
            ctx.SetContext("#ShowAcct", pref["IsShowAcct"].Equals("Y") ? true : false);
            //	Show Trl Tab
            preference.SetIsShowTrl(pref["IsShowTrl"].Equals("Y") ? true : false);
            ctx.SetContext("#ShowTrl", pref["IsShowTrl"].Equals("Y") ? true : false);
            //	Show Advanced Tab
            preference.SetIsShowAdvanced(pref["IsShowAdvanced"].Equals("Y") ? true : false);
            ctx.SetContext("#ShowAdvanced", pref["IsShowAdvanced"].Equals("Y") ? true : false);
            return preference.Save();
        }
        public UserSetting SaveChangePassword(Ctx ctx, int AD_User_ID, string currentPws, string newPws)
        {
            UserSetting obj = new UserSetting();
            obj.Msg = Msg.GetMsg(ctx, "RecordSaved");
            MUser user = new MUser(ctx, AD_User_ID, null);
            obj.IsSaved = false;
            if (currentPws.Length > 0 && newPws.Length > 0)
            {
                if (user.GetPassword().ToUpper() != currentPws.ToUpper())
                {
                    obj.Msg = Msg.GetMsg(ctx, "InCorrectPassword!");
                    obj.IsSaved = false;
                    return obj;
                }
                user.SetPassword(newPws);
            }
            if (user.Save())
            {
                obj.IsSaved = true;
            }
            return obj;
        }
        //save user settings
        public UserSetting SaveUserSettings(Ctx ctx, int AD_User_ID, string currentPws, string newPws, bool chkEmail, bool chkNotice,
           bool chkSMS, bool chkFax, string emailUserName, string emailPws, int AD_Role_ID, int AD_Client_ID, int AD_Org_ID, int M_Warehouse_ID)
        {
            UserSetting obj = new UserSetting();
            obj.Msg = Msg.GetMsg(ctx, "RecordSaved");
            MUser user = new MUser(ctx, AD_User_ID, null);
            obj.IsSaved = false;
            //if (currentPws.Length > 0 && newPws.Length > 0)
            //{
            //    if (user.GetPassword().ToUpper() != currentPws.ToUpper())
            //    {
            //        obj.Msg = Msg.GetMsg(ctx, "InCorrectPassword!");
            //        obj.IsSaved = false;
            //        return obj;
            //    }
            //    user.SetPassword(newPws);
            //}

            //user.SetIsEmail(chkEmail);
            //user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMail);
            ////notice
            //user.SetIsSms(chkSMS);
            //user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_SMS);

            //if (chkNotice && chkFax)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_NoticePlusFaxEMail);
            //}
            //else if (chkEmail && chkNotice)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMailPlusNotice);
            //}
            //else if (chkEmail && chkFax)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMailPlusFaxEMail);
            //}
            //else if (chkEmail && chkSMS && !chkNotice && !chkFax)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_None);
            //}
            //else if (chkNotice && chkSMS)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_Notice);
            //}
            //else if (chkFax && chkSMS)
            //{
            //    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_FaxEMail);
            //}

            user.SetIsEmail(chkEmail);
            user.SetIsSms(chkSMS);

            if (chkEmail)
            {
                user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMail);

                if (chkNotice)
                {
                    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMailPlusNotice);
                }
                if (chkFax)
                {
                    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_EMailPlusFaxEMail);
                }
            }
            if (chkSMS)
            {
                user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_SMS);

                if (chkNotice)
                {
                    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_Notice);
                }
                if (chkFax)
                {
                    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_FaxEMail);
                }
            }
            if (chkFax)
            {
                user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_FaxEMail);
            }
            if (chkNotice)
            {
                user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_Notice);
                if (chkFax)
                {
                    user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_NoticePlusFaxEMail);
                }
            }

            if (!chkNotice && !chkFax)
            {
                user.SetNotificationType(X_AD_User.NOTIFICATIONTYPE_None);
            }

            //fax
            user.SetEMailUser(emailUserName);
            user.SetEMailUserPW(emailPws);
            if (user.Save())
            {
                obj.IsSaved = true;
            }

            try
            {
                //LoginSettings
                int AD_LoginSetting_ID = Util.GetValueOfInt(VAdvantage.DataBase.DB.ExecuteScalar("SELECT AD_LoginSetting_ID FROM AD_LoginSetting WHERE IsActive='Y' AND AD_User_ID=" + AD_User_ID, null, null));
                StringBuilder sql = new StringBuilder("");
                if (AD_LoginSetting_ID > 0)//UPdate
                {
                    sql.Append("UPDATE AD_LoginSetting SET AD_Role_ID=" + AD_Role_ID + ",AD_Client_ID=" + AD_Client_ID + ",AD_Org_ID=" + AD_Org_ID + " ,M_Warehouse_ID=");
                    if (M_Warehouse_ID == 0)
                        sql.Append("NULL");
                    else
                        sql.Append(M_Warehouse_ID);

                    sql.Append(" WHERE AD_LoginSetting_ID=" + AD_LoginSetting_ID);

                }
                else//Insert
                {
                    AD_LoginSetting_ID = MSequence.GetNextID(ctx.GetAD_Client_ID(), "AD_LoginSetting", null);
                    sql.Append("INSERT INTO AD_LoginSetting (AD_CLIENT_ID,AD_LOGINSETTING_ID,AD_ORG_ID,AD_ROLE_ID,AD_USER_ID,CREATED,CREATEDBY,EXPORT_ID,M_WAREHOUSE_ID,UPDATED,UPDATEDBY)");
                    sql.Append(" VALUES (" + AD_Client_ID + "," + AD_LoginSetting_ID + "," + AD_Org_ID + "," + AD_Role_ID + "," + AD_User_ID + ",");
                    sql.Append(GlobalVariable.TO_DATE(DateTime.Now, false) + "," + ctx.GetAD_User_ID() + ",NULL,");
                    if (M_Warehouse_ID == 0)
                        sql.Append("NULL");
                    else
                        sql.Append(M_Warehouse_ID);

                    sql.Append("," + GlobalVariable.TO_DATE(DateTime.Now, false) + "," + ctx.GetAD_User_ID() + ")");


                }


                int s = VAdvantage.DataBase.DB.ExecuteQuery(sql.ToString(), null, null);
                if (s == -1)
                {
                    obj.IsSaved = false;
                }
            }
            catch
            {
            }


            return obj;
        }


        //**********Added By Sarab************
        public string Action(Ctx ctx, bool chkIsSyncTask, bool isTask, string authCode, bool isRemoveLink)
        {
            bool isSyncTask = chkIsSyncTask;

            string sql = @"Select WSP_GmailConfiguration_ID from WSP_GmailConfiguration where isActive='Y' and AD_User_ID=" + ctx.GetAD_User_ID() +
            //sql = MRole.GetDefault().AddAccessSQL(sql, "WS_GmailConfiguration", MRole.SQL_NOTQUALIFIED, MRole.SQL_RO);
            " and AD_Client_ID=" + ctx.GetAD_Client_ID();// +" and AD_Org_ID=" + Envs.GetCtx().GetAD_Org_ID();
            DataSet ds = DB.ExecuteDataset(sql, null);
            if (ds == null || ds.Tables[0].Rows.Count == 0)
            {
                X_WSP_GmailConfiguration gConfigs = new X_WSP_GmailConfiguration(ctx, 0, null);
                if (isTask)
                {
                    gConfigs.SetWSP_IsSyncTaskBackGround(isSyncTask);
                    // gConfig.SetIsExportTaskBackGround(isExportask);
                }
                else
                {
                    gConfigs.SetWSP_IsSyncCalendarBackground(isSyncTask);
                }

                //    gConfigs.SetWSP_TaskRefreshToken(authCode);  //Added By Sarab
                if (!gConfigs.Save())
                {
                    return "false";
                    //log.Warning("Gmail Config not saved");
                }


                //if (isSaving)
                //{
                //  //  this.DialogResult = true;
                //    //ShowMessage.Info("PleaseRefreshLatestTasks", true, null, null);
                //}
                //this.DialogResult = true;
                // ShowMessage.Info("PleaseRefreshLatestTasks", true, null, null);

                //log.Info("No Settings Found");
                return "true";
            }
            int config_ID = Convert.ToInt32(ds.Tables[0].Rows[0]["WSP_GmailConfiguration_ID"]);
            X_WSP_GmailConfiguration gConfig = new X_WSP_GmailConfiguration(ctx, config_ID, null);
            if (isTask)
            {
                gConfig.SetWSP_IsSyncTaskBackGround(isSyncTask);
                if (isRemoveLink)
                {
                    gConfig.SetWSP_TaskRefreshToken(null);
                    gConfig.SetWSP_IsSyncTaskBackGround(false);
                }
            }
            else
            {
                gConfig.SetWSP_IsSyncCalendarBackground(isSyncTask);
                if (isRemoveLink)
                {
                    gConfig.SetWSP_CalendarRefreshToken(null);
                    gConfig.SetWSP_IsSyncCalendarBackground(false);
                }
            }

            //  gConfig.SetWSP_TaskRefreshToken(authCode);
            if (!gConfig.Save())
            {
                return "false";
            }
            return "true";
        }

        public Dictionary<string, string> GetSavedDetail(Ctx ctx, bool isTask)
        {
            Dictionary<string, string> retDic = new Dictionary<string, string>();
            string sql = @"Select WSP_isSyncTaskBackground,WSP_IsSyncCalendarBackground,WSP_TaskRefreshToken,WSP_CalendarRefreshToken,WSP_ContactRefreshToken from WSP_GmailConfiguration where isActive='Y' and AD_User_ID=" + ctx.GetAD_User_ID()
                     + " and AD_Client_ID=" + ctx.GetAD_Client_ID();
            DataSet ds = DB.ExecuteDataset(sql, null);

            if (ds == null || ds.Tables[0].Rows.Count == 0)
            {
                retDic["IsExisting"] = "false";
                retDic["IsSyncInBackground"] = "false";
                retDic["TaskAuthCode"] = "";
                retDic["CalendarAuthCode"] = "";
                retDic["IsCalSyncInBackground"] = "";
                retDic["ContactAuthCode"] = "";
            }
            else
            {
                string isSyncbackground = "false";
                if (ds.Tables[0].Rows[0]["WSP_ISSYNCTASKBACKGROUND"].ToString().Equals("Y", StringComparison.OrdinalIgnoreCase))
                {
                    isSyncbackground = "true";
                }
                else
                {
                    isSyncbackground = "false";
                }
                retDic["IsExisting"] = "true";
                retDic["IsSyncInBackground"] = isSyncbackground;
                if (Util.GetValueOfString(ds.Tables[0].Rows[0]["WSP_TaskRefreshToken"]).Length > 0)
                {
                    retDic["TaskAuthCode"] = "*********" + Msg.GetMsg(ctx, "AlreadyLinked") + "***********";
                }
                if (Util.GetValueOfString(ds.Tables[0].Rows[0]["WSP_CalendarRefreshToken"]).Length > 0)
                {
                    retDic["CalendarAuthCode"] = "*********" + Msg.GetMsg(ctx, "AlreadyLinked") + "***********";
                }
                if (Util.GetValueOfString(ds.Tables[0].Rows[0]["WSP_ContactRefreshToken"]).Length > 0)
                {
                    retDic["ContactAuthCode"] = "*********" + Msg.GetMsg(ctx, "AlreadyLinked") + "***********";
                }
                if (ds.Tables[0].Rows[0]["WSP_ISSYNCCALENDARBACKGROUND"].ToString().Equals("Y", StringComparison.OrdinalIgnoreCase))
                {
                    retDic["IsCalSyncInBackground"] = "true";
                }
                else
                {
                    retDic["IsCalSyncInBackground"] = "false";
                }

            }

            return retDic;
        }
        //************************************


        //**********Added By Lakhwinder************
        public List<LoginData> GetLoginData(string roleID)
        {
            string sql = "SELECT c.Name,r.AD_Client_ID FROM AD_Role r INNER JOIN AD_Client c ON (c.AD_Client_ID=r.AD_Client_ID) WHERE r.AD_Role_ID= " + roleID;
            try
            {
                List<LoginData> ld = null;
                DataSet ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    ld = new List<LoginData>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ld.Add(new LoginData() { Name = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i][0]), RecKey = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i][1]) });
                    }

                }
                return ld;
            }
            catch
            {
                return null;
            }
        }

        public List<LoginData> GetUserRoles(string userId)
        {
            var sql = "SELECT  r.Name,r.AD_Role_ID" +
              //" u.ConnectionProfile, u.Password "+	//	4,5
              " FROM AD_User u" +
              " INNER JOIN AD_User_Roles ur ON (u.AD_User_ID=ur.AD_User_ID AND ur.IsActive='Y')" +
              " INNER JOIN AD_Role r ON (ur.AD_Role_ID=r.AD_Role_ID AND r.IsActive='Y') " +
              //.Append("WHERE COALESCE(u.LDAPUser,u.Name)=@username")		//	#1
              " WHERE " +//(COALESCE(u.LDAPUser,u.Name)=@username OR COALESCE(u.LDAPUser,u.Value)=@username)"+
              " u.AD_User_ID=" + userId + " AND u.IsActive='Y' " +
              " AND u.IsLoginUser='Y' " +
              " AND EXISTS (SELECT * FROM AD_Client c WHERE u.AD_Client_ID=c.AD_Client_ID AND c.IsActive='Y')" +
              " AND EXISTS (SELECT * FROM AD_Client c WHERE r.AD_Client_ID=c.AD_Client_ID AND c.IsActive='Y')" +
              " ORDER BY r.Name";

            try
            {
                List<LoginData> ld = null;
                DataSet ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    ld = new List<LoginData>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ld.Add(new LoginData() { Name = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i][0]), RecKey = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i][1]) });
                    }

                }
                return ld;
            }
            catch
            {
                return null;
            }
        }

        public List<LoginData> GetOrgData(string roleId, string clientId, string userId)
        {
            string sql = "SELECT o.Name,o.AD_Org_ID "   //	1..3
                  + "FROM AD_Role r, AD_Client c"
                  + " INNER JOIN AD_Org o ON (c.AD_Client_ID=o.AD_Client_ID OR o.AD_Org_ID=0) "
                  + "WHERE r.AD_Role_ID='" + roleId + "'"   //	#1
                  + " AND c.AD_Client_ID='" + clientId + "'"    //	#2
                  + " AND o.IsActive='Y' AND o.IsSummary='N'  AND o.IsCostCenter='N' AND o.IsProfitCenter='N' "
                  + " AND (r.IsAccessAllOrgs='Y' "
                      + "OR (r.IsUseUserOrgAccess='N' AND o.AD_Org_ID IN (SELECT AD_Org_ID FROM AD_Role_OrgAccess ra "
                          + "WHERE ra.AD_Role_ID=r.AD_Role_ID AND ra.IsActive='Y')) "
                      + "OR (r.IsUseUserOrgAccess='Y' AND o.AD_Org_ID IN (SELECT AD_Org_ID FROM AD_User_OrgAccess ua "
                          + "WHERE ua.AD_User_ID='" + userId + "' AND ua.IsActive='Y'))"        //	#3
                      + ") "
                  + "ORDER BY o.Name";

            try
            {
                List<LoginData> ld = null;
                DataSet ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    ld = new List<LoginData>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ld.Add(new LoginData() { Name = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i][0]), RecKey = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i][1]) });
                    }

                }
                return ld;
            }
            catch
            {
                return null;
            }
        }

        public List<LoginData> GetWareHouseData(string orgId)
        {
            var sql = "SELECT Name,M_Warehouse_ID  FROM M_Warehouse "
               + "WHERE AD_Org_ID=" + orgId + " AND IsActive='Y' "
               + "ORDER BY Name";

            try
            {
                List<LoginData> ld = null;
                DataSet ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    ld = new List<LoginData>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ld.Add(new LoginData() { Name = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i][0]), RecKey = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i][1]) });
                    }

                }
                return ld;
            }
            catch
            {
                return null;
            }
        }

        public DefaultLoginData GetDefaultLogin(int AD_User_ID)
        {
            string sql = "SELECT AD_Role_ID,AD_Client_ID,AD_Org_ID,M_Warehouse_ID FROM AD_LoginSetting WHERE IsActive='Y' AND AD_User_ID=" + AD_User_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            DefaultLoginData dfd = null;
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                dfd = new DefaultLoginData();
                dfd.AD_Role_ID = Util.GetValueOfInt(ds.Tables[0].Rows[0][0]);
                dfd.AD_Client_ID = Util.GetValueOfInt(ds.Tables[0].Rows[0][1]);
                dfd.AD_Org_ID = Util.GetValueOfInt(ds.Tables[0].Rows[0][2]);
                dfd.M_Warehouse_ID = Util.GetValueOfInt(ds.Tables[0].Rows[0][3]);
            }
            return dfd;
        }

        //************************************

        // Added by Bharat on 12 June 2017, updated by vinay bhatt on 18 oct 2018
        public int GetWindowID(string windowName)
        {
            string sql = "SELECT AD_Window_ID FROM AD_Window WHERE IsActive='Y' AND Name = '" + windowName + "'";
            int windowID = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            return windowID;
        }

        /// <summary>
        /// function to filter log files for selected date passed in parameter
        /// and zip those files in one folder, if found log for date passed in the parameter
        /// </summary>
        /// <param name="logDate"></param>
        /// <returns></returns>
        public string DownloadServerLog(DateTime? logDate)
        {
            // Log files path
            string logpath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "log";
            // Temp download folder path
            string tempDownPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "TempDownload";
            // filter files based on the date passed in the parameter
            var todayFiles = Directory.GetFiles(logpath).Where(x => new FileInfo(x).LastWriteTime.Date.ToShortDateString() == logDate.Value.ToShortDateString());

            var zipfileName = "SLog_" + System.DateTime.Now.Ticks + ".zip";

            using (ZipFile zip = new ZipFile())
            {
                var logsFound = false;
                foreach (string fl in todayFiles)
                {
                    zip.AddFile(fl, "LOGS");
                    logsFound = true;
                }
                if (!logsFound)
                    zipfileName = "";
                else
                {
                    // check if folder exists on hosting path (TempDownload)
                    if (!Directory.Exists(tempDownPath))
                        Directory.CreateDirectory(tempDownPath);
                    if (Directory.Exists(tempDownPath))
                        zip.Save(tempDownPath + "\\" + zipfileName);
                }
            }

            return zipfileName;
        }

        /// <summary>
        /// VAI050-Get List of Projects
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<LoginData> GetProjects(Ctx ctx)
        {
            string sql = "SELECT Name,VAAPI_Project_ID FROM VAAPI_Project";
            try
            {
                List<LoginData> ld = null;
                DataSet ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "VAAPI_Project", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO));
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    ld = new List<LoginData>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ld.Add(new LoginData() { Name = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i][0]), RecKey = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i][1]) });
                    }

                }
                return ld;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// VAI050-This method used to call Login API
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <param name="accessKey"></param>
        /// <param name="url"></param>
        /// <returns></returns>
        public dynamic CallLoginApi(string userName, string password, string accessKey, string url)
        {

            using (HttpClient client = new HttpClient())
            {
                // Add the access key to the request headers
                client.DefaultRequestHeaders.Add("accessKey", accessKey);

                var loginData = new
                {
                    userName = userName,
                    password = password
                };

                string jsonData = JsonConvert.SerializeObject(loginData);
                var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync(url, content).Result;
                if (response.IsSuccessStatusCode)
                {
                    string responseContent = response.Content.ReadAsStringAsync().Result;
                    ApiResponse apiResponse = JsonConvert.DeserializeObject<ApiResponse>(responseContent);
                    if (apiResponse.code == 200 && !IsEmptyObject(apiResponse.data))
                    {
                        return apiResponse.data;
                    }
                    else
                    {
                        return null;
                    }
                }
                return null;
            }
        }

        /// <summary>
        /// VAI050-This method used create session token via calling api
        /// </summary>
        /// <param name="AD_Client_ID"></param>
        /// <param name="AD_Org_ID"></param>
        /// <param name="AD_User_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="accessKey"></param>
        /// <param name="requestAddr"></param>
        /// <param name="tokenExpTimeInMinutes"></param>
        /// <param name="idleTime"></param>
        /// <param name="Project_ID"></param>
        /// <param name="keyName"></param>
        /// <param name="url"></param>
        /// <returns></returns>
        public dynamic CallInitSessionApi(int AD_Client_ID, int AD_Org_ID, int AD_User_ID, int AD_Role_ID, string accessKey, string requestAddr, int tokenExpTimeInMinutes, int idleTime, int Project_ID, string keyName, string url)
        {
            using (HttpClient client = new HttpClient())
            {

                // Add the access key to the request headers
                client.DefaultRequestHeaders.Add("accessKey", accessKey);
                var sessionData = new
                {
                    AD_Client_ID = AD_Client_ID,
                    AD_Org_ID = AD_Org_ID,
                    AD_User_ID = AD_User_ID,
                    AD_Role_ID = AD_Role_ID,
                    requestAddr = requestAddr,
                    tokenExpTimeInMinutes = tokenExpTimeInMinutes,
                    idleTime = idleTime,
                    project_ID = Project_ID,
                    keyName = keyName,
                    manualGeneration = true
                };
                string jsonData = JsonConvert.SerializeObject(sessionData);
                var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync(url, content).Result;
                if (response.IsSuccessStatusCode)
                {
                    string responseContent = response.Content.ReadAsStringAsync().Result;
                    ApiResponse apiResponse = JsonConvert.DeserializeObject<ApiResponse>(responseContent);
                    if (apiResponse.code == 200)
                    {
                        if (!string.IsNullOrEmpty(apiResponse.result))
                            return apiResponse.data;
                    }
                    else
                    {
                        return null;
                    }
                }
                return null;
            }
        }

        /// <summary>
        /// VAI050-This method used get secret key data
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<Dictionary<string, object>> GetSecretKeyData(Ctx ctx)
        {
            List<Dictionary<string, object>> keyList = null;
            string query = @"SELECT s.VAAPI_SessionToken_ID, s.VAAPI_KeyName, s.Created,s.IsActive, u.Name AS CreatedBy,
                             s.VAAPI_HintSessionToken,
                             p.Name AS ProjectName,p.VAAPI_Project_ID FROM VAAPI_SessionToken s
                             INNER JOIN VAAPI_Project p ON (s.VAAPI_Project_ID = p.VAAPI_Project_ID)
                             INNER JOIN AD_User u ON (u.AD_User_ID=s.CreatedBy)";
            DataSet ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(query, "s", true, true) + " ORDER BY VAAPI_SessionToken_ID");

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                keyList = new List<Dictionary<string, object>>();

                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    string maskedToken = "";
                    string sessionToken = Util.GetValueOfString(ds.Tables[0].Rows[i]["VAAPI_HintSessionToken"]);
                    if (!string.IsNullOrEmpty(sessionToken))
                    {
                        string firstTwo = sessionToken.Substring(0, 2);
                        string lastTwo = sessionToken.Substring(sessionToken.Length - 2, 2);
                        maskedToken = firstTwo + new string('*', 16) + lastTwo;
                    }

                    Dictionary<string, object> obj = new Dictionary<string, object>();
                    obj.Add("KeyName", Util.GetValueOfString(ds.Tables[0].Rows[i]["VAAPI_KeyName"]));
                    obj.Add("SessionToken", maskedToken);
                    obj.Add("Created", Util.GetValueOfDateTime(ds.Tables[0].Rows[i]["Created"]));
                    obj.Add("CreatedBy", Util.GetValueOfString(ds.Tables[0].Rows[i]["CreatedBy"]));
                    obj.Add("ProjectName", Util.GetValueOfString(ds.Tables[0].Rows[i]["ProjectName"]));
                    obj.Add("RecordID", Util.GetValueOfInt(ds.Tables[0].Rows[i]["VAAPI_SessionToken_ID"]));
                    obj.Add("ProjectID", Util.GetValueOfInt(ds.Tables[0].Rows[i]["VAAPI_Project_ID"]));
                    obj.Add("IsActive", Util.GetValueOfString(ds.Tables[0].Rows[i]["IsActive"]));
                    keyList.Add(obj);
                }
            }

            return keyList;
        }

        /// <summary>
        /// VAI050-This method used to delete secret key
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="RecID"></param>
        /// <returns></returns>
        public bool DeleteSecretKey(Ctx ctx, int RecID)
        {
            MTable tbl = new MTable(ctx, MTable.Get_Table_ID("VAAPI_SessionToken"), null);
            PO obj = tbl.GetPO(ctx, RecID, null);
            bool IsDeleted = obj.Delete(true);
            return IsDeleted;
        }

        /// <summary>
        /// VAI050-This method used to update secret key data
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public bool UpdateSecretKey(Ctx ctx, SecretKeyModel value)
        {
            MTable tbl = new MTable(ctx, MTable.Get_Table_ID("VAAPI_SessionToken"), null);
            int ProjectID = value.ProjectID;
            int RecordID = value.RecordID;
            string KeyName = value.KeyName;
            PO obj = tbl.GetPO(ctx, RecordID, null);
            obj.Set_Value("VAAPI_KeyName", KeyName);
            obj.Set_Value("IsActive", value.IsActive);
            obj.Set_Value("VAAPI_Project_ID", ProjectID);
            if (!obj.Save())
            {
                return false;
            }
            return true;
        }

        /// <summary>
        /// VAi050-This method used to check object empty or nul
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        private bool IsEmptyObject(object obj)
        {
            // Check if it's an array or a list and if it's empty
            if (obj is ICollection collection)
            {
                return collection.Count == 0;
            }
            return false;
        }

        /// <summary>
        /// VAI050-Get access key 
        /// </summary>
        /// <returns> returns key</returns>
        public string GetAccessKey()
        {
            try
            {
                System.Reflection.Assembly asm = System.Reflection.Assembly.Load("MarketSvc");
                string AccessKey = Util.GetValueOfString(asm.GetType("MarketSvc.Classes.Utility").GetMethod("GetCustomerAccessKey", BindingFlags.Public | BindingFlags.Static).Invoke(null, null));
                return AccessKey;
            }
            catch (Exception e)
            { VAdvantage.Logging.VLogger.Get().Severe("ErrorToGetAccessKey=>" + e.Message); }
            return null;
        }

        /// <summary>
        /// VAI050-This method used to verify password
        /// </summary>
        /// <param name="password"></param>
        /// <param name="userName"></param>
        /// <returns></returns>
        public bool VerifyPassword(string password, string userName)
        {
            try
            {
                // Get encryption info
                string sqlEnc = @"SELECT IsEncrypted, IsHashed  FROM AD_Column WHERE AD_Table_ID = (SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_User') 
                                  AND ColumnName='Password'";
                DataSet dsLoginDS = DB.ExecuteDataset(sqlEnc);
                char isEncrypted = Convert.ToChar(dsLoginDS.Tables[0].Rows[0]["IsEncrypted"]);
                char isHashed = Convert.ToChar(dsLoginDS.Tables[0].Rows[0]["IsHashed"]);
                // Fetch actual password from the user record
                string fetchPasswordSql = "SELECT Password FROM AD_User WHERE Value=@username";
                SqlParameter[] param = new SqlParameter[]
                {
                  new SqlParameter("@username", userName)
                };
                string storedPassword = Util.GetValueOfString(DB.ExecuteScalar(fetchPasswordSql, param, null));

                if (string.IsNullOrEmpty(storedPassword))
                {
                    return false; // User not found or no password
                }

                if (isHashed == 'Y')
                {
                    return SecureEngine.VerifyHash(password, storedPassword, null);
                }
                else if (isEncrypted == 'Y')
                {
                    return storedPassword == VAdvantage.Utility.SecureEngine.Encrypt(password);
                }
                else
                {
                    return storedPassword == password;
                }
            }
            catch (Exception e)
            {
                VAdvantage.Logging.VLogger.Get().Severe("ErrorToVerifyPassword=>" + e.Message);
                return false;
            }
        }

    }

    public class SecretKeyModel
    {
        public string KeyName { get; set; }
        public int ProjectID { get; set; }
        public int RecordID { get; set; }
        public bool IsActive { get; set; }

    }

    public class LoginAndInitSessionRequest
    {
        public string userName { get; set; }
        public string password { get; set; }
        public int AD_Client_ID { get; set; }
        public int AD_Org_ID { get; set; }
        public int AD_User_ID { get; set; }
        public int AD_Role_ID { get; set; }
        public string requestAddr { get; set; }
        public int tokenExpTimeInMinutes { get; set; }
        public int idleTime { get; set; }
        public int Project_ID { get; set; }
        public string keyName { get; set; }


    }

    public class ApiResponse
    {
        public int code { get; set; }
        public string result { get; set; }
        public object data { get; set; }
    }

}