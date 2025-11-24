using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;
using VIS.Models;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Filters;
using System.Web.SessionState;
using VIS.DataContracts;
using VAdvantage.Common;
using System.Configuration;
using Syncfusion.EJ2.DocumentEditor;
using System.Text;
using System.Text.RegularExpressions;


namespace VIS.Controllers
{
    [AjaxAuthorizeAttribute]
    [AjaxSessionFilterAttribute]
    [SessionState(SessionStateBehavior.ReadOnly)]
    public class EmailController : Controller
    {
        /*This will indiacte whenther the folder is of sharefiles*/
        bool IsShareFiles = true;
        //
        // GET: /VACOM/Email/
        public ActionResult Index()
        {
            return PartialView();
        }
        public ActionResult Init(int windowNo, string language)
        {
            ViewBag.windowNo = windowNo;
            ViewBag.language = language;
            ViewBag.IsDocEditor = ConfigurationManager.AppSettings["SyncfusionLicense"];
            return PartialView();
        }



        [HttpPost]
        public JsonResult SendMail(string mails, int AD_User_ID, int AD_Client_ID, int AD_Org_ID, int attachment_ID, string fileNamesFornNewAttach,
            string fileNamesForopenFormat, string mailFormat, bool notify, string strDocAttach, int AD_Process_ID, string printformatfileType)
        {
            List<int> lstDoc = new List<int>();
            Ctx ct = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ct);
            mails = Server.HtmlDecode(mails);
            List<NewMailMessage> lstMails = JsonConvert.DeserializeObject<List<NewMailMessage>>(mails);
            List<string> filesNamesFornNewAttach = new List<string>();
            if (fileNamesFornNewAttach != null && fileNamesFornNewAttach.Trim().Length > 0)
            {
                filesNamesFornNewAttach = JsonConvert.DeserializeObject<List<string>>(fileNamesFornNewAttach);
            }

            List<string> filesNamesForopenFormat = new List<string>();
            if (fileNamesForopenFormat != null && fileNamesForopenFormat.Trim().Length > 0)
            {
                filesNamesForopenFormat = JsonConvert.DeserializeObject<List<string>>(fileNamesForopenFormat);
            }
            if (strDocAttach != string.Empty)
            {
                string[] str1;
                string[] str = strDocAttach.Split(',');
                for (int i = 0; i < str.Length; i++)
                {
                    str1 = str[i].Split('-');
                    if (str1[0].Trim() != string.Empty)
                    {
                        lstDoc.Add(Convert.ToInt32(str1[0]));
                    }
                }

            }

            string result = model.SendMails(lstMails, AD_User_ID, AD_Client_ID, AD_Org_ID, attachment_ID, filesNamesFornNewAttach,
                filesNamesForopenFormat, Server.HtmlDecode(mailFormat), notify, lstDoc, AD_Process_ID, printformatfileType);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SaveFormats(int id, int AD_Client_ID, int AD_Org_ID, string name, bool isDynamic, string subject, string text, bool saveforAll, int AD_Window_ID, string folderName, int attachmentID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ct);
            int result = model.SaveFormats(id, AD_Client_ID, AD_Org_ID, Server.HtmlDecode(name), isDynamic, Server.HtmlDecode(subject), Server.HtmlDecode(text), saveforAll, AD_Window_ID, folderName, attachmentID);
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// This Function is used to store file in ShareFiles folder
        /// </summary>
        /// <param name="file"></param>
        /// <param name="fileName"></param>
        /// <param name="folderKey"></param>
        /// <returns></returns>
        /// <author>VIS_427</author>
        public string SaveAttachmentinShareFiles(HttpPostedFileBase file, string fileName, string folderKey)
        {
            try
            {



                Ctx ctx = Session["ctx"] as Ctx;


                var allowedExtensions = ctx.GetContext("#ALLOWED_FILE_EXTENSION");

                if (!string.IsNullOrEmpty(allowedExtensions) && allowedExtensions.Length > 0)
                {
                    List<string> extensions = allowedExtensions.Split(',').ToList();
                    string fileExtension = fileName.Substring(fileName.LastIndexOf("."));


                    if (extensions.IndexOf(fileExtension) == -1)
                    {
                        return "ERROR: " + fileName;
                    }
                }

                /*VIS_427 01/10/2025 if bool value is true then folder name will 
                 be sharefiles else tempdownload*/
                string folderName = "";
                if (IsShareFiles)
                {
                    folderName = "ShareFiles";
                }
                else
                {
                    folderName = "TempDownload";
                }

                if (!Directory.Exists(Path.Combine(Server.MapPath("~/" + folderName), folderKey)))
                {
                    Directory.CreateDirectory(Path.Combine(Server.MapPath("~/" + folderName), folderKey));
                }

                HttpPostedFileBase hpf = file as HttpPostedFileBase;
                string savedFileName = Path.Combine(Server.MapPath("~/" + folderName + "/" + folderKey), Path.GetFileName(fileName));
                MemoryStream ms = new MemoryStream();
                hpf.InputStream.CopyTo(ms);
                byte[] byteArray = ms.ToArray();

                if (Directory.GetFiles(Path.Combine(Server.MapPath("~/" + folderName), folderKey)).Contains(Path.Combine(Server.MapPath("~/" + folderName), folderKey, fileName)))//Append Content In File
                {
                    using (FileStream fs = new FileStream(savedFileName, FileMode.Append, System.IO.FileAccess.Write))
                    {
                        fs.Write(byteArray, 0, byteArray.Length);
                        ms.Close();
                    }
                }
                else // create new file
                {
                    using (FileStream fs = new FileStream(savedFileName, FileMode.Create, System.IO.FileAccess.Write))
                    {
                        fs.Write(byteArray, 0, byteArray.Length);
                        ms.Close();
                    }
                }

                // hpf.SaveAs(savedFileName);
                return folderKey;
            }
            catch (Exception ex)
            {
                return "ERROR:" + ex.Message;
            }
        }
        /// <summary>
        /// This function is used to store files in tempdownload folder
        /// </summary>
        /// <param name="file"></param>
        /// <param name="fileName"></param>
        /// <param name="folderKey"></param>
        /// <returns></returns>
        public string SaveAttachmentinTemp(HttpPostedFileBase file, string fileName, string folderKey)
        {
            IsShareFiles = false;
            return SaveAttachmentinShareFiles(file, fileName, folderKey);

        }



