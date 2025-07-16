/************************************************************
* Module Name    : VIS
* Purpose        :  Assign Record To User
* chronological  : Development
* Created Date   : 12 December 2024
* Created by     : Yashit(VAI058)
***********************************************************/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class AssignedRecordToUserController : Controller
    {
        // GET: VIS/AssignedRecordToUser
        public ActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// Assign Record To User
        /// </summary>
        /// <param name="AD_User_ID"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public JsonResult AssignRecord(int AD_User_ID, int AD_Window_ID, int AD_Table_ID, List<int> Record_ID)
        {

            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.AssignRecordToUser(ctx, AD_User_ID, AD_Window_ID, AD_Table_ID, Record_ID);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        ///  Get Count of Assigned Record To User
        /// </summary>
        /// <param name="pageSize"></param>
        /// <param name="pageNo"></param>
        /// <returns></returns>
        public JsonResult AssignRecordToUserWidget(int pageSize, int pageNo, bool getAll)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.AssignRecordToUserWidget(ctx, pageSize, pageNo, getAll);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Set Status
        /// </summary>
        /// <param name="status"></param>
        /// <param name="VIS_AssignedRecordToUser_ID"></param>
        /// <returns></returns>
        public JsonResult SetStatus(int AD_Window_ID, int AD_Table_ID, int Record_ID, string status)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.SetStatus(ctx, AD_Window_ID, AD_Table_ID, Record_ID, status);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Delete Record
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public JsonResult DeleteRecord(int AD_Window_ID, int AD_Table_ID, int[] Record_ID)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.DeleteRecord(ctx, AD_Window_ID, AD_Table_ID, Record_ID);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get assigned records
        /// </summary>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public JsonResult GetAssignedRecord(int[] Record_ID)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.GetAssignedRecord(ctx, Record_ID);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// return count and recordIDs to ZoomAssignedRecordOnWindow
        /// </summary>
        /// <param name="AD_Window_ID"></param>
        /// <returns></returns>
        public JsonResult ZoomAssignedRecordOnWindow(int AD_Window_ID)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.ZoomAssignedRecordOnWindow(ctx, AD_Window_ID);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// This fucntion is used to get window records which is clicked
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="WindowId">WindowId</param>
        /// <param name="TableID">TableID</param>
        /// <param name="Record_ID">Record_ID</param>
        /// <param name="pageNo">pageNo</param>
        /// <param name="pageSize">pageSize</param>
        /// <param name="SrchTxt">SrchTxt</param>
        /// <returns>List of data</returns>
        /// <author>VIS_427</author>
        public JsonResult GeWindowRecords(int WindowId,int TableID,string Record_ID,int pageNo,int pageSize,string SrchTxt)
        {
            dynamic result = 0;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AssignedRecordToUser obj = new AssignedRecordToUser();
                result = obj.GeWindowRecords(ctx, WindowId, TableID, Record_ID, pageNo, pageSize, SrchTxt);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
    }
}