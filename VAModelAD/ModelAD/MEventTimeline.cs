/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : MEventTimeline
 * Purpose        : Record Timeline - writes/reads one lifecycle event
 *                  (Created / Updated / DocAction / Workflow / Shared)
 *                  against a (AD_Table_ID, Record_ID). Single writer funnel
 *                  used by POValidator.AfterSave and the workflow engine.
 ******************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MEventTimeline : X_AD_EventTimeline
    {
        #region Constructors
        public MEventTimeline(Ctx ctx, int AD_EventTimeline_ID, Trx trxName)
            : base(ctx, AD_EventTimeline_ID, trxName) { }

        public MEventTimeline(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName) { }
        #endregion

        /** Event types - kept as constants (EventType is a plain String column,
         *  never user-entered, so no AD_Reference list is required). */
        public const string EVENT_Created   = "Created";
        public const string EVENT_Updated   = "Updated";
        public const string EVENT_DocAction = "DocAction";
        public const string EVENT_Workflow  = "Workflow";
        public const string EVENT_Shared    = "Shared";

        /// <summary>
        /// Columns that must NOT, on their own, cause an "Updated" event.
        /// Housekeeping / audit / doc-engine columns only.
        /// </summary>
        private static readonly HashSet<string> _ignoreCols =
            new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Updated", "UpdatedBy", "Created", "CreatedBy",
                "Processing", "Processed", "DocAction", "IsActive"
            };

        /// <summary>
        /// Single funnel for every timeline writer. Runs in the caller's
        /// transaction, so the event commits/rolls back with the record.
        /// Silently no-ops for untracked tables and unsaved records.
        /// </summary>
        /// <param name="po">the record the event is about (already saved)</param>
        /// <param name="eventType">one of the EVENT_* constants</param>
        /// <param name="docStatus">DocStatus for DocAction events, else null</param>
        /// <param name="adWfNodeId">AD_WF_Node_ID for Workflow events, else 0</param>
        /// <param name="description">render-ready note line, may be null</param>
        public static void Log(PO po, string eventType, string docStatus, int adWfNodeId, string description)
        {
            if (po == null || po.Get_ID() <= 0)
                return;
            if (!IsTracked(po.GetCtx(), po.Get_Table_ID()))
                return;

            try
            {
                MEventTimeline ev = new MEventTimeline(po.GetCtx(), 0, po.Get_Trx());
                ev.SetAD_Table_ID(po.Get_Table_ID());
                ev.SetRecord_ID(po.Get_ID());
                ev.SetEventType(eventType);
                ev.SetEventDate(DateTime.Now);
                ev.SetAD_User_ID(po.GetUpdatedBy());
                if (!String.IsNullOrEmpty(docStatus))
                    ev.SetDocStatus(docStatus);
                if (adWfNodeId > 0)
                    ev.SetAD_WF_Node_ID(adWfNodeId);
                if (!String.IsNullOrEmpty(description))
                    ev.SetDescription(description);

                if (!ev.Save())
                {
                    // Timeline is a side-effect: a failed event must never fail
                    // the host save. Log and move on.
                    ValueNamePair pp = VLogger.RetrieveError();
                    _log.Warning("Timeline event not saved for "
                        + po.Get_TableName() + "/" + po.Get_ID()
                        + (pp != null ? " - " + pp.Name : ""));
                }
            }
            catch (Exception ex)
            {
                _log.Warning("Timeline event error for "
                    + (po != null ? po.Get_TableName() : "?") + " - " + ex.Message);
            }
        }

        /// <summary>
        /// True if any non-housekeeping column changed on this (updated) record.
        /// Mirrors the column-walk POValidator already does in CopyVersionToMaster
        /// (Get_ColumnCount / Get_ColumnName / Get_Value vs Get_ValueOld), so the
        /// "Updated" decision needs no AD_ChangeLog dependency.
        /// </summary>
        public static bool HasTrackedChange(PO po)
        {
            if (po == null)
                return false;
            int count = po.Get_ColumnCount();
            for (int i = 0; i < count; i++)
            {
                string col = po.Get_ColumnName(i);
                if (col == null || _ignoreCols.Contains(col))
                    continue;
                if (!Util.IsEqual(po.Get_Value(col), po.Get_ValueOld(col)))
                    return true;
            }
            return false;
        }

        #region IsTimelineTracked (cached per table)
        // AD_Table.IsTimelineTracked, cached per table id for the process lifetime.
        // Reset via ClearTrackCache() after toggling the flag in a running instance.
        private static  CCache<int, bool> _trackCache = new CCache<int, bool>("MEventTimeTable",10);
        private static readonly object _cacheLock = new object();

        public static bool IsTracked(Ctx ctx, int tableId)
        {
            if (tableId <= 0)
                return false;

            lock (_cacheLock)
            {
                bool tracked;
                if (_trackCache.TryGetValue(tableId, out tracked))
                    return tracked;

                MTable t = MTable.Get(ctx, tableId);
                tracked = t != null
                          && t.Get_ColumnIndex("IsTimelineTracked") >= 0
                          && ("Y".Equals(Util.GetValueOfString(t.Get_Value("IsTimelineTracked")))
                          || true.Equals(t.Get_Value("IsTimelineTracked")));
                _trackCache[tableId] = tracked;
                return tracked;
            }
        }

        public static void ClearTrackCache()
        {
            lock (_cacheLock)
            {
                _trackCache.Clear();
            }
        }
        #endregion

        private static VLogger _log = VLogger.GetVLogger(typeof(MEventTimeline).FullName);
    }
}
