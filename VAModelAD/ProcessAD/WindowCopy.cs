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
            MCardViewColumn newCol = null ;
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
            int tabPanelCount = 0;
            // int cardViewCount = 0;
            Dictionary<int, int> fieldMapping = new Dictionary<int, int>();
            MTab[] oldTabs = from.GetTabs(false, Get_TrxName());
            for (int i = 0; i < oldTabs.Length; i++)
            {
                MTab oldTab = oldTabs[i];
                MTab newTab = new MTab(to, oldTab);
                if (newTab.Save())
                {


                    //copy tab panel also
                    MTabPanel[] oldTabPanels = oldTab.GetTabPanel(false, Get_TrxName());
                    for (int j = 0; j < oldTabPanels.Length; j++)
                    {
                        MTabPanel oldTabPanel = oldTabPanels[j];
                        MTabPanel newTabPanel = new MTabPanel(newTab, oldTabPanel);
                        newTabPanel.SetAD_Tab_ID(newTab.Get_ID());
                        if (newTabPanel.Save())
                            tabPanelCount++;
                        else
                        {
                            log.SaveError("Error saving new TabPanel", "");
                            return Msg.GetMsg(GetCtx(), "TabPanelSaveError") + " : " + oldTabPanel.GetName();
                        }
                    }

                    tabCount++;
                    //	Copy Fields
                    MField[] oldFields = oldTab.GetFields(false, Get_TrxName());
                    for (int j = 0; j < oldFields.Length; j++)
                    {
                        MField oldField = oldFields[j];
                        MField newField = new MField(newTab, oldField);
                        if (newField.Save())
                        {
                            fieldCount++;
                            fieldMapping[oldField.GetAD_Field_ID()] = newField.GetAD_Field_ID();                          
                        }
                      
                        else
                        {
                            log.SaveError("Error saving new Field", "");
                            return Msg.GetMsg(GetCtx(), "FieldSaveError") + " : " + oldField.GetName();
                        }
                    }
                    MCardView[] oldCardViews = oldTab.GetCardViews(false, Get_TrxName());
                    for (int k = 0; k < oldCardViews.Length; k++)
                    {
                        MCardView oldCardView = oldCardViews[k];
                        MCardView newCardView = new MCardView(newTab, oldCardView);
                        newCardView.SetAD_Window_ID(newTab.GetAD_Window_ID());
                        newCardView.SetAD_Tab_ID(newTab.Get_ID());
                        newCardView.SetName(to.GetName());
                        if (newCardView.Save())
                        {
                            MCardViewColumn[] cardViewColumn = oldTab.GetCardViewColumns(false, Get_TrxName(), oldCardView.Get_ID());
                            for (int j = 0; j < cardViewColumn.Length; j++)
                            {
                                MCardViewColumn oldCol = cardViewColumn[j];
                              //  MCardViewColumn newCol = new MCardViewColumn(newTab, oldCol);
                                 newCol = new MCardViewColumn(newTab, oldCol);
                                newCol.SetAD_CardView_ID(newCardView.Get_ID());
                                int oldFieldId = oldCol.GetAD_Field_ID();
                                if (fieldMapping.ContainsKey(oldFieldId))
                                {
                                    int newFieldId = fieldMapping[oldFieldId];
                                    newCol.SetAD_Field_ID(newFieldId);
                                }
                                else
                                {
                                    log.SaveError("New Field not found", "Old Field ID: " + oldFieldId);

                                    return Msg.GetMsg(GetCtx(), "FieldSaveError");
                                }
                                if (!newCol.Save())
                                {
                                    log.SaveError("Error saving new Card View column", "");
                                     return Msg.GetMsg(GetCtx(), "TabPanelSaveError")+ " : " + newCardView.GetName();
                                }                               
                            }
                            MCardViewCondition[] mOldCardViews = oldTab.GetCardViewColumnCondition(false, Get_TrxName(), oldCardView.Get_ID());
                            for (int h = 0; h < mOldCardViews.Length; h++)
                            {
                                MCardViewCondition mOldCardViewCon = mOldCardViews[h];
                                MCardViewCondition mNewCardViewCon = new MCardViewCondition(newTab, mOldCardViewCon);
                               // mNewCardViewCon.SetAD_CardView_ID(newCardView.Get_ID());
                                mNewCardViewCon.Set_ValueNoCheck("AD_CardView_ID",newCardView.Get_ID());
                                
                                if (!mNewCardViewCon.Save())
                                {
                                    log.SaveError("Error saving new Card View condition", "");
                                    return Msg.GetMsg(GetCtx(), "TabPanelSaveError") + " : " + newCardView.GetName();
                                }
                            }
                        }
                        else
                        {
                            log.SaveError("Error saving new Card View", "");
                            return Msg.GetMsg(GetCtx(), "TabPanelSaveError") + " : " + oldCardView.GetName();
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
