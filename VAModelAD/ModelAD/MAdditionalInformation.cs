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
    public class MAdditionalInformation : X_VIS_AdditionalInformation
    {
        /**	Logger			*/
        private static VLogger s_log = VLogger.GetVLogger(typeof(MAdditionalInformation).FullName);

        public MAdditionalInformation(Ctx ctx, DataRow rs, Trx trx)
           : base(ctx, rs, trx)
        {

        }	//	MAdditionalInformation

        public MAdditionalInformation(Ctx ctx, int VIS_AdditionalInformation_ID, Trx trx)
            : base(ctx, VIS_AdditionalInformation_ID, trx)
        {

        }	//	MAdditionalInformation

        protected override bool BeforeSave(bool newRecord)
        {
            return true;
        }

        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (!success)
                return success;
            
            string threadID = Common.Common.GetThreadID(GetAD_Table_ID(), GetRecord_ID());
            if (!string.IsNullOrEmpty(threadID))
            {
                if (!ExecuteThreadAction(actionType: newRecord ? ActionType.New : ActionType.Update, tableID: GetAD_Table_ID(), recordID: GetRecord_ID(),
                    attachmentID: Get_ID(), userID: GetUpdatedBy(), ctx: GetCtx(), threadID: threadID, attachmentType: "I"))
                {
                    log.SaveError("", "Error in execution of insert/update data against Chat Entry thread : " + Get_ID());
                }
            }
            return true;
        }
    }
}
