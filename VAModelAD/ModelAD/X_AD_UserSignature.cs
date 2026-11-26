namespace VAdvantage.Model
{
    /** Generated Model - DO NOT CHANGE
     *  NOTE: written by hand, in the shape the generator produces, because the AD_UserSignature table does
     *  not exist yet. The columns are the same as AD_UserSignature in the DMS module. Once the table is
     *  created and registered in the dictionary, regenerate this class and keep MUserSignature as it is. */
    using System;
    using System.Text;
    using VAdvantage.DataBase;
    using VAdvantage.Common;
    using VAdvantage.Classes;
    using VAdvantage.Process;
    using VAdvantage.Model;
    using VAdvantage.Utility;
    using System.Data;

    /** Generated Model for AD_UserSignature
     *  A user's own signature / initials image, kept for reuse.
     *  @version Vienna Framework 1.1.1 - $Id$ */
    public class X_AD_UserSignature : PO
    {
        public X_AD_UserSignature(Context ctx, int AD_UserSignature_ID, Trx trxName) : base(ctx, AD_UserSignature_ID, trxName) { }
        public X_AD_UserSignature(Ctx ctx, int AD_UserSignature_ID, Trx trxName) : base(ctx, AD_UserSignature_ID, trxName) { }
        /** Load Constructor */
        public X_AD_UserSignature(Context ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_UserSignature(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName) { }
        /** Load Constructor */
        public X_AD_UserSignature(Ctx ctx, IDataReader dr, Trx trxName) : base(ctx, dr, trxName) { }

        /** Static Constructor - Set Table ID By Table Name */
        static X_AD_UserSignature() { Table_ID = Get_Table_ID(Table_Name); model = new KeyNamePair(Table_ID, Table_Name); }

        /** Serial Version No */
        static long serialVersionUID = 30000000000002L;
        /** AD_Table_ID resolved at load from Table_Name */
        public static int Table_ID;
        /** TableName=AD_UserSignature */
        public static String Table_Name = "AD_UserSignature";
        protected static KeyNamePair model;
        /** AccessLevel = 7 - System/Client/Organization */
        protected Decimal accessLevel = new Decimal(7);

        protected override int Get_AccessLevel() { return Convert.ToInt32(accessLevel.ToString()); }
        protected override POInfo InitPO(Context ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        protected override POInfo InitPO(Ctx ctx) { POInfo poi = POInfo.GetPOInfo(ctx, Table_ID); return poi; }
        public override String ToString() { StringBuilder sb = new StringBuilder("X_AD_UserSignature[").Append(Get_ID()).Append("]"); return sb.ToString(); }

        /** Set AD_UserSignature_ID (primary key). */
        public void SetAD_UserSignature_ID(int AD_UserSignature_ID)
        {
            if (AD_UserSignature_ID < 1) throw new ArgumentException("AD_UserSignature_ID is mandatory.");
            Set_ValueNoCheck("AD_UserSignature_ID", AD_UserSignature_ID);
        }
        public int GetAD_UserSignature_ID() { Object ii = Get_Value("AD_UserSignature_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set AD_UserSignature_GUID. */
        public void SetAD_UserSignature_GUID(String AD_UserSignature_GUID)
        {
            if (AD_UserSignature_GUID == null) throw new ArgumentException("AD_UserSignature_GUID is mandatory.");
            if (AD_UserSignature_GUID.Length > 500) { log.Warning("Length > 500 - truncated"); AD_UserSignature_GUID = AD_UserSignature_GUID.Substring(0, 500); }
            Set_Value("AD_UserSignature_GUID", AD_UserSignature_GUID);
        }
        public String GetAD_UserSignature_GUID() { return (String)Get_Value("AD_UserSignature_GUID"); }

        /** Set User/Contact - the owner of the signature. 0 is a real user (SuperUser), so only a negative value clears it. */
        public void SetAD_User_ID(int AD_User_ID)
        {
            if (AD_User_ID < 0) Set_Value("AD_User_ID", null);
            else Set_Value("AD_User_ID", AD_User_ID);
        }
        public int GetAD_User_ID() { Object ii = Get_Value("AD_User_ID"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Set Export. */
        public void SetExport_ID(String Export_ID)
        {
            if (Export_ID != null && Export_ID.Length > 50) { log.Warning("Length > 50 - truncated"); Export_ID = Export_ID.Substring(0, 50); }
            Set_Value("Export_ID", Export_ID);
        }
        public String GetExport_ID() { return (String)Get_Value("Export_ID"); }

        /** Set Email. */
        public void SetEmail(String Email)
        {
            if (Email == null) throw new ArgumentException("Email is mandatory.");
            if (Email.Length > 60) { log.Warning("Length > 60 - truncated"); Email = Email.Substring(0, 60); }
            Set_Value("Email", Email);
        }
        public String GetEmail() { return (String)Get_Value("Email"); }

        /** Set Full Name. */
        public void SetFullName(String FullName)
        {
            if (FullName != null && FullName.Length > 60) { log.Warning("Length > 60 - truncated"); FullName = FullName.Substring(0, 60); }
            Set_Value("FullName", FullName);
        }
        public String GetFullName() { return (String)Get_Value("FullName"); }

        /** Set Is Default. */
        public void SetIsDefault(Boolean IsDefault) { Set_Value("IsDefault", IsDefault); }
        public Boolean IsIsDefault()
        {
            Object oo = Get_Value("IsDefault");
            if (oo != null) { if (oo.GetType() == typeof(bool)) return Convert.ToBoolean(oo); return "Y".Equals(oo); }
            return false;
        }

        /** Set Signature Group - ties the signature and the initials saved together. */
        public void SetSignatureGroup(String SignatureGroup)
        {
            if (SignatureGroup != null && SignatureGroup.Length > 50) { log.Warning("Length > 50 - truncated"); SignatureGroup = SignatureGroup.Substring(0, 50); }
            Set_Value("SignatureGroup", SignatureGroup);
        }
        public String GetSignatureGroup() { return (String)Get_Value("SignatureGroup"); }

        /** Set Signature Image - AD_Image_ID of the picture. */
        public void SetSignatureImage(int SignatureImage) { Set_Value("SignatureImage", SignatureImage); }
        public int GetSignatureImage() { Object ii = Get_Value("SignatureImage"); if (ii == null) return 0; return Convert.ToInt32(ii); }

        /** Comapany = CO */
        public static String SIGNATURETYPE_Comapany = "CO";
        /** Drawing = DR */
        public static String SIGNATURETYPE_Drawing = "DR";
        /** Date = DT */
        public static String SIGNATURETYPE_Date = "DT";
        /** Email = EM */
        public static String SIGNATURETYPE_Email = "EM";
        /** First Name = FN */
        public static String SIGNATURETYPE_FirstName = "FN";
        /** Initials = IN */
        public static String SIGNATURETYPE_Initials = "IN";
        /** Last Name = LN */
        public static String SIGNATURETYPE_LastName = "LN";
        /** Name = NA */
        public static String SIGNATURETYPE_Name = "NA";
        /** Full Name = SG */
        public static String SIGNATURETYPE_FullName = "SG";
        /** Stamp = ST */
        public static String SIGNATURETYPE_Stamp = "ST";
        /** Title = TI */
        public static String SIGNATURETYPE_Title = "TI";
        /** Text = TX */
        public static String SIGNATURETYPE_Text = "TX";
        /** Upload Signature = US */
        public static String SIGNATURETYPE_UploadSignature = "US";

        /** Is test a valid value. */
        public bool IsSignatureTypeValid(String test)
        {
            return test.Equals("CO") || test.Equals("DR") || test.Equals("DT") || test.Equals("EM") || test.Equals("FN") || test.Equals("IN")
                || test.Equals("LN") || test.Equals("NA") || test.Equals("SG") || test.Equals("ST") || test.Equals("TI") || test.Equals("TX") || test.Equals("US");
        }

        /** Set Signature Type. */
        public void SetSignatureType(String SignatureType)
        {
            if (SignatureType == null) throw new ArgumentException("SignatureType is mandatory");
            if (!IsSignatureTypeValid(SignatureType))
                throw new ArgumentException("SignatureType Invalid value - " + SignatureType + " - CO - DR - DT - EM - FN - IN - LN - NA - SG - ST - TI - TX - US");
            if (SignatureType.Length > 2) { log.Warning("Length > 2 - truncated"); SignatureType = SignatureType.Substring(0, 2); }
            Set_Value("SignatureType", SignatureType);
        }
        public String GetSignatureType() { return (String)Get_Value("SignatureType"); }
    }
}
