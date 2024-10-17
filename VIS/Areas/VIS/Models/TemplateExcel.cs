using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using VAdvantage.Utility;
using System.Runtime.InteropServices;
using System.Reflection;

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
        public dynamic ExcelDataTemplate(Ctx ctx, string windowName)
        {
            try
            {
                System.Reflection.Assembly asm = System.Reflection.Assembly.Load("MarketSvc");
                dynamic list = asm.GetType("MarketSvc.Classes.Utility").GetMethod("GetExcelTemplates", BindingFlags.Public | BindingFlags.Static).Invoke(null, new Object[] { windowName });
               
                return list;
            }
            catch (Exception e) {
                VAdvantage.Logging.VLogger.Get().Severe("ErrorGettingExcelTemplateFromCloudFW=>" + e.Message);
            }
            return null;
            
        }
        /// <summary>
        /// Download file
        /// </summary>
        /// <param name="fileId"></param>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public dynamic DownloadTemplate(int fileId, string fileName)
        {
            try
            {
                System.Reflection.Assembly asm = System.Reflection.Assembly.Load("MarketSvc");
                dynamic path = asm.GetType("MarketSvc.Classes.Utility").GetMethod("DownloadExcelTemplate", BindingFlags.Public | BindingFlags.Static).Invoke(null, new Object[] { fileId, fileName });
                return path;
            }
            catch (Exception e)
            { VAdvantage.Logging.VLogger.Get().Severe("ErrorDownloadingExcelTemplateFW=>" + e.Message); }
            return null;
        }

      
    }


}