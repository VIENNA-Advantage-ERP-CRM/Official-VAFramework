using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using VAdvantage.Logging;
using static VAModelAD.AIHelper.AIHelperDataContracts;

namespace VAModelAD.AIHelper
{
    public class AIApiService : IDisposable
    {
        //private static  string endponit = "http://130.61.41.38:8000";
        private static string endponit = "http://vaaimodel.viennaadvantage.com:8000";
        private static string endponit_S = "http://130.61.36.22:8000";
        //private static string endponit = "https://7aef-103-113-65-58.ngrok-free.app";
        private Uri uriEndpoint = new Uri(endponit);

        static HttpClient client = null;
        HttpClient client2 = new HttpClient();
        private static string _aiEndpoint = null;
        private static VLogger _log = VLogger.GetVLogger(typeof(AIApiService).FullName);

        public AIApiService(string token)
        {
            if (client == null)
            {
                //Check for sandbox
                if (_aiEndpoint == "S")
                {
                    uriEndpoint = new Uri(endponit_S);
                }

                client = new HttpClient();
                client.BaseAddress = uriEndpoint;
                client.Timeout = new TimeSpan(0, 1, 0);
                client2.BaseAddress = new Uri("https://jsonplaceholder.typicode.com");
                //client.DefaultRequestHeaders.Add("AuthToken", token);

                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 |
                                                       SecurityProtocolType.Tls |
                                                       SecurityProtocolType.Tls11 |
                                                       SecurityProtocolType.Ssl3;
            }
        }

        /// <summary>
        /// Read and get Market Type Text For Header and
        /// Initialize market endpoint also;
        /// </summary>
        /// <returns></returns>
        public static string InitAIEndPoint(string url)
        {
            if (url.Contains("api/"))
            {
                url = url.Substring(0, url.IndexOf("api/"));
            }
            if (url != "")
            {
                RequestPayload.Get().SetEndPoints(url);
            }
            // If url not found, then check in the web.config of VAI01 module
            // Case handled for checking Chat Bot details if service is called from VServer
            else
            {
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                var configPath = Path.Combine(Path.GetFullPath(Path.Combine(exeDir, "..")), "Areas", "VAI01", "Views", "web.config");
                try
                {
                    var xdoc = XDocument.Load(configPath);
                    var appSettingData = xdoc.Descendants("appSettings")
                                          .Descendants("add")
                                          .FirstOrDefault(x => x.Attribute("key")?.Value == "AIRedirectURL");

                    // Fetch Redirect URL from the web config
                    url = appSettingData?.Attribute("value")?.Value ?? "";
                    RequestPayload.Get().SetEndPoints(url);

                    // Fetch AI Endpoints from the web config
                    appSettingData = xdoc.Descendants("appSettings")
                                          .Descendants("add")
                                          .FirstOrDefault(x => x.Attribute("key")?.Value == "AIEndPoint");

                    _aiEndpoint = appSettingData?.Attribute("value")?.Value ?? "";
                }
                catch (Exception exptn)
                {
                    _log.SaveError("URL Not Found Error : ", exptn.Message);
                }
            }

            if (_aiEndpoint != null)
                return _aiEndpoint;

            // tokenKey = EvaluationCheck.GetTokenKey();
            var path = "~/Areas/VAI01/Views/web.config";
            try
            {
                //tokenKey = EvaluationCheck.GetTokenKey();
                var configuration = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration(path);
                System.Configuration.AppSettingsSection appSettingsSection = (System.Configuration.AppSettingsSection)configuration.GetSection("appSettings");

                if (appSettingsSection.Settings.AllKeys.Contains("AIEndPoint"))
                {
                    _aiEndpoint = appSettingsSection.Settings["AIEndPoint"].Value;
                }
                else
                {
                    _aiEndpoint = "";
                }
            }
            catch (Exception ex)
            {
                _aiEndpoint = "";
                VAdvantage.Logging.VLogger.Get().Severe("ErrorReadingWebConfig=>" + ex.Message);
            }

            return _aiEndpoint;
        }

        /// <summary>
        /// Get Chat Title
        /// </summary>
        /// <param name="dataIn"></param>
        /// <returns></returns>
        public AIHelperDataOut ExecuteRequest(dynamic dataIn, string EndpointName)
        {
            StringContent jsonContent = new StringContent(JsonConvert.SerializeObject(dataIn), Encoding.UTF8, "application/json");
            return PostAsync(EndpointName, jsonContent, dataIn.token).Result;
        }

        private async Task<AIHelperDataOut> PostAsync(string action, StringContent content, string token)
        {
            AIHelperDataOut dOut = new AIHelperDataOut();
            try
            {
                //client.DefaultRequestHeaders.ConnectionClose = true;
                client.DefaultRequestHeaders.Clear();
                client.DefaultRequestHeaders.Add("AuthToken", token);
                var response = await client.PostAsync(action, content).ConfigureAwait(false);
                var jsonResponse = await response.Content.ReadAsStringAsync();
                dOut.result = jsonResponse;
            }
            catch (Exception e)
            {
                dOut.isError = true;
                dOut.result = e.Message + " " + e.InnerException + " " + e.StackTrace;
            }
            return dOut;
        }

        public void Dispose()
        {

        }
    }
}