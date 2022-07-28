﻿using CoreLibrary.DataBase;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Classes;
using VAdvantage.Controller;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Classes;
using VIS.DataContracts;
using VIS.Helpers;

namespace VIS.Areas.VIS.Controllers
{
    public class WindowController : Controller
    {
        // GET: VIS/Window
        public ActionResult Index()
        {
            return View();
        }

        //[HttpPost]
        //public JsonResult GetWindowRecords(Ctx ctxp, int AD_Window_ID, int WindowNo, int AD_Tab_ID, string whereClause, int AD_tree_ID, int Node_ID, bool summaryOnly,
        //    int CardID, List<string> encryptedfields, int AD_Table_ID, List<string> obscureFields, int MaxRows, int CurrentPage, int PageSize,
        //    bool doPaging)
        //{

        //    Ctx ctx = new Ctx(ctxp);
        //    whereClause = SecureEngineBridge.DecryptByClientKey(whereClause, ctx.GetSecureKey());
        //    if (!QueryValidator.IsValid(whereClause))
        //        return null;

        //    GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, AD_Window_ID, 0);

        //    GridTabVO gt = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();
        //    List<GridFieldVO> fields = gt.GetFields();

        //    StringBuilder sql = new StringBuilder("SELECT ");
        //    string selectSQL = "";
        //    StringBuilder selectDirect = null;
        //    List<string> imgColName = new List<string>();
        //    string SQL = "";
        //    string SQL_Count = "";
        //    string SQL_Select = "";
        //    string SQL_Direct = "";
        //    foreach (var field in fields)
        //    {
        //        if (sql.Length > 8)
        //            sql.Append(",");
        //        selectSQL = GetColumnSQL(true, field);

        //        if (selectSQL.IndexOf("@") == -1)
        //        {
        //            sql.Append(selectSQL);   //	ColumnName or Virtual Column
        //        }
        //        else
        //        {
        //            sql.Append(Env.ParseContext(ctx, WindowNo, selectSQL, false));
        //        }

        //        if (field.AD_Reference_ID == DisplayType.Image)
        //        {
        //            imgColName.Add(selectSQL);
        //        }

        //        if (field.lookupInfo != null && field.AD_Reference_ID != DisplayType.Account)
        //        {
        //            var lInfo = field.lookupInfo;
        //            if (!string.IsNullOrEmpty(lInfo.displayColSubQ) && gt.TableName.ToLower() != lInfo.tableName.ToLower())
        //            {


        //                if (selectDirect == null)
        //                    selectDirect = new StringBuilder("SELECT ");
        //                else
        //                    selectDirect.Append(",");

        //                var qryDirect = lInfo.queryDirect.Substring(lInfo.queryDirect.LastIndexOf(" FROM " + lInfo.tableName + " "));

        //                if (!field.IsVirtualColumn)
        //                    qryDirect = qryDirect.Replace("@key", gt.TableName + '.' + GetColumnSQL(false, field));
        //                else
        //                    qryDirect = qryDirect.Replace("@key", GetColumnSQL(false, field));


        //                selectDirect.Append("( SELECT (").Append(lInfo.displayColSubQ).Append(") ").Append(qryDirect)
        //                    .Append(" ) AS ").Append(GetColumnSQL(false, field) + "_T")
        //                    .Append(',').Append(GetColumnSQL(true, field));
        //            }
        //            else if (field.lookupInfo != null && field.AD_Reference_ID == DisplayType.Account)
        //            {
        //                if (selectDirect == null)
        //                    selectDirect = new StringBuilder("SELECT ");
        //                else
        //                    selectDirect.Append(",");

        //                selectDirect.Append("( SELECT C_ValidCombination.Combination FROM C_ValidCombination WHERE C_ValidCombination.C_ValidCombination_ID=")
        //                    .Append(gt.TableName + "." + GetColumnSQL(false, field)).Append(" ) AS ")
        //                    .Append(GetColumnSQL(false, field) + "_T")
        //                    .Append(',').Append(GetColumnSQL(true, field));

