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
            DataSet dataSet = DB.ExecuteDataset("SELECT clientID,authorityurl,tenantoptional,redirecturi,Provider,AD_Ref_List.value,ad_ref_list.name FROM sso_configuration \r\n                        INNER JOIN AD_Ref_List  ON AD_Ref_List.Value=sso_configuration.Provider\r\n                        WHERE sso_configuration.IsActive='Y' AND AD_Reference_ID IN (\r\n                        SELECT ad_reference_ID FROM ad_reference WHERE NAme='VIS_ServiceProvider'\r\n                        )");
            AppBuilderSecurityExtensions.SetDefaultSignInAsAuthenticationType(app, "Cookies");
            CookieAuthenticationExtensions.UseCookieAuthentication(app, new CookieAuthenticationOptions()
            {
                CookieManager = (ICookieManager)new SystemWebCookieManager(),
                LoginPath = new PathString("/Account/JsonLogin"),
                LogoutPath = new PathString("/")
            });
            IAppBuilder iappBuilder1 = app;
            CookieAuthenticationOptions authenticationOptions1 = new CookieAuthenticationOptions();
            ((AuthenticationOptions)authenticationOptions1).AuthenticationType = "ApplicationCookie";
            authenticationOptions1.LoginPath = new PathString("/Account/JsonLogin");
            authenticationOptions1.LogoutPath = new PathString("/");
            CookieAuthenticationExtensions.UseCookieAuthentication(iappBuilder1, authenticationOptions1);
            if (dataSet == null || dataSet.Tables[0].Rows.Count <= 0)
                return;
            for (int index = 0; index < dataSet.Tables[0].Rows.Count; ++index)
            {
                string str = string.Format((IFormatProvider)CultureInfo.InvariantCulture, Util.GetValueOfString(dataSet.Tables[0].Rows[index]["authorityurl"]), (object)Util.GetValueOfString(dataSet.Tables[0].Rows[index]["tenantoptional"]));
                IAppBuilder iappBuilder2 = app;
                OpenIdConnectAuthenticationOptions authenticationOptions2 = new OpenIdConnectAuthenticationOptions();
                ((AuthenticationOptions)authenticationOptions2).AuthenticationType = Util.GetValueOfString(dataSet.Tables[0].Rows[index]["value"]).ToLower();
                authenticationOptions2.ClientId = Util.GetValueOfString(dataSet.Tables[0].Rows[index]["clientID"]);
                authenticationOptions2.Authority = str;
                authenticationOptions2.RedirectUri = Util.GetValueOfString(dataSet.Tables[0].Rows[index]["redirecturi"]);
                authenticationOptions2.PostLogoutRedirectUri = Util.GetValueOfString(dataSet.Tables[0].Rows[index]["redirecturi"]);
                authenticationOptions2.Scope = "openid profile";
                authenticationOptions2.ResponseType = "code id_token";
                authenticationOptions2.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = false
                };
                authenticationOptions2.Notifications = new OpenIdConnectAuthenticationNotifications();
                OpenIdConnectAuthenticationExtensions.UseOpenIdConnectAuthentication(iappBuilder2, authenticationOptions2);
            }
        }
    }
}