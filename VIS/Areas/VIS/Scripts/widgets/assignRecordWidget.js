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

        /*  update UI*/
        function updateUI() {
            AssignedRecords.empty(); // Clear existing records
            if (allRecords == null || allRecords.length === 0) {
                widgetContainer.find('h4').text('' + VIS.Msg.getMsg("VIS_AssignRecord") + ': 0');
                AssignedRecords.text(VIS.Msg.getMsg('VIS_NoRecordFound')).addClass('vis-noRecordFound');
                return;
            }

            // Calculate total pages
            var totalPages = Math.ceil(allRecords.length / sizePage);
            // Get records for the current page
            var start = (currentPage - 1) * sizePage;
            var end = Math.min(start + sizePage, allRecords.length);
            var currentRecords = allRecords.slice(start, end);

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
                 visRecordId="${record.Record_ID}">
                 <span>${record.WindowName}</span>
                <span class="VIS_recordCount">${record.Count}</span>
                </div>`;
                AssignedRecords.append(AssignedItems);

            });

            // Add pagination UI
            var paginationHtml = `
            <div class="vis-tiles-pagination">
            <i class="fa fa-arrow-circle-up vis_prevpage" aria-hidden="true"></i>
            <span class="vis-total-count" style="color: white;">${currentPage} / ${totalPages}</span>
            <i class="fa fa-arrow-circle-down  vis_NxtPage" aria-hidden="true"></i>             
            <i class="fa fa-list vis-show-more" aria-hidden="true" title="${VIS.Msg.getMsg('ShowAll')}"></i>
            </div>`;
            widgetContainer.find('.vis-tiles-pagination').remove(); // Remove old pagination
            widgetContainer.append(paginationHtml);

            // Pagination button events
            widgetContainer.find('.vis_NxtPage').off('click')
            widgetContainer.find('.vis_NxtPage').on('click', function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateUI();
                };
            });


            //Popover for showing all records
            widgetContainer.find('.vis-show-more').off('click')
            widgetContainer.find('.vis-show-more').on('click', function () {
                var popupContent = `                 
                       <div class="VIS_PopoverMaindiv">
                       <button class="VIS_allWindowRecord" id="popup-close-btn" title="${VIS.Msg.getMsg('close')}">
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
                TableName = $(this).attr('visTableName');
                Record_ID = $(this).attr('visRecordId');
                zoomWindow()
            });
        };


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
