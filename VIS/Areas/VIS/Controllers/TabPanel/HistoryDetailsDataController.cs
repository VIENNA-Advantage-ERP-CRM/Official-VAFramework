/********************************************************
 * Module Name    :    VA Framework
 * Purpose        :    History Details Tab Panel
 * Employee Code  :    60
 * Date           :    17-August-2021
  ******************************************************/

using Ionic.Zip;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Reflection;
using System.Web.Mvc;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class HistoryDetailsDataController : Controller
    {
        /// <summary>
        /// Getting History Records by passing parameters
        /// </summary>
        /// <param name="RecordId">Record ID</param>
        /// <param name="_AD_Table_ID">Table ID</param>
        /// <param name="CurrentPage">Page No</param>
        /// <returns>History Records</returns>
        public JsonResult GetHistoryRecordDetails(string RecordId, string AD_Table_ID, string Type, string CurrentPage)
        {
            Ctx ct = Session["ctx"] as Ctx;
            int LId = Util.GetValueOfInt(RecordId);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetHistoryDetails(ct, LId, Util.GetValueOfInt(AD_Table_ID), Type, CurrentPage)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting History record count by passing parameters
        /// </summary>
        /// <param name="RecordId">Record ID</param> 
        /// <param name="_AD_Table_ID">Table ID</param>
        /// <returns>History Record count</returns>
        public JsonResult GetHistoryRecordsCount(string RecordId, string AD_Table_ID)
        {
            int LId = Util.GetValueOfInt(RecordId);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetHistoryRecordsCount(LId, Util.GetValueOfInt(AD_Table_ID))), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Delete History record by passing parameters
        /// </summary>
        /// <param name="RecordId">Record ID</param> 
        /// <param name="Type">Table ID</param>
        /// <returns>History Record count</returns>
        public JsonResult DeleteHistoryRecord(string RecordId, string Type)
        {
            Ctx ct = Session["ctx"] as Ctx;
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.DeleteHistoryRecord(ct, Util.GetValueOfInt(RecordId), Type)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// email details
        /// </summary>
        /// <param name="ID">id</param>
        /// <returns></returns>
        public JsonResult GetSelectedMailDetails(int ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            HistoryDetailsDataModel model = new HistoryDetailsDataModel();
            MailDetails mailInfo = model.GetMailDetails(ID, ct);
            return Json(JsonConvert.SerializeObject(mailInfo), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// letter details
        /// </summary>
        /// <param name="ID">id</param>
        /// <returns></returns>
        public JsonResult GetSelectedLetterDetails(int ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            HistoryDetailsDataModel model = new HistoryDetailsDataModel();
            MailDetails letterInfo = model.GetLetterDetails(ID, ct);
            return Json(JsonConvert.SerializeObject(letterInfo), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// call details for history
        /// </summary>
        /// <param name="ID">id</param>
        /// <returns></returns>        
        public JsonResult GetSelectedCallDetails(int ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            HistoryDetailsDataModel model = new HistoryDetailsDataModel();
            CallInfo callInfo = model.GetCallDetails(ctx, ID);
            return Json(JsonConvert.SerializeObject(callInfo), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get Appointment Data
        /// </summary>
        /// <param name="AppQry"></param>
        /// <returns></returns>
        public JsonResult GetSelectedAppointmentDetails(string record_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            int appointmentId = Util.GetValueOfInt(record_ID);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetAppointmentDetails(ctx, appointmentId)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting selected task Details by passing parameters
        /// </summary>
        /// <param name="record_ID"></param>
        /// <returns>History details</returns>
        public JsonResult GetSelectedTaskDetails(string record_ID)
        {
            int taskId = Util.GetValueOfInt(record_ID);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetTaskDetails(taskId)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting selected attach Details by passing parameters
        /// </summary>
        /// <param name="record_ID"></param>
        /// <returns>History details</returns>
        public JsonResult GetSelectedAttachmentDetails(string record_ID)
        {
            int attachId = Util.GetValueOfInt(record_ID);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetAttachmentDetails(attachId)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting selected chat Details by passing parameters
        /// </summary>
        /// <param name="record_ID"></param>
        /// <returns>History details</returns>
        public JsonResult GetSelectedChatDetails(string record_ID)
        {
            int chatId = Util.GetValueOfInt(record_ID);
            Ctx ctx = Session["ctx"] as Ctx;
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetChatDetails(ctx, chatId)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting Chat History Records by passing parameters
        /// </summary>
        /// <param name="RecordId">Record ID</param>
        /// <param name="_AD_Table_ID">Table ID</param>
        /// <param name="CurrentPage">Page No</param>
        /// <returns>History Records</returns>
        public JsonResult GetChatHistoryDetails(int UserId, int RecordId, int AD_Table_ID, string Type)
        {
            Assembly asm = Assembly.Load("WorkspaceSvc");
            Type type = asm.GetType("WorkspaceSvc.Classes.UtilUnipileServices");
            object[] param = new object[4];
            param[0] = 0;
            param[1] = AD_Table_ID;
            param[2] = RecordId;
            param[3] = Type;
            var resultObj = type.GetMethod("GetChatHistory").Invoke(null, param);
            return Json(JsonConvert.SerializeObject(resultObj), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Getting selected Chat Message Details by passing parameters
        /// </summary>
        /// <param name="record_ID"></param>
        /// <returns>History details</returns>
        public JsonResult GetSelectedChatMessage(string record_ID)
        {
            int chatId = Util.GetValueOfInt(record_ID);
            Assembly asm = Assembly.Load("WorkspaceSvc");
            Type type = asm.GetType("WorkspaceSvc.Classes.UtilUnipileServices");
            object[] param = new object[1];
            param[0] = chatId;
            var resultObj = type.GetMethod("GetChatMessage").Invoke(null, param);
            return Json(JsonConvert.SerializeObject(resultObj), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get User Image
        /// </summary>
        /// <param name="User_ID"> User ID</param>          
        /// <returns>Image Url</returns>
        public JsonResult GetUserImage(int User_ID)
        {
            HistoryDetailsDataModel obj = new HistoryDetailsDataModel();
            var result = obj.GetUserImage(User_ID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// history attachment download
        /// </summary>
        /// <param name="AttID">Attachment ID</param>
        /// <param name="ID">File ID</param>
        /// <param name="Name">File Name</param>
        /// <returns>Attachment path</returns>
        public JsonResult DownloadHistoryAttachment(int AttID, int ID, string Name)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            Name = Server.HtmlDecode(Name);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetHistoryAttachmentName(ctx, AttID, ID, Name)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Download Attachment
        /// </summary>
        /// <param name="ID"></param>
        /// <param name="Name"></param>
        /// <returns></returns>
        public JsonResult DownloadAttachment(int ID, string Name)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            Name = Server.HtmlDecode(Name);
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetAttachmentName(ctx, ID, Name, Server.MapPath("~/TempDownload"))), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// DownloadAllAttachments
        /// </summary>
        /// <param name="ID"></param>
        /// <param name="Name"></param>
        /// <returns></returns>
        public JsonResult DownloadAllAttachments(int ID, string Name)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetAllAttachmentsZipName(ctx, ID, Server.HtmlDecode(Name), Server.MapPath("~/TempDownload"))), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get API User Account
        /// </summary>
        /// <param name="Provider">Auth Provider</param>
        /// <returns>json, object</returns>
        public JsonResult GetUserAccount(int AuthProviderID, int MailConfigID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.GetUserAccount(ctx, AuthProviderID, MailConfigID)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Download Transcript
        /// </summary>
        /// <param name="MeetingUrl">Join URL</param>       
        /// <returns>json, object</returns>
        public JsonResult DownloadTranscript(int AppointmentID, int UserAccountID, string MeetingUrl)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            HistoryDetailsDataModel _model = new HistoryDetailsDataModel();
            return Json(JsonConvert.SerializeObject(_model.DownloadTranscript(ctx, AppointmentID, UserAccountID, MeetingUrl)), JsonRequestBehavior.AllowGet);
        }
    }
}

