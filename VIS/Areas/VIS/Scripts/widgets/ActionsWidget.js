/**
 * Home Widget
 * VIS316 --- Date 10-07-2024
 * purpose - Show Notice widget on home page
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    //Form Class function fullnamespace
    VIS.ActionsWidget = function () {
        /* Variables*/
        this.frame;
        this.windowNo;
        var $self = this; //scoped $self pointer
        var $root = $('<div class="vis-group-assign-content" style="height:100% w-100">');
        var actionsWidget;
        var welcomeActionsDivId;
        var workflowDivId;
        var noticeDivId;
        var requestsDivId;
        var popup;
        var modelPopupId;
        var wform;

        /* Initialize the form design*/
        this.Initalize = function () {
            createWidget();
            createBusyIndicator();
            ShowBusy(true);
            widgetsPopup();
            events();
            loadCounts(true);
        };
        /* Declare events */
        function events() {
            workflowDivId.on("click", opneWorkflow);
            noticeDivId.on("click", opneNotice);
            requestsDivId.on("click", opneRequests);
            // welcomeActionsDivId.find("#refreshDivId" + $self.AD_UserHomeWidgetID).on("click", $self.refreshWidget);
            modelPopupId.find("#closeBtnId" + $self.AD_UserHomeWidgetID).on("click", function () {
                modelPopupId.hide();
                wform.dispose();
            });
        };

        /*Create Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $('<div id="busyDivId' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + $self.AD_UserHomeWidgetID + '" class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            $root.append($bsyDiv);
        };
        /* Method to enable and disable busy indicator */
        function ShowBusy(show) {
            if (show) {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).show();
            }
            else {
                $root.find("#busyDivId" + $self.AD_UserHomeWidgetID).hide();
            }
        };

        //Create Widget
        function createWidget() {
            actionsWidget = ' <div id="welcomeActionsDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-task-status-panel">  '
                // + '<div id="refreshDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-refreshIco"><span class="vis vis-refresh"></span></div>'
                + ' <div class="vis-a-statusBox-container" >'
                + '  <div id="workflowDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-box vis-a-green-box" style="cursor: pointer;">'
                + '    <div class="vis-a-headWico">'
                + '      <i class="vis vis-userfeed"></i>'
                + '      <div class="vis-a-status-name">' + VIS.Msg.getMsg("workflow") + '</div>'
                + '    </div>'
                + '    <div id="workflowCntDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-count vis-a-greenbg"></div>'
                + '  </div>'
                + '  <div id="noticeDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-box vis-a-blue-box" style="cursor: pointer;">'
                + '    <div class="vis-a-headWico">'
                + '      <i class="vis vis-notice"></i>'
                + '      <div class="vis-a-status-name">' + VIS.Msg.getMsg("Notice") + '</div>'
                + '    </div>'
                + '    <div id="noticeCntDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-count vis-a-bluebg"></div>'
                + '  </div>'
                + '  <div id="requestsDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-box vis-a-orange-box" style="cursor: pointer;">'
                + '    <div class="vis-a-headWico">'
                + '      <span class="fa fa-bell-o"></span>'
                + '      <div class="vis-a-status-name">' + VIS.Msg.getMsg("Requests") + '</div>'
                + '    </div>'
                + '    <div id="requestsCntDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-status-count vis-a-orangebg"></div>'
                + '  </div>'
                + '</div >'
                + '</div> ';

            $root.append(actionsWidget);
            welcomeActionsDivId = $root.find("#welcomeActionsDivId" + $self.AD_UserHomeWidgetID);
            workflowDivId = welcomeActionsDivId.find("#workflowDivId" + $self.AD_UserHomeWidgetID);
            noticeDivId = welcomeActionsDivId.find("#noticeDivId" + $self.AD_UserHomeWidgetID);
            requestsDivId = welcomeActionsDivId.find("#requestsDivId" + $self.AD_UserHomeWidgetID);
        };
        //Create Popup
        function widgetsPopup() {
            popup = ' <div class="modal vis-a-actionsModelMain" id="widgetsModalId' + $self.AD_UserHomeWidgetID + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
                + ' <div class="modal-dialog vis-a-actionsMdialog" role="document">'
                + '     <div class="modal-content vis-a-actionsMcontent">'
                + '             <button id="closeBtnId' + $self.AD_UserHomeWidgetID + '" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close">'
                + '                 <span aria-hidden="true">&times;</span>'
                + '             </button>'
                + '         <div id="appendWidgetDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-actionsWidgetCls vis-a-modelHeightSetCls">'
                + '         </div>'
                + '      </div>'
                + '   </div>'
                + '</div>'
            $root.append(popup);
            modelPopupId = $root.find("#widgetsModalId" + $self.AD_UserHomeWidgetID);
        };
        //Load Data
        function loadCounts(async) {
            $.ajax({
                url: VIS.Application.contextUrl + 'Home/getWidgetsCount',
                async: async,
                type: 'GET',
                datatype: 'json',
                success: function (result) {
                    var WidgetsCnt = result.count;
                    if (WidgetsCnt.WorkFlowCnt > 0) {
                        welcomeActionsDivId.find("#workflowCntDivId" + $self.AD_UserHomeWidgetID).append(WidgetsCnt.WorkFlowCnt);
                    }
                    else {
                        welcomeActionsDivId.find("#workflowCntDivId" + $self.AD_UserHomeWidgetID).append(0);
                    }
                    if (WidgetsCnt.NoticeCnt > 0) {
                        welcomeActionsDivId.find("#noticeCntDivId" + $self.AD_UserHomeWidgetID).append(WidgetsCnt.NoticeCnt);
                    }
                    else {
                        welcomeActionsDivId.find("#noticeCntDivId" + $self.AD_UserHomeWidgetID).append(0);
                    }
                    if (WidgetsCnt.RequestCnt > 0) {
                        welcomeActionsDivId.find("#requestsCntDivId" + $self.AD_UserHomeWidgetID).append(WidgetsCnt.RequestCnt);
                    }
                    else {
                        welcomeActionsDivId.find("#requestsCntDivId" + $self.AD_UserHomeWidgetID).append(0);
                    }
                    ShowBusy(false);
                }
            });
        };

        //Opne Workflow Widget
        function opneWorkflow() {
            showWidgets('VIS.WorkflowWidget');
            // var objWorkflowWidget = new VIS.WorkflowWidget();
            // objWorkflowWidget.init($self.windowNo, $self.frame);
        };
        //Opne Workflow Widget
        function opneNotice() {
            showWidgets('VIS.NoticeWidget');
            //var objNoticeWidget = new VIS.NoticeWidget();
            //objNoticeWidget.init($self.windowNo, $self.frame);
        };
        //Opne Workflow Widget
        function opneRequests() {
            showWidgets('VIS.RequestWidget');
            //var objRequestsWidget = new VIS.RequestWidget();
            //objRequestsWidget.init($self.windowNo, $self.frame);
        };
        //Show Widget in Popup
        function showWidgets(clsName) {
            modelPopupId.find("#appendWidgetDivId" + $self.AD_UserHomeWidgetID).empty();
            wform = new VIS.AForm();
            wform.openWidget(clsName, $self.windowNo, $self.frame.widgetInfo);
            modelPopupId.find("#appendWidgetDivId" + $self.AD_UserHomeWidgetID).append(wform.getContentGrid());
            modelPopupId.show();
        };

        //Refresh Widget
        this.refreshWidget = function () {
            ShowBusy(true);
            welcomeActionsDivId.find("#workflowCntDivId" + $self.AD_UserHomeWidgetID).empty();
            welcomeActionsDivId.find("#noticeCntDivId" + $self.AD_UserHomeWidgetID).empty();
            welcomeActionsDivId.find("#requestsCntDivId" + $self.AD_UserHomeWidgetID).empty();
            loadCounts(false);
            ShowBusy(false);
        };

        /* get design from root*/
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $root.remove();
        };
    }
    VIS.ActionsWidget.prototype.refreshWidget = function () {
    };
    /* init method called on loading a form . */
    VIS.ActionsWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.AD_UserHomeWidgetID = frame.widgetInfo.AD_UserHomeWidgetID;
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.ActionsWidget.prototype.sizeChanged = function (height, width) {

    };

    //Must implement dispose
    VIS.ActionsWidget.prototype.dispose = function () {
        this.disposeComponent();
        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);