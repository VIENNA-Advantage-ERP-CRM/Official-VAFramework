/**
 * Home Widget
 * VIS316 --- Date 01-07-2024
 * purpose - Show Request widget on home page
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    //Form Class function fullnamespace
    VIS.RequestWidget = function () {
        /* Variables*/
        this.frame;
        this.windowNo;
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100%">');
        var $requestWidget;
        var $requestwelcomeDivId;
        var welcomeTabDatacontainers;
        var reqCountDiv;
        var $welcomeNewRecord;
        var scrollWF;
        var pageNo = 1;
        var pageSize = 10;
        var str = "";
        var dbdate = null;
        var $hlnkTabDataRef_ID;
        var pageNo = 1;
        var pageSize = 10;
        var scrollWF = true;
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
                createWidget();
                LoadHomeRequest(true);
                events();
                ShowBusy(false);
            }, 500);
        };
        /* Declare events */
        function events() {
            $hlnkTabDataRef_ID.on("click", RefreshWidget);
            $welcomeNewRecord.on("click", function () {
                var sql = "VIS_129";
                var n_win = executeScalar(sql);

                var zoomQuery = new VIS.Query();
                zoomQuery.addRestriction("R_Request_ID", VIS.Query.prototype.EQUAL, 0);
                VIS.viewManager.startWindow(n_win, zoomQuery);
            });
            welcomeTabDatacontainers.on("click", function (e) {
                ZoomFunction(e);
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
            $requestWidget = ' <div id="requestwelcomeDivId' + $self.AD_UserHomeWidgetID + '" class="vis-welcomeScreenFeeds w-100 vis-RequestwelcomeScreenCls" > '
                + '  <div class="vis-row"> '
                + '      <h2 class="vis-noticeHeading vis-RequestWidth"> '
                + ' <div class="vis-RequestInnerDivCls">'
                + '          <span id="spanWelcomeTabtopHdr" class="vis-welcomeScreenContentTittle-icon fa fa-bell-o"></span> '
                + '          <strong class="vis-RequestStrongCls" id="sAlrtTxtType">' + VIS.Msg.getMsg("Requests") + '</strong>'
                + ' <div id="reqCountDiv" title="Request" class="vis-welcomeScreenTab-notificationBubble blank"></div>'
                + ' </div>'
                + ' <div >'
                + '          <a id="hlnkTabDataRefReq" href="javascript:void(0)" title="ReQuery" class="vis-feedicon vis-RequestHlnkTabDataRefReq"><i class="vis vis-refresh"></i></a> '
                + '          <span id="sNewNts" class="vis-feedicon vis-RequestNewNtsCls" title="New Record"><i class="vis vis-plus"></i></span> '
                + ' </div>'
                + '      </h2> '
                + '  </div> '
                + '  <div id="welcomeScreenFeedsList" class="scrollerVertical vis-RequestWelcomeScreenFeedsListCls" ></div> '
                + ' </div>';

            $root.append($requestWidget);
            $requestwelcomeDivId = $root.find("#requestwelcomeDivId" + $self.AD_UserHomeWidgetID);
            welcomeTabDatacontainers = $requestwelcomeDivId.find("#welcomeScreenFeedsList");
            reqCountDiv = $requestwelcomeDivId.find("#reqCountDiv");
            $hlnkTabDataRef_ID = $requestwelcomeDivId.find("#hlnkTabDataRefReq");
            $welcomeNewRecord = $requestwelcomeDivId.find("#sNewNts");
            welcomeTabDatacontainers.on("scroll", loadOnScroll);
        };
        /* Start Request */
        function LoadHomeRequest(isTabDataRef) {
            $.ajax({
                url: VIS.Application.contextUrl + 'Home/GetJSONHomeRequest',
                data: { "pageSize": pageSize, "page": pageNo, "isTabDataRef": isTabDataRef },
                type: 'GET',
                async: false,
                datatype: 'json',
                cache: false,
                success: function (result) {
                    var data = JSON.parse(result.data);
                    var str = "";
                    if (isTabDataRef == true) {
                        $requestwelcomeDivId.find("#reqCountDiv").empty();
                        $requestwelcomeDivId.find("#reqCountDiv").append(parseInt(result.count));
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
                                + "<h3>#" + data[s].DocumentNo + "</h3>";
                            if (data[s].Name && data[s].Name.length > 0) {
                                str += "<li class='vis-home-request-BP'>" + data[s].Name + "</li>"
                            }

                            str += "<div class='vis-feedTitleBar-buttons'>"
                                + "<ul>"
                                + "<li data-vishomercrd='liview'><a href='javascript:void(0)' data-vishomercrd='view' id=" + data[s].R_Request_ID + "|" + data[s].TableName + "|" + data[s].AD_Window_ID + "  title='" + VIS.Msg.getMsg("View") + "'  class='vis vis-find'></a></li>"
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
                        if (welcomeTabDatacontainers.find(".vis-table-request").length == 0) {
                            str = "<p style=' margin-top:200px;text-align: center'>" + VIS.Msg.getMsg('NoRecordFound') + "</p>";
                        }
                    }
                    welcomeTabDatacontainers.append(str);
                }
            });
        }
        //Zoom 
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
            });
            return result;
        };
        //on Scroll
        function loadOnScroll(e) {
            // do something
            if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.75) && scrollWF) {//Condition true when 75 scroll is done
                ShowBusy(true);
                window.setTimeout(function () {
                    //scrollWF = false;
                    var tabdataLastPage = parseInt($root.find("#reqCountDiv").html());
                    var tabdatacntpage = pageNo * pageSize;
                    if (tabdatacntpage <= tabdataLastPage) {
                        pageNo += 1;
                        LoadHomeRequest(false);
                    }
                    else {
                        // scrollWF = true;
                    }
                    ShowBusy(false);
                }, 200);
            }
        };

        function RefreshWidget() {
            welcomeTabDatacontainers.empty();
            LoadHomeRequest(true);
        };

        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $root.remove();
        };
    }
    /* init method called on loading a form . */
    VIS.RequestWidget.prototype.init = function (windowNo, frame) {
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

    VIS.RequestWidget.prototype.sizeChanged = function (height, width) {

    };
    //Must implement dispose
    VIS.RequestWidget.prototype.dispose = function () {
        this.disposeComponent();
        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);