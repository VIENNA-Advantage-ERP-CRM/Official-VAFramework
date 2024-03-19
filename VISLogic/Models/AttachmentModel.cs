using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.DBase;

namespace ViennaAdvantageWeb.Areas.VIS.Models
{
    public class AttachmentModel
    {

        public InitAttachment GetAttachment(int AD_Table_ID, int Record_ID, VAdvantage.Utility.Ctx ctx)
        {
            InitAttachment initialData = new InitAttachment();
            initialData.Attachment = GetFileAttachment(AD_Table_ID, Record_ID, ctx);
            initialData.FLocation = GetFileLocations(ctx);
            return initialData;
        }

        private MAttachment GetFileAttachment(int AD_Table_ID, int Record_ID, VAdvantage.Utility.Ctx ctx)
        {
            int AD_Attachment_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Attachment_ID from AD_Attachment WHERE ad_table_id =" + AD_Table_ID + " AND record_id=" + Record_ID, null, null));
            if (AD_Attachment_ID == 0)
            {
                return null;
            }
            MAttachment att = new MAttachment(ctx, AD_Attachment_ID, null);
            att.AD_Attachment_ID = AD_Attachment_ID;
            return att;
        }

        private FileLocation GetFileLocations(Ctx ctx)
        {
            //MAttachment att = new MAttachment(ctx, AD_Table_ID, Record_ID, null);
            //return att;
            FileLocation locations = new FileLocation();
            int AD_Reference_ID = Util.GetValueOfInt(DB.ExecuteScalar("Select AD_Reference_Value_ID from ad_Column WHERE AD_Table_ID =(SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_ClientInfo') AND UPPER(ColumnName)='SAVEATTACHMENTON'", null, null));

            locations.values = MRefList.GetList(AD_Reference_ID, false, ctx);
            locations.selectedvalue = Util.GetValueOfString(DB.ExecuteScalar("Select SAVEATTACHMENTON From AD_CLientInfo WHERE Ad_client_ID=" + ctx.GetAD_Client_ID(), null, null));
            return locations;
        }

