﻿/********************************************************
 * Project Name   : VAdvantage
 * Class Name     : SequenceCheck
 * Purpose        : System + Document Sequence Check
 * Class Used     : ProcessEngine.SvrProcess
 * Chronological    Development
 * Deepak           05-Feb-2010
  ******************************************************/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using VAdvantage.Process;
using VAdvantage.Classes;
using VAdvantage.Model;
using VAdvantage.DataBase;
using VAdvantage.SqlExec;
using System.Data;
using System.Data.SqlClient;
using VAdvantage.Logging;
using VAdvantage.Utility;

using VAdvantage.ProcessEngine;
using VAModelAD.Model;

namespace VAdvantage.Process
{
    public class SequenceCheck : ProcessEngine.SvrProcess
    {
        /**	Static Logger	*/
        private static VLogger _log = VLogger.GetVLogger(typeof(SequenceCheck).FullName);//.class);

        /// <summary>
        ///  Prepare - e.g., get Parameters.
        /// </summary>
        protected override void Prepare()
        {
        }	//	prepare

        /// <summary>
        /// Perform Process.(see also MSequenve.validate)
        /// </summary>
        /// <returns>Message to be translated</returns>
        protected override String DoIt()
        {
            log.Info("");
            //
            CheckTableSequences(GetCtx(), this);
            CheckTableID(GetCtx(), this);
             CheckClientSequences(GetCtx(), this);
            CheckDBSequence(GetCtx(), this);
            return "Sequence Check";
        }	//	doIt

        /// <summary>
        ///	Validate Sequences
        /// </summary>
        /// <param name="ctx">context</param>
        public static void Validate(Ctx ctx)
        {
            try
            {
                SequenceCheck chk = new SequenceCheck();
                chk.CheckTableSequences(ctx, null);
                chk.CheckTableID(ctx, null);
                chk.CheckClientSequences(ctx, null);
                chk.CheckDBSequence(ctx, null);
            }
            catch (Exception e)
            {
                _log.Log(Level.SEVERE, "validate", e);
            }
        }   //	validate

        /// <summary>
        /// Update value in DB Sequence if Native sequence is ON
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="sp">parent</param>
        internal  void CheckDBSequence(Ctx ctx, SvrProcess sp)
        {
            if (MSysConfig.IsNativeSequence(false))
            {
                Trx trx = null;
                //First commit the transaction to get latest data if Db sequence is on
                if (sp != null)
                {
                    trx = sp.Get_Trx();
                    trx.Commit();
                }

                String sql = "SELECT * FROM AD_Sequence "
                       + "WHERE IsTableID='Y' "
                       + "ORDER BY Name";
                DataSet ds = null;
                
                Trx trxName = null;
                
                try
                {
                    ds = DataBase.DB.ExecuteDataset(sql, null, null);
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        //Get Max value from Table_ID or AD_Sequence and update.
                        //copare and update DB Sequence
                        string tblName = ds.Tables[0].Rows[i]["Name"].ToString();
                        UpdateDBSequence(tblName,ctx,trxName,sp);
                        
                    }
                }
                catch (Exception ex)
                {
                    _log.Log(Level.SEVERE, sql, ex);
                }
            }
        }

        /// <summary>
        /// Update DB sequence
        /// </summary>
        /// <param name="tblName">table name</param>
        /// <param name="ctx">context</param>
        /// <param name="trxName">trx object</param>
        /// <param name="sp">parent class</param>
        private  void UpdateDBSequence(string tblName,Ctx ctx,Trx trxName,SvrProcess sp)
        {
            //var seqID =
            //VConnection.Get().GetDatabase().GetNextID(tblName + "_SEQ");
            int seqID = 0;

            //get id from Db sequence
            seqID = DB.GetNextID(ctx, tblName, null) - 1; //11

            if (seqID > 0) // positive
            {
                int increment = -1;
                //Select maxium id
                String sql0 = "SELECT MAX(" + tblName + "_ID) FROM " + tblName;

                int maxTableID = DataBase.DB.GetSQLValue(null, sql0);//10
                if (maxTableID > 0)
                {
                     int diff = maxTableID - seqID ;//10
                    if (diff > 0) // incement in seq only one way
                    {
                        increment = diff + increment;
                        seqID = maxTableID; //assign max
                    }
                }
                //update db seq
                if (increment != 0)
                {
                    if (DB.IsOracle())
                    {
                        DB.ExecuteQuery("ALTER SEQUENCE " + tblName + "_SEQ INCREMENT BY " + increment, null, null);
                        DB.GetNextID(ctx, tblName, trxName);//10
                        if (DB.ExecuteQuery("ALTER SEQUENCE " + tblName + "_SEQ INCREMENT BY 1", null, null) > -1)
                        {
                            if (increment != -1)
                            {
                                sp.AddLog(0, null, null, "Sequence Updated For :" + tblName + "_SEQ");
                            }
                        }
                        else
                        {
                            sp.AddLog(0, null, null, "Sequence not Updated For :" + tblName + "_SEQ");
                        }
                    }
                    else if (DB.IsPostgreSQL())
                    {
                        if (DB.ExecuteQuery("SELECT setval('" + tblName + "_seq'," + seqID + ", true)", null, null) > -1)
                        {
                            if (increment != -1)
                            {
                                sp.AddLog(0, null, null, "Sequence Updated For :" + tblName + "_SEQ");
                            }
                        }
                        else
                        {
                            sp.AddLog(0, null, null, "Sequence not Updated For :" + tblName + "_SEQ");
                        }
                    }
                }
            }
        }




