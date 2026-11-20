namespace VIS.Models
{
    /// <summary>
    /// Body of POST api/VISTenant/CreateTenant. The same fields the Initial Tenant Setup
    /// screen posts to VSetup/InitailizeClientSetup, plus the role the call acts as.
    /// The credentials are not part of it - they come in the Authorization header.
    /// </summary>
    public class CreateTenantRequest
    {
        /// <summary>
        /// System role to act as. 0 = the first of the user's System roles that has access
        /// to the Initial Tenant Setup form.
        /// </summary>
        public int RoleID { get; set; }

        /// <summary>Login language, e.g. en_US - empty for the base language</summary>
        public string Language { get; set; }

        /// <summary>Name of the new tenant - also its search key</summary>
        public string ClientName { get; set; }

        public string OrgName { get; set; }

        /// <summary>Name of the tenant administrator user</summary>
        public string UserClient { get; set; }

        /// <summary>Organization user - the setup screen no longer asks for it and sends it empty</summary>
        public string UserOrg { get; set; }

        public string City { get; set; }

        public int CurrencyID { get; set; }

        /// <summary>Optional - read from C_Currency when empty</summary>
        public string CurrencyName { get; set; }

        public int CountryID { get; set; }

        /// <summary>Optional - read from C_Country when empty</summary>
        public string CountryName { get; set; }

        /// <summary>Required when the country has regions</summary>
        public int RegionID { get; set; }

        /// <summary>Optional - read from C_Region when empty</summary>
        public string RegionName { get; set; }

        //  Accounting dimensions - the check boxes of the setup screen
        public bool CfProduct { get; set; }
        public bool CfBPartner { get; set; }
        public bool CfProject { get; set; }
        public bool CfMCampaign { get; set; }
        public bool CfSRegion { get; set; }

        /// <summary>
        /// Optional localization package, the same shape the setup screen sends:
        /// { "Name": "...", "Value": "...", "Modules": [ { "Name": "...", "LatestAvailableVersion": "..." } ] }.
        /// Its modules are installed after the response has gone out; Tenant.LogKey names that run.
        /// </summary>
        public SelectedPackageInfo SelectedPackage { get; set; }
    }

    /// <summary>
    /// Answer of the tenant API, whatever the outcome.
    /// </summary>
    public class CreateTenantResponse
    {
        public bool Success { get; set; }

        /// <summary>Message key of the failure (AD_Message), null on success</summary>
        public string Error { get; set; }

        /// <summary>Failure in words, in the login language when the message is translated</summary>
        public string Message { get; set; }

        /// <summary>
        /// What tenant creation reported - the tenant, its admin user and password. Also set
        /// when creation stopped part way (Success false), so the caller can see what exists.
        /// </summary>
        public TenantInfo Tenant { get; set; }
    }
}
