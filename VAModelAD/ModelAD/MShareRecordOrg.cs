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
    }
}