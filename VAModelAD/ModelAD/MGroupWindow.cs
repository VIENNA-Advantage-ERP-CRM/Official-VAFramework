using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MGroupWindow : X_AD_Group_Window
    {
        VLogger _log = VLogger.GetVLogger(typeof(MGroupWindow).FullName);   
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_GroupWindow_ID">id</param>
        /// <param name="trxName">transaction</param>
        public MGroupWindow(Ctx ctx, int AD_GroupWindow_ID, Trx trxName)
            : base(ctx, AD_GroupWindow_ID, trxName)
        {

        }

        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="rs">datarow</param>
        /// <param name="trxName">transaction</param>
        public MGroupWindow(Ctx ctx, DataRow dr, Trx trxName)
            : base(ctx, dr, trxName)
        {

        }
        public MGroupWindow(Ctx ctx, IDataReader idr, Trx trxName)
            : base(ctx, idr, trxName)
        { }

        /// <summary>
        /// Insert and Update Group window After new group window Entry.
        /// </summary>
        /// <param name="newRecord"></param>
        /// <param name="success"></param>
        /// <returns>true/false</returns>
        protected override bool AfterSave(bool newRecord, bool success)
        {           
            if (newRecord)
            {
                InsertNewRecordInRole();               
            }
            else
            {
                UpdateRole(IsActive());
            }
            BindProcessInGroup();
            BindFormInGroup();
            BindWorkflowInGroup();
            return success;
        }

        /// <summary>
        /// Update related records in Group window after delete group window.
        /// </summary>
        /// <param name="success"></param>
        /// <returns></returns>
        protected override bool AfterDelete(bool success)
        {
            UpdateRole(false);
            return success;
        }
        
        private bool UpdateRole(bool isActive)
        {
            if (isActive)
            {
                DB.ExecuteQuery(@"UPDATE AD_Window_Access 
                                    SET IsActive='Y',IsReadWrite='Y'
                                    WHERE AD_Window_ID=" + GetAD_Window_ID() + @"
                                    AND AD_Role_ID IN
                                      (SELECT AD_Role_ID FROM AD_Role_Group WHERE AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + ")");
            }
            else
            {
                DB.ExecuteQuery(@"UPDATE AD_Window_Access 
                                    SET IsActive='N',IsReadWrite='N'
                                    WHERE AD_Window_ID=" + GetAD_Window_ID() + @"
                                    AND AD_Role_ID IN
                                      (SELECT AD_Role_ID FROM AD_Role_Group WHERE AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + ")");
            }
            return true;
        }

        /// <summary>
        /// Add Processes in GroupProcess Window.
        /// </summary>
        /// <returns>True/false</returns>
        private bool BindProcessInGroup()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Process_ID,GP.AD_Process_ID  AS IsProcessExist
                                FROM AD_Field FD 
                                INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)
                                LEFT JOIN AD_Group_Process GP ON(GP.AD_Process_ID=CM.AD_Process_ID) AND GP.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + @"
                                WHERE TB.AD_Window_ID =" + GetAD_Window_ID() + @"
                                AND CM.AD_Process_ID > 0 AND FD.IsActive='Y'");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsProcessExist"]) == 0)
                        {
                            MGroupProcess access = new MGroupProcess(GetCtx(), 0, null);
                            access.SetAD_Process_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"]));
                            access.SetAD_GroupInfo_ID(Util.GetValueOfInt(GetAD_GroupInfo_ID()));
                            if (!access.Save())
                            {
                                ValueNamePair vnp = VLogger.RetrieveError();
                                if (vnp != null && vnp.GetName() != null)
                                {
                                    _log.Log(Level.SEVERE, "Could not Save", vnp.GetName());
                                }
                            }
                        }
                        else
                        {
                    DB.ExecuteQuery(@"UPDATE AD_Group_Process 
                                    SET IsActive='Y'
                                    WHERE AD_Process_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"])+@"
                                    AND AD_GroupInfo_ID = " + GetAD_GroupInfo_ID());
                        }                     
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return true;
        }

        /// <summary>
        /// Add Forms in GroupForm Window.
        /// </summary>
        /// <returns>True/False</returns>
        private bool BindFormInGroup()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Form_ID,GF.AD_Form_ID AS IsFormExist FROM AD_Field FD
                                  INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                  INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                  INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)  
                                  LEFT JOIN AD_Group_Form GF ON(GF.AD_Form_ID=CM.AD_Form_ID) AND GF.AD_GroupInfo_ID= "+ GetAD_GroupInfo_ID() + @" 
                                  WHERE TB.AD_window_ID =" + GetAD_Window_ID() + @" 
                                  AND CM.AD_Form_ID > 0 AND FD.IsActive='Y'");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsFormExist"]) == 0)
                        {
                            MGroupForm access = new MGroupForm(GetCtx(), 0, null);
                            access.SetAD_Form_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"]));
                            access.SetAD_GroupInfo_ID(Util.GetValueOfInt(GetAD_GroupInfo_ID()));
                            if (!access.Save())
                            {
                                ValueNamePair vnp = VLogger.RetrieveError();
                                if (vnp != null && vnp.GetName() != null)
                                {
                                    _log.Log(Level.SEVERE, "Could not Save", vnp.GetName());
                                }
                            }
                        }
                        else
                        {
                            DB.ExecuteQuery(@"UPDATE AD_Group_Form  
                                    SET IsActive='Y'
                                    WHERE AD_Form_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"])+ @"
                                    AND AD_GroupInfo_ID=" + GetAD_GroupInfo_ID());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return true;
        }

        /// <summary>
        /// Add Workflow in GroupWorkflow Window.
        /// </summary>
        /// <returns>True/False</returns>
        private bool BindWorkflowInGroup()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT WF.AD_Workflow_ID,GW.AD_Workflow_ID AS IsWorkflowExist
                                            FROM AD_Window WD
                                            INNER JOIN AD_TABLE TL ON (WD.AD_Window_ID = TL.AD_Window_ID)
                                            INNER JOIN AD_Workflow WF ON (TL.AD_Table_ID = WF.AD_Table_ID)
                                            LEFT JOIN AD_Group_Workflow GW ON (GW.AD_Workflow_ID=WF.AD_Workflow_ID) AND GW.AD_GroupInfo_ID="+ GetAD_GroupInfo_ID() + @" 
                                            WHERE WD.AD_Window_ID =" + GetAD_Window_ID() + @" 
                                            AND WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsWorkflowExist"]) == 0)
                        {
                            MGroupWorkflow access = new MGroupWorkflow(GetCtx(), 0, null);
                            access.SetAD_Workflow_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Workflow_ID"]));
                            access.SetAD_GroupInfo_ID(Util.GetValueOfInt(GetAD_GroupInfo_ID()));

                            if (!access.Save())
                            {
                                ValueNamePair vnp = VLogger.RetrieveError();
                                if (vnp != null && vnp.GetName() != null)
                                {
                                    _log.Log(Level.SEVERE, "Could not Save", vnp.GetName());
                                }
                            }
                        }
                        else
                        {
                            DB.ExecuteQuery(@"UPDATE AD_Group_Workflow   
                                    SET IsActive='Y'
                                    WHERE AD_Workflow_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Workflow_ID"]) + @"
                                    AND AD_GroupInfo_ID=" + GetAD_GroupInfo_ID());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return true;
        }
        
        private void InsertNewRecordInRole()
        {
            DataSet ds = DB.ExecuteDataset("SELECT AD_Role_ID FROM AD_Role_Group WHERE AD_GroupInfo_ID =" + GetAD_GroupInfo_ID());
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    MWindowAccess access = new MWindowAccess(GetCtx(), 0, null);
                    access.SetAD_Window_ID(GetAD_Window_ID());
                    access.SetAD_Role_ID(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                    access.SetIsReadWrite(true);
                    access.Save();
                }
            }
        }     
    }
}