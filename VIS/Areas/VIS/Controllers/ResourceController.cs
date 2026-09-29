using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using VAdvantage.Classes;
using VAdvantage.Login;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Classes;

namespace VIS.Controllers
{
    public class ResourceController : Controller
    {

        /// <summary>
        /// return javascript file containing application start up  data 
        /// - translated message object
        /// - role object
        /// - context of app
        /// - constant 
        /// -
        /// </summary>
        /// <returns>javascript file result </returns>

        [OutputCache(NoStore = true, Duration = 0, VaryByParam = "*")]
        public JavaScriptResult Application()
        {
            //var s = Codec.DecryptStringAES();
            StringBuilder sb = new StringBuilder();

            Ctx ctx = Session["ctx"] as Ctx;


            if (ctx == null) // handle null value , sometime session is expired
            {
                sb.Append("; window.location.reload();");
            }
            else
            {
                if (ctx.GetSecureKey() == "")
                    ctx.SetSecureKey(SecureEngineBridge.GetRandomKey());

                //  ctx.SetApplicationUrl(@Url.Content("~/"));
                ctx.SetIsSSL(Request.Url.Scheme == Uri.UriSchemeHttps);

                //lakhwinder
                string fullUrl = Request.Url.AbsoluteUri.Remove(Request.Url.AbsoluteUri.LastIndexOf('/'));
                //fullUrl = fullUrl.Remove(fullUrl.LastIndexOf('/'));
                //fullUrl = fullUrl.Remove(fullUrl.LastIndexOf('/'));
                fullUrl = fullUrl.Remove(fullUrl.IndexOf("VIS/Resource"));
                ctx.SetApplicationUrl(fullUrl);
                ctx.SetContextUrl(@Url.Content("~/"));

                SecureEngine.Encrypt("a");
                //var sbLogin = new  StringBuilder();
                //var stLogin = new Stopwatch();
                //stLogin.Start();

                sb.Append("; var VIS = {");
                sb.Append("Application: {contextUrl:'").Append(@Url.Content("~/")).Append("',").Append(" contextFullUrl:'").Append(fullUrl).Append("',")
                         .Append("isMobile:").Append(Request.Browser.IsMobileDevice ? "1" : "0")
                         .Append(", isRTL:").Append(ctx.GetIsRightToLeft() ? "1" : "0")
                         .Append(", isBasicDB:").Append(ctx.GetIsBasicDB() ? "1" : "0")
                         .Append(", isSSL:").Append((Request.Url.Scheme != Uri.UriSchemeHttps ? "0" : "1")) //TODO
                         .Append(", theme:").Append("'").Append(GetThemeInfo(ctx)).Append("'") //TODO
                         .Append("},");

                sb.Append("I18N: { }, context: { }");
                sb.Append("};");

                sb.Append("VIS.Consts={");
                /* Table */
                sb.Append("'ACCESSLEVEL_Organization' : '1','ACCESSLEVEL_ClientOnly' : '2','ACCESSLEVEL_ClientPlusOrganization' : '3' ,'ACCESSLEVEL_SystemOnly' : '4'");
                sb.Append(", 'ACCESSLEVEL_SystemPlusClient' : '6','ACCESSLEVEL_All' : '7'");
                sb.Append(", 'ACCESSTYPERULE_Accessing' : 'A', 'ACCESSTYPERULE_Exporting' : 'E' , 'ACCESSTYPERULE_Reporting' : 'R'");
                sb.Append("};");

                /* USER */
                sb.Append(" VIS.MUser = {");
                sb.Append("'isAdministrator':'" + MUser.Get(ctx).IsAdministrator() + "', 'isUserEmployee':'" + MUser.GetIsEmployee(ctx, ctx.GetAD_User_ID()) + "' }; ");

                /* ROLE */
                sb.Append(" VIS.MRole =  {");
                sb.Append(" 'vo' : " + Newtonsoft.Json.JsonConvert.SerializeObject(VIS.Helpers.RoleHelper.GetRole(VAdvantage.Model.MRole.GetDefault(ctx, false))) + " , ");
                sb.Append(" 'SQL_RW' : true, 'SQL_RO' : false, 'SQL_FULLYQUALIFIED' : true, 'SQL_NOTQUALIFIED' : false,'SUPERUSER_USER_ID' : 100, 'SYSTEM_USER_ID' : 0 ");
                sb.Append(", 'PREFERENCETYPE_Client':'C', 'PREFERENCETYPE_None':'N', 'PREFERENCETYPE_Organization':'O', 'PREFERENCETYPE_User':'U','isAdministrator':" + (VAdvantage.Model.MRole.GetDefault(ctx, false).IsAdministrator() ? "1" : "0").ToString() + "");

                sb.Append(", columnSynonym : { 'AD_User_ID': 'SalesRep_ID','C_ElementValue_ID':'Account_ID'}");
                sb.Append("};");


                /* CTX */
                SetLoginContext(ctx);
                // VIS0008 Setting other values into Context
                SetOtherContext(ctx);


                sb.Append(" VIS.context.ctx = ").Append(Newtonsoft.Json.JsonConvert.SerializeObject(ctx.GetMap())).Append("; ");

                /* Message
                 * AD_Message texts are served by Messages() (cacheable, loaded right after this script);
                 * only the per-session labels stay here.
                 * purpose: right window action translation with search key
                 * VIS0228      08-Aug-2021
                 */
                var refLabels = new Dictionary<string, string>();
                foreach (ValueNamePair pair in MRefList.GetList(435, false, ctx))
                    refLabels[pair.GetValue()] = pair.GetName();
                sb.Append(" VIS.I18N.labels = ").Append(ToScriptJson(refLabels)).Append(";");

                // sb.Append(" console.log(VIS.I18N.labels)");
                //return View();
                //System.Web.Optimization.JsMinify d = new System.Web.Optimization.JsMinify();
                //d.Process(


                //Update Login Time

                var r = new ResourceManager(fullUrl, ctx.GetAD_Client_ID());
                r.RunAsync();
                r = null;

                //sbLogin.Append("/n").Append("complete =>" + stLogin.Elapsed);
                //stLogin.Stop();
                //ModelLibrary.PushNotif.SSEManager.Get().AddMessage(ctx.GetAD_Session_ID(), sbLogin.ToString());
            }

            return JavaScript(sb.ToString());
        }

