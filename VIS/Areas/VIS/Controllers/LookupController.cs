using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Classes;
using VAdvantage.Controller;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using VIS.Classes;
using VIS.DataContracts;
using VIS.Helpers;
using VIS.Models;

namespace VIS.Areas.VIS.Controllers
{
    public class LookupController : Controller
    {
        // GET: VIS/Lookup
        public ActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> GetLookupData(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupData(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize));
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public async Task<ActionResult> GetLookupAll(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupAll(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize));
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public async Task<ActionResult> GetLookupDirect(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, object Key, bool IsNumber)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupDirect(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Key, IsNumber));
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

    }


}