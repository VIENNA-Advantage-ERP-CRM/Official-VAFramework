﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VAdvantage.Controller
{
    public class ActionParams
    {
        public bool? IsHideHeaderPanel { get; set; }//1 w
        public bool? IsHideTabPanel { get; set; } //2 w
        public bool? IsHideTabLinks { get; set; } // 3 w
        public bool? IsHideActionbar { get; set; }//4 w
        public bool? IsHideToolbar { get; set; }//5 w
        public bool? IsHideGridToggle { get; set; } //6 T
        public bool? IsHideCardToggle { get; set; }//7 T
        public bool? IsHideSingleToggle { get; set; }//8 T 
        public bool? IsHideMapToggle { get; set; }//9 T
        public bool? IsHideRecordNav { get; set; }//10 T
        public bool? IsTabInNewMode { get; set; }//11 T 
        public bool? IsReadOnly { get; set; } //12 T
        public bool? IsDeleteDisabled { get; set; }//13 T
        public int? AD_Card_ID { get; set; }//14 T
        public string TabWhereClause { get; set; }//15 T
    }
}
