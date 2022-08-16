using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using VAdvantage.Utility;
using VIS.Filters;
using VIS.Models;

namespace VIS.Controllers
{

    [AjaxAuthorizeAttribute] // redirect to login page if request is not Authorized
    [AjaxSessionFilterAttribute] // redirect to Login/Home page if session expire
    [AjaxValidateAntiForgeryToken] // validate antiforgery token 
    public class TreeMaintenanceController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public JsonResult TreeDataForCombo()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.TreeDataForCombo();
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        public JsonResult BindTree(string treeType, int AD_Tree_ID, string isAllNodes, bool isSummary)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.BindTree(ctx, treeType, AD_Tree_ID, isAllNodes, isSummary);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        public JsonResult LoadMenuData(int pageLength, int pageNo, int treeID, string searchtext, string demandsMenu)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.LoadMenuData(ctx, pageLength, pageNo, treeID, searchtext, demandsMenu);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        //public JsonResult SaveDataOnDrop(int summaryid, int nodid, int treeID, int dragMenuNodeID)
        public JsonResult SaveDataOnDrop(int summaryid, int nodid, int treeID, string dragMenuNodeID, bool checkMorRdragable, string IsExistItem)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.SaveDataOnDrop(ctx, summaryid, nodid, treeID, dragMenuNodeID, checkMorRdragable, IsExistItem);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetDataTreeNodeSelect(int nodeID, int treeID, int pageNo, int pageLength, string searchChildNode, string getTreeNodeChkValue)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.GetDataTreeNodeSelect(ctx, nodeID, treeID, pageNo, pageLength, searchChildNode, getTreeNodeChkValue);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetNodePath(int node_ID, int treeID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.GetNodePath(ctx, node_ID, treeID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public JsonResult SaveTreeDragDrop(int treeID, int NodeID, int ParentID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.SaveTreeDragDrop(ctx, treeID, NodeID, ParentID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        ////unlinkchild
        public JsonResult DeleteNodeFromTree(int nodeid, int treeID, string unlinkchild, string menuArray)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.DeleteNodeFromTree(ctx, nodeid, treeID, unlinkchild, menuArray);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public JsonResult DeleteNodeFromBottom(string nodeid, int treeID, string menuArray)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.DeleteNodeFromBottom(ctx, nodeid, treeID, menuArray);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public JsonResult TreeTableName(int treeID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.TreeTableName(ctx, treeID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public JsonResult UpdateItemSeqNo(int treeID, string itemsid, int ParentID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.UpdateItemSeqNo(ctx, treeID, itemsid, ParentID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }





        public JsonResult SelectAllChildNodes(string TableName, int treeID, string nodeID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.SelectAllChildNodes(ctx,  TableName,  treeID,  nodeID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }




        public JsonResult FillSequenceDailog(int nodeID, int treeID, int pageNo, int pageLength, string searchChildNode, string getTreeNodeChkValue)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.FillSequenceDailog(ctx, nodeID, treeID, pageNo, pageLength, searchChildNode, getTreeNodeChkValue);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }



        public JsonResult RemoveLinkedItemFromTree(int treeID, string menuId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel obj = new TreeMaintenanceModel(ctx);
            var result = obj.RemoveLinkedItemFromTree(ctx, treeID, menuId);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }


        public JsonResult GetTableID(string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetTableId(treeId)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetTableName(string table_id)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetTableName(table_id)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetTreeType(string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetTreeType(treeId)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetRecordCount(string tableName, string tableTreeName, string treeID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetRecordCount(tableName, tableTreeName, treeID)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetNodeIds(string tableTreeName, string treeID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetNodeIds( tableTreeName, treeID)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetChildIDs(string treeId, string tbname, string delNodId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetChildIDs(treeId, tbname, delNodId)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetNodeIdsOfParent(string tbname, string parent_id, string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetNodeIdsOfParent(tbname, parent_id, treeId)), JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetRestrictionCount(string tableTreeName, string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetRestrictionCount(tableTreeName, treeId)), JsonRequestBehavior.AllowGet);
        }
        public JsonResult IsRecordExists( string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.IsRecordExists(treeId)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetWindowMenuIds()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetWindowMenuIds()), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetFormMenuIds()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetFormMenuIds()), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetNameByIds(string ids)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetNameByIds(ids)), JsonRequestBehavior.AllowGet);
        }
        public JsonResult GetSeqNo(string tblName, string treeId, string nodeId)
        { 
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetSeqNo( tblName, treeId, nodeId)), JsonRequestBehavior.AllowGet);
        }
        public JsonResult UpdateSeqNo(string tblName, string seqNo, string treeId,string nodeId,bool bySeqNo,bool isParent)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.UpdateSeqNo( tblName,  seqNo,  treeId,nodeId,bySeqNo,isParent)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetParentId(string tblName, string nodeId, string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetParentId(tblName, nodeId, treeId)), JsonRequestBehavior.AllowGet);
        }

        public JsonResult UpdateSeqNoParentId(string tblName, string pid, string seqNo,string nodeId, string treeId)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.UpdateSeqNoParentId(tblName, pid, seqNo, treeId,nodeId )), JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetWindowtId()
        {
            Ctx ctx = Session["ctx"] as Ctx;
            TreeMaintenanceModel model = new TreeMaintenanceModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetWindowtId()), JsonRequestBehavior.AllowGet);
        }
    }
}