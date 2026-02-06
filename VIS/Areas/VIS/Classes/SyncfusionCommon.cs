using Newtonsoft.Json;
using Syncfusion.EJ2.DocumentEditor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Model;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Classes
{
    public static class SyncfusionCommon
    {

        public static string ConvertSfdtToHtml(string sfdtContent)
        {
            try
            {                
                using (var stream = WordDocument.Save(sfdtContent, FormatType.Html))
                {
                    stream.Position = 0;

                    string html = new StreamReader(stream).ReadToEnd();
                    var bodyMatch = Regex.Match(html, @"<body[^>]*>([\s\S]*?)<\/body>", RegexOptions.IgnoreCase);

                    string cleanHtml = bodyMatch.Success ? bodyMatch.Groups[1].Value : html;

                    return cleanHtml.Trim();
                }
            }
            catch (Exception ex)
            {
                return "ERROR: " + ex.Message;
            }
        }

        public static string ConvertHtmlToSfdt(string htmlContent)
        {
            try
            {
                htmlContent = Uri.UnescapeDataString(htmlContent);
                // Method 1: Using WordDocument directly
                WordDocument document = WordDocument.LoadString(htmlContent, FormatType.Html);

                // Serialize the entire document to JSON (SFDT)
                string sfdtContent = JsonConvert.SerializeObject(document);
                document.Dispose();
                return sfdtContent;
            }
            catch (Exception ex)
            {
                return "ERROR: " + ex.Message;
            }
        }

        public static string SaveDocumentHTML(Ctx ctx, int recordID, string tableName, string columnName, string sfdt)
        {
            try
            {
                if (ctx == null)
                    return "ERROR: Context is null";

                if (recordID < 0)
                    return "ERROR: Invalid recordID";

                if (string.IsNullOrWhiteSpace(tableName))
                    return "ERROR: tableName is empty";

                if (string.IsNullOrWhiteSpace(columnName))
                    return "ERROR: columnName is empty";

                if (string.IsNullOrWhiteSpace(sfdt))
                    return "ERROR: Document data (SFDT) is empty";

                // Convert SFDT -> HTML
                string html = ConvertSfdtToHtml(sfdt);

                if (!string.IsNullOrEmpty(html) &&
                    html.TrimStart().StartsWith("ERROR:", StringComparison.OrdinalIgnoreCase))
                {
                    return html;
                }

                PO po = MTable.GetPO(ctx, tableName, recordID, null);
                if (po == null)
                    return "ERROR: Record not found";

                // Save HTML into requested column
                po.Set_ValueNoCheck(columnName, html);                

                if (po.Save())
                    return Util.GetValueOfString( po.Get_ID());

                return "ERROR: Save failed";
            }
            catch (Exception ex)
            {
                return "ERROR: " + ex.Message;
            }
        }


        public static string GetDocumentSFDT(Ctx ctx, int recordID, string tableName, string columnName)
        {
            PO docSave = MTable.GetPO(ctx, tableName, recordID, null);
            var html = Util.GetValueOfString(docSave.Get_Value(columnName));
            return ConvertHtmlToSfdt(html);
        }
    }

}