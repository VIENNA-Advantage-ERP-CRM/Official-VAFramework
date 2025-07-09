using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VAModelAD.AIHelper
{
    public class AIHelperDataContracts
    {
        public class AIHelperDataOut
        {
            public string result { get; set; }
            public bool isError { get; set; }
            public bool stream_completed { get; set; }
        }

        public class AIHelperData
        {
            public int sessionID { get; set; }

            public int userID { get; set; }

            public string token { get; set; }

            public string endPoints { get; set; }

            public string zoneID { get; set; }

        }

        public class ThreadActionDataIn : AIHelperData
        {
            public string threadID { get; set; }
            public int table_id { get; set; }
            public string action { get; set; }
            public int record_id { get; set; }
            public string attachmentType { get; set; }
            public int attachmentTypeID { get; set; }
        }
    }
}
