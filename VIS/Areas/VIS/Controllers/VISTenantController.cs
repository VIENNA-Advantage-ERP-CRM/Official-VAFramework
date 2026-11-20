using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using Newtonsoft.Json;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Helpers;
using VIS.Models;

namespace VIS.Controllers
{
    /// <summary>
    /// REST API for tenant creation - what the Initial Tenant Setup screen does, without the
    /// screen.
    ///
    ///   POST api/VISTenant/CreateTenant
    ///   Authorization: Basic base64(user:password)
    ///   Content-Type: application/json
    ///   body: CreateTenantRequest
    ///
    /// Authentication: the user's credentials, checked as the login screen checks them (see
    /// ApiAuthHelper) - except two factor authentication: there is no one time password, the
    /// password alone is enough. Authorization: the user needs a System role (AD_Client_ID = 0) that has
    /// access to the Initial Tenant Setup form - the same people who can open the screen.
    /// The tenant is then created by VSetupModel.InitailizeClientSetup, the method behind
    /// VSetupController.InitailizeClientSetup.
    ///
    /// Named VISTenant rather than Tenant: Web API picks controllers by name across every
    /// loaded assembly, and a module with a TenantController would make both unreachable.
    /// </summary>
    public class VISTenantController : ApiController
    {
        /// <summary>
        /// Creates a tenant.
        /// </summary>
        /// <returns>
        /// 200 - created, Tenant holds the tenant, its admin user and password.
        /// 400 - a field is missing or wrong (Error says which).
        /// 401 - no or wrong credentials.
        /// 403 - authenticated, but not allowed: no System role with access to the setup form,
        ///       account locked, IP not allowed, password expired.
        /// 409 - a tenant with that name exists.
        /// 500 - creation failed or stopped part way; Tenant.Log has the reason.
        /// </returns>
        [HttpPost]
        [AllowAnonymous]    //  the credentials are checked below, per call - there is no login cookie
        public HttpResponseMessage CreateTenant([FromBody] CreateTenantRequest request)
        {
            string language = request == null ? null : request.Language;

            //  Authentication
            ApiAuthHelper.ApiAuthResult auth = ApiAuthHelper.Authenticate(Request);
            if (!auth.IsAuthenticated)
            {
                return Fail(auth.StatusCode, auth.Error, language);
            }

            int AD_User_ID = auth.Model.Login1Model.AD_User_ID;
            string userValue = auth.Model.Login1Model.UserValue;

            //  Authorization
            KeyNamePair role = GetTenantSetupRole(AD_User_ID, auth.Roles, request == null ? 0 : request.RoleID);
            if (role == null)
            {
                VLogger.Get().Log(Level.WARNING, "Tenant API refused for '" + userValue + "' - no System role with Initial Tenant Setup access"
                    + (request != null && request.RoleID > 0 ? " (RoleID=" + request.RoleID + ")" : ""));
                return Fail(HttpStatusCode.Forbidden, "TenantSetupNotAllowed", language);
            }

            //  Request
            if (request == null)
            {
                return Fail(HttpStatusCode.BadRequest, "InvalidRequest", language);
            }
            string error = ValidateRequest(request);
            if (error != null)
            {
                return Fail(HttpStatusCode.BadRequest, error, language);
            }

            VSetupModel setup = new VSetupModel();
            if (!setup.IsTenantNameAvailable(request.ClientName))
            {
                return Fail(HttpStatusCode.Conflict, "VIS_TenantNameExists", language);
            }

            Ctx ctx = null;
            TenantInfo tInfo = null;
            try
            {
                //  System tenant, * organization - where the setup screen runs
                ctx = ApiAuthHelper.CreateContext(auth.Model, role.GetKey(), role.GetName(), 0, 0, language, Request);

                VLogger.Get().SaveInfo("Tenant API", "Tenant creation requested by " + userValue + " (Role=" + role.GetName()
                    + ") - Name=" + request.ClientName + ", Org=" + request.OrgName + ", UserClient=" + request.UserClient);

                string selectedPackage = request.SelectedPackage == null ? null : JsonConvert.SerializeObject(request.SelectedPackage);

                //  fileName / folderKey: the accounting file upload moved to FRPT, the model ignores them
                tInfo = setup.InitailizeClientSetup(request.ClientName.Trim(), request.OrgName.Trim(), request.UserClient.Trim(),
                    request.UserOrg == null ? "" : request.UserOrg.Trim(), request.City.Trim(),
                    request.CurrencyID, request.CurrencyName, request.CountryID, request.CountryName, request.RegionID, request.RegionName,
                    request.CfProduct, request.CfBPartner, request.CfProject, request.CfMCampaign, request.CfSRegion,
                    null, null, selectedPackage, ctx);
            }
            catch (Exception ex)
            {
                VLogger.Get().Log(Level.SEVERE, "Tenant API - creation failed for " + request.ClientName, ex);
                return Respond(HttpStatusCode.InternalServerError, new CreateTenantResponse()
                {
                    Success = false,
                    Error = "ErrorCreatingTenant",
                    Message = ex.Message,
                    Tenant = tInfo
                });
            }
            finally
            {
                /* The session stays open while modules are being installed: the install
                   runs after this response, and Market is called with the session's GUID. */
                if (tInfo == null || String.IsNullOrEmpty(tInfo.LogKey))
                {
                    ApiAuthHelper.EndContext(ctx);
                }
            }

            /* InitailizeClientSetup reports failures in Log, not by throwing - the setup
               screen goes by Log alone too */
            if (tInfo == null || !String.IsNullOrWhiteSpace(tInfo.Log))
            {
                string log = tInfo == null ? null : tInfo.Log;
                VLogger.Get().Log(Level.SEVERE, "Tenant API - creation failed for " + request.ClientName + " - " + log);
                return Respond(HttpStatusCode.InternalServerError, new CreateTenantResponse()
                {
                    Success = false,
                    Error = "ErrorCreatingTenant",
                    Message = String.IsNullOrEmpty(log) ? ApiAuthHelper.GetMessage(language, "ErrorCreatingTenant", "Error creating tenant") : log,
                    Tenant = tInfo
                });
            }

            return Respond(HttpStatusCode.OK, new CreateTenantResponse() { Success = true, Tenant = tInfo });
        }

