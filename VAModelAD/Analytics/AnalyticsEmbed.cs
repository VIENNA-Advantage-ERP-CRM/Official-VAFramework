using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAdvantage.Analytics
{
    /// <summary>
    /// Server-side helper for embedding Onfinity Analytics reports.
    /// Mints the HS256 embed token (reportId, exp, filters, interactive, allowExport)
    /// with the shared EMBED_SECRET and builds the /embed?token=... iframe URL.
    /// The secret never leaves the server; the browser only receives the final URL.
    /// Configuration is read from AD_SysConfig (see the constants below).
    /// </summary>
    public static class AnalyticsEmbed
    {
        /// <summary>Base URL of the Analytics installation, e.g. https://analytics.company.com</summary>
        public const string SYSCONFIG_URL = "VA_ANALYTICS_URL";
        /// <summary>Same value as EMBED_SECRET on the Analytics server</summary>
        public const string SYSCONFIG_SECRET = "VA_ANALYTICS_EMBED_SECRET";
        /// <summary>Token lifetime in minutes (must not exceed EMBED_MAX_AGE_SECONDS on the Analytics server)</summary>
        public const string SYSCONFIG_TOKEN_MINUTES = "VA_ANALYTICS_TOKEN_MINUTES";

        private const int DEFAULT_TOKEN_MINUTES = 30;

        public static string GetBaseUrl()
        {
            string url = Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_URL, false)).Trim();
            if (url.Length > 0 && !url.EndsWith("/"))
                url += "/";
            return url;
        }

        public static string GetSecret()
        {
            return Util.GetValueOfString(MSysConfig.GetValue(SYSCONFIG_SECRET, false)).Trim();
        }

        public static int GetTokenMinutes()
        {
            int minutes = Util.GetValueOfInt(MSysConfig.GetValue(SYSCONFIG_TOKEN_MINUTES, false));
            return minutes > 0 ? minutes : DEFAULT_TOKEN_MINUTES;
        }

        /// <summary>True when both the URL and the secret are configured.</summary>
        public static bool IsConfigured()
        {
            return GetBaseUrl().Length > 0 && GetSecret().Length > 0;
        }

        /// <summary>
        /// Builds the full iframe URL: {baseUrl}embed?token={signed token}
        /// </summary>
        /// <param name="reportId">Published Analytics report UUID</param>
        /// <param name="filters">Locked filters (null or empty for none)</param>
        /// <param name="interactive">Show the unlocked filter panel inside the frame</param>
        /// <param name="allowExport">Allow CSV/Excel/PDF export from the frame; null = same as interactive</param>
        public static string EmbedUrl(string reportId, IDictionary<string, object> filters, bool interactive, bool? allowExport)
        {
            string token = CreateToken(reportId, filters, interactive, allowExport, GetTokenMinutes());
            return GetBaseUrl() + "embed?token=" + Uri.EscapeDataString(token);
        }

        /// <summary>
        /// Creates a JWT-shaped HS256 token: base64url(header).base64url(payload).base64url(signature)
        /// </summary>
        public static string CreateToken(string reportId, IDictionary<string, object> filters, bool interactive, bool? allowExport, int minutes)
        {
            return CreateToken(GetSecret(), reportId, filters, interactive, allowExport, minutes);
        }

        /// <summary>
        /// Same as <see cref="CreateToken(string, IDictionary{string, object}, bool, bool?, int)"/> with an explicit secret.
        /// </summary>
        public static string CreateToken(string secret, string reportId, IDictionary<string, object> filters, bool interactive, bool? allowExport, int minutes)
        {
            if (string.IsNullOrEmpty(reportId))
                throw new ArgumentException("reportId is required");
            if (string.IsNullOrEmpty(secret))
                throw new ArgumentException("embed secret is required");

            var payload = new Dictionary<string, object>();
            payload["reportId"] = reportId;
            payload["exp"] = ToUnixSeconds(DateTime.UtcNow.AddMinutes(minutes));
            payload["interactive"] = interactive;
            if (filters != null && filters.Count > 0)
                payload["filters"] = filters;
            if (allowExport.HasValue)
                payload["allowExport"] = allowExport.Value;

            string header = Base64Url(Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}"));
            string body = Base64Url(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(payload)));
            string signingInput = header + "." + body;

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret)))
            {
                string signature = Base64Url(hmac.ComputeHash(Encoding.UTF8.GetBytes(signingInput)));
                return signingInput + "." + signature;
            }
        }

        /// <summary>
        /// Maps process parameters (AD_PInstance_Para) to Analytics filter values.
        /// Parameter name = view column name; a range parameter becomes { from, to }.
        /// </summary>
        public static IDictionary<string, object> FiltersFromProcessInfo(ProcessInfo pi)
        {
            var filters = new Dictionary<string, object>();
            ProcessInfoParameter[] parameters = pi != null ? pi.GetParameter() : null;
            if (parameters == null)
                return filters;

            foreach (ProcessInfoParameter para in parameters)
            {
                if (para == null || string.IsNullOrEmpty(para.GetParameterName()))
                    continue;

                object from = ToFilterValue(para.GetParameter());
                object to = ToFilterValue(para.GetParameter_To());
                if (from == null && to == null)
                    continue;

                if (to != null)
                {
                    var range = new Dictionary<string, object>();
                    if (from != null)
                        range["from"] = from;
                    range["to"] = to;
                    filters[para.GetParameterName()] = range;
                }
                else
                {
                    filters[para.GetParameterName()] = from;
                }
            }
            return filters;
        }

        /// <summary>
        /// Parses tab-panel ExtraInfo of the form "reportId=uuid&amp;COLUMN=value&amp;OTHER=a,b".
        /// A comma-separated value becomes a multi-value filter (array).
        /// </summary>
        public static IDictionary<string, object> FiltersFromQueryString(string extraInfo, out string reportId)
        {
            bool? interactive, allowExport;
            return ParseExtraInfo(extraInfo, out reportId, out interactive, out allowExport);
        }

        /// <summary>
        /// Parses "reportId=uuid&amp;interactive=Y&amp;allowExport=N&amp;COLUMN=value&amp;OTHER=a,b":
        /// the reserved keys become the token options (null when absent), everything else a locked filter.
        /// </summary>
        public static IDictionary<string, object> ParseExtraInfo(string extraInfo, out string reportId, out bool? interactive, out bool? allowExport)
        {
            reportId = null;
            interactive = null;
            allowExport = null;
            var filters = new Dictionary<string, object>();
            if (string.IsNullOrEmpty(extraInfo))
                return filters;

            foreach (string pair in extraInfo.Split('&'))
            {
                int eq = pair.IndexOf('=');
                if (eq <= 0)
                    continue;
                string key = Uri.UnescapeDataString(pair.Substring(0, eq)).Trim();
                string value = Uri.UnescapeDataString(pair.Substring(eq + 1)).Trim();
                if (key.Length == 0 || value.Length == 0)
                    continue;

                if (key.Equals("reportId", StringComparison.OrdinalIgnoreCase))
                {
                    reportId = value;
                }
                else if (key.Equals("interactive", StringComparison.OrdinalIgnoreCase))
                {
                    interactive = IsTrue(value);
                }
                else if (key.Equals("allowExport", StringComparison.OrdinalIgnoreCase))
                {
                    allowExport = IsTrue(value);
                }
                else if (value.Contains(","))
                {
                    filters[key] = value.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                }
                else
                {
                    filters[key] = value;
                }
            }
            return filters;
        }

        /// <summary>Shapes a process parameter value the way the Analytics run API expects it.</summary>
        private static object ToFilterValue(object value)
        {
            if (value == null || value == DBNull.Value)
                return null;
            if (value is DateTime)
                return ((DateTime)value).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            if (value is decimal || value is int || value is long || value is double)
                return value;
            string s = value.ToString();
            return s.Length == 0 ? null : (object)s;
        }

        private static bool IsTrue(string value)
        {
            return "Y".Equals(value, StringComparison.OrdinalIgnoreCase)
                || "true".Equals(value, StringComparison.OrdinalIgnoreCase)
                || "1".Equals(value);
        }

        private static long ToUnixSeconds(DateTime utc)
        {
            return (long)(utc - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds;
        }

        private static string Base64Url(byte[] bytes)
        {
            return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }
    }
}
