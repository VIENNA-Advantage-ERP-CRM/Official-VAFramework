/********************************************************
 * Module Name    : Workflow
 * Purpose        : Model for Manual execution of workflow against record and display activities
 * Class Used     : WFManualModel
 * Chronological Development
 * VIS0008        06-Nov-2024
 ******************************************************/

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
using VAdvantage.Process;

namespace VIS.Models
{
    /// <summary>
    /// Model class for workflow manual execution
    /// </summary>
    public class WFManualModel
    {
        #region Private Variables
        private StringBuilder sbQuery = new StringBuilder("");
        #endregion Private Variables

        /// <summary>
        /// Get workflows of document process type against the table passed in parameter
        /// </summary>
        /// <param name="_ctx">Context</param>
        /// <param name="AD_Table_ID">Table</param>
        /// <returns>List of workflow details</returns>
        public List<WFDetails> GetWFDetails(Ctx _ctx, int AD_Table_ID)
        {
            List<WFDetails> _wfDet = new List<WFDetails>();
            // Fetch all workflows of type document process linked with table passed in parameter, which are not linked with any button on this table
            sbQuery.Clear().Append(@"SELECT AD_Workflow_ID, Name, Value, Description FROM AD_Workflow WHERE WorkflowType = 'P' AND IsActive = 'Y'
            AND AD_Workflow_ID NOT IN (SELECT COALESCE(AD_Workflow_ID,0) FROM AD_Process WHERE AD_Process_ID IN
            (SELECT AD_Process_ID FROM AD_Column WHERE AD_Table_ID = " + AD_Table_ID + @"))
            AND AD_Client_ID IN (0," + _ctx.GetAD_Client_ID() + @") AND AD_Table_ID = " + AD_Table_ID);
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

        /// <summary>
        /// Get ManuallyAttached Workflows and Sequence
        /// </summary>
        /// <param name="_ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public List<WFDetails> GetManuallyAttachedWFDetails(Ctx _ctx, int AD_Window_ID, int Record_ID, int AD_Table_ID)
        {
            List<WFDetails> _wfDet = new List<WFDetails>();
            // Fetch all workflows of type document process linked with table passed in parameter, which are not linked with any button on this table
            sbQuery.Clear().Append(@"SELECT w.Name, ma.SeqNo, w.Description, w.Value, ma.AD_Workflow_ID
                                    FROM ad_wf_manualattached ma INNER JOIN AD_Workflow w ON (w.AD_Workflow_ID = ma.AD_Workflow_ID)
                                    WHERE ma.AD_Table_ID = " + AD_Table_ID + @" AND ma.Record_ID = " + Record_ID + @"
                                    ORDER BY ma.created DESC, ma.SeqNo DESC");
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
                    wf.SeqNo = Util.GetValueOfInt(dsRes.Tables[0].Rows[i]["SeqNo"]);                    
                    _wfDet.Add(wf);
                    if (wf.SeqNo <= 10)
                        break;
                }

                _wfDet = _wfDet.OrderBy(c => c.SeqNo).ToList();
            }

            return _wfDet;
        }

        /// <summary>
        /// Save workflows in AD_WF_ManualAttached table passed in the parameter and execute workflows in sequence after that
        /// </summary>
        /// <param name="_ctx">Context</param>
        /// <param name="AD_Table_ID">Table ID</param>
        /// <param name="AD_Workflow_IDs">Workflow IDs string</param>
        /// <param name="Record_ID">Record ID (Primary Key)</param>
        /// <param name="AD_Window_ID">Screen ID</param>
        /// <returns>Status of workflow execution with error message</returns>
        public WFExecStatus SaveExecuteWF(Ctx _ctx, int AD_Table_ID, string AD_Workflow_IDs, int Record_ID, int AD_Window_ID)
        {
            WFExecStatus _wfStatus = new WFExecStatus();
            _wfStatus.Status = true;
            _wfStatus.ErrorMsg = "";

            string[] ids = AD_Workflow_IDs.Split(',');
            int seqNo = 10;
            Trx _trxManWF = Trx.GetTrx("WFManual_" + System.DateTime.Now.Ticks);
            int WF_ID = 0;
            try
            {
                for (int i = 0; i < ids.Length; i++)
                {
                    // get first workflow in WF_ID, so that first workflow can be passed for execution
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
                            error = "Error in saving manual workflow execution, Workflow ID -> " + Util.GetValueOfInt(ids[i]);
                        //log.Log(Level.SEVERE, "Version Window not Created :: " + DisplayName + " :: " + error);
                        _wfStatus.ErrorMsg = error;
                        _wfStatus.Status = false;
                        if (_trxManWF != null)
                        {
                            _trxManWF.Rollback();
                            _trxManWF.Close();
                            _trxManWF = null;
                        }
                        return _wfStatus;
                    }
                    else
                        seqNo = seqNo + 10;
                }
                if (_trxManWF != null)
                {
                    _trxManWF.Commit();
                    _trxManWF.Close();
                    _trxManWF = null;
                }
                // execute first workflow here against the record ID
                string wfExeRes = WFCommon.StartWFExecution(_ctx, WF_ID, AD_Table_ID, Record_ID, AD_Window_ID);
                _wfStatus.ErrorMsg = wfExeRes;
            }
            catch (Exception ex)
            {
                if (_trxManWF != null)
                {
                    _trxManWF.Rollback();
                    _trxManWF.Close();
                    _trxManWF = null;
                }
                _wfStatus.ErrorMsg = ex.Message;
                _wfStatus.Status = false;
            }
            finally
            {
                if (_trxManWF != null)
                {
                    _trxManWF.Commit();
                    _trxManWF.Close();
                    _trxManWF = null;
                }
            }

            return _wfStatus;
        }