        /// <summary>
        /// The System role the call acts as: one of the user's active roles, in the System
        /// tenant, with access to the Initial Tenant Setup form.
        /// </summary>
        /// <param name="loginRoles">the roles the login check let through</param>
        /// <param name="requestedRoleID">role asked for, 0 = the first that qualifies</param>
        /// <returns>null when the user has no such role, or the one asked for is not one</returns>
        private KeyNamePair GetTenantSetupRole(int AD_User_ID, List<KeyNamePair> loginRoles, int requestedRoleID)
        {
            /* The form is found by class name - its ID differs between installations. The
               menu opens it through AD_Form_Access, so that is what decides here too. */
            string sql = "SELECT r.AD_Role_ID, r.Name FROM AD_Role r"
                + " WHERE r.IsActive='Y' AND r.AD_Client_ID=0"
                + " AND EXISTS (SELECT * FROM AD_User_Roles ur WHERE ur.AD_Role_ID=r.AD_Role_ID AND ur.AD_User_ID=@userID AND ur.IsActive='Y')"
                + " AND EXISTS (SELECT * FROM AD_Form_Access fa INNER JOIN AD_Form f ON (f.AD_Form_ID=fa.AD_Form_ID)"
                + " WHERE fa.AD_Role_ID=r.AD_Role_ID AND fa.IsActive='Y' AND f.IsActive='Y'"
                + " AND (UPPER(f.ClassName)='VSETUP' OR UPPER(f.ClassName) LIKE '%.VSETUP'))"
                + " ORDER BY r.Name";
            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@userID", AD_User_ID);

            List<KeyNamePair> allowed = new List<KeyNamePair>();
            System.Data.DataSet ds = DB.ExecuteDataset(sql, param);
            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (System.Data.DataRow dr in ds.Tables[0].Rows)
                {
                    int AD_Role_ID = Util.GetValueOfInt(dr[0]);
                    //  and the login check must have let it through (active tenant, user level)
                    if (loginRoles.Any(r => r.GetKey() == AD_Role_ID))
                    {
                        allowed.Add(new KeyNamePair(AD_Role_ID, Util.GetValueOfString(dr[1])));
                    }
                }
            }

            if (requestedRoleID > 0)
            {
                return allowed.FirstOrDefault(r => r.GetKey() == requestedRoleID);
            }
            return allowed.FirstOrDefault();
        }

