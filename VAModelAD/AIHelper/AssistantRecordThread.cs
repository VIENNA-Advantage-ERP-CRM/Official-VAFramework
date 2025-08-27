using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Common;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAModelAD.AIHelper
{
    public class AssistantRecordThread
    {
        #region Private Variables
        private static VLogger _log = VLogger.GetVLogger(typeof(AssistantRecordThread).FullName);
        private static AssistantRecordThread _asstRecordThrd = null;
        #endregion Private Variables

        /// <summary>
        /// Constructor of Assistant Record Thread
        /// </summary>
        private AssistantRecordThread()
        {

        }

        /// <summary>
        /// Get function to create object of Assistant Record Thread
        /// </summary>
        /// <returns></returns>
        public static AssistantRecordThread Get()
        {
            if (_asstRecordThrd == null)
            {
                _asstRecordThrd = new AssistantRecordThread();
            }

            return _asstRecordThrd;
        }

        /// <summary>
        /// Create/Update thread data for record passed in the parameter in second thread
        /// </summary>
        /// <param name="p_ctx">Context</param>
        /// <param name="_po">Object of PO</param>
        public void CreateUpdateThread(Ctx p_ctx, PO _po)
        {
            try
            {
                System.Threading.Tasks.Task.Run(() => CreateUpdateRecordThread(p_ctx, _po));
            }
            catch (Exception ex) 
            {
                _log.SaveError("Error Thread", ex.Message);
            };
        }

        /// <summary>
        /// Create/Update record data for thread
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="_po">PO object</param>
        protected void CreateUpdateRecordThread(Ctx ctx, PO _po)
        {
            Common.CreateRecordThread(ctx, _po.Get_ID(), _po.Get_Table_ID(), _po.GetAD_Window_ID(), _po.GetWindowTabID(), !(_po.Is_New()), null);
        }
    }
}
