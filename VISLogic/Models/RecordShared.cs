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
            string sqlQuery = @"SELECT AD_Org_ID, value,Name,IsLegalEntity,LegalEntityOrg FROM AD_ORg WHERE ISACTIVE='Y' AND AD_ORg_ID NOT IN (SELECT AD_OrgShared_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + ") ORDER BY Name";

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
        public List<Records> GetSharedRecord(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            List<Records> lstOrg = null;
            string sqlQuery = @"SELECT AD_ShareRecordOrg_ID, AD_Org.AD_Org_ID, AD_Org.value,AD_Org.Name,AD_Org.IsLegalEntity,AD_Org.LegalEntityOrg,AD_ShareRecordOrg.isreadonly,AD_Org.isSummary FROM AD_Org AD_Org
                                LEFT JOIN AD_ShareRecordOrg AD_ShareRecordOrg ON AD_Org.AD_Org_ID=AD_ShareRecordOrg.ad_orgshared_id AND AD_ShareRecordOrg.AD_Table_ID=" + AD_Table_ID + " AND AD_ShareRecordOrg.Record_ID=" + Record_ID + @"
                                WHERE AD_Org.ISACTIVE='Y' ORDER BY AD_ShareRecordOrg.created,AD_Org.Name";

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
                        AD_OrgShared_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_ShareRecordOrg_ID"])
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
        /// <returns></returns>
        public string SaveRecord(int AD_Table_ID, int record_ID, int AD_Tab_ID, int Window_ID, int WindowNo, List<Records> records, Ctx ctx, Trx trx1)
        {
            string msg = "OK";
            Trx trx = null;
            bool error = false;
            try
            {
                if (trx1 == null)
                    trx = Trx.GetTrx("ShareRecord" + DateTime.Now.Ticks);
                else
                    trx = trx1;
                string query = "DELETE FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + record_ID;
                DB.ExecuteQuery(query, null, trx);
                if (records != null)
                {
                    for (int i = 0; i < records.Count; i++)
                    {
                        MShareRecordOrg SRO = new MShareRecordOrg(ctx, 0, trx);
                        SRO.SetAD_Table_ID(AD_Table_ID);
                        SRO.Set_ValueNoCheck("AD_OrgShared_ID", records[i].AD_OrgShared_ID);
                        SRO.SetIsReadOnly(records[i].isReadonly);
                        SRO.SetRecord_ID(record_ID);
                        if (!SRO.Save())
                        {
                            error = true;
                            break;
                        }

                        GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, Window_ID, 0);

                        GridTabVO gt = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault();

                        List<GridTabVO> gTabs = vo.GetTabs().Where(a => a.TabLevel > gt.TabLevel).ToList();


                        if (gTabs != null && gTabs.Count > 0)
                        {
                            foreach (var tab in gTabs)
                            {
                                MTable table = MTable.Get(ctx, tab.AD_Table_ID);

                                //int linkCol = tab.AD_Column_ID;
                                //string lCol = "";
                               // List<MColumn> cols = table.GetColumns(false).Where(a => a.IsParent() == true).ToList();
                                DataSet ds = null;

                                //if (linkCol > 0)
                                //{
                                //    lCol = MColumn.GetColumnName(ctx, tab.AD_Column_ID);
                                //    PO pObj = MTable.GetPO(ctx, table.GetTableName(), record_ID, trx);
                                //    //select C_Order_ID FROM C_orderTax where C_Order_ID=11123123
                                //    ds = DB.ExecuteDataset($"SELECT  {lCol} FROM {table.GetTableName()} WHERE {lCol}={ pObj.Get_ValueAsInt(lCol)}");
                                //}
                                //else
                                //{
                                    //if (cols != null && cols.Count > 0)
                                    //{
                                    //    if (cols.Count == 1 && gt.TableName + "_ID" == cols[0].GetColumnName())
                                    //    {
                                            ds = DB.ExecuteDataset($"SELECT  {table.GetTableName()}_ID FROM {table.GetTableName()} WHERE {gt.TableName}_ID = {record_ID}");
                                        //}
                                    //    else
                                    //    {
                                    //        PO pObj = MTable.GetPO(ctx, table.GetTableName(), record_ID, trx);
                                    //        ds = DB.ExecuteDataset($"SELECT  {table.GetKeyColumns()[0]} FROM {table.GetTableName()} WHERE {cols[0].GetColumnName()} = {pObj.Get_ValueAsInt(cols[0].GetColumnName())} AND {cols[1].GetColumnName()} = {pObj.Get_ValueAsInt(cols[1].GetColumnName())}");
                                    //    }
                                    //}
                                //}

                                if (ds != null && ds.Tables[0].Rows.Count > 0)
                                {
                                    for (int j = 0; j < ds.Tables[0].Rows.Count; j++)
                                    {
                                        SaveRecord(table.GetAD_Table_ID(), Util.GetValueOfInt(ds.Tables[0].Rows[j][0]), tab.AD_Tab_ID, Window_ID, WindowNo, records, ctx, trx);
                                    }
                                }
                            }
                        }

                    }
                }

            }
            catch (Exception e)
            {
                error = true;
                msg = e.Message;
            }
            finally
            {
                if (error)
                {
                    msg = "Fail";
                    trx.Rollback();
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


    }
    /// <summary>
    /// Organization Property
    /// /// VIS0228 09-Nov-2022
    /// </summary>
    public class Organization
    {
        public int ID { get; set; }
        public string value { get; set; }
        public string name { get; set; }
        public string isLegalEntity { get; set; }
        public int legalEntityOrg { get; set; }

    }

    /// <summary>
    /// Save record property
    /// </summary>
    public class Records : Organization
    {
        public int AD_OrgShared_ID { get; set; }
        public int AD_Table_ID { get; set; }
        public bool isReadonly { get; set; }
        public bool isSummary { get; set; }
        public int record_ID { get; set; }
    }
}
