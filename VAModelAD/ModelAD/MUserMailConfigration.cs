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
        /// Signature of the mailbox the context user sends from, with the placeholders filled from the user:
        /// @Name@, @Title@, @Phone@, @EMail@, @Org_Name@ and @Client_Name@.
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

            // Placeholders: values are HTML-encoded, they come from the user record and go into HTML
            DataSet ds = DB.ExecuteDataset("SELECT u.Name, u.Title, u.Phone, u.EMail FROM AD_User u WHERE u.AD_User_ID=" + ctx.GetAD_User_ID());
            DataRow user = ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0 ? ds.Tables[0].Rows[0] : null;
            string orgName = Util.GetValueOfString(DB.ExecuteScalar("SELECT Name FROM AD_Org WHERE AD_Org_ID=" + ctx.GetAD_Org_ID()));
            string clientName = Util.GetValueOfString(DB.ExecuteScalar("SELECT Name FROM AD_Client WHERE AD_Client_ID=" + ctx.GetAD_Client_ID()));

            signature = ReplacePlaceholder(signature, "Name", user == null ? "" : Util.GetValueOfString(user["Name"]));
            signature = ReplacePlaceholder(signature, "Title", user == null ? "" : Util.GetValueOfString(user["Title"]));
            signature = ReplacePlaceholder(signature, "Phone", user == null ? "" : Util.GetValueOfString(user["Phone"]));
            signature = ReplacePlaceholder(signature, "EMail", user == null ? "" : Util.GetValueOfString(user["EMail"]));
            signature = ReplacePlaceholder(signature, "Org_Name", orgName);
            signature = ReplacePlaceholder(signature, "Client_Name", clientName);
            return signature;
        }

        /// <summary>Replaces @name@ (any case) by the HTML-encoded value.</summary>
        private static string ReplacePlaceholder(string html, string name, string value)
        {
            return System.Text.RegularExpressions.Regex.Replace(html, "@" + name + "@", System.Net.WebUtility.HtmlEncode(value ?? ""),
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
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
