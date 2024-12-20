using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.SessionState;
using VAdvantage.Classes;
using VAdvantage.Utility;

namespace VIS.Areas.VIS.Classes
{
    public class VISGlobal
    {
        public HttpSessionState _session;
       

        public void Application_Start(object sender, EventArgs e)
        {           
            AntiForgeryConfig.UniqueClaimTypeIdentifier = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        }

        public void Session_Start(object sender, EventArgs e)
        {

        }

        public void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        public void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        public void Application_Error(object sender, EventArgs e)
        {

        }

        public void Session_End(object sender, EventArgs e)
        {
            SessionEventHandler.SessionEnd(_session["ctx"] as Ctx, _session.SessionID);
        }

        public void Application_End(object sender, EventArgs e)
        {

        }

    }
}