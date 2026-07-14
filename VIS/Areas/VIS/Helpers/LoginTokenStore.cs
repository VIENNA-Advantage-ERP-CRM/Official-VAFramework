using System;
using System.Web;
using System.Web.Caching;
using VIS.Models;

namespace VIS.Helpers
{
    /// <summary>
    /// Server-side, short-lived store for sensitive login state (password, 2FA seed) that must survive
    /// between login step 1 (credential verification) and steps 2/3 (role selection, 2FA).
    ///
    /// The browser only ever holds an opaque random token (Login1Model.LoginToken); the password is kept
    /// here, server-side, and is never serialized to the client. Presence of a valid token also proves
    /// that step 1 completed for a given user, which lets step 2 reject forged identities.
    ///
    /// Backed by HttpRuntime.Cache (per-server, like the app's in-proc session), with a short TTL.
    /// </summary>
    public static class LoginTokenStore
    {
        private const string KeyPrefix = "VIS_LGN_TKN_";
        private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

        public class LoginSecrets
        {
            public string UserValue { get; set; }
            public int AD_User_ID { get; set; }
            public string Password { get; set; }
            public string TokenKey2FA { get; set; }
        }

        /// <summary>Persist the secrets for a login attempt and return a new random token.</summary>
        public static string Save(Login1Model model)
        {
            if (model == null)
            {
                return null;
            }
            string token = Guid.NewGuid().ToString("N");
            LoginSecrets secrets = new LoginSecrets
            {
                UserValue = model.UserValue,
                AD_User_ID = model.AD_User_ID,
                Password = model.Password,
                TokenKey2FA = model.TokenKey2FA
            };
            HttpRuntime.Cache.Insert(KeyPrefix + token, secrets, null,
                DateTime.UtcNow.Add(Lifetime), Cache.NoSlidingExpiration);
            return token;
        }

        /// <summary>Look up the secrets for a token, or null if missing/expired.</summary>
        public static LoginSecrets Get(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return null;
            }
            return HttpRuntime.Cache[KeyPrefix + token] as LoginSecrets;
        }

        /// <summary>Invalidate a token (call once the login completes).</summary>
        public static void Remove(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return;
            }
            HttpRuntime.Cache.Remove(KeyPrefix + token);
        }
    }
}
