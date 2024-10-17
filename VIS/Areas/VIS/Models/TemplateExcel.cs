using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VAdvantage.Utility;
using System.Runtime.InteropServices;
using MarketSvc.Classes;
namespace VIS.Models
{
    public class TemplateExcel
    {
        /// <summary>
        /// return List of FileNames of Window
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="windowName"></param>
        /// <returns></returns>
        public List<MarketSvc.MService.ExcelDataTemplate> excelDataTemplate(Ctx ctx, string windowName)
        {
            List<MarketSvc.MService.ExcelDataTemplate> list = new List<MarketSvc.MService.ExcelDataTemplate>();
            list = Utility.GetExcelTemplates(windowName);
            return list;
            
        }
        /// <summary>
        /// Download file
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public string DownloadTemplate(int fileId, string fileName)
        {
            string path = Utility.DownloadExcelTemplate(fileId, fileName);
            return path;
        }

    }

}