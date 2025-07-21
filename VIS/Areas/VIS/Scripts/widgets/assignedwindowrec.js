/************************************************************
 * Module Name    : VAS
 * Purpose        : Partner Dashboard - Assigned Records Widget
 * Chronological  : Development
 * Created Date   : 10th Oct 2024
 * Created by     : VAI061
 ***********************************************************/
; VIS = window.VIS || {};
; (function (VIS, $) {

    VIS.VISAssignedWindowRec = function () {
        this.frame;
        this.windowNo;
        var $bsyDiv;
        var $self = this;
        var $root = $('<div class="w-100 h-100">');
        var AD_Window_ID = 0;
        var Ctx = VIS.Env.getCtx();
        var widgetID = 0;

        /* Initialize function will initialize the widget */
        this.initalize = function () {
            createBusyIndicator();
            $bsyDiv[0].style.visibility = "visible";
            widgetID = (VIS.Utility.Util.getValueOfInt(this.widgetInfo.AD_UserHomeWidgetID) != 0
                ? this.widgetInfo.AD_UserHomeWidgetID
                : $self.windowNo);
            assignedRecCount();
        };

        /* Function to get the count from server side */
        function assignedRecCount() {
            AD_Window_ID = VIS.context.m_map[$self.windowNo][$self.windowNo + "|AD_Window_ID"];
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/ZoomAssignedRecordOnWindow",
                data: { AD_Window_ID: AD_Window_ID },
                type: "GET",
                success: function (data) {
                    data = JSON.parse(data);
                    if (data) {
                        if (Object.keys(data).length == 0) {
                            data.count = 0;
                        }
                        $root.append('<div class="vis_AssignedRecwidget h-100 w-100" id="vis_AssignedRecwidget' + $self.widgetInfo.AD_UserHomeWidgetID + '" >' +
                            '<div class="vis_AssignedReclogo">' +
                            '<i class="vis vis-asrx"></i>' +
                            '</div>' +
                            '<div class="vis_AssignedReclabel">' + VIS.Msg.getMsg("VIS_AssignRecord") + '</div>' +
                            '<div class="vis_assignedRecCount">' + (data.count || 0) + '</div>' +
                            '</div>');
                        $bsyDiv[0].style.visibility = "hidden";
                    }
                    else {
                        $bsyDiv[0].style.visibility = "hidden";
                    }

                },
                error: function () {
                    $bsyDiv[0].style.visibility = "hidden";
                }
            });
        }

        /* Busy Indicator */
        function createBusyIndicator() {
            $bsyDiv = $(
                '<div class="vis-busyindicatorouterwrap">' +
                '<div class="vis-busyindicatorinnerwrap">' +
                '<i class="vis_widgetloader"></i>' +
                '</div>' +
                '</div>'
            );
            $bsyDiv.css({
                position: "absolute",
                width: "98%",
                height: "97%",
                textAlign: "center",
                zIndex: "999",
            });

            $root.append($bsyDiv);
        }

        /* Get Root */
        this.getRoot = function () {
            return $root;
        };

        /* Refresh Widget */
        this.refreshWidget = function () {
            $bsyDiv[0].style.visibility = "visible";
            $root.find(`#vis_AssignedRecwidget${widgetID}`).remove();
            assignedRecCount();
        };
    };

    VIS.VISAssignedWindowRec.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo;
        this.windowNo = windowNo;
        this.initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.VISAssignedWindowRec.prototype.refreshWidget = function () {
        this.refreshWidget();
    };

    VIS.VISAssignedWindowRec.prototype.widgetSizeChange = function (widget) {
        this.widgetInfo = widget;
    };

    VIS.VISAssignedWindowRec.prototype.dispose = function () {
        this.frame = null;
        this.windowNo = null;
        $bsyDiv = null;
        $self = null;
        $root = null;
    };

})(VIS, jQuery);