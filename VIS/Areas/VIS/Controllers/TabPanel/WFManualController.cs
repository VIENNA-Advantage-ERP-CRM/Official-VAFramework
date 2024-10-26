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
        public JsonResult GetWorkflows(int AD_Table_ID, int Record_ID)
        {
            WFManualModel obj = new WFManualModel();
            Ctx ctx = Session["ctx"] as Ctx;
            List<WFDetails> _wfDet = obj.GetWFDetails(ctx, AD_Table_ID);
            bool isProcessing = obj.GetWFActivity(ctx, AD_Table_ID, Record_ID);
            return Json(JsonConvert.SerializeObject(new { wfDetails = _wfDet, processing = isProcessing }), JsonRequestBehavior.AllowGet);
        }
    }
}