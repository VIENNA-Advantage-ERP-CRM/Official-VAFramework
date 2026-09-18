using System;
using System.Collections.Generic;
using System.IO;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Print;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAdvantage.Analytics
{
    /// <summary>
    /// Report engine for AD_Process.IsCrystalReport = 'O' (Onfinity Analytics).
    /// Two modes, chosen by the caller:
    ///  - embed  (interactive UI): builds a signed /embed?token=... URL and marks the output as
    ///    ProcessCtl.ReportType_EMBED so the client opens it in an iframe. CSV requests still export a file.
    ///  - export (scheduler, workflow notice, document print/e-mail, CSV download): calls the
    ///    Analytics export API with the service account and writes the file to TempDownload,
    ///    so GetReportBytes / GetReportFilePath behave like every other engine.
    /// </summary>
    public class AnalyticsReportEngine : IReportEngine
    {
        private static readonly VLogger _log = VLogger.GetVLogger(typeof(AnalyticsReportEngine).FullName);

        private readonly bool _embedViewer;
        private string _url = null;          // embed mode
        private byte[] _bytes = null;        // export mode
        private string _relativePath = null; // export mode: TempDownload\...

        /// <param name="embedViewer">true from the interactive process UI (ProcessCtl); false wherever a file is required</param>
        public AnalyticsReportEngine(bool embedViewer)
        {
            _embedViewer = embedViewer;
        }

        public AnalyticsReportEngine() : this(false) { }

        public bool StartReport(Ctx ctx, ProcessInfo pi, Trx trx)
        {
            if (AnalyticsEmbed.GetBaseUrl().Length == 0)
            {
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsNotConfigured"), true);
                return false;
            }

            string reportId = Util.GetValueOfString(DB.ExecuteScalar(
                "SELECT VA_AnalyticsReportID FROM AD_Process WHERE AD_Process_ID=" + pi.GetAD_Process_ID(), null, trx)).Trim();
            if (reportId.Length == 0)
            {
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsReportIDMissing"), true);
                return false;
            }

            IDictionary<string, object> filters = AnalyticsEmbed.FiltersFromProcessInfo(pi);
            bool wantsCsv = ProcessCtl.ReportType_CSV.Equals(pi.GetFileType());

            if (_embedViewer && !wantsCsv)
                return StartEmbed(ctx, pi, reportId, filters);

            return StartExport(ctx, pi, reportId, filters, wantsCsv ? AnalyticsApiClient.FORMAT_CSV : AnalyticsApiClient.FORMAT_PDF);
        }

        private bool StartEmbed(Ctx ctx, ProcessInfo pi, string reportId, IDictionary<string, object> filters)
        {
            if (!AnalyticsEmbed.IsConfigured())
            {
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsNotConfigured"), true);
                return false;
            }
            // A process without parameters lets the viewer choose filters inside the frame
            bool interactive = filters.Count == 0;
            _url = AnalyticsEmbed.EmbedUrl(reportId, filters, interactive, true);
            pi.SetFileType(ProcessCtl.ReportType_EMBED);
            return true;
        }

        private bool StartExport(Ctx ctx, ProcessInfo pi, string reportId, IDictionary<string, object> filters, string format)
        {
            if (!AnalyticsApiClient.IsConfigured())
            {
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsApiNotConfigured"), true);
                return false;
            }
            try
            {
                _bytes = new AnalyticsApiClient().Export(reportId, filters, format, AnalyticsApiClient.LocaleFrom(ctx));
            }
            catch (AnalyticsApiClient.AnalyticsApiException e)
            {
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsExportFailed") + ": " + e.Message, true);
                return false;
            }
            catch (Exception e)
            {
                _log.Log(Level.SEVERE, "Analytics export " + reportId, e);
                pi.SetSummary(Msg.GetMsg(ctx, "VA_AnalyticsExportFailed") + ": " + e.Message, true);
                return false;
            }

            // same TempDownload convention as the CSV branch in ProcessCtl
            string dir = Path.Combine(GlobalVariable.PhysicalPath, "TempDownload");
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);
            string fullPath = Path.Combine(dir, "Analytics_" + CommonFunctions.CurrentTimeMillis() + AnalyticsApiClient.ExtensionFor(format));
            File.WriteAllBytes(fullPath, _bytes);
            _relativePath = fullPath.Substring(fullPath.IndexOf("TempDownload"));
            return true;
        }

        public string GetReportString()
        {
            return _url ?? _relativePath;
        }

        public string GetReportFilePath(bool fetchByteArr, out byte[] bytes)
        {
            bytes = fetchByteArr ? _bytes : null;
            return _url ?? _relativePath;
        }

        public string GetCsvReportFilePath(string data)
        {
            return _url ?? _relativePath;
        }

        public string GetRtfReportFilePath(string data)
        {
            return _url ?? _relativePath;
        }

        public byte[] GetReportBytes()
        {
            return _bytes;
        }
    }
}
