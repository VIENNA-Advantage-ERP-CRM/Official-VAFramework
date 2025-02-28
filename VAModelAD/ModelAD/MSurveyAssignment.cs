﻿using System;
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

        protected override bool AfterSave(bool newRecord, bool success)
        {
            //if (newRecord)
            //{
                MTabPanel tp = new MTabPanel(GetCtx(), 0, null);
                tp.SetName(Msg.GetMsg(GetCtx(), "SurveyPanelName"));
                tp.SetClassname("VIS.SurveyPanel");
                tp.SetAD_Tab_ID(GetAD_Tab_ID());
                tp.SetAD_Org_ID(0);
                tp.SetAD_Client_ID(0);
                tp.SetSeqNo(10);
                if (!tp.Save()) {
                    log.SaveError("Error", Msg.GetMsg(GetCtx(), "TabPanelNotSaved"));
                    return false;
                }

           //}
            return true;
        }


        /// <summary>
        /// Before Save Logic
        /// </summary>
        /// <param name="newRecord"></param>
        /// <returns></returns>
        protected override bool BeforeSave(bool newRecord)
        {
            if (GetAD_SurveyAssignment_ID() > 0)
            {
                int tableID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_SurveyAssignment WHERE AD_SurveyAssignment_ID=" + GetAD_SurveyAssignment_ID()));
                if(tableID!= GetAD_Table_ID() && IsAD_ShowEverytime())
                {
                    int isExistCondition = Util.GetValueOfInt(DB.ExecuteScalar("SELECT Count(AD_SurveyShowCondition_ID) FROM AD_SurveyShowCondition WHERE AD_SurveyAssignment_ID=" + GetAD_SurveyAssignment_ID()));
                    if (isExistCondition > 0)
                    {
                        log.SaveError("Error", Msg.GetMsg(GetCtx(), "FirstDeleteConditionForUpdate"));
                        return false;
                    }
                }
                else if(!IsAD_ShowEverytime()) {
                    DB.ExecuteQuery("DELETE FROM AD_SurveyShowCondition WHERE AD_SurveyAssignment_ID=" + GetAD_SurveyAssignment_ID());
                }

                DB.ExecuteQuery("DELETE FROM AD_TabPanel WHERE Classname='VIS.SurveyPanel' AND AD_Tab_ID IN (SELECT AD_Tab_ID FROM AD_SurveyAssignment WHERE AD_SurveyAssignment_ID=" + GetAD_SurveyAssignment_ID() + ")");  
            }
            DB.ExecuteQuery("DELETE FROM AD_TabPanel WHERE Classname='VIS.SurveyPanel' AND AD_Client_ID=" + GetAD_Client_ID() + " AND AD_Tab_ID IN (" + GetAD_Tab_ID() + ")");

            string sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE AD_Window_ID=" + GetAD_Window_ID() + " AND ad_table_id=" + GetAD_Table_ID() + " AND ad_showeverytime='N' AND isActive='Y' AND AD_Client_ID="+GetAD_Client_ID();

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
            else if (IsAD_ShowEverytime() == true)
            {
                sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE AD_Window_ID=" + GetAD_Window_ID() + " AND ad_table_id=" + GetAD_Table_ID() + " AND ad_showeverytime='N' AND isActive='Y' AND AD_Client_ID=" + GetAD_Client_ID();
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
            else if (IsAD_ShowEverytime() == false)
            {
                sql = "SELECT count(AD_SurveyAssignment_ID) FROM AD_SurveyAssignment WHERE AD_Window_ID=" + GetAD_Window_ID() + " AND ad_table_id=" + GetAD_Table_ID() + " AND ad_showeverytime='N' AND AD_Survey_ID=" + GetAD_Survey_ID() + " AND isActive='Y' AND AD_Client_ID=" + GetAD_Client_ID();
                if (!newRecord)
                {
                    sql += " AND AD_SurveyAssignment_ID !=" + GetAD_SurveyAssignment_ID();
                }
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

        /// <summary>
        /// Before Delete Logic
        /// </summary>
        /// <returns></returns>
        protected override bool BeforeDelete()
        {
            DB.ExecuteQuery("DELETE FROM AD_TabPanel WHERE Classname='VIS.SurveyPanel' AND AD_Tab_ID IN (SELECT AD_Tab_ID FROM AD_SurveyAssignment WHERE AD_SurveyAssignment_ID=" + GetAD_SurveyAssignment_ID() + ")");
            return true;
        }
    }
}
