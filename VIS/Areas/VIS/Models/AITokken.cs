using Google.Apis.Requests;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using VAdvantage.Logging;
using VAdvantage.Utility;

namespace VIS.Areas.VIS.Models
{
    public class AITokken
    {
        private static VLogger s_log = VLogger.GetVLogger("AITokken");
        //AIApiService.InitAIEndPoint(ctx.GetContext("#AppFullUrl"));

        private static readonly HashSet<string> AllowedTaskFromValues = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
        "All",
        "AIAssistant",
        "AIOrchestration",
        "DMS",
        "Aura"
        };
        private static readonly HttpClient _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(30)
        };

        /// <summary>
        /// Get token data accroding to the user and endpoint. 
        /// </summary>
        /// <param name="page">The page number of the records to retrieve.</param>
        /// <param name="taskFrom">The source from which the task originated</param>
        /// <param name="ctx">The current user context</param>
        /// <returns>A JSON string containing the token data returned by the AI service.</returns>
       
        public async Task<string> GetTokenData(int page, string taskFrom, Ctx ctx)
        {
            string baseUrl = "";
            int pageSize = 10;
            try
            {
                string link= VAModelAD.AIHelper.AIApiService.InitAIEndPoint(ctx.GetContext("#AppFullUrl"));
                if (link == "S")
                {
                    baseUrl = ConfigurationManager.AppSettings["AgentServiceBaseUrlS"];
                }
                else
                {
                    baseUrl = ConfigurationManager.AppSettings["AgentServiceBaseUrlL"];
                }
                string endpoint = ConfigurationManager.AppSettings["GetAgentsLogsEndpoint"];
                string apiUrl = baseUrl + endpoint;

                int userID = ctx.GetAD_User_ID();
                string endPoints = ctx.GetContext("#AppFullUrl");
                s_log.Info(
                    "GetTokenData: Preparing payload. Page=" + page +
                    ", PageSize=" + pageSize +
                    ", TaskFrom=" + taskFrom);

                if (page < 1)
                {
                    throw new ArgumentException("Invalid page number.", nameof(page));
                }
                if (string.IsNullOrWhiteSpace(taskFrom))
                {
                    throw new ArgumentException("Invalid task source.", nameof(taskFrom));
                }
                taskFrom = taskFrom.Trim();
                if (!AllowedTaskFromValues.Contains(taskFrom))
                {
                    throw new ArgumentException("Invalid task source.", nameof(taskFrom));
                }
                 
                var payload = new
                {
                    userID = userID,
                    endPoints = endPoints,
                    page = page,
                    task_from = taskFrom,
                    page_size = pageSize
                };
                //jwt tokken 
                string jwtToken = await GetJwtToken();

                using (var request = new HttpRequestMessage(HttpMethod.Post, apiUrl))
                {
                    // Attach JWT token to Authorization header
                    request.Headers.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwtToken);

                    request.Content = new StringContent(
                        JsonConvert.SerializeObject(payload),
                        Encoding.UTF8,
                        "application/json");

                    using (HttpResponseMessage response = await _httpClient.SendAsync(request))
                    {
                        s_log.Info(
                            "GetTokenData: Response StatusCode=" +
                            (int)response.StatusCode);

                        string result = await response.Content.ReadAsStringAsync();

                        if (!response.IsSuccessStatusCode)
                        {
                            s_log.Severe(
                                "GetTokenData: API returned error. StatusCode=" +
                                (int)response.StatusCode);
                            throw new Exception(Msg.GetMsg(ctx, "VIS_UnableToRetrieveData"));
                        }

                        s_log.Info("GetTokenData: Request completed successfully.");

                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                s_log.Severe("GetTokenData: " + ex.Message);

                throw new Exception( Msg.GetMsg(ctx,"VIS_UnableToRetrieveData"));
            }
        }
        /// <summary>
        /// Creates an AI key by invoking the GenerateAIKey service and returns the generated key information.
        /// </summary>
        /// <param name="ctx"> The current user context</param>
        /// <returns> A Json containig </returns>
      
        public async Task<string> CreateAIKey(Ctx ctx)
        {
            try
            {  
                string baseUrl = ConfigurationManager.AppSettings["GenerateAIKeyUrl"];
                s_log.Info("createAIKey: Request received.");

                string jwToken = MarketSvc.ServiceEndPoint.GetAuthToken();
                string userDomainName = ctx.GetContext("#AppFullUrl");
                string accessKey = MarketSvc.Classes.Utility.GetCustomerAccessKey();

                string url = baseUrl + "?userDomainName=" + Uri.EscapeDataString(userDomainName);

                using (var request = new HttpRequestMessage(HttpMethod.Get, url))
                {
                    s_log.Info("createAIKey: Sending request to GenerateAIKey service.");

                    request.Headers.Add("authToken", jwToken);
                    request.Headers.Add("accessKey", accessKey);

                    using (HttpResponseMessage response = await _httpClient.SendAsync(request))
                    {
                        s_log.Info(
                            "createAIKey: Response received. StatusCode=" +
                            (int)response.StatusCode);

                        string result = await response.Content.ReadAsStringAsync();

                        s_log.Info(
                            "createAIKey: Response content length=" +
                            result.Length);

                        if (!response.IsSuccessStatusCode)
                        {
                            s_log.Severe(
                                "createAIKey: API returned error. StatusCode=" +
                                (int)response.StatusCode);

                            throw new Exception(Msg.GetMsg(ctx, "VIS_UnableCreateKey"));
                        }

                        XDocument doc = XDocument.Parse(result);
                        string jsonString = doc.Root.Value;

                        JObject jsonObj = JObject.Parse(jsonString);

                        bool isAIKeyExist = jsonObj["IsAIKeyExist"]?.Value<bool>() ?? false;
                        decimal totalToken = jsonObj["TotalToken"]?.Value<decimal>() ?? 0;
                        decimal consumedToken = jsonObj["ConsumedToken"]?.Value<decimal>() ?? 0;
                        decimal pendingToken = jsonObj["PendingToken"]?.Value<decimal>() ?? 0;
                        string aiKeySuffix = jsonObj["AIKeySuffix"]?.ToString();

                        if (!string.IsNullOrEmpty(aiKeySuffix))
                        {
                            s_log.Info(
                                "createAIKey: IsAIKeyExist=" + isAIKeyExist +
                                ", AIKeySuffix=" + aiKeySuffix);
                        }
                        else
                        {
                            s_log.Warning(
                                "createAIKey: AIKeySuffix not created. " +
                                "IsAIKeyExist=" + isAIKeyExist);
                        }

                        return jsonString;
                    }
                }
            }
            catch (Exception ex)
            {
                s_log.Severe("createAIKey: Exception occurred. " + ex.Message);
                throw new Exception(Msg.GetMsg(ctx,"VIS_UnableCreateKey"));
            }
        }
        private async Task<string> GetJwtToken()
        {
            try
            {
                s_log.Info("GetJwtToken: Requesting JWT token.");

                using (var client = new HttpClient())
                using (var request = new HttpRequestMessage(
                           HttpMethod.Get,
                           "https://aitamgmtapi.viennaadvantage.com/api/auth/token"))
                {
                    // No body needed for GET request
                    HttpResponseMessage response = await client.SendAsync(request);
                    string result = await response.Content.ReadAsStringAsync();

                    s_log.Info("GetJwtToken: Response StatusCode=" + (int)response.StatusCode);

                    if (!response.IsSuccessStatusCode)
                    {
                        s_log.Severe(
                            "GetJwtToken: Failed to get token. StatusCode=" +
                            (int)response.StatusCode + " Body=" + result);

                        throw new Exception("JWT token request failed: " + result);
                    }

                    // Response shape: { "token": "eyJhbGci..." }
                    dynamic tokenResponse = JsonConvert.DeserializeObject(result);
                    string token = (string)tokenResponse?.token;

                    if (string.IsNullOrEmpty(token))
                    {
                        throw new Exception(
                            "GetJwtToken: Token is null or empty. Response: " + result);
                    }

                    s_log.Info("GetJwtToken: Token retrieved successfully.");

                    return token;
                }
            }
            catch (Exception ex)
            {
                s_log.Severe("GetJwtToken: " + ex.Message);
                throw;
            }
        }

       
    }
}