        /// <summary>
        /// The checks the setup screen makes before it posts, with the same message keys.
        /// Fills in the currency, country and region names when they were left out.
        /// </summary>
        /// <returns>message key of the first problem, null when the request is fine</returns>
        private string ValidateRequest(CreateTenantRequest request)
        {
            if (String.IsNullOrWhiteSpace(request.ClientName))
                return "FillTenantName";
            if (String.IsNullOrWhiteSpace(request.OrgName))
                return "FillOrgName";
            if (String.IsNullOrWhiteSpace(request.UserClient))
                return "FillUserClient";
            if (String.IsNullOrWhiteSpace(request.City))
                return "FillCity";
            if (!String.IsNullOrWhiteSpace(request.UserOrg)
                && String.Equals(request.UserClient.Trim(), request.UserOrg.Trim(), StringComparison.Ordinal))
                return "UsernameMustBeDifferent";

            //  Currency
            if (request.CurrencyID <= 0)
                return "FillCurrency";
            string name = Util.GetValueOfString(DB.ExecuteScalar(
                "SELECT Description FROM C_Currency WHERE IsActive='Y' AND C_Currency_ID=" + request.CurrencyID));
            if (String.IsNullOrEmpty(name))
            {
                //  Description is optional on C_Currency - the record may still be there
                if (Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(*) FROM C_Currency WHERE IsActive='Y' AND C_Currency_ID=" + request.CurrencyID)) == 0)
                    return "FillCurrency";
                name = Util.GetValueOfString(DB.ExecuteScalar("SELECT ISO_Code FROM C_Currency WHERE C_Currency_ID=" + request.CurrencyID));
            }
            if (String.IsNullOrWhiteSpace(request.CurrencyName))
                request.CurrencyName = name;

            //  Country
            if (request.CountryID <= 0)
                return "FillCountry";
            name = Util.GetValueOfString(DB.ExecuteScalar(
                "SELECT Name FROM C_Country WHERE IsActive='Y' AND IsSummary='N' AND C_Country_ID=" + request.CountryID));
            if (String.IsNullOrEmpty(name))
                return "FillCountry";
            if (String.IsNullOrWhiteSpace(request.CountryName))
                request.CountryName = name;

            //  Region - the screen insists on one; a country without regions cannot have one
            if (request.RegionID > 0)
            {
                name = Util.GetValueOfString(DB.ExecuteScalar("SELECT Name FROM C_Region WHERE IsActive='Y' AND C_Region_ID="
                    + request.RegionID + " AND C_Country_ID=" + request.CountryID));
                if (String.IsNullOrEmpty(name))
                    return "FillRegion";
                if (String.IsNullOrWhiteSpace(request.RegionName))
                    request.RegionName = name;
            }
            else
            {
                if (Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(*) FROM C_Region WHERE IsActive='Y' AND C_Country_ID=" + request.CountryID)) > 0)
                    return "FillRegion";
                request.RegionID = 0;
                request.RegionName = "";
            }
            return null;
        }

        /// <summary>
        /// Error answer. A 401 also names the scheme to authenticate with.
        /// </summary>
        private HttpResponseMessage Fail(HttpStatusCode status, string error, string language)
        {
            HttpResponseMessage response = Respond(status, new CreateTenantResponse()
            {
                Success = false,
                Error = error,
                Message = ApiAuthHelper.GetMessage(language, error, GetDefaultText(error))
            });
            if (status == HttpStatusCode.Unauthorized)
            {
                ApiAuthHelper.SuppressLoginRedirect();
                response.Headers.WwwAuthenticate.Add(new AuthenticationHeaderValue("Basic", "realm=\"" + ApiAuthHelper.REALM + "\""));
            }
            return response;
        }

        private HttpResponseMessage Respond(HttpStatusCode status, CreateTenantResponse body)
        {
            return Request.CreateResponse(status, body);
        }

        /// <summary>
        /// English text for the keys that may have no AD_Message - shown when Msg has nothing.
        /// </summary>
        private static string GetDefaultText(string key)
        {
            switch (key)
            {
                case "UserPwdError": return "User name or password is not correct";
                case "MaxFailedLoginAttempts": return "Account locked - too many failed login attempts";
                case "AccessNotGranted": return "Access is not granted from this IP address";
                case "RoleNotDefined": return "No role defined for the user";
                case "PasswordExpired": return "Password has expired - set a new one through the login screen";
                case "TenantSetupNotAllowed": return "No System role with access to the Initial Tenant Setup";
                case "InvalidRequest": return "Request body missing or not readable";
                case "FillTenantName": return "Tenant name is mandatory";
                case "FillOrgName": return "Organization name is mandatory";
                case "FillUserClient": return "Tenant admin user name is mandatory";
                case "FillCity": return "City is mandatory";
                case "FillCurrency": return "Valid CurrencyID is mandatory";
                case "FillCountry": return "Valid CountryID is mandatory";
                case "FillRegion": return "Valid RegionID of the country is mandatory";
                case "UsernameMustBeDifferent": return "Tenant user and organization user must be different";
                case "VIS_TenantNameExists": return "Invalid: Tenant name already exists";
                case "ErrorCreatingTenant": return "Error creating tenant";
                default: return key;
            }
        }
    }
}
