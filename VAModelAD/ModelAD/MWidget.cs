using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MWidget : X_AD_Widget
    {
        public MWidget(Ctx ctx, DataRow rs, Trx trxName)
          : base(ctx, rs, trxName)
        {
        }

        public MWidget(Ctx ctx, int AD_Widget_ID, Trx trxName)
           : base(ctx, AD_Widget_ID, trxName)
        {

        }

        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (newRecord)	//	Add to all automatic roles
            {
                MRole[] roles = MRole.GetOf(GetCtx(), "IsManual='N'");
                for (int i = 0; i < roles.Length; i++)
                {
                    MWidgetAccess wa = new MWidgetAccess(this, roles[i].GetAD_Role_ID());
                    wa.Save();
                }
            }

            //Check single window on widget for apply datasource.
            string oldWidgetID = Util.GetValueOfString(Get_ValueOld("AD_Window_ID"));
            if (!newRecord && oldWidgetID != GetAD_Window_ID())
            {
                bool IsSingleWindow = !string.IsNullOrEmpty(GetAD_Window_ID()) && !GetAD_Window_ID().Contains(',');
                string sql = "SELECT AD_WidgetField_ID FROM AD_WidgetField WHERE AD_Widget_ID = " + GetAD_Widget_ID();
                sql = MRole.GetDefault(GetCtx()).AddAccessSQL(sql, "AD_WidgetField", true, true);
                DataSet ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        MWidgetField obj = new MWidgetField(GetCtx(), Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_WidgetField_ID"]), Get_TrxName());

                        if (IsSingleWindow)
                        {
                            obj.SetIsApplyDataSource(true);
                        }
                        else
                        {
                            obj.SetIsApplyDataSource(false);
                        }
                        obj.SetAD_Field_ID(0);
                        obj.SetAD_Tab_ID(0);
                        obj.SetWhereClause("");
                        obj.Save();
                    }

                }

            }
            return true;
        }

    }
}