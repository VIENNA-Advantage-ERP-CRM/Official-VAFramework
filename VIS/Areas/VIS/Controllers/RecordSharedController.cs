/********************************************************
 * Module Name    : Vienna Advantage Framework
 * Purpose        : Show Shared records indo
 * Class Used     : RecordShared.js, recordShared.cs,
 * Created By     : VIS0228
 * Date           : 09-Nov-2022
**********************************************************/
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
    /// <summary>
    /// This class is used for record share with other organization
    /// VIS0228 09-Nov-2022
    /// </summary>
    public class RecordSharedController : Controller
    {
        /// <summary>
        /// Get Organization Summary
        /// </summary>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public JsonResult GetOrganization(int AD_Table_ID, int Record_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            RecordShared model = new RecordShared();
            return Json(JsonConvert.SerializeObject(model.GetOrganization(ctx, AD_Table_ID, Record_ID)), JsonRequestBehavior.AllowGet); ;
        }

        /// <summary>
        ///  Get Shared Record
        /// </summary>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>

        public JsonResult GetSharedRecord(int AD_Table_ID, int Record_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            RecordShared model = new RecordShared();
            return Json(JsonConvert.SerializeObject(model.GetSharedRecord(ctx, AD_Table_ID, Record_ID)), JsonRequestBehavior.AllowGet); ;
        }

        /// <summary>
        /// Save Share record
        /// </summary>
        /// <param name="list"></param>
        /// <returns></returns>
        public JsonResult SaveRecord(int AD_Table_ID, int record_ID, List<Records> list)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            RecordShared model = new RecordShared();
            return Json(JsonConvert.SerializeObject(model.SaveRecord(AD_Table_ID, record_ID, list, ctx)), JsonRequestBehavior.AllowGet);
        }

    }
}