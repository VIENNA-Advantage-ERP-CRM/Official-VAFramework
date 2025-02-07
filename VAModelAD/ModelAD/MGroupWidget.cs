using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MGroupWidget : X_AD_Group_Widget
    {
        /// <summary>
        /// Standard Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_GroupForm_ID">id</param>
        /// <param name="trxName">transaction</param>
        public MGroupWidget(Ctx ctx, int AD_GroupForm_ID, Trx trxName)
            : base(ctx, AD_GroupForm_ID, trxName)
        {

        }

        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="rs">datarow</param>
        /// <param name="trxName">transaction</param>
        public MGroupWidget(Ctx ctx, DataRow dr, Trx trxName)
            : base(ctx, dr, trxName)
        {

        }
        public MGroupWidget(Ctx ctx, IDataReader idr, Trx trxName)
            : base(ctx, idr, trxName)
        { }


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
            return success;
        }

        protected override bool AfterDelete(bool success)
        {
            UpdateRole(false);
            return success;
        }

        /// <summary>
        /// Add and delete access of widget in role window
        /// </summary>
        /// <param name="isActive"></param>
        /// <returns>True/false</returns>

        private bool UpdateRole(bool isActive)
        {
            if (isActive)
            {
                DB.ExecuteQuery(@"UPDATE AD_Widget_access
                                    SET IsActive      ='Y' 
                                    WHERE AD_Widget_ID=" + GetAD_Widget_ID() + @"
                                    AND AD_Role_ID   IN
                                      ( SELECT AD_Role_ID FROM AD_Role_Group WHERE ad_groupinfo_id=" + GetAD_GroupInfo_ID() + ")");
            }
            else
            {
                DB.ExecuteQuery(@"UPDATE AD_Widget_access
                                    SET IsActive      ='N' 
                                    WHERE AD_Widget_ID=" + GetAD_Widget_ID() + @"
                                    AND AD_Role_ID   IN
                                      ( SELECT AD_Role_ID FROM AD_Role_Group WHERE ad_groupinfo_id=" + GetAD_GroupInfo_ID() + ")");
            }
            return true;
        }

        /// <summary>
        /// Add Widget in Role
        /// </summary>
        private void InsertNewRecordInRole()
        {
            DataSet ds = DB.ExecuteDataset("SELECT AD_Role_ID FROM AD_Role_Group WHERE ad_groupinfo_id=" + GetAD_GroupInfo_ID());
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    MWidgetAccess access = new MWidgetAccess(GetCtx(), 0, null);
                    access.SetAD_Widget_ID(GetAD_Widget_ID());
                    access.SetAD_Role_ID(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Role_ID"]));
                    access.Save();
                }
            }
        }
    }
}