using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace VIS.Classes
{
    public class QueryValidator
    {
        private static List<string> Keyword = new List<string>()
            {
            "DROP","DELETE","V$SESSION","V$INSTANCE","UNION","SESSION","UPDATE","INSERT","TRUNCATE","--",//,"/*",
            "ALL_TABLES","ALL_TAB_COLUMNS","DATABASE","SYSDBA"
            };

        public static bool IsValid(string sql)
        {
            if (string.IsNullOrEmpty(sql))
                return true;


            sql = sql.ToUpper();


            foreach (string key in Keyword)
            {
                if (Regex.IsMatch(sql, "\\b" + key + "\\b"))
                    return false;
            }

            if (sql.IndexOf("/*") > -1 || sql.IndexOf("//")>-1)
                return false;

                return true;
        }

    }
}