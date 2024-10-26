using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class WFManualModel
    {
        StringBuilder sbQuery = new StringBuilder("");
        public List<WFDetails> GetWFDetails(Ctx _ctx, int AD_Table_ID)
        {
            List<WFDetails> _wfDet = new List<WFDetails>();
            sbQuery.Clear().Append("SELECT AD_Workflow_ID, Name, Value, Description FROM AD_Workflow WHERE WorkflowType = 'P' AND IsActive = 'Y' AND AD_Client_ID IN (0," + _ctx.GetAD_Client_ID() + ") AND AD_Table_ID = " + AD_Table_ID);
            DataSet dsRes = DB.ExecuteDataset(sbQuery.ToString(), null, null);
            if (dsRes != null && dsRes.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < dsRes.Tables[0].Rows.Count; i++)
                {
                    WFDetails wf = new WFDetails();
                    wf.Name = Util.GetValueOfString(dsRes.Tables[0].Rows[i]["Name"]);
                    wf.Value = Util.GetValueOfString(dsRes.Tables[0].Rows[i]["Value"]);
                    wf.Description = Util.GetValueOfString(dsRes.Tables[0].Rows[i]["Description"]);
                    wf.AD_Workflow_ID = Util.GetValueOfInt(dsRes.Tables[0].Rows[i]["AD_Workflow_ID"]);
                    _wfDet.Add(wf);
                }
            }
            return _wfDet;
        }

        public bool GetWFActivity(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            return Util.GetValueOfString(DB.ExecuteScalar("SELECT Processing FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID)) == "Y";
        }
    }

    public class WFDetails
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
        public int AD_Workflow_ID { get; set; }

    }
}