using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web;
using Microsoft.Owin.Security;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Helpers
{
    /// <summary>
    /// Authentication for the REST endpoints (api/...). They have no browser session and no
    /// login screen, so the credentials come with every call, as HTTP Basic, and are checked
    /// by LoginHelper.Login - the check the login screen runs. Lock-out after failed attempts,
    /// LDAP, the user's IP restriction, non login users and expired passwords therefore apply
    /// exactly as they do there. Two factor authentication does not: the API takes no one
    /// time password, and the password alone is enough, also for a user who has a second
    /// factor on the login screen.
    /// </summary>
    public static class ApiAuthHelper
    {
        /// <summary>Realm named in the WWW-Authenticate header of a 401</summary>
        public const string REALM = "VIENNA Advantage";

        /// <summary>
        /// Outcome of Authenticate. On failure StatusCode and Error (an AD_Message key) say why.
        /// </summary>
        public class ApiAuthResult
        {
            public bool IsAuthenticated { get; set; }
            public HttpStatusCode StatusCode { get; set; }
            public string Error { get; set; }

            /// <summary>Login state of the user - AD_User_ID, value, name</summary>
            public LoginModel Model { get; set; }

            /// <summary>Active roles of the user, as the login screen lists them</summary>
            public List<KeyNamePair> Roles { get; set; }
        }

        /// <summary>
        /// Checks the credentials of the call.
        /// </summary>
        /// <param name="request">the API request - Authorization: Basic base64(user:password)</param>
        public static ApiAuthResult Authenticate(HttpRequestMessage request)
        {
            string userValue;
            string password;
            if (!TryGetBasicCredentials(request, out userValue, out password))
            {
                return Fail(HttpStatusCode.Unauthorized, "UserPwdError");
            }

            //  the login screen does the same before its first query
            DBConn.SetConnectionString();

            LoginModel model = new LoginModel();
            model.Login1Model = new Login1Model();
            model.Login1Model.UserValue = userValue;
            model.Login1Model.Password = password;
            /* Set up front so Login skips the AD_LoginSetting lookup - that is the login
               screen's remembered role/org, of no use here, and the call picks its own. */
            model.Login2Model = new Login2Model();

            List<KeyNamePair> roles = null;
            try
            {
                /* No OTP push to the VA Mobile App - the API takes no one time password,
                   so the user would get a code on the phone that nothing can use. */
                if (!LoginHelper.Login(model, out roles, GetClientIP(), false, false))
                {
                    return Fail(HttpStatusCode.Unauthorized, "UserPwdError");
                }
            }
            catch (Exception ex)
            {
                string key = ex.Message;
                if (key == "MaxFailedLoginAttempts" || key == "AccessNotGranted" || key == "RoleNotDefined")
                {
                    return Fail(HttpStatusCode.Forbidden, key);
                }
                /* UserNotFound / NotLoginUser / UserPwdError, an LDAP refusal, anything
                   else - reported as wrong credentials, so a caller cannot tell which user
                   names exist. The actual reason goes to the log. */
                VLogger.Get().Log(Level.WARNING, "API login refused for '" + userValue + "' - " + key);
                return Fail(HttpStatusCode.Unauthorized, "UserPwdError");
            }

            //  the login screen would make the user set a new password first
            if (model.Login1Model.ResetPwd)
            {
                return Fail(HttpStatusCode.Forbidden, "PasswordExpired");
            }

            /* No 2FA check on purpose: the login screen would ask for a one time password
               here (AD_User.TwoFAMethod set), the API takes none and lets the password do. */

            //  never kept around - the context is built from the user id, not the password
            model.Login1Model.Password = null;

            return new ApiAuthResult()
            {
                IsAuthenticated = true,
                StatusCode = HttpStatusCode.OK,
                Model = model,
                Roles = roles ?? new List<KeyNamePair>()
            };
        }

        /// <summary>
        /// Builds the context an API call runs under - what the home page puts together after
        /// the login screen, minus the menu and the browser parts. Creates an AD_Session, so
        /// the work is logged against a session like any other; EndContext closes it.
        /// </summary>
        /// <param name="model">login state from Authenticate</param>
        /// <param name="AD_Role_ID">role the call acts as - already checked by the caller</param>
        /// <param name="language">login language, empty for the base language</param>
        public static Ctx CreateContext(LoginModel model, int AD_Role_ID, string roleName, int AD_Client_ID, int AD_Org_ID,
            string language, HttpRequestMessage request)
        {
            model.Login1Model.LoginLanguage = String.IsNullOrWhiteSpace(language) ? Env.GetBaseAD_Language() : language.Trim();

            model.Login2Model = new Login2Model();
            model.Login2Model.Role = AD_Role_ID.ToString();
            model.Login2Model.RoleName = roleName;
            model.Login2Model.Client = AD_Client_ID.ToString();
            model.Login2Model.ClientName = Util.GetValueOfString(DB.ExecuteScalar("SELECT Name FROM AD_Client WHERE AD_Client_ID=" + AD_Client_ID));
            model.Login2Model.Org = AD_Org_ID.ToString();
            model.Login2Model.OrgName = Util.GetValueOfString(DB.ExecuteScalar("SELECT Name FROM AD_Org WHERE AD_Org_ID=" + AD_Org_ID));
            model.Login2Model.Warehouse = "0";
            model.Login2Model.WarehouseName = "";
            model.Login2Model.FilteredOrg = "";

            //  same map the login screen keeps in the auth cookie
            LoginContext lCtx = LoginHelper.GetLoginContext(model);
            Ctx ctx = new Ctx(lCtx.ctxMap);

            //  as HomeController.Index - a language that is not installed falls back to the base one
            VAdvantage.Login.Language l = VAdvantage.Login.Language.GetLanguage(ctx.GetAD_Language());
            l = VAdvantage.Utility.Env.VerifyLanguage(ctx, l);
            ctx.SetContext(VAdvantage.Utility.Env.LANGUAGE, l.GetAD_Language());
            ctx.SetContext(VAdvantage.Utility.Env.ISRIGHTTOLEFT, VAdvantage.Utility.Env.IsRightToLeft(l.GetAD_Language()) ? "Y" : "N");
            new VAdvantage.Login.LoginProcess(ctx).LoadSysConfig();
            LoginHelper.SetSysConfigInContext(ctx);

            /* The application URL is normally set by the Resource controller when the
               browser loads the scripts. Work that outlives the request (the module install
               of the tenant setup) has no request left to work it out from. */
            string contextUrl = VirtualPathUtility.ToAbsolute("~/");
            ctx.SetApplicationUrl(request.RequestUri.GetLeftPart(UriPartial.Authority) + contextUrl);
            ctx.SetContextUrl(contextUrl);
            ctx.SetIsSSL(request.RequestUri.Scheme == Uri.UriSchemeHttps);

            /* AD_Session wants a web session id - an API call has none, so it gets its own,
               marked API so these sessions can be told apart. Same length as an ASP.NET one. */
            string webSessionID = "API" + Guid.NewGuid().ToString("N").Substring(0, 21);
            MSession session = MSession.Get(ctx, webSessionID, true, GetClientIP());
            ctx.SetAD_Session_ID(session.GetAD_Session_ID());
            ctx.SetContext("#AD_Session_GUID", DB.GetRecordGUID("AD_Session", session.GetAD_Session_ID()));
            return ctx;
        }

        /// <summary>
        /// Closes the AD_Session CreateContext opened.
        /// </summary>
        public static void EndContext(Ctx ctx)
        {
            if (ctx == null || ctx.GetAD_Session_ID() <= 0)
                return;
            SessionEventHandler.SessionEnd(ctx, null);
        }

        /// <summary>
        /// Makes a 401 reach the caller as a 401 - call it when answering with one. The cookie
        /// and OpenID Connect middleware are active, so without this they turn any 401 into a
        /// redirect to the login page (or to the identity provider) - no use to an API client.
        /// A challenge naming another authentication type is one none of them responds to.
        /// Set directly rather than through Challenge(), which would also force the status.
        /// </summary>
        public static void SuppressLoginRedirect()
        {
            try
            {
                if (HttpContext.Current != null)
                {
                    HttpContext.Current.GetOwinContext().Authentication.AuthenticationResponseChallenge =
                        new AuthenticationResponseChallenge(new string[] { "Basic" }, new AuthenticationProperties());
                }
            }
            catch (Exception ex)
            {
                //  no OWIN context - nothing would redirect then either
                VLogger.Get().Log(Level.FINE, "No OWIN context to suppress the login redirect - " + ex.Message);
            }
        }

        /// <summary>
        /// Message for a key, in the given language. Falls back to the text given when the
        /// key has no AD_Message - Msg answers with the key itself then.
        /// </summary>
        public static string GetMessage(string AD_Language, string key, string fallback)
        {
            string text = null;
            try
            {
                text = Msg.GetMsg(String.IsNullOrWhiteSpace(AD_Language) ? Env.GetBaseAD_Language() : AD_Language, key);
            }
            catch (Exception)
            {
                //  the fallback below
            }
            if (String.IsNullOrEmpty(text) || text == key)
                return String.IsNullOrEmpty(fallback) ? key : fallback;
            return text;
        }

        /// <summary>Address of the caller, as the login screen takes it</summary>
        private static string GetClientIP()
        {
            if (HttpContext.Current == null)
                return "";
            return VAdvantage.Common.Common.GetVisitorIPAddress(new HttpRequestWrapper(HttpContext.Current.Request), false);
        }

        /// <summary>
        /// User and password from "Authorization: Basic base64(user:password)". The password
        /// may itself contain ':' - only the first one separates.
        /// </summary>
        private static bool TryGetBasicCredentials(HttpRequestMessage request, out string userValue, out string password)
        {
            userValue = null;
            password = null;

            AuthenticationHeaderValue auth = request.Headers.Authorization;
            if (auth == null || !String.Equals(auth.Scheme, "Basic", StringComparison.OrdinalIgnoreCase)
                || String.IsNullOrEmpty(auth.Parameter))
            {
                return false;
            }

            string decoded;
            try
            {
                decoded = Encoding.UTF8.GetString(Convert.FromBase64String(auth.Parameter.Trim()));
            }
            catch (FormatException)
            {
                return false;
            }

            int sep = decoded.IndexOf(':');
            if (sep <= 0)
            {
                return false;
            }
            userValue = decoded.Substring(0, sep);
            password = decoded.Substring(sep + 1);
            return !String.IsNullOrEmpty(password);
        }

        private static ApiAuthResult Fail(HttpStatusCode status, string error)
        {
            return new ApiAuthResult() { IsAuthenticated = false, StatusCode = status, Error = error };
        }
    }
}