        /// <summary>
        /// AD_Message texts of the session language as a script that fills VIS.I18N.labels (loaded right
        /// after Application()). Messages change rarely, so unlike Application() the browser caches this:
        /// the page references it with the content hash (MessagesVersion) and new texts mean a new URL.
        /// A request for any other hash (texts changed after the page was rendered) is not cached.
        /// </summary>
        /// <param name="lang">language of the page, part of the URL only</param>
        /// <param name="v">content hash of the texts the page expects</param>
        public ActionResult Messages(string lang, string v)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            if (ctx == null)
            {
                // session expired: Application() reloads the page
                Response.Cache.SetCacheability(HttpCacheability.NoCache);
                Response.Cache.SetNoStore();
                return JavaScript("");
            }

            MessagesScript script = GetMessagesScript(ctx.GetAD_Language());
            if (v == script.Version)
            {
                Response.Cache.SetCacheability(HttpCacheability.Private);
                Response.Cache.SetMaxAge(TimeSpan.FromDays(365));
                Response.Cache.AppendCacheExtension("immutable");
            }
            else
            {
                Response.Cache.SetCacheability(HttpCacheability.NoCache);
                Response.Cache.SetNoStore();
            }

            Response.AppendHeader("Vary", "Accept-Encoding");
            string acceptEncoding = Request.Headers["Accept-Encoding"] ?? "";
            if (acceptEncoding.IndexOf("gzip", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                Response.AppendHeader("Content-Encoding", "gzip");
                return File(script.Gzip, "application/javascript; charset=utf-8");
            }
            return File(script.Bytes, "application/javascript; charset=utf-8");
        }

        /// <summary>Content hash of the session language's messages, for the Messages() URL.</summary>
        public static string MessagesVersion(string AD_Language)
        {
            return GetMessagesScript(AD_Language).Version;
        }

