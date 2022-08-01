using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using VAdvantage.Classes;
using VAdvantage.Controller;
using VAdvantage.Model;
using VAdvantage.SqlExec.MSSql;
using VAdvantage.Utility;
using VIS.DataContracts;
using VIS.Models;

namespace VIS.Classes
{
    public class LookupHelper
    {
        public static Lookup GetLookup(Ctx ctx, int windowNo, int Column_ID, int AD_Reference_ID,
                 String columnName, int AD_Reference_Value_ID,
                bool IsParent, String ValidationCode)
        {
            if (QueryValidator.IsValid(ValidationCode))
                return VLookUpFactory.Get(ctx, windowNo, Column_ID, AD_Reference_ID, columnName, AD_Reference_Value_ID, IsParent, ValidationCode);
            return null;

        }

        public static string[] GetKeyColumns(int AD_Table_ID, Ctx ctx)
        {
            //return new MTable(ctx, AD_Table_ID, null).GetKeyColumns();
            return MTable.Get(ctx, AD_Table_ID).GetKeyColumns();
        }

        public Object GetLookupData(Ctx ctx, int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize)
        {
            VLookUpInfo lInfo = GetLookupInfo(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID);
            string lookupQuery = lInfo.query;
            string validation = lInfo.validationCode;
            if (!string.IsNullOrEmpty(validation))
            {
                if (!string.IsNullOrEmpty(Values))
                {
                    List<LookUpData> data = JsonConvert.DeserializeObject<List<LookUpData>>(Values);

                    if (data != null && data.Count > 0)
                    {
                        for (int i = 0; i < data.Count; i++)
                        {
                            validation = validation.Replace("@" + data[i].Key + "@", Convert.ToString(data[i].Value));
                        }
                    }
                }

                var posFrom = lookupQuery.LastIndexOf(" FROM ");
                var hasWhere = lookupQuery.IndexOf(" WHERE ", posFrom) != -1;
                //
                var posOrder = lookupQuery.LastIndexOf(" ORDER BY ");
                if (posOrder != -1)
                    lookupQuery = lookupQuery.Substring(0, posOrder) + (hasWhere ? " AND " : " WHERE ") + validation + lookupQuery.Substring(posOrder);
                else
                    lookupQuery += (hasWhere ? " AND " : " WHERE ") + validation;
            }

            VIS.Helpers.SqlHelper h = new VIS.Helpers.SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn()
            {
                sql = lookupQuery,
            };

            if (PageSize > 0)
                sqlIn.pageSize = PageSize;

            object result = h.ExecuteJDataSet(sqlIn);
            return result;
        }


        public Object GetLookupAll(Ctx ctx, int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, string Values, int PageSize)
        {
            VLookUpInfo lInfo = GetLookupInfo(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID);
            string lookupQuery = lInfo.queryAll;
            string validation = lInfo.validationCode;

            VIS.Helpers.SqlHelper h = new VIS.Helpers.SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn()
            {
                sql = lookupQuery,
            };

            if (PageSize > 0)
                sqlIn.pageSize = PageSize;

            object result = h.ExecuteJDataSet(sqlIn);
            return result;
        }

        public Object GetLookupDirect(Ctx ctx, int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID, object Key, bool IsNumber)
        {
            VLookUpInfo lInfo = GetLookupInfo(ctx, WindowNo, AD_Window_ID, AD_Tab_ID, AD_Field_ID);
            string lookupQuery = lInfo.queryDirect;
            List<SqlParams> listParam = new List<SqlParams>();
            string key = "";
            if (Key != null)
                key = ((string[])Key)[0];


            SqlParams parm = new SqlParams();

            parm.name = "@key";
            if (IsNumber)
            {
                parm.value = Convert.ToInt32(key);
            }
            else
            {
                parm.value = Convert.ToString(key);
            }
            listParam.Add(parm);

            VIS.Helpers.SqlHelper h = new VIS.Helpers.SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn()
            {
                sql = lookupQuery,
                param = listParam
            };

            object result = h.ExecuteJDataSet(sqlIn);
            return result;
        }

        private VLookUpInfo GetLookupInfo(Ctx ctx, int WindowNo, int AD_Window_ID, int AD_Tab_ID, int AD_Field_ID)
        {
            GridWindowVO vo = AEnv.GetMWindowVO(ctx, WindowNo, AD_Window_ID, 0);

            VLookUpInfo lInfo = vo.GetTabs().Where(a => a.AD_Tab_ID == AD_Tab_ID).FirstOrDefault().GetFields().Where(x => x.AD_Field_ID == AD_Field_ID).FirstOrDefault().lookupInfo;

            return lInfo;
        }
    }


