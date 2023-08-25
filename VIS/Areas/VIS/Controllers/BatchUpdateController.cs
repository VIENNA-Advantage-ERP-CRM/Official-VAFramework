using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    /// <summary>
    /// Excute Direct Update
    /// </summary>
    /// <param name="ctx"></param>
    /// <param name="updateList"></param>
    /// <returns></returns>
    public class BatchUpdateController : Controller
    {
        /// <summary>
        /// Excute Direct Query
        /// </summary>
        /// <param name="updateL"></param>
        /// <returns></returns>
        public string ExcuteBatchUpdate(UpdateList updateL)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            BatchUpdateModel objBatchUpdate = new BatchUpdateModel();
            return objBatchUpdate.ExcuteBatchUpdate(ctx, updateL);
        }
    }
}