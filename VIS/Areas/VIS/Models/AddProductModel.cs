﻿using System;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Logging;
using VAdvantage.Model;
using VAdvantage.Utility;
namespace VIS.Models
{
    /*******************************************************
       * Module Name    : VIS
       * Purpose        : Adding New Product Through Dialog Box.
       * chronological development.
       * Created Date   : 5 May  2023
       * Created by     : Ruby Devi
      ******************************************************/
    public class AddProductModel
    {
        VLogger _log = VLogger.GetVLogger(typeof(AddProductModel).FullName);
        /// <summary>
        /// Save new product.
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
        public string AddNewProduct(Ctx ctx, string searchKey, string name, string uom, string upc, string proType, string proCategory, string taxCategory, string attribute, bool purchased,
        bool sold, bool stocked, string description)
        {
            try
            {
                MProduct obj = new MProduct(ctx, 0, null);
                obj.SetAD_Client_ID(ctx.GetAD_Client_ID());
                obj.SetAD_Org_ID(ctx.GetAD_Org_ID());
                obj.SetValue(searchKey);
                obj.SetName(name);
                obj.SetC_UOM_ID(Util.GetValueOfInt(uom));
                obj.SetUPC(upc);
                obj.SetProductType(proType);
                obj.SetM_Product_Category_ID(Util.GetValueOfInt(proCategory));
                obj.SetC_TaxCategory_ID(Util.GetValueOfInt(taxCategory));
                obj.SetM_AttributeSet_ID(Util.GetValueOfInt(attribute));
                obj.SetIsPurchased(purchased);
                obj.SetIsSold(sold);
                obj.SetIsStocked(stocked);
                obj.SetDescription(description);
                obj.SetIsActive(true);
                if (!obj.Save())
                {
                    {
                        ValueNamePair vnp = VLogger.RetrieveError();
                        if (vnp != null && vnp.GetName() != null)
                        {
                            string info = vnp.GetName();
                            if (info.IndexOf("VISDBERRORCOLUMN:") > -1)
                            {
                                string[] errorCol = info.Replace("VISDBERRORCOLUMN: ", "").Split(',');
                                DataTable dt = DB.ExecuteDataset("SELECT columnName,Name FROM  AD_Column WHERE AD_Table_ID=" + obj.Get_Table_ID()).Tables[0];
                                string finalColumn = "";
                                for (int i = 0; i < errorCol.Length; i++)
                                {
                                    for (int j = 0; j < dt.Rows.Count; j++)
                                    {
                                        if (errorCol[i].ToUpper() == Util.GetValueOfString(dt.Rows[j]["columnName"]).ToUpper())
                                        {
                                            finalColumn += Util.GetValueOfString(dt.Rows[j]["Name"]);
                                            if ((i + 1) < errorCol.Length)
                                            {
                                                finalColumn += " and ";
                                            }
                                            break;
                                        }
                                    }
                                }
                                return Msg.GetMsg(ctx, "VISSaveErrorNotUnique") + "" + finalColumn;
                            }
                            return info;
                        }
                    }
                }
                return "OK";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}