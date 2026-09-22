using BaseLibrary.CloudService;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Hosting;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Process;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class VSetupModel
    {
        /// <summary>
        /// AD_SysConfig entry that pins the localization package. Written with the
        /// package's search key once its modules are installed; from then on the setup
        /// form offers that package alone, so every tenant on the installation gets the
        /// same localization.
        /// </summary>
        public const string LOCALIZATION_PACKAGE_KEY = "LOCALIZATION_PACKAGE_KEY";

        public InitialData GetInitialData(Ctx ctx)
        {

            bool isBaseLanguage = VAdvantage.Utility.Env.IsBaseLanguage(ctx, "C_Currency");
            string sqlCu = null;
            string sqlCo = null;
            string sqlRe = null;
            if (isBaseLanguage)
            {
                sqlCu = "SELECT C_Currency_ID, Description, ISO_Code FROM C_Currency ORDER BY 1";
                sqlCo = "SELECT C_Country_ID, Name FROM C_Country WHERE IsSummary='N' ORDER BY 1";
                sqlRe = "SELECT C_Region_ID, Name FROM C_Region ORDER BY C_Country_ID, Name";
            }
            else
            {
                sqlCu = @"SELECT C.C_Currency_ID, CL.Description, C.ISO_Code
                            FROM C_Currency C
                            INNER JOIN C_Currency_Trl CL
                            ON (C.C_Currency_ID=CL.C_Currency_ID
                            AND CL.ad_language ='" + ctx.GetAD_Language() + "') ORDER BY 1";
                // sqlCo = "SELECT C_Country_ID, Name FROM C_Country WHERE IsSummary='N' ORDER BY 1";
                sqlCo = @"SELECT C.C_Country_ID, CL.Name
                            FROM C_Country C
                            INNER JOIN C_Country_Trl CL
                            ON (C.C_Country_ID=CL.C_Country_ID
                            AND CL.ad_language ='" + ctx.GetAD_Language() + "') ORDER BY 1";
                sqlRe = "SELECT C_Region_ID, Name FROM C_Region ORDER BY C_Country_ID, Name";

            }
            InitialData ini = new InitialData();
            DataSet ds = DBase.DB.ExecuteDataset(sqlCu);
            List<Currency> curr = new List<Currency>();
            for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
            {
                curr.Add(new Currency()
                {
                    ID = Util.GetValueOfInt(ds.Tables[0].Rows[i][0]),
                    Name = Util.GetValueOfString(ds.Tables[0].Rows[i][1]),
                    ISO_Code = Util.GetValueOfString(ds.Tables[0].Rows[i][2])
                });
            }
            ini.currency = curr;

            ds = DBase.DB.ExecuteDataset(sqlCo);
            List<Country> country = new List<Country>();
            for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
            {
                country.Add(new Country()
                {
                    ID = Util.GetValueOfInt(ds.Tables[0].Rows[i][0]),
                    Name = Util.GetValueOfString(ds.Tables[0].Rows[i][1])
                });
            }
            ini.country = country;

            ds = DBase.DB.ExecuteDataset(sqlRe);
            List<Region> region = new List<Region>();
            for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
            {
                region.Add(new Region()
                {
                    ID = Util.GetValueOfInt(ds.Tables[0].Rows[i][0]),
                    Name = Util.GetValueOfString(ds.Tables[0].Rows[i][1])
                });
            }
            ini.region = region;

            /* Localization packages are NOT loaded here - they come from the
               Market API over the network and would hold up the whole form.
               The client asks for them separately, see GetLocalizationPackages. */

            return ini;
        }


        public TenantInfo InitailizeClientSetup(string clientName, string orgName, string userClient, string userOrg, string city,
            int currencyID, string currencyName, int countryID, string countryName, int regionID, string regionName,
            bool cfProduct, bool cfBPartner, bool cfProject, bool cfMCampaign, bool cfSRegion, string fileName, string folderKey,
            string selectedPackage, Ctx ctx)
        {

            TenantInfo tInfo = new TenantInfo();
            FileStream m_file = null;

            try
            {
                tInfo.TenantName = clientName;

                //  null when no package was picked - the parameter is optional
                SelectedPackageInfo packageInfo = ParseSelectedPackage(selectedPackage);

                /* Names the install log on the Market side. Generated here, not inside
                   MSetup, so it can be handed to the browser - the setup screen polls
                   GetInstallLog with it to follow the installation. */
                string logKey = packageInfo == null ? null : DateTime.Now.ToString("yyyyMMddHHmmssfff");

                //Functinality moved to FRPT
                //if (string.IsNullOrEmpty(fileName))
                //{
                //    fileName = "AccountingUS1.csv";
                //    m_file = new FileStream(HostingEnvironment.ApplicationPhysicalPath + fileName, FileMode.Open);
                //}
                //else
                //{
                //    m_file = new FileStream(HostingEnvironment.ApplicationPhysicalPath + "TempDownload\\" + folderKey + "\\" + fileName, FileMode.Open);
                //}

                string retVal = "";

                // worker.ReportProgress(0);
                Context context = new Context((Dictionary<string, string>)ctx.GetMap());
                MSetup ms = new MSetup(context, 0);
                //  Step 1
                //bool ok = ms.CreateClient(fClientName.Text, fOrgName.Text, fUserClient.Text, fUserOrg.Text);
                bool ok = false;
                /* The package is deliberately NOT handed to CreateClient. MSetup installs
                   whatever it was given at the end of CreateEntities, and that call blocks
                   until Market has installed every module - the tenant details would not
                   reach the screen until then. Left null, that step is skipped and the
                   install is queued below instead, once the response is on its way. */
                TenantInfoM clientInfo = ms.CreateClient(clientName, orgName, userClient, userOrg);
                if (string.IsNullOrEmpty(clientInfo.Log))
                {
                    ok = true;
                }
                tInfo.TenantName = clientInfo.TenantName;
                tInfo.OrgName = clientInfo.OrgName;
                tInfo.AdminRole = clientInfo.AdminRole;
                tInfo.AdminUser = clientInfo.AdminUser;
                tInfo.AdminUserPwd = clientInfo.AdminUserPwd;
                tInfo.TenantID = clientInfo.TenantID;
                //tInfo.UserRole = clientInfo.UserRole;
                //tInfo.OrgUser = clientInfo.OrgUser;
                //tInfo.OrgUserPwd = clientInfo.OrgUserPwd;
                // worker.ReportProgress(10);
                String info = ms.GetInfo();
                tInfo.Log = clientInfo.Log;
                if (ok)
                {
                    //  Generate Accounting
                    // worker.ReportProgress(15);
                    // if (!ms.CreateAccounting(currency, cfProduct, cfBPartner, cfProject, cfMCampaign, cfSRegion, m_file))
                    // KeyNamePair currency = new KeyNamePair(clientSetup.currency.Key, clientSetup.currency.Value);
                    KeyNamePair currency = new KeyNamePair(currencyID, currencyName);
                    string res = "";
                    if (!ms.CreateAccounting(currency, cfProduct, cfBPartner, cfProject, cfMCampaign, cfSRegion, m_file, out res))
                    {
                        //ShowMessage.Error("AccountSetupError", false);
                        //Dispose();
                        retVal = "AccountSetupError" + res;
                        tInfo.Log = retVal;
                    }
                    res = null;
                    // worker.ReportProgress(45);
                    //  Generate Entities

                    int C_Country_ID = countryID;

                    int C_Region_ID = regionID;
                    //  worker.ReportProgress(75);
                    ms.CreateEntities(C_Country_ID, city, C_Region_ID, currencyID);
                    //worker.ReportProgress(90);
                    info += ms.GetInfo();
                    //	Create Print Documents
                    ms.SetupPrintForm(ms.GetAD_Client_ID());
                    // worker.ReportProgress(100);
                }

                //Functinality moved to FRPT
                //try
                //{
                //    if (m_file != null)
                //        m_file.Close();
                //    System.IO.File.Delete(HostingEnvironment.ApplicationPhysicalPath + "TempDownload\\" + folderKey + "\\" + fileName);
                //    System.IO.Directory.Delete(HostingEnvironment.ApplicationPhysicalPath + "TempDownload\\" + folderKey, true);
                //}
                //catch (Exception)
                //{
                //    //retVal += (ex.Message);
                //}

                if (tInfo.Log == null)
                {
                    tInfo.Log = retVal;
                }

                /* Modules go in after the response, so the screen can show the tenant
                   details and then follow the installation through GetInstallLog. Only
                   when the tenant itself was created - CreateEntities is skipped
                   otherwise, and there would be no tenant to install into. */
                if (ok && packageInfo != null)
                {
                    MethodInfo installMethod = GetInstallPackageModulesMethod();
                    if (installMethod == null)
                    {
                        /* Older ModelLibrary - the tenant is complete, only the package is
                           not installed. LogKey stays null, or the screen would poll for an
                           install log that will never exist. */
                        VLogger.Get().Log(Level.WARNING, "MSetup.InstallPackageModules not found in ModelLibrary - package '"
                            + packageInfo.Value + "' not installed, tenant setup continues");
                    }
                    else
                    {
                        tInfo.LogKey = logKey;
                        QueueModuleInstall(ms, installMethod, packageInfo, logKey, ctx);
                    }
                }
            }
            catch (Exception ex)
            {
                //if (m_file != null)
                //    m_file.Close();
                //System.IO.File.Delete(HostingEnvironment.ApplicationPhysicalPath + "TempDownload\\" + folderKey + "\\" + fileName);
                //System.IO.Directory.Delete(HostingEnvironment.ApplicationPhysicalPath + "TempDownload\\" + folderKey, true);
                tInfo.Log = ex.Message;

            }

            return tInfo;// retVal;
        }

        /// <summary>
        /// Whether a tenant with this name can still be created. MSetup.CreateClient refuses
        /// a name AD_Client already holds, but only once Done is pressed - the screen asks
        /// this as soon as the name is typed, so the user hears about it straight away.
        /// Same check MSetup ends up making, kept case insensitive so it does not depend on
        /// the database collation. Both Name and Value: CreateClient writes the tenant name
        /// into both, and either could be the one that clashes.
        /// </summary>
        /// <returns>true when no tenant has the name; a blank name is reported available -
        /// it is refused as blank on Done, and a second message here would only double up</returns>
        public bool IsTenantNameAvailable(string clientName)
        {
            if (string.IsNullOrWhiteSpace(clientName))
            {
                return true;
            }
            string sql = "SELECT COUNT(*) FROM AD_Client WHERE UPPER(Name)=UPPER(@name) OR UPPER(Value)=UPPER(@name)";
            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@name", clientName.Trim());
            return Util.GetValueOfInt(DB.ExecuteScalar(sql, param, null)) == 0;
        }

        /// <summary>
        /// MSetup.InstallPackageModules(object, string), or null when the ModelLibrary this
        /// build runs against does not have it. Looked up by name rather than called
        /// directly: MSetup comes from a separate assembly, and an older ModelLibrary.dll -
        /// on the build machine or in production - has no such method. A direct call would
        /// not compile against the one, and would fail to JIT against the other, before any
        /// try block around it gets to run. The parameter types are given so a later
        /// overload cannot make the lookup ambiguous.
        /// </summary>
        private static MethodInfo GetInstallPackageModulesMethod()
        {
            return typeof(MSetup).GetMethod("InstallPackageModules", new Type[] { typeof(object), typeof(string) });
        }

        /// <summary>
        /// Runs the module installation after the response has gone out. Market installs
        /// the modules inline and only answers when the last one is through, so waiting on
        /// it here would hold the setup screen for as long as the whole installation takes.
        /// Progress is followed through GetInstallLog instead, keyed by logKey.
        /// </summary>
        /// <param name="ms">the MSetup that created the tenant - it carries the tenant name
        /// the install request needs, so a fresh instance would not do</param>
        /// <param name="installMethod">MSetup.InstallPackageModules, from
        /// GetInstallPackageModulesMethod - the caller has already checked it exists</param>
        /// <param name="ctx">the caller's context, kept for the work that follows the
        /// install - the request that started this is long gone by then</param>
        private void QueueModuleInstall(MSetup ms, MethodInfo installMethod, SelectedPackageInfo packageInfo, string logKey, Ctx ctx)
        {
            /* Market writes its log lines before it starts installing, so the rows the
               screen polls for exist from the moment the request lands there. If the app
               pool recycles while this is running the request is already with Market and
               the installation carries on - only this thread goes away. */
            HostingEnvironment.QueueBackgroundWorkItem(cancellationToken =>
            {
                try
                {
                    installMethod.Invoke(ms, new object[] { packageInfo, logKey });
                }
                catch (Exception ex)
                {
                    //  the tenant is already created, a failed install must not be thrown away silently
                    //  Invoke wraps whatever the method threw - log that, not the wrapper
                    Exception cause = ex is TargetInvocationException && ex.InnerException != null ? ex.InnerException : ex;
                    VLogger.Get().Log(Level.SEVERE, "Queued module install failed - LogKey=" + logKey, cause);
                    return;
                }

                /* The call above returns when Market is through, but says nothing about
                   how it went - the log does. Only a clean run pins the package: a half
                   installed one must not lock the form to it. Done here rather than from
                   the browser, so it holds even if the tab was closed meanwhile. */
                try
                {
                    List<InstallLogInfo> log = GetInstallLog(ctx, logKey);
                    if (log != null && log.Count > 0 && log.TrueForAll(l => l.IsSuccess))
                    {
                        SaveLocalizationPackageKey(ctx, packageInfo.Value);
                    }
                    else
                    {
                        VLogger.Get().Log(Level.WARNING, "Localization package key not saved - install not clean, LogKey=" + logKey);
                    }
                }
                catch (Exception ex)
                {
                    VLogger.Get().Log(Level.SEVERE, "Localization package key not saved - LogKey=" + logKey, ex);
                }
            });
        }

        /// <summary>
        /// Saved localization package search key, empty when none is pinned yet.
        /// Straight from the table, not MSysConfig's cache - the value changes during a
        /// run, and MSysConfig itself is defined in two referenced libraries.
        /// </summary>
        public static string GetLocalizationPackageKey()
        {
            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@name", LOCALIZATION_PACKAGE_KEY);
            string val = Util.GetValueOfString(DB.ExecuteScalar(
                "SELECT Value FROM AD_SysConfig WHERE IsActive='Y' AND UPPER(Name)=UPPER(@name) ORDER BY AD_Client_ID, AD_Org_ID", param, null));
            return val == null ? "" : val.Trim();
        }

        /// <summary>
        /// Writes the package search key to AD_SysConfig under LOCALIZATION_PACKAGE_KEY -
        /// one row only: an existing one is updated, whichever client it sits under, so
        /// the name never doubles up.
        /// </summary>
        private void SaveLocalizationPackageKey(Ctx ctx, string packageKey)
        {
            if (String.IsNullOrEmpty(packageKey) || String.IsNullOrEmpty(packageKey.Trim()))
            {
                return;
            }
            packageKey = packageKey.Trim();

            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@name", LOCALIZATION_PACKAGE_KEY);
            int id = Util.GetValueOfInt(DB.ExecuteScalar(
                "SELECT AD_SysConfig_ID FROM AD_SysConfig WHERE UPPER(Name)=UPPER(@name) ORDER BY AD_Client_ID, AD_Org_ID", param, null));

            //  X_ rather than MSysConfig - that one exists in both ModelLibrary and VAModelAD
            X_AD_SysConfig cfg = new X_AD_SysConfig(ctx, id, null);
            if (id == 0)
            {
                //  system level - the package is per installation, not per tenant
                cfg.SetAD_Client_ID(0);
                cfg.SetAD_Org_ID(0);
                cfg.SetName(LOCALIZATION_PACKAGE_KEY);
                cfg.SetConfigurationLevel("S");
                cfg.SetEntityType("CUST");
                cfg.SetDescription("Localization package installed from the Initial Tenant Setup");
            }
            cfg.SetValue(packageKey);
            cfg.SetIsActive(true);
            if (!cfg.Save())
            {
                VLogger.Get().Log(Level.SEVERE, "AD_SysConfig " + LOCALIZATION_PACKAGE_KEY + " not saved");
            }
        }

        /// <summary>
        /// Install progress for one run, from the Market API (RequestType = GL).
        /// </summary>
        /// <param name="ctx">may be null - installing modules writes files into the running
        /// application, which restarts the AppDomain and drops the in process session, so
        /// the screen keeps polling with no ctx left. GL does not need one.</param>
        /// <param name="logKey">the key handed back by InitailizeClientSetup</param>
        /// <returns>one entry per module, empty when Market has not written its log lines
        /// yet, null when the call failed</returns>
        public List<InstallLogInfo> GetInstallLog(Ctx ctx, string logKey)
        {
            if (String.IsNullOrEmpty(logKey))
                return new List<InstallLogInfo>();

            MarketRequestDTO req = new MarketRequestDTO();
            req.RequestType = "GL";                 //  GL = Get Log
            req.LogKey = logKey;
            //  GL is answered from the log key alone - no session is looked at on the Market side
            if (ctx != null)
            {
                req.SessionGUID = NormalizeGuid(DBase.DB.ExecuteScalar("SELECT AD_Session_GUID FROM AD_Session WHERE AD_Session_ID = " + ctx.GetAD_Session_ID(), null, null));
            }

            string json = JsonConvert.SerializeObject(req,
                new JsonSerializerSettings() { NullValueHandling = NullValueHandling.Ignore });

            string raw = CallMarketModuleApi(ctx, json);
            if (String.IsNullOrEmpty(raw))
                return null;

            try
            {
                //  GL answers with a bare array, not the wrapper the other request types use
                return JsonConvert.DeserializeObject<List<InstallLogInfo>>(raw);
            }
            catch (Exception ex)
            {
                VLogger.Get().Log(Level.SEVERE, "Market install log not readable - " + raw, ex);
                return null;
            }
        }

        public List<Region> GetRegion(Ctx ctx, int countryID)
        {
            string sqlRe = "SELECT C_Region_ID, Name FROM C_Region WHERE C_Country_ID=" + countryID + " AND IsActive='Y' ORDER BY C_Country_ID, Name";
            DataSet ds = DBase.DB.ExecuteDataset(sqlRe);
            List<Region> region = new List<Region>();
            for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
            {
                region.Add(new Region()
                {
                    ID = Util.GetValueOfInt(ds.Tables[0].Rows[i][0]),
                    Name = Util.GetValueOfString(ds.Tables[0].Rows[i][1])
                });
            }
            return region;

        }

        /// <summary>
        /// Lists the modules published on Market (RequestType=ML)
        /// </summary>
        /// <param name="moduleNames">module prefixes to filter on, empty/null = all</param>
        /// <returns>modules, null on failure</returns>
        /// <summary>
        /// Reads the package the user picked on the setup form.
        /// </summary>
        /// <param name="selectedPackage">JSON sent by vsetup.js, empty when no package was picked</param>
        /// <returns>selected package, null when nothing was picked or the JSON is unusable</returns>
        private SelectedPackageInfo ParseSelectedPackage(string selectedPackage)
        {
            if (String.IsNullOrEmpty(selectedPackage) || String.IsNullOrEmpty(selectedPackage.Trim()))
                return null;

            try
            {
                SelectedPackageInfo pkg = JsonConvert.DeserializeObject<SelectedPackageInfo>(selectedPackage);
                if (pkg != null && pkg.Modules == null)
                    pkg.Modules = new List<SelectedModuleInfo>();
                return pkg;
            }
            catch (Exception ex)
            {
                //  the package is optional, a bad payload must not stop tenant creation
                VLogger.Get().Log(Level.WARNING, "Selected package not readable - " + ex.Message, ex);
                return null;
            }
        }

        /// <summary>
        /// Localization packages from the Market API. Called on its own request
        /// so the setup form can be shown before this round trip finishes.
        /// </summary>
        public List<PackageModuleInfo> GetLocalizationPackages(Ctx ctx)
        {
            MarketRequestDTO req = new MarketRequestDTO();
            req.RequestType = "PK";                 //  ML = List Modules
            req.SessionGUID = NormalizeGuid(DBase.DB.ExecuteScalar("SELECT AD_Session_GUID FROM AD_Session WHERE AD_Session_ID = " + ctx.GetAD_Session_ID(), null, null));

            //  omit UserName/Password (or Token) when not set, the API expects one or the other
            string json = JsonConvert.SerializeObject(req,
                new JsonSerializerSettings() { NullValueHandling = NullValueHandling.Ignore });

            string raw = CallMarketModuleApi(ctx, json);
            if (String.IsNullOrEmpty(raw))
                return null;

            MarketModuleResponse resp = JsonConvert.DeserializeObject<MarketModuleResponse>(raw);
            if (resp == null || resp.ListModule == null)
            {
                VLogger.Get().Log(Level.SEVERE, "Market ListModule not returned - " + raw);
                return null;
            }

            /* A package already installed on this installation pins the choice - the
               form offers that one alone. If Market no longer lists it the pin cannot be
               honoured, and the full list is better than an empty combo. */
            string pinned = GetLocalizationPackageKey();
            if (pinned.Length > 0)
            {
                List<PackageModuleInfo> match = resp.ListModule.FindAll(p =>
                    p.Value != null && String.Equals(p.Value.Trim(), pinned, StringComparison.OrdinalIgnoreCase));
                if (match.Count > 0)
                {
                    return match;
                }
                VLogger.Get().Log(Level.WARNING, "Pinned localization package '" + pinned + "' not on Market - listing all");
            }
            return resp.ListModule;
        }
        //GetMarketModules

        /// <summary>
        /// Calls Market module API -> Market_ModuleAPIController.ModuleHandler
        /// </summary>
        /// <param name="jsonRequest">raw JSON body that ApiModuleHelper.ModuleHandler expects</param>
        /// <returns>response returned by the Market API, null on failure</returns>
        private string CallMarketModuleApi(Ctx m_ctx, string jsonRequest)
        {
            try
            {
                string url = GetMarketApiUrl(m_ctx);
                System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
                using (HttpClient client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromMinutes(2);
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    StringContent content = new StringContent(jsonRequest == null ? "" : jsonRequest,
                                                              Encoding.UTF8, "application/json");

                    //  Task.Run avoids the ASP.NET sync-context deadlock on .Result
                    HttpResponseMessage response = System.Threading.Tasks.Task.Run(() => client.PostAsync(url, content)).GetAwaiter().GetResult();
                    string raw = System.Threading.Tasks.Task.Run(() => response.Content.ReadAsStringAsync()).GetAwaiter().GetResult();

                    if (!response.IsSuccessStatusCode)
                    {
                        VLogger.Get().Log(Level.SEVERE, "Market API failed: " + response.StatusCode + " - " + raw);
                        return null;
                    }

                    //  action returns string => Web API JSON formatter wraps it in quotes, so unwrap
                    return raw.StartsWith("\"") ? JsonConvert.DeserializeObject<string>(raw) : raw;
                }
            }
            catch (Exception ex)
            {
                VLogger.Get().Log(Level.SEVERE, "Market API error", ex);
                return null;
            }
        }
        //CallMarketModuleApi

        /// <summary>
        /// Endpoint of the Market module API. Normally taken from the context, but the
        /// module install restarts the AppDomain and the session goes with it - the
        /// current request then answers just as well, the API sits in this application.
        /// </summary>
        private static string GetMarketApiUrl(Ctx m_ctx)
        {
            string baseUrl = m_ctx == null ? null : Env.GetApplicationURL(m_ctx);

            if (String.IsNullOrEmpty(baseUrl) && HttpContext.Current != null && HttpContext.Current.Request != null)
            {
                baseUrl = HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority)
                    + HttpRuntime.AppDomainAppVirtualPath;
            }

            return (baseUrl == null ? "" : baseUrl.TrimEnd('/')) + "/api/Market_ModuleAPI";
        }

        public static string NormalizeGuid(object value)
        {
            if (value == null || value == DBNull.Value)
                return string.Empty;

            byte[] bytes = value as byte[];              // Oracle RAW(16) / Postgres bytea
            if (bytes != null)                           // strips BitConverter's byte separators,
                return BitConverter.ToString(bytes).Replace("-", string.Empty); // not UUID dashes

            if (value is Guid)                           // driver handed back a Guid directly
                return ((Guid)value).ToString("D");

            return value.ToString();                     // already a hex/uuid string
        }
    }

    public class InitialData
    {
        public List<Currency> currency
        {
            get;
            set;
        }
        public List<Region> region
        {
            get;
            set;
        }
        public List<Country> country
        {
            get;
            set;
        }
        public List<PackageModuleInfo> localizationPackages
        {
            get;
            set;
        }
    }

    public class Currency
    {
        public int ID
        {
            get;
            set;

        }
        public String Name
        {
            get;
            set;
        }
        public String ISO_Code
        {
            get;
            set;
        }
    }

    public class Region
    {
        public int ID
        {
            get;
            set;

        }
        public String Name
        {
            get;
            set;
        }
    }

    public class Country
    {
        public int ID
        {
            get;
            set;

        }
        public String Name
        {
            get;
            set;
        }
    }

    public class TenantInfo
    {

        public string TenantName
        {
            get;
            set;
        }

        public string OrgName
        {
            get;
            set;
        }

        public string AdminRole
        {
            get;
            set;
        }

        //public string UserRole
        //{
        //    get;
        //    set;
        //}


        public string AdminUser
        {
            get;
            set;
        }


        public string AdminUserPwd
        {
            get;
            set;
        }


        //public string OrgUser
        //{
        //    get;
        //    set;
        //}


        //public string OrgUserPwd
        //{
        //    get;
        //    set;
        //}

        public string Log
        {
            get;
            set;
        }

        public int TenantID
        {
            get;
            set;
        }

        /// <summary>
        /// Names the module install log on the Market side, so the setup screen can
        /// follow the installation with GetInstallLog. Null when no package was
        /// picked, or when the tenant was not created.
        /// </summary>
        public string LogKey
        {
            get;
            set;
        }
    }

    public class ModuleInfo
    {
        public String Name;
        public string Prefix;
        public string LatestAvailableVersion;
        public string Installedversion;
        public List<string> AvailableVersions;
    }

    public class PackageModuleInfo
    {
        public String Name;
        public String Value;
        public List<ModuleInfo> ModuleDetails;
    }

    /// <summary>
    /// Package picked on the setup form - trimmed down to what tenant creation
    /// needs, so it is not the full PackageModuleInfo the Market API returns.
    /// </summary>
    public class SelectedPackageInfo
    {
        public String Name;
        public String Value;
        public List<SelectedModuleInfo> Modules;
    }

    public class SelectedModuleInfo
    {
        public String Name;
        public String LatestAvailableVersion;
    }

    /// <summary>
    /// Response body of Market_ModuleAPI, RequestType=ML
    /// </summary>
    public class MarketModuleResponse
    {
        public List<PackageModuleInfo> ListModule { get; set; }
    }

    /// <summary>
    /// Request body of Market_ModuleAPI
    /// </summary>
    public class MarketRequestDTO
    {
        /// <summary>Auth token - when empty, UserName/Password are sent instead</summary>
        public string Token { get; set; }

        public string UserName { get; set; }

        public string Password { get; set; }

        /// <summary>ML = List Modules, see the Market API collection for the other types</summary>
        public string RequestType { get; set; }

        /// <summary>Module prefixes to act on, empty = all</summary>
        public List<string> ModuleNames { get; set; }

        public string VendorKey { get; set; }

        public string SessionGUID { get; set; }

        /// <summary>RequestType = GL - names the install log to read back</summary>
        public string LogKey { get; set; }
    }

    /// <summary>
    /// One module of the install log, entry of the array Market_ModuleAPI answers
    /// RequestType = GL with (its MInstallDetail). Message is "NotStarted",
    /// "InProgress", "Done", or the error the module failed with.
    /// </summary>
    public class InstallLogInfo
    {
        public bool IsSuccess { get; set; }

        public string Message { get; set; }

        public string Name { get; set; }
    }
}