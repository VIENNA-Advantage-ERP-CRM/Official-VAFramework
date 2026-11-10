using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Web.Hosting;
using VAdvantage.Logging;
using VAdvantage.Model;

namespace VAdvantage.Common
{
    /// <summary>
    /// Writes the access audit (AD_QueryLog for each grid fetch, AD_WindowLog for each window or form open) on one
    /// background thread, so the request no longer waits for it: each entry takes a record ID under the sequence
    /// lock, inserts the row and reads it back. The rows written are the same as before, in arrival order.
    /// The session is still resolved on the request thread (MSession.Get may create a session and store its ID in
    /// the request context); only the insert is deferred.
    /// </summary>
    public sealed class AuditLogQueue : IRegisteredObject
    {
        /** Entries waiting beyond this are dropped and counted instead of growing memory without limit */
        private const int MAX_PENDING = 20000;
        /** How long an orderly application shutdown waits for pending entries */
        private const int DRAIN_TIMEOUT_MS = 20000;

        private static readonly VLogger _log = VLogger.GetVLogger(typeof(AuditLogQueue).FullName);
        private static readonly Lazy<AuditLogQueue> _instance = new Lazy<AuditLogQueue>(() => new AuditLogQueue(), LazyThreadSafetyMode.ExecutionAndPublication);

        private readonly BlockingCollection<Action> _pending = new BlockingCollection<Action>(MAX_PENDING);
        private readonly Thread _worker;
        private int _dropped;

        private AuditLogQueue()
        {
            try
            {
                HostingEnvironment.RegisterObject(this);    // drain on application shutdown
            }
            catch (Exception)
            {
                // not hosted in ASP.NET (tools, tests): no shutdown notification, the thread just ends with the process
            }
            _worker = new Thread(Work) { IsBackground = true, Name = "AuditLogQueue" };
            _worker.Start();
        }

        /// <summary>Queue an AD_QueryLog entry (replaces session.QueryLog on the request thread).</summary>
        public static void QueryLog(MSession session, int AD_Client_ID, int AD_Org_ID, int AD_Table_ID, string whereClause, int recordCount)
        {
            if (session == null)
                return;
            _instance.Value.Add(() => session.QueryLog(AD_Client_ID, AD_Org_ID, AD_Table_ID, whereClause, recordCount));
        }

        /// <summary>Queue an AD_WindowLog entry (replaces session.WindowLog on the request thread).</summary>
        public static void WindowLog(MSession session, int AD_Client_ID, int AD_Org_ID, int AD_Window_ID, int AD_Form_ID)
        {
            if (session == null)
                return;
            _instance.Value.Add(() => session.WindowLog(AD_Client_ID, AD_Org_ID, AD_Window_ID, AD_Form_ID));
        }

        private void Add(Action write)
        {
            if (_pending.IsAddingCompleted || !_pending.TryAdd(write))
            {
                int dropped = Interlocked.Increment(ref _dropped);
                if (dropped == 1 || dropped % 1000 == 0)
                    _log.Warning("Audit log queue full or stopped, entries dropped: " + dropped);
            }
        }

        private void Work()
        {
            foreach (Action write in _pending.GetConsumingEnumerable())
            {
                try
                {
                    write();
                }
                catch (Exception e)
                {
                    _log.Log(Level.SEVERE, "Audit log entry not written", e);
                }
            }
        }

        /// <summary>Application shutdown: stop accepting entries and give the worker time to write the rest.</summary>
        public void Stop(bool immediate)
        {
            _pending.CompleteAdding();
            if (!immediate)
                _worker.Join(DRAIN_TIMEOUT_MS);
            HostingEnvironment.UnregisterObject(this);
        }
    }
}
