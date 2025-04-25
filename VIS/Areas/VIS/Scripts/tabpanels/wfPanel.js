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
        var _ad_table_id = 0;
        var _record_id = 0;
        var _ad_window_id = 0;
        var _arrowEle = null;
        var _wfCompPageID = 0;
        var _activeWFSec = null;
        var _seqactiveWFSec = null;
        var _activeStatusWFSec = null;
        var _inactiveWFSec = null;
        var _historyWFSec = null;
        var _activeWFBadge = null;
        var _inactiveWFBadge = null;
        var _historyWFBadge = null;
        var _ulList = null;
        var _liActive = null;
        var _liHistory = null;
        var _liInActive = null;
        var _btnClose = null;
        var _tabContentArea = null;
        var _iconWFConfig = null;


        /**
         * init function to initialize design
         */
        this.init = function () {
            bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            $root.append(bsyDiv);
            setBusy(true);
            _iconWFConfig = '<svg id="workflow-diagram" xmlns = "http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">'
                + '<path fill="rgb(var(--v-c-primary), 1)" id="Path_3665" data-name="Path 3665" d="M26.071,22.272V17.205H19.683l-3.747-3.747v-2.65a4.434,4.434,0,1,0-1.267,0v2.627l-3.77,3.77H4.534v5.067H2v6.334H8.334V22.272H5.8v-3.8h5.014l4.475,4.476,4.477-4.476H24.8v3.8H22.27v6.334H28.6V22.272Zm-19,5.067h-3.8v-3.8h3.8Zm5.068-20.9A3.167,3.167,0,1,1,15.3,9.6a3.167,3.167,0,0,1-3.167-3.167Zm3.148,14.737-3.294-3.294,3.167-3.167h.253l3.167,3.167ZM27.338,27.34h-3.8v-3.8h3.8Z" transform = "translate(0.264 0.262)" />'
                + '<path id="Path_3666" data-name="Path 3666" d="M0,0H30V30H0Z" fill="none" />'
                + '</svg >';
            _ad_table_id = this.curTab.getAD_Table_ID();
            _ad_window_id = this.curTab.getAD_Window_ID();

            _arrowEle = $('<div class="vis-wfm-arrowEle"><i class="fa fa-long-arrow-down"></i></div>');

            //// No records section
            //wfNoRecDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">' + VIS.Msg.getMsg('NoRecords') + '</div>');
            //$root.append(wfNoRecDiv);

            //// Activity status section
            //wfActStatusDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfActStatus p-3" style="display:none; height: 100% !important; text-align: right;"></div>');
            //$root.append(wfActStatusDiv);

            //// Selection workflow section
            //wfSelectionDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSelction p-3" style="display:none;"></div>');
            //$root.append(wfSelectionDiv);

            //// Sequence workflow section
            //wfSequenceDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSequence p-3" style="display:none;"></div>');
            //$root.append(wfSequenceDiv);

            //// Bottom buttons section
            //bottomDiv = $('<div class="vis-wfm-bottomCont" style="display:none;">'
            //    + '<div class="vis-tp-btnWrap float-right" style="margin-right: 10px; display: flex;">'
            //    + '<a class="next btn" style="display: none;">' + VIS.Msg.getMsg('VIS_Next') + '<i class="fa fa-chevron-right" aria-hidden="true"></i></a>'
            //    + '<a href="#" class="vis-wfm-btnNext btn">' + VIS.Msg.getMsg('VIS_Next') + '</a>'
            //    + '<a href="#" class="vis-wfm-btnBack btn" style="display:none;">' + VIS.Msg.getMsg('Back') + '</a>'
            //    + '<a href="#" data-wfprocessid="0" class="vis-wfm-btnShowHistory btn" style="display:none; margin-right: 10px;">' + VIS.Msg.getMsg('ShowHistory') + '</a>'
            //    + '<a href="#" data-wfprocessid="0" class="vis-wfm-btnAbort btn" style="display:none;">' + VIS.Msg.getMsg('Abort') + '</a>'
            //    + '<a href="#" class="vis-wfm-btnAttExe btn" style="display:none; margin-left: 10px;">' + VIS.Msg.getMsg('VIS_AttachExecute') + '</a>'
            //    + '</div>'
            //    + '</div>');
            //$root.append(bottomDiv);
            //_btnNext = bottomDiv.find(".vis-wfm-btnNext");
            //_btnBack = bottomDiv.find(".vis-wfm-btnBack");
            //_btnExecute = bottomDiv.find(".vis-wfm-btnAttExe");
            //_btnAbort = bottomDiv.find(".vis-wfm-btnAbort");
            //_btnHistory = bottomDiv.find(".vis-wfm-btnShowHistory");

            //// enable drag drop event on sequence workflows section section
            //wfSequenceDiv.sortable({
            //    items: ".draggable-div",
            //    cursor: "move",
            //    placeholder: "ui-state-highlight",
            //    opacity: 0.8,
            //    update: function (event, ui) {
            //        // reset arrows for sequence in sequence div
            //        wfSequenceDiv.find(".vis-wfm-arrowEle").remove();
            //        for (var i = 0; i < wfSequenceDiv.find(".vis-wfm-wfSingleCard").length; i++) {
            //            if (i != (wfSequenceDiv.find(".vis-wfm-wfSingleCard").length - 1)) {
            //                _arrowEle.clone().insertAfter($(wfSequenceDiv.find(".vis-wfm-wfSingleCard")[i]));
            //            }
            //        }
            //        //// Optional: Code to run after rearrangement (e.g., save order)
            //        //console.log("New order:", $(this).sortable("toArray"));
            //    }
            //});

            //// call bind events function
            //bindEvents();
            ////getWFDetails(true);


            var divele = $('<div class="vis-wfm-workflows-flyout" style="right: 0; top: 0; width:calc(100% - 10px); padding-bottom: 0rem; height: calc(100% - 0px);">'
                + '<div class= "vis-wfm-flyout-header" style="display:none;">'
                + '<h1>' + VIS.Msg.getMsg('Workflows') + '</h1> <a href=""><span class="vis vis-cross"></span></a>'
                + '</div >'
                + '<!-- Flyout Body -->'
                + '<div class="vis-wfm-flyout-body">'
                + '<!-- Workflow Tabs -->'
                + '<div class="vis-wfm-workflows-tabs">'
                + '<div class="vis-wfm-tablink-col">'
                + '<ul class="nav nav-tabs vis-wfm-tabList" id="myTab" role="tablist">'
                + '<li class="nav-item vis-wfm-liTabActive">'
                + '<a class="nav-link active show" id="active-tab" data-toggle="tab" href="#active" role="tab" aria-controls="active" aria-selected="true"><i class="fa fa-check-circle" aria-hidden="true"></i><span class="vis-wfm-tabName"> ' + VIS.Msg.getMsg('VIS_ActiveWorkflows') + ' </span><span class="vis-wfm-badge vis-wfm-activeBadge">0</span> </a>'
                + '</li>'
                + '<li class="nav-item vis-wfm-liTabInActive" style="display:none;">'
                + '<a class="nav-link" id="inactive-tab" data-toggle="tab" href="#inactive" role="tab" aria-controls="in-active" aria-selected="false"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="vis-wfm-tabName"> ' + VIS.Msg.getMsg('VIS_InActiveWorkflows') + ' </span><span class="vis-wfm-badge vis-wfm-inactiveBadge">0</span></a>'
                + '</li>'
                + '<li class="nav-item vis-wfm-liTabHistory">'
                + '<a class="nav-link" id="history-tab" data-toggle="tab" href="#history" role="tab" aria-controls="history" aria-selected="false"><i class="fa fa-history" aria-hidden="true"></i><span class="vis-wfm-tabName"> ' + VIS.Msg.getMsg('VIS_WorkflowHistory') + ' </span><span class="vis-wfm-badge vis-wfm-historyBadge">0</span></a>'
                + '</li>'
                + '</ul>'
                + '<div class="vis-wfm-tab-action-link" style="display: none;">'
                + '<a href="#" title="' + VIS.Msg.getMsg('VIS_ClosePanel') + '" class="vis-wfm-ClosePnl"><span class="vis vis-cross"></span></a>'
                //+ '<a href="#"><i class="fa fa-trash-o" aria-hidden="true"></i> ' + VIS.Msg.getMsg('Delete') + '</a>'
                //+ '<a href="#"><i class="fa fa-plus-circle" aria-hidden="true"></i> ' + VIS.Msg.getMsg('AddWorkflow') + '</a>'
                + '</div>'
                + '</div>'
                + '<!-- Tab Content -->'
                + '<div class="tab-content vis-wfm-tabContentArea" style="height: calc(100vh - 350px); overflow: auto;" id="myTabContent">'
                + '<!-- New Workflow Section -->'
                + '<div class="tab-pane fade active show" id="active" role="tabpanel" aria-labelledby="home-tab" style="width: calc(100% - 15px);">'
                + '<div class="vis-wfm-workflowNewActive vis-wfm-workflow-list vis-wfm-activeWFSection">'

                + '</div>'
                + '<div class="vis-wfm-workflow-list vis-wfm-seqActiveWFSection" style="display:none">'

                + '</div>'
                + '<div class="vis-wfm-workflow-list vis-wfm-activeStatusWFSection" style="display:none">'

                + '</div>'
                + '<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">' + VIS.Msg.getMsg('NoRecords') + '</div>'
                + '</div>'
                + '<!-- End New Workflow Section -->'

                + '<!-- InActive Section -->'
                + '<div class="tab-pane fade" id="inactive" role="tabpanel" aria-labelledby="home-tab">'
                + '<div class="vis-wfm-workflow-list vis-wfm-inactiveWFSection">'

                + '</div>'
                + '</div>'
                + '<!-- End InActive Section -->'

                + '<!-- History Section -->'
                + '<div class="tab-pane fade" id="history" role="tabpanel" aria-labelledby="home-tab">'
                + '<div class="vis-wfm-workflow-list vis-wfm-historyWFSection">'

                + '</div>'
                + '</div>'
                + '<!-- End History Section -->'
                + '</div>'
                + '<!-- End Tab Content -->'
                + '</div>'
                + '<!-- End Workflow Tabs -->'
                + '</div>'
                + '<!-- End Flyout Body -->'

                + '<div class="vis-wfm-bottomCont" style="display: block;">'
                + '<div class="vis-tp-btnWrap float-right" style="margin-right: 10px; display: flex;">'
                + '<a class="vis-wfm-btnNext btn">' + VIS.Msg.getMsg('VIS_Next') + '<i class="fa fa-chevron-right" style="margin-left: 10px;" aria-hidden="true"></i></a>'
                + '<a class="vis-wfm-btnBack btn" style="display:none; margin-right: 10px;"><i class="fa fa-chevron-left" style="margin-right: 10px;" aria-hidden="true"></i>' + VIS.Msg.getMsg('Back') + '</a>'
                + '<a class="vis-wfm-btnAttExe btn" style="display:none;">' + VIS.Msg.getMsg('VIS_AttachExecute') + '<i class="fa fa-play-circle-o" style="margin-left: 10px;" aria-hidden="true"></i></a>'
                + '<a class="vis-wfm-btnAbort btn" style="display:none;">' + VIS.Msg.getMsg('Abort') + '<i class="fa fa-stop-circle-o" style="margin-left: 10px;" aria-hidden="true"></i></a>'
                //+ '<a href="#" title="' + VIS.Msg.getMsg('VIS_Next') + '" class="fa fa-arrow-circle-right vis-wfm-btnNext btn" style="display: block;"></a>'
                //+ '<a href="#" title="' + VIS.Msg.getMsg('Back') + '" class="fa fa-arrow-circle-left vis-wfm-btnBack btn" style="display: none; margin-right: 10px;"></a>'
                //+ '<a href="#" title="' + VIS.Msg.getMsg('VIS_AttachExecute') + '" class="fa fa-play-circle-o vis-wfm-btnAttExe btn" style="display: none;"></a>'
                //+ '<a href="#" title="' + VIS.Msg.getMsg('Abort') + '" class="fa fa-stop-circle-o vis-wfm-btnAbort btn" style="display: none;"></a>'
                + '</div>'
                + '</div>'
                + '</div>');
            $root.append(divele);

            _activeWFSec = divele.find(".vis-wfm-activeWFSection");
            _seqactiveWFSec = divele.find(".vis-wfm-seqActiveWFSection");
            _activeStatusWFSec = divele.find(".vis-wfm-activeStatusWFSection");
            _inactiveWFSec = divele.find(".vis-wfm-inactiveWFSection");
            _historyWFSec = divele.find(".vis-wfm-historyWFSection");
            _ulList = divele.find(".vis-wfm-tabList");
            _liActive = divele.find(".vis-wfm-liTabActive");
            _liInActive = divele.find(".vis-wfm-liTabInActive");
            _liHistory = divele.find(".vis-wfm-liTabHistory");
            _btnClose = divele.find(".vis-wfm-ClosePnl");

            _btnNext = divele.find(".vis-wfm-btnNext");
            _btnBack = divele.find(".vis-wfm-btnBack");
            _btnExecute = divele.find(".vis-wfm-btnAttExe");
            _btnAbort = divele.find(".vis-wfm-btnAbort");
            bottomDiv = divele.find(".vis-wfm-bottomCont");
            wfNoRecDiv = divele.find(".vis-wfm-wfNoRec");

            _activeWFBadge = divele.find(".vis-wfm-activeBadge");
            _inactiveWFBadge = divele.find(".vis-wfm-inactiveBadge");
            _historyWFBadge = divele.find(".vis-wfm-historyBadge");
            _tabContentArea = divele.find(".vis-wfm-tabContentArea");

            bindEvents();
            setBusy(false);
        };

        /**
         * ajax call to get workflow details against record and table id and then pass response 
         * to another funtion to load design of workflow panel
         */
        function getWFDetails() {
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/WFManual/GetWorkflows",
                data: {
                    AD_Table_ID: _ad_table_id,
                    Record_ID: _record_id,
                    AD_Window_ID: _ad_window_id
                },
                success: function (data) {
                    var resData = JSON.parse(data);
                    wfDetailResponse(resData);
                },
                error: function (e) {
                    setBusy(false);
                }
            });
        };

        /**
         * function to load design for workflow panel based on the response received from 
         * controller function
         * @param {object} resData - fetched from ajax call for workflow
         */
        function wfDetailResponse(resData) {
            // if workflow composer module is installed then get page id of workflow composer page
            if (_wfCompPageID <= 0) {
                _wfCompPageID = resData.composerID;
            }

            if (resData) {
                if (resData.wfDetails)
                    _activeWFBadge.text(resData.wfDetails.length);
                if (resData.wfActInfo && resData.wfActInfo.actInfo)
                    _historyWFBadge.text(resData.wfActInfo.actInfo.length);
            }

            _activeWFSec.empty();
            _activeStatusWFSec.empty();
            _historyWFSec.empty();
            if (resData.processing) {
                createHistoryPanel(resData.wfActInfo.actInfo, resData.wfAppInfo, resData.wfActInfo.wfActInf, resData.manualWF);
                showPanel("A");
                _btnAbort.show();
                setBusy(false);
            }
            else {
                if (resData.wfDetails && resData.wfDetails.length > 0) {
                    for (var i = 0; i < resData.wfDetails.length; i++) {
                        _activeWFSec.append('<div class="vis-wfm-workflow-item vis-wfm-workflowSelDiv" data-selection="n" data-workflowid="' + resData.wfDetails[i].AD_Workflow_ID + '" style="padding: 6px 0;">'
                            + '<div class="vis-wfm-drag-items" style="display: none;"><span class="vis vis-drag-circle"></span></div>'
                            + '<div class="vis-wfm-workflow-item-left vis-wfm-activeWFList">'
                            + '<input class="vis-wfm-activeChkSelection" type="checkbox" style="margin: 10px; padding: 10px;">'
                            + '<div class="vis-wfm-workflow-icon check" style="display: none;">'
                            + '<i class="fa fa-check"></i>'
                            + '</div>'
                            + '<div class="vis-wfm-workflow-details">'
                            + '<h5>' + resData.wfDetails[i].Name + '</h5>'
                            + '<p>' + resData.wfDetails[i].Description + '</p>'
                            + '</div>'
                            + '</div>'
                            + '<div class="vis-wfm-workflow-item-right">'
                            + '<div class="vis-wfm-workflow-step" style="visibility: hidden;">'
                            + '<div class="vis-wfm-step-icon">'
                            + '<i class="fa fa-history" aria-hidden="true"></i>'
                            + '</div>'
                            + '<div class="vis-wfm-step-box">'
                            + '<h6>Scheduled Email</h6>'
                            + '<p>On 27-Jan-2025 8:03 am</p>'
                            + '</div>'
                            + '</div>'
                            + '<div class="vis-wfm-toggle-switch" style="display:none;">'
                            + '<input type="checkbox" id="toggle1" checked="">'
                            + '<span class="vis-wfm-toggle-slider"></span>'
                            + '</div>'
                            + '<div title="' + VIS.Msg.getMsg('VIS_ViewDetail') + '" class="vis-wfm-menu-dots" >'
                            //+ '<a href="#" class="vis-wfm-btnViewDetail" style="margin-left: 10px;">' + VIS.Msg.getMsg('VIS_ViewDetail') + '</a>'
                            //+ '<i class="vis-wfm-wfConfigImg" aria-hidden="true"></i>'
                            + _iconWFConfig
                            + '</div>'
                            + '</div>'
                            + '</div>');
                    }
                    createHistoryPanel(resData.wfActInfo.actInfo, resData.wfAppInfo, resData.wfActInfo.wfActInf, resData.manualWF);
                    showPanel("S");
                }
                else {
                    showPanel("N");
                }
            }
            if ($root.find(".vis-wfm-menu-dots").length > 0) {
                $root.find(".vis-wfm-menu-dots").off("click");
                $root.find(".vis-wfm-menu-dots").on("click", onViewDetailClick);
            }
            setBusy(false);
            return;
        };

        /**
         * function to create workflow activity history for the nodes executed and 
         * display approval request if any for the login user
         * @param {object} wfActInfo - workflow activity details returned in response
         * @param {object} wfAppInfo - workflow approval details returned in response based on which design will be created
         */
        function createHistoryPanel(wfActInfo, wfAppInfo, activeActInfo, manualWF) {
            _activeStatusWFSec.empty();
            _historyWFSec.empty();

            var approvalContainer = $('<div class="vis-wfm-ApprovalCont"></div>');
            // display approval requests for the login user here
            if (1 == 2 && wfAppInfo) {
                _activeStatusWFSec.append(approvalContainer);
                var detailCtrl = {};
                detailCtrl.Index = 0;
                lstDetailCtrls = [];
                var wfActivityID = wfAppInfo.LstInfo[0].AD_WF_Activity_ID;
                var _ad_wf_node_ID = wfAppInfo.LstInfo[0].AD_Node_ID;
                info = wfActInfo[0];
                var ulA = $("<ul class='vis-w-IIColumnContent vis-home-wf-ul'>");

                var liAInput = $("<li>");
                ulA.append(liAInput);
                var divAInpt = $('<div class="vis-w-home-wf-answerWrap">');
                liAInput.append(divAInpt);

                var divAP = $('<div class="input-group vis-w-home-wf-answerInput vis-w-input-widgetswrap">');
                divAInpt.append(divAP);
                // divAP.append($("<label style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Answer')));
                //Get Answer Control

                if (info.NodeAction == 'C') {
                    var ctrl = getControl(info, wfActivityID);
                    detailCtrl.AnswerCtrl = ctrl;
                    if (ctrl != null) {
                        if (ctrl.getBtnCount() > 0) {
                            var divFwd = $("<div class='vis-wforwardwrap vis-control-wrap vis-input-wrap mb-0'>");
                            divFwd.append(ctrl.getControl());
                            var divFwdBtn = $("<div class='input-group-append'>");
                            divFwdBtn.append(ctrl.getBtn(0));
                            divFwd.append($("<label style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Answer')));
                            divAP.append(divFwd).append(divFwdBtn);

                        }
                        else {
                            divAP.append(ctrl.getControl());
                        }
                        detailCtrl.AnswerCtrl = ctrl;
                    }
                    detailCtrl.Action = 'C';
                }
                else if (info.NodeAction == 'W') {
                    var ansBtn = $('<button class="VIS_Pref_pass-btn vis-btnCls" data-id="' + 0 + '" data-window="' + info.AD_Window_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                    detailCtrl.AnswerCtrl = ansBtn;
                    divAP.append(ansBtn);
                    ansBtn.on('click', function () {
                        ansBtnClick($(this).data("id"), $(this).data("window"), $(this).data("col"));
                    });
                    detailCtrl.Action = 'W';
                }
                else if (info.NodeAction == 'X') {
                    var ansBtn = $('<button class="VIS_Pref_pass-btn vis-xBtnCls" data-id="' + 0 + '" data-form="' + info.AD_Form_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                    detailCtrl.AnswerCtrl = ansBtn;
                    divAP.append(ansBtn);
                    ansBtn.on('click', function () {
                        VIS.viewManager.startForm($(this).data("form"));
                    });
                    detailCtrl.Action = 'X';
                }

                var aOkA = $("<a href='javascript:void(0)'  style='display:none' id='vis-home-wf-ansOK' class='vis-btn vis-btn-done vis-w-icon-doneButton vis-w-workflowActivityIcons' data-clicked='N' data-id='" + 0 + "'>");
                //aOk.css("data-id",index);
                aOkA.append($("<span class='vis vis-markx'>"));
                // aOkA.append($("<span class='vis-btn-ico vis-btn-done-bg vis-btn-done-border'>"));
                //aOkA.append(VIS.Msg.getMsg('Done'));
                divAInpt.append($('<div class="vis-w-home-wf-answerBtn">').append(aOkA));

                function okClick(aOk) {
                    if (aOk.data('clicked') == 'Y') {
                        return;
                    }
                    aOk.data('clicked', 'Y');
                    // Digital signature work - Apply default sign at default location with selected status
                    if (window.VA055 && window.VADMS && info.ColName == 'VADMS_SignStatus') {

                        var signData = {
                            documentNo: docnameval[docnameval.length - 1],
                            defaultReasonKey: $('[name="VADMS_SignStatus"]').children("option:selected").val(),
                            defaultReason: $('[name="VADMS_SignStatus"]').children("option:selected").text(),
                        };

                        if (signData.defaultReasonKey == undefined || signData.defaultReasonKey == '' || signData.defaultReason == undefined || signData.defaultReason == '') {
                            aOk.data('clicked', 'N');
                            VIS.ADialog.info('VA055_ChooseStatus');
                            return;
                        }

                        setBusy(true);
                        $.post(VIS.Application.contextUrl + 'VADMS/Document/SignatureUsingWorkflow', signData, function (res) {
                            if (res && res != 'null' && res.result == 'success') {
                                //adjust_size();
                                lstDetailCtrls = [];
                                selectedItems = [];
                                setBusy(false);
                            }
                            else {
                                aOk.data('clicked', 'N');
                                setBusy(false);
                                VIS.ADialog.error(res.result);
                            }

                        }, 'json').fail(function (jqXHR, exception) {
                            setBusy(false);
                            aOk.data('clicked', 'N');
                            setBusy(false);
                            VIS.ADialog.error(exception);
                        });
                    }
                    else {
                        var id = $(aOk).data("id");
                        approveIt(id, aOk);
                    }
                };
                //Given Approve
                var approveIt = function (index, aOK) {
                    var aOK = aOK;
                    setBusy(true);
                    for (var item in lstDetailCtrls) {
                        try {
                            if (index === parseInt(lstDetailCtrls[item].Index)) {
                                var fwdTo = lstDetailCtrls[item].FwdCtrl.getValue();
                                var msg = VIS.Utility.encodeText(lstDetailCtrls[item].MsgCtrl.val());
                                var answer = null;
                                if (lstDetailCtrls[item].Action == 'C') {
                                    var answer = lstDetailCtrls[item].AnswerCtrl.getValue();
                                }

                                // set window ID of activity
                                windowID = _ad_window_id;
                                setBusy(true);
                                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "WFActivity/ApproveIt",
                                    { "activityID": wfActivityID, "nodeID": _ad_wf_node_ID, "txtMsg": msg, "fwd": fwdTo, "answer": answer, "AD_Window_ID": _ad_window_id }, function apprvoIt(info) {
                                        if (info.result == '') {
                                            aOK.data('clicked', 'N');
                                            //adjust_size();
                                            lstDetailCtrls = [];
                                            selectedItems = [];
                                            getWFDetails(false);
                                        }
                                        else {
                                            VIS.ADialog.error(info.result);
                                            aOK.data('clicked', 'N');
                                            setBusy(false);
                                        }
                                    });
                                break;
                            }
                        }
                        catch (e) {
                            setBusy(false);
                            VIS.ADialog.error("FillMandatory", true, "");
                            aOK.data('clicked', 'N');
                        }

                    }
                    aOK.data('clicked', 'N');
                };

                var liFInput = $("<li>");
                ulA.append(liFInput);
                var divFInpt = $('<div class="vis-w-home-wf-forwardWrap">');
                liFInput.append(divFInpt);

                var divF = $('<div class="input-group mt-0 vis-w-home-wf-forwardInput vis-w-input-widgetswrap">');
                divFInpt.append(divF);

                var divF1 = $('<div class="d-flex">');
                //divFInpt.append(divF1);
                liFInput.append(divF1);

                //Get User Lookup
                var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.Search, "AD_User_ID", 0, false, null);
                var txtb = new VIS.Controls.VTextBoxButton("AD_User_ID", false, false, true, VIS.DisplayType.Search, lookup);
                detailCtrl.FwdCtrl = txtb;
                txtb.getBtn();

                if (txtb.getBtnCount() == 2) {
                    var divFwd = $("<div class='vis-wforwardwrap vis-control-wrap vis-input-wrap mb-0'>");
                    divFwd.append(txtb.getControl());

                    var divFwdBtn = $("<div class='input-group-append'>");
                    divFwdBtn.append(txtb.getBtn(0));
                    divFwdBtn.append(txtb.getBtn(1));

                    divFwd.append($("<label style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Forward')));
                    divF.append(divFwd).append(divFwdBtn);

                };

                var divM = $('<div class="input-group mt-0 vis-w-home-wf-forwardInput vis-w-input-widgetswrap">');
                divF1.append(divM);

                var aOkF = $("<a href='javascript:void(0)' style='display:none' id='vis-home-wf-forOK' class='vis-btn vis-btn-done vis-w-icon-doneButton vis-w-workflowActivityIcons' data-clicked='N' data-id='" + 0 + "'>");
                aOkF.append($("<span class='vis vis-markx'>"));

                //aOkF.append(VIS.Msg.getMsg('Done'));

                divFInpt.append($('<div class="vis-w-home-wf-forwardBtn">').append(aOkF));

                approvalContainer.append(ulA);
                approvalContainer.append($("<div class='clearfix'>"));

                //divWorkflowActivity.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
                approvalContainer.append($("<div class='clearfix'>"));

                var divMsg = $("<div class='vis-control-wrap'>");
                divMsg.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
                var msg = $("<textarea class='vis-w-workflow-textarea' placeholder='" + VIS.Msg.getMsg('TypeMessage') + "....'>");
                detailCtrl.MsgCtrl = msg;
                divMsg.append(msg);
                divMsg.append($("<div class='clearfix' style='margin-bottom: 3px;'>"));

                divM.append(divMsg);

                aOkF.on(VIS.Events.onTouchStartOrClick, function () { okClick(aOkF) });
                aOkA.on(VIS.Events.onTouchStartOrClick, function () { okClick(aOkA) });

                detailCtrl.FwdCtrl.fireValueChanged = function () {
                    if (detailCtrl.FwdCtrl.getValue() > 0) {
                        detailCtrl.AnswerCtrl.getControl().prop('disabled', true);
                        detailCtrl.AnswerCtrl.getBtn(0).prop('disabled', true);
                        aOkF.css('display', '');
                        aOkA.css('display', 'none');
                    }
                    else {
                        detailCtrl.AnswerCtrl.getControl().prop('disabled', '');
                        detailCtrl.AnswerCtrl.getBtn(0).prop('disabled', '');
                        aOkF.css('display', 'none');
                        aOkA.css('display', 'none');
                    }
                };
                if (info.NodeAction == 'X' || info.NodeAction == 'W' || info.NodeAction == 'C') {
                    detailCtrl.AnswerCtrl.fireValueChanged = function () {
                        if (detailCtrl.AnswerCtrl.getValue() == '' || detailCtrl.AnswerCtrl.getValue() == null) {
                            detailCtrl.FwdCtrl.getControl().prop('disabled', '');
                            detailCtrl.FwdCtrl.getBtn(0).prop('disabled', '');
                            detailCtrl.FwdCtrl.getBtn(1).prop('disabled', '');
                            aOkF.css('display', 'none');
                            aOkA.css('display', 'none');
                        }
                        else {
                            detailCtrl.FwdCtrl.getControl().prop('disabled', true);
                            detailCtrl.FwdCtrl.getBtn(0).prop('disabled', true);
                            detailCtrl.FwdCtrl.getBtn(1).prop('disabled', true);
                            aOkF.css('display', 'none');
                            aOkA.css('display', '');
                        }
                    };
                }

                lstDetailCtrls.push(detailCtrl);
            }

            if (activeActInfo) {
                _btnAbort.attr("data-wfprocessid", activeActInfo.AD_WF_Process_ID);
                _btnAbort.show();
            }

            // display activity history for the nodes executed in past
            if (wfActInfo && wfActInfo.length > 0) {
                var clsWFStatus = 'check';
                var iconClass = 'fa fa-check'
                var inExecution = false;
                var statusText = 'vis-wfm-status-completed';
                var statusTextMsg = VIS.Msg.getMsg("Completed");
                var firstNodeOnly = '';
                var clsActionIcon = 'fa fa-history';
                var clsHistoryClass = '';
                var currWFProcessID = 0;
                var title = VIS.Msg.getMsg("ShowHistory");
                for (var a = 0; a < manualWF.length; a++) {
                    var currWFID = manualWF[a].AD_Workflow_ID;
                    clsHistoryClass = '';
                    firstNodeOnly = '';
                    clsWFStatus = 'check';
                    clsActionIcon = 'fa fa-history';
                    currWFProcessID = 0;
                    title = VIS.Msg.getMsg("ShowHistory");
                    for (var i = 0; i < wfActInfo.length; i++) {
                        if (currWFID != wfActInfo[i].AD_Workflow_ID) {
                            if (inExecution) {
                                clsWFStatus = 'waiting';
                                iconClass = 'fa fa-hourglass-start';
                                statusText = 'vis-wfm-status-inQueue';
                                statusTextMsg = VIS.Msg.getMsg("InQueue");
                            }
                            break;
                        }
                        var nodeDet = wfActInfo[i].Node;
                        for (node in nodeDet) {
                            if (nodeDet[node].History != null) {
                                if (nodeDet[node].History[0].State == 'OS') {
                                    clsWFStatus = 'running';
                                    iconClass = 'vis-wfm-runningStatus';
                                    statusText = 'vis-wfm-status-running';
                                    statusTextMsg = VIS.Msg.getMsg("Running");
                                    inExecution = true;
                                    break;
                                }
                            }
                        }
                        break;
                    }

                    if (clsWFStatus === 'check')
                        clsHistoryClass = 'vis-wfm-showHistoryTimer';

                    var stepBoxHtml = null;
                    var triggerTime = null;
                    var sendNowBtn = "";
                    var isWaitingTime = false;
                    var waitTime = '';

                    if (clsWFStatus === 'waiting') {
                        firstNodeOnly = 'style="visibility:hidden;"';
                        clsActionIcon = 'fa fa-hourglass';
                        title = VIS.Msg.getMsg("InQueue");
                        stepBoxHtml = '<h6>' + VIS.Msg.getMsg('InQueue') + '</h6><p></p>';
                        triggerTime = '<p>' + manualWF[a].Description + '</p>';

                    } else {
                        for (var h = 0; h < wfActInfo.length; h++) {
                            var nodes = wfActInfo[h].Node || [];
                            // var activityId = nodes[0].ADWFActivityID;
                            if (clsWFStatus === 'running' && new Date(nodes[0].EndWaitTimeN) > new Date()) {
                                isWaitingTime = true;
                                waitTime = new Date(nodes[0].EndWaitTimeN).toLocaleString();
                                sendNowBtn = '<button class="vis-wfm-custom-btn vis-wfm-custom-btn-filled vis-wfm-btn-disabled" data-activityid="' + nodes[0].ADWFActivityID + '">' + VIS.Msg.getMsg("VIS_ExecuteNow") + '</button>';
                            }

                            if (currWFID == wfActInfo[h].AD_Workflow_ID) {
                                var allZ = nodes.every(n => n.Action === 'Z');

                                if (nodes.length > 0) {
                                    currWFProcessID = nodes[0].AD_WF_Process_ID;
                                }

                                if (nodes.length == 1) {
                                    firstNodeOnly = 'style="visibility:hidden;"';
                                }
                                if (clsWFStatus === 'running' && nodes.length > 0)
                                    clsHistoryClass = 'vis-wfm-showHistoryTimer';

                                if (nodes.length === 0) {
                                    stepBoxHtml = '';
                                    NodeN = '';
                                    NodeLU = '';
                                }
                                //else if (allZ) {
                                //    NodeN = nodes[0].Name;
                                //    NodeLU = new Date(nodes[0].LastUpdated).toLocaleString();
                                //    stepBoxHtml = '<h6>' + NodeN + '</h6><p>On ' + NodeLU + '</p>';
                                //}
                                else {
                                    // vis0008 Changes done to show last node only
                                    //var nonZNode = nodes.find(n => n.Action !== 'Z');
                                    var nonZNode = nodes[0];
                                    if (nonZNode) {
                                        NodeN = nonZNode.Name;
                                        NodeLU = new Date(nonZNode.LastUpdated).toLocaleString();
                                        stepBoxHtml = '<h6>' + NodeN + '</h6><p>On ' + NodeLU + '</p>';
                                    }
                                }
                                break;
                            }
                        }
                        if (isWaitingTime)
                            triggerTime = '<p>' + VIS.Msg.getMsg('VIS_NextExecuteOn') + " " + waitTime + '</p>'
                        else
                            triggerTime = '<p>' + VIS.Msg.getMsg('VIS_LastTrigger') + " " + NodeLU + '</p>';
                    }

                    _activeStatusWFSec.append('<div data-wfprocessid="' + currWFProcessID + '" style="cursor: default;" class="vis-wfm-workflow-item vis-wfm-workflowSelDiv" data-selection="n" data-workflowid="' + manualWF[a].AD_Workflow_ID + '">'
                        + '<div class="vis-wfm-drag-items" style="display: none;"><span class="vis vis-drag-circle"></span></div>'
                        + '<div class="vis-wfm-workflow-item-left">'
                        + '<div class="vis-wfm-workflow-left-items">'
                        + '<div class="vis-wfm-workflow-icon ' + clsWFStatus + '">'
                        + '<i class="' + iconClass + '"></i>'
                        + '</div>'
                        + '<div class="vis-wfm-workflow-details">'
                        + '<h5>' + manualWF[a].Name + '</h5>'
                        + '</div>'
                        + '</div>'
                        + '<div class="vis-wfm-workflow-sub-items">'
                        + '<div class="vis-wfm-status-msg ' + statusText + '">' + statusTextMsg + '</div>'
                        + triggerTime
                        + '</div>'
                        + '</div>'
                        + '<div class="vis-wfm-workflow-item-right">'
                        + '<div class="vis-wfm-workflow-step">'
                        + '<div title="' + title + '" class="vis-wfm-step-icon ' + clsHistoryClass + '" ' + ((clsWFStatus === 'waiting') ? '' : firstNodeOnly) + '><i class="' + clsActionIcon + '" aria-hidden="true"></i></div>'
                        + '<div class="vis-wfm-step-col" ' + firstNodeOnly + '>'
                        + '<div class="vis-wfm-step-dot"></div><div class="vis-wfm-step-line"></div>'
                        + '</div>'
                        + '<div class="vis-wfm-step-box">' +
                        stepBoxHtml +
                        '</div>'
                        + sendNowBtn
                        + '</div>'
                        + '<div class="vis-wfm-toggle-switch" style="display:none;">'
                        + '<input type="checkbox" id="toggle1" checked="">'
                        + '<span class="vis-wfm-toggle-slider"></span>'
                        + '</div>'
                        + '<div title="' + VIS.Msg.getMsg('VIS_ViewDetail') + '" class="vis-wfm-menu-dots">'
                        //+ '<a href="#" class="vis-wfm-btnViewDetail" style="margin-left: 10px;">' + VIS.Msg.getMsg('VIS_ViewDetail') + '</a>'
                        //+ '<i class="vis-wfm-wfConfigImg" aria-hidden="true"></i>'
                        + _iconWFConfig
                        + '</div>'
                        + '</div>'
                        + '</div>');
                }

                var isInApproval = false;
                var clsHistoryView = "";
                for (var i = 0; i < wfActInfo.length; i++) {
                    clsHistoryView = "";
                    var nodeDet = wfActInfo[i].Node;
                    var divHistory = $("<div data-wfprocessid='" + nodeDet[0].AD_WF_Process_ID + "' id='History_ID_" + i + "' class='vis-history-wrap vis-wfm-wfHisCont item-flex-start" + clsHistoryView + "' style='display: flex;'></div>");
                    if (isInApproval) {
                        clsHistoryView = "vis-wfm-historyRec";
                        //divHistory = $("<div id='History_ID_" + i + "' class='vis-history-wrap vis-wfm-wfHisCont " + clsHistoryView + "' style='display: none;'></div>");
                    }
                    if (i == 0 && wfAppInfo) {
                        approvalContainer.append(divHistory);
                        divHistory.css("margin-bottom", "0px");
                    }
                    else
                        //  _activeStatusWFSec.append(divHistory);
                        _historyWFSec.append(divHistory);
                    var itemHeader = $('<div class="vis-wfm-workflow-item-header">');
                    itemHeader.append('<div class="vis-wfm-workflow-icon check"><i class="fa fa-check"></i></div>');
                    itemHeader.append(
                        '<div class="vis-wfm-wfName" style="color: #333;">' +
                        '<h5>' + wfActInfo[i].WFName + '</h5>' +
                        '<p>' + new Date(nodeDet[0].LastUpdated).toLocaleString() + '</p>' +
                        '</div>'
                    );
                    divHistory.append(itemHeader);

                    var divHistoryNode = $("<div class='vis-wfm-timeline'>");

                    for (node in nodeDet) {
                        if (nodeDet[node].History != null) {
                            if (!isInApproval && nodeDet[node].History[0].State == 'OS') {
                                isInApproval = true;
                            }
                            var nodename = nodeDet[node].Name;

                            let state = nodeDet[node].History[0].State;
                            let displayText = '';

                            switch (state) {
                                case 'BK':
                                    displayText = VIS.Msg.getMsg('Background');
                                    break;
                                case 'CA':
                                    displayText = VIS.Msg.getMsg('Aborted');
                                    break;
                                case 'CT':
                                    displayText = VIS.Msg.getMsg('Terminated');
                                    break;
                                case 'ON':
                                    displayText = VIS.Msg.getMsg('NotStarted');
                                    break;
                                case 'OR':
                                    displayText = VIS.Msg.getMsg('Background');
                                    break;
                                case 'OS':
                                    displayText = VIS.Msg.getMsg('Suspended');
                                    break;
                                case 'CC':
                                    displayText = VIS.Msg.getMsg('CompletedBy');
                                    break;
                                default:
                                    displayText = state;
                            }

                            let userBlock = (state === 'CC')
                                ? `<p>${displayText}</p><p>${nodeDet[node].History[0].ApprovedBy}</p>`
                                : `<p></p><p>${displayText}</p>`;


                            var divNode = $(`
                                            <div class="vis-wfm-timeline-line" style="margin-left: 35px;"></div>        
                                          <!-- End Step -->
                                           <div class="vis-wfm-timeline-item">
                                          <div class="vis-wfm-timeline-box">
                                         <h6>${nodename}</h6>
                                             <p>On ${new Date(nodeDet[node].LastUpdated).toLocaleString()}</p>
                                          </div>
                                       <div class="vis-wfm-timeline-marker" style="margin-left: 35px;">
                                       <i class="fa fa-check"></i>
                                           </div>
                                     <div class="vis-wfm-timeline-user" style="text-align: center;">
                                         ${userBlock}
                                      </div>
                                   </div>
                                `);
                            divHistoryNode.append(divNode);

                            divHistory.append(divHistoryNode);
                        }
                    }
                }

                _activeStatusWFSec.find(".vis-wfm-showHistoryTimer").off("click");
                _activeStatusWFSec.find(".vis-wfm-showHistoryTimer").on("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var procID = $(e.target).closest(".vis-wfm-workflow-item").attr("data-wfprocessid");
                    var mainDiv = _historyWFSec.find("[data-wfprocessid='" + procID + "']").find(".vis-wfm-timeline").clone();
                    var ch = new VIS.ChildDialog();
                    ch.setContent(mainDiv);
                    //ch.setHeight(450);
                    ch.setWidth(525);
                    ch.setTitle(VIS.Msg.getMsg("History"));
                    ch.setModal(true);
                    //Ok Button Click
                    //  ch.onOkClick =

                    //Disposing Everything on Close
                    ch.onClose = function () {
                        //if (self.onClose) self.onClose();
                        //self.dispose();
                    };
                    ch.show();
                    // events();
                    ch.hidebuttons();
                });

                return;
            }
        };

        /**
         * function to get VIS control based on the parameters passed
         * @param {object} info - object of activity info
         * @param {number} wfActivityID - workflow activity ID
         * @returns {object} - VIS control based on the display type
         */
        function getControl(info, wfActivityID) {
            var ctrl = null;

            if (info.ColID == 0) {
                return ctrl;
            }
            if (info.ColReference == VIS.DisplayType.YesNo) {
                var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.List, info.ColName, 319, false, null);
                ctrl = new VIS.Controls.VComboBox(info.ColName, false, false, true, lookup, 50);
                return ctrl;
            }
            else if (info.ColReference == VIS.DisplayType.List) {
                var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.List, info.ColName, info.ColReferenceValue, false, null);
                ctrl = new VIS.Controls.VComboBox(info.ColName, false, false, true, lookup, 50);
                return ctrl;
            }
            else if (info.ColName.toUpperCase() == "C_GENATTRIBUTESETINSTANCE_ID") {
                var vAttSetInstance = null;
                var lookupCur = new VIS.MGAttributeLookup(VIS.context, 0);
                $.ajax({
                    url: VIS.Application.contextUrl + "WFActivity/GetRelativeData",
                    async: false,
                    data: { activityID: wfActivityID },
                    dataType: "json",
                    success: function (dyndata) {
                        if (dyndata.result) {
                            vAttSetInstance = new VIS.Controls.VPAttribute('C_GenAttributeSetInstance', true, false, true, VIS.DisplayType.PAttribute, lookupCur, 0, true, false, false, false);
                            vAttSetInstance.SetC_GenAttributeSet_ID(dyndata.result.GenAttributeSetID);
                        }
                    }
                });
                return vAttSetInstance;
            }
            else if (info.ColReference == VIS.DisplayType.TableDir) {
                var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.TableDir, info.ColName, info.ColReferenceValue, false, null);
                ctrl = new VIS.Controls.VComboBox(info.ColName, false, false, true, lookup, 50);
                return ctrl;
            }
            else if (info.ColReference == VIS.DisplayType.Search) {
                var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.Search, info.ColName, info.ColReferenceValue, false, null);
                ctrl = new VIS.Controls.VTextBoxButton(info.ColName, false, false, true, VIS.DisplayType.Search, lookup);
                return ctrl;
            }
            else {
                ctrl = new VIS.Controls.VTextBox(info.ColName, false, false, true, 50, 100, null, null, false);
                return ctrl;
            }
        };

        /**
         * function to show different panels based on the parameter passed
         * @param {string} panelSec - varibale for the type of panel to be displayed
         * @param {boolean} fromNextBack - parameter whether clicked from Next or Back button
         */
        function showPanel(panelSec, fromNextBack) {
            _liActive.find(".vis-wfm-tabName").text(VIS.Msg.getMsg('VIS_ActiveWorkflows'));
            _tabContentArea.css("height", "calc(100vh - 350px)");
            _liHistory.show();
            _btnBack.hide();
            _btnNext.hide();
            _btnAbort.hide();
            _btnExecute.hide();
            _activeWFSec.hide();
            _seqactiveWFSec.hide();
            _activeStatusWFSec.hide();
            wfNoRecDiv.hide();
            bottomDiv.show();
            _activeWFBadge.text(_activeWFSec.find(".vis-wfm-workflow-item").length);
            _historyWFBadge.text(_historyWFSec.find(".vis-history-wrap").length);
            _ulList.find("li .nav-link").removeClass("active");
            _liActive.find(".nav-link").addClass("active");
            $root.find(".tab-content .tab-pane").removeClass("active").removeClass("show");
            _activeWFSec.closest(".tab-pane").addClass("active").addClass("show");
            if (panelSec == "S") {
                _btnNext.show();
                _activeWFSec.show();
            }
            else if (panelSec == "Q") {
                _liActive.find(".vis-wfm-tabName").text(VIS.Msg.getMsg('VIS_ArrangeWFSequence'));
                _activeWFBadge.text(_seqactiveWFSec.find(".vis-wfm-workflow-item").length);
                _liHistory.hide();
                _btnBack.show();
                _btnExecute.show();
                _seqactiveWFSec.show();
            }
            else if (panelSec == "A") {
                _liActive.find(".vis-wfm-tabName").text(VIS.Msg.getMsg('VIS_RunningWF'));
                _activeWFBadge.text(_activeStatusWFSec.find(".vis-wfm-workflow-item").length);
                _activeStatusWFSec.show();
            }
            else if (panelSec == "N") {
                bottomDiv.hide();
                _activeWFBadge.text(0);
                wfNoRecDiv.show();
            }
            return;
        };

        /**
         * function to set the panel as busy or not
         * @param {boolean} isBusy - true or false to specify whether to show busy indicator or hide it
         */
        function setBusy(isBusy) {
            bsyDiv.css("display", isBusy ? 'block' : 'none');
        };

        /**
         * function to bind events for the controls and UI elements
         */
        function bindEvents() {
            _btnNext.on("click", onNextClick);
            _btnBack.on("click", onBackClick);
            _btnExecute.on("click", onExecuteClick);
            _btnAbort.on("click", onAbortClick);
            _ulList.on("click", onTabClick);
            _btnClose.on("click", onCloseClick);
            $root.find(".vis-wfm-workflowNewActive").on("click", onSelectionWFClick);

            // enable drag drop event on sequence workflows section section
            _seqactiveWFSec.sortable({
                items: ".draggable-div",
                cursor: "move",
                placeholder: "ui-state-highlight",
                opacity: 0.8,
                update: function (event, ui) {
                    // reset arrows for sequence in sequence div
                    _seqactiveWFSec.find(".vis-wfm-arrowEle").remove();
                    for (var i = 0; i < _seqactiveWFSec.find(".vis-wfm-workflow-item").length; i++) {
                        if (i != (_seqactiveWFSec.find(".vis-wfm-workflow-item").length - 1)) {
                            $(_seqactiveWFSec.find(".vis-wfm-workflow-item")[i]).append(_arrowEle.clone());
                            //_arrowEle.clone().insertAfter($(_seqactiveWFSec.find(".vis-wfm-workflow-item")[i]));
                        }
                        if (i == 0) {
                            $(_seqactiveWFSec.find(".vis-wfm-workflow-item")[i]).css("margin-top", "10px");
                        }
                    }
                }
            });

            _activeStatusWFSec.off('click', '.vis-wfm-custom-btn-filled');
            _activeStatusWFSec.on('click', '.vis-wfm-custom-btn-filled', function (e) {
                setBusy(true);
                var activityId = $(this).data('activityid');
                var _btnSendNow = $(e.target);
                // AJAX call to send the workflow
                $.ajax({
                    url: VIS.Application.contextUrl + "VIS/WFManual/setNodeTime",
                    type: "POST",
                    data: {
                        activityId: activityId,
                        AD_Table_ID: _ad_table_id,
                        Record_ID: _record_id,
                        AD_Window_ID: _ad_window_id
                    },
                    success: function (response) {
                        var resData = JSON.parse(response);
                        showPanel("S");
                        wfDetailResponse(resData);
                    },
                    error: function (xhr, status, error) {
                        console.error("Error sending workflow:", error);
                        VIS.ADialog.error("", true, VIS.Msg.getMsg("VIS_ErrorUpdatingWorkflow") + ", " + error, null);
                        setBusy(false);
                    }
                });
            });
        };

        function onViewDetailClick(e) {
            e.stopPropagation();
            e.preventDefault();
            var wfrow = $(e.target).closest(".vis-wfm-workflow-item");
            if (wfrow.length > 0) {
                if (_wfCompPageID > 0) {
                    VIS.viewManager.startForm(_wfCompPageID, wfrow.attr("data-workflowid"));
                }
                else {
                    VIS.ADialog.info("VIS_WFCompNotInstalled");
                }
            }
        };

        function onSelectionWFClick(e) {
            var item = $(e.target);
            if (!item.hasClass("vis-wfm-workflowSelDiv")) {
                item = $(e.target).closest(".vis-wfm-workflowSelDiv");
            }
            if (item.length > 0) {
                if (item.attr("data-selection") == "y") {
                    //item.css("background-color", "unset");
                    item.find(".vis-wfm-activeChkSelection").prop("checked", false);
                    item.attr("data-selection", "n");
                }
                else {
                    //item.css("background-color", "rgb(207 255 222)");
                    item.find(".vis-wfm-activeChkSelection").prop("checked", true);
                    item.attr("data-selection", "y");
                }
            }
        };

        /**
         * click event handled when user clicks on selection div
         * @param {Event} e - event triggered
         */
        function onSelectionDivClick(e) {
            e.stopPropagation();
            viewDetailClick($(e.target));
        };

        /**
         * click event handled when user clicks on sequence div
         * @param {Event} e - event triggered
         */
        function onSequenceDivClick(e) {
            e.stopPropagation();
            viewDetailClick($(e.target));
        };

        /**
         * function to call workflow composer form when user clicked on View Detail button
         * @param {Element} targetElement - target element which was clicked by the user
         */
        function viewDetailClick(targetElement) {
            if (targetElement.hasClass("vis-wfm-viewDetail")) {
                if (_wfCompPageID > 0) {
                    VIS.viewManager.startForm(_wfCompPageID, targetElement.closest(".vis-wfm-wfSingleCard").attr("data-workflowid"));
                }
                else {
                    VIS.ADialog.info("VIS_WFCompNotInstalled");
                }
            }
        };

        /**
         * next button click event
         * @param {Event} e - event
         */
        function onNextClick(e) {
            var totalWF = _activeWFSec.find(".vis-wfm-workflowSelDiv");
            if (totalWF.length > 0) {
                var hasSelWF = false;
                _seqactiveWFSec.empty();
                for (var j = 0; j < totalWF.length; j++) {
                    if ($(totalWF[j]).attr("data-selection") == "y") {
                        hasSelWF = true;
                        var apndEle = $(totalWF[j]).clone();
                        if (j == 0) {
                            apndEle.css("margin-top", "10px");
                        }
                        apndEle.css("margin-bottom", "10px");
                        _seqactiveWFSec.append(apndEle);
                    }
                }
                if (hasSelWF) {
                    _seqactiveWFSec.find(".vis-wfm-workflow-item").addClass("draggable-div").css("background-color", "#f5f5f5");
                    _liActive.find(".vis-wfm-tabName").text("VIS_ArrangeWFSequence");
                    //_seqactiveWFSec.find(".vis-wfm-chkSelection").css("display", "none");
                    _seqactiveWFSec.find(".vis-wfm-drag-items").show();
                    _seqactiveWFSec.find(".vis-wfm-activeChkSelection").hide();
                    for (var i = 0; i < _seqactiveWFSec.find(".vis-wfm-workflow-item").length; i++) {
                        if (i < (_seqactiveWFSec.find(".vis-wfm-workflow-item").length - 1))
                            $(_seqactiveWFSec.find(".vis-wfm-workflow-item")[i]).append(_arrowEle.clone());
                    }
                    showPanel("Q", true);
                    _seqactiveWFSec.find(".vis-wfm-workflow-item-right").css("visibility", "hidden");
                }
                else {
                    VIS.ADialog.info("VIS_PleaseSelectWF");
                    return;
                }
            }
            return;
        };

        /**
         * back button click event
         * @param {Event} e - event
         */
        function onBackClick(e) {
            showPanel("S", true);
        };

        function onHistoryClick(e) {
            if ($root.find(".vis-wfm-historyRec").length > 0) {
                if ($($root.find(".vis-wfm-historyRec")[0]).css("display") == "none") {
                    $root.find(".vis-wfm-historyRec").show();
                    _btnHistory.text(VIS.Msg.getMsg('HideHistory'));
                }
                else {
                    $root.find(".vis-wfm-historyRec").hide();
                    _btnHistory.text(VIS.Msg.getMsg('ShowHistory'));
                }
            }
        };

        function onAbortClick(e) {
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/WFManual/AbortWorkflow",
                data: {
                    AD_Table_ID: _ad_table_id,
                    Record_ID: _record_id,
                    AD_Window_ID: _ad_window_id,
                    AD_WF_Process_ID: $(e.target).attr("data-wfprocessid")
                },
                success: function (data) {
                    var resData = JSON.parse(data);
                    showPanel("S");
                    wfDetailResponse(resData);
                },
                error: function (evt) {
                    setBusy(false);
                }
            });
        };

        /**
         * attach and execute button click event
         * @param {Event} e - event
         */
        function onExecuteClick(e) {
            // confirm dialog to make sure 
            VIS.ADialog.confirm("VIS_AreYouSure", true, "", "Confirm", function (result) {
                if (result) {
                    setBusy(true);
                    var workflowIDs = "";
                    var selectedWfs = _seqactiveWFSec.find(".vis-wfm-workflow-item");
                    for (var i = 0; i < selectedWfs.length; i++) {
                        if (workflowIDs == "")
                            workflowIDs = $(selectedWfs[i]).attr("data-workflowid");
                        else
                            workflowIDs = workflowIDs + "," + $(selectedWfs[i]).attr("data-workflowid");
                    }

                    $.ajax({
                        url: VIS.Application.contextUrl + "VIS/WFManual/SaveExecuteWF",
                        data: {
                            AD_Table_ID: _ad_table_id,
                            AD_Workflow_IDs: workflowIDs,
                            Record_ID: _record_id,
                            AD_Window_ID: _ad_window_id
                        },
                        success: function (data) {
                            var resData = JSON.parse(data);
                            wfDetailResponse(resData);
                            //showPanel("S");
                        },
                        error: function (evt) {
                            setBusy(false);
                        }
                    });
                }
            });
        };

        function onTabClick(e) {
            var currItem = $(e.target);
            if (!currItem.hasClass("nav-item"))
                currItem = currItem.closest(".nav-item");
            if (currItem.find(".nav-link").attr("aria-controls").toLower().equals('history')) {
                bottomDiv.hide();
                _tabContentArea.css("height", "calc(100vh - 300px)");
            }
            else {
                bottomDiv.show();
                _tabContentArea.css("height", "calc(100vh - 350px)");
            }
        };

        function onCloseClick(e) {
            $(e.target).closest(".vis-ad-w-p-ap-tp-o-body").find(".glyphicon-remove").trigger('click');
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
                var headWFPanel = $root.closest(".vis-ad-w-p-ap-tp-o-body").find(".vis-ad-w-p-ap-tp-o-b-head");
                headWFPanel.css("background", "unset").css("padding-bottom", "0px");
                headWFPanel.find("h6").css("font-size", "x-large").css("color", "rgba(var(--v-c-on-secondary), 1)");
                headWFPanel.find("span").css("color", "rgba(var(--v-c-on-secondary)").css("font-size", "20px").css("margin-right", "10px").css("margin-top", "5px");
                //$root.closest(".vis-ad-w-p-ap-tp-o-b-content").css("height", "100%");
                _record_id = record_ID;
                getWFDetails(false);
            }
            catch (ex) {
            }
        };

        /*
        * Dispose components and turn off events
        */
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
            if (wfSelectionDiv)
                wfSelectionDiv.off("click");
            if (wfSequenceDiv)
                wfSequenceDiv.off("click");
            if (_btnAbort)
                _btnAbort.off("click");
            //if (_btnHistory)
            //    _btnHistory.off("click");
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