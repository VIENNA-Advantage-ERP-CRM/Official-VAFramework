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
        var $root = $('<div class="vis-asrec-maindiv">');
        var widgetContainer = null;
        var assignedRecWidget;
        var pageSize = 0;
        var pageNo = 0;
        var AssignedRecords = null;
        var nextpage = null;
        var prevPage = null;
        var widgetID = null;
        var totalWindows = null;
        var totalPages = null;
        var ListVal = null;
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
        var winRecPageSize = 50;
        var winRecPageNo = 1;
        var TotalPages = 1;
        var content = null;
        var IsZoomClicked = false;
        var ColumnId = null;
        var SrchTxt = null;
        var IsItemSearched = false;
        var popup = null;
        var modelPopupId = null;
        var IsDataFetching = false;
        var RecordCount = 0;
        var uncheckedIDs = [];
        var IsWindowValueChanged = false;
        /*This variable is defined if function is called from assign user popup */
        var IsFromPopUp = false;
        /*This variable is defined if function is called from assign  user popup and when user 
        click the see all assign user link*/
        var IsPopButAll = false;

        /* Initialize the form design */
        this.Initalize = function () {
            widgetID = $self.widgetInfo.AD_UserHomeWidgetID;
            //this function returns refernece id
            GetColumnID("VIS_AssignRecordWidgetList");
            createBusyIndicator();
            widgetsPopup();
            showBusy(true);
            loadWidget();
            //auto refresh widget after interval of 5 minutes
            setInterval(function () {
                $self.refreshWidget();
            }, 1000 * 60 * 5);
        };
        function loadWidget() {
            widgetContainer = $('<div class="VIS-asrec-widget-container" id="Vis_Widget-container_' + widgetID + '">');
            //Created the list reference for assignrecord
            var AssignRecordDiv = $('<div class="VIS-AssignRecordDiv vis-asrec-control-div">');
            var $AssignRecordDiv = $('<div class="input-group vis-input-wrap">');
            /* parameters are: context, windowno., coloumn id, display type, DB coloumn name, Reference key, Is parent, Validation Code*/
            var $AssignRecordLookUp = VIS.MLookupFactory.get(VIS.Env.getCtx(), $self.windowNo, 0, VIS.DisplayType.List, "VIS_AssignRecordWidgetList", ColumnId, false);
            // Parameters are: columnName, mandatory, isReadOnly, isUpdateable, lookup,display length
            vAssignRecord = new VIS.Controls.VComboBox("VIS_AssignRecordWidgetList", true, false, true, $AssignRecordLookUp, 100);
            vAssignRecord.setValue('02');
            ListVal = "02";
            var $AssignRecordControlWrap = $('<div class="vis-control-wrap">');
            $AssignRecordDiv.append($AssignRecordControlWrap);
            $AssignRecordControlWrap.append(vAssignRecord.getControl().attr('placeholder', ' ').attr('data-placeholder', '').attr('data-hasbtn', ' '));
            $AssignRecordDiv.append($AssignRecordControlWrap);
            AssignRecordDiv.append($AssignRecordDiv);
            var mainDiv = $('<div>');
            // var heading = $('<h4>');
            mainDiv.append(AssignRecordDiv).append('<h4></h4>');
            assignedRecWidget = $('<div class="vis-assigned-records" id ="VIS_assignRecords_' + widgetID + '">' +
                '<div class="vis-record-col">' +
                '<div class="vis-windowList">' +
                '</div>' +
                '</div>' +
                '</div>');

            widgetContainer.append(mainDiv).append(assignedRecWidget);
            $root.append(widgetContainer);
            AssignedRecords = widgetContainer.find('.vis-record-col');
            $self.getWindowRecords(getAll, ListVal);
            //Change event of list reference
            vAssignRecord.fireValueChanged = function () {
                ListVal = vAssignRecord.getValue();
                currentPage = 1;
                vAssignRecord.setValue(ListVal);
                $self.getWindowRecords(getAll, ListVal);
            }
        }

        //busy Indicator
        function createBusyIndicator() {
            $bsyDiv = $('<div id="busyDivId' + widgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + widgetID + '" class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            $root.append($bsyDiv);
        };

        /*  show and hide busy indicator*/
        function showBusy(show) {
            if (show) {
                $root.find("#busyDivId" + widgetID).show();
            }
            else {
                $root.find("#busyDivId" + widgetID).hide();
            }
        };

        // Create Widget
        this.getWindowRecords = function (getAllData, ListVal) {
            /*Commented code in order to handle request without ajax*/
            showBusy(true);
            //$.ajax({
            //    url: VIS.Application.contextUrl + "AssignedRecordToUser/AssignRecordToUserWidget",
            //    data: {
            //        pageSize: pageSize,
            //        pageNo: pageNo,
            //        getAll: getAllData,
            //        IsAssignedByMe: ListVal
            //    },
            //    dataType: 'json',
            //    success: function (result) {
            //        showBusy(false);
            //        allRecords = result ? JSON.parse(result) : [];
            //        updateUI();
            //    },
            //    error: function () {
            //        showBusy(false);
            //    }
            //});
            /*Hanlded the request with JSON format*/
            var getDataParams = {
                pageSize: pageSize,
                pageNo: pageNo,
                getAll: getAllData,
                IsAssignedByMe: ListVal
            };
            var res = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "AssignedRecordToUser/AssignRecordToUserWidget", getDataParams);
            if (res) {
                allRecords = res ? res : [];
                /*here listval 00 means that fucntion is called from assi*/
                if (ListVal != "00") {
                    updateUI();
                }
                showBusy(false);
            }
        };

        function eventsHandling() {
            //handled message change based on list value change
            var msg = VIS.Msg.getMsg('VIS_AssignRecordToMe');
            if (ListVal == "01") {
                msg = VIS.Msg.getMsg('VIS_AssignRecordByMe');
            }

            //Popover for showing all records
            widgetContainer.find('.vis-show-more').off('click')
            widgetContainer.find('.vis-show-more').on('click', function () {
                var popupContent = `                 
                       <div class="VIS_PopoverMaindiv">
                       <button class="VIS_popupClose" id="popup-close-btn" title="${VIS.Msg.getMsg('close')}">
                         <i class="fa fa-times" aria-hidden="true"></i>
                             </button>
                       <h3 class="VIS_popuptitle">${msg}:${allRecords[allRecords.length - 1].totalRecordCount}</h3>
                       <div class="VIS_popupRecordDetail">
                                               `;
                // Loop through allRecords and dynamically add rows
                for (var i = 0; i < allRecords.length; i++) {
                    popupContent += `
                   <div class="VIS_WindowRecord"  visWindowname="${allRecords[i].WindowName}"
                   visWindowId="${allRecords[i].WindowID}"
                   visTableName="${allRecords[i].TableName}"
                    visTableId="${allRecords[i].TableID}"
                   visRecordId="${allRecords[i].Record_ID}">
                   <span>${allRecords[i].WindowName}</span>
                   <span class="VIS-asrec-popupRecordCount">${allRecords[i].Count}</span>
                   <i class="glyphicon glyphicon-zoom-in vis-exinv-zoom" data-Record_ID="${allRecords[i].Record_ID}" data-windowId="${allRecords[i].WindowID}"
                   data-Primary_ID="${allRecords[i].TableName}"_ID id="VIS-unAllocatedZoom_"${$self.windowNo}'" title="${VIS.Msg.getMsg("VIS_Zoom")}"></i>
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
                                //On click of element opened the popup
                                TableID = $(this).attr('visTableID');
                                winRecPageNo = 1;
                                RecordCount = $(this).find('.VIS-asrec-popupRecordCount').text();
                                $self.GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, "", IsFromPopUp, IsPopButAll, modelPopupId);

                            });
                            //Handled zoom event
                            $('.w2ui-popup .glyphicon-zoom-in').on('click', function () {
                                w2popup.close();
                                WindowName = $(this).parent().attr('visWindowname');
                                WindowId = $(this).attr('data-windowId');
                                TableID = $(this).parent().attr('visTableID');
                                TableName = $(this).parent().attr('visTableName');
                                Record_ID = $(this).attr('data-Record_ID');
                                winRecPageNo = 1;
                                IsZoomClicked = true;
                                $self.zoomWindow(WindowId);

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
                RecordCount = $(this).find('.VIS_recordCount').text();
                winRecPageNo = 1;
                //VIS_427 Getting window Data
                $self.GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, "", IsFromPopUp, IsPopButAll, modelPopupId)
            });
            AssignedRecords.find('.vis-exinv-zoom').off('click')
            AssignedRecords.find('.vis-exinv-zoom').on('click', function () {
                IsZoomClicked = true;
                WindowName = $(this).parent().attr('visWindowname');
                WindowId = $(this).attr('data-windowId');
                TableID = $(this).parent().attr('visTableID');
                TableName = $(this).parent().attr('visTableName');
                Record_ID = $(this).attr('data-Record_ID');
                $self.zoomWindow(WindowId);
            });
            /*Defined zoom event for single record*/
            AssignedRecords.children().find('.vis-singlerec-zoom').off('click')
            AssignedRecords.find('.vis-singlerec-zoom').on('click', function () {
                WindowName = $(this).parent().attr('visWindowname');
                WindowId = $(this).attr('data-windowId');
                TableID = $(this).parent().attr('visTableID');
                Record_ID = $(this).attr('data-Record_ID');
                $self.zoomWindow(WindowId);
            });
        };
        /*This function used to open popup*/
        function widgetsPopup() {
            popup = "";
            popup = ' <div class="modal vis-a-actionsModelMain" id="widgetsModalId' + widgetID + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
                + ' <div class="modal-dialog modal-lg vis-a-actionsMdialog" role="document">'
                + '     <div class="modal-content vis-a-actionsMcontent">'
                + '             <button id="closeBtnId' + widgetID + '" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close">'
                + '                 <span aria-hidden="true">&times;</span>'
                + '             </button>'
                + '         <div id="appendWidgetDivId' + widgetID + '" class="vis-a-actionsWidgetCls vis-asrec-popupdiv">'
                + '         </div>'
                + '      </div>'
                + '   </div>'
                + '</div>'
            $root.append(popup);
            modelPopupId = $root.find("#widgetsModalId" + widgetID);
            modelPopupId.find("#closeBtnId" + widgetID).on("click", function () {
                modelPopupId.hide();
                SrchTxt = null;
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
        this.GetWindowData = function (WindowId, TableID, Record_ID, winPageNo, winPageSize, searchText, IsFromPopUp, IsPopButAll, modelPopupId, tableName) {
            var isPopupOpen = modelPopupId && modelPopupId.is(':visible');
            /*Assigned the value to variable if function is called from assigned user popup*/
            if (IsFromPopUp) {
                widgetID = winPageSize;
                ListVal = "01"
                winPageSize = 50;
                WindowId = WindowId;
                TableID = TableID;
                IsAssrecWidget = false;
                IsFromPopUp = IsFromPopUp;
                TableName = tableName;
                WindowName = VIS.context.getWindowContext(widgetID, "WindowName");
            }
            if (IsPopButAll) {
                winRecPageNo = 1;
            }
            if (isPopupOpen && !IsFromPopUp) {
                showPopupBusy(true);
            } else if (!IsFromPopUp) {
                showBusy(true);
            }
            var getDataParams = {
                WindowId: WindowId,
                TableID: TableID,
                Record_ID: Record_ID,
                pageNo: winPageNo,
                pageSize: winPageSize,
                SrchTxt: searchText,
                AssignedByOrTo: (IsFromPopUp == false ? ListVal : "01")
            };
            var res = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "AssignedRecordToUser/GeWindowRecords", getDataParams);
            if (IsFromPopUp && !IsPopButAll) {
                return res;
            }
            if (res) {
                showBusy(true);
                windowRecords = res ? res : [];
                CreateList(windowRecords, IsFromPopUp, IsPopButAll, modelPopupId, WindowId, TableID);
            } else {
                if (isPopupOpen) {
                    showPopupBusy(false);
                } else {
                    showBusy(false);
                }
            }
        }
        /**
         * This function used to create list of records in popup
         * @param {any} windowRecords
         */
        function CreateList(windowRecords, IsFromPopUp, IsPopButAll, modelPopupId, WindowId, TableID) {
            $('#vis-asrec-popup-scroll_' + widgetID).off('scroll');
            if (winRecPageNo === 1 && windowRecords.length > 0) {
                TotalRecords = windowRecords[0].countRecords;
                TotalPages = Math.ceil(TotalRecords / winRecPageSize);
            }
            var message = "";
            if (IsPopButAll) {
                message = VIS.Msg.getMsg('VIS_To');
            }
            else {
                message = VIS.Msg.getMsg('VIS_AssignedTo');
            }
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
                        '<td class="VIS-assrec-lalign vis-widpop-tooltip" title="' + windowRecords[i].ColValue + '">' +
                        '<i class="glyphicon glyphicon-zoom-in vis-singlerec-zoom" ' +
                        'data-Record_ID="' + windowRecords[i].Record_ID + '" ' +
                        'id="VIS-unAllocatedZoom_' + widgetID + '" ' +
                        'title="' + VIS.Msg.getMsg("VIS_Zoom") + '">' +
                        '</i>' + windowRecords[i].ColValue + '</td>';
                    /*if user has clicked see all assigned user link then show assigned by also*/
                    if (windowRecords[i].AssignedBy != "") {
                        ListContent += '<td class="vis-asrec-assigned vis-widpop-tooltip" title="' + windowRecords[i].AssignedBy + '">' + windowRecords[i].AssignedBy + '</td>';
                    }

                    ListContent += '<td class="vis-asrec-assigned vis-widpop-tooltip" title="' + windowRecords[i].UpdatedBy + '">' + windowRecords[i].UpdatedBy + '</td>' +
                        '<td class="vis-asrec-date">'
                        + VIS.Utility.Util.getValueOfDate(windowRecords[i].AssignedDate).toLocaleDateString(window.navigator.language, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }) + '</td>';
                    //handled design based on list reference
                    if (ListVal == "01") {
                        ListContent += '<td style="text-align: center;"><input type="checkbox" class="vis-asrec-me-row-check"' + (windowRecords[i].IsRecordAssigned == true ? 'checked' : '')
                            + ' data-Record_ID="' + windowRecords[i].Record_ID + '"></td>';
                    }
                    ListContent += '</tr>';
                }
            }

            var isFirstLoad = (winRecPageNo === 1 && !IsZoomClicked && !IsItemSearched && !IsWindowValueChanged);
            /*Here handled to contenett in popup*/
            if (isFirstLoad) {
                //Created drop down list of all windows
                var windowDropdownHtml = '<select id="vis-asrec-windowDropdown" class="vis-asrec-dropdown">';
                for (var i = 0; i < allRecords.length; i++) {
                    var isSelected = (allRecords[i].WindowID === VIS.Utility.Util.getValueOfInt(WindowId)) ? ' selected' : '';
                    windowDropdownHtml += '<option value="' + allRecords[i].WindowID + '" data-tableid="' + allRecords[i].TableID +
                        '" data-windowname="' + allRecords[i].WindowName +
                        '" data-tablename="' + allRecords[i].TableName +
                        '" data-windowid="' + allRecords[i].WindowID +
                        '" data-recordid="' + allRecords[i].Record_ID + '"' + isSelected + '>' + allRecords[i].WindowName + '</option>';
                }
                windowDropdownHtml += '</select>';
                content = '<div id="VIS-assrec-wrapper">';
                /*Added title of popup according to from where popup opened*/
                if (IsPopButAll) {
                    content += '<div class="vis-asrec-popup-title">' + VIS.Msg.getMsg("VIS_AssignedUsers") + '</div>'
                }
                else if (ListVal == "02") {
                    content += '<div class="vis-asrec-popup-title">' + VIS.Msg.getMsg('VIS_AssignRecordToMe') + '</div>'
                }
                else if (ListVal == "01") {
                    content += '<div class="vis-asrec-popup-title">' + VIS.Msg.getMsg('VIS_AssignRecordByMe') + '</div>'
                }
                content += '<div class="vis-header-bar">' +
                    '<h1 class="vis-header-title"><span class="vis-asrec-dropdown-container">' + windowDropdownHtml +
                    '<span class="vis-asrec-poprecord-count">' + VIS.Utility.Util.getValueOfDecimal(windowRecords[0].countRecords) + '</span>' +
                    '</h1>' +
                    '<div class="VIS-search-wrap">' +
                    '<input value="" placeholder="Search..." type="text" id="VIS_SrchTxtbx_' + widgetID + '" class="VIS-srchtext">' +
                    '<a class="VIS-search-icon" id="VIS_SrchBtn_' + widgetID + '">' +
                    '<span class="vis vis-search"></span>' +
                    '</a>' +
                    '</div>' +
                    '<button id ="popup-close-btn1" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
                    '</div>';
                if (!IsFromPopUp) {
                    content += '<div id="vis-asrec-popup-busyDivId_' + widgetID + '" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id' + widgetID + '" class="vis-busyindicatorinnerwrap">' +
                        '<i class= "vis_widgetloader"></i></div></div>';
                }
                content += '<div id="vis-asrec-popup-scroll_' + widgetID + '" class="vis-asrec-popup-scroll-container vis-table-wrapper">' +
                    '<table id="VIS-assrec-keywords" cellspacing="0" cellpadding="0">' +
                    '<thead>' +
                    '<tr>' +
                    '<th class="vis-widpop-tooltip" title="' + VIS.Msg.getMsg('VIS_RecordName') + '"><span>' + VIS.Msg.getMsg('VIS_RecordName') + '</span></th>';
                if (IsPopButAll) {
                    content += '<th class="vis-widpop-tooltip" title="' + VIS.Msg.getMsg('VIS_AssignedBy') + '"><span>' + VIS.Msg.getMsg('VIS_AssignedBy') + '</span></th>';
                }
                content += '<th class="vis-widpop-tooltip" title="' + (ListVal == "01" ? message : VIS.Msg.getMsg('VIS_AssignedFrom')) + '"><span>' + (ListVal == "01" ? message : VIS.Msg.getMsg('VIS_AssignedFrom')) + '</span></th>' +
                    '<th class="vis-widpop-tooltip" title="' + VIS.Msg.getMsg('VIS_OnDate') + '"><span>' + VIS.Msg.getMsg('VIS_OnDate') + '</span></th>';
                if (ListVal == "01") {
                    content += '<th class="vis-widpop-tooltip" title="' + VIS.Msg.getMsg('VIS_Assigned') + '"><span>' + VIS.Msg.getMsg('VIS_Assigned') + '</span></th>';
                    content += '<th></th>';
                }
                content += '</tr>' +
                    '</thead>' +
                    '<tbody class="vis-assrec-data">' +
                    ListContent +
                    '</tbody>' +
                    '</table>' +
                    '</div>';
                if (ListVal == "01") {
                    content += '<div class="vis-asrec-flyout-footer">' +
                        '<button class="VIS_Pref_btn-2 w-100 mt-0 vis-asrec-cancel vis-asrec-btn" id="VIS_Cancel_' + widgetID + '">' + VIS.Msg.getMsg('Cancel') + '</button>' +
                        '</div>' +
                        '<div class="vis-asrec-flyout-footer">' +
                        '<button class="VIS_Pref_btn-2 w-100 mt-0 vis-asrec-ok vis-asrec-btn" id="VIS_Ok_' + widgetID + '">' + VIS.Msg.getMsg('Ok') + '</button>' +
                        '</div>';
                }
                content += '</div>';
                modelPopupId.find("#appendWidgetDivId" + widgetID).empty().append(content);
                modelPopupId.show();
                // Event Bindings (Delegated)
                $self.bindSearchEvents(modelPopupId, WindowId);
                $self.bindPopupScroll(modelPopupId, WindowId);
                $self.bindPopupEvents(modelPopupId, WindowId, TableID);
                if (ListVal == "01") {
                    modelPopupId.find('.modal-content').css("width", "80%");
                }
                else {
                    modelPopupId.find('.modal-content').css("width", "70%")
                }

            } else if (!IsZoomClicked || IsItemSearched || IsWindowValueChanged) {
                // Clear old content if it's the first page or a new search
                if (winRecPageNo === 1 || IsItemSearched || IsWindowValueChanged) {
                    modelPopupId.find('.vis-assrec-data').html(ListContent); // Replace all content
                    //if the window is changed then refresh the value
                    if (IsWindowValueChanged) {
                        modelPopupId.find('.vis-header-title').html(
                            '<span class="vis-asrec-dropdown-container">' +
                            modelPopupId.find('#vis-asrec-windowDropdown')[0].outerHTML +
                            '<span class="vis-asrec-poprecord-count">' +
                            VIS.Utility.Util.getValueOfDecimal(windowRecords[0].countRecords) +
                            '</span>' +
                            '</span>'
                        );
                        modelPopupId.find('.vis-header-title').find('#vis-asrec-windowDropdown').val(WindowId);
                    }
                } else {
                    modelPopupId.find('.vis-assrec-data').append(ListContent); // Append more records during scroll
                }

                // Reset the search flag after handling
                IsItemSearched = false;
                IsWindowValueChanged = false;
                $self.bindPopupScroll(modelPopupId, WindowId);
            } else {
                IsZoomClicked = false;
                IsItemSearched = false;
                IsWindowValueChanged = false
            }

            showPopupBusy(false);
            showBusy(false);
            IsDataFetching = false;
        }
        /**This function is used to unassign the record if user click the ok button */
        function UnAssignRecord(modelPopupId, WindowId, TableID) {
            showBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/DeleteRecord",
                type: "POST",
                data: {
                    AD_Window_ID: WindowId,
                    AD_Table_ID: TableID,
                    Record_ID: uncheckedIDs,

                },
                dataType: 'json',
                success: function (response) {
                    showBusy(false);
                    var deleteresult = JSON.parse(response);
                    if (!(deleteresult.toLowerCase().startsWith("error"))) {
                        modelPopupId.hide();
                        $self.getWindowRecords(getAll, ListVal);
                        uncheckedIDs = [];
                    }
                    else {
                        VIS.ADialog.info(deleteresult);
                    }
                },
                error: function () {
                    showBusy(false);
                }
            });
        };
        /**Binded pop events  */
        /**Binded pop events  */
        this.bindPopupEvents = function (modelPopupId, WindowId, TableID) {
            // Close button event
            modelPopupId.off('click', '#popup-close-btn1')
                .on('click', '#popup-close-btn1', function () {
                    modelPopupId.hide();
                    IsZoomClicked = false;
                    SrchTxt = null;
                    IsItemSearched = false;
                    IsWindowValueChanged = false;
                });

            // Zoom button click
            modelPopupId.off('click', '.vis-singlerec-zoom')
                .on('click', '.vis-singlerec-zoom', function () {
                    Record_ID = $(this).attr('data-Record_ID');
                    $self.zoomWindow(WindowId);
                    modelPopupId.hide();
                });

            // Checkbox check/uncheck
            modelPopupId.off('change', '.vis-asrec-me-row-check')
                .on('change', '.vis-asrec-me-row-check', function () {
                    var recordID = $(this).data('record_id');

                    if ($(this).is(':checked')) {
                        uncheckedIDs = uncheckedIDs.filter(id => id !== recordID);
                    } else if (!uncheckedIDs.includes(recordID)) {
                        uncheckedIDs.push(recordID);
                    }
                });

            // OK button click
            modelPopupId.off('click', '.vis-asrec-ok')
                .on('click', '.vis-asrec-ok', function () {
                    if (uncheckedIDs.length > 0) {
                        UnAssignRecord(modelPopupId, WindowId, TableID);
                    }
                });

            // Cancel button click
            modelPopupId.off('click', '.vis-asrec-cancel')
                .on('click', '.vis-asrec-cancel', function () {
                    modelPopupId.hide();
                });

            // Dropdown change
            modelPopupId.off('change', '#vis-asrec-windowDropdown')
                .on('change', '#vis-asrec-windowDropdown', function () {
                    IsWindowValueChanged = true;
                    $('.VIS-srchtext').val("");
                    SrchTxt = null;
                    WindowId = $(this).val();
                    winRecPageNo = 1;
                    TableID = $(this).find('option:selected').data('tableid');
                    Record_ID = $(this).find('option:selected').data('recordid');
                    TableName = $(this).find('option:selected').data('tablename');
                    WindowName = $(this).find('option:selected').data('windowname');
                    WindowId = $(this).find('option:selected').data('windowid');
                    $self.GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, "", IsFromPopUp, IsPopButAll, modelPopupId);
                });
        }
        /**
         * This function is used to get the reference id
         * @param {any} ColumnData
         */
        var GetColumnID = function (ColumnData) {
            ColumnId = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "AssignedRecordToUser/GetRefIdForAssList", { "refernceName": ColumnData }, null);
        }
        /**
         * This function is used to show busy indicator on popup
         * @param {any} show
         */
        function showPopupBusy(show) {
            if (show) {
                $root.find("#vis-asrec-popup-busyDivId_" + widgetID).show();
            }
            else {
                $root.find("#vis-asrec-popup-busyDivId_" + widgetID).hide();
            }
        }
        // Search Event Binding (Delegated)
        this.bindSearchEvents = function (modelPopupId, WindowId) {
            // Search button
            modelPopupId.off('click', '#VIS_SrchBtn_' + widgetID)
                .on('click', '#VIS_SrchBtn_' + widgetID, function () {
                    SrchTxt = modelPopupId.find('#VIS_SrchTxtbx_' + widgetID).val();
                    IsItemSearched = true;
                    winRecPageNo = 1;
                    WindowId = modelPopupId.find('.vis-header-title').find('#vis-asrec-windowDropdown').val();
                    $self.GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, SrchTxt, IsFromPopUp, IsPopButAll, modelPopupId);
                });

            // Enter key
            modelPopupId.off('keypress', '#VIS_SrchTxtbx_' + widgetID).on('keypress', '#VIS_SrchTxtbx_' + widgetID, function (e) {
                if (e.which === 13) {
                    modelPopupId.find('#VIS_SrchBtn_' + widgetID).click();
                    return false;
                }
            });
        }



        // Popup Scroll Binding (Infinite Scroll)
        this.bindPopupScroll = function (modelPopupId, WindowId) {
            /*            var scrollContainerSelector = '#vis-asrec-popup-scroll_' + widgetID;*/

            modelPopupId.find('#vis-asrec-popup-scroll_' + widgetID).off('scroll').on('scroll', function () {
                if (IsDataFetching || winRecPageNo >= TotalPages) return;

                var $this = $(this);
                if ($this[0].scrollHeight - $this.scrollTop() - $this.outerHeight() < 20) {
                    IsDataFetching = true;
                    winRecPageNo += 1;
                    WindowId = modelPopupId.find('.vis-header-title').find('#vis-asrec-windowDropdown').val();
                    $self.GetWindowData(WindowId, TableID, Record_ID, winRecPageNo, winRecPageSize, SrchTxt, IsFromPopUp, IsPopButAll, modelPopupId);
                }
            });
        }


        /*  update UI*/
        function updateUI() {
            AssignedRecords.empty(); // Clear existing records
            AssignedRecords.removeClass('vis-noRecordFound');
            if (allRecords == null || allRecords.length === 0) {
                /*remove pagination if no data found*/
                widgetContainer.find('.vis-tiles-pagination').remove();
                widgetContainer.find('h4').text('' + ' 0');
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
            widgetContainer.find('h4').html('<span class="vis-asrec-count-circle">' + allRecords[allRecords.length - 1].totalRecordCount + '</span>');

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
        this.zoomWindow = function (WindowId) {
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
            const widgetContainerId = '#Vis_Widget-container_' + widgetID;
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