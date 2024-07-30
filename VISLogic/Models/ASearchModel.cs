using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.Classes;
using VAdvantage.Controller;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class ASearchModel
    {
        // Added by Bharat on 05 June 2017
        public List<Dictionary<string, object>> GetData(string valueColumnName, int AD_Tab_ID, int AD_Table_ID, Ctx ctx)
        {
            List<Dictionary<string, object>> retDic = null;
            string sql = "SELECT Name," + valueColumnName + ", AD_UserQuery_ID FROM AD_UserQuery WHERE"
                + " AD_Client_ID=" + ctx.GetAD_Client_ID() + " AND IsActive='Y'"
                + " AND (AD_Tab_ID=" + AD_Tab_ID + " OR AD_Table_ID=" + AD_Table_ID + ")"
                + " ORDER BY Upper(Name), AD_UserQuery_ID";

            DataSet ds = DB.ExecuteDataset(sql, null, null);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                retDic = new List<Dictionary<string,object>>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    Dictionary<string, object> obj = new Dictionary<string, object>();
                    obj["Name"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]);
                    obj[valueColumnName] = Util.GetValueOfString(ds.Tables[0].Rows[i][valueColumnName]);
                    obj["AD_UserQuery_ID"] = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_UserQuery_ID"]);
                    retDic.Add(obj);
                }
            }
            return retDic;
        }

        // Added by Bharat on 05 June 2017
        public List<Dictionary<string, object>> GetQueryLines(int AD_UserQuery_ID, Ctx ctx, bool isFilter)
        {
            List<Dictionary<string, object>> retDic = null;
            string sql = "SELECT KEYNAME, KEYVALUE, OPERATOR AS OPERATORNAME,VALUE1NAME," +
                "VALUE1VALUE, VALUE2NAME, VALUE2VALUE, AD_USERQUERYLINE_ID, Isfullday,AD_TAB_ID FROM AD_UserQueryLine WHERE AD_UserQuery_ID=" +
                AD_UserQuery_ID + " ORDER BY SeqNo";

            DataSet ds = DB.ExecuteDataset(sql, null, null);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                retDic = new List<Dictionary<string, object>>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    Dictionary<string, object> obj = new Dictionary<string, object>();
                    obj["KEYNAME"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["KEYNAME"]);
                    obj["KEYVALUE"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["KEYVALUE"]);
                    obj["OPERATORNAME"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["OPERATORNAME"]);
                    obj["VALUE1NAME"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["VALUE1NAME"]);
                    obj["VALUE1VALUE"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["VALUE1VALUE"]);
                    obj["VALUE2NAME"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["VALUE2NAME"]);
                    obj["VALUE2VALUE"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["VALUE2VALUE"]);
                    obj["AD_USERQUERYLINE_ID"] = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_USERQUERYLINE_ID"]);
                    obj["FULLDAY"] = Util.GetValueOfString(ds.Tables[0].Rows[i]["ISFULLDAY"]);
                    obj["AD_TAB_ID"] = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_TAB_ID"]);
                    retDic.Add(obj);
                }
            }
            return retDic;
        }

        /// <summary>
        /// Getting Data from advance filter table to show filters on landing page
        /// </summary>
        /// <param name="AD_Tab_ID">AD_Tab_ID</param>
        /// <param name="AD_Table_ID">AD_Tab_ID</param>
        /// <param name="ctx">Context</param>
        /// <returns>AD_UserQuery List</returns>
        public List<UserQuery> GetUserQuery(int AD_Tab_ID, int AD_Table_ID, Ctx ctx)
        {
            List<CardViewDetail> cardList = GetCardView(AD_Tab_ID, ctx);
            List<UserQuery> list = null;
            string sql = $@"SELECT AD_UserQuery_ID,Name,IsShowOnLandingPage,TargetView,AD_CardView_ID FROM AD_UserQuery WHERE 
                AD_Client_ID = { ctx.GetAD_Client_ID() } AND IsActive='Y' 
                AND (AD_Tab_ID={ AD_Tab_ID } OR AD_Table_ID= { AD_Table_ID }) 
                ORDER BY Upper(Name), AD_UserQuery_ID";
            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_UserQuery", true, true);
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables.Count > 0)
            {
                var row = ds.Tables[0].Rows;
                list = new List<UserQuery>();
                for (int i = 0; i < row.Count; i++)
                {
                    UserQuery obj = new UserQuery()
                    {
                        name = Util.GetValueOfString(row[i]["Name"]),
                        isShowOnLandingPage = Util.GetValueOfString(row[i]["IsShowOnLandingPage"]),
                        targetView = Util.GetValueOfString(row[i]["TargetView"]),
                        AD_CardView_ID = Util.GetValueOfString(row[i]["AD_CardView_ID"]),
                        AD_UserQuery_ID = Util.GetValueOfString(row[i]["AD_UserQuery_ID"])
                    };
                    if (cardList != null && cardList.Count > 0)
                    {
                        obj.cardViewList = cardList;
                    }
                    list.Add(obj);
                }
            }
            return list;
        }


        /// <summary>
        /// Getting card view binded with window
        /// </summary>
        /// <param name="AD_Tab_ID">AD_Tab_ID</param>
        /// <param name="ctx">context</param>
        /// <returns>CardView data</returns>
        public List<CardViewDetail> GetCardView(int AD_Tab_ID,Ctx ctx) {
            List<CardViewDetail> List = new List<CardViewDetail>();
            string sql = @"SELECT Name,Ad_CardView_ID FROM AD_CardView WHERE AD_TAB_ID = "+ AD_Tab_ID;
            //sql= MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_CardView", true, true);
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables.Count > 0)
            {
                var row = ds.Tables[0].Rows;
                for (int i = 0; i < row.Count; i++)
                {
                    CardViewDetail obj = new CardViewDetail()
                    {
                        Name = Util.GetValueOfString(row[i]["Name"]),
                        AD_CardView_ID = Util.GetValueOfInt(row[i]["Ad_CardView_ID"])
                    };
                    List.Add(obj);
                }
            }            
            return List;
        }


        /// <summary>
        /// Update advance filter data
        /// </summary>
        /// <param name="userQueryList">new AD_UserQuery data</param>
        /// <param name="ctx">context</param>
        /// <returns>update/notupdated</returns>
        public string UpdateUserQuery(List<UserQuery> userQueryList, Ctx ctx) {
            int count = 0;
            if (userQueryList.Count > 0)
            {
                for (int i = 0; i < userQueryList.Count; i++)
                {
                    MUserQuery obj = new MUserQuery(ctx, Util.GetValueOfInt(userQueryList[i].AD_UserQuery_ID), null);
                    obj.Set_Value("IsShowOnLandingPage", userQueryList[i].isShowOnLandingPage);
                    obj.Set_Value("TargetView", userQueryList[i].targetView);
                    obj.Set_Value("AD_CardView_ID", userQueryList[i].AD_CardView_ID);
                    if (obj.Save())
                    {
                        count++;
                    }
                }
                if (count > 0) {
                    return "  "+ Util.GetValueOfString(count) + Msg.GetMsg(ctx, "RecordUpdated") + Util.GetValueOfString(userQueryList.Count) ;
                }
            }
            return Msg.GetMsg(ctx, "RecordsNotSaved");
        }

        // Added by Bharat on 05 June 2017
        public int GetQueryDefault(int AD_UserQuery_ID, Ctx ctx)
        {
            string sql = "SELECT Count(*) FROM AD_DefaultUserQuery WHERE AD_UserQuery_ID=" + AD_UserQuery_ID + " AND AD_User_ID!=" + ctx.GetAD_User_ID();
            int count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            return count;
        }

        // Added by Bharat on 05 June 2017
        public int GetNoOfRecrds(string sqlWhere, Ctx ctx)

        {
            int count = Util.GetValueOfInt(DB.ExecuteScalar(sqlWhere));

            return count;
        }
    }

    public class UserQuery
    {
        public string AD_CardView_ID { get; set; }
        public string AD_UserQuery_ID { get; set; }
        public string isShowOnLandingPage { get; set; }
        public string name { get; set; }
        public string targetView { get; set; }
        public List<CardViewDetail> cardViewList { get; set; } // New property

    }

    public class CardViewDetail { 
        public int AD_CardView_ID { get; set; }

        public string Name { get; set; }

    }

   /* public class UserQueryList
    {
        public List<UserQuery> UserQueryList { get; set; } = new List<UserQuery>()*//**//*
    }
*/

}