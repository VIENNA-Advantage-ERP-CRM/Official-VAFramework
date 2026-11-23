/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : Reset Cache
 * Purpose        : Reset Cache
 * Class Used     : ProcessEngine.SvrProcess
 * Chronological    Development
 * Raghunandan     21-Sep-2009
  ******************************************************/
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Logging;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;
using VAModelAD.Classes;
using static System.Net.WebRequestMethods;

namespace VAdvantage.Process
{
    public class CacheReset : ProcessEngine.SvrProcess
    {
        /// <summary>
        /// Prepare - e.g., get Parameters.
        /// </summary>
        protected override void Prepare()
        {
        }


        /// <summary>
        /// Perform Process.
        /// </summary>
        /// <returns>Message to be translated</returns>
        protected override String DoIt()
        {
            log.Info("");
            Env.Reset(false);	// not final            
            return "Cache Reset";
        }
    }
}
