﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Model;
using VIS.Models;

namespace VIS.Controllers
{
    public class SurveyPanelController : Controller
    {
        /// <summary>
        /// Getting Survey Details
        /// </summary>
        /// <returns>Survey Details Records</returns>
        public JsonResult GetSurveyAssignments(string AD_window_ID, string AD_Tab_ID, int AD_Table_ID, int AD_Record_ID, int AD_WF_Activity_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.GetSurveyAssignments(ctx, Util.GetValueOfInt(AD_window_ID), Util.GetValueOfInt(AD_Tab_ID),AD_Table_ID,AD_Record_ID, AD_WF_Activity_ID)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get the survey itesms based on survey ID
        /// </summary>
        /// <param name="AD_Survey_ID">Survey ID</param>
        /// <returns>List of survey items and it's values.</returns>
        public JsonResult GetSurveyItems(string AD_Survey_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.GetSurveyItems(ctx, Util.GetValueOfInt(AD_Survey_ID))), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Save Survey Response Value
        /// </summary>
        /// <param name="surveyResponseValue"></param>
        /// <returns></returns>
        public JsonResult SaveSurveyResponse(List<SurveyResponseValue> surveyResponseValue, int AD_Window_ID, int AD_Survey_ID, int Record_ID, int AD_Table_ID, int AD_WF_Activity_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            int result = obj.SaveSurveyResponse(ctx, surveyResponseValue, AD_Window_ID, AD_Survey_ID, Record_ID, AD_Table_ID, AD_WF_Activity_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Check any record exist in checklist response for docAction
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="DocAction"></param>
        /// <returns></returns>
        public JsonResult CheckDocActionCheckListResponse(int AD_Window_ID, int AD_Tab_ID, int Record_ID, string DocAction,int AD_Table_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.CheckDocActionCheckListResponse(ctx,AD_Window_ID,  AD_Tab_ID,  Record_ID, DocAction,AD_Table_ID)), JsonRequestBehavior.AllowGet);
        }
        
        public JsonResult CheckDocActionInTable(int fields)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.CheckDocActionInTable(fields)), JsonRequestBehavior.AllowGet);
        } 
        public JsonResult CalloutGetTableIDByTab(int fields)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.CalloutGetTableIDByTab(fields)), JsonRequestBehavior.AllowGet);
        }
        
        /// <summary>
        /// Get Response List
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="AD_User_ID"></param>
        /// <returns></returns>
        public JsonResult GetResponseList(int AD_Window_ID, int AD_Table_ID, int Record_ID,int AD_User_ID,int AD_SurveyResponse_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.GetResponseList(ctx, AD_Window_ID, AD_Table_ID, Record_ID,AD_User_ID, AD_SurveyResponse_ID)), JsonRequestBehavior.AllowGet);
        } 
        public JsonResult CheckResponseAccess(int AD_Survey_ID, int AD_SurveyAssignment_ID, int AD_User_ID, int AD_Role_ID, int Record_ID, int AD_Window_ID, int AD_Table_ID,bool IsSelfShow)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.CheckResponseAccess(ctx, AD_Survey_ID, AD_SurveyAssignment_ID, AD_User_ID, AD_Role_ID, Record_ID, AD_Window_ID, AD_Table_ID, IsSelfShow)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Check Checklist Required
        /// </summary>
        /// <param name="Record_ID"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public JsonResult IsCheckListRequire(int Record_ID, int AD_Window_ID, int AD_Table_ID)
        {
            SurveyPanelModel obj = new SurveyPanelModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(JsonConvert.SerializeObject(obj.IsCheckListRequire(ctx, AD_Window_ID, AD_Table_ID, Record_ID)), JsonRequestBehavior.AllowGet);
        }

    }
}