using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Web;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.ModelAD;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class BatchUpdateModel
    {
        /// <summary>
        /// Excute Direct Update
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="updateList"></param>
        /// <returns></returns>
        public string ExcuteBatchUpdate(Ctx ctx, UpdateList updateList)
        {
            int count = 0;
            string failedIds = " Failed Ids : ";
            string PassedIds = "For Record Ids : ";
            string msg = "";
            string values = " Updated Columns and values are:- ";
            string tableName = MTable.GetTableName(ctx, updateList.AD_Table_ID);
            for (int j = 0; j < updateList.recordIds.Length; j++)
            {
                PO prntObj = MTable.GetPO(ctx, tableName, updateList.recordIds[j], null);
                for (int i = 0; i < updateList.setValue.Count(); i++)
                {
                    if (updateList.setValue[i].setValue!=null && DisplayType.IsDate(updateList.setValue[i].setType))
                    {
                        prntObj.Set_ValueNoCheck(updateList.setValue[i].column, Util.GetValueOfDateTime(updateList.setValue[i].setValue));
                    }
                    else if (updateList.setValue[i].setType == DisplayType.Integer || DisplayType.IsID(updateList.setValue[i].setType))
                    {
                        prntObj.Set_ValueNoCheck(updateList.setValue[i].column, Util.GetValueOfInt(updateList.setValue[i].setValue));
                    }
                    else if (DisplayType.IsNumeric(updateList.setValue[i].setType))
                    {
                        prntObj.Set_ValueNoCheck(updateList.setValue[i].column, Util.GetValueOfDecimal(updateList.setValue[i].setValue));
                    }
                    else
                    {
                        prntObj.Set_ValueNoCheck(updateList.setValue[i].column, updateList.setValue[i].setValue);
                    }
                    if (j == 0)
                    {
                        values += Util.GetValueOfString(updateList.setValue[i].column) + " : " + Util.GetValueOfString(updateList.setValue[i].setValue) + ", ";
                    }
                }
                if (prntObj.Save())
                {
                    count++;
                    PassedIds += Util.GetValueOfString(updateList.recordIds[j]) + ", ";
                }
                else
                {
                    failedIds += Util.GetValueOfString(updateList.recordIds[j]) + ", ";
                }
            }
            if (values.Length > 0 && values.EndsWith(", "))
            {
                values = values.Substring(0, values.Length - 2);
            }
            msg += PassedIds + values;

            if (failedIds.EndsWith(", "))
            {
                failedIds = failedIds.Substring(0, failedIds.Length - 2);
                msg += failedIds;
                return Util.GetValueOfString(count) + Msg.GetMsg(ctx, "RecordUpdated") + Util.GetValueOfString(updateList.recordIds.Length);
            }

            MDirectQueryLog DQL = new MDirectQueryLog(ctx, 0, null);
            DQL.SetSqlQuery(msg);
            DQL.SetRecordCount(count);
            DQL.SetAD_Role_ID(ctx.GetAD_Role_ID());
            DQL.SetAD_Table_ID(updateList.AD_Table_ID);
            DQL.SetAD_Session_ID(ctx.GetAD_Session_ID());
            DQL.Save();
            return "OK";
        }
    }

    public class UpdateList
    {
        public int AD_Table_ID { get; set; }
        public List<SetValue> setValue { get; set; }
        public int[] recordIds { get; set; }
    }

    public class SetValue
    {
        public string column { get; set; }
        public object setValue { get; set; }
        public int setType { get; set; }
    }
}