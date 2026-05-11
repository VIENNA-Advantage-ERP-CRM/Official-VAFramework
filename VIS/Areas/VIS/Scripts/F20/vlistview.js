; (function (VIS, $) {

    /**
     * List view — sibling of Card view with grouping removed and a
     * width-driven layout: cards stack vertically (single column) when narrow;
     * each card collapses to a single horizontal row when wide.
     *
     * Reuses AD_CardView metadata (template, included columns, conditions) and
     * the VCard renderer exposed by vcardview.js. A tab opts into List view via
     * AD_Tab.TabLayout = 'L'.
     */
    function VListView() {

        this.cCols = [];
        this.cConditions = [];
        this.mTab = null;
        this.AD_Window_ID = null;
        this.AD_Tab_ID = null;
        this.fields = [];
        this.cardID = 0;
        this.editID = 0;
        this.AD_CardView_ID = null;
        this.cardName = null;
        this.headerItems = {};
        this.headerStyle = null;
        this.headerPadding = null;
        this.onCardEdit = null;
        this.cardViewData = null;
        this.isFixedBody = true;
        // Read by cardviewdialog.js to know whether the active card template
        // already has explicit included columns vs. falling back to defaults.
        this.hasIncludedCols = false;

        this.cards = [];

        var root, body;
        var self = this;

        function init() {
            root = $("<div class='vis-lv-body vis-noselect'>");
            body = $("<div class='vis-lv-main'>").css('overflow', 'unset');
           // body.closest('.').css('padding', '0 0 0 2px');
            root.append(body);
        }
        init();

        this.getRoot = function () { return root; };
        this.getBody = function () { return body; }; 

        this.sizeChanged = function (h, w) {
            //var isComposite = this.aPanel && this.aPanel.gridWindow
            //    && this.aPanel.gridWindow.getIsCompositeView
            //    && this.aPanel.gridWindow.getIsCompositeView();
            //if (isComposite) {
            //    root.closest('.vis-gc-vcard').css('height', 'auto');
            //    root.css('height', 'auto');
            //} else {
                root.height((h - 12) + 'px');
            //}
            this.calculateWidth(w);
        };

        this.setBusy = function (isBusy) {
            if (this.aPanel) {
                this.aPanel.setBusy(false);
            }
        };

        // Layout mode is driven by the right-aligned tab panel's open/closed
        // state: when it's open the cards revert to the original stacked
        // multi-row card layout (so they fit the narrowed area without text
        // collisions); when it's closed they collapse to single-row list mode.
        // Width is used only as a fallback when no tab panel exists.
        this.calculateWidth = function (width) {
            var w = width || body.width();
            var listMode;
            if (this.hasRightTabPanel()) {
                listMode = !this.isRightTabPanelOpen();
            } else {
                listMode = w >= VListView.LIST_MODE_THRESHOLD;
            }
            root.toggleClass('vis-lv-listmode', listMode);
            this.navigate();
            this.scheduleOverflowPrune();

            // Honor the same fixed/auto-height behavior as the card view.
            var prnt = this.getRoot().parent();
            prnt.css('height', '100%');
            if (!this.isFixedBody) {
                prnt.height(this.getBody()[0].scrollHeight + 52);
            }
        };

        // Hide whole cells that don't fully fit in the row. CSS gives every
        // cell its natural content width; this pass walks each card's leaf
        // cells left-to-right and toggles display:none on the first cell
        // whose right edge would extend past the row's usable area (and on
        // every cell after it). When list mode is off, any prior hides are
        // restored so the multi-row card template renders normally.
        // Coalesce repeated calls (resize, tab toggle, refresh) into a single
        // rAF tick so the work stays smooth.
        var prunePending = false;
        this.scheduleOverflowPrune = function () {
            if (prunePending || !root || !body) return;
            prunePending = true;
            var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
            raf(function () {
                prunePending = false;
                if (!root || !body) return;
                self.pruneOverflowingCells();
            });
        };

        this.pruneOverflowingCells = function () {
            if (!body || !body[0]) return;
            var listMode = root.hasClass('vis-lv-listmode');
            var cards = body[0].querySelectorAll('div.vis-cv-card');
            for (var c = 0; c < cards.length; c++) {
                pruneCard(cards[c], listMode);
            }
        };

        // Reserved on the right edge of each row for the absolutely-positioned
        // edit pencil so a cell never tucks underneath it. Includes a small
        // safety margin.
        var PENCIL_RESERVE_PX = 40;
        // Must match the gap declared on the inner template wrapper in
        // VISAD.css (.vis-lv-listmode ... [class*="...fg_card-container_"]).
        var CELL_GAP_PX = 12;

        function pruneCard(card, listMode) {
            var cells = card.querySelectorAll('.vis-w-p-card-data-f');
            if (!cells.length) return;
            // Always reset visibility before measuring (and before bailing in
            // card mode) so card mode never inherits a stale display:none.
            for (var i = 0; i < cells.length; i++) {
                cells[i].style.display = '';
            }
            if (!listMode) return;

            var cardRect = card.getBoundingClientRect();
            if (cardRect.width <= 0) return;
            var available = cardRect.width - PENCIL_RESERVE_PX;

            // Read each cell's natural content width. The .vis-lv-measuring
            // class on the card makes cells revert from `flex: 1 1 0` (equal
            // share) to `flex: 0 0 auto` (natural). The browser doesn't paint
            // mid-function, so users never see the intermediate layout.
            card.classList.add('vis-lv-measuring');
            var natWidths = new Array(cells.length);
            for (var m = 0; m < cells.length; m++) {
                natWidths[m] = cells[m].offsetWidth;
            }
            card.classList.remove('vis-lv-measuring');

            // Largest N where the widest cell among cells[0..N-1] still fits
            // in (available - gaps) / N. Visible cells share width equally
            // because of flex: 1 1 0, so all cells must fit the same share.
            var visible = cells.length;
            while (visible > 1) {
                var perCell = (available - (visible - 1) * CELL_GAP_PX) / visible;
                var maxNat = 0;
                for (var i = 0; i < visible; i++) {
                    if (natWidths[i] > maxNat) maxNat = natWidths[i];
                }
                if (maxNat <= perCell) break;
                visible--;
            }

            // Hide trailing cells that can't fit. The first cell is always
            // kept — an empty row is worse than a wide first cell.
            for (var h = visible; h < cells.length; h++) {
                cells[h].style.display = 'none';
            }
        }

        // Locate the right-aligned (vertical) tab panel for the current grid.
        // When both bottom and right panels exist, vTabPanel itself is the
        // bottom panel and the right one lives on .specialObj. When only one
        // exists, vTabPanel is that one — distinguished by isHorizontalAligned.
        this.getRightTabPanel = function () {
            var gc = this.aPanel && this.aPanel.curGC;
            if (!gc || !gc.vTabPanel) return null;
            var tp = gc.vTabPanel;
            if (tp.specialObj) return tp.specialObj;
            return tp.isHorizontalAligned ? null : tp;
        };

        this.hasRightTabPanel = function () {
            return !!this.getRightTabPanel();
        };

        this.isRightTabPanelOpen = function () {
            var rtp = this.getRightTabPanel();
            return !!(rtp && !rtp.isClosed);
        };

        // Card-view dialog API. cardviewdialog.js reads/calls these on
        // whatever instance lives at gc.vCardView, so the list view must
        // expose the same surface as VCardView even though it has no
        // grouping or per-tab card combobox.
        this.getAD_CardView_ID = function () {
            return this.AD_CardView_ID;
        };

        this.getField_Group_ID = function () {
            return 0;
        };

        body.on('mousedown touchstart', 'div.vis-cv-card', function (e) {
            if (!self.onCardEdit) {
                return;
            }
            var d = $(e.target);
            var s;
            if (d[0].nodeName == 'SPAN' && d.hasClass('vis-cv-card-edit')) {
                s = d.data('recid');
                if (s || s === 0) {
                    self.editID = s;
                    self.onCardEdit({ 'recid': s });
                }
            }
            else {
                var i = 0;
                while (!d.hasClass('vis-cv-card')) {
                    if (i > 5) break;
                    d = d.parent();
                    i++;
                }
                s = d.data('recid');
                if (s || s === 0) {
                    self.onCardEdit({ 'recid': s }, true);
                    self.navigate(s, false, true);
                }
            }
            e.stopPropagation();
        });

        var curCard = null;
        var crid = null;
        this.navigate = function (rid, oset, skipScroll) {
            if (rid)
                crid = rid;
            if (oset)
                return;

            if (curCard && curCard.length > 0)
                curCard.toggleClass("vis-cv-card-selected");

            curCard = body.find('div.vis-cv-card[name~=vc_' + crid + ']');
            if (curCard.length != 0) {
                curCard.toggleClass("vis-cv-card-selected");
                if (!skipScroll)
                    curCard[0].scrollIntoView();
            }
        };

        this.disposeCards = function () {
            while (this.cards.length > 0) {
                var c = this.cards.pop();
                if (c && c.dispose) c.dispose();
            }
            body.empty();
        };

        this.dC = function () {
            body.off('mousedown touchstart');
            this.onCardEdit = null;

            this.disposeCards();

            if (root) root.remove();
            root = body = null;

            this.getRoot = this.getBody = this.dC = null;
            curCard = null;
            this.cCols.length = 0;
            this.cConditions.length = 0;
            this.mTab = null;
            this.fields.length = 0;
            self = null;
        };
    }

    /**
     * Width threshold (px) at which the list view collapses each card into a
     * single horizontal row. Below this, cards keep their multi-row template.
     */
    VListView.LIST_MODE_THRESHOLD = 720;

    VListView.prototype.tableModelChanged = function (action, args, actionIndexOrId) {
        var id = null;
        if (action === VIS.VTable.prototype.ROW_REFRESH) {
            id = args.recid ? args.recid : args;
        }
        else if (action === VIS.VTable.prototype.ROW_UNDO) {
            this.getBody().find('div.vis-cv-card[name~=vc_' + args + ']').remove();
        }
        else if (action === VIS.VTable.prototype.ROW_DELETE) {
            var argsL = args.slice();
            while (argsL.length > 0) {
                var recid = argsL.pop();
                this.getBody().find('div.vis-cv-card[name~=vc_' + recid + ']').remove();
            }
            if (isNaN(actionIndexOrId)) {
                id = actionIndexOrId[0];
            }
        }
        else if (action === VIS.VTable.prototype.ROW_ADD) {
            id = args.recid;
        }

        if (id) {
            if (args) {
                this.replaceCard(args, id);
            }
            this.navigate(id, null, null);
        }
    };

    /**
     * Replace card after data change so dynamic conditions re-evaluate.
     */
    VListView.prototype.replaceCard = function (rec, id) {
        rec.recid = id;
        var fieldStyles = {};
        var changeCard = new VIS.VCard(this.fields, rec, this.headerItems, this.headerStyle, this.headerPadding, this.mTab.getWindowNo(), fieldStyles, this.aPanel);
        changeCard.addStyleToDom();
        this.getRoot().find("[name='vc_" + id + "']").replaceWith(changeCard.getRoot());
        changeCard.evaluate(this.cConditions);
        if (this.scheduleOverflowPrune) this.scheduleOverflowPrune();
    };

    /**
     * Initial setup. Drop-in replacement for VCardView.setupCardView so that
     * GridController can swap one for the other based on AD_Tab.IsListView.
     */
    VListView.prototype.setupCardView = function (aPanel, mTab, container, vListId) {
        this.mTab = mTab;
        this.aPanel = aPanel;
        if (mTab.vo && mTab.vo.DefaultCardID) {
            this.cardID = mTab.vo.DefaultCardID;
        } else {
            this.setCardViewData();
        }
        container.append(this.getRoot());
    };

    VListView.prototype.setIsFixedBody = function (fixed) {
        this.isFixedBody = fixed;
    };

    VListView.prototype.resetCard = function () {
        this.disposeCards();
        this.editID = 0;
    };

    /**
     * Read the card template metadata returned for the tab and build the
     * fields/conditions/header lists. Grouping fields are intentionally
     * ignored — list view does not group.
     */
    VListView.prototype.setCardViewData = function (retData) {
        this.hasIncludedCols = false;
        this.fields = [];
        this.cConditions = [];
        this.headerItems = {};

        if (retData) {
            this.AD_CardView_ID = retData.AD_CardView_ID;
            this.cardName = retData.Name;
            this.cConditions = retData.Conditions || [];
            this.headerItems = retData.HeaderItems;
            this.headerStyle = retData.Style;
            this.headerPadding = retData.Padding;

            var cols = retData.IncludedCols || [];
            for (var i = 0; i < cols.length; i++) {
                var f = this.mTab.getFieldById(cols[i].AD_Field_ID);
                if (f) {
                    f.setCardViewSeqNo(cols[i].SeqNo);
                    f.setCardFieldStyle(cols[i].HTMLStyle);
                    this.fields.push(f);
                    this.hasIncludedCols = true;
                }
            }
        }

        // Fallback: if no template, show Name / Description / Help.
        if (this.fields.length < 1) {
            var f = this.mTab.getField('Name');
            if (f) this.fields.push(f);
            f = this.mTab.getField('Description');
            if (f) this.fields.push(f);
            f = this.mTab.getField('Help');
            if (f) this.fields.push(f);
        }

        this.isProcessed = false;
    };

    /**
     * Switch to a different card-view template. Mirrors VCardView.getCardViewData
     * but skips the per-tab combobox (the list view has no card dropdown).
     * Triggered by cardviewdialog.js after the user picks/saves a card.
     */
    VListView.prototype.getCardViewData = function (mTab, cardID, cardName) {
        this.cardID = cardID;
        this.cardName = cardName || this.cardName;
        this.mTab.getTableModel().setCardID(cardID);
        this.aPanel.curGC.query(this.mTab.getOnlyCurrentDays(), 0, false);
    };

    /**
     * Pull the latest card template from the table model and re-render.
     */
    VListView.prototype.refreshUI = function (width) {
        var temp = this.mTab.getTableModel().getCardTemplate();
        this.setCardViewData(temp);
        this.refresh(width);
    };

    /**
     * Render all cards stacked into the body. No grouping.
     */
    VListView.prototype.refresh = function (width) {
        var $this = this;
        window.setTimeout(function () {
            if (width == 0) {
                width = $this.getBody().width();
            }

            $this.resetCard();

            var records = $this.mTab.getTableModel().mSortList;
            var body = $this.getBody();
            var fieldStyles = {};
            var windowNo = $this.aPanel.curTab.getWindowNo();

            if (records && records.length > 0) {
                for (var i = 0; i < records.length; i++) {
                    var card = new VIS.VCard($this.fields, records[i], $this.headerItems, $this.headerStyle, $this.headerPadding, windowNo, fieldStyles, $this.aPanel);
                    if (i === 0) {
                        card.addStyleToDom();
                    }
                    $this.cards.push(card);
                    body.append(card.getRoot());
                    card.evaluate($this.cConditions);
                }

                if ($this.editID == 0 && $this.onCardEdit) {
                    $this.onCardEdit({ 'recid': body.find(".vis-cv-card:first").attr('data-recid') }, true);
                }
                $this.editID = 0;
            }

            $this.calculateWidth(width);

           

            if ($this.aPanel) {
                $this.aPanel.setBusy(false);
            }
        }, 10);
    };

    VListView.prototype.dispose = function () {
        this.dC();
    };

    VIS.VListView = VListView;

}(VIS, jQuery));
