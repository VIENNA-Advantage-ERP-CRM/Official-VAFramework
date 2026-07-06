using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Utility;
using VIS.DataContracts;
using VIS.Helpers;

namespace VISLogic.Models
{
    public class ArchiveViewerModel
    {

        public List<JTable> GetUserList(Ctx ctx)
        {
            string sql = "SELECT AD_User_ID, Name "
                + "FROM AD_User u WHERE EXISTS "
                    + "(SELECT * FROM AD_User_Roles ur WHERE u.AD_User_ID=ur.AD_User_ID) "
                + "ORDER BY 2";
            VAdvantage.Model.MRole.GetDefault(ctx).AddAccessSQL(sql,		//	Own First
                "AD_User", VAdvantage.Model.MRole.SQL_NOTQUALIFIED, VAdvantage.Model.MRole.SQL_RW);
            SqlHelper helper = new SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn();
            sqlIn.sql = sql;
           return  helper.ExecuteJDataSet(sqlIn);
        }

        public List<JTable> GetUserName(string userId)
        {
            // SECURITY: userId is a client-supplied request value; coerce to int so it cannot carry SQL.
            var sql = "SELECT Name FROM AD_User WHERE AD_User_ID=" + Util.GetValueOfInt(userId);
            SqlHelper helper = new SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn();
            sqlIn.sql = sql;
            return helper.ExecuteJDataSet(sqlIn);
        }

        public List<JTable> GetArchieveData(string whereClause, Ctx ctx)
        {
            var sqlMain = "SELECT AD_ARCHIVE_ID,AD_CLIENT_ID,AD_ORG_ID,AD_PROCESS_ID,AD_TABLE_ID,C_BPARTNER_ID,CREATED,CREATEDBY,DESCRIPTION,HELP," +
           " ISACTIVE,ISREPORT,NAME,RECORD_ID,UPDATED,UPDATEDBY,EXPORT_ID FROM AD_Archive WHERE AD_Client_ID=" + ctx.GetAD_Client_ID();

            // SECURITY: whereClause is a client-supplied SQL fragment (built in afilterpanel.js) concatenated
            // straight into the query. Screen it with the keyword denylist guard and drop the request (return
            // no rows) if it looks like an injection attempt, matching the pattern used in JsonDataController.
            if (whereClause != null && whereClause.Length > 0)
            {
                if (!VIS.Classes.QueryValidator.IsValid(whereClause))
                    return new List<JTable>();
                sqlMain += whereClause;
            }
            sqlMain += " ORDER BY Created desc";

            SqlHelper helper = new SqlHelper();
            SqlParamsIn sqlIn = new SqlParamsIn();
            sqlIn.sql = sqlMain;
            return helper.ExecuteJDataSet(sqlIn);
            
        }
    }
}