        /// <summary>
        /// Check existence of Table Sequences.
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="sp">server process or null</param>
        private  void CheckTableSequences(Ctx ctx, SvrProcess sp)
        {
            Trx trxName = null;
            if (sp != null)
            {
                trxName = sp.Get_Trx();
            }
            String sql = "SELECT TableName "
                + "FROM AD_Table t "
                + "WHERE IsActive='Y' AND IsView='N'"
                + " AND NOT EXISTS (SELECT * FROM AD_Sequence s "
                + "WHERE UPPER(s.Name)=UPPER(t.TableName) AND s.IsTableID='Y')";
            IDataReader idr = null;
            try
            {
                //pstmt = DataBase.prepareStatement(sql, trxName);
                idr = DataBase.DB.ExecuteReader(sql, null, trxName);
                while (idr.Read())
                {
                    String tableName = Utility.Util.GetValueOfString(idr[0]);// rs.getString(1);
                    if (MSequence.CreateTableSequence(ctx, tableName, trxName))
                    {
                        if (sp != null)
                        {
                            sp.AddLog(0, null, null, tableName);
                        }
                        else
                        {
                            _log.Fine(tableName);
                        }
                    }
                    else
                    {
                        idr.Close();
                        throw new Exception("Error creating Table Sequence for " + tableName);
                    }
                }
                idr.Close();
            }
            catch (Exception e)
            {
                if (idr != null)
                {
                    idr.Close();
                }
                _log.Log(Level.SEVERE, sql, e);
            }

            //	Sync Table Name case
            //jz replace s with AD_Sequence
            sql = "UPDATE AD_Sequence "
                + "SET Name = (SELECT TableName FROM AD_Table t "
                    + "WHERE t.IsView='N' AND UPPER(AD_Sequence.Name)=UPPER(t.TableName)) "
                + "WHERE AD_Sequence.IsTableID='Y'"
                + " AND EXISTS (SELECT * FROM AD_Table t "
                    + "WHERE t.IsActive='Y' AND t.IsView='N'"
                    + " AND UPPER(AD_Sequence.Name)=UPPER(t.TableName) AND AD_Sequence.Name<>t.TableName)";
            int no = DataBase.DB.ExecuteQuery(sql, null, trxName);// DataBase.executeUpdate(sql, trxName);
            if (no > 0)
            {
                if (sp != null)
                {
                    sp.AddLog(0, null, null, "SyncName #" + no);
                }
                else
                {
                    _log.Fine("Sync #" + no);
                }
            }
            if (no >= 0)
            {
                return;
            }
            /** Find Duplicates 		 */
            sql = "SELECT TableName, s.Name "
                + "FROM AD_Table t, AD_Sequence s "
                + "WHERE t.IsActive='Y' AND t.IsView='N'"
                + " AND UPPER(s.Name)=UPPER(t.TableName) AND s.Name<>t.TableName";
            //
            try
            {
                //pstmt = DataBase.prepareStatement (sql, null);
                idr = DataBase.DB.ExecuteReader(sql, null, trxName);
                while (idr.Read())
                {
                    String TableName = Utility.Util.GetValueOfString(idr[0]);// rs.getString(1);
                    String SeqName = Utility.Util.GetValueOfString(idr[1]);
                    sp.AddLog(0, null, null, "ERROR: TableName=" + TableName + " - Sequence=" + SeqName);
                }
                idr.Close();
            }
            catch (Exception e)
            {
                if (idr != null)
                {
                    idr.Close();
                }
                _log.Log(Level.SEVERE, sql, e);
            }
        }	//	checkTableSequences


