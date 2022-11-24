using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MSurveyAssignment : X_AD_SurveyAssignment
    {
        /// <summary>
        /// Load constructor
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="dr"></param>
        /// <param name="trx"></param>
        public MSurveyAssignment(Ctx ctx, DataRow dr, Trx trx)
           : base(ctx, dr, trx)
        {

            // TODO Auto-generated constructor stub
        }
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx">ctx</param>
        /// <param name="AD_SurveyAssignment_ID">AD_SurveyAssignment_ID</param>
        /// <param name="trx">trx</param>
        public MSurveyAssignment(Ctx ctx, int AD_SurveyAssignment_ID, Trx trx)
            : base(ctx, AD_SurveyAssignment_ID, trx)
        {
        }

        /// <summary>
        /// Before Save Logic
        /// </summary>
        /// <param name="newRecord"></param>
        /// <returns></returns>
        protected override bool BeforeSave(bool newRecord)
        {
            string sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE ad_window_id=" + GetAD_Window_ID() + " AND ad_tab_id=" + GetAD_Tab_ID() + " AND ad_showeverytime='Y' AND isActive='Y'";
            if (!newRecord)
            {
                sql += " AND AD_SurveyAssignment_ID !=" + GetAD_SurveyAssignment_ID();
            }
            int count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            if (count > 0)
            {
                log.SaveError("Error", Msg.GetMsg(GetCtx(), "UniqueShowEveryTime"));
                return false;
            }
            else if(IsAD_ShowEverytime()==true)
            {
                sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE ad_window_id=" + GetAD_Window_ID() + " AND ad_tab_id=" + GetAD_Tab_ID() + " AND ad_showeverytime='N' AND isActive='Y'";
                if (!newRecord)
                {
                    sql += " AND AD_SurveyAssignment_ID !=" + GetAD_SurveyAssignment_ID();
                }
                count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
                if (count > 0)
                {
                    log.SaveError("Error", Msg.GetMsg(GetCtx(), "ShowEveryTimeNotbeTrue"));
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else if(IsAD_ShowEverytime() == false)
            {
                sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE ad_window_id=" + GetAD_Window_ID() + " AND ad_tab_id=" + GetAD_Tab_ID() + " AND ad_showeverytime='N' AND AD_Survey_ID="+GetAD_Survey_ID()+" AND isActive='Y'";
                count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
                if (count > 0)
                {
                    log.SaveError("Error", Msg.GetMsg(GetCtx(), "shouldNotbeSameSurvey"));
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return true;
            }
        }
    }
}
