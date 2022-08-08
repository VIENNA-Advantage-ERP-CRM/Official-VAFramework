using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;

namespace VIS.Areas.VIS.Controllers
{
    public class CardViewWizardController : Controller
    {
        // GET: VIS/CardViewWizard
        public ActionResult Index(string windowno)
        {
            ViewBag.WindowNumber = windowno;
            if (Session["Ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                ViewBag.lang = ctx.GetAD_Language();
            }

            return PartialView("index");
        }

        public ActionResult GetCardTemplate(string windowno)
        {
            ViewBag.WindowNumber = windowno;
            if (Session["Ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                ViewBag.lang = ctx.GetAD_Language();
            }

            return PartialView("CardTemplateMaster");
        }
    }
}