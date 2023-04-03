using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.ModelAD;
using VAdvantage.Utility;

namespace VAdvantage.Common
{
    public class ShareRecordManager
    {
        //Dictionry of  table and respective link column OR Parent Link Column
        public static CCache<int, List<int>> tableColumnHirarichy = new CCache<int, List<int>>("RecordSharedTableHirarichy", 30, 60);

        public static CCache<int, List<ShareOrg>> tableRecordHirarerichy = new CCache<int, List<ShareOrg>>("RecordSharedTableRecordHirarichy", 30, 60);

        //Dictionry of link column and reference table ID
        public static CCache<int, int> columnsTableHirarerichy = new CCache<int, int>("columnsTableHirarerichy", 30, 60);

        /// <summary>
        /// Prepare lists for shared tables, list of records of table and list of tables of FK columns
        /// </summary>
        /// <param name="ctx"></param>
        public void FillData(Ctx ctx)
        {
            if (tableRecordHirarerichy.Count > 0)
                return;
            //Fetch list of maintain windows
            DataSet dsWindow = DB.ExecuteDataset("SELECT AD_Window_ID FROM AD_Window WHERE IsActive='Y' AND WindowType='M' ORDER BY AD_Window_ID ASC");
            for (int a = 0; a < dsWindow.Tables[0].Rows.Count; a++)
            {
                DataRow dr = dsWindow.Tables[0].Rows[a];

                //Fetch tabs of current window
                DataSet dsTabs = DB.ExecuteDataset("SELECT tab.AD_Table_ID, tbl.TableName, tab.TabLevel, tab.AD_Column_ID FROM AD_Tab tab JOIN AD_Table tbl on tab.AD_table_ID=tbl.AD_Table_ID WHERE tab.AD_window_ID=" + dr["AD_Window_ID"] + " AND tab.IsActive='Y' AND IsView='N'");
                if (dsTabs != null && dsTabs.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < dsTabs.Tables[0].Rows.Count; i++)
                    {
                        DataRow tab = dsTabs.Tables[0].Rows[i];//C_Order
                        int tabLevel = Util.GetValueOfInt(tab["TabLevel"]);

                        //Fetch child tabs
                        DataRow[] childTabs = dsTabs.Tables[0].Select("TabLevel>" + tabLevel);//OrdetLine, Ordertax
                        if (childTabs != null && childTabs.Length > 0)
                        {
                            for (int j = 0; j < childTabs.Length; j++)
                            {

                                if (tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])] == null)
                                    tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])] = new List<int>();

                                //get link column of child tab
                                int linkColumn = Util.GetValueOfInt(childTabs[j]["AD_Column_ID"]);
                                MTable linktable = MColumn.Get(ctx, linkColumn).GetFKTable();
                                if (linktable != null)
                                {
                                    int parentTableID = linktable.GetAD_Table_ID();

                                    //Dictionry of link column and reference table
                                    columnsTableHirarerichy[Convert.ToInt32(childTabs[j]["AD_Column_ID"])] = parentTableID;

                                    //Dictionry of  table and respective link column
                                    if (!tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Contains(linkColumn))
                                        tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Add(linkColumn);
                                }

