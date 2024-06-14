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
    public class MUserHomeWidget: X_AD_UserHomeWidget
    {
        public MUserHomeWidget(Ctx ctx, DataRow rs, Trx trxName)
           : base(ctx, rs, trxName)
        {
        }
        public MUserHomeWidget(Ctx ctx, int AD_UserHomeWidget_ID, Trx trxName)
           : base(ctx, AD_UserHomeWidget_ID, trxName)
        {
          
        }
    }
}
