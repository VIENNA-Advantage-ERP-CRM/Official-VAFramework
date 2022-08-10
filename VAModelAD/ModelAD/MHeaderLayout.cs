using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MHeaderLayout:X_AD_HeaderLayout
    {
        public MHeaderLayout(Ctx ctx, int AD_HeaderLayout_ID, Trx trxName)
           : base(ctx, AD_HeaderLayout_ID, trxName)
        {


        }
    }
}