    public class CommonFunctions
    {
        /// <summary>
        /// Save Image into data base/folder
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="buffer">image Byte array</param>
        /// <param name="imageID">image ID for the file</param>
        /// <param name="imageName">name of the i,age</param>
        /// <param name="isSaveInDB">is want to save into the data base</param>
        /// <returns></returns>
        public static int SaveImage(Ctx ctx, byte[] buffer, int imageID, string imageName, bool isSaveInDB)
        {
            MImage mimg = new MImage(ctx, imageID, null);
            mimg.ByteArray = buffer;
            mimg.ImageFormat = imageName.Substring(imageName.LastIndexOf('.'));
            mimg.SetName(imageName);
            if (isSaveInDB)
            {
                mimg.SetBinaryData(buffer);
                //mimg.SetImageURL(string.Empty);
            }
            else
            {
                // if user uncheck the save in db checkbox
                mimg.SetBinaryData(null);
            }
            mimg.SetImageURL(mimg.ImageFormat);
            //else
            //{
            //    mimg.SetImageURL("Images");//Image Saved in File System so instead of byteArray image Url will be set
            //    mimg.SetBinaryData(new byte[0]);
            //}
            if (!mimg.Save())
            {
                return 0;
            }
            return mimg.Get_ID();
        }

        /// <summary>
        /// Delete image
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="ad_image_id"></param>
        /// <returns></returns>
        public static int DeleteImage(Ctx ctx, int ad_image_id)
        {
            MImage mimg = new MImage(ctx, ad_image_id, null);
            if (mimg.Delete(true))
                return 1;
            else
                return 0;
        }


        public static int SaveUserImage(Ctx ctx, byte[] buffer, string imageName, bool isSaveInDB, int userID)
        {

            MUser user = new MUser(ctx, userID, null);
            int imageID = Util.GetValueOfInt(user.GetAD_Image_ID());

            MImage mimg = new MImage(ctx, imageID, null);
            mimg.ByteArray = buffer;
            mimg.ImageFormat = imageName.Substring(imageName.LastIndexOf('.'));
            mimg.SetName(imageName);
            if (isSaveInDB)
            {
                mimg.SetBinaryData(buffer);
                //mimg.SetImageURL(string.Empty);
            }
            //mimg.SetImageURL("Images/Thumb100x100");
            mimg.SetImageURL(mimg.ImageFormat);
            //else
            //{
            //    //mimg.SetImageURL(HostingEnvironment.MapPath(@"~/Images/100by100"));//Image Saved in File System so instead of byteArray image Url will be set
            //    mimg.SetImageURL("Images/Thumb100x100");//Image Saved in File System so instead of byteArray image Url will be set
            //    mimg.SetBinaryData(new byte[0]);
            //}
            if (!mimg.Save())
            {
                return 0;
            }
            user.SetAD_Image_ID(mimg.GetAD_Image_ID());
            if (!user.Save())
            {
                return 0;
            }

            return mimg.GetAD_Image_ID();
        }

