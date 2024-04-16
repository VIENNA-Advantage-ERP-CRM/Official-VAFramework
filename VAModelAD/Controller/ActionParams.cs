using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VAdvantage.Controller
{
    public class ActionParams
    {
        public bool IsHideHeaderPanel { get; set; }//1
        public bool IsHideTabPanel { get; set; }
        public bool IsHideToolbar { get; set; }//3
        public bool IsHideGridToggle { get; set; }
        public bool IsHideCardToggle { get; set; }//5
        public bool IsHideSingleToggle { get; set; }
        public bool IsHideMapToggle { get; set; }//7
        public bool IsHideRecordNav { get; set; }
        public bool IsTabInNewMode { get; set; }//9
        public bool IsEditable { get; set; }
        public bool IsDeletable { get; set; }//11
        public int AD_Card_ID { get; set; }
        public string TabWhereClause { get; set; }//13

    }
}
