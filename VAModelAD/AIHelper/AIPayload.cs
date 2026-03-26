using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;
using static VAModelAD.AIHelper.AIHelperDataContracts;

namespace VAModelAD.AIHelper
{
    public class AIPayload
    {
        private static VLogger _log = VLogger.GetVLogger(typeof(AIPayload).FullName);

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

            // vis0008 Handled case for the API being called from VServer
            if (Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Role_ID FROM AD_Session WHERE AD_Session_ID = " + thrdChtDIn.sessionID)) == 0)
            {
                string TableName = "";
                if (attachmentType.ToLower() == "a" || attachmentType.ToLower() == "t")
                {
                    TableName = "AppointmentsInfo";
                }
                else if (attachmentType.ToLower() == "e")
                {
                    TableName = "MailAttachment1";
                }
                else if (attachmentType.ToLower() == "c")
                {
                    TableName = "CM_ChatEntry";
                }
                else
                {
                    TableName = MTable.GetTableName(ctx, tableID);
                }

                int AD_Client_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Client_ID FROM " + TableName + " WHERE " + TableName + "_ID = " + attachmentID));
                int AD_Role_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Role_ID FROM AD_Role WHERE AD_Client_ID = " + AD_Client_ID + " AND IsAdministrator = 'Y' ORDER BY Created"));

                Ctx _newCtx = new Ctx();
                _newCtx.SetAD_Client_ID(AD_Client_ID);
                // Fixed for Organization *
                _newCtx.SetAD_Org_ID(0);
                _newCtx.SetAD_Role_ID(AD_Role_ID);
                // Fixed user for SuperUser
                _newCtx.SetAD_User_ID(100);
                MSession s = MSession.Get(_newCtx, true, thrdChtDIn.endPoints);
                //s.SetDescription("By Web Service");
                if (s.Save())
                {
                    thrdChtDIn.sessionID = s.GetAD_Session_ID();
                }
                else
                {
                    ValueNamePair vnp = VLogger.RetrieveError();
                    string error = "";
                    if (vnp != null)
                    {
                        error = vnp.GetName();
                        if (error == "" && vnp.GetValue() != null)
                            error = vnp.GetValue();
                    }
                    _log.SaveError("AI Chat Bot Session Creation Error : ", "Session Not Created : " + thrdChtDIn.sessionID + ", Error Description : " + error);
                    return false;
                }
            }

            using (AIApiService service = new AIApiService(thrdChtDIn.token))
            {
                var outp = service.ExecuteRequest(thrdChtDIn, "UpdateInsertInformationInThread");
                if (!outp.isError)
                {
                    try
                    {
                        JObject jObj = JObject.Parse(outp.result);
                        if (jObj.ContainsKey("is_error") && jObj.ContainsKey("success"))
                        {
                            return Util.GetValueOfString(jObj["is_error"]).ToLower() == "false" && Util.GetValueOfString(jObj["success"]).ToLower() == "true";
                        }
                    }
                    catch (Newtonsoft.Json.JsonException ex)
                    {
                        _log.SaveError("AI Chat Bot API Error : ", "Exception : " + ex.Message);
                    }
                }
                else
                {
                    _log.SaveError("AI Chat Bot API Error : ", "Error while creating thread");
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

        public static MessagePayload SendEmailReplyRequestAsync(string threadID, string subject, string message, Ctx ctx, string prompt)
        {
            MessagePayload msgPayload = new MessagePayload();
            EmailReplyRequest emailReplyRequest = new EmailReplyRequest();

            AIApiService.InitAIEndPoint(ctx.GetContext("#AppFullUrl"));
            RequestPayload.Get().SetDefaultParameters(emailReplyRequest);

            emailReplyRequest.prompt = prompt;
            emailReplyRequest.threadID = threadID;
            emailReplyRequest.sessionID = ctx.GetAD_Session_ID();
            emailReplyRequest.endPoints = ctx.GetContext("#AppFullUrl");
            emailReplyRequest.email_subject = subject;
            emailReplyRequest.email_content = message;

            using (AIApiService service = new AIApiService(emailReplyRequest.token))
            {
                var outp = service.ExecuteRequest(emailReplyRequest, "GenerateEmailReply");
                if (!outp.isError)
                {
                    try
                    {
                        JObject jObj = JObject.Parse(outp.result);

                        // Check "success" field from response
                        if (jObj.ContainsKey("success") && jObj.Value<bool>("success"))
                        {
                            msgPayload.Subject = jObj.Value<string>("subject");
                            msgPayload.Message = jObj.Value<string>("content");
                        }
                        else
                        {
                            msgPayload.Message = jObj.Value<string>("error") ?? "AI response indicates failure.";
                        }
                    }
                    catch (Newtonsoft.Json.JsonException ex)
                    {
                        msgPayload.Message = "Error parsing response from AI.";
                    }
                }
                else
                {
                    msgPayload.Message = "API returned an error.";
                }
            }

            return msgPayload;
        }

    }
}
