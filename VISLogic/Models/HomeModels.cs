using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text.RegularExpressions;
using VAdvantage.Controller;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VIS.Models
{
    # region Count of Home Page
    public class HomeModels
    {
        private VLogger log = VLogger.GetVLogger(typeof(HomeModels).FullName);
        public int FollowUpCnt { get; set; }
        public int AppointmentCnt { get; set; }
        public int ToDoCnt { get; set; }
        public int NotesCnt { get; set; }
        public int IncommingRequestCnt { get; set; }

        public int RequestCnt { get; set; }
        public int NoticeCnt { get; set; }
        public int WorkFlowCnt { get; set; }

        public int TaskAssignByMeCnt { get; set; }
        public int MyTaskCnt { get; set; }
        public int KPICnt { get; set; }

        public string UsrName { get; set; }
        public string UsrEmail { get; set; }
        public string UsrImage { get; set; }
        public string UsrStatus { get; set; }
        public string Greeting { get; set; }
        public HomeFolloUpsInfo HomeFolloUpsInfo;
        //Save User Image
        public int SaveUserImage(Ctx ctx, byte[] buffer, string imageName, bool isSaveInDB)
        {

            MUser user = new MUser(ctx, ctx.GetAD_User_ID(), null);
            int imageID = Util.GetValueOfInt(user.GetAD_Image_ID());

            MImage mimg = new MImage(ctx, imageID, null);
            mimg.ByteArray = buffer;
            mimg.ImageFormat = imageName.Substring(imageName.LastIndexOf('.'));
            mimg.SetName(imageName);
            if (isSaveInDB)
            {
                mimg.SetBinaryData(buffer);
                mimg.SetImageURL(string.Empty);
            }
            else
            {
                //mimg.SetImageURL(HostingEnvironment.MapPath(@"~/Images/100by100"));//Image Saved in File System so instead of byteArray image Url will be set
                mimg.SetImageURL(mimg.ImageFormat);//Image Saved in File System so instead of byteArray image Url will be set
                mimg.SetBinaryData(new byte[0]);


            }
            if (!mimg.Save())
            {
                return 0;
            }
            //mimg = new MImage(ctx, imageID, null);
            user.SetAD_Image_ID(mimg.GetAD_Image_ID());
            if (!user.Save())
            {
                return 0;
            }


            return mimg.GetAD_Image_ID();
        }

        public bool DeleteUserImage(Ctx ctx)
        {
            //MUser user = new MUser(ctx, ctx.GetAD_User_ID(), null);
            //int imgID = user.GetAD_Image_ID();
            //user.SetAD_Image_ID(0);
            //if (!user.Save())
            //{
            //    ValueNamePair pp = VAdvantage.Logging.VLogger.RetrieveError();
            //    log.SaveError("Error Removing User Image", pp.GetValue() + " " + pp.GetName());
            //    return false;
            //}
            object imgID = DB.ExecuteScalar("SELECT AD_Image_ID FROM AD_User WHERE AD_User_ID=" + ctx.GetAD_User_ID());
            if (imgID != null && imgID != DBNull.Value && Convert.ToInt32(imgID) > 0)
            {

                DB.ExecuteQuery("DELETE FROM AD_Image WHERE AD_Image_ID=" + Convert.ToInt32(imgID));
                //MImage img = new MImage(ctx, Convert.ToInt32(imgID), null);
                //log.SaveError("ImageDeleteStart2=", DateTime.Now.Second.ToString());
                //if (!img.Delete(true))
                //{
                //    ValueNamePair pp = VAdvantage.Logging.VLogger.RetrieveError();
                //    log.SaveError("Error Removing Image", pp.GetValue() + " " + pp.GetName());
                //    return false;
                //}
                //log.SaveError("ImageDeleteUpdateStart=", DateTime.Now.Second.ToString());
                DB.ExecuteQuery("UPDATE AD_User Set AD_Image_ID=null WHERE AD_User_ID=" + ctx.GetAD_User_ID());
            }
            return true;
        }

        /// <summary>
        /// Get Home page widget
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<HomeWidget> GetHomeWidget(Ctx ctx, int windowID)
        {

            List<HomeWidget> list = null;
            bool baseLanguage = Env.IsBaseLanguage(ctx, "");// GlobalVariable.IsBaseLanguage();
            string sql = @"SELECT AD_Widget.AD_Widget_ID,AD_Widget.Name,";
            if (baseLanguage)
            {
                sql += "AD_Widget.displayName,";
            }
            else
            {
                sql += "AD_Widget_Trl.Name AS displayName,";
            }
            sql += @" AD_WidgetSize.className,AD_WidgetSize.Rowspan,AD_WidgetSize.Colspan,AD_WidgetSize.AD_WidgetSize_ID,AD_IMAGE.BINARYDATA,AD_ModuleInfo.name AS ModuleName, AD_Window_ID, IsDefault, Sequence FROM AD_Widget 
                            INNER JOIN AD_WidgetSize  ON AD_Widget.AD_Widget_ID=AD_WidgetSize.AD_Widget_ID
                            INNER JOIN AD_Widget_Access ON AD_Widget.AD_Widget_ID=AD_Widget_Access.AD_Widget_ID
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID
                            INNER JOIN AD_ModuleInfo ON AD_ModuleInfo.AD_ModuleInfo_ID=AD_Widget.AD_ModuleInfo_ID";
            if (!baseLanguage)
            {
                sql += " INNER JOIN AD_Widget_Trl ON(AD_Widget_Trl.AD_Widget_ID=AD_Widget.AD_Widget_Id AND AD_Widget_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "')";
            }
                sql += " WHERE AD_WidgetSize.isActive='Y' AND AD_Widget.isActive='Y' AND AD_Widget_Access.isActive='Y' AND AD_Widget_Access.AD_Role_ID=" + ctx.GetAD_Role_ID();
            if(windowID > 0)
            {
                sql += " AND IsWindow='Y'";
            }
            else
            {
                sql += " AND Homepage='Y'";
            }

            sql += " ORDER BY AD_ModuleInfo.name";

            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables.Count > 0)
            {
                

                list = new List<HomeWidget>();
                var row = dataSet.Tables[0].Rows;
                for (int i = 0; i < row.Count; i++)
                {
                    bool WindowSpecific = false;
                    if (windowID> 0 && !string.IsNullOrEmpty(Util.GetValueOfString(row[i]["AD_Window_ID"])))
                    {
                        string[] numbers = Util.GetValueOfString(row[i]["AD_Window_ID"]).Split(',');
                        bool numberExists = Array.Exists(numbers, element => element == Util.GetValueOfString(windowID));
                        if (!numberExists)
                        {
                            continue;
                        }
                        WindowSpecific = true;
                    }
                    string img = "";                   
                    try
                    {
                       img = "<img class='vis-widgetImg' src='data:image/jpg;base64," + Convert.ToBase64String((byte[])row[i]["BINARYDATA"])+"' />";
                    }catch (Exception ex)
                    {
                        img = "<img class='vis-widgetImg vis-widgetdefault' src='Areas/VIS/Images/home/defaultWidget.svg' />";
                    }

                    HomeWidget l = new HomeWidget()
                    {
                        WidgetID = Util.GetValueOfInt(row[i]["AD_Widget_ID"]),
                        KeyID = Util.GetValueOfInt(row[i]["AD_WidgetSize_ID"]),
                        Name = Util.GetValueOfString(row[i]["Name"]),
                        DisplayName = Util.GetValueOfString(row[i]["displayName"]),
                        ClassName = Util.GetValueOfString(row[i]["className"]),
                        Rows = Util.GetValueOfInt(row[i]["Rowspan"]),
                        Cols = Util.GetValueOfInt(row[i]["Colspan"]),
                        Img = img,
                        ModuleName = Util.GetValueOfString(row[i]["ModuleName"]),
                        Type = "W",
                        WindowSpecific = WindowSpecific,
                        IsDefault = Util.GetValueOfString(row[i]["IsDefault"]) == "Y",
                        Sequence = Util.GetValueOfInt(row[i]["Sequence"])
                    };

                    list.Add(l);
                }
            }
            return list;
        }

        /// <summary>
        /// Get Charts, KPI and views
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="windowID"></param>
        /// <returns></returns>
        public List<HomeWidget> GetAnalyticalChart(Ctx ctx, int windowID)
        {
            List<HomeWidget> list = null;
            try
            {
                if (!Env.IsModuleInstalled("VADB_") && Util.GetValueOfInt(MTable.Get_Table_ID("AD_WidgetSize")) == 0)
                {
                    return list;
                }

                string sql = @"SELECT D_Chart.chartType, D_Chart.d_chart_id,D_Chart.Name,colspan,rowspan,'C' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence, IsDefault,AD_IMAGE.BINARYDATA FROM D_Chart INNER JOIN 
                            D_ChartAccess ON (D_Chart.D_Chart_ID=D_ChartAccess.D_Chart_ID)
                            INNER JOIN AD_WidgetSize ON (D_Chart.D_Chart_ID=AD_WidgetSize.D_Chart_ID)
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                           
                            WHERE AD_WidgetSize.isActive='Y' AND  D_ChartAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
                sql += " UNION ALL ";

                sql += @" SELECT RC_KPI.KPIType AS chartType, RC_KPI.RC_KPI_ID AS d_chart_id,RC_KPI.Name,colspan,rowspan,'K' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence ,IsDefault,AD_IMAGE.BINARYDATA FROM RC_KPI INNER JOIN 
                            RC_KPIAccess ON (RC_KPI.RC_KPI_ID=RC_KPIAccess.RC_KPI_ID)
                            INNER JOIN AD_WidgetSize ON (RC_KPI.RC_KPI_ID=AD_WidgetSize.RC_KPI_ID)
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                            
                            WHERE AD_WidgetSize.isActive='Y' AND   RC_KPIAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
                
                sql += " UNION ALL ";

                sql += @" SELECT 'V' AS chartType, RC_View.RC_View_ID AS d_chart_id,RC_View.Name,colspan,rowspan,'V' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence ,IsDefault,AD_IMAGE.BINARYDATA FROM RC_View INNER JOIN 
                            RC_ViewAccess ON (RC_View.RC_View_ID=RC_ViewAccess.RC_View_ID)
                            INNER JOIN AD_WidgetSize ON (RC_View.RC_View_ID=AD_WidgetSize.RC_View_ID)
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                            
                            WHERE AD_WidgetSize.isActive='Y' AND   RC_ViewAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();

                DataSet dataSet = DB.ExecuteDataset(sql);
                if (dataSet != null && dataSet.Tables.Count > 0)
                {
                    list = new List<HomeWidget>();
                    var row = dataSet.Tables[0].Rows;
                    for (int i = 0; i < row.Count; i++)
                    {
                        string chartType = Util.GetValueOfString(row[i]["chartType"]);
                        var newgalary = "";
                        try
                        {
                            newgalary = "data:image/jpg;base64," + Convert.ToBase64String((byte[])row[i]["BINARYDATA"]);
                            chartType = null;
                        }
                        catch (Exception ex)
                        {

                        }
                        if (chartType == "1")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Column.png'>";
                        }
                        else if (chartType == "2")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Line.png'>";
                        }
                        else if (chartType == "3")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Pie.png'>";
                        }
                        else if (chartType == "4")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Bar.png'>";
                        }
                        else if (chartType == "5")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Donut.png' >";
                        }
                        else if (chartType == "6")
                        {
                            newgalary = "<img src='Areas/VADB/Images/Area.png'>";
                        }
                        else if (chartType.ToLower() == "li")
                        {
                            newgalary += "<img src='Areas/VADB/Images/Linear.png'>";
                        }
                        else if (chartType.ToLower() == "ra")
                        {
                            newgalary += "<img src='Areas/VADB/Images/Radial.png'>";
                        }
                        else if (chartType.ToLower() == "te")
                        {
                            newgalary += "<img src='Areas/VADB/Images/Kpi.png' >";
                        }


                        string moduleName = "";
                        if (Util.GetValueOfString(row[i]["Type"]) == "C")
                        {
                            moduleName = "Charts";
                        }
                        else if (Util.GetValueOfString(row[i]["Type"]) == "K")
                        {
                            moduleName = "KPI";
                        }
                        else if (Util.GetValueOfString(row[i]["Type"]) == "V")
                        {
                            moduleName = "Views";
                        }


                        HomeWidget l = new HomeWidget()
                        {
                            WidgetID = Util.GetValueOfInt(row[i]["d_chart_id"]),
                            KeyID = Util.GetValueOfInt(row[i]["AD_WidgetSize_ID"]),
                            Name = Util.GetValueOfString(row[i]["Name"]),
                            DisplayName = Util.GetValueOfString(row[i]["Name"]),
                            ClassName = "",
                            Rows = Util.GetValueOfInt(row[i]["rowspan"]),
                            Cols = Util.GetValueOfInt(row[i]["colspan"]),
                            Img = newgalary,
                            ModuleName = moduleName,
                            Type = Util.GetValueOfString(row[i]["Type"]),
                            WindowSpecific = false,
                            IsDefault = Util.GetValueOfString(row[i]["IsDefault"]) == "Y",
                            Sequence = Util.GetValueOfInt(row[i]["Sequence"])
                        };

                        list.Add(l);
                    }
                }
            }
            catch(Exception ex)
            {

            }
            return list;
        }

        /// <summary>
        /// Get User Widgets
        /// </summary>
        /// <param name="ctx"></param>
        /// <returns></returns>
        public List<HomeWidget> GetUserWidgets(Ctx ctx, int windowID)
        {
            string sql = @"SELECT AD_UserHomeWidget.AD_UserHomeWidget_ID, AD_UserHomeWidget.componentID,componentType,SRNO,AdditionalInfo FROM AD_UserHomeWidget
                           WHERE AD_UserHomeWidget.IsActive='Y' AND AD_Window_ID='"+ windowID + "' AND AD_Role_ID=" + ctx.GetAD_Role_ID() + " AND  AD_User_ID=" + ctx.GetAD_User_ID();

            sql += " ORDER BY SRNO";

            List<HomeWidget> list = null;
            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables.Count > 0)
            {
                list = new List<HomeWidget>();
                var row = dataSet.Tables[0].Rows;
                for (int i = 0; i < row.Count; i++)
                {

                    HomeWidget l = new HomeWidget()
                    {
                        ID = Util.GetValueOfInt(row[i]["AD_UserHomeWidget_ID"]),
                        KeyID = Util.GetValueOfInt(row[i]["componentID"]),
                        Type = Util.GetValueOfString(row[i]["componentType"]),
                        SRNO = Util.GetValueOfInt(row[i]["SRNO"]),
                        AdditionalInfo = Util.GetValueOfString(row[i]["AdditionalInfo"])
                        //Rows = Util.GetValueOfInt(row[i]["Rowspan"]),
                        //Cols = Util.GetValueOfInt(row[i]["Colspan"])
                    };

                    list.Add(l);
                }
            }
            return list;
        }

        /// <summary>
        /// Getting Widget Field for dynamic controls
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_WidgetSize_ID">AD_WidgetSize_ID</param>
        /// <returns>Field Details</returns>

        public DynamicWidgetResult GetDynamicWidget(Ctx ctx, int widget_ID, int windowNo, int tabID, int tableID)
        {
            DynamicWidgetResult result = new DynamicWidgetResult();
            string isAdvanceSearch = "";
            string widgetStyle = "";
            string randomColor = "";
            string msg = "";
            bool baseLanguage = Env.IsBaseLanguage(ctx, "");
            int sequenceNo = 0;
            string sql = @"SELECT AD_WidgetField.Control_Type,AD_WidgetField.BadgeStyle,AD_WidgetField.IsBadge,AD_WidgetField.BadgeValue, AD_WidgetField.IsSameLine, AD_WidgetField.OnClick,
                   AD_WidgetField.HtmlStyle, AD_WidgetField.SeqNo, AD_WidgetField.OnClick, AD_WidgetField.AD_Image_ID, WD.HtmlStyle AS WidgetHTML, WD.IsShowAdvanced,WD.IsShowRandomColor, ";

            if (baseLanguage)
            {
                sql += " AD_WidgetField.Name ";
            }
            else
            {
                sql += " AD_WidgetField_Trl.Name ";
            }

            sql += @"FROM AD_Widget WD LEFT OUTER JOIN AD_WidgetField 
                    ON(WD.AD_WIDGET_ID=AD_WidgetField.AD_WIDGET_ID) AND AD_WidgetField.IsActive='Y'  AND AD_WidgetField.AD_WIDGET_ID =" + widget_ID;
            if (!baseLanguage)
            {
                sql += " INNER JOIN AD_WidgetField_Trl ON(AD_WidgetField_Trl.AD_WidgetField_ID=AD_WidgetField.AD_WidgetField_ID AND AD_WidgetField_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "' AND AD_WidgetField_Trl.isActive='Y' )";
            }

            sql += " WHERE WD.WidgetType='D' AND WD.IsActive='Y' And WD.AD_WIDGET_ID =" + widget_ID;
            List<DynamicWidget> list = new List<DynamicWidget>(); ;
            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
            {
                var row = dataSet.Tables[0].Rows;
                widgetStyle = Util.GetValueOfString(row[0]["WidgetHTML"]);
                isAdvanceSearch = Util.GetValueOfString(row[0]["IsShowAdvanced"]);
                randomColor = Util.GetValueOfString(row[0]["IsShowRandomColor"]);
                if (!string.IsNullOrEmpty(Util.GetValueOfString(row[0]["Control_Type"])))
                {
                    for (int i = 0; i < row.Count; i++)
                    {
                        try
                        {
                            string imageURL = "";
                            sequenceNo = Util.GetValueOfInt(row[i]["SeqNo"]);
                            string badgeValue = Util.GetValueOfString(row[i]["BadgeValue"]);
                            int Ad_Image_ID = Util.GetValueOfInt(row[i]["AD_Image_ID"]);
                            if (Ad_Image_ID > 0)
                            {
                                var img = new VAdvantage.Model.MImage(ctx, Ad_Image_ID, null);
                                if (img.GetFontName() != null && img.GetFontName().Length > 0)
                                {
                                    if (img.Get_Value("FontStyle") != null)
                                    {
                                        imageURL = "<i class='" + img.GetFontName() + "' style='" + img.Get_Value("FontStyle") + "'></i>";
                                    }
                                    else
                                    {
                                        imageURL = "<i class='" + img.GetFontName() + "'></i>";
                                    }
                                }
                                else if (img.GetImageURL() != null && img.GetImageURL().Length > 0)
                                {
                                    imageURL = "<img src ='" + ctx.GetApplicationUrl() + img.GetImageURL() + "'></img>";
                                }
                                else if (img.GetBinaryData() != null)
                                {
                                    imageURL = "<img src ='data:image/*;base64, " + Convert.ToBase64String((byte[])img.GetBinaryData()) + "'></img>";
                                }
                            }

                            if (badgeValue.StartsWith("@SQL="))
                            {
                                badgeValue = badgeValue.Substring(5);
                                var sqlTest = badgeValue.ToUpper();
                                if ((sqlTest.IndexOf("INSERT ") != -1) || (sqlTest.IndexOf("DELETE ") != -1) || (sqlTest.IndexOf("UPDATE ") != -1) || (sqlTest.IndexOf("DROP ") != -1) || (sqlTest.IndexOf("TRUNCATE ") != -1))
                                    badgeValue = "";
                                else
                                {
                                    string query = Env.ParseContext(ctx, windowNo, badgeValue, false);
                                    string pattern = @"FROM\s+([\w.]+)";
                                    Match match = Regex.Match(query, pattern, RegexOptions.IgnoreCase);
                                    if (match.Success)
                                    {
                                        string tableName = match.Groups[1].Value;
                                        query = MRole.GetDefault(ctx).AddAccessSQL(query, tableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);
                                        badgeValue = Util.GetValueOfString(DB.ExecuteScalar(query));
                                    }
                                    else
                                    {
                                        badgeValue = "";
                                    }
                                }
                            }

                            DynamicWidget l = new DynamicWidget()
                            {
                                ControlType = Util.GetValueOfString(row[i]["Control_Type"]),
                                SeqNo = sequenceNo,
                                Name = Util.GetValueOfString(row[i]["Name"]),
                                HtmlStyle = Util.GetValueOfString(row[i]["HtmlStyle"]),
                                OnClick = Newtonsoft.Json.JsonConvert.DeserializeObject<ActionParams>(Util.GetValueOfString(row[i]["OnClick"]).ToString()),
                                IsSameLine = Util.GetValueOfString(row[i]["IsSameLine"]),
                                IsBadge = Util.GetValueOfString(row[i]["IsBadge"]),
                                BadgeStyle = Util.GetValueOfString(row[i]["BadgeStyle"]),
                                BadgeName = badgeValue,
                                ImageURL = imageURL,
                            };
                            list.Add(l);
                        }
                        catch (Exception ex)
                        {
                            msg += Util.GetValueOfString(row[i]["Name"]) + ", ";
                        }
                    }
                }
            }
            if (isAdvanceSearch == "Y" && tableID != 0 && tabID != 0)
            {
                string query = $@"SELECT AD_UserQuery_ID,Name,IsShowOnLandingPage,TargetView,AD_CardView_ID,Code,
                (SELECT TableName FROM AD_Table WHERE AD_Table_ID={tableID}) AS TableName,
                (SELECT WhereClause FROM AD_Tab WHERE AD_Tab_ID={tabID}) AS TabWhere
                FROM AD_UserQuery WHERE 
                AD_Client_ID = { ctx.GetAD_Client_ID() } AND IsActive='Y' 
                AND (AD_Tab_ID={ tabID } AND AD_Table_ID= { tableID }) 
                ORDER BY Upper(Name), AD_UserQuery_ID";
                DataSet ds = DB.ExecuteDataset(query);
                if (ds != null && ds.Tables.Count > 0)
                {
                    var row = ds.Tables[0].Rows;
                    for (int i = 0; i < row.Count; i++)
                    {
                        sequenceNo += sequenceNo + 10;
                        string code = Util.GetValueOfString(row[i]["Code"]);
                        string tableName = Util.GetValueOfString(row[i]["TableName"]);
                        string tabLayout = Util.GetValueOfString(row[i]["TargetView"]);
                        string AD_CardView_ID = Util.GetValueOfString(row[i]["AD_CardView_ID"]);
                        string TabWhere = Util.GetValueOfString(row[i]["TabWhere"]);
                        if (Util.GetValueOfString(row[i]["IsShowOnLandingPage"]) == "Y")
                        {
                            string badgeSql = "SELECT COUNT(*) FROM " + tableName;
                            if (!String.IsNullOrEmpty(code))
                            {
                                if (!string.IsNullOrEmpty(TabWhere))
                                {
                                    TabWhere= Env.ParseContext(ctx, windowNo, TabWhere, false);
                                    badgeSql += " WHERE " + code + " AND " + TabWhere;
                                }
                                else
                                {
                                    badgeSql += " WHERE " + code;
                                }
                            }
                            else if (!string.IsNullOrEmpty(TabWhere))
                            {
                                TabWhere = Env.ParseContext(ctx, windowNo, TabWhere, false);
                                badgeSql += " WHERE " + TabWhere;
                            }

                            badgeSql = MRole.GetDefault(ctx).AddAccessSQL(badgeSql, tableName, MRole.SQL_FULLYQUALIFIED, MRole.SQL_RO);

                            string badgeCount = Util.GetValueOfString(DB.ExecuteScalar(badgeSql));
                            ActionParams obj = new ActionParams
                            {
                                //TabWhereClause = Util.GetValueOfString(code),
                                AD_UserQuery_ID = Util.GetValueOfInt(row[i]["AD_UserQuery_ID"]),
                                Card_ID = Util.GetValueOfString(AD_CardView_ID),
                                TabLayout = Util.GetValueOfString(tabLayout),
                                TabIndex = Util.GetValueOfString(0),
                                IsShowFilterPanel=true
                            };
                            DynamicWidget l = new DynamicWidget()
                            {
                                ControlType = "LN",
                                SeqNo = sequenceNo,
                                Name = Util.GetValueOfString(row[i]["Name"]),
                                HtmlStyle = "",
                                OnClick = obj,
                                IsSameLine = "N",
                                IsBadge = "Y",
                                BadgeStyle = "",
                                BadgeName = badgeCount,
                                ImageURL = "",
                            };
                            list.Add(l);
                        }
                    }
                }
            }
            result.Widgets = list;
            result.WidgetStyle = widgetStyle;
            result.IsRandomColor = randomColor;
            result.MSG = msg;
            return result;
        }


        /// <summary>
        /// Get Widget Style and wigdet ID
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="userHomeWidget_ID">AD_UserHomeWidget_ID</param>
        /// <returns>AD_WidgetSize_ID and HtmlStyle</returns>
        public List<WidgetSizeID> GetWidgetID(Ctx ctx, int userHomeWidgetID)
        {
            string sql = @"SELECT WS.AD_WidgetSize_ID,WD.HtmlStyle,WD.AD_Widget_ID,WD.IsShowAdvanced FROM Ad_widgetSize WS
                       INNER JOIN AD_Widget WD ON(WD.AD_Widget_ID=WS.AD_Widget_ID) 
                       WHERE WS.AD_WidgetSize_ID IN (SELECT COMPONENTID  FROM AD_UserHomeWidget 
                       WHERE COMPONENTTYPE='W' AND AD_UserHomeWidget_ID= " + userHomeWidgetID + " )" +
                       " AND WD.IsActive='Y' AND WS.IsActive='Y' ";
            List<WidgetSizeID> list = null;
            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables.Count > 0)
            {
                list = new List<WidgetSizeID>();
                var row = dataSet.Tables[0].Rows;
                for (int i = 0; i < row.Count; i++)
                {

                    WidgetSizeID l = new WidgetSizeID()
                    {
                        AD_WidgetSize_ID = Util.GetValueOfInt(row[i]["AD_WidgetSize_ID"]),
                        AD_Widget_ID = Util.GetValueOfInt(row[i]["AD_Widget_ID"]),
                        WidgetStyle = Util.GetValueOfString(row[i]["HtmlStyle"]),
                        IsShowAdvanced = Util.GetValueOfString(row[i]["IsShowAdvanced"])
                    };

                    list.Add(l);
                }
            }
            return list;
        }

        /// <summary>
        /// Save Dasboard
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="widgetSizes"></param>
        /// <returns></returns>
        public int SaveDashboard(Ctx ctx, List<WidgetSize> widgetSizes, int windowID)
        {
            DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE AD_Window_ID="+ windowID + " AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND AD_Role_ID=" + ctx.GetAD_Role_ID());
            for (int i = 0; i < widgetSizes.Count; i++)
            {
                MUserHomeWidget mUserHomeWidget = new MUserHomeWidget(ctx, 0, null);
                mUserHomeWidget.SetSRNO(widgetSizes[i].SRNO);
                mUserHomeWidget.SetComponentID(widgetSizes[i].KeyID);
                mUserHomeWidget.SetComponentType(widgetSizes[i].Type);
                mUserHomeWidget.SetAD_User_ID(ctx.GetAD_User_ID());
                mUserHomeWidget.SetAD_Role_ID(ctx.GetAD_Role_ID());
                mUserHomeWidget.Set_Value("AD_Window_ID", windowID);
                mUserHomeWidget.Set_Value("AdditionalInfo", widgetSizes[i].AdditionalInfo);
                mUserHomeWidget.Save();
            }
            return 1;
        }

        /// <summary>
        /// Save widget on drop
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="widgetSizes"></param>
        /// <returns></returns>
        public int SaveSingleWidget(Ctx ctx, List<WidgetSize> widgetSizes, int windowID)
        {
            MUserHomeWidget mUserHomeWidget = new MUserHomeWidget(ctx, 0, null);
            for (int i = 0; i < widgetSizes.Count; i++)
            {
                mUserHomeWidget.SetSRNO(widgetSizes[i].SRNO);
                mUserHomeWidget.SetComponentID(widgetSizes[i].KeyID);
                mUserHomeWidget.SetComponentType(widgetSizes[i].Type);
                mUserHomeWidget.SetAD_User_ID(ctx.GetAD_User_ID());
                mUserHomeWidget.SetAD_Role_ID(ctx.GetAD_Role_ID());
                mUserHomeWidget.Set_Value("AD_Window_ID", windowID);
                mUserHomeWidget.Save();
            }
            return mUserHomeWidget.Get_ID();
        }

        /// <summary>
        /// Delete Widgets
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public int DeleteWidgetFromHome(Ctx ctx, int id)
        {
            DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE  AD_UserHomeWidget_ID=" + id);
            return 1;
        }

    }
    #endregion

    #region Follups
    //follups data
    public class HomeFolloUps
    {

        public int ChatID { get; set; }
        public int ChatEntryID { get; set; }
        public int EntryID { get; set; }
        public int TableID { get; set; }
        public string CName { get; set; }
        public int RecordID { get; set; }
        public int WinID { get; set; }
        public int SubscriberID { get; set; }

        public string Name { get; set; }
        public string ChatData { get; set; }
        public string WinName { get; set; }
        public string WinImage { get; set; }
        //public object UsrImage { get; set; }
        public int AD_Image_ID { get; set; }
        public DateTime Cdate { get; set; }
        public string TableName { get; set; }
        public int AD_User_ID { get; set; }
        public string Identifier { get; set; }
    }
    //follups usrimage
    public class FllUsrImages
    {
        public object UserImg { get; set; }
        public int AD_Image_ID { get; set; }
    }
    //follups list
    public class HomeFolloUpsInfo
    {
        public int FllCnt { get; set; }
        public List<FllUsrImages> lstUserImg { get; set; }
        public List<HomeFolloUps> lstFollowups { get; set; }
    }


    #endregion

    #region Notice
    public class HomeNotice
    {
        public int AD_Note_ID { get; set; }
        public int AD_Table_ID { get; set; }
        public int AD_Window_ID { get; set; }
        public int Record_ID { get; set; }
        public string MsgType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string TableName { get; set; }
        public DateTime CDate { get; set; }
        public bool SpecialTable { get; set; }
        public string ProcessTableName { get; set; }
        public int ProcessWindowID { get; set; }
    }

    #endregion

    #region Request
    public class HomeRequest
    {
        public int R_Request_ID { get; set; }
        public int AD_Window_ID { get; set; }
        public string DocumentNo { get; set; }
        public string TableName { get; set; }
        public string Name { get; set; }
        public string CaseType { get; set; }
        public string Summary { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime? NextActionDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    #endregion

    public class WidgetSize
    {
        public int KeyID { get; set; }
        public int SRNO { get; set; }
        public string Type { get; set; }
        public string AdditionalInfo { get; set; }
    }

    public class DynamicWidgetResult
    {
        public List<DynamicWidget> Widgets { get; set; }
        public string WidgetStyle { get; set; }
        public string IsRandomColor { get; set; }
        public string MSG { get; set; }
    }

    public class DynamicWidget
    {
        public string ControlType { get; set; }
        public string Name { get; set; }
        public string HtmlStyle { get; set; }
        public ActionParams OnClick { get; set; }
        public string IsSameLine { get; set; }
        public int SeqNo { get; set; }
        public string ImageURL { get; set; }
        public string BadgeName { get; set; }
        public string IsBadge { get; set; }
        public string BadgeStyle { get; set; }
    }
    public class WidgetSizeID
    {
        public string WidgetStyle { get; set; }
        public string IsShowAdvanced { get; set; }
        public int AD_WidgetSize_ID { get; set; }
        public int AD_Widget_ID { get; set; }
    }

    public class HomeWidget : WidgetSize
    {
        public int ID { get; set; }
        public int WidgetID { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public int Rows { get; set; }
        public int Cols { get; set; }
        public string ClassName { get; set; }
        public string Img { get; set; }
        public string ModuleName { get; set; }
        public bool WindowSpecific { get; set; }
        public bool IsDefault {  get; set; }
        public Int32 Sequence { get; set; } 
    }


}

