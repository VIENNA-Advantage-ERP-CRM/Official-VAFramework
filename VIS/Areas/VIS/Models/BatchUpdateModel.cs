using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Web;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.ModelAD;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class BatchUpdateModel
    {
        public string ExcuteBatchUpdate(Ctx ctx, UpdateList updateList)
        {
            string tableName = MTable.GetTableName(ctx, updateList.AD_Table_ID);

            DataSet getInstalledModule = DB.ExecuteDataset("SELECT Distinct namespace FROM AD_ModuleInfo WHERE ISACTIVE='Y'");
            string mClassName = "";
            if (tableName.Split('_')[0].Length > 2)
            {
                mClassName = "M" + tableName.Replace("_", "");
            }
            else
            {
                mClassName = "M" + tableName.Split('_')[1];
            }


            Assembly[] foo = AppDomain.CurrentDomain.GetAssemblies();
            bool classExists = false;
            foreach (Assembly a in foo)
            {
                for (int i = 0; i < getInstalledModule.Tables[0].Rows.Count; i++)
                {
                    try
                    {
                        classExists = a.GetTypes().Any(type => type.Namespace == Util.GetValueOfString(getInstalledModule.Tables[0].Rows[i]["namespace"]) + ".Model" && type.Name == mClassName);

                        if (classExists)
                        {
                            break;
                        }
                    }catch(Exception ex)
                    {

                    }
                }

                if (classExists)
                {
                    break;
                }

            }

            if (classExists)
            {
                return "BatchUpdateNotAllow";
            }

            string sql = "UPDATE " + tableName + " SET ";

            if (updateList.setValue == null || updateList.setValue.Count == 0)
            {
                return "";
            }

            for (int i = 0; i < updateList.setValue.Count; i++)
            {
                sql += updateList.setValue[i].column + "= '" + updateList.setValue[i].setValue + "'";
                if ((i + 1) != updateList.setValue.Count)
                {
                    sql += ", ";
                }
            }

            bool hasWhere = false;
            if (updateList.whereExtended != null)
            {
                sql += " WHERE " + updateList.whereExtended;
                hasWhere = true;
            }

            if (updateList.whereCondition !=null && updateList.whereCondition.Count > 0)
            {
                if (hasWhere)
                {
                    sql += " AND (";
                }
                else
                {
                    sql += " WHERE (";
                }
                for (int j = 0; j < updateList.whereCondition.Count; j++)
                {
                    if (j != 0)
                    {
                        sql += updateList.whereCondition[j].andOr + " ";
                    }

                    if (updateList.whereCondition[j].opValue.Trim() == "BETWEEN")
                    {
                        sql += updateList.whereCondition[j].column + " BETWEEN '" + updateList.whereCondition[j].qryval + "' AND '" + updateList.whereCondition[j].qryval2 + "' ";
                    }
                    else
                    {
                        sql += updateList.whereCondition[j].column + " " + updateList.whereCondition[j].opValue + " '" + updateList.whereCondition[j].qryval + "' ";
                    }
                }

                sql += ")";
            }

            if (updateList.orgList.Count > 0)
            {
                if (sql.IndexOf("WHERE") == -1) {
                    sql += " WHERE AD_ORG_ID IN (";
                }
                else
                {
                    sql += " AND AD_ORG_ID IN (";
                }
                
                for (int k = 0; k < updateList.orgList.Count; k++)
                {
                    sql += updateList.orgList[k].orgID;
                    if ((k + 1) != updateList.orgList.Count)
                    {
                        sql += ",";
                    }
                }
                sql += ")";
            }


            int count = Util.GetValueOfInt(DB.ExecuteQuery(sql));

            MDirectQueryLog DQL = new MDirectQueryLog(ctx, 0, null);
            DQL.SetSqlQuery(sql);
            DQL.SetRecordCount(count);
            DQL.SetAD_Role_ID(ctx.GetAD_Role_ID());
            DQL.SetAD_Table_ID(updateList.AD_Table_ID);
            DQL.SetAD_Session_ID(ctx.GetAD_Session_ID());
            DQL.Save();

            return Util.GetValueOfString(count) + " Records Updated";
        }
    }

    public class UpdateList
    {
        public int AD_Table_ID { get; set; }
        public string whereExtended { get; set; }
        public List<SetValue> setValue { get; set; }
        public List<WhereCondition> whereCondition { get; set; }
        public List<OrgList> orgList { get; set; }
    }

    public class SetValue
    {
        public string column { get; set; }
        public string setValue { get; set; }
    }

    public class WhereCondition
    {
        public string andOr { get; set; }
        public string opValue { get; set; }
        public string column { get; set; }
        public string qryval { get; set; }
        public string qryval2 { get; set; }
    }

    public class OrgList
    {
        public int orgID { get; set; }
    }
}