        //[ValidateInput(false)]
        //[AjaxAuthorizeAttribute]
        //[AjaxSessionFilterAttribute]
        //public JsonResult InsertAttachmentText(string filetext, string fileName, bool isLastChunck)
        //{
        //    string res = "";
        //    fileName = fileName + ".txt";
        //    try
        //    {
        //        if (!Directory.Exists(Path.Combine(Server.MapPath("~/TempDownload"))))
        //        {
        //            Directory.CreateDirectory(Path.Combine(Server.MapPath("~/TempDownload")));
        //        }

        //        //HttpPostedFileBase hpf = file as HttpPostedFileBase;
        //        //string savedFileName = Path.Combine(Server.MapPath("~/TempDownload/" + folderKey), Path.GetFileName(fileName));
        //        //MemoryStream ms = new MemoryStream();
        //        //hpf.InputStream.CopyTo(ms);
        //        //byte[] byteArray = ms.ToArray();

        //        if (Directory.GetFiles(Path.Combine(Server.MapPath("~/TempDownload"))).Contains(Path.Combine(Server.MapPath("~/TempDownload"), fileName)))//Append Content In File
        //        {
        //            //using (FileStream fs = new FileStream(savedFileName, FileMode.Append, System.IO.FileAccess.Write))
        //            //{
        //            //    fs.Write(byteArray, 0, byteArray.Length);
        //            //    ms.Close();
        //            //}
        //            System.IO.File.AppendAllText(Path.Combine(Server.MapPath("~/TempDownload"), fileName), filetext);


        //        }
        //        else // create new file
        //        {
        //            System.IO.File.WriteAllText(Path.Combine(Server.MapPath("~/TempDownload"), fileName), filetext);
        //            //using (FileStream fs = new FileStream(savedFileName, FileMode.Create, System.IO.FileAccess.Write))
        //            //{
        //            //    fs.Write(byteArray, 0, byteArray.Length);
        //            //    ms.Close();
        //            //}
        //        }
        //        if (isLastChunck)
        //        {
        //            Ctx ct = Session["ctx"] as Ctx;
        //            EmailModel model = new EmailModel(ct);
        //            res = model.HtmlToPdf(Path.Combine(Server.MapPath("~/TempDownload"), fileName));

        //        }
        //        // hpf.SaveAs(savedFileName);
        //    }
        //    catch (Exception ex)
        //    {
        //        res = "ERROR:" + ex.Message;
        //    }
        //    return Json(JsonConvert.SerializeObject(res), JsonRequestBehavior.AllowGet);
        //}


