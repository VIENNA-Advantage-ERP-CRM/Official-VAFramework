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
            "ALL_TABLES","ALL_TAB_COLUMNS","DATABASE","SYSDBA", "UNION ALL"
            };

        // A SQL identifier (table or column name), optionally qualified as table.column.
        // Identifiers are never legitimately anything but letters/digits/underscore, so a strict
        // whitelist is the correct guard for client-supplied identifiers that must be concatenated
        // into SQL (identifiers cannot be passed as bind parameters).
        private static readonly Regex IdentifierPattern =
            new Regex(@"^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$", RegexOptions.Compiled);

        /// <summary>
        /// True if <paramref name="identifier"/> is a safe, simple SQL identifier (table/column name,
        /// optionally table.column). Use to validate client-supplied identifiers before concatenation.
        /// </summary>
        public static bool IsValidIdentifier(string identifier)
        {
            return !string.IsNullOrEmpty(identifier) && IdentifierPattern.IsMatch(identifier);
        }

        /// <summary>
        /// Rebuilds a comma-separated list, keeping only the integer items, for safe use inside an
        /// SQL IN(...) clause. Returns "-1" (matches nothing) when there are no valid integers, so the
        /// resulting IN(...) is always syntactically valid and never injectable.
        /// </summary>
        public static string SafeIntList(string csv)
        {
            string result = "";
            if (!string.IsNullOrEmpty(csv))
            {
                foreach (string part in csv.Split(','))
                {
                    int v;
                    if (int.TryParse(part.Trim(), out v))
                        result += (result.Length > 0 ? "," : "") + v;
                }
            }
            return result.Length == 0 ? "-1" : result;
        }

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

        public static string TrimKeywordChar(string sql)
        {
            if (string.IsNullOrEmpty(sql))
                return sql;


            sql = sql.ToUpper();


            foreach (string key in Keyword)
            {
                if (Regex.IsMatch(sql, "\\b" + key + "\\b"))
                {
                    sql = sql.Replace(key, key.Substring(1));
                }
                   
            }

            

            return sql;
        }

    }
}