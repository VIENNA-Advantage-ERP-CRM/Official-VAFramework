﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Classes;
using VIS.DataContracts;
using VIS.Filters;
using VIS.Helpers;
using VIS.Models;

namespace VIS.Controllers
{
    [AjaxAuthorizeAttribute] // redirect to login page if request is not Authorized
    [AjaxSessionFilterAttribute] // redirect to Login/Home page if session expire
    [AjaxValidateAntiForgeryToken] // validate antiforgery token 
    //[SessionState(SessionStateBehavior.ReadOnly)]

    public class FormController : Controller
    {

        #region Common

        public JsonResult JDataSet(SqlParamsIn sqlIn)
        {
            SqlHelper h = new SqlHelper();
            Ctx ctx = Session["ctx"] as Ctx;
            h.SetContext(ctx);
            sqlIn.sql = SecureEngineBridge.DecryptByClientKey(sqlIn.sql, ctx.GetSecureKey());
            sqlIn.sql = Server.HtmlDecode(sqlIn.sql);
           object data = h.ExecuteJDataSet(sqlIn);
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Request
        public ActionResult GetProcessedRequest(int AD_Table_ID, int Record_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetProcessedRequest(AD_Table_ID, Record_ID)), JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region zoomAccross
        public ActionResult GetZoomTargets(string tableName)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetZoomTargets(tableName)), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetZoomTarget(string targetTableName, int curWindow_ID, string targetWhereClause)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetZoomTargets(ctx,targetTableName, curWindow_ID, targetWhereClause)), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetZoomWindow(string targetTableName, int curWindow_ID, string targetWhereClause)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            targetWhereClause = SecureEngineBridge.DecryptByClientKey(targetWhereClause, ctx.GetSecureKey());
            if (!QueryValidator.IsValid(targetWhereClause))
            {
                return Json(null);
            }
            return Json(JsonConvert.SerializeObject(model.GetZoomTargets(ctx, targetTableName, curWindow_ID, targetWhereClause)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get isSOtrx setting for zoom record
        /// </summary>
        /// <param name="parentTable"></param>
        /// <param name="targetTableName"></param>
        /// <param name="targetWhereClause"></param>
        /// <returns></returns>
        public ActionResult GetZoomIsSOTrx(string parentTable, string targetTableName, string targetWhereClause)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            targetWhereClause = SecureEngineBridge.DecryptByClientKey(targetWhereClause, ctx.GetSecureKey());
            if (!QueryValidator.IsValid(targetWhereClause))
            {
                return Json(null);
            }
            return Json(JsonConvert.SerializeObject(model.GetZoomIsSOTrx(ctx, parentTable, targetTableName, targetWhereClause)), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region processFrame.js
        public ActionResult GetPrintFormatDetails(int AD_Table_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);

            string sql = MRole.GetDefault(ctx).AddAccessSQL(
                     "SELECT AD_PrintFormat_ID, Name, Description,IsDefault "
                         + "FROM AD_PrintFormat "
                         + "WHERE AD_Table_ID= " + AD_Table_ID
                         + " ORDER BY Name",
                     "AD_PrintFormat", MRole.SQL_NOTQUALIFIED, MRole.SQL_RO);


            SqlParamsIn sqlP = new SqlParamsIn();
            sqlP.sql = sql;

            VIS.Helpers.SqlHelper help = new Helpers.SqlHelper();
            List<JTable> result = help.ExecuteJDataSet(sqlP);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);

        }
        #endregion

        #region utility.js
        public ActionResult GetWorkflowWindowID(int AD_Table_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetWorkflowWindowID(AD_Table_ID)), JsonRequestBehavior.AllowGet);

        }

        public ActionResult GetZoomWindowID(int AD_Table_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetZoomWindowID(AD_Table_ID)), JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region Class.js
        public ActionResult GetZoomTargetClass(string targetTableName, int curWindow_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetZoomTargetClass(ctx, targetTableName, curWindow_ID)), JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region controls
        public ActionResult GetZoomWhereClause(string sql)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            SqlParamsIn sqlP = new SqlParamsIn();
            sql = SecureEngineBridge.DecryptByClientKey(sql, ctx.GetSecureKey());
            sqlP.sql = sql;
            VIS.Helpers.SqlHelper help = new Helpers.SqlHelper();
            return Json(JsonConvert.SerializeObject(help.ExecuteJDataSet(sqlP)), JsonRequestBehavior.AllowGet);
        }

        public ContentResult GetAccessSql(string columnName, string text)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Content(model.GetAccessSql(columnName, text));
        }

        public ActionResult GetKeyText(string Validation, int AD_HeaderItem_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            List<LookUpData> data = new List<LookUpData>();
            if (!string.IsNullOrEmpty(Validation))
                data = JsonConvert.DeserializeObject<List<LookUpData>>(Validation);
            return Json(JsonConvert.SerializeObject(model.GetKeyText(data, AD_HeaderItem_ID)), JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// autocomplete search 
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="columnName"></param>
        /// <param name="text"></param>
        /// <returns></returns>
        ///  Mandeep Singh(VIS0028) 13-sep-2021
        public ActionResult GetAccessSqlAutoComplete(string columnName, string text, int windowNo,
              int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Validation, string LookupData)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            LookupHelper model = new LookupHelper();
            return Json(JsonConvert.SerializeObject(model.GetAccessSqlAutoComplete(ctx, columnName, text, windowNo,
                AD_Window_ID, AD_Tab_ID, AD_Field_ID, Validation, LookupData)), JsonRequestBehavior.AllowGet);
        }



        public ActionResult GetTextButtonQueryResult(string Text, int windowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string ColumnName,
             string ValidationCode)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel mode = new FormModel(ctx);
            SqlHelper help = new SqlHelper();
            SqlParamsIn sqlP = new SqlParamsIn();

            List<string> result = mode.GetTextButtonQueryResult(ctx, Text, windowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID, ColumnName, ValidationCode);
            sqlP.sql = Msg.ParseTranslation(ctx, result[0]);
            List<JTable> ds = help.ExecuteJDataSet(sqlP);
            List<object> finalResult = new List<object>();
            finalResult.Add(ds);
            finalResult.Add(result[1]);
            finalResult.Add(result[2]);
            return Json(JsonConvert.SerializeObject(finalResult), JsonRequestBehavior.AllowGet);
        }
        #endregion

        #region lookup
        // JID_0932 Passed Organization ID as parameter  for adding validation
        public JsonResult GetWareProWiseLocator(string colName, int orgId, int warehouseId, int productId, bool onlyIsSOTrx)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetWareProWiseLocator(ctx, colName, orgId, warehouseId, productId, onlyIsSOTrx)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetValidAccountCombination(int AD_Client_ID, bool onlyActive)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetValidAccountCombination(AD_Client_ID, onlyActive)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GenAttributeSetInstance(int C_GenAttributeSet_ID, bool onlyActive)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GenAttributeSetInstance(C_GenAttributeSet_ID, onlyActive)), JsonRequestBehavior.AllowGet);
        }

        #endregion


        #region Role

        public ContentResult GetDocWhere(int AD_User_ID, string TableName)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Content(model.GetDocWhere(AD_User_ID, TableName));
        }

        #endregion

        #region TreePanel
        [HttpPost]
        public ContentResult UpdateTree(string oldParentChildren, string newParentChildren, int oldId, int newId, int AD_Tree_ID, string tableName)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);

            List<int> oldParentChildrens = null;
            if (oldParentChildren != null && oldParentChildren.Length > 0)
            {
                oldParentChildrens = JsonConvert.DeserializeObject<List<int>>(oldParentChildren);
            }

            List<int> newParentChildrens = null;
            if (newParentChildren != null && newParentChildren.Length > 0)
            {
                newParentChildrens = JsonConvert.DeserializeObject<List<int>>(newParentChildren);
            }

            return Content(model.UpdateTree(oldParentChildrens, newParentChildrens, oldId, newId, AD_Tree_ID, tableName));
        }
        #endregion

        #region AReport

        public ActionResult GetPrintFormats(int AD_Table_ID, int AD_Tab_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetPrintFormats(AD_Table_ID, AD_Tab_ID)), JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetShowReportDetails(int AD_Table_ID, int AD_Tab_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetShowReportDetails(AD_Table_ID, AD_Tab_ID)), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Controller

        public ActionResult GetTrxInfo(int Record_ID, bool isOrder)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetTrxInfo(Record_ID, isOrder)), JsonRequestBehavior.AllowGet);
        }

        public ActionResult LoadData(dynamic value)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);

            value = System.Web.Helpers.Json.Decode(value[0]);

            return Json(JsonConvert.SerializeObject(model.LoadData(value)), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region windowFrame
         [HttpPost]
        public ContentResult SetFieldsSorting(string values, string noYes, string tableName, string keyColumnName, string columnSortName, string columnYesNoName, string oldValues)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);

            List<string> valuess = null;
            if (values != null && values.Length > 0)
            {
                valuess = JsonConvert.DeserializeObject<List<string>>(values);
            }

            List<string> NoYe = null;
            if (noYes != null && noYes.Length > 0)
            {
                NoYe = JsonConvert.DeserializeObject<List<string>>(noYes);
            }

            Dictionary<string, string> oldValue = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(oldValues))
            {
                oldValue = JsonConvert.DeserializeObject<List<KeyValuePair<string, string>>>(oldValues)
                                 .ToDictionary(x => x.Key, y => y.Value);
            }

            return Content(model.SetFieldsSorting(valuess, NoYe, tableName, keyColumnName, columnSortName, columnYesNoName, oldValue));
        }

        [HttpPost]
        public ActionResult LoadSortData(string AD_Table_ID, string AD_ColumnSortOrder_ID, string AD_ColumnSortYesNo_ID,
            string AD_Language, string ID,bool isTrl)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            return Json(JsonConvert.SerializeObject(model.LoadSortData(AD_Table_ID, AD_ColumnSortOrder_ID, AD_ColumnSortYesNo_ID, AD_Language, ID, isTrl)), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region
        [Obsolete("Use AccountForm controller's GetValidCombination")]
        [HttpPost]
        public JsonResult GetValidCombination(dynamic accountSchemaElements, dynamic Elements, dynamic aseList, string value, string sb)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            FormModel model = new FormModel(ctx);
            accountSchemaElements = System.Web.Helpers.Json.Decode(accountSchemaElements[0]);
            Elements = System.Web.Helpers.Json.Decode(Elements[0]);
            aseList = System.Web.Helpers.Json.Decode(aseList[0]);
            return Json(model.GetValidCombination(accountSchemaElements, Elements, aseList, value, sb), JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Generate XClasses

        public JsonResult GenerateXClasses(string directory, bool chkStatus, string tableId, string classType)
        {
            if (Session["Ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                StringBuilder sbTextCopy = new StringBuilder();
                string fileName = string.Empty;

                var msg = VAdvantage.Tool.GenerateModel.StartProcess("ViennaAdvantage.Model", directory, chkStatus, tableId, classType, out sbTextCopy, out fileName);
                string contant = sbTextCopy.ToString();
                return Json(new { contant, fileName, msg }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { result = "Error" }, JsonRequestBehavior.AllowGet);
        }
        #endregion


    }
}