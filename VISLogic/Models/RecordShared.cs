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

            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery,"AD_Org",true,false);

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
