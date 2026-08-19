/********************************************************
 * Module Name    :    VA Framework
 * Purpose        :    Record Timeline (AD_EventTimeline) read model for the
 *                     Event Timeline tab-panel. Reads the per-record lifecycle
 *                     feed (created / updated / doc-action / workflow / shared)
 *                     from the single AD_EventTimeline table.
 ******************************************************/
using Google.GData.Extensions;
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
                    SELECT e.EventType, e.Created AS EventDate, e.DocStatus, e.Title, e.Description,
                           TO_CHAR(e.Created, 'DD/MM/YYYY HH12:MI:SS AM') AS EventDateStr,
                           u.Name AS Actor, n.Name AS NodeName,
                           ROW_NUMBER() OVER (ORDER BY e.Created DESC, e.AD_EventTimeline_ID DESC) AS rn
                    FROM AD_EventTimeline e
                    LEFT JOIN AD_User u    ON u.AD_User_ID    = e.AD_User_ID
                    LEFT JOIN AD_WF_Node n ON n.AD_WF_Node_ID = e.AD_WF_Node_ID
                    WHERE e.IsActive = 'Y' AND e.AD_Table_ID = " + _AD_Table_ID + @"
                          AND e.Record_ID = " + RecordId + @"
                ) t WHERE rn BETWEEN " + from + " AND " + to + " ORDER BY rn";


            if (Env.IsModuleInstalled("VA112_"))
            {
                sql = @"SELECT *
                        FROM (SELECT   ROWNUM AS rn, temp1.*
                    FROM (
                        SELECT 
                            temp.*
                        FROM (
                            SELECT 
                                NVL(n'' || e.EventType, '') AS EventType,
                                e.Created AS EventDate,
                                NVL(e.DocStatus, '') AS DocStatus,
                                NVL(n'' || e.Title, '') AS Title,
                                NVL(n'' || e.Description, '') AS Description,
                                TO_CHAR(e.Created, 'DD/MM/YYYY HH12:MI:SS AM') AS EventDateStr,
                                NVL(n'' || u.Name, '') AS Actor,
                                NVL(n'' || n.Name, '') AS NodeName
                            FROM AD_EventTimeline e
                            LEFT JOIN AD_User u ON u.AD_User_ID = e.AD_User_ID
                            LEFT JOIN AD_WF_Node n ON n.AD_WF_Node_ID = e.AD_WF_Node_ID
                            WHERE e.IsActive = 'Y' AND AD_Table_ID = " + _AD_Table_ID + @" AND RECORD_ID=" + RecordId + @"

                            UNION

                            SELECT 
                                NVL(n'' || e.EventType, ''),
                                e.Created AS EventDate,
                                NVL(e.DocStatus, ''),
                                NVL(n'' || e.Title, ''),
                                NVL(n'' || e.Description, ''),
                                TO_CHAR(e.Created, 'DD/MM/YYYY HH12:MI:SS AM'),
                                NVL(n'' || e.Actor, ''),
                                NVL(n'' || e.NodeName, '')
                            FROM VA112_DOCSHARETIMELINE_V e WHERE AD_Table_ID = " + _AD_Table_ID + @" AND RECORD_ID=" + RecordId + @"
                        ) temp
                        ORDER BY temp.EventDate DESC
                    ) temp1)
                    WHERE rn BETWEEN " + from + " AND " + to ;
                              
            }
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
                    string titleKey = Util.GetValueOfString(dr["Title"]);

                    TimelineEvent ev = new TimelineEvent();
                    ev.RawEventType = rawType;
                    ev.EventDate = dr["EventDate"] == DBNull.Value
                        ? DateTime.MinValue
                        : DateTime.SpecifyKind(Convert.ToDateTime(dr["EventDate"]), DateTimeKind.Utc);
                    ev.EventDateStr = Util.GetValueOfString(dr["EventDateStr"]);
                    ev.Actor = Util.GetValueOfString(dr["Actor"]);
                    ev.Node = Util.GetValueOfString(dr["NodeName"]);
                    ev.Note = Util.GetValueOfString(dr["Description"]);
                    // Map to the panel's TYPE_CONFIG key so the client renders the
                    // right icon/tone with no extra lookup.
                    ev.Type = MapPanelType(rawType, docStatus, titleKey);
                    ev.Title = BuildTitle(ctx, rawType, docStatus, titleKey, ev.Node);
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

            if (Env.IsModuleInstalled("VA112_"))
            {
               sql = @"SELECT COUNT(*)
               FROM (
                   SELECT 1
                   FROM AD_EventTimeline
                   WHERE IsActive = 'Y'
                     AND AD_Table_ID = " + _AD_Table_ID + @"
                     AND Record_ID = " + RecordId + @"

                   UNION ALL

                   SELECT 1
                   FROM VA112_DOCSHARETIMELINE_V
                   WHERE AD_Table_ID = " + _AD_Table_ID + @"
                     AND Record_ID = " + RecordId + @"
               )";
            }

            return Util.GetValueOfInt(DB.ExecuteScalar(sql));
        }

        /// <summary>
        /// Timeline title in the READING user's language.
        /// Workflow / Shared rows store an AD_Message KEY in Title, so one stored
        /// row reads correctly for every user; the workflow node name (already
        /// joined from AD_WF_Node) is appended to it. DocAction rows carry no key
        /// - their DocStatus code is resolved against the _Document Status
        /// reference list instead (language-aware + cached).
        /// Returns "" when nothing can be resolved (ctx is null once the session
        /// has expired); the panel then falls back to its own label rather than
        /// the whole feed dying on the lookup.
        /// </summary>
        private string BuildTitle(Ctx ctx, string eventType, string docStatus, string titleKey, string node)
        {
            if (ctx == null)
                return "";

            if (!string.IsNullOrEmpty(titleKey))
            {
                string text = Msg.GetMsg(ctx, titleKey);
                return string.IsNullOrEmpty(node) ? text : text + " " + node;
            }

            if (eventType == MEventTimeline.EVENT_DocAction && !string.IsNullOrEmpty(docStatus))
                return MRefList.GetListName(ctx, DOCSTATUS_AD_REFERENCE_ID, docStatus);

            return "";
        }

        /// <summary>
        /// Translate a stored event into the panel's TYPE_CONFIG key, which picks
        /// the icon and tone.
        /// Workflow sub-types come from the stored Title message key. They used to
        /// be guessed by matching English prefixes in the Description, which only
        /// worked while that text was a hardcoded English literal.
        /// DocStatus codes: CO=Completed, VO=Voided, CL=Closed, RE=Re-activated,
        /// IP/WC=In Progress (Prepared).
        /// </summary>
        private string MapPanelType(string eventType, string docStatus, string titleKey)
        {
            switch (eventType)
            {
                case MEventTimeline.EVENT_Created: return "created";
                case MEventTimeline.EVENT_Updated: return "updated";
                case MEventTimeline.EVENT_Shared:
                    switch (titleKey)
                    {
                        case MEventTimeline.MSG_DocumentShareForView: return "document_view";
                        case MEventTimeline.MSG_SharedDoumentView: return "document_viewed";
                        case MEventTimeline.MSG_DocumentShareForAcknowledge: return "document_ack";
                        case MEventTimeline.MSG_SharedDocumentAcknowledge: return "document_acknowledged";
                        // Plain MSG_Shared rows, and any share sub-type added
                        // later, land here - a share icon, not the workflow one.
                        default: return "shared";
                    }
                  case MEventTimeline.EVENT_Workflow:
                    switch (titleKey)
                    {
                        case MEventTimeline.MSG_SentFor: return "sent_for";
                        case MEventTimeline.MSG_ForwardTo: return "forward_to";
                        case MEventTimeline.MSG_ApprovedBy: return "approved_by";
                        default: return "workflow";
                    }
                case MEventTimeline.EVENT_DocAction:
                    switch (docStatus)
                    {
                        case "CO": return "completed";
                        case "VO": return "voided";
                        case "CL": return "closed";
                        case "RE": return "reactivated";
                        case "IP":
                        case "PR": return "prepared";
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
        // Title resolved into the reading user's language: message key + node
        // name for workflow/shared, _Document Status name for doc-actions. When
        // present the client shows it verbatim instead of its own label lookup.
        public string Title { get; set; }
        public string RawEventType { get; set; }
        public DateTime EventDate { get; set; }
        public string EventDateStr { get; set; }
        public string Actor { get; set; }
        public string Node { get; set; }
        public string Note { get; set; }
    }
}
