VIS = window.VIS || {};

(function () {

    function wfPanel() {
        this.record_ID = 0;
        this.windowNo = 0;
        this.curTab = null;
        this.selectedRow = null;
        this.panelWidth;
        var $root = $('<div class="vis-wfm-main-wrap"></div>');
        var cntnrDiv = null;
        var _btnNext = null;
        var _btnBack = null;
        var _btnExecute = null;
        var bsyDiv = null;
        var wfSelectionDiv = null;
        var wfSequenceDiv = null;
        var wfNoRecDiv = null;
        var wfActStatusDiv = null;
        var bottomDiv = null;

        this.init = function () {
            bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            $root.append(bsyDiv);
            setBusy(true);
            wfNoRecDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">No Records Found !!!</div>');
            $root.append(wfNoRecDiv);
            wfActStatusDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">No Records Found !!!</div>');
            $root.append(wfActStatusDiv);
            wfSelectionDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSelction p-3" style="display:none;"></div>');
            $root.append(wfSelectionDiv);
            wfSequenceDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSequence p-3" style="display:none;"></div>');
            $root.append(wfSequenceDiv);
            bottomDiv = $('<div class="vis-wfm-bottomCont" style="display:none;">'
                            + '<div class="vis-tp-btnWrap float-right" style="margin-right: 10px; display: flex;">'
                            + '<a class="next btn" style="display: none;">Next<i class="fa fa-chevron-right" aria-hidden="true"></i></a>'
                            + '<a href="#" class="vis-wfm-btnNext btn">Next</a>'
                            + '<a href="#" class="vis-wfm-btnBack btn" style="display:none;">Back</a>'
                            + '<a href="#" class="vis-wfm-btnAttExe btn" style="display:none; margin-left: 10px;">Attach & Execute</a>'                            
                            + '</div>'
                            + '</div>');
            $root.append(bottomDiv);
            _btnNext = bottomDiv.find(".vis-wfm-btnNext");
            _btnBack = bottomDiv.find(".vis-wfm-btnBack");
            _btnExecute = bottomDiv.find(".vis-wfm-btnAttExe");

            wfSequenceDiv.sortable({
                items: ".draggable-div",
                cursor: "move",
                placeholder: "ui-state-highlight",
                opacity: 0.8,
                update: function (event, ui) {
                    //// Optional: Code to run after rearrangement (e.g., save order)
                    //console.log("New order:", $(this).sortable("toArray"));
                }
            });

            bindEvents();
            
            //getWFDetails(this.curTab.getAD_Table_ID(), this.record_ID);
        };

        function getWFDetails(table_ID, record_ID) {
            wfSelectionDiv.empty();
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/WFManual/GetWorkflows",
                data: {
                    AD_Table_ID: table_ID,
                    Record_ID: record_ID
                },
                success: function (data) {
                    setBusy(false);
                    var resData = JSON.parse(data);
                    if (resData.processing) {
                        showPanel("A");
                        setBusy(false);
                    }
                    else {
                        if (resData.wfDetails && resData.wfDetails.length > 0) {
                            showPanel("S");
                            for (var i = 0; i < resData.wfDetails.length; i++) {
                                wfSelectionDiv.append('<div class="vis-wfm-wfSingleCard">'
                                    + '<div class="vis-wfm-wf-cardTextWrap">'
                                    + '<div class="d-flex justify-content-between mb-1" style="align-items: center;">'
                                    + '<input type="checkbox" style="height: 18px;width: 18px;">'
                                    + '<div class="d-flex align-items-center vis-wfm-wf-Cardheader">'
                                    //+ '<i class="vis vis-info vis-wfm-popover"></i>'
                                    + '<span class="vis-wfm-wfCardTtl vis-wfm-textOverflow-ellipsis d-block vis-wfm-wfCardTtl" title="' + resData.wfDetails[i].Name + '">' + resData.wfDetails[i].Name + '</span>'
                                    + '</div>'
                                    + '</div>'
                                    // + '<div class="vis-wfm-wfCardtblName vis-wfm-textOverflow-ellipsis d-block mb-1 vis-wfm_wfType vis-wfm-wfCardTtl" title="Document Process">Document Process</div>'
                                    + '<div class="vis-wfm-wfCardTtl"><div class="vis-wfm-wfCardDesc vis-wfm-textOverflow-ellipsis mb-1" style="margin-bottom: 0 !important;">'
                                    + '<span class="vis-wfm-wfCardDescTtl mr-1" style="font-size: 0.800rem;">Search Key:</span>'
                                    + '</div>'
                                    + '<span class="vis-wfm-wfCardDescValue vis-wfm-wfSearchKey" style="font-size: 0.875rem;" title="' + resData.wfDetails[i].Value + '">' + resData.wfDetails[i].Value + '</span>'
                                    //+ '<div class="vis-wfm-wfCardDesc vis-wfm-textOverflow-ellipsis mb-1">'
                                    //+ '<span class="vis-wfm-wfCardDescTtl mr-1">Table:</span>'
                                    //+ '<span class="vis-wfm-wfCardDescValue" title="C_Invoice">C_Invoice</span>'
                                    //+ '</div>'
                                    //+ '<div class="vis-wfm-wfCardDesc vis-wfm-textOverflow-ellipsis mb-1 d-none">'
                                    //+ '<span class="vis-wfm-wfCardDescTtl mr-1">Workflow Logic:</span>'
                                    //+ '<span class="vis-wfm-wfCardDescValue vis-wfm-wfLogic" title=""></span>'
                                    //+ '</div>'
                                    + '</div>'
                                    + '</div>'
                                    + '<div class="justify-content-between align-items-center vis-wfm-wf-cardBottom" style="text-align:right;">'
                                    + '<span style="text-decoration: underline; cursor: pointer;">View Detail</span>'
                                    //+ '<div class="d-flex">'
                                    //+ '<i class="vis vis-delete mr-2 ml-2 vis-wfm-wfAddEditWorkflow vis-wfm-wfDeleteWorkflow" title="Delete Workflow"></i>'
                                    //+ '<i class="vis vis-edit vis-wfm-wfAddEditWorkflow vis-wfm-wfAddEditWorkflow" title="Edit Workflow"></i>'
                                    //+ '</div>'
                                    + '</div>'
                                    + '</div>');
                            }
                        }
                        else {
                            showPanel("N");
                            setBusy(false);
                        }
                    }
                },
                error: function (e) {
                    setBusy(false);
                }
            });
        };

        function showPanel(panelSec) {
            wfNoRecDiv.css("display", "none");
            wfSelectionDiv.css("display", "none");
            wfSequenceDiv.css("display", "none");
            wfActStatusDiv.css("display", "none");
            _btnBack.css("display", "none");
            _btnNext.css("display", "none");
            _btnExecute.css("display", "none");
            bottomDiv.css("display", "none");
            if (panelSec == "S") {
                bottomDiv.css("display", "block");
                wfSelectionDiv.css("display", "block");
                _btnNext.css("display", "block");
            }
            else if (panelSec == "Q") {
                bottomDiv.css("display", "block");
                wfSequenceDiv.css("display", "block");
                _btnBack.css("display", "block");
                _btnExecute.css("display", "block");
            }
            else if (panelSec == "N") {
                wfNoRecDiv.css("display", "block");
            }
            else if (panelSec == "A") {
                wfActStatusDiv.css("display", "block");
            }
        };

        function setBusy(isBusy) {
            bsyDiv.css("display", isBusy ? 'block' : 'none');
        };

        function bindEvents() {
            _btnNext.on("click", onNextClick);
            _btnBack.on("click", onBackClick);
            _btnExecute.on("click", onExecuteClick);
        };

        function onNextClick(e) {
            var totalWF = wfSelectionDiv.find(".vis-wfm-wfSingleCard");
            if (totalWF.length > 0) {
                var hasSelWF = false;
                for (var i = 0; i < totalWF.length; i++) {
                    if ($(totalWF.find("input")[i]).prop("checked")) {
                        hasSelWF = true;
                    }
                }

                if (hasSelWF) {
                    showPanel("Q");
                    wfSequenceDiv.empty();
                    for (var j = 0; j < totalWF.length; j++) {
                        if ($(totalWF.find("input")[j]).prop("checked")) {
                            wfSequenceDiv.append($(totalWF[j]).clone());
                        }
                    }
                    wfSequenceDiv.find(".vis-wfm-wfSingleCard").addClass("draggable-div").css("background-color", "#f5f5f5");
                    wfSequenceDiv.find("input").css("display", "none");
                }
                else {
                    VIS.ADialog.info("PleaseSelectWF");
                    return;
                }
            }
        };

        function onBackClick(e) {
            showPanel("S");
        };

        function onExecuteClick(e) {

        };

        /*
       * Retrun container of panel's Design
       */
        this.getRoot = function () {
            return $root;
        };

        /*
        * Update UI elements with latest record's values.
        */
        this.update = function (record_ID) {
            // Get Value from Context
            try {
                getWFDetails(this.curTab.getAD_Table_ID(), this.record_ID);
            }
            catch (ex) {
            }
        };

        this.disposeComponent = function () {
            this.record_ID = 0;
            this.windowNo = 0;
            this.curTab = null;
            this.rowSource = null;
            this.panelWidth = null;
            if (_btnNext)
                _btnNext.off("click");
            if (_btnBack)
                _btnBack.off("click");
            if (_btnExecute)
                _btnExecute.off("click");
            $root.remove();
            $root = null;
        };
    };

    /**
     *	Invoked when user click on panel icon
     */
    wfPanel.prototype.startPanel = function (windowNo, curTab) {
        this.windowNo = windowNo;
        this.curTab = curTab;
        this.init();
    };

    /**
         *	This function will execute when user navigate  or refresh a record
         */
    wfPanel.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID;
        this.selectedRow = selectedRow;
        this.update(recordID);
    };

    /**
     *	Fired When Size of panel Changed
     */
    wfPanel.prototype.sizeChanged = function (height, width) {
        this.panelWidth = width;
    };

    /**
     *	Dispose Component
     */
    wfPanel.prototype.dispose = function () {
        this.disposeComponent();
    };

    /*
    * Fully qualified class name
    */
    VIS.wfPanel = wfPanel;
})();