        /// <summary>
        /// Check if the workflow is in execution from Workflow activity
        /// </summary>
        /// <param name="_ctx">Context</param>
        /// <param name="AD_Table_ID">Table ID</param>
        /// <param name="Record_ID">Record ID</param>
        /// <returns>True/False</returns>
        public bool IsWFInExecution(Ctx _ctx, int AD_Table_ID, int Record_ID)
        {
            return Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(AD_WF_Activity_ID) FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID + " AND Processed = 'N'")) > 0;
        }

        /// <summary>
        /// Fetch workflow activity details against table and record id
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="AD_Table_ID">Table ID</param>
        /// <param name="Record_ID">Record ID</param>
        /// <returns>Workflow activity details</returns>
        public WFActivityDetails GetWFActivity(Ctx ctx, int AD_Table_ID, int Record_ID)
        {
            VIS.Models.WFActivityModel actModel = new WFActivityModel();
            WFActivityDetails _wfActDet = new WFActivityDetails();
            DataSet ds = DB.ExecuteDataset("SELECT AD_WF_Activity_ID FROM AD_WF_Activity WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID + " AND Processed = 'N' ORDER BY AD_WF_Activity_ID DESC");
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
                        ActivityInfo itm = actModel.GetActivityInfoPanel(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Activity_ID"]), Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Node_ID"]), curr_AD_WF_Process_ID, ctx);
                        actInfo.Add(itm);
                        prev_AD_WF_Process_ID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WF_Process_ID"]);
                    }
                }
                _wfActDet.actInfo = actInfo;
            }

            return _wfActDet;
        }

        /// <summary>
        /// Get approval activities against for the login user against the table and record ID
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="AD_Window_ID">Window ID</param>
        /// <param name="Record_ID">Record ID</param>
        /// <returns>Workflow Info</returns>
        public WFInfo GetAppActivities(Ctx ctx, int AD_Window_ID, int Record_ID)
        {
            WFActivityModel wfm = new WFActivityModel();
            return wfm.GetRecordActivities(ctx, ctx.GetAD_User_ID(), ctx.GetAD_Client_ID(), AD_Window_ID, Record_ID);
        }

        /// <summary>
        /// Function to check the page ID of workflow composer
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <returns>Workflow composer page ID</returns>
        public int GetWFComposerPageID(Ctx ctx)
        {
            int wfCompPageID = 0;
            if (Env.IsModuleInstalled("VA102_"))
            {
                wfCompPageID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Form_ID FROM AD_Form WHERE Name = 'VA102_WorkflowComposer'"));
            }
            return wfCompPageID;
        }

        /// <summary>
        /// Function to check the page ID of workflow composer
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <returns>Workflow composer page ID</returns>
        public string AbortWorkflow(Ctx ctx, int AD_WF_Process_ID)
        {
            string msg = "";
            MWFProcess process = new MWFProcess(ctx, AD_WF_Process_ID, null);
            //log.Info("doIt - " + process);

            MUser user = MUser.Get(ctx, ctx.GetAD_User_ID());

            //	Abort

            msg = user.GetName() + ": Abort";
            process.SetTextMsg(msg);
            process.SetAD_User_ID(ctx.GetAD_User_ID());
            process.SetWFState(StateEngine.STATE_ABORTED);
            MTable table = new MTable(ctx, process.GetAD_Table_ID(), null);
            PO po = MTable.GetPO(ctx, table.GetTableName(), process.GetRecord_ID(), null);
            if (po != null && po.Get_ColumnIndex("Processing") >= 0)
            {
                po.Set_Value("Processing", false);
                po.Save();
            }
            return msg;
        }

        public bool SetNodeTime(Ctx ctx, int activityId)
        {
            try
            {
                // Example: Load activity from DB using activityId
                MWFActivity activity = new MWFActivity(ctx, activityId, null);
                if (activity == null || activity.Get_ID() == 0)
                {
                    return false; // Activity not found
                }

                // Example: Update node timestamp
                activity.SetEndWaitTime(DateTime.Now);
                activity.SetWFState(StateEngine.STATE_COMPLETED);
                return true;
            }
            catch (Exception ex)
            {
                // Optional: log the exception
                VLogger.Get().Severe("WFManualModel.SetNodeTime Error: " + ex.Message);
                return false;
            }
        }


    }

    /// <summary>
    /// Workflow Details class
    /// </summary>
    public class WFDetails
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Description { get; set; }
        public int AD_Workflow_ID { get; set; }
        public DateTime? LastTriggered { get; set; }
        public int SeqNo { get; set; }

    }

    /// <summary>
    /// workflow execution status class
    /// </summary>
    public class WFExecStatus
    {
        public string ErrorMsg { get; set; }
        public bool Status { get; set; }
    }

    /// <summary>
    /// Workflow activity details
    /// </summary>
    public class WFActivityDetails
    {
        public WFActivityInfo wfActInf { get; set; }

        public List<ActivityInfo> actInfo { get; set; }
    }
}