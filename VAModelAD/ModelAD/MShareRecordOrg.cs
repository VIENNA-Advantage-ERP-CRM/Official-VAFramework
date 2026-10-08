using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.ModelAD
{
    public class MShareRecordOrg : X_AD_ShareRecordOrg
    {
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="rs"></param>
        /// <param name="trxName"></param>
        public MShareRecordOrg(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName)
        {

        }

        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_ShareRecordOrg_ID"></param>
        /// <param name="trxName"></param>
        public MShareRecordOrg(Ctx ctx, int AD_ShareRecordOrg_ID, Trx trxName)
          : base(ctx, AD_ShareRecordOrg_ID, trxName)
        {


        }

        /** Does the org have any record of the table shared with it ("org|table")? Only decides whether the access
         *  filter adds its live AD_ShareRecordOrg subquery, so a stale "yes" is harmless and a stale "no" only hides a
         *  newly shared record until the reset below (or the expiry, e.g. for shares made on another server). */
        private static VAdvantage.Classes.CCache<string, bool> s_orgHasShares
            = new VAdvantage.Classes.CCache<string, bool>("AD_ShareRecordOrg", 50, 10);

        /// <summary>
        /// Has any record of the table been shared with the org? Answered from a cache.
        /// </summary>
        public static bool HasShares(int AD_OrgShared_ID, int AD_Table_ID)
        {
            string key = AD_OrgShared_ID + "|" + AD_Table_ID;
            bool hasShares;
            if (s_orgHasShares.TryGetValue(key, out hasShares))
                return hasShares;
            hasShares = Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(1) FROM AD_ShareRecordOrg WHERE IsActive='Y' AND AD_OrgShared_ID="
                + AD_OrgShared_ID + " AND AD_Table_ID=" + AD_Table_ID)) > 0;
            s_orgHasShares[key] = hasShares;
            return hasShares;
        }

        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (success)
                s_orgHasShares.Reset();     // a new share must show up at once
            return success;
        }

        protected override bool AfterDelete(bool success)
        {
            if (success)
                s_orgHasShares.Reset();
            return success;
        }
    }
}