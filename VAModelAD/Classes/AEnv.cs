/********************************************************
 * Module Name    : 
 * Purpose        : 
 * Class Used     : 
 * Chronological Development
 * Veena Pandey     28-May-2009
 ******************************************************/

using System;
using System.Collections.Generic;
//using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using VAdvantage.Model;
using VAdvantage.Process;
using VAdvantage.SqlExec;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Utility;
using VAdvantage.Classes;
using VAdvantage.Common;

using System.Windows.Forms;
using System.Runtime.Remoting.Channels;
using VAdvantage.Controller;

namespace VAdvantage.Classes
{
    /// <summary>
    /// 
    /// </summary>
    public class AEnv
    {
        /** Workflow Menu		*/
       // private static bool? _workflow = null;
        /** Workflow Menu		*/
        //private static int workflowWindowID = 0;

        private static VLogger log = VLogger.GetVLogger(typeof(AEnv).FullName);


        /**	Window Cache		*/
        private static CCache<string, GridWindowVO> s_windows
            = new CCache<string, GridWindowVO>("AD_Window", 10);

        /// <summary>
        /// Window cache key: everything the window definition depends on (role access unless skipRole, org, language,
        /// the user's show translation/accounting/advanced preferences), separated so that IDs cannot run together
        /// (window 1 + client 11 and window 11 + client 1 used to share a key).
        /// </summary>
        private static string WindowCacheKey(Ctx ctx, int AD_Window_ID)
        {
            return string.Join("|", AD_Window_ID, ctx.GetAD_Client_ID(), ctx.GetAD_Role_ID(), ctx.GetAD_Org_ID(),
                ctx.GetAD_Language(), ctx.GetContext("#AD_FilteredOrg"), ctx.GetContext("skipRole"),
                ctx.GetContext("#ShowTrl"), ctx.GetContext("#ShowAcct"), ctx.GetContext("#ShowAdvanced"));
        }

        /// <summary>
        /// Get Window Model object from cache 
        /// </summary>
        /// <param name="WindowNo">window Number </param>
        /// <param name="AD_Window_ID">window id </param>
        /// <param name="AD_Menu_ID"> menu id </param>
        /// <returns>return windowVo if found</returns>
        public static GridWindowVO GetMWindowVO(Ctx ctx, int windowNo, int AD_Window_ID, int AD_Menu_ID)
        {
            log.Config("Window=" + windowNo + ", AD_Window_ID=" + AD_Window_ID);
            GridWindowVO mWindowVO = null;
            string format = WindowCacheKey(ctx, AD_Window_ID);
            if (AD_Window_ID != 0)// && Ini.IsCacheWindow())	//	try cache always
            {

                mWindowVO = s_windows[format];
                if (mWindowVO != null)
                {
                    mWindowVO = mWindowVO.Clone(ctx,windowNo);
                    //log.Info("Cached=" + mWindowVO);
                }
            }

            //  Create Window Model on Client
            if (mWindowVO == null)
            {
                log.Config("create local");
                mWindowVO = GridWindowVO.Create(ctx, windowNo, AD_Window_ID, AD_Menu_ID);
                if (mWindowVO != null)
                {
                    s_windows[format] = mWindowVO;
                    // the caller gets a copy, as on a cache hit, so its changes never reach the cached definition
                    GridWindowVO copy = mWindowVO.Clone(ctx, windowNo);
                    if (copy != null)
                        mWindowVO = copy;
                }
            }	//	from Client
            if (mWindowVO == null)
                return null;

            //  Check (remote) context
            //Utility.Ctx ctx = Utility.Env.GetContext();
            if (!mWindowVO.GetCtx().Equals(ctx))
            {
            }
            return mWindowVO;
        }   //  getWindow

        public static GridWindowVO GetMWindowOriginalVO(Ctx ctx, int windowNo, int AD_Window_ID, int AD_Menu_ID)
        {
            log.Config("Window=" + windowNo + ", AD_Window_ID=" + AD_Window_ID);
            GridWindowVO mWindowVO = null;
            string format = WindowCacheKey(ctx, AD_Window_ID);
            if (AD_Window_ID != 0)// && Ini.IsCacheWindow())	//	try cache always
            {

                mWindowVO = s_windows[format];
            }
            return mWindowVO;
        }

                    public static bool CheckServerConnection(string hostNameOrAddress = null)
        {
            bool pingStatus = false;

            using (System.Net.NetworkInformation.Ping p = new System.Net.NetworkInformation.Ping())
            {
                string data = "aaaaaa";
                byte[] buffer = Encoding.ASCII.GetBytes(data);
                int timeout = 120;
                try
                {
                    System.Net.NetworkInformation.PingReply reply = p.Send(hostNameOrAddress ?? "ViennaSolutions.com", timeout, buffer);
                    pingStatus = (reply.Status == System.Net.NetworkInformation.IPStatus.Success);
                }
                catch (Exception)
                {
                    pingStatus = false;
                }
            }
            return pingStatus;
        }


        public static bool DnsTest(string dns = null)
        {
            try
            {
                System.Net.IPHostEntry ipHe = System.Net.Dns.GetHostEntry(dns);
                return true;
            }
            catch
            {
                return false;
            }
        }




    }

}
