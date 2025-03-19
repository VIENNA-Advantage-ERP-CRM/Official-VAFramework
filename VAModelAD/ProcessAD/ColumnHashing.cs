using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.Classes;
using VAdvantage.DataBase;
using VAdvantage.Model;
using VAdvantage.ProcessEngine;
using VAdvantage.Utility;


namespace VAdvantage.Process
{
    public class ColumnHashing : SvrProcess
    {
        /** Enable/Disable Encryption		*/
        private bool p_IsHashed = false;
        /** Change Encryption Settings		*/
        private bool p_ChangeSetting = false;
        /** Maximum Length					*/
        private int p_MaxLength = 0;
        /** Test Value						*/
        private String p_TestValue = null;
        /** The Column						*/
        private int p_AD_Column_ID = 0;

        /// <summary>
        /// Prepare - get Parameteres
        /// </summary>
        protected override void Prepare()
        {
            ProcessInfoParameter[] para = GetParameter();
            for (int i = 0; i < para.Length; i++)
            {
                String name = para[i].GetParameterName();
                if (para[i].GetParameter() == null)
                {
                    ;
                }
                else if (name.Equals("IsHashed"))
                    p_IsHashed = "Y".Equals(para[i].GetParameter());
                else if (name.Equals("ChangeSetting"))
                    p_ChangeSetting = "Y".Equals(para[i].GetParameter());
                else if (name.Equals("MaxLength"))
                    p_MaxLength = para[i].GetParameterAsInt();
                else if (name.Equals("TestValue"))
                    p_TestValue = (String)para[i].GetParameter();
                else
                    log.Log(VAdvantage.Logging.Level.SEVERE, "Unknown Parameter: " + name);
            }
            p_AD_Column_ID = GetRecord_ID();
        }	//	prepare

