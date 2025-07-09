using Newtonsoft.Json;
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace VAModelAD.Classes
{
    /// <summary>
    /// Token Manager class to get token and verify the token
    /// </summary>
    public class TokenManager
    {
        private static string _tokenKey = "PASSCODEONE";
        public static string jwttokenpath = "https://aitamgmtapi.viennaadvantage.com/api/auth/";

        public static bool VerifyToken(string tkn)
        {
            try
            {
                var token = HttpContext.Current.Request.Headers["AuthToken"];
                if(string.IsNullOrEmpty(token) )
                {
                    token = tkn;
                }
                var ip = HttpContext.Current.Request.UserHostAddress;
                if (HttpContext.Current.Request.Headers["X-Forwarded-For"] != null)
                {
                    ip = HttpContext.Current.Request.Headers["X-Forwarded-For"];
                }

                var postData = new
                {
                    Ticket = token,
                    DPrint = ip
                };

                // Convert the data to a byte array
                byte[] byteArray = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(postData));

                var httpRequest = (HttpWebRequest)WebRequest.Create(jwttokenpath + "verify");
                httpRequest.Method = "POST";
                httpRequest.Accept = "application/json";
                httpRequest.ContentType = "application/json";
                httpRequest.ContentLength = byteArray.Length;

                // Write the data to the request stream
                using (Stream dataStream = httpRequest.GetRequestStream())
                {
                    dataStream.Write(byteArray, 0, byteArray.Length);
                }

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                httpRequest.ProtocolVersion = HttpVersion.Version10;
                ServicePointManager.Expect100Continue = true;

                // Get the response
                using (HttpWebResponse response = (HttpWebResponse)httpRequest.GetResponse())
                {
                    if (response.StatusCode.ToString().ToUpper() == "OK")
                    {
                        return true;
                    }
                }

            }
            catch { }

            return false;
        }

        /// <summary>
        /// Generate Token to pass to Python API
        /// </summary>
        /// <returns></returns>
        public static string GenerateToken()
        {
            try
            {
                var url = jwttokenpath + "token";
                var httpRequest = (HttpWebRequest)WebRequest.Create(url);
                httpRequest.Method = "GET";
                httpRequest.Accept = "application/json";
                httpRequest.ContentType = "application/json";
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                httpRequest.ProtocolVersion = HttpVersion.Version10;
                ServicePointManager.Expect100Continue = true;
                var httpResponse = (HttpWebResponse)httpRequest.GetResponse();
                string token = null;
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    token = JsonConvert.DeserializeObject<AuthData>(streamReader.ReadToEnd()).token;
                }
                
                return token;
            }
            catch (Exception e)
            {
                VAdvantage.Logging.VLogger.Get().Severe("UnabletogenerateAuthToken=>" + e.Message);
            }
            VAdvantage.Logging.VLogger.Get().Severe("UnabletogenerateAuthToken.");
            return null;
        }
    }
    /// <summary>
    /// Auth Data Object
    /// </summary>
    public class AuthData
    {
        public string token { get; set; }
    }
}
