using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class TemplateExcelController : Controller
    {
        // GET: VIS/TemplateExcel
        public ActionResult Index()
        {
            return View();
        }
        /// <summary>
        /// get windowname and return the list of filenames 
        /// </summary>
        /// <param name="windowName"></param>
        /// <returns></returns>
        public JsonResult TemplateExcel(String windowName)
        {
            dynamic result = null;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                TemplateExcel obj = new TemplateExcel();
                result = obj.ExcelDataTemplate(ctx, windowName);               
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }
        /// <summary>
        /// Download file 
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public JsonResult DownloadTemplateExcel(int fileId, string fileName)
        {
            string result = null;
            if (Session["ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                TemplateExcel obj = new TemplateExcel();
                result = obj.DownloadTemplate(fileId, fileName);
            }
            return Json(JsonConvert.SerializeObject(result), JsonRequestBehavior.AllowGet);
        }

    }
}