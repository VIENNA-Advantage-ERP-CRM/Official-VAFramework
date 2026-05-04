/**
 * Invoices Widget
 * Purpose - Show invoices needing attention on home/finance dashboard
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    VIS.InvoicesWidget = function () {

        this.frame;
        this.windowNo;
        var $self = this;
        var $root = $('<div style="height:100%;font-family:Roboto,sans-serif;">');

        var $tableBody;
        var $alertBanner;
        var selectedRows = {};

        var INVOICES = [
            { id: 'INV-1042', customer: 'Northwind Logistics', due: 'Today',   status: 'overdue',  amount: 12400 },
            { id: 'INV-1041', customer: 'Ember RetailCo',      due: 'Apr 20',  status: 'due_soon', amount: 8200  },
            { id: 'INV-1040', customer: 'Harbor Medical',      due: 'Apr 24',  status: 'sent',     amount: 6100  },
            { id: 'INV-1039', customer: 'Aerial Robotics',     due: 'Apr 26',  status: 'draft',    amount: 4400  },
            { id: 'INV-1038', customer: 'Brick+Mortar Inc.',   due: 'May 02',  status: 'approved', amount: 9800  }
        ];

        var STATUS_CONFIG = {
            overdue:  { label: 'Overdue 3d', bg: '#FFE8E8', color: '#C0392B' },
            due_soon: { label: 'Due soon',   bg: '#FFF3CD', color: '#9A6500' },
            sent:     { label: 'Sent',       bg: '#DFF1FF', color: '#0E5DA8' },
            draft:    { label: 'Draft',      bg: '#EDEDED', color: '#505050' },
            approved: { label: 'Approved',   bg: '#CCEFDD', color: '#0C5D38' }
        };

        /* ── Initialize ── */
        this.Initalize = function () {
            createWidget();
            bindEvents();
        };

        /* ── Build DOM ── */
        function createWidget() {
            var $card = $(
                '<div style="' +
                    'background:linear-gradient(180deg,rgba(255,255,255,0.82) 0%,rgba(255,255,255,0.58) 100%);' +
                    'border:2px solid #fff;' +
                    'border-radius:14px;' +
                    'box-shadow:0 10px 24px rgba(15,61,97,0.06);' +
                    'overflow:hidden;' +
                    'height:100%;' +
                    'display:flex;flex-direction:column;' +
                '">'
            );

            /* Header */
            var $header = $(
                '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px 14px;">' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                        '<div style="width:36px;height:36px;border-radius:8px;background:#EAF8FF;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0083DA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
                                '<polyline points="14 2 14 8 20 8"/>' +
                                '<line x1="16" y1="13" x2="8" y2="13"/>' +
                                '<line x1="16" y1="17" x2="8" y2="17"/>' +
                                '<polyline points="10 9 9 9 8 9"/>' +
                            '</svg>' +
                        '</div>' +
                        '<span style="font-size:16px;font-weight:700;color:#102C3F;">Invoices needing your attention</span>' +
                    '</div>' +
                    '<a href="javascript:void(0)" id="vis-inv-newbtn-' + $self.AD_UserHomeWidgetID + '" ' +
                        'style="font-size:13px;font-weight:600;color:#0083DA;text-decoration:none;">+ New invoice</a>' +
                '</div>'
            );

            /* Duplicate alert banner */
            $alertBanner = $(
                '<div id="vis-inv-alert-' + $self.AD_UserHomeWidgetID + '" ' +
                    'style="margin:0 16px 12px;background:#FFF8E6;border:1px solid #F5C94E;border-radius:10px;padding:10px 14px;display:flex;align-items:flex-start;gap:10px;">' +
                    '<svg style="flex-shrink:0;margin-top:2px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D78B10" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>' +
                        '<line x1="4" y1="22" x2="4" y2="15"/>' +
                    '</svg>' +
                    '<div style="flex:1;">' +
                        '<div style="font-size:13px;font-weight:700;color:#7A4F00;margin-bottom:2px;">Duplicate suspected: INV-1042 matches INV-1029 amount + customer</div>' +
                        '<div style="font-size:12px;color:#9A6500;">Same customer, same $12,400 amount, issued 6 days apart</div>' +
                    '</div>' +
                    '<a href="javascript:void(0)" id="vis-inv-review-' + $self.AD_UserHomeWidgetID + '" ' +
                        'style="background:#fff;border:1px solid #E4C87A;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;color:#7A4F00;text-decoration:none;white-space:nowrap;align-self:center;">Review</a>' +
                '</div>'
            );

            /* Table wrapper */
            var $tableWrap = $('<div style="padding:0 4px 4px;flex:1;overflow:auto;">');

            /* Table header row */
            var $tableHead = $(
                '<div style="display:grid;grid-template-columns:36px 1fr 1.4fr 100px 140px 110px;align-items:center;padding:6px 16px;border-bottom:1px solid #EDF2F6;">' +
                    '<input type="checkbox" id="vis-inv-chk-all-' + $self.AD_UserHomeWidgetID + '" style="accent-color:#0083DA;cursor:pointer;">' +
                    '<span style="font-size:11px;font-weight:600;color:#748494;letter-spacing:0.6px;text-transform:uppercase;">INVOICE</span>' +
                    '<span style="font-size:11px;font-weight:600;color:#748494;letter-spacing:0.6px;text-transform:uppercase;">CUSTOMER</span>' +
                    '<span style="font-size:11px;font-weight:600;color:#748494;letter-spacing:0.6px;text-transform:uppercase;">DUE</span>' +
                    '<span style="font-size:11px;font-weight:600;color:#748494;letter-spacing:0.6px;text-transform:uppercase;">STATUS</span>' +
                    '<span style="font-size:11px;font-weight:600;color:#748494;letter-spacing:0.6px;text-transform:uppercase;">AMOUNT</span>' +
                '</div>'
            );

            /* Table body */
            $tableBody = $('<div id="vis-inv-tbody-' + $self.AD_UserHomeWidgetID + '">');
            renderRows();

            $tableWrap.append($tableHead).append($tableBody);
            $card.append($header).append($alertBanner).append($tableWrap);
            $root.append($card);
        }

        /* ── Render rows ── */
        function renderRows() {
            $tableBody.empty();
            $.each(INVOICES, function (i, inv) {
                var cfg     = STATUS_CONFIG[inv.status];
                var isLast  = (i === INVOICES.length - 1);
                var isChk   = !!selectedRows[inv.id];
                var rowBg   = isChk ? '#F0F8FF' : 'transparent';

                var $row = $(
                    '<div data-invid="' + inv.id + '" ' +
                        'style="display:grid;grid-template-columns:36px 1fr 1.4fr 100px 140px 110px;align-items:center;' +
                        'padding:13px 16px;cursor:pointer;background:' + rowBg + ';transition:background 0.15s;' +
                        (isLast ? '' : 'border-bottom:1px solid #EDF2F6;') + '">' +
                        '<input type="checkbox" data-rowinvid="' + inv.id + '" ' + (isChk ? 'checked' : '') + ' ' +
                            'style="accent-color:#0083DA;cursor:pointer;">' +
                        '<span style="font-size:13px;font-weight:700;color:#102C3F;">' + inv.id + '</span>' +
                        '<span style="font-size:13px;color:#3D5166;">'  + inv.customer + '</span>' +
                        '<span style="font-size:13px;color:#5F7283;">'  + inv.due      + '</span>' +
                        '<span>' +
                            '<span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;' +
                                'background:' + cfg.bg + ';color:' + cfg.color + ';white-space:nowrap;">' +
                                cfg.label +
                            '</span>' +
                        '</span>' +
                        '<span style="font-size:14px;font-weight:700;color:#102C3F;text-align:right;">$' + inv.amount.toLocaleString('en-US') + '</span>' +
                    '</div>'
                );

                $tableBody.append($row);
            });
        }

        /* ── Events ── */
        function bindEvents() {

            /* Row click — toggle selection */
            $root.on('click', '[data-invid]', function (e) {
                if ($(e.target).is('input[type=checkbox]')) return;
                var id = $(this).data('invid');
                toggleRow(id);
            });

            /* Row checkbox */
            $root.on('change', 'input[data-rowinvid]', function () {
                var id = $(this).data('rowinvid');
                toggleRow(id);
            });

            /* Select-all checkbox */
            $root.on('change', '#vis-inv-chk-all-' + $self.AD_UserHomeWidgetID, function () {
                if ($(this).is(':checked')) {
                    $.each(INVOICES, function (i, inv) { selectedRows[inv.id] = true; });
                } else {
                    selectedRows = {};
                }
                renderRows();
            });

            /* Dismiss alert */
            $root.on('click', '#vis-inv-review-' + $self.AD_UserHomeWidgetID, function () {
                $alertBanner.slideUp(200);
            });

            /* New invoice */
            $root.on('click', '#vis-inv-newbtn-' + $self.AD_UserHomeWidgetID, function () {
                onNewInvoice();
            });
        }

        function toggleRow(id) {
            if (selectedRows[id]) {
                delete selectedRows[id];
            } else {
                selectedRows[id] = true;
            }
            /* Update just the affected row without full re-render */
            var $row = $tableBody.find('[data-invid="' + id + '"]');
            var isChk = !!selectedRows[id];
            $row.css('background', isChk ? '#F0F8FF' : 'transparent');
            $row.find('input[type=checkbox]').prop('checked', isChk);

            /* Sync select-all */
            var allChk = Object.keys(selectedRows).length === INVOICES.length;
            $root.find('#vis-inv-chk-all-' + $self.AD_UserHomeWidgetID).prop('checked', allChk);
        }

        /* ── Public hook — override in integration to open new invoice window ── */
        function onNewInvoice() {
            // TODO: wire to VIS.viewManager.startWindow(...) when backend is ready
        }

        /* ── Refresh ── */
        this.refreshWidget = function () {
            selectedRows = {};
            renderRows();
        };

        /* ── Root accessor ── */
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $root.remove();
        };
    };

    VIS.InvoicesWidget.prototype.refreshWidget = function () {};

    VIS.InvoicesWidget.prototype.init = function (windowNo, frame) {
        this.frame               = frame;
        this.AD_UserHomeWidgetID = frame.widgetInfo.AD_UserHomeWidgetID;
        this.windowNo            = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.InvoicesWidget.prototype.widgetSizeChange = function (height, width) {};

    VIS.InvoicesWidget.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };

})(VIS, jQuery);
