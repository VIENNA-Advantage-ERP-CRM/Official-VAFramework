VIS = window.VIS || {};
(function () {

    function HistoryDetailsTabPanel() {
        this.record_ID = 0;
        this.windowNo = 0;
        this.table_ID = 0;
        this.frame;
        this.curTab = null;
        this.selectedRow = null;
        this.panelWidth;
        var $self = this;
        var $root = $('<div class="VIS-root-div"></div>');
        var $html, $rootcontent, $htmlcontent, $printhtml, $footerhtml, $paginghtml, $commentshtml;
        var $tpdataloader;
        var PAGESIZE = 10;
        var currentPage = 0;
        var prevPage = 0;
        var nextPage = 0;
        var totalPages = 0;
        var totalRecords = 0;
        var selectedPage = 0;
        var _selectedId = 0;
        var _selectedRecId = 0;
        var historyRecords;
        var _curPageRecords = 0;
        var tableID = 0;
        var window_No = 0;
        var $lblTaskMsg = null;
        var taskClosed;
        var userAccountID = 0;

        function setContentHeight(fromRoot) {
            var $outerwrap = $root.closest(".vis-ad-w-p-ap-tp-outerwrap");
            var $divHead = $outerwrap.find('.vis-ad-w-p-ap-tp-o-b-head');
            var $divContent = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-content");
            var outerwrapheight = $outerwrap.height();
            var divHeadheight = $divHead.height() + 40;
            var divContentheight = $divContent.height();
            $divContent.css("height", (outerwrapheight - divHeadheight));
            var pagingHtmlheight = $('#VIS_pagingHtml' + window_No).height() + 10;

            if ($('#VIS_recordDetail' + window_No).is(':visible')) {
                $('#VIS_recordDetail' + window_No).css("height", ((outerwrapheight - divHeadheight) / 2) + 50);
                $('#VIS_HistoryGrd' + window_No).css("height", (((outerwrapheight - divHeadheight) / 2) - pagingHtmlheight) - 50);
            }
            else {
                $('#VIS_HistoryGrd' + window_No).css("height", (outerwrapheight - (divHeadheight + pagingHtmlheight)));
            }

            if ($root.width() <= 500) {
                $html.find('#VIS_HistoryTabs' + window_No).addClass('VIS-hide-tabs');
            }
            else {
                $html.find('#VIS_HistoryTabs' + window_No).removeClass('VIS-hide-tabs');
            }
        }

        /**   Intialize UI Elements  */
        this.init = function () {
            //$html = $('<div class="VIS-testPanel VIS-HistGrd-data" id="VIS_HistoryGrd' + this.windowNo + '" ></div>');
            $html = $('<div class="VIS-activities-container" id="VIS_HistoryGrd' + this.windowNo + '">' +
                //'<header class="VIS-activities-header">' +
                //'<h5>Activities</h5>' +
                //'<button class="VIS-btn-close"><span class="vis vis-cross"></span></button>' +
                //'</header>' +
                '<nav class="VIS-activities-nav">' +
                '<div class="nav nav-tabs" id="VIS_HistoryTabs' + this.windowNo + '" role="tablist">' +
                '<a class="VIS-nav-item active" id="all" data-toggle="tab" href="#VIS-all_' + this.windowNo + '" role="tab" aria-controls="all" aria-selected="true">' + VIS.Msg.getMsg("All") + '</a>' +
                '<a class="VIS-nav-item" id="appointment" data-toggle="tab" href="#VIS-appointment_' + this.windowNo + '" role="tab" aria-controls="appointment" aria-selected="false"><i class="fa fa-calendar-o"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Appointments") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="email" data-toggle="tab" href="#VIS-emails_' + this.windowNo + '" role="tab" aria-controls="emails" aria-selected="false"><i class="vis vis-email"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Emails") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="call" data-toggle="tab" href="#VIS-calls_' + this.windowNo + '" role="tab" aria-controls="calls" aria-selected="false"> <i class="fa fa-phone"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Calls") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="chat" data-toggle="tab" href="#VIS-notes_' + this.windowNo + '" role="tab" aria-controls="notes" aria-selected="false"> <i class="fa fa-sticky-note-o"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Notes") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="task" data-toggle="tab" href="#VIS-tasks_' + this.windowNo + '" role="tab" aria-controls="notes" aria-selected="false"> <i class="vis vis-task"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Tasks") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="letter" data-toggle="tab" href="#VIS-letters_' + this.windowNo + '" role="tab" aria-controls="letters" aria-selected="false"> <i class="vis vis-letter"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("Letters") + '</span><span class="badge">0</span></a>' +
                '<a class="VIS-nav-item" id="socialinbox" data-toggle="tab" href="#VIS-socialinbox_' + this.windowNo + '" role="tab" aria-controls="socials" aria-selected="false"><i class="vis vis-users-o"></i><span class="VIS-tab-names">' + VIS.Msg.getMsg("WSP_SocialInbox") + '</span><span class="badge">0</span></a>' +
                '</div>' +
                '</nav>' +
                '<div class="tab-content" id="nav-tabContent">' +
                '<div class="tab-pane fade show active" id="VIS-all_' + this.windowNo + '" role="tabpanel" aria-labelledby="nav-home-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-appointment_' + this.windowNo + '" role="tabpanel" aria-labelledby="appointment-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-emails_' + this.windowNo + '" role="tabpanel" aria-labelledby="emails-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-calls_' + this.windowNo + '" role="tabpanel" aria-labelledby="calls-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-notes_' + this.windowNo + '" role="tabpanel" aria-labelledby="notes-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-tasks_' + this.windowNo + '" role="tabpanel" aria-labelledby="tasks-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-letters_' + this.windowNo + '" role="tabpanel" aria-labelledby="latters-tab"></div>' +
                '<div class="tab-pane fade" id="VIS-socialinbox_' + this.windowNo + '" role="tabpanel" aria-labelledby="socialinbox-tab"></div>' +
                '</div></div>');

            //$rootcontent = $('<div id="VIS_recordDetail' + this.windowNo + '" style="display:none;" class="VIS-tp-detailsPanel"></div>');
            $root.prepend($html);

            $paginghtml = $('<div id="VIS_pagingHtml' + this.windowNo + '" class="vis-ad-w-p-s-pages VIS-root-pagingHtml"><ul class="vis-ad-w-p-s-plst w-100">' +
                '<li class="flex-fill"><div id="VIS_pagingText' + this.windowNo + '" class="vis-ad-w-p-s-result"><span class="vis-ad-w-p-s-statusdb" id="VIS_pageIndx' + window_No + '">0/0</span><span>Showing Result 0-0 of 0</span></div></li>' +
                '<li id="VIS_prevPage' + this.windowNo + '" style="opacity: 1;"><div ><i class="vis vis-pageup" title="Page Up(Alt+ Pg Up)" })="" style="opacity: 1;"></i></div></li>' +
                '<li><select id="VIS_ddlPages' + this.windowNo + '" class="vis-statusbar-combo"><option></option></select></li>' +
                '<li id="VIS_nextPage' + this.windowNo + '" style="opacity: 1;"><div ><i class="vis vis-pagedown" title="Page Down(Alt+ Pg Dn)" })="" style="opacity: 1;"></i></div></li></div>' +
                '</ul></div>');
            $commentshtml = $('<div id="VIS_viewMoreComments' + this.windowNo + '" style="display:none;" class="VIS-tp-commentsPanel"></div>');
            $tpdataloader = $('<div class="VIS-tabPanelDataLoader" id="VIS_tabPanelDataLoader' + window_No + '"><div class="vis-busyindicatorinnerwrap"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div></div>');
            //$root.append($paginghtml);
            //$root.append($rootcontent);
            $root.append($tpdataloader);
            window_No = this.windowNo;
            setContentHeight();

            $html.find('a').on('click', function (e) {
                e.preventDefault();
                getGridDataRecordCount(_selectedId, tableID);
                if ($(this).attr('id') == "socialinbox") {
                    renderSocialInbox(_selectedId, 0, window_No, tableID, $(this));
                } else {
                    loadHistoryData(_selectedId, 0, window_No, tableID, $(this));
                }
            });
        };

        /** Return container of panel's Design  */
        this.getRoot = function () { return $root; };

        /** Update UI elements with latest record's values.   */
        this.update = function (record_ID) {
            _selectedId = record_ID;
            tableID = this.table_ID;
            $root.empty();
            this.init();
            getGridDataRecordCount(record_ID, tableID);
            loadHistoryData(record_ID, 0, this.windowNo, tableID, null);
        };

        function setPages(RecordId, selPage) {
            if (totalRecords > 0) {
                if (totalRecords % PAGESIZE == 0)
                    totalPages = totalRecords / PAGESIZE;
                else
                    totalPages = Math.floor(totalRecords / PAGESIZE) + 1;

                if (VIS.Utility.Util.getValueOfInt($('#VIS_ddlPages' + window_No).find(":selected").val()) > 0)
                    currentPage = VIS.Utility.Util.getValueOfInt($('#VIS_ddlPages' + window_No).find(":selected").val());
                else
                    currentPage = 1;

                if (currentPage > 0)
                    prevPage = currentPage - 1;
                if (totalPages >= (currentPage + 1))
                    nextPage = currentPage + 1;

                if (VIS.Utility.Util.getValueOfInt($('#VIS_ddlPages' + window_No).find(":selected").val()) <= 0 || $('#VIS_ddlPages' + window_No).children('option').length <= 0) {
                    $('#VIS_ddlPages' + window_No).empty();

                    for (var i = 1; i <= totalPages; i++) {
                        if (i == 1)
                            $('#VIS_ddlPages' + window_No).append(new Option(i, i, true, true));
                        else
                            $('#VIS_ddlPages' + window_No).append(new Option(i, i, false, false));
                    }
                }
                if (totalPages > 1 && totalPages > VIS.Utility.Util.getValueOfInt($('#VIS_ddlPages' + window_No).find(":selected").val()))
                    $('#VIS_pagingText' + window_No).html('<span class="vis-ad-w-p-s-statusdb" id="VIS_pageIndx' + window_No + '">1/' + _curPageRecords + '</span><span>Showing Result ' + (((currentPage - 1) * PAGESIZE) + 1) + '-' + (currentPage * PAGESIZE) + ' of ' + totalRecords + '</span>');
                else if (totalPages > 1 && totalPages == VIS.Utility.Util.getValueOfInt($('#VIS_ddlPages' + window_No).find(":selected").val()))
                    $('#VIS_pagingText' + window_No).html('<span class="vis-ad-w-p-s-statusdb" id="VIS_pageIndx' + window_No + '">1/' + _curPageRecords + '</span><span>Showing Result ' + (((currentPage - 1) * PAGESIZE) + 1) + '-' + totalRecords + ' of ' + totalRecords + '</span>');
                else if (totalPages == 1)
                    $('#VIS_pagingText' + window_No).html('<span class="vis-ad-w-p-s-statusdb" id="VIS_pageIndx' + window_No + '">1/' + _curPageRecords + '</span><span>Showing Result 1-' + totalRecords + ' of ' + totalRecords + '</span>');
            }
            else {
                $('#VIS_pagingText' + window_No).html('<span class="vis-ad-w-p-s-statusdb" id="VIS_pageIndx' + window_No + '">0/0</span><span>Showing Result 0-0 of 0</span>');
                $('#VIS_ddlPages' + window_No).empty();
            }
        }

        /* Getting the record count*/
        function getGridDataRecordCount(RecordId, TableId) {
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetHistoryRecordsCount",
                //async: false,
                data: { RecordId: RecordId, AD_Table_ID: TableId },
                success: function (data) {
                    var res = JSON.parse(data);
                    if (res != null) {
                        //totalRecords = res;
                        //$('#VIS_ddlPages' + window_No).empty();
                        //setPages(RecordId, 0);
                        for (var i = 0; i < res.length; i++) {
                            $($html.find("a[id=" + res[i].type.toLower() + "]")).find('span.badge').text(res[i].count);
                        }
                    };
                },
                error: function (e) {
                }
            });
        };

        function ddlpagesOnChange(e) {
            selectedPage = $('#VIS_ddlPages' + window_No).find(":selected").val();
            loadHistoryData(_selectedId, VIS.Utility.Util.getValueOfInt(selectedPage), window_No, tableID);
            currentPage = selectedPage;
        };

        /* Loading the data in to Grid*/
        function loadHistoryData(RecordId, selPage, window_No, TableId, target) {
            $('#VIS_tabPanelDataLoader' + window_No).show();
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetHistoryRecordDetails",
                data: { RecordId: RecordId, AD_Table_ID: TableId, Type: (target === null ? 'all' : target.attr('id')), CurrentPage: selPage },
                success: function (data) {
                    var res = [];
                    var tp_con
                    res = JSON.parse(data);
                    if (res != null) {
                        historyRecords = res;
                        renderHistoryData(res, window_No, target);
                        $('#VIS_recordDetail' + window_No).hide();
                        setContentHeight();
                        //setTimeout($('#tabPanelDataLoader').hide(), 10000);
                        if (VIS.Utility.Util.getValueOfInt(selPage) > 0)
                            setPages(RecordId, VIS.Utility.Util.getValueOfInt(selPage));
                        $('#VIS_tabPanelDataLoader' + window_No).hide();

                        $('#VIS_ddlPages' + window_No).one("change", ddlpagesOnChange);
                        $('#VIS_prevPage' + window_No).one("click");
                        $('#VIS_nextPage' + window_No).one("click");

                        $('#VIS_prevPage' + window_No).one("click", function (e) {
                            selectedPage = $('#VIS_ddlPages' + window_No).find(":selected").val();

                            if (VIS.Utility.Util.getValueOfInt(selectedPage) > 1) {
                                $('#VIS_prevPage' + window_No).off("click");
                                $('#VIS_ddlPages' + window_No).off("change");

                                loadHistoryData(_selectedId, (VIS.Utility.Util.getValueOfInt(selectedPage) - 1), window_No, TableId);
                                currentPage = selectedPage;

                                $('#VIS_ddlPages' + window_No).val((VIS.Utility.Util.getValueOfInt(selectedPage) - 1));
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                            }
                        });

                        $('#VIS_nextPage' + window_No).one("click", function (e) {
                            selectedPage = $('#VIS_ddlPages' + window_No).find(":selected").val();

                            if (VIS.Utility.Util.getValueOfInt(selectedPage) < $('#VIS_ddlPages' + window_No).children('option').length) {
                                $('#VIS_nextPage' + window_No).off("click");
                                $('#VIS_ddlPages' + window_No).off("change");

                                loadHistoryData(_selectedId, (VIS.Utility.Util.getValueOfInt(selectedPage) + 1), window_No, TableId);
                                currentPage = selectedPage;

                                $('#VIS_ddlPages' + window_No).val((VIS.Utility.Util.getValueOfInt(selectedPage) + 1));
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                            }
                        });
                    };
                },
                error: function (e) {
                }
            });
        };

        function renderHistoryData(res, window_No, target) {
            $html.find('.tab-pane').empty();
            if (res.length > 0) {
                var $recshtml = $('<div class="VIS-timeline-section"></div>');

                var $rechtml;
                var $detHtml;
                _curPageRecords = res.length;
                $('#VIS_pageIndx' + window_No).text('1/' + _curPageRecords);
                for (var i = 0; i < res.length; i++) {
                    var sentimentCls = "";
                    var sentimentIcon = "";
                    if (res[i].Type.toLower() == 'email' || res[i].Type.toLower() == 'inbox') {
                        if (res[i].SentimentAnalysis) {
                            if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) > 0) {
                                sentimentCls = "VIS-Positive";
                                sentimentIcon = "fa fa-smile-o";
                            }
                            else if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) < 0) {
                                sentimentCls = "VIS-Negative";
                                sentimentIcon = "fa fa-frown-o";
                            }
                            else {
                                sentimentCls = "VIS-Neutral";
                                sentimentIcon = "fa fa-meh-o";
                            }
                        }
                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon">' + (res[i].Type.toLower() == 'email' ? '<i class="vis vis-email">'
                                : '<i class="fa fa-inbox">') + '</i></div > ' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + (res[i].Type.toLower() == 'email' ? VIS.Msg.getMsg("EMail")
                                : VIS.Msg.getMsg("Inbox")) + '</span>' +
                            '<span class="VIS-item-author">By: ' + (res[i].Type.toLower() == 'email' ? res[i].UserName
                                : res[i].FromUser) + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +

                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section VIS-group-item-flex">' +
                            '<div class="VIS-item-content-group">' +
                            '<h6>' + res[i].Subject + '</h6>' + (res[i].Type.toLower() == 'email' ?
                                '<div class="emailTo">' + VIS.Msg.getMsg("To") + ':&nbsp; ' + res[i].MailTo + '</div>' : '') +
                            '<div class="emailCC">' + VIS.Msg.getMsg("Cc") + ':&nbsp; ' + res[i].MailCC + '</div>' +
                            '</div>' +
                            '<div class="VIS-action-group">' +
                            ((VIS.Utility.Util.getValueOfString(res[i].HasAttachment) == 'true') ?
                                '<a href="javascript:void(0)"><span class="vis vis-attachment1"></span></a><div class="VIS-attach-count">' + res[i].AttchCount + '</div>' : '') +
                            (res[i].SentimentAnalysis ? '<div class="VIS-Reaction ' + sentimentCls + '"><i class="' + sentimentIcon + '" aria-hidden="true" title="'
                                + res[i].SentimentAnaylsisReason + '"></i></div>' : '') +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="email" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="email" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    else if (res[i].Type.toLower() == 'inbox') {
                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="vis vis-email"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("InboxMail") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section">' +
                            '<p>' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="inbox" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="inbox" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    else if (res[i].Type.toLower() == 'call') {
                        $rechtml = $('<div data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No + '" data-atype="call" data-recid="' + i + '" id="rowId' + i + '" class="VIS-tp-recordWrap  ' +
                            '">' +
                            '<div data-recid="' + i + '" class= "VIS-tp-recordIcon" >' +
                            '<i data-recid="' + i + '" class="fa fa-phone" aria-hidden="true" title="Call" ></i>' +
                            '</div >' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfo">' +
                            '<h6 data-recid="' + i + '">' + new Date(res[i].Created).toLocaleString() + '</h6>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordSubject">' +
                            '<p data-recid="' + i + '">' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfoRight">' +
                            '<i data-recid="' + i + ((VIS.Utility.Util.getValueOfString(res[i].HasAttachment) == 'true') ? '" class="vis vis-attachment1">&nbsp;</i>' : '">&nbsp;</i>') +
                            '<small data-recid="' + i + '">By: ' + res[i].UserName + '</small>' +
                            '</div>' +
                            '</div>');

                        var duration = res[i].Subject >= 60 ? DurationCalculator(res[i].Subject) : res[i].Subject + ' ' + VIS.Msg.getMsg('VA048_Seconds');

                        var attchFile = ''; attach_ID = 0; attachLine_ID = 0;
                        if (res[i].Attachment != null) {
                            attchFile = res[i].Attachment.Name;
                            attach_ID = res[i].Attachment.AttID;
                            attachLine_ID = res[i].Attachment.ID;
                        }

                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="fa fa-phone"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("VA048_CallType") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section VIS-group-item-flex">' +
                            '<div class="VIS-item-content-group">' +
                            '<h6>From: ' + res[i].MailTo + ' To: ' + res[i].MailCC + '</h6>' +
                            ((VIS.Utility.Util.getValueOfString(res[i].HasAttachment) == 'true') ?
                                '<div class="VIS-transcript-available">Transcript Available</div>' : '') +
                            '</div>' +
                            '<div class="VIS-action-group">' +
                            '<div class="VIS-item-duration">' +
                            '<div class="VIS-mintxt">' + duration + '</div>' +
                            '</div>' +
                            '<a href="javascript:void(0)" class="VIS-play-link" data-aid="' + attach_ID + '" data-atlid="' + attachLine_ID +
                            '" data-aname="' + attchFile + '"><i class="fa fa-play-circle-o" aria-hidden="true"></i></a>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="call" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="call" class="VIS-activity-container" style="display:none;"></div>');

                        $rechtml.find('.VIS-play-link').click(function (e) {
                            var attLine_ID = $(this).data('atlid');
                            var att_ID = $(this).data('aid');
                            var attFile = $(this).data('aname');
                            downLoadAttachCall(attLine_ID, att_ID, attFile);
                        });
                    }
                    else if (res[i].Type.toLower() == 'chat') {
                        if (res[i].SentimentAnalysis) {
                            if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) > 0) {
                                sentimentCls = "VIS-Positive";
                                sentimentIcon = "fa fa-smile-o";
                            }
                            else if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) < 0) {
                                sentimentCls = "VIS-Negative";
                                sentimentIcon = "fa fa-frown-o";
                            }
                            else {
                                sentimentCls = "VIS-Neutral";
                                sentimentIcon = "fa fa-meh-o";
                            }
                        }
                        $rechtml = $('<div data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No + '" data-atype="chat" data-recid="' + i + '" id="rowId' + i + '" class="VIS-tp-recordWrap  ' +
                            '">' +
                            '<div data-recid="' + i + '" class= "VIS-tp-recordIcon" >' +
                            '<i data-recid="' + i + '" class="vis vis-chat" title="chat" ></i>' +
                            '</div >' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfo">' +
                            '<h6 data-recid="' + i + '">' + new Date(res[i].Created).toLocaleString() + '</h6>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordSubject">' +
                            '<p data-recid="' + i + '">' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfoRight">' +
                            '<i data-recid="' + i + '">&nbsp;</i>' +
                            '<small data-recid="' + i + '">By: ' + res[i].UserName + '</small>' +
                            '</div>' +
                            '</div>');

                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="fa fa-sticky-note-o"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("Note") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section VIS-group-item-flex">' +
                            '<div class="VIS-item-content-group">' +
                            '<p>' + res[i].CharacterData + '</p>' +
                            (res[i].SentimentAnalysis ? '<div class="VIS-Reaction ' + sentimentCls + '"><i class="' + sentimentIcon + '" aria-hidden="true" title="'
                                + res[i].SentimentAnaylsisReason + '"></i></div>' : '') +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = "";
                    }
                    else if (res[i].Type.toLower() == 'letter') {
                        $rechtml = $('<div data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No + '" data-atype="letter" data-recid="' + i + '" id="rowId' + i + '" class="VIS-tp-recordWrap ' +
                            '">' +
                            '<div data-recid="' + i + '" class= "VIS-tp-recordIcon" >' +
                            '<i data-recid="' + i + '" class="vis vis-letter"></i>' +
                            '</div >' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfo">' +
                            '<h6 data-recid="' + i + '">' + new Date(res[i].Created).toLocaleString() + '</h6>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordSubject">' +
                            '<p data-recid="' + i + '">' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfoRight">' +
                            '<i data-recid="' + i + ((VIS.Utility.Util.getValueOfString(res[i].HasAttachment) == 'true') ? '" class="vis vis-attachment1">&nbsp;</i>' : '">&nbsp;</i>') +
                            '<small data-recid="' + i + '">By: ' + res[i].UserName + '</small>' +
                            '</div>' +
                            '</div>');
                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="vis vis-letter"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("Letter") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section VIS-group-item-flex">' +
                            '<div class="VIS-item-content-group">' +
                            '<h6>' + res[i].Subject + '</h6>' +
                            '</div>' +
                            //'<button class="VIS-btn-copy"><i class="fa fa-clone"></i></button>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="letter" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="letter" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    else if (res[i].Type.toLower() == 'appointment') {
                        $rechtml = $('<div data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No + '" data-atype="appointment" data-recid="' + i + '" id="rowId' + i + '" class="VIS-tp-recordWrap ' +
                            '">' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordIcon">' +
                            '<i data-recid="' + i + '" class="vis vis-appointment" title="appointment"></i>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfo">' +
                            '<h6 data-recid="' + i + '">' + new Date(res[i].Created).toLocaleString() + '</h6>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordSubject">' +
                            '<p data-recid="' + i + '">' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfoRight">' +
                            '<i data-recid="' + i + '">&nbsp;</i>' +
                            '<small data-recid="' + i + '">By: ' + res[i].UserName + '</small>' +
                            '</div>' +
                            '</div>');

                        var hours = new Date(res[i].StartDate).getHours();
                        var minutes = new Date(res[i].StartDate).getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
                        minutes = minutes < 10 ? '0' + minutes : minutes; // Ensure two-digit minutes

                        var time = "Time: " + new Date(res[i].StartDate).toDateString() + " " + hours + ":" + minutes + " " + ampm;
                        time += " - ";
                        if (new Date(res[i].StartDate).setHours(0, 0, 0, 0) != new Date(res[i].EndDate).setHours(0, 0, 0, 0)) {
                            time += new Date(res[i].EndDate).toDateString();
                        }

                        hours = new Date(res[i].EndDate).getHours();
                        minutes = new Date(res[i].EndDate).getMinutes();
                        ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
                        minutes = minutes < 10 ? '0' + minutes : minutes; // Ensure two-digit minutes
                        time += " " + hours + ":" + minutes + " " + ampm;
                        if (res[i].SentimentAnalysis) {
                            if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) > 0) {
                                sentimentCls = "VIS-Positive";
                                sentimentIcon = "fa fa-smile-o";
                            }
                            else if (VIS.Utility.Util.getValueOfInt(res[i].SentimentAnalysis) < 0) {
                                sentimentCls = "VIS-Negative";
                                sentimentIcon = "fa fa-frown-o";
                            }
                            else {
                                sentimentCls = "VIS-Neutral";
                                sentimentIcon = "fa fa-meh-o";
                            }
                        }
                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="fa fa-calendar-o"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("Appointment") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section">' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-content-group">' +
                            '<h6>' + res[i].Subject + '</h6>' +
                            '<div class="VIS-item-timing">' + time + '</div>' +
                            '</div>' +
                            '<div class="VIS-meeting-section">' +
                            (res[i].MeetingUrl != "" ? '<a class="VIS-meeting-url" href="#" data-joinurl="' + res[i].MeetingUrl + '">' + res[i].MeetingUrl +
                                '</a><span data-joinurl="' + res[i].MeetingUrl + '" class="VIS-btn-copy" title="' + VIS.Msg.getMsg("CopyUrl") + '"><i class="fa fa-clone"></i></span>' : "") +
                            //'<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-uid="' + res[i].UID + '" data-joinurl="' + res[i].MeetingUrl +
                            //'" class="VIS-btn-edit" title="' + VIS.Msg.getMsg("EditAppointment") + '"><i class="fa fa-pencil-square-o"></i></span>' +
                            '</div>' +
                            (res[i].SentimentAnalysis ? '<div class="VIS-Reaction ' + sentimentCls + '"><i class="' + sentimentIcon + '" aria-hidden="true" title="'
                                + res[i].SentimentAnaylsisReason + '"></i></div>' : '') +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="appointment" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-uid="' + res[i].UID +
                            '" data-joinurl="' + res[i].MeetingUrl + '" data-type="' + res[i].Type.toLower() +
                            '" class="VIS-btn-edit"><i class="fa fa-pencil-square-o"></i>' + VIS.Msg.getMsg('EditAppointment') + '</a>' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');

                        var divAtt = $('<div class="VIS-items-status-group"></div>');
                        if (res[i].Attendees != null && res[i].Attendees.length > 0) {
                            var array = res[i].Attendees.split(",");
                            if (array != null && array.length > 0) {
                                for (var k = 0; k < array.length; k++) {
                                    divAtt.append('<div class="VIS-item-status VIS-item-green">' + array[k] + '</div>');
                                }
                            }
                        }
                        if (res[i].EmailToInfo != "") {
                            var array = res[i].EmailToInfo.split(",");
                            if (array != null && array.length > 0) {
                                for (var k = 0; k < array.length; k++) {
                                    divAtt.append('<div class="VIS-item-status VIS-item-green">' + array[k] + '</div>');
                                }
                            }
                        }
                        $rechtml.find('.VIS-content-section').append(divAtt);
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="appointment" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    else if (res[i].Type.toLower() == 'task') {
                        $rechtml = $('<div data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No + '" data-atype="task" data-recid="' + i + '" id="rowId' + i + '" class="VIS-tp-recordWrap ' +
                            '">' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordIcon">' +
                            '<i data-recid="' + i + '" class="vis vis-task" title="task"></i>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfo">' +
                            '<h6 data-recid="' + i + '">' + new Date(res[i].Created).toLocaleString() + '</h6>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordSubject">' +
                            '<p data-recid="' + i + '">' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '<div data-recid="' + i + '" class="VIS-tp-recordInfoRight">' +
                            (res[i].IsTaskClosed ? '<span data-recid="' + i + '" class="VIS-tp-taskTag">' + VIS.Msg.getMsg("Closed") + '</span>' : '') +
                            '<i data-recid="' + i + '">&nbsp;</i>' +
                            '<small data-recid="' + i + '" >By: ' + res[i].UserName + '</small>' +
                            '</div>' +
                            '</div>');

                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="fa fa-tasks"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("Task") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section VIS-group-item-flex">' +
                            '<div class="VIS-item-content-group">' +
                            '<h6>' + res[i].Subject + '</h6>' +
                            '</div>' +
                            //'<button class="VIS-btn-copy"><i class="fa fa-clone"></i></button>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            //'<div class="VIS-status-container"></div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="task" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="task" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    else if (res[i].Type.toLower() == 'attachment') {
                        $rechtml = $('<div class="VIS-timeline-item">' +
                            '<div class="VIS-item-icon"><i class="vis vis-attachmentx"></i></div>' +
                            '<div class="VIS-item-content">' +
                            '<div class="VIS-item-header">' +
                            '<div class="VIS-item-type-author">' +
                            '<span class="VIS-item-type">' + VIS.Msg.getMsg("Attachment") + '</span>' +
                            '<span class="VIS-item-author">By: ' + res[i].UserName + '</span>' +
                            '</div>' +
                            '<span class="VIS-item-time">' + new Date(res[i].Created).toLocaleString() + '</span>' +
                            '</div>' +
                            '<div class="VIS-item-body">' +
                            '<div class="VIS-content-section">' +
                            '<p>' + res[i].Subject + '</p>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<span data-rid="' + res[i].ID + '" data-username="' + res[i].UserName + '" data-winno="' + window_No +
                            '" data-atype="attachment" data-recid="' + i + '" id="rowId' + i + '" class="VIS-btn-expand"><i class="fa fa-angle-right"></i></span>' +
                            '<div class="vis-more-item-col">' +
                            '<a href="#" class="vis-more-items"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></a>' +
                            '<div class="vis-more-dropdown">' +
                            '<div class="vis-links-items">' +
                            '<a href="#" data-rid="' + res[i].ID + '" class="vis-delete-link" data-type="' + res[i].Type.toLower() +
                            '"><i class="fa fa-trash-o" aria-hidden="true"></i>' + VIS.Msg.getMsg('Delete') + '</a>' +
                            '</div>' +
                            '<div class="vis-arrow-tip"></div>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                        $detHtml = $('<div data-rid="' + res[i].ID + '" data-atype="attachment" class="VIS-activity-container" style="display:none;"></div>');
                    }
                    $recshtml.append($rechtml);
                    $recshtml.append($detHtml);
                }

                if (target != null) {
                    target = $html.find(target.attr('href'));
                }
                else {
                    target = $($html.find('.tab-pane')[0]);
                }
                target.append($recshtml);

                $html.find(".VIS-btn-expand").click(function (e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    var target = $(e.target);
                    var recId = VIS.Utility.Util.getValueOfInt(target.data('recid'));
                    _selectedRecId = recId;
                    var record_Type = target.data('atype').toString().toUpper();
                    var rID = target.data('rid');
                    var userName = target.data('username');
                    var detDiv = $($html.find(".VIS-activity-container[data-rid='" + rID + "']"));
                    detDiv.empty();

                    if (target.find('i').hasClass('fa-angle-right')) {
                        target.find('i').removeClass('fa-angle-right');
                        target.find('i').addClass('fa-angle-down');
                        $('#VIS_tabPanelDataLoader' + window_No).show();
                    }
                    else {
                        target.find('i').removeClass('fa-angle-down');
                        target.find('i').addClass('fa-angle-right');
                        detDiv.hide();
                        return;
                    }

                    if (record_Type == "EMAIL" || record_Type == "INBOX")
                        showMail(detDiv, rID, userName, window_No);
                    else if (record_Type == "CALL")
                        showCallInfo(rID, detDiv, window_No);
                    else if (record_Type == "APPOINTMENT")
                        showAppointmentInfo(rID, detDiv, window_No);
                    else if (record_Type == "LETTER")
                        showLetter(detDiv, rID, userName, window_No);
                    else if (record_Type == "TASK")
                        showTask(rID, detDiv, window_No);
                    else if (record_Type == "ATTACHMENT")
                        showAttachment(detDiv, rID, userName, window_No);
                    else if (record_Type == "CHAT")
                        showChat(rID, userName, window_No);
                    setContentHeight();
                });

                $html.find(".vis-delete-link").click(function (e) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    var target = $(e.target);
                    $('#VIS_tabPanelDataLoader' + window_No).show();
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "VIS/HistoryDetailsData/DeleteHistoryRecord",
                        { RecordId: target.data('rid'), Type: target.data('type') }, function (data) {
                            if (data != "") {
                                VIS.ADialog.info("", "", data);
                            }
                            else {
                                $(target.parents('.VIS-timeline-item')).remove();
                            }
                            $('#VIS_tabPanelDataLoader' + window_No).hide();
                        });
                });

                $html.find(".VIS-meeting-url").click(function () {
                    var url = $(this).data('joinurl');
                    window.open(url);
                });

                $html.find(".VIS-btn-copy").click(function () {
                    const btn = $(this);
                    var url = $(this).data('joinurl');
                    const $tempInput = $('<input>');
                    $root.append($tempInput);
                    $tempInput.val(url).select();
                    try {
                        const success = document.execCommand('copy');
                        if (success) {
                            btn.html('<i class="fa fa-check"></i>');
                            let msg = $('<span class="VIS-copy-msg">' + VIS.Msg.getMsg("CopyClipboard") + '</span>');
                            btn.after(msg);
                            btn.prop('disabled', true); // Disable the button
                            setTimeout(() => {
                                btn.html('<i class="fa fa-clone"></i>'); // Revert back after 5s
                                msg.fadeOut(300, function () { $(this).remove(); }); // Fade & remove message
                                btn.prop('disabled', false); // Disable the button
                            }, 5000);
                        } else {
                            console.error("Copy command was unsuccessful.");
                        }
                    } catch (err) {
                        console.error("Failed to copy:", err);
                    }
                    $tempInput.remove();
                });

                $html.find(".VIS-btn-edit").click(function () {
                    if (window.WSP && WSP.WSP_AppointmentsForm) {
                        const btn = $(this);
                        var rid = $(this).data('rid');
                        var uid = $(this).data('uid');
                        var url = $(this).data('joinurl');

                        var divaptbusy = $("<div id='divAptBusy' class='wsp-busy-indicater'></div>");
                        $root.append(divaptbusy);
                        divaptbusy.show();
                        WSP.WSP_AppointmentsForm.init(divaptbusy, tableID, _selectedId, rid, uid, url);
                    }
                    else {
                        VIS.ADialog.info("PleaseUpdateWSPModule");
                    }
                });

                $('#VIS_txtSearch' + window_No).keyup(function (e) {

                    if (e.keyCode != undefined && e.keyCode != 13 && e.keyCode != 8) {
                        return;
                    }

                    var searchField = $(this).val();
                    if (searchField === '' && e.keyCode != 13) {
                        return;
                    }
                    var searchRecords = [];
                    var regex = new RegExp(searchField, "i");
                    var reccount = 0;
                    $.each(historyRecords, function (key, record) {
                        if ((record.Subject.search(regex) != -1) || (record.UserName.search(regex) != -1)) {
                            searchRecords[reccount] = record;
                            reccount++;
                        }
                    });
                    renderHistoryData(searchRecords, window_No, true);
                    $('#VIS_recordDetail' + window_No).fadeOut(100);
                    $('#VIS_recordDetail' + window_No).hide();

                    if (searchField === '' && e.keyCode == 13)
                        $('#VIS_pagingHtml' + window_No).show();
                    else
                        $('#VIS_pagingHtml' + window_No).hide();
                });

                $('#VIS_btnRefresh' + window_No).click(function () {
                    if (VIS.Utility.Util.getValueOfInt(_selectedId) > 0) {
                        getGridDataRecordCount(_selectedId, tableID);
                        loadHistoryData(_selectedId, 0, window_No, tableID);
                    }
                    $('#VIS_recordDetail' + window_No).hide();
                    $('#VIS_pagingHtml' + window_No).show();
                });

                $('#VIS_faSearch' + window_No).click(function () {
                    var searchField = $('#VIS_txtSearch' + window_No).val();
                    if (searchField === '') {
                        if (VIS.Utility.Util.getValueOfInt(_selectedId) > 0) {
                            getGridDataRecordCount(_selectedId, tableID);
                            loadHistoryData(_selectedId, 0, window_No, tableID);
                        }
                        $('#VIS_recordDetail' + window_No).hide();
                        $('#VIS_pagingHtml' + window_No).show();
                    }
                    else {
                        var searchRecords = [];
                        var regex = new RegExp(searchField, "i");
                        var reccount = 0;
                        $.each(historyRecords, function (key, record) {
                            if ((record.Subject.search(regex) != -1) || (record.UserName.search(regex) != -1)) {
                                searchRecords[reccount] = record;
                                reccount++;
                            }
                        });
                        renderHistoryData(searchRecords, window_No, true);
                        $('#VIS_recordDetail' + window_No).fadeOut(100);
                        $('#VIS_recordDetail' + window_No).hide();
                        $('#VIS_pagingHtml' + window_No).hide();
                    }
                });
            }
        }

        function renderSocialInbox(RecordId, selPage, window_No, TableId, target) {
            $html.find('.tab-pane').empty();
            $('#VIS_tabPanelDataLoader' + window_No).show();
            var $recshtml = $('<div class="VIS-timeline-section"></div>');
            var $rechtml = $('<div class="VIS-social-inbox" id="VIS_socialinbox' + window_No + '">' +
                '<div class="VIS-social-tab-content">' +
                '<div class="VIS-social-tabs">' +
                '<ul class="nav nav-tabs" id="myTab" role="tablist">' +
                '<li class="nav-item">' +
                '<a class="nav-link WSP-whatsapp-link WSP-active-link active show" id="whatsapp_' + window_No + '" data-toggle="tab" ' +
                'data-provider="WHATSAPP" href="#whatsapp" role="tab" aria-controls="tab" aria-selected="false">' +
                '<i class="fa fa-whatsapp" aria-hidden="true"></i></a>' +
                '</li>' +
                '<li class="nav-item">' +
                '<a class="nav-link WSP-linkedin-link WSP-active-link" id="linkedin_' + window_No + '" data-toggle="tab" href="#linkedin" ' +
                'data-provider="LINKEDIN" role="tab" aria-controls="tab" aria-selected="true"><i class="fa fa-linkedin" aria-hidden="true"></i></a>' +
                '</li>' +
                //'<li class="nav-item">' +
                //'<a class="nav-link WSP-instagram-link" id="instagram-tab" data-toggle="tab" href="#instagram" role="tab" aria-controls="tab" aria-selected="false"><i class="fa fa-instagram" aria-hidden="true"></i></a>' +
                //'</li>' +
                //'<li class="nav-item">' +
                //'<a class="nav-link WSP-share-link" id="share-tab" data-toggle="tab" href="#share" role="tab" aria-controls="tab" aria-selected="false"><i class="fa fa-paper-plane" aria-hidden="true"></i></a>' +
                //'</li>' +
                '</ul>' +
                '<div class="VIS-tab-content fade show" id="whatsapp" role="tabpanel" aria-labelledby="all-tab">' +
                //'<div class="WSP-num-dropdown">' +
                //'<select name="" id="WSP_AccountList_' + window_No + '"></select >' +
                //'</div>' +
                '<ul class="VIS-user-list-items">' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '<div class="VIS-chat-message">' +
                '<div class="WSP-chatbox-header">' +
                '<a href="#" id="VIS_btnBack_' + window_No + '" class="VIS-back-link">' +
                '<span class="vis vis-back"></a>' +
                '<h6></h6 > ' +
                '</div>' +
                '<div class="VIS-chat-content">' +
                '</div>' +
                '</div>' +
                '</div>');
            $recshtml.append($rechtml);
            target = $html.find(target.attr('href'));
            target.append($recshtml);
            ShowChatIdentifier(target, RecordId, TableId, "", selPage);

            $rechtml.find('li a').click(function () {
                $('#VIS_tabPanelDataLoader' + window_No).show();
                ShowChatIdentifier(target, RecordId, TableId, $(this).data('provider'), selPage);
            });

            $html.find('#VIS_btnBack_' + window_No).on(VIS.Events.onTouchStartOrClick, function () {
                $rechtml.find('.VIS-social-tab-content').removeClass('active');
            });
        }

        function ShowChatIdentifier(target, RecordId, TableId, type, selPage) {
            var divSMChats = target.find('.VIS-user-list-items');
            target.find('.WSP-chatbox-header h6').text("");
            target.find('.VIS-chat-content').empty();
            var acctImg = "", chatImg = "", chatName = "";
            divSMChats.empty();
            if ($root.width() <= 500) {
                $html.find('.VIS-social-tab-content').addClass('VIS-hide-chat');
            }
            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetChatHistoryDetails",
                { UserId: VIS.context.getAD_User_ID(), RecordId: RecordId, AD_Table_ID: TableId, Type: type, CurrentPage: selPage },
                function (dr) {
                    if (dr != null && dr.length > 0) {
                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetUserImage",
                            { User_ID: VIS.context.getAD_User_ID() }, function (data) {
                                acctImg = VIS.Application.contextUrl + (data != "" ? data : "Areas/WSP/Images/dummy.jpg");
                            });
                        for (var i = 0; i < dr.length; i++) {
                            divSMChats.append('<li data-chatid="' + dr[i].ChatID + '" data-chatident_id="' +
                                dr[i].SMIdentifierID + '" data-chattopicid="' + dr[i].SMTopicID +
                                '" data-mobile="' + dr[i].Mobile + '" data-name="' + dr[i].Name +
                                '" data-userid="' + dr[i].AD_User_ID + '" data-date="' +
                                new Date(dr[i].ChatDate).toLocaleDateString() + '">' +
                                '<div class="WSP-left-user-content">' +
                                '<img src="' + VIS.Application.contextUrl + (dr[i].ImageUrl != "" ? dr[i].ImageUrl
                                    : "Areas/WSP/Images/dummy.jpg") + '" alt="">' +
                                '<div class="WSP-group-text">' +
                                '<h1>' + dr[i].Name + '</h1>' +
                                //'<p>Ok Thanks</p>' +
                                '</div>' +
                                '</div>' +
                                '<div class="WSP-right-content">' +
                                //'<a href="#" class="WSP-outline-link" data-windowid="' + dr[i].AD_Window_ID +
                                //'" data-table="' + dr[i].TableName + '" data-tableid="' + dr[i].AD_Table_ID +
                                //'" data-recordid="' + dr[i].Record_ID + '">' + dr[i].Description + '</a>' +
                                '<div class="WSP-msg-date">' + new Date(dr[i].ChatDate).toLocaleDateString() + '</div>' +
                                '</div>' +
                                '</li>');
                        }

                        divSMChats.find('li').on(VIS.Events.onTouchStartOrClick, function () {
                            $('#VIS_tabPanelDataLoader' + window_No).show();
                            $(this).find('.WSP-msg-count').remove();
                            divSMChats.find('li').removeClass('WSP-selected-chat');
                            $(this).addClass('WSP-selected-chat');
                            $(this).removeClass('WSP-unread-chat');
                            var chatID = $(this).data("chatid");
                            var mobile = $(this).data("mobile");
                            var chatTopicID = $(this).data("chattopicid");
                            chatName = $(this).data("name");
                            chatImg = $(this).find('img').attr("src");
                            target.find('.WSP-chatbox-header h6').text(chatName);
                            if ($root.width() <= 500) {
                                $html.find('#VIS_btnBack_' + window_No).show();
                                $html.find('.VIS-social-tab-content').addClass('active');
                            }
                            ShowChatMessages(target, chatTopicID, acctImg, chatImg, chatName);
                        });

                        //$(divSMChats.find('li')[0]).trigger('click');
                    }
                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                });
        }

        function ShowChatMessages(target, chatTopicID, acctImg, chatImg, chatName) {
            var divSMMessages = target.find('.VIS-chat-content');
            $('#VIS_tabPanelDataLoader' + window_No).show();
            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "WSP/Inbox/GetChatMessage",
                { ChatTopicID: chatTopicID }, function (dr) {
                    divSMMessages.empty();
                    if (dr != null && dr.length > 0) {
                        for (var i = 0; i < dr.length; i++) {
                            var msgContent = "";
                            var filetype = "";
                            if (dr[i].TextMsg != "") {
                                msgContent = '<div class="WSP-chat-items"><p>' + dr[i].TextMsg + '</p></div>';
                            }
                            if (dr[i].IsAttachment == "Y") {
                                filetype = dr[i].FileType;
                                if (filetype.toLower() == '.doc' || filetype.toLower() == '.docx') {
                                    filetype = "vis vis-doc-word";
                                }
                                else if (filetype.toLower() == '.xls' || filetype.toLower() == '.xlsx') {
                                    filetype = "vis vis-doc-excel";
                                }
                                else if (filetype.toLower() == '.ppt' || filetype.toLower() == '.pptx') {
                                    filetype = "vis vis-doc-pp";
                                }
                                else if (filetype.toLower() == '.pdf') {
                                    filetype = "vis vis-doc-pdf";
                                }
                                else if (filetype.toLower() == '.txt') {
                                    filetype = "vis vis-doc-text";
                                }
                                else if (filetype.toLower() == '.png' || filetype.toLower() == '.jpg'
                                    || filetype.toLower() == '.jpeg' || filetype.toLower() == '.gif') {
                                    filetype = "vis vis-doc-img";
                                }
                                else {
                                    filetype = "vis vis-doc-img";
                                }
                                msgContent += '<div class="WSP-chat-items"><div class="WSP-file-attachment">' +
                                    '<i class="' + filetype + '" aria-hidden="true"></i>' + dr[i].FileName +
                                    '<i data-attid="' + dr[i].AD_Attachment_ID + '" data-name="' + dr[i].FileName +
                                    '" data-id="' + dr[i].ID + '" class="fa fa-download" aria-hidden="true"></i></div></div>';
                            }
                            divSMMessages.append('<div class="WSP-userchat-col' + (dr[i].IsSender == "Y" ?
                                " WSP-chat-alignright" : "") + '">' +
                                '<div class="WSP-userchat-header">' +
                                '<img src="' + (dr[i].IsSender == "Y" ? acctImg : chatImg) + '" alt="">' +
                                '<div class="WSP-chat-user-name">' + (dr[i].IsSender == "Y" ? VIS.Msg.getMsg("Me") : chatName) +
                                '<span>' + getFormattedDate(dr[i].MessageDate) + '</span></div>' +
                                '</div>' + msgContent +
                                '</div>');
                        }
                        divSMMessages.find('.fa-download').click(function () {
                            var attid = $(this).data('attid');
                            var alineid = $(this).data('id');
                            var name = $(this).data('name');
                            downLoadAttachCall(alineid, attid, name);
                        });
                    }
                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                });
        }

        function showMail(target, ID, UserName, window_No) {
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedMailDetails",
                datatype: "json",
                type: "get",
                cache: false,
                data: { ID: ID },
                success: function (data) {
                    var result = JSON.parse(data);
                    var _mattachID;
                    var noOfAttchs = 0;
                    var _Record_ID = result.Record_ID;
                    var _AD_Table_ID = result.AD_Table_ID;
                    var attachID = 0;
                    _mattachID = VIS.Utility.Util.getValueOfString(result.ID);
                    var mailaddresscc, mailaddressbcc;
                    var userInitials = '';
                    var uname = VIS.Utility.Util.getValueOfString(UserName).split(' ');
                    var mailtoddlhtml, $mailbodyhtml;

                    if (uname.length > 1) {
                        userInitials = VIS.Utility.Util.getValueOfString(uname[0]).substring(0, 1).toUpper() + VIS.Utility.Util.getValueOfString(uname[1]).substring(0, 1).toUpper();
                    }
                    else
                        userInitials = VIS.Utility.Util.getValueOfString(UserName).substring(0, 2).toUpper();

                    if (VIS.Utility.Util.getValueOfString(result.Cc) != '' || VIS.Utility.Util.getValueOfString(result.Bcc) != '') {
                        mailtoddlhtml = '<div class="dropdown show VIS-tp-dropdownWrap">' + result.To +
                            '<a class="btn dropdown-toggle" style="font-size:.75rem;" href="javascript:void(0)" role = "button" id="dropdownMenuLink" ' +
                            'data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" >' +
                            '&nbsp;<i class="fa fa-angle-down VIS-tp-recordLabels"></i></a>' +
                            '<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">';

                        if (VIS.Utility.Util.getValueOfString(result.Cc) != '') {
                            mailaddresscc = VIS.Utility.Util.getValueOfString(result.Cc).split(',');
                            for (var i = 0; i < mailaddresscc.length; i++) {
                                if (mailaddresscc[i] != 'undefined' && mailaddresscc[i] != '') {
                                    if (i == 0)
                                        mailtoddlhtml += '<span class="VIS-tp-recordLabels VIS-mail-to">' + VIS.Msg.getMsg("Cc") + ':&nbsp; </span>' +
                                            '<a class="dropdown-item VIS-mail-to" href = "javascript:void(0)">' + mailaddresscc[i] + '</a>';
                                    else
                                        mailtoddlhtml += '<a class="dropdown-item VIS-mail-to" href="javascript:void(0)">' + mailaddresscc[i] + '</a>';
                                }
                            }
                        }
                        if (VIS.Utility.Util.getValueOfString(result.Bcc) != '') {
                            mailaddressbcc = VIS.Utility.Util.getValueOfString(result.Bcc).split(',');
                            for (var j = 0; j < mailaddressbcc.length; j++) {
                                if (mailaddressbcc[j] != 'undefined' && mailaddressbcc[j] != '') {
                                    if (j == 0)
                                        mailtoddlhtml += '<span class="VIS-tp-recordLabels VIS-mail-to">' + VIS.Msg.getMsg("Bcc") + ':&nbsp; </span><a class="dropdown-item VIS-mail-to" href="javascript:void(0)">' + mailaddressbcc[j] + '</a>';
                                    else
                                        mailtoddlhtml += '<a class="dropdown-item VIS-mail-to" href="javascript:void(0)">' + mailaddressbcc[j] + '</a>';
                                }
                            }
                        }
                        mailtoddlhtml += '</div></div>';
                    }
                    else
                        mailtoddlhtml = result.To;

                    if (result.Attach != null && result.Attach.length > 0) {
                        noOfAttchs = result.Attach.length;
                        attachID = result.ID;
                    }

                    $htmlcontent = $('<div class="VIS-main-content"><div class="VIS-top-row">' +
                        '<section class="VIS-agenda-section"><h2>Actions</h2><div class="VIS-mail-action-links">' +
                        '<span class="VIS-email-link"><i class="fa fa-reply" aria-hidden="true" data-mailfrom="' + result.From + '" data-mailto="' + result.To +
                        '" data-mailcc="' + result.Cc + '" data-mailbcc="' + result.Bcc + '" id="VIS_imgReply' + window_No + '"></i></span>' +
                        '<span class="VIS-email-link"><i class="fa fa-reply-all" aria-hidden="true" data-mailfrom="' + result.From + '" data-mailto="' + result.To +
                        '" data-mailcc="' + result.Cc + '" data-mailbcc="' + result.Bcc + '" id="VIS_imgReplyAll' + window_No + '"></i></span>' +
                        '<span class="VIS-email-link"><i class="fa fa-share" aria-hidden="true" data-mailfrom="' + result.From + '" data-mailto="' + result.To +
                        '" data-mailcc="' + result.Cc + '" data-mailbcc="' + result.Bcc + '" id="VIS_imgForward' + window_No + '"></i></span>' +
                        '</div></section>' +
                        '<section class="VIS-attachment-section"><h2>' + VIS.Msg.getMsg("Attachment") + '</h2>' +
                        '<div class="VIS-attachment-content">' +
                        '<div class="VIS-downloadAll-link"><i id="dwnldAllAttach' + window_No + '" class="vis vis-import" title="Download All" style="opacity: 1;"></i>' +
                        '<span id="dwnldAllAttach' + window_No + '">' + VIS.Msg.getMsg("VIS_DownloadAll") + (noOfAttchs > 0 ? ' (' + noOfAttchs + ')' : '') +
                        '</span><span id="showAttachment' + window_No + '" class="vis vis-arrow-down"></span></div>' +
                        '<div class="VIS-attachment-list" style="display:none;"></div>' +
                        '</div></section></div>' +

                        '<section class="VIS-transcript-section">' +
                        /*'<h2>Hello David,</h2>' +*/
                        '<p id="VIS_mailSubject' + window_No + '" style="display:none;">' + result.Title + '</p>' +
                        '<div class="VIS-conversation"><pre class="VIS-message" id="VIS_mailBody' + window_No + '">' + result.Detail +
                        //'<p id="VIS_mailBody' + window_No + '">' + result.Detail + '</p>' +
                        '</pre></div></section></div >' +

                        '<section class="VIS-comments-section">' +
                        '<div class="VIS-comment-header"><h2>Comments</h2></div>' +
                        '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                        '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                        '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                        '<div class="VIS-comment-input">' +
                        '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                        '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                        '</div></div>' +
                        '</section>');

                    target.append($htmlcontent);
                    target.show();

                    if (noOfAttchs > 0) {
                        for (var k = 0; k < noOfAttchs; k++) {
                            $($htmlcontent.find('.VIS-attachment-list')).
                                append('<a href="javascript:void(0)" data-attid="' + result.Attach[k].ID + '">' + result.Attach[k].Name + '</a>');
                        }
                    }

                    $printhtml = $('<div class="VIS-tp-contentdiv" >'
                        + '<div class="VIS-tp-comments-input' + window_No + '" ><div class="vis-tp-emailDetailWrap"<div class="VIS-mail-user-div"><span class="VIS-mail-user-span">' + userInitials + '</span></div>'
                        + '<div class="VIS-contentTitile"><span class="VIS-mail-username">' + UserName + '</span><span id="mailSubject" class="VIS-mail-subject VIS-tp-recordLabels">' + result.Title
                        + '</span><div class="VIS-mail-content"><span class="VIS-mail-from"><span class="VIS-tp-recordLabels">' + VIS.Msg.getMsg("From") + ':&nbsp;</span><span style="word-break: break-word;">'
                        + result.From + '</span></div><small>' + new Date(result.Date).toLocaleString() + '</small></div><span class="VIS-mail-to"><span class="VIS-tp-recordLabels">' + VIS.Msg.getMsg("To") + ':&nbsp; </span>' + mailtoddlhtml + '</span></div></div>'
                        + '<div class="VIS-mail-body" >' + result.Detail + '</div></div>');

                    lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);

                    $($htmlcontent.find('.VIS-attachment-list a')).click(function () {
                        downLoadAttach(ID, $(this).text());
                    });

                    target.find('#dwnldAllAttach' + window_No).click(function () {
                        downLoadAllAttach(ID);
                    });
                    target.find('#showAttachment' + window_No).click(function () {
                        $htmlcontent.find('.VIS-attachment-list').toggle();
                    });
                    target.find('#VIS_btnComments' + window_No).click(function (e) {
                        saveComments(false, false, e);
                    });
                    target.find('#VIS_txtComments' + window_No).keyup(function (e) {
                        saveComments(false, false, e);
                    });
                    target.find('#VIS_viewAllComments' + window_No).click(function (e) {
                        if (target.find('#VIS_viewAllComments' + window_No).text() == VIS.Msg.getMsg('HideComments')) {
                            target.find('#VIS_viewMoreComments' + window_No).empty();
                            target.find('#VIS_viewMoreComments' + window_No).hide();
                            target.find('#VIS-tp-comments-input' + window_No).show();
                            target.find('#VIS_commentsMsg' + window_No).show();
                            target.find('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('ViewMoreComments'));
                            lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);
                        }
                        else
                            viewAll(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);
                    });
                    target.find("#VIS_imgReply" + window_No).click(function (e) {
                        var action = "R";
                        var hline = '<br><br><hr>';
                        panelAction(_Record_ID, _AD_Table_ID, hline + target.find('#VIS_mailBody' + window_No).html(), target.find('#VIS_mailSubject' + window_No).text(), attachID, action, e);
                    });
                    target.find("#VIS_imgReplyAll" + window_No).click(function (e) {
                        var action = "RA";
                        var hline = '<br><br><hr>';
                        panelAction(_Record_ID, _AD_Table_ID, hline + target.find('#VIS_mailBody' + window_No).html(), target.find('#VIS_mailSubject' + window_No).text(), attachID, action, e);
                    });
                    target.find("#VIS_imgForward" + window_No).click(function (e) {
                        var action = "F";
                        var hline = '<br><br><hr>';
                        panelAction(_Record_ID, _AD_Table_ID, hline + target.find('#VIS_mailBody' + window_No).html(), target.find('#VIS_mailSubject' + window_No).text(), attachID, action, e);
                    });
                }
            });
        };

        function showLetter(target, ID, UserName, window_No) {

            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedLetterDetails",
                datatype: "json",
                type: "get",
                cache: false,
                data: { ID: ID },
                success: function (data) {
                    var result = JSON.parse(data);
                    var _mattachID;

                    //if (result != null && result != '') {
                    _mattachID = VIS.Utility.Util.getValueOfString(result.ID);
                    var attchFile = '';
                    var userInitials = '';
                    var uname = VIS.Utility.Util.getValueOfString(UserName).split(' ');
                    if (uname.length > 1) {
                        userInitials = VIS.Utility.Util.getValueOfString(uname[0]).substring(0, 1).toUpper() + VIS.Utility.Util.getValueOfString(uname[1]).substring(0, 1).toUpper();
                    }
                    else
                        userInitials = VIS.Utility.Util.getValueOfString(UserName).substring(0, 2).toUpper();

                    if (result.Attach != null && result.Attach.length > 0)
                        attchFile = result.Attach[0].Name;

                    $mailbodyhtml = $('<div class="VIS-main-content">' +
                        '<div class="VIS-top-row">' +
                        '<section class="VIS-agenda-section">' +
                        '<h2>' + UserName + '</h2>' +
                        '<p>' + result.Title + '</p>' +
                        '</section>' +
                        '<section class="VIS-attachment-section"><h2>Attachment</h2>' +
                        '<div class="VIS-tp-attchDownload" id="dwnldLetterAttach' + window_No + '"><i class="vis vis-import" title="Download" style="opacity: 1;"></i><span>'
                        + VIS.Msg.getMsg("VIS_Download") + '</span></div>' +
                        '<div class="VIS-attachment-content">' +
                        '<span>' + attchFile + '</span>' +
                        '</div></section></div>' +
                        '<section class="VIS-transcript-section">' +
                        '<div class="VIS-conversation"><div class="VIS-message">' +
                        '<p id="VIS_mailBody' + window_No + '">' + result.Detail + '</p>' +
                        '</div></div></section></div>' +
                        '<section class="VIS-comments-section">' +
                        '<div class="VIS-comment-header">' +
                        '<h2>Comments</h2></div>' +
                        '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                        '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                        '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                        '<div class="VIS-comment-input">' +
                        '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                        '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                        '</div></div>' +
                        '</section>');

                    $printhtml = $('<div class="VIS-tp-contentdiv VIS-tp-contentPanel">'
                        + '<div class="" ><div style="width:100%" ><table height="50px" width="100%"><tr height="50px"><td><div class="VIS-mail-user-div"><span class="VIS-mail-user-span">' + userInitials + '</span></div></td>'
                        + '<td height="50px"><span class="VIS-mail-username">' + UserName + '</span><span id="mailSubject" class="VIS-mail-subject VIS-tp-recordLabels">' + result.Title + '</span><span class="VIS-mail-to">&nbsp;</span><span class="VIS-mail-from">&nbsp;</span></td><td height="50px" class="VIS-mail-date">' + result.Date + '</td></tr></table></div>'
                        + '<div id="mailBody" class="VIS-mail-body" >' + result.Detail + '</div></div>');

                    target.append($mailbodyhtml);
                    target.show();

                    $footerhtml = $('<div class="VIS-tp-downloadAttachment"><div class="VIS-tp-attachments"><i class="vis vis-attachment1" ></i>' +
                        '<span> ' + attchFile + '</span></div><div class="VIS-tp-attchDownload" id="dwnldLetterAttach">' +
                        '<i class="vis vis-import" title="Download" style="opacity: 1;"></i><span> ' + VIS.Msg.getMsg("VIS_Download") +
                        '</span></div></div></div>');

                    lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);

                    target.find('#VIS_btnComments' + window_No).click(function (e) {
                        saveComments(false, false, e);
                    });
                    target.find('#VIS_txtComments' + window_No).keyup(function (e) {
                        saveComments(false, false, e);
                    });
                    target.find('#VIS_viewAllComments' + window_No).click(function (e) {
                        if ($('#VIS_viewAllComments' + window_No).text() == VIS.Msg.getMsg('HideComments')) {
                            $('#VIS_viewMoreComments' + window_No).empty();
                            $('#VIS_viewMoreComments' + window_No).hide();
                            $('#VIS-tp-comments-input' + window_No).show();
                            $('#VIS_commentsMsg' + window_No).show();
                            $('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('ViewMoreComments'));
                            lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);
                        }
                        else
                            viewAll(VIS.Utility.Util.getValueOfInt(_mattachID), false, false);
                    });
                    target.find('#dwnldLetterAttach' + window_No).click(function () {
                        downLoadAttach(ID, attchFile);
                    });
                }
            });
        };

        function showCallInfo(ID, target, window_No) {
            var CallDetails_ID = VIS.Utility.Util.getValueOfInt(ID);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedCallDetails",
                datatype: "json",
                type: "get",
                cache: false,
                data: {
                    'ID': ID
                },
                success: function (data) {
                    var result = JSON.parse(data);
                    var _mattachID = CallDetails_ID;
                    var attchFile = ''; attach_ID = 0; attachLine_ID = 0;
                    var $callhtml, statusColor;
                    //Emp code:187
                    //To display the call duration
                    var duration = result.VA048_Duration >= 60 ? DurationCalculator(result.VA048_Duration) : result.VA048_Duration + ' ' + VIS.Msg.getMsg('VA048_Seconds');

                    if (result.Attach != null && result.Attach.length > 0) {
                        attchFile = result.Attach[0].Name;
                        attach_ID = result.Attach[0].AttID;
                        attachLine_ID = result.Attach[0].ID;
                    }

                    if (VIS.Utility.Util.getValueOfString(result.VA048_Status).toLower() == 'completed')
                        statusColor = 'style = "color: #42d819;"';

                    $callhtml = $('<div class="VIS-main-content">' +
                        '<div class="VIS-top-row">' +
                        '<section class="VIS-agenda-section VIS-column-2-layout w-100">' +
                        '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("Category") + '</h2><p>' + VIS.Msg.getMsg("VA048_CallType") + '</p></div>' +
                        '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("VA048_Duration") + '</h2><p>' + duration + '</p></div>' +
                        '</section>' +
                        '</div>' +
                        '<section class="VIS-agenda-section">' +
                        '<h2>' + VIS.Msg.getMsg("VA048_Notes") + '</h2>' +
                        '<p>' + result.VA048_CallNotes + '</p>' +
                        '</section>' +
                        '<section class="VIS-transcript-section">' +
                        '<h2>Transcript</h2>' +
                        '</section>' +
                        '</div>' +
                        '<section class="VIS-comments-section">' +
                        '<div class="VIS-comment-header">' +
                        '<h2>Comments</h2></div>' +
                        '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                        '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                        '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                        '<div class="VIS-comment-input">' +
                        '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                        '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                        '</div></div>' +
                        '</section>');

                    $printhtml = $('<div class="VIS-tp-contentdiv VIS-tp-contentPanel">'
                        + '<div id="VIS-tp-comments-input' + window_No + '" class="VIS-tp-comments-input">'
                        + '<div class="" >'
                        + '<table height="50px" width="100%">'
                        + '<tr class="VIS-call-col-header" ><td>' + VIS.Msg.getMsg("VA048_To") + '</td><td>' + VIS.Msg.getMsg("VA048_Duration") + '</td></tr>'
                        + '<tr class="VIS-call-col-data " ><td>' + result.VA048_To + '</td><td>' + result.VA048_Duration + '</td></tr>'
                        + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("Created") + '</td><td>' + VIS.Msg.getMsg("VA048_Status") + '</td></tr>'
                        + '<tr class="VIS-call-col-data"><td>' + result.Created + '</td><td style="color: #42d819;">' + result.VA048_Status + '</td></tr>'
                        + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("VA048_Price") + 'Price</td><td>' + VIS.Msg.getMsg("VA048_PriceUnit") + 'Price Unit</td></tr>'
                        + '<tr class="VIS-call-col-data"><td>' + result.VA048_Price + '</td><td>' + result.VA048_Price_Unit + '</td></tr>'
                        + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("Category") + '</td><td>' + VIS.Msg.getMsg("Attachments") + '</td></tr>'
                        + '<tr class="VIS-call-col-data"><td>' + VIS.Msg.getMsg("VA048_CallType") + '</td><td class="VIS-tp-attchDownload" id="dwnldCallAttach">' + attchFile + '</td></tr>'
                        + '</table>'
                        + '</div>'
                        + '</div>');

                    target.append($callhtml);
                    target.show();

                    lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, true);

                    target.find('#dwnldCallAttach').click(function () {
                        downLoadAttachCall(attachLine_ID, attach_ID, attchFile);
                    });
                    target.find('#VIS_btnComments' + window_No).click(function (e) {
                        saveComments(false, true, e);
                    });
                    target.find('#VIS_txtComments' + window_No).keyup(function (e) {
                        saveComments(false, true, e);
                    });
                    target.find('#VIS_viewAllComments' + window_No).click(function (e) {
                        if ($('#VIS_viewAllComments' + window_No).text() == VIS.Msg.getMsg('HideComments')) {
                            $('#VIS_viewMoreComments' + window_No).empty();
                            $('#VIS_viewMoreComments' + window_No).hide();
                            $('#VIS-tp-comments-input' + window_No).show();
                            $('#VIS_commentsMsg' + window_No).show();
                            $('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('ViewMoreComments'));
                            lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), false, true);
                        }
                        else
                            viewAll(VIS.Utility.Util.getValueOfInt(_mattachID), false, true);
                    });
                }
            });
        };

        function showAppointmentInfo(ID, target, window_No) {
            var attdInfo = "";
            var $appthtml;
            var ds = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedAppointmentDetails", { "record_ID": ID }, null);
            var _mattachID;
            if (ds != null) {
                strApp = "";
                _mattachID = VIS.Utility.Util.getValueOfString(ds["AppointmentsInfo_ID"]);

                $appthtml = $('<div class="VIS-main-content">' +
                    '<div class="VIS-top-row">' +
                    '<section class="VIS-agenda-section">' +
                    '<h2>' + VIS.Msg.getMsg("Description") + '</h2>' +
                    '<p>' + ds["Description"] + '</p>' +
                    '</section>' +
                    '<section class="VIS-attachment-section">' +
                    (ds["MeetingUrl"] != "" && ds["Transcript"] == "" ? '<div class="VIS-attachment-content">' +
                        '<span data-tid="' + ds["TokenRef_ID"] + '" data-mid="' + ds["MailConfig_ID"] +
                        '" data-joinurl="' + ds["MeetingUrl"] + '" data-rid="' + ID + '" data-joinurl="'
                        + ds["MeetingUrl"] + '" class="VIS-btn-Transcript">' +
                        '<img src="' + VIS.Application.contextUrl + 'Areas/VIS/Images/chat-download-icon.svg" alt="Download Transcript" title="' + VIS.Msg.getMsg('DownloadTranscript') + '">' +
                        //'<i class="fa fa-clone"></i></span>' +
                        '</div>' : "") +
                    '</section>' +
                    '</div>' +
                    '<section class="VIS-transcript-section">' +
                    '<h2>' + VIS.Msg.getMsg("Transcript") + '</h2>' +
                    '<pre>' + ds["Transcript"] + '</pre>' +
                    '</section>' +
                    '</div>' +

                    '<section class="VIS-comments-section">' +
                    '<div class="VIS-comment-header">' +
                    '<h2>Comments</h2>' +
                    '</div>' +
                    '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                    '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                    '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                    '<div class="VIS-comment-input">' +
                    '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                    '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                    '</div></div>' +
                    '</section>');

                $printhtml = $('<div class="VIS-tp-contentdiv VIS-tp-contentPanel">'
                    + '<div id="VIS-tp-comments-input' + window_No + '" class="VIS-tp-comments-input">'
                    + '<div>'
                    + '<table height="50px" width="100%">'
                    + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("Location") + '</td><td>' + VIS.Msg.getMsg("AllDay") + '</td></tr>'
                    + '<tr class="VIS-call-col-data"><td>' + ds["Location"] + '</td><td>' + ds["Allday"] + '</td></tr>'
                    + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("StartDate") + '</td><td>' + VIS.Msg.getMsg("EndDate") + '</td></tr>'
                    + '<tr class="VIS-call-col-data"><td>' + ds["StartDate"] + '</td><td>' + ds["EndDate"] + '</td></tr>'
                    + '<tr class="VIS-call-col-header"><td colspan="2">' + VIS.Msg.getMsg("Contacts") + '</td></tr>'
                    + '<tr class="VIS-call-col-data"><td colspan="2">' + attdInfo + '</td></tr>'
                    + '<tr class="VIS-call-col-header"><td colspan="2">' + VIS.Msg.getMsg("Description") + '</td></tr>'
                    + '<tr class="VIS-call-col-data"><td colspan="2">' + ds["Description"] + '</td></tr>'
                    + '</table>'
                    + '</div>'
                    + '</div>');

                target.append($appthtml);
                target.show();

                lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);

                target.find('.VIS-btn-Transcript').click(function (e) {
                    var url = $(this).data('joinurl');
                    var rID = $(this).data('rid');
                    var authProviderID = $(this).data('tid');
                    var mailConfigID = $(this).data('mid');
                    if (window.VA101 && url != "") {
                        if (userAccountID == 0) {
                            userAccountID = GetorCreateAPIUserAccount(authProviderID, mailConfigID);
                            if (userAccountID > 0) {
                                $('#VIS_tabPanelDataLoader' + window_No).show();
                                downloadTranscript(rID, url, target);
                            }
                        }
                        else {
                            $('#VIS_tabPanelDataLoader' + window_No).show();
                            downloadTranscript(rID, url, target);
                        }
                    }
                });
                target.find('#VIS_btnComments' + window_No).click(function (e) {
                    saveComments(true, false, e);
                });
                target.find('#VIS_txtComments' + window_No).keyup(function (e) {
                    saveComments(true, false, e);
                });
                target.find('#VIS_viewAllComments' + window_No).click(function (e) {
                    if ($('#VIS_viewAllComments' + window_No).text() == VIS.Msg.getMsg('HideComments')) {
                        $('#VIS_viewMoreComments' + window_No).empty();
                        $('#VIS_viewMoreComments' + window_No).hide();
                        $('#VIS-tp-comments-input' + window_No).show();
                        $('#VIS_commentsMsg' + window_No).show();
                        $('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('ViewMoreComments'));
                        lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);
                    }
                    else
                        viewAll(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);
                });
            }
            else {
                $('#VIS_tabPanelDataLoader' + window_No).hide();
            }
        };

        function GetorCreateAPIUserAccount(authProviderID, mailConfigID) {
            var dr = VIS.dataContext.getJSONRecord("VIS/HistoryDetailsData/GetUserAccount",
                { AuthProviderID: authProviderID, MailConfigID: mailConfigID });
            if (dr != null) {
                userAccountID = dr.UserAccount_ID;
                if (dr.ErrorMsg != "") {
                    var param = {
                        UserAccountID: userAccountID,
                        AuthCredentialID: dr.AuthCredentialID,
                        AuthProviderID: $(this).data('id')
                    }
                    obj = new VA101.VA101_GetAuthToken(window_No, param);
                    obj.show();
                    obj.onClose = function (userAccountID) {
                        userAccountID = userAccountID;
                    }
                }
            }
            return userAccountID;
        }

        function downloadTranscript(ID, joinUrl, target) {
            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "VIS/HistoryDetailsData/DownloadTranscript",
                { "AppointmentID": ID, "UserAccountID": userAccountID, "MeetingUrl": joinUrl }, function (dr) {
                    if (dr != null) {
                        //target.empty();
                        if (dr.ErrorMsg != "") {
                            VIS.ADialog.info("", "", dr.ErrorMsg);
                        }
                        else if (dr["transcript"]) {
                            //'<pre>' + dr["transcript"] + '</pre>'
                            target.find(".VIS-transcript-section").find('pre').text(dr["transcript"]);
                            target.find('.VIS-btn-Transcript').hide();
                        }
                        $('#VIS_tabPanelDataLoader' + window_No).hide();
                    }
                });
        }

        function showTask(rID, target, window_No) {
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedTaskDetails",
                datatype: "json",
                type: "get",
                cache: false,
                //async: false,
                data: { record_ID: rID },
                success: function (data) {
                    var result = JSON.parse(data);
                    var attdInfo = "";
                    var _mattachID, $taskhtml;
                    if (result != null) {
                        var strApp = "";
                        var attInfo = result.AttendeeInfo;
                        taskClosed = result.IsTaskClosed;
                        _mattachID = VIS.Utility.Util.getValueOfString(result.AppointmentsInfo_ID);
                        if (attInfo != null && attInfo != "") {
                            names = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "AttachmentHistory/GetUser", { "UserQry": attInfo }, null);
                            if (names != null && names.length > 0) {
                                strApp = "";
                                for (var k = 0; k < names.length; k++) {
                                    strApp += names[k] + ", ";
                                }
                                strApp = strApp.substring(0, strApp.length - 2);
                                attdInfo = strApp;
                            }
                        }
                        var prtyText, prtyTextColor;

                        if (VIS.Utility.Util.getValueOfString(result.PriorityKey) != '') {
                            if (result.PriorityKey == "1") {
                                prtyTextColor = "color: #f60000;";
                                prtyText = "Urgent";
                            }
                            else if (result.PriorityKey == "3") {
                                prtyTextColor = "color: #fb9300;";
                                prtyText = "High";
                            }
                            else if (result.PriorityKey == "5") {
                                prtyTextColor = "color: #6f04e8;";
                                prtyText = "Medium";
                            }
                            else if (result.PriorityKey == "7") {
                                prtyTextColor = "color: #03e5f3;";
                                prtyText = "Low";
                            }
                            else if (result.PriorityKey == "9") {
                                prtyTextColor = "color: #42d819;";
                                prtyText = "Minor";
                            }
                        }

                        $taskhtml = $('<div class="VIS-main-content">' +
                            '<div class="VIS-top-row">' + (result.IsTaskClosed ? '<span class="VIS-tp-taskTag">' + VIS.Msg.getMsg("Closed") + '</span>' : '') +
                            '<section class="VIS-agenda-section VIS-column-2-layout w-75">' +
                            '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("Category") + '</h2><p>' + result.CategoryName + '</p></div>' +
                            '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("ASSIGNEDTO") + '</h2><p>' + result.AssignedTo + '</p></div>' +
                            '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("StartDate") + '</h2><p>' + new Date(result.StartDate).toLocaleString() + '</p></div>' +
                            '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("EndDate") + '</h2><p>' + new Date(result.EndDate).toLocaleString() + '</p></div>' +
                            '</section>' +
                            '<section class="VIS-column-2-layout">' +
                            '<div class="VIS-column-item" style="width: 80px;">' +
                            '<h2>' + VIS.Msg.getMsg("Priority") + '</h2><p style="VIS-' + prtyTextColor + '">' + prtyText + '</p></div>' +
                            '<div class="VIS-column-item"><h2>' + VIS.Msg.getMsg("Status") + '</h2><p>' + (VIS.Utility.Util.getValueOfInt(result.TaskStatus) * 10) + '%</p></div>' +
                            '</section></div> ' +
                            '<div class="VIS-top-row"><div class="vis-float-left vis-frm-ls-top"><input id="VIS_chkTaskComplete' + window_No
                            + '" value="1" type="checkbox" class="vis-float-left"><label id="VIS_lblTaskComplete' + window_No
                            + '" for="chkTaskComplete" class="wsp-task-from-inputLabel vis-float-left" style="margin:0 0 0 5px;">' + VIS.Msg.getMsg("Closed")
                            + '</label></div></td><td><div class="vis-float-right"><a href="javascript:void(0)" id="VIS_hlnktaskdone' + window_No
                            + '" class="vis-btn vis-btn-done vis-icon-doneButton vis-float-right vis-btnOk"> <span class="vis-btn-ico vis-btn-done-bg vis-btn-done-border"></span>'
                            + VIS.Msg.getMsg("Done") + '</a></div></div>' +
                            '<section class="VIS-agenda-section">' +
                            '<h2>' + VIS.Msg.getMsg("Result") + '</h2>' +
                            '<div class="VIS-conversation"><div class="VIS-message">' +
                            '<p>' + result.Result + '</p>' +
                            '</div></section>' +
                            '<section class="VIS-agenda-section">' +
                            '<h2>' + VIS.Msg.getMsg("Description") + '</h2>' +
                            '<div class="VIS-conversation"><div class="VIS-message">' +
                            '<p>' + result.Description + '</p>' +
                            '</div>' +
                            '</section>' +
                            '<section class="VIS-transcript-section">' +
                            '<h2>Transcript</h2>' +
                            '</section>' +
                            '</div>' +
                            '<section class="VIS-comments-section">' +
                            '<div class="VIS-comment-header">' +
                            '<h2>Comments</h2></div>' +
                            '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                            '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                            '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                            '<div class="VIS-comment-input">' +
                            '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                            '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                            '</div></div>' +
                            '</section>');

                        $printhtml = $('<div class="VIS-tp-contentdiv VIS-tp-contentPanel">'
                            + '<div id="VIS-tp-comments-input' + window_No + '" class="VIS-tp-comments-input">'
                            + '<div class="VIS-tp-taskcontTag" >'
                            + (result.IsTaskClosed ? '<span class="VIS-tp-taskTag">' + VIS.Msg.getMsg("Closed") + '</span>' : '')
                            + '<table height="50px" width="100%">'
                            + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("Priority") + '</td><td>' + VIS.Msg.getMsg("Status") + '</td></tr>'
                            + '<tr class="VIS-call-col-data"><td style="' + prtyTextColor + '">' + result.Priority + '</td><td>' + (VIS.Utility.Util.getValueOfInt(result.TaskStatus) * 10) + '%</td></tr>'
                            + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("StartDate") + '</td><td>' + VIS.Msg.getMsg("EndDate") + '</td></tr>'
                            + '<tr class="VIS-call-col-data"><td>' + result.StartDate + '</td><td>' + result.EndDate + '</td></tr>'
                            + '<tr class="VIS-call-col-header"><td>' + VIS.Msg.getMsg("ASSIGNEDTO") + '</td><td>' + VIS.Msg.getMsg("Category") + '</td></tr>'
                            + '<tr class="VIS-call-col-data"><td>' + result.AssignedTo + '</td><td>' + result.CategoryName + '</td></tr>'
                            + '<tr class="VIS-call-col-header"><td colspan="2">' + VIS.Msg.getMsg("Result") + '</td></tr>'
                            + '<tr class="VIS-call-col-data"><td colspan="2">' + result.Result + '</td></tr>'
                            + '<tr class="VIS-call-col-header"><td colspan="2">' + VIS.Msg.getMsg("Description") + '</td></tr>'
                            + '<tr class="VIS-call-col-data"><td colspan="2">' + result.Description + '</td></tr>'
                            + '</table>'
                            + '</div>'
                            + '</div>');

                        target.append($taskhtml);
                        target.show();

                        lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);
                        attdInfo = "";

                        target.find('#VIS_btnComments' + window_No).click(function (e) {
                            saveComments(true, false, e);
                        });
                        target.find('#VIS_txtComments' + window_No).keyup(function (e) {
                            saveComments(true, false, e);
                        });
                        target.find('#VIS_viewAllComments' + window_No).click(function (e) {
                            if ($('#VIS_viewAllComments' + window_No).text() == VIS.Msg.getMsg('HideComments')) {
                                $('#VIS_viewMoreComments' + window_No).empty();
                                $('#VIS_viewMoreComments' + window_No).hide();
                                $('#VIS-tp-comments-input' + window_No).show();
                                $('#VIS_commentsMsg' + window_No).show();
                                $('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('ViewMoreComments'));
                                lastHistoryComment(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);
                            }
                            else
                                viewAll(VIS.Utility.Util.getValueOfInt(_mattachID), true, false);
                        });

                        //changes done by Emp Id:187
                        //After clicking on div if the task is closed it need to hide closed checkbox and Done 
                        if (taskClosed) {
                            $taskhtml.find("#VIS_chkTaskComplete" + window_No).hide();
                            $taskhtml.find("#VIS_hlnktaskdone" + window_No).hide();
                            $taskhtml.find("#VIS_lblTaskComplete" + window_No).hide();
                        }

                        // Task is updated when task is closed from tab panel
                        $taskhtml.find("#VIS_hlnktaskdone" + window_No).on("click", function (e) {
                            if ($lblTaskMsg != null)
                                $lblTaskMsg.empty();
                            var t_title = result.Subject;
                            var t_ctgry = result.CategoryName;
                            var t_sdatetime = result.StartDate;
                            var t_edatetime = result.EndDate;
                            if (t_edatetime < t_sdatetime) {
                                $lblTaskMsg.append(VIS.Msg.getMsg("WSP_EndDateShouldBeGreaterThanStartDate"));
                                return;
                            }
                            var t_desc = result.Description;
                            var t_result = result.Result;
                            var t_prtykey = result.PriorityKey;
                            var t_prty = result.Priority;
                            var t_sts = parseInt(result.TaskStatus);
                            var t_ststext = result.TaskStatus;
                            var t_isClosed = "";
                            var $chkTaskCmplte = $taskhtml.find("#VIS_chkTaskComplete" + window_No).prop("checked", true);;
                            if ($chkTaskCmplte.is(":checked")) {
                                t_isClosed = true;
                            }
                            else {
                                t_isClosed = false;
                            }
                            var models = [];
                            var task_ID = result.AppointmentsInfo_ID;
                            var t_cntact_id = [];
                            WspSharedUser = [];
                            var Ad_UserID = 0;
                            var taskusrID = result.UserID;
                            if (taskusrID != null && taskusrID != 0) {
                                Ad_UserID = taskusrID;
                            }
                            else {
                                Ad_UserID = VIS.context.getAD_User_ID();
                            }
                            models.push({ AppointmentsInfo_ID: task_ID, Title: t_title, Description: t_desc, Start: t_sdatetime, End: t_edatetime, Categories: t_ctgry, TaskStatus: t_sts, PriorityKey: t_prtykey, Ad_User_ID: Ad_UserID, Contacts: t_cntact_id, ContactsInfo: WspSharedUser, isClosed: t_isClosed, Result: t_result });
                            if (t_title != "" && t_title.trim().length > 0) {
                                $.ajax({
                                    url: VIS.Application.contextUrl + 'WSP/Home/UpdateJson_Task',
                                    type: "POST",
                                    datatype: "JSON",
                                    contentType: "application/json; charset=utf-8",
                                    async: true,
                                    //data: { models: models },
                                    data: JSON.stringify({ models: models }),
                                    success: function (result) {
                                        var data = JSON.parse(result);
                                        VIS.ADialog.info("WSP_TaskUpdated", true, null);
                                        $taskhtml.find("#VIS_chkTaskComplete" + window_No).hide();
                                        $taskhtml.find("#VIS_hlnktaskdone" + window_No).hide();
                                        $taskhtml.find("#VIS_lblTaskComplete" + window_No).hide();
                                    }
                                });
                            }
                        });
                    }
                },
                error: function (e) {
                }
            });
        };

        function showAttachment(target, ID, UserName, window_No) {
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedAttachmentDetails",
                datatype: "json",
                type: "get",
                cache: false,
                data: { record_ID: ID },
                success: function (data) {
                    var result = JSON.parse(data);
                    var attchFile = '', attachments = '';

                    if (result != null && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                            var imgTag = '';
                            if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.doc' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.docx') {
                                imgTag = '<i class="vis vis-doc-word"></i>';//'<img src="./Areas/VIS/Images/word.png" >';
                            }
                            else if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.xls' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.xlsx') {
                                imgTag = '<i class="vis vis-doc-excel"></i>';//'<img src="./Areas/VIS/Images/excel.png" >';
                            }
                            else if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.ppt' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.pptx') {
                                imgTag = '<i class="vis vis-doc-pp"></i>';//'<img src="./Areas/VIS/Images/ppt.png" >';
                            }
                            else if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.pdf') {
                                imgTag = '<i class="vis vis-doc-pdf"></i>';//'<img src="./Areas/VIS/Images/pdf.png" >';
                            }
                            else if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.txt') {
                                imgTag = '<i class="vis vis-doc-text"></i>';//'<img src="./Areas/VIS/Images/text.png" >';
                            }
                            else if (VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.png' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.jpg' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.jpeg' || VIS.Utility.Util.getValueOfString(result[i].FileType).toString().toLower() == '.gif') {
                                imgTag = '<i class="vis vis-doc-img"></i>';//'<img src="./Areas/VIS/Images/image.png" >';
                            }
                            else {
                                imgTag = '<i class="vis vis-doc-img"></i>';//'<img src="./Areas/VIS/Images/text.png" >';
                            }

                            attachments += '<div class="VIS-tp-recordWrap"><div class="VIS-tp-attachIcon">' + imgTag + '</div><div data-filename="' + VIS.Utility.Util.getValueOfString(result[i].FileName) +
                                '" data-attid="' + VIS.Utility.Util.getValueOfString(result[i].AD_Attachment_ID) + '" data-id="' + VIS.Utility.Util.getValueOfString(result[i].ID) +
                                '" class="VIS-tp-attachInfo"><h6>' + VIS.Utility.Util.getValueOfString(result[i].FileName) + '</h6><small>' + VIS.Utility.Util.getValueOfString(result[i].FileSize) + ' kb</small></div>'
                                + '<div class="VIS-tp-recordInfoRight"><span class="VIS-tp-dateTime">' + new Date(result[i].CreatedOn).toLocaleString() + '</span><small>By: ' + VIS.Utility.Util.getValueOfString(result[i].CreatedBy) + '</small></div></div>';
                        }
                    }

                    $htmlcontent = $('<div class="VIS-main-content"><div class="VIS-top-row">' +
                        '<section class="VIS-attachment-section"><h2>' + VIS.Msg.getMsg("Attachment") + '</h2>' +
                        attachments +
                        //'<div class="VIS-attachment-content">' +
                        //'<div class="VIS-downloadAll-link"><i id="dwnldAllAttach' + window_No + '" class="vis vis-import" title="Download All" style="opacity: 1;"></i>' +
                        //'<span id="dwnldAllAttach' + window_No + '">' + VIS.Msg.getMsg("VIS_DownloadAll") + (noOfAttchs > 0 ? ' (' + noOfAttchs + ')' : '') +
                        //'</span><span id="showAttachment' + window_No + '" class="vis vis-arrow-down"></span></div>' +
                        //'<div class="VIS-attachment-list" style="display:none;"></div>' +
                        '</div></section></div></div >' +

                        '<section class="VIS-comments-section">' +
                        '<div class="VIS-comment-header"><h2>Comments</h2></div>' +
                        '<div id="VIS_viewMoreComments' + window_No + '" style="display:none;" class="VIS-tp-commentsPanel"></div>' +
                        '<div id="VIS_commentsdata' + window_No + '" class="vis-attachhistory-comments-container"><div class="pr-0 m-0 VIS-tp-commentsField d-flex flex-column w-100">' +
                        '<p id="VIS_viewAllComments' + window_No + '" class="vis-attachhistory-view-comments"> ' + VIS.Msg.getMsg('ViewMoreComments') + '</p>' +
                        '<div class="VIS-comment-input">' +
                        '<input id="VIS_txtComments' + window_No + '" type="text" placeholder="' + VIS.Msg.getMsg('TypeComment') + '" class="VIS-comment-field">' +
                        '<button class="VIS-send-button" id="VIS_btnComments' + window_No + '">➤</button>' +
                        '</div></div>' +
                        '</section>');

                    target.append($htmlcontent);
                    target.show();

                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                    attdInfo = "";
                    target.find(".VIS-tp-attachInfo").click(function (e) {
                        $('.VIS-tp-contentWrap').css({ "cursor": "wait" });
                        downLoadHistoryAttach(e);
                    });
                }
            });
        };

        function showChat(ID, UserName, window_No) {
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/GetSelectedChatDetails",
                datatype: "json",
                type: "get",
                cache: false,
                data: { record_ID: ID },
                success: function (data) {
                    var result = JSON.parse(data);
                    var senderImg = '', receptorImg = '', chatData = '';
                    var isDisplayChatbox = false;
                    var rec_ID = 0;
                    var _createdDt, createdDt;
                    var loginUserName = VIS.context.getAD_User_Name();

                    if (result != null && result.length > 0) {
                        var isSender = '';
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].Created != null && result[i].Created != '') {
                                var currentDt = new Date();
                                _createdDt = new Date(result[i].Created.toString());
                                var hours = _createdDt.getHours();
                                var mins = _createdDt.getMinutes();
                                var mid = ' AM';
                                if (hours == 0) {
                                    hours = 12;
                                }
                                else if (hours < 12) {
                                    hours = hours;
                                }
                                else if (hours == 12) {
                                    hours = hours;
                                    mid = ' PM';
                                }
                                else if (hours > 12) {
                                    hours = hours - 12;
                                    mid = ' PM';
                                }

                                createdDt = _createdDt.getMonth() + '/' + _createdDt.getDate() + '/' + _createdDt.getFullYear() + ' | ' + ((hours >= 10) ? hours : ('0' + hours)) + ':' + ((mins >= 10) ? mins : ('0' + mins)) + mid;
                            }
                            if (i == 0) {
                                chatData = '<div class="VIS-tp-contentWrap VIS-tp-attachmentContent">';
                            }

                            if (i == 0 || i == (VIS.Utility.Util.getValueOfInt(result.length) - 1)) {
                                if (_createdDt.getDate() == currentDt.getDate() && _createdDt.getMonth() == currentDt.getMonth() && _createdDt.getFullYear() == currentDt.getFullYear())
                                    isDisplayChatbox = true;
                            }

                            rec_ID = VIS.Utility.Util.getValueOfInt(result[i].Record_ID);

                            if (loginUserName.toString().toLower() == result[i].UserName.toString().toLower()) //|| (i > 0 && result[i].UserName.toString() != result[i - 1].UserName.toString())
                            {
                                chatData += '<div class="VIS-tp-recordWrap VIS-tp-msgSend">' +
                                    '<div class="VIS-tp-userImg" >' + result[i].UserImage + '</div>' +
                                    '<div class="VIS-tp-recordInfo pr-0">' +
                                    '<div class="VIS-tp-chatInfo"><h6>' + result[i].UserName + '</h6><span>' + _createdDt.toLocaleString() + '</span></div>' +
                                    '<p class="VIS-tp-message">' + result[i].CharacterData + '</p></div></div >'

                            }
                            else {
                                chatData += '<div class="VIS-tp-recordWrap VIS-tp-msgRecevied">' +
                                    '<div class="VIS-tp-userImg" >' + result[i].UserImage + '</div>' +
                                    '<div class="VIS-tp-recordInfo pr-0">' +
                                    '<div class="VIS-tp-chatInfo"><h6>' + result[i].UserName + '</h6><span>' + _createdDt.toLocaleString() + '</span></div>' +
                                    '<p class="VIS-tp-message">' + result[i].CharacterData + '</p></div></div>'
                            }

                            if (i == (result.length - 1))
                                chatData += '</div>';
                        }
                    }

                    if ($rootcontent.length < 1) {
                        $rootcontent = $('<div id="VIS_recordDetail' + window_No + '" class="VIS-tp-detailsPanel"></div>');
                    }
                    $rootcontent.empty();
                    var chatboxhtml = '';
                    if (isDisplayChatbox) {
                        chatboxhtml = '<div class="VIS-chatBoxWrap"><div class="VIS-chat-box"><textarea id="VIS_chatBox' + window_No + '" class="VIS-chat-msgbox" style="height:46px;" maxlength="500"></textarea></div>'
                            + '<div class="VIS-chat-send-div"><div style="float:left;"></div><div class="VIS-chat-send"><i class="fa fa-paper-plane VIS-tp-chatBtn" data-chid="' + VIS.Utility.Util.getValueOfInt(ID).toString() + '" data-recid="' + rec_ID.toString() + '" id="VIS_imgSend' + window_No + '" ></i><i id="VIS_imgCancel' + window_No + '" class="fa fa-times-circle VIS-tp-chatBtn"></i></div></div></div>';
                    };
                    $htmlcontent = $('<div class="VIS-contentHeadOuter VIS-tp-borderBott" ><div class= "VIS-tp-recordIcon" ><i class="vis vis-chat"></i></div><div class="VIS-contentHead"><span class="VIS-letter-header">' + VIS.Msg.getMsg('Chat') + '</span></div><div class="align-items-center d-flex VIS-tp-rightIcons" ><span id="VIS_prtHistory' + window_No + '"><i class="vis vis-print" title="Print"></i></span><span><i id="VIS_prevRecord' + window_No + '" class="fa fa-arrow-left"></i></span><span><i id="VIS_nextRecord' + window_No + '" class="fa fa-arrow-right"></i></span><span class="VIS-close-btn" id="VIS_btnClose' + window_No + '"><i class="vis vis-cross"></i></span></div></div>');

                    $printhtml = $('<div class="VIS-tp-contentdiv VIS-tp-contentPanel">'

                        + '<div class="' + (isDisplayChatbox ? 'VIS-chatContentWrap' : '') + '" >'
                        + chatData
                        + '</div>');

                    $footerhtml = $(chatboxhtml
                        + '</div>');

                    var $contenthtml = $('<div class="VIS-mail-header VIS-tp-recordDetail"></div>');
                    $contenthtml.append($printhtml).append($footerhtml);
                    $rootcontent.append($htmlcontent).append($contenthtml);

                    if (!$root.html().toString().contains('VIS_recordDetail' + window_No))
                        $root.append($rootcontent);
                    //if (!$root.html().toString().contains('VIS_pagingHtml' + window_No))
                    //    $root.append($paginghtml);

                    attdInfo = "";
                    $('#VIS_recordDetail' + window_No).show();
                    $('#VIS_imgSend' + window_No).click(function (e) {
                        saveChat(e);
                    });
                    $('#VIS_imgCancel' + window_No).click(function (e) {
                        $('#VIS_chatBox' + window_No).val('');
                    });
                }
            });
        };

        function DurationCalculator(time) {
            var hr = ~~(time / 3600);
            var min = ~~((time % 3600) / 60);
            var sec = time % 60;
            var sec_min = "";
            if (hr > 0) {
                sec_min += "" + hrs + ":" + (min < 10 ? "0" : "");
            }
            sec_min += "" + min + ":" + (sec < 10 ? "0" : "");
            sec_min += "" + sec;
            return sec_min + ' ' + VIS.Msg.getMsg('VA048_Minutes');
        }

        function finalPrint(html) {
            var mywindow = window.open();
            var link = '<link rel="stylesheet" href="' + VIS.Application.contextUrl + 'Areas/VIS/Content/VIS.all.min.css" />';

            mywindow.document.write(link + html);

            setTimeout(function () {
                mywindow.print();
                mywindow.close();
            }, 300);

        };

        function getFormattedDate(date) {
            //if (date instanceof Date) {
            if (date.indexOf('Z') > 0) {
                date = new Date(date);
            } else {
                date = new Date(date + "Z");
            }
            date = new Date(date);
            //}
            let options = {
                weekday: 'short',     // "Wed"
                year: 'numeric',
                month: 'numeric',     // "6"
                day: 'numeric',       // "18"
                hour: 'numeric',
                minute: '2-digit',
                hour12: true          // "4:40 PM"
            };

            // Format the date
            return date.toLocaleString(undefined, options);
        }

        function downLoadAllAttach(ID) {
            if (ID == null || ID == 0) {
                return;
            }

            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/DownloadAllAttachments",
                datatype: "json",
                type: "get",
                cache: false,
                data: { ID: ID, Name: name },
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result != null && result != "") {
                        var url = VIS.Application.contextUrl + "TempDownload/" + result;
                        window.open(url);
                    }
                    else {
                        VIS.ADialog.error("AttachmentNotFound");
                    }
                }
            });
        };

        function downLoadHistoryAttach(e) {
            var target = e.target;
            var name = '';
            var ID = '';
            var AttID = '';

            if ($(target).is('div')) {
                name = $(target).data('filename');
                AttID = $(target).data('attid');
                ID = $(target).data('id');
            }
            else if ($(target).is('h6')) {
                name = $(target).parent().data('filename');
                AttID = $(target).parent().data('attid');
                ID = $(target).parent().data('id');
            }

            if (ID == null || ID == 0) {
                return;
            }

            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/DownloadHistoryAttachment",
                datatype: "json",
                type: "get",
                cache: false,
                data: { AttID: AttID, ID: ID, Name: name },
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result != null && result != "") {
                        var url = VIS.Application.contextUrl + "TempDownload/" + result;
                        $('#tblAttach').css({ "cursor": "default" });
                        window.open(url);
                    }
                    else {
                        VIS.ADialog.error("AttachmentNotFound");
                    }
                }
            });
        };

        function downLoadAttach(ID, name) {
            if (ID == null || ID == 0) {
                return;
            }
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/HistoryDetailsData/DownloadAttachment",
                datatype: "json",
                type: "get",
                cache: false,
                data: { ID: ID, Name: name },
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result != null && result != "") {
                        var url = VIS.Application.contextUrl + "TempDownload/" + result;
                        window.open(url);
                    }
                    else {
                        VIS.ADialog.error("AttachmentNotFound");
                    }
                }
            });
        };

        function downLoadAttachCall(ID, AttID, name) {

            if (ID == null || ID == 0) {
                return;
            }

            $.ajax({
                url: VIS.Application.contextUrl + "AttachmentHistory/DownloadAttachmentCall",
                datatype: "json",
                type: "get",
                cache: false,
                data: { AttID: AttID, ID: ID, Name: name },
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result != null && result != "") {
                        var url = VIS.Application.contextUrl + "TempDownload/" + result;
                        window.open(url);
                    }
                    else {
                        VIS.ADialog.error("AttachmentNotFound");
                    }
                }
            });
        };

        function panelAction(_Record_ID, _AD_Table_ID, detailHtml, titleText, attachID, data, e) {
            var email = null;
            var target = e.target;
            var mailfrom, mailto, mailcc, mailbcc;

            if ($(target).is('i') && (data == "R" || data == "RA")) {
                mailfrom = $(target).data('mailfrom');
                mailto = $(target).data('mailto');
                mailcc = $(target).data('mailcc');
                mailbcc = $(target).data('mailbcc');
                if (data == "R") {
                    mailto = mailfrom;
                }
                else {
                    mailto = mailfrom + "; " + mailto;
                }
            }

            if (data == "R" || data == "RA") {
                email = new VIS.Email(mailto, null, null, _Record_ID, true, true, _AD_Table_ID, detailHtml, 'RE: ' + VIS.Utility.Util.getValueOfString(titleText), attachID);
            }
            else if (data == "F") {
                email = new VIS.Email('', null, null, _Record_ID, true, true, _AD_Table_ID, detailHtml, 'FW: ' + VIS.Utility.Util.getValueOfString(titleText), attachID);
            }
            var c = new VIS.CFrame();
            c.setName(VIS.Msg.getMsg("EMail"));
            c.setTitle(VIS.Msg.getMsg("EMail"));
            c.hideHeader(true);
            c.setContent(email);
            c.show();

            if (data == "RA") {
                email.showCcBccMails((mailcc != null ? mailcc.replace(/,/g, ';') : ''), (mailbcc != null ? mailbcc.replace(/,/g, ';') : ''));
            }
            email.initializeComponent();
        };

        function saveChat(e) {
            var target = e.target;
            var rec_ID = 0, ch_id = 0; _AD_Table_ID = 876;
            if ($(target).is('i')) {
                rec_ID = $(target).data('recid');
                ch_id = $(target).data('chid');
            }

            var text = $('#VIS_chatBox' + window_No).val();
            if ($.trim(text) == "" || text == "" || text == null) {
                VIS.ADialog.info("EnterData");
                if (e != undefined) {
                    e.preventDefault();
                }
                return false;
            }
            var infoName = 'info';
            var infoDisplay = 'test';
            var chat = new VIS.Chat(rec_ID, ch_id, _AD_Table_ID, infoName + ": " + infoDisplay, this.windowNo);
            chat.prop.ChatText = text;
            chat.onClose = function () {
            }

            VIS.dataContext.saveChat(chat.prop);

            showChat(ch_id, '', window_No);
        };

        function viewAll(record_ID, isAppointment, isCall) {

            $.ajax({
                url: VIS.Application.contextUrl + "AttachmentHistory/ViewChatonHistory",
                datatype: "json",
                type: "POST",
                cache: false,
                data: { record_ID: record_ID, isAppointment: isAppointment, isCall: isCall },
                success: function (data) {
                    var result = JSON.parse(data);
                    createCommentsSection(result, isAppointment, isCall);
                },
                error: function (data) {
                    VIS.ADialog.error("RecordNotSaved");
                }
            });
        };

        function saveComments(isAppointment, isCall, e) {
            var target = e.target;
            if (e.keyCode != undefined) {
                if (e.keyCode != 13) {
                    return;
                }
            }
            if (e.keyCode == undefined && !$(target).hasClass("VIS-send-button")) {
                return;
            }
            var ID = 0;
            ID = $('#rowId' + _selectedRecId).data("rid");
            if (ID == 0) {
                return;
            }
            var comme = '';
            comme = $('#VIS_txtComments' + window_No).val();

            if (comme.length == 0) {
                return;
            }
            $('#VIS_tabPanelDataLoader' + window_No).show();
            $.ajax({
                url: VIS.Application.contextUrl + "AttachmentHistory/SaveComment",
                datatype: "json",
                type: "POST",
                cache: false,
                data: { ID: ID, Text: comme, isAppointment: isAppointment, isCall: isCall },
                success: function (data) {
                    // var rID = $('#rowId' + recId).data('rid');
                    var result = JSON.parse(data);
                    var updateComment = true;
                    var $commenthtml;
                    var userimg;
                    var value;
                    if (result != null) {
                        value = result.length - 1;
                    }

                    if (result[value].UserImage != "VIS_NoRecordFound" && result[value].UserImage != "VIS_FileDoesn'tExist" && result[value].UserImage != null) {
                        userimg = '<img  class="userAvatar-Feeds"  src="' + result[value].UserImage + '?' + new Date() + '">';
                    }
                    else {
                        userimg = '<i class="fa fa-user userAvatar-Feeds"></i>';
                    }

                    $('#VIS_txtComments' + window_No).val("");

                    if ($('#VIS_commentsdata' + window_No).html().contains("VIS_commentsMsg")) {
                        $commenthtml = $('<div class= "vis-attachhistory-comment-detail VIS-feedDetails-cmnt d-flex" >' +
                            userimg +
                            '<div class="vis-attachhistory-comment-text ml-0">' +
                            '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">Me </h6><div class="vis-attachhistory-comment-dateTime"><p>' + new Date().toLocaleString().replace(",", "").replace(/:.. /, " ") + '</p></div></div>' +
                            '<p class= "VIS-attachhistory-comment-text" >' + comme + '</p></div>' +
                            '</div>');
                        $('#VIS_commentsMsg' + window_No).empty();
                        $('#VIS_commentsMsg' + window_No).append($commenthtml);
                        if ($('#VIS_viewMoreComments' + window_No).is(':visible')) {
                            $('#VIS_viewMoreComments' + window_No).append($commenthtml);
                        }
                        $('#VIS_commentsdata' + window_No).show();
                        $('#VIS_commentsMsg' + window_No).show();


                    }
                    else {
                        $commenthtml = $('<div id="VIS_commentsMsg' + window_No + '"  class="vis-attachhistory-comment-data mb-0 VIS-tp-commentData">' +
                            '<div class= "vis-attachhistory-comment-detail VIS-feedDetails-cmnt d-flex" >' +
                            // '<i class="fa fa-user userAvatar-Feeds"></i>' +
                            userimg +
                            '<div class="vis-attachhistory-comment-text ml-0">' +
                            '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">Me </h6><div class="vis-attachhistory-comment-dateTime"><p>' + new Date().toLocaleString().replace(",", "").replace(/:.. /, " ") + '</p></div></div>' +
                            '<p class= "VIS-attachhistory-comment-text" >' + comme + '</p></div>' +
                            '</div></div>');
                        $('#VIS_commentsdata' + window_No).prepend($commenthtml);
                        if ($('#VIS_viewMoreComments' + window_No).is(':visible')) {
                            $('#VIS_viewMoreComments' + window_No).append($commenthtml);
                        }
                    }
                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                },
                error: function (data) {
                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                    VIS.ADialog.error("RecordNotSaved");
                }
            });
        };

        function updateComments(str, result) {

            str += ' <div class="vis-attachhistory-comment-data  mb-0 VIS-tp-commentData"><div class="vis-attachhistory-comment-detail VIS-feedDetails-cmnt d-flex">';

            if (result.UserImage != "VIS_NoRecordFound" && result.UserImage != "VIS_FileDoesn'tExist" && result.UserImage != null) {
                str += '<img  class="userAvatar-Feeds"  src="' + result.UserImage + '?' + new Date() + '">';
            }
            else {
                str += '<i class="fa fa-user userAvatar-Feeds"></i>';
            }
            str += '<div class="vis-attachhistory-comment-text ml-0">';

            if (result.CreatedBy == VIS.Env.getCtx().getAD_User_ID()) {
                str += '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">' + VIS.Msg.getMsg("Me") + " </h6>";
            }
            else {
                str += '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">' + result.UserName + "</h6>"
            }

            str += '<div class="vis-attachhistory-comment-dateTime"><p>' + new Date(result.Created).toLocaleString() + '</p>' + '</div></div>' +
                ' <p class="VIS-attachhistory-comment-text">' + result.CharacterData + '</p>' +
                '</div></div></div>';

            return str;
        };

        function createCommentsSection(result, isappointment, iscall) {
            if (result.length > 0) {
                var str = '<div class="vis-attachhistory-comments-container">';

                for (var i = 0; i < result.length; i++) {
                    str = updateComments(str, result[i]);
                }
                str += '</div>';
                $('#VIS_viewMoreComments' + window_No).show();
                $('#VIS-tp-comments-input' + window_No).hide();
                $('#VIS_viewMoreComments' + window_No).empty();
                $('#VIS_commentsMsg' + window_No).hide();
                $('#VIS_viewAllComments' + window_No).text(VIS.Msg.getMsg('HideComments'));
                $('#VIS_viewMoreComments' + window_No).height($root.find('.VIS-tp-contentdiv').height() - $('#VIS_commentsdata' + window_No).height());
                $('#VIS_viewMoreComments' + window_No).append(str);
            }
            //else
            //    VIS.ADialog.error("NoRecordFound");
        };

        function updateRecentComments(str, result) {

            str += '<div class="vis-attachhistory-comment-detail VIS-feedDetails-cmnt d-flex">';

            if (result.UserImage != "VIS_NoRecordFound" && result.UserImage != "VIS_FileDoesn'tExist" && result.UserImage != null) {
                str += '<img  class="userAvatar-Feeds"  src="' + result.UserImage + '?' + new Date() + '">';
            }
            else {
                str += '<i class="fa fa-user userAvatar-Feeds"></i>';
            }
            str += '<div class="vis-attachhistory-comment-text ml-0">';

            if (result.CreatedBy == VIS.Env.getCtx().getAD_User_ID()) {
                str += '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">' + VIS.Msg.getMsg("Me") + " </h6>";
            }
            else {
                str += '<div class="d-flex justify-content-between VIS-tp-commentHead"><h6 class="VIS-attachhistory-comment-text">' + result.UserName + "</h6>"
            }

            str += '<div class="vis-attachhistory-comment-dateTime"><p>' + new Date(result.Created).toLocaleString() + '</p>' + '</div></div>' +
                ' <p class="VIS-attachhistory-comment-text">' + result.CharacterData + '</p>' +
                '</div></div > ';
            if (!$('#VIS_commentsdata' + window_No).html().contains("VIS_commentsMsg")) {
                str = '<div id="VIS_commentsMsg' + window_No + '" class="vis-attachhistory-comment-data  mb-0 VIS-tp-commentData">' + str + "</div >";
            }
            return str;
        };

        function lastHistoryComment(recid, isAppointment, isCall) {
            $.ajax({
                url: VIS.Application.contextUrl + "AttachmentHistory/ViewChatonLastHistory",
                datatype: "json",
                type: "POST",
                cache: false,
                data: { record_ID: recid, isAppointment: isAppointment, isCall: isCall },
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result.length > 0) {
                        var cmt = '';
                        cmt = updateRecentComments(cmt, result[0]);
                        $('#VIS_commentsMsg' + window_No).empty();
                        if ($('#VIS_commentsdata' + window_No).html().contains("VIS_commentsMsg")) {
                            $('#VIS_commentsMsg' + window_No).prepend(cmt);
                        }
                        else
                            $('#VIS_commentsdata' + window_No).prepend(cmt);

                    }
                    $('#VIS_tabPanelDataLoader' + window_No).hide();
                },
            });
        };

        this.sizeChanged = function (width) {
            if (width <= 500) {
                $html.find('#VIS_HistoryTabs' + window_No).addClass('VIS-hide-tabs');
                if ($html.find('a.active').attr('id') == "socialinbox") {
                    $html.find('.VIS-social-tab-content').addClass('VIS-hide-chat');
                    $html.find('#VIS_btnBack_' + window_No).show();
                }
            }
            else {
                $html.find('#VIS_HistoryTabs' + window_No).removeClass('VIS-hide-tabs');
                if ($html.find('a.active').attr('id') == "socialinbox") {
                    $html.find('.VIS-social-tab-content').removeClass('VIS-hide-chat');
                    $html.find('#VIS_btnBack_' + window_No).hide();
                }
            }
        };

        this.disposeComponent = function () {
            this.record_ID = 0;
            this.windowNo = 0;
            this.curTab = null;
            this.rowSource = null;
            this.panelWidth = null;
            _gridCtrl = null;
            $root.remove();
            $root = null;
            window_No = 0;
        };
    };

    /**      * Invoked when user click on panel icon      */
    HistoryDetailsTabPanel.prototype.startPanel = function (_window_No, curTab) {
        this.windowNo = _window_No; this.curTab = curTab; this.init(); window_No = _window_No; this.table_ID = curTab.getAD_Table_ID();
    };

    /**          * This function will execute when user navigate  or refresh a record          */
    HistoryDetailsTabPanel.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID; this.selectedRow = selectedRow; this.update(recordID);
    };

    /**      * Fired When Size of panel Changed      */
    HistoryDetailsTabPanel.prototype.sizeChanged = function (width) {
        this.panelWidth = width;
        this.sizeChanged(width);
    };

    /**      * Dispose Component      */
    HistoryDetailsTabPanel.prototype.dispose = function () {
        this.disposeComponent();
    };

    /* * Fully qualified class name     */
    VIS.HistoryDetailsTabPanel = HistoryDetailsTabPanel;
})();