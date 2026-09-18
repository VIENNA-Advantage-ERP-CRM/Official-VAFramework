using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.Analytics
{
    /// <summary>
    /// Server-to-server client for the Onfinity Analytics REST API.
    /// Signs in with a dedicated service account (Viewer role is enough for published reports)
    /// and exports a published report as CSV / XLSX / PDF. Used where a real file is needed:
    /// scheduler mails, workflow notices, document print/e-mail and CSV downloads.
    /// The Bearer token is cached per installation/user for TOKEN_CACHE_HOURS (the API token lasts 12 h).
    /// </summary>
    public class AnalyticsApiClient
    {
        public const string SYSCONFIG_API_USER = "VA_ANALYTICS_API_USER";
        public const string SYSCONFIG_API_PASSWORD = "VA_ANALYTICS_API_PASSWORD";

        public const string FORMAT_CSV = "csv";
        public const string FORMAT_XLSX = "xlsx";
        public const string FORMAT_PDF = "pdf";

        private const int TOKEN_CACHE_HOURS = 11;
        private const int LOGIN_TIMEOUT_MS = 30 * 1000;
        private const int EXPORT_TIMEOUT_MS = 180 * 1000;

        private static readonly VLogger _log = VLogger.GetVLogger(typeof(AnalyticsApiClient).FullName);
        private static readonly ConcurrentDictionary<string, CachedToken> _tokens = new ConcurrentDictionary<string, CachedToken>();

        private class CachedToken
        {
            public string Token;
            public DateTime ExpiresUtc;
        }

        /// <summary>Raised for any API refusal; Message is the server's { ok:false, message } text when available.</summary>
        public class AnalyticsApiException : Exception
        {
            public HttpStatusCode StatusCode { get; private set; }
            public AnalyticsApiException(HttpStatusCode status, string message) : base(message) { StatusCode = status; }
        }

        private readonly string _baseUrl;
        private readonly string _user;
        private readonly string _password;

        /// <summary>Client configured from AD_SysConfig.</summary>
        public AnalyticsApiClient()
            : this(AnalyticsEmbed.GetBaseUrl(),
                   Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_API_USER, false)).Trim(),
                   Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_API_PASSWORD, false)))
        {
        }

        /// <summary>Client with explicit settings (base URL must end with '/').</summary>
        public AnalyticsApiClient(string baseUrl, string user, string password)
        {
            _baseUrl = baseUrl;
            _user = user;
            _password = password;
            ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;
        }

        /// <summary>True when the URL and the service account are configured.</summary>
        public static bool IsConfigured()
        {
            return AnalyticsEmbed.GetBaseUrl().Length > 0
                && Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_API_USER, false)).Trim().Length > 0
                && Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_API_PASSWORD, false)).Length > 0;
        }

        /// <summary>
        /// POST /api/reports/:id/export — returns the file bytes of the published report.
        /// </summary>
        /// <param name="reportId">Published report UUID</param>
        /// <param name="filters">Filter values, same shapes as the embed token</param>
        /// <param name="format">csv, xlsx or pdf</param>
        /// <param name="locale">BCP-47 locale for number/date formats, e.g. en-GB (null = server default)</param>
        public byte[] Export(string reportId, IDictionary<string, object> filters, string format, string locale)
        {
            var body = new Dictionary<string, object>();
            body["format"] = format;
            body["filters"] = filters ?? new Dictionary<string, object>();
            body["draft"] = false;
            if (!string.IsNullOrEmpty(locale))
                body["locale"] = locale;

            string path = "api/reports/" + Uri.EscapeDataString(reportId) + "/export";
            return WithToken(token => Send("POST", path, body, token, EXPORT_TIMEOUT_MS));
        }

        /// <summary>
        /// GET /api/reports?status=published (paged) - id and name of every published report,
        /// sorted by name. Used by the home widget's report picker.
        /// </summary>
        public List<KeyValuePair<string, string>> ListPublishedReports()
        {
            var reports = new List<KeyValuePair<string, string>>();
            const int pageSize = 100;
            for (int page = 1; page <= 20; page++)
            {
                string path = "api/reports?page=" + page + "&pageSize=" + pageSize + "&status=published&sort=name&direction=asc";
                JObject result = JObject.Parse(Encoding.UTF8.GetString(WithToken(token => Send("GET", path, null, token, LOGIN_TIMEOUT_MS))));
                JArray rows = result["reports"] as JArray;
                if (rows == null)
                    break;
                foreach (JToken row in rows)
                    reports.Add(new KeyValuePair<string, string>(Util.GetValueOfString(row["id"]), Util.GetValueOfString(row["name"])));
                int total = Util.GetValueOfInt(result["total"]);
                if (rows.Count < pageSize || reports.Count >= total)
                    break;
            }
            return reports;
        }

        /// <summary>Runs a call with the cached token; on 401 signs in again once and retries.</summary>
        private byte[] WithToken(Func<string, byte[]> call)
        {
            try
            {
                return call(GetToken(false));
            }
            catch (AnalyticsApiException e)
            {
                if (e.StatusCode != HttpStatusCode.Unauthorized)
                    throw;
                return call(GetToken(true));
            }
        }

        /// <summary>Maps a ViennaAdvantage language (en_US) to the locale the export API expects (en-US).</summary>
        public static string LocaleFrom(Ctx ctx)
        {
            string lang = ctx != null ? Util.GetValueOfString(ctx.GetAD_Language()) : "";
            return lang.Length == 0 ? null : lang.Replace('_', '-');
        }

        /// <summary>File extension for an export format.</summary>
        public static string ExtensionFor(string format)
        {
            return FORMAT_CSV.Equals(format) ? ".csv" : FORMAT_XLSX.Equals(format) ? ".xlsx" : ".pdf";
        }

        private string GetToken(bool forceLogin)
        {
            string key = _baseUrl + "|" + _user;
            CachedToken cached;
            if (!forceLogin && _tokens.TryGetValue(key, out cached) && cached.ExpiresUtc > DateTime.UtcNow)
                return cached.Token;

            var body = new Dictionary<string, object>();
            body["email"] = _user;
            body["password"] = _password;
            byte[] response = Send("POST", "api/auth/login", body, null, LOGIN_TIMEOUT_MS);
            string token = Util.GetValueOfString(JObject.Parse(Encoding.UTF8.GetString(response))["token"]);
            if (token.Length == 0)
                throw new AnalyticsApiException(HttpStatusCode.Unauthorized, "Analytics login did not return a token");

            _tokens[key] = new CachedToken { Token = token, ExpiresUtc = DateTime.UtcNow.AddHours(TOKEN_CACHE_HOURS) };
            return token;
        }

        private byte[] Send(string method, string path, object body, string bearer, int timeoutMs)
        {
            var request = (HttpWebRequest)WebRequest.Create(_baseUrl + path);
            request.Method = method;
            request.Accept = "application/json, */*";
            request.Timeout = timeoutMs;
            request.ReadWriteTimeout = timeoutMs;
            if (!string.IsNullOrEmpty(bearer))
                request.Headers["Authorization"] = "Bearer " + bearer;

            if (body != null)
            {
                request.ContentType = "application/json";
                byte[] payload = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(body));
                request.ContentLength = payload.Length;
                using (Stream s = request.GetRequestStream())
                    s.Write(payload, 0, payload.Length);
            }

            try
            {
                using (var response = (HttpWebResponse)request.GetResponse())
                    return ReadAll(response.GetResponseStream());
            }
            catch (WebException we)
            {
                var response = we.Response as HttpWebResponse;
                if (response == null)
                {
                    _log.Log(Level.SEVERE, "Analytics API " + path, we);
                    throw new AnalyticsApiException(HttpStatusCode.ServiceUnavailable, we.Message);
                }
                string message = ReadErrorMessage(response) ?? we.Message;
                _log.Warning("Analytics API " + path + " -> " + (int)response.StatusCode + " " + message);
                throw new AnalyticsApiException(response.StatusCode, message);
            }
        }

        /// <summary>Failure bodies are { "ok": false, "message": "..." }.</summary>
        private static string ReadErrorMessage(HttpWebResponse response)
        {
            try
            {
                string text = Encoding.UTF8.GetString(ReadAll(response.GetResponseStream()));
                if (text.TrimStart().StartsWith("{"))
                {
                    string message = Util.GetValueOfString(JObject.Parse(text)["message"]);
                    if (message.Length > 0)
                        return message;
                }
                return text.Length > 0 && text.Length < 500 ? text : null;
            }
            catch
            {
                return null;
            }
        }

        private static byte[] ReadAll(Stream stream)
        {
            using (var ms = new MemoryStream())
            {
                stream.CopyTo(ms);
                return ms.ToArray();
            }
        }
    }
}
