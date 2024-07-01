﻿using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Data;
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
                sql +=" WHERE AD_Widget.isActive='Y' AND AD_Widget_Access.AD_Role_ID=" + ctx.GetAD_Role_ID();
            if(windowID > 0)
            {
                sql += " AND window='Y'";
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
                       img = "data:image/jpg;base64," + Convert.ToBase64String((byte[])row[i]["BINARYDATA"]);
                    }catch (Exception ex)
                    {

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
            if (!Env.IsModuleInstalled("VADB_") && Util.GetValueOfInt(MTable.Get_Table_ID("AD_WidgetSize")) == 0)
            {
                return list;
            }

            string sql = @"SELECT D_Chart.chartType, D_Chart.d_chart_id,D_Chart.Name,colspan,rowspan,'C' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence, IsDefault,AD_IMAGE.BINARYDATA FROM D_Chart INNER JOIN 
                            D_ChartAccess ON (D_Chart.D_Chart_ID=D_ChartAccess.D_Chart_ID)
                            INNER JOIN AD_WidgetSize ON (D_Chart.D_Chart_ID=AD_WidgetSize.D_Chart_ID)
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                           
                            WHERE D_ChartAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();
            sql += " UNION ALL ";

            sql += @" SELECT RC_KPI.KPIType AS chartType, RC_KPI.RC_KPI_ID AS d_chart_id,RC_KPI.Name,colspan,rowspan,'K' AS Type,AD_WidgetSize.AD_WidgetSize_ID,Sequence ,IsDefault,AD_IMAGE.BINARYDATA FROM RC_KPI INNER JOIN 
                            RC_KPIAccess ON (RC_KPI.RC_KPI_ID=RC_KPIAccess.RC_KPI_ID)
                            INNER JOIN AD_WidgetSize ON (RC_KPI.RC_KPI_ID=AD_WidgetSize.RC_KPI_ID)
                            LEFT JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID                            
                            WHERE RC_KPIAccess.AD_Role_ID=" + ctx.GetAD_Role_ID();


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
                    else if(Util.GetValueOfString(row[i]["Type"]) == "K")
                    {
                        moduleName = "KPI";
                    }
                    else if (Util.GetValueOfString(row[i]["Type"]) == "V")
                    {
                        moduleName ="Views";
                    }


                    HomeWidget l = new HomeWidget()
                    {
                        WidgetID = Util.GetValueOfInt(row[i]["d_chart_id"]),
                        KeyID = Util.GetValueOfInt(row[i]["AD_WidgetSize_ID"]),
                        Name = Util.GetValueOfString(row[i]["Name"]),
                        DisplayName = Util.GetValueOfString(row[i]["Name"]),
                        ClassName ="",
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

