using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class WFManualController : Controller
    {
        /// <summary>
        /// Get Document Process workflows
        /// </summary>
        /// <returns>Document Process Workflow details</returns>
        public JsonResult GetWorkflows(int AD_Table_ID, int Record_ID, int AD_Window_ID)
        {
            WFManualModel obj = new WFManualModel();
            Ctx ctx = Session["ctx"] as Ctx;
            List<WFDetails> _wfDet = obj.GetWFDetails(ctx, AD_Table_ID);
            WFActivityDetails _wfActInfo = obj.GetWFActivity(ctx, AD_Table_ID, Record_ID);
            bool _processing = obj.IsWFInExecution(ctx, AD_Table_ID, Record_ID);
            WFInfo _wfInfo = obj.GetAppActivities(ctx, AD_Window_ID, Record_ID);
            return Json(JsonConvert.SerializeObject(new { wfDetails = _wfDet, processing = _processing, wfActInfo = _wfActInfo, wfAppInfo = _wfInfo }), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Save and execute workflows in sequence
        /// </summary>
        /// <returns>Save and execute workflows in sequence</returns>
        public JsonResult SaveExecuteWF(int AD_Table_ID, string AD_Workflow_IDs, int Record_ID, int AD_Window_ID)
        {
            WFManualModel obj = new WFManualModel();
            Ctx ctx = Session["ctx"] as Ctx;
            WFExecStatus retRes = obj.SaveExecuteWF(ctx, AD_Table_ID, AD_Workflow_IDs, Record_ID, AD_Window_ID);
            return Json(JsonConvert.SerializeObject(retRes), JsonRequestBehavior.AllowGet);
        }
    }
}