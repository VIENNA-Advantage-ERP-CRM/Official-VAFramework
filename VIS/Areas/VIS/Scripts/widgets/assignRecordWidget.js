/************************************************************
* Module Name    : VIS
* Purpose        : Assign Record To User Widget
* chronological  : Development
* Created Date   : 17 DECEMBER ,2024
* Created by     : (VAI061)
***********************************************************/
; VIS = window.VIS || {};

(function (VIS, $) {

    //Form Class function
    VIS.VISAssignedRecord = function () {
        /* Variables */
        this.frame;
        this.windowNo;
        var $self = this;
        var $root = $('<div class="vis-maindiv">');
        var widgetContainer = null;
        var assignedRecWidget;
        var pageSize = 0;
        var pageNo = 0;
        var AssignedRecords = null;
        var nextpage = null;
        var prevPage = null;
        var totalWindows = null;
        var totalPages = null;
        var recordListItem = null;
        var getAll = true;
        var allRecords = [];
        var currentPage = 1;
        var sizePage = 4;
        var WindowName = null;
        var WindowId = null;
        var TableName = null;
        var Record_ID = null;
        var totalPages, currentRecords = null;
        /*VIS_427 Defined varaibles for pop*/
        var windowRecords = [];
        var winRecPageSize = 15;
        var winRecPageNo = 1;
        var TotalPages = 1;
        var content = null;
        var IsZoomClicked = false;
        var SrchTxt = null;
        var IsItemSearched = false;
        var popup = null;
        var modelPopupId = null;
        var IsDataFetching = false;



        /* Initialize the form design */
        this.Initalize = function () {
            widgetID = $self.widgetInfo.AD_UserHomeWidgetID;
            createBusyIndicator();
            showBusy(true);
            loadWidget();
        };
        function loadWidget() {
            widgetContainer = $('<div class="VIS_widget-container" id="Vis_Widget-container_' + $self.widgetInfo.AD_UserHomeWidgetID + '">');
            assignedRecWidget = $('<div><h4></h4></div>' +
                '<div class="vis-assigned-records" id ="VIS_assignRecords_' + $self.widgetInfo.AD_UserHomeWidgetID + '">' +
                '<div class="vis-record-col">' +
                '<div class="vis-windowList">' +
                '</div>' +
                '</div>' +
                '</div>');

            widgetContainer.append(assignedRecWidget);
            $root.append(widgetContainer);
            AssignedRecords = widgetContainer.find('.vis-record-col');
            getWindowRecords();
        }
        //busy Indicator
        function createBusyIndicator() {
            $bsyDiv = $('<div id="busyDivId' + $self.widgetInfo.AD_UserHomeWidgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + $self.widgetInfo.AD_UserHomeWidgetID + '" class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            $root.append($bsyDiv);
        };

        /*  show and hide busy indicator*/
        function showBusy(show) {
            if (show) {
                $root.find("#busyDivId" + $self.widgetInfo.AD_UserHomeWidgetID).show();
            }
            else {
                $root.find("#busyDivId" + $self.widgetInfo.AD_UserHomeWidgetID).hide();
            }
        };

        // Create Widget
        function getWindowRecords() {
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/AssignRecordToUserWidget",
                data: {
                    pageSize: pageSize,
                    pageNo: pageNo,
                    getAll: getAll
                },
                dataType: 'json',
                success: function (result) {
                    showBusy(false);
                    allRecords = result ? JSON.parse(result) : [];
                    updateUI();
                },
                error: function () {
                    showBusy(false);
                }
            });
        };

        function eventsHandling() {
            //Popover for showing all records
            widgetContainer.find('.vis-show-more').off('click')
            widgetContainer.find('.vis-show-more').on('click', function () {
                var popupContent = `                 
                       <div class="VIS_PopoverMaindiv">
                       <button class="VIS_popupClose" id="popup-close-btn" title="${VIS.Msg.getMsg('close')}">
                         <i class="fa fa-times" aria-hidden="true"></i>
                             </button>
                       <h3 class="VIS_popuptitle">${VIS.Msg.getMsg('VIS_AssignRecord')}:${allRecords[0].totalRecordCount}</h3>
                       <div class="VIS_popupRecordDetail">
                                               `;
                // Loop through allRecords and dynamically add rows
                for (var i = 0; i < allRecords.length; i++) {
                    popupContent += `
                   <div class="VIS_WindowRecord"  visWindowname="${allRecords[i].WindowName}"
                   visWindowId="${allRecords[i].WindowID}"
                   visTableName="${allRecords[i].TableName}"
                   visRecordId="${allRecords[i].Record_ID}">
                   <span>${allRecords[i].WindowName}</span>
                    <span class="VIS_popupRecordCount">${allRecords[i].Count}</span>
                  </div>`;
                }
                popupContent += `
                   </div>
                   </div>`

                // Open the Popup
                w2popup.open({
                    title: '',
                    body: popupContent,
                    width: 500,
                    height: 500,
                    showMax: true, // Disable maximize option
                    showClose: true, // Ensure close button is shown
                    modal: false,    // Modal behavior to disable interaction outside the popup
                    style: 'background: linear-gradient(135deg, #6b8ce3, #8dc7f8);',
                    buttons: '',
                    onOpen: function () {
                        setTimeout(function () {
                            $('#popup-close-btn').on('click', function () {
                                w2popup.close();
                            });
                            $('.w2ui-popup .VIS_WindowRecord').on('click', function () {
                                w2popup.close();
                                WindowName = $(this).attr('visWindowname');
                                WindowId = $(this).attr('visWindowId');
                                TableName = $(this).attr('visTableName');
                                Record_ID = $(this).attr('visRecordId');
                                // Call your zoomWindow function
                                zoomWindow();

                            });
                        }, 1000);
                    }

                });
            });

            // Pagination button events
            widgetContainer.find('.vis_NxtPage').off('click')
            widgetContainer.find('.vis_NxtPage').on('click', function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateUI();
                };
            });


            // handling prev page
            widgetContainer.find('.vis_prevpage').off('click')
            widgetContainer.find('.vis_prevpage').on('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    updateUI();
                }
            });

            // Enable/Disable pagination buttons
            widgetContainer.find('.vis_NxtPage').css({
                'pointer-events': currentPage >= totalPages ? 'none' : 'auto',
                'opacity': currentPage >= totalPages ? '0.6' : '1'
            });

            widgetContainer.find('.vis_prevpage').css({
                'pointer-events': currentPage <= 1 ? 'none' : 'auto',
                'opacity': currentPage <= 1 ? '0.6' : '1'
            });



            /*    zooming window */
            AssignedRecords.find('.vis-record-box').off('click')
            AssignedRecords.find('.vis-record-box').on('click', function () {
                WindowName = $(this).attr('visWindowname');
                WindowId = $(this).attr('visWindowId');
                TableID = $(this).attr('visTableID');
                Record_ID = $(this).attr('visRecordId');
                TableName = $(this).attr('visTableName');
                winRecPageNo = 1;
                //VIS_427 Getting window Data
                GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize)
            });
            /*Defined zoom event for tab*/
            AssignedRecords.find('.vis-exinv-zoom').off('click')
            AssignedRecords.find('.vis-exinv-zoom').on('click', function () {
                IsZoomClicked = true;
                WindowName = $(this).parent().attr('visWindowname');
                WindowId = $(this).attr('data-windowId');
                TableID = $(this).parent().attr('visTableID');
                TableName = $(this).parent().attr('visTableName');
                Record_ID = $(this).attr('data-Record_ID');
                zoomWindow();
            });
            /*Defined zoom event for single record*/
            AssignedRecords.children().find('.vis-singlerec-zoom').off('click')
            AssignedRecords.find('.vis-singlerec-zoom').on('click', function () {
                WindowName = $(this).parent().attr('visWindowname');
                WindowId = $(this).attr('data-windowId');
                TableID = $(this).parent().attr('visTableID');
                Record_ID = $(this).attr('data-Record_ID');
                zoomWindow();
            });
        };
        /*This function used to open popup*/
        function widgetsPopup() {
            popup = "";
            popup = ' <div class="modal vis-a-actionsModelMain" id="widgetsModalId' + $self.AD_UserHomeWidgetID + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
                + ' <div class="modal-dialog modal-lg vis-a-actionsMdialog" role="document">'
                + '     <div class="modal-content vis-a-actionsMcontent">'
                + '             <button id="closeBtnId' + $self.AD_UserHomeWidgetID + '" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close">'
                + '                 <span aria-hidden="true">&times;</span>'
                + '             </button>'
                + '         <div id="appendWidgetDivId' + $self.AD_UserHomeWidgetID + '" class="vis-a-actionsWidgetCls">'
                + '         </div>'
                + '      </div>'
                + '   </div>'
                + '</div>'
            $root.append(popup);
            modelPopupId = $root.find("#widgetsModalId" + $self.AD_UserHomeWidgetID);
            modelPopupId.find("#closeBtnId" + $self.AD_UserHomeWidgetID).on("click", function () {
                modelPopupId.hide();
            });
        };
        /**
         * This function is used to get the window records which are assigned
         * @param {any} TableID
         * @param {any} Record_ID
         * @param {any} winPageNo
         * @param {any} winPageSize
         * @param {any} searchText
         */
        function GetWindowData(WindowId, TableID, Record_ID, winPageNo, winPageSize, searchText) {
            var isPopupOpen = modelPopupId && modelPopupId.is(':visible');

            if (isPopupOpen) {
                showPopupBusy(true);
            } else {
                showBusy(true);
            }
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/GeWindowRecords",
                data: {
                    WindowId: WindowId,
                    TableID: TableID,
                    Record_ID: Record_ID,
                    pageNo: winPageNo,
                    pageSize: winPageSize,
                    SrchTxt: searchText

                },
                dataType: 'json',
                success: function (result) {
                    showBusy(true);
                    windowRecords = result ? JSON.parse(result) : [];
                    CreateList(windowRecords);
                },
                error: function () {
                    if (isPopupOpen) {
                        showPopupBusy(false);
                    } else {
                        showBusy(false);
                    }
                }
            });
        }
        /**
         * This function used to create list of records in popup
         * @param {any} windowRecords
         */
        function CreateList(windowRecords) {
            $('#vis-asrec-popup-scroll_' + $self.AD_UserHomeWidgetID).off('scroll');
            if (winRecPageNo === 1 && windowRecords.length > 0) {
                TotalRecords = windowRecords[0].countRecords;
                TotalPages = Math.ceil(TotalRecords / winRecPageSize);
            }
            widgetsPopup();
            var ListContent = "";
            //for no data
            if (windowRecords.length === 0) {

                $('.vis-assrec-data').empty();
                ListContent = '<tr><td colspan="4" style="text-align:center; padding: 20px;">' + VIS.Msg.getMsg('NoDataFound') + '</td></tr>';
            }
            //creating td here
            else {
                for (let i = 0; i < windowRecords.length; i++) {
                    ListContent +=
                        '<tr>' +
                        '<td class="VIS-assrec-lalign">' + windowRecords[i].ColValue + '</td>' +
                        '<td>' + windowRecords[i].UpdatedBy + '</td>' +
                        '<td>' + VIS.Utility.Util.getValueOfDate(windowRecords[i].AssignedDate).toLocaleDateString() + '</td>' +
                        '<td><i class="glyphicon glyphicon-zoom-in vis-singlerec-zoom" ' +
                        'data-Record_ID="' + windowRecords[i].Record_ID + '" ' +
                        'id="VIS-unAllocatedZoom_' + $self.windowNo + '" ' +
                        'title="' + VIS.Msg.getMsg("VIS_Zoom") + '">' +
                        '</i></td>' +
                        '</tr>';
                }
            }

            var isFirstLoad = (winRecPageNo === 1 && !IsZoomClicked && !IsItemSearched);
            /*Here handled to contenett in popup*/
            if (isFirstLoad) {
                content =
                    '<div id="VIS-assrec-wrapper">' +
                    '<div class="vis-header-bar">' +
                    '<h1 class="vis-header-title">' + WindowName + '</h1>' +
                    '<div class="VIS-search-wrap">' +
                    '<input value="" placeholder="Search..." type="text" id="VIS_SrchTxtbx_' + $self.windowNo + '" class="VIS-srchtext">' +
                    '<a class="VIS-search-icon" id="VIS_SrchBtn_' + $self.windowNo + '">' +
                    '<span class="vis vis-search"></span>' +
                    '</a>' +
                    '</div>' +
                    '<button id ="popup-close-btn1" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
                    '</div>' +
                    '<div id="vis-asrec-popup-busyDivId_' + $self.widgetInfo.AD_UserHomeWidgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + $self.widgetInfo.AD_UserHomeWidgetID + '" class="vis-busyindicatorinnerwrap">' +
                    '<i class= "vis_widgetloader"></i></div></div>' +
                    '<div id="vis-asrec-popup-scroll_' + $self.AD_UserHomeWidgetID + '" class="vis-asrec-popup-scroll-container vis-table-wrapper">' +
                    '<table id="VIS-assrec-keywords" cellspacing="0" cellpadding="0">' +
                    '<thead>' +
                    '<tr>' +
                    '<th><span>' + VIS.Msg.getMsg('VIS_RecordName') + '</span></th>' +
                    '<th><span>' + VIS.Msg.getMsg('VIS_AssignedFrom') + '</span></th>' +
                    '<th><span>' + VIS.Msg.getMsg('VIS_AssignedDate') + '</span></th>' +
                    '<th><span></span></th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody class="vis-assrec-data">' +
                    ListContent +
                    '</tbody>' +
                    '</table>' +
                    '</div>' +
                    '</div>';

                modelPopupId.find("#appendWidgetDivId" + $self.AD_UserHomeWidgetID).empty();
                modelPopupId.find("#appendWidgetDivId" + $self.AD_UserHomeWidgetID).append(content);
                modelPopupId.show(); // Show modal

                // Event Bindings (Delegated)
                bindSearchEvents();
                bindPopupScroll();

                // Close button event
                $(document).on('click', '#popup-close-btn1', function () {
                    modelPopupId.hide();  // Close modal
                    IsZoomClicked = false;
                    IsItemSearched = false;
                });

                // Zoom button event
                $(document).on('click', '.vis-singlerec-zoom', function () {
                    Record_ID = $(this).attr('data-Record_ID');
                    zoomWindow();  // Your zoom function
                    modelPopupId.hide();  // Close modal
                });

            } else if (!IsZoomClicked || IsItemSearched) {
                // Clear old content if it's the first page or a new search
                if (winRecPageNo === 1 || IsItemSearched) {
                    $('.vis-assrec-data').html(ListContent); // Replace all content
                } else {
                    $('.vis-assrec-data').append(ListContent); // Append more records during scroll
                }

                // Reset the search flag after handling
                IsItemSearched = false;
                bindPopupScroll();
            } else {
                IsZoomClicked = false;
                IsItemSearched = false;
            }
            showPopupBusy(false);
            showBusy(false);
            IsDataFetching = false;
        }
        /**
         * This function is used to show busy indicator on popup
         * @param {any} show
         */
        function showPopupBusy(show) {
            if (show) {
                $root.find("#vis-asrec-popup-busyDivId_" + $self.widgetInfo.AD_UserHomeWidgetID).show();
            }
            else {
                $root.find("#vis-asrec-popup-busyDivId_" + $self.widgetInfo.AD_UserHomeWidgetID).hide();
            }
        }
        // Search Event Binding (Delegated)
        function bindSearchEvents() {
            // First unbind
            $(document).off("keypress", "#VIS_SrchTxtbx_" + $self.windowNo);
            $(document).off("click", ".VIS-search-icon");
            $(document).on("keypress", "#VIS_SrchTxtbx_" + $self.windowNo, function (e) {
                if (e.keyCode === 13) {  // When user presses Enter
                    SrchTxt = $(this).val();
                    IsDataFetching = false;
                    $('.vis-assrec-data').empty();
                    $('#vis-asrec-popup-scroll_' + $self.AD_UserHomeWidgetID).off('scroll');
                    winRecPageNo = 1;
                    IsItemSearched = true;
                    GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, SrchTxt);  // Call your data fetching function
                }
            });

            $(document).on("click", ".VIS-search-icon", function () {
                SrchTxt = $("#VIS_SrchTxtbx_" + $self.windowNo).val();  // Get search input value
                winRecPageNo = 1;
                IsDataFetching = false;
                $('.vis-assrec-data').empty();
                $('#vis-asrec-popup-scroll_' + $self.AD_UserHomeWidgetID).off('scroll');
                IsItemSearched = true;
                GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, SrchTxt);  // Call your data fetching function
            });
        }

        // Popup Scroll Binding (Infinite Scroll)
        function bindPopupScroll() {
            $('#vis-asrec-popup-scroll_' + $self.AD_UserHomeWidgetID).off('scroll').on('scroll', function () {
                if ($(this).scrollTop() + $(this).innerHeight() + 20 >= this.scrollHeight) {
                    if (winRecPageNo < TotalPages && !IsDataFetching) {
                        IsDataFetching = true;
                        winRecPageNo++;
                        GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, SrchTxt);
                    }
                }
            });
        }

        /*  update UI*/
        function updateUI() {
            AssignedRecords.empty(); // Clear existing records
            if (allRecords == null || allRecords.length === 0) {
                widgetContainer.find('h4').text('' + VIS.Msg.getMsg("VIS_AssignRecord") + ': 0');
                AssignedRecords.text(VIS.Msg.getMsg('VIS_NoRecordFound')).addClass('vis-noRecordFound');
                return;
            }

            // Calculate total pages
            totalPages = Math.ceil(allRecords.length / sizePage);
            // Get records for the current page
            var start = (currentPage - 1) * sizePage;
            var end = Math.min(start + sizePage, allRecords.length);
            currentRecords = allRecords.slice(start, end);

            // Update header
            widgetContainer.find('h4').text(`${VIS.Msg.getMsg('VIS_AssignRecord')}: ${allRecords[0].totalRecordCount}`);

            // Display records
            currentRecords.forEach((record, i) => {
                var colorClass = 'vis-color-' + ((i % 4) + 1);
                var AssignedItems = `
                <div class="vis-record-box ${colorClass}" 
                 visWindowname="${record.WindowName}" 
                 visWindowId="${record.WindowID}" 
                 visTableName="${record.TableName}"
                 visRecordId="${record.Record_ID}"
                 visTableId="${record.TableID}">
                 <span>${record.WindowName}</span>
                <span class="VIS_recordCount">${record.Count}</span>
                <i class="glyphicon glyphicon-zoom-in vis-exinv-zoom" data-Record_ID="${record.Record_ID}" data-windowId="${record.WindowID}"
                 data-Primary_ID="${record.TableName}"_ID id="VIS-unAllocatedZoom_"${$self.windowNo}'" title="${VIS.Msg.getMsg("VIS_Zoom")}"></i>
                </div>`;
                AssignedRecords.append(AssignedItems);

            });

            // Add pagination UI
            var paginationHtml = `
            <div class="vis-tiles-pagination">
            <div style="width: 1.9em;"></div>
             <div class="vis_assignpageControls">           
            <i class="fa fa-arrow-circle-up vis_prevpage" aria-hidden="true" style="pointer-events: none; opacity: 0.6;"></i>
            <span class="vis-total-count" style="color: white;">${currentPage} / ${totalPages}</span>
            <i class="fa fa-arrow-circle-down  vis_NxtPage" aria-hidden="true" style="pointer-events: none; opacity: 0.6;"></i>
            </div>
            <i class="fa fa-list vis-show-more" aria-hidden="true" title="${VIS.Msg.getMsg('ShowAll')}"></i>
            </div>`;
            widgetContainer.find('.vis-tiles-pagination').remove(); // Remove old pagination
            widgetContainer.append(paginationHtml);


            eventsHandling();
        };

        /* zoom query to open the records */
        function zoomWindow() {
            if (WindowId > 0) {
                var windowParam = {
                    "TabWhereClause": TableName + "_ID IN (" + Record_ID + ")",
                    "TabLayout": "N",
                    "TabIndex": "0",
                    "ActionName": WindowName,
                    "ActionType": 'W'
                };
                VIS.viewManager.startWindow(WindowId, null, windowParam);
            }

        };

        /*this function is used to refresh the design and data of the widget*/
        this.refreshWidget = function () {
            showBusy(true);
            const widgetContainerId = '#Vis_Widget-container_' + $self.widgetInfo.AD_UserHomeWidgetID;
            // Safely remove existing widget container
            if ($root.find(widgetContainerId).length > 0) {
                $root.find(widgetContainerId).remove();
            }
            // Reset pagination and reinitialize the widget
            currentPage = 1;
            // refresh widget
            loadWidget();
        };

        /* get design from root */
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $root.remove();
        };
    }

    /* init method called on loading a form */
    VIS.VISAssignedRecord.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo
        this.windowNo = windowNo;
        this.AD_UserHomeWidgetID = frame.widgetInfo.AD_UserHomeWidgetID;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.VISAssignedRecord.prototype.refreshWidget = function () {
        this.refreshWidget();
    };

    VIS.VISAssignedRecord.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);