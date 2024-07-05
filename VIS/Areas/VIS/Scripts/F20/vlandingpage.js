/**
 * Window Landing page
 * VIS228 Date 06-May-2024
 * purpose - Show widget on landing page
 */
; (function (VIS, $) {
    function VLandingPage(apanel, curWindowNo) {
        this.apanel = apanel;
        var windowID = apanel.curTab.getAD_Window_ID();
        var $root = $('<div class="vis-ad-w-p-landing">');
        var $spnTitle = "";
        var $widgetBody = "";
        var $btnClose = "";
        var openRightPanel = "";
        var $container = "";
        var isEditMode = false;
        var $btnlandingpageEdit = "";
        var self = this;
        var isEditMode = false; 
        var btnCloseWidget = "";
        var isChanged = false;
        var widgetList = {};
        var widgetWidth = null;
        var homeItems = {};
        function setAdditionalInfo(id, info) {
            if (homeItems[id]) {
                homeItems[id].additionalInfo = info;
            }            
        }

        function init() {
            $root.find('.vis-widget-header h4').text(VIS.Msg.getMsg("visWidgets"));
            $root.find('.vis-landingpageEdit u').text(VIS.Msg.getMsg("VIS_Edit"));
            $spnTitle = $root.find('.vis-ad-w-p-t-name h5');
            $widgetBody = $root.find('.vis-landingpage-body');
            $btnClose = $root.find('.vis-ad-w-p-t-close');
            $btnlandingpageEdit = $root.find('.vis-landingpageEdit');
            btnCloseWidget = $root.find('.btnCloseWidget');
            $spnTitle.append(VIS.Env.getHeader(apanel.ctx, curWindowNo));

            // Create and configure the open right panel button
            openRightPanel = $('<div class="vis-add-widgetContainer" style="display:none"><button class="vis-add-widgetButton">+</button><p>' + VIS.Msg.getMsg("VISEditHomeMsg") + '</p></div>');
            // Create the widget container
            $container = $('<div class="vis-widget-container" style="--rowheight:' + (($root.width() - 25)) / 9 + 'px">');

            events();
            loadWidgets();
        }
        /**
         * Resize window
         */
        function resizeWidgetContainer() {
            var wd = $root.find('.vis-home-leftPanel').width();
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
            $root.find('.vis-widget-container').attr('style', '--rowheight:' + w + 'px');

            var itm = Object.keys(homeItems);
            for (var i = 0; i < itm.length; i++) {
                var obj = {
                    AD_UserHomeWidgetID: homeItems[itm[i]].AD_UserHomeWidgetID,
                    editMode: isEditMode,
                    windowSpecific: homeItems[itm[i]].WindowSpecific,
                    rows: homeItems[itm[i]].rows,
                    Cols: homeItems[itm[i]].cols,
                    width: ((homeItems[itm[i]].Cols || 1) * widgetWidth).toFixed(2) + 'px',
                    height: ((homeItems[itm[i]].Rows || 1) * widgetWidth).toFixed(2) + 'px',
                    additionalInfo: homeItems[itm[i]].additionalInfo,
                    setAdditionalInfo: setAdditionalInfo
                }
                homeItems[itm[i]].wform.widgetSizeChange(obj);
            }
        }

        function adjustWidgetDivSize() {
            var windowWidth = $(window).width()-7;
            $root.find('.scrollerHorizontalWidget').width(windowWidth);
            resizeWidgetContainer();
        }

        /**
         * Handle Events
         */
        function events() {

            var $leftPanel = $root.find('.vis-home-leftPanel');
            var $rightPanel = $root.find('.vis-home-rightPanel');
            $root.find('.vis-landingpage').on('click', function () {
                apanel.showLandingPage(true);
            });

            $root.find('.vis-windowpage').on('click', function () {
                apanel.showLandingPage(false);
            });

            $btnClose.on('click', function (e) {
                apanel.$parentWindow.dispose(); //dispose
            });

            openRightPanel.add($btnlandingpageEdit.find('u')).on('click', function () {
                var leftPanelWidth = '70%';
                isChanged = false;
                $leftPanel.animate({
                    width: leftPanelWidth
                }, 300);

                $root.find('.vis-add-widgetContainer').hide('slide', { direction: 'left' }, 300);

                $rightPanel.show('slide', { direction: 'right' }, 200);
                $root.find('.vis-home-leftPanel').sortable("enable");
                isEditMode = true;
                $container.addClass('vis-editModeWidget');
                $root.find('.vis-widgetDelete').show();
                $btnlandingpageEdit.hide();
                
                setTimeout(function () {
                    resizeWidgetContainer();
                }, 300);

            })

            btnCloseWidget.on('click', function () {
                $leftPanel.animate({
                    width: '100%'
                }, 300);
                if ($root.find('.vis-widget-container .vis-widget-item').length > 0) {
                    $root.find('.vis-add-widgetContainer').hide();
                } else {
                    $root.find('.vis-add-widgetContainer').show();
                }

                $container.removeClass('vis-editModeWidget');
                $rightPanel.hide('slide', { direction: 'left' }, 300);
                $root.find('.vis-home-leftPanel').sortable("disable");
                $root.find('.vis-widgetDelete').hide();
                $btnlandingpageEdit.show();
                isEditMode = false;

                saveDashboard();
                setTimeout(function () {                    
                    resizeWidgetContainer();
                }, 300);
            });

            // Event handler for deleting a widget
            $leftPanel.on('click', '.vis-widgetDelete', function (e) {
                var ui = $(this).closest('.vis-widget-item');
                isChanged = true;
                if (ui.data('wid') && ui.data('wid').toString().indexOf('temp_') == -1) {
                    var obj = {
                        id: ui.data('wid')
                    };
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/DeleteWidgetFromHome", obj, function (result) {

                    });
                }

                if (homeItems && homeItems[ui.data('wid')]) {
                    homeItems[ui.data('wid')].wform.dispose();
                    delete homeItems[ui.data('wid')];
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
            $root.find('.vis-widgetDrag-item').draggable({
                helper: 'clone', // Use a clone of the dragged element
                start: function (event, ui) {
                    originalPosition = ui.helper.position();
                },
                revert: 'invalid'
            });

            // Make the .vis-home-leftPanel droppable
            $root.find('.vis-home-leftPanel').droppable({
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
                   
                    VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveSingleWidget", { widgetSizes: widgetSizes, windowID: windowID }, function (result) {
                        renderWidgets(widgetList[keyid + '_' + type], result, null);
                    });



                }
            });

            makeSortable($root.find('.vis-home-leftPanel'));
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
                    isChanged = true;
                    $(ui.helper).removeClass("ui-sortable-helper");
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
                wform.openWidget(widget.ClassName, curWindowNo, info);
                wform.addChangeListener(self);
                $item = wform.getRoot();
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
            } else if (widget.Type == "C" || widget.Type == "K" || widget.Type == "V") {       
                VADB.chartFactory.getChart(widget.WidgetID, $item, widget.Type);               
            }

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

        function loadWidgets() {
            $container.append(openRightPanel);
            $root.find('.vis-home-leftPanel').append($container);
            $root.find('.vis-widget-body').empty();
            var url = VIS.Application.contextUrl + "Home/GetWidgets";
            VIS.dataContext.getJSONData(url, { windowID: windowID }, function (result) {
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

                        itm['items'] = img;

                    } else if (result[i].Type == 'W') {
                        moduelName = result[i].ModuleName
                        img = result[i].Img;
                    } else if (result[i].Type == 'C' || result[i].Type == 'K' || result[i].Type == 'V') {
                        moduelName = VIS.Msg.getMsg(result[i].ModuleName);
                        img = result[i].Img
                    }

                    widgetList[itm.KeyID + '_' + itm.Type] = itm;

                    if ($root.find('.vis-widget-body').find('div:contains("' + moduelName + '")').length === 0) {
                        $root.find('.vis-widget-body').append($('<div class="vis-main-widget-heading">' + moduelName + '</div>'));
                        $root.find('.vis-widget-body').append($('<div class="vis-widgetDrag-container">'));
                    }


                    var witem = $('<div class="vis-widgetDrag-item" data-type="' + result[i].Type + '" data-keyid="' + itm.KeyID + '">' + img + '<div class="vis-widgetSize"><span class="vis-dotdot">' + result[i].DisplayName + '</span><span style="display:block">' + (result[i].Cols || 1) + 'X' + (result[i].Rows || 1) + '</span></div></div>');
                    $root.find('.vis-widgetDrag-container:last').append(witem);
                }

                dragDrop();
                loadHomeWidgets();
            });

        }

        function loadHomeWidgets() {
            var url = VIS.Application.contextUrl + "Home/GetUserWidgets";
            VIS.dataContext.getJSONData(url, { windowID: windowID }, function (result) {
                if (result && result.length > 0) {
                    $root.find('.vis-add-widgetContainer').hide();
                    if (result && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                            //var dsi = $.grep(widgetList, function (element, index) {
                            //    return element.KeyID == result[i].KeyID && element.Type==result[i].Type;
                            //});
                            var dsi = widgetList[result[i].KeyID + '_' + result[i].Type];

                            if (dsi) {
                                renderWidgets(dsi, result[i].ID, result[i].AdditionalInfo);
                            }
                        }
                    } 
                    dragDrop();
                }
                //else {
                //    $root.find('.vis-add-widgetContainer').show();
                //}
                else {
                    var lst = Object.values(widgetList);
                    var filteredArray = $.grep(lst, function (item) {
                        return item.IsDefault === true;
                    });

                    filteredArray.sort(function (a, b) {
                        return a.SRNO - b.SRNO;
                    });

                    if (filteredArray && filteredArray.length > 0) {
                        for (var j = 0; j < filteredArray.length; j++) {
                            renderWidgets(filteredArray[j], 0, filteredArray[j].AdditionalInfo);
                        }
                    } else {
                        $root.find('.vis-add-widgetContainer').show();
                    }


                    dragDrop();
                }
            });
        }

        // Function to save the dashboard layout
        function saveDashboard() {
            if (!isChanged) {
                return;
            }
            var widgetSizes = [];
            $root.find('.vis-widget-item').each(function (index) {
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
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/SaveDashboard", { widgetSizes: widgetSizes, windowID: windowID }, function (result) {

                });
            }
        }

        $root.load(VIS.Application.contextUrl + 'LandingPage/Index', function () {
            init();
            adjustWidgetDivSize();
            $(window).resize(adjustWidgetDivSize);
        });

        this.getRoot = function () {
            return $root;
        }

    }
    VLandingPage.prototype.widgetFirevalueChanged = function (data) {
       
        this.apanel.showLandingPage(false, data);
        //tabactionperform
    }

   

    VIS.VLandingPage = VLandingPage;

}(VIS, jQuery));
