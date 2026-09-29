/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : MDashboard
 * Purpose        : Home dashboard header (role-wise named widget dashboards).
 ******************************************************/
using System;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MDashboard : X_AD_Dashboard
    {
        public MDashboard(Ctx ctx, int AD_Dashboard_ID, Trx trxName)
            : base(ctx, AD_Dashboard_ID, trxName) { }

        public MDashboard(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName) { }
    }
}
