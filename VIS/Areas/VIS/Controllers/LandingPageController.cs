using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace VIS.Controllers
{
    public class LandingPageController : Controller
    {
        // GET: VIS/LandingPage
        public ActionResult Index()
        {
            return PartialView();
        }
    }
}