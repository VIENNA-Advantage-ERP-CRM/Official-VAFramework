using Microsoft.Owin;
using Owin;
using System;
using System.Threading.Tasks;

[assembly: OwinStartup(typeof(ViennaAdvantageWeb.Startup))]

namespace ViennaAdvantageWeb
{
    public class Startup
    {
        /// <summary>
        /// Configure OWIN to use OpenIdConnect 
        /// </summary>
        /// <param name="app"></param>
        public void Configuration(IAppBuilder app)
        {
            AuthConfig.RegisterAuth(app);
        }
    }
}
