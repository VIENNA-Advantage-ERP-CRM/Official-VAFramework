﻿/**
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
            return ullst;
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
                $container.attr('style', '--rowheight:' + w + 'px');

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
                var windowWidth = $(window).width();
                $home.find('.scrollerHorizontalWidget').width(windowWidth);
                resizeWidgetContainer();
            }

            // Event handling functions
            function events() {
                var $leftPanel = $home.find('.vis-home-leftPanel');
                var $rightPanel = $home.find('.vis-home-rightPanel');

                // Event handler for clicking the edit button
                openRightPanel.add($('#vis_editHome')).on('click', function () {
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
                });

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
                        if (ui.data('type') == "L") {
                            ulPopup.find('li:first').remove();
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

                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveSingleWidget", { widgetSizes: widgetSizes, windowID: 0 }, function (result) {
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
                VIS.dataContext.getJSONData(url, { windowID: 0 }, function (result) {
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

                        var lst = Object.values(widgetList);
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

            // Function to save the dashboard layout
            function saveDashboard() {
                if (!isChanged) {
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

                if (widgetSizes.length > 0) {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveDashboard", { widgetSizes: widgetSizes, windowID: 0 }, function (result) {

                    });
                }
            }

            // Load the home widget content and initialize it
            $home.load(VIS.Application.contextUrl + 'Home/HomeNew', function () {
                adjustWidgetDivSize();
                loadFavourites();
                $container.append(openRightPanel);
                $home.find('.vis-home-leftPanel').append($container);
                loadWidgets();
                events();
                $(window).resize(adjustWidgetDivSize);

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
