using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MGridLayout:X_AD_GridLayout
    {
        public MGridLayout(Ctx ctx, int AD_GridLayout_ID, Trx trxName)
           : base(ctx, AD_GridLayout_ID, trxName)
        {


        }
    }
}
