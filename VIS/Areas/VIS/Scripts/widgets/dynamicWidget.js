; (function (VIS, $) {
    VIS = VIS || {};

    //*************Create Dynamic Widget ******************//

    VIS.dynamicWidget = function () {
        this.frame;
        this.windowNo;
        var self = this;
        this.WidgetID;
        var $root = $("<div class='vis-dynamicWidget-main'>");
        this.height = 0;
        this.scrollHeight = 0;
        var divHeight = 0;

        this.initializeComponent = function (AD_Widget_ID) {
            if (AD_Widget_ID > 0) {
                var onClickParameters = [];
                getField(AD_Widget_ID, afterLoad);
            }

            function afterLoad(data, WidgetStyle, IsRandomColor, errorMsg) {
                $root.empty();
                if (WidgetStyle) {
                    $root.attr('style', WidgetStyle);
                }
                if (data && data.length > 0) {
                    data.sort(function (a, b) {
                        return a.SeqNo - b.SeqNo;
                    });
                    if (data[0].WidgetStyle) {
                        $root.attr('style', data[0].WidgetStyle);
                    }
                    if (errorMsg.length > 0 && errorMsg != '') {

                        var errorIcon = $('<i title="Error Field: ' + errorMsg.substring(0, errorMsg.length - 2) + '"class="fa fa-exclamation-triangle vis-exclamation-icon" aria-hidden="true"></i>');
                        $root.append(errorIcon);
                    }
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
                                    $element = $("<button title='" + name + "' class='vis-widget-field'>").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                    $element = $("<button title='" + name + "' class='vis-widget-field'>").text(name).attr('index', i);
                                }
                                break;
                            case 'LN':
                                if (isBadge == 'Y' && badgeName != '') {
                                    $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                    $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").text(name).attr('index', i);
                                }
                                break;
                            case 'BG':
                                $element = $("<span title='" + name + "' class='vis-widget-field badge vis-widget-badge'>").text(name).attr('index', i);
                                break;
                            case 'LB':
                                if (isBadge == 'Y' && badgeName != '') {
                                    $element = $("<label title='" + name + "' class='vis-widget-field' >").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', i);
                                } else {
                                    $element = $("<label title='" + name + "' class='vis-widget-field' >").text(name).attr('index', i);
                                }
                                break;
                            default:
                                continue;
                        }

                        if (HtmlStyle) {
                            $element.attr('style', HtmlStyle);
                        }
                        else if (IsRandomColor == 'Y') {
                            var hue = Math.floor(Math.random() * (360 - 0)) + 0;
                            var v = Math.floor(Math.random() * 16) + 75; //Math.floor(Math.random() * (75 - 60 + 1)) + 75; //Math.floor(Math.random() * 16) + 75;

                            var color = {
                                light: 'hsl(' + hue + ', 100%,' + v + '%)',
                                dark: 'hsl(' + hue + ', 100%,' + (v - 45) + '%)'
                            }

                            if (controlType == 'BT' || controlType == 'BG') {
                                $element.css("background-color", color.light);
                                $element.css("color", color.dark);
                                if (isBadge == 'Y') {
                                    $element.find('span').css("background-color", color.dark);
                                    $element.find('span').css("color", "white");
                                }
                            } else {
                                $element.css("color", color.dark);
                                if (isBadge == 'Y') {
                                    $element.find('span').css("background-color", color.light);
                                    $element.find('span').css("color", color.dark);
                                }
                            }
                        }
                        else {
                            $element.addClass('default');
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
                    if (self != null) {
                        this.height = Math.floor(self.frame.widgetInfo.height.replace("px", ""));
                        divHeight = this.height;
                    }
                    this.scrollHeight = $root[0].scrollHeight;

                    var arrowDiv = $('<div class="vis-dynamicwidget-arrow">'
                        + '<i class="fa fa-caret-up vis-topArrow-icon" style="pointer-events:none; opacity:0.3" aria-hidden="true"></i>'
                        + '<i class="fa fa-caret-down vis-bottomArrow-icon" aria-hidden="true"></i>'
                        + '</div>');

                    if (divHeight > 0 && (this.scrollHeight > divHeight)) {
                        $root.append(arrowDiv);
                    }
                    if (self.frame.widgetInfo.editMode) {
                        arrowDiv.addClass('d-none')
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
                    $root.find('.vis-bottomArrow-icon').on('click', function () {
                        scrollDown(divHeight);
                    });

                    $root.find('.vis-topArrow-icon').on('click', function () {
                        scrollUp(divHeight);
                    });

                }
            }
        }

        function scrollDown(divHeight) {
            var currentScrollTop = $root.scrollTop();
            var newScrollTop = currentScrollTop + divHeight;

            $root.animate({ scrollTop: newScrollTop }, 800);

            setTimeout(function () {
                updateArrowVisibility(newScrollTop, divHeight);
            }, 1000);
        }

        function scrollUp(divHeight) {
            var currentScrollTop = $root.scrollTop();
            var newScrollTop = currentScrollTop - divHeight;

            $root.animate({ scrollTop: newScrollTop }, 800);

            setTimeout(function () {
                updateArrowVisibility(newScrollTop, divHeight);
            }, 1000);
        }

        function updateArrowVisibility(scrollTop, divHeight) {
            if (scrollTop >= $root[0].scrollHeight - divHeight) {
                $root.find('.vis-bottomArrow-icon').css({
                    "pointer-events": "none",
                    "opacity": "0.3"
                });
            } else {
                $root.find('.vis-bottomArrow-icon').css({
                    "pointer-events": "all",
                    "opacity": "1.0"
                });
            }

            // Check if scrolled to top
            if (scrollTop <= 0) {
                $root.find('.vis-topArrow-icon').css({
                    "pointer-events": "none",
                    "opacity": "0.3"
                });
            } else {
                $root.find('.vis-topArrow-icon').css({
                    "pointer-events": "all",
                    "opacity": "1.0"
                });
            }
        }

        this.resize = function (widgetHeight) {
            if ($root[0].scrollHeight > widgetHeight) {
                $root.find('.vis-dynamicwidget-arrow').removeClass('d-none');
            }
        }

        /* Getting Widget Fields */
        function getField(WidgetID, callback) {
            var result = [];
            $.ajax({
                url: VIS.Application.contextUrl + "home/GetDynamicWidget",
                data: {
                    widgetID: WidgetID,
                    windowNo: self.windowNo,
                    tabID: VIS.context.getContextAsInt(self.windowNo, "0|AD_Tab_ID"),
                    tableID: VIS.context.getContextAsInt(self.windowNo, "0|AD_Table_ID")
                },
                success: function (data) {
                    data = JSON.parse(data);
                    if (data) {
                        for (var i = 0; i < data.Widgets.length; i++) {
                            result.push(data.Widgets[i]);
                        }
                    }
                    if (callback)
                        callback(result, data.WidgetStyle, data.IsRandomColor, data.MSG);
                }
            });
            return result;
        }

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
            this.widgetID = frame.widgetInfo.widgetID;
            this.initializeComponent(frame.widgetInfo.widgetID);
            // this.GetWidgetSize(frame.widgetInfo.AD_UserHomeWidgetID);
        }
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.dynamicWidget.prototype.widgetSizeChange = function (widgetInfo) {
        this.frame.widgetInfo = widgetInfo;
        if (!size.editMode) {
            this.resize(Math.floor(size.height.replace('px', '')));
        }

    };
    VIS.dynamicWidget.prototype.refreshWidget = function () {
        this.initializeComponent(this.widgetID);
    };

    VIS.dynamicWidget.prototype.widgetFirevalueChanged = function (value) {
        if (value.ActionName != null && value.ActionType != null) {
            var type = value.ActionType.toUpper();
            if (type == 'W') {
                if (value.ActionName == value.WindowName) {
                    this.listener.widgetFirevalueChanged(value);
                } else {
                    var AD_Window_ID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "UserPreference/GetWindowID",
                        { "WindowName": value.ActionName }, null);
                    if (AD_Window_ID > 0) {
                        VIS.viewManager.startWindow(AD_Window_ID, null, value);  // Open Window with trigger custom event with the value
                    }
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