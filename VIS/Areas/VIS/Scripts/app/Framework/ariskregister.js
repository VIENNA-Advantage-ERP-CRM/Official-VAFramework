; (function (VIS, $) {
    function ARiskRegister(invoker, AD_Table_ID, Record_ID, AD_User_ID, iBusy, container) {
        var AD_Window_ID = 0;
        var m_where = '';
        var objwindow = null;
        var tab = null;

        this.getRiskRegister = function (item) {
            if (!window.VA132) {
                VIS.ADialog.info('PleaseInstallRiskMgt');
                return;
            }

            AD_Window_ID = VIS.ZoomTarget.getZoomAD_Window_ID("VA132_RiskRegister", 0, "", true);
            m_where = "(AD_Table_ID=" + AD_Table_ID + " AND Record_ID=" + Record_ID + ")";
            var $root = $("<div style='min-width: 100px;'>");
            var ul = $('<ul class=vis-apanel-rb-ul>');
            $root.append(ul);
            var li = $("<li data-id='RiskCreate'>");
            li.append(VIS.Msg.getMsg("VA132_NewRisk"));
            li.on("click", function (e) {
                createNewRisk(e);
            });
            ul.append(li);

            li = $("<li data-id='RiskAll'>");
            li.append(VIS.Msg.getMsg("VA132_AllRisk"));
            li.on("click", function (e) {
                allRisks(e);
            });
            ul.append(li);
            container.w2overlay($root.clone(true));
        };

        var createNewRisk = function (e) {
            e.stopImmediatePropagation();
            var zoomQuery = new VIS.Query();
            zoomQuery.addRestriction("VA132_RiskRegister_ID", VIS.Query.prototype.EQUAL, 0);
            objwindow = VIS.viewManager.startWindow(AD_Window_ID, zoomQuery);
            objwindow.onLoad = function () {
                var gc = objwindow.cPanel.curGC;
                gc.onRowInserting = function () {
                    objwindow.cPanel.cmd_new(false);
                };

                gc.onRowInserted = function () {
                    tab = objwindow.cPanel.curTab;
                    tab.setValue("AD_Table_ID", AD_Table_ID);
                    tab.setValue("Record_ID", Record_ID);

                    if (AD_User_ID != null && AD_User_ID > 0) {
                        tab.setValue("AD_User_ID", AD_User_ID);
                    }
                };
            };

            var overlay = $('#w2ui-overlay');
            overlay.hide();
            overlay = null;
        };


        var allRisks = function (e) {
            e.stopImmediatePropagation();
            var zoomQuery = new VIS.Query();
            zoomQuery.addRestriction(m_where);
            VIS.viewManager.startWindow(AD_Window_ID, zoomQuery);
            var overlay = $('#w2ui-overlay');
            overlay.hide();
            overlay = null;
        };
    };
    VIS.ARiskRegister = ARiskRegister;
})(VIS, jQuery);