; (function (VIS, $) {
    VIS = VIS || {};

    //*************Create Dynamic Widget ******************//

    VIS.dynamicWidget = function () {
        this.frame;
        this.windowNo;
        var self = this;
        var $root = $("<div class='vis-height-full'>");

        function initializeComponent(AD_WidgetSize_ID, WidgetStyle) {
            if (WidgetStyle) {
                $root.attr('style', WidgetStyle);
            }
            if (AD_WidgetSize_ID > 0) {
                var onClickParameters = [];
                getField(AD_WidgetSize_ID, afterLoad);
            }

            function afterLoad(data) {
                if (data && data.length > 0) {
                    data.sort(function (a, b) {
                        return a.SeqNo - b.SeqNo;
                    });
                    for (var i = 0; i < data.length; i++) {
                        var controlType = data[i].ControlType;
                        var name = data[i].Name;
                        var sameLine = data[i].IsSameLine;
                        var HtmlStyle = data[i].HtmlStyle;
                        var imageURL = data[i].ImageURL;
                        var badgeName = data[i].BadgeName;
                        var isBadge = data[i].IsBadge;
                        var badgeStyle = data[i].BadgeStyle;
                        var $element;
                        onClickParameters.push(data[i].OnClick);

                        /* Create different type of controls like Button/Link/label/Badge */

                        switch (controlType) {
                            case 'BT':
                                if (isBadge == 'Y' && badgeName != '') {
                                    $element = $("<button title='" + name + "' class='vis-widget-field'>").html(name + " <span style='margin: 0; " + badgeStyle+"' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                $element = $("<button title='" + name + "' class='vis-widget-field'>").text(name).attr('index', i);
                                }
                                if (HtmlStyle) {
                                    $element.attr('style', HtmlStyle);
                                } else {
                                    $element.addClass('default');
                                }
                                break;
                            case 'LN':
                                if (isBadge == 'Y' && badgeName != '') {
                                    $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").html(name + " <span style='margin: 0; " + badgeStyle +"' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").text(name).attr('index', i);
                                }
                                if (HtmlStyle) {
                                    $element.attr('style', HtmlStyle);
                                } else {
                                    $element.addClass('default');
                                }
                                break;
                            case 'BG':
                                $element = $("<span title='" + name + "' class='vis-widget-field badge vis-widget-badge'>").text(name).attr('index', i);
                                if (HtmlStyle) {
                                    $element.attr('style', HtmlStyle);
                                } else {
                                    $element.addClass('default');
                                }
                                break;
                            case 'LB':
                                if (isBadge == 'Y' && badgeName != '') {
                                    $element = $("<label title='" + name + "' class='vis-widget-field' >").html(name + " <span style='margin: 0; " + badgeStyle +"' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                $element = $("<label title='" + name + "' class='vis-widget-field' >").text(name).attr('index', i);
                                }
                                if (HtmlStyle) {
                                    $element.attr('style', HtmlStyle);
                                } else {
                                    $element.addClass('default');
                                }
                                break;
                            default:
                                continue;
                        }

                        /* Add Line break when sameline is false */
                        if (sameLine == 'N' || i == 0) {
                            var container = $("<div class='vis-add-row'></div>");
                            if (imageURL != '') {
                                $element.prepend(imageURL);
                            }
                            $root.append(container.append($element));
                        } else {
                            if (imageURL != '') {
                                $element.prepend(imageURL);
                            }
                            $root.find('.vis-add-row:last').append($element);
                        }
                    }

                    $root.find('.vis-widget-field').on('click', function () {
                        var $this = $(this);
                        if ($this.is('label')) {
                            return;
                        }
                        var index = $this.attr('index');
                        if (onClickParameters.length > 0) {
                            for (var i = 0; i < onClickParameters.length; i++) {
                                if (i == index) {
                                    self.widgetFirevalueChanged(onClickParameters[i]);
                                    break;
                                }
                            }
                        }
                    });
                }
            }
        }

        /* Getting Widget Fields */
        function getField(AD_WidgetSize_ID,callback) {
            var result = [];
            $.ajax({
                url: VIS.Application.contextUrl + "home/GetDynamicWidget",
                data: { AD_WidgetSize_ID: AD_WidgetSize_ID, windowNo: self.windowNo},
                success: function (data) {
                    data = JSON.parse(data);
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            result.push(data[i]);
                        }
                    }
                    if (callback)
                        callback(result);
                }
            });
            return result;
        }

        /* Getting AD_WidgetSize_ID */
        this.GetWidgetSize = function (AD_UserHomeWidget_ID) {
            if (AD_UserHomeWidget_ID > 0) {
                $.ajax({
                    url: VIS.Application.contextUrl + "home/GetWidgetID",
                    async: false,
                    data: { AD_UserHomeWidget_ID: AD_UserHomeWidget_ID },
                    success: function (data) {
                        data = JSON.parse(data);
                        if (data) {
                            initializeComponent(data[0].AD_WidgetSize_ID, data[0].WidgetStyle);
                        }
                    }
                });
            }
        };

        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            self = null;
            if ($root)
                $root.remove();
            $root = null;
            this.getRoot = null;
            this.disposeComponent = null;
            onClickParameters = null;
        };
    };

    VIS.dynamicWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        if (windowNo == -99999) {
            this.windowNo = VIS.Env.getWindowNo();
        }
        else {
            this.windowNo = windowNo;
        }
        if (frame.widgetInfo) {
            this.GetWidgetSize(frame.widgetInfo.AD_UserHomeWidgetID);
        }
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.dynamicWidget.prototype.sizeChanged = function (height, width) {

    };

    VIS.dynamicWidget.prototype.widgetFirevalueChanged = function (value) {
        if (value.ActionName != null && value.ActionType != null) {
            var type = value.ActionType.toUpper();
            if (type == 'W') {
                var AD_Window_ID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "UserPreference/GetWindowID",
                    { "WindowName": value.ActionName }, null);
                if (AD_Window_ID > 0) {
                    VIS.viewManager.startWindow(AD_Window_ID, null, value);  // Open Window with trigger custom event with the value
                }
            }
            else if (type == 'X') {
                var AD_Form_ID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetFormID",
                    { "formName": value.ActionName }, null);
                if (AD_Form_ID > 0) {
                    VIS.viewManager.startForm(AD_Form_ID, null);  // Open Form
                }
            }
            else if (type == 'P') {
                var Ad_Process_ID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetProcessID",
                    { "processName": value.ActionName }, null);
                if (Ad_Process_ID > 0) {
                    VIS.viewManager.startProcess(Ad_Process_ID, null); // Open Process
                }
            }
        }
        else if (this.listener)
            this.listener.widgetFirevalueChanged(value); // Trigger custom event with the value
    };

    VIS.dynamicWidget.prototype.addChangeListener = function (listener) {
        this.listener = listener;
    }

    //Must implement dispose
    VIS.dynamicWidget.prototype.dispose = function () {
        /*CleanUp Code */
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };

})(VIS, jQuery);