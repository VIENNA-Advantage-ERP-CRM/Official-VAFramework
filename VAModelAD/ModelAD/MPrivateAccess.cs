using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using VAdvantage.Utility;
using System.Data;
using VAdvantage.DataBase;
using VAdvantage.Logging;

namespace VAdvantage.Model
{

    public class MPrivateAccess : X_AD_Private_Access
    {
        #region Private Variables
        //private static long serialVersionUID = -5649529789751432279L;
        private static VLogger _log = VLogger.GetVLogger(typeof(MPrivateAccess).FullName);

        /** Tables that have at least one active private lock. The access filter for locked records is only added for
         *  them. Cleared whenever a lock is saved or deleted (and by the generic AD_Private_Access reset). The 1-minute
         *  expiry bounds the only gap: with several application servers, the first lock on a table that had none reaches
         *  the other servers' lists within a minute (further locks on a listed table are always checked live). */
        private static VAdvantage.Classes.CCache<string, HashSet<int>> s_lockedTables
            = new VAdvantage.Classes.CCache<string, HashSet<int>>("AD_Private_Access", 1, 1);
        private const string LOCKED_TABLES_KEY = "tables";
        #endregion

        /// <summary>
        /// Does the table have any active private lock (of any user)? Answered from a cache; true when unknown.
        /// </summary>
        public static bool HasLocks(int AD_Table_ID)
        {
            HashSet<int> tables;
            if (!s_lockedTables.TryGetValue(LOCKED_TABLES_KEY, out tables) || tables == null)
            {
                DataSet ds = DB.ExecuteDataset("SELECT DISTINCT AD_Table_ID FROM AD_Private_Access WHERE IsActive='Y'");
                if (ds == null || ds.Tables.Count == 0)
                    return true;    // unknown: keep the filter
                tables = new HashSet<int>();
                foreach (DataRow dr in ds.Tables[0].Rows)
                    tables.Add(Utility.Util.GetValueOfInt(dr[0]));
                s_lockedTables[LOCKED_TABLES_KEY] = tables;
            }
            return tables.Contains(AD_Table_ID);
        }

        /// <summary>
        /// Where clause excluding records other users locked, as a correlated NOT EXISTS
        /// </summary>
        /// <param name="keyColumnName">qualified key column of the outer query (e.g. C_Order.C_Order_ID): an unqualified
        /// name could bind to a column of AD_Private_Access inside the subquery</param>
        public static String GetLockedRecordNotExists(int AD_Table_ID, int AD_User_ID, string keyColumnName)
        {
            return " NOT EXISTS (SELECT 1 FROM AD_Private_Access pa WHERE pa.AD_Table_ID=" + AD_Table_ID
                + " AND pa.Record_ID=" + keyColumnName + " AND pa.AD_User_ID<>" + AD_User_ID + " AND pa.IsActive='Y')";
        }

        /// <summary>A lock was added, changed or removed: the set of locked tables must be read again</summary>
        protected override bool AfterSave(bool newRecord, bool success)
        {
            if (success)
                s_lockedTables.Reset();
            return success;
        }

        protected override bool AfterDelete(bool success)
        {
            if (success)
                s_lockedTables.Reset();
            return success;
        }

        /// <summary>
        /// Load Pricate Access
        /// </summary>
        /// <param name="ctx"></param>
        /// <param name="AD_User_ID"></param>
        /// <param name="AD_Table_ID"></param>
        /// <param name="Record_ID"></param>
        /// <returns>access or null if not found</returns>
        public static MPrivateAccess Get(Ctx ctx, int AD_User_ID, int AD_Table_ID, int Record_ID)
        {
            MPrivateAccess retValue = null;
            String sql = "SELECT * FROM AD_Private_Access WHERE AD_User_ID=" + AD_User_ID + " AND AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID;
            IDataReader idr = null;
            try
            {
                idr = DB.ExecuteReader(sql);
                if (idr.Read())
                {
                    retValue = new MPrivateAccess(ctx, idr, null);
                }
                idr.Close();
            }
            catch (Exception e)
            {
                _log.Log(Level.SEVERE, "MPrivateAccess", e);
                if (idr != null)
                {
                    idr.Close();
                    idr = null;
                }
            }

            return retValue;
        }

        /**
         * 	Get Where Clause of Locked Records for Table
         *	@param AD_Table_ID table
         *	@param AD_User_ID user requesting info
         *	@return "<>1" or " NOT IN (1,2)" or null
         */
        public static String GetLockedRecordWhere(int AD_Table_ID, int AD_User_ID)
        {
            //[ 1644094 ] MPrivateAccess.getLockedRecordWhere inefficient
            /*
            ArrayList<Integer> list = new ArrayList<Integer>();
            PreparedStatement pstmt = null;
            String sql = "SELECT Record_ID FROM AD_Private_Access WHERE AD_Table_ID=? AND AD_User_ID<>? AND IsActive='Y'";
            try
            {
                pstmt = DB.prepareStatement(sql, null);
                pstmt.setInt(1, AD_Table_ID);
                pstmt.setInt(2, AD_User_ID);
                ResultSet rs = pstmt.executeQuery();
                while (rs.next())
                    list.add(new Integer(rs.getInt(1))); 
                rs.close();
                pstmt.close();
                pstmt = null;
            }
            catch (Exception e)
            {
                s_log.log(Level.SEVERE, sql, e);
            }
            try
            {
                if (pstmt != null)
                    pstmt.close();
                pstmt = null;
            }
            catch (Exception e)
            {
                pstmt = null;
            }
            //
            if (list.size() == 0)
                return null;
            if (list.size() == 1)
                return "<>" + list.get(0);
            //
            StringBuffer sb = new StringBuffer(" NOT IN(");
            for (int i = 0; i < list.size(); i++)
            {
                if (i > 0)
                    sb.append(",");
                sb.append(list.get(i));
            }
            sb.append(")");
            return sb.toString();*/
            String whereClause = " NOT IN ( SELECT Record_ID FROM AD_Private_Access WHERE AD_Table_ID = "
                + AD_Table_ID + " AND AD_User_ID <> " + AD_User_ID + " AND IsActive = 'Y' )";
            return whereClause;
        }

        /**
         * 	Persistency Constructor
         *	@param ctx context
         *	@param ignored ignored
         *	@param trxName transaction
         */
        public MPrivateAccess(Ctx ctx, int ignored, Trx trxName)
            : base(ctx, 0, trxName)
        {
            if (ignored != 0)
            {
                throw new ArgumentException("Multi-Key");
            }
        }

        /**
         * 	Load Constructor
         *	@param ctx context
         *	@param rs result set
         *	@param trxName transaction
         */
        public MPrivateAccess(Ctx ctx, IDataReader idr, Trx trxName)
            : base(ctx, idr, trxName)
        {

        }

        /**
         * 	Load Constructor
         *	@param ctx context
         *	@param rs result set
         *	@param trxName transaction
         */
        public MPrivateAccess(Ctx ctx, DataRow dr, Trx trxName)
            : base(ctx, dr, trxName)
        {

        }

        /**
         * 	New Constructor
         *	@param ctx context
         *	@param AD_User_ID user
         *	@param AD_Table_ID table
         *	@param Record_ID record
         */
        public MPrivateAccess(Ctx ctx, int AD_User_ID, int AD_Table_ID, int Record_ID)
            : base(ctx, 0, null)
        {
            SetAD_User_ID(AD_User_ID);
            SetAD_Table_ID(AD_Table_ID);
            SetRecord_ID(Record_ID);
        }

    }	

}
