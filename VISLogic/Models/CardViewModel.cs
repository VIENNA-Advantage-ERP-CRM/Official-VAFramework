using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Dynamic;
using VAdvantage.Common;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Classes;
using VIS.Helpers;

namespace VIS.Models
{
    public class CardViewModel
    {
        /// <summary>
        /// Get Card View
        /// </summary>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<CardViewPropeties> GetCardView(int ad_Window_ID, int ad_Tab_ID, Ctx ctx)
        {            

                List<CardViewPropeties> lstCardView = null;
            //string sqlQuery = "SELECT * FROM AD_CardView WHERE AD_Window_id=" + ad_Window_ID + " and AD_Tab_id=" + ad_Tab_ID + " AND (createdby=" + ctx.GetAD_User_ID() + " OR AD_USER_ID Is NULL OR AD_User_ID = " + ctx.GetAD_User_ID() + ") AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            //string sqlQuery = " SELECT * FROM AD_CardView c WHERE c.AD_Window_id=" + ad_Window_ID + " and c.AD_Tab_id=" + ad_Tab_ID + " AND (c.createdby=" + ctx.GetAD_User_ID() +
            //                  " OR ((c.AD_USER_ID    IS NULL) AND exists (select * from ad_cardview_role r where r.ad_cardview_id = c.ad_cardview_id and r.ad_role_id = " + ctx.GetAD_Role_ID() + ")) OR c.AD_User_ID     = " + ctx.GetAD_User_ID() +
            //                  " ) AND c.AD_Client_ID  =" + ctx.GetAD_Client_ID();

            //   string sqlQuery = " SELECT * FROM AD_CardView c WHERE c.AD_Window_id=" + ad_Window_ID + " and c.AD_Tab_id=" + ad_Tab_ID + " AND c.AD_Client_ID  =" + ctx.GetAD_Client_ID();

            string sqlQuery = @"SELECT CV.*,DCV.AD_DefaultCardView_ID,DCV.AD_User_ID AS userID,AU.Name AS CreatedName
                            FROM AD_CardView CV
                            INNER JOIN AD_User AU ON CV.createdBy=AU.AD_User_ID
                            LEFT OUTER JOIN AD_DefaultCardView DCV
                            ON (CV.AD_CardView_ID=DCV.AD_CardView_ID AND  DCV.ad_user_id = " + ctx.GetAD_User_ID() + @")
                            WHERE CV.IsActive='Y' AND  CV.AD_Window_id=" + ad_Window_ID + " AND CV.AD_Tab_id=" + ad_Tab_ID + " AND (CV.AD_User_ID IS NULL OR CV.AD_User_ID  =" + ctx.GetAD_User_ID() + @" 
                            ) ORDER BY CV.Name ASC";

            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_CardView", true, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstCardView = new List<CardViewPropeties>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    bool isDefault = false;
                    if (ds.Tables[0].Rows[i]["AD_DefaultCardView_ID"] != null && ds.Tables[0].Rows[i]["AD_DefaultCardView_ID"] != DBNull.Value
                       && ds.Tables[0].Rows[i]["userID"] != null && ds.Tables[0].Rows[i]["userID"] != DBNull.Value
                       && ctx.GetAD_User_ID() == Util.GetValueOfInt(ds.Tables[0].Rows[i]["userID"]))
                    {
                        isDefault = true;
                    }

                    bool isEditable = true;

                    if (!String.IsNullOrEmpty(Convert.ToString(ds.Tables[0].Rows[i]["Export_ID"])) && Common.transportEnvironment != "Y")
                    {
                        isEditable = false;
                    }


                    CardViewPropeties objCardView = new CardViewPropeties()
                    {
                        CardViewName = Convert.ToString(ds.Tables[0].Rows[i]["NAME"]),
                        CardViewID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_CardView_ID"]),
                        UserID = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_USER_ID"]),
                        AD_GroupField_ID = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_FIELD_ID"]),
                        CreatedBy = Convert.ToInt32(ds.Tables[0].Rows[i]["CREATEDBY"]),
                        CreatedName = Convert.ToString(ds.Tables[0].Rows[i]["CreatedName"]),
                        AD_HeaderLayout_ID = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_HEADERLAYOUT_ID"]),
                        groupSequence = Convert.ToString(ds.Tables[0].Rows[i]["GROUPSEQUENCE"]),
                        excludedGroup = Convert.ToString(ds.Tables[0].Rows[i]["EXCLUDEDGROUP"]),
                        OrderByClause = Convert.ToString(ds.Tables[0].Rows[i]["ORDERBYCLAUSE"]),
                        disableWindowPageSize = Convert.ToString(ds.Tables[0].Rows[i]["DISABLEWINDOWPAGESIZE"]) == "Y",
                        //IsDefault = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i]["ISDEFAULT"])=="Y"?true:false,
                        DefaultID = isDefault,
                        Updated = Convert.ToDateTime(ds.Tables[0].Rows[i]["UPDATED"]),
                        IsEditable= isEditable
                    };
                    lstCardView.Add(objCardView);
                }
            }
            return lstCardView;
        }
        /// <summary>
        /// Get Card view Role
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<RolePropeties> GetCardViewRole(int ad_CardView_ID, Ctx ctx)
        {
            List<RolePropeties> lstCardViewRole = null;
            RolePropeties objCardView = null;
            string sqlQuery = "SELECT AD_ROLE_ID,AD_CardView_ID from AD_CARDVIEW_ROLE WHERE AD_CardView_id=" + ad_CardView_ID + " AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            //  string sqlQuery = "SELECT * FROM AD_CardView WHERE AD_Window_id=" + ad_Window_ID + " and AD_Tab_id=" + ad_Tab_ID + " AND (AD_USER_ID=" + ctx.GetAD_User_ID() + " OR AD_USER_ID Is NULL )" ;
            // sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_CardView", false, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstCardViewRole = new List<RolePropeties>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    objCardView = new RolePropeties()
                    {
                        AD_Role_ID = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Role_ID"]),
                        AD_CardView_ID = VAdvantage.Utility.Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_CardView_ID"])
                    };
                    lstCardViewRole.Add(objCardView);
                }
            }
            return lstCardViewRole;
        }

        /// <summary>
        /// Card View Condition
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<CardViewConditionPropeties> GetCardViewCondition(int ad_CardView_ID, Ctx ctx)
        {
            List<CardViewConditionPropeties> lstCardViewRole = null;
            CardViewConditionPropeties objCardView = null;
            string sqlQuery = "SELECT * FROM AD_CARDVIEW_Condition WHERE AD_CardView_id=" + ad_CardView_ID + " ORDER BY AD_CARDVIEW_Condition_ID";
            //  string sqlQuery = "SELECT * FROM AD_CardView WHERE AD_Window_id=" + ad_Window_ID + " and AD_Tab_id=" + ad_Tab_ID + " AND (AD_USER_ID=" + ctx.GetAD_User_ID() + " OR AD_USER_ID Is NULL )" ;
            // sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_CardView", false, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstCardViewRole = new List<CardViewConditionPropeties>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    objCardView = new CardViewConditionPropeties()
                    {
                        Color = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i]["Color"]),
                        ConditionValue = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i]["ConditionValue"]),
                        ConditionText = VAdvantage.Utility.Util.GetValueOfString(ds.Tables[0].Rows[i]["ConditionText"]),
                    };
                    lstCardViewRole.Add(objCardView);
                }
            }
            return lstCardViewRole;
        }

        /// <summary>
        /// Get All User
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<UserPropeties> GetAllUsers(Ctx ctx)
        {
            List<UserPropeties> lstUser = null;
            string sqlQuery = "SELECT * FROM AD_User WHERE ISACTIVE='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            //   sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_User", false, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstUser = new List<UserPropeties>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    UserPropeties objCardView = new UserPropeties()
                    {
                        UserName = Convert.ToString(ds.Tables[0].Rows[i]["NAME"]),
                        AD_User_ID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_User_ID"])
                    };
                    lstUser.Add(objCardView);
                }
            }
            return lstUser;
        }
       /// <summary>
       /// Get All Roles
       /// </summary>
       /// <param name="ctx"></param>
       /// <returns></returns>
        public List<RolePropeties> GetAllRoles(Ctx ctx)
        {
            List<RolePropeties> lstRole = null;

            string sqlQuery = "SELECT  r.AD_Role_ID,  r.Name  FROM AD_User u INNER JOIN AD_User_Roles ur ON (u.AD_User_ID=ur.AD_User_ID AND ur.IsActive ='Y') " +
                        " INNER JOIN AD_Role r ON (ur.AD_Role_ID =r.AD_Role_ID AND r.IsActive ='Y') WHERE u.AD_User_ID = " + ctx.GetAD_User_ID() + " AND u.IsActive ='Y' AND EXISTS " +
                        " (SELECT * FROM AD_Client c WHERE u.AD_Client_ID=c.AD_Client_ID AND c.IsActive      ='Y' ) " +
                        " AND EXISTS (SELECT * FROM AD_Client c WHERE r.AD_Client_ID=c.AD_Client_ID AND c.IsActive      ='Y' )";

            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                lstRole = new List<RolePropeties>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    RolePropeties objCardView = new RolePropeties()
                    {
                        RoleName = Convert.ToString(ds.Tables[0].Rows[i]["NAME"]),
                        AD_Role_ID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Role_ID"])
                    };
                    lstRole.Add(objCardView);
                }
            }
            return lstRole;
        }

        /// <summary>
        /// Get Card view Column
        /// </summary>
        /// <param name="ad_cardview_id"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<CardViewPropeties> GetCardViewColumns(int ad_cardview_id, Ctx ctx)
        {
            int uid = 0;
            int fid = 0;
            string sortOrder = "";
            List<CardViewPropeties> lstCardViewColumns = new List<CardViewPropeties>();
            string sqlQuery1 = "SELECT AD_User_ID,AD_Field_ID, orderByClause  FROM AD_CardView WHERE ad_cardview_id=" + ad_cardview_id;
            DataSet ds1 = DB.ExecuteDataset(sqlQuery1);
            if (ds1 != null && ds1.Tables.Count > 0 && ds1.Tables[0].Rows.Count > 0)
            {
                uid = VAdvantage.Utility.Util.GetValueOfInt(ds1.Tables[0].Rows[0][0]);
                fid = VAdvantage.Utility.Util.GetValueOfInt(ds1.Tables[0].Rows[0][1]);
                sortOrder = VAdvantage.Utility.Util.GetValueOfString(ds1.Tables[0].Rows[0][2]);
            }
            string sqlQuery = "SELECT * FROM(SELECT crdcol.*,fl.name FROM ad_cardview_column crdcol INNER JOIN ad_field fl on crdcol.ad_field_id=fl.ad_field_id  WHERE ad_cardview_id=" + ad_cardview_id + ") cardviewcols";
            //  sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "cardviewcols", false, false);
            sqlQuery += " ORDER BY seqno";
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    CardViewPropeties objCardView = new CardViewPropeties()
                    {
                        FieldName = Convert.ToString(ds.Tables[0].Rows[i]["NAME"]),
                        AD_Field_ID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_FIELD_ID"]),
                        AD_GroupField_ID = fid,
                        sort = Util.GetValueOfInt(ds.Tables[0].Rows[i]["SORTNO"]),
                        SeqNo = Util.GetValueOfInt(ds.Tables[0].Rows[i]["SeqNo"]),
                        UserID = uid,
                        OrderByClause = sortOrder

                    };
                    lstCardViewColumns.Add(objCardView);
                }
            }
            else
            {
                CardViewPropeties objCardView = new CardViewPropeties()
                {
                    FieldName = "",
                    AD_Field_ID = 0,
                    AD_GroupField_ID = fid,
                    UserID = uid
                };
                lstCardViewColumns.Add(objCardView);
            }
            return lstCardViewColumns;
        }
        /// <summary>
        /// Save Card View Record
        /// </summary>
        /// <param name="cardViewName"></param>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <param name="ad_User_ID"></param>
        /// <param name="ad_Field_ID"></param>
        /// <param name="ctx"></param>
        /// <param name="cardViewID"></param>
        /// <param name="lstCVCondition"></param>
        /// <param name="AD_HeaderLayout_ID"></param>
        /// <param name="isPublic"></param>
        /// <param name="groupSequence"></param>
        /// <param name="excludeGrp"></param>
        /// <param name="orderByClause"></param>
        /// <returns></returns>
        public int SaveCardViewRecord(string cardViewName, int ad_Window_ID, int ad_Tab_ID, int ad_User_ID, int ad_Field_ID, Ctx ctx, int cardViewID/*, List<RolePropeties> lstRoleId*/, List<CardViewConditionPropeties> lstCVCondition, int AD_HeaderLayout_ID, bool isPublic, string groupSequence, string excludeGrp, string orderByClause)
        {
            string conditionValue = string.Empty;
            string conditionText = string.Empty;
            bool isupdate = false;
            MCardView objCardView = null;
            if (cardViewID <= 0)
            {
                objCardView = new MCardView(ctx, 0, null);

            }
            else
            {
                objCardView = new MCardView(ctx, cardViewID, null);
                isupdate = true;

                int headerID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT ad_headerlayout_id FROM ad_cardview WHERE ad_cardview_id=" + cardViewID, null, null));
                if (headerID != AD_HeaderLayout_ID)
                {
                    string sql = "DELETE FROM AD_GridLayoutItems WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + headerID + "))";
                    DB.ExecuteQuery(sql, null, null);
                    DB.ExecuteQuery("DELETE FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + headerID, null, null);
                    DB.ExecuteQuery("DELETE FROM AD_HeaderLayout WHERE AD_HeaderLayout_ID=" + headerID, null, null);
                }

            }
            objCardView.SetAD_Window_ID(ad_Window_ID);
            objCardView.SetAD_Tab_ID(ad_Tab_ID);
            if (isPublic)
            {
                objCardView.SetAD_User_ID(0);
            }
            else
            {
                objCardView.SetAD_User_ID(ad_User_ID);
            }
            objCardView.SetAD_Field_ID(ad_Field_ID);
            objCardView.SetName(cardViewName);
            if (AD_HeaderLayout_ID > 0)
            {
                objCardView.Set_ValueNoCheck("AD_HeaderLayout_ID", AD_HeaderLayout_ID);
            }
            else
            {
                objCardView.Set_ValueNoCheck("AD_HeaderLayout_ID", null);
            }
            objCardView.Set_ValueNoCheck("groupSequence", groupSequence);
            objCardView.Set_ValueNoCheck("excludedGroup", excludeGrp);
            objCardView.Set_Value("OrderByClause", orderByClause);
            if (!objCardView.Save())
            {
            }
            if (isupdate)
            {
                //DeleteAllCardViewRole(objCardView.Get_ID(), ctx);
                DeleteAllCardViewCondition(objCardView.Get_ID(), ctx);
            }
            //if (lstRoleId != null && lstRoleId.Count > 0)
            //{
            //    for (int i = 0; i < lstRoleId.Count; i++)
            //    {
            //        MCardViewRole objMCVR = new MCardViewRole(ctx, 0, null);
            //        objMCVR.SetAD_CardView_ID(objCardView.Get_ID());
            //        objMCVR.SetAD_Role_ID(lstRoleId[i].AD_Role_ID);
            //        if (!objMCVR.Save())
            //        {
            //        }
            //    }
            //}

            if (lstCVCondition != null && lstCVCondition.Count > 0)
            {
                for (int i = 0; i < lstCVCondition.Count; i++)
                {
                    if (lstCVCondition[i].ConditionValue != null && lstCVCondition[i].ConditionText != null)
                    {
                        conditionValue = lstCVCondition[i].ConditionValue.Trim();
                        conditionText = lstCVCondition[i].ConditionText.Trim();
                        MCardViewCondition objMCVR = new MCardViewCondition(ctx, 0, null);
                        objMCVR.Set_ValueNoCheck("AD_CardView_ID", objCardView.Get_ID());
                        objMCVR.SetColor(lstCVCondition[i].Color);
                        objMCVR.SetConditionValue(conditionValue.Trim());
                        objMCVR.SetConditionText(conditionText.Trim());
                        if (!objMCVR.Save())
                        {
                        }
                    }
                }
            }
            return objCardView.Get_ID();
        }
     
        /// <summary>
      /// Set Default card view
      /// </summary>
      /// <param name="ctx"></param>
      /// <param name="cardViewID"></param>
      /// <param name="AD_Tab_ID"></param>
        public void SetDefaultCardView(Ctx ctx, int cardViewID, int AD_Tab_ID)
        {
            string sql = "SELECT AD_DefaultCardView_ID FROM AD_DefaultCardView WHERE AD_Tab_ID=" + AD_Tab_ID + " AND AD_User_ID=" + ctx.GetAD_User_ID();
            object id = DB.ExecuteScalar(sql);

            int AD_DefaultCardView_ID = 0;
            if (id != null && id != DBNull.Value)
            {
                AD_DefaultCardView_ID = Convert.ToInt32(id);
            }

            X_AD_DefaultCardView cardView = new X_AD_DefaultCardView(ctx, AD_DefaultCardView_ID, null);
            cardView.SetAD_Tab_ID(AD_Tab_ID);
            cardView.SetAD_User_ID(ctx.GetAD_User_ID());
            cardView.SetAD_CardView_ID(Convert.ToInt32(cardViewID));
            cardView.Save();
        }

        /// <summary>
        /// Save Card view Columns
        /// </summary>
        /// <param name="ad_cardview_id"></param>
        /// <param name="ad_Field_ID"></param>
        /// <param name="sqNo"></param>
        /// <param name="ctx"></param>
        /// <param name="sort"></param>
        public void SaveCardViewColumns(int ad_cardview_id, int ad_Field_ID, int sqNo, Ctx ctx, int sort)
        {
            int CardViewColumnID = 0;
            if (Common.transportEnvironment == "Y")
            {
                CardViewColumnID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Cardview_Column_ID FROM AD_Cardview_Column WHERE AD_CardView_ID=" + ad_cardview_id + " AND AD_Field_ID=" + ad_Field_ID));
            }
            MCardViewColumn objCardViewColumn = new MCardViewColumn(ctx, CardViewColumnID, null);
            objCardViewColumn.SetAD_CardView_ID(ad_cardview_id);
            objCardViewColumn.SetAD_Field_ID(ad_Field_ID);
            objCardViewColumn.SetSeqNo(sqNo);
            objCardViewColumn.Set_Value("SortNo", sort);
            if (!objCardViewColumn.Save())
            {
            }
        }

        /// <summary>
        /// Delete Card view
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteCardView(int ad_CardView_ID, Ctx ctx)
        {
            int headerID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT ad_headerlayout_id FROM ad_cardview WHERE ad_cardview_id=" + ad_CardView_ID, null, null));
            string sql = "DELETE FROM AD_GridLayoutItems WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + headerID + "))";
            DB.ExecuteQuery(sql, null, null);
            DB.ExecuteQuery("DELETE FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + headerID, null, null);
            DB.ExecuteQuery("DELETE FROM AD_HeaderLayout WHERE AD_HeaderLayout_ID=" + headerID, null, null);

            string sqlQuery = "DELETE FROM AD_CARDVIEW WHERE AD_CARDVIEW_ID=" + ad_CardView_ID; //+ " AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }

        /// <summary>
        /// Delete All card view columns
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteAllCardViewColumns(int ad_CardView_ID, Ctx ctx)
        {

            string sqlQuery = "DELETE FROM AD_CARDVIEW_COLUMN WHERE Export_ID IS NULL AND AD_CARDVIEW_ID=" + ad_CardView_ID;// AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }

        /// <summary>
        /// Delete card view columns
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        /// <param name="lstCardViewColumns"></param>
        public void DeleteAllCardViewColumns(int ad_CardView_ID, Ctx ctx, List<CardViewPropeties> lstCardViewColumns)
        {
            string fieldID = "";
            if (Common.transportEnvironment == "Y")
            {
                for (int i = 0; i < lstCardViewColumns.Count; i++)
                {
                    if (i > 0)
                    {
                        fieldID += ",";
                    }
                    fieldID += Util.GetValueOfString(lstCardViewColumns[i].AD_Field_ID);
                }

            }

            if (fieldID != "")
            {
                string updt = "UPDATE AD_CARDVIEW_COLUMN SET ISACTIVE='N' WHERE Export_ID IS NOT NULL AND AD_Field_ID NOT IN (" + fieldID + ")";
                DB.ExecuteQuery(updt);
            }

            string sqlQuery = "DELETE FROM AD_CARDVIEW_COLUMN WHERE AD_CARDVIEW_ID=" + ad_CardView_ID;// AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            if (fieldID != "")
            {
                sqlQuery += " AND ISACTIVE='Y' AND AD_Field_ID NOT IN (" + fieldID + ")";
            }
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }

        /// <summary>
        /// Delete All Cardview Role
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteAllCardViewRole(int ad_CardView_ID, Ctx ctx)
        {
            string sqlQuery = "DELETE FROM AD_CARDVIEW_ROLE WHERE AD_CARDVIEW_ID=" + ad_CardView_ID; //+ " AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }
        /// <summary>
        /// Delete All CardViewCondition
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteAllCardViewCondition(int ad_CardView_ID, Ctx ctx)
        {
            string sqlQuery = "DELETE FROM AD_CARDVIEW_CONDITION WHERE AD_CARDVIEW_ID=" + ad_CardView_ID;// + " AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }
        /// <summary>
        ///  Delete default card
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteDefaultCardView(int ad_CardView_ID, Ctx ctx)
        {
            string sqlQuery = "DELETE FROM AD_DefaultCardView WHERE AD_CARDVIEW_ID=" + ad_CardView_ID;// + " AND AD_Client_ID=" + ctx.GetAD_Client_ID();
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }

        /// <summary>
        /// Delete Cardview Columns
        /// </summary>
        /// <param name="ad_CardViewColumn_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteCardViewColumns(int ad_CardViewColumn_ID, Ctx ctx)
        {
            string sqlQuery = "DELETE FROM AD_CARDVIEW_COLUMN WHERE AD_CARDVIEW_COLUMN_ID=" + ad_CardViewColumn_ID;
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }
        /// <summary>
        /// Update card view column Position
        /// </summary>
        /// <param name="ad_CardViewColumn_ID"></param>
        /// <param name="seqNo"></param>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="isUp"></param>
        /// <param name="ctx"></param>
        public void UpdateCardViewColumnPosition(int ad_CardViewColumn_ID, int seqNo, int ad_CardView_ID, bool isUp, Ctx ctx)
        {
            int seqNo1 = 0;
            int id = 0; if (isUp)
            {
                seqNo1 = seqNo - 10;
            }
            else
            {
                seqNo1 = seqNo + 10;
            }
            string query = "SELECT ad_cardview_column_ID FROM ad_cardview_column WHERE ad_cardview_id=" + ad_CardView_ID + " AND seqno =" + seqNo1;
            id = Util.GetValueOfInt(DB.ExecuteScalar(query));

            MCardViewColumn objCardViewColumn = new MCardViewColumn(ctx, ad_CardViewColumn_ID, null);
            if (isUp)
            {
                objCardViewColumn.SetSeqNo(seqNo - 10);
            }
            else
            {
                objCardViewColumn.SetSeqNo(seqNo + 10);
            }
            if (!objCardViewColumn.Save())
            {
            }
            MCardViewColumn objCardViewColumn1 = new MCardViewColumn(ctx, id, null);
            if (isUp)
            {
                objCardViewColumn1.SetSeqNo(seqNo);
            }
            else
            {
                objCardViewColumn1.SetSeqNo(seqNo);
            }
            if (!objCardViewColumn.Save())
            {
            }
        }

        /// <summary>
        /// Delete Card view Records
        /// </summary>
        /// <param name="ad_CardView_ID"></param>
        /// <param name="ctx"></param>
        public void DeleteCardViewRecord(int ad_CardView_ID, Ctx ctx)
        {
            DeleteCardView(ad_CardView_ID, ctx);
            DeleteAllCardViewColumns(ad_CardView_ID, ctx);
            DeleteAllCardViewRole(ad_CardView_ID, ctx);
            DeleteDefaultCardView(ad_CardView_ID, ctx);
        }

        /// <summary>
        /// Set Default view
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="cardView"></param>
        public void SetDefaultView(Ctx ctx, int AD_Tab_ID, int cardView)
        {

            string sql = "SELECT AD_DefaultCardView_ID FROM AD_DefaultCardView WHERE AD_Tab_ID=" + AD_Tab_ID + " AND AD_User_ID=" + ctx.GetAD_User_ID();
            object id = DB.ExecuteScalar(sql);
            int AD_DefaultcarView_ID = 0;
            if (id != null && id != DBNull.Value)
            {
                AD_DefaultcarView_ID = Convert.ToInt32(id);
            }


            X_AD_DefaultCardView userQuery = new X_AD_DefaultCardView(ctx, AD_DefaultcarView_ID, null);
            userQuery.SetAD_Tab_ID(AD_Tab_ID);
            userQuery.SetAD_User_ID(ctx.GetAD_User_ID());
            userQuery.SetAD_CardView_ID(cardView);
            userQuery.Save();
        }

        /// <summary>
        /// Update card from Drag and drop
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="grpID"></param>
        /// <param name="recordID"></param>
        /// <param name="columnName"></param>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public string UpdateCardByDragDrop(Ctx ctx, string grpValue, int recordID, string columnName, string tableName, int dataType)
        {
            string result = "1";
            try
            {
                if (string.IsNullOrEmpty(grpValue))
                {
                    grpValue = null;
                }

                PO _po = MTable.GetPO(ctx, tableName, recordID, null);
                if (VAdvantage.Classes.DisplayType.YesNo == dataType)
                {
                    _po.Set_ValueNoCheck(columnName, Convert.ToBoolean(grpValue));
                }
                else if (VAdvantage.Classes.DisplayType.IsDate(dataType))
                {
                    _po.Set_ValueNoCheck(columnName, Convert.ToDateTime(grpValue));
                }
                else
                {
                    _po.Set_ValueNoCheck(columnName, grpValue);
                }


                if (!_po.Save())
                {
                    ValueNamePair pp = VAdvantage.Logging.VLogger.RetrieveError();

                    string error = pp != null ? pp.GetName() : ""; ;
                    if (string.IsNullOrEmpty(error))
                    {
                        error = pp != null ? pp.GetValue() : "";
                    }

                    if (string.IsNullOrEmpty(error))
                    {
                        ValueNamePair pp1 = VAdvantage.Logging.VLogger.RetrieveWarning();
                        error = pp1 != null ? pp1.GetName() : ""; ;
                        if (string.IsNullOrEmpty(error))
                        {
                            error = pp1 != null ? pp1.GetValue() : "";
                        }
                    }

                    if (string.IsNullOrEmpty(error))
                    {
                        error = Msg.GetMsg(ctx, "Error");
                    }

                    result = error;
                }
            }
            catch (Exception e)
            {
                result = e.Message;
            }
            //string keyColumn = tableName + "_ID";
            //string ColumnName = MColumn.GetColumnName(ctx, columnID);
            //string sqlQuery = "";
            //if (Regex.IsMatch(grpValue, @"^\d+$"))
            //{
            //    sqlQuery = "UPDATE " + tableName + " SET " + ColumnName + "=" + grpValue + " WHERE " + keyColumn + "=" + recordID;
            //}
            //else
            //{
            //    sqlQuery = "UPDATE " + tableName + " SET " + ColumnName + "='" + grpValue + "' WHERE " + keyColumn + "=" + recordID;
            //}

            //int result = DB.ExecuteQuery(sqlQuery);
            return result;
        }

        /// <summary>
        /// Get Column and window ID
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="columnName"></param>
        /// <returns></returns>
        public string GetColumnIDWindowID(string tableName, string columnName)
        {

            string sql = " SELECT cl.ad_column_id FROM ad_column cl WHERE cl.ad_table_id=" +
                     "(SELECT tb.ad_table_id FROM ad_table tb WHERE tb.tablename='" + tableName + "'" +
                      ") and cl.columnname='" + columnName + "'";
            string columnID = Util.GetValueOfString(DB.GetSQLValue(null, sql));
            sql = "SELECT ad_window_id FROM AD_Window WHERE UPPER(NAME)=UPPER('Card Template') AND isActive='Y'";
            string windowID = Util.GetValueOfString(DB.GetSQLValue(null, sql));

            return columnID + "," + windowID;
        }

        /// <summary>
        /// Get card Template
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <returns></returns>
        public List<dynamic> GetTemplateDesign(Ctx ctx, int ad_Window_ID, int ad_Tab_ID)
        {
            //string design = "";
            string sqlQuery = "SELECT AD_HEADERLAYOUT.*,CASE WHEN Cast(updated AS DATE) =Cast(SYSDATE AS DATE) THEN 1 ELSE 0 END AS lastUpdated  FROM AD_HEADERLAYOUT WHERE ISACTIVE='Y' AND ISHEADERVIEW='N' AND (AD_HeaderLayout_ID IN (SELECT AD_HeaderLayout_ID  FROM AD_CardView WHERE AD_CardView.AD_Window_id=" + ad_Window_ID + " AND AD_CardView.AD_Tab_id=" + ad_Tab_ID + " AND (AD_CardView.AD_User_ID IS NULL OR AD_CardView.AD_User_ID  =" + ctx.GetAD_User_ID() + "))) ORDER BY upper(Name)";
            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_HEADERLAYOUT", true, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            return ReturnTemplateDesign(ctx, ds, false); ;
        }

        /// <summary>
        /// Get card Template
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="ad_Window_ID"></param>
        /// <param name="ad_Tab_ID"></param>
        /// <returns></returns>
        public List<dynamic> GetSystemTemplateDesign(Ctx ctx)
        {
            //string design = "";
            string sqlQuery = "SELECT AD_HEADERLAYOUT.*,CASE when Cast(updated AS DATE) =Cast(SYSDATE AS DATE) THEN 1 ELSE 0 END AS lastUpdated FROM AD_HEADERLAYOUT WHERE ISACTIVE='Y' AND ISHEADERVIEW='N' AND IsSystemTemplate='Y' ORDER BY upper(Name)";
            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_HEADERLAYOUT", true, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            return ReturnTemplateDesign(ctx, ds, true);
        }

        /// <summary>
        /// Return Template Design
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="ds"></param>
        /// <param name="fromSystemTemplate"></param>
        /// <returns></returns>

        public List<dynamic> ReturnTemplateDesign(Ctx ctx, DataSet ds, bool fromSystemTemplate)
        {
            string sqlQuery = "";

            var DyObjectsList = new List<dynamic>();
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    string design = "";
                    dynamic DyObj = new ExpandoObject();
                    string lastUpdated = "";
                    if (Util.GetValueOfString(ds.Tables[0].Rows[i]["lastUpdated"]) == "1")
                    {
                        lastUpdated = Util.GetValueOfString(Util.GetValueOfDateTime(ds.Tables[0].Rows[i]["updated"]).Value.ToLocalTime().ToString("hh:mm:ss tt"));
                    }
                    else
                    {
                        lastUpdated = Util.GetValueOfString(Util.GetValueOfDateTime(ds.Tables[0].Rows[i]["updated"]).Value.ToLocalTime().ToString("dd-MMM-yyyy"));
                    }

                    if (Util.GetValueOfString(ds.Tables[0].Rows[i]["IsSystemTemplate"]) == "Y")
                    {
                        design += "<div category='" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_TemplateCategory_ID"]) + "' lastUpdated='" + lastUpdated + "' isSystemTemplate='Y' createdBy='" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["createdby"]) + "' class='vis-cardSingleViewTemplate d-flex align-items-center justify-content-center'>";
                    }
                    else
                    {
                        design += "<div category='" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_TemplateCategory_ID"]) + "' lastUpdated='" + lastUpdated + "' isSystemTemplate='N' createdBy='" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["createdby"]) + "' class='vis-cardSingleViewTemplate d-flex align-items-center justify-content-center displayNone'>";
                    }
                    if (fromSystemTemplate)
                    {
                        design += "<i class='fa fa-trash-o vis-deleteTemplate'></i>";
                    }
                    design += "<div class='mainTemplate' name='" + Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]) + "' templateID='" + Util.GetValueOfString(ds.Tables[0].Rows[i]["AD_HeaderLayout_ID"]) + "' style='" + Util.GetValueOfString(ds.Tables[0].Rows[i]["BackgroundColor"]) + "'>";
                    sqlQuery = "SELECT * FROM AD_GRIDLAYOUT WHERE AD_HeaderLayout_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_HeaderLayout_ID"]) + " AND ISACTIVE='Y' ORDER BY SeqNo";
                    DataSet dsSec = DB.ExecuteDataset(sqlQuery);
                    if (dsSec != null && dsSec.Tables.Count > 0 && dsSec.Tables[0].Rows.Count > 0)
                    {
                        for (int j = 0; j < dsSec.Tables[0].Rows.Count; j++)
                        {

                            string gridStyle = Util.GetValueOfString(dsSec.Tables[0].Rows[j]["BackgroundColor"]);
                            int totalRow = Util.GetValueOfInt(dsSec.Tables[0].Rows[j]["TotalRows"]);
                            int totalCol = Util.GetValueOfInt(dsSec.Tables[0].Rows[j]["TotalColumns"]);
                            if (gridStyle.IndexOf("grid-template-rows") == -1 || gridStyle.IndexOf("grid-template-columns") == -1)
                            {
                                gridStyle += ";grid-template-rows:repeat(" + totalRow + ",auto)";
                                gridStyle += ";grid-template-columns:repeat(" + totalCol + ",auto)";
                            }

                            design += "<div name='" + Util.GetValueOfString(dsSec.Tables[0].Rows[j]["Name"]) + "' row='" + totalRow + "' col='" + totalCol + "' sectionID='" + Util.GetValueOfInt(dsSec.Tables[0].Rows[j]["AD_GridLayout_ID"]) + "' sectionCount='" + (j + 1) + "' class='section" + (j + 1) + " vis-wizard-section' style='" + gridStyle + "'>";
                            sqlQuery = "SELECT * FROM AD_GRIDLAYOUTITEMS WHERE ISACTIVE='Y' AND AD_GRIDLAYOUT_ID=" + Util.GetValueOfInt(dsSec.Tables[0].Rows[j]["AD_GridLayout_ID"]);
                            DataSet dsItem = DB.ExecuteDataset(sqlQuery);
                            if (dsItem != null && dsItem.Tables.Count > 0 && dsItem.Tables[0].Rows.Count > 0)
                            {
                                for (int k = 0; k < dsItem.Tables[0].Rows.Count; k++)
                                {
                                    string style = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["BackgroundColor"]);
                                    if (style.IndexOf("grid-area") == -1)
                                    {
                                        style += ";grid-area:" + Util.GetValueOfInt(dsItem.Tables[0].Rows[k]["StartRow"]) + "/" + Util.GetValueOfInt(dsItem.Tables[0].Rows[k]["StartColumn"]);
                                        style += "/" + Util.GetValueOfInt(dsItem.Tables[0].Rows[k]["Rowspan"]) + "/" + Util.GetValueOfInt(dsItem.Tables[0].Rows[k]["ColumnSpan"]);
                                    }

                                    string styleLogic = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["styleLogic"]);
                                    if (!string.IsNullOrEmpty(styleLogic))
                                    {
                                        styleLogic=styleLogic.Replace("\"", "'");
                                    }

                                    design += "<div seqNo='" + Util.GetValueOfInt(dsItem.Tables[0].Rows[k]["SeqNo"]) + "' cardFieldID ='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["AD_GRIDLAYOUTITEMS_ID"]) + "' class='grdDiv' style='" + style + "' fieldValuestyle='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["FieldValueStyle"]) + "' fieldValueLabel='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["FieldLabelStyle"]) + "' showfieldicon='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["HideFieldIcon"]) + "' showfieldtext='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["HideFieldText"]) + "' query='" + SecureEngineBridge.EncryptByClientKey(dsItem.Tables[0].Rows[k]["columnSQL"].ToString(), ctx.GetSecureKey())+ "' styleLogic=\"" + styleLogic + "\">";
                                    //design += "<fields draggable='true' ondragstart='drag(event)'></fields>";
                                    string contentFieldValue = Msg.GetMsg(ctx, Util.GetValueOfString(dsItem.Tables[0].Rows[k]["contentFieldValue"]));
                                    string contentFieldLabel = Msg.GetMsg(ctx, Util.GetValueOfString(dsItem.Tables[0].Rows[k]["contentFieldLable"]));
                                    if (contentFieldValue.IndexOf("[") > -1)
                                    {
                                        contentFieldValue = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["contentFieldValue"]);
                                    }

                                    if (contentFieldLabel.IndexOf("[") > -1)
                                    {
                                        contentFieldLabel = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["contentFieldLable"]);
                                    }
                                    string valueStyle = "";
                                    string imgStyle = "";
                                    int brStart = 0;
                                    bool firstImg = false;
                                    string htmlStyle = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["FieldValueStyle"]);

                                    if (htmlStyle != null && htmlStyle.Length > 0 && htmlStyle.IndexOf("@") > -1)
                                    {
                                        string[] stylearr = htmlStyle.Split('|');
                                        string[] brPos = htmlStyle.Split('<');
                                        if (stylearr != null && stylearr.Length > 0)
                                        {
                                            if (stylearr[0].IndexOf("@img::") > -1)
                                            {
                                                firstImg = true;
                                            }


                                            for (int m = 0; m < stylearr.Length; m++)
                                            {
                                                if (stylearr[m].IndexOf("@img::") > -1)
                                                {
                                                    imgStyle = stylearr[m].Replace("@img::", "");
                                                }
                                                else if (stylearr[m].IndexOf("@value::") > -1)
                                                {
                                                    valueStyle = stylearr[m].Replace("@value::", "");
                                                }
                                            }

                                            if (brPos != null && brPos.Length > 1)
                                            {
                                                if (stylearr[0].IndexOf("@img::") > -1 && stylearr[1].IndexOf("@value::") > -1)
                                                {
                                                    brStart = 1;
                                                }
                                                else if (stylearr[1].IndexOf("@img::") > -1 && stylearr[0].IndexOf("@value::") > -1)
                                                {
                                                    brStart = 2;
                                                }
                                            }
                                        }

                                    }
                                    else
                                    {
                                        valueStyle = htmlStyle;
                                    }

                                    if (valueStyle.ToUpper().Trim() == "UNDEFINED")
                                    {
                                        valueStyle = "";
                                    }
                                    if (imgStyle.ToUpper().Trim() == "UNDEFINED")
                                    {
                                        imgStyle = "";
                                    }

                                    string directionStyle = "";
                                    var index = style.IndexOf("flex-direction");
                                    if (index > -1)
                                    {
                                        var index2 = style.IndexOf(";", index + "flex-direction".Length);

                                        directionStyle = "display:flex;" + style.Substring(index, (index2 - index));
                                    }

                                    if (!string.IsNullOrEmpty(contentFieldLabel) && !string.IsNullOrEmpty(contentFieldValue))
                                    {
                                        design += "<div class='fieldGroup' draggable='true' style='" + directionStyle + "'>";
                                        string spn = "";
                                        string img = "";
                                        string isFieldTextHide = Util.GetValueOfString(dsItem.Tables[0].Rows[k]["HideFieldText"]) == "Y" ? "true" : "false";
                                        if (Util.GetValueOfString(dsItem.Tables[0].Rows[k]["HideFieldText"]) == "Y")
                                        {

                                            design += "<span style='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["FieldLabelStyle"]) + "' showfieldtext='" + isFieldTextHide + "' class='fieldLbl displayNone'  title='" + contentFieldLabel + "'>" + contentFieldLabel + "</span>";
                                        }
                                        else
                                        {
                                            design += "<span style='" + Util.GetValueOfString(dsItem.Tables[0].Rows[k]["FieldLabelStyle"]) + "' showfieldtext='" + isFieldTextHide + "' class='fieldLbl'  title='" + contentFieldLabel + "' >" + contentFieldLabel + "</span>";
                                        }

                                        if (contentFieldValue.IndexOf("<img") > -1 || contentFieldValue.IndexOf("<svg") > -1 || contentFieldValue.IndexOf("<i") > -1)
                                        {
                                            string cvv = "";
                                            string cvi = "";
                                            if (contentFieldValue.IndexOf("|") > -1)
                                            {
                                                string[] cv = contentFieldValue.Split('|');
                                                cvi = cv[0];
                                                cvv = cv[1];
                                                if (contentFieldValue.IndexOf("<img") > -1)
                                                {
                                                    img = cvi.Replace("<img", "<img style='" + imgStyle + "' ");
                                                }
                                                else if (contentFieldValue.IndexOf("<svg") > -1)
                                                {
                                                    img = cvi.Replace("<svg", "<svg style='" + imgStyle + "' ");
                                                }
                                                else
                                                {
                                                    img = cvi.Replace("<i", "<i style='" + imgStyle + "' ");
                                                }
                                                if (brStart == 0)
                                                {
                                                    spn += "<span class='fieldValue' style='" + valueStyle + "'>" + cvv + "</span>";
                                                }
                                                else if (brStart == 1)
                                                {
                                                    spn += "<span class='fieldValue' style='" + valueStyle + "'><br>" + cvv + "</span>";
                                                }
                                                else if (brStart == 2)
                                                {
                                                    spn += "<span class='fieldValue' style='" + valueStyle + "'>" + cvv + "<br></span>";
                                                }

                                            }
                                            else
                                            {

                                                contentFieldValue = contentFieldValue.Replace("<img", "<img style='" + imgStyle + "' ");
                                                img += contentFieldValue;
                                            }
                                        }
                                        else
                                        {
                                            spn += "<span class='fieldValue' style='" + valueStyle + "'>" + contentFieldValue + "</span>";
                                        }

                                        if (firstImg)
                                        {
                                            design += img;
                                            design += spn;
                                        }
                                        else
                                        {
                                            design += spn;
                                            design += img;
                                        }

                                        design += "</div>";
                                    }
                                    design += "</div>";
                                }
                            }
                            design += "</div>";
                        }
                    }
                    design += "</div>";
                    design += "<div class='d-flex align-items-center justify-content-center' style='position:absolute;bottom:-25px;opacity: 1 !important;'>" + Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"]) + "</div>";
                    design += "</div>";
                    DyObj.template = design;
                    DyObjectsList.Add(DyObj);
                }
            }
            return DyObjectsList;
        }

        /// <summary>
        /// Save template
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="CardViewID"></param>
        /// <param name="templateID"></param>
        /// <param name="templateName"></param>
        /// <param name="style"></param>
        /// <param name="cardSection"></param>
        /// <param name="cardTempField"></param>
        /// <returns></returns>
        public string SaveCardTemplate(Ctx ctx, int CardViewID, int templateID, string templateName, int templateCategory, string style, List<CardSection> cardSection, List<CardTempField> cardTempField, string isSystemTemplate, int refTempID)
        {
            Trx trx = null;
            try
            {
                DataSet dsContent = null;
                trx = Trx.GetTrx("SaveTemplate" + DateTime.Now.Ticks);
                MHeaderLayout mhl = new MHeaderLayout(ctx, templateID, trx);
                if (templateID > 0)
                {
                    dsContent = DB.ExecuteDataset("SELECT contentfieldlable,contentfieldvalue,seqNo,(SELECT name FROM AD_GridLayout WHERE AD_GridLayout.AD_GridLayout_ID=AD_GridLayoutItems.AD_GridLayout_ID) AS secName FROM AD_GridLayoutItems WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + mhl.GetAD_HeaderLayout_ID() + ")");
                    string sql = "DELETE FROM AD_GridLayoutItems WHERE Export_ID IS NULL AND AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID=" + mhl.GetAD_HeaderLayout_ID() + ")";

                    int result=  DB.ExecuteQuery(sql, null, trx);
                    result= DB.ExecuteQuery("DELETE FROM AD_GridLayout WHERE Export_ID IS NULL AND AD_HeaderLayout_ID=" + mhl.GetAD_HeaderLayout_ID(), null, trx);

                }
                else
                {

                }
                mhl.Set_Value("IsSystemTemplate", isSystemTemplate);
                mhl.SetName(templateName);
                mhl.SetIsHeaderView(false);
                mhl.SetBackgroundColor(style);
                if (isSystemTemplate == "Y")
                {
                    mhl.Set_Value("AD_TemplateCategory_ID", templateCategory);
                }
                if (mhl.Save())
                {
                    templateID = mhl.GetAD_HeaderLayout_ID();

                    for (int i = 0; i < cardSection.Count; i++)
                    {
                        int GridLayoutid =Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID="+ mhl.GetAD_HeaderLayout_ID()+ " AND Name='"+ cardSection[i].sectionName.Trim() + "'",null,trx));

                        MGridLayout mgl = new MGridLayout(ctx, GridLayoutid, trx);
                        mgl.SetAD_HeaderLayout_ID(mhl.GetAD_HeaderLayout_ID());
                        mgl.SetName(cardSection[i].sectionName.Trim());
                        mgl.SetBackgroundColor(cardSection[i].style.Trim());
                        mgl.SetTotalRows(cardSection[i].totalRow);
                        mgl.SetTotalColumns(cardSection[i].totalCol);
                        mgl.SetSeqNo(cardSection[i].sectionNo);
                        if (mgl.Save())
                        {

                            for (int j = 0; j < cardTempField.Count; j++)
                            {
                                if (cardSection[i].sectionNo == cardTempField[j].sectionNo)
                                {
                                    string columnSQL = null;
                                    if (!string.IsNullOrEmpty(cardTempField[j].columnSQL))
                                    {
                                        columnSQL = SecureEngineBridge.DecryptByClientKey(cardTempField[j].columnSQL, ctx.GetSecureKey());
                                    }

                                    int GridLayoutItemsid = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_GridLayoutItems_ID FROM AD_GridLayoutItems WHERE AD_GridLayout_ID=" + mgl.GetAD_GridLayout_ID() + " AND SeqNo='" + cardTempField[j].seq + "'",null,trx));


                                    MGridLayoutItems mli = new MGridLayoutItems(ctx, GridLayoutItemsid, trx);
                                    mli.SetAD_GridLayout_ID(mgl.GetAD_GridLayout_ID());
                                    mli.SetSeqNo(cardTempField[j].seq);
                                    mli.SetStartRow(cardTempField[j].rowStart);
                                    mli.SetRowspan(cardTempField[j].rowEnd);
                                    mli.SetStartColumn(cardTempField[j].colStart);
                                    mli.SetColumnSpan(cardTempField[j].colEnd);
                                    mli.SetBackgroundColor(cardTempField[j].style);
                                    mli.SetJustifyItems(null);
                                    mli.SetAlignItems(null);
                                    mli.SetFieldValueStyle(cardTempField[j].valueStyle);
                                    mli.SetHideFieldIcon(cardTempField[j].hideFieldIcon);
                                    mli.SetHideFieldText(cardTempField[j].hideFieldText);
                                    mli.SetColumnSQL(columnSQL);
                                    mli.Set_Value("StyleLogic", cardTempField[j].styleLogic);
                                    if (isSystemTemplate == "Y")
                                    {
                                        mli.Set_Value("contentFieldLable", cardTempField[j].contentFieldLabel);
                                        mli.Set_Value("contentFieldValue", cardTempField[j].contentFieldValue);
                                    }
                                    else
                                    {
                                        if (dsContent == null)
                                        {
                                            string qury = "SELECT contentfieldlable,contentfieldvalue from ad_gridlayoutitems WHERE seqno=" + Util.GetValueOfInt(cardTempField[j].seq) + " and ad_gridlayout_id=(SELECT ad_gridlayout_ID FROM ad_gridlayout WHERE ad_headerlayout_id = " + refTempID + " AND name = '" + cardSection[i].sectionName.Trim() + "')";
                                            dsContent = DB.ExecuteDataset(qury);
                                            if (dsContent != null && dsContent.Tables.Count > 0 && dsContent.Tables[0].Rows.Count > 0)
                                            {
                                                mli.Set_Value("contentFieldLable", Util.GetValueOfString(dsContent.Tables[0].Rows[0]["contentfieldlable"]));
                                                mli.Set_Value("contentFieldValue", Util.GetValueOfString(dsContent.Tables[0].Rows[0]["contentfieldvalue"]));
                                            }
                                            dsContent = null;
                                        }

                                        else if (dsContent.Tables.Count > 0 && dsContent.Tables[0].Rows.Count > 0)
                                        {
                                            DataRow[] rslt = dsContent.Tables[0].Select("seqno = " + Util.GetValueOfInt(cardTempField[j].seq) + " AND secName = '" + cardSection[i].sectionName.Trim() + "'");
                                            foreach (DataRow row in rslt)
                                            {
                                                mli.Set_Value("contentFieldLable", Util.GetValueOfString(row["contentfieldlable"]));
                                                mli.Set_Value("contentFieldValue", Util.GetValueOfString(row["contentfieldvalue"]));
                                            }
                                        }
                                    }
                                    mli.Set_Value("FieldLabelStyle", cardTempField[j].fieldStyle);
                                    if (mli.Save())
                                    {
                                        //SaveCardViewColumns(CardViewID, cardTempField[j].fieldID, cardTempField[j].seq,  ctx, 0);
                                    }
                                }
                            }
                        }
                    }
                    trx.Commit();
                    trx.Close();
                }
            }
            catch (Exception e)
            {
                if (trx != null)
                {
                    trx.Rollback();
                    trx.Close();
                }

                return e.Message;
            }
            return Util.GetValueOfString(templateID);
        }

        /// <summary>
        /// Delete Template
        /// </summary>
        /// <param name="tempID"></param>
        public void DeleteTemplate(int tempID)
        {
            string sqlQuery = "DELETE FROM AD_HEADERLAYOUT WHERE AD_HEADERLAYOUT_ID=" + tempID;
            int result = DB.ExecuteQuery(sqlQuery);
            if (result < 1)
            {

            }
        }

        /// <summary>
        /// Get Template Category
        /// </summary>
        /// <returns></returns>
        public List<TempCategory> GetTemplateCategory(Ctx ctx)
        {
            string sqlQuery = "SELECT AD_TemplateCategory_ID,Name FROM AD_TemplateCategory WHERE isactive='Y'";
            sqlQuery = MRole.GetDefault(ctx).AddAccessSQL(sqlQuery, "AD_TemplateCategory", true, false);
            DataSet ds = DB.ExecuteDataset(sqlQuery);
            List<TempCategory> tempCat = null;
            TempCategory objtempCat = null;
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                tempCat = new List<TempCategory>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    objtempCat = new TempCategory()
                    {
                        TemplateCategoryID = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_TemplateCategory_ID"]),
                        Name = Util.GetValueOfString(ds.Tables[0].Rows[i]["Name"])
                    };
                    tempCat.Add(objtempCat);
                }
            }
            return tempCat;
        }

        /// <summary>
        /// Get Exported Data
        /// </summary>
        /// <param name="_recordID"></param>
        /// <param name="_tableID"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<int> GetCardExportData(Ctx ctx, string _strRecordID)
        {
            int _tableID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_GridLayoutItems'"));

            string qry = @"SELECT AD_GridLayoutItems_ID FROM AD_GridLayoutItems  WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID in (" + _strRecordID + "))";
            DataSet ds = DB.ExecuteDataset(qry);
            int _recordID = 0;
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                _recordID = Util.GetValueOfInt(ds.Tables[0].Rows[0]["AD_GridLayoutItems_ID"]);
            }
            List<int> recID = null;
            if (_recordID > 0)
            {
                
                string sql = "SELECT AD_ModuleInfo_ID FROM AD_ExportData e WHERE e.Record_ID=" + _recordID + " AND e.AD_Table_ID = " + _tableID;
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    recID = new List<int>();
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        int id = Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_ModuleInfo_ID"]);
                        recID.Add(id);
                    }
                }
            }
            return recID;
        }

        /// <summary>
        /// Card template Export
        /// </summary>
        /// <param name="moduleId"></param>
        /// <param name="_strRecordID"></param>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public string SaveCardExportData(int[] moduleId, string _strRecordID, Ctx ctx)
        {

            int tableID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_GridLayoutItems'"));

            string qry = @"SELECT AD_GridLayoutItems_ID FROM AD_GridLayoutItems  WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID in (" + _strRecordID + "))";
            DataSet ds = DB.ExecuteDataset(qry);
            List<int> lst = new List<int>();
            string strRecordID = "";
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    strRecordID += Util.GetValueOfString(ds.Tables[0].Rows[i]["AD_GridLayoutItems_ID"]);
                    if (ds.Tables[0].Rows.Count != (i + 1))
                    {
                        strRecordID += ",";
                    }
                    lst.Add(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_GridLayoutItems_ID"]));
                }
            }
            int[] arr = lst.ToArray();

            MarkModuleHelper model = new MarkModuleHelper();

            return model.SaveExportData(moduleId, arr, tableID, strRecordID, ctx);
        }

        /// <summary>
        /// Get Exported Template IDs
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<string> GetExportTemplateIDs(Ctx ctx)
        {
            List<string> recID = null;
            int _tableID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_GridLayoutItems'"));
           string sql = @"SELECT DISTINCT AD_HeaderLayout.AD_HeaderLayout_ID,(SELECT distinct ad_moduleinfo_id FROM ad_exportdata WHERE ad_table_id=" + _tableID + @") AS moduleinfo_id FROM AD_HeaderLayout INNER JOIN AD_GridLayout 
                           ON AD_HeaderLayout.AD_HeaderLayout_ID=AD_GridLayout.AD_HeaderLayout_ID
                           INNER JOIN AD_GridLayoutItems ON AD_GridLayout.AD_GridLayout_ID=AD_GridLayoutItems.AD_GridLayout_ID
                           WHERE AD_GridLayoutItems.AD_GridLayoutItems_ID IN (SELECT record_id FROM ad_exportdata WHERE ad_table_id=" + _tableID + ")";

            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                recID = new List<string>();
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    string id = Util.GetValueOfString(ds.Tables[0].Rows[i]["AD_HeaderLayout_ID"])+"|"+ Util.GetValueOfString(ds.Tables[0].Rows[i]["moduleinfo_id"]);
                    recID.Add(id);
                }
            }
            return recID;
        }

        /// <summary>
        /// Remove Exported Template
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="templateID"></param>
        /// <returns></returns>
        public int RemoveExportTemplate(Ctx ctx, int templateID)
        {
            int a = 0;
            int _tableID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_GridLayoutItems'"));
            string qry = @"SELECT AD_GridLayoutItems_ID FROM AD_GridLayoutItems  WHERE AD_GridLayout_ID IN (SELECT AD_GridLayout_ID FROM AD_GridLayout WHERE AD_HeaderLayout_ID in (" + templateID + "))";
            DataSet ds = DB.ExecuteDataset(qry);
            string strRecordID = "";
            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    strRecordID += Util.GetValueOfString(ds.Tables[0].Rows[i]["AD_GridLayoutItems_ID"]);
                    if (ds.Tables[0].Rows.Count != (i + 1))
                    {
                        strRecordID += ",";
                    }

                }
                string sql = "delete from ad_exportdata where record_id in (" + strRecordID + ") " +
                                  "and ad_table_id=" + _tableID;
                a = DB.ExecuteQuery(sql, null, null);
            }
            return a;
        }

    }

    public class CardViewPropeties
    {
        public string CardViewName { get; set; }
        public int CardViewID { get; set; }
        public int AD_Window_ID { get; set; }
        public int AD_Tab_ID { get; set; }
        public int UserID { get; set; }

        public string FieldName { get; set; }
        public string groupSequence { get; set; }
        public string excludedGroup { get; set; }
        public int AD_Field_ID { get; set; }
        public int AD_GroupField_ID { get; set; }
        public int AD_CardViewColumn_ID { get; set; }
        public int SeqNo { get; set; }
        public bool isNewRecord { get; set; }
        public bool IsDefault { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedName { get; set; }
        public bool DefaultID { get; set; }
        public bool isPublic { get; set; }
        public int AD_HeaderLayout_ID { get; set; }
        public int sort { get; set; }
        public string OrderByClause { get; set; }
        public bool disableWindowPageSize { get; set; }
        public bool IsEditable { get; set; }
        public DateTime Updated { get; set; }
    }

    public class UserPropeties
    {
        public string UserName { get; set; }
        public int AD_User_ID { get; set; }

    }
    public class RolePropeties
    {
        public string RoleName { get; set; }
        public int AD_Role_ID { get; set; }
        public int AD_CardView_ID { get; set; }

    }
    public class CardViewConditionPropeties
    {
        public string Color { get; set; }
        public string ConditionValue { get; set; }
        public string ConditionText { get; set; }

    }
    public class ParameterPropeties
    {
        public List<UserPropeties> lstUserData { get; set; }
        public List<RolePropeties> lstRoleData { get; set; }
        public List<CardViewPropeties> lstCardViewData { get; set; }
        public List<List<RolePropeties>> lstCardViewRoleData { get; set; }
        public List<CardViewConditionPropeties> lstCardViewConditonData { get; set; }
    }

    public class CardSection
    {
        public int sectionID { get; set; }
        public string sectionName { get; set; }
        public string style { get; set; }
        public int sectionNo { get; set; }
        public int totalRow { get; set; }
        public int totalCol { get; set; }
        public int rowGap { get; set; }
        public int colGap { get; set; }
    }
    public class CardTempField
    {
        public int cardFieldID { get; set; }
        public string fieldStyle { get; set; }
        public string valueStyle { get; set; }
        public string style { get; set; }
        public string columnSQL { get; set; }
        public string styleLogic { get; set; }
        public bool hideFieldIcon { get; set; }
        public bool hideFieldText { get; set; }
        public int sectionNo { get; set; }
        public int fieldID { get; set; }
        public int rowStart { get; set; }
        public int rowEnd { get; set; }
        public int colStart { get; set; }
        public int colEnd { get; set; }
        public int seq { get; set; }
        public string contentFieldLabel { get; set; }
        public string contentFieldValue { get; set; }
    }

    public class TempCategory
    {
        public int TemplateCategoryID { get; set; }
        public string Name { get; set; }
    }
}