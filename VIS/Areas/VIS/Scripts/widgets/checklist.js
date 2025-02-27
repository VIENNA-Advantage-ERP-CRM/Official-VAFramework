; VIS = window.VIS || {};

(function (VIS, $) {

    //Form Class function
    VIS.VISPendingChecklist = function () {
        /* Variables */
        this.frame;
        this.windowNo;
        var $self = this;
        var $root = $('<div class="vis-maindiv">');
        var widgetContainer, pendingRecords = null;
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
        var TableName = [];
        var RecordIds = [];
        var totalRecCount = 0;
        var Table_ID = null;
        var headerTab;
        var totalPages, currentRecords = null;



        /* Initialize the form design */
        this.Initalize = function () {
            widgetID = this.widgetInfo.AD_UserHomeWidgetID;
            createBusyIndicator();
            showBusy(true);
            loadWidget();
        };

        function loadWidget() {
            widgetContainer = $('<div class="VIS_widget-container" id="Vis_checklistWidget-container_' + $self.widgetInfo.AD_UserHomeWidgetID + '">');
            checklistRecWidget = $('<div class="vis_checklistheader"><h4></h4></div><div class="vis-checklistrecord-col"></div>');
            widgetContainer.append(checklistRecWidget);
            $root.append(widgetContainer);
            pendingRecords = widgetContainer.find('.vis-checklistrecord-col');
            getpendingRecords();
        };

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

        function eventsHandling() {

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


            /*events for getting HeaderIDs*/
            pendingRecords.find('.vis-subheading').off('click')
            pendingRecords.find('.vis-subheading').on('click', function () {
                WindowName = $(this).attr('visWindowname');
                WindowId = $(this).attr('visWindowId');
                TableName = $(this).attr('visTableName');
                Table_ID = $(this).attr('visTableId');
                Record_ID = $(this).attr('visRecordId');
                headerTab = $(this).attr('visHeaderTab');
                if (headerTab > 0) {
                    getHeaderIDs();
                }
                else {
                    primaryKey = TableName + '_ID';
                    zoomWindow();
                }
            });

            //Popover for showing all records
            widgetContainer.find('.vis-show-checklist').off('click')
            widgetContainer.find('.vis-show-checklist').on('click', function () {
                var $popupContent = $(`
                <div class="VIS_PopoverMaindiv">
                <button class="VIS_popupClose" id="popup-close-btn" title="${VIS.Msg.getMsg('close')}">
                <i class="fa fa-times" aria-hidden="true"></i>
               </button>
               <h3 class="VIS_popuptitle">${VIS.Msg.getMsg('VIS_PendingChecklist')}:${totalRecCount}</h3>
               <div class="VIS_popupRecordDetail"></div>
               </div>
             `);

                var $recordDetail = $popupContent.find('.VIS_popupRecordDetail');

                for (var i = 0; i < allRecords.length; i++) {
                    var $checklistCard = $(`
                   <div class="vis-checklistcard">
                     <div class="vis-card-title vis-checklistrecord-box">
                    <span>${allRecords[i].windowname}</span>
                    <span class="VIS_checklistCount">${allRecords[i].count}</span>
                    
                   </div>
                    <div class="vis-Tabdropdown visWindowTabs"></div>
                   </div>
                `);

                    var $dropdown = $checklistCard.find('.vis-Tabdropdown');
                    console.log(allRecords)
                    for (var k = 0; k < allRecords[i].TableRecordIds.length; k++) {
                        $dropdown.append(`
                      <div class="vis-subheading" 
                      visRecordId="${allRecords[i].TableRecordIds[k].RecordIds}"  
                      visTableName="${allRecords[i].TableRecordIds[k].TableName}"  
                      visWindowname="${allRecords[i].windowname}"   
                      visWindowId="${allRecords[i].WindowID}" 
                      visTableId ="${allRecords[i].TableRecordIds[k].AD_table_ID}"
                      visHeaderTab="${allRecords[i].TableRecordIds[k].TabLevel}">
                    <span>${allRecords[i].TableRecordIds[k].TabName}</span>
                    <span>${allRecords[i].TableRecordIds[k].RecordIds.length}</span>
                </div>
            `);
                    }

                    $recordDetail.append($checklistCard);
                }

                // Open the Popup
                w2popup.open({
                    title: '',
                    body: $popupContent.prop('outerHTML'),
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
                            $('.w2ui-popup .vis-subheading').on('click', function () {
                                w2popup.close();
                                WindowName = $(this).attr('visWindowname');
                                WindowId = $(this).attr('visWindowId');
                                TableName = $(this).attr('visTableName');
                                Record_ID = $(this).attr('visRecordId');
                                Table_ID = $(this).attr('visTableId');
                                headerTab = $(this).attr('visHeaderTab');
                                if (headerTab > 0) {
                                    getHeaderIDs();
                                }
                                else {
                                    primaryKey = TableName + '_ID';
                                    zoomWindow();
                                }
                            });
                        }, 1000);
                    }

                });
            });
        };


        // Create Widget
        function getpendingRecords() {
            $.ajax({
                url: VIS.Application.contextUrl + "ChecklistPending/PendingCheckList",
                dataType: 'json',
                success: function (result) {
                    showBusy(false);
                    allRecords = result ? JSON.parse(result) : [];
                    totalRecCount = allRecords.reduce((sum, record) => sum + record.count, 0);
                    widgetContainer.find('h4').text(`${VIS.Msg.getMsg('VIS_PendingChecklist')}: ${totalRecCount}`);
                    updateUI();
                },
                error: function () {
                    showBusy(false);
                }

            });
        };

        /*  update UI*/
        function updateUI() {
            pendingRecords.empty(); // Clear existing records
            if (allRecords.length === 0) {
                widgetContainer.find('h4').text('' + VIS.Msg.getMsg("VIS_PendingChecklist") + ': 0');
                pendingRecords.text(VIS.Msg.getMsg('VIS_NoRecordFound')).addClass('vis-noRecordFound');
                return;
            }



            // Calculate total pages
            totalPages = Math.ceil(allRecords.length / sizePage);
            // Get records for the current page
            var start = (currentPage - 1) * sizePage;
            var end = Math.min(start + sizePage, allRecords.length);
            currentRecords = allRecords.slice(start, end);


            currentRecords.forEach((record, i) => {


                // Create jQuery object from HTML string
                var $pendingChecklistItem = $(`
               <div class="vis-checklistcard">
               <div class="vis-card-title vis-checklistrecord-box"
                <span>${record.windowname}</span>
                <span class="VIS_checklistCount">${record.count}</span>
                
               </div>
                <div class="vis-Tabdropdown visWindowTabs"></div>
                </div>
                       `);
                pendingRecords.append($pendingChecklistItem);
                var $dropdown = $pendingChecklistItem.find('.vis-Tabdropdown');
                for (var k = 0; k < record.TableRecordIds.length; k++) {
                    $dropdown.append(`<div class="vis-subheading" visRecordId="${record.TableRecordIds[k].RecordIds}"  visTableName="${record.TableRecordIds[k].TableName}"  visWindowname="${record.windowname}"   visWindowId="${record.WindowID}" visTableId ="${record.TableRecordIds[k].AD_table_ID}" visHeaderTab="${record.TableRecordIds[k].TabLevel}"><span>${record.TableRecordIds[k].TabName}</span><span>${record.TableRecordIds[k].RecordIds.length}</span></div>`);
                }
            });


            // Add pagination UI
            var paginationHtml = `
            <div class="vis-tiles-checklistpage">
             <div class="vis_checklistpageControls">
             <div style="width: 1.9em;"></div>
            <i class="fa fa-arrow-circle-up vis_prevpage" aria-hidden="true"></i>
             <span class="vis-total-count" style="color: white;">${currentPage} / ${totalPages}</span>
            <i class="fa fa-arrow-circle-down vis_NxtPage" aria-hidden="true"></i>
              </div>
             <i class="fa fa-list vis-show-checklist" aria-hidden="true" title="${VIS.Msg.getMsg('ShowAll')}"></i>
            </div>`;
            widgetContainer.find('.vis-tiles-checklistpage').remove(); // Remove old pagination
            widgetContainer.append(paginationHtml);
            eventsHandling();
        };

        /* getHeaderIDS Of particular window*/
        function getHeaderIDs() {
            $.ajax({
                url: VIS.Application.contextUrl + "ChecklistPending/ZoomChildTabRecords",
                type: "POST",
                data: {
                    AD_table_ID: Table_ID,
                    AD_Window_ID: WindowId,
                    RecordIds: Record_ID
                },

                dataType: 'json',
                success: function (res) {
                    showBusy(false);
                    result = JSON.parse(res);
                    Record_ID = result.RecordIds;
                    primaryKey = result.LinkColumn;
                    zoomWindow();

                },
                error: function () {
                    showBusy(false);
                }

            });

        };

        /*  zoom the record*/
        function zoomWindow() {
            if (WindowId > 0) {
                var windowParam = {
                    "TabWhereClause": "(" + primaryKey + ") IN (" + Record_ID + ")",
                    "TabLayout": "N",
                    "TabIndex": "0",
                    "ActionName": WindowName,
                    "ActionType": 'W'
                };
                VIS.viewManager.startWindow(WindowId, null, windowParam);
            }
        }

        /*this function is used to refresh the design and data of the widget*/
        this.refreshWidget = function () {
            showBusy(true);
            const widgetContainerId = '#Vis_checklistWidget-container_' + $self.widgetInfo.AD_UserHomeWidgetID;
            // Safely remove existing widget container
            if ($root.find(widgetContainerId).length > 0) {
                $root.find(widgetContainerId).remove();
            }
            // Reset pagination and reinitialize the widget
            currentPage = 1;
            totalRecCount = 0;
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
    VIS.VISPendingChecklist.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo;
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.VISPendingChecklist.prototype.refreshWidget = function () {
        this.refreshWidget();
    };

    VIS.VISPendingChecklist.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);