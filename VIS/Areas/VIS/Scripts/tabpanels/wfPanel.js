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

        /**
         * init function to initialize design
         */
        this.init = function () {
            bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            $root.append(bsyDiv);
            setBusy(true);
            _ad_table_id = this.curTab.getAD_Table_ID();
            _ad_window_id = this.curTab.getAD_Window_ID();
            _arrowEle = $('<div class="vis-wfm-arrowEle"><i class="fa fa-long-arrow-down"></i></div>');

            // No records section
            wfNoRecDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">' + VIS.Msg.getMsg('NoRecords') + '</div>');
            $root.append(wfNoRecDiv);

            // Activity status section
            wfActStatusDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfActStatus p-3" style="display:none; height: 100% !important; text-align: right;"></div>');
            $root.append(wfActStatusDiv);

            // Selection workflow section
            wfSelectionDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSelction p-3" style="display:none;"></div>');
            $root.append(wfSelectionDiv);

            // Sequence workflow section
            wfSequenceDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfSequence p-3" style="display:none;"></div>');
            $root.append(wfSequenceDiv);

            // Bottom buttons section
            bottomDiv = $('<div class="vis-wfm-bottomCont" style="display:none;">'
                + '<div class="vis-tp-btnWrap float-right" style="margin-right: 10px; display: flex;">'
                + '<a class="next btn" style="display: none;">' + VIS.Msg.getMsg('VIS_Next') + '<i class="fa fa-chevron-right" aria-hidden="true"></i></a>'
                + '<a href="#" class="vis-wfm-btnNext btn">' + VIS.Msg.getMsg('VIS_Next') + '</a>'
                + '<a href="#" class="vis-wfm-btnBack btn" style="display:none;">' + VIS.Msg.getMsg('Back') + '</a>'
                + '<a href="#" data-wfprocessid="0" class="vis-wfm-btnShowHistory btn" style="display:none; margin-right: 10px;">' + VIS.Msg.getMsg('ShowHistory') + '</a>'
                + '<a href="#" data-wfprocessid="0" class="vis-wfm-btnAbort btn" style="display:none;">' + VIS.Msg.getMsg('Abort') + '</a>'
                + '<a href="#" class="vis-wfm-btnAttExe btn" style="display:none; margin-left: 10px;">' + VIS.Msg.getMsg('VIS_AttachExecute') + '</a>'
                + '</div>'
                + '</div>');
            $root.append(bottomDiv);
            _btnNext = bottomDiv.find(".vis-wfm-btnNext");
            _btnBack = bottomDiv.find(".vis-wfm-btnBack");
            _btnExecute = bottomDiv.find(".vis-wfm-btnAttExe");
            _btnAbort = bottomDiv.find(".vis-wfm-btnAbort");
            _btnHistory = bottomDiv.find(".vis-wfm-btnShowHistory");

            // enable drag drop event on sequence workflows section section
            wfSequenceDiv.sortable({
                items: ".draggable-div",
                cursor: "move",
                placeholder: "ui-state-highlight",
                opacity: 0.8,
                update: function (event, ui) {
                    // reset arrows for sequence in sequence div
                    wfSequenceDiv.find(".vis-wfm-arrowEle").remove();
                    for (var i = 0; i < wfSequenceDiv.find(".vis-wfm-wfSingleCard").length; i++) {
                        if (i != (wfSequenceDiv.find(".vis-wfm-wfSingleCard").length - 1)) {
                            _arrowEle.clone().insertAfter($(wfSequenceDiv.find(".vis-wfm-wfSingleCard")[i]));
                        }
                    }
                    //// Optional: Code to run after rearrangement (e.g., save order)
                    //console.log("New order:", $(this).sortable("toArray"));
                }
            });

            // call bind events function
            bindEvents();
            //getWFDetails(true);
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
            // clear workflow selection div
            wfSelectionDiv.empty();
            // check if workflow is in processing (e.g. in approval) then display workflow history tree
            if (resData.processing) {
                showPanel("A");
                createHistoryPanel(resData.wfActInfo.actInfo, resData.wfAppInfo, resData.wfActInfo.wfActInf);
                setBusy(false);
            }
            // else show linked document process type of workflows with this table
            else {
                if (resData.wfDetails && resData.wfDetails.length > 0) {
                    //if (onInit) {
                    for (var i = 0; i < resData.wfDetails.length; i++) {
                        wfSelectionDiv.append('<div data-workflowid="' + resData.wfDetails[i].AD_Workflow_ID + '" class="vis-wfm-wfSingleCard">'
                            + '<div class="vis-wfm-wf-cardTextWrap">'
                            + '<div class="d-flex justify-content-between mb-1" style="align-items: center;">'
                            + '<input class="vis-wfm-chkSelection" type="checkbox" style="height: 18px;width: 18px;">'
                            + '<div class="d-flex align-items-center vis-wfm-wf-Cardheader">'
                            + '<span class="vis-wfm-wfCardTtl vis-wfm-textOverflow-ellipsis d-block vis-wfm-wfCardTtl" title="' + resData.wfDetails[i].Name + '">' + resData.wfDetails[i].Name + '</span>'
                            + '</div>'
                            + '</div>'
                            + '<div class="vis-wfm-wfCardTtl"><div class="vis-wfm-wfCardDesc vis-wfm-textOverflow-ellipsis mb-1" style="margin-bottom: 0 !important;">'
                            + '<span class="vis-wfm-wfCardDescTtl mr-1" style="font-size: 0.800rem;">' + VIS.Msg.getMsg('SearchKeyValue') + ' : </span>'
                            + '</div>'
                            + '<span class="vis-wfm-wfCardDescValue vis-wfm-wfSearchKey" style="font-size: 0.850rem;" title="' + resData.wfDetails[i].Value + '">' + resData.wfDetails[i].Value + '</span>'
                            + '</div>'
                            + '</div>'
                            + '<div class="justify-content-between align-items-center vis-wfm-wf-cardBottom" style="text-align:right;">'
                            + '<span class="vis-wfm-viewDetail" style="text-decoration: underline; cursor: pointer;">' + VIS.Msg.getMsg('VIS_ViewDetail') + '</span>'
                            + '</div>'
                            + '</div>');
                    }
                    //}
                    //else {
                    //    var totalWF = wfSelectionDiv.find(".vis-wfm-wfSingleCard");
                    //    if (totalWF.length > 0) {
                    //        for (var i = 0; i < totalWF.length; i++) {
                    //            if ($(totalWF.find("input")[i]).prop("checked")) {
                    //                $(totalWF.find("input")[i]).prop("checked", false);
                    //            }
                    //        }
                    //    }
                    //}
                    wfSelectionDiv.find(".vis-wfm-wf-cardTextWrap").off("click");
                    wfSelectionDiv.find(".vis-wfm-wf-cardTextWrap").on("click", function (e) {
                        var chkWFSel = null;
                        e.stopPropagation();
                        if (!$(e.target).hasClass("vis-wfm-chkSelection")) {
                            if ($(e.target).hasClass(".vis-wfm-wfSingleCard")) {
                                chkWFSel = $(e.target).find(".vis-wfm-chkSelection");
                            }
                            else {
                                chkWFSel = $(e.target.closest(".vis-wfm-wfSingleCard")).find(".vis-wfm-chkSelection");
                            }
                            if (chkWFSel.prop("checked"))
                                chkWFSel.prop("checked", false);
                            else
                                chkWFSel.prop("checked", true);
                        }
                    });
                    showPanel("S");
                }
                else {
                    showPanel("N");
                }
                setBusy(false);
            }
        };

        /**
         * function to create workflow activity history for the nodes executed and 
         * display approval request if any for the login user
         * @param {object} wfActInfo - workflow activity details returned in response
         * @param {object} wfAppInfo - workflow approval details returned in response based on which design will be created
         */
        function createHistoryPanel(wfActInfo, wfAppInfo, activeActInfo) {
            wfActStatusDiv.empty();

            var approvalContainer = $('<div class="vis-wfm-ApprovalCont"></div>');
            // display approval requests for the login user here
            if (wfAppInfo) {
                wfActStatusDiv.append(approvalContainer);
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

            // display activity history for the nodes executed in past
            if (wfActInfo.length > 0) {

                if (activeActInfo) {
                    _btnAbort.attr("data-wfprocessid", activeActInfo.AD_WF_Process_ID);
                    _btnAbort.show();
                    _btnHistory.show();
                }
                //wfActStatusDiv.append('<button data-wfprocessid="' + activeActInfo.AD_WF_Process_ID + '" class="VIS_AbortBtn" style="height: 35px; width: 100px; border-radius: 10px; margin: 5px;">Abort</button>');

                //wfActStatusDiv.find(".VIS_AbortBtn").on("click", function (e) {
                //    setBusy(true);
                //    $.ajax({
                //        url: VIS.Application.contextUrl + "VIS/WFManual/AbortWorkflow",
                //        data: {
                //            AD_Table_ID: _ad_table_id,
                //            Record_ID: _record_id,
                //            AD_Window_ID: _ad_window_id,
                //            AD_WF_Process_ID: $(e.target).attr("data-wfprocessid")
                //        },
                //        success: function (data) {
                //            var resData = JSON.parse(data);
                //            wfDetailResponse(resData);
                //        },
                //        error: function (evt) {
                //            setBusy(false);
                //        }
                //    });
                //});
                var isInApproval = false;
                var clsHistoryView = "";
                for (var i = 0; i < wfActInfo.length; i++) {
                    clsHistoryView = "";
                    var divHistory = $("<div id='History_ID_" + i + "' class='vis-history-wrap vis-wfm-wfHisCont " + clsHistoryView + "' style='display: block;'></div>");
                    if (isInApproval) {
                        clsHistoryView = "vis-wfm-historyRec";
                        divHistory = $("<div id='History_ID_" + i + "' class='vis-history-wrap vis-wfm-wfHisCont " + clsHistoryView + "' style='display: none;'></div>");
                    }
                    if (i == 0 && wfAppInfo) {
                        approvalContainer.append(divHistory);
                        divHistory.css("margin-bottom", "0px");
                    }
                    else
                        wfActStatusDiv.append(divHistory);

                    divHistory.append('<div class="vis-wfm-wfName">' + wfActInfo[i].WFName + '</div>');

                    var divHistoryNode = $("<div class='vis-workflow-historyCls'>");
                    var nodeDet = wfActInfo[i].Node;
                    for (node in nodeDet) {
                        if (nodeDet[node].History != null) {
                            if (!isInApproval && nodeDet[node].History[0].State == 'OS') {
                                isInApproval = true;
                            }
                            for (hNode in nodeDet[node].History) {
                                if (nodeDet[node].History[hNode].State == 'CC' && node < (nodeDet.length - 1)) {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divAppBy = $("<div class='vis-approved_wrap'>");
                                    divAppBy.append("<div class='vis-ApproveCircleCls'><i class='vis vis-markx' ></i></div>");
                                    var nodename = nodeDet[node].Name;
                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (nodeDet[node].History[hNode].TextMsg.length > 0) {
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip vis-aTagCls'>").append("<i class='vis vis-info' data-toggle='tooltip' data-placement='bottom' title='" + VIS.Utility.encodeText(nodeDet[node].History[hNode].TextMsg) + "'></i>");
                                        divLeft.append(btnDetail);
                                    }
                                    divLeft.append(nodename);
                                    divAppBy.append(divLeft);
                                    var divRight = $("<div class='vis-right-part'>");
                                    divRight.append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(nodeDet[node].History[hNode].ApprovedBy));
                                    divAppBy.append(divRight);
                                    divHistoryNode.append(divAppBy);
                                }
                                else if ((node < (nodeDet.length - 1)) || nodeDet.length == 1) {
                                    var divAppBy = $("<div class='vis-pending_wrap' >");
                                    divAppBy.append($("<div class='vis-left-part'>").append(nodeDet[node].Name));
                                    divAppBy.append($("<div class='vis-right-part'>").append(VIS.Msg.getMsg('Pending')));
                                    divHistoryNode.append(divAppBy);
                                }
                                else {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divStart = $("<div class='vis-start_wrap vis-workflow-startCls'>");
                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (nodeDet[node].History[hNode].TextMsg.length > 0) {
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip vis-aTagCls'>").append("<i class='vis vis-info' data-toggle='tooltip' data-placement='bottom' title='" + VIS.Utility.encodeText(nodeDet[node].History[hNode].TextMsg) + "'></i>");
                                        divLeft.append(btnDetail);
                                    }
                                    divLeft.append(nodeDet[node].Name);
                                    divStart.append(divLeft);
                                    var divRight = $("<div class='vis-right-part'>");
                                    divRight.append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(nodeDet[node].History[hNode].ApprovedBy));
                                    divStart.append(divRight);
                                    divHistoryNode.append(divStart);
                                }
                            }
                            divHistory.append(divHistoryNode);
                        }
                    }
                }
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
            bottomDiv.css("display", "block");
            if (fromNextBack && (panelSec == "S" || panelSec == "Q")) {
                _btnBack.css("display", "none");
                _btnNext.css("display", "none");
                _btnAbort.css("display", "none");
                _btnHistory.css("display", "none");
                _btnExecute.css("display", "none");
                if (panelSec == "S") {
                    wfSequenceDiv.fadeOut(function () {
                        _btnNext.css("display", "block");
                        wfSelectionDiv.fadeIn();
                    });
                }
                else if (panelSec == "Q") {
                    wfSelectionDiv.fadeOut(function () {
                        _btnBack.css("display", "block");
                        _btnExecute.css("display", "block");
                        wfSequenceDiv.fadeIn();
                    });
                }
            }
            else {
                wfNoRecDiv.css("display", "none");
                wfSelectionDiv.css("display", "none");
                wfSequenceDiv.css("display", "none");
                wfActStatusDiv.css("display", "none");
                _btnBack.css("display", "none");
                _btnNext.css("display", "none");
                _btnExecute.css("display", "none");
                _btnAbort.css("display", "none");
                _btnHistory.css("display", "none");
                if (panelSec == "S") {
                    wfSelectionDiv.css("display", "block");
                    _btnNext.css("display", "block");
                }
                else if (panelSec == "Q") {
                    wfSequenceDiv.css("display", "block");
                    _btnBack.css("display", "block");
                    _btnExecute.css("display", "block");
                }
                else if (panelSec == "N") {
                    bottomDiv.css("display", "none");
                    wfNoRecDiv.css("display", "block");
                }
                else if (panelSec == "A") {
                    wfActStatusDiv.css("display", "block");
                    _btnAbort.css("display", "block");
                    _btnHistory.css("display", "block");
                }
            }
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
            _btnHistory.on("click", onHistoryClick);
            wfSelectionDiv.on("click", onSelectionDivClick);
            wfSequenceDiv.on("click", onSequenceDivClick);
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
            var totalWF = wfSelectionDiv.find(".vis-wfm-wfSingleCard");
            if (totalWF.length > 0) {
                var hasSelWF = false;
                wfSequenceDiv.empty();
                for (var j = 0; j < totalWF.length; j++) {
                    if ($(totalWF.find(".vis-wfm-chkSelection")[j]).prop("checked")) {
                        hasSelWF = true;
                        if (wfSequenceDiv.find(".vis-wfm-wfSingleCard").length > 0)
                            wfSequenceDiv.append(_arrowEle.clone());
                        wfSequenceDiv.append($(totalWF[j]).clone());
                    }
                }
                // if there are any records selected from the selection div
                // then display sequence div else display message to the user
                if (hasSelWF) {
                    wfSequenceDiv.find(".vis-wfm-wfSingleCard").addClass("draggable-div").css("background-color", "#f5f5f5");
                    wfSequenceDiv.find(".vis-wfm-chkSelection").css("display", "none");
                    showPanel("Q", true);
                }
                else {
                    VIS.ADialog.info("VIS_PleaseSelectWF");
                    return;
                }
            }
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
                    var selectedWfs = wfSequenceDiv.find(".vis-wfm-wfSingleCard");
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
                        },
                        error: function (evt) {
                            setBusy(false);
                        }
                    });
                }
            });
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
            if (_btnHistory)
                _btnHistory.off("click");
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