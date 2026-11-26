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
            //Handle PrintNative digit
            if (pref.ContainsKey("PrintNativeDigits"))
            {
                ctx.SetContext("PrintNativeDigits", (string)pref["PrintNativeDigits"]??"N");
            }
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
            // SECURITY: roleID is client-controlled; coerce to int before concatenation
            string sql = "SELECT c.Name,r.AD_Client_ID FROM AD_Role r INNER JOIN AD_Client c ON (c.AD_Client_ID=r.AD_Client_ID) WHERE r.AD_Role_ID= " + Util.GetValueOfInt(roleID);
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
              " AND NOT (r.AD_Client_ID = 0 AND r.UserLevel != 'S')" +
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
                  // SECURITY: roleId and clientId are client-controlled; coerce to int before concatenation
                  + "WHERE r.AD_Role_ID='" + Util.GetValueOfInt(roleId) + "'"   //	#1
                  + " AND c.AD_Client_ID='" + Util.GetValueOfInt(clientId) + "'"    //	#2
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
            // SECURITY: orgId is client-controlled; coerce to int before concatenation
            var sql = "SELECT Name,M_Warehouse_ID  FROM M_Warehouse "
               + "WHERE AD_Org_ID=" + Util.GetValueOfInt(orgId) + " AND IsActive='Y' "
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
            // SECURITY: windowName is client-controlled; escape single quotes in the SQL literal
            string sql = "SELECT AD_Window_ID FROM AD_Window WHERE IsActive='Y' AND Name = '" + windowName.Replace("'", "''") + "'";
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
        public List<dynamic> GetProjects(Ctx ctx)
        {
            string sql = "SELECT Name, VAAPI_Project_ID, IsActive FROM VAAPI_Project ORDER BY Name";
            try
            {
                List<dynamic> projects = null;
                DataSet ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "VAAPI_Project", MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO));

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    projects = new List<dynamic>();

                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        projects.Add(new
                        {
                            Name = Util.GetValueOfString(row["Name"]),
                            RecKey = Util.GetValueOfInt(row["VAAPI_Project_ID"]),
                            IsActive = Util.GetValueOfString(row["IsActive"])
                        });
                    }
                }

                return projects;
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
            string query = @" SELECT s.VAAPI_SessionToken_ID, s.VAAPI_KeyName, s.Created,s.IsActive, u.Name AS CreatedBy,
                             s.VAAPI_HintSessionToken,
                             p.Name AS ProjectName,p.VAAPI_Project_ID 
                             ,r.Name AS Role
                             FROM VAAPI_SessionToken s
                             INNER JOIN VAAPI_Project p ON (s.VAAPI_Project_ID = p.VAAPI_Project_ID)
                             INNER JOIN AD_User u ON (u.AD_User_ID=s.CreatedBy)
                             INNER JOIN AD_Session ss ON(ss.AD_Session_ID=s.AD_Session_ID)
                            INNER JOIN AD_Role r ON(r.AD_Role_ID=ss.AD_Role_ID)";
            DataSet ds = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(query, "s", true, true) + " AND s.CreatedBy=" + ctx.GetAD_User_ID() + " ORDER BY s.VAAPI_SessionToken_ID");

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
                        maskedToken = firstTwo + new string('*', 12) + lastTwo;
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
                    obj.Add("Role", Util.GetValueOfString(ds.Tables[0].Rows[i]["Role"]));
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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<dynamic> GetTwoFAMethod(Ctx ctx)
        {
            string sql = @"SELECT
                            ad_ref_list.value,
                            ad_ref_list.name,
                            AD_User.TWOFAMETHOD
                        FROM
                            ad_ref_list ad_ref_list
                            LEFT JOIN  AD_User ON (ad_ref_list.value=AD_User.TWOFAMETHOD AND AD_User_ID=" + ctx.GetAD_User_ID() + @")
                        WHERE
                            ad_ref_list.ad_reference_id IN (SELECT ad_reference_id FROM ad_reference WHERE name = 'TwoFAMethod')";
            DataSet dataSet = DB.ExecuteDataset(sql);
            List<dynamic> result = new List<dynamic>();

            if (dataSet != null && dataSet.Tables.Count > 0)
            {
                foreach (DataRow dr in dataSet.Tables[0].Rows)
                {
                    dynamic item = new ExpandoObject();
                    item.value = Util.GetValueOfString(dr["value"]);
                    item.name = Util.GetValueOfString(dr["name"]);
                    item.TWOFAMETHOD = Util.GetValueOfString(dr["TWOFAMETHOD"]);
                    result.Add(item);
                }
            }

            return result;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="method"></param>
        /// <returns></returns>
        public bool UpdateTwoFAMethod(Ctx ctx, string method)
        {
            // SECURITY: method is client-controlled; escape single quotes in the SQL literal
            string sql = "Update AD_User SET TWOFAMETHOD='" + method.Replace("'", "''") + "' WHERE AD_User_ID=" + ctx.GetAD_User_ID();
            if (DB.ExecuteQuery(sql) > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        #region My Sign - signature and initials uploaded by the user (AD_UserSignature)

        /// <summary>Largest signature / initials file accepted, in bytes (200 KB).</summary>
        public const int MaxSignatureFileSize = 200 * 1024;

        /// <summary>Largest width or height accepted, in pixels. A small file can still decode into a very
        /// large bitmap, so the dimensions are checked before the image is re-encoded.</summary>
        private const int MaxSignatureImageSide = 1500;

        /// <summary>Longest full name / initials text kept with a signature. The name column holds 60 characters.</summary>
        private const int MaxSignatureNameLength = 60;
        private const int MaxSignatureInitialsLength = 10;

        private static readonly string[] SignatureFileExtensions = { ".gif", ".jpg", ".jpeg", ".png", ".bmp" };

        /// <summary>
        /// Load the saved signature and initials of the logged in user. The user always comes from the
        /// session context - never from the request - so nobody can read another user's images.
        /// </summary>
        /// <param name="ctx">Current context</param>
        /// <returns>UserSignatureData. FullName is the name saved with the signature (the user's own name until one
        /// is saved), InitialsText the initials saved with the initials image (null until one is saved).
        /// Signature / Initials are null when no image is saved.</returns>
        public UserSignatureData GetUserSignatures(Ctx ctx)
        {
            UserSignatureData data = new UserSignatureData();

            try
            {
                int userID = ctx.GetAD_User_ID();
                data.FullName = new MUser(ctx, userID, null).GetName();

                // newest first, so the first row met for each type is the current one
                DataSet ds = DB.ExecuteDataset(@"SELECT AD_UserSignature_ID, SignatureType, SignatureImage, FullName
                    FROM AD_UserSignature
                    WHERE IsActive='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID() + " AND AD_User_ID=" + userID + @"
                    AND SignatureType IN ('" + MUserSignature.SIGNATURETYPE_Signature + "','" + MUserSignature.SIGNATURETYPE_Initials + @"')
                    ORDER BY Created DESC, AD_UserSignature_ID DESC");

                if (ds == null || ds.Tables.Count == 0)
                {
                    return data;
                }

                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    string type = Util.GetValueOfString(ds.Tables[0].Rows[i]["SignatureType"]);
                    bool isSignature = type == MUserSignature.SIGNATURETYPE_Signature;

                    if ((isSignature && data.Signature != null) || (!isSignature && data.Initials != null))
                    {
                        continue;   // an older row of a type already found
                    }

                    // an entry whose image went missing is of no use - skip it rather than show an empty tile
                    string image = GetSignatureImageDataUrl(ctx, Util.GetValueOfInt(ds.Tables[0].Rows[i]["SignatureImage"]));

                    if (string.IsNullOrEmpty(image))
                    {
                        continue;
                    }

                    UserSignatureItem item = new UserSignatureItem
                    {
                        ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_UserSignature_ID"]),
                        Image = image
                    };

                    // each row keeps the text its picture stands for: the full name on the signature,
                    // the initials on the initials
                    string text = Util.GetValueOfString(ds.Tables[0].Rows[i]["FullName"]);

                    if (isSignature)
                    {
                        data.Signature = item;
                        if (!string.IsNullOrEmpty(text)) data.FullName = text;
                    }
                    else
                    {
                        data.Initials = item;
                        if (!string.IsNullOrEmpty(text)) data.InitialsText = text;
                    }
                }
            }
            catch (Exception ex)
            {
                VAdvantage.Logging.VLogger.Get().Severe("ErrorToGetUserSignatures=>" + ex.Message);
            }

            return data;
        }

        /// <summary>
        /// Save the full name and initials of the logged in user, together with the uploaded signature and / or
        /// initials image. Both pictures are mandatory: a file may be left out only when that picture is already
        /// saved, and only what is sent is replaced. A user has one signature and one set of initials: uploading
        /// again replaces the image and removes the old one.
        /// The text travels with its picture: the full name is kept on the signature row and the initials on the
        /// initials row, so text for a picture the user does not have yet cannot be stored and is ignored.
        /// Every file is checked here again (size, type, dimensions) and re-encoded as PNG, whatever the
        /// browser let through, so only real images of the accepted formats are ever stored.
        /// </summary>
        /// <param name="ctx">Current context</param>
        /// <param name="signatureFile">Signature image (optional)</param>
        /// <param name="initialsFile">Initials image (optional)</param>
        /// <param name="fullName">Full name shown with the signature (required)</param>
        /// <param name="initials">Initials shown with the initials image (required)</param>
        /// <returns>"OK", or NAMEREQUIRED / INITIALSREQUIRED / NAMETOOLONG / NOFILE (neither picture) / NOSIGNATURE / NOINITIALS / TOOLARGE / BADTYPE / BADSIZE / ERROR</returns>
        public string SaveUserSignatures(Ctx ctx, HttpPostedFileBase signatureFile, HttpPostedFileBase initialsFile, string fullName, string initials)
        {
            fullName = (fullName ?? string.Empty).Trim();
            initials = (initials ?? string.Empty).Trim();

            if (fullName.Length == 0)
            {
                return "NAMEREQUIRED";
            }

            if (initials.Length == 0)
            {
                return "INITIALSREQUIRED";
            }

            if (fullName.Length > MaxSignatureNameLength || initials.Length > MaxSignatureInitialsLength)
            {
                return "NAMETOOLONG";
            }

            bool hasSignature = signatureFile != null && signatureFile.ContentLength > 0;
            bool hasInitials = initialsFile != null && initialsFile.ContentLength > 0;

            byte[] signaturePng = null;
            byte[] initialsPng = null;
            string error;

            if (hasSignature && (error = ConvertToPng(signatureFile, out signaturePng)) != null)
            {
                return error;
            }

            if (hasInitials && (error = ConvertToPng(initialsFile, out initialsPng)) != null)
            {
                return error;
            }

            Trx trx = Trx.GetTrx(Trx.CreateTrxName("VIS_SaveUserSignature"));

            try
            {
                int userID = ctx.GetAD_User_ID();
                MUser user = new MUser(ctx, userID, null);

                // Email is mandatory in the table (as in DMS). The owner is AD_User_ID, the address is
                // only a label, so a user without an e-mail must not be blocked from saving a signature.
                string email = user.GetEMail();
                if (string.IsNullOrEmpty(email)) email = user.GetValue();
                if (string.IsNullOrEmpty(email)) email = user.GetName();
                if (string.IsNullOrEmpty(email)) email = fullName;

                MUserSignature signatureRow = GetUserSignatureRow(ctx, trx, userID, MUserSignature.SIGNATURETYPE_Signature);
                MUserSignature initialsRow = GetUserSignatureRow(ctx, trx, userID, MUserSignature.SIGNATURETYPE_Initials);

                // Both pictures are mandatory: each one is sent now or saved already. This is checked here as well
                // as in the browser, so a request that skips the page cannot leave a user with only one of them.
                bool signatureOnFile = signatureRow != null && signatureRow.GetSignatureImage() > 0;
                bool initialsOnFile = initialsRow != null && initialsRow.GetSignatureImage() > 0;

                if (!hasSignature && !signatureOnFile && !hasInitials && !initialsOnFile)
                {
                    trx.Rollback();
                    return "NOFILE";
                }

                if (!hasSignature && !signatureOnFile)
                {
                    trx.Rollback();
                    return "NOSIGNATURE";
                }

                if (!hasInitials && !initialsOnFile)
                {
                    trx.Rollback();
                    return "NOINITIALS";
                }

                // one group ties the signature to its initials
                string group = signatureRow != null ? signatureRow.GetSignatureGroup() : null;
                if (string.IsNullOrEmpty(group) && initialsRow != null) group = initialsRow.GetSignatureGroup();
                if (string.IsNullOrEmpty(group)) group = Guid.NewGuid().ToString("N").Substring(0, 20);

                List<int> replacedImages = new List<int>();

                // a new picture is stored with its text; a saved picture that is kept only gets its text updated
                bool signatureOK = hasSignature
                    ? StoreUserSignature(ctx, trx, signatureRow ?? new MUserSignature(ctx, 0, trx), signaturePng,
                        MUserSignature.SIGNATURETYPE_Signature, userID, fullName, email, group, replacedImages)
                    : (signatureRow == null || SetUserSignatureText(trx, signatureRow, fullName));

                bool initialsOK = signatureOK && (hasInitials
                    ? StoreUserSignature(ctx, trx, initialsRow ?? new MUserSignature(ctx, 0, trx), initialsPng,
                        MUserSignature.SIGNATURETYPE_Initials, userID, initials, email, group, replacedImages)
                    : (initialsRow == null || SetUserSignatureText(trx, initialsRow, initials)));

                if (!signatureOK || !initialsOK)
                {
                    trx.Rollback();
                    return "ERROR";
                }

                // the replaced pictures belonged to these rows alone - remove them with the commit
                foreach (int imageID in replacedImages)
                {
                    DeleteSignatureImage(ctx, trx, imageID);
                }

                trx.Commit();
                return "OK";
            }
            catch (Exception ex)
            {
                VAdvantage.Logging.VLogger.Get().Severe("ErrorToSaveUserSignature=>" + ex.Message);
                trx.Rollback();
                return "ERROR";
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Remove the logged in user's signature and initials together: both rows and both images, in one
        /// transaction, so either everything goes or nothing does. Only the rows of the logged in user are touched.
        /// </summary>
        /// <param name="ctx">Current context</param>
        /// <returns>"OK", "NOTFOUND" (nothing was saved) or "ERROR"</returns>
        public string DeleteUserSignatures(Ctx ctx)
        {
            Trx trx = Trx.GetTrx(Trx.CreateTrxName("VIS_DeleteUserSignature"));

            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT AD_UserSignature_ID, SignatureImage FROM AD_UserSignature
                    WHERE IsActive='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID() + " AND AD_User_ID=" + ctx.GetAD_User_ID() + @"
                    AND SignatureType IN ('" + MUserSignature.SIGNATURETYPE_Signature + "','" + MUserSignature.SIGNATURETYPE_Initials + "')", (SqlParameter[])null, trx);

                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                {
                    trx.Rollback();
                    return "NOTFOUND";
                }

                List<int> imageIDs = new List<int>();

                // the rows first - they point at the images
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    imageIDs.Add(Util.GetValueOfInt(ds.Tables[0].Rows[i]["SignatureImage"]));

                    MUserSignature row = new MUserSignature(ctx, Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_UserSignature_ID"]), trx);

                    if (!row.Delete(true, trx))
                    {
                        trx.Rollback();
                        return "ERROR";
                    }
                }

                for (int i = 0; i < imageIDs.Count; i++)
                {
                    DeleteSignatureImage(ctx, trx, imageIDs[i]);
                }

                trx.Commit();
                return "OK";
            }
            catch (Exception ex)
            {
                VAdvantage.Logging.VLogger.Get().Severe("ErrorToDeleteUserSignatures=>" + ex.Message);
                trx.Rollback();
                return "ERROR";
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>The user's current row of one type (newest first), or null when there is none.</summary>
        private MUserSignature GetUserSignatureRow(Ctx ctx, Trx trx, int userID, string signatureType)
        {
            DataSet ds = DB.ExecuteDataset(@"SELECT AD_UserSignature_ID FROM AD_UserSignature
                WHERE IsActive='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID() + " AND AD_User_ID=" + userID + @"
                AND SignatureType='" + signatureType + @"'
                ORDER BY Created DESC, AD_UserSignature_ID DESC", (SqlParameter[])null, trx);

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                return new MUserSignature(ctx, Util.GetValueOfInt(ds.Tables[0].Rows[0]["AD_UserSignature_ID"]), trx);
            }

            return null;
        }

        /// <summary>Change the text kept on a saved row (the full name of a signature, the initials of initials). Nothing is written when it is unchanged.</summary>
        private bool SetUserSignatureText(Trx trx, MUserSignature row, string text)
        {
            if (string.Equals(row.GetFullName(), text, StringComparison.Ordinal))
            {
                return true;
            }

            row.SetFullName(text);
            return row.Save(trx);
        }

        /// <summary>Store a new picture, and the text that goes with it, on a signature row (new or existing). The picture it replaces is queued for removal.</summary>
        private bool StoreUserSignature(Ctx ctx, Trx trx, MUserSignature row, byte[] png, string signatureType, int userID,
            string text, string email, string group, List<int> replacedImages)
        {
            int oldImageID = row.Get_ID() > 0 ? row.GetSignatureImage() : 0;

            int imageID = SaveSignatureImage(ctx, trx, png, signatureType + "_" + userID + "_" + DateTime.UtcNow.Ticks);

            if (imageID <= 0)
            {
                return false;
            }

            row.SetAD_User_ID(userID);
            row.SetEmail(email);
            row.SetFullName(text);
            row.SetSignatureType(signatureType);
            row.SetSignatureImage(imageID);
            row.SetSignatureGroup(group);
            row.SetIsDefault(true);
            if (!row.Save(trx))
            {
                return false;
            }

            if (oldImageID > 0)
            {
                replacedImages.Add(oldImageID);
            }

            return true;
        }

        /// <summary>Save PNG bytes as a new AD_Image, the same way DMS saves its signature images.</summary>
        private int SaveSignatureImage(Ctx ctx, Trx trx, byte[] png, string imageName)
        {
            MImage img = new MImage(ctx, 0, trx);
            img.ByteArray = png;
            img.ImageFormat = ".png";
            img.SetBinaryData(png);
            img.SetName(imageName);
            img.SetImageURL(string.Empty);

            if (!img.Save(trx))
            {
                return 0;
            }

            return img.GetAD_Image_ID();
        }

        /// <summary>Remove a picture that belonged to a signature row. A leftover picture is not worth failing the save over.</summary>
        private void DeleteSignatureImage(Ctx ctx, Trx trx, int imageID)
        {
            if (imageID <= 0)
            {
                return;
            }

            try
            {
                new MImage(ctx, imageID, trx).Delete(true, trx);
            }
            catch (Exception ex)
            {
                VAdvantage.Logging.VLogger.Get().Warning("UserSignature image " + imageID + " could not be removed=>" + ex.Message);
            }
        }

        /// <summary>The stored picture as a data URL (all pictures are saved as PNG), or empty when it has no data.</summary>
        private string GetSignatureImageDataUrl(Ctx ctx, int imageID)
        {
            if (imageID <= 0)
            {
                return string.Empty;
            }

            byte[] bytes = new MImage(ctx, imageID, null).GetBinaryData();

            return bytes == null || bytes.Length == 0 ? string.Empty : "data:image/png;base64," + Convert.ToBase64String(bytes);
        }

        /// <summary>
        /// Check an uploaded file and turn it into PNG bytes. The file is decoded, so a file that only carries
        /// an image extension is refused. GIF and BMP are accepted here and stored as PNG, because MImage
        /// itself only takes png / jpg / ico / webp / svg.
        /// </summary>
        /// <returns>null when the file is fine, otherwise TOOLARGE / BADTYPE / BADSIZE</returns>
        private string ConvertToPng(HttpPostedFileBase file, out byte[] png)
        {
            png = null;

            if (file.ContentLength > MaxSignatureFileSize)
            {
                return "TOOLARGE";
            }

            if (Array.IndexOf(SignatureFileExtensions, Path.GetExtension(file.FileName ?? string.Empty).ToLowerInvariant()) < 0)
            {
                return "BADTYPE";
            }

            try
            {
                using (MemoryStream input = new MemoryStream())
                {
                    file.InputStream.CopyTo(input);

                    if (input.Length > MaxSignatureFileSize)
                    {
                        return "TOOLARGE";
                    }

                    input.Position = 0;

                    using (System.Drawing.Image image = System.Drawing.Image.FromStream(input, false, true))
                    {
                        Guid format = image.RawFormat.Guid;

                        if (format != System.Drawing.Imaging.ImageFormat.Png.Guid && format != System.Drawing.Imaging.ImageFormat.Jpeg.Guid
                            && format != System.Drawing.Imaging.ImageFormat.Gif.Guid && format != System.Drawing.Imaging.ImageFormat.Bmp.Guid)
                        {
                            return "BADTYPE";
                        }

                        if (image.Width > MaxSignatureImageSide || image.Height > MaxSignatureImageSide)
                        {
                            return "BADSIZE";
                        }

                        // a copy of the first frame, so an animated GIF becomes a still picture
                        using (System.Drawing.Bitmap bitmap = new System.Drawing.Bitmap(image))
                        using (MemoryStream output = new MemoryStream())
                        {
                            bitmap.Save(output, System.Drawing.Imaging.ImageFormat.Png);
                            png = output.ToArray();
                        }
                    }
                }

                return null;
            }
            catch (Exception)
            {
                // not an image GDI+ can read
                return "BADTYPE";
            }
        }

        #endregion

    }

    /// <summary>One saved picture of the My Sign tab</summary>
    public class UserSignatureItem
    {
        public int ID { get; set; }
        /// <summary>The picture as a data URL</summary>
        public string Image { get; set; }
    }

    /// <summary>What the My Sign tab shows: the name and initials with the saved signature / initials</summary>
    public class UserSignatureData
    {
        /// <summary>Name saved with the signature, or the user's own name until one is saved</summary>
        public string FullName { get; set; }
        /// <summary>Initials saved with the initials image; null until one is saved</summary>
        public string InitialsText { get; set; }
        public UserSignatureItem Signature { get; set; }
        public UserSignatureItem Initials { get; set; }
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