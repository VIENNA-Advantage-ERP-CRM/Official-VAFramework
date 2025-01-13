using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;

namespace VIS.Models
{
    public class PendingChecklist
    {
        public object PendingCheckList()
        {
            var records = new List<PendingChecklistDetail>
                    {
                        new PendingChecklistDetail
                        {
                            WindowName = "Alert",
                            TableName = "AD_Alert",
                            WindowID = 276,
                            Count = 1,
                            Record_ID = "1000007",
                            AD_User_ID = 101,
                            TotalWindowcount = 1,
                            totalRecordCount = 3
                        },
                        new PendingChecklistDetail
                        {
                            WindowName = "SalesOrder",
                            TableName = "C_Order",
                            WindowID = 143,
                            Count = 2,
                            Record_ID = "1022910,1023453",
                            AD_User_ID = 102,
                            TotalWindowcount = 2,
                            totalRecordCount = 3
                        },
                          new PendingChecklistDetail
                        {
                            WindowName = "SalesOrder",
                            TableName = "C_Order",
                            WindowID = 143,
                            Count = 2,
                            Record_ID = "1022910,1023453",
                            AD_User_ID = 102,
                            TotalWindowcount = 2,
                            totalRecordCount = 3
                        },
                            new PendingChecklistDetail
                        {
                            WindowName = "SalesOrder",
                            TableName = "C_Order",
                            WindowID = 143,
                            Count = 2,
                            Record_ID = "1022910,1023453",
                            AD_User_ID = 102,
                            TotalWindowcount = 2,
                            totalRecordCount = 3
                        },
                              new PendingChecklistDetail
                        {
                            WindowName = "SalesOrder",
                            TableName = "C_Order",
                            WindowID = 143,
                            Count = 2,
                            Record_ID = "1022910,1023453",
                            AD_User_ID = 102,
                            TotalWindowcount = 2,
                            totalRecordCount = 3
                        }
                    };
            return records;

        }
        public class PendingChecklistDetail
        {
            public string WindowName;
            public string TableName;
            public int WindowID;
            public int Count;
            public string Record_ID;
            public int AD_User_ID;
            public int TotalWindowcount = 0;
            public int totalRecordCount;
        }
    }
}