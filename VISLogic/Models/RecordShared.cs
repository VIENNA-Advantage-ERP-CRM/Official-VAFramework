using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Utility;
using VAdvantage.DataBase;
using VAdvantage.ModelAD;

namespace VISLogic.Models
{
    /// <summary>
    /// This class is used for record share with other organization
    /// VIS0228 09-Nov-2022
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
            string sqlQuery = @"SELECT AD_Org_ID, value,Name,IsLegalEntity,LegalEntityOrg FROM AD_ORg WHERE ISACTIVE='Y' AND AD_ORg_ID Not In (SELECT AD_OrgShared_ID FROM AD_ShareRecordOrg WHERE AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + ") ORDER BY Name";
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
            string sqlQuery = @"SELECT AD_ShareRecordOrg_ID, AD_ORg.AD_Org_ID, AD_ORg.value,AD_ORg.Name,AD_ORg.IsLegalEntity,AD_ORg.LegalEntityOrg,ad_sharerecordorg.isreadonly,AD_ORg.isSummary FROM AD_ORg 
                                LEFT JOIN AD_ShareRecordOrg ON AD_ORg.AD_Org_ID=ad_sharerecordorg.ad_orgshared_id  AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + @"
                                WHERE AD_ORg.ISACTIVE='Y' ORDER BY ad_sharerecordorg.created,AD_ORg.Name";
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
        public string SaveRecord(int AD_Table_ID, int record_ID, List<Records> records, Ctx ctx)
        {
            string msg = "OK";
            Trx trx = null;
            bool error = false;
            try
            {
                trx = Trx.GetTrx("ShareRecord" + DateTime.Now.Ticks);
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
                    msg = "OK";
                    trx.Commit();
                }
                trx.Close();
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
