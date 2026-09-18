using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web.Mvc;
using VAdvantage.Analytics;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using System.Data.SqlClient;

namespace VIS.Controllers
{
    /// <summary>
    /// Hosts Onfinity Analytics reports inside the application: the record tab panel
    /// (VIS.AnalyticsPanel) and the home widget (VIS.AnalyticsWidget).
    /// The embed token is minted server-side per render; the page only receives the iframe URL.
    /// </summary>
    public class AnalyticsPanelController : Controller
    {
        /// <summary>
        /// Renders the embedded report.
        /// </summary>
        /// <param name="extraInfo">reportId=&lt;uuid&gt; plus optional interactive=Y / allowExport=Y and locked
        /// filters (COLUMN=value), @Column@ tokens already substituted by the client</param>
        /// <param name="recID">Current Record_ID, substituted for the @recordid token</param>
        public ActionResult Embed(string extraInfo, int recID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            ViewBag.Url = null;

            if (!AnalyticsEmbed.IsConfigured())
            {
                ViewBag.Message = Msg.GetMsg(ctx, "VA_AnalyticsNotConfigured");
                return View();
            }

            string reportId;
            bool? interactive, allowExport;
            IDictionary<string, object> filters = AnalyticsEmbed.ParseExtraInfo(
                (extraInfo ?? "").Replace("@recordid", recID.ToString()), out reportId, out interactive, out allowExport);

            if (string.IsNullOrEmpty(reportId))
            {
                ViewBag.Message = Msg.GetMsg(ctx, "VA_AnalyticsReportIDMissing");
                return View();
            }

            ViewBag.Url = AnalyticsEmbed.EmbedUrl(reportId, filters, interactive ?? false, allowExport ?? false);
            return View();
        }

        /// <summary>
        /// Published reports for the widget's report picker, listed through the service account.
        /// { configured, reports: [{ id, name }], message }
        /// </summary>
        public ActionResult Reports()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            var result = new Dictionary<string, object>();
            result["configured"] = AnalyticsApiClient.IsConfigured();
            result["reports"] = new List<object>();

            if (!AnalyticsEmbed.IsConfigured())
            {
                result["message"] = Msg.GetMsg(ctx, "VA_AnalyticsNotConfigured");
            }
            else if (AnalyticsApiClient.IsConfigured())
            {
                try
                {
                    var reports = new List<object>();
                    foreach (var r in new AnalyticsApiClient().ListPublishedReports())
                        reports.Add(new { id = r.Key, name = r.Value });
                    result["reports"] = reports;
                }
                catch (Exception e)
                {
                    result["message"] = e.Message;
                }
            }
            return Content(JsonConvert.SerializeObject(result), "application/json");
        }

        /// <summary>
        /// Persists the widget's configuration (AD_UserHomeWidget.AdditionalInfo) for the signed-in user.
        /// </summary>
        [HttpPost]
        public ActionResult SaveWidgetInfo(int AD_UserHomeWidget_ID, string info)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            int updated = 0;
            if (AD_UserHomeWidget_ID > 0)
            {
                SqlParameter[] param = new SqlParameter[3];
                param[0] = new SqlParameter("@info", (object)info ?? DBNull.Value);
                param[1] = new SqlParameter("@id", AD_UserHomeWidget_ID);
                param[2] = new SqlParameter("@user", ctx.GetAD_User_ID());
                updated = DB.ExecuteQuery("UPDATE AD_UserHomeWidget SET AdditionalInfo=@info WHERE AD_UserHomeWidget_ID=@id AND AD_User_ID=@user", param);
            }
            return Content(JsonConvert.SerializeObject(new { saved = updated > 0 }), "application/json");
        }
    }
}
