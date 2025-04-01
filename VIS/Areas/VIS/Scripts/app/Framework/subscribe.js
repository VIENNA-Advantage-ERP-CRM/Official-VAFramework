/************************************************************
* Module Name    : VIS
* Purpose        : Subscribe/Unsubscribe records
* chronological  : Development
* Created Date   : 27 January 2025
* Created by     : (VAI049)
***********************************************************/
; VIS = window.VIS || {};

(function (VIS, $) {
    function subscribe(record_ID, reloadSubscribe, self) {
        var $root_subs = null;
        var subscribedItems = self.curTab._subscribe;

        reloadSubscribe();

        // Get matched items
        const matchedItems = subscribedItems.filter(item =>
            record_ID.includes(Number(item.ID)) // Match record_ID with subscribed item ID
        );

        // Define UI logic based on matched and unmatched items
        if (record_ID.length < 2) {
            if (matchedItems.length) {
                // If there are matched items, show unsubscribe and allRecords options
                $root_subs = $(
                    '<div>' +
                    '<ul class="vis-apanel-rb-ul">' +
                    '<li class="vis-subscribeoverlay-item" data-id="unsubscribe">' + VIS.Msg.getMsg("VIS_Unsubscribe") + '</li>' +
                    '<li class="vis-subscribeoverlay-item" data-id="allRecords">' + VIS.Msg.getMsg("VIS_AllRecords") + '</li>' +
                    '</ul>' +
                    '</div>'
                );
            }
            else {
                // If no matched items, show selectedRecords and allRecords options
                $root_subs = $('<div>' +
                    '<ul class="vis-apanel-rb-ul">' +
                    '<li class="vis-subscribeoverlay-item" data-id="selectedRecords">' + VIS.Msg.getMsg("VIS_SelectedRecords") + '</li>' +
                    '<li class="vis-subscribeoverlay-item" data-id="allRecords">' + VIS.Msg.getMsg("VIS_AllRecords") + '</li>' +
                    '</ul>' +
                    '</div>'
                );
            }
        }
        else {
            // For cases where there are multiple records, show all options
            $root_subs = $('<div>' +
                '<ul class="vis-apanel-rb-ul">' +
                '<li class="vis-subscribeoverlay-item" data-id="selectedRecords">' + VIS.Msg.getMsg("VIS_SelectedRecords") + '</li>' +
                '<li class="vis-subscribeoverlay-item" data-id="allRecords">' + VIS.Msg.getMsg("VIS_AllRecords") + '</li>' +
                // Show "Unsubscribe" option only if at least one record is subscribed
                (matchedItems.length > 0 ?
                    '<li class="vis-subscribeoverlay-item" data-id="unsubscribe">' + VIS.Msg.getMsg("VIS_Unsubscribe") + '</li>' : ''
                ) +
                '</ul>' +
                '</div>'
            );
        }

        // Attach a click handler to each <li> item
        $root_subs.find('li').off('click');
        $root_subs.find('li').on('click', function (e) {
            self.setBusy(true);
            e.stopImmediatePropagation();  // Prevent any other click events from being triggered
            var overlay = $('#w2ui-overlay-main');
            overlay.remove(); // Close the overlay

            var itemId = $(this).data('id');  // Get the data-id of the clicked <li>

            var url;
            var data;

            // Handle different actions based on which option is clicked
            if (itemId == "unsubscribe") {
                url = VIS.Application.contextUrl + 'Subscribe/UnSubscribeMultiple';
                data = { AD_Window_ID: self.curTab.getAD_Window_ID(), Record_IDs: record_ID, AD_Table_ID: self.curTab.getAD_Table_ID() };
            }
            else if (itemId == "allRecords") {
                url = VIS.Application.contextUrl + 'Subscribe/SubscribeAll';
                data = { AD_Window_ID: self.curTab.getAD_Window_ID(), AD_Tab_ID: self.curTab.getAD_Tab_ID(), AD_Table_ID: self.curTab.getAD_Table_ID(), AD_Record_ID: self.curTab.getRecord_ID() };
            }
            else if (itemId == "selectedRecords") {
                url = VIS.Application.contextUrl + 'Subscribe/MultipleSubscribe';
                data = { AD_Window_ID: self.curTab.getAD_Window_ID(), Record_ID: record_ID, AD_Table_ID: self.curTab.getAD_Table_ID() };
            }

            // AJAX call to handle the subscribe/unsubscribe actions
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'JSON',
                data: data,
                success: function (result) {
                    self.setBusy(false);
                    if (result) {
                        result = JSON.parse(result);
                        if ((url == VIS.Application.contextUrl + 'Subscribe/SubscribeAll' && (result == 1 || result == 2)) ||
                            (url == VIS.Application.contextUrl + 'Subscribe/UnSubscribeMultiple' && result > 0) ||
                            (url == VIS.Application.contextUrl + 'Subscribe/MultipleSubscribe' && result.Error == '')) {
                            reloadSubscribe();
                        }
                        if (result.Error != '' && url == VIS.Application.contextUrl + 'Subscribe/MultipleSubscribe') {
                            VIS.ADialog.info("", "", result.Error);
                        }
                    }
                    else {
                        if (url == VIS.Application.contextUrl + 'Subscribe/UnSubscribeMultiple') {
                            VIS.ADialog.error("VIS_RecordNotUnSubscribed");
                            return;
                        }
                        else if ((url == VIS.Application.contextUrl + 'Subscribe/MultipleSubscribe') || (url == VIS.Application.contextUrl + 'Subscribe/SubscribeAll')) {
                            VIS.ADialog.error("VIS_RecordNotSubscribed");
                            return;
                        }
                    }
                },
                error: function (r) {
                    VIS.ADialog.error(VIS.Msg.getMsg("Error") + r.statusText);
                    self.setBusy(false);
                }
            });
        });

        // Show the overlay with the cloned content
        self.aSubscribe.getListItmIT().w2overlay($root_subs.clone(true));

        this.disposeComponent = function () {
            // Cleanup logic, if needed
            $root_subs = null;
        };

        // Get design from root
        this.getRoot = function () {
            return $root;
        };

    };

    // init method called on loading a form
    subscribe.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    subscribe.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame) this.frame.dispose();
        this.frame = null;
    };

    VIS.subscribe = subscribe;

})(VIS, jQuery);