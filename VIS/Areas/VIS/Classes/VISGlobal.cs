using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
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

            AppDomain.CurrentDomain.AssemblyResolve += (s, args) =>
            {
                var requested = new AssemblyName(args.Name);
                // Step 1: Check if already loaded in current AppDomain (but different version)
                var loadedAssembly = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(a => a.GetName().Name == requested.Name);
                if (loadedAssembly != null)
                {
                    return loadedAssembly;
                }

                // Step 2: Try loading from bin folder (even if version differs)
                string binPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin");
                string candidateDll = Path.Combine(binPath, requested.Name + ".dll");
                if (File.Exists(candidateDll))
                {
                    try
                    {
                        return Assembly.LoadFrom(candidateDll);
                    }
                    catch (Exception ex)
                    {
                        // Optional: Log this exception somewhere
                    }
                }
                return null; // Let default behavior happen if not handled
            };
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