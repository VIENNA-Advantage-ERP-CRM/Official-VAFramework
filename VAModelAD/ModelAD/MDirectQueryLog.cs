using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Model;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.ModelAD
{
    public class MDirectQueryLog: X_AD_DirectQueryLog
    {
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="M_MovementLineConfirm_ID">id</param>
        /// <param name="trxName">transaction</param>
        public MDirectQueryLog(Ctx ctx, int M_DirectQueryLog_ID, Trx trxName)
            : base(ctx, M_DirectQueryLog_ID, trxName)
        {
        }

        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="dr">data row</param>
        /// <param name="trxName">transation</param>
        public MDirectQueryLog(Ctx ctx, DataRow dr, Trx trxName)
            : base(ctx, dr, trxName)
        {
        }
    }
}
