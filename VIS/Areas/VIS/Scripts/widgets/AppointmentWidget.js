/**
 * Home Widget
 * VIS316 --- Date 01-07-2024
 * purpose - Show Appointment widget on home page
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    //Form Class function fullnamespace
    VIS.AppointmentWidget = function () {
        /* Variables*/
        this.frame;
        this.windowNo;
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100%">');
        var isWsp = false;
        var $AppointmentWidget;
        var WelcomeTabDatacontainers;
        var AppCountDiv;
        var $welcomeNewRecord;
        var scrollWF;
        var pageNo = 1;
        var PageSize = 10;
        var str = "";
        var dbdate = null;
        var $hlnkTabDataRef_ID;
        var pageNo = 1;
        var PageSize = 10;
        var scrollWF = true;
        var $divAptCount = null;

        var baseUrl = VIS.Application.contextUrl;
        var dataSetUrl = baseUrl + "JsonData/JDataSetWithCode";

        var elements = [
            "SelectWindow"];
        var msgs = VIS.Msg.translate(VIS.Env.getCtx(), elements, true);

        /* Initialize the form design*/
        this.Initalize = function () {
            createBusyIndicator();
            ShowBusy(true);
            window.setTimeout(function () {
                if (window.WSP) {
                    isWsp = true;
                }
                else {
                    console.log("PleaseInstallWSPModule");
                }
                createWidget();
                //LoadHomeRequest(true);
                //events();
                ShowBusy(false);
            }, 500);
        };
        /* Declare events */
        function events() {
            $hlnkTabDataRef_ID.on("click", RefreshWidget);
            //$welcomeNewRecord.off("click");
            //$welcomeNewRecord.on("click", function () {
            //    var sql = "VIS_129";
            //    var n_win = executeScalar(sql);

            //    var zoomQuery = new VIS.Query();
            //    zoomQuery.addRestriction("R_Request_ID", VIS.Query.prototype.EQUAL, 0);
            //    VIS.viewManager.startWindow(n_win, zoomQuery);
            //});
            ////$root.find(".vis vis-find").on("click", function (e) {
            ////    ZoomFunction(e);
            ////});
            //WelcomeTabDatacontainers.on("click", function (e) {
            //    ZoomFunction(e);
            //});
        };

        /*Create Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            $bsyDiv[0].style.visibility = "visible";
            $root.append($bsyDiv);
        };

        /* Method to enable and disable busy indicator */
        function ShowBusy(show) {

            if (show) {
                $bsyDiv[0].style.visibility = "visible";
            }
            else {
                $bsyDiv[0].style.visibility = "hidden";
            }
        };

        function createWidget() {
            $AppointmentWidget = ' <div class="vis-welcomeScreenFeeds w-100 vis-welcomeScreenNoticeMainDiv">'
                + '  <div class="vis-row">'
                + '      <h2 class="vis-noticeHeading" style="width: 100%">'
                + '<div class="vis-secndDiv">'
                + '          <span id="spanWelcomeTabtopHdr" class="vis-welcomeScreenContentTittle-icon vis vis-appointment"></span>'
                + '          <strong style="float: left;" id="sAlrtTxtType">' + VIS.Msg.getMsg("Appointment") + '</strong>'
                //+ ' <strong id="hAlrtTxtTypeCount" style="display: none;">0</strong>'
                + ' <div id="AppCountDiv" title="Request" class="vis-welcomeScreenTab-notificationBubble blank">0</div>'
                + '  </div>'
                + '          <a id="hlnkTabDataRefApp" href="javascript:void(0)" style="float: right; margin-top: 0px; cursor: pointer; margin-right: 17px;" title="ReQuery" class="vis-feedicon"><i class="vis vis-refresh"></i></a>'
                //+ '          <span id="sNewNts" style="float: right; margin-top: 0px; cursor: pointer; margin-right: 6px;" class="vis-feedicon" title="New Record"><i class="vis vis-plus"></i></span>'
                + '          <span id="WFSearchshow" style="display: none; float: right; margin-top: 0px; cursor: pointer; margin-right: 6px;" class="vis-feedicon vis vis-eye-plus" title="Show Search"></span>'
                + '      </h2>'
                + '  </div>'
                + '<div id="welcomeScreenFeedsList" class="scrollerVertical" style="margin-left: auto; overflow: hidden auto;">'
            if (isWsp == false) {
                $AppointmentWidget += ' <div class="scrollerVertical" style="margin-left: auto; overflow-y: auto; text-align: center; margin-top: 200px;">' + VIS.Msg.getMsg("PleaseInstallWSPModule") + '</div>';
            }
            $AppointmentWidget += '<div class="vis-activityContainer" id="divAptContiner_0"><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">Appoitment</span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_0"><a class="vis vis-find" id="aViewApt_0" title="View Appointments"></a></li>'
                + '<li id="liApproveApt_0"><a class="vis vis-markx" id="aApproveApt_0" title="Approve Appointments"></a></li><li id="liDeleteApt_0">'
                + '<a class="vis vis-mark" id="aDeleteApt_0" title="Delete Appointments"></a></li></ul></div></div><div class="vis-schedule-feed-detail">'
                + '<div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>31 Jan</h4><p style="margin: 0 0 0px; "><span>11:36 AM</span> '
                + '<span>-</span> <span>31 Jan, 11:36 AM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;">'
                + '<p style="margin: 0 0 0px;">Appoitment</p><div class="vis-schedule-feed-bottom" style="float:left!important;">'
                + '<p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p><p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div>'
                + '<div class="vis-activityContainer" id="divAptContiner_1"><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">Appoitment</span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_1"><a class="vis vis-find" id="aViewApt_1" title="View Appointments"></a></li><li id="liApproveApt_1">'
                + '<a class="vis vis-markx" id="aApproveApt_1" title="Approve Appointments"></a></li><li id="liDeleteApt_1"><a class="vis vis-mark" id="aDeleteApt_1" title="Delete Appointments"></a></li></ul></div></div>'
                + '<div class="vis-schedule-feed-detail"><div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>14 Feb</h4><p style="margin: 0 0 0px; "><span>3:01 PM</span>'
                + '<span>-</span> <span>14 Feb, 3:01 PM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;"> <p style="margin: 0 0 0px;">Appoitment</p>'
                + '<div class="vis-schedule-feed-bottom" style="float:left!important;"><p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p>'
                + '<p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div>'
                + '<div class="vis-activityContainer" id="divAptContiner_2"><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">dilip meeting </span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_2"><a class="vis vis-find" id="aViewApt_2" title="View Appointments"></a></li><li id="liApproveApt_2">'
                + '<a class="vis vis-markx" id="aApproveApt_2" title="Approve Appointments"></a></li><li id="liDeleteApt_2"><a class="vis vis-mark" id="aDeleteApt_2" title="Delete Appointments"></a></li></ul></div></div><div class="vis-schedule-feed-detail">'
                + '<div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>12 Oct</h4><p style="margin: 0 0 0px; "><span>5:30 AM</span> <span>-</span>'
                + '<span>13 Oct, 5:30 AM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;">'
                + '<p style="margin: 0 0 0px;">dilip meeting </p><div class="vis-schedule-feed-bottom" style="float:left!important;">'
                + '<p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p>'
                + '<p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div>'
                + '<div class="vis-activityContainer" id = "divAptContiner_0" ><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">Appoitment</span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_0"><a class="vis vis-find" id="aViewApt_0" title="View Appointments"></a></li>'
                + '<li id="liApproveApt_0"><a class="vis vis-markx" id="aApproveApt_0" title="Approve Appointments"></a></li><li id="liDeleteApt_0">'
                + '<a class="vis vis-mark" id="aDeleteApt_0" title="Delete Appointments"></a></li></ul></div></div><div class="vis-schedule-feed-detail">'
                + '<div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>31 Jan</h4><p style="margin: 0 0 0px; "><span>11:36 AM</span> '
                + '<span>-</span> <span>31 Jan, 11:36 AM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;">'
                + '<p style="margin: 0 0 0px;">Appoitment</p><div class="vis-schedule-feed-bottom" style="float:left!important;">'
                + '<p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p><p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div > '
                + '<div class="vis-activityContainer" id="divAptContiner_1"><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">Appoitment</span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_1"><a class="vis vis-find" id="aViewApt_1" title="View Appointments"></a></li><li id="liApproveApt_1">'
                + '<a class="vis vis-markx" id="aApproveApt_1" title="Approve Appointments"></a></li><li id="liDeleteApt_1"><a class="vis vis-mark" id="aDeleteApt_1" title="Delete Appointments"></a></li></ul></div></div>'
                + '<div class="vis-schedule-feed-detail"><div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>14 Feb</h4><p style="margin: 0 0 0px; "><span>3:01 PM</span>'
                + '<span>-</span> <span>14 Feb, 3:01 PM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;"> <p style="margin: 0 0 0px;">Appoitment</p>'
                + '<div class="vis-schedule-feed-bottom" style="float:left!important;"><p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p>'
                + '<p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div>'
                + '<div class="vis-activityContainer" id="divAptContiner_2"><div class="vis-feedTitleBar"><h3><span style="color: #1b95d7;">dilip meeting </span></h3>'
                + '<div class="vis-feedTitleBar-buttons "><ul><li id="liViewApt_2"><a class="vis vis-find" id="aViewApt_2" title="View Appointments"></a></li><li id="liApproveApt_2">'
                + '<a class="vis vis-markx" id="aApproveApt_2" title="Approve Appointments"></a></li><li id="liDeleteApt_2"><a class="vis vis-mark" id="aDeleteApt_2" title="Delete Appointments"></a></li></ul></div></div><div class="vis-schedule-feed-detail">'
                + '<div class="vis-scheduleDateTime text-center" style="float:left!important"><h4>12 Oct</h4><p style="margin: 0 0 0px; "><span>5:30 AM</span> <span>-</span>'
                + '<span>13 Oct, 5:30 AM</span></p></div> <div class="vis-schedule-feed-text" style="margin-top:-10px;">'
                + '<p style="margin: 0 0 0px;">dilip meeting </p><div class="vis-schedule-feed-bottom" style="float:left!important;">'
                + '<p class="vis-client-name" style="float:left!important;margin: 0 0 0px;">SuperUser</p>'
                + '<p class="vis-schedule-feedDateTime" style="float:right!important;margin: 0 0 0px;">Location/Address:mohali</p></div></div></div></div>'
                + '</div > ';

            $root.append($AppointmentWidget);
            WelcomeTabDatacontainers = $root.find("#welcomeScreenFeedsList");
            AppCountDiv = $root.find("#AppCountDiv");
            $hlnkTabDataRef_ID = $root.find("#hlnkTabDataRefApp");
            //$welcomeNewRecord = $root.find("#sNewNts");
            WelcomeTabDatacontainers.on("scroll", loadOnScroll);
        };
        /* Start Request */
        function LoadHomeRequest(isTabDataRef) {
            //$divTabMenuDataLoder.show();
            //isTabAjaxBusy = true;
            ////$ulHomeTabMenu.off("click");
            $.ajax({
                url: VIS.Application.contextUrl + 'Home/GetJSONHomeRequest',
                data: { "pagesize": PageSize, "page": pageNo, "isTabDataRef": isTabDataRef },
                type: 'GET',
                async: false,
                datatype: 'json',
                cache: false,
                success: function (result) {
                    var data = JSON.parse(result.data);
                    var str = "";
                    if (isTabDataRef == true) {

                        //recordsCount = parseInt(result.count);
                        //$root.find("#countDiv").empty();
                        //$root.find("#countDiv").append(parseInt(result.count));
                        $root.find("#ReqCountDiv").empty();
                        //$root.find("#ReqCountDiv").append(1);
                        $root.find("#ReqCountDiv").append(parseInt(result.count));
                        //$($AppointmentWidget).find("#ReqCountDiv").append(parseInt(result.count));
                    }
                    if (data.length > 0) {

                        for (var s in data) {
                            var StartDate = "";
                            if (data[s].StartDate != null || data[s].StartDate != "") {
                                var cd = new Date(data[s].StartDate);
                                StartDate = Globalize.format(cd, "d", Globalize.cultureSelector);
                            }
                            var NextActionDate = "";
                            if (data[s].NextActionDate != null) {
                                var cd = new Date(data[s].NextActionDate);
                                NextActionDate = Globalize.format(cd, "d", Globalize.cultureSelector);
                            }
                            else {
                                NextActionDate = "&nbsp;-----------";
                            }
                            var CreatedDate = "";
                            if (data[s].CreatedDate != null || data[s].CreatedDate != "") {
                                var cd = new Date(data[s].CreatedDate);
                                CreatedDate = Globalize.format(cd, "F", Globalize.cultureSelector);
                            }

                            var summary = data[s].Summary;
                            if (summary.length > 80) {
                                summary = summary.substr(0, 80) + "..."
                            }
                            var casetype = data[s].CaseType;
                            if (casetype.length > 30) {
                                casetype = casetype.substr(0, 30) + "..."
                            }

                            str += "<div class='vis-activityContainer'>"
                                + "<div class='vis-feedTitleBar'>"
                                + "<h3>#" + data[s].DocumentNo + "</h3>"
                                + "<div class='vis-feedTitleBar-buttons'>"
                                + "<ul>";

                            if (data[s].Name && data[s].Name.length > 0) {
                                str += "<li class='vis-home-request-BP'>" + data[s].Name + "</li>"
                            }

                            + "<li class='vis-home-request-BP'>" + data[s].Name + "</li>"
                            str += "<li data-vishomercrd='liview'><a href='javascript:void(0)' data-vishomercrd='view' id=" + data[s].R_Request_ID + "|" + data[s].TableName + "|" + data[s].AD_Window_ID + "  title='" + VIS.Msg.getMsg("View") + "'  class='vis vis-find'></a></li>"
                                + "</ul>"
                                + "</div>"
                                + "</div>"

                                + "<div  class='vis-feedDetails vis-pt-0 vis-pl-0'>"
                                + "<div class='vis-table-request'>"
                                + "<ul>"
                                + "<li><span>" + VIS.Msg.getMsg('Priority') + ":</span><br>" + data[s].Priority + "</li>"
                                + "<li><span>" + VIS.Msg.getMsg('Status') + ":</span><br>" + data[s].Status + "</li>"
                                + "<li><span>" + VIS.Msg.getMsg('NextActionDate') + ":</span><br>" + NextActionDate + "</li>"
                                + "</ul>"
                                + "</div>"
                                + "<p class='vis-maintain-customer-p'>"
                                + "<strong>" + VIS.Utility.encodeText(casetype) + " </strong><br />"
                                + "<span>" + VIS.Msg.getMsg('Message') + ":</span><br>" + VIS.Utility.encodeText(summary) + "</p>"
                                + "<p class='vis-feedDateTime'  style=' width: 69%; margin-right: 10px;'>" + CreatedDate + "</p>"
                                + "</div>"
                                + "</div>"
                        }

                    }
                    else {
                        if (WelcomeTabDatacontainers.find(".vis-table-request").length == 0) {
                            //str = "<p style=' margin-top:200px;text-align: center'>" + VIS.Msg.getMsg('NoRecordFound') + "</p>";

                            str = '<div class="vis-activityContainer"><div class="vis-feedTitleBar"><h3>#1000003</h3><div class="vis-feedTitleBar-buttons"><ul>'
                                + '<li data-vishomercrd="liview"><a href="javascript:void(0)" data-vishomercrd="view" id="1000029|R_Request|232" title="View" class="vis vis-find"></a></li></ul></div></div>'
                                + '<div class="vis-feedDetails vis-pt-0 vis-pl-0"><div class="vis-table-request"><ul><li><span>Priority:</span><br>Medium</li><li><span>Status:</span><br>Open</li><li>'
                                + '<span>Next Action Date:</span><br>&nbsp;-----------</li></ul></div><p class="vis-maintain-customer-p"><strong>Test 1 </strong><br><span>Message:</span><br>test</p>'
                                + '<p class="vis-feedDateTime" style=" width: 69%; margin-right: 10px;">Tuesday, June 25, 2024 10:50:43 AM</p></div></div>';

                        }
                    }
                    //BindMenuClick();
                    WelcomeTabDatacontainers.append(str);
                }
            });
        }

        function ZoomFunction(evnt) {
            var datarcrd = $(evnt.target).data("vishomercrd");

            //for request view/zoom
            if (datarcrd === "view") {

                var vid = evnt.target.id;
                var arrn = vid.toString().split('|');

                var r_id = arrn[0];
                var r_table = arrn[1];
                var r_win = arrn[2];

                var zoomQuery = new VIS.Query();
                zoomQuery.addRestriction(r_table + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(r_id));
                VIS.viewManager.startWindow(r_win, zoomQuery);


            }
            //for request view/zoom
            else if (datarcrd === "liview") {
                var vid = evnt.target.firstChild.id;
                var arrn = vid.toString().split('|');

                var r_id = arrn[0];
                var r_table = arrn[1];
                var r_win = arrn[2];

                var zoomQuery = new VIS.Query();
                zoomQuery.addRestriction(r_table + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(r_id));
                VIS.viewManager.startWindow(r_win, zoomQuery);

            }
        };

        var executeScalar = function (sql, params, callback) {
            var async = callback ? true : false;
            var dataIn = { sql: sql, page: 1, pageSize: 0 }
            var value = null;

            getDataSetJString(dataIn, async, function (jString) {
                dataSet = new VIS.DB.DataSet().toJson(jString);
                var dataSet = new VIS.DB.DataSet().toJson(jString);
                if (dataSet.getTable(0).getRows().length > 0) {
                    value = dataSet.getTable(0).getRow(0).getCell(0);

                }
                else { value = null; }
                dataSet.dispose();
                dataSet = null;
                if (async) {
                    callback(value);
                }
            });

            return value;
        };

        //DataSet String
        function getDataSetJString(data, async, callback) {
            var result = null;
            // data.sql = VIS.secureEngine.encrypt(data.sql);
            $.ajax({
                url: dataSetUrl,
                type: "POST",
                datatype: "json",
                contentType: "application/json; charset=utf-8",
                async: async,
                data: JSON.stringify(data)
            }).done(function (json) {
                result = json;
                if (callback) {
                    callback(json);
                }
                //return result;
            });
            return result;
        };

        function loadOnScroll(e) {
            //e.preventDefault();
            //e.stopPropagation();
            //scrollWF = true;
            // do something
            if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.75) && scrollWF) {//Condition true when 75 scroll is done
                ShowBusy(true);
                window.setTimeout(function () {
                    //scrollWF = false;
                    var tabdataLastPage = parseInt($root.find("#ReqCountDiv").html());
                    var tabdatacntpage = pageNo * PageSize;
                    if (tabdatacntpage <= tabdataLastPage) {
                        pageNo += 1;
                        // LoadHomeRequest(false);
                        alert("Load Data");
                    }
                    else {
                        // scrollWF = true;
                    }
                    ShowBusy(false);
                }, 200);
            }
        };

        function RefreshWidget() {
            alert("Refresh");
            //WelcomeTabDatacontainers.empty();
            //LoadHomeRequest(true);
            //events();
        };

        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
        };
    }
    /* init method called on loading a form . */
    VIS.AppointmentWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.windowNo = VIS.Env.getWindowNo();

        window.setTimeout(function (t) {
            t.Initalize();
        }, 10, this);
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.AppointmentWidget.prototype.sizeChanged = function (height, width) {

    };

    //Must implement dispose
    VIS.AppointmentWidget.prototype.dispose = function () {
        this.disposeComponent();
        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);