        /// <summary>
        /// Used to  show pdf when user click on pdf button
        /// </summary>
        /// <param name="html"></param>
        /// <param name="values"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult InsertAttachmentText(string html, string values)
        {
            string res = "";
            Ctx ct = Session["ctx"] as Ctx;

            List<Dictionary<string, string>> value = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(values);

            EmailModel model = new EmailModel(ct);
            res = model.HtmlToPdf(Server.HtmlDecode(html), value);
            return Json(JsonConvert.SerializeObject(res), JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// Used to  attachment when user click on save Attachment Button
        /// </summary>
        /// <param name="html"></param>
        /// <param name="values"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult SaveAttachment(string subject, int AD_Table_ID, string html, string values)
        {
            string res = "";
            Ctx ct = Session["ctx"] as Ctx;
            Dictionary<string, Dictionary<string, string>> value = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(values);
            EmailModel model = new EmailModel(ct);
            res = model.SaveAttachment(subject, AD_Table_ID, Server.HtmlDecode(html), value);
            return Json(JsonConvert.SerializeObject(res), JsonRequestBehavior.AllowGet);
        }

        // Added by Bharat on 09 June 2017
        public JsonResult GetUser(int BPartner_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ct);
            return Json(JsonConvert.SerializeObject(model.GetUser(BPartner_ID)), JsonRequestBehavior.AllowGet);
        }

        // Added by Bharat on 09 June 2017
        public JsonResult GetMailFormat(int Window_ID)
        {
            Ctx ct = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ct);
            return Json(JsonConvert.SerializeObject(model.GetMailFormat(Window_ID, ct)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get message against email and other parameters passed
        /// </summary>
        /// <param name="Subject"></param>
        /// <param name="Message"></param>
        /// <param name="recordId"></param>
        /// <param name="tableID"></param>
        /// <param name="prompt"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult EmailAPI(string Subject, string Message, int recordId, int tableID, string prompt)
        {

            Ctx ctx = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetEmailResponse(Subject, Message, recordId, tableID, ctx, prompt)), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Fetch record thread against table and record
        /// </summary>
        /// <param name="recordId"></param>
        /// <param name="tableID"></param>
        /// <param name="windowID"></param>
        /// <param name="tabID"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult GetRecordThread(int recordId, int tableID, int windowID, int tabID)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            EmailModel model = new EmailModel(ctx);
            return Json(JsonConvert.SerializeObject(model.GetRecordThread(ctx, recordId, tableID, windowID, tabID)), JsonRequestBehavior.AllowGet);
        }




        //public JsonResult SavedAttachmentForFormat(int textTemplate_ID)
        //{
        //    Ctx ct = Session["ctx"] as Ctx;
        //    EmailModel model = new EmailModel(ct);
        //    SavedAttachmentInfo info = model.SavedAttachmentForFormat(textTemplate_ID);
        //    return Json(JsonConvert.SerializeObject(info), JsonRequestBehavior.AllowGet);
        //}

        //public JsonResult GetAttachment(int textTemplate_ID)
        //{
        //    Ctx ctx = Session["ctx"] as Ctx;
        //    EmailModel am = new EmailModel(ctx);
        //    InitMailAttachment attach = am.GetAttachment(textTemplate_ID);
        //    return Json(attach, JsonRequestBehavior.AllowGet);
        //}


        //public JsonResult SaveAttachmentForLetter()
        //{
        //    Ctx ctx = Session["ctx"] as Ctx;
        //    EmailModel am = new EmailModel(ctx);
        //    string aaa = am.htmlToPdf();
        //    return Json(JsonConvert.SerializeObject(aaa), JsonRequestBehavior.AllowGet);
        //}


        //[ValidateInput(false)]
        //[AjaxAuthorizeAttribute]
        //[AjaxSessionFilterAttribute]
        //public JsonResult CreatePdf(List<NewMailMessage> newLetter)
        //{
        //    Ctx ctx = Session["ctx"] as Ctx;
        //    EmailModel am = new EmailModel(ctx);
        //    string aaa = am.HtmlToPdf(newLetter);
        //    return Json(JsonConvert.SerializeObject(aaa), JsonRequestBehavior.AllowGet);
        //}

        [HttpPost]
        public ActionResult ConvertHtmlToSfdt(string htmlContent)
        {
            try
            {
                if (string.IsNullOrEmpty(htmlContent))
                {
                    return Json(new { success = false, error = "HTML content is required" }, JsonRequestBehavior.AllowGet);
                }

                // Method 1: Using WordDocument directly
                WordDocument document = WordDocument.LoadString(htmlContent, FormatType.Html);

                // Serialize the entire document to JSON (SFDT)
                string sfdtContent = JsonConvert.SerializeObject(document);

                document.Dispose();

                return Json(new { success = true, sfdtContent = sfdtContent }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult ConvertSfdtToHtml(string sfdtContent)
        {
            try
            {
                if (string.IsNullOrEmpty(sfdtContent))
                    return Json(new { success = false, error = "SFDT content is required" }, JsonRequestBehavior.AllowGet);

                using (var stream = WordDocument.Save(sfdtContent, FormatType.Html))
                {
                    stream.Position = 0;

                    string html = new StreamReader(stream).ReadToEnd();
                    var bodyMatch = Regex.Match(html, @"<body[^>]*>([\s\S]*?)<\/body>", RegexOptions.IgnoreCase);

                    string cleanHtml = bodyMatch.Success ? bodyMatch.Groups[1].Value : html;

                    return Json(new { success = true, htmlContent = cleanHtml.Trim() });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, error = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }

    }
}
