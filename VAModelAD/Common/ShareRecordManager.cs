using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.Common
{
    public class ShareRecordManager
    {

        public static CCache<int, List<int>> tableColumnHirarichy = new CCache<int, List<int>>("RecordSharedTableHirarichy", 30, 60);
        public static CCache<int, List<ShareOrg>> tableRecordHirarerichy = new CCache<int, List<ShareOrg>>("RecordSharedTableRecordHirarichy", 30, 60);
        public static CCache<int, int> columnsTableHirarerichy = new CCache<int, int>("columnsTableHirarerichy", 30, 60);
        //public static CCache<int, int> columnsTableHirarerichy = new CCache<int, int>("columnsTableHirarerichy", 30, 60);
        public void FillData(Ctx ctx)
        {
            if (tableRecordHirarerichy.Count > 0)
                return;



            DataSet dsWindow = DB.ExecuteDataset("SELECT AD_Window_ID FROM AD_Window WHERE IsActive='Y' AND WindowType='M' ORDER BY AD_Window_ID ASC");
            // Parallel.ForEach<DataRow>(ds.Tables[0].Rows.OfType<DataRow>(), dr =>
            for (int a = 0; a < dsWindow.Tables[0].Rows.Count; a++)
            {
                DataRow dr = dsWindow.Tables[0].Rows[a];
                DataSet dsTabs = DB.ExecuteDataset("SELECT tab.AD_Table_ID, tbl.TableName, tab.TabLevel, tab.AD_Column_ID FROM AD_Tab tab JOIN AD_Table tbl on tab.AD_table_ID=tbl.AD_Table_ID WHERE tab.AD_window_ID=" + dr["AD_Window_ID"] + " AND tab.IsActive='Y' AND IsView='N'");
                if (dsTabs != null && dsTabs.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < dsTabs.Tables[0].Rows.Count; i++)
                    {
                        DataRow tab = dsTabs.Tables[0].Rows[i];//C_Order
                        int tabLevel = Util.GetValueOfInt(tab["TabLevel"]);
                        DataRow[] childTabs = dsTabs.Tables[0].Select("TabLevel>" + tabLevel);//OrdetLine, Ordertax
                        if (childTabs != null && childTabs.Length > 0)
                        {
                            for (int j = 0; j < childTabs.Length; j++)
                            {

                                if (tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])] == null)
                                    tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])] = new List<int>();

                                //if (columnsTableHirarerichy[Convert.ToInt32(childTabs[j]["AD_Column_ID"])] == null)
                                //    columnsTableHirarerichy[Convert.ToInt32(childTabs[j]["AD_Column_ID"])] = 0;


                                int linkColumn = Util.GetValueOfInt(childTabs[j]["AD_Column_ID"]);
                                MTable linktable = MColumn.Get(ctx, linkColumn).GetFKTable();
                                if (linktable != null)
                                {
                                    int parentTableID = linktable.GetAD_Table_ID();
                                    columnsTableHirarerichy[Convert.ToInt32(childTabs[j]["AD_Column_ID"])] = parentTableID;
                                    if (!tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Contains(linkColumn))
                                        tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Add(linkColumn);
                                }

                                //C_Order_ID
                                //C_Order_ID, C_Tax_ID
                                int[] pColumns = MTable.Get(ctx, childTabs[j]["TableName"].ToString()).GetParentColumnIDs();
                                if (pColumns != null && pColumns.Length > 0)
                                {
                                    for (int k = 0; k < pColumns.Length; k++)
                                    {
                                        //if (tab["TableName"] + "_ID" == pColumns[k])
                                        //{


                                        MTable table = MColumn.Get(ctx, pColumns[k]).GetFKTable();
                                        if (table != null)
                                        {
                                            int parentTableID = table.GetAD_Table_ID();

                                            if (!tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Contains(pColumns[k]))
                                                tableColumnHirarichy[Convert.ToInt32(childTabs[j]["AD_Table_ID"])].Add(pColumns[k]);

                                            columnsTableHirarerichy[pColumns[k]] = parentTableID;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }


            DataSet ds = DB.ExecuteDataset("SELECT Distinct AD_Table_ID, Record_ID, AD_ORGSHARED_ID, IsReadOnly FROM AD_ShareRecordOrg ORDER BY AD_Table_ID");
            for (int a = 0; a < ds.Tables[0].Rows.Count; a++)
            {
                ShareOrg org = new ShareOrg();
                org.OrgID = Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_OrgShared_ID"]);
                org.RecordID = Util.GetValueOfInt(ds.Tables[0].Rows[a]["Record_ID"]);
                org.Readonly = ds.Tables[0].Rows[a]["IsReadOnly"] == "Y" ? true : false;

                if (tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])] == null)
                    tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])] = new List<ShareOrg>();

                //  if (tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])].Contains)
                tableRecordHirarerichy[Util.GetValueOfInt(ds.Tables[0].Rows[a]["AD_Table_ID"])].Add(org);
            }
        }

        public void ShareChild(Ctx p_ctx, PO po)
        {

            FillData(p_ctx);
            List<int> parentColumnIDs = tableColumnHirarichy[po.Get_Table_ID()];

            //  int[] parentCols = MTable.Get(p_ctx, po.Get_Table_ID()).GetParentColumnIDs();

            if (parentColumnIDs != null && parentColumnIDs.Count > 0)
            {
                for (int i = 0; i < parentColumnIDs.Count; i++)
                {
                    MColumn clm = MColumn.Get(p_ctx, parentColumnIDs[i]);
                    int tablID = clm.GetFKTable().GetAD_Table_ID();
                    if (tableRecordHirarerichy[tablID] != null)
                    {
                        //for (int j = 0; j < parentCols.Count(); j++)
                        //{

                        //if (parentColumnIDs[i] == clm.GetFKTable().GetAD_Table_ID())
                        //{
                        int parentID = po.Get_ValueAsInt(clm.GetColumnName());
                        List<ShareOrg> sharedRec = tableRecordHirarerichy[columnsTableHirarerichy[parentColumnIDs[i]]];

                        if (sharedRec != null && sharedRec.Count > 0)
                        {
                            for (int k = 0; k < sharedRec.Count; k++)
                            {
                                if (sharedRec[k].RecordID == parentID)
                                {
                                    VAdvantage.ModelAD.MShareRecordOrg SRO = new VAdvantage.ModelAD.MShareRecordOrg(p_ctx, 0, po.Get_Trx());
                                    SRO.SetAD_Table_ID(po.Get_Table_ID());
                                    SRO.Set_ValueNoCheck("AD_OrgShared_ID", sharedRec[k].OrgID);
                                    SRO.SetIsReadOnly(sharedRec[k].Readonly);
                                    SRO.SetRecord_ID(po.Get_ID());
                                    if (SRO.Save())
                                    {

                                    }
                                }
                            }
                        }
                        //}
                        //}
                    }
                }
            }
        }

        //public static void AddParentChild(int table, int parentTable)
        //{
        //    if (tableHirarichy[table] == null)
        //        tableHirarichy[table] = new List<int>();

        //    if (!tableHirarichy[table].Contains(parentTable))
        //        tableHirarichy[table].Add(parentTable);
        //}

        public static void AddRecordToTable(int table, ShareOrg record)
        {
            if (tableRecordHirarerichy[table] == null)
                tableRecordHirarerichy[table] = new List<VAdvantage.Common.ShareOrg>();

            ShareOrg org = tableRecordHirarerichy[table].Find(a => a.RecordID == record.RecordID && a.OrgID == record.OrgID);
            if (org == null)
                tableRecordHirarerichy[table].Add(record);
            //else
            //{
            //    tableRecordHirarerichy[table]
            //}

        }

    }

    public class ShareOrg
    {
        public int RecordID { get; set; }
        public int OrgID { get; set; }
        public bool Readonly { get; set; }
    }
}
