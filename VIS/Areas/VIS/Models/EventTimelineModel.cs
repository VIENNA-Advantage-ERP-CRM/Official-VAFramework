/********************************************************
 * Module Name    :    VA Framework
 * Purpose        :    Record Timeline (AD_EventTimeline) read model for the
 *                     Event Timeline tab-panel. Reads the per-record lifecycle
 *                     feed (created / updated / doc-action / workflow / shared)
 *                     from the single AD_EventTimeline table.
 ******************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    /// <summary>
    /// Read model for the Event Timeline tab-panel.
    /// </summary>
    public class EventTimelineModel
    {
        private static VLogger _log = VLogger.GetVLogger(typeof(EventTimelineModel).FullName);

        /// <summary>
        /// Page size for the Event Timeline panel (mirrors the panel's PAGE_SIZE).
        /// </summary>
        private const int TIMELINE_PAGE_SIZE = 12;

        /// <summary>
        /// _Document Status reference. Stored DocAction rows carry a DocStatus
        /// code (CO/VO/CL/IP...); this reference gives its translated name.
        /// Verify in your instance:
        ///   SELECT AD_Reference_ID FROM AD_Reference WHERE Name='_Document Status';
        /// </summary>
        private const int DOCSTATUS_AD_REFERENCE_ID = 131;

        /// <summary>
        /// One page of lifecycle events for a record, newest first, read from the
        /// single AD_EventTimeline table. All inputs are integers, so the ids are
        /// concatenated (int values cannot carry SQL) and paged with ROW_NUMBER
        /// (works on both Oracle and PostgreSQL).
        /// </summary>
        public List<TimelineEvent> GetTimeline(Ctx ctx, int RecordId, int _AD_Table_ID, int page)
        {
            List<TimelineEvent> list = new List<TimelineEvent>();
            if (RecordId <= 0 || _AD_Table_ID <= 0)
                return list;
            if (page < 1) page = 1;
            int from = ((page - 1) * TIMELINE_PAGE_SIZE) + 1;
            int to = page * TIMELINE_PAGE_SIZE;

            // Sort on the SAME column that is displayed (e.Created). Ordering on
            // e.EventDate while showing e.Created was inconsistent, and made the
            // whole query depend on a column the panel never reads - one missing
            // column there took the entire feed down instead of one field.
            string sql = @"SELECT * FROM (
                    SELECT e.EventType, e.Created AS EventDate, e.DocStatus, e.Description,
                           TO_CHAR(e.Created, 'DD/MM/YYYY HH12:MI:SS AM') AS EventDateStr,
                           u.Name AS Actor, n.Name AS NodeName,
                           ROW_NUMBER() OVER (ORDER BY e.Created DESC, e.AD_EventTimeline_ID DESC) AS rn
                    FROM AD_EventTimeline e
                    LEFT JOIN AD_User u    ON u.AD_User_ID    = e.AD_User_ID
                    LEFT JOIN AD_WF_Node n ON n.AD_WF_Node_ID = e.AD_WF_Node_ID
                    WHERE e.IsActive = 'Y' AND e.AD_Table_ID = " + _AD_Table_ID + @"
                          AND e.Record_ID = " + RecordId + @"
                ) t WHERE rn BETWEEN " + from + " AND " + to + " ORDER BY rn";

            // DB.ExecuteDataset logs and returns null on a SQL error, so without
            // this the panel cannot tell "no events yet" from "query failed".
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds == null)
            {
                _log.Severe("Event Timeline query failed (AD_Table_ID=" + _AD_Table_ID
                    + ", Record_ID=" + RecordId + "). SQL: " + sql);
                return list;
            }
            if (ds.Tables.Count > 0)
            {
                foreach (DataRow dr in ds.Tables[0].Rows)
                {
                    string rawType = Util.GetValueOfString(dr["EventType"]);
                    string docStatus = Util.GetValueOfString(dr["DocStatus"]);
                    string note = Util.GetValueOfString(dr["Description"]);
                    string node = Util.GetValueOfString(dr["NodeName"]);

                    TimelineEvent ev = new TimelineEvent();
                    ev.RawEventType = rawType;
                    ev.EventDate = dr["EventDate"] == DBNull.Value
                        ? DateTime.MinValue
                        : DateTime.SpecifyKind(Convert.ToDateTime(dr["EventDate"]), DateTimeKind.Utc);
                    ev.EventDateStr = Util.GetValueOfString(dr["EventDateStr"]);
                    ev.Actor = Util.GetValueOfString(dr["Actor"]);
                    ev.Node = node;
                    ev.DocStatus = docStatus;
                    ev.Note = note;
                    // Map to the panel's TYPE_CONFIG key so the client renders the
                    // right icon/tone/label with no extra lookup.
                    ev.Type = MapPanelType(rawType, docStatus, note);
                    // DocAction events: resolve the DocStatus code to its
                    // TRANSLATED name from the _Document Status reference list
                    // (language-aware + cached), so the panel shows e.g.
                    // "Completed"/"Voided" in the user's language instead of a
                    // client-side English constant. Client prefers ev.Title.
                    // ctx is null when the session has expired; the client then
                    // falls back to its own label rather than the whole feed
                    // dying on the lookup.
                    if (ctx != null && rawType == "DocAction" && !string.IsNullOrEmpty(docStatus))
                    {
                        ev.Title = MRefList.GetListName(ctx, DOCSTATUS_AD_REFERENCE_ID, docStatus);
                    }
                    list.Add(ev);
                }
            }
            return list;
        }

        /// <summary>Total timeline event count for the pager ("of N").</summary>
        public int GetTimelineCount(int RecordId, int _AD_Table_ID)
        {
            if (RecordId <= 0 || _AD_Table_ID <= 0)
                return 0;
            string sql = "SELECT COUNT(*) FROM AD_EventTimeline WHERE IsActive='Y' AND AD_Table_ID="
                + _AD_Table_ID + " AND Record_ID=" + RecordId;
            return Util.GetValueOfInt(DB.ExecuteScalar(sql));
        }

        /// <summary>
        /// Translate a stored (EventType, DocStatus) into the panel's TYPE_CONFIG
        /// key. DocStatus codes: CO=Completed, VO=Voided, CL=Closed, IP/WC=In
        /// Progress (Prepared). NOTE: Re-activate also lands on IP, so it is shown
        /// as "prepared" - distinguishing it would require also storing DocAction.
        /// </summary>
        private string MapPanelType(string eventType, string docStatus, string note)
        {
            switch (eventType)
            {
                case "Created": return "created";
                case "Updated": return "updated";
                case "Shared": return "shared";
                case "Workflow":
                    {
                        string msg = "workflow";
                        if(note != null && note.StartsWith("Sent for"))
                        {
                            msg = "sent_for";
                        }
                        else if(note != null && note.StartsWith("Forward to"))
                        {
                            msg = "forward_to";
                        }
                        else if(note != null && note.StartsWith("Approved by"))
                        {
                            msg = "approved_by";
                        }
                        return msg; 
                    }
                case "DocAction":
                    switch (docStatus)
                    {
                        case "CO": return "completed";
                        case "VO": return "voided";
                        case "CL": return "closed";
                        case "RE": return "reactivated";
                        case "IP":
                        case "WC": return "prepared";
                        default: return "updated";
                    }
                default: return "updated";
            }
        }
    }

    /// <summary>
    /// One Event Timeline event, shaped for the timeline panel's feed.
    /// Type is the panel TYPE_CONFIG key (created/updated/prepared/completed/
    /// voided/reactivated/closed/sent_for/workflow/shared); RawEventType is the
    /// stored category for reference/debugging.
    /// </summary>
    public class TimelineEvent
    {
        public string Type { get; set; }
        // Server-resolved translated title (currently set for DocAction rows from
        // the _Document Status reference); when present the client shows it
        // verbatim instead of its own label lookup.
        public string Title { get; set; }
        public string RawEventType { get; set; }
        public DateTime EventDate { get; set; }
        public string EventDateStr { get; set; }
        public string Actor { get; set; }
        public string Node { get; set; }
        public string Note { get; set; }
        public string DocStatus { get; set; }
    }
}
