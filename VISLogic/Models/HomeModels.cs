using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VAdvantage.Utility;
using VAdvantage.Model;
using System.Web.Hosting;
using System.Text;
using System.IO;
using VAdvantage.Logging;
using CoreLibrary.DataBase;
using System.Data;
using Newtonsoft.Json.Linq;

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

        public List<HomeWidget> GetHomeWidget(Ctx ctx)
        {

            List<HomeWidget> list = null;
            string sql = @"SELECT AD_Widget.AD_Widget_ID,AD_Widget.Name,AD_Widget.displayName,AD_WidgetSize.className,AD_WidgetSize.Rowspan,AD_WidgetSize.Colspan,AD_WidgetSize.AD_WidgetSize_ID,AD_IMAGE.BINARYDATA,AD_ModuleInfo.name AS ModuleName FROM AD_Widget 
                            INNER JOIN AD_WidgetSize  ON AD_Widget.AD_Widget_ID=AD_WidgetSize.AD_Widget_ID
                            INNER JOIN AD_WidgetAccess ON AD_Widget.AD_Widget_ID=AD_WidgetAccess.AD_Widget_ID
                            INNER JOIN AD_IMAGE ON AD_IMAGE.AD_IMAGE_ID=AD_WidgetSize.AD_IMAGE_ID
                            INNER JOIN AD_ModuleInfo ON AD_ModuleInfo.AD_ModuleInfo_ID=AD_Widget.AD_ModuleInfo_ID
                            WHERE AD_Widget.isActive='Y' AND AD_Role_ID=" + ctx.GetAD_Role_ID()+ " ORDER BY AD_ModuleInfo.name";

            DataSet dataSet = DB.ExecuteDataset(sql);
            if (dataSet != null && dataSet.Tables.Count > 0)
            {
                list = new List<HomeWidget>();
                var row = dataSet.Tables[0].Rows;
                for (int i = 0; i < row.Count; i++)
                {
                    string img = "data:image/jpg;base64,"+ Convert.ToBase64String((byte[])row[i]["BINARYDATA"]);
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
                        ModuleName=Util.GetValueOfString(row[i]["ModuleName"]),
                        Type="W"
                    };

                    list.Add(l);
                }
            }
            return list;
        }

        public List<HomeWidget> GetUserWidgets(Ctx ctx)
        {
            string sql = @"SELECT AD_UserHomeWidget.AD_UserHomeWidget_ID, AD_UserHomeWidget.componentID,componentType,SRNO FROM AD_UserHomeWidget
                            WHERE AD_UserHomeWidget.IsActive='Y' AND AD_Role_ID=" + ctx.GetAD_Role_ID() + " AND  AD_User_ID=" + ctx.GetAD_User_ID() + " ORDER BY SRNO";
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
                        //Rows = Util.GetValueOfInt(row[i]["Rowspan"]),
                        //Cols = Util.GetValueOfInt(row[i]["Colspan"])
                    };

                    list.Add(l);
                }
            }
            return list;
        }

        public int SaveDashboard(Ctx ctx, List<WidgetSize> widgetSizes)
        {
            DB.ExecuteQuery("DELETE FROM AD_UserHomeWidget WHERE AD_User_ID="+ctx.GetAD_User_ID()+" AND AD_Role_ID="+ctx.GetAD_Role_ID());
            for (int i = 0; i < widgetSizes.Count; i++)
            {
                MUserHomeWidget mUserHomeWidget = new MUserHomeWidget(ctx, 0, null);
                mUserHomeWidget.SetSRNO(widgetSizes[i].SRNO);
                mUserHomeWidget.SetComponentID(widgetSizes[i].KeyID);
                mUserHomeWidget.SetComponentType(widgetSizes[i].Type);
                mUserHomeWidget.SetAD_User_ID(ctx.GetAD_User_ID());
                mUserHomeWidget.SetAD_Role_ID(ctx.GetAD_Role_ID());
                mUserHomeWidget.Save();
            }
            return 1;
        }
        public int DeleteWidgetFromHome(Ctx ctx,int id)
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
    }

    public class HomeWidget: WidgetSize
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
      
    }

    
}

   