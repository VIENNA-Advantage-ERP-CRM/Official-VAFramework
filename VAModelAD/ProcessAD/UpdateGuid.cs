using CoreLibrary.DataBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Utility;

namespace VAdvantage.Process
{
    public class UpdateGuid : VAdvantage.ProcessEngine.SvrProcess
    {
        private int _batchSize = 1000; // rows per batch
        protected override void Prepare()
        {
        }

        protected override String DoIt()
        {
            StringBuilder progress = new StringBuilder();

            // 1️⃣ Get all tables that have GUID column AND still have NULL values
            string sqlTables = @"
                                SELECT table_name
                                FROM user_tables t
                                WHERE EXISTS (
                                    SELECT 1
                                    FROM user_tab_columns c
                                    WHERE c.table_name = t.table_name
                                      AND c.column_name = t.table_name || '_GUID'
                                )
                                AND UPPER(t.table_name) NOT LIKE '%LOG'
                                AND EXISTS (
                                    SELECT 1
                                    FROM " + "{0}" + @" 
                                    WHERE " + "{0}" + @"_GUID IS NULL
                                )
                                ORDER BY table_name";

            // Execute once for each table
            string getTables = @"
                                SELECT table_name
                                FROM user_tables t
                                WHERE EXISTS (
                                    SELECT 1 FROM user_tab_columns c
                                    WHERE c.table_name = t.table_name
                                      AND c.column_name = t.table_name || '_GUID'
                                )
                                AND UPPER(t.table_name) NOT LIKE '%LOG'
                                ORDER BY table_name";

            var tables = DB.ExecuteDataset(getTables, null, null);

            if (tables == null || tables.Tables[0].Rows.Count == 0)
                return "No tables found with GUID column.";

            foreach (System.Data.DataRow row in tables.Tables[0].Rows)
            {
                string tableName = row["table_name"].ToString();

                // Check if table has any NULL GUIDs
                string sqlCheckNull = $"SELECT COUNT(*) FROM {tableName} WHERE {tableName}_GUID IS NULL";
                int nullCount = Convert.ToInt32(DB.ExecuteScalar(sqlCheckNull, null, null));

                if (nullCount == 0)
                    continue; // skip table fully populated

                // Update batch of rows
                string sqlUpdate = $@"
                                    UPDATE {tableName}
                                    SET {tableName}_GUID = SYS_GUID()
                                    WHERE {tableName}_GUID IS NULL
                                    AND ROWID IN (
                                        SELECT ROWID
                                        FROM {tableName}
                                        WHERE {tableName}_GUID IS NULL
                                        AND ROWNUM <= {_batchSize}
                                    )";

                int updated = DB.ExecuteQuery(sqlUpdate, null, Get_Trx());
                Get_Trx().Commit();

                progress.AppendLine($"Table: {tableName} | Updated: {updated} | Remaining: {nullCount - updated}");
            }

            return progress.ToString();
        }
    }
}