        //            }
        //        }
        //    }


        //    selectSQL = null;

        //    Random ran = new Random();

        //    var randomNo = ran.Next();
        //    if (imgColName.Count > 0)
        //    {
        //        for (var im = 0; im < imgColName.Count; im++)
        //            sql.Append(", (SELECT ImageURL||'?random=" + randomNo + "' from AD_Image img where img.AD_Image_ID=CAST(" + gt.TableName + "." + imgColName[im] + " AS INTEGER)) as imgUrlColumn" + imgColName[im]);
        //    }

        //    //
        //    sql.Append(" FROM ").Append(gt.TableName);


        //    SQL_Select = sql.ToString();

        //    GridWindowVO orignialVo = AEnv.GetMWindowOriginalVO(ctx, WindowNo, AD_Window_ID, 0);

        //    orignialVo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault().SelectSQL = SQL_Select;

        //    SQL_Count = "SELECT COUNT(*) FROM " + gt.TableName;

        //    var m_SQL_Where = new StringBuilder("");

        //    //	WHERE
        //    var _whereClause = whereClause;

        //    if (_whereClause.Length > 0)
        //    {
        //        m_SQL_Where.Append(" WHERE ");
        //        if (_whereClause.IndexOf("@") == -1)
        //        {
        //            m_SQL_Where.Append(_whereClause);
        //        }
        //        else    //  replace variables
        //            m_SQL_Where.Append(Env.ParseContext(ctx, WindowNo, _whereClause, false));
        //        //
        //        if (_whereClause.ToUpper().IndexOf("=NULL") > 0)
        //        {
        //            // this.log.Severe("Invalid NULL - " + _tableName + "=" + _whereClause);
        //        }
        //    }

        //    SQL = SQL_Select + m_SQL_Where.ToString();
        //    SQL_Count += m_SQL_Where.ToString();

        //    //Always true for window
        //    //if (gt._withAccessControl)
        //    {

        //        SQL = MRole.GetDefault(ctx).AddAccessSQL(SQL,
        //            gt.TableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);

        //        //this.SQL_Count = "SELECT COUNT(*) FROM " + gt._tableName + this.SQL.replaceAll(this.SQL_Select, '');
        //        SQL_Count = "SELECT COUNT(*) FROM " + gt.TableName + SQL.Substring(SQL_Select.Length);
        //        // this.SQL_Count = VIS.MRole.addAccessSQL(this.SQL_Count,
        //        // gt._tableName, VIS.MRole.SQL_FULLYQUALIFIED, VIS.MRole.SQL_RO);
        //    }

        //    if (selectDirect != null)
        //        SQL_Direct = selectDirect.ToString() + ' ' + SQL_Count.Substring(SQL_Count.IndexOf(" COUNT(*) FROM") + 9);
        //    else
        //        SQL_Direct = "";

        //    if (!String.IsNullOrEmpty(gt.OrderByClause))
        //    {
        //        SQL += " ORDER BY " + gt.OrderByClause;
        //        SQL_Direct += " ORDER BY " + gt.OrderByClause;
        //    }

        //    int rCount = 0;
        //    if (AD_tree_ID > 0)
        //    {
        //        using (var w = new WindowHelper())
        //        {
        //            rCount = w.GetRecordCountForTreeNode(whereClause, ctx, gt.AD_Table_ID, AD_tree_ID, Node_ID, WindowNo, summaryOnly);
        //        }
        //    }
        //    else
        //    {
        //        if (CardID > 0)
        //        {
        //            using (var w = new WindowHelper())
        //            {
        //                rCount = w.GetRecordCountWithCard(SQL_Count, CardID);
        //            }
        //        }
        //        else
        //        {
        //            rCount = Convert.ToInt32(DB.ExecuteScalar(SQL_Count));
        //        }
        //    }