                                //C_Order_ID
                                //C_Order_ID, C_Tax_ID
                                //Get Parent Link Columns
                                int[] pColumns = MTable.Get(ctx, childTabs[j]["TableName"].ToString()).GetParentColumnIDs();
                                if (pColumns != null && pColumns.Length > 0)
                                {
                                    for (int k = 0; k < pColumns.Length; k++)
                                    {
                                        MTable table = MColumn.Get(ctx, pColumns[k]).GetFKTable();
                                        if (table != null)
                                        {
                                            int parentTableID = table.GetAD_Table_ID();

                                            //Dictionry of  table and respective link column
                                            if (!tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Contains(pColumns[k]))
                                                tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Add(pColumns[k]);

                                            //Dictionry of link column and reference table
                                            columnsTableHirarerichy[pColumns[k]] = parentTableID;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }

            //Get all records which are shared and create diction which contains tableID and list of records of that table
            DataSet ds = DB.ExecuteDataset("SELECT Distinct AD_Table_ID, Record_ID, AD_ORGSHARED_ID, IsReadOnly FROM AD_ShareRecordOrg ORDER BY AD_Table_ID");
            for (int a = 0; a < ds.Tables[0].Rows.Count; a++)
            {
                ShareOrg org = new ShareOrg();
                org.OrgID = Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_OrgShared_ID"]);
                org.RecordID = Util.GetValueOfInt(ds.Tables[0].Rows[a]["Record_ID"]);
                org.Readonly = ds.Tables[0].Rows[a]["IsReadOnly"] == "Y" ? true : false;

                if (tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])] == null)
                    tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])] = new List<ShareOrg>();
                //Dictionary of tableID and list of records of that table which are shared
                tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])].Add(org);
            }
        }

        public void ShareChild(Ctx p_ctx, PO po)
        {

            FillData(p_ctx);

            //Get list of parent link cols of current Table
            List<int> parentColumnIDs = tableColumnHirarichy[po.Get_Table_ID()];

            if (parentColumnIDs != null && parentColumnIDs.Count > 0)
            {
                for (int i = 0; i < parentColumnIDs.Count; i++)
                {

                    //Get Parent link column and reference tableID
                    MColumn clm = MColumn.Get(p_ctx, parentColumnIDs[i]);
                    int tablID = clm.GetFKTable().GetAD_Table_ID();

                    //check if table has shared record 
                    if (tableRecordHirarerichy[tablID] != null)
                    {
                        int parentID = po.Get_ValueAsInt(clm.GetColumnName());

                        //Get table's Shared record based on parent link column
                        List<ShareOrg> sharedRec = tableRecordHirarerichy[columnsTableHirarerichy[parentColumnIDs[i]]];

                        if (sharedRec != null && sharedRec.Count > 0)
                        {
                            for (int k = 0; k < sharedRec.Count; k++)
                            {//If shared record's ID == Current record being saved's Parent ID, then share current record.
                                if (sharedRec[k].RecordID == parentID)
                                {
                                    int parentOrg_ID = Util.GetValueOfInt(DB.ExecuteScalar($"SELECT AD_ShareRecordOrg_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID={tablID} AND Record_ID={parentID} AND AD_OrgShared_ID={sharedRec[k].OrgID}"));

                                    VAdvantage.ModelAD.MShareRecordOrg SRO = new VAdvantage.ModelAD.MShareRecordOrg(p_ctx, 0, po.Get_Trx());
                                    SRO.SetAD_Table_ID(po.Get_Table_ID());
                                    SRO.Set_ValueNoCheck("AD_OrgShared_ID", sharedRec[k].OrgID);
                                    SRO.SetIsReadOnly(sharedRec[k].Readonly);
                                    SRO.SetRecord_ID(po.Get_ID());
                                    SRO.Set_ValueNoCheck("Parent_ID", parentOrg_ID);
                                    if (SRO.Save())
                                    {

                                    }
                                    VAdvantage.Common.ShareOrg sOrg = new VAdvantage.Common.ShareOrg();
                                    sOrg.RecordID = Util.GetValueOfInt(po.Get_ID());
                                    sOrg.OrgID = sharedRec[k].OrgID;
                                    sOrg.Readonly = sharedRec[k].Readonly;

                                    VAdvantage.Common.ShareRecordManager.AddRecordToTable(po.Get_Table_ID(), sOrg);
                                }
                            }
                        }
                    }
                }
            }

            if (po.GetTableName().EndsWith("_Ver", StringComparison.OrdinalIgnoreCase))
            {
                string parentTable = po.GetTableName().Substring(0, po.GetTableName().IndexOf("_Ver"));
                int parentTableID = MTable.Get_Table_ID(parentTable);

                int parentRecID = po.Get_ValueAsInt(parentTable + "_ID");

                DataSet dsV = DB.ExecuteDataset($"SELECT AD_OrgShared_ID,isReadonly FROM AD_ShareRecordOrg WHERE Record_ID={parentRecID} AND AD_Table_ID={parentTableID}");
                if (dsV != null && dsV.Tables[0].Rows.Count > 0)
                {
                    for (int v = 0; v < dsV.Tables[0].Rows.Count; v++)
                    {
                        MShareRecordOrg SROV = new MShareRecordOrg(po.GetCtx(), 0, po.Get_Trx());
                        SROV.SetAD_Table_ID(po.Get_Table_ID());
                        SROV.Set_ValueNoCheck("AD_OrgShared_ID", dsV.Tables[0].Rows[v]["AD_OrgShared_ID"]);
                        SROV.SetIsReadOnly(dsV.Tables[0].Rows[v]["isReadonly"] == "Y");
                        SROV.SetRecord_ID(po.Get_ID());
                        if (!SROV.Save())
                        {
                            break;
                        }
                        VAdvantage.Common.ShareOrg OrgV = new VAdvantage.Common.ShareOrg();
                        OrgV.RecordID = Util.GetValueOfInt(po.Get_ID());
                        OrgV.OrgID = Util.GetValueOfInt(dsV.Tables[0].Rows[v]["AD_OrgShared_ID"]);
                        OrgV.Readonly = dsV.Tables[0].Rows[v]["isReadonly"] == "Y";
                        VAdvantage.Common.ShareRecordManager.AddRecordToTable(po.Get_Table_ID(), OrgV);
                    }
                }


            }
        }

        public static void DeleteSharedChild(int parent_ID, Trx trx, List<int> orgs)
        {
            string sql = "SELECT AD_ShareRecordOrg_ID,ad_orgshared_id, Record_ID,AD_Table_ID FROM AD_ShareRecordOrg WHERE Parent_ID=" + parent_ID;
            DataSet ds = DB.ExecuteDataset(sql, null, trx);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                if (orgs != null && orgs.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (orgs.IndexOf(Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"])) == -1)
                        {
                            DeleteSharedChild(Util.GetValueOfInt(ds.Tables[0].Rows[i][0]), trx, orgs);

                            DeleteRecordFromTable(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Table_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["Record_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"]));
                        }
                    }
                }
                else
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        DeleteSharedChild(Util.GetValueOfInt(ds.Tables[0].Rows[i][0]), trx, orgs);

                        DeleteRecordFromTable(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Table_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["Record_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"]));
                    }
                }
            }


            sql = "DELETE FROM AD_ShareRecordOrg WHERE AD_ShareRecordOrg_ID=" + parent_ID;
            int deletedRecords = DB.ExecuteQuery(sql, null, trx);
        }




        public static void DeleteRecordFromTable(int table, int record, int OrgID)
        {
            if (tableRecordHirarerichy.ContainsKey(table) &&
                               tableRecordHirarerichy[table].Find(a => a.RecordID == record && a.OrgID == OrgID) != null)
            {
                int removaed = tableRecordHirarerichy[table]
                       .RemoveAll(a => a.RecordID == record
                       && a.OrgID == OrgID);
            }

            if (po.GetTableName().EndsWith("_Ver", StringComparison.OrdinalIgnoreCase))
            {
                string parentTable = po.GetTableName().Substring(0, po.GetTableName().IndexOf("_Ver"));
                int parentTableID = MTable.Get_Table_ID(parentTable);

                int parentRecID = po.Get_ValueAsInt(parentTable + "_ID");

                DataSet dsV = DB.ExecuteDataset($"SELECT AD_OrgShared_ID,isReadonly FROM AD_ShareRecordOrg WHERE Record_ID={parentRecID} AND AD_Table_ID={parentTableID}");
                if (dsV != null && dsV.Tables[0].Rows.Count > 0)
                {
                    for (int v = 0; v < dsV.Tables[0].Rows.Count; v++)
                    {
                        MShareRecordOrg SROV = new MShareRecordOrg(po.GetCtx(), 0, po.Get_Trx());
                        SROV.SetAD_Table_ID(po.Get_Table_ID());
                        SROV.Set_ValueNoCheck("AD_OrgShared_ID", dsV.Tables[0].Rows[v]["AD_OrgShared_ID"]);
                        SROV.SetIsReadOnly(dsV.Tables[0].Rows[v]["isReadonly"] == "Y");
                        SROV.SetRecord_ID(po.Get_ID());
                        if (!SROV.Save())
                        {
                            break;
                        }
                        VAdvantage.Common.ShareOrg OrgV = new VAdvantage.Common.ShareOrg();
                        OrgV.RecordID = Util.GetValueOfInt(po.Get_ID());
                        OrgV.OrgID = Util.GetValueOfInt(dsV.Tables[0].Rows[v]["AD_OrgShared_ID"]);
                        OrgV.Readonly = dsV.Tables[0].Rows[v]["isReadonly"] == "Y";
                        VAdvantage.Common.ShareRecordManager.AddRecordToTable(po.Get_Table_ID(), OrgV);
                    }
                }


            }
        }

        public static void DeleteSharedChild(int parent_ID, Trx trx, List<int> orgs)
        {
            string sql = "SELECT AD_ShareRecordOrg_ID,ad_orgshared_id, Record_ID,AD_Table_ID FROM AD_ShareRecordOrg WHERE Parent_ID=" + parent_ID;
            DataSet ds = DB.ExecuteDataset(sql, null, trx);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                if (orgs != null && orgs.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (orgs.IndexOf(Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"])) == -1)
                        {
                            DeleteSharedChild(Util.GetValueOfInt(ds.Tables[0].Rows[i][0]), trx, orgs);

                            DeleteRecordFromTable(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Table_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["Record_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"]));
                        }
                    }
                }
                else
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        DeleteSharedChild(Util.GetValueOfInt(ds.Tables[0].Rows[i][0]), trx, orgs);

                        DeleteRecordFromTable(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Table_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["Record_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["ad_orgshared_id"]));
                    }
                }
            }


            sql = "DELETE FROM AD_ShareRecordOrg WHERE AD_ShareRecordOrg_ID=" + parent_ID;
            int deletedRecords = DB.ExecuteQuery(sql, null, trx);
        }




        public static void DeleteRecordFromTable(int table, int record, int OrgID)
        {
            if (tableRecordHirarerichy.ContainsKey(table) &&
                               tableRecordHirarerichy[table].Find(a => a.RecordID == record && a.OrgID == OrgID) != null)
            {
                int removaed = tableRecordHirarerichy[table]
                       .RemoveAll(a => a.RecordID == record
                       && a.OrgID == OrgID);
            }

        }


        public static void AddRecordToTable(int table, ShareOrg record, bool force = false)
        {
            if (force)
            {
                DeleteRecordFromTable(table, record.RecordID, record.OrgID);
            }

            if (tableRecordHirarerichy[table] == null)
                tableRecordHirarerichy[table] = new List<VAdvantage.Common.ShareOrg>();

            ShareOrg org = tableRecordHirarerichy[table].Find(a => a.RecordID == record.RecordID && a.OrgID == record.OrgID);
            if (org == null)
                tableRecordHirarerichy[table].Add(record);


        }

        public static bool CheckRecordInTable(int table, ShareOrg record)
        {
            if (tableRecordHirarerichy[table] == null)
                return false;

            ShareOrg org = tableRecordHirarerichy[table].Find(a => a.RecordID == record.RecordID && a.OrgID == record.OrgID);
            if (org == null)
                return false;

            return true;

        }



    }

    public class Organization
    {
        public int ID { get; set; }
        public string value { get; set; }
        public string name { get; set; }
        public string isLegalEntity { get; set; }
        public int legalEntityOrg { get; set; }

    }

    public class Records : Organization
    {
        public int AD_OrgShared_ID { get; set; }
        public int AD_Table_ID { get; set; }
        public bool isReadonly { get; set; }
        public bool isSummary { get; set; }
        public int record_ID { get; set; }
        public int OrgID { get; set; }
        public int shareID { get; set; }
    }

    public class ShareOrg
    {
        public int RecordID { get; set; }
        public int OrgID { get; set; }
        public bool Readonly { get; set; }
    }
}
