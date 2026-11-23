/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : Reset Cache
 * Purpose        : Reset Cache
 * Class Used     : ProcessEngine.SvrProcess
 * Chronological    Development
 * Raghunandan     21-Sep-2009
  ******************************************************/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Logging;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;
using VAModelAD.Classes;
using static System.Net.WebRequestMethods;

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
            string accessKey;
            string licenseKey;
            try
            {
                string token = TokenManager.GenerateToken();
                accessKey = GetAccessKeyAsync("ZIPSY", token)
                                .GetAwaiter().GetResult();
                licenseKey = GetLicenseKeyAsync("ZIPSY", token)
                                .GetAwaiter().GetResult();
                return "AccessKey: " + accessKey + ", LicenseKey: " + licenseKey;
            }
            catch (Exception ex)
            {
                log.Log(Level.SEVERE, "Key lookup failed: " + ex.Message);
                return "Key lookup failed: " + ex.Message;
            }

            log.Info("");
            Env.Reset(false);	// not final            
            return "Cache Reset";
        }


        private const string BaseUrl = "http://localhost/CloudService12_Test/ModuleApi.svc";
        // Reuse one HttpClient for the whole app.
        private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
        /// <summary>
        /// Returns the access key string. Throws if the service reports failure
        /// (non-2xx is already thrown by PostAsync; this also covers success=false).
        /// Response shape: { "success": true, "accessKey": "..." }
        /// </summary>
        public async Task<string> GetAccessKeyAsync(string searchKey, string authToken)
        {
            string json = await PostAsync("partners/accesskey", searchKey, authToken).ConfigureAwait(false);

            var result = JsonConvert.DeserializeObject<AccessKeyResponse>(json);
            if (result == null || !result.Success || string.IsNullOrEmpty(result.AccessKey))
                throw new Exception("Access key lookup failed: "
                    + (result != null && result.Errors != null ? string.Join(" | ", result.Errors) : json));

            return result.AccessKey;
        }

        private class AccessKeyResponse
        {
            [JsonProperty("success")] public bool Success { get; set; }
            [JsonProperty("accessKey")] public string AccessKey { get; set; }
            [JsonProperty("errors")] public List<string> Errors { get; set; }
        }

        /// <summary>
        /// Returns the license key string. Throws if the service reports failure
        /// (non-2xx is already thrown by PostAsync; this also covers success=false).
        /// Response shape: { "success": true, "licenseKey": "..." }
        /// </summary>
        public async Task<string> GetLicenseKeyAsync(string searchKey, string authToken)
        {
            string json = await PostAsync("partners/licensekey", searchKey, authToken).ConfigureAwait(false);

            var result = JsonConvert.DeserializeObject<LicenseKeyResponse>(json);
            if (result == null || !result.Success || string.IsNullOrEmpty(result.LicenseKey))
                throw new Exception("License key lookup failed: "
                    + (result != null && result.Errors != null ? string.Join(" | ", result.Errors) : json));

            return result.LicenseKey;
        }

        private class LicenseKeyResponse
        {
            [JsonProperty("success")] public bool Success { get; set; }
            [JsonProperty("licenseKey")] public string LicenseKey { get; set; }
            [JsonProperty("errors")] public List<string> Errors { get; set; }
        }

        private static async Task<string> PostAsync(string path, string searchKey, string authToken)
        {
            var body = JsonConvert.SerializeObject(new { searchKey = searchKey });

            using (var req = new HttpRequestMessage(HttpMethod.Post, BaseUrl + "/" + path))
            {
                req.Headers.Add("AuthToken", authToken);   // token issued by the token server
                req.Content = new StringContent(body, Encoding.UTF8, "application/json");

                using (var resp = await _http.SendAsync(req).ConfigureAwait(false))
                {
                    string json = await resp.Content.ReadAsStringAsync().ConfigureAwait(false);

                    // 401 = bad token, 404 = no record, 429 = rate limited, 400 = bad input
                    if (!resp.IsSuccessStatusCode)
                        throw new Exception((int)resp.StatusCode + " " + resp.ReasonPhrase + ": " + json);

                    return json;
                }
            }
        }
    }
}