        //    if (MaxRows > 0 && rCount > MaxRows)
        //    {
        //        /************************ Set Max Rows ***********************************/
        //        // m_pstmt.setMaxRows(maxRows);
        //        PageSize = MaxRows;
        //        //info.Append(" - MaxRows=").Append(_maxRows);
        //        //rowChanged = MaxRows;
        //    }

        //    else if (!doPaging || (PageSize > rCount))
        //    {
        //        PageSize = rCount;
        //    }

        //    /* Multi Delete may Decrease pages */
        //    if (doPaging)
        //    {
        //        if ((rCount + PageSize) <= (CurrentPage * PageSize))
        //        {
        //            --CurrentPage;
        //        }
        //    }

        //    SqlParamsIn sqlIn = new SqlParamsIn();
        //    sqlIn.sql = SQL.ToString();
        //    sqlIn.sqlDirect = SQL_Direct;
        //    sqlIn.pageSize = PageSize;
        //    sqlIn.page = CurrentPage;
        //    WindowRecordOut resultData = new WindowRecordOut();

        //    if (rCount > 0)
        //    {
        //        if (AD_tree_ID > 0)
        //        {
        //            using (var w = new WindowHelper())
        //            {
        //                resultData = w.GetWindowRecordsForTreeNode(sqlIn, encryptedfields, ctx, rCount, SQL_Count, AD_Table_ID, AD_tree_ID, Node_ID, obscureFields);
        //            }
        //        }
        //        else
        //        {
        //            using (var w = new WindowHelper())
        //            {
        //                resultData = w.GetWindowRecords(sqlIn, encryptedfields, ctx, rCount, SQL_Count, AD_Table_ID, obscureFields);
        //            }
        //        }
        //    }
        //    resultData.RecordCount = rCount;

        //    return Json(JsonConvert.SerializeObject(resultData), JsonRequestBehavior.AllowGet);
        //}


        [NonAction]
        public string GetColumnSQL(bool withAS, GridFieldVO field)
        {
            //(case o.ISACTIVE when 'Y' then 'True' else 'False' end) as Active,
            string columnSQL = field.ColumnSQL;
            string columnName = field.ColumnName;
            int displayType = field.AD_Reference_ID;
            if (columnSQL != null && columnSQL.Length > 0)
            {
                if (withAS)
                {
                    if (displayType == DisplayType.YesNo)
                    {
                        return " (case " + columnSQL + " when 'Y' then 'True' else 'False' end) " + " AS " + columnName;
                    }
                    return columnSQL + " AS " + columnName;
                }
                else
                {
                    if (displayType == DisplayType.YesNo)
                    {
                        return " (case " + columnSQL + " when 'Y' then 'True' else 'False' end) ";
                    }
                    return columnSQL;
                }
            }
            if (displayType == DisplayType.YesNo)
            {
                return " (case " + columnName + " when 'Y' then 'True' else 'False' end) AS " + columnName;
            }
            return columnName;

        }

        [HttpPost]
        public JsonResult GetWindowRecord(List<string> Columns, string TableName, int AD_Window_ID, int AD_Tab_ID, int WindowNo, string WhereClause, List<string> Encryptedfields, List<string> ObscureFields)
        {
            object data = null;
            Ctx ctx = Session["ctx"] as Ctx;
            if (!string.IsNullOrEmpty(WhereClause))
            {
                WhereClause = SecureEngineBridge.DecryptByClientKey(WhereClause, ctx.GetSecureKey());
                if (!QueryValidator.IsValid(WhereClause))
                    return null;
            }
            else
                WhereClause = "1=2";

            GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, AD_Window_ID, 0);

            GridTabVO gt = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();
            List<GridFieldVO> lstFields = gt.GetFields();

            if (gt.TableName != TableName)
                return null;

