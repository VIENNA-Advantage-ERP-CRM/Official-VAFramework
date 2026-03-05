/********************************************************
* Project Name   : VAdvantage
* Class Name     : MClientInfo
* Purpose        : Client info using AD_ClientInfo table
* Class Used     : X_AD_ClientInfo
* Chronological    Development
* Raghunandan      28-04-2009
 ******************************************************/
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Process;
using VAdvantage.SqlExec;
using VAdvantage.Utility;


namespace VAModelAD.Model
{
    public class ClientInfo
    {
        
        /**	Cache						*/
        private static CCache<int, X_AD_ClientInfo> s_cache = new CCache<int, X_AD_ClientInfo>("ClientInfo", 2);
        /// <summary>
        /// Get Client Info
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_Client_ID">id</param>
        /// <returns>Client Info</returns>
        public static X_AD_ClientInfo Get(Ctx ctx, int AD_Client_ID)
        {
            return Get(ctx, AD_Client_ID, null);
        }	//	get

        /// <summary>
        /// Get Client Info
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_Client_ID">id</param>
        /// <param name="trxName">optional trx</param>
        /// <returns>Client Info</returns>
        public static X_AD_ClientInfo Get(Ctx ctx, int AD_Client_ID, Trx trxName)
        {
            int key = AD_Client_ID;
            X_AD_ClientInfo info = (X_AD_ClientInfo)s_cache[key];
            if (info != null)
            {
                return info;
            }
            //
            String sql = "SELECT * FROM AD_ClientInfo WHERE AD_Client_ID=" + AD_Client_ID;
            DataSet ds = null;
            try
            {
                ds = DB.ExecuteDataset(sql, null, trxName);
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    DataRow dr = ds.Tables[0].Rows[i];
                    info = new X_AD_ClientInfo(ctx, dr, null);
                    if (trxName == null)
                    {
                        s_cache.Add(key, info);
                    }
                }
            }
            catch (Exception ex)
            {
                VLogger.Get().Log(Level.SEVERE, sql, ex);
            }
            ds = null;
            return info;
        }

        /// <summary>
        ///Get optionally cached client
        /// </summary>
        /// <param name="ctx">context</param>
        /// <returns>client</returns>
        public static X_AD_ClientInfo Get(Ctx ctx)
        {
            return Get(ctx, ctx.GetAD_Client_ID(), null);
        }

    }
}