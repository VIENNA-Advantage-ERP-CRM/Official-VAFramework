using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;
using VAdvantage.ProcessEngine;
using VAdvantage.WF;

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

        public WFExecStatus SaveExecuteWF(Ctx _ctx, int AD_Table_ID, string AD_Workflow_IDs, int Record_ID, int AD_Window_ID)
        {
            WFExecStatus _wfStatus = new WFExecStatus();
            _wfStatus.Status = true;
            _wfStatus.ErrorMsg = "";

            string[] ids = AD_Workflow_IDs.Split(',');
            int seqNo = 10;
            Trx _trxManWF = Trx.GetTrx("WFManual_" + System.DateTime.Now.Ticks);
            int WF_ID = 0;
            for (int i = 0; i < ids.Length; i++)
            {
                if (i == 0)
                    WF_ID = Util.GetValueOfInt(ids[i]);
                PO _po = MTable.GetPO(_ctx, "AD_WF_ManualAttached", 0, _trxManWF);
                _po.SetAD_Client_ID(_ctx.GetAD_Client_ID());
                _po.SetAD_Org_ID(_ctx.GetAD_Org_ID());
                _po.Set_ValueNoCheck("AD_Table_ID", AD_Table_ID);
                _po.Set_ValueNoCheck("Record_ID", Record_ID);
                _po.Set_ValueNoCheck("AD_Workflow_ID", Util.GetValueOfInt(ids[i]));
                _po.Set_ValueNoCheck("AD_Window_ID", AD_Window_ID);
                _po.Set_Value("SeqNo", seqNo);
                if (!_po.Save())
                {
                    ValueNamePair vnp = VLogger.RetrieveError();
                    string error = "";
                    if (vnp != null)
                    {
                        error = vnp.GetName();
                        if (error == "" && vnp.GetValue() != null)
                            error = vnp.GetValue();
                    }
                    if (error == "")
                        error = "Error in creating Version Window";
                    //log.Log(Level.SEVERE, "Version Window not Created :: " + DisplayName + " :: " + error);
                    _wfStatus.ErrorMsg = error;
                    _wfStatus.Status = false;
                    _trxManWF.Rollback();
                    _trxManWF = null;
                    return _wfStatus;
                }
                else
                    seqNo = seqNo + 10;
            }
            _trxManWF.Commit();

            StartWFExecution(_ctx, WF_ID, AD_Table_ID, Record_ID, AD_Window_ID);

            _trxManWF = null;
            return _wfStatus;
        }

        public string StartWFExecution(Ctx _ctx, int AD_WorkFlow_ID, int AD_Table_ID, int Record_ID, int AD_Window_ID)
        {
            MWorkflow wf = new MWorkflow(_ctx, AD_WorkFlow_ID, null);
            int AD_Process_ID = 305;        //	HARDCODED
            VAdvantage.ProcessEngine.ProcessInfo pi = new VAdvantage.ProcessEngine.ProcessInfo(wf.GetName(), AD_Process_ID, AD_Table_ID, Record_ID);
            pi.SetAD_User_ID(_ctx.GetAD_User_ID());
            pi.SetAD_Client_ID(_ctx.GetAD_Client_ID());

            // vinay bhatt for window id
            pi.SetAD_Window_ID(AD_Window_ID);

            wf.GetCtx().SetContext("#AD_Client_ID", pi.GetAD_Client_ID().ToString());
            MWFProcess retVal = wf.Start(pi);
            if (retVal != null)
            {
                //log.Config(wf.GetName());
                //_noStarted++;
                //started = true;

                // VIS0060: work done to Show Message from workflow Process
                //document.SetDocWFMsg(retVal.GetProcessMsg());
            }
            return "";
        }

        public bool IsWFInExecution(Ctx _ctx, int AD_Table_ID, int Record_ID)
        {
            return Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(AD_WF_Activity_ID) FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID + " AND Processed = 'N'")) > 0;
        }

        public WFActivityDetails GetWFActivity(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            VIS.Models.WFActivityModel actModel = new WFActivityModel();
            //ActivityInfo actInf = actModel.GetActivityInfo(0, 0, 0, ctx);

            //List<WFActivityInfo> lstInfo = new List<WFActivityInfo>();
            WFActivityDetails _wfActDet = new WFActivityDetails();
            DataSet ds = DB.ExecuteDataset("SELECT AD_WF_Activity_ID FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID + " AND Processed = 'N' ORDER BY Created DESC");
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dr in ds.Tables[0].Rows)
                {
                    WFActivityInfo itm = new WFActivityInfo();
                    MWFActivity act = new MWFActivity(ctx, Util.GetValueOfInt(dr["AD_WF_Activity_ID"]), null);
                    itm.AD_Table_ID = act.GetAD_Table_ID();
                    itm.AD_User_ID = act.GetAD_User_ID();
                    itm.AD_WF_Activity_ID = act.GetAD_WF_Activity_ID();
                    itm.AD_Node_ID = act.GetAD_WF_Node_ID();
                    itm.AD_WF_Process_ID = act.GetAD_WF_Process_ID();
                    itm.AD_WF_Responsible_ID = act.GetAD_WF_Responsible_ID();
                    itm.AD_Workflow_ID = act.GetAD_Workflow_ID();
                    itm.CreatedBy = act.GetCreatedBy();
                    itm.DynPriorityStart = act.GetDynPriorityStart();
                    itm.Record_ID = act.GetRecord_ID();
                    itm.DocumentNameValue = "";
                    //if (Env.IsModuleInstalled("VADMS_"))
                    //{
                    //    itm.DocumentNameValue = Util.GetValueOfString(dr["DocumentNameValue"]);
                    //}
                    itm.TxtMsg = act.GetTextMsg();
                    itm.WfState = act.GetWFState();
                    itm.EndWaitTime = act.GetEndWaitTime();
                    //itm.Created = Util.GetValueOfString(dr["Created"]);
                    DateTime _createdDate = new DateTime();
                    if (act.GetCreated().ToString() != null && act.GetCreated().ToString() != "")
                    {
                        _createdDate = Convert.ToDateTime(act.GetCreated().ToString());
                        DateTime _format = DateTime.SpecifyKind(new DateTime(_createdDate.Year, _createdDate.Month, _createdDate.Day, _createdDate.Hour, _createdDate.Minute, _createdDate.Second), DateTimeKind.Utc);
                        _createdDate = _format;
                        itm.Created = _format;
                    }
                    else
                        itm.Created = System.DateTime.Now;

                    itm.NodeName = act.GetNodeName();
                    itm.Summary = act.GetSummary();
                    itm.Description = act.GetNodeDescription();
                    itm.Help = act.GetNodeHelp();
                    itm.History = act.GetHistoryHTML();
                    itm.Priority = Util.GetValueOfInt(act.GetPriority());
                    itm.AD_Window_ID = Util.GetValueOfInt(act.GetAD_Window_ID());
                    _wfActDet.wfActInf = itm;
                    break;
                    //lstInfo.Add(itm);
                }
            }

            ds = DB.ExecuteDataset("SELECT AD_WF_Activity_ID, AD_WF_Process_ID, AD_WF_Node_ID FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID + " ORDER BY Created DESC");

            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                int prev_AD_WF_Process_ID = 0;
                int curr_AD_WF_Process_ID = 0;
                List<ActivityInfo> actInfo = new List<ActivityInfo>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    curr_AD_WF_Process_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Process_ID"]);
                    if (i == 0 || (curr_AD_WF_Process_ID != prev_AD_WF_Process_ID))
                    {
                        ActivityInfo itm = actModel.GetActivityInfo(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Activity_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Node_ID"]), curr_AD_WF_Process_ID, ctx);
                        actInfo.Add(itm);
                        prev_AD_WF_Process_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Process_ID"]);
                    }
                }
                _wfActDet.actInfo = actInfo;
            }

            return _wfActDet;
        }

        public WFInfo GetAppActivities(Ctx ctx, int AD_Window_ID, int Record_ID)
        {
            WFActivityModel wfm = new WFActivityModel();
            return wfm.GetRecordActivities(ctx, ctx.GetAD_User_ID(), ctx.GetAD_Client_ID(), AD_Window_ID, Record_ID);
        }
    }

    public class WFDetails
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
        public int AD_Workflow_ID { get; set; }

    }

    public class WFExecStatus
    {
        public string ErrorMsg { get; set; }
        public bool Status { get; set; }
    }

    public class WFActivityDetails
    {
        public WFActivityInfo wfActInf { get; set; }

        public List<ActivityInfo> actInfo { get; set; }
    }

}