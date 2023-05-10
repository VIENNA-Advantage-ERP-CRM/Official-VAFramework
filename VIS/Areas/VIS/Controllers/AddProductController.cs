using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;
namespace VIS.Controllers
{
    /*******************************************************
       * Module Name    : VIS
       * Purpose        : Get values of Product.
       * chronological development.
       * Created Date   : 5 May  2023
       * Created by     : Ruby Devi
      ******************************************************/
    public class AddProductController : Controller
    {
        /// <summary>
        /// Get values to save new product.
        /// Ruby Devi 5 May 2023.
        /// </summary>
        /// <param name="ctx">Context</param>
        /// <param name="searchKey">Search key</param>
        /// <param name="name">Name</param>
        /// <param name="uom">Unit Of Measure</param>
        /// <param name="upc">Universal product Code</param>
        /// <param name="proType">Product Type</param>
        /// <param name="proCategory">Product Category</param>
        /// <param name="taxCategory">Tax Category</param>
        /// <param name="attribute">Attribute Set</param>
        /// <param name="purchased">IsPurchased</param>
        /// <param name="sold">IsSold</param>
        /// <param name="stocked">IsStocked</param>
        /// <param name="description">Description</param>
        /// <returns>save/Not save</returns>
        public string AddNewProduct(string searchKey, string name, string uom, string upc, string proType, string proCategory, string taxCategory, string attribute, bool purchased,
            bool sold, bool stocked, string description)
        {
            var result = "";
            if (Session["Ctx"] != null)
            {
                var ctx = Session["ctx"] as Ctx;
                AddProductModel obj = new AddProductModel();
                result = obj.AddNewProduct(ctx, searchKey, name, uom, upc, proType, proCategory, taxCategory, attribute, purchased, sold, stocked, description);
            }
            return result;
        }
    }
}