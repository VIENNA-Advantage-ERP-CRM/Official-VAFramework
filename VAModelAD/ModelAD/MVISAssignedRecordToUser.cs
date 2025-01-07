using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VIS.Models
{
    public class MVISAssignedRecordToUser: X_VIS_AssignedRecordToUser
    {
        public MVISAssignedRecordToUser(Ctx ctx, int VIS_AssignedRecordToUser_ID, Trx trxName):base(ctx, VIS_AssignedRecordToUser_ID, trxName)
        {

        }
        public MVISAssignedRecordToUser(Ctx ctx, DataRow rs, Trx trxName) : base(ctx, rs, trxName)
        {
        }
    }
}