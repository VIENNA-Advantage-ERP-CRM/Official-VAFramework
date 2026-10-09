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
using VIS.Filters;
using VIS.Helpers;
using VIS.Models;

namespace VIS.Areas.VIS.Controllers
{
    [AjaxAuthorizeAttribute] // redirect to login page if reques`t is not Authorized
    [AjaxSessionFilterAttribute] // redirect to Login/Home page if session expire
    [AjaxValidateAntiForgeryToken] // validate antiforgery token    
    public class LookupController : Controller
    {
        // GET: VIS/Lookup
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult GetLookupData(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize, string LookupData)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result =  lHelper.GetLookupData(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize, LookupData);
            var jsonResult= Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        /** Most lookups one batch may carry */
        private const int MAX_LOOKUP_BATCH = 200;

        /// <summary>
        /// Several GetLookupData requests in one (the lookups of a tab being built). Each item has the parameters of
        /// GetLookupData; the answer is an array with, per item, exactly the string GetLookupData returns (or null if
        /// that item failed), so the browser handles each one as before. Saves a request per lookup field, which the
        /// per-user session lock otherwise answers one after another.
        /// </summary>
        /// <param name="Items">JSON array of { WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize, LookupData }</param>
        [HttpPost]
        public ActionResult GetLookupDataBatch(string Items)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            var results = new List<string>();
            Newtonsoft.Json.Linq.JArray items = string.IsNullOrEmpty(Items) ? new Newtonsoft.Json.Linq.JArray() : Newtonsoft.Json.Linq.JArray.Parse(Items);
            if (items.Count > MAX_LOOKUP_BATCH)
                return new HttpStatusCodeResult(400, "Too many lookups in one batch");

            LookupHelper lHelper = new LookupHelper();
            foreach (Newtonsoft.Json.Linq.JToken item in items)
            {
                try
                {
                    object result = lHelper.GetLookupData(ctx, (int)item["WindowNo"], (int)item["AD_Window_ID"], (int)item["AD_Tab_ID"],
                        (int)item["AD_Field_ID"], (string)item["Values"], (int)item["PageSize"], (string)item["LookupData"]);
                    results.Add(JsonConvert.SerializeObject(result));
                }
                catch (Exception)
                {
                    results.Add(null);  // this lookup only: the browser treats it like a failed single request
                }
            }
            return Content(JsonConvert.SerializeObject(results), "text/plain", System.Text.Encoding.UTF8);
        }

        //[HttpPost]
        //public async Task<ActionResult> GetLookupData(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize, string LookupData)
        //{
        //    Ctx ctx = Session["ctx"] as Ctx;
        //    LookupHelper lHelper = new LookupHelper();
        //    object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupData(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize, LookupData));
        //    var jsonResult = Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        //    jsonResult.MaxJsonLength = int.MaxValue;
        //    return jsonResult;
        //}

        [HttpPost]
        public async Task<ActionResult> GetLookupAll(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize, string LookupData)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupAll(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Values, PageSize, LookupData));
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<ActionResult> GetLookupDirect(int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, object Key, bool IsNumber,string LookupData)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper lHelper = new LookupHelper();
            object result = await System.Threading.Tasks.Task.Run(() => lHelper.GetLookupDirect(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, Key, IsNumber,LookupData));
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

    }


}