using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;

namespace VAdvantage.Process
{
    public class UpdateGuid : VAdvantage.ProcessEngine.SvrProcess
    {
        private const int BatchSize = 5000; // tune 1000–10000

        protected override void Prepare()
        {
            // No parameters
        }

        protected override string DoIt()
        {
            StringBuilder sb = new StringBuilder();

            string sqlTables;
            if (DatabaseType.IsOracle)
            {
                sqlTables =
                    "SELECT t.table_name " +
                    "FROM user_tables t " +
                    "WHERE UPPER(t.table_name) NOT LIKE '%LOG' " +
                    "  AND EXISTS ( " +
                    "      SELECT 1 " +
                    "      FROM user_tab_columns c " +
                    "      WHERE c.table_name = t.table_name " +
                    "        AND c.column_name = t.table_name || '_GUID' " +
                    "  ) " +
                    "ORDER BY t.table_name";
            }
            else
            {
                sqlTables =
                    "SELECT t.table_name " +
                    "FROM information_schema.tables t " +
                    "WHERE t.table_schema = current_schema() " +
                    "  AND t.table_type = 'BASE TABLE' " +
                    "  AND lower(t.table_name) NOT LIKE '%log' " +
                    "  AND EXISTS ( " +
                    "      SELECT 1 " +
                    "      FROM information_schema.columns c " +
                    "      WHERE c.table_schema = t.table_schema " +
                    "        AND c.table_name = t.table_name " +
                    "        AND upper(c.column_name) = upper(t.table_name || '_GUID') " +
                    "  ) " +
                    "ORDER BY t.table_name";
            }

            DataSet ds = DB.ExecuteDataset(sqlTables, null, null);
            if (ds == null || ds.Tables == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
                return "No tables found with GUID column.";

            int completed = 0;
            int skipped = 0;

            for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
            {
                string tableName = Convert.ToString(ds.Tables[0].Rows[i]["table_name"]);
                string guidCol = tableName + "_GUID";

                // Count remaining NULLs
                string sqlRemaining = "SELECT COUNT(*) FROM " + tableName + " WHERE " + guidCol + " IS NULL";
                int remaining = Convert.ToInt32(DB.ExecuteScalar(sqlRemaining, null, null));

                if (remaining == 0)
                {
                    skipped++;
                    continue;
                }

                sb.AppendLine("Table: " + tableName + " | Start NULLs: " + remaining);

                long totalUpdated = 0;

                while (true)
                {
                    string updateSql;

                    if (DatabaseType.IsOracle)
                    {
                        updateSql =
                            "UPDATE " + tableName + " " +
                            "SET " + guidCol + " = SYS_GUID() " +
                            "WHERE " + guidCol + " IS NULL " +
                            "  AND ROWID IN ( " +
                            "      SELECT ROWID " +
                            "      FROM " + tableName + " " +
                            "      WHERE " + guidCol + " IS NULL " +
                            "        AND ROWNUM <= " + BatchSize +
                            "  )";
                    }
                    else
                    {
                        // PostgreSQL: requires gen_random_uuid() (pgcrypto)
                        updateSql =
                            "UPDATE " + tableName + " " +
                            "SET " + guidCol + " = gen_random_uuid() " +
                            "WHERE ctid IN ( " +
                            "    SELECT ctid " +
                            "    FROM " + tableName + " " +
                            "    WHERE " + guidCol + " IS NULL " +
                            "    LIMIT " + BatchSize +
                            ")";
                    }

                    int updated = DB.ExecuteQuery(updateSql, null, Get_Trx());
                    Get_Trx().Commit();

                    totalUpdated += updated;

                    if (updated == 0)
                        break;

                    remaining = Convert.ToInt32(DB.ExecuteScalar(sqlRemaining, null, null));
                    sb.AppendLine("   Batch updated: " + updated + " | Remaining: " + remaining);
                }

                sb.AppendLine("Table: " + tableName + " | Total Updated: " + totalUpdated);
                sb.AppendLine("--------------------------------------------------");

                completed++;
            }

            sb.AppendLine("Completed tables: " + completed + ", Skipped: " + skipped);
            if (!DatabaseType.IsOracle)
            {
                sb.AppendLine("PostgreSQL note: gen_random_uuid() must exist (pgcrypto extension).");
            }
            return sb.ToString();
        }
    }
}