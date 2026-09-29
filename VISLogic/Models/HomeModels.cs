using CoreLibrary.DataBase;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text.RegularExpressions;
using VAdvantage.Classes;
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
        public int UnreadMessageCount { get; set; }

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

        //  -1 = not resolved yet, 0 = not translated, 1 = translated. Resolved once per application life.
        private static int _isWidgetDescriptionTranslated = -1;

        /// <summary>
        /// Is AD_Widget.Description flagged as a translated column, i.e. also available on AD_Widget_Trl
        /// </summary>
        /// <returns>true when the description can be read from AD_Widget_Trl</returns>
        private static bool IsWidgetDescriptionTranslated()
        {
            if (_isWidgetDescriptionTranslated < 0)
            {
                string isTrl = Util.GetValueOfString(DB.ExecuteScalar(@"SELECT c.IsTranslated FROM AD_Column c
                            INNER JOIN AD_Table t ON (c.AD_Table_ID=t.AD_Table_ID)
                            WHERE t.TableName='AD_Widget' AND c.ColumnName='Description'"));
                _isWidgetDescriptionTranslated = "Y".Equals(isTrl) ? 1 : 0;
            }
            return _isWidgetDescriptionTranslated == 1;
        }

        //  TableName -> does that table carry a Description column. Resolved once per table per application life.
        private static readonly Dictionary<string, bool> _hasDescriptionColumn = new Dictionary<string, bool>();

        /// <summary>
        /// Does the given table carry a Description column. Used for the analytical tables, which belong to
        /// the VADB module and are therefore not guaranteed to have one.
        /// </summary>
        /// <param name="tableName">table to check, always a literal from this class</param>
        /// <returns>true when Description can be selected from that table</returns>
        private static bool HasDescriptionColumn(string tableName)
        {
            lock (_hasDescriptionColumn)
            {
                bool exists;
                if (!_hasDescriptionColumn.TryGetValue(tableName, out exists))
                {
                    exists = Util.GetValueOfInt(DB.ExecuteScalar(@"SELECT COUNT(*) FROM AD_Column c
                                INNER JOIN AD_Table t ON (c.AD_Table_ID=t.AD_Table_ID)
                                WHERE t.TableName='" + tableName + @"' AND c.ColumnName='Description' AND c.IsActive='Y'")) > 0;
                    _hasDescriptionColumn[tableName] = exists;
                }
                return exists;
            }
        }

        /// <summary>
        /// Description column for one branch of the analytical UNION, kept type compatible across branches
        /// </summary>
        /// <param name="tableName">table of that branch</param>
        /// <returns>select list fragment, always ending with a comma</returns>
        private static string GetDescriptionColumn(string tableName)
        {
            return HasDescriptionColumn(tableName) ? " " + tableName + ".Description," : " '' AS Description,";
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
                sql += "AD_Widget.Description,AD_Widget.Help,";
            }
            else
            {
                sql += "AD_Widget_Trl.displayName AS displayName,";
                //  Description is only present on AD_Widget_Trl when the dictionary column is marked as translated
                sql += IsWidgetDescriptionTranslated()
                    ? "COALESCE(AD_Widget_Trl.Description, AD_Widget.Description) AS Description,COALESCE(AD_Widget_Trl.Help, AD_Widget.Help) AS Help,"
                    : "AD_Widget.Description,AD_Widget.Help,";
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
            if (windowID > 0)
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
                    if (windowID > 0 && !string.IsNullOrEmpty(Util.GetValueOfString(row[i]["AD_Window_ID"])))
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
                        var binaryData = row[i]["BINARYDATA"];
                        if (binaryData == null || binaryData == DBNull.Value)
                        {
                            img = "<img class='vis-widgetImg vis-widgetdefault' src='Areas/VIS/Images/home/defaultWidget.svg'/>";
                        }
                        else
                        {
                            byte[] imageData = (byte[])row[i]["BINARYDATA"];
                            if (imageData.Length > 10 * 1024)
                            {
                                img = "<img class='vis-widgetImg vis-widgetdefault' src='Areas/VIS/Images/home/defaultWidget.svg' />";
                            }
                            else
                            {
                                img = "<img class='vis-widgetImg' src='data:image/jpg;base64," + Convert.ToBase64String(imageData) + "' />";
                            }
                        }
                        
                    }
                    catch (Exception ex)
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
                        Sequence = Util.GetValueOfInt(row[i]["Sequence"]),
                        Description = Util.GetValueOfString(row[i]["Description"]),
                        Help = Util.GetValueOfString(row[i]["Help"])
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
            bool baseLanguage = Env.IsBaseLanguage(ctx, "");
            List<HomeWidget> list = null;
            try
            {
                if (!Env.IsModuleInstalled("VADB_") && Util.GetValueOfInt(MTable.Get_Table_ID("AD_WidgetSize")) == 0)
                {
                    return list;
                }

                string sql = @"SELECT D_Chart.chartType, D_Chart.d_chart_id,";
                if (baseLanguage)
                {
                    sql += " D_Chart.Name,";
                }
                else
                {
                    sql += "D_Chart_Trl.Name,";
                }
                sql += GetDescriptionColumn("D_Chart");
                sql += @" colspan,rowspan,'C' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence, IsDefault,AD_IMAGE.BINARYDATA,D_Chart.AD_Window_ID FROM D_Chart INNER JOIN 
                            D_ChartAccess ON (D_Chart.D_Chart_ID=D_ChartAccess.D_Chart_ID)
                            INNER JOIN AD_WidgetSize ON (D_Chart.D_Chart_ID=AD_WidgetSize.D_Chart_ID)";
                if (!baseLanguage)
                {
                    sql += " INNER JOIN D_Chart_Trl ON(D_Chart_Trl.D_Chart_ID=D_Chart.D_Chart_Id AND D_Chart_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "')";
                }
                sql += @"LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                           
                            WHERE D_Chart.isActive='Y' AND AD_WidgetSize.isActive='Y' AND  D_ChartAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
                if (windowID > 0)
                {
                    sql += " AND IsWindow='Y'";
                }
                else
                {
                    sql += " AND Homepage='Y'";
                }

                sql += " UNION ALL ";

                sql += @" SELECT RC_KPI.KPIType AS chartType, RC_KPI.RC_KPI_ID AS d_chart_id,";

                if (baseLanguage)
                {
                    sql += "  RC_KPI.Name,";
                }
                else
                {
                    sql += "RC_KPI_Trl.Name,";
                }

                sql += GetDescriptionColumn("RC_KPI");
                sql += @" colspan,rowspan,'K' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence ,IsDefault,AD_IMAGE.BINARYDATA,RC_KPI.AD_Window_ID FROM RC_KPI INNER JOIN 
                            RC_KPIAccess ON (RC_KPI.RC_KPI_ID=RC_KPIAccess.RC_KPI_ID)
                            INNER JOIN AD_WidgetSize ON (RC_KPI.RC_KPI_ID=AD_WidgetSize.RC_KPI_ID)";
                if (!baseLanguage)
                {
                    sql += " INNER JOIN RC_KPI_Trl ON(RC_KPI_Trl.RC_KPI_ID=RC_KPI.RC_KPI_Id AND RC_KPI_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "')";
                }
                sql += @" LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                            
                            WHERE RC_KPI.isActive='Y' AND AD_WidgetSize.isActive='Y' AND   RC_KPIAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
                if (windowID > 0)
                {
                    sql += " AND IsWindow='Y'";
                }
                else
                {
                    sql += " AND Homepage='Y'";
                }

                sql += " UNION ALL ";

                sql += @" SELECT 'V' AS chartType, RC_View.RC_View_ID AS d_chart_id,";

                if (baseLanguage)
                {
                    sql += " RC_View.Name,";
                }
                else
                {
                    sql += " RC_View_Trl.Name,";
                }
                sql += GetDescriptionColumn("RC_View");
                sql += @" colspan,rowspan,'V' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence ,IsDefault,AD_IMAGE.BINARYDATA, RC_View.AD_Window_ID FROM RC_View INNER JOIN 
                            RC_ViewAccess ON (RC_View.RC_View_ID=RC_ViewAccess.RC_View_ID)
                            INNER JOIN AD_WidgetSize ON (RC_View.RC_View_ID=AD_WidgetSize.RC_View_ID)";
                if (!baseLanguage)
                {
                    sql += " INNER JOIN RC_View_Trl ON(RC_View_Trl.RC_View_ID=RC_View.RC_View_Id AND RC_View_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "')";
                }
                sql += @" LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                            
                            WHERE RC_View.isActive='Y' AND AD_WidgetSize.isActive='Y' AND   RC_ViewAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
                if (windowID > 0)
                {
                    sql += " AND IsWindow='Y'";
                }
                else
                {
                    sql += " AND Homepage='Y'";
                }

                DataSet dataSet = DB.ExecuteDataset(sql);
                if (dataSet != null && dataSet.Tables.Count > 0)
                {
                    list = new List<HomeWidget>();
                    var row = dataSet.Tables[0].Rows;
                    for (int i = 0; i < row.Count; i++)
                    {

                        bool WindowSpecific = false;
                        if (windowID > 0 && !string.IsNullOrEmpty(Util.GetValueOfString(row[i]["AD_Window_ID"])))
                        {
                            string[] numbers = Util.GetValueOfString(row[i]["AD_Window_ID"]).Split(',');
                            bool numberExists = Array.Exists(numbers, element => element == Util.GetValueOfString(windowID));
                            if (!numberExists)
                            {
                                continue;
                            }
                            WindowSpecific = true;
                        }


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
                            WindowSpecific = WindowSpecific,
                            IsDefault = Util.GetValueOfString(row[i]["IsDefault"]) == "Y",
                            Sequence = Util.GetValueOfInt(row[i]["Sequence"]),
                            Description = Util.GetValueOfString(row[i]["Description"])
                        };

                        list.Add(l);
                    }
                }
            }
            catch (Exception ex)
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
            return GetUserWidgets(ctx, windowID, 0);
        }

        /// <summary>
        /// Layout of a window/dashboard. dashboardID = 0 is the legacy home layout (the user's rows for
        /// the role); a dashboard has one layout keyed by AD_Dashboard_ID, readable by its owner or, when
        /// shared, by the roles it is assigned to.
        /// </summary>
        public List<HomeWidget> GetUserWidgets(Ctx ctx, int windowID, int dashboardID)
        {
            string filter = LayoutFilter(ctx, windowID, dashboardID, null);
            if (filter == null)
                return new List<HomeWidget>();
            string sql = @"SELECT AD_UserHomeWidget.AD_UserHomeWidget_ID, AD_UserHomeWidget.componentID,componentType,SRNO,AdditionalInfo FROM AD_UserHomeWidget
                           WHERE AD_UserHomeWidget.IsActive='Y' AND " + filter;

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
        /// WHERE clause selecting the AD_UserHomeWidget rows that make up a layout, null when the
        /// dashboard does not exist or is not offered to the user. Legacy home / window layouts are the
        /// user's rows for the current role (AD_User_ID / AD_Role_ID); dashboard rows are keyed by
        /// AD_Dashboard_ID only - who may see them is decided by AD_Dashboard.AD_User_ID and
        /// AD_Dashboard_Access, their AD_User_ID / AD_Role_ID merely record who saved them.
        /// </summary>
        private string LayoutFilter(Ctx ctx, int windowID, int dashboardID, VAdvantage.DataBase.Trx trx)
        {
            if (windowID != 0 || dashboardID <= 0)
                return "AD_Window_ID=" + windowID + " AND AD_Role_ID=" + ctx.GetAD_Role_ID() + " AND AD_User_ID=" + ctx.GetAD_User_ID() + " AND AD_Dashboard_ID IS NULL";

            MDashboard dashboard = LoadDashboard(ctx, dashboardID, trx);
            if (dashboard == null || !(IsOwner(ctx, dashboard) || (IsShared(dashboard) && HasRoleAccess(ctx, dashboardID, trx))))
                return null;
            return "AD_Window_ID=0 AND AD_Dashboard_ID=" + dashboardID;
        }

        private MDashboard LoadDashboard(Ctx ctx, int dashboardID, VAdvantage.DataBase.Trx trx)
        {
            if (dashboardID <= 0)
                return null;
            MDashboard dashboard = new MDashboard(ctx, dashboardID, trx);
            return dashboard.Get_ID() == 0 ? null : dashboard;
        }

        /// <summary>No owner: offered to the roles in AD_Dashboard_Access.</summary>
        private static bool IsShared(MDashboard dashboard)
        {
            return dashboard.Get_Value("AD_User_ID") == null;
        }

        private static bool IsOwner(Ctx ctx, MDashboard dashboard)
        {
            return !IsShared(dashboard) && dashboard.GetAD_User_ID() == ctx.GetAD_User_ID();
        }

        private static bool HasRoleAccess(Ctx ctx, int dashboardID, VAdvantage.DataBase.Trx trx)
        {
            return Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(*) FROM AD_Dashboard_Access WHERE IsActive='Y' AND AD_Dashboard_ID=" + dashboardID
                + " AND AD_Role_ID=" + ctx.GetAD_Role_ID(), null, trx)) > 0;
        }

        private static bool HasReadWriteAccess(Ctx ctx, int dashboardID, VAdvantage.DataBase.Trx trx)
        {
            return Util.GetValueOfInt(DB.ExecuteScalar("SELECT COUNT(*) FROM AD_Dashboard_Access WHERE IsActive='Y' AND IsReadWrite='Y' AND AD_Dashboard_ID=" + dashboardID
                + " AND AD_Role_ID=" + ctx.GetAD_Role_ID(), null, trx)) > 0;
        }

        /// <summary>
        /// Shared dashboard whose assignment to the current role is read / write: full control (layout,
        /// name, roles, delete). Read-only roles only view it and may copy it.
        /// </summary>
        private bool CanManageShared(Ctx ctx, MDashboard dashboard, VAdvantage.DataBase.Trx trx)
        {
            return dashboard != null && IsShared(dashboard) && HasReadWriteAccess(ctx, dashboard.GetAD_Dashboard_ID(), trx);
        }

        /// <summary>Own dashboard, or a shared one with read / write access for the role.</summary>
        private bool CanModify(Ctx ctx, MDashboard dashboard, VAdvantage.DataBase.Trx trx)
        {
            return dashboard != null && (IsOwner(ctx, dashboard) || CanManageShared(ctx, dashboard, trx));
        }

        /// <summary>
        /// Dashboards offered to the signed-in user: the user's own dashboards (AD_Dashboard.AD_User_ID)
        /// and shared dashboards (no owner) assigned to the role in AD_Dashboard_Access. Only when there
        /// is none of either the legacy home layout (ID 0) is offered, so users without dashboards keep
        /// the old Home. Carries the role default, the user's own default (AD_Preference), widget counts
        /// and whether the user may change the dashboard.
        /// </summary>
        public List<DashboardInfo> GetDashboards(Ctx ctx)
        {
            var list = new List<DashboardInfo>();
            // ids come from the session context, inlined because Oracle binds positionally
            // and the same value is needed several times in the statement
            int role = ctx.GetAD_Role_ID();
            int user = ctx.GetAD_User_ID();
            int client = ctx.GetAD_Client_ID();

            // legacy layout without a dashboard row, offered only when no dashboard applies
            DashboardInfo legacy = new DashboardInfo() { AD_Dashboard_ID = 0, Name = "Home", CanEdit = true };

            // one layout per dashboard, whoever saved it
            string layoutRows = " FROM AD_UserHomeWidget u WHERE u.IsActive='Y' AND u.AD_Window_ID=0 AND u.AD_Dashboard_ID=d.AD_Dashboard_ID";
            string sql = @"SELECT d.AD_Dashboard_ID, d.Name, d.Description, d.AD_User_ID, d.Updated, a.IsDefault, a.IsReadWrite, a.SeqNo,
                                  (SELECT COUNT(*)" + layoutRows + @") AS WidgetRows,
                                  (SELECT MAX(u.Updated)" + layoutRows + @") AS LayoutUpdated,
                                  (SELECT COUNT(*) FROM AD_Dashboard_Access x WHERE x.IsActive='Y' AND x.AD_Dashboard_ID=d.AD_Dashboard_ID) AS RoleCount
                           FROM AD_Dashboard d
                           LEFT JOIN AD_Dashboard_Access a ON (a.AD_Dashboard_ID=d.AD_Dashboard_ID AND a.IsActive='Y' AND a.AD_Role_ID=" + role + @")
                           WHERE d.IsActive='Y' AND d.AD_Client_ID IN (0, " + client + @")
                             AND ((d.AD_User_ID IS NULL AND a.AD_Dashboard_Access_ID IS NOT NULL) OR d.AD_User_ID=" + user + @")
                           ORDER BY COALESCE(a.SeqNo, 999999), d.Name";
            DataSet ds = null;
            try
            {
                legacy.WidgetCount = Util.GetValueOfInt(DB.ExecuteScalar(@"SELECT COUNT(*) FROM AD_UserHomeWidget u WHERE u.IsActive='Y' AND u.AD_Window_ID=0
                    AND u.AD_Role_ID=" + role + " AND u.AD_User_ID=" + user + " AND u.AD_Dashboard_ID IS NULL", null, null));
                ds = DB.ExecuteDataset(sql, null);
            }
            catch (Exception ex)
            {
                // dashboard tables not installed yet: Home keeps working with the legacy layout only
                log.Log(Level.WARNING, "GetDashboards", ex);
            }
            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    bool shared = row["AD_User_ID"] == DBNull.Value;
                    object updated = row["LayoutUpdated"] != DBNull.Value ? row["LayoutUpdated"] : row["Updated"];
                    list.Add(new DashboardInfo()
                    {
                        AD_Dashboard_ID = Util.GetValueOfInt(row["AD_Dashboard_ID"]),
                        Name = Util.GetValueOfString(row["Name"]),
                        Description = Util.GetValueOfString(row["Description"]),
                        IsOwner = !shared,
                        IsShared = shared,
                        // shared rows are only listed when the role has access
                        CanEdit = !shared || Util.GetValueOfString(row["IsReadWrite"]) == "Y",
                        CanShare = !shared,
                        RoleCount = shared ? Util.GetValueOfInt(row["RoleCount"]) : 0,
                        IsRoleDefault = Util.GetValueOfString(row["IsDefault"]) == "Y",
                        SeqNo = Util.GetValueOfInt(row["SeqNo"]),
                        WidgetCount = Util.GetValueOfInt(row["WidgetRows"]),
                        Updated = updated == DBNull.Value ? null : Convert.ToDateTime(updated).ToString("yyyy-MM-ddTHH:mm:ss")
                    });
                }
            }

            if (list.Count == 0)
                list.Add(legacy);

            // the user's own default is only honoured while that dashboard is still offered
            int userDefault = GetUserDefaultDashboard(ctx);
            foreach (DashboardInfo d in list)
                d.IsUserDefault = d.AD_Dashboard_ID == userDefault;
            return list;
        }

        /// <summary>Preference attribute holding the user's default dashboard for the current role.</summary>
        private static string DefaultDashboardAttribute(Ctx ctx)
        {
            return "DefaultDashboard_" + ctx.GetAD_Role_ID();
        }

        private int GetUserDefaultDashboard(Ctx ctx)
        {
            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@userid", ctx.GetAD_User_ID());
            param[1] = new SqlParameter("@attr", DefaultDashboardAttribute(ctx));
            object value = DB.ExecuteScalar("SELECT Value FROM AD_Preference WHERE IsActive='Y' AND AD_User_ID=@userid AND Attribute=@attr", param, null);
            return value == null || value == DBNull.Value ? -1 : Util.GetValueOfInt(value);
        }

        /// <summary>
        /// Stores the user's default dashboard for the current role (0 = legacy home layout);
        /// dashboardID below 0 clears it so the role default applies again.
        /// </summary>
        public bool SetDefaultDashboard(Ctx ctx, int dashboardID)
        {
            string attribute = DefaultDashboardAttribute(ctx);
            if (dashboardID > 0 && !GetDashboards(ctx).Exists(d => d.AD_Dashboard_ID == dashboardID))
                return false;

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@userid", ctx.GetAD_User_ID());
            param[1] = new SqlParameter("@attr", attribute);
            int AD_Preference_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Preference_ID FROM AD_Preference WHERE AD_User_ID=@userid AND Attribute=@attr", param, null));

            if (dashboardID < 0)
            {
                if (AD_Preference_ID > 0)
                    DB.ExecuteQuery("DELETE FROM AD_Preference WHERE AD_Preference_ID=" + AD_Preference_ID);
                return true;
            }

            MPreference pref = new MPreference(ctx, AD_Preference_ID, null);
            if (AD_Preference_ID == 0)
            {
                pref.SetClientOrg(ctx.GetAD_Client_ID(), 0);
                pref.SetAD_User_ID(ctx.GetAD_User_ID());
                pref.SetAttribute(attribute);
            }
            pref.SetValue(dashboardID.ToString());
            return pref.Save();
        }

        /// <summary>
        /// Creates a dashboard. Without roles it is owned by the signed-in user; with roles it is a shared
        /// dashboard offered to those roles (readWriteRoleIDs may change it, the login role always can).
        /// With copyFrom >= 0 the layout of that dashboard (0 = legacy home) is copied over. Returns the
        /// new AD_Dashboard_ID, 0 on failure.
        /// </summary>
        public int CreateDashboard(Ctx ctx, string name, int copyFrom, List<int> roleIDs, List<int> readWriteRoleIDs)
        {
            name = (name ?? "").Trim();
            bool shared = roleIDs != null && roleIDs.Count > 0;
            if (name.Length == 0)
                return 0;

            List<HomeWidget> source = copyFrom >= 0 ? GetUserWidgets(ctx, 0, copyFrom) : null;
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("CreateDashboard" + DateTime.Now.Ticks);
            try
            {
                MDashboard dashboard = new MDashboard(ctx, 0, trx);
                if (dashboard.Get_ColumnIndex("AD_User_ID") < 0)
                {
                    // Set_Value on an unknown column is ignored, the dashboard would be saved without an owner
                    log.Severe("AD_Dashboard.AD_User_ID is not defined in the Application Dictionary (AD_Column)");
                    return 0;
                }
                dashboard.SetClientOrg(ctx.GetAD_Client_ID(), 0);
                dashboard.SetName(name);
                dashboard.SetAD_User_ID(shared ? -1 : ctx.GetAD_User_ID());
                if (!dashboard.Save() || (shared && !SetRoles(ctx, dashboard.GetAD_Dashboard_ID(), roleIDs, readWriteRoleIDs, trx)))
                {
                    trx.Rollback();
                    return 0;
                }
                if (source != null)
                {
                    for (int i = 0; i < source.Count; i++)
                    {
                        MUserHomeWidget row = NewUserHomeWidget(ctx, source[i], 0, dashboard.GetAD_Dashboard_ID(), trx);
                        row.SetAdditionalInfo(source[i].AdditionalInfo);
                        if (!row.Save())
                        {
                            trx.Rollback();
                            return 0;
                        }
                    }
                }
                trx.Commit();
                return dashboard.GetAD_Dashboard_ID();
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Turns a dashboard the user owns into a shared dashboard for the given roles: the owner is removed
        /// from AD_Dashboard and the layout stays as it is.
        /// </summary>
        public bool ShareDashboard(Ctx ctx, int dashboardID, List<int> roleIDs, List<int> readWriteRoleIDs)
        {
            if (roleIDs == null || roleIDs.Count == 0)
                return false;
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("ShareDashboard" + DateTime.Now.Ticks);
            try
            {
                MDashboard dashboard = LoadDashboard(ctx, dashboardID, trx);
                if (dashboard == null || !IsOwner(ctx, dashboard))
                    return false;
                dashboard.SetAD_User_ID(-1);
                if (!dashboard.Save() || !SetRoles(ctx, dashboardID, roleIDs, readWriteRoleIDs, trx))
                {
                    trx.Rollback();
                    return false;
                }
                trx.Commit();
                return true;
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Active roles of the login client for the role checklist. Selected / read-write = the shared
        /// dashboard's assignment; for a new / not yet shared dashboard (dashboardID 0 or own) nothing but
        /// the login role. The login role is always selected, read / write and locked, so the user cannot
        /// take away their own access and a shared dashboard always keeps a role that may change it.
        /// </summary>
        public List<DashboardRole> GetDashboardRoles(Ctx ctx, int dashboardID)
        {
            var list = new List<DashboardRole>();
            MDashboard dashboard = LoadDashboard(ctx, dashboardID, null);
            if (dashboardID > 0 && !CanModify(ctx, dashboard, null))
                return list;
            bool assigned = dashboard != null && IsShared(dashboard);
            int loginRole = ctx.GetAD_Role_ID();

            string access = "FROM AD_Dashboard_Access a WHERE a.IsActive='Y' AND a.AD_Role_ID=r.AD_Role_ID AND a.AD_Dashboard_ID=" + dashboardID;
            string sql = "SELECT r.AD_Role_ID, r.Name, "
                + (assigned ? "(SELECT COUNT(*) " + access + ") AS IsSelected, (SELECT COUNT(*) " + access + " AND a.IsReadWrite='Y') AS IsReadWrite"
                            : "0 AS IsSelected, 0 AS IsReadWrite")
                + " FROM AD_Role r WHERE r.IsActive='Y' AND r.AD_Role_ID>0 AND r.AD_Client_ID=" + ctx.GetAD_Client_ID()
                + " ORDER BY r.Name";
            DataSet ds = DB.ExecuteDataset(sql, null);
            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    int roleID = Util.GetValueOfInt(row["AD_Role_ID"]);
                    bool locked = roleID == loginRole;
                    list.Add(new DashboardRole()
                    {
                        AD_Role_ID = roleID,
                        Name = Util.GetValueOfString(row["Name"]),
                        IsSelected = locked || Util.GetValueOfInt(row["IsSelected"]) > 0,
                        IsReadWrite = locked || Util.GetValueOfInt(row["IsReadWrite"]) > 0,
                        IsLocked = locked
                    });
                }
            }
            return list;
        }

        /// <summary>Changes the roles a shared dashboard is offered to (user who may maintain it).</summary>
        public bool SetDashboardRoles(Ctx ctx, int dashboardID, List<int> roleIDs, List<int> readWriteRoleIDs)
        {
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("SetDashboardRoles" + DateTime.Now.Ticks);
            try
            {
                if (!CanManageShared(ctx, LoadDashboard(ctx, dashboardID, trx), trx) || !SetRoles(ctx, dashboardID, roleIDs, readWriteRoleIDs, trx))
                {
                    trx.Rollback();
                    return false;
                }
                trx.Commit();
                return true;
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Syncs AD_Dashboard_Access with the given roles (active roles of the login client only) and their
        /// read / write flag. The login role is always kept and read / write, whatever the client sent, so
        /// the user cannot lock themselves out and the dashboard always has a role that may maintain it.
        /// Existing rows keep their default flag and sequence.
        /// </summary>
        private bool SetRoles(Ctx ctx, int dashboardID, List<int> roleIDs, List<int> readWriteRoleIDs, VAdvantage.DataBase.Trx trx)
        {
            if (roleIDs == null || roleIDs.Count == 0)
                return false;
            int loginRole = ctx.GetAD_Role_ID();
            roleIDs = new List<int>(roleIDs);
            if (!roleIDs.Contains(loginRole))
                roleIDs.Add(loginRole);
            var readWrite = new HashSet<int>(readWriteRoleIDs ?? new List<int>());
            readWrite.Add(loginRole);
            // ints only, so the list is safe to inline
            DataSet ds = DB.ExecuteDataset("SELECT AD_Role_ID FROM AD_Role WHERE IsActive='Y' AND AD_Role_ID>0 AND AD_Client_ID=" + ctx.GetAD_Client_ID()
                + " AND AD_Role_ID IN (" + string.Join(",", roleIDs) + ")", null, trx);
            var valid = new List<int>();
            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                    valid.Add(Util.GetValueOfInt(row[0]));
            }
            // the login role belongs to the login client, so it is only missing when it is inactive
            if (!valid.Contains(loginRole))
                return false;

            DB.ExecuteQuery("DELETE FROM AD_Dashboard_Access WHERE AD_Dashboard_ID=" + dashboardID + " AND AD_Role_ID NOT IN (" + string.Join(",", valid) + ")", null, trx);
            var existing = new Dictionary<int, int>();
            ds = DB.ExecuteDataset("SELECT AD_Role_ID, AD_Dashboard_Access_ID FROM AD_Dashboard_Access WHERE AD_Dashboard_ID=" + dashboardID, null, trx);
            if (ds != null && ds.Tables.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                    existing[Util.GetValueOfInt(row[0])] = Util.GetValueOfInt(row[1]);
            }
            foreach (int roleID in valid)
            {
                bool rw = readWrite.Contains(roleID);
                MDashboardAccess access;
                if (existing.ContainsKey(roleID))
                {
                    access = new MDashboardAccess(ctx, existing[roleID], trx);
                    if (access.IsActive() && access.IsReadWrite() == rw)
                        continue;
                }
                else
                {
                    access = new MDashboardAccess(ctx, 0, trx);
                    access.SetClientOrg(ctx.GetAD_Client_ID(), 0);
                    access.SetAD_Dashboard_ID(dashboardID);
                    access.SetAD_Role_ID(roleID);
                    access.SetIsDefault(false);
                    access.SetSeqNo(10);
                }
                access.SetIsActive(true);
                access.SetIsReadWrite(rw);
                if (!access.Save())
                    return false;
            }
            return true;
        }

        /// <summary>Renames an own dashboard, or a shared one the user may maintain.</summary>
        public bool RenameDashboard(Ctx ctx, int dashboardID, string name)
        {
            name = (name ?? "").Trim();
            MDashboard dashboard = LoadDashboard(ctx, dashboardID, null);
            if (name.Length == 0 || !CanModify(ctx, dashboard, null))
                return false;
            dashboard.SetName(name);
            return dashboard.Save();
        }

        /// <summary>
        /// Deletes an own dashboard, or a shared one with read / write access for the role, together with
        /// every layout, role assignment and default pointing at it.
        /// </summary>
        public bool DeleteDashboard(Ctx ctx, int dashboardID)
        {
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("DeleteDashboard" + DateTime.Now.Ticks);
            try
            {
                MDashboard dashboard = LoadDashboard(ctx, dashboardID, trx);
                if (!CanModify(ctx, dashboard, trx))
                    return false;
                SqlParameter[] param = new SqlParameter[] { new SqlParameter("@dashboard", dashboardID) };
                DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE AD_Dashboard_ID=@dashboard", param, trx);
                DB.ExecuteQuery("DELETE FROM AD_Dashboard_Access WHERE AD_Dashboard_ID=@dashboard", param, trx);
                DB.ExecuteQuery("DELETE FROM AD_Preference WHERE Attribute LIKE 'DefaultDashboard_%' AND Value='" + dashboardID + "'", null, trx);
                if (!dashboard.Delete(true))
                {
                    trx.Rollback();
                    return false;
                }
                trx.Commit();
                return true;
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Getting Widget Field for dynamic controls
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="AD_WidgetSize_ID">AD_WidgetSize_ID</param>
        /// <returns>Field Details</returns>

        public DynamicWidgetResult GetDynamicWidget(Ctx ctx, int widget_ID, int windowNo, int tabID, int tableID)
        {
            List<DataSource> dsObj = new List<DataSource>();
            DynamicWidgetResult result = new DynamicWidgetResult();
            string isAdvanceSearch = "";
            string widgetStyle = "";
            string randomColor = "";
            string msg = "";
            bool baseLanguage = Env.IsBaseLanguage(ctx, "");
            int sequenceNo = 0;
            string sql = @"SELECT WF.Control_Type,WF.BadgeStyle,WF.IsBadge,WF.BadgeValue, WF.IsSameLine, WF.OnClick,
                   WF.HtmlStyle, WF.IsApplyDataSource, WF.SeqNo, WF.OnClick, WF.Top, WF.Suffix, WF.Prefix,  
                   WF.AD_Image_ID, WD.HtmlStyle AS WidgetHTML, WD.IsShowAdvanced,WD.IsShowRandomColor, WF.AD_Tab_ID, WF.AD_Field_ID, ";

            if (baseLanguage)
            {
                sql += " WF.Name ";
            }
            else
            {
                sql += " AD_WidgetField_Trl.Name ";
            }

            sql += @"FROM AD_Widget WD LEFT OUTER JOIN AD_WidgetField WF 
                    ON(WD.AD_WIDGET_ID=WF.AD_WIDGET_ID) AND WF.IsActive='Y'  AND WF.AD_WIDGET_ID =" + widget_ID;
            if (!baseLanguage)
            {
                sql += " INNER JOIN AD_WidgetField_Trl ON(AD_WidgetField_Trl.AD_WidgetField_ID=WF.AD_WidgetField_ID AND AD_WidgetField_Trl.AD_Language='" + Env.GetAD_Language(ctx) + "' AND AD_WidgetField_Trl.isActive='Y' )";
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
                if (row.Count > 0)
                {
                    for (int i = 0; i < row.Count; i++)
                    {
                        try
                        {
                            string imageURL = "";
                            sequenceNo = Util.GetValueOfInt(row[i]["SeqNo"]);
                            string badgeValue = Util.GetValueOfString(row[i]["BadgeValue"]);
                            int Ad_Image_ID = Util.GetValueOfInt(row[i]["AD_Image_ID"]);
                            int widgetTabID = Util.GetValueOfInt(row[i]["AD_Tab_ID"]);
                            int widgetFieldID = Util.GetValueOfInt(row[i]["AD_Field_ID"]);
                            int topTen = Util.GetValueOfInt(row[i]["Top"]);
                            string whereClause = "";
                            ActionParams onClick = Newtonsoft.Json.JsonConvert.DeserializeObject<ActionParams>(Util.GetValueOfString(row[i]["OnClick"]).ToString());
                            if (onClick != null && !string.IsNullOrEmpty(onClick.TabWhereClause))
                            {
                                whereClause = Util.GetValueOfString(onClick.TabWhereClause);
                            }
                            bool isDataSource = Util.GetValueOfString(row[i]["IsApplyDataSource"]) == "Y" ? true : false;
                            if (!isDataSource)
                            {
                                if (Ad_Image_ID > 0)
                                {
                                    var img = new MImage(ctx, Ad_Image_ID, null);
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
                                    OnClick = onClick,
                                    IsSameLine = Util.GetValueOfString(row[i]["IsSameLine"]),
                                    IsBadge = Util.GetValueOfString(row[i]["IsBadge"]),
                                    BadgeStyle = Util.GetValueOfString(row[i]["BadgeStyle"]),
                                    BadgeName = badgeValue,
                                    ImageURL = imageURL,
                                };
                                list.Add(l);
                            }

                            if (isDataSource && widgetTabID > 0 && widgetFieldID > 0)
                            {

                                string query = @"SELECT CM.AD_Column_ID, CM.ColumnName, CM.AD_Reference_ID,CM.IsParent,CM.AD_Reference_Value_ID,
                                         (SELECT TableName FROM AD_Table WHERE AD_Table_ID  IN(SELECT AD_Table_ID FROM AD_Tab WHERE AD_Tab_ID=" + widgetTabID + @")) As TableName,
                                         (SELECT Name FROM AD_Window WHERE AD_Window_ID IN (SELECT AD_Window_ID FROM AD_Tab WHERE AD_Tab_ID = " + widgetTabID + @")) AS WindowName,
                                         (SELECT WhereClause FROM AD_Tab WHERE AD_Tab_ID=" + tabID + @") AS TabWhere
                                         FROM AD_Column CM INNER JOIN AD_Field FD  
                                         ON (CM.AD_Column_ID=FD.AD_Column_ID) WHERE FD.IsActive='Y' AND CM.IsActive='Y' AND FD.AD_Field_ID = " + widgetFieldID;
                                DataSet ds = DB.ExecuteDataset(query);

                                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                                {
                                    var rowCount = ds.Tables[0].Rows;
                                    if (rowCount.Count > 0)
                                    {
                                        bool isParent = Util.GetValueOfString(rowCount[0]["IsParent"]) == "Y" ? true : false;
                                        string columnName = Util.GetValueOfString(rowCount[0]["ColumnName"]);
                                        string tableName = Util.GetValueOfString(rowCount[0]["TableName"]);
                                        string tabWhere = Util.GetValueOfString(rowCount[0]["TabWhere"]);
                                        if (!string.IsNullOrEmpty(tabWhere))
                                        {
                                            tabWhere = Env.ParseContext(ctx, windowNo, tabWhere, false);
                                            if (!string.IsNullOrEmpty(whereClause))
                                            {
                                                whereClause += " AND " + tabWhere;
                                            }
                                            else
                                            {
                                                whereClause = tabWhere;
                                            }
                                        }
                                        dsObj = GetDataSource(ctx, windowNo, Util.GetValueOfInt(rowCount[0]["AD_Column_ID"]), Util.GetValueOfInt(rowCount[0]["AD_Reference_ID"]),
                                            Util.GetValueOfInt(rowCount[0]["AD_Reference_Value_ID"]), columnName, tableName,
                                            isParent, topTen, whereClause);
                                        if (dsObj != null && dsObj.Count > 0)
                                        {

                                            for (int j = 0; j < dsObj.Count; j++)
                                            {
                                                string where;
                                                ActionParams clk = null;
                                                if (onClick != null)
                                                {
                                                    var clonedJson = JsonConvert.SerializeObject(onClick);
                                                    clk = JsonConvert.DeserializeObject<ActionParams>(clonedJson);
                                                }

                                                if (IsInteger(dsObj[j].ID) && dsObj[j].DisplayType !=DisplayType.List)
                                                {
                                                    where = tableName + "." + columnName + " = " + dsObj[j].ID;
                                                }
                                                else
                                                {

                                                    where = tableName + "." + columnName + " = '" + dsObj[j].ID + "' ";
                                                }
                                                if (clk != null)
                                                {
                                                    if (!string.IsNullOrEmpty(clk.TabWhereClause))
                                                    {
                                                        where += " AND " + clk.TabWhereClause;
                                                    }
                                                    clk.TabWhereClause = Util.GetValueOfString(where);
                                                }
                                                else
                                                {
                                                    ActionParams APobj = new ActionParams
                                                    {
                                                        TabWhereClause = Util.GetValueOfString(where),
                                                        TabIndex = Util.GetValueOfString(0),
                                                        ActionType = "W",
                                                        ActionName = Util.GetValueOfString(rowCount[0]["WindowName"])
                                                    };
                                                    clk = APobj;
                                                }
                                                string name = "";
                                                if (!string.IsNullOrEmpty(Util.GetValueOfString(row[i]["Prefix"])))
                                                {
                                                    name = Util.GetValueOfString(row[i]["Prefix"]) + " ";
                                                }
                                                name += dsObj[j].Name;
                                                if (!string.IsNullOrEmpty(Util.GetValueOfString(row[i]["Suffix"])))
                                                {
                                                    name += " " + Util.GetValueOfString(row[i]["Suffix"]);
                                                }

                                                DynamicWidget obj = new DynamicWidget()
                                                {
                                                    ControlType = Util.GetValueOfString(row[i]["Control_Type"]),
                                                    SeqNo = sequenceNo,
                                                    Name = name,
                                                    HtmlStyle = Util.GetValueOfString(row[i]["HtmlStyle"]),
                                                    OnClick = clk,
                                                    IsSameLine = Util.GetValueOfString(row[i]["IsSameLine"]),
                                                    IsBadge = "Y",
                                                    BadgeStyle = Util.GetValueOfString(row[i]["BadgeStyle"]),
                                                    BadgeName = Util.GetValueOfString(dsObj[j].Count),
                                                    ImageURL = imageURL,
                                                };
                                                list.Add(obj);
                                            }

                                        }
                                    }
                                }

                            }

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
                AD_Client_ID = {ctx.GetAD_Client_ID()} AND IsActive='Y' 
                AND (AD_Tab_ID={tabID} AND AD_Table_ID= {tableID}) 
                ORDER BY Upper(Name), AD_UserQuery_ID";

                DataSet ds = DB.ExecuteDataset(query);
                if (ds != null && ds.Tables.Count > 0)
                {
                    var rows = ds.Tables[0].Rows;
                    for (int i = 0; i < rows.Count; i++)
                    {
                        sequenceNo += sequenceNo + 10;
                        string code = Util.GetValueOfString(rows[i]["Code"]);
                        string tableName = Util.GetValueOfString(rows[i]["TableName"]);
                        string tabLayout = Util.GetValueOfString(rows[i]["TargetView"]);
                        string AD_CardView_ID = Util.GetValueOfString(rows[i]["AD_CardView_ID"]);
                        string TabWhere = Util.GetValueOfString(rows[i]["TabWhere"]);
                        if (Util.GetValueOfString(rows[i]["IsShowOnLandingPage"]) == "Y")
                        {
                            string badgeSql = "SELECT COUNT(*) FROM " + tableName;
                            if (!String.IsNullOrEmpty(code))
                            {
                                if (!string.IsNullOrEmpty(TabWhere))
                                {
                                    TabWhere = Env.ParseContext(ctx, windowNo, TabWhere, false);
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
                                AD_UserQuery_ID = Util.GetValueOfInt(rows[i]["AD_UserQuery_ID"]),
                                Card_ID = Util.GetValueOfString(AD_CardView_ID),
                                TabLayout = Util.GetValueOfString(tabLayout),
                                TabIndex = Util.GetValueOfString(0),
                                IsShowFilterPanel = true
                            };
                            DynamicWidget l = new DynamicWidget()
                            {
                                ControlType = "LN",
                                SeqNo = sequenceNo,
                                Name = Util.GetValueOfString(rows[i]["Name"]),
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


        public bool IsInteger(string input)
        {
            int result;
            return int.TryParse(input, out result);
        }

        /// <summary>
        /// Getting most frequent using data from an window 
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="windowNo">windowNo</param>
        /// <param name="columnID">Ad_Column_ID</param>
        /// <param name="AD_Reference_ID">AD_Reference_ID</param>
        /// <param name="AD_Reference_Value_ID">AD_Reference_Value_ID</param>
        /// <param name="columnName">columnName</param>
        /// <param name="TableName">TableName</param>
        /// <param name="IsParent">IsParent</param>
        /// <param name="top">Number of record</param>
        /// <param name="whereClause">SQL Where</param>
        /// <returns>Record's ID, Name and count</returns>
        public List<DataSource> GetDataSource(Ctx ctx, int windowNo, int columnID, int AD_Reference_ID, int AD_Reference_Value_ID,
            string columnName, string TableName, bool IsParent, int top, string whereClause)
        {

            MLookup res = VLookUpFactory.Get(ctx, windowNo, columnID, AD_Reference_ID, columnName, AD_Reference_Value_ID, IsParent, "");

            if (res == null)
                return null;
            VLookUpInfo lInfo = res._vInfo;


            string pTableName = TableName;
            string pColumnName = res.GetColumnName();
            string keyCol = lInfo.keyColumn;
            string tblColName = Convert.ToString(columnName);
            if (pColumnName.IndexOf(".") > -1)
            {
                pColumnName = pColumnName.Substring(pColumnName.IndexOf(".") + 1);
            }
            string displayCol = lInfo.displayColSubQ;
            string tableName = lInfo.tableName;

            if (displayCol.IndexOf("||'^^'|| NVL((SELECT NVL(ImageURL,'')") > 0
                && displayCol.IndexOf("thing.png^^') ||' '||") > 0)
            {
                var displayCol1 = displayCol.Substring(0, displayCol.IndexOf("||'^^'|| NVL((SELECT NVL(Imag"));
                displayCol = displayCol.Substring(displayCol.IndexOf("othing.png^^') ||' '||") + 22);
                displayCol = displayCol1 + "||'_'||" + displayCol;
            }
            if (displayCol.IndexOf("||'^^'|| NVL((SELECT NVL(ImageURL,'')") > 0)
            {
                int startIndex = displayCol.IndexOf("||'^^'|| NVL((SELECT NVL(Imag");
                int endIndex = displayCol.IndexOf("Images/nothing.png^^')") + "Images/nothing.png^^')".Length;
                int length = endIndex - startIndex;
                displayCol = displayCol.Remove(startIndex, length);
                // displayCol = displayCol.Replace(displayCol.Substring(displayCol.IndexOf("||'^^'|| NVL((SELECT NVL(Imag"), displayCol.IndexOf("Images/nothing.png^^')") + 21), "");
            }
            else if (displayCol.IndexOf("nothing.png") > -1)
            {
                displayCol = displayCol.Replace(displayCol.Substring(displayCol.IndexOf("NVL((SELECT NVL(ImageURL,'')"), displayCol.IndexOf("thing.png^^') ||' '||") + 21), "");
            }



            string sql = null;
            if (keyCol == "")
            {
                sql = "SELECT " + pColumnName + "," + pColumnName + " as Name, count(" + pColumnName + ") FROM " + pTableName;
                sql = "SELECT * FROM (" + MRole.GetDefault(ctx).AddAccessSQL(sql, pTableName, true, false);
                if (!string.IsNullOrEmpty(""))
                    sql += " AND " + "";
                if (!string.IsNullOrEmpty(whereClause))
                    sql += " AND " + whereClause;

                sql += " AND " + pColumnName + " IS NOT NULL ";

                sql += " GROUP BY " + pColumnName +
                         " ORDER BY COUNT(" + pColumnName + ") DESC) ";
                if (DB.IsPostgreSQL())
                    sql += " AS foo ";
            }
            else
            {
                if (tableName.Equals("AD_Ref_List"))
                {
                    //sql = "SELECT " + keyCol + ", " + displayCol + " || '('|| count(" + keyCol + ") || ')' FROM " + tableName + " WHERE IsActive='Y'";
                    sql = "SELECT " + tblColName + ", (Select Name from AD_REf_List where Value= " + tblColName + " AND AD_Reference_ID=" + AD_Reference_Value_ID + ")  as name ,count(" + tblColName + ")"
                        + " FROM " + pTableName;// + " WHERE " + pTableName + ".IsActive='Y'";
                    sql = "SELECT * FROM (" + MRole.GetDefault(ctx).AddAccessSQL(sql, pTableName, true, false);
                    if (!string.IsNullOrEmpty(""))
                        sql += " AND " + "";
                    if (!string.IsNullOrEmpty(whereClause))
                        sql += " AND " + whereClause;
                    sql += " GROUP BY " + tblColName +
                             " ORDER BY COUNT(" + tblColName + ") DESC)";
                    pColumnName = tblColName;
                    if (DB.IsPostgreSQL())
                        sql += " AS foo ";
                }
                else
                {

                    sql = "SELECT " + keyCol + " AS colID, " + displayCol + " AS colName FROM " + pTableName + " " + pTableName + " JOIN " + tableName + " " + tableName
                        + " ON " + keyCol + " = " + pTableName + "." + tblColName

                        + " ";// WHERE " + pTableName + ".IsActive='Y'";


                    sql = MRole.GetDefault(ctx).AddAccessSQL(sql, pTableName, true, false);
                    if (!string.IsNullOrEmpty(""))
                        sql += " AND " + "";
                    if (!string.IsNullOrEmpty(whereClause))
                        sql += " AND " + whereClause;
                    string qeury = "SELECT  colID,colName,count(colID)  FROM ( " + sql + " )";
                    if (DB.IsPostgreSQL())
                        qeury += " AS foo ";
                    qeury += " GROUP BY colID, colName ORDER BY COUNT(colID) DESC";
                    sql = qeury;
                }
            }

            //If DB is postgre, then append foo at end of subquery
            /*  if (DB.IsPostgreSQL())
                  sql += " AS foo ";*/

            List<DataSource> keyva = new List<DataSource>();
            DataSet ds = VIS.DBase.DB.ExecuteDatasetPaging(sql, 1, top);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    DataSource val = new DataSource();
                    if (ds.Tables[0].Rows[i][0] == null || ds.Tables[0].Rows[i][0] == DBNull.Value)
                        continue;
                    val.ID = Convert.ToString(ds.Tables[0].Rows[i][0]);
                    val.Name = Convert.ToString(ds.Tables[0].Rows[i][1]);
                    val.Count = Convert.ToInt32(ds.Tables[0].Rows[i][2]);
                    val.DisplayType = AD_Reference_ID;
                    keyva.Add(val);
                }
            }
            return keyva;
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
            return SaveDashboard(ctx, widgetSizes, windowID, 0);
        }

        /// <summary>
        /// Replaces the layout of a window/dashboard (dashboardID = 0: legacy home) in one transaction.
        /// For dashboards the client also sends back the rows it could not render for the current role
        /// (not in that role's catalogue), so they survive a save made under another role.
        /// </summary>
        public int SaveDashboard(Ctx ctx, List<WidgetSize> widgetSizes, int windowID, int dashboardID)
        {
            if (!CanWriteLayout(ctx, windowID, dashboardID))
                return 0;
            VAdvantage.DataBase.Trx trx = VAdvantage.DataBase.Trx.Get("SaveDashboard" + DateTime.Now.Ticks);
            try
            {
                DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE " + LayoutFilter(ctx, windowID, dashboardID, trx), null, trx);
                for (int i = 0; i < widgetSizes.Count; i++)
                {
                    MUserHomeWidget mUserHomeWidget = NewUserHomeWidget(ctx, widgetSizes[i], windowID, dashboardID, trx);
                    mUserHomeWidget.SetAdditionalInfo(widgetSizes[i].AdditionalInfo);
                    if (!mUserHomeWidget.Save())
                    {
                        trx.Rollback();
                        return 0;
                    }
                }
                trx.Commit();
                return 1;
            }
            finally
            {
                trx.Close();
            }
        }

        /// <summary>
        /// Legacy home / window layouts are always writable; a dashboard by its owner, or when shared with
        /// read / write access for the role (read-only roles view it and may copy it).
        /// </summary>
        private bool CanWriteLayout(Ctx ctx, int windowID, int dashboardID)
        {
            return windowID != 0 || dashboardID <= 0 || CanModify(ctx, LoadDashboard(ctx, dashboardID, null), null);
        }

        /// <summary>
        /// New layout row. AD_User_ID / AD_Role_ID key the legacy layouts; on dashboard rows they only
        /// record who saved them.
        /// </summary>
        private MUserHomeWidget NewUserHomeWidget(Ctx ctx, WidgetSize item, int windowID, int dashboardID, VAdvantage.DataBase.Trx trx)
        {
            MUserHomeWidget mUserHomeWidget = new MUserHomeWidget(ctx, 0, trx);
            mUserHomeWidget.SetSRNO(item.SRNO);
            mUserHomeWidget.SetComponentID(item.KeyID);
            mUserHomeWidget.SetComponentType(item.Type);
            mUserHomeWidget.SetAD_User_ID(ctx.GetAD_User_ID());
            mUserHomeWidget.SetAD_Role_ID(ctx.GetAD_Role_ID());
            mUserHomeWidget.SetAD_Window_ID(windowID);
            mUserHomeWidget.SetAD_Dashboard_ID(dashboardID);
            return mUserHomeWidget;
        }

        /// <summary>
        /// Save widget on drop
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="widgetSizes"></param>
        /// <returns></returns>
        public int SaveSingleWidget(Ctx ctx, List<WidgetSize> widgetSizes, int windowID)
        {
            return SaveSingleWidget(ctx, widgetSizes, windowID, 0);
        }

        /// <summary>
        /// Adds dropped widget(s) to the layout; returns the id of the last row saved.
        /// </summary>
        public int SaveSingleWidget(Ctx ctx, List<WidgetSize> widgetSizes, int windowID, int dashboardID)
        {
            int id = 0;
            if (!CanWriteLayout(ctx, windowID, dashboardID))
                return id;
            for (int i = 0; i < widgetSizes.Count; i++)
            {
                MUserHomeWidget mUserHomeWidget = NewUserHomeWidget(ctx, widgetSizes[i], windowID, dashboardID, null);
                if (mUserHomeWidget.Save())
                    id = mUserHomeWidget.Get_ID();
            }
            return id;
        }

        /// <summary>
        /// Delete Widgets
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="id"></param>
        /// <returns></returns>
        public int DeleteWidgetFromHome(Ctx ctx, int id)
        {
            MUserHomeWidget row = new MUserHomeWidget(ctx, id, null);
            if (row.Get_ID() == 0)
                return 1;
            // dashboard rows: whoever may change the dashboard; legacy rows: the user's own for the role
            bool allowed = row.GetAD_Dashboard_ID() > 0
                ? CanModify(ctx, LoadDashboard(ctx, row.GetAD_Dashboard_ID(), null), null)
                : row.GetAD_User_ID() == ctx.GetAD_User_ID() && row.GetAD_Role_ID() == ctx.GetAD_Role_ID();
            if (allowed)
                DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE AD_UserHomeWidget_ID=" + id);
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

    public class DataSource
    {
        public string ID { get; set; }
        public string Name { get; set; }
        public int Count { get; set; }
        public int DisplayType { get; set; }
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

    /// <summary>A dashboard as offered to the signed-in user (switcher sheet on Home).</summary>
    public class DashboardInfo
    {
        public int AD_Dashboard_ID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int SeqNo { get; set; }
        /// <summary>Created by the signed-in user and not shared (listed under My dashboards).</summary>
        public bool IsOwner { get; set; }
        /// <summary>No owner: offered to the roles in AD_Dashboard_Access (listed under Shared).</summary>
        public bool IsShared { get; set; }
        /// <summary>Layout, name, roles and deletion: own dashboard, or shared with read / write access for the role.</summary>
        public bool CanEdit { get; set; }
        /// <summary>Own dashboard the user may turn into a shared one.</summary>
        public bool CanShare { get; set; }
        /// <summary>Roles a shared dashboard is assigned to.</summary>
        public int RoleCount { get; set; }
        public bool IsRoleDefault { get; set; }
        public bool IsUserDefault { get; set; }
        public int WidgetCount { get; set; }
        /// <summary>Last change to the layout (ISO 8601), null for the legacy home.</summary>
        public string Updated { get; set; }
    }

    /// <summary>Role in the share / edit roles checklist.</summary>
    public class DashboardRole
    {
        public int AD_Role_ID { get; set; }
        public string Name { get; set; }
        public bool IsSelected { get; set; }
        /// <summary>The role may change the shared dashboard.</summary>
        public bool IsReadWrite { get; set; }
        /// <summary>Login role: always selected and read / write, cannot be changed in the checklist.</summary>
        public bool IsLocked { get; set; }
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
        public bool IsDefault { get; set; }
        public Int32 Sequence { get; set; }
        public string Description { get; set; }
        public string Help { get; set; }
    }


}