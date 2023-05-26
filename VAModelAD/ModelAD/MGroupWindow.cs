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
        int oldWindowId = 0;
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
        /// Get Previous Window ID before Update group window record.
        /// </summary>
        /// <param name="newRecord"></param>
        /// <returns>AD_window_ID</returns>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        protected override bool BeforeSave(bool newRecord)
        {
            oldWindowId = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_window_ID FROM AD_Group_Window WHERE AD_Group_Window_ID=" + GetAD_Group_Window_ID() + " AND IsActive ='Y'"));
            return true;
        }

        /// <summary>
        /// Insert and Update Role window After new group window Entry.
        /// </summary>
        /// <param name="newRecord"></param>
        /// <param name="success"></param>
        /// <returns>true/false</returns>
        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (newRecord)
            {
                InsertNewRecordInRole();
                BindProcessInRole();
                BindWorkflowInRole();
                BindFormInRole();
            }
            else
            {
                UpdateRole(IsActive());
                UpdateProcess(IsActive());
                UpdateWorkflow(IsActive());
                UpdateForm(IsActive());
            }
            return success;
        }

        /// <summary>
        /// Update related records in role window after delete group window.
        /// </summary>
        /// <param name="success"></param>
        /// <returns></returns>
        protected override bool AfterDelete(bool success)
        {
            UpdateRole(false);
            UpdateProcess(false);
            UpdateWorkflow(false);
            UpdateForm(false);
            return success;
        }

        private bool UpdateRole(bool isActive)
        {
            DB.ExecuteQuery(@"UPDATE AD_Window_Access 
                                    SET IsActive='" + (isActive ? 'Y' : 'N') + "',IsReadWrite='" + (isActive ? 'Y' : 'N') + @"'
                                    WHERE AD_Window_ID=" + GetAD_Window_ID() + @"
                                    AND AD_Role_ID IN
                                      (SELECT AD_Role_ID FROM AD_Role_Group WHERE AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + ")");
            if (oldWindowId != GetAD_Window_ID())                                        //Update Old record  
            {
                DB.ExecuteQuery(@"UPDATE AD_Window_Access 
                                    SET IsActive='N',IsReadWrite='N'
                                    WHERE AD_Window_ID=" + oldWindowId + @"
                                    AND AD_Role_ID IN
                                     (SELECT AD_Role_ID FROM AD_Role_Group WHERE AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + ")");
            }
            return true;
        }

        /// <summary>
        /// Update Process access in role window.
        /// </summary>
        /// <param name="isActive">isActive</param>
        /// <returns>true/false</returns>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private bool UpdateProcess(bool isActive)
        {
            DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Process_ID,RG.AD_Role_ID
                                  FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                                  INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                  INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                  INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)
                                  LEFT JOIN AD_Process_Access PA ON (PA.AD_Process_ID=CM.AD_Process_ID) AND PA.AD_Role_ID= RG.AD_Role_ID        
                                  WHERE TB.AD_window_ID =" + GetAD_Window_ID() + @"
                                  AND CM.AD_Process_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                                  AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + "ORDER BY RG.AD_Role_ID");
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                {
                    DB.ExecuteQuery(@"UPDATE AD_Process_Access 
                                    SET IsActive='" + (isActive ? 'Y' : 'N') + "',IsReadWrite='" + (isActive ? 'Y' : 'N') + @"'
                                    WHERE AD_Process_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"]) + @"
                                    AND AD_Role_ID = " + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                }
            }
            if (oldWindowId != GetAD_Window_ID())
            {
                DataSet id = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Process_ID,RG.AD_Role_ID
                                      FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                                      INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                      INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                      INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)
                                      LEFT JOIN AD_Process_Access PA ON (PA.AD_Process_ID=CM.AD_Process_ID) AND PA.AD_Role_ID= RG.AD_Role_ID        
                                      WHERE TB.AD_window_ID =" + oldWindowId + @"
                                      AND CM.AD_Process_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                                      AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + "ORDER BY RG.AD_Role_ID");
                if (id != null && id.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = id.Tables[0].Rows.Count; i < ln; i++)
                    {
                        DB.ExecuteQuery(@"UPDATE AD_Process_Access 
                                    SET IsActive='N',IsReadWrite='N'
                                    WHERE AD_Process_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Process_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Role_ID"]));
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Update workflow access in role window.
        /// </summary>
        /// <param name="isActive">isActive</param>
        /// <returns>true/false</returns>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private bool UpdateWorkflow(bool isActive)
        {
            DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT WF.AD_Workflow_ID,RG.AD_Role_ID FROM AD_Window WD CROSS JOIN AD_Role_Group RG
                                         INNER JOIN AD_TABLE TL ON (WD.AD_Window_ID = TL.AD_Window_ID)
                                         INNER JOIN AD_Workflow WF ON (TL.AD_Table_ID = WF.AD_Table_ID)
                                         LEFT JOIN AD_Workflow_Access WA ON (WA.AD_Workflow_ID=WF.AD_Workflow_ID) AND WA.AD_Role_ID=RG.AD_Role_ID
                                         WHERE WD.AD_Window_ID =" + GetAD_Window_ID() + @" 
                                         AND WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'AND RG.IsActive='Y'
                                         AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                {
                    DB.ExecuteQuery(@"UPDATE AD_Workflow_Access 
                                   SET IsActive='" + (isActive ? 'Y' : 'N') + "',IsReadWrite='" + (isActive ? 'Y' : 'N') + @"'
                                    WHERE AD_Workflow_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Workflow_ID"]) + @"
                                    AND AD_Role_ID = " + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                }
            }
            if (oldWindowId != GetAD_Window_ID())
            {
                DataSet id = DB.ExecuteDataset(@"SELECT DISTINCT WF.AD_Workflow_ID,RG.AD_Role_ID FROM AD_Window WD CROSS JOIN AD_Role_Group RG
                                            INNER JOIN AD_TABLE TL ON (WD.AD_Window_ID = TL.AD_Window_ID)
                                            INNER JOIN AD_Workflow WF ON (TL.AD_Table_ID = WF.AD_Table_ID)
                                            LEFT JOIN AD_Workflow_Access WA ON (WA.AD_Workflow_ID=WF.AD_Workflow_ID) AND WA.AD_Role_ID=RG.AD_Role_ID
                                            WHERE WD.AD_Window_ID =" + oldWindowId + @" 
                                            AND WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'AND RG.IsActive='Y'
                                            AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
                if (id != null && id.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = id.Tables[0].Rows.Count; i < ln; i++)
                    {
                        DB.ExecuteQuery(@"UPDATE AD_Workflow_Access 
                                    SET IsActive='N',IsReadWrite='N'
                                    WHERE AD_Workflow_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Workflow_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Role_ID"]));
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Update Form access in role window.
        /// </summary>
        /// <param name="isActive">isActive</param>
        /// <returns>true/false</returns>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private bool UpdateForm(bool isActive)
        {
            DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Form_ID,RG.AD_Role_ID FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                                  INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                  INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                  INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID) 
                                  LEFT JOIN AD_Form_Access FA ON (FA.AD_Form_ID=CM.AD_Form_ID) AND FA.AD_Role_ID= RG.AD_Role_ID        
                                  WHERE TB.AD_window_ID =" + GetAD_Window_ID() + @" 
                                  AND CM.AD_Form_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                                  AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                {
                    DB.ExecuteQuery(@"UPDATE AD_Form_Access 
                                    SET IsActive='" + (isActive ? 'Y' : 'N') + "',IsReadWrite='" + (isActive ? 'Y' : 'N') + @"'
                                    WHERE AD_Form_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                }
            }
            if (oldWindowId != GetAD_Window_ID())
            {
                DataSet id = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Form_ID,RG.AD_Role_ID FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                                      INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                      INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                      INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID) 
                                      LEFT JOIN AD_Form_Access FA ON (FA.AD_Form_ID=CM.AD_Form_ID) AND FA.AD_Role_ID= RG.AD_Role_ID        
                                      WHERE TB.AD_window_ID =" + oldWindowId + @" 
                                      AND CM.AD_Form_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                                      AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
                if (id != null && id.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = id.Tables[0].Rows.Count; i < ln; i++)
                    {
                        DB.ExecuteQuery(@"UPDATE AD_Form_Access 
                                    SET IsActive='N',IsReadWrite='N'
                                    WHERE AD_Form_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Form_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(id.Tables[0].Rows[i]["AD_Role_ID"]));
                    }
                }
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

        /// <summary>
        ///Get all processes of a window
        /// </summary>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private void BindProcessInRole()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Process_ID,RG.AD_Role_ID,PA.AD_Process_ID AS IsProcessExist
                                FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                                INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                                INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                                INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)
                                LEFT JOIN AD_Process_Access PA ON (PA.AD_Process_ID=CM.AD_Process_ID) AND PA.AD_Role_ID= RG.AD_Role_ID        
                                WHERE TB.AD_window_ID =" + GetAD_Window_ID() + @"
                                AND CM.AD_Process_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                                AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + "ORDER BY RG.AD_Role_ID");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsProcessExist"]) == 0)
                        {
                            MProcessAccess access = new MProcessAccess(GetCtx(), 0, null);
                            access.SetAD_Process_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"]));
                            access.SetAD_Role_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                            access.SetIsReadWrite(true);
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
                            DB.ExecuteQuery(@"UPDATE AD_Process_Access 
                                    SET IsActive='Y',IsReadWrite='Y'
                                    WHERE AD_Process_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"]) + @"
                                    AND AD_Role_ID =" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        /// <summary>
        /// Get all workflow of a window.
        /// </summary>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private void BindWorkflowInRole()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT WF.AD_Workflow_ID,RG.AD_Role_ID, WA.AD_Workflow_ID AS IsWflowExist
                                            FROM AD_Window WD CROSS JOIN AD_Role_Group RG
                                            INNER JOIN AD_TABLE TL ON (WD.AD_Window_ID = TL.AD_Window_ID)
                                            INNER JOIN AD_Workflow WF ON (TL.AD_Table_ID = WF.AD_Table_ID)
                                            LEFT JOIN AD_Workflow_Access WA ON (WA.AD_Workflow_ID=WF.AD_Workflow_ID) AND WA.AD_Role_ID=RG.AD_Role_ID
                                            WHERE WD.AD_Window_ID =" + GetAD_Window_ID() + @" 
                                            AND WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'AND RG.IsActive='Y'
                                            AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsWflowExist"]) == 0)
                        {
                            X_AD_Workflow_Access access = new X_AD_Workflow_Access(GetCtx(), 0, null);
                            access.SetAD_Workflow_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Workflow_ID"]));
                            access.SetAD_Role_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                            access.SetIsReadWrite(true);
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
                            DB.ExecuteQuery(@"UPDATE AD_Workflow_Access 
                                    SET IsActive='Y',IsReadWrite='Y'
                                    WHERE AD_Workflow_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Workflow_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        /// <summary>
        /// Get all Form of a window.
        /// </summary>
        /// Created by Ruby as discuss with Mandeep sir & Mukesh Sir
        private void BindFormInRole()
        {
            try
            {
                DataSet ds = DB.ExecuteDataset(@"SELECT DISTINCT CM.AD_Form_ID,RG.AD_Role_ID,FA.AD_Form_ID AS IsFormExist
                            FROM AD_Field FD CROSS JOIN AD_Role_Group RG
                            INNER JOIN AD_Column CM ON (CM.AD_Column_ID = FD.AD_Column_ID)
                            INNER JOIN AD_Tab TB ON (TB.AD_Tab_ID = FD.AD_Tab_ID)
                            INNER JOIN AD_Table TL ON (TL.AD_Table_ID = TB.AD_Table_ID)
                            LEFT JOIN AD_Form_Access FA ON (FA.AD_Form_ID=CM.AD_Form_ID) AND FA.AD_Role_ID= RG.AD_Role_ID        
                            WHERE TB.AD_window_ID =" + GetAD_Window_ID() + @" 
                            AND CM.AD_Form_ID > 0 AND FD.IsActive='Y' AND RG.IsActive='Y'
                            AND RG.AD_GroupInfo_ID=" + GetAD_GroupInfo_ID() + " ORDER BY RG.AD_Role_ID");
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0, ln = ds.Tables[0].Rows.Count; i < ln; i++)
                    {
                        if (Util.GetValueOfInt(ds.Tables[0].Rows[i]["IsFormExist"]) == 0)
                        {
                            MFormAccess access = new MFormAccess(GetCtx(), 0, null);
                            access.SetAD_Form_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"]));
                            access.SetAD_Role_ID(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                            access.SetIsReadWrite(true);
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
                            DB.ExecuteQuery(@"UPDATE AD_Form_Access 
                                    SET IsActive='Y',IsReadWrite='Y'
                                    WHERE AD_Form_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"]) + @"
                                    AND AD_Role_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}