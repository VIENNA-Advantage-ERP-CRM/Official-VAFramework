﻿; (function (VIS, $) {

    function groupInfo(groupID) {

        var $root = null;
        var ch = null;
        this.intialize = function () {
            createLayout();
        };

        function createLayout() {
            $root = $('<div  class="vis-forms-container">');
            getGroupInfo();

        };

        function getGroupInfo() {
            $.ajax({
                url: VIS.Application.contextUrl + "Group/GetGroupChildInfo",
                data: { groupID: groupID },
                success: function (result) {
                    var data = JSON.parse(result);

                    var script = '<div class="vis-group-gi-content">' +
                        '<label>' + data.GroupName + '</label>';
                    if (data.Description != null && data.Description != undefined && data.Description != "") {
                        script += '<p>' + data.Description + '</p>';
                    }

                    if (data.WindowName != null && data.WindowName != undefined && data.WindowName != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("Windows") + ':</label>' +
                            '<p>' + data.WindowName + '</p>';
                        '</div>';
                    }

                    if (data.FormName != null && data.FormName != undefined && data.FormName != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_Forms") + ':</label>' +
                            '<p>' + data.FormName + '</p>';
                        '</div>';
                    }

                    if (data.ProcessName != null && data.ProcessName != undefined && data.ProcessName != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_Processes") + ':</label>' +
                            '<p>' + data.ProcessName + '</p>';
                        '</div>';
                    }

                    if (data.WorkflowName != null && data.WorkflowName != undefined && data.WorkflowName != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_Workflows") + ':</label>' +
                            '<p>' + data.WorkflowName + '</p>';
                        '</div>';
                    }

                    if (data.WidgetName != null && data.WidgetName != undefined && data.WidgetName != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_Widget") + ':</label>' +
                            '<p>' + data.WidgetName + '</p>';
                        '</div>';
                    }

                    if (data.processNotBinded != null && data.processNotBinded != undefined && data.processNotBinded != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_ProcessNotBind") + ':</label>' +
                            '<p class="text-danger">' + data.processNotBinded + '</p>';
                        '</div>';
                    }
                    if (data.formNotBinded != null && data.formNotBinded != undefined && data.formNotBinded != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_FormNotBind") + ':</label>' +
                            '<p class="text-danger">' + data.formNotBinded + '</p>';
                        '</div>';
                    }
                    if (data.workflowNotBinded != null && data.workflowNotBinded != undefined && data.workflowNotBinded != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_WorkFlowNotBind") + ':</label>' +
                            '<p class="text-danger">' + data.workflowNotBinded + '</p>';
                        '</div>';
                    }

                    if (data.WidgetNotBinded != null && data.WidgetNotBinded != undefined && data.WidgetNotBinded != "") {
                        script += '<div class="vis-group-gi-data">' +
                            '<label>' + VIS.Msg.getMsg("VIS_WidgetNotBind") + ':</label>' +
                            '<p class="text-danger">' + data.WidgetNotBinded + '</p>';
                        '</div>';
                    }



                    script += '</div>';

                    $root.append(script);

                },
                error: function () {
                    VIS.ADialog.error("VIS_ErrorGettingGroupInfo");
                }
            });

            var script = "";

        };

        this.show = function () {

            ch = new VIS.ChildDialog();
            ch.setContent($root);

            ch.setHeight(500);
            ch.setWidth(550);
            ch.setTitle(VIS.Msg.getMsg("VIS_Groupinfo"));
            ch.setModal(true);
            //Disposing Everything on Close
            ch.onClose = function () {

                if (self.onClose) self.onClose();
                self.dispose();
            };
            ch.show();
            ch.hideButtons();
        };


        this.dispose = function () {
            self = null;
            $root.remove();
            $root = null;
            ch = null;
        };


    };
    VIS.groupInfo = groupInfo;


})(VIS, jQuery);