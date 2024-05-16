/**
 * Home Widget
 * VIS228 Date 10-May-2024
 * purpose - Show widget on home page
 */
; (function (VIS, $) {
    function HomeMgr() {
        'use strict';
        var $home = null;
        var self = this;
        var widgetList = null;
        var shortcutItem = [];
        var shortcutItems = [];
        var originalPosition; // Store the original position of a draggable element
        var isEditMode = false; // Flag to indicate whether the widget is in edit mode

        // Function to initialize the home widget
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
                var w = ($home.find('.vis-home-leftPanel').width() - 25) / 9;
                if ($(window).width() <= 500) {
                    w = ($home.find('.vis-home-leftPanel').width() - 25) / 3;
                } else if ($(window).width() <= 960) {
                    w = ($home.find('.vis-home-leftPanel').width() - 25) / 6;
                } 
               
                $home.find('.vis-widget-container').attr('style', '--rowheight:' + w + 'px');
            }
            /**
             * Adjust Size
             */
            function adjustDivSize() {
                var windowWidth = $(window).width();
                $('.scrollerHorizontal').width(windowWidth);
                resizeWidgetContainer();
            }

            // Event handling functions
            function events() {
                var $leftPanel = $home.find('.vis-home-leftPanel');
                var $rightPanel = $home.find('.vis-home-rightPanel');

                // Event handler for clicking the edit button
                openRightPanel.add($('#vis_editHome')).on('click',function () {
                    var leftPanelWidth = '70%';
                    $leftPanel.animate({
                        width: leftPanelWidth
                    }, 300);

                    $home.find('.vis-add-widgetContainer').hide('slide', { direction: 'left' }, 300);

                    $rightPanel.show('slide', { direction: 'right' }, 200);
                    $home.find('.vis-home-leftPanel').sortable("enable");
                    isEditMode = true;
                    $leftPanel.find('.vis-widget-item').css('cursor', 'grab');
                    $home.find('.vis-widgetDelete').show();
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

                    $leftPanel.find('.vis-widget-item').css('cursor','unset');
                    $rightPanel.hide('slide', { direction: 'left' }, 300);
                    $home.find('.vis-home-leftPanel').sortable("disable");
                    $home.find('.vis-widgetDelete').hide();
                    $('#vis_editHome').show();
                    isEditMode = false;
                    
                    saveDashboard();
                    setTimeout(function () {
                        resizeWidgetContainer();
                    }, 300);
                });

                // Event handler for deleting a widget
                $leftPanel.on('click', '.vis-widgetDelete', function (e) {
                    var ui = $(this).closest('.vis-widget-item');
                    if (ui.data('wid')) {
                        var obj = {
                            id: ui.data('wid')
                        };
                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/DeleteWidgetFromHome", obj, function (result) {

                        });
                    }

                    ui.slideUp(function () {
                        $(this).remove();
                    });
                });

                $leftPanel.on('click', '.vis-linksWidget', function () {
                    if (isEditMode) {
                        return;
                    }

                    var ui = $(this).closest('.vis-widget-item');

                    var dsi = $.grep(widgetList, function (element, index) {
                        return element.KeyID == ui.data('ws') && element.Type == ui.data('type');
                    });

                    //1   Contain Child ShortCut
                    if (dsi && dsi.length > 0) {
                        dsi = dsi[0];
                        if (dsi.HasChild) {
                            // alert("setting Dialog");
                            var sd =new VIS.shortcutMgr.SettingDialog(dsi.KeyID);// new SettingDialog(dsi.KeyID);
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
                    drop: function (event, ui) {
                        // Clone the dragged element and append it to the .vis-home-leftPanel
                        var type = $(ui.helper).data('type')
                        var idx = $(ui.helper).data('idx');
                        renderWidgets(widgetList[idx],0);
                    }
                });

                makeSortable($home.find('.vis-home-leftPanel'));
            }

            // Function to make a container sortable
            function makeSortable($container) {
                $container.sortable({
                    items: ".vis-widget-item",
                    cursor: "grabbing",
                   /* connectWith: ".editPanel",*/
                    disabled: true,
                    sort: function (event, ui) {
                        // Update the original position during sorting
                        originalPosition = ui.helper.position();
                        $(ui.placeholder).addClass("ui-sortable-placeholder");
                    },
                    start: function (event, ui) {
                        // Capture the original position when sorting starts
                        originalPosition = ui.helper.position();
                        $(ui.helper).addClass("ui-sortable-helper");
                    },
                    stop: function (event, ui) {
                        $(ui.helper).removeClass("ui-sortable-helper");
                    }
                });

                
            }
           
            // Function to render widgets
            function renderWidgets(widget,wid) {
                //var hue = Math.floor(Math.random() * 360);
                //var v = Math.floor(Math.random() * 16) + 85;
                //var pastel = 'hsl(' + hue + ', 100%, ' + v + '%)'



                var $item = $('<div>');
                if (widget.Type == "W") {
                    var wform = new VIS.AForm();
                    wform.openWidget(widget.ClassName, 99999);
                    wform.addChangeListener(VIS.HomeMgr);
                    $item = wform.getRoot();
                } else if (widget.Type == "L") {
                    var $div = $('<div class="vis-linksWidget">');
                    $div.append(widget.items).append('<div class="linktitle">'+widget.DisplayName+'</div>');
                    $item.append($div);
                }

                $item.addClass("vis-widget-item");
                //$item.css("background-color", pastel);
                $item.attr('data-ws', widget.KeyID);
                $item.attr('data-wid', wid ||0);
                $item.attr('data-type', widget.Type);
               
                $item.css({
                    gridRow: "span " + (widget.Rows || 1),
                    gridColumn: "span " + (widget.Cols || 1),
                    display: "none"
                });
                var trash = $('<i class="fa fa-trash-o vis-widgetDelete" aria-hidden="true" ></i>');
                if (isEditMode) {
                    trash.show();
                } else {
                    trash.hide();
                }

                $item.append(trash);
                $container.append($item);
                $item.slideDown("slow");
            }
           

            // Function to load widgets
            function loadWidgets() {
                $container.append(openRightPanel);
                $home.find('.vis-home-leftPanel').append($container);
                $home.find('.vis-widget-body').empty();
                var url = VIS.Application.contextUrl + "Home/GetWidgets";
                VIS.dataContext.getJSONData(url, null, function (result) {
                    if (!result) {
                        return;
                    }
                    result.sort((a, b) => a.DisplayName - b.DisplayName);
                    widgetList = result;
                 

                    for (var i = 0; i < result.length; i++) {
                       
                        var moduelName = null;
                        var img = null;
                        if (result[i].Type == 'L') {
                            moduelName="Links"
                            var itm = result[i];
                            if (itm.HasImage) {
                                if (!itm.IsImageByteArray && itm.IconUrl.indexOf('.') < 0) {
                                    img = '<i data-index="' + i + '" class="' + itm.IconUrl + '"></i>';
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

                            widgetList[i]['items'] = img;

                        } else if (result[i].Type == 'W') {
                            moduelName = result[i].ModuleName
                            img = '<img class="vis-widgetImg" src="' + result[i].Img + '" />';
                        }

                        if ($home.find('.vis-widget-body').find('div:contains("' + moduelName + '")').length === 0) {
                            $home.find('.vis-widget-body').append($('<div class="vis-main-widget-heading">' + moduelName + '</div>'));
                            $home.find('.vis-widget-body').append($('<div class="vis-widgetDrag-container">'));
                        }


                        var witem = $('<div class="vis-widgetDrag-item" data-type="' + result[i].Type + '" data-idx="' + i + '">' + img +'<div class="vis-widgetSize"><span class="vis-dotdot">' + result[i].DisplayName + '</span><span style="display:block">' + (result[i].Rows ||1) + 'X' + (result[i].Cols || 1) + '</span></div></div>');
                        $home.find('.vis-widgetDrag-container:last').append(witem);
                    }

                    dragDrop();
                });

                // Load Shortcut
                //shortcutItem = [];
                //VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/GetShortcutItems", null, function (data) {
                //    if (data) {
                //        shortcutItems = data;
                //        var itm = null;
                //        var ModuleName = 'Links'
                //        for (var i = 0; i < data.length; i++) {
                //            itm = data[i];
                //            var img = null;

                //            if ($home.find('.vis-widget-body').find('div:contains("' + ModuleName + '")').length === 0) {
                //                $home.find('.vis-widget-body').append($('<div class="vis-main-widget-heading">' + ModuleName + '</div>'));
                //                $home.find('.vis-widget-body').append($('<div class="vis-widgetDrag-container">'));
                //            }


                //            if (itm.HasImage) {
                //                if (!itm.IsImageByteArray && itm.IconUrl.indexOf('.') < 0) {
                //                    img = '<i data-index="' + i + '" class="' + itm.IconUrl + '"></i>';
                //                }
                //                else {
                //                    var url = "";
                //                    if (itm.IsImageByteArray) {
                //                        url = 'data:image/*;base64,' + itm.IconBytes;
                //                    }
                //                    else {
                //                        url = VIS.Application.contextUrl + itm.IconUrl;

                //                    }
                //                    img = '<img data-index="' + i + '" src="' + url + '"/>';

                //                }

                //            } else {
                //                img = '<i data-index="' + i + '" class="vis vis-shortcut"></i>';
                //            }

                //            var witem = $('<div class="vis-widgetDrag-item" data-type="L" data-idx="' + i + '">' + img + '<div class="vis-widgetSize">' + itm.ShortcutName + '<span style="display:block">1X1<span></div></div>');
                //            $home.find('.vis-widgetDrag-container:last').append(witem);

                //            shortcutItems[i]['wid'] = 0;
                //            shortcutItems[i]['Rows'] = 1;
                //            shortcutItems[i]['Cols'] = 1;
                //            shortcutItems[i]['DisplayName'] = itm.ShortcutName;
                //            shortcutItems[i]['items'] = img;
                //            shortcutItems[i]['Type'] = 'L';

                //        }
                //        dragDrop();
                //    }
                //});

                //Load Home Widget
                setTimeout(function () {
                    url = VIS.Application.contextUrl + "Home/GetUserWidgets";
                    VIS.dataContext.getJSONData(url, null, function (result) {
                        if (result && result.length > 0) {
                            $('.vis-add-widgetContainer').hide();
                            for (var i = 0; i < result.length; i++) {
                                var dsi = $.grep(widgetList, function (element, index) {
                                    return element.KeyID == result[i].KeyID && element.Type==result[i].Type;
                                });
                                if (dsi && dsi.length > 0) {
                                    renderWidgets(dsi[0], result[i].ID);
                                }
                            }
                            dragDrop();
                        } else {
                            $('.vis-add-widgetContainer').show();
                        }
                    });
                }, 1000);
              

               

            }

            // Function to save the dashboard layout
            function saveDashboard() {
                var widgetSizes = [];
                $('.vis-widget-item').each(function (index) {
                    widgetSizes.push({
                        SRNO: (index + 1),
                        KeyID: $(this).data('ws'),
                        Type: $(this).data('type'),
                    });
                });

                if (widgetSizes.length > 0) {
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveDashboard", widgetSizes, function (result) {

                    });
                }
            }

            // Load the home widget content and initialize it
            $home.load(VIS.Application.contextUrl + 'Home/Home', function () {
                adjustDivSize();
                loadWidgets();
                events();
                $(window).resize(adjustDivSize);              

            });

           

        }

        return {
            initHome: initHome
        };
    }

    VIS.HomeMgr = HomeMgr();

    VIS.HomeMgr.widgetFirevalueChanged = function (data) {
       
    };
})(VIS, jQuery);
