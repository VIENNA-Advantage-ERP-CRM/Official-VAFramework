using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Filters;
using VIS.Models;

namespace VIS.Controllers
{
    public class VSetupController : Controller
    {
        //
        // GET: /VIS/VSetup/
        public ActionResult Index(string windowno)
        {
            return View();
        }

        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult GetInitialData()
        {
            VSetupModel model = new VSetupModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(new { result = model.GetInitialData(ctx) }, JsonRequestBehavior.AllowGet);
            //return Json(new { result = "ok" }, JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Localization packages - kept out of GetInitialData because it is a
        /// Market API call, the form loads without waiting for it.
        /// </summary>
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult GetLocalizationPackages()
        {
            VSetupModel model = new VSetupModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(new { result = model.GetLocalizationPackages(ctx) }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Asked by the setup screen when the tenant name field loses focus, so a name
        /// AD_Client already holds is reported before the rest of the form is filled in -
        /// otherwise InitailizeClientSetup is the first to say so, after Done.
        /// </summary>
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult IsTenantNameAvailable(string clientName)
        {
            VSetupModel model = new VSetupModel();
            return Json(new { result = model.IsTenantNameAvailable(clientName) }, JsonRequestBehavior.AllowGet);
        }

        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult InitailizeClientSetup(string clientName, string orgName, string userClient, string userOrg, string city,
            int currencyID, string currencyName, int countryID, string countryName, int regionID, string regionName,
            bool cfProduct, bool cfBPartner, bool cfProject, bool cfMCampaign, bool cfSRegion, string fileName, string folderKey,
            string selectedPackage)
        {
            VSetupModel model = new VSetupModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(new
            {
                result = model.InitailizeClientSetup(clientName, orgName, userClient, userOrg, city,
            currencyID, currencyName, countryID, countryName, regionID, regionName,
            cfProduct, cfBPartner, cfProject, cfMCampaign, cfSRegion, fileName, folderKey, selectedPackage, ctx)
            }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Module install progress for one tenant creation run. The screen polls this
        /// with the LogKey InitailizeClientSetup handed back.
        ///
        /// No AjaxSessionFilter on purpose: installing modules writes files into the
        /// running application, so the AppDomain restarts and the in process session is
        /// gone - the filter would answer 999 for the rest of the installation and the
        /// screen would never get to show that it finished. The log is read from the log
        /// key alone, and AjaxAuthorize still applies (forms auth is a cookie, so it
        /// survives the restart).
        /// </summary>
        [AjaxAuthorizeAttribute]
        public JsonResult GetInstallLog(string logKey)
        {
            VSetupModel model = new VSetupModel();
            //  null once the session has been dropped by the restart - GetInstallLog allows it
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(new { result = model.GetInstallLog(ctx, logKey) }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get Region accroding to country
        /// </summary>
        /// <param name="countryID"></param>
        /// <returns>region</returns>
        public JsonResult GetRegion(int countryID)
        {
            VSetupModel model = new VSetupModel();
            Ctx ctx = Session["ctx"] as Ctx;
            return Json(new { result = model.GetRegion(ctx, countryID) }, JsonRequestBehavior.AllowGet);
        }
    }
}