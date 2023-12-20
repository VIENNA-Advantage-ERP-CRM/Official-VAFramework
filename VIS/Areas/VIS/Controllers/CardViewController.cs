using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using VAdvantage.Utility;
using VIS.Models;
namespace VIS.Controllers
{

    public class CardViewController : Controller
    {
        //
        // GET: /VIS/CardView/
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Get Card view 
        /// </summary>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <returns></returns>
        public JsonResult GetCardView(int ad_Window_ID, int ad_Tab_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            List<CardViewPropeties> lstCardView = objCardViewModel.GetCardView(ad_Window_ID, ad_Tab_ID, ctx);
            List<RolePropeties> lstRole = objCardViewModel.GetAllRoles(ctx);
            List<List<RolePropeties>> lstCardViewRole = new List<List<RolePropeties>>();
            List<CardViewConditionPropeties> lstCVConditon = new List<CardViewConditionPropeties>();
            if (lstCardView != null)
            {
                for (int i = 0; i < lstCardView.Count; i++)
                {
                    //lstCardViewRole.Add(objCardViewModel.GetCardViewRole(lstCardView[i].CardViewID, ctx));
                    lstCVConditon = objCardViewModel.GetCardViewCondition(lstCardView[i].CardViewID, ctx);
                }
            }
            ParameterPropeties objParamProperties = new ParameterPropeties()
            {
                lstCardViewData = lstCardView,
                lstRoleData = lstRole,
                lstCardViewRoleData = lstCardViewRole,
                lstCardViewConditonData = lstCVConditon

            };
            List<ParameterPropeties> lstParamProperties = new List<ParameterPropeties>();
            lstParamProperties.Add(objParamProperties);
            var jsonResult = Json(JsonConvert.SerializeObject(lstParamProperties), JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        /// <summary>
        /// Get Card view Columns
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <returns></returns>
        public JsonResult GetCardViewColumns(int ad_CardView_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            List<CardViewPropeties> lstCardView = objCardViewModel.GetCardViewColumns(ad_CardView_ID, ctx);
            List<CardViewConditionPropeties> lstCVConditon = objCardViewModel.GetCardViewCondition(ad_CardView_ID, ctx);
            ParameterPropeties objParamProperties = new ParameterPropeties()
            {
                lstCardViewData = lstCardView,
                lstCardViewConditonData = lstCVConditon

            };
            List<ParameterPropeties> lstParamProperties = new List<ParameterPropeties>();

            lstParamProperties.Add(objParamProperties);
            var jsonResult = Json(JsonConvert.SerializeObject(lstParamProperties), JsonRequestBehavior.AllowGet);
            jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        /// <summary>
        /// Save Card view Columns
        /// </summary>
        /// <param name="lstCardView"></param>
        /// <param name="lstCardViewColumns"></param>
        /// <param name="lstCardViewCondition"></param>
        /// <param name="excludeGrp"></param>
        /// <param name="orderByClause"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult SaveCardViewColumns(List<CardViewPropeties> lstCardView, List<CardViewPropeties> lstCardViewColumns/*, List<RolePropeties> LstRoleID*/, List<CardViewConditionPropeties> lstCardViewCondition, string excludeGrp, string orderByClause)
        {
            bool isNewRecord = lstCardView[0].isNewRecord;
            int id = 0;
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            if (isNewRecord)
            {
                id = objCardViewModel.SaveCardViewRecord(lstCardView[0].CardViewName, lstCardView[0].AD_Window_ID, lstCardView[0].AD_Tab_ID, lstCardView[0].UserID, lstCardView[0].AD_GroupField_ID, ctx, 0/*, LstRoleID*/, lstCardViewCondition, lstCardView[0].AD_HeaderLayout_ID, lstCardView[0].isPublic, lstCardView[0].groupSequence, excludeGrp, orderByClause);
            }
            else
            {
                if (lstCardViewColumns != null)
                {
                    objCardViewModel.DeleteAllCardViewColumns(lstCardView[0].CardViewID, ctx);
                }
                id = objCardViewModel.SaveCardViewRecord(lstCardView[0].CardViewName, lstCardView[0].AD_Window_ID, lstCardView[0].AD_Tab_ID, lstCardView[0].UserID, lstCardView[0].AD_GroupField_ID, ctx, lstCardView[0].CardViewID/*, LstRoleID*/, lstCardViewCondition, lstCardView[0].AD_HeaderLayout_ID, lstCardView[0].isPublic, lstCardView[0].groupSequence, excludeGrp, orderByClause);
            }

            if (lstCardView[0].IsDefault)
            {
                objCardViewModel.SetDefaultCardView(ctx, id, lstCardView[0].AD_Tab_ID);
            }

            int sqNo = 0;
            if (lstCardViewColumns != null)
            {
                for (int i = 0; i < lstCardViewColumns.Count; i++)
                {
                    //if (isNewRecord)
                    //{
                    lstCardViewColumns[i].CardViewID = id;
                    //}
                    sqNo = lstCardViewColumns[i].SeqNo; //((i + 1) * 10);
                    objCardViewModel.SaveCardViewColumns(lstCardViewColumns[i].CardViewID, lstCardViewColumns[i].AD_Field_ID, sqNo, ctx, lstCardViewColumns[i].sort);
                    id = lstCardViewColumns[i].CardViewID;
                }
            }
            var jsonResult = Json(JsonConvert.SerializeObject(id), JsonRequestBehavior.AllowGet); jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;


        }
        /// <summary>
        /// Delete Card view 
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult DeleteCardViewRecord(int ad_CardView_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            objCardViewModel.DeleteCardViewRecord(ad_CardView_ID, ctx);
            var jsonResult = Json(JsonConvert.SerializeObject(""), JsonRequestBehavior.AllowGet); jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        /// <summary>
        /// Delete Template
        /// </summary>
        /// <param name="tempID"></param>
        /// <returns></returns>
        public JsonResult DeleteTemplate(int tempID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            objCardViewModel.DeleteTemplate(tempID);
            var jsonResult = Json(JsonConvert.SerializeObject(""), JsonRequestBehavior.AllowGet); jsonResult.MaxJsonLength = int.MaxValue;
            return jsonResult;
        }

        /// <summary>
        /// Set Default Card
        /// </summary>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="cardView"></param>
        /// <returns></returns>
        public JsonResult SetDefaultView(int AD_Tab_ID, int cardView)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            objCardViewModel.SetDefaultView(ctx, AD_Tab_ID, cardView);
            var jsonResult = Json(JsonConvert.SerializeObject(""), JsonRequestBehavior.AllowGet);
            return jsonResult;
        }

        /// <summary>
        /// Update card from Drag and drop
        /// </summary>
        /// <param name="grpID"></param>
        /// <param name="recordID"></param>
        /// <param name="columnName"></param>
        /// <param name="tableName"></param>
        /// <returns>int</returns>
        public string UpdateCardByDragDrop(string grpValue, int recordID, string columnName, string tableName, int dataType)
        {

            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            return objCardViewModel.UpdateCardByDragDrop(ctx, grpValue, recordID, columnName, tableName, dataType);
        }

        /// <summary>
        /// Get Column ID and Window ID
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="columnName"></param>
        /// <returns></returns>
        public JsonResult GetColumnIDWindowID(string tableName, string columnName)
        {
            CardViewModel objCardViewModel = new CardViewModel();
            return Json(JsonConvert.SerializeObject(objCardViewModel.GetColumnIDWindowID(tableName, columnName)), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Get Template 
        /// </summary>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <returns></returns>
        public JsonResult GetTemplateDesign(int ad_Window_ID, int ad_Tab_ID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            return Json(JsonConvert.SerializeObject(objCardViewModel.GetTemplateDesign(ctx, ad_Window_ID, ad_Tab_ID)));
        }


        /// <summary>
        /// Get card Template 
        /// </summary>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <returns></returns>
        public JsonResult GetSystemTemplateDesign()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            return Json(JsonConvert.SerializeObject(objCardViewModel.GetSystemTemplateDesign(ctx)));
        }

        /// <summary>
        /// Save Card template
        /// </summary>
        /// <param name="CardViewID"></param>
        /// <param name="templateID"></param>
        /// <param name="templateName"></param>
        /// <param name="style"></param>
        /// <param name="cardSection"></param>
        /// <param name="cardTempField"></param>
        /// <returns></returns>
        public JsonResult SaveCardTemplate(int CardViewID, int templateID, string templateName, int templateCategory, string style, List<CardSection> cardSection, List<CardTempField> cardTempField, string isSystemTemplate, int refTempID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            if (CardViewID > 0)
            {
                objCardViewModel.DeleteAllCardViewColumns(CardViewID, ctx);
            }
            return Json(JsonConvert.SerializeObject(objCardViewModel.SaveCardTemplate(ctx, CardViewID, templateID, templateName, templateCategory, style, cardSection, cardTempField, isSystemTemplate, refTempID)));
        }

        /// <summary>
        /// Get Template Category
        /// </summary>
        /// <returns></returns>
        public JsonResult GetTemplateCategory()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            CardViewModel objCardViewModel = new CardViewModel();
            return Json(JsonConvert.SerializeObject(objCardViewModel.GetTemplateCategory(ctx)));
        }

        /// <summary>
        /// Get Card Export Data
        /// </summary>
        /// <param name="RecordID"></param>
        /// <param name="TableID"></param>
        /// <returns></returns>
        public JsonResult GetCardExportData(string _strRecordID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            CardViewModel model = new CardViewModel();
            return Json(JsonConvert.SerializeObject(model.GetCardExportData(ct, _strRecordID)), JsonRequestBehavior.AllowGet);
        }
        
        /// <summary>
        /// Get Exported Template IDs
        /// </summary>
        /// <returns></returns>
        public JsonResult GetExportTemplateIDs()
        {
            Ctx ct = Session["ctx"] as Ctx;
            CardViewModel model = new CardViewModel();
            return Json(JsonConvert.SerializeObject(model.GetExportTemplateIDs(ct)), JsonRequestBehavior.AllowGet);
        } 
        
        /// <summary>
        /// Remove Exported Template
        /// </summary>
        /// <param name="templateID"></param>
        /// <returns></returns>
        public JsonResult RemoveExportTemplate(int templateID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            CardViewModel model = new CardViewModel();
            return Json(JsonConvert.SerializeObject(model.RemoveExportTemplate(ct,templateID)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Card template Export
        /// </summary>
        /// <param name="moduleId"></param>
        /// <param name="_strRecordID"></param>
        /// <returns></returns>
        public JsonResult SaveCardExportData(int[] moduleId, string _strRecordID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            if (ctx != null)
            {
                CardViewModel model = new CardViewModel();
                return Json(new { result = model.SaveCardExportData(moduleId, _strRecordID, ctx) }, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { result = "SessionExpired" }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}