            for (int i = 0; i < Columns.Count; i++)
            {
                GridFieldVO gField = lstFields.Where(a => a.ColumnName == Columns[i]).FirstOrDefault();

                if (gField == null)
                {
                    gField = lstFields.Where(a => a.ColumnSQL + " AS " + a.ColumnName == Columns[i]).FirstOrDefault();
                }

                if (gField == null && Columns[i] != "Updated" && Columns[i] != "UpdatedBy"
                    && Columns[i] != "Created" && Columns[i] != "CreatedBy")
                {
                    return null;
                }
            }

            string SelectSQL  = "SELECT " + String.Join(",", Columns) + " FROM " + TableName;
            if (!string.IsNullOrEmpty(SelectSQL))
            {
                SelectSQL += " WHERE " + WhereClause;

                using (var w = new WindowHelper())
                {
                    data = w.GetWindowRecord(SelectSQL, Encryptedfields, ctx, ObscureFields);
                }
            }
            return Json(JsonConvert.SerializeObject(data), JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public JsonResult GetWindowRecords(List<string> Columns, string TableName, string WhereClause, List<string> Fields, SqlParamsIn sqlIn, int AD_Window_ID,
            int AD_Tab_ID, int WindowNo, int AD_Table_ID, List<string> ObscureFields, bool summaryOnly, int MaxRows, bool DoPaging)
        {
            WindowRecordOut resultData = new WindowRecordOut();

            if (Session["ctx"] == null)
            {

            }
            else
            {

                Ctx ctx = Session["ctx"] as Ctx;

                WhereClause = SecureEngineBridge.DecryptByClientKey(WhereClause, ctx.GetSecureKey());
                if (!QueryValidator.IsValid(WhereClause))
                    return null;

                GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, AD_Window_ID, 0);

                GridTabVO gt = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();
                List<GridFieldVO> lstFields = gt.GetFields();

                if (gt.TableName != TableName)
                    return null;

                for (int i = 0; i < Columns.Count; i++)
                {
                    GridFieldVO gField = lstFields.Where(a => a.ColumnName == Columns[i]).FirstOrDefault();

                    if (gField == null)
                    {
                        gField = lstFields.Where(a => a.ColumnSQL +" AS "+ a.ColumnName == Columns[i]).FirstOrDefault();
                    }

                    if (gField == null && Columns[i] != "Updated" && Columns[i] != "UpdatedBy"
                        && Columns[i] != "Created" && Columns[i] != "CreatedBy")
                    {
                        return null;
                    }
                }
                if (!WhereClause.Trim().ToUpper().StartsWith("WHERE"))
                {
                    WhereClause = " WHERE " + WhereClause;
                }

                string SQL_Count = "SELECT COUNT(*) FROM " + TableName + " " + WhereClause;
                string SQL_Direct = "";

                SQL_Count = MRole.GetDefault(ctx).AddAccessSQL(SQL_Count, TableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);

                int rCount = 0;
                if (sqlIn.tree_id > 0)
                {
                    using (var w = new WindowHelper())
                    {
                        rCount = w.GetRecordCountForTreeNode(WhereClause, ctx, gt.AD_Table_ID, sqlIn.tree_id, sqlIn.treeNode_ID, WindowNo, summaryOnly);
                    }
                }
                else
                {
                    if (sqlIn.card_ID > 0)
                    {
                        using (var w = new WindowHelper())
                        {
                            rCount = w.GetRecordCountWithCard(SQL_Count, sqlIn.card_ID);
                        }
                    }
                    else
                    {
                        rCount = Convert.ToInt32(DB.ExecuteScalar(SQL_Count));
                    }
                }

                if (MaxRows > 0 && rCount > MaxRows)
                {
                    /************************ Set Max Rows ***********************************/
                    // m_pstmt.setMaxRows(maxRows);
                   sqlIn.pageSize = MaxRows;
                    //info.Append(" - MaxRows=").Append(_maxRows);
                    //rowChanged = MaxRows;
                }

                else if (!DoPaging || (sqlIn.pageSize > rCount))
                {
                    sqlIn.pageSize = rCount;
                }

                /* Multi Delete may Decrease pages */
                if (DoPaging)
                {
                    if ((rCount + sqlIn.pageSize) <= (sqlIn.page * sqlIn.pageSize))
                    {
                        --sqlIn.page;
                    }
                }


                string SQL = "";
                StringBuilder selectDirect = null;

                for (int i = 0; i < lstFields.Count; i++)
                {
                    if (lstFields[i].lookupInfo != null && lstFields[i].AD_Reference_ID != DisplayType.Account)
                    {
                        var lInfo = lstFields[i].lookupInfo;
                        if (!string.IsNullOrEmpty(lInfo.displayColSubQ) && gt.TableName.ToLower() != lInfo.tableName.ToLower())
                        {


                            if (selectDirect == null)
                                selectDirect = new StringBuilder("SELECT ");
                            else
                                selectDirect.Append(",");

                            var qryDirect = lInfo.queryDirect.Substring(lInfo.queryDirect.LastIndexOf(" FROM " + lInfo.tableName + " "));

                            if (!lstFields[i].IsVirtualColumn)
                                qryDirect = qryDirect.Replace("@key", gt.TableName + '.' + GetColumnSQL(false, lstFields[i]));
                            else
                                qryDirect = qryDirect.Replace("@key", GetColumnSQL(false, lstFields[i]));


                            selectDirect.Append("( SELECT (").Append(lInfo.displayColSubQ).Append(") ").Append(qryDirect)
                                .Append(" ) AS ").Append(GetColumnSQL(false, lstFields[i]) + "_T")
                                .Append(',').Append(GetColumnSQL(true, lstFields[i]));
                        }
                        else if (lstFields[i].lookupInfo != null && lstFields[i].AD_Reference_ID == DisplayType.Account)
                        {
                            if (selectDirect == null)
                                selectDirect = new StringBuilder("SELECT ");
                            else
                                selectDirect.Append(",");

                            selectDirect.Append("( SELECT C_ValidCombination.Combination FROM C_ValidCombination WHERE C_ValidCombination.C_ValidCombination_ID=")
                                .Append(gt.TableName + "." + GetColumnSQL(false, lstFields[i])).Append(" ) AS ")
                                .Append(GetColumnSQL(false, lstFields[i]) + "_T")
                                .Append(',').Append(GetColumnSQL(true, lstFields[i]));

                        }
                    }
                }


                if (selectDirect != null)
                    SQL_Direct = selectDirect.ToString() + ' ' + SQL_Count.Substring(SQL_Count.IndexOf(" COUNT(*) FROM") + 9);
                else
                    SQL_Direct = "";



                SQL = "SELECT " + String.Join(",", Columns) + " FROM " + TableName + WhereClause;

                if (!String.IsNullOrEmpty(gt.OrderByClause))
                {
                    SQL += " ORDER BY " + gt.OrderByClause;
                    SQL_Direct += " ORDER BY " + gt.OrderByClause;
                }



                sqlIn.sql = SQL.ToString();
                sqlIn.sqlDirect = SQL_Direct;

                if (rCount > 0)
                {
                    if (sqlIn.tree_id > 0)
                    {
                        using (var w = new WindowHelper())
                        {
                            resultData = w.GetWindowRecordsForTreeNode(sqlIn, Fields, ctx, rCount, SQL_Count, AD_Table_ID, sqlIn.tree_id, sqlIn.treeNode_ID, ObscureFields);
                        }
                    }
                    else
                    {
                        using (var w = new WindowHelper())
                        {
                            resultData = w.GetWindowRecords(sqlIn, Fields, ctx, rCount, SQL_Count, AD_Table_ID, ObscureFields);
                        }
                    }
                }
                resultData.RecordCount = rCount;
            }
            return Json(JsonConvert.SerializeObject(resultData), JsonRequestBehavior.AllowGet);
        }

    }
}