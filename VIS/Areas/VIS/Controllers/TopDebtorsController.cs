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
    public class TopDebtorsController : Controller
    {
        /// <summary>
        /// Returns the top 10 customers with the largest outstanding unpaid invoice balances
        /// (VA009_IsPaid = 'N', DocStatus IN ('CO','CL'), IsSOTrx = 'Y'), converted to the
        /// client's accounting schema currency. Credit notes are subtracted. Includes days
        /// overdue and a risk status flag (HIGH RISK = 30+ days overdue).
        /// </summary>
        [AjaxAuthorizeAttribute]
        [AjaxSessionFilterAttribute]
        public JsonResult GetTopDebtors()
        {
            if (Session["ctx"] == null)
                return Json(new { error = "Session Expired" }, JsonRequestBehavior.AllowGet);

            Ctx ctx = Session["ctx"] as Ctx;

            string sql = @"
                WITH schema_currency AS (
                    SELECT
                        ci.AD_Client_ID,
                        cs.C_Currency_ID AS Acct_Currency_ID,
                        cur.StdPrecision
                    FROM AD_ClientInfo ci
                    JOIN C_AcctSchema cs
                        ON cs.C_AcctSchema_ID = ci.C_AcctSchema1_ID
                    JOIN C_Currency cur
                        ON cur.C_Currency_ID = cs.C_Currency_ID
                ),
                debtor_data AS (
                    SELECT
                        bp.C_BPartner_ID,
                        bp.Name AS CustomerName,

                        ROUND(
                            COALESCE(SUM(
                                CASE
                                    WHEN i.IsSOTrx = 'Y' AND i.IsReturnTrx = 'N'
                                    THEN CurrencyConvert(
                                            ips.DueAmt,
                                            i.C_Currency_ID,
                                            sc.Acct_Currency_ID,
                                            i.DateAcct,
                                            i.C_ConversionType_ID,
                                            i.AD_Client_ID,
                                            i.AD_Org_ID
                                         )
                                    WHEN i.IsSOTrx = 'Y' AND i.IsReturnTrx = 'Y'
                                    THEN -CurrencyConvert(
                                            ips.DueAmt,
                                            i.C_Currency_ID,
                                            sc.Acct_Currency_ID,
                                            i.DateAcct,
                                            i.C_ConversionType_ID,
                                            i.AD_Client_ID,
                                            i.AD_Org_ID
                                         )
                                    ELSE 0
                                END
                            ), 0),
                            MAX(sc.StdPrecision)
                        ) AS Total_Debtor_Amount,

                        MAX(ips.DueDate) AS LastDueDate,

                        MAX(
                            CASE
                                WHEN ips.DueDate < TRUNC(SYSDATE)
                                THEN TRUNC(SYSDATE) - ips.DueDate
                                ELSE 0
                            END
                        ) AS Days_Overdue

                    FROM C_InvoicePaySchedule ips
                    JOIN C_Invoice i
                        ON ips.C_Invoice_ID = i.C_Invoice_ID
                    JOIN C_BPartner bp
                        ON bp.C_BPartner_ID = i.C_BPartner_ID
                    JOIN schema_currency sc
                        ON sc.AD_Client_ID = i.AD_Client_ID
                    WHERE ips.VA009_IsPaid = 'N'
                      AND i.DocStatus IN ('CO', 'CL')
                      AND i.IsSOTrx = 'Y'
                      AND bp.IsActive = 'Y'
                      AND i.AD_Client_ID = " + ctx.GetAD_Client_ID() + @"
                    GROUP BY
                        bp.C_BPartner_ID,
                        bp.Name
                )
                SELECT *
                FROM (
                    SELECT
                        C_BPartner_ID,
                        CustomerName,
                        Total_Debtor_Amount,
                        LastDueDate,
                        Days_Overdue,
                        CASE
                            WHEN Days_Overdue >= 30 THEN 'HIGH RISK'
                            ELSE 'ON TRACK'
                        END AS RiskStatus
                    FROM debtor_data
                    WHERE Total_Debtor_Amount > 0
                    ORDER BY Total_Debtor_Amount DESC
                )
                WHERE ROWNUM <= 10";

            var rows = new List<object>();

            IDataReader dr = null;
            try
            {
                dr = DB.ExecuteReader(sql);
                while (dr != null && dr.Read())
                {
                    rows.Add(new
                    {
                        customerName   = dr["CustomerName"]?.ToString(),
                        unpaidBalance  = Util.GetValueOfDecimal(dr["Total_Debtor_Amount"]),
                        lastDueDate    = dr["LastDueDate"]?.ToString(),
                        daysOverdue    = Util.GetValueOfInt(dr["Days_Overdue"]),
                        riskStatus     = dr["RiskStatus"]?.ToString()
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