        /// <summary>
        /// Check Table Sequence ID values
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="sp">server process or null</param>
        private  void CheckTableID(Ctx ctx, SvrProcess sp)
        {
            if (MSysConfig.IsNativeSequence(false))
            {
                String sql = "SELECT * FROM AD_Sequence "
                       + "WHERE IsTableID='Y' "
                       + "ORDER BY Name";
                DataSet ds = null;
                int counter = 0;
                Trx trxName = null;
                if (sp != null)
                {
                    trxName = sp.Get_Trx();
                }
                try
                {
                    ds = DataBase.DB.ExecuteDataset(sql, null, trxName);
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        
                        //Get Max value from Table_ID or AD_Sequence and update.
                        sql = @"Update AD_Sequence set updatedby=" + ctx.GetAD_User_ID() + ", updated=getdate(), CurrentNext=(SELECT max(maximum) FROM ( SELECT max(" + ds.Tables[0].Rows[i]["Name"].ToString() + @"_ID)+1 as maximum from " + ds.Tables[0].Rows[i]["Name"].ToString() +
                         @" Union
                         SELECT currentnext AS maximum FROM AD_Sequence WHERE Name = '" + ds.Tables[0].Rows[i]["Name"].ToString() + "') ";
                        if (DB.IsPostgreSQL())
                            sql += " foo ";

                        sql += ") WHERE Name = '" + ds.Tables[0].Rows[i]["Name"].ToString() + "'";

                        int curVal = DB.ExecuteQuery( sql,null, trxName);

                        if (curVal>0)
                        {
                            sp.AddLog(0, null, null, "Sequence Updated For :" + ds.Tables[0].Rows[i]["Name"].ToString());

                            counter++;
                        }
                        else
                        {
                            _log.Severe("Sequence Not Updated For :" + ds.Tables[0].Rows[i]["Name"].ToString());
                        }
                    }
                }
                catch (Exception ex)
                {
                    _log.Log(Level.SEVERE, sql, ex);
                }
            }
            else
            {
                int IDRangeEnd = DataBase.DB.GetSQLValue(null,
                    "SELECT IDRangeEnd FROM AD_System");
                if (IDRangeEnd <= 0)

                {
                    IDRangeEnd = DataBase.DB.GetSQLValue(null,
                        "SELECT MIN(IDRangeStart)-1 FROM AD_Replication");
                }
                _log.Info("IDRangeEnd = " + IDRangeEnd);
                //
                String sql = "SELECT * FROM AD_Sequence "
                    + "WHERE IsTableID='Y' "
                    + "ORDER BY Name";
                int counter = 0;
                //IDataReader idr = null;
                DataSet ds = null;
                Trx trxName = null;
                if (sp != null)
                {
                    trxName = sp.Get_Trx();
                }
                try
                {

                    //pstmt = DataBase.prepareStatement(sql, trxName);
                    //idr = DataBase.DB.ExecuteReader(sql, null, trxName);
                    ds = DataBase.DB.ExecuteDataset(sql, null, trxName);

                    //while (idr.Read())
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        MSequence seq = new MSequence(ctx, ds.Tables[0].Rows[i], trxName);
                        int old = seq.GetCurrentNext();
                        int oldSys = seq.GetCurrentNextSys();
                        if (seq.ValidateTableIDValue())
                        {
                            if (seq.GetCurrentNext() != old)
                            {
                                String msg = seq.GetName() + " ID  "
                                    + old + " -> " + seq.GetCurrentNext();
                                if (sp != null)
                                {
                                    sp.AddLog(0, null, null, msg);
                                }
                                else
                                {
                                    _log.Fine(msg);
                                }
                            }
                            if (seq.GetCurrentNextSys() != oldSys)
                            {
                                String msg = seq.GetName() + " Sys "
                                    + oldSys + " -> " + seq.GetCurrentNextSys();
                                if (sp != null)
                                {
                                    sp.AddLog(0, null, null, msg);
                                }
                                else
                                {
                                    _log.Fine(msg);
                                }
                            }
                            if (seq.Save())
                            {
                                counter++;
                            }
                            else
                            {
                                _log.Severe("Not updated: " + seq);
                            }
                        }
                        //	else if (CLogMgt.isLevel(6)) 
                        //		log.fine("OK - " + tableName);
                    }
                    // idr.Close();
                }
                catch (Exception e)
                {
                    //if (idr != null)
                    //{
                    //    idr.Close();
                    //}
                    _log.Log(Level.SEVERE, sql, e);
                }

                _log.Fine("#" + counter);
            }
        }	//	checkTableID


        /// <summary>
        /// Check/Initialize DocumentNo/Value Sequences for all Clients 	
        /// </summary>
        /// <param name="ctx">context</param>
        /// <param name="sp">server process or null</param>
        private  void CheckClientSequences(Ctx ctx, SvrProcess sp)
        {
            Trx trxName = null;
            if (sp != null)
            {
                trxName = sp.Get_Trx();
            }
            //	Sequence for DocumentNo/Value
            MClient[] clients = MClient.GetAll(ctx);
            for (int i = 0; i < clients.Length; i++)
            {
                MClient client = clients[i];
                if (!client.IsActive())
                {
                    continue;
                }
                MSequence.CheckClientSequences(ctx, client.GetAD_Client_ID(), trxName);
               
            }	//	for all clients

        }	//	checkClientSequences

    }	//	SequenceCheck

}
