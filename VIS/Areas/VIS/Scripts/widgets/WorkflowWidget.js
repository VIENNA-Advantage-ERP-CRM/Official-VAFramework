/**
 * Home Widget
 * VIS316 --- Date 19-06-2024
 * purpose - Show workflow widget on home page
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    //Form Class function fullnamespace
    VIS.WorkflowWidget = function () {
        /* Variables*/
        this.frame;
        this.windowNo;
        this.$bsyDiv;
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100%">');
        var $workflowWidget;
        var $wFSearchshow_ID;
        var $wFShowDetails_ID;
        var $fromDate_ID;
        var $toDate_ID;
        var $flipCard_ID;
        var backBtn_ID;
        var $fstMainDiv_ID;
        var $workflowWidgetDtls_ID;
        var $countDiv_ID;
        var divScroll = $('<div class="wfactivity-homepage-activites"></div>')// style="padding-right:0px"
        var data = null;
        var fulldata = [];
        var dataItemDivs = [];
        var $cmbWindows;// = null;
        var $fromDateInput_ID;
        var $toDateInput_ID;
        var windowID = 0;
        var winNideID = "0_0";
        var nodeID = 0;
        var searchText;
        var fromDate;
        var toDate;
        var $hlnkTabDataRef_ID;
        var $zoom;
        var $wfZoomCls;
        var $txtSearch = null;
        var $btnSearch = null;
        var search = true;
        var showToAndFromDate = true;
        var refresh = true;
        var pageNo = 1;
        var PageSize = 10;
        var scrollWF = true;
        var maxCount;
        var $addDetails_ID;
        var $cmbAnswer;
        var $flipCardMain_ID;
        var $workflowActivitys;
        var $welcomeScreenFeedsLists;
        var $row;
        var $noRecordFound;
        var divDetail = null;
        var selectedItems = [];
        var lstDetailCtrls = [];
        var historyDivShow = false;
        var attachIconHtml = null;

        var elements = [
            "SelectWindow"];
        var msgs = VIS.Msg.translate(VIS.Env.getCtx(), elements, true);

        /* Initialize the form design*/
        this.Initalize = function () {
            createWidget();
            getControls();
            events();
            createBusyIndicator();
            showBusy(true);
            getworkflowWidget(true, true);
            setInterval(function () {
                $self.refreshWidget();
            }, 1000 * 60 * 5);  // refresh every 5 minutes
        };
        /* Get controls from root */
        function getControls() {
            $backBtn_ID = $workflowActivitys.find("#VIS_backBtn_ID" + $self.AD_UserHomeWidgetID);
            $zoom = $workflowWidgetDtls_ID.find("#VIS_Zoom_ID" + $self.AD_UserHomeWidgetID);
            $txtSearch = $fstMainDiv_ID.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID);
            $btnSearch = $fstMainDiv_ID.find('#btnWorkflowSearch' + $self.AD_UserHomeWidgetID);
            $addDetails_ID = $fstMainDiv_ID.find("#VIS_AddDetails_ID" + $self.AD_UserHomeWidgetID);
            divDetail = $fstMainDiv_ID.find("#workflowActivityDetails" + $self.AD_UserHomeWidgetID);
        };
        function openWorkflowModal() {
            var modalId = 'WFWorkflowModal' + $self.AD_UserHomeWidgetID;
            var $modal = $('#' + modalId);
            var isRTL = VIS.Application.isRTL || $('html').attr('dir') == 'rtl';
            var modalDir = isRTL ? 'rtl' : 'ltr';
            var currentModalCardIdx = 0; // tracks which card is currently selected in the modal

            /*
             * wf labels
             * Old message                  | Message key                         | Fallback
             * Activities                   | VIS_Activities                      | Activities
             * No activities found          | VIS_NoActivitiesFound               | No activities found
             * Workflow                     | VIS_Workflow                        | Workflow
             * Workflow Activity            | VIS_WorkflowActivity                | Workflow Activity
             * No records found             | VIS_NoRecordsFound                  | No records found
             * Approvals                    | VIS_Approvals                       | Approvals
             * Approvals preview            | VIS_ApprovalsPreview                | Approvals preview
             * Search by requester, type... | VIS_SearchByRequesterTypeID         | Search by requester, type, ID...
             * From Date                    | VIS_FromDate                        | From Date
             * To Date                      | VIS_ToDate                          | To Date
             * Awaiting your approval       | VIS_AwaitingYourApproval            | Awaiting your approval
             * Watch                        | VIS_Watch                           | Watch
             * History                      | VIS_History                         | History
             * Close                        | VIS_Close                           | Close
             * Transaction details          | VIS_TransactionDetails              | Transaction details
             * Desc                         | VIS_Desc                            | Desc
             * Requester                    | VIS_Requester                       | Requester
             * Workflow Issuer              | VIS_WorkflowIssuer                  | Workflow Issuer
             * Submitted                    | VIS_Submitted                       | Submitted
             * pending                      | VIS_Pending                         | pending
             * Forward                      | VIS_Forward                         | Forward
             * Forward to                   | VIS_ForwardTo                       | Forward to
             * Search user                  | VIS_SearchUser                      | Search user
             * Add an optional note         | VIS_Message                         | Add an optional note
             * Cancel                       | VIS_Cancel                          | Cancel
             * TypeMessage                  | VIS_TypeMessage                     | Please write message
             * Loading                      | VIS_Loading                         | Loading...
             * Failed to load history.      | VIS_FailedToLoadHistory             | Failed to load history.
             * No history available.        | VIS_NoHistoryAvailable              | No history available.
             */
            function lbl(key, fallback) {
                var text = VIS.Msg.getMsg(key);
                return text && text !== '[' + key + ']' ? text : fallback;
            }

            function syncWindowSelect() {
                var $popupSelect = $('#' + modalId + 'WindowSelect');
                if ($popupSelect.length == 0 || !$cmbWindows || $cmbWindows.length == 0) {
                    return;
                }

                $popupSelect.empty();
                $cmbWindows.find('option').each(function () {
                    $popupSelect.append($(this).clone());
                });
                $popupSelect.val($cmbWindows.val());
            };

            function syncDateInputs() {
                $modal.find('#' + modalId + 'FromDateInput').val($fromDateInput_ID && $fromDateInput_ID.length ? $fromDateInput_ID.val() : '');
                $modal.find('#' + modalId + 'ToDateInput').val($toDateInput_ID && $toDateInput_ID.length ? $toDateInput_ID.val() : '');
            };

            function syncActivityList() {
                var $activityContainers = $workflowWidgetDtls_ID.find('.vis-w-activityContainer');
                var $wfList = $modal.find('.vis-wf-list');

                if ($wfList.length == 0) {
                    return;
                }

                $wfList.empty();
                if ($activityContainers.length == 0) {
                    $wfList.append('<div class="vis-wf-group">' + lbl('VIS_Activities', 'Activities') + ' - 0</div><div class="vis-wf-empty">' + lbl('VIS_NoActivitiesFound', 'No activities found') + '</div>');
                    return;
                }

                $wfList.append('<div class="vis-wf-group">' + lbl('VIS_Activities', 'Activities') + ' - ' + $activityContainers.length + '</div>');
                $activityContainers.each(function (index) {
                    var activityTitle = $(this).find('.vis-w-wfActivity-selectchk').text();
                    activityTitle = activityTitle && activityTitle.trim().length > 0 ? activityTitle.trim() : lbl('VIS_WorkflowActivity', 'Workflow Activity');

                    // Read window/node key from the pre's data-ids (format: AD_Window_ID_AD_Node_ID_AD_WF_Activity_ID_index)
                    var dataIds = $(this).find('pre[data-ids]').attr('data-ids') || '';
                    var parts = dataIds.split('_');
                    var winNodeKey = (parts.length >= 2) ? parts[0] + '_' + parts[1] : '0_0';

                    // Build inline KV rows from the pre summary text
                    var preText = $(this).find('pre.vis-workflow-pre-cls').text().trim();
                    var kvHtml = buildKVHtml(preText);

                    $wfList.append(
                        '<div class="vis-wf-card' + (index == 0 ? ' vis-wf-card-selected' : '') + '" role="button" tabindex="0" data-winnode="' + winNodeKey + '">'
                        + '  <div class="vis-wf-card-top">'
                        + '    <div class="vis-wf-card-title">' + VIS.Utility.encodeText(activityTitle) + '</div>'
                        + '    <span class="vis-wf-id">WF-' + (index + 1) + '</span>'
                        + '  </div>'
                        + (kvHtml ? '<div class="vis-wf-kv vis-wf-card-kv">' + kvHtml + '</div>' : '')
                        + '</div>'
                    );
                });
            };


            

            function filterCards(winNodeVal) {
                var $wfList = $modal.find('.vis-wf-list');
                var $cards = $wfList.find('.vis-wf-card');
                var $group = $wfList.find('.vis-wf-group');
                var searchText = ($modal.find('.vis-wf-search input').val() || '').toLowerCase().trim();
                var fromDateVal = $modal.find('#' + modalId + 'FromDateInput').val();
                var toDateVal = $modal.find('#' + modalId + 'ToDateInput').val();
                var visibleCount = 0;

                $wfList.find('.vis-wf-search-empty').remove();
                $cards.each(function (index) {
                    var windowMatch = !winNodeVal || winNodeVal === '0_0' || $(this).data('winnode') === winNodeVal;
                    var searchMatch = !searchText || getCardSearchText($(this), index).indexOf(searchText) > -1;
                    var dateMatch = isDateMatch(index, fromDateVal, toDateVal);
                    var isVisible = windowMatch && searchMatch && dateMatch;

                    $(this).toggle(isVisible);
                    if (isVisible) {
                        visibleCount++;
                    }
                });
                $group.text(lbl('VIS_Activities', 'Activities') + ' - ' + visibleCount);

                // Re-select first visible card and update detail panel
                $cards.removeClass('vis-wf-card-selected');
                var $first = $cards.filter(':visible').first();
                $first.addClass('vis-wf-card-selected');
                if ($first.length) {
                    var firstIdx = $cards.index($first); // 0-based index within cards, matches activity container order
                    currentModalCardIdx = firstIdx;
                    var firstDataIds = $workflowWidgetDtls_ID.find('.vis-w-activityContainer')
                        .eq(firstIdx).find('.vis-w-wfActivity-selectchk').text();
                    $modal.find('.vis-wf-record-title').text(
                        firstDataIds && firstDataIds.trim() ? firstDataIds.trim() : lbl('VIS_WorkflowActivity', 'Workflow Activity')
                    );
                    $modal.find('.vis-wf-no-selection').hide();
                    $modal.find('.vis-wf-detail-header, .vis-wf-content-body').show();
                    syncDetailKV(firstIdx);
                    syncSubmitted(firstIdx);
                    syncDescription(firstIdx);
                    syncRequester(firstIdx);
                    syncAnswer(firstIdx);
                    loadHistory(firstIdx);
                }
                else {
                    currentModalCardIdx = -1;
                    $modal.find('.vis-wf-no-selection').show();
                    $modal.find('.vis-wf-detail-header, .vis-wf-content-body').hide();
                }
            };

            function getWFDate(dateValue, endOfDay) {
                if (!dateValue) {
                    return null;
                }

                var parts = dateValue.split('-');
                if (parts.length != 3) {
                    return null;
                }

                var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                if (isNaN(date.getTime())) {
                    return null;
                }

                if (endOfDay) {
                    date.setHours(23, 59, 59, 999);
                }
                else {
                    date.setHours(0, 0, 0, 0);
                }
                return date;
            };

            function isDateMatch(index, fromDateVal, toDateVal) {
                if (!fromDateVal && !toDateVal) {
                    return true;
                }

                var activity = (fulldata && fulldata[index]) ? fulldata[index] : null;
                if (!activity || !activity.Created) {
                    return false;
                }

                var activityDate = new Date(activity.Created);
                if (isNaN(activityDate.getTime())) {
                    return false;
                }

                var fromDate = getWFDate(fromDateVal, false);
                var toDate = getWFDate(toDateVal, true);

                if (fromDate && activityDate < fromDate) {
                    return false;
                }
                if (toDate && activityDate > toDate) {
                    return false;
                }
                return true;
            };

            function getCardSearchText($card, index) {
                var activity = (fulldata && fulldata[index]) ? fulldata[index] : {};
                return [
                    $card.text(),
                    activity.NodeName,
                    activity.DocumentNameValue,
                    activity.Summary,
                    activity.Description,
                    getRequesterName(index)
                ].join(' ').toLowerCase();
            };

            function syncPendingCount() {
                var $pendingCount = $('#' + modalId + 'PendingCount');
                if ($pendingCount.length == 0) {
                    return;
                }
                $pendingCount.text($modal.find('.vis-wf-card').length + ' ' + lbl('VIS_Pending', 'pending'));
            };

            function syncDetailTitle(index) {
                var activityTitle = $workflowWidgetDtls_ID.find('.vis-w-activityContainer').eq(index || 0).find('.vis-w-wfActivity-selectchk').text();
                activityTitle = activityTitle && activityTitle.trim().length > 0 ? activityTitle.trim() : lbl('VIS_WorkflowActivity', 'Workflow Activity');
                $modal.find('.vis-wf-record-title').text(activityTitle);
            };

            function getRequesterNameFromHistory(info) {
                if (!info || !info.Node) {
                    return null;
                }

                for (var nodeIndex = info.Node.length - 1; nodeIndex >= 0; nodeIndex--) {
                    var history = info.Node[nodeIndex] && info.Node[nodeIndex].History;
                    if (!history) {
                        continue;
                    }

                    for (var historyIndex in history) {
                        var item = history[historyIndex];
                        var approvedBy = item && item.State != 'BK' && item.ApprovedBy;
                        if (typeof approvedBy == 'string' && approvedBy.trim().length > 0) {
                            return approvedBy.trim();
                        }
                    }
                }

                return null;
            };

            function getRequesterName(index, info) {
                var historyRequester = getRequesterNameFromHistory(info);
                if (historyRequester) {
                    return historyRequester;
                }

                var activity = (fulldata && fulldata[index]) ? fulldata[index] : {};
                var sources = [info || {}, activity];
                var fields = [
                    'WorkflowIssuer', 'WorkflowIssuerName', 'Issuer', 'IssuerName', 'IssuedBy',
                    'Requester', 'RequesterName', 'AD_User_Name', 'UserName', 'CreatedByName',
                    'CreatedByUserName', 'CreatedByUser', 'OwnerName', 'ResponsibleName'
                ];

                for (var sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
                    for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                        var value = sources[sourceIndex][fields[fieldIndex]];
                        if (typeof value == 'string' && value.trim().length > 0) {
                            return value.trim();
                        }
                    }
                }

                var summary = activity.Summary || '';
                var lines = summary.split('\n');
                for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    var line = lines[lineIndex];
                    var colonIdx = line.indexOf(':');
                    if (colonIdx <= 0) {
                        continue;
                    }
                    var key = line.substring(0, colonIdx).trim().toLowerCase();
                    var valueText = line.substring(colonIdx + 1).trim();
                    if (valueText && (key == 'workflow issuer' || key == 'issuer' || key == 'requester' || key == 'created by' || key == 'submitted by')) {
                        return valueText;
                    }
                }

                return lbl('VIS_WorkflowIssuer', 'Workflow Issuer');
            };

            function syncRequester(index, info) {
                var requesterName = getRequesterName(index || 0, info);
                $modal.find('.vis-wf-requester-name').text(requesterName);
            };

            // Populate the description section from fulldata — hide entire section if empty
            function syncDescription(index) {
                var desc = (fulldata && fulldata[index || 0]) ? (fulldata[index || 0].Description || '').trim() : '';
                var $section = $modal.find('.vis-wf-description').closest('section');
                if (desc) {
                    $modal.find('.vis-wf-description').text(desc);
                    $section.show();
                } else {
                    $section.hide();
                }
            };

            function approveAnswer(index, ctrl, $okBtn) {
                if ($okBtn.data('clicked') == 'Y') {
                    return;
                }
                $okBtn.data('clicked', 'Y');

                var answer = ctrl && ctrl.getValue ? ctrl.getValue() : null;
                if (answer == '' || answer == null || answer == -1 || answer == '-1') {
                    $okBtn.data('clicked', 'N');
                    VIS.ADialog.error('', true, lbl('VIS_PleaseSelectAnswer', 'Please select an answer'));
                    return;
                }

                var msg = '';
                showBusy(true);
                VIS.dataContext.getJSONData(
                    VIS.Application.contextUrl + 'WFActivity/ApproveIt',
                    {
                        activityID: fulldata[index].AD_WF_Activity_ID,
                        nodeID: fulldata[index].AD_Node_ID,
                        txtMsg: msg,
                        fwd: null,
                        answer: answer,
                        AD_Window_ID: fulldata[index].AD_Window_ID
                    },
                    function (info) {
                        $okBtn.data('clicked', 'N');
                        showBusy(false);
                        if (info.result == '') {
                            $modal.css('display', 'none');
                            lstDetailCtrls = [];
                            selectedItems = [];
                            adjust_size();
                        } else {
                            VIS.ADialog.error(info.result);
                        }
                    }
                );
            };

            function buildAnswer(index, info) {
                var $actions = $modal.find('.vis-wf-actions');
                $actions.find('.vis-wf-answer-dynamic').remove();

                if (!info || info.NodeAction != 'C') {
                    return;
                }

                var ctrl = getControl(info, fulldata[index].AD_WF_Activity_ID);
                if (ctrl == null) {
                    return;
                }

                var $answerWrap = $('<div class="vis-w-home-wf-answerWrap vis-wf-answer-dynamic">');
                var $answerInput = $('<div class="input-group vis-w-home-wf-answerInput vis-w-input-widgetswrap">');
                var $forwardBtn = $actions.find('.vis-wf-action-secondary');
                $answerWrap.append($answerInput);

                var $ctrlWrap = $("<div class='vis-wforwardwrap vis-control-wrap vis-input-wrap mb-0 vis-wf-answer-box'>");
                $ctrlWrap.append(ctrl.getControl());
                $ctrlWrap.append($("<label class='vis-wf-answer-label' style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Answer')));
                $ctrlWrap.append("<i class='fa fa-chevron-down vis-wf-answer-dropdown-icon'></i>");

                $answerInput.append($ctrlWrap);

                var $okBtn = $("<a href='javascript:void(0)' id='vis-home-wf-ansOK-" + modalId + "' class='vis-wf-submit-btn vis-wf-submit-disabled' role='button' aria-disabled='true' data-clicked='N' data-id='" + index + "'>");
                $okBtn.append($("<span>").text(VIS.Msg.getMsg('Submit') || 'Submit'));
                $okBtn.append($("<i class='fa fa-check'></i>"));
                $answerWrap.append($('<div class="vis-w-home-wf-answerBtn">').append($okBtn));
                $actions.append($answerWrap);

                var toggleAnswerOk = function () {
                    var answerValue = ctrl.getValue();
                    var hasValue = !(answerValue == '' || answerValue == null || answerValue == -1 || answerValue == '-1');
                    $ctrlWrap.toggleClass('vis-wf-answer-has-value', hasValue);
                    $okBtn
                        .toggleClass('vis-wf-submit-disabled', !hasValue)
                        .toggleClass('vis-wf-submit-ready', hasValue)
                        .attr('aria-disabled', hasValue ? 'false' : 'true');
                    $forwardBtn
                        .toggleClass('vis-wf-forward-disabled', hasValue)
                        .attr('aria-disabled', hasValue ? 'true' : 'false');
                };

                ctrl.fireValueChanged = toggleAnswerOk;
                $answerWrap.find(':input').on('change keyup input', toggleAnswerOk);
                toggleAnswerOk();

                $okBtn.on(VIS.Events.onTouchStartOrClick, function () {
                    approveAnswer(index, ctrl, $okBtn);
                });
            };

            function syncAnswer(index) {
                var $actions = $modal.find('.vis-wf-actions');
                $actions.find('.vis-wf-answer-dynamic').remove();
                $actions.find('.vis-wf-action-secondary')
                    .removeClass('vis-wf-forward-disabled')
                    .attr('aria-disabled', 'false');

                if (!fulldata || !fulldata[index]) {
                    return;
                }

                $.ajax({
                    url: VIS.Application.contextUrl + "WFActivity/GetActivityInfo",
                    async: true,
                    dataType: "json",
                    type: "POST",
                    data: {
                        activityID: fulldata[index].AD_WF_Activity_ID,
                        nodeID: fulldata[index].AD_Node_ID,
                        wfProcessID: fulldata[index].AD_WF_Process_ID
                    },
                    success: function (res) {
                        if (index === currentModalCardIdx) {
                            syncRequester(index, res.result);
                            buildAnswer(index, res.result);
                        }
                    }
                });
            };

            // Populate the submitted date from the activity's feedDateTime element
            function syncSubmitted(index) {
                var $dateDiv = $workflowWidgetDtls_ID.find('.vis-w-activityContainer').eq(index || 0).find('.vis-w-feedDateTime');
                var dateText = $dateDiv.text().trim();
                $modal.find('.vis-wf-submitted').text(dateText ? lbl('VIS_Submitted', 'Submitted') + ' ' + dateText : '');
            };

            // Parse one pre summary line into {key, val} — handles colon-separated,
            // Arabic-label + non-Arabic-value, and non-Arabic-value + Arabic-label formats.
            function parseKVLine(line) {
                // 1. Colon separator (highest priority)
                var colonIdx = line.indexOf(':');
                if (colonIdx > 0) {
                    return { key: line.substring(0, colonIdx).trim(), val: line.substring(colonIdx + 1).trim() };
                }
                // 2. Arabic label (start) + non-Arabic value
                var m = line.match(/^([؀-ۿ][؀-ۿ\s]*?)\s+([^؀-ۿ].+)$/);
                if (m) {
                    return { key: m[1].trim(), val: m[2].trim() };
                }
                // 3. Non-Arabic value (start) + Arabic label — bidi visual reorder case
                m = line.match(/^([^؀-ۿ\s][^؀-ۿ]*?)\s+([؀-ۿ].+)$/);
                if (m) {
                    return { key: m[2].trim(), val: m[1].trim() };
                }
                return null; // full-width fallback
            }

            // Build the HTML for a KV table from a pre summary text block
            function buildKVHtml(preText) {
                var html = '';
                if (!preText) return html;
                var lines = preText.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    var pair = parseKVLine(line);
                    if (pair) {
                        html += '<div class="vis-wf-kv-row" dir="ltr">'
                            + '<span class="vis-wf-kv-key" dir="auto">' + VIS.Utility.encodeText(pair.key) + '</span>'
                            + '<span class="vis-wf-kv-val">' + VIS.Utility.encodeText(pair.val) + '</span>'
                            + '</div>';
                    } else {
                        html += '<div class="vis-wf-kv-row" dir="auto">'
                            + '<span class="vis-wf-kv-key" style="width:100%">' + VIS.Utility.encodeText(line) + '</span>'
                            + '</div>';
                    }
                }
                return html;
            }

            // Populate the KV table from the <pre> summary lines of the selected activity
            function syncDetailKV(index) {
                var $kvContainer = $modal.find('.vis-wf-kv');
                if ($kvContainer.length == 0) return;

                var $pre = $workflowWidgetDtls_ID.find('.vis-w-activityContainer').eq(index || 0).find('pre.vis-workflow-pre-cls');
                var preText = $pre.text().trim();

                $kvContainer.empty();
                $kvContainer.html(buildKVHtml(preText));
            };

            function syncCardTitles() {
                var $activityContainers = $workflowWidgetDtls_ID.find('.vis-w-activityContainer');
                $modal.find('.vis-wf-card-title').each(function (index) {
                    var activityTitle = $activityContainers.eq(index).find('.vis-w-wfActivity-selectchk').text();
                    if (activityTitle && activityTitle.trim().length > 0) {
                        $(this).text(activityTitle.trim());
                    }
                });
            };

            if ($modal.length === 0) {
                $modal = $(`
                    <div id="${modalId}" class="vis-wf-modal" dir="${modalDir}" style="display:none;">
                        <div class="vis-wf-shell" role="dialog" aria-modal="true" aria-label="${lbl('VIS_ApprovalsPreview', 'Approvals preview')}">
                            <div class="vis-wf-titlebar">
                                <div class="vis-wf-title">
                                    <span class="vis-wf-module-icon"><i class="vis vis-info"></i></span>
                                    <span><strong>${lbl('VIS_Approvals', 'Approvals')}</strong></span>
                                    <span id="${modalId}PendingCount" class="vis-wf-meta"></span>
                                </div>
                            </div>
                            <div class="vis-wf-main">
                                <aside class="vis-wf-master">
                                    <div class="vis-wf-tools">
                                        <div class="vis-wf-search">
                                            <i class="fa fa-search" aria-hidden="true"></i>
                                            <input type="text" placeholder="${lbl('VIS_SearchByRequesterTypeID', 'Search by requester, type, ID...')}">
                                        </div>
                                        <div class="vis-wf-date-filters">
                                            <div class="vis-wf-date-filter">
                                                <label for="${modalId}FromDateInput">${lbl('VIS_FromDate', 'From Date')}</label>
                                                <input id="${modalId}FromDateInput" class="vis-wf-date-input" type="date" placeholder="date">
                                            </div>
                                            <div class="vis-wf-date-filter">
                                                <label for="${modalId}ToDateInput">${lbl('VIS_ToDate', 'To Date')}</label>
                                                <input id="${modalId}ToDateInput" class="vis-wf-date-input" type="date" placeholder="date">
                                            </div>
                                        </div>
                                        <div class="vis-wf-filters">
                                            <select id="${modalId}WindowSelect" class="vis-wf-window-select vis-custom-select vis-selectworkflow-fontsize"></select>
                                        </div>
                                    </div>
                                    <div class="vis-wf-list"></div>
                                </aside>
                                <div class="vis-wf-content-area">
                                    <div class="vis-wf-no-selection">
                                        <i class="vis vis-info"></i>
                                        <p>${lbl('VIS_SelectWorkflowToViewDetails', 'Select a workflow to view details')}</p>
                                    </div>
                                    <div class="vis-wf-detail-header" style="display:none;">
                                        <div class="vis-wf-detail-left">
                                            <span class="vis-wf-requester-meta"><span class="vis-wf-requester-label">${lbl('VIS_Requester', 'Requester')}</span><span class="vis-wf-requester-name"></span></span>
                                            <span class="vis-wf-status"><span class="vis-wf-dot"></span>${lbl('VIS_AwaitingYourApproval', 'Awaiting your approval')}</span>
                                        </div>
                                        <div class="vis-wf-detail-right">
                                            <span class="vis-wf-submitted"></span>
                                            <button type="button" class="vis-wf-hdr-btn vis-wf-zoom-btn vis-wf-watch" title="${lbl('VIS_Watch', 'Watch')}"><i class="fa fa-search-plus vis-wf-zoom-icon"></i></button>
                                            <button type="button" id="${modalId}Close" class="vis-wf-hdr-btn vis-wf-close-btn" title="${lbl('VIS_Close', 'Close')}"><span class="vis-wf-close-circle"><i class="vis-wf-close-icon"></i></span></button>
                                        </div>
                                    </div>
                                    <div class="vis-wf-content-body" style="display:none;">
                                        <section class="vis-wf-detail">
                                            <div class="vis-wf-body">
                                                <section class="vis-wf-section">
                                                    <div class="vis-wf-record-title">${lbl('VIS_WorkflowActivity', 'Workflow Activity')}</div>
                                                    <h3 class="vis-wf-section-title">${lbl('VIS_TransactionDetails', 'Transaction details')}</h3>
                                                    <div class="vis-wf-kv">
                                                        <!-- populated dynamically from activity summary -->
                                                    </div>
                                                </section>
                                                <section class="vis-wf-section">
                                                    <h3 class="vis-wf-section-title">${lbl('VIS_Desc', 'Desc')}</h3>
                                                    <div class="vis-wf-description">
                                                        <!-- populated dynamically from activity description -->
                                                    </div>
                                                </section>
                                            </div>
                                            <div class="vis-wf-footer">
                                                <div class="vis-wf-forward-panel" style="display:none;"></div>
                                                <div class="vis-wf-footer-row">
                                                    <div class="vis-wf-actions">
                                                        <a href="javascript:void(0)" class="vis-wf-action vis-wf-action-secondary"><span>${lbl('VIS_Forward', 'Forward')}</span><i class="fa fa-arrow-right vis-wf-forward-icon"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                        <aside class="vis-wf-history-side">
                                            <div class="vis-wf-history-content"></div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                $('body').append($modal);
                $modal.on('click', function (e) {
                    if ($(e.target).is($modal)) {
                        $modal.trigger('modalClose');
                        $modal.css('display', 'none');
                    }
                });
                $modal.find('#' + modalId + 'Close').on('click', function () {
                    $modal.trigger('modalClose');
                    $modal.css('display', 'none');
                });
                $modal.on('click', '.vis-wf-card', function () {
                    if ($(this).hasClass('vis-wf-card-selected')) return;
                    $modal.find('.vis-wf-card').removeClass('vis-wf-card-selected');
                    $(this).addClass('vis-wf-card-selected');
                    var cardIdx = $modal.find('.vis-wf-card').index(this);
                    currentModalCardIdx = cardIdx;
                    // Reveal detail and history panels
                    $modal.find('.vis-wf-no-selection').hide();
                    $modal.find('.vis-wf-detail-header, .vis-wf-content-body').show();
                    // Collapse and clear the forward panel when switching cards
                    var $fwdPanel = $modal.find('.vis-wf-forward-panel');
                    $fwdPanel.hide().empty();
                    syncDetailTitle(cardIdx);
                    syncDetailKV(cardIdx);
                    syncSubmitted(cardIdx);
                    syncDescription(cardIdx);
                    syncRequester(cardIdx);
                    syncAnswer(cardIdx);
                    loadHistory(cardIdx);
                });
                $modal.on('keydown', '.vis-wf-card', function (e) {
                    if (e.keyCode == 13 || e.keyCode == 32) {
                        e.preventDefault();
                        $(this).trigger('click');
                    }
                });
                $modal.on('change', '#' + modalId + 'WindowSelect', function () {
                    // Filter cards inside the modal without reloading from server
                    filterCards($(this).val());
                    // Keep the main widget combo in sync (value only, no reload)
                    if ($cmbWindows && $cmbWindows.length > 0) {
                        $cmbWindows.val($(this).val());
                    }
                });
                $modal.on('keydown', '.vis-wf-search input', function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        filterCards($modal.find('#' + modalId + 'WindowSelect').val());
                    }
                });
                $modal.on('click', '.vis-wf-search i', function () {
                    filterCards($modal.find('#' + modalId + 'WindowSelect').val());
                });
                $modal.on('change', '.vis-wf-date-input', function () {
                    filterCards($modal.find('#' + modalId + 'WindowSelect').val());
                });

                // Watch (eye) button — open the record screen, same as the vis-find zoom button
                $modal.on('click', '.vis-wf-watch', function () {
                    if (currentModalCardIdx < 0) {
                        return;
                    }
                    zoom(currentModalCardIdx);
                    $modal.trigger('modalClose');
                    $modal.css('display', 'none');
                });

                // Forward button — show forward panel with the user input directly (no extra button click)
                $modal.on('click', '.vis-wf-action-secondary', function () {
                    if ($(this).hasClass('vis-wf-forward-disabled')) {
                        return;
                    }

                    var $fwdPanel = $modal.find('.vis-wf-forward-panel');
                    if ($fwdPanel.is(':visible')) {
                        $fwdPanel.hide().empty();
                        return;
                    }

                    $fwdPanel.empty();

                    // ── Header ─────────────────────────────────────────────────────────
                    var $header = $('<div class="vis-wf-fwd-header">');
                    $header.append('<div class="vis-wf-fwd-header-icon"><i class="vis vis-arrow-right"></i></div>');
                    $header.append($('<div class="vis-wf-fwd-header-title">').text(lbl('VIS_ForwardTo', 'Forward to')));
                    $fwdPanel.append($header);

                    // ── Fields ─────────────────────────────────────────────────────────
                    var $fields = $('<div class="vis-wf-fwd-fields">');

                    // Build the lookup control — we only use getControl() (the raw input),
                    // no buttons are added to the DOM so no extra click is needed.
                    var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.Search, "AD_User_ID", 0, false, "AD_User.IsLoginUser='Y' AND AD_User.IsActive='Y'");
                    var txtb = new VIS.Controls.VTextBoxButton("AD_User_ID", false, false, true, VIS.DisplayType.Search, lookup);
                    txtb.getBtn(); // initialise internal state (required), but we won't append the btns

                    var $userField = $('<div class="vis-wf-fwd-field">');
                    $userField.append('<i class="fa fa-user vis-wf-fwd-field-icon"></i>');
                    var $userCtrl = txtb.getControl();
                    $userCtrl.attr('placeholder', lbl('VIS_SearchUser', 'Search user'));
                    $userField.append($userCtrl);

                    // Search icon — clicking it opens the VIS user lookup popup
                    var $searchBtn = $('<button type="button" class="vis-wf-fwd-field-search-btn" title="' + lbl('VIS_SearchUser', 'Search user') + '">');
                    $searchBtn.append('<i class="vis vis-find"></i>');
                    $searchBtn.on('click', function (e) {
                        e.stopPropagation();
                        // getBtn(0) is the caret-down button — opens the user lookup dropdown
                        txtb.getBtn(0).trigger('click');
                    });
                    $userField.append($searchBtn);

                    $fields.append($userField);

                    $fwdPanel.append($fields);

                    // ── Action buttons ─────────────────────────────────────────────────
                    var $actions = $('<div class="vis-wf-fwd-actions">');
                    var $cancelBtn  = $('<button class="vis-wf-fwd-cancel">').html('<i class="vis vis-close"></i> ' + lbl('VIS_Cancel', 'Cancel'));
                    var $confirmBtn = $('<button class="vis-wf-fwd-confirm">').html('<i class="vis vis-arrow-right"></i> ' + lbl('VIS_Forward', 'Forward'));
                    $actions.append($cancelBtn).append($confirmBtn);
                    $fwdPanel.append($actions);

                    // ── Events ────────────────────────────────────────────────────────
                    $cancelBtn.on('click', function () {
                        $fwdPanel.hide().empty();
                    });

                    $confirmBtn.on('click', function () {
                        var fwdTo = txtb.getValue();
                        if (!fwdTo || fwdTo <= 0) {
                            VIS.ADialog.error('FillMandatory', true, lbl('VIS_Forward', 'Forward'));
                            return;
                        }
                        var msg = '';
                        var activityID = fulldata[currentModalCardIdx].AD_WF_Activity_ID;
                        var nID        = fulldata[currentModalCardIdx].AD_Node_ID;
                        var winID      = fulldata[currentModalCardIdx].AD_Window_ID;

                        showBusy(true);
                        VIS.dataContext.getJSONData(
                            VIS.Application.contextUrl + 'WFActivity/ApproveIt',
                            { activityID: activityID, nodeID: nID, txtMsg: msg, fwd: fwdTo, answer: null, AD_Window_ID: winID },
                            function (info) {
                                showBusy(false);
                                if (info.result == '') {
                                    $modal.css('display', 'none');
                                    lstDetailCtrls = [];
                                    selectedItems = [];
                                    adjust_size();
                                } else {
                                    VIS.ADialog.error(info.result);
                                }
                            }
                        );
                    });

                    $fwdPanel.show();

                    // Focus the user input immediately so the user can start typing
                    setTimeout(function () { $userCtrl.trigger('focus'); }, 80);
                });

                // Load history for a card index into the permanent side panel
                function loadHistory(cardIdx) {
                    var $historySide = $modal.find('.vis-wf-history-side');
                    var $historyContent = $historySide.find('.vis-wf-history-content');

                    var $actContainers = $workflowWidgetDtls_ID.find('.vis-w-activityContainer');
                    var $actContainer = $actContainers.eq(cardIdx);
                    var $pre = $actContainer.find('pre.vis-workflow-pre-cls');
                    var dataIds = $pre.attr('data-ids') || '';
                    var parts = dataIds.split('_');
                    var wfActivityID = parts[2] || '';
                    var nodeID = parts[1] || '0';
                    var idx = parts[3] !== undefined ? parseInt(parts[3]) : cardIdx;
                    var wfProcessID = (fulldata && fulldata[idx]) ? fulldata[idx].AD_WF_Process_ID : null;

                    var flowTitle = '<div class="vis-wf-ht-flow-title">' + lbl('VIS_ViewHistoryRecord', 'View History Record') + '</div>';
                    $historyContent.html(flowTitle + '<div class="vis-wf-ht-loading">' + lbl('VIS_Loading', 'Loading...') + '</div>');

                    if (!wfActivityID) {
                        $historyContent.html(flowTitle + '<div class="vis-wf-ht-loading">' + lbl('VIS_NoHistoryAvailable', 'No history available.') + '</div>');
                        return;
                    }

                    $.ajax({
                        url: VIS.Application.contextUrl + 'WFActivity/GetActivityInfo',
                        async: true,
                        dataType: 'json',
                        type: 'POST',
                        data: { activityID: wfActivityID, nodeID: nodeID, wfProcessID: wfProcessID },
                        error: function () {
                            $historyContent.html(flowTitle + '<div class="vis-wf-ht-loading" style="color:#e74c3c;">' + lbl('VIS_FailedToLoadHistory', 'Failed to load history.') + '</div>');
                        },
                        success: function (res) {
                            var info = res && res.result ? res.result : null;
                            $historyContent.empty();
                            $historyContent.append(flowTitle);
                            syncRequester(cardIdx, info);

                            if (!info || !info.Node) {
                                $historyContent.append('<div class="vis-wf-ht-loading">' + lbl('VIS_NoHistoryAvailable', 'No history available.') + '</div>');
                                return;
                            }

                            var $timeline = $('<div class="vis-wf-ht-timeline">');
                            for (var node in info.Node) {
                                if (info.Node[node].History == null) continue;
                                for (var hNode in info.Node[node].History) {
                                    var h = info.Node[node].History[hNode];
                                    if (h.State == 'BK') continue;
                                    var nodeName = info.Node[node].Name || '';
                                    var isCompleted = (h.State == 'CC' && node < (info.Node.length - 1))
                                                   || (node >= (info.Node.length - 1) && info.Node.length > 1);

                                    var $item = $('<div class="vis-wf-ht-item">');

                                    // Left — node name + optional info tooltip
                                    var $nodeEl = $('<div class="vis-wf-ht-node">');
                                    if (h.TextMsg && h.TextMsg.length > 0) {
                                        $nodeEl.append($("<a href='javascript:void(0)' class='VIS_Pref_tooltip vis-aTagCls'>").append("<i class='vis vis-info' data-toggle='tooltip' data-placement='bottom' title='" + VIS.Utility.encodeText(h.TextMsg) + "'></i> "));
                                    }
                                    $nodeEl.append(document.createTextNode(nodeName));
                                    $item.append($nodeEl);

                                    // Center — dot (check if completed, circle if pending)
                                    var $step = $('<div class="vis-wf-ht-step">');
                                    if (isCompleted) {
                                        $step.append("<div class='vis-wf-ht-dot vis-wf-ht-dot-check'><i class='vis vis-markx'></i></div>");
                                    } else {
                                        $step.append("<div class='vis-wf-ht-dot'></div>");
                                    }
                                    $item.append($step);

                                    // Right — status text
                                    var $status = $('<div class="vis-wf-ht-status">');
                                    if (isCompleted) {
                                        $status.append('<span class="vis-wf-ht-label">' + VIS.Msg.getMsg('CompletedBy') + '</span><strong class="vis-wf-ht-by">' + VIS.Utility.encodeText(h.ApprovedBy || '') + '</strong>');
                                    } else {
                                        $status.addClass('vis-wf-ht-pending').text(VIS.Msg.getMsg('Pending'));
                                    }
                                    $item.append($status);

                                    $timeline.append($item);
                                }
                            }
                            $historyContent.append($timeline);
                        }
                    });
                }
            }

            $modal.attr('dir', modalDir);
            syncWindowSelect();
            syncDateInputs();
            syncActivityList();
            syncCardTitles();
            syncPendingCount();
            // Reset detail panel to empty state — user must select a card first
            $modal.find('.vis-wf-no-selection').show();
            $modal.find('.vis-wf-detail-header, .vis-wf-content-body').hide();
            filterCards($modal.find('#' + modalId + 'WindowSelect').val());

            // ── Global z-index guard ──────────────────────────────────────────────
            // Any dialog/popup appended to <body> while this modal is open must sit
            // above our modal (z-index 99999).  We only skip pure dimming backdrops.
            if (!$modal.data('bodyObserver')) {
                var modalBodyObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (m) {
                        m.addedNodes.forEach(function (node) {
                            if (node.nodeType !== 1) return;
                            var $node = $(node);
                            if ($node.hasClass('ui-widget-overlay') ||
                                $node.hasClass('modal-backdrop')) return;
                            $node.css('z-index', 100002);
                            $node.find('.ui-dialog').css('z-index', 100002);
                        });
                    });
                });
                modalBodyObserver.observe(document.body, { childList: true, subtree: false });
                $modal.data('bodyObserver', modalBodyObserver);

                // Stop observing when the modal is hidden
                var origHide = $modal.hide;
                $modal.on('modalClose', function () {
                    modalBodyObserver.disconnect();
                    $modal.removeData('bodyObserver');
                });
            }

            $modal.css('display', 'flex');
        };
        /* Declare events */
        function events() {
            $backBtn_ID.on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
            $wFSearchshow_ID.on('click', function () {
                if (showToAndFromDate == true) {
                    $fromDate_ID.css('display', 'block');
                    $toDate_ID.css('display', 'block');
                    $welcomeScreenFeedsLists.addClass('VIS-ActiveCls')
                    showToAndFromDate = false;
                }
                else {
                    $fromDate_ID.css('display', 'none');
                    $toDate_ID.css('display', 'none');
                    $("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val('');
                    $("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val('');
                    $welcomeScreenFeedsLists.removeClass('VIS-ActiveCls')
                    showToAndFromDate = true;
                }
            });
            $fstMainDiv_ID.off('click', '#WFShowDetails' + $self.AD_UserHomeWidgetID);
            $fstMainDiv_ID.on('click', '#WFShowDetails' + $self.AD_UserHomeWidgetID, function (e) {
                e.preventDefault();
                e.stopPropagation();
                openWorkflowModal();
            });
            $hlnkTabDataRef_ID.on('click', $self.refreshWidget);
            //$txtSearch.on('change', searchFunction);
            $zoom.on('click', function (e) {
                var id = $(this).data("id");
                zoom(id);
            });
            $txtSearch.on("keydown", function (e) {
                if (e.keyCode == 13) {
                   // showBusy(true);
                    searchFunction();
                }
            });
            $btnSearch.on('click', function () {
                showBusy(true);
                $countDiv_ID.empty();
                $workflowWidgetDtls_ID.empty();
                pageNo = 1;
                getworkflowWidget(true, false);
                //loadWindows();
                //$workflowWidgetDtls_ID.find(".vis-w-feedDetails").on('click', function (e) {
                //    $welcomeScreenFeedsLists.css('display', 'none');
                //    $row.css('display', 'none');
                //    $workflowActivitys.css('display', 'block').css('zindex', '2');
                //});
                $backBtn_ID.on('click', function () {
                    $workflowActivitys.css('display', 'none').css('zindex', '2');
                    $welcomeScreenFeedsLists.css('display', 'block');
                    $row.css('display', 'block');
                });
                search = false;
                //searchRecord();
                showBusy(false);
            });
            $cmbWindows.on('change', function (e) {
                showBusy(true);
                winNideID = $cmbWindows.val();
                $countDiv_ID.empty();
                $workflowWidgetDtls_ID.empty();
                pageNo = 1;
                getworkflowWidget(true, false);
                //loadWindows();
                //$workflowWidgetDtls_ID.find(".vis-w-feedDetails").on('click', function (e) {
                //    $welcomeScreenFeedsLists.css('display', 'none');
                //    $row.css('display', 'none');
                //    $workflowActivitys.css('display', 'block').css('zindex', '2');
                //});
                $workflowWidgetDtls_ID.scrollTop(0);
                $backBtn_ID.on('click', function () {
                    $workflowActivitys.css('display', 'none').css('zindex', '2');
                    $welcomeScreenFeedsLists.css('display', 'block');
                    $row.css('display', 'block');
                });
                showBusy(false);
            });
            $workflowWidgetDtls_ID.on("scroll", loadOnScroll);
            showBusy(false);
        };

        /*Create Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $('<div id="busyDivId' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            $root.append($bsyDiv);
        };

        /* Method to enable and disable busy indicator */
        function showBusy(show) {
            if (show) {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).show();
            }
            else {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).hide();
            }
        };
        //Create Widget
        function createWidget() {
            attachIconHtml = `
  <div class="vis-wfw-attachment-wrapper" style="position: relative; display: inline-block;">
    <i class="fa fa-paperclip vis-wfw-attachClip" style="font-size: 20px; color: rgba(var(--v-c-primary), 1); cursor: pointer;" aria-hidden="true"></i>
    
 <div id="ListContainer" class="vis-wfw-attachment-dropdown" ></div>
  </div>
`;
           /* <div id="ListContainer" class="vis-wfw-attachment-dropdown" style="display: none; position: absolute; top: 30px; right: -25px; background: white; border: 0px solid #ccc; z-index: 999; padding: 5px; min-width: 200px;"></div>
 */

            $workflowWidget = ' <div id="FstMainDiv' + $self.AD_UserHomeWidgetID + '" class="vis-cardCls w-100">'// style="background-color:#f3f3f3"
                + '     <div class="vis-w-welcomeScreenFeeds h-100">'
                + ' <div class="vis-w-row vis-w-rowDiv">'
                + '     <h2 class="vis-w-h2Div">'
                + ' <div class="vis-w-topSecndDivCls">'
                + '         <span id="spanWelcomeTabtopHdr" class="vis-welcomeScreenContentTittle-icon vis vis-userfeed"></span>'
                + '         <strong id="sAlrtTxtType">' + VIS.Msg.getMsg("workflow") + '</strong>'// style="float: left;"Workflow Activities
                + ' <div id="divfActivity' + $self.AD_UserHomeWidgetID + '" title="Workflow" class="vis-w-welcomeScreenTab-notificationBubble blank"></div>'//' + data.length + '
                + ' </div>'
                + ' <div class="vis-w-iconsCls">'
                + '         <a id="hlnkTabDataRef' + $self.AD_UserHomeWidgetID + '" href="javascript:void(0)" title="' + VIS.Msg.getMsg("Requery") + '" class="vis-w-feedicon" style="display:none;"><i class="vis vis-refresh"></i></a>'// style="float: right; margin-top: 0px; cursor: pointer; "
                //+ '         <span id="sNewNts" style="display: none; float: right; margin-top: 0px; cursor: pointer; margin-right: 0.625em;" class="vis-feedicon border-0" title="New Record"><i class="vis vis-plus"></i></span>'
                + '         <span id="WFSearchshow' + $self.AD_UserHomeWidgetID + '"  class="vis-w-feedicon vis vis-eye-plus border-0" title="Show Search"></span>'//style="float: right; margin-top: 0px; cursor: pointer; margin-right: 0.625em;"
                + '         <span id="WFShowDetails' + $self.AD_UserHomeWidgetID + '" class="vis-w-feedicon vis vis-info border-0" title="Open Workflow" style="cursor:pointer;min-width:20px;display:none;"></span>'
                + ' </div>'
                + '     </h2></div>'
                + ' <div id = "welcomeScreenFeedsLists' + $self.AD_UserHomeWidgetID + '" class="vis-w-scrollerVerticalNewCls ml-0 vis-w-workflow-welcomfeed-cls"><div class="vis-w-workflow-homepage-parentdiv">'
                + '<div class="vis-w-frm-data-col-wrap w-100" style=""> <div class="vis-w-frm-data-search-wrap">'
                + '<select id="VIS_CmbWindows_ID' + $self.AD_UserHomeWidgetID + '" class="vis-custom-select vis-selectworkflow-fontsize">'
                + '</select></div></div><div class="vis-w-frm-data-col-wrap w-100"><div class="vis-w-frm-data-search-wrap">'
                + '<input class="frm-data-col-searchinput" id="homeSearchWorkflow' + $self.AD_UserHomeWidgetID + '" class="vis-w-setSearchSize" type="text" placeholder="Search"><button id="btnWorkflowSearch' + $self.AD_UserHomeWidgetID + '" class="vis-wfSearch-btn">'//  style="height: 1.875em;"
                + '<i class="fa fa-search" aria-hidden="true"></i></button></div></div><div id="VIS_FromDate_ID' + $self.AD_UserHomeWidgetID + '" style="display:none;" class="vis-w-frm-data-col-wrap vis-setworkflow-font w-100">'
                + '<label>' + VIS.Msg.getMsg("FromDate") + '</label><input id="VIS_FromDateInput_ID' + $self.AD_UserHomeWidgetID + '" class="vis-w-setSearchSize" type="date" placeholder="date"></div><div id="VIS_ToDate_ID' + $self.AD_UserHomeWidgetID + '" style="display:none;" class="vis-w-frm-data-col-wrap vis-setworkflow-font w-100">'
                + '<label>' + VIS.Msg.getMsg("ToDate") + '</label><input id="VIS_ToDateInput_ID' + $self.AD_UserHomeWidgetID + '" class="vis-w-setSearchSize" type="date" placeholder="date"></div></div>'
                + '<div id="VIS_WorkflowWidgetDtls_ID' + $self.AD_UserHomeWidgetID + '" class="vis-w-workflow-homepage-activites" >'
                + '</div>'
                + '     </div>'
                + '          </div>'
                + '<div id = "workflowActivitys' + $self.AD_UserHomeWidgetID + '" class="vis-w-workflow-Activity h-100" style = "display: none;" >'
                + '    <div class="vis-w-workflowActivityContainer h-100">'
                + '        <div id="workflowActivityData_ID" class="vis-w-workflowActivityDataCls h-100">'
                + '          <div class="vis-w-Workflow-ScrollerVertical h-100">'
                + '                <div class="vis-w-workflowActivityDetails m-0 h-100" id="workflowActivityDetails' + $self.AD_UserHomeWidgetID + '">'
                + '                 </div>'
                + '   </div>';

            $root.append($workflowWidget);
            $fstMainDiv_ID = $root.find("#FstMainDiv" + $self.AD_UserHomeWidgetID);
            $countDiv_ID = $fstMainDiv_ID.find("#divfActivity" + $self.AD_UserHomeWidgetID);
            $workflowWidgetDtls_ID = $fstMainDiv_ID.find("#VIS_WorkflowWidgetDtls_ID" + $self.AD_UserHomeWidgetID);
            $cmbWindows = $fstMainDiv_ID.find("#VIS_CmbWindows_ID" + $self.AD_UserHomeWidgetID);
            $cmbAnswer = $fstMainDiv_ID.find("#VIS_AnswerCmb_ID" + $self.AD_UserHomeWidgetID);
            $workflowActivitys = $fstMainDiv_ID.find("#workflowActivitys" + $self.AD_UserHomeWidgetID);
            $welcomeScreenFeedsLists = $fstMainDiv_ID.find("#welcomeScreenFeedsLists" + $self.AD_UserHomeWidgetID);
            $row = $fstMainDiv_ID.find(".vis-w-welcomeScreenFeeds");
            $hlnkTabDataRef_ID = $fstMainDiv_ID.find("#hlnkTabDataRef" + $self.AD_UserHomeWidgetID);
            $wFSearchshow_ID = $fstMainDiv_ID.find("#WFSearchshow" + $self.AD_UserHomeWidgetID);
            $wFShowDetails_ID = $fstMainDiv_ID.find("#WFShowDetails" + $self.AD_UserHomeWidgetID);
            $fromDate_ID = $fstMainDiv_ID.find("#VIS_FromDate_ID" + $self.AD_UserHomeWidgetID);
            $toDate_ID = $fstMainDiv_ID.find("#VIS_ToDate_ID" + $self.AD_UserHomeWidgetID);
            $fromDateInput_ID = $fstMainDiv_ID.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID);
            $toDateInput_ID = $fstMainDiv_ID.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID);
        };
        //Get Widget 1st page data
        function getworkflowWidget(refresh, async) {
            showBusy(true);
            if ($cmbWindows.val() != null && $cmbWindows.val() != "") {
                windowID = $cmbWindows.val().split('_')[0];
                nodeID = $cmbWindows.val().split('_')[1];
            }
            else {
                windowID = "0";
                nodeID = "0";
            }
            if ($fstMainDiv_ID.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID).val() != '') {
                searchText = $fstMainDiv_ID.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID).val();
            }
            else {
                searchText = "";
            }
            if ($fstMainDiv_ID.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val() != null && $fstMainDiv_ID.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val() != '') {
                fromDate = $fstMainDiv_ID.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val();
            }
            else {
                fromDate = null;
            }
            if ($fstMainDiv_ID.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val() != null && $fstMainDiv_ID.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val() != '') {
                toDate = $fstMainDiv_ID.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val();
            }
            else {
                toDate = null;
            }
            $.ajax({
                url: VIS.Application.contextUrl + "WFActivity/GetActivities",
                data: { pageNo: pageNo, pageSize: PageSize, refresh: refresh, searchText: searchText, "AD_Window_ID": windowID, "dateFrom": fromDate, "dateTo": toDate, "AD_Node_ID": nodeID },//$self.windowNo
                //async: async,
                dataType: "json",
                type: "POST",
                error: function () {
                    showBusy(false);
                },
                success: function (dyndata) {
                    fulldata = [];
                    var reslt = JSON.parse(dyndata.result);
                    if (reslt) {
                        $fstMainDiv_ID.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID).val('');
                        $fstMainDiv_ID.find("#pnorecFound" + $self.AD_UserHomeWidgetID).css('display', 'none');
                        data = reslt.LstInfo;
                        maxCount = (data.length - 1);
                        $countDiv_ID.append(reslt.count);
                        for (var item in data) {
                            appendRecords(data, item);
                        }
                        if (async == true) {
                            loadWindows();
                        }
                        // Show the details icon only when there are workflow records
                        $wFShowDetails_ID.css('display', data.length > 0 ? 'inline-block' : 'none');
                        setTimeout(function () {
                            showBusy(false);
                        }, 200);

                    }
                    else {
                        data = null;
                        $countDiv_ID.append(0);
                        $workflowWidgetDtls_ID.append('<p id="pnorecFound' + $self.AD_UserHomeWidgetID + '" class="vis-NoRecordCls vis-a-pTagSetHeight">' + VIS.Msg.getMsg("NoRecordFound") + '</p>');// style="margin-top:12.5em; text-align:center; display:block;"
                        // Hide the details icon when there are no workflow records
                        $wFShowDetails_ID.css('display', 'none');
                        showBusy(false);
                    }
                }
            });

        };

        //Append Records
        function appendRecords(data, item) {
            fulldata.push(data[item]);
            var dataIem = {};
            var ChldDiv = null;
            ChldDiv = '<div class="vis-w-activityContainer" data-id="' + item + '">'
                + '<div class="vis-w-feedTitleBar">'
                + '<h3 class="vis-w-wfActivity-selectchk" ">' + VIS.Utility.encodeText(data[item].NodeName) + '</h3>'
                + '<div class="vis-w-feedTitleBar-buttons">'
                + '<ul><li class="vis-w-zoomClrChngCls"><a href="javascript:void(0)" id="zoomId' + $self.AD_UserHomeWidgetID + item + '" class="VIS_WfZoomCls" data-index="' + item + '" data-viswfazoom="wfZoom">'
                + '<i class= "vis vis-find" data-index="' + item + '" data-viswfazoom="wfZoom" ></i></a></li></ul></div></div>'
                + '<div id="VIS_FlipCard_ID' + $self.AD_UserHomeWidgetID + item + '" class="vis-w-feedDetails">'
                + '<pre class="vis-workflow-pre-cls" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">';
            var summry = null;
            if (data[item].DocumentNameValue == undefined || data[item].DocumentNameValue == '') {
                summry = VIS.Utility.encodeText(data[item].Summary);
                ChldDiv += ('' + summry + '');
            }
            else {
                summry = VIS.Utility.encodeText(data[item].DocumentNameValue + " - " + data[item].Summary);
                ChldDiv += ('' + summry + '');
            }
            var Priority = null;
            Priority = VIS.Msg.getMsg('Priority') + ': ' + data[item].Priority;
            var date = null;
            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

            ChldDiv += '\n' + Priority + '</pre><div class="vis-w-feedDateTime vis-secondary-clr" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">'
                + date + '</div></div></div>';

            dataIem.recordID = data[item].Record_ID;
            dataIem.wfActivityID = data[item].AD_WF_Activity_ID;
            dataItemDivs.push(dataIem);
            $workflowWidgetDtls_ID.append(ChldDiv);

            //New add 05/08/24
            //Zoom event
            $workflowWidgetDtls_ID.find("#zoomId" + $self.AD_UserHomeWidgetID + item).off('click');
            $workflowWidgetDtls_ID.find("#zoomId" + $self.AD_UserHomeWidgetID + item).on('click', function (e) {
                var id = $(this).data("index");
                zoom(id);
            });
            //Move to 2nd page event
            $flipCard_ID = $workflowWidgetDtls_ID.find("#VIS_FlipCard_ID" + $self.AD_UserHomeWidgetID + item);
            $flipCard_ID.off('click');
            $flipCard_ID.on('click', function (e) {
                $welcomeScreenFeedsLists.css('display', 'none');
                $row.css('display', 'none');
                getChld(e);
                $workflowActivitys.css('display', 'block').css('zindex', '2');
            });
        };

        //Get Windows name
        function loadWindows() {
            $.ajax({
                url: VIS.Application.contextUrl + "WFActivity/GetWorkflowWindows",
                dataType: "json",
                async: true,
                type: "POST",
                error: function () {
                    showBusy(false);
                    return;
                },
                success: function (result) {
                    if (result) {
                        result = JSON.parse(result);
                        var windowExist = false;
                        $cmbWindows.empty();
                        $cmbWindows.append('<option value="0_0">' + msgs.SelectWindow + '</option>');
                        if (result && result.length > 0) {
                            for (let i = 0; i < result.length; i++) {
                                $cmbWindows.append('<option value="' + result[i].AD_Window_ID + '_' + result[i].AD_Node_ID + '">' + result[i].WindowName + '</option>');
                                if (result[i].AD_Window_ID + '_' + result[i].AD_Node_ID == winNideID) {
                                    windowExist = true;
                                }
                            }
                            if (windowExist == true) {
                                $cmbWindows.val(winNideID);
                            }
                            else {
                                winNideID = "0_0";
                                $cmbWindows.val("0_0");
                            }
                        }
                        else {
                            winNideID = "0_0";
                            $cmbWindows.val("0_0");
                        }
                        $('#WFWorkflowModal' + $self.AD_UserHomeWidgetID + 'WindowSelect').empty();
                        $cmbWindows.find('option').each(function () {
                            $('#WFWorkflowModal' + $self.AD_UserHomeWidgetID + 'WindowSelect').append($(this).clone());
                        });
                        $('#WFWorkflowModal' + $self.AD_UserHomeWidgetID + 'WindowSelect').val($cmbWindows.val());
                    }
                }
            });
        };
        //Get more data on Scroll 
        function loadOnScroll(e) {
            // do something

            if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.99) && scrollWF) {//Condition true when 99 scroll is done
                showBusy(true);
                scrollWF = false;
                var tabdataLastPage = parseInt($countDiv_ID.html());
                var tabdatacntpage = pageNo * PageSize;
                if (tabdatacntpage <= tabdataLastPage) {
                    pageNo += 1;
                    appendRecord(pageNo, PageSize);
                }
                else {
                    refresh = true;
                    scrollWF = true;
                    showBusy(false);
                }
                e.stopPropagation();
            }
        };
        //Get more data on Scroll
        function appendRecord(pageNo, paeSize, refresh) {
            if (!refresh) {
                refresh = false;
            }
            if ($cmbWindows.val() != null && $cmbWindows.val() != "") {
                //var cmbValues = $cmbWindows.val();
                windowID = $cmbWindows.val().split('_')[0];
                //var windowName = $cmbWindows.val().split('_')[1];
                nodeID = $cmbWindows.val().split('_')[1];
            }
            else {
                windowID = "0";
                nodeID = "0";
            }
            if ($root.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID).val() != '') {
                searchText = $root.find('#homeSearchWorkflow' + $self.AD_UserHomeWidgetID).val();
            }
            else {
                searchText = "";
            }
            if ($root.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val() != null && $root.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val() != '') {
                fromDate = $root.find("#VIS_FromDateInput_ID" + $self.AD_UserHomeWidgetID).val();
            }
            else {
                fromDate = null;
            }
            if ($root.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val() != null && $root.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val() != '') {
                toDate = $root.find("#VIS_ToDateInput_ID" + $self.AD_UserHomeWidgetID).val();
            }
            else {
                toDate = null;
            }

            $.ajax({
                url: VIS.Application.contextUrl + "WFActivity/GetActivities",
                data: { pageNo: pageNo, pageSize: paeSize, refresh: refresh, searchText: searchText, "AD_Window_ID": windowID, "dateFrom": fromDate, "dateTo": toDate, "AD_Node_ID": nodeID },
                dataType: "json",
                type: "POST",
                error: function () {
                    refresh = true;
                    showBusy(false);
                },
                success: function (dyndata) {
                    var reslt = JSON.parse(dyndata.result);
                    if (reslt) {
                        data = reslt.LstInfo;
                        for (var item in data) {
                            fulldata.push(data[item]);
                            maxCount += 1;
                            var dataIem = {};
                            var ChldDiv = null;
                            ChldDiv = '<div class="vis-w-activityContainer vis-w-activityContainerDiv" data-id="' + maxCount + '">'
                                + '<div class="vis-w-feedTitleBar" >'
                                + '<h3 class="vis-w-wfActivity-selectchk vis-selectchkDiv">' + VIS.Utility.encodeText(data[item].NodeName) + '</h3>'
                                + '<div class="vis-w-feedTitleBar-buttons">'
                                + '<ul><li class="vis-w-zoomClrChngCls"><a href="javascript:void(0)" id="zoomId' + $self.AD_UserHomeWidgetID + maxCount + '" class="VIS_WfZoomCls" data-index="' + maxCount + '" data-viswfazoom="wfZoom">'
                                + '<i class= "vis vis-find" data-index="' + maxCount + '" data-viswfazoom="wfZoom" ></i></a></li></ul></div></div>'
                                + '<div id="VIS_FlipCard_ID' + $self.AD_UserHomeWidgetID + maxCount + '" class="vis-w-feedDetails">'
                                + '<pre class="vis-workflow-pre-cls" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + maxCount + '">';
                            var summry = null;
                            if (data[item].DocumentNameValue == undefined || data[item].DocumentNameValue == '') {
                                summry = VIS.Utility.encodeText(data[item].Summary);
                                ChldDiv += ('' + summry + '');
                            }
                            else {
                                summry = VIS.Utility.encodeText(data[item].DocumentNameValue + " - " + data[item].Summary);
                                ChldDiv += ('' + summry + '');
                            }
                            var Priority = null;
                            Priority = VIS.Msg.getMsg('Priority') + ': ' + data[item].Priority;
                            var date = null;
                            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

                            ChldDiv += '\n' + Priority + '</pre><div class="vis-w-feedDateTime" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">'
                                + date + '</div></div></div>';
                            //+ '<br>' + date + '</div></div></div>';
                            dataIem.recordID = data[item].Record_ID;
                            dataIem.wfActivityID = data[item].AD_WF_Activity_ID;
                            dataItemDivs.push(dataIem);
                            $workflowWidgetDtls_ID.append(ChldDiv);
                            //New add 05/08/24
                            //Zoom event
                            $workflowWidgetDtls_ID.find("#zoomId" + $self.AD_UserHomeWidgetID + maxCount).off('click');
                            $workflowWidgetDtls_ID.find("#zoomId" + $self.AD_UserHomeWidgetID + maxCount).on('click', function (e) {
                                var id = $(this).data("index");
                                zoom(id);
                            });
                            //Move to 2nd page event
                            $flipCard_ID = $workflowWidgetDtls_ID.find("#VIS_FlipCard_ID" + $self.AD_UserHomeWidgetID + maxCount);
                            $flipCard_ID.off('click');
                            $flipCard_ID.on('click', function (e) {
                                $welcomeScreenFeedsLists.css('display', 'none');
                                $row.css('display', 'none');
                                getChld(e);
                                $workflowActivitys.css('display', 'block').css('zindex', '2');
                            });
                        }
                        scrollWF = true;
                        showBusy(false);
                    }
                    else {
                        showBusy(false);
                    }
                }
            });
        };
        //Get Cheild Records
        function getChld(e) {
            showBusy(true);
            //var id = $workflowWidget.find('.vis-activityContainer').attr('data-id');
            if (e.target.hasAttribute("data-ids")) {
                let ids = e.target.getAttribute('data-ids');
                let AD_Node_ID = e.target.getAttribute("data-ids").split('_')[1];
                let wfActivityID = e.target.getAttribute("data-ids").split('_')[2];
                let index = e.target.getAttribute("data-ids").split('_')[3];
                $addDetails_ID.empty();
                $.ajax({
                    url: VIS.Application.contextUrl + "WFActivity/GetActivityInfo",
                    async: true,
                    dataType: "json",
                    type: "POST",
                    data: {
                        activityID: wfActivityID,
                        nodeID: AD_Node_ID,
                        wfProcessID: fulldata[index].AD_WF_Process_ID
                    },
                    error: function () {
                        showBusy(false);
                        return;
                    },
                    success: function (res) {
                        loadDetail(wfActivityID, index, res.result);
                        showBusy(false);
                    }
                });
            }
        };
        //Create Child Record design 
        function loadDetail(wfActivityID, index, info) {
            var detailCtrl = {};
            lstDetailCtrls = [];
            detailCtrl.Index = index;
            var docnameval;
            divDetail.empty();
            var divWorkflowActivity = null;
            var divWorkflowChecklist = null;
            var btnCheckList = null;

            var divHeader = $("<div class='vis-w-workflowActivityDetails-Heading'>");
            divDetail.append(divHeader);

            var hHeader = $("<div id='VIS_backBtn_ID" + $self.AD_UserHomeWidgetID + "' style='cursor: pointer;' title='Back Window' class='vis vis-arrow-left'></div><h3 class='vis-workflow-h2-cls vis-w-txtBold ml-2 mb-0'>" + VIS.Msg.getMsg('Detail') + "</h3>");
            divHeader.append(hHeader);

            if (info.AttachmentCount > 0) {
                //  li1.append("<pre class='vis-preCls'>" + VIS.Msg.getMsg('Attachment') + " : " + VIS.Msg.getMsg('Yes') + "</pre>");
                divHeader.append(attachIconHtml);
            }

            // if  any checkbox is checked, then don't show History in middle panel.
            if (selectedItems.length <= 1) {
                btnCheckList = $("<a href='javascript:void(0)' class='vis-btn-widgetzoom mr-1' data-id='" + index + "'>" + VIS.Msg.getMsg('CheckList') + "</a>");// style='padding-left: 0.625em;padding-right: 0.625em;padding-top: 0.125em;padding-bottom: 0.125em;'
                if (info.IsSurveyResponseRequired) {
                    divHeader.append(btnCheckList);
                }
                if (info.ColName == 'VADMS_SignStatus') {

                    docnameval = fulldata[index].DocumentNameValue.split('_');

                    var docno = {
                        DocumentNo: parseInt(docnameval[docnameval.length - 1])
                    };

                    var folderofDoc = '';
                    // Get certificate status
                    $.post(VIS.Application.contextUrl + 'VADMS/Document/GetFolderID', docno, function (res) {
                        if (res && res.result != '' && !res.result.contains('ERR-') && !res.result.contains('F')) {
                            folderofDoc = parseInt(res.result);
                        }
                        else {
                            VIS.ADialog.error(VIS.Msg.getMsg("VA055_FolderNotFound"));
                        }
                    }, 'json').fail(function (jqXHR, exception) {
                        VIS.ADialog.error(exception);
                    });

                    var formName = {
                        FromName: 'VADMS_DMSWeb'
                    };

                    var formID = '';
                    // Get certificate status
                    $.post(VIS.Application.contextUrl + 'VADMS/Document/GetFormID', formName, function (res) {
                        if (res && res.result != '') {
                            formID = res.result;
                        }
                        else {
                            VIS.ADialog.error(VIS.Msg.getMsg("VA055_FormNotFound"));
                        }
                    }, 'json').fail(function (jqXHR, exception) {
                        VIS.ADialog.error(exception);
                    });

                    // Dms Zoom
                    var aZoomDMS = $("<a href='javascript:void(0)' class='vis-btn-widgetzoom' data-id='" + docnameval[docnameval.length - 1] + "'>");// style='margin-left:0.625em;'
                    aZoomDMS.append($("<span class='vis-btn-ico vis vis-find'>"));
                    divHeader.append(aZoomDMS);

                    aZoomDMS.on(VIS.Events.onTouchStartOrClick, function (e) {
                        var id = $(this).data("id");

                        var $additionalInfo = {
                            DocNo: id,
                            DocFolderID: folderofDoc
                        };
                        if (formID > 0) {
                            VIS.viewManager.startForm(formID, $additionalInfo);
                        }
                        else {

                        }
                    });
                }
                else {
                    var aZoom = $("<a href='javascript:void(0)' class='vis-btn-widgetzoom' data-id='" + index + "'>");
                    aZoom.append($("<span class='vis-btn-ico vis vis-find'>"));
                    divHeader.append(aZoom);
                    aZoom.on(VIS.Events.onTouchStartOrClick, function (e) {
                        var id = $(this).data("id");
                        zoom(id);
                    });
                }
            }

            divHeader.append($("<div class='clearfix'>"));
            divWorkflowActivity = $("<div class='divWorkflowActivity text-left'>");// style='height:calc(100% - 3.125em)'
            divWorkflowChecklist = $("<div class='divWorkflowChecklist' style='display:none'></div>");
            divDetail.append(divWorkflowActivity);
            divDetail.append(divWorkflowChecklist);

            //divWorkflowActivity.append($bsyDiv);

            var ul = $("<ul class='vis-w-IIColumnContent'>");
            divWorkflowActivity.append(ul);

            var li1 = $("<li>");
            li1.css('width', '100%');
            var p1 = $("<p class='vis-workflow-p-cls'>");
            p1.append(VIS.Msg.getMsg('Node'));
            // p1.append($("<br>"));
            p1.append(" : " + VIS.Utility.encodeText(fulldata[index].NodeName));
            li1.append(p1);
            ul.append(li1);


            //if (info.AttachmentCount > 0) {
            //    li1.append("<pre class='vis-preCls'>" + VIS.Msg.getMsg('Attachment') + " : " + VIS.Msg.getMsg('Yes') + "</pre>");
            //}

            // if  any checkbox is checked, then don't show summary in middle panel.
            if (selectedItems.length <= 1) {
                var p2 = $("<pre class='mb-2'>");
                p2.css('margin-top', '0.3125em');
                p2.css('margin-bottom', '0.3125em');
                p2.css('font-size', '0.875em');
                p2.css('font-family', 'NoirPro-Regular');
                p2.css('color', 'inherit');
                p2.css('white-space', 'pre-wrap');
                //p2.append(VIS.Msg.getMsg('Summary'));
                //p2.append($("<br>"));

                p2.append(VIS.Utility.encodeText(fulldata[index].Summary));
                li1.append(p2);
            }

            divWorkflowActivity.append($("<div class='clearfix'>"));

            var hDesc = $("<p class='mb-0'>");
            hDesc.append(VIS.Msg.getMsg('Description'));
            divWorkflowActivity.append(hDesc);
            var pDesc = $("<p>");
            pDesc.append(VIS.Utility.encodeText(fulldata[index].Description));
            divWorkflowActivity.append(pDesc);

            divWorkflowActivity.append($("<div class='clearfix'>"));

            var hHelp = $("<p class='mb-0'>");
            //hHelp.append($("<span class='vis-workflowActivityIcons vis-icon-help'>"))
            hHelp.append(VIS.Msg.getMsg('Help'));
            divWorkflowActivity.append(hHelp);
            var pHelp = $("<p>");
            pHelp.append(VIS.Utility.encodeText(fulldata[index].Help));
            divWorkflowActivity.append(pHelp);

            divWorkflowActivity.append($("<h3 class='vis-w-ActionHeadingCls'>").append(VIS.Msg.getMsg('Action')));
            divWorkflowActivity.append($("<div class='clearfix'>"));

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
                var ansBtn = $('<button class="VIS_Pref_pass-btn vis-btnCls" data-id="' + index + '" data-window="' + info.AD_Window_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                detailCtrl.AnswerCtrl = ansBtn;
                divAP.append(ansBtn);
                ansBtn.on('click', function () {

                    ansBtnClick($(this).data("id"), $(this).data("window"), $(this).data("col"));
                });
                detailCtrl.Action = 'W';
            }
            else if (info.NodeAction == 'X') {
                var ansBtn = $('<button class="VIS_Pref_pass-btn vis-xBtnCls" data-id="' + index + '" data-form="' + info.AD_Form_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                detailCtrl.AnswerCtrl = ansBtn;
                divAP.append(ansBtn);
                ansBtn.on('click', function () {
                    VIS.viewManager.startForm($(this).data("form"));
                });
                detailCtrl.Action = 'X';
            }


            var aOkA = $("<a href='javascript:void(0)'  style='display:none' id='vis-home-wf-ansOK' class='vis-btn vis-btn-done vis-w-icon-doneButton vis-w-workflowActivityIcons' data-clicked='N' data-id='" + index + "'>");
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

                    showBusy(true);
                    $.post(VIS.Application.contextUrl + 'VADMS/Document/SignatureUsingWorkflow', signData, function (res) {
                        if (res && res != 'null' && res.result == 'success') {
                            adjust_size();
                            lstDetailCtrls = [];
                            selectedItems = [];
                            showBusy(false);
                        }
                        else {
                            aOk.data('clicked', 'N');
                            showBusy(false);
                            VIS.ADialog.error(res.result);
                        }

                    }, 'json').fail(function (jqXHR, exception) {
                        showBusy(false);
                        aOk.data('clicked', 'N');
                        showBusy(false);
                        VIS.ADialog.error(exception);
                    });
                }
                else {
                    var id = $(aOk).data("id");
                    approveIt(id, aOk);
                    showBusy(false);
                }
            };
            //Given Approve
            var approveIt = function (index, aOK) {
                var aOK = aOK;
                showBusy(true);
                for (var item in lstDetailCtrls) {
                    try {
                        if (index === parseInt(lstDetailCtrls[item].Index)) {
                            var fwdTo = lstDetailCtrls[item].FwdCtrl.getValue();
                            var msg = VIS.Utility.encodeText(lstDetailCtrls[item].MsgCtrl.val());
                            var answer = null;
                            if (lstDetailCtrls[item].Action == 'C') {
                                var answer = lstDetailCtrls[item].AnswerCtrl.getValue();

                            }
                            var activitIDs = "";
                            // if checkbox is selected, then join activity ID using comma splitter.
                            if (selectedItems && selectedItems.length > 0) {
                                for (var k = 0; k < selectedItems.length; k++) {
                                    if (activitIDs.length > 0) {
                                        activitIDs += ",";
                                    }
                                    activitIDs += selectedItems[k].split("_")[2];
                                }
                            }
                            else {
                                activitIDs = fulldata[index].AD_WF_Activity_ID;
                            }

                            // set window ID of activity
                            windowID = fulldata[index].AD_Window_ID;
                            showBusy(true);
                            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "WFActivity/ApproveIt",
                                { "activityID": activitIDs, "nodeID": fulldata[index].AD_Node_ID, "txtMsg": msg, "fwd": fwdTo, "answer": answer, "AD_Window_ID": windowID }, function apprvoIt(info) {
                                    if (info.result == '') {
                                        aOK.data('clicked', 'N');
                                        adjust_size();
                                        lstDetailCtrls = [];
                                        selectedItems = [];
                                        showBusy(false);
                                    }
                                    else {
                                        VIS.ADialog.error(info.result);
                                        aOK.data('clicked', 'N');
                                        showBusy(false);
                                    }
                                });
                            break;
                        }
                        showBusy(false);
                    }
                    catch (e) {
                        showBusy(false);
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
            var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.Search, "AD_User_ID", 0, false, "AD_User.IsLoginUser='Y' AND AD_User.IsActive='Y'");
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

            var aOkF = $("<a href='javascript:void(0)' style='display:none' id='vis-home-wf-forOK' class='vis-btn vis-btn-done vis-w-icon-doneButton vis-w-workflowActivityIcons' data-clicked='N' data-id='" + index + "'>");
            aOkF.append($("<span class='vis vis-markx'>"));

            //aOkF.append(VIS.Msg.getMsg('Done'));

            divFInpt.append($('<div class="vis-w-home-wf-forwardBtn">').append(aOkF));

            divWorkflowActivity.append(ulA);
            divWorkflowActivity.append($("<div class='clearfix'>"));

            //divWorkflowActivity.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
            divWorkflowActivity.append($("<div class='clearfix'>"));



            var divMsg = $("<div class='vis-control-wrap'>");
            divMsg.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
            var msg = $("<textarea class='vis-w-workflow-textarea' placeholder='" + VIS.Msg.getMsg('TypeMessage') + "....'>");
            detailCtrl.MsgCtrl = msg;
            divMsg.append(msg);
            divMsg.append($("<div class='clearfix'>"));

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

            // if  any checkbox is checked, then don't show History in middle panel.
            if (selectedItems.length <= 1) {

                divWorkflowActivity.append($("<h3 id='HistoryMain_ID" + $self.AD_UserHomeWidgetID + "'class='vis-w-ActionHeadingCls' style='cursor:pointer;'>").append(VIS.Msg.getMsg('ViewHistoryRecord')
                    + "<div class='historyArrow' id='VIS_DownArrowID_" + $self.AD_UserHomeWidgetID + "' style='display:none;'><span class='vis vis-arrow-down'></span></div>"
                    + "<div class='historyArrow' id='VIS_UpArrowID_" + $self.AD_UserHomeWidgetID + "' style='display:block;'><span class='vis vis-arrow-up'></span></div>"));
                divWorkflowActivity.append($("<div class='clearfix'>"));

                var divHistory = $("<div id='History_ID" + $self.AD_UserHomeWidgetID + "' class='vis-history-wrap' style='display: block;'>");
                divWorkflowActivity.append(divHistory);
                historyDivShow = false;
                $workflowActivitys.find("#HistoryMain_ID" + $self.AD_UserHomeWidgetID).on("click", function () {
                    if (historyDivShow == true) {
                        $(divWorkflowActivity).find("#VIS_DownArrowID_" + $self.AD_UserHomeWidgetID).css('display', 'none');
                        $(divWorkflowActivity).find("#VIS_UpArrowID_" + $self.AD_UserHomeWidgetID).css('display', 'block');
                        $(divWorkflowActivity).find("#History_ID" + $self.AD_UserHomeWidgetID).css('display', 'block');
                        historyDivShow = false;
                    }
                    else {
                        $(divWorkflowActivity).find("#VIS_DownArrowID_" + $self.AD_UserHomeWidgetID).css('display', 'block');
                        $(divWorkflowActivity).find("#VIS_UpArrowID_" + $self.AD_UserHomeWidgetID).css('display', 'none');
                        $(divWorkflowActivity).find("#History_ID" + $self.AD_UserHomeWidgetID).css('display', 'none');
                        historyDivShow = true;
                    }
                });

                if (info.Node != null) {
                    var divHistoryNode = $("<div class='vis-workflow-historyCls'>");

                    for (node in info.Node) {

                        if (info.Node[node].History != null) {
                            for (hNode in info.Node[node].History) {

                                if (info.Node[node].History[hNode].State == 'CC' && node < (info.Node.length - 1)) {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divAppBy = $("<div class='vis-approved_wrap'>");
                                    divAppBy.append("<div class='vis-ApproveCircleCls'><i class='vis vis-markx' ></i></div>");
                                    var nodename = '';
                                    nodename = info.Node[node].Name;



                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (info.Node[node].History[hNode].TextMsg.length > 0) {                                      
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip vis-aTagCls'>").append("<i class='vis vis-info' data-toggle='tooltip' data-placement='bottom' title='" + VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg) + "'></i>");
                                        //var span = $("<span>");
                                        //span.append($("<img class='VIS_Pref_callout'>").attr('src', VIS.Application.contextUrl + "Areas/VIS/Images/ccc.png").append("ToolTip Text"));
                                        //span.append($("<label class='VIS_Pref_Label_Font'>").append(VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg)));
                                        //btnDetail.append(span);
                                        divLeft.append(btnDetail);
                                    }
                                    divLeft.append(nodename);
                                    divAppBy.append(divLeft);
                                    var divRight = $("<div class='vis-right-part'>");
                                    divRight.append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(info.Node[node].History[hNode].ApprovedBy));
                                    divAppBy.append(divRight);
                                    divHistoryNode.append(divAppBy);

                                }
                                else if (info.Node[node].History[hNode].State == 'BK') {
                                    continue;
                                }
                                else if ((node < (info.Node.length - 1)) || info.Node.length == 1) {
                                    var divAppBy = $("<div class='vis-pending_wrap' >");
                                    divAppBy.append($("<div class='vis-left-part'>").append(info.Node[node].Name));
                                    divAppBy.append($("<div class='vis-right-part'>").append(VIS.Msg.getMsg('Pending')));
                                    divHistoryNode.append(divAppBy);
                                    //divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='/ViennaAdvantageWeb/Areas/VIS/Images/home/4.jpg'>")));
                                }
                                else {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divStart = $("<div class='vis-start_wrap vis-workflow-startCls'>");


                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (info.Node[node].History[hNode].TextMsg.length > 0) {
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip vis-aTagCls'>").append("<i class='vis vis-info' data-toggle='tooltip' data-placement='bottom' title='" + VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg) + "'></i>");
                                        //var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip' style='margin-right:5px'>").append($("<img class='VIS_Pref_img-i'>").attr("src", VIS.Application.contextUrl + "Areas/VIS/Images/i.png"));
                                        //var span = $("<span >");
                                        //span.append($("<img class='VIS_Pref_callout'>").attr('src', VIS.Application.contextUrl + "Areas/VIS/Images/ccc.png").append("ToolTip Text"));
                                        //span.append($("<label class='VIS_Pref_Label_Font'>").append(VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg)))
                                        //btnDetail.append(span);

                                        divLeft.append(btnDetail);
                                    }
                                    divLeft.append(info.Node[node].Name);

                                    divStart.append(divLeft);
                                    var divRight = $("<div class='vis-right-part'>");
                                    divRight.append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(info.Node[node].History[hNode].ApprovedBy));
                                    //divRight.append(btnDetail);
                                    divStart.append(divRight);
                                    // divStart.append($("<div class='vis-right-part'>").append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(info.Node[node].History[hNode].ApprovedBy)));
                                    divHistoryNode.append(divStart);
                                }
                            }
                            divHistory.append(divHistoryNode);
                        }


                    }
                }
            }
            btnCheckList.off().click(function () {

                divWorkflowChecklist.html('');
                if ($(this).text() != "Back") {
                    $(this).text(VIS.Msg.getMsg('Back'));
                    divDetail.find(".vis-w-workflowActivityDetails-Heading h3").text(VIS.Msg.getMsg('CheckList'));
                    var sPanel = new VIS.SurveyPanel();
                    sPanel.init();
                    var rt = sPanel.getRoot();
                    divWorkflowChecklist.html('');
                    sPanel.panelDetails(fulldata[index].AD_Window_ID, 0, fulldata[index].AD_Table_ID, fulldata[index].Record_ID, rt, fulldata[index].AD_WF_Activity_ID);
                    divWorkflowChecklist.append(rt);
                } else {
                    divDetail.find(".vis-w-workflowActivityDetails-Heading h3").text(VIS.Msg.getMsg('Detail'));
                    $(this).text(VIS.Msg.getMsg('CheckList'));
                }

                divWorkflowActivity.toggle(700);

                if (divWorkflowChecklist.is(":hidden")) {
                    divWorkflowChecklist.show();
                } else {
                    divWorkflowChecklist.hide();
                }


            });
            $workflowActivitys.find("#VIS_backBtn_ID" + $self.AD_UserHomeWidgetID).on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });

            $workflowActivitys.on('click', function (e) {
                // Check if the click is outside the workflow activity and dropdown
                if (/*!$(e.target).closest($workflowActivitys).length  &&*/ !$(e.target).closest('#ListContainer').length) {
                    $('#ListContainer').hide();
                    $workflowActivitys.find('.vis-wfw-attachClip').removeClass('vis-wfw-attachClip-active');
                }
            });
            $workflowActivitys.find('.vis-wfw-attachClip').on("click", function (e) {

                e.preventDefault();
                e.stopPropagation();
                let activeEle = $(this);

                /*  $workflowActivitys.find('.vis-wfw-attachment-dropdown').show();*/
                var $listContainer = $('#ListContainer');
                // Toggle dropdown visibility
                if ($listContainer.is(':visible')) {
                    activeEle.removeClass('vis-wfw-attachClip-active');
                    $listContainer.hide();
                    return;
                }
                showBusy(true);
                // Fetch attachments
                $.ajax({
                    url: VIS.Application.contextUrl + "Attachment/GetAttachment",
                    dataType: "json",
                    data: {
                        AD_Table_ID: fulldata[index].AD_Table_ID,
                        Record_ID: fulldata[index].Record_ID
                    },
                    error: function () {
                        VIS.ADialog.info('ERRORGettingAttachment');
                        $listContainer.hide();
                    },
                    success: function (data) {
                        showBusy(false);
                        var locations = data.result.FLocation;
                        var attachments = data.result.Attachment;
                        // Get actual attachment records
                        if (attachments && attachments._lines) {
                            attachments = attachments._lines;
                        } else {
                            attachments = [];
                        }
                        if (!locations || attachments.length === 0) {
                            VIS.ADialog.info('ERRORGettingAttachment');
                            $listContainer.hide();
                            return;
                        }
                        var $ul = $('<ul class="attachment-list" style="list-style: none; padding-left: 0; margin: 0;"></ul>');

                        attachments.forEach(function (attachment, i) {
                            var fileName = attachment.FileName || 'Attachment ' + (i + 1);
                            var fileUrl = locations[i];
                            var docFileType = (attachment.Filetype || '').replace(/^\./, '').toUpperCase();
                            // Default icon class and color
                            var docExtClass = 'vis-doc-blank';
                            var docExtColor = 'rgba(var(--v-c-primary), 1)';
                            // Set icon class and color based on file type
                            if (['DOCX', 'DOC'].includes(docFileType)) {
                                docExtClass = 'vis vis-doc-word';
                                docExtColor = '#0069a8';
                            } else if (docFileType === 'PDF') {
                                docExtClass = 'vis vis-doc-pdf';
                                docExtColor = '#c1272d';
                            } else if (['PPT', 'PPTX'].includes(docFileType)) {
                                docExtClass = 'vis vis-doc-pp';
                                docExtColor = 'orange';
                            } else if (['XLS', 'XLSX', 'CSV'].includes(docFileType)) {
                                docExtClass = 'vis vis-doc-excel';
                                docExtColor = '#39b54a';
                            } else if (['ODP', 'ODS', 'ODT'].includes(docFileType)) {
                                docExtClass = 'vis vis-doc-blank';
                                docExtColor = 'rgba(var(--v-c-primary), 1)';
                            } else if (docFileType === 'TEXT' || docFileType === 'TXT') {
                                docExtClass = 'vis vis-doc-text';
                                docExtColor = '#a9abae';
                            } else if (['PNG', 'JPG', 'JPEG'].includes(docFileType)) {
                                docExtClass = 'vis vis-doc-img';
                                docExtColor = '#00afef';
                            }
                            // HTML element
                            /*  var $li = $(`
        <li class="vis-wfw-attachment-item">
          <i class="${docExtClass}" style="color: ${docExtColor}; font-size: 20px; margin-right: 8px;" aria-hidden="true"></i>
          <a href="${fileUrl}" target="_blank" title="${fileName}" class="vis-wfw-attachment-link">
            ${fileName}
          </a>
          <i class="vis vis-download vis-wfw-download-icon" title="Download" data-url="${fileUrl}" data-filename="${fileName}" aria-hidden="true"></i>
        </li>
      `);*/
                            var $li = $(`
  <li class="vis-wfw-attachment-item">
    <i class="${docExtClass}" style="color: ${docExtColor}; font-size: 20px; margin-right: 8px;" aria-hidden="true"></i>
    <span title="${fileName}" class="vis-wfw-attachment-link">
      ${fileName}
    </span>
    <i class="vis vis-download vis-wfw-download-icon" title="Download" data-url="${fileUrl}" data-filename="${fileName}" aria-hidden="true"></i>
  </li>
`);
                            activeEle.addClass('vis-wfw-attachClip-active');
                            $ul.append($li);
                        });
                        $listContainer.html($ul).show();
                        // 🔽 Download click event
                        $listContainer.find('.vis-wfw-download-icon').on('click', function () {
                            var $icon = $(this);
                            var fileUrl = $icon.data('url');
                            var fileName = $icon.data('filename');
                            var idx = $icon.closest('li').index(); // Get the index of the clicked item
                            var actionOrigin = VIS.ProcessCtl.prototype.ORIGIN_WINDOW;
                            if (!$self.isWindowAction) {
                                actionOrigin = VIS.ProcessCtl.prototype.ORIGIN_FORM;
                            }
                            showBusy(true);
                            $.ajax({
                                url: VIS.Application.contextUrl + "Attachment/DownloadAttachment",
                                dataType: "json",
                                data: {
                                    fileName: data.result.Attachment._lines[idx].FileName,
                                    AD_Attachment_ID: data.result.Attachment.AD_Attachment_ID,
                                    AD_AttachmentLine_ID: data.result.Attachment._lines[idx].Line_ID,
                                    actionOrigin: actionOrigin,
                                    originName: VIS.context.getWindowContext($self.windowNo, "WindowName"),
                                    AD_Table_ID: fulldata[index].AD_Table_ID,
                                    recordID: fulldata[index].Record_ID
                                },
                                error: function () {
                                    VIS.ADialog.info('ERRORGettingFile');
                                    showBusy(false);
                                },
                                success: function (res) {
                                    var d = new Date();
                                    var filePath = res.result;
                                    var fileName = data.result.Attachment._lines[idx].FileName;
                                    var url = VIS.Application.contextUrl + "TempDownload/" + filePath + "/" + fileName + "?" + d.getTime();
                                    showBusy(false);
                                    var a = document.createElement('a');
                                    a.href = url;
                                    a.download = fileName; // This forces the browser to download the file
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }
                            });
                        });
                    }
                });
            });
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
                    async: true,
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


        //Go to home page and refresh page
        var adjust_size = function () {
            showBusy(true);
            $countDiv_ID.empty();
            $workflowWidgetDtls_ID.empty();
            pageNo = 1;
            getworkflowWidget(true, false);
            //loadWindows();


            $workflowActivitys.css('display', 'none').css('zindex', '2');
            $welcomeScreenFeedsLists.css('display', 'block');
            $row.css('display', 'block');
            //$workflowWidgetDtls_ID.find(".vis-w-feedDetails").on('click', function (e) {
            //    showBusy(true);
            //    getChld(e);
            //    showBusy(false);
            //    $welcomeScreenFeedsLists.css('display', 'none');
            //    $row.css('display', 'none');
            //    $workflowActivitys.css('display', 'block').css('zindex', '2');
            //});
            $backBtn_ID.on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
            showBusy(false);
        };
        var zoom = function (index) {
            //window id
            VIS.AEnv.wfzoom(fulldata[index].AD_Table_ID, fulldata[index].Record_ID, fulldata[index].AD_WF_Activity_ID);
        };
        //Search Function
        function searchFunction() {
            showBusy(true);
            $countDiv_ID.empty();
            $workflowWidgetDtls_ID.empty();
            pageNo = 1;
            getworkflowWidget(true, false);
            //loadWindows();
            //$workflowWidgetDtls_ID.find(".vis-w-feedDetails").on('click', function (e) {
            //    $welcomeScreenFeedsLists.css('display', 'none');
            //    $row.css('display', 'none');
            //    $workflowActivitys.css('display', 'block').css('zindex', '2');
            //});
            $backBtn_ID.on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
            $workflowWidgetDtls_ID.scrollTop(0);
            showBusy(false);
        };

        var ansBtnClick = function (index, AD_Window_ID, columnName) {
            var zoomQuery = new VIS.Query();
            zoomQuery.addRestriction(columnName, VIS.Query.prototype.EQUAL, fulldata[index].Record_ID);
            VIS.viewManager.startWindow(AD_Window_ID, zoomQuery);
        };

        //Refresh Widget
        this.refreshWidget = function () {           
            $countDiv_ID.empty();
            $workflowWidgetDtls_ID.empty();
            pageNo = 1;
            getworkflowWidget(true, false);
            $workflowWidgetDtls_ID.find(".vis-w-feedDetails").on('click', function (e) {
                $welcomeScreenFeedsLists.css('display', 'none');
                $row.css('display', 'none');
                $workflowActivitys.css('display', 'block').css('zindex', '2');
            });
            $backBtn_ID.on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
            $workflowWidgetDtls_ID.scrollTop(0);
        };

        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };
        //Dispose function
        this.disposeComponent = function () {
            $('#WFWorkflowModal' + $self.AD_UserHomeWidgetID).remove();
            $root.remove();
        };
    }
    VIS.WorkflowWidget.prototype.refreshWidget = function () {

    };
    /* init method called on loading a form . */
    VIS.WorkflowWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.windowNo = windowNo;
        this.AD_UserHomeWidgetID = frame.widgetInfo.AD_UserHomeWidgetID;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.WorkflowWidget.prototype.widgetSizeChange = function (height, width) {

    };

    //Must implement dispose
    VIS.WorkflowWidget.prototype.dispose = function () {
        this.disposeComponent();
        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);