        protected override string DoIt()
        {
            log.Info("AD_Column_ID=" + p_AD_Column_ID
               + ", IsHashed=" + p_IsHashed
               + ", ChangeSetting=" + p_ChangeSetting
               + ", MaxLength=" + p_MaxLength);
            MColumn column = new MColumn(GetCtx(), p_AD_Column_ID, Get_Trx());
            if (column.Get_ID() == 0 || column.Get_ID() != p_AD_Column_ID)
                throw new Exception("@NotFound@ @AD_Column_ID@ - " + p_AD_Column_ID);
            //
            String columnName = column.GetColumnName();
            int dt = column.GetAD_Reference_ID();

            if (column.IsKey()
                || column.IsEncrypted()
                || column.IsParent()
                || column.IsStandardColumn()
                || column.IsVirtualColumn()
                || column.IsIdentifier()
                || column.IsTranslated()
                || DisplayType.IsLookup(dt)
                || DisplayType.IsLOB(dt)
                || "DocumentNo".Equals(column.GetColumnName(), StringComparison.OrdinalIgnoreCase)
                || "Value".Equals(column.GetColumnName(), StringComparison.OrdinalIgnoreCase)
                || "Name".Equals(column.GetColumnName(), StringComparison.OrdinalIgnoreCase))
            {
                if (column.IsHashed())
                {
                    column.SetIsHashed(false);
                    column.Save(Get_Trx());
                }
                return columnName + ": cannot be hashed";
            }


            bool error = false;

            //	Test Value
            if (p_TestValue != null && p_TestValue.Length > 0)
            {
                String hashString = SecureEngine.ComputeHash(p_TestValue);
                AddLog(0, null, null, "Hashed Test Value=" + hashString);
                
                int hashLength = hashString.Length;
                AddLog(0, null, null, "Test Length=" + p_TestValue.Length + " -> " + hashLength);
                if (hashLength <= column.GetFieldLength())
                    AddLog(0, null, null, "Hashed Length (" + hashLength
                        + ") fits into field (" + column.GetFieldLength() + ")");
                else
                {
                    AddLog(0, null, null, "Encrypted Length (" + hashLength
                        + ") does NOT fit into field (" + column.GetFieldLength() + ") - resize field");
                    error = true;
                }
            }

            //	Length Test
            if (p_MaxLength != 0)
            {
                String testClear = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                while (testClear.Length < p_MaxLength)
                    testClear += testClear;
                testClear = testClear.Substring(0, p_MaxLength);
                log.Config("Test=" + testClear + " (" + p_MaxLength + ")");
                //
                String hashString = SecureEngine.ComputeHash(testClear);
                int hashLength = hashString.Length;
                AddLog(0, null, null, "Test Max Length=" + testClear.Length + " -> " + hashLength);
                if (hashLength <= column.GetFieldLength())
                    AddLog(0, null, null, "Hashed Max Length (" + hashLength
                        + ") fits into field (" + column.GetFieldLength() + ")");
                else
                {
                    AddLog(0, null, null, "Hashed Max Length (" + hashLength
                        + ") does NOT fit into field (" + column.GetFieldLength() + ") - resize field");
                    error = true;
                }
            }

            if (p_IsHashed != column.IsHashed())
            {
                if (error || !p_ChangeSetting)
                    AddLog(0, null, null, "Hashing NOT changed - Hashing=" + column.IsHashed());
                else
                {
                    column.SetIsHashed(p_IsHashed);
                    if (column.Save(Get_Trx()))
                        AddLog(0, null, null, "Hashing CHANGED - Hashing=" + column.IsHashed());
                    else
                        AddLog(0, null, null, "Save Error");
                }
            }


            if (p_IsHashed == column.IsHashed() && !error)
            {
                MTable table = new MTable(GetCtx(), column.GetAD_Table_ID(), Get_Trx());
                string tableName = table.GetTableName();
                string[] keyColumns = table.GetKeyColumns();
                string keyCols = "";

                DataSet ds = null;
                if (table.HasPKColumn())
                {
                    ds = DB.ExecuteDataset("SELECT " + column.GetColumnName() + "," + tableName
                                                                    + "_ID FROM " + tableName, null, Get_Trx());
                }
                else
                {

                    if (keyColumns != null && keyColumns.Length > 0)
                    {
                        foreach (string col in keyColumns)
                        {
                            keyCols += " , " + col;
                        }
                    }
                    ds = DB.ExecuteDataset($"SELECT {column.GetColumnName()}{keyCols} FROM {tableName}", null, Get_Trx());
                }

                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    if (p_IsHashed)
                    {
                        for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                        {
                            if (ds.Tables[0].Rows[i][column.GetColumnName()] != null && ds.Tables[0].Rows[i][column.GetColumnName()] != DBNull.Value
                                && !SecureEngine.IsLooksLikeHash(ds.Tables[0].Rows[i][column.GetColumnName()].ToString()))
                            {

                                string hashString = SecureEngine.ComputeHash(ds.Tables[0].Rows[i][column.GetColumnName()].ToString());

                                if (hashString.Length <= column.GetFieldLength())
                                {

                                    //string p_NewPassword = SecureEngine.Encrypt(ds.Tables[0].Rows[i][column.GetColumnName()].ToString());
                                    String sql = "UPDATE " + tableName + " SET Updated=SYSDATE, UpdatedBy=" + GetAD_User_ID();
                                    if (!string.IsNullOrEmpty(hashString))
                                    {
                                        sql += ", " + column.GetColumnName() + "=" + GlobalVariable.TO_STRING(hashString);
                                    }

                                    if (table.HasPKColumn())
                                        sql += " WHERE " + tableName + "_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i][tableName + "_ID"]);
                                    else
                                    {
                                        sql += " WHERE ";
                                        keyCols = "";
                                        foreach (string col in keyColumns)
                                        {
                                            if (keyCols.Length > 1)
                                                keyCols += " AND ";
                                            keyCols += col + " = " + ds.Tables[0].Rows[i][col];
                                        }
                                        sql += keyCols;
                                    }
                                    int iRes = DB.ExecuteQuery(sql, null, Get_Trx());
                                    if (iRes <= 0)
                                    {
                                        Rollback();
                                        return "Hashed=" + false;
                                    }
                                }
                                else
                                {
                                    Rollback();
                                    return "After Encryption some values may exceed the value of column length. Please exceed column Length.";
                                }
                            }
                        }
                    }
                    else
                    {
                        for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                        {
                            if (ds.Tables[0].Rows[i][column.GetColumnName()] != null && ds.Tables[0].Rows[i][column.GetColumnName()] != DBNull.Value
                                && SecureEngine.IsLooksLikeHash(ds.Tables[0].Rows[i][column.GetColumnName()].ToString()))
                            {
                                //Hash is irreversible so we can't get the original value back

                                string plainString = "testHash"; 
                                String sql = "UPDATE " + tableName + "  SET Updated=SYSDATE, UpdatedBy=" + GetAD_User_ID();
                                if (!string.IsNullOrEmpty(plainString))
                                {
                                    sql += ", " + column.GetColumnName() + "=" + GlobalVariable.TO_STRING(plainString);
                                }
                                if (table.HasPKColumn())
                                    sql += " WHERE " + tableName + "_ID=" + Util.GetValueOfInt(ds.Tables[0].Rows[i][tableName + "_ID"]);
                                else
                                {
                                    sql += " WHERE ";
                                    keyCols = "";
                                    foreach (string col in keyColumns)
                                    {
                                        if (keyCols.Length > 1)
                                            keyCols += " AND ";
                                        keyCols += col + " = " + ds.Tables[0].Rows[i][col];
                                    }
                                    sql += keyCols;
                                }
                                int iRes = DB.ExecuteQuery(sql, null, Get_Trx());
                                if (iRes <= 0)
                                {
                                    Rollback();
                                    return "Hashed=" + false;
                                }

                            }
                        }
                    }
                }

            }

            return "Hashed= " + column.IsHashed();

        }
    }
}
