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

        private static string _protocol = "";
        private static int _credentialId;

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



        public static string GetMailProtocol(Ctx ctx, out int credentialId)
        {
            credentialId = 0;
            if (_protocol != "")
            {
                credentialId = _credentialId;
                return _protocol;
            }
            int mailConfigID = Util.GetValueOfInt(DB.ExecuteScalar("SELECT AD_UserMailConfigration_ID FROM AD_UserMailConfigration WHERE IsActive='Y' AND AD_User_ID=" + ctx.GetAD_User_ID() + " ORDER BY Updated DESC"));
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
            _credentialId = credentialId;
            _protocol = protocol;
            return protocol;
        }
    }
}
