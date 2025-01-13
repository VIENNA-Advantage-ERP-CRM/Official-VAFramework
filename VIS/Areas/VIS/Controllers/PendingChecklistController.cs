using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Areas.VIS.Models;
using VIS.Models;

namespace VIS.Controllers
{
    public class PendingChecklistController : Controller
    {
        // GET: VIS/PendingChecklist
        public ActionResult Index()
        {
            return View();
        }
        public JsonResult PendingCheckList()
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                PendingChecklist obj = new PendingChecklist();
                result = obj.PendingCheckList();
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
    }
}