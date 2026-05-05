using Newtonsoft.Json;
using System.Collections.Generic;
using System.Data;
using System.Web.Mvc;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using VIS.Filters;

namespace VIS.Controllers
{
    public class AgingReceivablesController : Controller
    {
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult GetAgingReceivables()
        {
            if (Session["ctx"] == null)
                return Json(new { error = "Session Expired" }, JsonRequestBehavior.AllowGet);

            Ctx ctx = Session["ctx"] as Ctx;

            string sql = @"
                WITH schema_currency AS (
                    SELECT
                        ci.AD_Client_ID,
                        acc.C_Currency_ID AS acct_currency_id
                    FROM AD_ClientInfo ci
                    JOIN C_AcctSchema acc
                        ON ci.C_AcctSchema1_ID = acc.C_AcctSchema_ID
                )
                SELECT
                    ROW_NUMBER() OVER (
                        ORDER BY
                            COALESCE(
                                CASE
                                    WHEN o.C_Currency_ID = sc.acct_currency_id THEN o.GrandTotal
                                    ELSE CurrencyConvert(
                                        o.GrandTotal,
                                        o.C_Currency_ID,
                                        sc.acct_currency_id,
                                        o.DateOrdered,
                                        o.C_ConversionType_ID,
                                        o.AD_Client_ID,
                                        o.AD_Org_ID
                                    )
                                END,
                                0
                            ) DESC
                    ) AS Sr_No,

                    o.DocumentNo AS Order_No,
                    bp.Name AS Customer_Name,
                    o.DocStatus AS Document_Status,

                    CASE
                        WHEN o.VAS_OrderStatus IN ('DE', 'FP') THEN 'Full'
                        WHEN o.VAS_OrderStatus IN ('PD', 'PF', 'PI') THEN 'Partial'
                        WHEN o.VAS_OrderStatus = 'OP' THEN 'Not Delivered'
                        ELSE 'Unknown'
                    END AS Delivery_Status,

                    CASE
                        WHEN o.VAS_OrderStatus IN ('OP', 'PD', 'DE') THEN 'Not Raised'
                        WHEN o.VAS_OrderStatus IN ('FP', 'PI') THEN 'Partial Raised'
                        ELSE 'Unknown'
                    END AS Invoice_Status,

                    COALESCE(
                        CASE
                            WHEN o.C_Currency_ID = sc.acct_currency_id THEN o.GrandTotal
                            ELSE CurrencyConvert(
                                o.GrandTotal,
                                o.C_Currency_ID,
                                sc.acct_currency_id,
                                o.DateOrdered,
                                o.C_ConversionType_ID,
                                o.AD_Client_ID,
                                o.AD_Org_ID
                            )
                        END,
                        0
                    ) AS Order_Value,

                    TO_CHAR(TRUNC(SYSDATE) - TRUNC(o.DateOrdered)) || 'd' AS Days_Pending

                FROM C_Order o
                JOIN C_BPartner bp
                    ON o.C_BPartner_ID = bp.C_BPartner_ID
                JOIN schema_currency sc
                    ON sc.AD_Client_ID = o.AD_Client_ID

                WHERE o.IsSoTrx = 'Y'
                  AND o.VAS_OrderStatus NOT IN ('DI', 'IN')
                  AND o.DocStatus IN ('CO', 'CL')
                  AND o.AD_Client_ID = " + ctx.GetAD_Client_ID() + @"

                ORDER BY Order_Value DESC
                FETCH FIRST 20 ROWS ONLY";

            var rows = new List<object>();

            IDataReader dr = null;
            try
            {
                dr = DB.ExecuteReader(sql);
                while (dr != null && dr.Read())
                {
                    rows.Add(new
                    {
                        srNo             = Util.GetValueOfInt(dr["Sr_No"]),
                        orderNo          = dr["Order_No"]?.ToString(),
                        customerName     = dr["Customer_Name"]?.ToString(),
                        documentStatus   = dr["Document_Status"]?.ToString(),
                        deliveryStatus   = dr["Delivery_Status"]?.ToString(),
                        invoiceStatus    = dr["Invoice_Status"]?.ToString(),
                        orderValue       = Util.GetValueOfDecimal(dr["Order_Value"]),
                        daysPending      = dr["Days_Pending"]?.ToString()
                    });
                }
            }
            finally
            {
                dr?.Close();
            }

            return Json(JsonConvert.SerializeObject(rows), JsonRequestBehavior.AllowGet);
        }
    }
}
