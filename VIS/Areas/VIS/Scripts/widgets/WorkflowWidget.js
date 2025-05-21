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


        var elements = [
            "SelectWindow"];
        var msgs = VIS.Msg.translate(VIS.Env.getCtx(), elements, true);

        /* Initialize the form design*/
        this.Initalize = function () {
            createWidget();
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
                async: async,
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
                            getControls();
                            loadWindows();
                            events();
                        }
                        setTimeout(function () {
                            showBusy(false);
                        }, 200);
                        
                    }
                    else {
                        data = null;
                        $countDiv_ID.append(0);
                        $workflowWidgetDtls_ID.append('<p id="pnorecFound' + $self.AD_UserHomeWidgetID + '" class="vis-NoRecordCls vis-a-pTagSetHeight">' + VIS.Msg.getMsg("NoRecordFound") + '</p>');// style="margin-top:12.5em; text-align:center; display:block;"
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
            Priority = VIS.Utility.encodeText(VIS.Msg.getMsg('Priority') + " " + data[item].Priority);
            var date = null;
            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

            ChldDiv += '<br>' + Priority + '</pre><div class="vis-w-feedDateTime vis-secondary-clr" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">'
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
                            Priority = VIS.Utility.encodeText(VIS.Msg.getMsg('Priority') + " " + data[item].Priority);
                            var date = null;
                            date = Globalize.format(new Date(data[item].Created), "F", Globalize.cultureSelector);

                            ChldDiv += '<br>' + Priority + '</pre><div class="vis-w-feedDateTime" data-ids="' + data[item].AD_Window_ID + '_' + data[item].AD_Node_ID + '_' + data[item].AD_WF_Activity_ID + '_' + item + '">'
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
                    async: false,
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


            if (info.AttachmentCount > 0) {
                li1.append("<pre class='vis-preCls'>" + VIS.Msg.getMsg('Attachment') + " : " + VIS.Msg.getMsg('Yes') + "</pre>");
            }

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