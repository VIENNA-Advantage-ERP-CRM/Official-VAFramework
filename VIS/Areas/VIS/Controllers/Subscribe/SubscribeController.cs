using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using VAdvantage.Utility;
using VIS.Filters;
using VIS.Models;

namespace VIS.Controllers
{
    public class SubscribeController : Controller
    {
        /// <summary>
        /// Insert Multiple Subscription
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult MultipleSubscribe(int AD_Window_ID, List<int> Record_ID, int AD_Table_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            SubscribeModel model = new SubscribeModel(ct);
            var result = model.InsertMultipleSubscription(ct, AD_Window_ID, Record_ID, AD_Table_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult Subscribe(int AD_Window_ID, int Record_ID, int AD_Table_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            SubscribeModel model = new SubscribeModel(ct);
            var result = model.InsertSubscription(AD_Window_ID, Record_ID, AD_Table_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// UnSubscribeMultiple
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="Record_IDs"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>

        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult UnSubscribeMultiple(int AD_Window_ID, List<int> Record_IDs, int AD_Table_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            SubscribeModel model = new SubscribeModel(ct);
            var result = model.DeleteMultipleSubscription(ct, AD_Window_ID, Record_IDs, AD_Table_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult UnSubscribe(int AD_Window_ID, int Record_ID, int AD_Table_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            SubscribeModel model = new SubscribeModel(ct);
            var result = model.DeleteSubscription(AD_Window_ID, Record_ID, AD_Table_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Subcribe all records
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="AD_Record_ID"></param>
        /// <returns></returns>
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult SubscribeAll(int AD_Window_ID, int AD_Tab_ID, int AD_Table_ID, int AD_Record_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            SubscribeModel model = new SubscribeModel();
            var result = model.SubscribeAll(ctx, AD_Window_ID, AD_Tab_ID, AD_Table_ID, AD_Record_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get Unread message count
        /// </summary>
        /// <returns></returns>
        public JsonResult UnreadMessageCount()
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                SubscribeModel obj = new SubscribeModel();
                result = obj.UnreadMessageCount(ctx);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
    }
}