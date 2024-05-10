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

                    /*$leftPanel.find('.vis-trash-area').hide();*/
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
                })
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
                        var idx = $(ui.helper).data('idx');
                        renderWidgets(widgetList[idx]);
                    }
                });

                makeSortable($home.find('.vis-home-leftPanel'));
            }

            // Function to make a container sortable
            function makeSortable($container) {
                $container.sortable({
                    items: ".vis-widget-item",
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

                //$(".editPanel").droppable({
                //    accept: ".vis-widget-item",
                //    over: function (event, ui) {
                //        $(this).addClass("hover");
                //        var pH = $(ui.helper).height();
                //        var pW = $(ui.helper).width();
                //        var iH = $('.editPanel ').height();
                //        var iW = $('.editPanel ').width();
                //        var zoom = 1;
                //        var hR = pH / iH;
                //        var wR = pW / iW;
                //        if (hR > wR) {
                //            zoom = wR;
                //        } else {
                //            zoom = hR;
                //        }

                //        var mouseX = event.clientX;
                //        var mouseY = event.clientY;
                //        var scaledWidth = ui.helper.outerWidth() * zoom;
                //        var scaledHeight = ui.helper.outerHeight() * zoom;
                //        var offsetX = (scaledWidth - ui.helper.outerWidth()) / 2;
                //        var offsetY = (scaledHeight - ui.helper.outerHeight()) / 2;

                //        ui.helper.css({
                //            transform: 'scale(' + zoom + ')',
                //            position: 'absolute',
                //            left: mouseX - offsetX + 'px',
                //            top: mouseY - offsetY + 'px',
                //            'transform-origin': 'center center'
                //        });
                //    },
                //    out: function (event, ui) {
                //        $(this).removeClass("hover");
                //        var originalLeft = originalPosition.left;
                //        var originalTop = originalPosition.top;
                //        var mouseX = event.clientX;
                //        var mouseY = event.clientY;

                //        var offsetX = mouseX - originalLeft;
                //        var offsetY = mouseY - originalTop;

                //        ui.helper.css({
                //            transform: 'scale(1)',
                //            position: 'absolute',
                //            left: mouseX - offsetX + 'px',
                //            top: mouseY - offsetY + 'px'
                //        });
                //    },
                //    drop: function (event, ui) {
                //        $(this).removeClass("hover");
                //        if ($(ui.helper).data('wid')) {
                //            var obj = {
                //                id: $(ui.helper).data('wid')
                //            };
                //            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Home/DeleteWidgetFromHome", obj, function (result) {

                //            });
                //        }

                //        ui.draggable.remove();
                //    }
                //});
            }
           
            // Function to render widgets
            function renderWidgets(widget) {
                var hue = Math.floor(Math.random() * 360);
                var v = Math.floor(Math.random() * 16) + 75;
                var pastel = 'hsl(' + hue + ', 100%, ' + v + '%)'
                var wform = new VIS.AForm();
                wform.openWidget(widget.ClassName, 99999);
                var $item = wform.getRoot();
                $item.addClass("vis-widget-item");
                $item.css("background-color", pastel);
                $item.attr('data-ws', widget.WidgetSizeID);
                $item.attr('data-wid', widget.ID);
                wform.addChangeListener(VIS.HomeMgr);
                $item.css({
                    gridRow: "span " + widget.Rows,
                    gridColumn: "span " + widget.Cols,
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
                var url = VIS.Application.contextUrl + "Home/GetWidgets";
                VIS.dataContext.getJSONData(url, null, function (result) {
                    if (!result) {
                        return;
                    }
                    widgetList = result;
                    $home.find('.vis-widget-body').empty();

                    for (var i = 0; i < result.length; i++) {
                        if ($home.find('.vis-widget-body').find('div:contains("' + result[i].ModuleName + '")').length === 0) {
                            $home.find('.vis-widget-body').append($('<div class="vis-main-widget-heading">' + result[i].ModuleName + '</div>'));
                            $home.find('.vis-widget-body').append($('<div class="vis-widgetDrag-container">'));
                        }

                        var witem = $('<div class="vis-widgetDrag-item" data-idx="' + i + '"><img class="vis-widgetImg" src="' + result[i].Img + '" /><div class="vis-widgetSize">' + result[i].DisplayName +'<span style="display:block">'+ result[i].Rows + 'X' + result[i].Cols + '<span></div></div>');
                        $home.find('.vis-widgetDrag-container:last').append(witem);
                    }

                    dragDrop();
                });

                url = VIS.Application.contextUrl + "Home/GetUserWidgets";
                VIS.dataContext.getJSONData(url, null, function (result) {
                    if (result && result.length > 0) {
                        $('.vis-add-widgetContainer').hide();
                        for (var i = 0; i < result.length; i++) {
                            renderWidgets(result[i]);
                        }
                        dragDrop();
                    } else {
                        $('.vis-add-widgetContainer').show();
                    }
                });
            }

            // Function to save the dashboard layout
            function saveDashboard() {
                var widgetSizes = [];
                $('.vis-widget-item').each(function (index) {
                    widgetSizes.push({
                        SRNO: (index + 1),
                        WidgetSizeID: $(this).data('ws')
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
