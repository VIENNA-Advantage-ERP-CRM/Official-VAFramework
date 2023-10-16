using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Owin;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web;

namespace ViennaAdvantageWeb
{
    public partial class Startup
    {
        private static string clientId = ConfigurationManager.AppSettings["ida:ClientId"];

        // The clientSecret is used by the application to uniquely identify itself to Azure AD.ClientID we will get after registering this application on Azure AD
        private static string clientSecret = ConfigurationManager.AppSettings["ida:ClientSecret"];


        // The AAD Instance is the instance of Azure, for example public Azure or Azure US.
        private static string aadInstance = ConfigurationManager.AppSettings["ida:AADInstance"];
        private static string tenant = ConfigurationManager.AppSettings["ida:Tenant"];

        // The Post Logout Redirect Uri is the URL where the user will be redirected after they sign out.
        private static string postLogoutRedirectUri = ConfigurationManager.AppSettings["ida:PostLogoutRedirectUri"];

        //Server resource ID is the path where we have registered on azure AD
        private static string serviceResourceID = ConfigurationManager.AppSettings["ida:ServiceResourceID"];

        // The Authority is the sign-in URL of the tenant.
        string authority = String.Format(CultureInfo.InvariantCulture, aadInstance, tenant);

        // this ResourceBaseUrl could be anything (e.g. same web application resource or web api as well but for that we have to again get the access token and then pass for it )
        private static string ResourceBaseUrl = "https://localhost:44369/";
        public void ConfigureAuth(IAppBuilder app) {
            try
            {
                //setting default Authentication type that external middleware should use when browser navigate the url
                app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);

                //adding cookie based authentcation middleware in the application's owin pipeline
                app.UseCookieAuthentication(new CookieAuthenticationOptions());

                //
                app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
                {
                    ClientId = clientId,
                    Authority = authority,
                    RedirectUri = postLogoutRedirectUri,
                    PostLogoutRedirectUri = postLogoutRedirectUri,
                    Notifications = new OpenIdConnectAuthenticationNotifications
                    {

                        //Getting Authorisation Code
                        AuthorizationCodeReceived = async (context) => {
                            var code = context.Code;
                            ClientCredential credential = new ClientCredential(clientId, clientSecret);
                            string userObjectID = context.AuthenticationTicket.Identity.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier").Value;
                            context.AuthenticationTicket.Identity.AddClaim(new Claim("Name", "crazyDeveloper2")); //we can add claims but best way is to mask the claims .

                            AuthenticationContext authContext = new AuthenticationContext(authority, new WebSessionCache(userObjectID));

                            //Aquiring access_token by passing code
                            AuthenticationResult result = await authContext.AcquireTokenByAuthorizationCodeAsync(code, new Uri(ResourceBaseUrl), credential);

                            ;
                        },

                        //here we can add any kind  of notification 
                        AuthenticationFailed = context => {
                            context.Response.Redirect("/Error?message=" + context.Exception.Message);
                            return Task.FromResult(0);
                        }
                    }



                });

            }
            catch (Exception ex)
            {
                var error = ex.Message;
            }
        }
    }
}