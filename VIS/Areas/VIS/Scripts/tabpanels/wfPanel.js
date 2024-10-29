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

        this.init = function () {
            _ad_table_id = this.curTab.getAD_Table_ID();
            _ad_window_id = this.curTab.getAD_Window_ID();
            bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            $root.append(bsyDiv);
            setBusy(true);
            wfNoRecDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfNoRec p-3" style="display:none;">No Records Found !!!</div>');
            $root.append(wfNoRecDiv);
            wfActStatusDiv = $('<div class="vis-wfm-mainCont vis-wfm-wfActStatus p-3" style="display:none; height: 100% !important"></div>');
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

            //getWFDetails(true);
        };

        function getWFDetails(onInit) {
            //   if (_record_id > 0) {
            wfSelectionDiv.empty();
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/WFManual/GetWorkflows",
                data: {
                    AD_Table_ID: _ad_table_id,
                    Record_ID: _record_id,
                    AD_Window_ID: _ad_window_id
                },
                success: function (data) {
                    setBusy(false);
                    var resData = JSON.parse(data);
                    if (resData.processing) {
                        showPanel("A");
                        createHistoryPanel(resData.wfActInfo.actInfo, resData.wfAppInfo);
                        setBusy(false);
                    }
                    else {
                        if (resData.wfDetails && resData.wfDetails.length > 0) {
                            //if (onInit) {
                            for (var i = 0; i < resData.wfDetails.length; i++) {
                                wfSelectionDiv.append('<div data-workflowid="' + resData.wfDetails[i].AD_Workflow_ID + '" class="vis-wfm-wfSingleCard">'
                                    + '<div class="vis-wfm-wf-cardTextWrap">'
                                    + '<div class="d-flex justify-content-between mb-1" style="align-items: center;">'
                                    + '<input type="checkbox" style="height: 18px;width: 18px;">'
                                    + '<div class="d-flex align-items-center vis-wfm-wf-Cardheader">'
                                    // + '<i class="vis vis-info vis-wfm-popover"></i>'
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
                            showPanel("S");
                        }
                        else {
                            showPanel("N");
                        }
                        setBusy(false);
                    }
                },
                error: function (e) {
                    setBusy(false);
                }
            });
            //}
            //else {
            //    setBusy(false);
            //}
        };

        function createHistoryPanel(wfActInfo, wfAppInfo) {
            wfActStatusDiv.empty();

            var approvalContainer = $('<div class="vis-wfm-ApprovalCont"></div>');
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
                                adjust_size();
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
                                            adjust_size();
                                            lstDetailCtrls = [];
                                            selectedItems = [];
                                            setBusy(false);
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

            //var actInfo = wfActInfo.actInfo;
            if (wfActInfo.length > 0) {
                for (var i = 0; i < wfActInfo.length; i++) {
                    var divHistory = $("<div id='History_ID_'" + i + "' class='vis-history-wrap vis-wfm-wfHisCont' style='display: block;'></div>");
                    if (i == 0 && wfAppInfo) {
                        approvalContainer.append(divHistory);
                        divHistory.css("margin-bottom", "0px");
                    }
                    else
                        wfActStatusDiv.append(divHistory);
                    var divHistoryNode = $("<div class='vis-workflow-historyCls'>");
                    var nodeDet = wfActInfo[i].Node;
                    for (node in nodeDet) {
                        if (nodeDet[node].History != null) {
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

        //Create Controls based on data
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
            VIS.ADialog.confirm("AreYouSure", true, "", "Confirm", function (result) {
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
                            var resp = "";
                            setBusy(false);
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