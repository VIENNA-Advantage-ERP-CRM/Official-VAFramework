; (function (VIS, $) {
    function AdvanceTask() {
        /* To create new appointments and task form widows
        * @ param {number} AD_Table_ID
        * @ param {number} Record_ID        
        */
        function initTasks(WindowName, AD_Table_ID, Record_ID) {
            if (window.VA134) {
                var divaptbusy = $("<div id='divAptBusy' class='wsp-busy-indicater'></div>");
                $("body").append(divaptbusy);
                divaptbusy.show();
                VA134.VA134_AdvanceTask.init(WindowName, AD_Table_ID, Record_ID, divaptbusy);
            }
            else {
                VIS.ADialog.info("PleaseInstallAdvanceTask");
            }
        };
        return {
            init: initTasks
        };
    };
    VIS.AdvanceTask = AdvanceTask();
})(VIS, jQuery);
