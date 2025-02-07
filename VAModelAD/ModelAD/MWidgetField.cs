using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MWidgetField: X_AD_WidgetField
    {
        public MWidgetField(Ctx ctx, DataRow rs, Trx trxName)
          : base(ctx, rs, trxName)
        {
        }

        public MWidgetField(Ctx ctx, int AD_Widget_ID, Trx trxName)
           : base(ctx, AD_Widget_ID, trxName)
        {

        }     

    }
}
