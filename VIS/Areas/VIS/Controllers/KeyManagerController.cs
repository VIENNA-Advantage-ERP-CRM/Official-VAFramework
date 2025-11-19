using Antlr.Runtime.Misc;
using SecureEngineUtility.Classes.KeyStore;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Http.ModelBinding.Binders;
using System.Web.Mvc;

namespace VIS.Controllers
{
    [Authorize]
    public class KeyManagerController : Controller
    {

        IKeyProvider _keyProvider;
        KeyProfile _profile;
        KeyModel km = null;

        string providerType = "SF"; //shared file




        // GET: VIS/KeyManager



        public ActionResult Index(string action,KeyModel kmodel)
        {

            if (action == "Generate")
            {
                km = kmodel;
                Generate(km);// Handle Generate logic
            }
            else if (action == "Rotate")
            {

               Rotate();
            }

            else
            {

                km = new KeyModel();

                if (!string.IsNullOrEmpty(Request.QueryString["error"]))
                {
                    Session["error"] = Request.QueryString["error"];

                    return RedirectToAction("Index");

                    // Then clean the URL
                    //Context.ApplicationInstance.CompleteRequest();
                }

                if (Session["error"] != null)
                {
                    km.IsError = true;

                    km.Message = Session["error"].ToString();
                }

                GetKeyInfo();
                UpdateText();
            }

                return View(km);
            
        }


        private KeyModel Generate(KeyModel kmodel)
        {

            string path = kmodel.Path;
            if (path != null && path != "" && (path.StartsWith("\\") || path.Contains(":")))
            {

                Configuration config = WebConfigurationManager.OpenWebConfiguration("~");

                string retValue = KeyRotationHelper.CreateKeyAndDek(providerType, path);

                if (retValue == "")
                {
                    string key = "KeyProvider:KekSource";//kek path
                                                         // Open the Web.config for the current web application


                    // Check if the key already exists
                    if (config.AppSettings.Settings[key] == null)
                    {
                        config.AppSettings.Settings.Add(key, path);
                    }
                    else
                    {
                        config.AppSettings.Settings[key].Value = path;
                    }

                    // Save and refresh
                    config.Save(ConfigurationSaveMode.Modified);
                    ConfigurationManager.RefreshSection("appSettings");
                    GetKeyInfo();
                    UpdateText();
                }
                else
                {
                    GetKeyInfo();
                    UpdateText();
                    kmodel.Message = retValue;
                    kmodel.IsError = true;
                }
            }
            else
            {
                GetKeyInfo();
                UpdateText();
                kmodel.Message = "Invalid file path or empty";
                kmodel.IsError = true;
            }



            return kmodel;
        }

        private KeyModel  Rotate()
        {
            km = new KeyModel();
            GetKeyInfo();
            string retValue = KeyRotationHelper.RotateKek(_keyProvider);

            if (retValue == "")
            {
                //ConfigurationManager.AppSettings["KeyProvider:KekSource"] = txtPath.Value;//kek path
                GetKeyInfo();
                UpdateText();
                km.Message = "Successfully rotated";
                
            }
            else
            {
                GetKeyInfo();
                UpdateText();
                km.Message = retValue;
                km.IsError = true;
            }
            return km;
        }

        private void UpdateText()
        {
            if (_profile != null)
            {
                km.DKey = Convert.ToBase64String(_profile.Dek);
                km.IsLegecy = _profile.IsLegacy ;
               
                km.Path =  _profile.IsLegacy ? "" : ConfigurationManager.AppSettings["KeyProvider:KekSource"];
            }
            else
            {
              km.IsSave =  true;
            }

        }

        private bool GetKeyInfo()
        {
            try
            {
                _keyProvider = KeyProviderFactory.CreateFromConfig();

                _profile = KeyProviderFactory.GetKeyProfile(_keyProvider);

                return true;
            }
            catch (Exception ex)
            {
                km.Message = ex.Message;
                km.IsError = true;
                // (ex.Message);
                return false;
            }
        }


    }





    public class KeyModel
    {
       public bool IsError { get; set; }

       public String Message { get; set; }
       public bool IsLegecy { get; set; }
        
       public string Path { get; set; }

       public bool IsSave { get; set; }
        public String DKey { get; set; }
    }
}