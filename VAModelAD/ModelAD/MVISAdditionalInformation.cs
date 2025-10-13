using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Utility;
using static VAModelAD.AIHelper.AIPayload;

namespace VAdvantage.Model
{
    public class MVISAdditionalInformation : X_VIS_AdditionalInformation
    {
        /**	Logger			*/
        private static VLogger s_log = VLogger.GetVLogger(typeof(MVISAdditionalInformation).FullName);

        public MVISAdditionalInformation(Ctx ctx, DataRow rs, Trx trx)
           : base(ctx, rs, trx)
        {

        }	//	MAdditionalInformation

        public MVISAdditionalInformation(Ctx ctx, int VIS_AdditionalInformation_ID, Trx trx)
            : base(ctx, VIS_AdditionalInformation_ID, trx)
        {

        }	//	MAdditionalInformation

        /// <summary>
        /// After save for Additional Information for AI Assistant
        /// </summary>
        /// <param name="newRecord"></param>
        /// <param name="success"></param>
        /// <returns></returns>
        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (!success)
                return success;

            string threadID = Common.Common.GetThreadID(GetAD_Table_ID(), GetRecord_ID(), Common.Common.GetRecordOrg(GetCtx(), GetAD_Table_ID(), GetRecord_ID()));
            if (!string.IsNullOrEmpty(threadID))
            {
                if (!ExecuteThreadAction(actionType: newRecord ? ActionType.New : ActionType.Update, tableID: GetAD_Table_ID(), recordID: GetRecord_ID(),
                    attachmentID: Get_ID(), userID: GetUpdatedBy(), ctx: GetCtx(), threadID: threadID, attachmentType: "I"))
                {
                    log.SaveError("", "Error in execution of insert/update data against Additional Information thread : " + Get_ID());
                }
            }
            return true;
        }

        /// <summary>
        /// After delete function for the deletion of record
        /// </summary>
        /// <param name="success"></param>
        /// <returns></returns>
        protected override bool AfterDelete(bool success)
        {
            if (!success)
                return false;

            string threadID = Common.Common.GetThreadID(GetAD_Table_ID(), GetRecord_ID(), Common.Common.GetRecordOrg(GetCtx(), GetAD_Table_ID(), GetRecord_ID()));
            if (!string.IsNullOrEmpty(threadID))
            {
                if (!ExecuteThreadAction(actionType: ActionType.Delete, tableID: GetAD_Table_ID(), recordID: GetRecord_ID(),
                    attachmentID: GetVIS_AdditionalInformation_ID(), userID: GetUpdatedBy(), ctx: GetCtx(), threadID: threadID, attachmentType: "i"))
                {
                    log.SaveError("", "Error in execution of delete data against Additional Information thread : " + GetVIS_AdditionalInformation_ID());
                }
            }
            return true;
        }
    }
}
