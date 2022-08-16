using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VISLogic.Models;

namespace VIS.Areas.VIS.Controllers
{
    public class ArchiveViewerController : Controller
    {
        ArchiveViewerModel model = new ArchiveViewerModel();
        // GET: VIS/ArchiveViewer
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetUserList()
        {
           object data =  model.GetUserList(Session["ctx"] as Ctx);
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetUserName(string userId)
        {
            object data = model.GetUserName(userId);
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetArchieveData(string whereClause)
        {
            object data = model.GetArchieveData(whereClause, Session["ctx"] as Ctx);
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }
    }
}