        /// <summary>Messages() script of one language, built from one load of the server message map.</summary>
        private sealed class MessagesScript
        {
            /// <summary>The Msg map it was built from; a reload of the map (120 minute expiry, cache reset) is a new object.</summary>
            public object Source;
            public byte[] Bytes;
            public byte[] Gzip;
            public string Version;
        }

        private static readonly ConcurrentDictionary<string, MessagesScript> _messagesScripts = new ConcurrentDictionary<string, MessagesScript>();

        /// <summary>
        /// Script for the language, rebuilt only when Msg has reloaded its map. The version is a hash of
        /// the content, so a reload that brings no new texts keeps the browser's cached copy valid.
        /// </summary>
        private static MessagesScript GetMessagesScript(string AD_Language)
        {
            string lang = AD_Language ?? "";
            CCache<string, string> msgs = Msg.Get().GetMsgMap(lang);
            MessagesScript cached;
            if (_messagesScripts.TryGetValue(lang, out cached) && ReferenceEquals(cached.Source, msgs))
                return cached;

            var labels = new Dictionary<string, string>();
            if (msgs != null)
            {
                foreach (string key in msgs.Keys)
                {
                    // single line, double quotes as single: labels are also placed into HTML attributes
                    string msg = (string)msgs.Get(key) ?? "";
                    labels[key] = msg.Replace("\n", " ").Replace("\r", " ").Replace("\"", "'");
                }
            }

            // keys already set by Application() (window action translations) take precedence
            string script = "(function (labels, msgs) { for (var k in msgs) { if (msgs.hasOwnProperty(k) && !labels.hasOwnProperty(k)) labels[k] = msgs[k]; } })"
                + "(VIS.I18N.labels = VIS.I18N.labels || {}, " + ToScriptJson(labels) + ");";

            var built = new MessagesScript() { Source = msgs, Bytes = Encoding.UTF8.GetBytes(script) };
            using (var sha = SHA1.Create())
                built.Version = BitConverter.ToString(sha.ComputeHash(built.Bytes)).Replace("-", "").Substring(0, 12).ToLowerInvariant();
            using (var output = new MemoryStream())
            {
                using (var gzip = new GZipStream(output, CompressionLevel.Optimal))
                    gzip.Write(built.Bytes, 0, built.Bytes.Length);
                built.Gzip = output.ToArray();
            }
            _messagesScripts[lang] = built;
            return built;
        }

        /// <summary>
        /// Labels as a JavaScript object literal: JSON escaping (backslashes, quotes, control characters)
        /// plus the line / paragraph separators that older browsers do not accept inside string literals.
        /// </summary>
        private static string ToScriptJson(Dictionary<string, string> labels)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(labels)
                .Replace("\u2028", "\\u2028").Replace("\u2029", "\\u2029");
        }

        /// <summary>
        /// Load User Preference into Context
        /// </summary>
        /// <param name="_ctx"> application context </param>
        internal void SetLoginContext(Ctx _ctx)
        {
            VAdvantage.Login.LoginProcess process = new VAdvantage.Login.LoginProcess(_ctx);

            if (VAdvantage.Model.MUser.IsSalesRep(_ctx.GetAD_User_ID()))
                _ctx.SetContext("#SalesRep_ID", _ctx.GetAD_User_ID());
            if (_ctx.GetAD_Role_ID() == 0)	//	User is a Sys Admin
                _ctx.SetContext("#SysAdmin", "Y");

            _ctx.SetContext("#IsAdmin", VAdvantage.Model.MRole.GetDefault(_ctx, false).IsAdministrator() ? "Y" : "N");

            // m_ctx.SetContext("#User_Level", dr[0].ToString());  
            _ctx.SetContext("#OrgCountryCode", GetOrgCountryCode(_ctx.GetAD_Org_ID()));
            process.LoadPreferences(_ctx.GetContext("#Date"), "");


            //return JsonHelper.Serialize(_ctx.GetMap());
        }

