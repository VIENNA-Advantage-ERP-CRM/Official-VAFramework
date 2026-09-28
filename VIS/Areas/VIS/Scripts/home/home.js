/**
 * Home Widget
 * VIS228 Date 10-May-2024
 * purpose - Show widget on home page
 */
; (function (VIS, $) {
    function HomeMgr2() {
        'use strict';
        var $home = null;
        var self = this;
        var widgetList = {};
        var widgetWidth = null;
        var homeItems = {};
        var originalPosition; // Store the original position of a draggable element
        var isEditMode = false; // Flag to indicate whether the widget is in edit mode
        var isChanged = false;
        var $ulPopup = null;
        var $infoAnchor = null;      // icon the action menu was opened from, used to anchor the description popover
        var infoWidget = null;       // widget definition the action menu was opened for
        var dashboards = [];         // Home/GetDashboards: legacy home (ID 0), the user's own, shared with the role
        var currentDashboardID = -1; // -1 until loadDashboards picked one; 0 = legacy layout without a dashboard row
        var hiddenRows = [];         // saved rows of the current dashboard the role's catalogue cannot render
        var $sheet = null;           // switcher sheet (built on first open)
        var $spot = null;            // Ctrl+K jump dialog
        var formMode = null;         // sheet form: 'create' | 'rename' | 'share' (own -> shared) | 'roles' (shared)
        var formTarget = null;       // dashboard the rename / share / roles form is for
        var rowMenuTarget = null;    // AD_Dashboard_ID the row menu is open for
        var spotCursor = 0;

        // translated label with a plain-English fallback when the AD_Message row is missing
        function msg(key, fallback) {
            var text = VIS.Msg.getMsg(key);
            return text === '[' + key + ']' ? fallback : text;
        }
        // Function to initialize the home widget

        //function hideShowIcon() {
        //    if (isEditMode) {
        //        $home.find('.vis-widgetDelete svg').hide();
        //        $home.find('.vis-widgetDelete i').show();
        //    } else {
        //        $home.find('.vis-widgetDelete i').hide();
        //        $home.find('.vis-widgetDelete svg').show();
        //    }
        //}

        function deleteWidget(ui) {
            isChanged = true;
            if (ui.data('wid') && ui.data('wid').toString().indexOf('temp_') == -1) {
                var obj = {
                    id: ui.data('wid')
                };
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/DeleteWidgetFromHome", obj, function (result) {

                });
            }

            $home.find('.vis-widget-item[data-wid="' + ui.data('wid') + '"]').slideUp(function () {
                $(this).remove();
                if (homeItems && homeItems[ui.data('wid')]) {
                    homeItems[ui.data('wid')].wform.dispose();
                    delete homeItems[ui.data('wid')];
                }
            });


        }

        function getPopupList() {
            var ullst = $("<ul class='vis-apanel-rb-ul'>");
            ullst.append($('<li data-action="R"><i data-action="R" class="fa fa-refresh"></i></li>'));
            ullst.append($('<li data-action="I"><i data-action="I" class="fa fa-info-circle"></i></li>'));
            return ullst;
        };

        /**
         * Show the widget description in a popover anchored to the widget action icon
         */
        function showWidgetInfo() {
            if (!$infoAnchor || !infoWidget) {
                return;
            }
            //  the action menu is kept open by w2ui while the click originates inside it - drop it explicitly
            $('#w2ui-overlay').removeData('keepOpen').remove();

            var $info = $('<div class="vis-widgetInfo-pop">');
            $info.append($('<div class="vis-widgetInfo-head">').text(infoWidget.Description || infoWidget.DisplayName || infoWidget.Name || ''));
            $info.append($('<div class="vis-widgetInfo-body">').text(infoWidget.Help));
            $infoAnchor.w2overlay($info, { html: $info, name: 'widgetinfo', align: 'right', maxHeight: 260 });
        };

        $ulPopup = getPopupList();

        if ($ulPopup) {
            $ulPopup.on("click", "LI", function (e) {
                var action = $(e.target).data("action");
                var ui = $(e.target).closest('ul');
                if (action == 'D') {
                    deleteWidget(ui);
                }
                else if (action == 'R') {
                    homeItems[ui.data('wid')].wform.refreshWidget();
                }
                else if (action == 'I') {
                    showWidgetInfo();
                }
            });
        }

        function setAdditionalInfo(id, info) {
            if (homeItems[id]) {
                homeItems[id].additionalInfo = info;
            }
        }
        function initHome(home) {
            // Show the user date element
            $('#vis_userDate').show();
            $home = home;

            // Create and configure the open right panel button
            var openRightPanel = $('<div class="vis-add-widgetContainer" style="display:none"><button class="vis-add-widgetButton">+</button><p>' + VIS.Msg.getMsg("VISEditHomeMsg") + '</p></div>');

            // Create the widget container
            var $container = $('<div class="vis-widget-container" style="--rowheight:' + (($home.width() - 25)) / 9 + 'px">');

            // Function to resize the widget container based on window size
            function resizeWidgetContainer() {
                var wd = $home.find('.vis-home-leftPanel').width();
                if (wd < 300) {
                    wd = $(window).width();
                }

                var w = (wd - 25) / 9;
                if ($(window).width() <= 500) {
                    w = (wd - 25) / 3;
                } else if ($(window).width() <= 960) {
                    w = (wd - 25) / 6;
                }


                widgetWidth = w;
                $home.find('.vis-widget-container').attr('style', '--rowheight:' + w + 'px');

                var itm = Object.keys(homeItems);
                for (var i = 0; i < itm.length; i++) {
                    var obj = {
                        AD_UserHomeWidgetID: homeItems[itm[i]].AD_UserHomeWidgetID,
                        widgetID: homeItems[itm[i]].WidgetID,
                        windowSpecific: homeItems[itm[i]].WindowSpecific,
                        editMode: isEditMode,
                        rows: homeItems[itm[i]].rows,
                        Cols: homeItems[itm[i]].cols,
                        width: ((homeItems[itm[i]].cols || 1) * widgetWidth).toFixed(2) + 'px',
                        height: ((homeItems[itm[i]].rows || 1) * widgetWidth).toFixed(2) + 'px',
                        additionalInfo: homeItems[itm[i]].additionalInfo,
                        setAdditionalInfo: setAdditionalInfo
                    }
                    homeItems[itm[i]].wform.widgetSizeChange(obj);
                }
            }
            /**
             * Adjust Size
             */
            function adjustWidgetDivSize() {
                var homeWidth = $home.closest('#vis_mainConatiner').innerWidth() || $home.innerWidth() || $(window).width();
                $home.find('.scrollerHorizontalWidget').width(homeWidth);
                resizeWidgetContainer();
            }

            // Event handling functions
            function events() {
                var $leftPanel = $home.find('.vis-home-leftPanel');
                var $rightPanel = $home.find('.vis-home-rightPanel');

                // header icon: dashboard switcher
                $('#vis_switchDashboard').off('click.visDashboards').on('click.visDashboards', openSwitcher);

                // Event handler for clicking the edit button
                openRightPanel.add($('#vis_editHome')).on('click', function () {
                    if (isEditMode) return;
                    // read-only shared dashboards: Edit is disabled (Duplicate in the switcher makes an own copy)
                    var d = findDashboard(currentDashboardID);
                    if (isReadOnlyDashboard(d)) {
                        if (typeof toastr !== 'undefined')
                            toastr.info(msg("VA_DashboardViewOnlyHint", "View only - your role can't change this shared dashboard. Use Duplicate in the dashboard switcher to make your own copy."), '', { timeOut: 3500, positionClass: "toast-top-center" });
                        return;
                    }
                    // read / write role maintaining a shared dashboard: changes reach every assigned role
                    if (d && d.IsShared)
                        toast(msg("VA_DashboardEditingShared", "Shared dashboard - your changes apply to every role it is assigned to"));
                    enterEditMode();
                });

                function enterEditMode() {
                    isChanged = false;
                    var leftPanelWidth = '70%';
                    $leftPanel.animate({
                        width: leftPanelWidth
                    }, 300);

                    $home.find('.vis-add-widgetContainer').hide('slide', { direction: 'left' }, 300);

                    $rightPanel.show('slide', { direction: 'right' }, 200);
                    $home.find('.vis-home-leftPanel').sortable("enable");
                    isEditMode = true;
                    $container.addClass('vis-editModeWidget');
                    //hideShowIcon();
                    $('#vis_editHome').hide();
                    /*$leftPanel.find('.vis-trash-area').show();*/
                    setTimeout(function () {
                        resizeWidgetContainer();
                    }, 300);
                }

                // Event handler for closing the widget
                $home.find('#btnCloseWidget').click(function () {
                    $leftPanel.animate({
                        width: '100%'
                    }, 300);
                    if ($home.find('.vis-widget-container .vis-widget-item').length > 0) {
                        $home.find('.vis-add-widgetContainer').hide();
                    } else {
                        $home.find('.vis-add-widgetContainer').show();
                    }

                    $container.removeClass('vis-editModeWidget');
                    $rightPanel.hide('slide', { direction: 'left' }, 300);
                    $home.find('.vis-home-leftPanel').sortable("disable");
                    $('#vis_editHome').show();

                    isEditMode = false;
                    //hideShowIcon();
                    saveDashboard();
                    setTimeout(function () {
                        resizeWidgetContainer();
                    }, 300);
                });

                $home.find('#btnRefreshWidget').click(function () {
                    loadWidgets();
                    $home.find('#txtWidgetSearch').val('');
                });

                /**
                 * search widgets
                 */
                $home.find('#txtWidgetSearch').keyup(function () {
                    var searchText = $(this).val().toLowerCase();
                    var containerVisibility = {};
                    $home.find(".vis-widgetDrag-item").each(function () {
                        var item = $(this);
                        var itemText = item.find(".vis-dotdot2").text().toLowerCase();
                        var container = item.closest(".vis-widgetDrag-container");
                        var heading = container.prev(".vis-main-widget-heading");

                        if (itemText.includes(searchText)) {
                            item.show();
                            containerVisibility[container.index()] = true;
                        } else {
                            item.hide();
                        }
                        if (!containerVisibility[container.index()]) {
                            heading.hide();
                        } else {
                            heading.show();
                        }
                    });
                })


                // Event handler for deleting a widget
                $leftPanel.on('click', '.vis-widgetDelete', function (e) {
                    e.stopPropagation();
                    if (!isEditMode) {
                        var ulPopup = $ulPopup.clone(true);
                        var ui = $(this).closest('.vis-widget-item');
                        //  refresh is backed by homeItems, which only exists for dictionary widgets
                        if (ui.data('type') != "W") {
                            ulPopup.find('li[data-action="R"]').remove();
                        }

                        //  labels are not loaded yet when the list is built at script load, so translate on open
                        ulPopup.find('li[data-action="R"]').attr('title', VIS.Msg.getMsg("Refresh"));
                        ulPopup.find('li[data-action="I"]').attr('title', VIS.Msg.getMsg("Info"));

                        $infoAnchor = $(this);
                        infoWidget = widgetList[ui.data('ws') + '_' + ui.data('type')];
                        //  no point offering info when the widget has no description maintained
                        if (!infoWidget || !infoWidget.Description) {
                            ulPopup.find('li[data-action="I"]').remove();
                        }

                        if (ulPopup.find('li').length === 0) {
                            return;
                        }

                        ulPopup.attr('data-wid', ui.data('wid'));
                        $(this).w2overlay(ulPopup, { html: ulPopup, left: -5, top: -9 });
                    } else {
                        var ui = $(this).closest('.vis-widget-item');
                        deleteWidget(ui);
                    }
                });

                $leftPanel.on('click', '.vis-linksWidget', function () {
                    if (isEditMode) {
                        return;
                    }

                    var ui = $(this).closest('.vis-widget-item');

                    //var dsi = $.grep(widgetList, function (element, index) {
                    //    return element.KeyID == ui.data('ws') && element.Type == ui.data('type');
                    //});

                    var dsi = widgetList[ui.data('ws') + '_' + ui.data('type')];

                    //1   Contain Child ShortCut
                    if (dsi) {
                        //dsi = dsi[0];
                        if (dsi.HasChild) {
                            // alert("setting Dialog");
                            var sd = new VIS.shortcutMgr.SettingDialog(dsi.KeyID);// new SettingDialog(dsi.KeyID);
                            sd.show();
                            sd = null;
                        }

                        //2 If URL

                        else if (dsi.Url || dsi.Url.length > 0) {
                            VIS.Env.startBrowser(dsi.Url);
                        }

                        // 3 Special Class
                        else if (dsi.SpecialAction && dsi.SpecialAction.length > 0) {
                            //check name has moduleprefix
                            var className = dsi.SpecialAction;
                            //Get form Name
                            var formName = dsi.ActionName; // className.Substring(className.LastIndexOf('.') + 1);

                            try {

                                //className = "VIS.Apps.TestForm";
                                var type = VIS.Utility.getFunctionByName(className, window);
                                var o = new type();
                                o.show();
                                o = null;
                            }
                            catch (e) {
                                log.log(VIS.Logging.Level.WARNING, "Class=" + className + ", Action Class Name=" + className, e)
                                return false;
                            }
                        }

                        else //Entity Action
                        {
                            if (dsi.Action == null || dsi.Action.length <= 0 || dsi.ActionID < 1) {
                                return;
                            }
                            VIS.viewManager.startAction(dsi.Action, dsi.ActionID);
                        }

                    }

                });
            }

            // Function to enable drag and drop functionality
            function dragDrop() {
                // Make the .vis-widgetDrag-item elements draggable
                $home.find('.vis-widgetDrag-item').draggable({
                    helper: 'clone', // Use a clone of the dragged element
                    start: function (event, ui) {
                        originalPosition = ui.helper.position();
                    },
                    revert: 'invalid'
                });

                // Make the .vis-home-leftPanel droppable
                $home.find('.vis-home-leftPanel').droppable({
                    accept: '.vis-widgetDrag-item', // Only accept .vis-widgetDrag-item elements
                    over: function (event, ui) {
                        // Show placeholder                      
                        $(this).find('.vis-editModeWidget').addClass('droppable-placeholder');
                    },
                    out: function (event, ui) {
                        // Remove placeholder
                        $(this).find('.droppable-placeholder').removeClass('droppable-placeholder');
                    },
                    drop: function (event, ui) {
                        $(this).find('.droppable-placeholder').removeClass('droppable-placeholder');

                        isChanged = true;
                        // Clone the dragged element and append it to the .vis-home-leftPanel
                        var type = $(ui.helper).data('type')
                        var keyid = $(ui.helper).data('keyid');

                        var widgetSizes = [];
                        widgetSizes.push({
                            SRNO: 99,
                            KeyID: $(ui.helper).data('keyid'),
                            Type: $(ui.helper).data('type'),
                        });

                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveSingleWidget", { widgetSizes: widgetSizes, windowID: 0, dashboardID: currentDashboardID }, function (result) {
                            renderWidgets(widgetList[keyid + '_' + type], result, null);
                        });



                    }
                });

                makeSortable($home.find('.vis-home-leftPanel'));
            }

            // Function to make a container sortable
            function makeSortable($container) {
                $container.sortable({
                    items: ".vis-widget-item",
                    cursor: "grabbing",
                    helper: "clone",
                    disabled: true,
                    tolerance: "pointer",
                    placeholder: "ui-sortable-placeholder",
                    sort: function (event, ui) {
                        ui.placeholder.css('visibility', 'visible');
                    },
                    start: function (event, ui) {
                        var gridArea = ui.helper.css('grid-area');
                        ui.placeholder.height(ui.helper.outerHeight());
                        ui.placeholder.width(ui.helper.outerWidth());
                        ui.placeholder.css('grid-area', gridArea);
                    },
                    stop: function (event, ui) {
                        isChanged = true;
                    }
                });
            }

            // Function to render widgets
            function renderWidgets(widget, wid, AdditionalInfo) {
                //var hue = Math.floor(Math.random() * 360);
                //var v = Math.floor(Math.random() * 16) + 85;
                //var pastel = 'hsl(' + hue + ', 100%, ' + v + '%)'
                var info = {
                    AD_UserHomeWidgetID: wid,
                    widgetID:widget.WidgetID,
                    windowSpecific: widget.WindowSpecific,
                    editMode: isEditMode,
                    rows: (widget.Rows || 1),
                    cols: (widget.Cols || 1),
                    width: ((widget.Cols || 1) * widgetWidth).toFixed(2) + 'px',
                    height: ((widget.Rows || 1) * widgetWidth).toFixed(2) + 'px',
                    additionalInfo: AdditionalInfo || null,
                    setAdditionalInfo: setAdditionalInfo

                }

                if (wid == 0) {
                    wid = 'temp_' + Math.floor(Date.now());
                }


                var $item = $('<div>');
                if (widget.Type == "W") {
                    var wform = new VIS.AForm();
                    wform.openWidget(widget.ClassName, -99999, info);
                    wform.addChangeListener(VIS.HomeMgr2);
                    $item = wform.getContentGrid();
                    var obj = JSON.parse(JSON.stringify(info));
                    obj['wform'] = wform;
                    homeItems[wid] = obj;
                }

                $item.addClass("vis-widget-item");
                if (widget.Description) {
                    $item.addClass("vis-widgetHasInfo");
                }
                //$item.css("background-color", pastel);
                $item.attr('data-ws', widget.KeyID);
                $item.attr('data-wid', wid || 0);
                $item.attr('data-type', widget.Type);

                $item.css({
                    gridRow: "span " + (widget.Rows || 1),
                    gridColumn: "span " + (widget.Cols || 1),
                    display: "none"
                });

                if (widget.Type == "L") {
                    var $div = $('<div class="vis-linksWidget">');
                    $div.append(widget.items).append('<div class="linktitle">' + widget.DisplayName + '</div>');
                    $item.append($div);
                }
                else if (widget.Type == "C" || widget.Type == "K" || widget.Type == "V") {
                    if (window.VADB) { VADB.chartFactory.getChart(widget.WidgetID, $item, widget.Type, info); }
                }


                var trash = $('<div class="vis-widgetDelete"><i class="fa fa-trash-o"></i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path transform="rotate(90 8 8)" d="M5 8a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z"></path></svg></div>');

                //hideShowIcon();


                var trash = $('<div class="vis-widgetDelete"><i class="fa fa-trash-o"></i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path transform="rotate(90 8 8)" d="M5 8a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z"></path></svg></div>');

                //hideShowIcon();

                $item.append(trash);
                $container.append($item);
                $item.slideDown("slow");

            }


            // Function to load widgets
            function loadWidgets() {
                //$container.append(openRightPanel);
                //$home.find('.vis-home-leftPanel').append($container);
                $home.find('.vis-widget-body').empty();
                $home.find('#divfeedbsy').show();
                widgetList = {};
                var url = VIS.Application.contextUrl + "Home/GetWidgets";
                VIS.dataContext.getJSONData(url, { windowID: 0 }, function (result) {
                    $home.find('#divfeedbsy').hide();
                    if (!result) {
                        return;
                    }
                    result.sort((a, b) => a.DisplayName - b.DisplayName);
                    //var widgetLst = result;


                    for (var i = 0; i < result.length; i++) {

                        var moduelName = null;
                        var img = null;
                        var itm = result[i];
                        if (result[i].Type == 'L') {
                            moduelName = "Links"
                            if (itm.HasImage) {
                                if (!itm.IsImageByteArray && itm.IconUrl.indexOf('.') < 0) {
                                    img = '<i data-index="' + i + '" class="' + itm.IconUrl + ' " style="'+itm.FontStyle+'"></i>';
                                }
                                else {
                                    var url = "";
                                    if (itm.IsImageByteArray) {
                                        url = 'data:image/*;base64,' + itm.IconBytes;
                                    }
                                    else {
                                        url = VIS.Application.contextUrl + itm.IconUrl;

                                    }
                                    img = '<img data-index="' + i + '" src="' + url + '"/>';

                                }

                            } else {
                                img = '<i data-index="' + i + '" class="vis vis-shortcut"></i>';
                            }

                            itm['items'] = img;

                        } else if (result[i].Type == 'W') {
                            moduelName = result[i].ModuleName
                            img = result[i].Img;
                        } else if (result[i].Type == 'C' || result[i].Type == 'K' || result[i].Type == 'V') {
                            moduelName = VIS.Msg.getMsg(result[i].ModuleName);
                            img = result[i].Img
                        }

                        widgetList[itm.KeyID + '_' + itm.Type] = itm;

                        if ($home.find('.vis-widget-body').find('div:contains("' + moduelName + '")').length === 0) {
                            $home.find('.vis-widget-body').append($('<div class="vis-main-widget-heading">' + moduelName + '</div>'));
                            $home.find('.vis-widget-body').append($('<div class="vis-widgetDrag-container">'));
                        }

                        var witem = $('<div class="vis-widgetDrag-item" data-type="' + result[i].Type + '" data-keyid="' + itm.KeyID + '"><div class="vis-imgsec">' + img + '</div><span style="display:block" class="vis-widgetSizeValue">' + (result[i].Cols || 1) + 'X' + (result[i].Rows || 1) + '</span><div class="vis-widgetSize" title="' + result[i].DisplayName + '"><span class="vis-dotdot2">' + result[i].DisplayName + '</span></div></div>');
                        $home.find('.vis-widgetDrag-container:last').append(witem);
                    }

                    dragDrop();
                    loadHomeWidgets();


                });
            }



            function loadHomeWidgets() {
                $home.find('.vis-widget-container .vis-widget-item').remove();
                var url = VIS.Application.contextUrl + "Home/GetUserWidgets";
                $home.find('#divfeedbsy').show();
                hiddenRows = [];
                VIS.dataContext.getJSONData(url, { windowID: 0, dashboardID: currentDashboardID }, function (result) {
                    if (result && result.length > 0) {
                        $home.find('.vis-add-widgetContainer').hide();
                        for (var i = 0; i < result.length; i++) {
                            //var dsi = $.grep(widgetList, function (element, index) {
                            //    return element.KeyID == result[i].KeyID && element.Type==result[i].Type;
                            //});
                            var dsi = widgetList[result[i].KeyID + '_' + result[i].Type];

                            if (dsi) {
                                renderWidgets(dsi, result[i].ID, result[i].AdditionalInfo);
                            }
                            else if (currentDashboardID > 0) {
                                // a dashboard is shared across roles: keep what this role cannot show
                                hiddenRows.push({ KeyID: result[i].KeyID, Type: result[i].Type, AdditionalInfo: result[i].AdditionalInfo });
                            }
                        }

                        dragDrop();
                        if (isEditMode) {
                            $home.find('.vis-home-leftPanel').sortable("enable");
                            $home.find('.vis-add-widgetContainer').hide();

                        }
                    }
                    //else {
                    //    $home.find('.vis-add-widgetContainer').show();
                    //} 
                    else {

                        // catalogue defaults apply to the legacy layout only; an empty dashboard stays empty
                        var lst = currentDashboardID > 0 ? [] : Object.values(widgetList);
                        var filteredArray = $.grep(lst, function (item) {
                            return item.IsDefault === true;
                        });

                        filteredArray.sort(function (a, b) {
                            return a.Sequence - b.Sequence;
                        });

                        if (filteredArray && filteredArray.length > 0) {
                            for (var j = 0; j < filteredArray.length; j++) {
                                renderWidgets(filteredArray[j], 0, filteredArray[j].AdditionalInfo);
                            }
                        }
                        else {
                            $home.find('.vis-add-widgetContainer').show();
                        }

                        dragDrop();
                    }
                    if (isEditMode) {
                        $home.find('.vis-home-leftPanel').sortable("enable");
                        $home.find('.vis-add-widgetContainer').hide();
                    }
                    $home.find('#divfeedbsy').hide();
                });
            }

            function loadFavourites() {
                VIS.favMgr.init($('#vis_home_favourites'));
            };

            // Function to save the dashboard layout; callback runs once the server has stored it
            function saveDashboard(callback) {
                if (!isChanged) {
                    if (callback) callback();
                    return;
                }
                var widgetSizes = [];
                $home.find('.vis-widget-item').each(function (index) {
                    var aInfo = null;
                    if ($(this).data('type') == "W") {
                        aInfo = homeItems[$(this).data('wid')].additionalInfo;
                    }

                    widgetSizes.push({
                        SRNO: (index + 1),
                        KeyID: $(this).data('ws'),
                        Type: $(this).data('type'),
                        AdditionalInfo: aInfo
                    });
                });
                // rows the current role cannot render go back unchanged, after the visible ones
                for (var h = 0; h < hiddenRows.length; h++) {
                    widgetSizes.push($.extend({}, hiddenRows[h], { SRNO: widgetSizes.length + 1 }));
                }

                if (widgetSizes.length > 0) {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveDashboard", { widgetSizes: widgetSizes, windowID: 0, dashboardID: currentDashboardID }, function (result) {
                        isChanged = false;
                        loadDashboards(null);   // refresh counts / stamps
                        if (callback) callback();
                    });
                }
                else if (callback) {
                    callback();
                }
            }

            /**
             * Dashboards: list from Home/GetDashboards (legacy home = ID 0, dashboards the user created,
             * shared dashboards assigned to the role), slide-in switcher sheet (new / rename / duplicate /
             * share with roles / edit roles / default / delete) and Ctrl+K jump.
             * callback runs after the list is ready.
             */
            function loadDashboards(callback) {
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/GetDashboards", {}, function (result) {
                    dashboards = result && result.length > 0 ? result : [{ AD_Dashboard_ID: 0, Name: "Home" }];
                    if (!findDashboard(currentDashboardID)) {
                        // user default first, then the role default, then the first offered
                        // (legacy Home is only offered when there is no dashboard at all)
                        var previous = currentDashboardID;
                        var pick = $.grep(dashboards, function (d) { return d.IsUserDefault; })[0]
                            || $.grep(dashboards, function (d) { return d.IsRoleDefault; })[0]
                            || dashboards[0];
                        currentDashboardID = pick.AD_Dashboard_ID;
                        // the one on screen is gone (e.g. legacy Home once a dashboard exists)
                        if (previous >= 0) {
                            isChanged = false;
                            disposeHomeItems();
                            loadHomeWidgets();
                        }
                    }
                    renderDashboardBar();
                    if ($sheet && !$sheet.is(':hidden')) renderSheet();
                    if (callback) callback();
                });
            }

            // shared dashboard whose role assignment is read only: view it, or duplicate it into an own one
            function isReadOnlyDashboard(d) {
                return !!d && d.AD_Dashboard_ID > 0 && !d.CanEdit;
            }

            function findDashboard(id) {
                return $.grep(dashboards, function (d) { return d.AD_Dashboard_ID == id; })[0] || null;
            }

            function dashboardName(d) {
                return d.AD_Dashboard_ID == 0 ? msg("VA_HomeDashboard", "Home") : d.Name;
            }

            // "just now", "2h ago", "3d ago" ... from the ISO stamp GetDashboards returns
            function timeAgo(iso) {
                if (!iso) return "";
                var diff = (new Date() - new Date(iso)) / 1000;
                if (isNaN(diff)) return "";
                if (diff < 60) return msg("VA_JustNow", "just now");
                if (diff < 3600) return Math.floor(diff / 60) + "m " + msg("VA_Ago", "ago");
                if (diff < 86400) return Math.floor(diff / 3600) + "h " + msg("VA_Ago", "ago");
                return Math.floor(diff / 86400) + "d " + msg("VA_Ago", "ago");
            }

            // the header grid icon carries the current dashboard name as its tooltip; on a read-only
            // dashboard the Edit icon stays in place but is greyed out, with the reason as its tooltip
            // (styled inline, so it does not depend on the bundled stylesheet being refreshed)
            function renderDashboardBar() {
                var d = findDashboard(currentDashboardID);
                $('#vis_switchDashboard').attr('title', msg("VA_SwitchDashboard", "Switch dashboard") + (d ? ": " + dashboardName(d) : ""));

                var readOnly = isReadOnlyDashboard(d);
                var $edit = $('#vis_editHome');
                var $icon = $edit.find('i');
                if ($icon.data('title') === undefined) $icon.data('title', $icon.attr('title') || "");
                $edit.toggleClass('is-viewonly', readOnly).attr('aria-disabled', readOnly)
                    .css({ opacity: readOnly ? 0.4 : '', cursor: readOnly ? 'not-allowed' : '' });
                $icon.attr('title', readOnly
                    ? msg("VA_DashboardViewOnlyHint", "View only - your role can't change this shared dashboard. Use Duplicate in the dashboard switcher to make your own copy.")
                    : $icon.data('title'));
                $container.toggleClass('vis-home-viewonly', readOnly);
            }

            function toast(text) {
                if (typeof toastr !== 'undefined') {
                    toastr.success(text, '', { timeOut: 2500, positionClass: "toast-top-center" });
                }
            }

            // ---------- switcher sheet ----------
            function buildSheet() {
                $sheet = $('<div class="vis-dsw" style="display:none">'
                    + '<div class="vis-dsw-scrim"></div>'
                    + '<div class="vis-dsw-panel" role="dialog">'
                    + '  <div class="vis-dsw-head">'
                    + '    <h2 class="vis-dsw-title"></h2>'
                    + '    <div class="vis-dsw-head-actions">'
                    + '      <button type="button" class="vis-dsw-btn vis-dsw-btn-primary vis-dsw-new"><i class="fa fa-plus"></i> <span></span></button>'
                    + '      <button type="button" class="vis-dsw-iconbtn vis-dsw-close"><i class="fa fa-times"></i></button>'
                    + '    </div>'
                    + '  </div>'
                    + '  <div class="vis-dsw-body">'
                    + '    <div class="vis-dsw-form" style="display:none">'
                    + '      <p class="vis-dsw-form-note" style="display:none"></p>'
                    + '      <div class="vis-dsw-name">'
                    + '        <label class="vis-dsw-label"></label>'
                    + '        <input type="text" class="vis-dsw-input vis-dsw-name-input" maxlength="60" />'
                    + '      </div>'
                    + '      <div class="vis-dsw-form-row">'
                    + '        <label class="vis-dsw-radio"><input type="radio" name="vis-dsw-from" value="blank" checked /><span></span></label>'
                    + '        <label class="vis-dsw-radio"><input type="radio" name="vis-dsw-from" value="dup" /><span></span></label>'
                    + '      </div>'
                    + '      <label class="vis-dsw-share" style="display:none"><input type="checkbox" /><span></span></label>'
                    + '      <div class="vis-dsw-roles" style="display:none">'
                    + '        <div class="vis-dsw-roles-head"><input type="text" class="vis-dsw-input vis-dsw-roles-search" /><span class="vis-dsw-roles-count"></span></div>'
                    + '        <div class="vis-dsw-roles-list"></div>'
                    + '      </div>'
                    + '      <div class="vis-dsw-form-actions">'
                    + '        <button type="button" class="vis-dsw-btn vis-dsw-cancel"></button>'
                    + '        <button type="button" class="vis-dsw-btn vis-dsw-btn-primary vis-dsw-save"></button>'
                    + '      </div>'
                    + '    </div>'
                    + '    <div class="vis-dsw-section" data-section="current"><div class="vis-dsw-section-head"><span class="vis-dsw-section-title"></span></div><div class="vis-dsw-list"></div></div>'
                    + '    <div class="vis-dsw-section" data-section="mine"><div class="vis-dsw-section-head"><span class="vis-dsw-section-title"></span><span class="vis-dsw-section-count"></span></div><div class="vis-dsw-list"></div></div>'
                    + '    <div class="vis-dsw-section" data-section="role"><div class="vis-dsw-section-head"><span class="vis-dsw-section-title"></span><span class="vis-dsw-section-count"></span></div><div class="vis-dsw-list"></div></div>'
                    + '  </div>'
                    + '</div>'
                    + '<div class="vis-dsw-menu" style="display:none"></div>'
                    + '</div>');
                $('body').append($sheet);

                $sheet.find('.vis-dsw-title').text(msg("VA_Dashboard", "Dashboard"));
                $sheet.find('.vis-dsw-new span').text(msg("NewG", "New"));
                $sheet.find('.vis-dsw-close').attr('title', msg("Close", "Close"));
                $sheet.find('.vis-dsw-label').text(msg("VA_DashboardName", "Dashboard name"));
                $sheet.find('.vis-dsw-name-input').attr('placeholder', msg("VA_DashboardNameHint", "e.g. Q4 forecast"));
                $sheet.find('.vis-dsw-share span').text(msg("VA_DashboardShareWithRoles", "Share with roles"));
                $sheet.find('.vis-dsw-roles-search').attr('placeholder', msg("VA_DashboardSearchRoles", "Search roles"));
                $sheet.find('.vis-dsw-radio').eq(0).find('span').text(msg("VA_StartBlank", "Start blank"));
                $sheet.find('.vis-dsw-radio').eq(1).find('span').text(msg("VA_DuplicateCurrent", "Duplicate current"));
                $sheet.find('.vis-dsw-cancel').text(msg("Cancel", "Cancel"));
                $sheet.find('[data-section="current"] .vis-dsw-section-title').text(msg("VA_CurrentlyViewing", "Currently viewing"));
                $sheet.find('[data-section="mine"] .vis-dsw-section-title').text(msg("VA_MyDashboards", "My dashboards"));
                $sheet.find('[data-section="role"] .vis-dsw-section-title').text(msg("VA_RoleDashboards", "Shared with my role"));
                $sheet.find('.vis-dsw-share input').on('change', function () {
                    toggleRoles(this.checked, 0);
                });
                $sheet.find('.vis-dsw-roles-search').on('input', filterRoles);
                // read / write needs the role; taking the role away drops read / write too
                $sheet.find('.vis-dsw-roles-list').on('change', 'input', function () {
                    var $role = $(this).closest('.vis-dsw-role');
                    if ($(this).hasClass('vis-dsw-role-rw')) {
                        if (this.checked) $role.find('.vis-dsw-role-sel').prop('checked', true);
                    }
                    else if (!this.checked) {
                        $role.find('.vis-dsw-role-rw').prop('checked', false);
                    }
                    $sheet.find('.vis-dsw-roles').removeClass('is-invalid');
                    updateRoleCount();
                });

                $sheet.find('.vis-dsw-scrim, .vis-dsw-close').on('click', closeSwitcher);
                $sheet.find('.vis-dsw-new').on('click', function () { showForm('create', null); });
                $sheet.find('.vis-dsw-cancel').on('click', hideForm);
                $sheet.find('.vis-dsw-save').on('click', submitForm);
                $sheet.find('.vis-dsw-name-input').on('keydown', function (e) {
                    if (e.keyCode == 13) { e.preventDefault(); submitForm(); }
                });

                // rows: click switches, the dots button opens the row menu
                $sheet.on('click', '.vis-dsw-row-more', function (e) {
                    e.stopPropagation();
                    showRowMenu($(this));
                });
                $sheet.on('click', '.vis-dsw-row', function () {
                    var id = $(this).data('id');
                    if (id == currentDashboardID) { closeSwitcher(); return; }
                    switchDashboard(id);
                    closeSwitcher();
                });
                $sheet.find('.vis-dsw-menu').on('click', '[data-action]', function () {
                    var action = $(this).data('action');
                    var d = findDashboard(rowMenuTarget);
                    hideRowMenu();
                    if (d) rowAction(action, d);
                });
                $sheet.on('click', function (e) {
                    if (!$(e.target).closest('.vis-dsw-menu, .vis-dsw-row-more').length) hideRowMenu();
                });
            }

            function openSwitcher() {
                if (!$sheet) buildSheet();
                hideForm();
                renderSheet();
                $sheet.show();
                // refresh counts / stamps in the background
                loadDashboards(null);
            }

            function closeSwitcher() {
                if (!$sheet) return;
                hideRowMenu();
                hideForm();
                $sheet.hide();
            }

            function dashboardRow(d) {
                var $row = $('<div class="vis-dsw-row" tabindex="0">').attr('data-id', d.AD_Dashboard_ID);
                if (d.AD_Dashboard_ID == currentDashboardID) $row.addClass('is-active');
                $row.append('<span class="vis-dsw-row-dot"></span>');
                var $body = $('<span class="vis-dsw-row-body">');
                var $line = $('<span class="vis-dsw-row-nameline">').append($('<span class="vis-dsw-row-name">').text(dashboardName(d)));
                if (d.IsUserDefault) $line.append($('<span class="vis-dsw-badge vis-dsw-badge-default">').text(msg("Default", "Default")));
                else if (d.IsRoleDefault) $line.append($('<span class="vis-dsw-badge">').text(msg("VA_DashboardRoleDefault", "Role default")));
                $body.append($line);
                var count = d.AD_Dashboard_ID == currentDashboardID ? $home.find('.vis-widget-container .vis-widget-item').length : (d.WidgetCount || 0);
                var meta = count + " " + msg("visWidgets", "widgets");
                var ago = timeAgo(d.Updated);
                if (ago) meta += " · " + ago;
                if (d.IsOwner) meta += " · " + msg("VA_You", "you");
                else if (d.IsShared && d.CanEdit) meta += " · " + (d.RoleCount || 0) + " " + msg("VA_DashboardRoles", "roles");
                $body.append($('<span class="vis-dsw-row-meta">').text(meta));
                if (d.Description) $body.attr('title', d.Description);
                $row.append($body);
                $row.append('<span class="vis-dsw-row-more" title="' + msg("More", "More") + '"><i class="fa fa-ellipsis-h"></i></span>');
                return $row;
            }

            function renderSheet() {
                if (!$sheet) return;
                var current = findDashboard(currentDashboardID);
                var mine = $.grep(dashboards, function (d) { return d.AD_Dashboard_ID != currentDashboardID && !d.IsShared; });
                var role = $.grep(dashboards, function (d) { return d.AD_Dashboard_ID != currentDashboardID && d.IsShared; });

                var $current = $sheet.find('[data-section="current"] .vis-dsw-list').empty();
                if (current) $current.append(dashboardRow(current));

                var $mine = $sheet.find('[data-section="mine"]');
                $mine.find('.vis-dsw-section-count').text(mine.length);
                $mine.find('.vis-dsw-list').empty().append($.map(mine, dashboardRow));
                $mine.toggle(mine.length > 0);

                var $role = $sheet.find('[data-section="role"]');
                $role.find('.vis-dsw-section-count').text(role.length);
                $role.find('.vis-dsw-list').empty().append($.map(role, dashboardRow));
                $role.toggle(role.length > 0);
            }

            // ---------- new / rename / share / roles form ----------
            function showForm(mode, target) {
                formMode = mode;
                formTarget = target;
                var $form = $sheet.find('.vis-dsw-form');
                var withName = mode == 'create' || mode == 'rename';
                $form.find('.vis-dsw-name').toggle(withName);
                $form.find('.vis-dsw-name-input').val(mode == 'rename' ? target.Name : "");
                $form.find('.vis-dsw-form-row').toggle(mode == 'create');
                $form.find('input[name="vis-dsw-from"][value="blank"]').prop('checked', true);
                $form.find('.vis-dsw-share').toggle(mode == 'create');
                $form.find('.vis-dsw-share input').prop('checked', false);

                var note = "";
                if (mode == 'share') note = "“" + dashboardName(target) + "” — " + msg("VA_DashboardShareNote", "moves to Shared for the selected roles and is no longer one of your own dashboards. Only Read/Write roles can change it afterwards.");
                else if (mode == 'roles') note = "“" + dashboardName(target) + "” — " + msg("VA_DashboardRolesNote", "is offered to the selected roles.");
                $form.find('.vis-dsw-form-note').text(note).toggle(!!note);
                toggleRoles(mode == 'share' || mode == 'roles', target ? target.AD_Dashboard_ID : 0);

                var save = { create: msg("Create", "Create"), rename: msg("VA_Rename", "Rename"), share: msg("VA_DashboardShare", "Share"), roles: msg("Save", "Save") };
                $form.find('.vis-dsw-save').text(save[mode]);
                $form.show();
                if (withName) setTimeout(function () { $form.find('.vis-dsw-name-input').focus(); }, 40);
            }

            function hideForm() {
                formMode = null;
                formTarget = null;
                if ($sheet) $sheet.find('.vis-dsw-form').hide();
            }

            // role checklist: active roles of the client, pre-selected from the dashboard's assignment, each
            // with a Read/Write flag; the login role is always ticked read / write and locked (the server
            // enforces it too) so the user keeps access and the dashboard always has a role that may change it
            function toggleRoles(show, dashboardID) {
                var $roles = $sheet.find('.vis-dsw-roles').removeClass('is-invalid').toggle(show);
                if (!show) return;
                $roles.find('.vis-dsw-roles-search').val("");
                var $list = $roles.find('.vis-dsw-roles-list').empty();
                updateRoleCount();
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/GetDashboardRoles", { dashboardID: dashboardID }, function (result) {
                    $list.empty();
                    if (!result || result.length == 0) {
                        $list.append($('<div class="vis-dsw-roles-empty">').text(msg("VA_DashboardNoRoles", "No roles available")));
                    }
                    for (var i = 0; result && i < result.length; i++) {
                        var r = result[i];
                        var $row = $('<div class="vis-dsw-role">').toggleClass('is-locked', r.IsLocked)
                            .append($('<label class="vis-dsw-role-name">')
                                .append($('<input type="checkbox" class="vis-dsw-role-sel">').val(r.AD_Role_ID).prop({ checked: r.IsSelected, disabled: r.IsLocked }))
                                .append($('<span>').text(r.Name)))
                            .append($('<label class="vis-dsw-role-access">')
                                .append($('<input type="checkbox" class="vis-dsw-role-rw">').prop({ checked: r.IsReadWrite, disabled: r.IsLocked }))
                                .append($('<span>').text(msg("VA_DashboardReadWrite", "Read/Write"))));
                        if (r.IsLocked) $row.attr('title', msg("VA_DashboardLoginRoleLocked", "Your login role always keeps Read/Write access"));
                        $list.append($row);
                    }
                    updateRoleCount();
                });
            }

            function filterRoles() {
                var q = $.trim($(this).val()).toLowerCase();
                $sheet.find('.vis-dsw-role').each(function () {
                    $(this).toggle(!q || $(this).find('.vis-dsw-role-name').text().toLowerCase().indexOf(q) >= 0);
                });
            }

            function selectedRoles() {
                return $sheet.find('.vis-dsw-roles-list .vis-dsw-role-sel:checked').map(function () { return parseInt(this.value, 10); }).get();
            }

            function readWriteRoles() {
                return $sheet.find('.vis-dsw-roles-list .vis-dsw-role-rw:checked').map(function () {
                    return parseInt($(this).closest('.vis-dsw-role').find('.vis-dsw-role-sel').val(), 10);
                }).get();
            }

            function updateRoleCount() {
                $sheet.find('.vis-dsw-roles-count').text(selectedRoles().length + " " + msg("VA_Selected", "selected"));
            }

            function submitForm() {
                var $form = $sheet.find('.vis-dsw-form');
                var name = $.trim($form.find('.vis-dsw-name-input').val());
                var withRoles = formMode == 'share' || formMode == 'roles' || (formMode == 'create' && $form.find('.vis-dsw-share input').is(':checked'));
                var roles = withRoles ? selectedRoles() : null;
                var readWrite = withRoles ? readWriteRoles() : null;
                if ((formMode == 'create' || formMode == 'rename') && !name) { $form.find('.vis-dsw-name-input').focus(); return; }
                if (withRoles && roles.length == 0) { $form.find('.vis-dsw-roles').addClass('is-invalid'); return; }

                var target = formTarget;
                if (formMode == 'rename') {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/RenameDashboard", { dashboardID: target.AD_Dashboard_ID, name: name }, function (ok) {
                        if (!ok) { VIS.ADialog.error("", true, msg("VA_DashboardRenameFailed", "The dashboard could not be renamed."), ""); return; }
                        hideForm();
                        toast(msg("VA_Renamed", "Renamed"));
                        loadDashboards(null);
                    });
                    return;
                }
                if (formMode == 'share' || formMode == 'roles') {
                    var action = formMode == 'share' ? "ShareDashboard" : "SetDashboardRoles";
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/" + action, { dashboardID: target.AD_Dashboard_ID, roleIDs: roles, readWriteRoleIDs: readWrite }, function (ok) {
                        if (!ok) { VIS.ADialog.error("", true, msg("VA_DashboardShareFailed", "The roles could not be saved."), ""); return; }
                        hideForm();
                        toast("“" + dashboardName(target) + "” " + msg("VA_DashboardSharedWith", "shared with") + " " + roles.length + " " + msg("VA_DashboardRoles", "roles"));
                        loadDashboards(null);
                    });
                    return;
                }
                var dup = $form.find('input[name="vis-dsw-from"]:checked').val() == "dup";
                createDashboard(name, dup ? currentDashboardID : -1, roles, readWrite, function (id) {
                    hideForm();
                    toast(msg("VA_DashboardCreated", "Created") + " “" + name + "”");
                    switchDashboard(id);
                    closeSwitcher();
                });
            }

            // copyFrom < 0 = blank; roles = shared dashboard for those roles (null = own), readWrite = the roles
            // among them that may change it; the current layout is saved first so a duplicate picks up unsaved edits
            function createDashboard(name, copyFrom, roles, readWrite, callback) {
                var create = function () {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/CreateDashboard", { name: name, copyFrom: copyFrom, roleIDs: roles, readWriteRoleIDs: readWrite }, function (id) {
                        if (!id) { VIS.ADialog.error("", true, msg("VA_DashboardCreateFailed", "The dashboard could not be created."), ""); return; }
                        loadDashboards(function () { callback(id); });
                    });
                };
                if (copyFrom == currentDashboardID && isEditMode && isChanged) saveDashboard(create);
                else create();
            }

            // ---------- row overflow menu ----------
            function showRowMenu($btn) {
                var d = findDashboard($btn.closest('.vis-dsw-row').data('id'));
                if (!d) return;
                rowMenuTarget = d.AD_Dashboard_ID;
                var items = [];
                var editable = d.AD_Dashboard_ID > 0 && d.CanEdit;
                if (editable) items.push({ action: 'rename', icon: 'fa-pencil', text: msg("VA_Rename", "Rename") });
                items.push({ action: 'duplicate', icon: 'fa-clone', text: msg("VA_Duplicate", "Duplicate") });
                if (d.CanShare) items.push({ action: 'share', icon: 'fa-share-alt', text: msg("VA_DashboardShareWithRoles", "Share with roles") + "…" });
                if (editable && d.IsShared) items.push({ action: 'roles', icon: 'fa-users', text: msg("VA_DashboardEditRoles", "Edit roles") + "…" });
                if (!d.IsUserDefault) items.push({ action: 'default', icon: 'fa-home', text: msg("VA_DashboardSetDefault", "Set as default") });
                if (editable) items.push({ action: 'delete', icon: 'fa-trash-o', text: msg("Delete", "Delete"), danger: true });

                var $menu = $sheet.find('.vis-dsw-menu').empty();
                for (var i = 0; i < items.length; i++) {
                    if (items[i].danger) $menu.append('<div class="vis-dsw-menu-sep"></div>');
                    $menu.append($('<button type="button" class="vis-dsw-menu-item' + (items[i].danger ? ' vis-dsw-menu-item-danger' : '') + '">')
                        .attr('data-action', items[i].action)
                        .append('<i class="fa ' + items[i].icon + '"></i> ')
                        .append($('<span>').text(items[i].text)));
                }
                var rect = $btn[0].getBoundingClientRect();
                $menu.css({ top: rect.bottom + 4, left: Math.max(8, rect.right - 190) }).show();
                $sheet.find('.vis-dsw-row-more.is-open').removeClass('is-open');
                $btn.addClass('is-open');
            }

            function hideRowMenu() {
                rowMenuTarget = null;
                if ($sheet) {
                    $sheet.find('.vis-dsw-menu').hide();
                    $sheet.find('.vis-dsw-row-more.is-open').removeClass('is-open');
                }
            }

            function rowAction(action, d) {
                var id = d.AD_Dashboard_ID;
                if (action == 'rename' || action == 'share' || action == 'roles') {
                    showForm(action, d);
                }
                else if (action == 'duplicate') {
                    createDashboard(dashboardName(d) + " (" + msg("Copy", "copy") + ")", id, null, null, function () {
                        toast(msg("VA_Duplicated", "Duplicated"));
                    });
                }
                else if (action == 'default') {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SetDefaultDashboard", { dashboardID: id }, function () {
                        toast("“" + dashboardName(d) + "” " + msg("VA_IsNowDefault", "is now your default"));
                        loadDashboards(null);
                    });
                }
                else if (action == 'delete') {
                    var text = d.IsShared
                        ? msg("VA_DashboardDeleteSharedConfirm", "Delete this shared dashboard? It is removed for every role it is assigned to. This can't be undone.")
                        : msg("VA_DashboardDeleteConfirm", "Delete this dashboard? Its widgets will be removed. This can't be undone.");
                    VIS.ADialog.confirm("", true, "“" + dashboardName(d) + "” — " + text, msg("Delete", "Delete"), function (result) {
                        if (!result) return;
                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/DeleteDashboard", { dashboardID: id }, function (ok) {
                            if (!ok) { VIS.ADialog.error("", true, msg("VA_DashboardDeleteFailed", "The dashboard could not be deleted."), ""); return; }
                            toast(msg("VA_Deleted", "Deleted"));
                            if (id == currentDashboardID) {
                                isChanged = false;
                                currentDashboardID = -1;      // loadDashboards picks the default again
                                disposeHomeItems();
                                loadDashboards(loadHomeWidgets);
                            }
                            else {
                                loadDashboards(null);
                            }
                        });
                    });
                }
            }

            // ---------- Ctrl+K jump ----------
            function buildSpotlight() {
                $spot = $('<div class="vis-dsw-spot" style="display:none">'
                    + '<div class="vis-dsw-scrim"></div>'
                    + '<div class="vis-dsw-spot-panel" role="dialog">'
                    + '  <div class="vis-dsw-spot-input"><i class="fa fa-search"></i><input type="text" /><kbd>Esc</kbd></div>'
                    + '  <div class="vis-dsw-spot-list"></div>'
                    + '</div></div>');
                $('body').append($spot);
                $spot.find('input').attr('placeholder', msg("VA_JumpToDashboard", "Jump to a dashboard…"));
                $spot.find('.vis-dsw-scrim').on('click', closeSpotlight);
                $spot.find('input').on('input', function () { spotCursor = 0; renderSpotlight(); });
                $spot.find('input').on('keydown', function (e) {
                    var rows = $spot.find('.vis-dsw-spot-row');
                    if (e.keyCode == 40) { e.preventDefault(); spotCursor = Math.min(spotCursor + 1, rows.length - 1); renderSpotlight(); }
                    else if (e.keyCode == 38) { e.preventDefault(); spotCursor = Math.max(spotCursor - 1, 0); renderSpotlight(); }
                    else if (e.keyCode == 13) { e.preventDefault(); rows.eq(spotCursor).click(); }
                    else if (e.keyCode == 27) { closeSpotlight(); }
                });
                $spot.on('click', '.vis-dsw-spot-row', function () {
                    var id = $(this).data('id');
                    closeSpotlight();
                    switchDashboard(id);
                });
            }

            function openSpotlight() {
                if (!$spot) buildSpotlight();
                $spot.find('input').val("");
                spotCursor = 0;
                renderSpotlight();
                $spot.show();
                setTimeout(function () { $spot.find('input').focus(); }, 40);
            }

            function closeSpotlight() {
                if ($spot) $spot.hide();
            }

            function renderSpotlight() {
                var q = $.trim($spot.find('input').val()).toLowerCase();
                var rows = $.grep(dashboards, function (d) { return !q || dashboardName(d).toLowerCase().indexOf(q) >= 0; });
                var $list = $spot.find('.vis-dsw-spot-list').empty();
                for (var i = 0; i < rows.length; i++) {
                    var $row = $('<div class="vis-dsw-spot-row">').attr('data-id', rows[i].AD_Dashboard_ID);
                    if (rows[i].AD_Dashboard_ID == currentDashboardID) $row.addClass('is-active');
                    if (i == spotCursor) $row.addClass('is-cursor');
                    $row.append('<span class="vis-dsw-row-dot"></span>')
                        .append($('<span>').text(dashboardName(rows[i])))
                        .append($('<span class="vis-dsw-row-meta">').text((rows[i].WidgetCount || 0) + " " + msg("visWidgets", "widgets")));
                    $list.append($row);
                }
            }

            // Ctrl/Cmd+K while Home is showing; Esc closes whatever dashboard layer is open
            $(document).off('keydown.visDashboards').on('keydown.visDashboards', function (e) {
                if (!$home.is(':visible')) return;
                if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key || "").toLowerCase() == "k") {
                    e.preventDefault();
                    openSpotlight();
                }
                else if (e.keyCode == 27) {
                    if ($spot && !$spot.is(':hidden')) closeSpotlight();
                    else if ($sheet && !$sheet.is(':hidden')) closeSwitcher();
                }
            });

            // dispose every rendered widget (the DOM items are removed by loadHomeWidgets)
            function disposeHomeItems() {
                for (var key in homeItems) {
                    if (homeItems[key] && homeItems[key].wform) {
                        try { homeItems[key].wform.dispose(); } catch (e) { }
                    }
                }
                homeItems = {};
            }

            function switchDashboard(id, silent) {
                if (id == currentDashboardID || !findDashboard(id))
                    return;
                var doSwitch = function () {
                    isChanged = false;
                    // read-only shared dashboards are not edited in place: leave edit mode when switching to one
                    if (isEditMode && isReadOnlyDashboard(findDashboard(id)))
                        $home.find('#btnCloseWidget').trigger('click');
                    disposeHomeItems();
                    currentDashboardID = id;
                    renderDashboardBar();
                    loadHomeWidgets();
                    if (!silent)
                        toast(msg("VA_SwitchedTo", "Switched to") + " “" + dashboardName(findDashboard(id)) + "”");
                };
                // unsaved edits belong to the dashboard being left
                if (isEditMode && isChanged) {
                    saveDashboard(doSwitch);
                }
                else {
                    doSwitch();
                }
            }

            // Load the home widget content and initialize it
            $home.load(VIS.Application.contextUrl + 'Home/HomeNew', function () {
                adjustWidgetDivSize();
                loadFavourites();
                $container.append(openRightPanel);
                $home.find('.vis-home-leftPanel').append($container);
                loadDashboards(loadWidgets);
                events();
                $(window).resize(adjustWidgetDivSize);

                /*Set Top Property*/
                $home.find("#dataContainer").css('top', $('body').find('.vis-app-header').height() + 'px');

            });



        }

        return {
            initHome: initHome
        };
    }

    VIS.HomeMgr2 = HomeMgr2();

    VIS.HomeMgr2.widgetFirevalueChanged = function (data) {

    };
})(VIS, jQuery);
