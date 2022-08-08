using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MGridLayoutItems:X_AD_GridLayoutItems
    {
        public MGridLayoutItems(Ctx ctx, int AD_GridLayoutItems_ID, Trx trxName)
           : base(ctx, AD_GridLayoutItems_ID, trxName)
        {


        }
    }
}
