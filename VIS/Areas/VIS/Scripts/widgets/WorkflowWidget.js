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
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100%">');
        var $workflowWidget;
        var $WFSearchshow_ID;
        var $FromDate_ID;
        var $ToDate_ID;
        var $FlipCard_ID;
        var $FlipCardInner_ID;
        var BackBtn_ID;
        var $WorkflowWidgetDtls_ID;
        var $CountDiv_ID;
        var $busyIndicator = $("#divTabMenuDataLoder");
        var divScroll = $('<div class="wfactivity-homepage-activites" style="padding-right:0px"></div>')
        var data = null;
        var fulldata = [];
        var dataItemDivs = [];
        var $cmbWindows;// = null;
        var $FromDateInput_ID;
        var $ToDateInput_ID;
        var windowID = 0;
        var winNideID = "0_0";
        var nodeID = 0;
        var searchText;
        var fromDate;
        var toDate;
        var $hlnkTabDataRef_ID;
        var $zoom;
        var $WfZoomCls;
        var $txtSearch = null;
        var $btnSearch = null;
        var search = true;
        var showToAndFromDate = true;
        var refresh = true;
        var pageNo = 1;
        var PageSize = 10;
        var scrollWF = true;
        var maxCount;
        var $AddDetails_ID;
        var $cmbAnswer;
        var $FlipCardMain_ID;
        var $workflowActivitys;
        var $welcomeScreenFeedsLists;
        var $row;
        var $NoRecordFound;
        var divDetail = null;
        var selectedItems = [];
        var lstDetailCtrls = [];
        var HistoryDivShow = true;


        var elements = [
            "SelectWindow"];
        var msgs = VIS.Msg.translate(VIS.Env.getCtx(), elements, true);

        /* Initialize the form design*/
        this.Initalize = function () {
            createBusyIndicator();
            ShowBusy(true);
            window.setTimeout(function () {
                createWidget();
                getworkflowWidget(true);
                getControls();
                loadWindows();
                events();
                ShowBusy(false);
            }, 500);
        };
        /* Get controls from root */
        function getControls() {
            //$FlipCard_ID = $root.find("#VIS_FlipCard_ID" + $self.windowNo);
            $WFSearchshow_ID = $root.find("#WFSearchshow" + $self.windowNo);
            $FromDate_ID = $root.find("#VIS_FromDate_ID" + $self.windowNo);
            $ToDate_ID = $root.find("#VIS_ToDate_ID" + $self.windowNo);
            $FromDateInput_ID = $root.find("#VIS_FromDateInput_ID" + $self.windowNo);
            $ToDateInput_ID = $root.find("#VIS_ToDateInput_ID" + $self.windowNo);
            $FlipCard_ID = $root.find(".vis-feedDetails");
            $FlipCardInner_ID = $root.find("#VIS_FlipCardInner_ID" + $self.windowNo);
            $BackBtn_ID = $root.find("#VIS_BackBtn_ID" + $self.windowNo);
            $hlnkTabDataRef_ID = $root.find("#hlnkTabDataRef" + $self.windowNo);
            //$cmbWindows = $root.find("#VIS_CmbWindows_ID" + $self.windowNo);
            $zoom = $root.find("#VIS_Zoom_ID" + $self.windowNo);
            $WfZoomCls = $root.find(".VIS_WfZoomCls");
            $txtSearch = $root.find('#homeSearchWorkflow');
            $btnSearch = $root.find('#btnWorkflowSearch');
            $AddDetails_ID = $root.find("#VIS_AddDetails_ID" + $self.windowNo);
            divDetail = $root.find("#workflowActivityDetails");

        };
        /* Declare events */
        function events() {
            //$FlipCard_ID.on('click', function (e) {            
            //$root.find(".vis-feedDetails").on('click', function (e) {
            $FlipCard_ID.on('click', function (e) {
                //divContent.on('click', function () {
                ShowBusy(true);
                window.setTimeout(function () {
                    $welcomeScreenFeedsLists.css('display', 'none');
                    $row.css('display', 'none');
                    getChld(e);
                    ShowBusy(false);
                }, 500);
                $workflowActivitys.css('display', 'block').css('zindex', '2');
            });
            $BackBtn_ID.on('click', function () {
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
            $WFSearchshow_ID.on('click', function () {
                if (showToAndFromDate == true) {
                    $FromDate_ID.css('display', 'block');
                    $ToDate_ID.css('display', 'block');
                    $welcomeScreenFeedsLists.addClass('VIS-ActiveCls')
                    showToAndFromDate = false;
                }
                else {
                    $FromDate_ID.css('display', 'none');
                    $ToDate_ID.css('display', 'none');
                    $("#VIS_FromDateInput_ID" + $self.windowNo).val('');
                    $("#VIS_ToDateInput_ID" + $self.windowNo).val('');
                    $welcomeScreenFeedsLists.removeClass('VIS-ActiveCls')
                    showToAndFromDate = true;
                }
            });
            $hlnkTabDataRef_ID.on('click', function () {
                ShowBusy(true);
                window.setTimeout(function () {
                    $CountDiv_ID.empty();
                    $WorkflowWidgetDtls_ID.empty();
                    pageNo = 1;
                    getworkflowWidget(true);
                    //loadWindows();
                    $FlipCardInner_ID = $root.find("#VIS_FlipCardInner_ID" + $self.windowNo);
                    $root.find(".vis-feedDetails").on('click', function (e) {
                        $welcomeScreenFeedsLists.css('display', 'none');
                        $row.css('display', 'none');
                        $workflowActivitys.css('display', 'block').css('zindex', '2');
                    });
                    $BackBtn_ID.on('click', function () {
                        $workflowActivitys.css('display', 'none').css('zindex', '2');
                        $welcomeScreenFeedsLists.css('display', 'block');
                        $row.css('display', 'block');
                    });
                    ShowBusy(false);
                }, 500);
            });
            // $zoom.on('click', zoom());
            $zoom.on('click', function (e) {
                var id = $(this).data("id");
                zoom(id);
            });
            $WfZoomCls.on('click', function (e) {
                var id = $(this).data("index");
                zoom(id);
            });
            $txtSearch.on("keydown", function (e) {
                if (e.keyCode == 13) {
                    search = true;
                    if (search) {
                        search = false;
                        //searchRecord();
                    }
                }
            });
            $btnSearch.on('click', function () {
                ShowBusy(true);
                window.setTimeout(function () {
                    $CountDiv_ID.empty();
                    $WorkflowWidgetDtls_ID.empty();
                    pageNo = 1;
                    getworkflowWidget(true);
                    //loadWindows();
                    $FlipCardInner_ID = $root.find("#VIS_FlipCardInner_ID" + $self.windowNo);
                    $root.find(".vis-feedDetails").on('click', function (e) {
                        // $FlipCardInner_ID.css('transform', 'rotateY(180deg)').css('zindex', '2');
                        $welcomeScreenFeedsLists.css('display', 'none');
                        $row.css('display', 'none');
                        $workflowActivitys.css('display', 'block').css('zindex', '2');
                    });
                    $BackBtn_ID.on('click', function () {
                        //$FlipCardInner_ID.css('transform', 'rotateY(360deg)').css('zindex', '1');
                        $workflowActivitys.css('display', 'none').css('zindex', '2');
                        $welcomeScreenFeedsLists.css('display', 'block');
                        $row.css('display', 'block');
                    });
                    search = false;
                    //searchRecord();
                    ShowBusy(false);
                }, 500);
            });
            $cmbWindows.on('change', function (e) {
                ShowBusy(true);
                window.setTimeout(function () {
                    $CountDiv_ID.empty();
                    $WorkflowWidgetDtls_ID.empty();
                    pageNo = 1;
                    getworkflowWidget(true);
                    //loadWindows();
                    $FlipCardInner_ID = $root.find("#VIS_FlipCardInner_ID" + $self.windowNo);
                    $root.find(".vis-feedDetails").on('click', function (e) {
                        //$FlipCardInner_ID.css('transform', 'rotateY(180deg)').css('zindex', '2');
                        $welcomeScreenFeedsLists.css('display', 'none');
                        $row.css('display', 'none');
                        $workflowActivitys.css('display', 'block').css('zindex', '2');
                    });
                    $BackBtn_ID.on('click', function () {
                        //$FlipCardInner_ID.css('transform', 'rotateY(360deg)').css('zindex', '1');
                        $workflowActivitys.css('display', 'none').css('zindex', '2');
                        $welcomeScreenFeedsLists.css('display', 'block');
                        $row.css('display', 'block');
                    });
                    ShowBusy(false);
                }, 500);
            });
            $root.find("#VIS_WorkflowWidgetDtls_ID" + $self.windowNo).on("scroll", loadOnScroll);
        };

        /*Create Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            //$bsyDiv.css({
            //    "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
            //});
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
            $workflowWidget = ' <div class="card w-100" style="background-color:#f3f3f3">'
                + '     <div class="vis-welcomeScreenFeeds" style="height: 100%;">'
                //+ ' <div class="row" style="width:calc(100% - 20px); margin-right:10px;">'
                + ' <div class="row" style="width:calc(100% - 0em); margin:0px; padding:0 .7em">'
                + '     <h2 style="width: 100%; display: flex;align-items:center;justify-content:space-between;">'
                + ' <div class="vis-topSecndDivCls">'
                + '         <span id="spanWelcomeTabtopHdr" class="vis-welcomeScreenContentTittle-icon vis vis-userfeed"></span>'
                + '         <strong style="float: left;" id="sAlrtTxtType">Workflow Activities</strong>'
                //+ '<strong id="hAlrtTxtTypeCount" style="display: none;">301</strong>'
                + ' <div id="divfActivity' + $self.windowNo + '" title="Workflow" class="vis-welcomeScreenTab-notificationBubble blank"></div>'//' + data.length + '
                + ' </div>'
                + ' <div>'
                + '         <a id="hlnkTabDataRef' + $self.windowNo + '" href="javascript:void(0)" style="float: right; margin-top: 0px; cursor: pointer; " title="ReQuery" class="vis-feedicon"><i class="vis vis-refresh"></i></a>'
                // + '         <span id="sNewNts" style="display: none; float: right; margin-top: 0px; cursor: pointer; margin-right: 10px;" class="vis-feedicon border-0" title="New Record"><i class="vis vis-plus"></i></span>'
                + '         <span id="sNewNts" style="display: none; float: right; margin-top: 0px; cursor: pointer; margin-right: 0.625em;" class="vis-feedicon border-0" title="New Record"><i class="vis vis-plus"></i></span>'
                //+ '         <span id="WFSearchshow' + $self.windowNo + '" style="float: right; margin-top: 0px; cursor: pointer; margin-right: 10px;" class="vis-feedicon vis vis-eye-plus border-0" title="Show Search"></span>'
                + '         <span id="WFSearchshow' + $self.windowNo + '" style="float: right; margin-top: 0px; cursor: pointer; margin-right: 0.625em;" class="vis-feedicon vis vis-eye-plus border-0" title="Show Search"></span>'
                + ' </div>'
                + '     </h2></div>'
                + ' <div id = "welcomeScreenFeedsLists" class="scrollerVerticalNewCls ml-0"  > <div class="workflow-homepage-parentdiv">'
                + '<div class="frm-data-col-wrap w-100" style=""> <div class="frm-data-search-wrap">'
                + '<select id="VIS_CmbWindows_ID' + $self.windowNo + '" class="vis-custom-select">'
                + '</select></div></div><div class="frm-data-col-wrap w-100"><div class="frm-data-search-wrap">'
                + '<input class="frm-data-col-searchinput" id="homeSearchWorkflow" type="text" placeholder="Search"><button id="btnWorkflowSearch" class="vis-wfSearch-btn" style="height: 1.875em;">'
                + '<i class="fa fa-search" aria-hidden="true"></i></button></div></div><div id="VIS_FromDate_ID' + $self.windowNo + '" style="display:none;" class="frm-data-col-wrap w-100">'
                + '<label>From Date</label><input id="VIS_FromDateInput_ID' + $self.windowNo + '" type="date" placeholder="date"></div><div id="VIS_ToDate_ID' + $self.windowNo + '" style="display:none;" class="frm-data-col-wrap w-100">'
                + '<label>To Date</label><input id="VIS_ToDateInput_ID' + $self.windowNo + '" type="date" placeholder="date"></div></div>'
                + '<div id="VIS_WorkflowWidgetDtls_ID' + $self.windowNo + '" class="workflow-homepage-activites" >'
                + '</div>'
                + '     </div>'
                + '          </div>'
                + '<div id = "workflowActivitys" class="workflow-Activity h-100" style = "display: none;" >'//Add class ans add s in ID
                + '    <div class="vis-workflowActivityContainer">'
                + '        <div id="workflowActivityData_ID" class="workflowActivityDataCls h-100">'
                + '          <div class="Workflow-ScrollerVertical h-100">'
                + '                <div class="vis-workflowActivityDetails m-0 h-100" id="workflowActivityDetails">'
                + '                 </div>'
                + '   </div>';

            $root.append($workflowWidget);
            $CountDiv_ID = $root.find("#divfActivity" + $self.windowNo);
            $WorkflowWidgetDtls_ID = $root.find("#VIS_WorkflowWidgetDtls_ID" + $self.windowNo);
            $cmbWindows = $root.find("#VIS_CmbWindows_ID" + $self.windowNo);
            $cmbAnswer = $root.find("#VIS_AnswerCmb_ID" + $self.windowNo);
            $workflowActivitys = $root.find("#workflowActivitys");
            $welcomeScreenFeedsLists = $root.find("#welcomeScreenFeedsLists");
            $row = $root.find(".vis-welcomeScreenFeeds");
        };

        function getworkflowWidget(refresh) {
            //ShowBusy(true);            
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
            if ($('#homeSearchWorkflow').val() != '') {
                searchText = $('#homeSearchWorkflow').val();
            }
            else {
                searchText = "";
            }
            if ($("#VIS_FromDateInput_ID" + $self.windowNo).val() != null && $("#VIS_FromDateInput_ID" + $self.windowNo).val() != '') {
                fromDate = $("#VIS_FromDateInput_ID" + $self.windowNo).val();
            }
            else {
                fromDate = null;
            }
            if ($("#VIS_ToDateInput_ID" + $self.windowNo).val() != null && $("#VIS_ToDateInput_ID" + $self.windowNo).val() != '') {
                toDate = $("#VIS_ToDateInput_ID" + $self.windowNo).val();
            }
            else {
                toDate = null;
            }
            $.ajax({
                url: VIS.Application.contextUrl + "WFActivity/GetActivities",
                data: { pageNo: pageNo, pageSize: PageSize, refresh: refresh, searchText: searchText, "AD_Window_ID": windowID, "dateFrom": fromDate, "dateTo": toDate, "AD_Node_ID": nodeID },//$self.windowNo
                async: false,
                dataType: "json",
                type: "POST",
                error: function () {
                    //alert(VIS.Msg.getMsg('ErrorWhileGettingData'));
                    //bsyDiv[0].style.visibility = "hidden";
                    ShowBusy(false);
                    //VIS.HomeMgr.BindMenuClick();
                    //search = true;
                    //scrollWF = true;
                },
                success: function (dyndata) {
                    var reslt = JSON.parse(dyndata.result);
                    if (reslt) {
                        $root.find("#pnorecFound" + $self.windowNo).css('display', 'none');
                        data = reslt.LstInfo;
                        maxCount = (data.length - 1);
                        $CountDiv_ID.append(reslt.count);
                        for (var item in data) {
                            fulldata.push(data[item]);
                            var dataIem = {};
                            var ChldDiv = null;
                            ChldDiv = '<div class="vis-activityContainer" style="margin-right:3px !important;" data-id="' + item + '">'
                                + '<div class="vis-feedTitleBar" style="gap: 0.375em;">'
                                //+ '<input class="wfActivity-selectchk" type="checkbox" style="float:left;margin-right:1px" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '" ></input>'
                                + '<h3 class="wfActivity-selectchk" style="font-weight:normal; text-align: left !important;">' + VIS.Utility.encodeText(data[item].NodeName) + '</h3>'// data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '"
                                + '<div class="vis-feedTitleBar-buttons">'
                                + '<ul><li><a href="javascript:void(0)" class="VIS_WfZoomCls" data-index="' + item + '" data-viswfazoom="wfZoom">'//(Number(10 * 1) + Number(item))
                                + '<i class= "vis vis-find" data-index="' + item + '" data-viswfazoom="wfZoom" ></i></a></li></ul></div></div>'
                                + '<div id="VIS_FlipCard_ID' + $self.windowNo + '" class="vis-feedDetails">'
                                + '<pre style="text-align:left;" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">';//<div class='vis-feedDetails'>
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
                            Priority = VIS.Utility.encodeText(VIS.Msg.getMsg('Priority') + " " + data[item].Priority);
                            var date = null;
                            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

                            ChldDiv += '<br>' + Priority + '</pre><div class="vis-feedDateTime">'
                                + date + '</div></div></div>';
                            //+ '<br>' + date + '</div></div></div>';
                            //dataIem.ctrl = divOuter;
                            //dataIem.index = item;

                            dataIem.recordID = data[item].Record_ID;
                            dataIem.wfActivityID = data[item].AD_WF_Activity_ID;
                            dataItemDivs.push(dataIem);
                            $WorkflowWidgetDtls_ID.append(ChldDiv);
                        }
                    }
                    else {
                        data = null;
                        $WorkflowWidgetDtls_ID.append('<p id="pnorecFound' + $self.windowNo + '" style="margin-top:12.5em; text-align:center; display:block;">' + VIS.Msg.getMsg("NoRecordFound") + '</p>');
                        //$root.find("#pnorecFound" + $self.windowNo).css('display', 'block');
                        //$NoRecordFound.css('display', 'block');;
                    }
                }
            });
            //ShowBusy(false);
        };
        function loadWindows() {
            $.ajax({
                url: VIS.Application.contextUrl + "WFActivity/GetWorkflowWindows",
                dataType: "json",
                async: false,
                type: "POST",
                error: function () {
                    return;
                },
                success: function (result) {
                    if (result) {
                        result = JSON.parse(result);
                        $cmbWindows.empty();
                        $cmbWindows.append('<option value="0_0">' + msgs.SelectWindow + '</option>');
                        if (result && result.length > 0) {
                            //var windowExist = false;
                            for (let i = 0; i < result.length; i++) {
                                $cmbWindows.append('<option value="' + result[i].AD_Window_ID + '_' + result[i].AD_Node_ID + '">' + result[i].WindowName + '</option>');
                            }
                        }
                        else {
                            $cmbWindows.val("0_0");
                        }
                    }
                }
            });
        };

        function loadOnScroll(e) {
            scrollWF = true;
            // do something
            if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.75) && scrollWF) {//Condition true when 75 scroll is done
                ShowBusy(true);
                window.setTimeout(function () {
                    scrollWF = false;
                    var tabdataLastPage = parseInt($CountDiv_ID.html());
                    var tabdatacntpage = pageNo * PageSize;
                    if (tabdatacntpage <= tabdataLastPage) {
                        pageNo += 1;
                        AppendRecord(pageNo, PageSize);
                    }
                    else {
                        refresh = true;
                        scrollWF = true;
                    }
                    ShowBusy(false);
                }, 500);
            }
        };

        function AppendRecord(pageNo, paeSize, refresh) {
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
            if ($('#homeSearchWorkflow').val() != '') {
                searchText = $('#homeSearchWorkflow').val();
            }
            else {
                searchText = "";
            }
            if ($("#VIS_FromDateInput_ID" + $self.windowNo).val() != null && $("#VIS_FromDateInput_ID" + $self.windowNo).val() != '') {
                fromDate = $("#VIS_FromDateInput_ID" + $self.windowNo).val();
            }
            else {
                fromDate = null;
            }
            if ($("#VIS_ToDateInput_ID" + $self.windowNo).val() != null && $("#VIS_ToDateInput_ID" + $self.windowNo).val() != '') {
                toDate = $("#VIS_ToDateInput_ID" + $self.windowNo).val();
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
                    ShowBusy(false);
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
                            ChldDiv = '<div class="vis-activityContainer" style="margin-right:0.1875em !important;" data-id="' + maxCount + '">'
                                + '<div class="vis-feedTitleBar" style="gap: 0.375em;">'
                                //+ '<input class="wfActivity-selectchk" type="checkbox" style="float:left;margin-right:1px" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '" ></input>'
                                + '<h3 class="wfActivity-selectchk" style="font-weight:normal; text-align: left !important;">' + VIS.Utility.encodeText(data[item].NodeName) + '</h3>'// data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '"
                                + '<div class="vis-feedTitleBar-buttons">'
                                + '<ul><li><a href="javascript:void(0)" class="VIS_WfZoomCls" data-index="' + maxCount + '" data-viswfazoom="wfZoom">'//(Number(10 * 1) + Number(item))
                                + '<i class= "vis vis-find" data-index="' + maxCount + '" data-viswfazoom="wfZoom" ></i></a></li></ul></div></div>'
                                + '<div id="VIS_FlipCard_ID' + $self.windowNo + '" class="vis-feedDetails">'
                                + '<pre style="text-align:left;" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + maxCount + '">';//<div class='vis-feedDetails'>
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
                            Priority = VIS.Utility.encodeText(VIS.Msg.getMsg('Priority') + " " + data[item].Priority);
                            var date = null;
                            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

                            ChldDiv += '<br>' + Priority + '</pre><div class="vis-feedDateTime">'
                                + date + '</div></div></div>';
                            //+ '<br>' + date + '</div></div></div>';
                            dataIem.recordID = data[item].Record_ID;
                            dataIem.wfActivityID = data[item].AD_WF_Activity_ID;
                            dataItemDivs.push(dataIem);
                            $WorkflowWidgetDtls_ID.append(ChldDiv);
                        }
                    }
                    else {

                    }
                }
            });
        };

        function getChld(e) {
            var id = $($workflowWidget).find('.vis-activityContainer').attr('data-id');
            if (e.target.hasAttribute("data-ids")) {
                //$cmbAnswer.append('<option value=" "> </option>');
                //$cmbAnswer.append('<option value="Y">Yes</option>');//' + msgs.SelectWindow + '
                //$cmbAnswer.append('<option value="N">No</option>');//' + msgs.SelectWindow + '
                //$cmbAnswer = null;
                //var lookup = VIS.MLookupFactory.get(VIS.context, 0, 0, VIS.DisplayType.List, info.ColName, 319, false, null);
                //$cmbAnswer = new VIS.Controls.VComboBox(info.ColName, false, false, true, lookup, 50);


                let ids = e.target.getAttribute('data-ids');
                let AD_Node_ID = e.target.getAttribute("data-ids").split('_')[1];
                //let AD_Node_ID = $($workflowWidget).find('.wfActivity-selectchk').attr('data-ids').split('_')[1];
                let wfActivityID = e.target.getAttribute("data-ids").split('_')[2];
                let index = e.target.getAttribute("data-ids").split('_')[3];
                $AddDetails_ID.empty();
                $.ajax({
                    url: VIS.Application.contextUrl + "WFActivity/GetActivityInfo",
                    async: false,
                    dataType: "json",
                    type: "POST",
                    data: {
                        activityID: wfActivityID,
                        nodeID: AD_Node_ID,
                        wfProcessID: fulldata[index].AD_WF_Process_ID
                    },
                    error: function () {
                        ShowBusy(false);
                        return;
                    },
                    success: function (res) {
                        loadDetail(wfActivityID, index, res.result);
                    }
                });
            }
        };

        function loadDetail(wfActivityID, index, info) {


            var detailCtrl = {};
            lstDetailCtrls = [];
            detailCtrl.Index = index;
            var docnameval;
            divDetail.empty();
            var divWorkflowActivity = null;
            var divWorkflowChecklist = null;
            var btnCheckList = null;

            var divHeader = $("<div class='vis-workflowActivityDetails-Heading' style='text-align:left;'>");
            divDetail.append(divHeader);

            var hHeader = $("<div id='VIS_BackBtn_ID" + $self.windowNo + "' style='cursor: pointer;' title='Back Window' class='vis vis-arrow-left'></div><h3 style='margin-left: 0.3125em;'>" + VIS.Msg.getMsg('Detail') + "</h3>");
            //hHeader.append("<h3>" + VIS.Msg.getMsg('Detail') + "</h3>");
            //hHeader.append(VIS.Msg.getMsg('Detail'));
            divHeader.append(hHeader);

            // if  any checkbox is checked, then don't show History in middle panel.
            if (selectedItems.length <= 1) {
                btnCheckList = $("<a href='javascript:void(0)' class='vis-btn-zoom mr-1' style='padding-left: 0.625em;padding-right: 0.625em;padding-top: 0.125em;padding-bottom: 0.125em;' data-id='" + index + "'>" + VIS.Msg.getMsg('CheckList') + "</a>");
                if (info.IsSurveyResponseRequired) {
                    divHeader.append(btnCheckList);
                }
                //info.ColName == 'VADMS_IsSigned'
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
                    var aZoomDMS = $("<a href='javascript:void(0)' class='vis-btn-zoom' style='margin-left:0.625em;' data-id='" + docnameval[docnameval.length - 1] + "'>");
                    aZoomDMS.append($("<span class='vis-btn-ico vis vis-find'>"));
                    //aZoomDMS.append($("<span class='vis-btn-ico vis-btn-zoom-bg vis-btn-zoom-border'>"));
                    //aZoomDMS.append(VIS.Msg.getMsg('Zoom'));
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
                    var aZoom = $("<a href='javascript:void(0)' class='vis-btn-zoom' data-id='" + index + "'>");
                    //aZoom.css("data-id", index);
                    aZoom.append($("<span class='vis-btn-ico vis vis-find'>"));
                    //aZoom.append($("<span class='vis-btn-ico vis vis-find vis-btn-zoom-border'>"));
                    //aZoom.append(VIS.Msg.getMsg('Zoom'));
                    divHeader.append(aZoom);
                    aZoom.on(VIS.Events.onTouchStartOrClick, function (e) {
                        var id = $(this).data("id");
                        zoom(id);
                    });
                }
            }

            divHeader.append($("<div class='clearfix'>"));
            // var height = ($('#workflowActivityData').height() - 50) + 'px';
            //divWorkflowActivity = $("<div class='divWorkflowActivity' style='height:" + height + "'>");
            divWorkflowActivity = $("<div class='divWorkflowActivity text-left' style='height:calc(100% - 3.125em)'>");
            divWorkflowChecklist = $("<div class='divWorkflowChecklist' style='display:none'></div>");
            divDetail.append(divWorkflowActivity);
            divDetail.append(divWorkflowChecklist);

            //divDetail = divDetail.find('.divWorkflowActivity');
            divWorkflowActivity.append($bsyDiv);

            var ul = $("<ul class='vis-IIColumnContent'>");
            divWorkflowActivity.append(ul);

            var li1 = $("<li>");
            li1.css('width', '100%');
            var p1 = $("<p style='margin-bottom: 0.3125em !important;'>");
            p1.append(VIS.Msg.getMsg('Node'));
            // p1.append($("<br>"));
            p1.append(" : " + VIS.Utility.encodeText(fulldata[index].NodeName));
            li1.append(p1);
            ul.append(li1);


            if (info.AttachmentCount > 0) {//margin-top: 10px; 
                li1.append("<pre style='margin-bottom: 0px; font-size: 0.875em; font-family: NoirPro-Regular; color: inherit;'>" + VIS.Msg.getMsg('Attachment') + " : " + VIS.Msg.getMsg('Yes') + "</pre>");
            }

            // var li2 = $("<li>");
            // if  any checkbox is checked, then don't show summary in middle panel.
            if (selectedItems.length <= 1) {
                var p2 = $("<pre class='mb-2'>");
                //p2.css('margin-top', '10px');
                p2.css('margin-top', '0.3125em');
                //p2.css('margin-bottom', '0px');
                p2.css('margin-bottom', '0.3125em');
                p2.css('font-size', '0.875em');
                p2.css('font-family', 'NoirPro-Regular');
                p2.css('color', 'inherit');
                //p2.append(VIS.Msg.getMsg('Summary'));
                //p2.append($("<br>"));



                p2.append(VIS.Utility.encodeText(fulldata[index].Summary));
                li1.append(p2);
            }


            //ul.append(li2);

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

            divWorkflowActivity.append($("<h3 class='vis-ActionHeadingCls'>").append(VIS.Msg.getMsg('Action')));
            divWorkflowActivity.append($("<div class='clearfix'>"));

            var ulA = $("<ul class='vis-IIColumnContent vis-home-wf-ul'>");

            var liAInput = $("<li>");
            ulA.append(liAInput);
            var divAInpt = $('<div class="vis-home-wf-answerWrap">');
            liAInput.append(divAInpt);

            var divAP = $('<div class="input-group vis-home-wf-answerInput vis-input-wrap">');
            divAInpt.append(divAP);
            // divAP.append($("<label style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Answer')));
            //Get Answer Control

            if (info.NodeAction == 'C') {
                var ctrl = getControl(info, wfActivityID);
                detailCtrl.AnswerCtrl = ctrl;
                if (ctrl != null) {
                    if (ctrl.getBtnCount() > 0) {
                        var divFwd = $("<div class='vis-wforwardwrap vis-control-wrap'>");
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
                var ansBtn = $('<button style="margin-bottom:10px;margin-top: 0px;width: 100%;" class="VIS_Pref_pass-btn" data-id="' + index + '" data-window="' + info.AD_Window_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                detailCtrl.AnswerCtrl = ansBtn;
                divAP.append(ansBtn);
                ansBtn.on('click', function () {

                    ansBtnClick($(this).data("id"), $(this).data("window"), $(this).data("col"));
                });
                detailCtrl.Action = 'W';
            }
            else if (info.NodeAction == 'X') {
                var ansBtn = $('<button style="margin-bottom:0.625em;margin-top: 0px;width: 100%;" class="VIS_Pref_pass-btn" data-id="' + index + '" data-form="' + info.AD_Form_ID + '" data-col="' + info.KeyCol + '">').append(info.NodeName);
                detailCtrl.AnswerCtrl = ansBtn;
                divAP.append(ansBtn);
                ansBtn.on('click', function () {
                    VIS.viewManager.startForm($(this).data("form"));
                });
                detailCtrl.Action = 'X';
            }


            var aOkA = $("<a href='javascript:void(0)'  style='display:none' id='vis-home-wf-ansOK' class='vis-btn vis-btn-done vis-icon-doneButton vis-workflowActivityIcons' data-clicked='N' data-id='" + index + "'>");
            //aOk.css("data-id",index);
            aOkA.append($("<span class='vis vis-markx'>"));
            // aOkA.append($("<span class='vis-btn-ico vis-btn-done-bg vis-btn-done-border'>"));
            //aOkA.append(VIS.Msg.getMsg('Done'));
            divAInpt.append($('<div class="vis-home-wf-answerBtn">').append(aOkA));




            var liFInput = $("<li>");
            ulA.append(liFInput);
            var divFInpt = $('<div class="vis-home-wf-forwardWrap">');
            liFInput.append(divFInpt);

            var divF = $('<div class="input-group mt-0 vis-home-wf-forwardInput vis-input-wrap">');
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
                var divFwd = $("<div class='vis-wforwardwrap vis-control-wrap'>");
                divFwd.append(txtb.getControl());

                var divFwdBtn = $("<div class='input-group-append'>");
                divFwdBtn.append(txtb.getBtn(0));
                divFwdBtn.append(txtb.getBtn(1));

                divFwd.append($("<label style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Forward')));
                divF.append(divFwd).append(divFwdBtn);

            };

            var divM = $('<div class="input-group mt-0 vis-home-wf-forwardInput vis-input-wrap">');
            divF1.append(divM);

            var aOkF = $("<a href='javascript:void(0)' style='display:none' id='vis-home-wf-forOK' class='vis-btn vis-btn-done vis-icon-doneButton vis-workflowActivityIcons' data-clicked='N' data-id='" + index + "'>");
            //aOk.css("data-id",index);
            aOkF.append($("<span class='vis vis-markx'>"));
            //aOkF.append($("<span class='vis-btn-ico vis-btn-done-bg vis-btn-done-border'>"));
            //aOkF.append(VIS.Msg.getMsg('Done'));
            //divF1.append($('<div class="vis-home-wf-forwardBtn">').append(aOkF));
            //divF.append($('<div class="vis-home-wf-forwardBtn">').append(aOkF));
            divFInpt.append($('<div class="vis-home-wf-forwardBtn">').append(aOkF));

            divWorkflowActivity.append(ulA);
            divWorkflowActivity.append($("<div class='clearfix'>"));

            //divWorkflowActivity.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
            divWorkflowActivity.append($("<div class='clearfix'>"));



            var divMsg = $("<div class='vis-control-wrap'>");
            divMsg.append($("<p style='margin-bottom: 0'>").append(VIS.Msg.getMsg('Message')));
            var msg = $("<textarea style='width:100%;resize:none;' placeholder='" + VIS.Msg.getMsg('TypeMessage') + "....'>");
            detailCtrl.MsgCtrl = msg;
            divMsg.append(msg);
            // divMsg.append($("<button class='vis vis-sms'></button>"));
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

            detailCtrl.AnswerCtrl.fireValueChanged = function () {
                if (detailCtrl.AnswerCtrl.getValue() == '' || detailCtrl.AnswerCtrl.getValue() == null) {
                    detailCtrl.FwdCtrl.getControl().prop('disabled', '');
                    detailCtrl.FwdCtrl.getBtn(0).prop('disabled', '');
                    detailCtrl.FwdCtrl.getBtn(1).prop('disabled', '');
                    aOkF.css('display', 'none');
                    aOkA.css('display', 'none');
                    // msg.prop('disabled', '');
                }
                else {
                    detailCtrl.FwdCtrl.getControl().prop('disabled', true);
                    detailCtrl.FwdCtrl.getBtn(0).prop('disabled', true);
                    detailCtrl.FwdCtrl.getBtn(1).prop('disabled', true);
                    aOkF.css('display', 'none');
                    aOkA.css('display', '');
                    // msg.prop('disabled', true);
                }

            };



            lstDetailCtrls.push(detailCtrl);

            // if  any checkbox is checked, then don't show History in middle panel.
            if (selectedItems.length <= 1) {

                divWorkflowActivity.append($("<h3 id='HistoryMain_ID" + $self.windowNo + "'class='vis-ActionHeadingCls' style='cursor:pointer;'>").append(VIS.Msg.getMsg('ViewHistoryRecord')
                    + "<div class='historyArrow' id='VIS_DownArrowID_" + $self.windowNo + "' style='display:block;'><span class='vis vis-arrow-down'></span></div>"
                    + "<div class='historyArrow' id='VIS_UpArrowID_" + $self.windowNo + "' style='display:none;'><span class='vis vis-arrow-up'></span></div>"));
                divWorkflowActivity.append($("<div class='clearfix'>"));

                var divHistory = $("<div id='History_ID" + $self.windowNo + "' class='vis-history-wrap' style='display: none;'>");
                divWorkflowActivity.append(divHistory);

                $root.find("#HistoryMain_ID" + $self.windowNo).on("click", function () {
                    if (HistoryDivShow == true) {
                        $root.find("#VIS_DownArrowID_" + $self.windowNo).css('display', 'none');
                        $root.find("#VIS_UpArrowID_" + $self.windowNo).css('display', 'block');
                        $root.find("#History_ID" + $self.windowNo).css('display', 'block');
                        HistoryDivShow = false;
                    }
                    else {
                        $root.find("#VIS_DownArrowID_" + $self.windowNo).css('display', 'block');
                        $root.find("#VIS_UpArrowID_" + $self.windowNo).css('display', 'none');
                        $root.find("#History_ID" + $self.windowNo).css('display', 'none');
                        HistoryDivShow = true;
                    }
                });

                if (info.Node != null) {
                    var divHistoryNode = $("<div style='margin-top:0.9375em;margin-bottom:0.9375em'>");

                    for (node in info.Node) {

                        if (info.Node[node].History != null) {
                            for (hNode in info.Node[node].History) {

                                if (info.Node[node].History[hNode].State == 'CC' && node < (info.Node.length - 1)) {
                                //if (node < (info.Node.length - 1) || info.Node.length == 1) {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divAppBy = $("<div class='vis-approved_wrap'>");
                                    divAppBy.append("<div class='vis-ApproveCircleCls'><i class='vis vis-markx' ></i></div>");
                                    var nodename = '';
                                    nodename = info.Node[node].Name;



                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (info.Node[node].History[hNode].TextMsg.length > 0) {
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip' style='margin-right:0.3125em'>").append("<i class='vis vis-info'></i>");
                                        // var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip' style='margin-right:5px'>").append($("<img class='VIS_Pref_img-i'>").attr('src', VIS.Application.contextUrl + "Areas/VIS/Images/i.png"));
                                        var span = $("<span>");
                                        span.append($("<img class='VIS_Pref_callout'>").attr('src', VIS.Application.contextUrl + "Areas/VIS/Images/ccc.png").append("ToolTip Text"));
                                        span.append($("<label class='VIS_Pref_Label_Font'>").append(VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg)))
                                        btnDetail.append(span);

                                        divLeft.append(btnDetail);
                                    }
                                    divLeft.append(nodename);
                                    divAppBy.append(divLeft);
                                    var divRight = $("<div class='vis-right-part'>");
                                    divRight.append(VIS.Msg.getMsg('CompletedBy')).append($("<span class='vis-app_by'>").append(info.Node[node].History[hNode].ApprovedBy));
                                    //divRight.append(btnDetail);
                                    divAppBy.append(divRight);
                                    divHistoryNode.append(divAppBy);

                                }
                                else if ((node < (info.Node.length - 1)) || info.Node.length == 1) {
                                //else if ((node < (info.Node.length - 1)) || info.Node.length == 1 && info.Node[node].History[hNode].State == 'CC') {
                                    var divAppBy = $("<div class='vis-pending_wrap' >");
                                    divAppBy.append($("<div class='vis-left-part'>").append(info.Node[node].Name));
                                    divAppBy.append($("<div class='vis-right-part'>").append(VIS.Msg.getMsg('Pending')));
                                    divHistoryNode.append(divAppBy);
                                    //divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='/ViennaAdvantageWeb/Areas/VIS/Images/home/4.jpg'>")));
                                }
                                else {
                                    divHistoryNode.append($("<div class='vis-vertical-img'>").append($("<img src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/4.jpg'>")));
                                    var divStart = $("<div class='vis-start_wrap' style='margin-bottom:-0.5em'>");


                                    var divLeft = $("<div class='vis-left-part'>");
                                    if (info.Node[node].History[hNode].TextMsg.length > 0) {
                                        var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip' style='margin-right:0.3125em'>").append("<i class='vis vis-info'></i>");
                                        //var btnDetail = $("<a href='javascript:void(0)' class='VIS_Pref_tooltip' style='margin-right:5px'>").append($("<img class='VIS_Pref_img-i'>").attr("src", VIS.Application.contextUrl + "Areas/VIS/Images/i.png"));
                                        var span = $("<span >");
                                        span.append($("<img class='VIS_Pref_callout'>").attr('src', VIS.Application.contextUrl + "Areas/VIS/Images/ccc.png").append("ToolTip Text"));
                                        span.append($("<label class='VIS_Pref_Label_Font'>").append(VIS.Utility.encodeText(info.Node[node].History[hNode].TextMsg)))
                                        btnDetail.append(span);

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
            //  $("#divfeedbsy")[0].style.visibility = "hidden";
            $busyIndicator.hide();
            btnCheckList.off().click(function () {

                divWorkflowChecklist.html('');
                if ($(this).text() != "Back") {
                    $(this).text(VIS.Msg.getMsg('Back'));
                    divDetail.find(".vis-workflowActivityDetails-Heading h3").text(VIS.Msg.getMsg('CheckList'));
                    var sPanel = new VIS.SurveyPanel();
                    sPanel.init();
                    var rt = sPanel.getRoot();
                    divWorkflowChecklist.html('');
                    sPanel.panelDetails(fulldata[index].AD_Window_ID, 0, fulldata[index].AD_Table_ID, fulldata[index].Record_ID, rt, fulldata[index].AD_WF_Activity_ID);
                    divWorkflowChecklist.append(rt);
                } else {
                    divDetail.find(".vis-workflowActivityDetails-Heading h3").text(VIS.Msg.getMsg('Detail'));
                    $(this).text(VIS.Msg.getMsg('CheckList'));
                }

                divWorkflowActivity.toggle(700);

                if (divWorkflowChecklist.is(":hidden")) {
                    divWorkflowChecklist.show();
                } else {
                    divWorkflowChecklist.hide();
                }


            });
            $root.find("#VIS_BackBtn_ID" + $self.windowNo).on('click', function () {
                //$FlipCardInner_ID.css('transform', 'rotateY(360deg)').css('zindex', '1');
                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
            });
        };

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
                // alert('Gen Attribute Not Implement Yet');
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
                    //defaultDigitalSignatureID: $('#pdfsignreason').children("option:selected").data('digitalsignatureid')
                };

                if (signData.defaultReasonKey == undefined || signData.defaultReasonKey == '' || signData.defaultReason == undefined || signData.defaultReason == '') {
                    aOk.data('clicked', 'N');
                    VIS.ADialog.info('VA055_ChooseStatus');
                    return;
                }

                setBusy(true);
                $.post(VIS.Application.contextUrl + 'VADMS/Document/SignatureUsingWorkflow', signData, function (res) {
                    setBusy(false);
                    if (res && res != 'null' && res.result == 'success') {

                        $("#divfeedbsy")[0].style.visibility = "hidden";
                        divScroll.empty();
                        adjust_size();
                        lstDetailCtrls = [];
                        selectedItems = [];
                        $busyIndicator.show();

                        window.setTimeout(function () {
                            loadWindows(true);
                        }, 5000);
                    }
                    else {
                        aOk.data('clicked', 'N');
                        VIS.ADialog.error(res.result);
                    }

                }, 'json').fail(function (jqXHR, exception) {
                    setBusy(false);
                    aOk.data('clicked', 'N');
                    VIS.ADialog.error(exception);
                });
            }
            else {
                var id = $(aOk).data("id");
                approveIt(id, aOk);
            }


        };

        var approveIt = function (index, aOK) {
            var aOK = aOK;
            $("#divfeedbsy")[0].style.visibility = "visible";
            window.setTimeout(function () {
                for (var item in lstDetailCtrls) {
                    try {
                        if (index === parseInt(lstDetailCtrls[item].Index)) {
                            var fwdTo = lstDetailCtrls[item].FwdCtrl.getValue();
                            var msg = VIS.Utility.encodeText(lstDetailCtrls[item].MsgCtrl.val());
                            var answer = null;
                            if (lstDetailCtrls[item].Action == 'C') {
                                var answer = lstDetailCtrls[item].AnswerCtrl.getValue();

                            }

                            //var info = (VIS.dataContext.getJSONData(VIS.Application.contextUrl + "WFActivity/ApproveIt",
                            //    { "activityID": fulldata[index].AD_WF_Activity_ID, "nodeID": fulldata[index].AD_Node_ID, "txtMsg": msg, "fwd": fwdTo, "answer": answer })).result;

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
                            ShowBusy(true);
                            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "WFActivity/ApproveIt",
                                { "activityID": activitIDs, "nodeID": fulldata[index].AD_Node_ID, "txtMsg": msg, "fwd": fwdTo, "answer": answer, "AD_Window_ID": windowID }, function apprvoIt(info) {
                                    ShowBusy(false);
                                    if (info.result == '') {
                                        //refresh
                                        //alert("Done");
                                        $("#divfeedbsy")[0].style.visibility = "hidden";
                                        aOK.data('clicked', 'N');
                                        //window.setTimeout(function () {
                                        //    $('#workflowActivity').hide();
                                        //}, 200);
                                        divScroll.empty();
                                        adjust_size();
                                        lstDetailCtrls = [];
                                        selectedItems = [];
                                        // $("#divfeedbsy")[0].style.visibility = "visible";
                                        $busyIndicator.show();
                                        loadWindows(true);

                                    }
                                    else {
                                        VIS.ADialog.error(info.result);
                                        //alert(VIS.Msg.getMsg(info.result));
                                        aOK.data('clicked', 'N');
                                        $("#divfeedbsy")[0].style.visibility = "hidden";
                                    }
                                });
                            break;
                        }
                    }
                    catch (e) {
                        setBusy(false);
                        VIS.ADialog.error("FillMandatory", true, "");
                        //alert('FillManadatory');
                        aOK.data('clicked', 'N');
                        $("#divfeedbsy")[0].style.visibility = "hidden";
                    }

                }
                aOK.data('clicked', 'N');

            }, 2);

        };
        var adjust_size = function () {
            ShowBusy(true);
            window.setTimeout(function () {
                //divDetail.empty();
                //divDetail.hide();
                $CountDiv_ID.empty();
                $WorkflowWidgetDtls_ID.empty();
                pageNo = 1;
                getworkflowWidget(true);
                loadWindows();
                ShowBusy(false);

                $workflowActivitys.css('display', 'none').css('zindex', '2');
                $welcomeScreenFeedsLists.css('display', 'block');
                $row.css('display', 'block');
                //$FlipCardInner_ID.css('transform', 'rotateY(360deg)').css('zindex', '1');
                $root.find(".vis-feedDetails").on('click', function (e) {
                    //divContent.on('click', function () {
                    ShowBusy(true);
                    window.setTimeout(function () {
                        getChld(e);
                        ShowBusy(false);
                    }, 500);
                    //$FlipCardInner_ID.css('transform', 'rotateY(180deg)').css('zindex', '2');
                    $welcomeScreenFeedsLists.css('display', 'none');
                    $row.css('display', 'none');
                    $workflowActivitys.css('display', 'block').css('zindex', '2');
                });
                $BackBtn_ID.on('click', function () {
                    //$FlipCardInner_ID.css('transform', 'rotateY(360deg)').css('zindex', '1');
                    $workflowActivitys.css('display', 'none').css('zindex', '2');
                    $welcomeScreenFeedsLists.css('display', 'block');
                    $row.css('display', 'block');
                });
            }, 500);
        };
        function searchRecord() {
            pageNo = 1;
            PageSize = 10;
            //workflowActivity.hide();
            //divDetail.empty();
            //divScroll.empty();
            selectedItems = [];
            selectedItems.length = 0;
            self.AppendRecord(pageNo, PageSize, true);
        };
        var zoom = function (index) {

            //window id
            VIS.AEnv.wfzoom(fulldata[index].AD_Table_ID, fulldata[index].Record_ID, fulldata[index].AD_WF_Activity_ID);
        };

        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
        };
    }
    /* init method called on loading a form . */
    VIS.WorkflowWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.windowNo = windowNo;

        window.setTimeout(function (t) {
            t.Initalize();
        }, 10, this);
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.WorkflowWidget.prototype.sizeChanged = function (height, width) {

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