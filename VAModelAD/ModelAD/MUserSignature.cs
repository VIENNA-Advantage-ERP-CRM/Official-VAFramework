/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : MUserSignature
 * Purpose        : A user's own signature / initials image (AD_UserSignature), used from the
 *                  "My Sign" tab of the user preferences.
 ******************************************************/
using System;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Model
{
    public class MUserSignature : X_AD_UserSignature
    {
        /** Signature type of an uploaded signature (US) */
        public const string SIGNATURETYPE_Signature = "US";
        /** Signature type of uploaded initials (IN) */
        public const string SIGNATURETYPE_Initials = "IN";

        public MUserSignature(Ctx ctx, int AD_UserSignature_ID, Trx trxName)
            : base(ctx, AD_UserSignature_ID, trxName) { }

        public MUserSignature(Ctx ctx, DataRow rs, Trx trxName)
            : base(ctx, rs, trxName) { }
    }
}
