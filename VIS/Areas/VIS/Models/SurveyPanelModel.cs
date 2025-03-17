using Ionic.Zip;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text;
using VAdvantage.Common;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    public class SurveyPanelModel
    {

        public List<SurveyAssignmentsDetails> GetSurveyAssignmentsClientSide(Ctx ctx, int AD_Window_ID, int AD_Tab_ID, int AD_Table_ID, int AD_Record_ID, int AD_WF_Activity_ID)
        {
            SurveyAssignmentsDetails lst = new SurveyAssignmentsDetails();
            List<SurveyAssignmentsDetails> LsDetails = new List<SurveyAssignmentsDetails>();

            if (AD_Window_ID == 0)
            {
                return LsDetails;
            }

            StringBuilder sql = new StringBuilder(@"SELECT sa.AD_Window_ID, sa.AD_Survey_ID, sa.C_DocType_ID, sa.SurveyListFor,
                                                  sa.DocAction, sa.ShowAllQuestions, sa.AD_SurveyAssignment_ID, s.surveytype,sa.IsConditionalChecklist,sa.IsMandatoryToFill,
                                                  s.ismandatory, s.name,sa.QuestionsPerPage,NVL(RS.Limits,0) AS Limit,RS.isSelfshow,");
            if (AD_Record_ID > 0)
            {
                if (AD_WF_Activity_ID == 0)
                {
                    sql.Append(@" (SELECT count(AD_SurveyResponse_ID) FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @") AS responseCount,");
                }
                else
                {
                    sql.Append(@" (SELECT count(AD_SurveyResponse_ID) FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND AD_WF_Activity_ID=" + AD_WF_Activity_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @") AS responseCount,");
                }

                sql.Append(@" (SELECT AD_SurveyResponse_ID FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @" ORDER BY Created FETCH FIRST 1 ROWS ONLY) AS SurveyResponse_ID");
            }
            else
            {
                sql.Append(@" 0 AS responseCount, null AS SurveyResponse_ID");
            }
            sql.Append(@" FROM ad_surveyassignment sa INNER JOIN AD_Survey s ON 
                                                  s.ad_survey_ID= sa.ad_survey_id 
                                                  LEFT JOIN AD_ResponseSetting RS ON (RS.ad_surveyassignment_ID=sa.ad_surveyassignment_ID) AND RS.IsActive='Y'
                                                  WHERE sa.IsActive='Y' AND sa.AD_Window_ID=" + AD_Window_ID + " AND sa.AD_Table_ID=" + AD_Table_ID + " ORDER BY s.name");
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "sa", true, false), null);
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {                   
                    string condition = "";                   
                    condition = GetConditionByCheckList(ctx, Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]), AD_Table_ID);

                    LsDetails.Add(new SurveyAssignmentsDetails
                    {
                        Window_ID = Util.GetValueOfInt(dt["AD_Window_ID"]),
                        Survey_ID = Util.GetValueOfInt(dt["AD_Survey_ID"]),
                        DocType_ID = Util.GetValueOfInt(dt["C_DocType_ID"]),
                        SurveyListFor = Util.GetValueOfString(dt["SurveyListFor"]),
                        DocAction = Util.GetValueOfString(dt["DocAction"]),
                        ShowAllQuestion = Util.GetValueOfBool(Util.GetValueOfString(dt["ShowAllQuestions"]).Equals("Y")),
                        SurveyAssignment_ID = Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]),
                        SurveyType = Util.GetValueOfString(dt["surveytype"]),
                        IsMandatory = Util.GetValueOfBool(Util.GetValueOfString(dt["ismandatory"]).Equals("Y")),
                        SurveyName = Util.GetValueOfString(dt["name"]),
                        QuestionsPerPage = Util.GetValueOfInt(dt["QuestionsPerPage"]),
                        IsDocActionActive = CheckDocActionColumn(AD_Tab_ID),
                        IsConditionalChecklist = Util.GetValueOfBool(Util.GetValueOfString(dt["IsConditionalChecklist"]).Equals("Y")),
                        IsMandatoryToFill= Util.GetValueOfBool(Util.GetValueOfString(dt["IsMandatoryToFill"]).Equals("Y")),
                        IsSelfshow = Util.GetValueOfBool(Util.GetValueOfString(dt["isSelfshow"]).Equals("Y")),
                        Limit = Util.GetValueOfInt(dt["Limit"]),
                        ResponseCount = Util.GetValueOfInt(dt["responseCount"]),
                        SurveyResponse_ID = Util.GetValueOfInt(dt["SurveyResponse_ID"]),
                        ConditionStr = condition
                    });
                }
            }
            return LsDetails;
        }

        public string GetConditionByCheckList(Ctx ctx, int AD_SurveyAssignment_ID, int AD_Table_ID)
        {
            string conditions = "";
            string sql = @"SELECT AD_Column.AD_column_ID,
                            ad_surveyshowcondition.seqno,AD_Column.ColumnName,ad_surveyshowcondition.operation,ad_surveyshowcondition.ad_equalto,ad_surveyshowcondition.Value2,
                            ad_surveyshowcondition.andor,AD_Column.AD_Reference_ID
                            FROM  AD_Column                           
                            INNER JOIN ad_surveyshowcondition ON AD_Column.AD_column_ID=ad_surveyshowcondition.AD_column_ID
                            WHERE ad_surveyshowcondition.isActive='Y' AND  ad_surveyshowcondition.AD_SurveyAssignment_ID=" + AD_SurveyAssignment_ID + " AND AD_Column.AD_Table_ID=" + AD_Table_ID + @"
                            ORDER BY ad_surveyshowcondition.seqno";
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "ad_surveyshowcondition", true, false), null);
            //prepare where condition for filter
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                int idx = 0;
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    string type = "";
                    string value = Util.GetValueOfString(dt["ad_equalto"]);
                    string columnName = Util.GetValueOfString(dt["ColumnName"]);
                    int displayType = Util.GetValueOfInt(dt["AD_Reference_ID"]);
                    string oprtr = Util.GetValueOfString(dt["operation"]);


                    //Checking data type of column
                    if (columnName.Equals("AD_Language") || columnName.Equals("EntityType") || columnName.Equals("DocBaseType"))
                    {
                        type = typeof(System.String).Name;
                    }
                    else if (columnName.Equals("Posted") || columnName.Equals("Processed") || columnName.Equals("Processing"))
                    {
                        type = typeof(System.Boolean).Name;
                    }
                    else if (columnName.Equals("Record_ID"))
                    {
                        type = typeof(System.Int32).Name;
                    }
                    else
                    {
                        type = VAdvantage.Classes.DisplayType.GetClass(displayType, true).Name;
                    }



                    if (oprtr == "==")
                    {
                        oprtr = "=";
                    }
                    else if (oprtr == "!=")
                    {
                        oprtr = "!";
                    }
                    else if (oprtr == "<=")
                    {
                        oprtr = "<=";
                    }
                    else if (oprtr == "<<")
                    {
                        oprtr = "<";
                    }
                    else if (oprtr == ">>")
                    {
                        oprtr = ">";
                    }
                    else if (oprtr == ">=")
                    {
                        oprtr = ">=";
                    }
                    //else if (oprtr == "~~")
                    //{
                    //    oprtr = " LIKE ";
                    //    value = "%" + value + "%";
                    //}
                    //else if (oprtr == "AB")
                    //{
                    //    oprtr = ">";
                    //}

                    string andOR = " & ";
                    if (Util.GetValueOfString(dt["andor"]) == "O")
                    {
                        andOR = " | ";
                    }


                    if (type == "String")
                    {
                        value = "'" + value + "'";
                    }
                    else if (type.ToLower() == "date" || type.ToLower() == "datetime")
                    {
                        value = "'" + Convert.ToDateTime(value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") + "'";
                    }



                    if (idx == 0) // Util.GetValueOfInt(dt["seqno"]) == 10
                    {
                        idx++;
                        if (oprtr.Length == 2)
                        {
                            char[] charArray = oprtr.ToCharArray();
                            conditions += "@" + columnName + "@ " + charArray[0] + " " + value;
                            conditions += " | ";
                            conditions += "@" + columnName + "@ " + charArray[1] + " " + value;
                        }
                        else
                        {
                            conditions += "@" + columnName + "@ " + oprtr + " " + value;
                        }
                    }
                    else
                    {
                        conditions += andOR;
                        if (oprtr.Length == 2)
                        {
                            char[] charArray = oprtr.ToCharArray();
                            conditions += "@" + columnName + "@ " + charArray[0] + " " + value;
                            conditions += " | ";
                            conditions += "@" + columnName + "@ " + charArray[1] + " " + value;
                        }
                        else
                        {
                            conditions += "@" + columnName + "@ " + oprtr + " " + value;
                        }
                    }

                }

            }
           
            return conditions;
        }


        /// <summary>
        /// Get Survey Assignment
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="AD_Record_ID"></param>
        /// <returns></returns>
        public List<SurveyAssignmentsDetails> GetSurveyAssignments(Ctx ctx, int AD_Window_ID, int AD_Tab_ID, int AD_Table_ID,int AD_Record_ID, int AD_WF_Activity_ID)
        {
            

            SurveyAssignmentsDetails lst = new SurveyAssignmentsDetails();
            List<SurveyAssignmentsDetails> LsDetails = new List<SurveyAssignmentsDetails>();

            if (AD_Window_ID == 0)
            {
                return LsDetails;
            }

            StringBuilder sql = new StringBuilder(@"SELECT sa.AD_Window_ID, sa.AD_Survey_ID, sa.C_DocType_ID, sa.SurveyListFor,
                                                  sa.DocAction, sa.ShowAllQuestions, sa.AD_SurveyAssignment_ID, s.surveytype,sa.IsConditionalChecklist,sa.IsMandatoryToFill,
                                                  s.ismandatory, s.name,sa.QuestionsPerPage,NVL(RS.Limits,0) AS Limit,RS.isSelfshow,");
            if (AD_Record_ID > 0)
            {
                if (AD_WF_Activity_ID == 0)
                {
                    sql.Append(@" (SELECT count(AD_SurveyResponse_ID) FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @") AS responseCount,");
                }
                else
                {
                    sql.Append(@" (SELECT count(AD_SurveyResponse_ID) FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND AD_WF_Activity_ID=" + AD_WF_Activity_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @") AS responseCount,");
                }

                sql.Append(@" (SELECT AD_SurveyResponse_ID FROM AD_SurveyResponse WHERE AD_Survey_ID=s.ad_survey_ID AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + AD_Record_ID + @" ORDER BY Created FETCH FIRST 1 ROWS ONLY) AS SurveyResponse_ID");
            }
            else
            {
                sql.Append(@" 0 AS responseCount, null AS SurveyResponse_ID");
            }
                sql.Append(@" FROM ad_surveyassignment sa INNER JOIN AD_Survey s ON 
                                                  s.ad_survey_ID= sa.ad_survey_id 
                                                  LEFT JOIN AD_ResponseSetting RS ON (RS.ad_surveyassignment_ID=sa.ad_surveyassignment_ID) AND RS.IsActive='Y'
                                                  WHERE sa.IsActive='Y' AND sa.AD_Window_ID="+ AD_Window_ID + " AND sa.AD_Table_ID=" + AD_Table_ID + " ORDER BY s.name");
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "sa", true, false), null);
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {                
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    bool isvalidate = false;
                    string condition = "";
                    //if (Util.GetValueOfString(dt["IsConditionalChecklist"])=="N")
                    //{
                    if (AD_Record_ID > 0)
                    {
                        isvalidate = Common.checkConditions(ctx, AD_Window_ID, AD_Table_ID, AD_Record_ID, Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]), Util.GetValueOfString(dt["IsConditionalChecklist"]));
                    }
                    else
                    {
                        isvalidate = true;
                        //condition = CheckConditionForNewRecord(ctx, AD_Window_ID, AD_Table_ID, AD_Record_ID, Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]), Util.GetValueOfString(dt["IsConditionalChecklist"]));
                    }
                    //    if (isvalidate)
                    //    {
                    //        isvalidate = true;
                    //    }
                    //}

                    if (!isvalidate)
                    {
                        continue;
                    }

                    LsDetails.Add(new SurveyAssignmentsDetails
                    {
                        Window_ID = Util.GetValueOfInt(dt["AD_Window_ID"]),
                        Survey_ID = Util.GetValueOfInt(dt["AD_Survey_ID"]),
                        DocType_ID = Util.GetValueOfInt(dt["C_DocType_ID"]),
                        SurveyListFor = Util.GetValueOfString(dt["SurveyListFor"]),
                        DocAction = Util.GetValueOfString(dt["DocAction"]),
                        ShowAllQuestion = Util.GetValueOfBool(Util.GetValueOfString(dt["ShowAllQuestions"]).Equals("Y")),
                        SurveyAssignment_ID = Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]),
                        SurveyType = Util.GetValueOfString(dt["surveytype"]),
                        IsMandatory = Util.GetValueOfBool(Util.GetValueOfString(dt["ismandatory"]).Equals("Y")),
                        SurveyName = Util.GetValueOfString(dt["name"]),
                        QuestionsPerPage = Util.GetValueOfInt(dt["QuestionsPerPage"]),
                        IsDocActionActive = CheckDocActionColumn(AD_Tab_ID),
                        IsConditionalChecklist = Util.GetValueOfBool(Util.GetValueOfString(dt["IsConditionalChecklist"]).Equals("Y")),
                        IsMandatoryToFill = Util.GetValueOfBool(Util.GetValueOfString(dt["IsMandatoryToFill"]).Equals("Y")),
                        IsSelfshow = Util.GetValueOfBool(Util.GetValueOfString(dt["isSelfshow"]).Equals("Y")),
                        Limit = Util.GetValueOfInt(dt["Limit"]),
                        ResponseCount = Util.GetValueOfInt(dt["responseCount"]),
                        SurveyResponse_ID = Util.GetValueOfInt(dt["SurveyResponse_ID"]),
                        ConditionStr = condition
                    });
                    break;
                }
            }
            return LsDetails;
        }

        /// <summary>
        /// Check Doc Action Column
        /// </summary>
        /// <param name="AD_Tab_ID"></param>
        /// <returns></returns>
        public bool CheckDocActionColumn(int AD_Tab_ID)
        {
            bool IsDocActionExists = Util.GetValueOfInt(DB.ExecuteScalar(@"SELECT COUNT(*) FROM AD_Field f 
            INNER JOIN AD_Column c ON f.AD_Column_ID = c.AD_Column_ID WHERE f.AD_Tab_ID = " + AD_Tab_ID + @" AND 
            UPPER(c.ColumnName)='DOCACTION' AND f.IsActive='Y'")) > 0;
            return IsDocActionExists;
        }
        

        /// <summary>
        /// Get Survey Items
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Survey_ID"></param>
        /// <returns></returns>
        public List<ListSurveyItemValues> GetSurveyItems(Ctx ctx, int AD_Survey_ID)
        {
            List<ListSurveyItemValues> ListItemValues = new List<ListSurveyItemValues>();
            ListSurveyItemValues SurveyItemandValue = null;
            SurveyItem item = null;
            StringBuilder sql = new StringBuilder(@"SELECT AD_SurveyItem_ID,AD_Survey_ID,Question,Line,
            AnswerType,IsMandatory,IsActive,AnswerSelection FROM AD_SurveyItem WHERE IsActive='Y' AND 
            AD_Survey_ID = " + AD_Survey_ID + "  ORDER BY Line ASC");
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "AD_SurveyItem", true, false), null);
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    SurveyItemandValue = new ListSurveyItemValues();
                    item = new SurveyItem();
                    item.AD_Survey_ID = Util.GetValueOfInt(dt["AD_Survey_ID"]);
                    item.AD_SurveyItem_ID = Util.GetValueOfInt(dt["AD_SurveyItem_ID"]);
                    item.Question = Util.GetValueOfString(dt["Question"]);
                    item.LineNo = Util.GetValueOfInt(dt["Line"]);
                    item.AnswerType = Util.GetValueOfString(dt["AnswerType"]);
                    item.IsMandatory = Util.GetValueOfString(dt["IsMandatory"]);
                    item.IsActive = Util.GetValueOfString(dt["IsActive"]);
                    item.AnswerSelection = Util.GetValueOfString(dt["AnswerSelection"]);
                    SurveyItemandValue.Item = item;
                    SurveyItemandValue.Values = GetSurveyItemValues(ctx, item.AD_SurveyItem_ID);
                    ListItemValues.Add(SurveyItemandValue);
                }
            }


            return ListItemValues;
        }

        /// <summary>
        /// Get survey item Values
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_SurveyItem_ID"></param>
        /// <returns></returns>
        public List<SurveyItemValue> GetSurveyItemValues(Ctx ctx, int AD_SurveyItem_ID)
        {
            SurveyItemValue lst = new SurveyItemValue();
            List<SurveyItemValue> LsDetails = new List<SurveyItemValue>();
            StringBuilder sql = new StringBuilder(@"SELECT AD_SurveyItem_ID,AD_SurveyValue_ID,Line,
                              Answer, IsActive FROM AD_SurveyValue WHERE IsActive='Y' AND 
            AD_SurveyItem_ID = " + AD_SurveyItem_ID + "  ORDER BY Line ASC");
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql.ToString(), "AD_SurveyValue", true, false), null);
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    LsDetails.Add(new SurveyItemValue
                    {
                        AD_SurveyItem_ID = Util.GetValueOfInt(dt["AD_SurveyItem_ID"]),
                        AD_SurveyValue_ID = Util.GetValueOfInt(dt["AD_SurveyValue_ID"]),
                        LineNo = Util.GetValueOfInt(dt["Line"]),
                        Answer = Util.GetValueOfString(dt["Answer"]),
                        IsActive = Util.GetValueOfString(dt["IsActive"])
                    });
                }
            }
            return LsDetails;
        }
        /// <summary>
        /// Save Survey Response Value
        /// </summary>
        /// <param name="surveyResponseValue"></param>
        public int SaveSurveyResponse(Ctx ctx, List<SurveyResponseValue> surveyResponseValue, int AD_Window_ID, int AD_Survey_ID, int Record_ID, int AD_Table_ID, int AD_WF_Activity_ID)
        {
            MSurveyResponse SR = new MSurveyResponse(ctx, 0, null);
            SR.SetAD_Window_ID(AD_Window_ID);
            SR.SetAD_Survey_ID(AD_Survey_ID);
            SR.SetRecord_ID(Record_ID);
            SR.SetAD_Table_ID(AD_Table_ID);
            SR.SetAD_User_ID(ctx.GetAD_User_ID());
            SR.Set_ValueNoCheck("AD_WF_Activity_ID", AD_WF_Activity_ID);
            if (SR.Save() && surveyResponseValue !=null)
            {
                for (var i = 0; i < surveyResponseValue.Count; i++)
                {

                    MSurveyResponseLine SRL = new MSurveyResponseLine(ctx, 0, null);
                    SRL.SetAD_SurveyResponse_ID(SR.GetAD_SurveyResponse_ID());
                    SRL.SetAD_SurveyValue_ID(surveyResponseValue[i].AD_SurveyValue_ID);
                    SRL.SetQuestion(surveyResponseValue[i].Question);
                    SRL.SetAnswer(surveyResponseValue[i].Answer);
                    SRL.SetAD_SurveyItem_ID(surveyResponseValue[i].AD_SurveyItem_ID);
                    if (SRL.Save()) { 
                    
                    }
                }
            }

            return SR.GetAD_SurveyResponse_ID();
        }

        /// <summary>
        /// Check any record exist in checklist response for docAction
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Tab_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="DocAction"></param>
        /// <returns></returns>
        public bool CheckDocActionCheckListResponse(Ctx ctx, int AD_Window_ID, int AD_Tab_ID, int Record_ID, string DocAction, int AD_Table_ID)
        {
            if (AD_Window_ID == 0)
            {
                return false;
            }

            string sql = "SELECT ad_surveyassignment_ID,IsConditionalChecklist,AD_Survey_ID FROM  ad_surveyassignment WHERE IsActive='Y' AND AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID;
            if (DocAction != "RE")
            {
                sql += " AND docaction='" + DocAction + "'";
            }
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "ad_surveyassignment", true, false), null);
            bool result = true;
            //prepare where condition for filter
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    bool isvalidate = false;
                    //if (Util.GetValueOfString(dt["IsConditionalChecklist"]) == "N")
                    //{
                    isvalidate = Common.checkConditions(ctx, AD_Window_ID, AD_Table_ID, Record_ID, Util.GetValueOfInt(dt["AD_SurveyAssignment_ID"]), Util.GetValueOfString(dt["IsConditionalChecklist"]));
                    //    if (isvalidate)
                    //    {
                    //        isvalidate = true;
                    //    }
                    //}

                    if (!isvalidate)
                    {
                        continue;
                    }

                    // sql = "SELECT AD_Survey_ID FROM AD_SurveyAssignment WHERE ad_window_id=" + AD_Window_ID + " AND AD_TAb_ID=" + AD_Tab_ID;


                    int AD_Survey_ID = Util.GetValueOfInt(dt["AD_Survey_ID"]);
                    if (AD_Survey_ID > 0)
                    {
                        if (DocAction != "RE")
                        {
                            sql = "SELECT count(AD_SurveyResponse_id) FROM AD_SurveyResponse WHERE AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID=" + AD_Survey_ID + " AND record_ID=" + Record_ID + " AND IsActive='Y'";
                            int count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
                            if (count > 0)
                            {
                                result = true;
                            }
                            else
                            {
                                result = false;
                            }
                        }
                        else
                        {
                            sql = "UPDATE AD_SurveyResponse SET IsActive='N'  WHERE AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID=" + AD_Survey_ID + " AND record_ID=" + Record_ID + " AND IsActive='Y'";
                            DB.ExecuteQuery(sql);
                            result = true;
                        }
                    }
                    else
                    {
                        result = true;
                    }

                }
            }
            return result;
        }

        /// <summary>
        /// Check Doc Action Exist In Table
        /// </summary>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public bool CheckDocActionInTable(int AD_Table_ID)
        {
            string sql = "SELECT Count(AD_Column_ID) FROM AD_Column WHERE IsActive='Y' AND ad_table_id=" + AD_Table_ID + " AND AD_Reference_Value_ID= " + 135;
            int count = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            if (count > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// Check Doc Action Exist In Table
        /// </summary>
        /// <param name="AD_Table_ID"></param>
        /// <returns></returns>
        public int CalloutGetTableIDByTab(int AD_Tab_ID)
        {
            string sql = "SELECT AD_Table_ID FROM AD_Tab WHERE IsActive='Y' AND ad_tab_id=" + AD_Tab_ID;
            int AD_Table_ID = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            return AD_Table_ID;
        }

        /// <summary>
        /// Get Response list
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="AD_Record_ID"></param>
        /// <param name="AD_User_ID"></param>
        /// <returns></returns>
        public List<SurveyResponseList> GetResponseList(Ctx ctx, int AD_Window_ID, int AD_Table_ID, int AD_Record_ID, int AD_User_ID,int AD_SurveyResponse_ID)
        {

            List<SurveyResponseList> LsResponse = new List<SurveyResponseList>();
            string sql = @"SELECT SRL.AD_SurveyResponse_ID, 
                            CASE WHEN SI.AnswerType='TX' THEN SRL.ANSWER
                            ELSE SRL.AD_SurveyValue_ID
                            END AS Answer,
                            SRL.AD_SurveyValue_ID,SRL.AD_SurveyItem_ID,SI.AnswerType FROM AD_SurveyResponse SR
            INNER JOIN AD_SurveyResponseLine SRL ON SR.AD_SurveyResponse_ID=SRL.AD_SurveyResponse_ID
            INNER JOIN AD_SurveyItem SI ON SI.AD_SurveyItem_ID=SRL.AD_SurveyItem_ID
            WHERE SR.AD_SurveyResponse_ID="+ AD_SurveyResponse_ID + " AND SR.ad_window_id=" + AD_Window_ID + " AND SR.AD_Table_ID=" + AD_Table_ID + " AND SR.Record_ID=" + AD_Record_ID + " AND SR.ad_user_id=" + AD_User_ID;
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "SR", true, false), null);
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    LsResponse.Add(new SurveyResponseList
                    {
                        AD_SurveyItem_ID = Util.GetValueOfInt(dt["AD_SurveyItem_ID"]),
                        AD_SurveyValue_ID = Util.GetValueOfString(dt["AD_SurveyValue_ID"]),
                        AD_SurveyResponse_ID = Util.GetValueOfInt(dt["AD_SurveyResponse_ID"]),
                        Answer = Util.GetValueOfString(dt["Answer"]),
                        AnswerType = Util.GetValueOfString(dt["AnswerType"]),
                    });
                }
            }
            return LsResponse;
        }

        /// <summary>
        /// Check Response access
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Survey_ID"></param>
        /// <param name="AD_SurveyAssignment_ID"></param>
        /// <param name="AD_User_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="Record_ID"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="IsSelfShow"></param>
        /// <returns></returns>
        public List<UserList> CheckResponseAccess(Ctx ctx,int AD_Survey_ID, int AD_SurveyAssignment_ID, int AD_User_ID, int AD_Role_ID, int Record_ID,int AD_Window_ID,int AD_Table_ID,bool IsSelfShow) {
            string sql = @"SELECT COUNT(AD_ResponseAccess_ID) FROM AD_ResponseAccess  
                            WHERE AD_SurveyAssignment_ID="+ AD_SurveyAssignment_ID + " AND ISActive='Y' AND ((ad_role_id="+ AD_Role_ID + ") OR (ad_user_id="+ AD_User_ID + "))";

            int Count = Util.GetValueOfInt(DB.ExecuteScalar(sql));            
            List<UserList> UList = new List<UserList>();
            bool isSelfExist = false;
            if (Count > 0) {
                sql = "SELECT sr.AD_SurveyResponse_ID, u.ad_user_id,CASE u.ad_user_id WHEN " + AD_User_ID;
                if (DB.IsPostgreSQL())
                {
                    sql += " THEN 'Self' ELSE u.name END AS name,";
                }
                else
                {
                    sql += " THEN CAST( 'Self' AS Nvarchar2(60)) ELSE u.name END  name,";
                }

                sql += " sr.created FROM ad_user u INNER JOIN ad_surveyresponse sr ON u.ad_user_id = sr.ad_user_id WHERE Record_ID=" + Record_ID + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID=" + AD_Survey_ID + @" ORDER BY sr.Created";

                DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "SR", true, false), null);
                if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                    {
                        if (Util.GetValueOfInt(dt["ad_user_id"]) == AD_User_ID)
                        {
                            isSelfExist = true;
                        }

                        UList.Add(new UserList
                        {
                            User_ID = Util.GetValueOfInt(dt["ad_user_id"]),
                            AD_SurveyResponse_ID = Util.GetValueOfInt(dt["AD_SurveyResponse_ID"]),
                            Name = Util.GetValueOfString(dt["name"]),
                            Created = Util.GetValueOfDateTime(dt["created"]).Value.ToLocalTime()
                        });
                    }
                }

            }

            if(!isSelfExist && IsSelfShow)
            {

                sql = @"SELECT sr.AD_SurveyResponse_ID, sr.ad_user_id,'Self' AS name,sr.created

                        FROM ad_surveyresponse sr  WHERE sr.ad_user_id = " + AD_User_ID + " AND Record_ID=" + Record_ID + " AND ad_window_id=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID=" + AD_Survey_ID+@" ORDER BY sr.Created";

                DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "SR", true, false), null);
                if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                    {                       
                        UList.Add(new UserList
                        {
                            User_ID = Util.GetValueOfInt(dt["ad_user_id"]),
                            AD_SurveyResponse_ID = Util.GetValueOfInt(dt["AD_SurveyResponse_ID"]),
                            Name = Util.GetValueOfString(dt["name"]),
                            Created = Util.GetValueOfDateTime(dt["created"]).Value.ToLocalTime()
                        });
                    }
                }
            }

            return UList;
        }

        /// <summary>
        /// Check Checklist Required
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_Window_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns></returns>
        public List<CheckListCondition> IsCheckListRequire(Ctx ctx, int AD_Window_ID, int AD_Table_ID, int Record_ID,int AD_Survey_ID=0)
        {
            string sql = "";
            int responseCount = 0;
            string conditions = "";
            List<CheckListCondition> CList = new List<CheckListCondition>();
            if (Record_ID > 0)
            {
                if (AD_Survey_ID == 0)
                {
                    sql = "SELECT count(AD_SurveyResponse_id) FROM AD_SurveyResponse WHERE AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID=(SELECT AD_Survey_ID FROM  ad_surveyassignment WHERE IsActive='Y' AND AD_Window_ID=" + AD_Window_ID + " AND AD_Table_ID=" + AD_Table_ID + ") AND record_ID=" + Record_ID + " AND IsActive='Y'";
                }
                else
                {
                    sql = "SELECT count(AD_SurveyResponse_id) FROM AD_SurveyResponse WHERE AD_Table_ID=" + AD_Table_ID + " AND AD_Survey_ID="+ AD_Survey_ID + " AND record_ID=" + Record_ID + " AND IsActive='Y'";
                }
                    responseCount = Util.GetValueOfInt(DB.ExecuteScalar(sql));
            }
            
            sql = @"SELECT AD_Column.AD_column_ID,
                            ad_surveyshowcondition.seqno,AD_Column.ColumnName,ad_surveyshowcondition.operation,ad_surveyshowcondition.ad_equalto,ad_surveyshowcondition.Value2,
                            ad_surveyshowcondition.andor,AD_Column.AD_Reference_ID,AD_SurveyAssignment.IsMandatoryToFill
                            FROM  AD_Column                           
                            INNER JOIN ad_surveyshowcondition ON (AD_Column.AD_column_ID=ad_surveyshowcondition.AD_column_ID)
                            INNER JOIN AD_SurveyAssignment ON (AD_SurveyAssignment.AD_SurveyAssignment_ID=AD_SurveyAssignment.ad_surveyassignment_ID)
                            WHERE AD_SurveyAssignment.AD_Window_ID=" + AD_Window_ID+ " AND AD_SurveyAssignment.AD_Table_ID=" + AD_Table_ID + " AND  ad_surveyshowcondition.isActive='Y' AND  AD_SurveyAssignment.isActive='Y' AND AD_Column.AD_Table_ID=" + AD_Table_ID +  @"
                            ORDER BY ad_surveyshowcondition.seqno";
            DataSet _dsDetails = DB.ExecuteDataset(MRole.GetDefault(ctx).AddAccessSQL(sql, "ad_surveyshowcondition", true, false), null);
            //prepare where condition for filter
            if (_dsDetails != null && _dsDetails.Tables[0].Rows.Count > 0)
            {
                int idx = 0;
                foreach (DataRow dt in _dsDetails.Tables[0].Rows)
                {
                    string type = "";
                    string value = Util.GetValueOfString(dt["ad_equalto"]);
                    string columnName = Util.GetValueOfString(dt["ColumnName"]);
                    int displayType = Util.GetValueOfInt(dt["AD_Reference_ID"]);
                    string oprtr = Util.GetValueOfString(dt["operation"]);


                    //Checking data type of column
                    if (columnName.Equals("AD_Language") || columnName.Equals("EntityType") || columnName.Equals("DocBaseType"))
                    {
                        type = typeof(System.String).Name;
                    }
                    else if (columnName.Equals("Posted") || columnName.Equals("Processed") || columnName.Equals("Processing"))
                    {
                        type = typeof(System.Boolean).Name;
                    }
                    else if (columnName.Equals("Record_ID"))
                    {
                        type = typeof(System.Int32).Name;
                    }
                    else
                    {
                        type = VAdvantage.Classes.DisplayType.GetClass(displayType, true).Name;
                    }

                    

                    if (oprtr == "==")
                    {
                        oprtr = "=";
                    }
                    else if (oprtr == "!=")
                    {
                        oprtr = "!";
                    }
                    else if (oprtr == "<=")
                    {
                        oprtr = "<=";
                    }
                    else if (oprtr == "<<")
                    {
                        oprtr = "<";
                    }
                    else if (oprtr == ">>")
                    {
                        oprtr = ">";
                    }
                    else if (oprtr == ">=")
                    {
                        oprtr = ">=";
                    }
                    //else if (oprtr == "~~")
                    //{
                    //    oprtr = " LIKE ";
                    //    value = "%" + value + "%";
                    //}
                    //else if (oprtr == "AB")
                    //{
                    //    oprtr = ">";
                    //}

                    string andOR = " & ";
                    if (Util.GetValueOfString(dt["andor"]) == "O")
                    {
                        andOR = " | ";
                    }


                    if (type == "String")
                    {
                        value = "'" + value + "'";
                    }else if(type.ToLower()=="date" || type.ToLower() == "datetime")
                    {
                        value ="'"+ Convert.ToDateTime(value).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")+"'";
                    }

                    

                    if (idx == 0) // Util.GetValueOfInt(dt["seqno"]) == 10
                    {
                        idx++;
                        if (oprtr.Length == 2)
                        {
                            char[] charArray = oprtr.ToCharArray();
                            conditions += "@" + columnName + "@ " + charArray[0] + " " + value;
                            conditions += " | ";
                            conditions += "@" + columnName + "@ " + charArray[1] + " " + value;
                        }
                        else
                        {
                            conditions += "@" + columnName + "@ " + oprtr + " " + value;
                        }
                    }
                    else
                    {
                        conditions += andOR;
                        if (oprtr.Length == 2)
                        {
                            char[] charArray = oprtr.ToCharArray();
                            conditions += "@" + columnName + "@ " + charArray[0] + " " + value;
                            conditions += " | ";
                            conditions += "@" + columnName + "@ " + charArray[1] + " " + value;
                        }
                        else
                        {
                            conditions += "@" + columnName + "@ " + oprtr + " " + value;
                        }
                    }

                }

            }
            CList.Add(new CheckListCondition
            {
                Condition=conditions,
                ResponseCount= responseCount
            });
            return CList;
        }

    }

    public class SurveyAssignmentsDetails
    {
        public int Window_ID { get; set; }
        public int Survey_ID { get; set; }
        public int DocType_ID { get; set; }
        public string SurveyListFor { get; set; }
        public string DocAction { get; set; }
        public bool ShowAllQuestion { get; set; }
        public int SurveyAssignment_ID { get; set; }
        public string SurveyType { get; set; }
        public bool IsMandatory { get; set; }
        public string SurveyName { get; set; }
        public int QuestionsPerPage { get; set; }
        public bool IsDocActionActive { get; set; }
        public bool IsConditionalChecklist { get; set; }
        public bool IsMandatoryToFill { get; set; }
        public int Limit { get; set; }
        public int ResponseCount { get; set; }
        public int SurveyResponse_ID { get; set; }
        public bool IsSelfshow { get; set; }
        public string ConditionStr { get; set; }
    }

    public class ListSurveyItemValues
    {
        public SurveyItem Item { get; set; }
        public List<SurveyItemValue> Values { get; set; }
    }
    public class SurveyItem
    {
        public int AD_SurveyItem_ID { get; set; }
        public int AD_Survey_ID { get; set; }
        public string Question { get; set; }
        public int LineNo { get; set; }
        public string AnswerType { get; set; }
        public string IsMandatory { get; set; }
        public string IsActive { get; set; }
        public string AnswerSelection { get; set; }
    }
    public class SurveyItemValue
    {
        public int AD_SurveyItem_ID { get; set; }
        public int AD_SurveyValue_ID { get; set; }
        public string Answer { get; set; }
        public int LineNo { get; set; }
        public string IsActive { get; set; }
        public string AnswerSelection { get; set; }
    }
    public class SurveyResponseValue
    {
        public string Question { get; set; }
        public string Answer { get; set; }
        public int AD_Survey_ID { get; set; }
        public int AD_SurveyItem_ID { get; set; }
        public string AD_SurveyValue_ID { get; set; }
        
    }

    public class SurveyResponseList
    {
        public int AD_SurveyResponse_ID { get; set; }
        public int AD_SurveyItem_ID { get; set; }
        public string AD_SurveyValue_ID { get; set; }
        public string Answer { get; set; }
        public string AnswerType { get; set; }
    }

    public class UserList
    {
        public int User_ID { get; set; }
        public string Name { get; set; }
        public int AD_SurveyResponse_ID { get; set; }
        public DateTime Created { get; set; }
    }

    public class CheckListCondition {
        public string Condition { get; set; }
        public int ResponseCount { get; set; }
    }
    
}