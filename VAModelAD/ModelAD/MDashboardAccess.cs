/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : MDashboardAccess
 * Purpose        : Dashboard-to-role assignment; enforces a single default per role.
 ******************************************************/
using System;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MDashboardAccess : X_AD_Dashboard_Access
    {
        public MDashboardAccess(Ctx ctx, int AD_Dashboard_Access_ID, Trx trxName)
            : base(ctx, AD_Dashboard_Access_ID, trxName) { }

        public MDashboardAccess(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName) { }

        /// <summary>
        /// Only one default dashboard per role: marking this row default clears the flag
        /// on every other dashboard assigned to the same role.
        /// </summary>
        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (success && IsDefault() && (newRecord || Is_ValueChanged("IsDefault") || Is_ValueChanged("AD_Role_ID")))
            {
                DB.ExecuteQuery("UPDATE AD_Dashboard_Access SET IsDefault='N' WHERE IsDefault='Y' AND AD_Role_ID=" + GetAD_Role_ID()
                    + " AND AD_Dashboard_Access_ID<>" + GetAD_Dashboard_Access_ID(), null, Get_TrxName());
            }
            return success;
        }
    }
}
