/********************************************************
 * Module Name    :    VA Framework
 * Purpose        :    Event Timeline Tab Panel - serves the per-record
 *                     lifecycle feed (AD_EventTimeline) to GenericTabPanel.js.
 ******************************************************/
using Newtonsoft.Json;
using System.Web.Mvc;
using VAdvantage.Classes;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class EventTimelineController : Controller
    {
        /// <summary>
        /// One page of lifecycle events (created / updated / doc-action /
        /// workflow / shared) for a record, newest first.
        /// </summary>
        /// <param name="RecordId">Record ID</param>
        /// <param name="AD_Table_ID">Table ID</param>
        /// <param name="Page">1-based page number</param>
        public JsonResult GetRecordTimeline(string RecordId, string AD_Table_ID, string Page,string PageSize)
        {
            Ctx ct = Session["ctx"] as Ctx;
            EventTimelineModel _model = new EventTimelineModel();
            var data = _model.GetTimeline(ct, Util.GetValueOfInt(RecordId),
                Util.GetValueOfInt(AD_Table_ID), Util.GetValueOfInt(Page),Util.GetValueOfInt(PageSize));
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Total event count (for the pager's "of N").
        /// </summary>
        public JsonResult GetRecordTimelineCount(string RecordId, string AD_Table_ID)
        {
            EventTimelineModel _model = new EventTimelineModel();
            int count = _model.GetTimelineCount(Util.GetValueOfInt(RecordId), Util.GetValueOfInt(AD_Table_ID));
            return Json(JsonConvert.SerializeObject(count), JsonRequestBehavior.AllowGet);
        }
    }
}
