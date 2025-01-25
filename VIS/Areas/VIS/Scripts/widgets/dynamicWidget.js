(function (VIS, $) {
    VIS = VIS || {};

    // Create Dynamic Widget Class
    VIS.dynamicWidget = function () {
        this.frame;
        this.windowNo;
        this.WidgetID;
        var self = this;
        var $root = $("<div class='vis-dynamicWidget-main'>");
        var onClickParameters = [];
        var divHeight = 0;
        this.records = [];

        // Initialize the dynamic widget component
        this.initializeComponent = function (AD_Widget_ID) {
            createBusyIndicator();
            showBusy(true);
            if (AD_Widget_ID > 0) {
                getField(AD_Widget_ID);
            }
        };

        // Handle after loading data
        this.afterLoad = function (data, widgetStyle, isRandomColor, errorMsg) {
            clearRoot();
            onClickParameters = [];
            applyWidgetStyle(widgetStyle);
            if (data && data.length > 0) {
                processWidgetData(data, isRandomColor, errorMsg);
                adjustHeight();
                setupScrollArrows();
            } else {
                $root.append($("<label class='vis-dynamicWidget-msg'> " + VIS.Msg.getMsg("NoDataFound") + "</label>"));

            }
            bindEvents();
            showBusy(false);
        }

        function createBusyIndicator() {
            var $bsyDiv = $('<div id="busyDiv" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id"'
                + ' class= "vis-busyindicatorinnerwrap" > <i class="vis_widgetloader"></i></div ></div > ');
            $root.append($bsyDiv);
        };

        function showBusy(show) {
            if (show) {
                $root.find("#busyDiv").show();
            }
            else {
                $root.find("#busyDiv").hide();
            }
        };

        // Clear root element and set style
        function clearRoot() {
            $root.empty();
        }

        function applyWidgetStyle(style) {
            $root.attr('style', style);
        }

        // Process and render each widget field
        function processWidgetData(data, isRandomColor, errorMsg) {
            data.sort(function (a, b) {
                return a.SeqNo - b.SeqNo;
            });
            if (errorMsg) {
                showErrorMessage(errorMsg);
            }

            for (var i = 0; i < data.length; i++) {
                var field = data[i];
                onClickParameters.push(field.OnClick);
                var $element = createFieldElement(field, i, isRandomColor);
                appendFieldElement($element, field.IsSameLine, field.ImageURL);
            }
        }

        // Show error message
        function showErrorMessage(errorMsg) {
            var errorIcon = $('<i title="Error Field: ' + errorMsg.substring(0, errorMsg.length - 2) + '" class="fa fa-exclamation-triangle vis-exclamation-icon"></i>');
            $root.append(errorIcon);
        }

        // Create field element based on control type
        function createFieldElement(field, index, isRandomColor) {
            var $element;
            var name = field.Name;
            var badgeName = field.BadgeName;
            var isBadge = field.IsBadge;
            var badgeStyle = field.BadgeStyle;

            switch (field.ControlType) {
                case 'BT':
                    if (isBadge == 'Y' && badgeName != '') {
                        $element = $("<button title='" + name + "' class='vis-widget-field'>").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', index);
                    } else {
                        $element = $("<button title='" + name + "' class='vis-widget-field'>").text(name).attr('index', index);
                    }
                    break;
                case 'LN':
                    if (isBadge == 'Y' && badgeName != '') {
                        $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', index);
                    } else {
                        $element = $("<a title='" + name + "' class='vis-widget-field' href='javascript:void(0)'>").text(name).attr('index', index);
                    }
                    break;
                case 'BG':
                    $element = $("<span title='" + name + "' class='vis-widget-field badge vis-widget-badge'>").text(name).attr('index', index);
                    break;
                case 'LB':
                    if (isBadge == 'Y' && badgeName != '') {
                        $element = $("<label title='" + name + "' class='vis-widget-field' >").html(name + " <span style='margin: 0; " + badgeStyle + "' class='badge vis-widget-badge'>" + badgeName + "</span>").attr('index', index);
                    } else {
                        $element = $("<label title='" + name + "' class='vis-widget-field' >").text(name).attr('index', index);
                    }
                    break;
                default:
                    return;
            }

            applyStyleOrRandomColor($element, field.HtmlStyle, isRandomColor, isBadge);
            return $element;
        }

        // Apply custom style or random color to the element
        function applyStyleOrRandomColor(element, htmlStyle, isRandomColor, isBadge) {
            if (htmlStyle) {
                element.attr('style', htmlStyle);
            } else if (isRandomColor === 'Y') {
                applyRandomColor(element, isBadge);
            } else {
                element.addClass('default');
            }
        }

        // Generate random color
        function applyRandomColor($element, isBadge) {
            var hue = Math.floor(Math.random() * (360 - 0)) + 0;
            var v = Math.floor(Math.random() * 16) + 75;

            var color = {
                light: 'hsl(' + hue + ', 100%,' + v + '%)',
                dark: 'hsl(' + hue + ', 100%,' + (v - 45) + '%)'
            }

            if ($element.is('button') || $element.is('span')) {
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

        // Append field element to root
        function appendFieldElement($element, sameLine, imageURL) {
            var container = $("<div class='vis-add-row'></div>");

            if (imageURL) {
                $element.prepend(imageURL);
            }

            if (sameLine === 'N' || $root.find('.vis-add-row').length === 0) {
                $root.append(container.append($element));
            } else {
                $root.find('.vis-add-row:last').append($element);
            }
        }

        // Handle scroll arrows visibility
        function setupScrollArrows() {
            if (($root[0].scrollHeight - 22) > divHeight) {
                var arrowDiv = createScrollArrows();
                $root.append(arrowDiv);
            }
        }

        function createScrollArrows() {
            return $('<div class="vis-dynamicwidget-arrow">'
                + '<i class="fa fa-caret-up vis-topArrow-icon" aria-hidden="true"></i>'
                + '<i class="fa fa-caret-down vis-bottomArrow-icon" aria-hidden="true"></i>'
                + '</div>');
        }

        // Bind field click and arrow scroll events
        function bindEvents() {
            $root.find('.vis-widget-field').on('click', function () {
                if ($(this).is('label')) {
                    return;
                }
                var index = $(this).attr('index');
                handleClick(index);
            });

            $root.find('.vis-bottomArrow-icon').on('click', function () {
                scroll('down', divHeight);
            });

            $root.find('.vis-topArrow-icon').on('click', function () {
                scroll('up', divHeight);
            });
        }

        // Handle field click
        function handleClick(index) {
            if (onClickParameters.length > 0) {
                self.widgetFirevalueChanged(onClickParameters[index]);
            }
        }

        // Scroll the widget
        function scroll(direction, divHeight) {
            var currentScrollTop = $root.scrollTop();
            var newScrollTop = direction === 'down' ? currentScrollTop + divHeight : currentScrollTop - divHeight;

            $root.animate({ scrollTop: newScrollTop }, 800);

            setTimeout(function () {
                updateArrowVisibility(newScrollTop, divHeight);
            }, 1000);
        }

        // Update arrow visibility based on scroll position
        function updateArrowVisibility(scrollTop, divHeight) {
            toggleArrow($root.find('.vis-bottomArrow-icon'), scrollTop < ($root[0].scrollHeight) - 22 - divHeight);
            toggleArrow($root.find('.vis-topArrow-icon'), scrollTop > 0);
        }

        function toggleArrow($arrow, isEnabled) {
            $arrow.css({
                "pointer-events": isEnabled ? "all" : "none",
                "opacity": isEnabled ? "1.0" : "0.3"
            });
        }

        // Adjust height after rendering
        function adjustHeight() {
            self.height = Math.floor(self.frame.widgetInfo.height.replace("px", ""));
            divHeight = self.height;
            self.scrollHeight = $root[0].scrollHeight - 22;
        }

        // Handle widget resizing
        this.resize = function (widgetHeight) {
            if (($root[0].scrollHeight - 22) > widgetHeight) {
                $root.find('.vis-dynamicwidget-arrow').removeClass('d-none');
            }
        };

        // Retrieve widget field data via AJAX
        function getField(WidgetID, callback) {
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
                    self.records = data;
                    self.afterLoad(data.Widgets || [], data.WidgetStyle, data.IsRandomColor, data.MSG);
                    /* if (callback) {
                         callback(data.Widgets || [], data.WidgetStyle, data.IsRandomColor, data.MSG);
                     }*/
                }
            });
        }

        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            self = null;
            if ($root) $root.remove();
            $root = null;
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
        }
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.dynamicWidget.prototype.widgetSizeChange = function (widgetInfo) {
        this.frame.widgetInfo = widgetInfo;
        if (!widgetInfo.editMode) {
            this.resize(Math.floor(widgetInfo.height.replace('px', '')));
        }

    };
    VIS.dynamicWidget.prototype.refreshWidget = function () {
        /* if (this.records && this.records.Widgets.length>0) {
             this.afterLoad(this.records.Widgets || [], this.records.WidgetStyle, this.records.IsRandomColor, this.records.MSG);
         }*/
        this.initializeComponent(this.widgetID);
    };

    VIS.dynamicWidget.prototype.widgetFirevalueChanged = function (value) {
        if (value.ActionName != null && value.ActionType != null) {
            var type = value.ActionType.toUpper();
            if (type == 'W') {
                if (this.listener.apanel && this.listener.apanel.gridWindow && value.ActionName == this.listener.apanel.gridWindow.getName()) {
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
                    if (!VIS.MRole.getFormAccess(AD_Form_ID)) {
                        VIS.ADialog.warn("AccessTableNoView");
                        return;
                    }
                    VIS.viewManager.startForm(AD_Form_ID, null);  // Open Form
                }
            }
            else if (type == 'P') {
                var Ad_Process_ID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetProcessID",
                    { "processName": value.ActionName }, null);
                if (Ad_Process_ID > 0) {
                    if (!VIS.MRole.getProcessAccess(Ad_Process_ID)) {
                        VIS.ADialog.warn("AccessTableNoView");
                        return;
                    }
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