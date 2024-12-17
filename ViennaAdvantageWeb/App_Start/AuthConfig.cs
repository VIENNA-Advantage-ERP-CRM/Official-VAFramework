using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//using Microsoft.Web.WebPages.OAuth;


namespace ViennaAdvantageWeb
{
    public static class AuthConfig
    {
        public static void RegisterAuth(Owin.IAppBuilder app)
        {
            
            ViennaBase.AuthConfig.RegisterAuth(app);
        }
    }
}