        public AttachmentInfo CreateAttachmentEntries(List<AttFileInfo> _files, int AD_Attachment_ID, string folderKey, Ctx ctx, int AD_Table_ID, int Record_ID, string fileLocation, int newRecord_ID, bool IsDMSAttachment)
        {
            AttachmentInfo info = new AttachmentInfo();

            MAttachment att = null;
            if (newRecord_ID > 0)           //This is to copy old reocrd's attachment in new record. will work only in case of DMS..
            {
                att = new MAttachment(ctx, 0, null);
                att.SetRecord_ID(newRecord_ID);
            }
            else
            {
                att = new MAttachment(ctx, AD_Attachment_ID, null);
                att.SetRecord_ID(Record_ID);
            }

            if (IsDMSAttachment && newRecord_ID == 0 && AD_Attachment_ID > 0)
            {
                DB.ExecuteQuery("DELETE FROM AD_AttachmentLine WHERE AD_Attachment_ID=" + AD_Attachment_ID, null, null);
            }
            att.SetAD_Table_ID(AD_Table_ID);
            att.SetAttFileInfo(_files);
            att.FolderKey = folderKey;
            att.SetFileLocation(fileLocation);
            att.SetIsFromHTML(true);
            att.Save();

            try
            {
                string VerTableName = MTable.GetTableName(ctx, AD_Table_ID) + "_Ver";
                int Ver_AD_Table_ID = MTable.Get_Table_ID(VerTableName);
                if (Ver_AD_Table_ID > 0)
                {
                    string TableName = MTable.GetTableName(ctx, AD_Table_ID);
                    StringBuilder sbSql = new StringBuilder("");
                    sbSql.Clear().Append("SELECT COUNT(AD_Column_ID) FROM AD_Column WHERE AD_Table_ID = " + AD_Table_ID + " AND ColumnName = '" + TableName + "_ID'");
                    int count = Util.GetValueOfInt(DB.ExecuteScalar(sbSql.ToString(), null, null));
                    // check if parent table contains column with TableName_ID
                    if (count > 0)
                    {
                        sbSql.Clear().Append("SELECT " + VerTableName + "_ID AS RecordID, IsVersionApproved FROM " + VerTableName + " WHERE " + TableName + "_ID = " + Record_ID + " ORDER BY RecordVersion DESC");
                        DataSet dsData = DB.ExecuteDataset(sbSql.ToString(), null, null);
                        if (dsData != null && dsData.Tables != null && dsData.Tables[0].Rows.Count > 0)
                        {
                            if (Util.GetValueOfString(dsData.Tables[0].Rows[0]["IsVersionApproved"]) == "N")
                            {
                                Record_ID = Util.GetValueOfInt(dsData.Tables[0].Rows[0]["RecordID"]);
                                if (Record_ID > 0)
                                {
                                    att = null;
                                    AD_Attachment_ID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Attachment_ID FROM AD_Attachment WHERE AD_Table_ID = " + AD_Table_ID + " AND Record_ID = " + Record_ID, null, null));

                                    //if (newRecord_ID > 0)           //This is to copy old reocrd's attachment in new record. will work only in case of DMS..
                                    //{
                                    //    att = new MAttachment(ctx, 0, null);
                                    //    att.SetRecord_ID(newRecord_ID);
                                    //}
                                    //else
                                    //{
                                    att = new MAttachment(ctx, AD_Attachment_ID, null);
                                    att.SetRecord_ID(Record_ID);
                                    //}
                                    if (IsDMSAttachment && newRecord_ID == 0 && AD_Attachment_ID > 0)
                                    {
                                        DB.ExecuteQuery("DELETE FROM AD_AttachmentLine WHERE AD_Attachment_ID=" + AD_Attachment_ID, null, null);
                                    }
                                    att.SetAD_Table_ID(Ver_AD_Table_ID);
                                    att.SetAttFileInfo(_files);
                                    att.FolderKey = folderKey;
                                    att.SetFileLocation(fileLocation);
                                    att.SetIsFromHTML(true);
                                    att.Save();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception exp)
            {

            }

            for (int i = 0; i < _files.Count; i++)
            {
                System.IO.File.Delete(System.IO.Path.Combine(GetServerLocation(), "TempDownload") + "\\" + folderKey + "\\" + _files[i].Name);
            }
            Directory.Delete(System.IO.Path.Combine(GetServerLocation(), "TempDownload", folderKey));

            info.AD_attachment_ID = att.GetAD_Attachment_ID();
            info.Error = att.Error;

            return info;
        }

        /// <summary>
        /// Get the server location
        /// </summary>
        /// <returns>Returns server location</returns>
        private static string GetServerLocation()
        {
            string serverLocation = System.Web.Configuration.WebConfigurationManager.AppSettings["serverLocation"];

            if (serverLocation != null && serverLocation != "")
            {
                return serverLocation;
            }
            return VAdvantage.DataBase.GlobalVariable.PhysicalPath; ;
        }


        private void CopyRecord(MAttachment att, int AD_Table_ID, int newRecord_ID, Ctx ctx)
        {
            MAttachment newAttachment = new MAttachment(ctx, AD_Table_ID, newRecord_ID, null);
            att.CopyTo(newAttachment);

            //for (int i = 0; i < att.GetEntryCount(); i++)
            //{
            //    newAttachment.AddEntry(att.GetEntry(i));
            //}

            att = null;
            att = newAttachment;
        }

        public string DownloadAttachment(Ctx _ctx, string fileName, int AD_Attachment_ID, int AD_AttachmentLine_ID, string actionOrigin, string originName, int AD_Table_ID, int recordID)
        {
            //Saved Action Log
            VAdvantage.Common.Common.SaveActionLog(_ctx, actionOrigin, originName, AD_Table_ID, recordID, 0, "", "", "Attachment Downloaded:->" + fileName, MActionLog.ACTIONTYPE_Download);

            MAttachment att = new MAttachment(_ctx, AD_Attachment_ID, null);

            return att.GetFile(AD_AttachmentLine_ID);
        }

        public string DownloadAttachment(Ctx _ctx, string fileName, int AD_Attachment_ID, int AD_AttachmentLine_ID)
        {
            //Saved Action Log
            MAttachment att = new MAttachment(_ctx, AD_Attachment_ID, null);

            return att.GetFile(AD_AttachmentLine_ID);
        }


        public int DeleteAttachment(string AttachmentLines)
        {
            if (AttachmentLines == null || AttachmentLines.Length == 0)
            {
                return 0;
            }

            int parentRecID = 0;
            string TableName = "";
            DataSet dsData = null;
            StringBuilder sbSql = new StringBuilder("");
            if (AttachmentLines.EndsWith(","))
            {
                AttachmentLines = AttachmentLines.Substring(0, AttachmentLines.Length - 1);
            }

            // VIS0008 CMS
            string[] attLineIDs = AttachmentLines.Split(',');
            if (attLineIDs.Length > 0)
            {
                sbSql.Append(@"SELECT a.AD_Table_ID, t.TableName, a.Record_ID FROM AD_AttachmentLine al INNER JOIN AD_Attachment a 
                            ON (al.AD_Attachment_ID = a.AD_Attachment_ID) INNER JOIN AD_Table t ON (t.AD_Table_ID = a.AD_Table_ID)
                            WHERE al.AD_AttachmentLine_ID = " + Util.GetValueOfInt(attLineIDs[0]));
                dsData = DB.ExecuteDataset(sbSql.ToString(), null, null);
                if (dsData != null && dsData.Tables != null && dsData.Tables[0].Rows.Count > 0)
                {
                    TableName = Util.GetValueOfString(dsData.Tables[0].Rows[0]["TableName"]);
                    parentRecID = Util.GetValueOfInt(dsData.Tables[0].Rows[0]["Record_ID"]);
                }
            }
            int count = 0;
            if (TableName != "")
            {
                int Ver_AD_Table_ID = 0;
                string VerTableName = TableName + "_Ver";
                Ver_AD_Table_ID = MTable.Get_Table_ID(VerTableName);
                // Check if Version table exists
                if (Ver_AD_Table_ID > 0)
                {
                    int AD_Table_ID = 0;
                    AD_Table_ID = MTable.Get_Table_ID(TableName);
                    sbSql.Clear().Append("SELECT COUNT(AD_Column_ID) FROM AD_Column WHERE AD_Table_ID = " + AD_Table_ID + " AND ColumnName = '" + TableName + "_ID'");
                    count = Util.GetValueOfInt(DB.ExecuteScalar(sbSql.ToString(), null, null));
                    // check if parent table contains column with TableName_ID
                    if (count > 0)
                    {
                        sbSql.Clear().Append("SELECT " + VerTableName + "_ID AS RecordID, IsVersionApproved FROM " + VerTableName + " WHERE " + TableName + "_ID = " + parentRecID + " ORDER BY RecordVersion DESC");
                        dsData = DB.ExecuteDataset(sbSql.ToString(), null, null);
                        if (dsData != null && dsData.Tables != null && dsData.Tables[0].Rows.Count > 0)
                        {
                            if (Util.GetValueOfString(dsData.Tables[0].Rows[0]["IsVersionApproved"]) == "N")
                            {
                                int Record_ID = Util.GetValueOfInt(dsData.Tables[0].Rows[0]["RecordID"]);
                                if (Record_ID > 0)
                                {
                                    StringBuilder sbFileName = new StringBuilder("");
                                    int VerAttachmentID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_Attachment_ID FROM AD_Attachment WHERE Record_ID = " + Record_ID + " AND AD_Table_ID = " + Ver_AD_Table_ID, null, null));
                                    for (int i = 0; i < attLineIDs.Length; i++)
                                    {
                                        sbSql.Clear().Append("SELECT FileName FROM AD_AttachmentLine WHERE AD_AttachmentLine_ID = " + Util.GetValueOfInt(attLineIDs[i]));
                                        sbFileName.Clear().Append(DB.ExecuteScalar(sbSql.ToString(), null, null));
                                        if (sbFileName.ToString() != "")
                                        {
                                            sbSql.Clear().Append(@"DELETE FROM AD_AttachmentLine WHERE AD_Attachment_ID = " + VerAttachmentID + " AND FileName = '" + sbFileName + "'");
                                            count = DB.ExecuteQuery(sbSql.ToString(), null, null);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            count = DB.ExecuteQuery("DELETE FROM AD_AttachmentLine WHERE AD_AttachmentLine_ID IN (" + AttachmentLines + ")", null, null);

            return count;
        }
    }

    public class FileLocation
    {
        public ValueNamePair[] values
        {
            get;
            set;
        }

        public string selectedvalue
        {
            get;
            set;
        }
    }

    public class AttachmentInfo
    {
        public string Error { get; set; }
        public int AD_attachment_ID { get; set; }
    }

    public class InitAttachment
    {
        public MAttachment Attachment
        {
            get;
            set;
        }
        public FileLocation FLocation
        {
            get;
            set;
        }
    }

}