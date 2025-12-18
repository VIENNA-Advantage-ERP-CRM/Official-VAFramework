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
using VAdvantage.Utility;

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

                if (Session["Ctx"] == null)
                {
                    km.IsError = true;
                    km.Message = "Login context not found, Login again";
                }
                else
                {
                    Ctx ctx = Session["Ctx"] as Ctx;
                    km.IsAdmin = ctx.GetAD_Role_ID() == 0 && (ctx.GetAD_User_ID() == 100 || ctx.GetAD_User_ID() ==0);
                    GetKeyInfo();
                    UpdateText();
                }
            }

                return View(km);
            
        }


        private KeyModel Generate(KeyModel kmodel)
        {
            Ctx ctx = Session["Ctx"] as Ctx;
            kmodel.IsAdmin = ctx.GetAD_Role_ID() == 0 && (ctx.GetAD_User_ID() == 100 || ctx.GetAD_User_ID() == 0);
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
                    kmodel.Message = "Key Generated Succesfully";
                    
                    GetKeyInfo();
                    UpdateText();
                    Session["Ctx"] = ctx;
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
                kmodel.Message = "File path is invalid or empty(extension)";
                kmodel.IsError = true;
            }



            return kmodel;
        }

        private KeyModel  Rotate()
        {
            km = new KeyModel();


            km.IsAdmin = true;

            GetKeyInfo();
            string retValue = KeyRotationHelper.RotateKek(_keyProvider);

            if (retValue == "")
            {
                //ConfigurationManager.AppSettings["KeyProvider:KekSource"] = txtPath.Value;//kek path
                GetKeyInfo();
                UpdateText();
                km.Message = "Successfully Rotated";
                
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
                var input = Convert.ToBase64String(_profile.Dek);
                km.DKey = input.Length > 4 ? new string('*', input.Length - 4) + input.Substring(input.Length - 4): input;
                km.IsLegecy = _profile.IsLegacy ;
               
                km.Path =  _profile.IsLegacy ? "" : km.IsAdmin? ConfigurationManager.AppSettings["KeyProvider:KekSource"]: new string('*', input.Length - 4);
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
                KeyProfile profile;
                _keyProvider = KeyProviderFactory.CreateFromConfig(out profile);
                _profile = profile;
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
        public bool IsAdmin { get; set; }
    }
}