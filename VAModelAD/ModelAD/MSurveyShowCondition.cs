using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAModelAD.Model
{
    public class MSurveyShowCondition : X_AD_SurveyShowCondition
    {
        /// <summary>
        /// Load constructor
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="dr"></param>
        /// <param name="trx"></param>
        public MSurveyShowCondition(Ctx ctx, DataRow dr, Trx trx)
           : base(ctx, dr, trx)
        {

            // TODO Auto-generated constructor stub
        }
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx">ctx</param>
        /// <param name="AD_SurveyShowCondition_ID">AD_SurveyShowCondition_ID</param>
        /// <param name="trx">trx</param>
        public MSurveyShowCondition(Ctx ctx, int AD_SurveyShowCondition_ID, Trx trx)
            : base(ctx, AD_SurveyShowCondition_ID, trx)
        {
        }
        
    }
}