        public static void ConvertByteArrayToThumbnail(byte[] imageBytes, string imageName)
        {

            try
            {
                //********** Save Original Image ********************
                CreateThumbnail(0, 0, imageBytes, imageName);

                //*********Create Thumbnail of 320/240 *******************
                CreateThumbnail(320, 240, imageBytes, imageName);

                //*********Create Thumbnail of 140/120 *******************
                CreateThumbnail(140, 120, imageBytes, imageName);

                //*********Create Thumbnail of 46/46 *******************
                CreateThumbnail(46, 46, imageBytes, imageName);

                //*********Create Thumbnail of 32/32 *******************
                CreateThumbnail(32, 32, imageBytes, imageName);

                //*********Create Thumbnail of 16/16 *******************
                CreateThumbnail(16, 16, imageBytes, imageName);

                // CreateThumbnail(320, 180, imageBytes, imageName);

                //CreateThumbnail(320, 150, imageBytes, imageName);
                CreateThumbnail(320, 185, imageBytes, imageName);
            }
            catch
            {
            }
            finally
            {
            }


        }
        private static void CreateThumbnail(int width, int height, byte[] byteArray, string imageName)
        {
            int dimWidth = width;
            int dimHeight = height;
            MemoryStream ms = null;
            try
            {
                // System.Drawing.Image imThumbnailImage;
                Bitmap imThumbnailImage;
                // System.Drawing.Image OriginalImage;
                ms = new MemoryStream();
                // Stream / Write Image to Memory Stream from the Byte Array.
                ms.Write(byteArray, 0, byteArray.Length);
                Bitmap OriginalImage = (Bitmap)Image.FromStream(ms);
                //OriginalImage = System.Drawing.Image.FromStream(ms);
                if (height == 0 && width == 0)
                {
                    OriginalImage.Save(Path.Combine(HostingEnvironment.MapPath(@"~/Images"), imageName));
                    return;
                }
                if (!Directory.Exists((Path.Combine(HostingEnvironment.MapPath(@"~/Images"), "Thumb" + width.ToString() + "x" + height.ToString()))))
                {
                    Directory.CreateDirectory(Path.Combine(HostingEnvironment.MapPath(@"~/Images"), "Thumb" + width.ToString() + "x" + height.ToString()));       //Create Thumbnail Folder if doesnot exists
                }
                // Shrink the Original Image to a thumbnail size.
                int percenetage = 0;
                string filepath = Path.Combine(HostingEnvironment.MapPath(@"~/Images"), "Thumb" + width.ToString() + "x" + height.ToString() + "/" + imageName);
                if (!(OriginalImage.Height < height && OriginalImage.Width < width))
                {
                    if (OriginalImage.Height > OriginalImage.Width)
                    {
                        percenetage = GetPercentage(OriginalImage.Width, OriginalImage.Height);
                        // height = width*100 / percenetage;

                        width = (height * percenetage) / 100;
                        if (width > dimWidth)
                        {
                            width = dimWidth;
                            height = (width * 100) / percenetage;
                        }
                        // height =height+( width*GetPercentage(OriginalImage.Width, OriginalImage.Height))/100;
                        // width = (width * GetPercentage(OriginalImage.Width, OriginalImage.Height)) / 100;
                    }
                    else if (OriginalImage.Height == OriginalImage.Width)
                    {
                        width = height;
                    }
                    else
                    {
                        percenetage = GetPercentage(OriginalImage.Height, OriginalImage.Width);
                        //  width = height*100 / percenetage;

                        height = (width * percenetage) / 100;
                        if (height > dimHeight)
                        {
                            height = dimHeight;
                            width = (dimHeight * 100) / percenetage;
                        }
                        //width =width+(height*GetPercentage(OriginalImage.Height, OriginalImage.Width))/100;
                        //height = (height * GetPercentage(OriginalImage.Height, OriginalImage.Width)) / 100;
                    }
                    // imThumbnailImage = OriginalImage.GetThumbnailImage(width, height, new System.Drawing.Image.GetThumbnailImageAbort(ThumbnailCallback), IntPtr.Zero);
                    imThumbnailImage = new Bitmap(OriginalImage, new Size(width, height));
                    imThumbnailImage.Save(filepath);
                }
                else
                {
                    OriginalImage.Save(filepath);
                }


            }
            catch
            {
            }
            finally
            {
                if (ms != null)
                {
                    ms.Close();
                }
            }
            //return myMS.ToArray();
        }
        private static int GetPercentage(int value, int total)
        {
            return (value * 100) / total;
        }
        public static byte[] GetThumbnailByte(int height, int width, string ImageName)
        {
            byte[] fileBytes = null;
            string url = string.Empty;
            if (ImageName != null)
            {
                url = Path.Combine(HostingEnvironment.MapPath(@"~/Images//"), "Thumb" + height.ToString() + "x" + width.ToString() + "\\" + ImageName);

                if (File.Exists(url))
                {
                    FileStream stream = null;
                    try
                    {
                        //string filepath = Path.Combine(HostingEnvironment.ApplicationPhysicalPath, dsData.Tables[0].Rows[0]["imageurl"].ToString());
                        if (File.Exists(url))
                        {
                            stream = File.OpenRead(url);
                            fileBytes = new byte[stream.Length];
                            stream.Read(fileBytes, 0, fileBytes.Length);
                            stream.Close();
                            return fileBytes;
                        }
                    }
                    catch
                    {
                        return null;
                    }
                    finally
                    {
                        if (stream != null)
                            stream.Close();
                    }
                }
                else
                {
                    return null;
                }
            }

            return fileBytes;

        }
    }
}