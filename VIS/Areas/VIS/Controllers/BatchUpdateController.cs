using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.Utility;
using VIS.Models;

namespace VIS.Controllers
{
    public class BatchUpdateController : Controller
    {
        public string ExcuteBatchUpdate(UpdateList updateL)
        {
            Ctx ctx = Session["ctx"] as Ctx;
            BatchUpdateModel objBatchUpdate = new BatchUpdateModel();
            return objBatchUpdate.ExcuteBatchUpdate(ctx,updateL);
        }
    }
}