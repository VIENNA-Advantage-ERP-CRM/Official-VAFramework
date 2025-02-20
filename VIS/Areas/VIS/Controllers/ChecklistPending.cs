/************************************************************
* Module Name    : Framework
* Purpose        : ChecklistPending
* chronological  : Development
* Created Date   : 12 December 2024
* Created by     : Yashit(VAI058)
*************************************************************/
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
    public class ChecklistPendingController : Controller
    {
        // GET: VIS/ChecklistPending
        public ActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// Pending Checklist Count
        /// </summary>
        /// <returns></returns>
        public JsonResult PendingChecklist()
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                PendingChecklist obj = new PendingChecklist();
                result = obj.PendingChecklistWidget(ctx);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Zoom Child Tab Records
        /// </summary>
        /// <returns></returns>
        public JsonResult ZoomChildTabRecords(int AD_table_ID, int AD_Window_ID, string RecordIds)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                PendingChecklist obj = new PendingChecklist();
                result = obj.ZoomChildTabRecords(ctx, AD_Window_ID, AD_table_ID, RecordIds);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
    }
}