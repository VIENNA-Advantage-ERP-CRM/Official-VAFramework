using Syncfusion.Licensing;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace VIS.Areas.VIS.Classes
{
    public class SyncfusionLicenseConfig
    {
        private static bool _isRegistered = false;

        public static void RegisterSyncfusionLicense()
        {
            if (_isRegistered)
                return;

            try
            {
                // Try from web.config
                string licenseKey = ConfigurationManager.AppSettings["SyncfusionLicense"];

                if (!string.IsNullOrEmpty(licenseKey))
                {
                    SyncfusionLicenseProvider.RegisterLicense(licenseKey);
                    _isRegistered = true;
                    System.Diagnostics.Debug.WriteLine("Syncfusion license registered successfully.");
                }
                else
                {
                    System.Diagnostics.Debug.WriteLine("Syncfusion license key not found.");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Syncfusion license registration failed: " + ex.Message);
            }
        }
    }
}