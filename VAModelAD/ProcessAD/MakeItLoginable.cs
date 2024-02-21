/*******************************************************
* Module Name  : VIS
* Purpose      : Set value of IsLoginable column to Y
* Window Used  : User
* Chronological: Development
* Created By   : Karamjit Singh
* Created On   : 29-Jan-2024
 ******************************************************/

using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;

namespace VAModelAD.ProcessAD
{
    public class MakeItLoginable: SvrProcess
    {
        /// <summary>
        /// Prepare - e.g., get Parameters.
        /// </summary>
        protected override void Prepare()
        {
        }

        /// <summary>
        /// Set the value IsLoginUser checkbox to True 
        /// </summary>
        /// <returns></returns>
        protected override String DoIt()
        {
            String Sql = "UPDATE AD_User SET IsLoginable='Y'  WHERE AD_User_ID=" + GetRecord_ID();
            int res=DB.ExecuteQuery(Sql);
            if (res > 0)
            {
                return Msg.GetMsg(GetCtx(), "VIS_UserIsLoginable");
            }
            return "";
        }
    }
}
