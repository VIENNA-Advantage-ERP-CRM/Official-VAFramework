/********************************************************
* Module Name    : Workflow
* Purpose        : Common class for workflow execution
* Class Used     : WFCommon
* Chronological Development
* VIS0008        06-Nov-2024
******************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Utility;

namespace VAdvantage.WF
{
    public static class WFCommon
    {
        /// <summary>
        /// Function to execute workflow, against the record and table IDs passed in the parameter
        /// </summary>
        /// <param name="_ctx">Context</param>
        /// <param name="AD_WorkFlow_ID">Workflow ID</param>
        /// <param name="AD_Table_ID">Table ID</param>
        /// <param name="Record_ID">Record ID</param>
        /// <param name="AD_Window_ID">Screen ID</param>
        /// <returns>string message</returns>
        public static string StartWFExecution(Ctx _ctx, int AD_WorkFlow_ID, int AD_Table_ID, int Record_ID, int AD_Window_ID)
        {
            MWorkflow wf = new MWorkflow(_ctx, AD_WorkFlow_ID, null);
            int AD_Process_ID = 305;        //	HARDCODED
            VAdvantage.ProcessEngine.ProcessInfo pi = new VAdvantage.ProcessEngine.ProcessInfo(wf.GetName(), AD_Process_ID, AD_Table_ID, Record_ID);
            pi.SetAD_User_ID(_ctx.GetAD_User_ID());
            pi.SetAD_Client_ID(_ctx.GetAD_Client_ID());
            pi.SetAD_Window_ID(AD_Window_ID);
            wf.GetCtx().SetContext("#AD_Client_ID", pi.GetAD_Client_ID().ToString());
            MWFProcess retVal = wf.Start(pi);
            if (retVal != null)
            {
                return retVal.GetProcessMsg();
            }
            return "";
        }
    }
}