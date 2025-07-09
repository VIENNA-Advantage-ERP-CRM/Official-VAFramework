using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VAdvantage.Utility;
using static VAModelAD.AIHelper.AIHelperDataContracts;

namespace VAModelAD.AIHelper
{
    public class AIPayload
    {
        public static bool ExecuteThreadAction(
            ActionType actionType,
            int tableID,
            int recordID,
            int attachmentID,
            int userID,
            Ctx ctx,
            string threadID,
            string attachmentType)
        {
            if (string.IsNullOrEmpty(threadID))
                return true; // no thread = no update required

            ThreadActionDataIn thrdChtDIn = new ThreadActionDataIn();
            AIApiService.InitAIEndPoint(ctx.GetContext("#AppFullUrl"));
            RequestPayload.Get().SetDefaultParameters(thrdChtDIn);
            thrdChtDIn.threadID = threadID;
            thrdChtDIn.table_id = tableID;
            thrdChtDIn.action = GetActionCode(actionType);
            thrdChtDIn.record_id = recordID;
            thrdChtDIn.sessionID = ctx.GetAD_Session_ID();
            thrdChtDIn.attachmentType = attachmentType;
            thrdChtDIn.attachmentTypeID = attachmentID;
            thrdChtDIn.userID = userID;

            using (AIApiService service = new AIApiService(thrdChtDIn.token))
            {
                var outp = service.ExecuteRequest(thrdChtDIn, "updateInsertInformationInThread");
                if (!outp.isError)
                {
                    try
                    {
                        JObject jObj = JObject.Parse(outp.result);
                        if (jObj.ContainsKey("is_error") && jObj.ContainsKey("success"))
                        {
                            string isErrorVal = Util.GetValueOfString(jObj["is_error"]).ToLower();
                            string isSuccessVal = Util.GetValueOfString(jObj["success"]).ToLower();

                            return isErrorVal == "false" && isSuccessVal == "true";
                        }
                    }
                    catch (JsonException ex)
                    {
                        Console.WriteLine("JSON parsing error: " + ex.Message);
                    }
                }
            }

            return false;
        }

        public enum ActionType
        {
            New,
            Update,
            Delete
        }

        public static string GetActionCode(ActionType type)
        {
            switch (type)
            {
                case ActionType.New:
                    return "N";
                case ActionType.Update:
                    return "U";
                case ActionType.Delete:
                    return "D";
                default:
                    throw new ArgumentOutOfRangeException(nameof(type), "Unsupported action type");
            }
        }
    }
}
