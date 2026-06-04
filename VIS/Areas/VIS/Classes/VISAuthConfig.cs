using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin.Host.SystemWeb;
using Microsoft.Owin.Infrastructure;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Microsoft.Owin.Security;
using Microsoft.Owin;
using Owin;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Web;
using CoreLibrary.DataBase;
using VAdvantage.Utility;

namespace VIS.Areas.VIS.Classes
{
    public class VISAuthConfig
    {
        public static void RegisterAuth(IAppBuilder app)
        {

            AppBuilderSecurityExtensions.SetDefaultSignInAsAuthenticationType(app, "Cookies");

            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                CookieManager = new SystemWebCookieManager(),
                AuthenticationType = "ApplicationCookie",
                LoginPath = new PathString("/Account/JsonLogin"),
                LogoutPath = new PathString("/")
            });

            DataSet ds = DB.ExecuteDataset(@"
                SELECT CLIENT_ID AS clientID,
                       authorityurl,
                       tenantoptional,
                       redirecturi,
                       Provider,
                       AD_Ref_List.Value,
                       AD_Ref_List.Name
                FROM sso_configuration
                INNER JOIN AD_Ref_List
                    ON AD_Ref_List.Value = sso_configuration.Provider
                WHERE sso_configuration.IsActive='Y'
                  AND AD_Reference_ID IN
                    (
                        SELECT AD_Reference_ID
                        FROM AD_Reference
                        WHERE Name='VIS_ServiceProvider'
                    )");

            if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                return;

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                try
                {
                    string provider = Util.GetValueOfString(row["value"]).ToLower();
                    string clientId = Util.GetValueOfString(row["clientID"]);
                    string authorityUrl = Util.GetValueOfString(row["authorityurl"]);
                    string tenant = Util.GetValueOfString(row["tenantoptional"]);
                    string redirectUri = Util.GetValueOfString(row["redirecturi"]);

                    // Skip invalid configuration
                    if (string.IsNullOrWhiteSpace(clientId) ||
                        string.IsNullOrWhiteSpace(authorityUrl) ||
                        string.IsNullOrWhiteSpace(redirectUri))
                    {
                        continue;
                    }

                    string authority;

                    if (authorityUrl.Contains("{0}"))
                    {
                        authority = string.Format(
                            CultureInfo.InvariantCulture,
                            authorityUrl,
                            tenant);
                    }
                    else
                    {
                        authority = authorityUrl;
                    }

                    if (!Uri.IsWellFormedUriString(authority, UriKind.Absolute))
                    {
                        continue;
                    }

                    app.UseOpenIdConnectAuthentication(
                        new OpenIdConnectAuthenticationOptions
                        {
                            AuthenticationType = provider,
                            ClientId = clientId,
                            Authority = authority,
                            RedirectUri = redirectUri,
                            PostLogoutRedirectUri = redirectUri,
                            Scope = "openid profile",
                            ResponseType = "code id_token",

                            TokenValidationParameters =
                                new TokenValidationParameters
                                {
                                    ValidateIssuer = false
                                },

                            Notifications =
                                new OpenIdConnectAuthenticationNotifications()
                        });
                }
                catch (Exception ex)
                {
                    // Log and continue with next provider
                    System.Diagnostics.Trace.WriteLine(
                        "SSO Provider Registration Error: " + ex);
                }
            }
        }
    }
}