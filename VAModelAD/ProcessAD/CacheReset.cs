/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : Reset Cache
 * Purpose        : Reset Cache
 * Class Used     : ProcessEngine.SvrProcess
 * Chronological    Development
 * Raghunandan     21-Sep-2009
  ******************************************************/
using com.sun.jndi.cosnaming;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAdvantage.Process
{
    public class CacheReset : ProcessEngine.SvrProcess
    {
        /// <summary>
        /// Prepare - e.g., get Parameters.
        /// </summary>
        protected override void Prepare()
        {
        }


        /// <summary>
        /// Perform Process.
        /// </summary>
        /// <returns>Message to be translated</returns>
        protected override String DoIt()
        {
            StringBuilder m_info = new StringBuilder();
            try
            {
                //  empty list => all modules
                List<MarketModuleInfo> modules = GetMarketModules(new List<string>());
                if (modules != null)
                {
                    m_info.Append("Market Modules=").Append(modules.Count).Append("\n");
                    for (int i = 0; i < modules.Count; i++)
                        log.Fine(modules[i].Prefix + " " + modules[i].Name
                            + " Latest=" + modules[i].LatestAvailableVersion
                            + " Installed=" + modules[i].Installedversion);
                }
            }
            catch (Exception ex)
            {
                //  Market lookup must not fail tenant creation
                log.Log(Level.SEVERE, "Market module listing failed", ex);
            }
            return "";

            log.Info("");
            Env.Reset(false);	// not final            
            return "Cache Reset";
        }

        /// <summary>
        /// Lists the modules published on Market (RequestType=ML)
        /// </summary>
        /// <param name="moduleNames">module prefixes to filter on, empty/null = all</param>
        /// <returns>modules, null on failure</returns>
        private List<MarketModuleInfo> GetMarketModules(List<string> moduleNames)
        {
            MarketModuleRequest req = new MarketModuleRequest();
            //req.Token = GetMarketSetting("MARKET_API_TOKEN", "MarketApiToken");
            req.VendorKey = "7E7BCAE4-6AF8-4DF8-9A94-DD301A038297"; //GetMarketSetting("MARKET_VENDOR_KEY", "MarketVendorKey");
            req.RequestType = "ML";                 //  ML = List Modules
            req.ModuleNames = moduleNames == null ? new List<string>() : moduleNames;
            if (String.IsNullOrEmpty(req.Token))
            {
                //  no token => fall back to credentials
                req.UserName = "SuperUser"; //GetMarketSetting("MARKET_API_USER", "MarketApiUser");
                req.Password = "System@1234"; // GetMarketSetting("MARKET_API_PWD", "MarketApiPwd");
            }

            //  omit UserName/Password (or Token) when not set, the API expects one or the other
            string json = JsonConvert.SerializeObject(req,
                new JsonSerializerSettings() { NullValueHandling = NullValueHandling.Ignore });

            string raw = CallMarketModuleApi(GetCtx(), json);
            if (String.IsNullOrEmpty(raw))
                return null;

            MarketModuleResponse resp = JsonConvert.DeserializeObject<MarketModuleResponse>(raw);
            if (resp == null || resp.ListModule == null)
            {
                log.Log(Level.SEVERE, "Market ListModule not returned - " + raw);
                return null;
            }
            return resp.ListModule;
        }
        //GetMarketModules

        /// <summary>
        /// Market setting from AD_SysConfig, falling back to web.config appSettings
        /// </summary>
        private string GetMarketSetting(String sysConfigName, String appSettingKey)
        {
            string value = MSysConfig.GetValue(sysConfigName, true);
            if (String.IsNullOrEmpty(value))
                value = Util.GetValueOfString(System.Configuration.ConfigurationManager.AppSettings[appSettingKey]);
            return value;
        }
        //GetMarketSetting

        /// <summary>
        /// Calls Market module API -> Market_ModuleAPIController.ModuleHandler
        /// </summary>
        /// <param name="jsonRequest">raw JSON body that ApiModuleHelper.ModuleHandler expects</param>
        /// <returns>response returned by the Market API, null on failure</returns>
        private string CallMarketModuleApi(Ctx m_ctx, string jsonRequest)
        {
            try
            {
                //  Base URL of the Market application e.g. http://localhost/Market

                //string baseUrl = MSysConfig.GetValue("MARKET_API_URL", true);
                //if (String.IsNullOrEmpty(baseUrl))
                //    baseUrl = Util.GetValueOfString(System.Configuration.ConfigurationManager.AppSettings["MarketApiUrl"]);
                //if (String.IsNullOrEmpty(baseUrl))
                //{
                //    log.Log(Level.SEVERE, "Market API URL not configured");
                //    return null;
                //}
                string baseUrl = Env.GetApplicationURL(m_ctx);

                string url = baseUrl.TrimEnd('/') + "/api/Market_ModuleAPI";
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
                        log.Log(Level.SEVERE, "Market API failed: " + response.StatusCode + " - " + raw);
                        return null;
                    }

                    //  action returns string => Web API JSON formatter wraps it in quotes, so unwrap
                    return raw.StartsWith("\"") ? JsonConvert.DeserializeObject<string>(raw) : raw;
                }
            }
            catch (Exception ex)
            {
                log.Log(Level.SEVERE, "Market API error", ex);
                return null;
            }
        }
        //CallMarketModuleApi
    }

    public class MarketModuleInfo
    {
        public string Name { get; set; }

        public string Prefix { get; set; }

        public string LatestAvailableVersion { get; set; }

        /// <summary>null when the module is not installed - name matches the API casing</summary>
        public string Installedversion { get; set; }

        public List<string> AvailableVersions { get; set; }
    }

    /// <summary>
    /// Request body of Market_ModuleAPI
    /// </summary>
    public class MarketModuleRequest
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
    }

    /// <summary>
    /// Response body of Market_ModuleAPI, RequestType=ML
    /// </summary>
    public class MarketModuleResponse
    {
        public List<MarketModuleInfo> ListModule { get; set; }
    }
}
