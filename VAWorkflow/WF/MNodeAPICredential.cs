using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using VAdvantage.Utility;
using VAdvantage.DataBase;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MNodeAPICredential : X_NodeAPICredential
    {

        public MNodeAPICredential(Ctx ctx, DataRow dr, Trx trxName)
             : base(ctx, dr, trxName)
        {
        }

        public MNodeAPICredential(Ctx ctx, int dr, Trx trxName)
            : base(ctx, dr, trxName)
        {
        }
    }
}