        /// <summary>
        /// Load Other Preferences into Context
        /// </summary>
        /// <param name="_ctx"> application context </param>
        internal void SetOtherContext(Ctx _ctx)
        {
            // Fetched DMS form id and set into context
            int AD_Form_ID = Util.GetValueOfInt(VAdvantage.DataBase.DB.ExecuteScalar("SELECT AD_Form_ID FROM AD_Form WHERE Name = 'VADMS_DMSWeb' AND IsActive = 'Y'"));
            _ctx.SetContext("DMS_Form_ID", AD_Form_ID);
        }

        /// <summary>
        /// Get country code from organization
        /// </summary>
        /// <param name="orgID"></param>
        /// <returns>country code</returns>

        public string GetOrgCountryCode(int orgID)
        {
            string sql =@"SELECT CN.COUNTRYCODE FROM AD_OrgInfo OG INNER JOIN c_location LC ON (LC.C_LOCATION_ID=OG.C_LOCATION_ID)"
                           +" INNER JOIN C_COUNTRY CN ON(LC.C_COUNTRY_ID = CN.C_COUNTRY_ID) WHERE OG.AD_ORG_ID = " + orgID + " AND OG.ISACTIVE = 'Y'";
            string CountryCode = Util.GetValueOfString(VAdvantage.DataBase.DB.ExecuteScalar(sql));
            return CountryCode;
        }

        public string GetThemeInfo(Ctx _ctx)
        {
            string thms = "";

            //1 first user and client 

            string qry = "SELECT COALESCE(u.AD_Theme_ID,c.AD_Theme_ID) FROM AD_User u INNER JOIN AD_Client c ON c.AD_Client_ID = u.AD_Client_ID " +
                         " WHERE u.AD_User_ID =" + _ctx.GetAD_User_ID();

            int id = Util.GetValueOfInt(DBase.DB.ExecuteScalar(qry, null, null));

            if (id < 1)
            {
                //2 get System default
                id = Util.GetValueOfInt(DBase.DB.ExecuteScalar("SELECT AD_Theme_ID FROM AD_Theme WHERE IsDefault = 'Y' ORDER By Updated DESC", null, null));
            }

            if (id > 0)
            {
                System.Data.DataSet ds = DBase.DB.ExecuteDataset("SELECT SecondaryColor, OnSecondaryColor, PrimaryColor, OnPrimaryColor " +
                                                        " FROM AD_Theme WHERE AD_Theme_ID = " + id, null);

                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    thms = ds.Tables[0].Rows[0]["PrimaryColor"] + "|" + ds.Tables[0].Rows[0]["OnPrimaryColor"] + "|" + ds.Tables[0].Rows[0]["SecondaryColor"]
                        + "|" + ds.Tables[0].Rows[0]["OnSecondaryColor"];
                }

            }
            return thms;
        }


    }

    public class ResourceManager
    {
        string _url = "";
        int _AD_Client_ID = 0;
        Thread _thread = null;

        public ResourceManager(string url, int AD_Client_ID)
        {
            _url = url;
            _AD_Client_ID = AD_Client_ID;
        }


        public void RunAsync()
        {
            _thread = new Thread(new ThreadStart(Init));
            _thread.Start();
        }

        private void Init()
        {
            try
            {
                UpdateLoginTime(_AD_Client_ID, _url, VAdvantage.DataBase.GlobalVariable.TO_DATE(DateTime.Now, false));
            }
            catch
            {
            }
            _url = "";
            _thread = null;
        }

        public string UpdateLoginTime(int AD_Client_ID, String url, string loginTime)
        {
            var client = VAdvantage.Classes.ServerEndPoint.GetCloudClient();
            string retStr = "";
            string key = VAdvantage.Classes.ServerEndPoint.GetAccesskey();

            if (client != null)
            {
                try
                {
                    System.Net.ServicePointManager.Expect100Continue = false;
                    retStr = client.SetLastLogin(AD_Client_ID, url, loginTime, key);
                    VAdvantage.Logging.VLogger.Get().Info("Update Login =>" + retStr);
                    client.Close();
                }
                catch
                {
                    client.Close();
                }
            }
            return retStr;
        }
    }


}
