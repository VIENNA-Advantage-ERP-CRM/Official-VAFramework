/********************************************************
 * Module Name    : Vienna Advantage Framework
 * Purpose        : This class is used for record share with other organization
 * Class Used     : 
 * Created By     : VIS0228
 * Date           :  09-Nov-2022
**********************************************************/
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Utility;
using VAdvantage.DataBase;
using VAdvantage.ModelAD;
using VAdvantage.Model;
using VAdvantage.Controller;
using VAdvantage.Classes;
using VIS.Helpers;
using VAdvantage.Common;

namespace VISLogic.Models
{
    /// <summary>
    /// 
    /// 
    /// </summary>
    public class RecordShared
    {


        /// <summary>
        /// Get Organization Summary
        /// </summary>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public List<Organization> GetOrganization(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            List<Organization> lstOrg = null;
            string sqlQuery = @"SELECT AD_Org_ID, value,Name,IsLegalEntity,LegalEntityOrg FROM AD_ORg WHERE ISACTIVE='Y'  AND AD_Org.AD_Org_ID NOT IN (0," + ctx.GetAD_Org_ID() + ")  AND AD_ORg_ID NOT IN (SELECT AD_OrgShared_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + ") ORDER BY Name";

            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_Org", true, false);

            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstOrg = new List<Organization>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    Organization Org = new Organization()
                    {
                        ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Org_ID"]),
                        value = Util.GetValueOfString(ds.Tables[0].Rows[i]["value"]),
                        name = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]),
                        isLegalEntity = Util.GetValueOfString(ds.Tables[0].Rows[i]["IsLegalEntity"]),
                        legalEntityOrg = Util.GetValueOfInt(ds.Tables[0].Rows[i]["LegalEntityOrg"])
                    };
                    lstOrg.Add(Org);
                }
            }
            return lstOrg;
        }

        /// <summary>
        /// Get Shared Record
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public List<Records> GetSharedRecord(Ctx ctx, int AD_Table_ID, int Record_ID, int parentTableID, int parentRecord_ID, int parentOrg)
        {
            List<Records> lstOrg = null;

            PO po = MTable.GetPO(ctx, MTable.GetTableName(ctx, AD_Table_ID), Record_ID, null);
            bool canEdit = true;
            string sqlQuery = ""; 

            if (parentTableID > 0 && parentOrg>0)
            {

                sqlQuery = @"SELECT LSORG.ad_sharerecordorg_id, ad_org.ad_org_id, ad_org.value, ad_org.name, ad_org.islegalentity, ad_org.legalentityorg, LSORG.isreadonly, ad_org.issummary, LSORG.ad_org_id AS orgid, LSORG.ischildshare, ad_sharerecordorg.ad_sharerecordorg_Id AS parent_id 
                FROM ad_sharerecordorg  ad_sharerecordorg INNER JOIN  ad_org  ad_org ON (ad_org.ad_org_id = ad_sharerecordorg.ad_orgshared_id)
                LEFT JOIN  ad_sharerecordorg LSORG ON (ad_org.ad_org_id = LSORG.ad_orgshared_id AND LSORG.ad_table_id = " + AD_Table_ID + @" AND LSORG.record_id = " + Record_ID + @")";
                sqlQuery += " WHERE ad_sharerecordorg.ad_table_id = " + parentTableID + @" AND ad_sharerecordorg.record_id = " + parentRecord_ID + " AND AD_Org.AD_Org_ID NOT IN (0," + po.GetAD_Org_ID() + ") ";
                sqlQuery += " ORDER BY AD_ShareRecordOrg.ad_sharerecordorg_id desc,AD_Org.Name";

                int count = Util.GetValueOfInt(DB.ExecuteScalar("SELECT count(AD_Org_ID) FROM AD_Role_OrgAccess WHERE ISACTIVE='Y' AND AD_role_ID=" + ctx.GetAD_Role_ID() + " AND AD_Org_ID IN (" + po.GetAD_Org_ID() + ")"));
                if (count == 0)
                {
                    canEdit = false;
                }

            }
            else
            {
                sqlQuery = @"SELECT AD_ShareRecordOrg_ID, AD_Org.AD_Org_ID, AD_Org.value,AD_Org.Name,AD_Org.IsLegalEntity,AD_Org.LegalEntityOrg,AD_ShareRecordOrg.isreadonly,AD_Org.isSummary, AD_ShareRecordOrg.AD_Org_ID AS OrgID,IsChildShare,parent_id FROM AD_Org AD_Org
                                LEFT JOIN AD_ShareRecordOrg AD_ShareRecordOrg ON AD_Org.AD_Org_ID=AD_ShareRecordOrg.ad_orgshared_id AND AD_ShareRecordOrg.AD_Table_ID=" + AD_Table_ID + " AND AD_ShareRecordOrg.Record_ID=" + Record_ID;

                int count = Util.GetValueOfInt(DB.ExecuteScalar("SELECT count(AD_Org_ID) FROM AD_Role_OrgAccess WHERE ISACTIVE='Y' AND AD_role_ID=" + ctx.GetAD_Role_ID() + " AND AD_Org_ID IN (" + po.GetAD_Org_ID() + ")"));

                if (count == 0)
                {
                    sqlQuery += " AND AD_ShareRecordOrg_ID IS NOT NULL ";
                    canEdit = false;
                }
                sqlQuery += " WHERE AD_Org.IsCostCenter='N' AND AD_Org.IsProfitCenter='N' AND AD_Org.ISACTIVE='Y' AND AD_Org.AD_Org_ID NOT IN (0," + po.GetAD_Org_ID() + ")  ";
                if (parentTableID > 0 && parentOrg != 0)
                {
                    sqlQuery += " AND AD_ShareRecordOrg_ID>0 ";
                }
                sqlQuery += " ORDER BY AD_ShareRecordOrg_ID,TRIM(UPPER(AD_Org.Name))";
               
            }

            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_Org", true, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);

            
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstOrg = new List<Records>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    Records Org = new Records()
                    {
                        ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Org_ID"]),
                        value = Util.GetValueOfString(ds.Tables[0].Rows[i]["value"]),
                        name = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]),
                        isLegalEntity = Util.GetValueOfString(ds.Tables[0].Rows[i]["IsLegalEntity"]),
                        legalEntityOrg = Util.GetValueOfInt(ds.Tables[0].Rows[i]["LegalEntityOrg"]),
                        isReadonly = Util.GetValueOfString(ds.Tables[0].Rows[i]["isreadonly"]).Equals("Y"),
                        isSummary = Util.GetValueOfString(ds.Tables[0].Rows[i]["isSummary"]).Equals("Y"),
                        ChildShare = Util.GetValueOfString(ds.Tables[0].Rows[i]["IsChildShare"]).Equals("Y"),
                        AD_OrgShared_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_ShareRecordOrg_ID"]),
                        OrgID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["OrgID"]),
                        CanEdit = canEdit,
                        parentID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["parent_id"])
                    };
                    lstOrg.Add(Org);
                }
            }
            return lstOrg;
        }

        /// <summary>
        ///  Save Share Record 
        /// </summary>
        /// <param name="records"></param>
        /// <param name="ctx"></param>
        /// <param name="WindowParent_ID"> ParentID of current record fetched from window</param>
        /// <param name="ParentID">It is AD_RecordSharedOrg_ID</param>
        /// <returns></returns>
        public string SaveRecord(int AD_Table_ID, int record_ID, int AD_Tab_ID, int Window_ID, int WindowNo, List<Records> records, Ctx ctx, Trx trx1, int WindowParent_ID, int ParentTable_ID, ref int error, int ParentID = 0)
        {

            GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, Window_ID, 0);

            GridTabVO gt = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();

            return SaveRecords(vo.GetTabs(), AD_Table_ID, record_ID, AD_Tab_ID, Window_ID, WindowNo, records, ctx, trx1, WindowParent_ID, ParentTable_ID, ref error, ParentID);

        }

        int curRecID = 0;
        public string SaveRecords(List<GridTabVO> tabs, int AD_Table_ID, int record_ID, int AD_Tab_ID, int Window_ID, int WindowNo, List<Records> records, Ctx ctx, Trx trx1, int WindowParent_ID, int ParentTable_ID, ref int error, int ParentID = 0)
        {
            string msg = " OK ";
            Trx trx = null;
            //error = 0;
            int oldParentID = 0;
            string query = "";
            try
            {
                if (trx1 == null)
                    trx = Trx.GetTrx("ShareRecord" + DateTime.Now.Ticks);
                else
                    trx = trx1;

                List<int> oIDs = new List<int>();
                //Delete child and current record from shared record table before saving
                if (ParentID == 0 || WindowParent_ID > 0)
                {
                    query = "SELECT AD_ShareRecordOrg_ID,ad_orgshared_id FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + record_ID;
                    DataSet ds = DB.ExecuteDataset(query);
                    
                    if (records != null && records.Count > 0)
                    {
                        oIDs = records.AsEnumerable().Select(r => r.AD_OrgShared_ID).ToList();
                    }

                    for (int d = 0; d < ds.Tables[0].Rows.Count; d++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[d]["ad_orgshared_id"]) != ctx.GetAD_Org_ID() && oIDs.IndexOf(Util.GetValueOfInt(ds.Tables[0].Rows[d]["ad_orgshared_id"])) == -1)
                        {
                            VAdvantage.Common.ShareRecordManager.DeleteSharedChild(Util.GetValueOfInt(ds.Tables[0].Rows[d]["AD_ShareRecordOrg_ID"]), trx, oIDs);
                            VAdvantage.Common.ShareRecordManager.DeleteRecordFromTable(AD_Table_ID, record_ID, Util.GetValueOfInt(ds.Tables[0].Rows[d]["ad_orgshared_id"]));
                        }
                    }

                }
                //query = "DELETE FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + record_ID;
                //DB.ExecuteQuery(query, null, trx);

                //this is case, when user unshare a child, then again try to share that child. IN this case, child record must be set under parent record again, so that once 
                //parent get unshared, it should get unshared too.
                if (ParentID == 0 && WindowParent_ID > 0)
                {
                    query = "SELECT AD_ShareRecordOrg_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + ParentTable_ID + " AND Record_ID=" + WindowParent_ID;
                    ParentID = Util.GetValueOfInt(DB.ExecuteScalar(query));
                }


                if (records != null)
                {
                    //Share current record with selected orgs
                    for (int i = 0; i < records.Count; i++)
                    {
                        

                        if (ParentID == 0)
                            curRecID = records[i].AD_OrgShared_ID;

                        if (WindowParent_ID > 0)
                        {
                            curRecID = records[i].AD_OrgShared_ID;
                        }

                        if (curRecID != records[i].AD_OrgShared_ID)
                            continue;

                        int ID = Util.GetValueOfInt(DB.ExecuteScalar($"SELECT AD_ShareRecordOrg_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID = {AD_Table_ID} AND Record_ID={record_ID} AND ad_orgshared_id={records[i].AD_OrgShared_ID}"));
                        bool statussChanged = false;

                        MShareRecordOrg SRO = new MShareRecordOrg(ctx, ID, trx);
                        SRO.SetAD_Table_ID(AD_Table_ID);
                        SRO.Set_ValueNoCheck("AD_OrgShared_ID", records[i].AD_OrgShared_ID);
                        

                        if (ID != 0 && SRO.IsReadOnly() != records[i].isReadonly)
                            statussChanged = true;

                        if (ID != 0 && Util.GetValueOfBool(SRO.Get_Value("IsChildShare")) != records[i].ChildShare)
                            statussChanged = true;

                        SRO.Set_ValueNoCheck("IsChildShare", records[i].ChildShare);
                        SRO.SetIsReadOnly(records[i].isReadonly);
                        SRO.SetRecord_ID(record_ID);

                        if (ParentID > 0)
                        {
                            SRO.Set_ValueNoCheck("Parent_ID", ParentID);
                        }
                        if (!SRO.Save())
                        {
                            error = 1;
                            break;
                        }
                        //if (ParentID == 0)
                        // {

                        VAdvantage.Common.ShareOrg Org = new VAdvantage.Common.ShareOrg();
                        Org.RecordID = record_ID;
                        Org.OrgID = records[i].AD_OrgShared_ID;
                        Org.Readonly = records[i].isReadonly;
                        Org.ChildShare = records[i].ChildShare;
                        VAdvantage.Common.ShareRecordManager.AddRecordToTable(AD_Table_ID, Org, statussChanged);
                        //}

                        int newParentID = SRO.GetAD_ShareRecordOrg_ID();

                        string tableName = MTable.GetTableName(ctx, AD_Table_ID);

                        int versionTableID = MTable.Get_Table_ID(tableName + "_Ver");

                        if (versionTableID > 0)
                        {
                            DataSet dsVer = DB.ExecuteDataset($"SELECT {tableName}_Ver_ID FROM {tableName}_Ver WHERE {tableName}_ID={record_ID}");
                            if (dsVer != null && dsVer.Tables[0].Rows.Count > 0)
                            {
                                for (int v = 0; v < dsVer.Tables[0].Rows.Count; v++)
                                {
                                    MShareRecordOrg SROV = new MShareRecordOrg(ctx, 0, trx);
                                    SROV.SetAD_Table_ID(versionTableID);
                                    SROV.Set_ValueNoCheck("AD_OrgShared_ID", records[i].AD_OrgShared_ID);
                                    SROV.Set_ValueNoCheck("IsChildShare", records[i].ChildShare);
                                    SROV.SetIsReadOnly(records[i].isReadonly);
                                    SROV.SetRecord_ID(Util.GetValueOfInt(dsVer.Tables[0].Rows[v][0]));
                                    if (newParentID > 0)
                                    {
                                        SROV.Set_ValueNoCheck("Parent_ID", newParentID);
                                    }
                                    if (!SROV.Save())
                                    {
                                        error = 1;
                                        break;
                                    }
                                    VAdvantage.Common.ShareOrg OrgV = new VAdvantage.Common.ShareOrg();
                                    OrgV.RecordID = Util.GetValueOfInt(dsVer.Tables[0].Rows[v][0]);
                                    OrgV.OrgID = records[i].AD_OrgShared_ID;
                                    OrgV.ChildShare = records[i].ChildShare;
                                    OrgV.Readonly = records[i].isReadonly;
                                    VAdvantage.Common.ShareRecordManager.AddRecordToTable(versionTableID, OrgV);
                                }
                            }
                        }

                        //GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, Window_ID, 0);

                        GridTabVO gt = tabs.Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();

                        PO prntObj = MTable.GetPO(ctx, tableName, record_ID, trx);
                        int parentOrgID =Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_ORG_ID FROM " + tableName + " WHERE " + tableName + "_ID =" + record_ID));
                        List<GridTabVO> gTabs = tabs.Where(a => a.TabLevel == gt.TabLevel + 1).ToList();


                        if (gTabs != null && gTabs.Count > 0)
                        {
                            foreach (var tab in gTabs)
                            {
                                MTable table = MTable.Get(ctx, tab.AD_Table_ID);
                                // VAdvantage.Common.ShareRecordManager.AddParentChild(tab.AD_Table_ID, AD_Table_ID);

                                int linkCol = tab.AD_Column_ID;
                                string lCol = "";
                                List<MColumn> cols = table.GetColumns(false).Where(a => a.IsParent() == true).ToList();
                                DataSet ds = null;

                                if (linkCol > 0)
                                {
                                    //C_Order_ID
                                    lCol = MColumn.GetColumnName(ctx, tab.AD_Column_ID);
                                    PO pObj = MTable.GetPO(ctx, gt.TableName, record_ID, trx);
                                    if (pObj == null)
                                        continue;
                                    //select C_Order_ID FROM C_orderTax where C_Order_ID=11123123
                                    ds = DB.ExecuteDataset($"SELECT  {table.GetTableName()}_ID,AD_Org_ID FROM {table.GetTableName()} WHERE {lCol}={ pObj.Get_ValueAsInt(lCol)}");
                                }
                                else
                                {
                                    if (cols != null && cols.Count > 0)
                                    {
                                        int id = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Column_ID FROM AD_Column WHERE ColumnName='" + table.GetTableName() + "_ID' AND AD_Table_ID=" + table.GetAD_Table_ID()));
                                        if (cols.Count == 1 && (gt.TableName + "_ID" == cols[0].GetColumnName()) || id > 0)
                                        {

                                            //// This one is for key Column
                                            // Select C_orderline-ID from C_OrderLine where C_Order_ID=112212312;
                                            ds = DB.ExecuteDataset($"SELECT  {table.GetTableName()}_ID,AD_Org_ID FROM {table.GetTableName()} WHERE {gt.TableName}_ID = {record_ID}");
                                        }
                                        else
                                        {
                                            PO pObj = MTable.GetPO(ctx, table.GetTableName(), record_ID, trx);
                                            if (pObj != null)
                                            {
                                                for (int m = 0; m < cols.Count; m++)
                                                {
                                                    MTable fkTable = MColumn.Get(ctx, cols[m].GetAD_Column_ID()).GetFKTable();
                                                    string fkColumnName = MColumn.Get(ctx, cols[m].GetAD_Column_ID()).GetFKColumnName();

                                                    int count = Util.GetValueOfInt(DB.ExecuteScalar($"SELECT Count(*) FROM AD_ShareRecordOrg WHERE AD_Table_ID={fkTable.GetAD_Table_ID()} AND Record_ID={pObj.Get_ValueAsInt(fkColumnName)}"));
                                                    if (count > 0)
                                                    {
                                                        ds = DB.ExecuteDataset($"SELECT  {table.GetKeyColumns()[0]}, AD_Org_ID FROM {table.GetTableName()} WHERE {cols[m].GetColumnName()} = {pObj.Get_ValueAsInt(cols[m].GetColumnName())} ");
                                                        if (ds != null && ds.Tables[0].Rows.Count > 0)
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if (ds != null && ds.Tables[0].Rows.Count > 0)
                                {
                                    for (int j = 0; j < ds.Tables[0].Rows.Count; j++)
                                    {
                                        VAdvantage.Common.ShareOrg sOrg = new VAdvantage.Common.ShareOrg();
                                        sOrg.RecordID = Util.GetValueOfInt(ds.Tables[0].Rows[j][0]);
                                        sOrg.OrgID = records[i].AD_OrgShared_ID;
                                        sOrg.ChildShare = records[i].ChildShare;
                                        sOrg.Readonly = records[i].isReadonly;
                                        if (records[i].ChildShare)
                                        {
                                            if(Util.GetValueOfInt(ds.Tables[0].Rows[j][1]) != parentOrgID)
                                            {
                                                continue;
                                            }

                                            if (statussChanged || !VAdvantage.Common.ShareRecordManager.CheckRecordInTable(tab.AD_Table_ID, sOrg))
                                            {
                                                VAdvantage.Common.ShareRecordManager.AddRecordToTable(tab.AD_Table_ID, sOrg);
                                                SaveRecords(tabs, table.GetAD_Table_ID(), Util.GetValueOfInt(ds.Tables[0].Rows[j][0]), tab.AD_Tab_ID, Window_ID, WindowNo, records, ctx, trx, 0, 0, ref error, newParentID);
                                            }
                                        }
                                        else
                                        {
                                            query = "SELECT AD_ShareRecordOrg_ID,ad_orgshared_id FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + table.GetAD_Table_ID() + " AND Record_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[j][0]);
                                            DataSet ds1 = DB.ExecuteDataset(query);

                                            if (records != null && records.Count > 0)
                                            {
                                                oIDs = records.AsEnumerable().Select(r => r.AD_OrgShared_ID).ToList();
                                            }

                                            for (int d = 0; d < ds1.Tables[0].Rows.Count; d++)
                                            {
                                                //if (Util.GetValueOfInt(ds1.Tables[0].Rows[d]["ad_orgshared_id"]) != ctx.GetAD_Org_ID() && oIDs.IndexOf(Util.GetValueOfInt(ds1.Tables[0].Rows[d]["ad_orgshared_id"])) == -1)
                                                //{
                                                    VAdvantage.Common.ShareRecordManager.DeleteSharedChild(Util.GetValueOfInt(ds1.Tables[0].Rows[d]["AD_ShareRecordOrg_ID"]), trx, oIDs);
                                                    VAdvantage.Common.ShareRecordManager.DeleteRecordFromTable(AD_Table_ID, record_ID, Util.GetValueOfInt(ds1.Tables[0].Rows[d]["ad_orgshared_id"]));
                                                //}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
            catch (Exception e)
            {
                error = 1;
                msg = e.Message;
            }
            finally
            {
                if (error == 1)
                {
                    msg = "Fail";
                    if (trx1 == null)
                    {
                        trx.Rollback();
                    }
                }
                else
                {
                    if (trx1 == null)
                    {
                        msg = "OK";
                        trx.Commit();
                    }
                }
                if (trx1 == null)
                {
                    trx.Close();
                }
            }
            return msg;
        }




        //public List<ShareRecordAccess> GetSharedRecords(Ctx ctx)
        //{
        //    List<ShareRecordAccess> sharedRecordAccess = new List<RecordAccess>();
        //    MRole role = MRole.GetDefault(ctx);
        //    role.LoadSharedRecord(true);
        //    sharedRecordAccess = ShareRecordAccess.Get(role.GetSharedRecordAccess());
        //    return sharedRecordAccess;
        //}


        /// <summary>
        /// Check if current record is readonly or not
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public string GetSharedRecordAccess(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            string sql = "SELECT  IsReadOnly,AD_ShareRecordOrg_ID FROM AD_ShareRecordOrg WHERE IsActive = 'Y' AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + " AND AD_OrgShared_ID = " + ctx.GetAD_Org_ID();
            DataSet ds = DB.ExecuteDataset(sql);
            if(ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                return Util.GetValueOfString(Util.GetValueOfString(ds.Tables[0].Rows[0][0]) == "Y") + "_" + Util.GetValueOfString(ds.Tables[0].Rows[0][1]);
            }
            else
            {
                return "false_N";
            }
            
        }

        /// <summary>
        /// Get Organisation Structure
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<OrgProperty> GetOrgStructure(Ctx ctx)
        {
            string sql = @" SELECT AD_Tree.AD_Tree_ID FROM AD_Tree 
               WHERE AD_Tree.AD_Client_ID=" + ctx.GetAD_Client_ID() + @" AND AD_Tree.AD_Table_ID=(SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_Org') AND AD_Tree.IsActive='Y' AND AD_Tree.IsAllNodes='Y' 
              ORDER BY AD_Tree.isdefault desc, AD_Tree.AD_Tree_ID ASC";

            int treeID = Util.GetValueOfInt(DB.ExecuteScalar(sql));

            sql = @"SELECT Node_ID,AD_Org.Name,Parent_ID,Issummary,(SELECT NAME FROM AD_Org WHERE AD_org_ID=Parent_ID) AS ParentName FROM AD_treeNode 
              INNER JOIN AD_Org ON AD_treeNode.Node_ID=AD_Org.AD_Org_ID
              WHERE AD_Tree_ID=" + treeID;

            DataSet ds = DB.ExecuteDataset(sql);
            List<OrgProperty> lstOrg = null;
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstOrg = new List<OrgProperty>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    OrgProperty Org = new OrgProperty()
                    {
                        ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["Node_ID"]),
                        ParentID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["Parent_ID"]),
                        Name = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]),
                        Issummary=Util.GetValueOfString(ds.Tables[0].Rows[i]["Issummary"]),
                        ParentName = Util.GetValueOfString(ds.Tables[0].Rows[i]["ParentName"]),
                    };
                    lstOrg.Add(Org);
                }
            }
            return lstOrg;
        } 

    }


    /// <summary>
    /// Organization Property
    /// /// VIS0228 09-Nov-2022
    /// </summary>
    /// 
    public class OrgProperty
    {
        public int ID { get; set; }
        public int ParentID { get; set; }
        public string Name { get; set; }
        public string Issummary { get; set; }
        public string ParentName { get; set; }
    }

}