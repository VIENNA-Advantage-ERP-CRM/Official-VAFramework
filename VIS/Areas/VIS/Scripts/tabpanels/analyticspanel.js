VIS = window.VIS || {};
(function () {

    /**
     * Record tab panel that embeds an Onfinity Analytics report for the current record.
     * AD_TabPanel.ClassName = "VIS.AnalyticsPanel"
     * AD_TabPanel.ExtraInfo = "reportId=<uuid>&DOCUMENT_NO=@DocumentNo@&AD_CLIENT_ID=@#AD_Client_ID@"
     * @Column@ tokens are resolved from the window/tab context (same rules as VIS.BiPanel);
     * the token itself is minted server-side by AnalyticsPanel/Embed.
     */
    function AnalyticsPanel() {
        this.record_ID = 0;
        this.windowNo = 0;
        this.curTab = null;
        this.selectedRow = null;
        this.panelWidth;
        this.extraInfo = null;
        var $root;
        var iFrame;

        this.init = function () {
            $root = $('<div style="height:100%;width:100%"></div>');
            iFrame = $('<iframe height="100%" width="100%" frameborder="0" allow="fullscreen"></iframe>');
            $root.html(iFrame);
        };

        this.update = function (record_ID) {
            loadReport(record_ID);
        };

        this.getRoot = function () {
            return $root;
        };
        var that = this;

        var loadReport = function (record_ID) {
            if (!iFrame)
                return;
            var extraInfo = that.extraInfo || "";
            var parm = extraInfo.match(/\@.+?\@/g);
            if (parm) {
                for (var i = 0; i < parm.length; i++) {
                    var key = parm[i].replaceAll("@", "");
                    var ctx = VIS.Env.getCtx();
                    if (ctx.getContext(key).length > 0) {
                        key = ctx.getContext(key);
                    }
                    else if (ctx.getContext(that.windowNo, key).length > 0) {
                        key = ctx.getContext(that.windowNo, key);
                    }
                    else if (that.curTab && ctx.getContext(that.windowNo, that.curTab().getTabNo(), key).length > 0) {
                        key = ctx.getContext(that.windowNo, that.curTab().getTabNo(), key);
                    }
                    extraInfo = extraInfo.replaceAll(parm[i], key);
                }
            }

            var _src = VIS.Application.contextUrl + "AnalyticsPanel/Embed?recID=" + record_ID + "&extraInfo=" + window.encodeURIComponent(extraInfo);
            iFrame.prop('src', _src);
        };

        this.disposeComponent = function () {
            if (iFrame)
                iFrame.remove();
            $root.remove();
            iFrame = null;
            $root = null;
        };

    };

    /**
     *	Invoked when user click on panel icon
     */
    AnalyticsPanel.prototype.startPanel = function (windowNo, curTab, extraInfo) {
        this.windowNo = windowNo;
        this.curTab = curTab;
        this.extraInfo = extraInfo;
        this.init();
    };

    /**
     *	This function will execute when user navigate or refresh a record
     */
    AnalyticsPanel.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID;
        this.selectedRow = selectedRow;
        this.update(recordID);
    };

    /**
     *	Fired When Size of panel Changed
     */
    AnalyticsPanel.prototype.sizeChanged = function (width) {
        this.panelWidth = width;
    };

    /**
     *	Dispose Component
     */
    AnalyticsPanel.prototype.dispose = function () {
        this.disposeComponent();
    };

    /*
    * Fully qualified class name
    */
    VIS.AnalyticsPanel = AnalyticsPanel;

})();
