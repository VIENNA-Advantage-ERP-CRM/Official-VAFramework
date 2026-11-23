using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using VAdvantage.DataBase;
using VAdvantage.Classes;
using System.Data;
using System.Data.SqlClient;
using VAdvantage.Model;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MUserMailConfigration : X_AD_UserMailConfigration
    {

        public MUserMailConfigration(Ctx ctx, int AD_UserMailConfigration_ID, Trx trxName)
            : base(ctx, AD_UserMailConfigration_ID, trxName)
        {
            if (AD_UserMailConfigration_ID == 0)
            {
               
            }
        }

        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="rs">result set</param>
        /// <param name="trxName">transaction</param>
         public MUserMailConfigration(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName)
        {
        }
        /// <summary>
        /// Load Constructor
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="idr">idatareader</param>
        /// <param name="trxName">trasaction</param>
         public MUserMailConfigration(Ctx ctx, IDataReader idr, Trx trxName)
             : base(ctx, idr, trxName)
         {
         }



        /// <summary>
        /// Mail protocol and API credential of the context user: the user's latest active mail
        /// configuration, else the tenant's. Read on every call and not kept in a static field,
        /// because the result differs per user and tenant and changes when a configuration is saved.
        /// </summary>
        /// <param name="ctx">context of the user who sends</param>
        /// <param name="credentialId">VA101_APIAuthCredential_ID for an API protocol, else 0</param>
        /// <returns>protocol code, e.g. SM, SI or EX</returns>
        public static string GetMailProtocol(Ctx ctx, out int credentialId)
        {
            credentialId = 0;
            int mailConfigID = GetSendingConfigID(ctx);
            string protocol = "SM";
            if (Env.IsModuleInstalled("VA101_"))
            {
                protocol = Util.GetValueOfString(DB.ExecuteScalar("SELECT VA101_Protocol FROM AD_UserMailConfigration WHERE AD_UserMailConfigration_ID=" + mailConfigID));

                if (string.IsNullOrEmpty(protocol))
                {
                    protocol = Util.GetValueOfString(DB.ExecuteScalar("SELECT VA101_Protocol FROM AD_Client WHERE IsActive='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID()));
                    if (!string.IsNullOrEmpty(protocol) && protocol != "SM" && protocol != "SI")
                    {
                        credentialId = Util.GetValueOfInt(DB.ExecuteScalar("SELECT VA101_APIAuthCredential_ID FROM AD_Client WHERE IsActive='Y' AND AD_Client_ID=" + ctx.GetAD_Client_ID()));
                    }
                }
                else if (protocol != "SM" && protocol != "SI")
                {
                    credentialId = Util.GetValueOfInt(DB.ExecuteScalar("SELECT VA101_APIAuthCredential_ID FROM AD_UserMailConfigration WHERE AD_UserMailConfigration_ID=" + mailConfigID));
                }

            }
            return protocol;
        }

        /// <summary>Column of the signature, added by the VA101 module.</summary>
        public const string COLUMNNAME_VA101_EMailSignature = "VA101_EMailSignature";

        /// <summary>
        /// Mail configuration a mail of the context user is sent from: the user's latest active one.
        /// The protocol and the signature both come from it, so they always belong to the same mailbox.
        /// </summary>
        /// <param name="ctx">context of the user who sends</param>
        /// <returns>AD_UserMailConfigration_ID, 0 when the user has none (the tenant's mailbox sends)</returns>
        public static int GetSendingConfigID(Ctx ctx)
        {
            return Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_UserMailConfigration_ID FROM AD_UserMailConfigration WHERE IsActive='Y' AND AD_User_ID="
                + ctx.GetAD_User_ID() + " ORDER BY Updated DESC"));
        }

        /// <summary>
        /// Signature of the mailbox the context user sends from, with the placeholders filled (see FillPlaceholders).
        /// Empty when the user has no mail configuration (the tenant's mailbox has no personal signature),
        /// when the signature is empty or when the column does not exist (VA101 not installed).
        /// </summary>
        /// <param name="ctx">context of the user who sends</param>
        /// <returns>signature HTML or empty</returns>
        public static string GetSignature(Ctx ctx)
        {
            int mailConfigID = GetSendingConfigID(ctx);
            if (mailConfigID <= 0)
            {
                return "";
            }
            MUserMailConfigration config = new MUserMailConfigration(ctx, mailConfigID, null);
            if (config.Get_ColumnIndex(COLUMNNAME_VA101_EMailSignature) < 0)
            {
                return "";
            }
            string signature = CleanSignature(Util.GetValueOfString(config.Get_Value(COLUMNNAME_VA101_EMailSignature)));
            if (string.IsNullOrWhiteSpace(signature))
            {
                return "";
            }

            return FillPlaceholders(ctx, config, signature);
        }

        /// <summary>Table of the mail configuration.</summary>
        private const string CONFIG_TABLE = "AD_UserMailConfigration";

        /// <summary>
        /// Fills the placeholders of a signature, HTML-encoded:
        /// - @Table.Column@, e.g. @AD_User.Name@: the column of that table. The record is this mail configuration
        ///   for AD_UserMailConfigration, the sending user for AD_User, else the record this configuration or the
        ///   user points to (its Table_ID column), else the login's (#Table_ID, e.g. AD_Org, AD_Client).
        /// - @Column@, e.g. @Name@ or @EMail@: the column of this mail configuration.
        /// Blank when the table, column or record is not found, and always for encrypted columns and passwords,
        /// tokens and secrets, so a signature cannot show them.
        /// </summary>
        /// <param name="ctx">context of the user who sends</param>
        /// <param name="config">mail configuration the mail is sent from</param>
        /// <param name="html">signature HTML</param>
        /// <returns>signature with the placeholders filled</returns>
        private static string FillPlaceholders(Ctx ctx, MUserMailConfigration config, string html)
        {
            Dictionary<string, PO> records = new Dictionary<string, PO>(StringComparer.OrdinalIgnoreCase);
            records[CONFIG_TABLE] = config;
            return System.Text.RegularExpressions.Regex.Replace(html, @"@([A-Za-z][A-Za-z0-9_]*)(?:\.([A-Za-z][A-Za-z0-9_]*))?@", m =>
            {
                string tableName = m.Groups[2].Success ? m.Groups[1].Value : CONFIG_TABLE;
                string columnName = m.Groups[2].Success ? m.Groups[2].Value : m.Groups[1].Value;
                return System.Net.WebUtility.HtmlEncode(GetPlaceholderValue(ctx, config, records, tableName, columnName));
            });
        }

        /// <summary>Value of one placeholder, empty when it is not found or must not be shown.</summary>
        private static string GetPlaceholderValue(Ctx ctx, MUserMailConfigration config, Dictionary<string, PO> records, string tableName, string columnName)
        {
            try
            {
                // Table and column must exist in the dictionary; their real names come from there
                SqlParameter[] param = new SqlParameter[2];
                param[0] = new SqlParameter("@param1", tableName.ToUpper());
                param[1] = new SqlParameter("@param2", columnName.ToUpper());
                DataSet ds = DB.ExecuteDataset("SELECT t.TableName, c.ColumnName, c.IsEncrypted FROM AD_Column c"
                    + " INNER JOIN AD_Table t ON (c.AD_Table_ID=t.AD_Table_ID)"
                    + " WHERE UPPER(t.TableName)=@param1 AND UPPER(c.ColumnName)=@param2 AND c.IsActive='Y'", param);
                if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                {
                    return "";
                }
                DataRow col = ds.Tables[0].Rows[0];
                tableName = Util.GetValueOfString(col["TableName"]);
                columnName = Util.GetValueOfString(col["ColumnName"]);
                string upper = columnName.ToUpper();
                if (Util.GetValueOfString(col["IsEncrypted"]) == "Y" || upper.Contains("PASSWORD") || upper.Contains("TOKEN") || upper.Contains("SECRET"))
                {
                    return "";
                }

                PO po;
                if (!records.TryGetValue(tableName, out po))
                {
                    po = null;
                    int recordID = 0;
                    if (tableName.Equals("AD_User", StringComparison.OrdinalIgnoreCase))
                    {
                        recordID = ctx.GetAD_User_ID();
                    }
                    else
                    {
                        // the record the mail configuration points to, else the user's, else the login's
                        string keyColumn = tableName + "_ID";
                        if (config.Get_ColumnIndex(keyColumn) >= 0)
                        {
                            recordID = Util.GetValueOfInt(config.Get_Value(keyColumn));
                        }
                        if (recordID <= 0)
                        {
                            PO user = GetRecord(ctx, records, "AD_User", ctx.GetAD_User_ID());
                            if (user != null && user.Get_ColumnIndex(keyColumn) >= 0)
                            {
                                recordID = Util.GetValueOfInt(user.Get_Value(keyColumn));
                            }
                        }
                        if (recordID <= 0)
                        {
                            recordID = ctx.GetContextAsInt("#" + keyColumn);
                        }
                    }
                    po = GetRecord(ctx, records, tableName, recordID);
                }
                if (po == null || po.Get_ColumnIndex(columnName) < 0)
                {
                    return "";
                }
                return Util.GetValueOfString(po.Get_Value(columnName));
            }
            catch (Exception)
            {
                return "";
            }
        }

        /// <summary>Loads a record once per signature; null when it does not exist.</summary>
        private static PO GetRecord(Ctx ctx, Dictionary<string, PO> records, string tableName, int recordID)
        {
            PO po;
            if (records.TryGetValue(tableName, out po))
            {
                return po;
            }
            po = null;
            if (recordID > 0)
            {
                po = MTable.GetPO(ctx, tableName, recordID, null);
                if (po != null && po.Get_ID() != recordID)
                {
                    po = null;
                }
            }
            records[tableName] = po;
            return po;
        }

        /// <summary>
        /// Removes what must not run in the Email form or the Inbox: script, style, iframe, object, embed and form
        /// elements, on... event handlers and javascript: or vbscript: links.
        /// </summary>
        /// <param name="html">signature HTML</param>
        /// <returns>cleaned HTML</returns>
        public static string CleanSignature(string html)
        {
            if (string.IsNullOrEmpty(html))
            {
                return html;
            }
            System.Text.RegularExpressions.RegexOptions opt = System.Text.RegularExpressions.RegexOptions.IgnoreCase
                | System.Text.RegularExpressions.RegexOptions.Singleline;
            html = System.Text.RegularExpressions.Regex.Replace(html, @"<(script|style|iframe|object|embed|form)\b.*?</\1\s*>", "", opt);
            html = System.Text.RegularExpressions.Regex.Replace(html, @"<(script|style|iframe|object|embed|form|input|button|link|meta)\b[^>]*>", "", opt);
            html = System.Text.RegularExpressions.Regex.Replace(html, @"\son\w+\s*=\s*(""[^""]*""|'[^']*'|[^\s>]+)", "", opt);
            html = System.Text.RegularExpressions.Regex.Replace(html, @"(href|src)\s*=\s*([""']?)\s*(javascript|vbscript):[^""'\s>]*\2", "$1=$2#$2", opt);
            return html;
        }

        /// <summary>
        /// Cleans the signature before it is stored.
        /// </summary>
        /// <param name="newRecord">new record</param>
        /// <returns>true</returns>
        protected override bool BeforeSave(bool newRecord)
        {
            if (Get_ColumnIndex(COLUMNNAME_VA101_EMailSignature) >= 0 && Is_ValueChanged(COLUMNNAME_VA101_EMailSignature))
            {
                string signature = Util.GetValueOfString(Get_Value(COLUMNNAME_VA101_EMailSignature));
                string cleaned = CleanSignature(signature);
                if (cleaned != signature)
                {
                    Set_Value(COLUMNNAME_VA101_EMailSignature, cleaned);
                }
            }
            return true;
        }
    }
}
