/********************************************************
 * Module Name    : Framework
 * Purpose        : Copy screen's tab and fields to new screen
 * Chronological Development
 * Lokesh Chauhan     13-May-2024
  ******************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAdvantage.Process
{
    public class WindowCopy : SvrProcess
    {
        #region Private Variables
        /**	Window To					*/
        private int p_AD_WindowTo_ID = 0;
        /**	Window From					*/
        private int p_AD_WindowFrom_ID = 0;
        #endregion Private Variables

        /// <summary>
        /// Parameters fetching
        /// </summary>
        protected override void Prepare()
        {
            ProcessInfoParameter[] para = GetParameter();
            for (int i = 0; i < para.Length; i++)
            {
                String name = para[i].GetParameterName();
                if (para[i].GetParameter() == null)
                    ;
                else if (name.Equals("AD_Window_ID"))
                    p_AD_WindowFrom_ID = para[i].GetParameterAsInt();
                else
                    log.Log(Level.SEVERE, "prepare - Unknown Parameter: " + name);
            }
            p_AD_WindowTo_ID = GetRecord_ID();
        }

        /// <summary>
        /// Job logic to copy screen's tab and fields to new screen
        /// </summary>
        /// <returns></returns>
        protected override string DoIt()
        {
            log.Info("doIt - To AD_Window_ID=" + p_AD_WindowTo_ID + ", From=" + p_AD_WindowFrom_ID);
            MWindow from = new MWindow(GetCtx(), p_AD_WindowFrom_ID, Get_TrxName());
            if (from.Get_ID() == 0)
            {
                log.SaveError("from window id not found", "");
                return Msg.GetMsg(GetCtx(), "FromScreenNotFound");
            }
            MWindow to = new MWindow(GetCtx(), p_AD_WindowTo_ID, Get_TrxName());
            if (to.Get_ID() == 0)
            {
                log.SaveError("to window id not found", "");
                return Msg.GetMsg(GetCtx(), "ScreenNotFound");
            }

            int tabCount = 0;
            int fieldCount = 0;
            MTab[] oldTabs = from.GetTabs(false, Get_TrxName());
            for (int i = 0; i < oldTabs.Length; i++)
            {
                MTab oldTab = oldTabs[i];
                MTab newTab = new MTab(to, oldTab);
                if (newTab.Save())
                {
                    tabCount++;
                    //	Copy Fields
                    MField[] oldFields = oldTab.GetFields(false, Get_TrxName());
                    for (int j = 0; j < oldFields.Length; j++)
                    {
                        MField oldField = oldFields[j];
                        MField newField = new MField(newTab, oldField);
                        if (newField.Save())
                            fieldCount++;
                        else
                        {
                            log.SaveError("Error saving new Field", "");
                            return Msg.GetMsg(GetCtx(), "FieldSaveError") + " : " + oldField.GetName();
                        }
                    }
                }
                else
                {
                    log.SaveError("Error saving new Tab", "");
                    return Msg.GetMsg(GetCtx(), "TabSaveError") + " : " + oldTab.GetName();
                }
            }

            return Msg.GetMsg(GetCtx(), "Copied") + " # " + tabCount + "/" + fieldCount;
        }
    }
}
