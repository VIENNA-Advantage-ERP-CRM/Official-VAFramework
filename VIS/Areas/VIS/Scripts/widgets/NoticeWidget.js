/**
 * Home Widget
 * VIS316 --- Date 01-07-2024
 * purpose - Show Notice widget on home page
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    //Form Class function fullnamespace
    VIS.NoticeWidget = function () {
        /* Variables*/
        this.frame;
        this.windowNo;
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100%">');
        var $noticeWidget;
        var welcomeScreenFeedsDivId;
        var welcomeTabDatacontainers;
        var scrollWF;
        var pageNo = 1;
        var pageSize = 10;
        var str = "";
        var dbdate = null;
        var $hlnkTabDataRef_ID;
        var pageNo = 1;
        var pageSize = 10;
        var scrollWF = true;


        var elements = [
            "SelectWindow"];
        var msgs = VIS.Msg.translate(VIS.Env.getCtx(), elements, true);

        /* Initialize the form design*/
        this.Initalize = function () {
            createBusyIndicator();
            ShowBusy(true);
            window.setTimeout(function () {
                createWidget();
                LoadHomeNotice(true);
                events();
                ShowBusy(false);
            }, 500);
        };
        /* Declare events */
        function events() {
            $root.find(".vis-feedTitleBar-buttons").on("click", function (evnt) {
                var datarcrd = $(evnt.target).data("vishomercrd");
                if (evnt.target.tagName === "SPAN" && datarcrd === "more") {
                    //more-details
                    if ($(evnt.target.parentNode.parentNode).data("vishomercrd") == "more-details") {
                        var divid = evnt.target.parentNode.parentNode.id;

                        var $divntitleid = $("#snoticetitle_" + divid);
                        var $divndescid = $("#snoticedesc_" + divid);
                        var $divnmorecid = $("#snoticemore_" + divid);
                        $divnmorecid.hide();
                        $divntitleid.hide();
                        $divndescid.show();
                        $("#snoticeless_" + divid).show();
                    }
                }
                else {

                    if ($(evnt.target.parentNode.parentNode).data("vishomercrd") == "more-details") {
                        var divid = evnt.target.parentNode.parentNode.id;
                        var $divntitleid = $("#snoticetitle_" + divid);
                        var $divndescid = $("#snoticedesc_" + divid);
                        var $divnmorecid = $("#snoticemore_" + divid);
                        $divnmorecid.show();
                        $divntitleid.show();
                        $divndescid.hide();
                        $("#snoticeless_" + divid).hide();
                    }
                }
                //for notice view/zoom
                if (datarcrd === "view") {

                    var vid = evnt.target.id;
                    var arrn = vid.toString().split('|');

                    var n_id = arrn[0];
                    var n_table = arrn[1];
                    var n_win = arrn[2];
                    var n_rcrd = arrn[3];

                    var zoomQuery = new VIS.Query();
                    zoomQuery.addRestriction(n_table + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(n_id));
                    VIS.viewManager.startWindow(n_win, zoomQuery);

                }
                //for notice view/zoom
                else if (datarcrd === "liview") {
                    var vid = evnt.target.firstChild.id;
                    var arrn = vid.toString().split('|');


                    var n_id = arrn[0];
                    var n_table = arrn[1];
                    var n_win = arrn[2];
                    var n_rcrd = arrn[3];

                    var zoomQuery = new VIS.Query();
                    zoomQuery.addRestriction(n_table + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(n_id));
                    VIS.viewManager.startWindow(n_win, zoomQuery);

                }
                //for notice approve
                else if (datarcrd === "approve") {
                    var vid = evnt.target.id;
                    ApproveNotice(vid, true);
                    var count = parseInt($root.find("#countDiv").html()) - 1;
                    $root.find("#countDiv").empty();
                    $root.find("#countDiv").append(count);
                }
                //for notice approve
                else if (datarcrd === "liapprove") {
                    var vid = evnt.target.firstChild.id;
                    ApproveNotice(vid, true);
                    var count = parseInt($root.find("#countDiv").html()) - 1;
                    $root.find("#countDiv").empty();
                    $root.find("#countDiv").append(count);
                }
                else if (datarcrd === "lispecial") {
                    var vid = evnt.target.firstChild.id;
                    var arrn = vid.toString().split('|');


                    var recID = arrn[0];
                    var tableName = arrn[1];
                    var winID = arrn[2];

                    var zoomQuery = new VIS.Query();
                    zoomQuery.addRestriction(tableName + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(recID));
                    VIS.viewManager.startWindow(winID, zoomQuery);
                }
                else if (datarcrd === "lispecial1") {
                    var vid = evnt.target.id;
                    var arrn = vid.toString().split('|');


                    var recID = arrn[0];
                    var tableName = arrn[1];
                    var winID = arrn[2];

                    var zoomQuery = new VIS.Query();
                    zoomQuery.addRestriction(tableName + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(recID));
                    VIS.viewManager.startWindow(winID, zoomQuery);
                }
            });
        };

        /*Create Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $('<div id="busyDivId' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            //$bsyDiv[0].style.visibility = "visible";
            $root.append($bsyDiv);
        };

        /* Method to enable and disable busy indicator */
        function ShowBusy(show) {
            if (show) {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).css('visibility', 'visible')
                // $bsyDiv[0].style.visibility = "visible";
            }
            else {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).css('visibility', 'hidden')
                //$bsyDiv[0].style.visibility = "hidden";
            }
        };

        //Create Widget
        function createWidget() {
            $noticeWidget = ' <div id="welcomeScreenFeedsDivId' + $self.AD_UserHomeWidgetID + '" class="vis-welcomeScreenFeeds w-100 vis-welcomeScreenNoticeMainDiv" >'
                + '     <div class="vis-row">'
                + '         <h2 style="width: 100%" class="vis-noticeHeading">'
                + ' <div class="vis-secndDiv">'
                + '             <span id="spanWelcomeTabtopHdr" class="vis-welcomeScreenContentTittle-icon vis vis-notice"></span>'
                + '             <strong style="float: left;" id="sAlrtTxtType">' + VIS.Msg.getMsg("Notice") + '</strong>'
                + '     <div id="countDiv" title="Notice" class="vis-welcomeScreenTab-notificationBubble blank vis-countDivCls"></div>'
                + ' </div>'                
                + ' <div >'
                + '             <a id="hlnkTabDataRef" href="javascript:void(0)" title="ReQuery" class="vis-feedicon vis-hlnkTabDataRefCls"><i class="vis vis-refresh"></i></a>'
                + ' </div>'
                + '         </h2>'
                + '     </div>'
                + '     <div id="welcomeScreenFeedsList" class="scrollerVertical vis-scrollerVerticalCls">'
                + '     </div>'
                + ' </div>';

            $root.append($noticeWidget);
            welcomeScreenFeedsDivId = $root.find("#welcomeScreenFeedsDivId" + $self.AD_UserHomeWidgetID);
            welcomeTabDatacontainers = welcomeScreenFeedsDivId.find("#welcomeScreenFeedsList");
            $hlnkTabDataRef_ID = welcomeScreenFeedsDivId.find("#hlnkTabDataRef");
            welcomeTabDatacontainers.on("scroll", loadOnScroll);
            $hlnkTabDataRef_ID.on("click", RefreshWidget)
        };
        //Load Data
        function LoadHomeNotice(isTabAjaxBusy) {
            $.ajax({
                url: VIS.Application.contextUrl + 'Home/GetJSONHomeNotice',
                data: { "pageSize": pageSize, "page": pageNo, "isTabDataRef": isTabAjaxBusy },
                async: false,
                type: 'GET',
                datatype: 'json',
                success: function (result) {
                    var data = JSON.parse(result.data);
                    if (data.length > 0) {
                        str = "";
                        if (isTabAjaxBusy == true) {
                            recordsCount = parseInt(result.count);
                            welcomeScreenFeedsDivId.find("#countDiv").empty();
                            welcomeScreenFeedsDivId.find("#countDiv").append(parseInt(result.count));
                        }                        
                        for (var s in data) {
                            if (data[s].CDate != null && data[s].CDate != "") {
                                var cd_ = new Date(data[s].CDate);
                                dbdate = Globalize.format(cd_, "F", Globalize.cultureSelector);
                            }

                            var divtitle_ = "";
                            var title = VIS.Utility.encodeText(data[s].Title);
                            title = noticeTimeConversion(title);
                            data[s].Description = noticeTimeConversion(data[s].Description);
                            var title_ = data[s].Description;
                            if (title_.length <= 100) {
                                divtitle_ = "<pre><strong class='vis-strongWhiteClrCls' data-vishomercrd='title' id='" + data[s].AD_Note_ID + "'>" + title + "</strong></pre>";
                            }
                            else {
                                divtitle_ = "<pre>"
                                    + "<strong  id='snoticetitle_" + data[s].AD_Note_ID + "' class='vis-strongWhiteClrCls' >" + title + "...</strong>"
                                    + "<strong id='snoticedesc_" + data[s].AD_Note_ID + "' class='vis-strongWhiteClrCls style='display:none;>" + VIS.Utility.encodeText(data[s].Description) + "...</strong> "
                                    + "<span id='snoticemore_" + data[s].AD_Note_ID + "' data-vishomercrd='more' class='vis-snoticemoreCls'>" + VIS.Msg.getMsg("more") + "</span>"
                                    + "<span id='snoticeless_" + data[s].AD_Note_ID + "' data-vishomercrd='less' class='vis-snoticelessCls'>" + VIS.Msg.getMsg("less") + "</span>"
                                    + "</pre>";
                            }

                            str += "<div data-vishomercrd='view-recrd-cntainer' id='divrecdcntnr_" + data[s].AD_Note_ID + "' class='vis-activityContainer'>"
                                + " <div class='vis-feedTitleBar'>";

                            if (data[s].SpecialTable) {
                                str += "<h3>" + VIS.Utility.encodeText(data[s].MsgType) + "</h3>";
                            }
                            else {
                                str += "<h3>" + VIS.Utility.encodeText(data[s].MsgType) + "</h3>";
                            }


                            str += " <div class='vis-feedTitleBar-buttons'>"
                                + "  <ul>";
                            // Renaming of Approve highlight to Acknowledge under notification
                            str += "<li data-vishomercrd='liapprove'><a href='javascript:void(0)' data-vishomercrd='approve'  id=" + data[s].AD_Note_ID + "  title='" + VIS.Msg.getMsg("Acknowledge") + "' class='vis vis-markx'></a></li>"
                                + "<li data-vishomercrd='liview'><a href='javascript:void(0)' data-vishomercrd='view' id=" + data[s].AD_Note_ID + "|" + data[s].TableName + "|" + data[s].AD_Window_ID + "|" + data[s].Record_ID + " title='" + VIS.Msg.getMsg("View") + "' class='vis vis-find'></a></li>"
                                + "</ul>"
                                + "  </div>"
                                + "</div>"
                                + "<div data-vishomercrd='more-details' id=" + data[s].AD_Note_ID + " class='vis-feedDetails'>"
                                + divtitle_
                                + " <p class='vis-feedDateTime'>" + VIS.Utility.encodeText(dbdate) + "</p>"
                                + " </div>"
                                + " </div>"

                        }
                    }
                    else {

                        if (welcomeTabDatacontainers.find(".vis-feedTitleBar").length == 0) {

                            if (VIS.Application.isRTL) {
                                str = "<p class='vis-pTagStyleCls'>" + VIS.Msg.getMsg('NoRecordFound') + "</p>";
                            }
                            else {
                                str = "<p class='vis-pTagStyleCls'>" + VIS.Msg.getMsg('NoRecordFound') + "</p>";
                            }
                            if (activeTabType == NoticeType) {
                            }
                        }
                    }
                    isTabAjaxBusy = false;
                    welcomeTabDatacontainers.append(str);
                }
            });
        }
        /**
        * UTC Time conversion for Notice
        * @param {any} title
        */
        function noticeTimeConversion(title) {
            if (title.lastIndexOf('UTC') > 0) {
                var splitTitle = title.split('UTC');
                title = title.replaceAll('UTC', '');
                if (splitTitle.length > 0) {
                    for (var i = 0; i < splitTitle.length; i++) {
                        dt = splitTitle[i].substring(splitTitle[i].lastIndexOf(': ') + 1, splitTitle[i].length);
                        if (dt.lastIndexOf('AM') > 0 || dt.lastIndexOf('PM') > 0) {
                            var dte = new Date(dt + 'UTC');
                            title = title.replace(dt, " " + dte.toLocaleString());
                        }
                    }
                }
            }
            return title;
        }
        //Load Data on Scroll
        function loadOnScroll(e) {
            e.preventDefault();
            e.stopPropagation();
            scrollWF = true;
            // do something
            if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.80) && scrollWF) {//Condition true when 75 scroll is done
                ShowBusy(true);
               // window.setTimeout(function () {
                    scrollWF = false;
                    var tabdataLastPage = parseInt($root.find("#countDiv").html());
                    var tabdatacntpage = pageNo * pageSize;
                    if (tabdatacntpage <= tabdataLastPage) {
                        pageNo += 1;
                        LoadHomeNotice(false);
                    }
                    else {
                        scrollWF = true;
                    }
                    ShowBusy(false);
               // }, 200);
            }
        };
        //Refresh Widget
        function RefreshWidget() {
            welcomeTabDatacontainers.empty();
            pageNo = 1;
            LoadHomeNotice(true);
            events();
        };

        //Approve
        function ApproveNotice(Ad_Note_ID, isAcknowldge) {
            $.ajax({
                url: VIS.Application.contextUrl + 'Home/ApproveNotice',
                data: { "Ad_Note_ID": Ad_Note_ID, "isAcknowldge": isAcknowldge },
                type: 'POST',
                datatype: 'json',
                success: function (result) {
                    var data = JSON.parse(result);
                    $("#divrecdcntnr_" + Ad_Note_ID).animate({ "width": "0px", "height": "8.25em", "margin-left": "50em" }, 700, "", function () {
                        $("#divrecdcntnr_" + Ad_Note_ID).remove();
                    });

                }
            });
        }
        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $root.remove();
        };
    }
    /* init method called on loading a form . */
    VIS.NoticeWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        if (windowNo == -99999) {
            this.windowNo = VIS.Env.getWindowNo();
        }
        else {
            this.windowNo = windowNo;
        }
        this.AD_UserHomeWidgetID = frame.widgetInfo.AD_UserHomeWidgetID;
        window.setTimeout(function (t) {
            t.Initalize();
        }, 10, this);
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.NoticeWidget.prototype.sizeChanged = function (height, width) {

    };

    //Must implement dispose
    VIS.NoticeWidget.prototype.dispose = function () {
        this.disposeComponent();
        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);