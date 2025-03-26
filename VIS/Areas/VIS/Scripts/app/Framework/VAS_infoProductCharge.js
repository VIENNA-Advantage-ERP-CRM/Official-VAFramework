
/********************************************************
 * Module Name    :     Application
 * Purpose        :     Generate Product info.
 * Author         :     Bharat
 * Date           :     01-May-2015
  ******************************************************/
; (function (VIS, $) {
    function VAS_infoProductCharge(modal, WindowNo, M_Warehouse_ID, M_PriceList_ID, value, tableName, keyColumn, multiSelection, validationCode, selectedIDs) {

        this.onClose = null;
        this.selectedIDs = selectedIDs;

        var inforoot = $("<div>");
        var subroot = $("<div class='vis-info-subroot'>");
        var searchTab = null;
        var searchSec = null;
        var datasec = null;
        var btnsec = null;
        var refreshtxt = null;
        var addCatTxt = null;
        var showSavedTxt = null;
        var showScanTxt = null;
        var showCartTxt = null;
        var canceltxt = null;
        var Oktxt = null;
        var divbtnRight = null;
        var divbtnsec = null;
        var btnScanFile = null;
        var btnShowSaved = null;
        var btnShowCart = null;
        var btnAddCart = null;
        var btnCancel = null;
        var btnOK = null;
        var divbtnLeft = null;
        var btnRequery = null;
        var bsyDiv = null;
        var srchCtrls = [];
        var displayCols = null;
        var dGrid = null;
        var self = this;
        var keyCol = '';
        var window_ID = 0;
        var multiValues = [], multiAttr = [];
        var windowName = null;
        var grdname = null;
        var lblValuetxt = null;
        var lblNametxt = null;
        var lblUPCtxt = null;
        var lblSKUtxt = null;
        var lblWarehousetxt = null;
        var lblPriceListtxt = null;
        var lblAttributeSet = null;
        var lblAttrSetInstance = null;
        var lblAttrCodeText = null;
        var cmbAttributeSet = null;
        var $AttrSetInstControl = null;
        var _AttrSetInstLookUp = null;
        var SubGridCol = [];
        var SubGridArray = [];
        var format = VIS.DisplayType.GetNumberFormat(VIS.DisplayType.Amount);
        var dotFormatter = VIS.Env.isDecimalPoint();
        var label = null;
        var ctrl = null;
        var cmbWarehoue = null;
        var cmbPriceList = null;
        var tableSArea = $("<table>");
        var tr = null;
        var lstWarehouse = null;
        var lstPriceList = null;
        var M_PriceList_Version_ID = null;
        var infoLines = [];
        var savedProduct = [];
        var refreshUI = false;
        var updating = false;
        var ismobile = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
        var chkDelCart = false;
        var invCount_ID = 0;
        var validation = null;
        var $productAttribute = null;
        var pattrLookup = null;
        //Paging
        var divPaging, ulPaging, liFirstPage, liPrevPage, liCurrPage, liNextPage, liLastPage, cmbPage, liPageNo;
        var $spanPageResult = null;
        var showText = VIS.Msg.getMsg("ShowingResult");
        var ofText = VIS.Msg.getMsg("of");
        var $statusDiv;
        var alength = 0, TotalPages = 0, insertedCount = 0, noCount = 0, saveCount = 500;
        var errorMsgKeys = [];
        var errorMsgProds = [];
        var variantRecords = [];
        var uomArray = [];
        var infoMultipleLineSave = [];

        function initializeComponent() {
            SubGridCol = [];
            SubGridCol.push({ field: 'WareHouse', caption: VIS.Msg.getMsg('Warehouse'), size: '150px' },
                { field: 'Variant', caption: VIS.Msg.getMsg('Variant'), size: '150px' },
                { field: 'Quantity', caption: VIS.Msg.getMsg('Quantity'), size: '100px', editable: { type: 'float' }, render: 'number:1' },
                { field: 'Available', caption: VIS.Msg.getElement(VIS.Env.getCtx(), 'QtyAvailable'), size: '100px' },
                { field: 'OnHand', caption: VIS.Msg.getElement(VIS.Env.getCtx(), 'QtyOnHand'), size: '100px' },
                { field: 'Reserved', caption: VIS.Msg.getElement(VIS.Env.getCtx(), 'QtyReserved'), size: '100px' },
                { field: 'Ordered', caption: VIS.Msg.getElement(VIS.Env.getCtx(), 'QtyOrdered'), size: '100px' },
                { field: 'M_Warehouse_ID', caption: 'WareHouse ID', size: '150px', hidden: true },
                { field: 'M_AttributeSetInstance_ID', caption: 'M_AttributeSetInstance_ID', size: '150px', hidden: true },
                { field: 'M_Product_ID', caption: 'M_Product_ID', size: '150px', hidden: true },
                { field: 'ParentRec_ID', caption: 'Parent recid', size: '150px', hidden: true });

            inforoot.css("width", "100%");
            inforoot.css("height", "100%");
            inforoot.css("position", "relative");
            tableSArea.css("width", "100%");

            searchTab = $("<div class='vis-info-l-s-wrap vis-pad-0 vis-leftsidebarouterwrap'>");
            searchSec = $("<div class='vis-info-l-s-content'>");
            searchTab.append(searchSec);
            datasec = $("<div class='vis-info-datasec'>");
            btnsec = $("<div class='vis-info-btnsec'>");

            subroot.append(searchTab);
            subroot.append(datasec);
            subroot.append(btnsec);

            if (multiSelection == true && self.selectedIDs != null && self.selectedIDs.length > 0) {
                multiValues = self.selectedIDs.split(',').map(Number);
                ctrlValue = null;
            }

            lblValuetxt = VIS.Msg.getMsg("Value");
            if (lblValuetxt.indexOf('&') > -1) {
                lblValuetxt = lblValuetxt.replace('&', '');
            }
            lblNametxt = VIS.Msg.getMsg("Name");
            if (lblNametxt.indexOf('&') > -1) {
                lblNametxt = lblNametxt.replace('&', '');
            }
            lblUPCtxt = VIS.Msg.getMsg("UPC");
            if (lblUPCtxt.indexOf('&') > -1) {
                lblUPCtxt = lblUPCtxt.replace('&', '');
            }
            lblSKUtxt = VIS.Msg.getMsg("SKU");
            if (lblSKUtxt.indexOf('&') > -1) {
                lblSKUtxt = lblSKUtxt.replace('&', '');
            }
            lblWarehousetxt = VIS.Msg.getMsg("Warehouse");
            if (lblWarehousetxt.indexOf('&') > -1) {
                lblWarehousetxt = lblWarehousetxt.replace('&', '');
            }
            lblPriceListtxt = VIS.Msg.getMsg("PriceListVersion");
            if (lblPriceListtxt.indexOf('&') > -1) {
                lblPriceListtxt = lblPriceListtxt.replace('&', '');
            }
            refreshtxt = VIS.Msg.getMsg("Refresh");
            if (refreshtxt.indexOf('&') > -1) {
                refreshtxt = refreshtxt.replace('&', '');
            }
            addCatTxt = VIS.Msg.getMsg("AddCatalog");
            if (addCatTxt.indexOf('&') > -1) {
                addCatTxt = addCatTxt.replace('&', '');
            }
            showSavedTxt = VIS.Msg.getMsg("ShowSaved");
            if (showSavedTxt.indexOf('&') > -1) {
                showSavedTxt = showSavedTxt.replace('&', '');
            }
            showCartTxt = VIS.Msg.getMsg("ShowCart");
            if (showCartTxt.indexOf('&') > -1) {
                showCartTxt = showCartTxt.replace('&', '');
            }
            showScanTxt = VIS.Msg.getMsg("ShowScan");
            if (showScanTxt.indexOf('&') > -1) {
                showScanTxt = showScanTxt.replace('&', '');
            }
            canceltxt = VIS.Msg.getMsg("Cancel");
            if (canceltxt.indexOf('&') > -1) {
                canceltxt = canceltxt.replace('&', '');
            }
            Oktxt = VIS.Msg.getMsg("Ok");
            if (Oktxt.indexOf('&') > -1) {
                Oktxt = Oktxt.replace('&', '');
            }

            lblAttributeSet = VIS.Msg.getElement(VIS.Env.getCtx(), "M_AttributeSet_ID");
            if (lblAttributeSet.indexOf('&') > -1) {
                lblAttributeSet = lblAttributeSet.replace('&', '');
            }
            lblAttrSetInstance = VIS.Msg.getElement(VIS.Env.getCtx(), "M_AttributeSetInstance_ID");
            if (lblAttrSetInstance.indexOf('&') > -1) {
                lblAttrSetInstance = lblAttrSetInstance.replace('&', '');
            }
            lblAttrCodeText = VIS.Msg.getMsg("AttrCode");
            if (lblAttrCodeText.indexOf('&') > -1) {
                lblAttrCodeText = lblAttrCodeText.replace('&', '');
            }

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblValuetxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            var srchCtrl = {};

            ctrl = new VIS.Controls.VTextBox("Value", false, false, true, 50, 100, null, null, false);
            srchCtrl.Ctrl = ctrl;
            srchCtrl.AD_Reference_ID = 10;
            srchCtrl.ColumnName = "Value";
            var tdctrl = $("<td>");
            Leftformfieldctrlwrp.append(ctrl.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblNametxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            ctrl = new VIS.Controls.VTextBox("Name", false, false, true, 50, 100, null, null, false);
            srchCtrl.Ctrl = ctrl;
            srchCtrl.AD_Reference_ID = 10;
            srchCtrl.ColumnName = "Name";
            ctrl.setValue(value);
            var tdctrl = $("<td>");
            //tr.append(tdctrl);
            Leftformfieldctrlwrp.append(ctrl.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblUPCtxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            ctrl = new VIS.Controls.VTextBox("UPC", false, false, true, 50, 100, null, null, false);
            srchCtrl.Ctrl = ctrl;
            srchCtrl.AD_Reference_ID = 10;
            srchCtrl.ColumnName = "UPC";
            Leftformfieldctrlwrp.append(ctrl.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblSKUtxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            ctrl = new VIS.Controls.VTextBox("SKU", false, false, true, 50, 100, null, null, false);
            srchCtrl.Ctrl = ctrl;
            srchCtrl.AD_Reference_ID = 10;
            srchCtrl.ColumnName = "SKU";
            var tdctrl = $("<td>");
            Leftformfieldctrlwrp.append(ctrl.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblWarehousetxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            cmbWarehoue = new VIS.Controls.VComboBox("M_Warehouse_ID", false, false, true, null, 50);
            srchCtrl.Ctrl = cmbWarehoue;
            srchCtrl.AD_Reference_ID = VIS.DisplayType.tableDir;
            srchCtrl.ColumnName = "M_Warehouse_ID";
            var tdctrl = $("<td>");
            tr.append(tdctrl);
            Leftformfieldctrlwrp.append(cmbWarehoue.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblPriceListtxt);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            cmbPriceList = new VIS.Controls.VComboBox("M_PriceList_Version_ID", false, false, true, null, 50);
            srchCtrl.Ctrl = cmbPriceList;
            srchCtrl.AD_Reference_ID = VIS.DisplayType.tableDir;
            srchCtrl.ColumnName = "M_PriceList_Version_ID";
            var tdctrl = $("<td>");
            Leftformfieldctrlwrp.append(cmbPriceList.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblAttrCodeText);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};

            ctrl = new VIS.Controls.VTextBox("AttributeCode", false, false, true, 50, 100, null, null, false);
            srchCtrl.Ctrl = ctrl;
            srchCtrl.AD_Reference_ID = 10;
            srchCtrl.ColumnName = "AttributeCode";
            var tdctrl = $("<td>");
            Leftformfieldctrlwrp.append(ctrl.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblAttributeSet);
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);

            srchCtrl = {};
            cmbAttributeSet = new VIS.Controls.VComboBox("M_AttributeSet_ID", false, false, true, null, 50);
            srchCtrl.Ctrl = cmbAttributeSet;
            srchCtrl.AD_Reference_ID = VIS.DisplayType.tableDir;
            srchCtrl.ColumnName = "M_AttributeSet_ID";
            var tdctrl = $("<td>");
            Leftformfieldctrlwrp.append(cmbAttributeSet.getControl().attr('data-placeholder', '').attr('placeholder', ' '));
            Leftformfieldctrlwrp.append(label);
            srchCtrls.push(srchCtrl);

            tr = $("<tr>");
            tableSArea.append(tr);
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            tr.append(td);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);
            LoadAttributeControl();

            searchSec.append(tableSArea);
            divbtnRight = $("<div class='vis-info-btnswrap'>");

            divbtnsec = $("<div class='vis-info-ls-btnswrap'>");
            btnCancel = $("<button class='VIS_Pref_btn-2'>").append(canceltxt);
            btnOK = $("<button disabled='true' style='cursor:default;opacity:.5' class='VIS_Pref_btn-2'>").append(Oktxt);
            btnAddCart = $("<button class='VIS_Pref_btn-2'>").append($("<i class='fa fa-cart-plus'></i>"));
            btnShowSaved = $("<button class='VIS_Pref_btn-2' disabled>").append($("<i class='fa fa-list-ul'></i>"));
            btnScanFile = $("<button class='VIS_Pref_btn-2'>").append($("<i class='vis vis-scanner'>"));
            btnShowCart = $("<button class='VIS_Pref_btn-2'>").append($("<i class='fa fa-shopping-cart'></i>"));

            divbtnLeft = $("<div class='vis-info-btnleft'>");
            btnRequery = $("<button class='VIS_Pref_btn-2' style='margin-top: 10px;'>").append($("<i class='vis vis-refresh'></i>"))//.append(refreshtxt);

            //PagingCtrls
            divPaging = $('<div class="vis-info-pagingwrp">');
            createPageSettings();
            divPaging.append(ulPaging);

            divbtnRight.append(btnCancel);
            divbtnRight.append(btnOK);
            divbtnRight.append(btnShowSaved);
            divbtnRight.append(btnAddCart);
            divbtnsec.append(btnScanFile);
            divbtnsec.append(btnShowCart);
            searchTab.append(divbtnsec);
            divbtnLeft.append(btnRequery);

            btnsec.append(divbtnLeft);
            btnsec.append(divPaging);
            btnsec.append(divbtnRight);

            //Busy Indicator
            bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
            bsyDiv[0].style.visibility = "visible";


            inforoot.append(subroot);
            inforoot.append(bsyDiv);
        };

        function LoadAttributeControl() {
            var srchCtrl = {};
            tr.empty();
            var _WhereAttr = " M_AttributeSetInstance_ID IN (SELECT  asi.M_AttributeSetInstance_ID as M_AttributeSetInstance_ID   FROM M_AttributeSetInstance asi   WHERE asi.IsActive='Y' AND asi.M_ATTRIBUTESET_ID=" + cmbAttributeSet.ctrl.val() + ")";
            _AttrSetInstLookUp = VIS.MLookupFactory.get(VIS.Env.getCtx(), WindowNo, 8472, VIS.DisplayType.Search, "M_AttributeSetInstance_ID", 0, false, _WhereAttr);
            $AttrSetInstControl = new VIS.Controls.VTextBoxButton("M_AttributeSetInstance_ID", false, false, true, VIS.DisplayType.Search, _AttrSetInstLookUp);
            $AttrSetInstControl.getControl();
            srchCtrl.Ctrl = $AttrSetInstControl;
            srchCtrl.AD_Reference_ID = VIS.DisplayType.Search;
            srchCtrl.ColumnName = "M_AttributeSetInstance_ID";
            var td = $("<td>");
            var Leftformfieldwrp = $('<div class="input-group vis-input-wrap">');
            var Leftformfieldctrlwrp = $('<div class="vis-control-wrap">');
            var Leftformfieldbtnwrap = $('<div class="input-group-append">');
            label = $("<label class='VIS_Pref_Label_Font'>").append(lblAttrSetInstance);
            td.append(Leftformfieldwrp);
            Leftformfieldwrp.append(Leftformfieldctrlwrp);
            Leftformfieldwrp.append(Leftformfieldbtnwrap);

            Leftformfieldctrlwrp.append($AttrSetInstControl.getControl().attr('data-placeholder', '').attr('placeholder', ' ').attr('data-hasbtn', ' '));
            Leftformfieldbtnwrap.append($AttrSetInstControl.getBtn(0));
            Leftformfieldbtnwrap.append($AttrSetInstControl.getBtn(1));
            Leftformfieldctrlwrp.append(label);

            srchCtrls.push(srchCtrl);
        };

        initializeComponent();
        InitInfo(M_Warehouse_ID, M_PriceList_ID);

        var AD_tab_ID = VIS.context.getWindowTabContext(WindowNo, 0, "AD_Tab_ID");
        window_ID = VIS.dataContext.getJSONRecord("InfoProduct/GetWindowID", AD_tab_ID.toString());
        windowName = VIS.context.getContext(WindowNo, "ScreenName");

        if (window_ID == 146 || windowName == "VAS_PriceList") {

        }
        else if (VIS.context.getContextAsInt(WindowNo, VIS.context.getWindowTabContext(WindowNo, 1, "KeyColumnName")) != 0) {
            updating = true;
        }
        if (!multiSelection || updating) {
            btnAddCart.hide();
            btnShowSaved.hide();
            btnScanFile.hide();
            btnShowCart.hide();
        }

        function bindEvent() {
            if (!VIS.Application.isMobile) {
                inforoot.on('keyup', function (e) {
                    if (!(e.keyCode === 13)) {
                        return;
                    }
                    bsyDiv[0].style.visibility = 'visible';
                    if (validationCode != null && validationCode.length > 0) {
                        validation = VIS.Env.parseContext(VIS.Env.getCtx(), WindowNo, validationCode, false, false);
                    }
                    displayData(true, cmbPage.val());
                    if (SubGridArray.length > 0) {
                        for (var i = 0; i < SubGridArray.length; i++) {
                            w2ui["subgrid-" + SubGridArray[i]].destroy();
                        }
                        SubGridArray = [];
                    }
                });
            }

            btnScanFile.on("click", function () {
                btnScanClick();
            });

            btnShowCart.on("click", function () {
                btnShowCartClick();
            });

            btnAddCart.on("click", function () {
                btnAddCartClick();
            });

            btnShowSaved.on("click", function () {
                bsyDiv[0].style.visibility = 'visible';
                btnShowSavedClick();
            });

            btnCancel.on("click", function () {
                if (self.onClose != null) {
                    self.onClose();
                }
                disposeComponent();
            });

            btnOK.on("click", function () {
                btnOKClick();
            });
            btnRequery.on("click", function () {
                validation = null;
                if (multiSelection && !updating) {
                    btnAddCart.show();
                }
                if (infoLines.length == 0) {
                    btnShowSaved.prop('disabled', true);
                }
                multiValues = [];
                bsyDiv[0].style.visibility = 'visible';
                if (validationCode != null && validationCode != undefined && validationCode.length > 0) {
                    validation = VIS.Env.parseContext(VIS.Env.getCtx(), WindowNo, validationCode, false, false);
                }
                displayData(true, 1);
                if (SubGridArray.length > 0) {
                    for (var i = 0; i < SubGridArray.length; i++) {
                        w2ui["subgrid-" + SubGridArray[i]].destroy();
                    }
                    SubGridArray = [];
                }
            });

            cmbAttributeSet.ctrl.change(function () {
                $AttrSetInstControl = null;
                _AttrSetInstLookUp = null;
                for (var i = 0; i < srchCtrls.length; i++) {
                    if (srchCtrls[i].Ctrl.colName == "M_AttributeSetInstance_ID") {
                        srchCtrls.splice(i);
                    }
                }
                LoadAttributeControl();
            });
        };

        bindEvent();

        function InitInfo(M_Warehouse_ID, M_PriceList_ID) {
            pattrLookup = new VIS.MPAttributeLookup(VIS.context, WindowNo);
            $productAttribute = new VIS.Controls.VPAttribute("M_AttributeSetInstance_ID", false, false, true, VIS.DisplayType.PAttribute, pattrLookup, WindowNo, false, false, false, true);
            cmbWarehoue.ctrl.append($('<Option value="' + 0 + '">' + "" + '</option>'));
            cmbPriceList.ctrl.append($('<Option value="' + 0 + '">' + "" + '</option>'));
            cmbAttributeSet.ctrl.append($('<Option value="' + 0 + '">' + "" + '</option>'));
            lstWarehouse = jQuery.parseJSON(lstWarehouse);
            lstPriceList = jQuery.parseJSON(lstPriceList);
            if (M_PriceList_ID == 0) {
                M_PriceList_ID = GetDefaultPriceList();
            }
            M_PriceList_Version_ID = FindPLV(VIS.Env.getCtx(), WindowNo, M_PriceList_ID);
            GetWarehouse();
        }

        function GetUOMS() {
            try {
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetUOM", "", LoadUOMCallBack);
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function GetWarehouse() {
            try {
                var dr = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetWarehouse", null, null);
                GetWarehouseCallBack(dr);
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function GetWarehouseCallBack(data) {
            var key, value;
            if (data.length > 0) {
                for (var i in data) {
                    key = VIS.Utility.Util.getValueOfInt(data[i]["M_Warehouse_ID"]);
                    value = VIS.Utility.Util.getValueOfString(data[i]["Name"]);
                    cmbWarehoue.getControl().append(" <option value=" + key + ">" + value + "</option>");
                    if (key == M_Warehouse_ID) {
                        cmbWarehoue.ctrl.val(M_Warehouse_ID);
                    }
                }

                // if no login or default warehouse found then set first warehouse by default.
                if (M_Warehouse_ID == 0) {
                    cmbWarehoue.ctrl.val(VIS.Utility.Util.getValueOfInt(data[0]["M_Warehouse_ID"]));
                }
            }
            GetPriceList(M_PriceList_ID);
        }

        function toggleOkBtn(disable) {
            if (disable) {
                btnOK.prop('disabled', 'true').css({ "cursor": "default", "opacity": ".5" });
            }
            else {
                btnOK.prop('disabled', '').css({ "cursor": "pointer", "opacity": "1" });
            }
        };

        // function to check comma or dot from given value and return new value
        function checkcommaordot(event, val) {
            var foundComma = false;
            event.value_new = VIS.Utility.Util.getValueOfString(val);
            if (event.value_new.contains(".")) {
                foundComma = true;
                var indices = [];
                for (var i = 0; i < event.value_new.length; i++) {
                    if (event.value_new[i] === ".")
                        indices.push(i);
                }
                if (indices.length > 1) {
                    event.value_new = removeAllButLast(event.value_new, '.');
                }
            }
            if (event.value_new.contains(",")) {
                if (foundComma) {
                    event.value_new = removeAllButLast(event.value_new, ',');
                }
                else {
                    var indices = [];
                    for (var i = 0; i < event.value_new.length; i++) {
                        if (event.value_new[i] === ",")
                            indices.push(i);
                    }
                    if (indices.length > 1) {
                        event.value_new = removeAllButLast(event.value_new, ',');
                    }
                    else {
                        event.value_new = event.value_new.replace(",", ".");
                    }
                }
            }
            if (event.value_new == "") {
                event.value_new = "0";
            }
            return event.value_new;
        };

        // Remove all seperator but only bring last seperator
        function removeAllButLast(amt, seprator) {
            var parts = amt.split(seprator);
            amt = parts.slice(0, -1).join('') + '.' + parts.slice(-1);
            if (amt.indexOf('.') == (amt.length - 1)) {
                amt = amt.replace(".", "");
            }
            return amt;
        };

        function GetDefaultPriceList() {
            var retValue = 0;
            try {
                var data = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetDefaultPriceList", null, null);
                if (data != null) {
                    retValue = data;
                }
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
            return retValue;
        }

        function GetPriceList(PriceList) {
            try {
                var dr = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetPriceList", { "PriceList": PriceList }, null);
                PriceListCallBack(dr);
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function PriceListCallBack(data) {
            var key, value;
            if (data.length > 0) {
                for (var i in data) {
                    key = VIS.Utility.Util.getValueOfInt(data[i]["M_PriceList_Version_ID"]);
                    value = VIS.Utility.Util.getValueOfString(data[i]["Name"]);
                    cmbPriceList.getControl().append(" <option value=" + key + ">" + value + "</option>");
                    if (key == M_PriceList_Version_ID) {
                        cmbPriceList.ctrl.val(M_PriceList_Version_ID);
                    }
                }
            }
            GetAttributeSet();
        }

        function GetAttributeSet() {
            try {
                VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetAttributeSet", null, GetAttributeSetCallBack);
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function GetAttributeSetCallBack(data) {
            var key, value;
            if (data.length > 0) {
                for (var i in data) {
                    key = VIS.Utility.Util.getValueOfInt(data[i]["M_AttributeSet_ID"]);
                    value = VIS.Utility.Util.getValueOfString(data[i]["Name"]);
                    cmbAttributeSet.getControl().append(" <option value=" + key + ">" + value + "</option>");
                }
            }
        }

        function FindPLV(ctx, p_WindowNo, M_PriceList_ID) {
            var priceDate = null;
            var retValue = 0;
            var dateStr = ctx.getContext(p_WindowNo, "DateOrdered");

            if (dateStr != null && dateStr.Length > 0) {
                priceDate = System.Convert.ToDateTime(VIS.Env.parseContext(VIS.Env.getCtx(), WindowNo, "DateOrdered", false, false));
            }
            else {
                dateStr = ctx.getContext(p_WindowNo, "DateInvoiced");
                if (dateStr != null && dateStr.Length > 0) {
                    priceDate = System.Convert.ToDateTime(VIS.Env.parseContext(VIS.Env.getCtx(), WindowNo, "DateInvoiced", false, false));
                }
            }
            //	Today 
            if (priceDate == null) {
                var d = new Date();
                priceDate = VIS.Utility.Util.getValueOfDate(d);
            }

            // Added by Bharat on 31 May 2017 to remove client side queries
            try {
                var data = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/GetPriceListVersion", { "PriceList": M_PriceList_ID }, null);
                if (data.length > 0) {
                    for (var i in data) {
                        var version_ID = VIS.Utility.Util.getValueOfInt(data[i]["M_PriceList_Version_ID"]);
                        var validFrom = VIS.Utility.Util.getValueOfString(data[i]["ValidFrom"]);
                        if (priceDate > validFrom) {
                            retValue = version_ID;
                        }
                    }
                    if (retValue == 0) {
                        retValue = VIS.Utility.Util.getValueOfInt(data[0]["M_PriceList_Version_ID"]);
                    }
                }
            }
            catch (e) {
                console.log(e);
                bsyDiv[0].style.visibility = "hidden";
            }
            return retValue;
        }

        function btnShowCartClick() {
            chkDelCart = false;
            invCount_ID = 0;
            var obj = new VIS.InfoScanForm(WindowNo, true);
            obj.showDialog();
            obj.onClose = function (drProd, chk, count_ID) {
                bsyDiv[0].style.visibility = "visible";
                window.setTimeout(function () {
                    chkDelCart = chk;
                    invCount_ID = count_ID;
                    var session = VIS.Env.getCtx().getContext("#AD_Session_ID");
                    if (drProd && drProd.length > 0) {
                        for (var i in drProd) {
                            var prodName = "";
                            var uom = "";
                            var attr_ID = 0;
                            var uom_ID = 0;
                            var qty = drProd[i]["VAICNT_Quantity"];
                            var _prodVID = drProd[i]["VAS_Product_V_ID"];
                            var _productChargeID = drProd[i]["VAS_ProductCharge_ID"];
                            var _productType = drProd[i]["ProductType"];
                            var value = drProd[i]["Value"];
                            attr_ID = drProd[i]["M_AttributeSetInstance_ID"];
                            var attrName = drProd[i]["Description"];
                            var countID = drProd[i]["VAICNT_InventoryCountLine_ID"];
                            prodName = drProd[i]["Name"];
                            uom = drProd[i]["UOM"];
                            uom_ID = drProd[i]["C_UOM_ID"];

                            // Reference Line ID will be Orderline and Requisitionline only in case of Reference no and for M_Inout table and Internal use Inventory and InventoryMove
                            var RefLineID = drProd[i]["LineID"];

                            if (qty > 0) {
                                if (infoLines.length > 0) {
                                    // Consolidate quantity based on 4 parameters Product, UOM , Attribute Set Instance and Line ID
                                    var removeIndex = infoLines.map(function (i) { return i._prdCrgID == _prodVID && i._Attribute == attr_ID && i._uom == uom_ID && i._refLineID == RefLineID; }).indexOf(true);
                                    if (removeIndex > -1) {
                                        infoLines[removeIndex]._prodQty += qty;
                                    }
                                    else {
                                        infoLines.push({
                                            _prodQty: qty,
                                            _prdCrgID: _prodVID,
                                            _prdID: _productChargeID,
                                            _prodType: _productType,
                                            _prdName: prodName,
                                            _value: value,
                                            _uom: uom_ID,
                                            _uomName: uom,
                                            _AD_Session_ID: session,
                                            _windowNo: WindowNo,
                                            _RefNo: "",
                                            _Attribute: attr_ID,
                                            _AttributeName: attrName,
                                            _Locator_ID: 0,
                                            _IsLotSerial: "N",
                                            _countID: countID,
                                            _refLineID: RefLineID
                                        });
                                    }
                                }
                                else {
                                    infoLines.push({
                                        _prodQty: qty,
                                        _prdCrgID: _prodVID,
                                        _prdID: _productChargeID,
                                        _prodType: _productType,
                                        _prdName: prodName,
                                        _value: value,
                                        _uom: uom_ID,
                                        _uomName: uom,
                                        _AD_Session_ID: session,
                                        _windowNo: WindowNo,
                                        _RefNo: "",
                                        _Attribute: attr_ID,
                                        _AttributeName: attrName,
                                        _Locator_ID: 0,
                                        _IsLotSerial: "N",
                                        _countID: countID,
                                        _refLineID: RefLineID
                                    });
                                }
                                multiAttr[attr_ID] = attrName;
                            }
                        }
                    }
                    btnShowSavedClick();
                }, 200);
            };
        };

        var btnScanClick = function () {
            chkDelCart = false;
            invCount_ID = 0;
            var obj = new VIS.InfoScanForm(WindowNo, false);
            obj.showDialog();
            obj.onClose = function (drProd, chk, count_ID) {
                bsyDiv[0].style.visibility = "visible";
                chkDelCart = chk;
                invCount_ID = count_ID;
                var session = VIS.Env.getCtx().getContext("#AD_Session_ID");
                if (drProd && drProd.length > 0) {
                    for (var i in drProd) {
                        var prodName = "";
                        var uom = "";
                        var uom_ID = 0;
                        var attr_ID = drProd[i]["M_AttributeSetInstance_ID"];
                        var attrName = drProd[i]["Description"];
                        var countID = drProd[i]["VAICNT_InventoryCountLine_ID"];
                        var qty = drProd[i]["VAICNT_Quantity"];
                        var M_Product_ID = drProd[i]["M_Product_ID"];
                        var value = drProd[i]["Value"];
                        prodName = drProd[i]["Name"];
                        uom = drProd[i]["UOM"];
                        uom_ID = drProd[i]["C_UOM_ID"];
                        var RefNo = drProd[i]["VAICNT_ReferenceNo"];
                        if (RefNo == "") {
                            RefNo = "null";
                        }
                        // Reference Line ID will be Orderline and Requisitionline only in case of Reference no and for M_Inout table and Internal use Inventory and InventoryMove
                        var RefLineID = drProd[i]["LineID"];

                        if (qty > 0) {
                            if (infoLines.length > 0) {
                                var removeIndex = infoLines.map(function (i) { return i._prdID == M_Product_ID && i._Attribute == attr_ID && i._uom == uom_ID && i._refLineID == RefLineID; }).indexOf(true);
                                if (removeIndex > -1) {
                                    infoLines[removeIndex]._prodQty += qty;
                                }
                                else {
                                    infoLines.push({
                                        _prodQty: qty,
                                        _prdCrgID: M_Product_ID,
                                        _prdID: M_Product_ID,
                                        _prodType: "P",
                                        _prdName: prodName,
                                        _value: value,
                                        _uom: uom_ID,
                                        _uomName: uom,
                                        _AD_Session_ID: session,
                                        _windowNo: WindowNo,
                                        _RefNo: RefNo,
                                        _Attribute: attr_ID,
                                        _AttributeName: attrName,
                                        _Locator_ID: 0,
                                        _IsLotSerial: "N",
                                        _countID: countID,
                                        _refLineID: RefLineID
                                    });
                                }
                            }
                            else {
                                infoLines.push({
                                    _prodQty: qty,
                                    _prdCrgID: M_Product_ID,
                                    _prdID: M_Product_ID,
                                    _prodType: "P",
                                    _prdName: prodName,
                                    _value: value,
                                    _uom: uom_ID,
                                    _uomName: uom,
                                    _AD_Session_ID: session,
                                    _windowNo: WindowNo,
                                    _RefNo: RefNo,
                                    _Attribute: attr_ID,
                                    _AttributeName: attrName,
                                    _Locator_ID: 0,
                                    _IsLotSerial: "N",
                                    _countID: countID,
                                    _refLineID: RefLineID
                                });
                            }
                            multiAttr[attr_ID] = attrName;
                        }
                    }
                }
                btnShowSavedClick();
            };
        };

        var btnAddCartClick = function () {
            bsyDiv[0].style.visibility = "visible";
            saveSelection();
            displayData(true, cmbPage.val());
            if (SubGridArray.length > 0) {
                for (var i = 0; i < SubGridArray.length; i++) {
                    w2ui["subgrid-" + SubGridArray[i]].destroy();
                }
                SubGridArray = [];
            }
            if (infoLines.length > 0) {
                btnShowSaved.prop('disabled', false);
            }
            else {
                btnShowSaved.prop('disabled', true);
            }
            multiValues = [];
        };

        var btnShowSavedClick = function () {
            var ProdCrgID = [];
            var prodID = [];
            var prodType = [];
            var value = [];
            var qty = [];
            var prodName = [];
            var uomID = [];
            var uom = [];
            var Attribute = [];
            var AttributeName = [];
            var ReferenceNo = [];
            savedProduct = [];
            btnAddCart.hide();
            for (var item in infoLines) {
                ProdCrgID.push(infoLines[item]._prdCrgID);
                prodID.push(infoLines[item]._prdID);
                prodType.push(infoLines[item]._prodType);
                prodName.push(infoLines[item]._prdName);
                value.push(infoLines[item]._value);
                qty.push(infoLines[item]._prodQty);
                ReferenceNo.push(infoLines[item]._RefNo);
                Attribute.push(infoLines[item]._Attribute);
                AttributeName.push(infoLines[item]._AttributeName);
                uomID.push(infoLines[item]._uom);
                uom.push(infoLines[item]._uomName);
            }
            if (prodID.length > 0) {
                for (var i = 0; i < prodID.length; i++) {
                    savedProduct.push(
                        {
                            SrNo: i,
                            ProdCrgID: ProdCrgID[i],
                            Product: prodName[i],
                            ProductType: prodType[i],
                            Value: value[i],
                            QtyEntered: qty[i],
                            UOM_ID: uomID[i],
                            UOM: uom[i],
                            M_Product_ID1: prodID[i],
                            Attribute: Attribute[i],
                            AttributeName: AttributeName[i],
                            RefNo: ReferenceNo[i]
                        }
                    );
                }
                BindGridSavedProducts();
            }
            bsyDiv[0].style.visibility = "hidden";
        };

        function LoadUOMCallBack(data) {
            var key, value;
            if (data.length > 0) {
                for (var i in data) {
                    key = VIS.Utility.Util.getValueOfInt(data[i]["C_UOM_ID"]);
                    value = VIS.Utility.Util.getValueOfString(data[i]["Name"]);
                    uomArray.push({ id: key, text: value });
                }
            }
        };

        function BindGridSavedProducts() {
            if (dGrid != null) {
                dGrid.destroy();
                dGrid = null;
            }
            var grdRows = [];
            for (var j = 0; j < savedProduct.length; j++) {
                var row = {};
                row["Product"] = savedProduct[j].Product;
                row["Value"] = savedProduct[j].Value;
                row["QtyEntered"] = savedProduct[j].QtyEntered;
                row["UOM"] = savedProduct[j].UOM;
                row["Attribute"] = savedProduct[j].Attribute;
                row["ProdID"] = savedProduct[j].M_Product_ID1;
                row["ProductType"] = savedProduct[j].ProductType;
                row['recid'] = j + 1;
                grdRows[j] = row;
            }
            grdname = 'gridsavedprd' + Math.random();
            grdname = grdname.replace('.', '');
            w2utils.encodeTags(grdRows);
            dGrid = $(datasec).w2grid({
                name: grdname,
                recordHeight: 40,
                show: {

                    toolbar: false,  // indicates if toolbar is v isible
                    columnHeaders: true,   // indicates if columns is visible
                    lineNumbers: false,  // indicates if line numbers column is visible
                    selectColumn: true,  // indicates if select column is visible
                    toolbarReload: false,   // indicates if toolbar reload button is visible
                    toolbarColumns: true,   // indicates if toolbar columns button is visible
                    toolbarSearch: false,   // indicates if toolbar search controls are visible
                    toolbarAdd: false,   // indicates if toolbar add new button is visible
                    toolbarDelete: false,   // indicates if toolbar delete button is visible
                    toolbarSave: false,   // indicates if toolbar save button is visible
                    selectionBorder: false,	 // display border arround selection (for selectType = 'cell')
                    recordTitles: false	 // indicates if to define titles for records
                },
                columns: [
                    { field: "Value", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("ProductSearchKey") + '</span></div>', sortable: false, size: '120px', min: 100, hidden: false },
                    { field: "Product", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("Product") + '</span></div>', sortable: false, size: '20%', min: 150, hidden: false },
                    {
                        field: "QtyEntered", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("Quantity") + '</span></div>', sortable: false, size: '70px', min: 60, hidden: false, editable: { type: 'float' },
                        render: function (record, index, colIndex) {
                            var val = VIS.Utility.Util.getValueOfDecimal(record["QtyEntered"]);
                            return (val).toLocaleString();
                        }
                    },
                    { field: "UOM", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("UomName") + '</span></div>', sortable: false, size: '70px', min: 60, hidden: false },
                    {
                        field: "Attribute", caption: VIS.Msg.getMsg("Attribute"), sortable: false, size: '20%', min: 150, hidden: false, editable: { type: 'custom', ctrl: $productAttribute, showAll: true },
                        render: function (record, index, col_index) {
                            var l = pattrLookup;
                            var val = record["Attribute"];
                            var d = multiAttr[val];
                            if (!d && val > 0) {
                                d = l.getDisplay(val, true);
                                multiAttr[val] = d;
                            }
                            return d;
                        }
                    },
                    {
                        field: "Delete", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("DeleteActivity") + '</span></div>', sortable: false, size: '60px', min: 40, hidden: false,
                        render: function () { return '<div class="vis-info-grid-icowrap"><i class="vis vis-delete title="Delete record" style="opacity: 1;"></i></div>'; }
                    },
                    {
                        field: "Copy", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("Copy") + '</span></div>', sortable: false, size: '60px', min: 40, hidden: false,
                        render: function () { return '<div class="vis-info-grid-icowrap"><i class="vis vis-new title="Copy record" style="opacity: 1;"></i></div>'; }
                    },
                    { field: "ProdID", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("ProdID") + '</span></div>', sortable: false, size: '20%', min: 150, hidden: true },
                    { field: "ProductType", caption: '<div style="text-align: center;" ><span>' + VIS.Msg.getMsg("VIS_Product_Type") + '</span></div>', sortable: false, size: '20%', min: 150, hidden: true }
                ],
                records: grdRows,
                onChange: function (event) {
                    if (event.column == 2) {
                        w2ui[grdname].records[event.index]["QtyEntered"] = event.value_new;
                        infoLines[event.index]._prodQty = event.value_new;
                        savedProduct[event.index].QtyEntered = event.value_new;
                    }
                    else if (event.column == 4) {
                        w2ui[grdname].records[event.index]["Attribute"] = event.value_new;
                        infoLines[event.index]._Attribute = event.value_new;
                        savedProduct[event.index].Attribute = event.value_new;
                    }
                },
                onClick: function (event) {
                    if (event.column == 5 && dGrid.records.length > 0) {
                        bsyDiv[0].style.visibility = "visible";
                        infoLines.splice(event.recid - 1, 1);
                        savedProduct.splice(event.recid - 1, 1);
                        BindDataSavedProduct();
                    }
                    else if (event.column == 6 && dGrid.records.length > 0) {
                        bsyDiv[0].style.visibility = "visible";
                        savedProduct.push(
                            {
                                SrNo: savedProduct.length,
                                ProdCrgID: savedProduct[event.recid - 1].ProdCrgID,
                                Product: savedProduct[event.recid - 1].Product,
                                Value: savedProduct[event.recid - 1].Value,
                                QtyEntered: savedProduct[event.recid - 1].QtyEntered,
                                UOM_ID: savedProduct[event.recid - 1].UOM_ID,
                                UOM: savedProduct[event.recid - 1].UOM,
                                M_Product_ID1: savedProduct[event.recid - 1].M_Product_ID1,
                                ProductType: savedProduct[event.recid - 1].ProductType,
                                Attribute: "",
                                AttributeName: "",
                                RefNo: savedProduct[event.recid - 1].RefNo
                            }
                        );
                        infoLines[infoLines.length] = {
                            _prodQty: savedProduct[savedProduct.length - 1].QtyEntered,
                            _prdCrgID: savedProduct[savedProduct.length - 1].ProdCrgID,
                            _prdID: savedProduct[savedProduct.length - 1].M_Product_ID1,
                            _prodType: savedProduct[savedProduct.length - 1].ProductType,
                            _prdName: savedProduct[savedProduct.length - 1].Product,
                            _value: savedProduct[savedProduct.length - 1].Value,
                            _uom: savedProduct[savedProduct.length - 1].UOM_ID,
                            _uomName: savedProduct[savedProduct.length - 1].UOM,
                            _AD_Session_ID: VIS.Env.getCtx().getContext("#AD_Session_ID"),
                            _windowNo: WindowNo,
                            _RefNo: "",
                            _Attribute: 0,
                            _AttributeName: "",
                            _Locator_ID: 0,
                            _IsLotSerial: "N",
                            _countID: 0
                        };
                        BindDataSavedProduct();
                    }
                    else if (event.column == 4 && dGrid.records.length > 0) {
                        VIS.Env.getCtx().setContext(WindowNo, "M_Product_ID", VIS.Utility.Util.getValueOfInt(savedProduct[event.recid - 1].M_Product_ID1));
                    }
                },
                onSelect: onSelectRow,
                onUnselect: onUnSelectRow
            });
            bsyDiv[0].style.visibility = "hidden";
        };

        function onSelectRow(e) {
            toggleOkBtn(false);
        };

        function onUnSelectRow(e) {
            if (!multiSelection) {
                toggleOkBtn(true);
                return;
            }
            window.setTimeout(function () {
                if (w2ui[e.target].getSelection().length == 0)
                    toggleOkBtn(true);
            }, 50);
        };

        // Bind data into Saved Product Grid
        function BindDataSavedProduct() {
            dGrid.clear();
            var grdRows = [];
            for (var j = 0; j < savedProduct.length; j++) {
                var row = {};
                row["Product"] = savedProduct[j].Product;
                row["Value"] = savedProduct[j].Value;
                row["QtyEntered"] = savedProduct[j].QtyEntered;
                row["UOM"] = savedProduct[j].UOM;
                row["Attribute"] = savedProduct[j].Attribute;
                row["ProdID"] = savedProduct[j].M_Product_ID1;
                row['recid'] = j + 1;
                grdRows[j] = row;
            }

            if (grdRows.length > 0) {
                w2utils.encodeTags(grdRows);
                dGrid.add(grdRows);
            }
            bsyDiv[0].style.visibility = "hidden";
        }

        var btnOKClick = function () {
            bsyDiv[0].style.visibility = "visible";
            if (multiSelection && infoLines.length > 0 && btnAddCart.css("display") == "none") {
                multiValues = [];
                var grdSel = w2ui[grdname].getSelection();
                var selectedItems = infoLines;
                if (grdSel.length > 0) {
                    selectedItems = [];
                    for (var i = 0; i < grdSel.length; i++) {
                        var prodID = w2ui[grdname].records[grdSel[i] - 1].ProdID;
                        var attrID = w2ui[grdname].records[grdSel[i] - 1].Attribute;
                        selectedItems.push($.grep(infoLines, function (e) { return e._prdID == prodID && e._Attribute == attrID; })[0]);
                    }
                    infoLines = selectedItems;
                }
                SaveProducts(infoLines);
            }
            else {
                if (multiSelection && w2ui[grdname].getSelection().length > 1 && btnAddCart.css("display") == "block") {
                    infoMultipleLineSave = GetMultipleSelectionSave();
                    SaveProducts(infoMultipleLineSave);
                }
                else {
                    multiValues = [];
                    var selection = w2ui[grdname].getSelection();
                    for (item in selection) {
                        if (multiValues.indexOf(w2ui[grdname].get(selection[item])[keyCol]) == -1) {
                            multiValues.push(w2ui[grdname].get(selection[item])[keyCol]);
                        }
                    }
                    bsyDiv[0].style.visibility = "hidden";
                    if (self.onClose != null) {
                        self.onClose();
                    }
                    disposeComponent();
                }
            }
        };

        // Method to get array of rows selected from main grid in case of multiple selection and insertion.
        var GetMultipleSelectionSave = function () {
            var selection = w2ui[grdname].getSelection();
            var selectedItems;
            if (selection.length > 0) {
                selectedItems = [];
                for (var i = 0; i < selection.length; i++) {
                    if (w2ui[grdname].records[selection[i] - 1].QTYENTERED > 0) {
                        var product_ID = w2ui[grdname].records[selection[i] - 1].VAS_ProductCharge_ID;
                        var attribute_ID = w2ui[grdname].records[selection[i] - 1].M_AttributeSetInstance_ID;
                        if (selectedItems.length > 0) {
                            var removeIndex = selectedItems.map(function (i) { return i._prdID == product_ID && i._Attribute == attribute_ID; }).indexOf(true);
                            if (removeIndex > -1) {
                                selectedItems[removeIndex]._prodQty += qty;
                            }
                            else {
                                selectedItems.push(
                                    {
                                        _prodQty: w2ui[grdname].records[selection[i] - 1].QTYENTERED,
                                        _prdVID: w2ui[grdname].records[selection[i] - 1].VAS_PRODUCT_V_ID,
                                        _prdID: w2ui[grdname].records[selection[i] - 1].VAS_PRODUCTCHARGE_ID,
                                        _prodType: w2ui[grdname].records[selection[i] - 1].PRODUCTTYPE,
                                        _prdName: w2ui[grdname].records[selection[i] - 1].NAME,
                                        _value: w2ui[grdname].records[selection[i] - 1].NAME,
                                        _uom: w2ui[grdname].records[selection[i] - 1].C_UOM_ID,
                                        _uomName: w2ui[grdname].records[selection[i] - 1].UOM,
                                        _AD_Session_ID: VIS.Env.getCtx().getContext("#AD_Session_ID"),
                                        _windowNo: WindowNo,
                                        _RefNo: "",
                                        _Attribute: w2ui[grdname].records[selection[i] - 1].M_AttributeSetInstance_ID,
                                        _AttributeName: "",
                                        _Locator_ID: 0,
                                        _IsLotSerial: "N",
                                        _countID: 0
                                    }
                                )
                            }
                        }
                        else {
                            selectedItems.push(
                                {
                                    _prodQty: w2ui[grdname].records[selection[i] - 1].QTYENTERED,
                                    _prdVID: w2ui[grdname].records[selection[i] - 1].VAS_PRODUCT_V_ID,
                                    _prdID: w2ui[grdname].records[selection[i] - 1].VAS_PRODUCTCHARGE_ID,
                                    _prodType: w2ui[grdname].records[selection[i] - 1].PRODUCTTYPE,
                                    _prdName: w2ui[grdname].records[selection[i] - 1].NAME,
                                    _value: w2ui[grdname].records[selection[i] - 1].NAME,
                                    _uom: w2ui[grdname].records[selection[i] - 1].C_UOM_ID,
                                    _uomName: w2ui[grdname].records[selection[i] - 1].UOM,
                                    _AD_Session_ID: VIS.Env.getCtx().getContext("#AD_Session_ID"),
                                    _windowNo: WindowNo,
                                    _RefNo: "",
                                    _Attribute: w2ui[grdname].records[selection[i] - 1].M_AttributeSetInstance_ID,
                                    _AttributeName: "",
                                    _Locator_ID: 0,
                                    _IsLotSerial: "N",
                                    _countID: 0
                                }
                            )
                        }
                    }
                }
            }
            return selectedItems;
        };

        // change function to display message after completion of save
        function saveComplete(success, extraMsg, count) {
            bsyDiv[0].style.visibility = "hidden";
            // if success, then refresh grid.
            if (success) {
                refreshUI = true;
            }
            if (self.onClose != null) {
                self.onClose();
            }
            disposeComponent();

            var msg = VIS.Msg.getMsg("RecSaved");
            if (!success) {
                if (count > 0) {
                    msg = count + " " + VIS.Msg.getMsg("RecordsNotSaved");
                }
                else
                    msg = VIS.Msg.getMsg("ErrorInSaving");
            }
            if (extraMsg && extraMsg != "")
                msg += ", " + extraMsg;

            VIS.ADialog.info("", true, msg);
        };

        function SaveProducts(pqtyAll) {
            var recordID = 0;
            var keycolName = "";
            var lineID = 0;
            var lineName = "";
            var M_Locator_ID = 0;
            var M_LocatorTo_ID = 0;
            var id = 0, lineid = 0;

            var prodContainerID = 0;
            var prodContainerToID = 0;

            M_Locator_ID = VIS.Utility.Util.getValueOfInt(VIS.context.getWindowContext(WindowNo, "M_Locator_ID", true));
            recordID = VIS.context.getContextAsInt(WindowNo, VIS.context.getWindowTabContext(WindowNo, 0, "KeyColumnName"));
            keycolName = VIS.context.getWindowTabContext(WindowNo, 0, "KeyColumnName");

            lineID = VIS.context.getContextAsInt(WindowNo, VIS.context.getWindowTabContext(WindowNo, 1, "KeyColumnName"));
            lineName = VIS.context.getWindowTabContext(WindowNo, 1, "KeyColumnName");

            prodContainerID = VIS.Utility.Util.getValueOfInt(VIS.context.getWindowContext(WindowNo, "M_ProductContainer_ID", true));

            if (window_ID == 170 || windowName == "VAS_InventoryMove") {
                M_LocatorTo_ID = VIS.Utility.Util.getValueOfInt(VIS.context.getWindowContext(WindowNo, "M_LocatorTo_ID", true));
                prodContainerToID = VIS.Utility.Util.getValueOfInt(VIS.context.getWindowContext(WindowNo, "Ref_M_ProductContainerTo_ID", true));
            }

            if (window_ID == 146 || windowName == "VAS_PriceList") {
                recordID = VIS.context.getContextAsInt(WindowNo, VIS.context.getWindowTabContext(WindowNo, 1, "KeyColumnName"));
                lineID = 0;
            }

            id = VIS.Utility.Util.getValueOfInt(recordID);
            lineid = VIS.Utility.Util.getValueOfInt(lineID);
            var prdCrgID = [];
            var prodID = [];
            var prodType = [];
            var qty = [];
            var Attr = [];
            var uoms = [];
            var RefNo = [];
            var listAst = [];
            var IsLotSerial = [];
            var Count_ID = [];

            if (infoLines.length > 0 && btnAddCart.css("display") == "none") {
                for (var item in infoLines) {
                    prdCrgID.push(infoLines[item]._prdCrgID);
                    prodID.push(infoLines[item]._prdID);
                    prodType.push(infoLines[item]._prodType);
                    qty.push(infoLines[item]._prodQty);
                    RefNo.push(infoLines[item]._RefNo);
                    listAst.push(infoLines[item]._Attribute);
                    uoms.push(infoLines[item]._uom);
                    Count_ID.push(infoLines[item]._countID);
                    if (lineid != 0) {
                        break;
                    }
                }
                alength = infoLines.length;
            }
            else {
                for (var item in infoMultipleLineSave) {
                    prdCrgID.push(infoLines[item]._prdCrgID);
                    prodID.push(infoMultipleLineSave[item]._prdID);
                    prodType.push(infoMultipleLineSave[item]._prodType);
                    qty.push(infoMultipleLineSave[item]._prodQty);
                    RefNo.push(infoMultipleLineSave[item]._RefNo);
                    listAst.push(infoMultipleLineSave[item]._Attribute);
                    uoms.push(infoMultipleLineSave[item]._uom);
                    Count_ID.push(infoMultipleLineSave[item]._countID);
                    if (lineid != 0) {
                        break;
                    }
                }
                alength = infoMultipleLineSave.length;
            }
            TotalPages = alength % saveCount == 0 ? alength / saveCount : Math.ceil(alength / saveCount);
            if (TotalPages == 1) {
                if (keycolName == "SAP001_StockTransfer_ID") {
                    $.ajax({
                        type: "POST",
                        url: VIS.Application.contextUrl + "InfoProduct/SaveStockTfr",
                        dataType: "json",
                        data: {
                            id: id,
                            keyColumn: keycolName,
                            AD_Table_ID: VIS.context.getWindowTabContext(WindowNo, 1, "AD_Table_ID"),
                            prod: JSON.stringify(prodID),
                            C_UOM_ID: JSON.stringify(uoms),
                            listAst: JSON.stringify(listAst),
                            qty: JSON.stringify(qty),
                            locatorTo: M_LocatorTo_ID,
                            lineID: lineid,
                            ContainerID: prodContainerID
                        },
                        success: function (data) {
                            var returnValue = data.result;
                            if (returnValue) {
                                return;
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            bsyDiv[0].style.visibility = "hidden";
                            console.log(textStatus);
                            if (returnValue) {
                                return;
                            }
                        }
                    });
                }
                else {
                    $.ajax({
                        type: "POST",
                        url: VIS.Application.contextUrl + "InfoProduct/SaveData",
                        dataType: "json",
                        data: {
                            id: id,
                            keyColumn: keycolName,
                            prodChrg: JSON.stringify(prdCrgID),
                            prod: JSON.stringify(prodID),
                            prdType: JSON.stringify(prodType),
                            C_UOM_ID: JSON.stringify(uoms),
                            listAst: JSON.stringify(listAst),
                            qty: JSON.stringify(qty),
                            locatorTo: M_LocatorTo_ID,
                            lineID: lineid,
                            InvCountID: JSON.stringify(Count_ID),
                            ReferenceNo: JSON.stringify(RefNo),
                            Locator_ID: M_Locator_ID,
                            WindowID: window_ID,
                            WindowName: windowName,
                            ContainerID: prodContainerID,
                            ContainerToID: prodContainerToID
                        },
                        success: function (data) {
                            var returnValue = JSON.parse(data);
                            if (returnValue.count == 0) {
                                if (chkDelCart) {
                                    try {
                                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/DeleteCart", { "invCount_ID": invCount_ID }, null);
                                    }
                                    catch (e) {
                                        console.log(e);
                                        saveComplete(true, e.message);
                                    }
                                }
                                saveComplete(true);
                                return;
                            }
                            else {
                                setErrorMessage(returnValue);
                                saveComplete(false, getErrorMessage(), returnValue.count);
                                return;
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            bsyDiv[0].style.visibility = "hidden";
                            console.log(textStatus);
                        }
                    });
                }
            }
            else {
                saveProductPaging(id, keycolName, lineid, prodID, qty, Attr, uoms, RefNo, listAst, M_Locator_ID, M_LocatorTo_ID, IsLotSerial, Count_ID, prodContainerID, prodContainerToID);
            }
        }

        function saveProductPaging(id, keycolName, lineid, prodID, qty, Attr, uoms, RefNo, listAst, M_Locator_ID, M_LocatorTo_ID, IsLotSerial, Count_ID, prodContainerID, prodContainerToID) {
            var $status = inforoot.find('.filestatuscounter');
            if ($status.text() != "") {
                if (TotalPages == insertedCount) {
                    $status.text((alength) + " Records Inserted..Please Wait..!!");
                }
                else {
                    $status.text(((insertedCount * saveCount) - noCount) + " Records Inserted..Please Wait..!!");
                }
            }
            else {
                createStatusIndicator((insertedCount * saveCount));
            }
            if (keycolName == "SAP001_StockTransfer_ID") {
                $.ajax({
                    type: "POST",
                    url: VIS.Application.contextUrl + "InfoProduct/SaveStockTfr",
                    dataType: "json",
                    data: {
                        id: id,
                        keyColumn: keycolName,
                        AD_Table_ID: VIS.context.getWindowTabContext(WindowNo, 1, "AD_Table_ID"),
                        prod: JSON.stringify(prodID.splice(0, saveCount)),
                        C_UOM_ID: JSON.stringify(uoms.splice(0, saveCount)),
                        listAst: JSON.stringify(listAst.splice(0, saveCount)),
                        qty: JSON.stringify(qty.splice(0, saveCount)),
                        locatorTo: M_LocatorTo_ID,
                        lineID: lineid,
                        ContainerID: prodContainerID
                    },
                    success: function (data) {
                        var returnValue = data.result;
                        if (returnValue) {
                            return;
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        bsyDiv[0].style.visibility = "hidden";
                        console.log(textStatus);
                        if (returnValue) {
                            return;
                        }
                    }
                });
            }
            else {
                $.ajax({
                    type: "POST",
                    url: VIS.Application.contextUrl + "InfoProduct/Save",
                    dataType: "json",
                    data: {
                        id: id,
                        keyColumn: keycolName,
                        prod: JSON.stringify(prodID.splice(0, saveCount)),
                        C_UOM_ID: JSON.stringify(uoms.splice(0, saveCount)),
                        listAst: JSON.stringify(listAst.splice(0, saveCount)),
                        qty: JSON.stringify(qty.splice(0, saveCount)),
                        locatorTo: M_LocatorTo_ID,
                        lineID: lineid,
                        InvCountID: JSON.stringify(Count_ID.splice(0, saveCount)),
                        ReferenceNo: RefNo,
                        Locator_ID: M_Locator_ID,
                        WindowID: window_ID,
                        WindowName: windowName,
                        ContainerID: prodContainerID,
                        ContainerToID: prodContainerToID
                    },
                    success: function (data) {
                        var returnValue = JSON.parse(data);
                        insertedCount++;
                        if (TotalPages == insertedCount) {
                            if (noCount == 0) {
                                if (chkDelCart) {
                                    try {
                                        VIS.dataContext.getJSONData(VIS.Application.contextUrl + "InfoProduct/DeleteCart", { "invCount_ID": invCount_ID }, null);
                                    }
                                    catch (e) {
                                        console.log(e);
                                        saveComplete(true, e.message);
                                    }
                                }
                                saveComplete(true);
                                return;
                            }
                            else {
                                setErrorMessage(returnValue);
                                noCount += returnValue.count;
                                saveComplete(false, getErrorMessage(), noCount);
                                return;
                            }
                        }
                        else {
                            if (returnValue.count == 0) {
                            }
                            else {
                                setErrorMessage(returnValue);
                                noCount += returnValue.count;
                            }
                            saveProductPaging(id, keycolName, lineid, prodID, qty, Attr, uoms, RefNo, listAst, M_Locator_ID, M_LocatorTo_ID, IsLotSerial, Count_ID, prodContainerID, prodContainerToID)
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        bsyDiv[0].style.visibility = "hidden";
                        console.log(textStatus);
                    }
                });
            }
        };

        function getErrorMessage() {
            var errorMsg = "";
            if (errorMsgKeys.length > 0) {
                for (var i = 0; i < errorMsgKeys.length; i++) {
                    if (i != 0)
                        errorMsg += " ::: "
                    errorMsg += errorMsgKeys[i] + " --> " + errorMsgProds[i];
                }
            }
            errorMsgKeys = [];
            errorMsgProds = [];
            return errorMsg;
        };

        function setErrorMessage(retVal) {
            if (retVal.errorKeys.length > 0) {
                if (errorMsgKeys.length > 0) {
                    for (var i = 0; i < retVal.errorKeys.length; i++) {
                        var ind = errorMsgKeys.indexOf(retVal.errorKeys[i]);
                        if (ind >= 0) {
                            errorMsgProds[ind] = errorMsgProds[ind] + ", " + retVal.errorProds[i];
                        }
                        else {
                            errorMsgKeys.push(retVal.errorKeys[i]);
                            errorMsgProds.push(retVal.errorProds[i]);
                        }
                    }
                }
                else {
                    errorMsgKeys = retVal.errorKeys;
                    errorMsgProds = retVal.errorProds;
                }
            }
            else {
                errorMsgKeys.push(retVal.error);
            }
        };

        function onClosing() {
            if (self.onClose != null) {
                self.onClose();
            }
            disposeComponent();
        };

        this.show = function () {
            $.ajax({
                url: VIS.Application.contextUrl + "InfoProduct/GetColumnsInfo",
                dataType: "json",
                error: function () {
                    alert(VIS.Msg.getMsg('ERRORGettingSearchCols'));
                    bsyDiv[0].style.visibility = "hidden";
                },
                success: function (data) {
                    displayCols = jQuery.parseJSON(data);
                    if (displayCols == null) {
                        alert(VIS.Msg.getMsg('ERRORGettingSearchCols'));
                        bsyDiv[0].style.visibility = "hidden";
                        return;
                    }
                    inforoot.dialog({
                        width: 1020,
                        height: 500,
                        title: VIS.Msg.getMsg("InfoProduct"),
                        resizable: false,
                        modal: true,
                        closeText: VIS.Msg.getMsg("close"),
                        close: onClosing
                    });
                    if (validationCode != null && validationCode.length > 0) {
                        validation = VIS.Env.parseContext(VIS.Env.getCtx(), WindowNo, validationCode, false, false);
                    }
                    displayData(true, cmbPage.val());
                }
            });
        };

        var displayData = function (requery, pNo) {
            if (multiSelection && w2ui[grdname]) {
                var selection = w2ui[grdname].getSelection();
                for (item in selection) {
                    if (multiValues.indexOf(w2ui[grdname].get(selection[item])[keyCol]) == -1) {
                        multiValues.push(w2ui[grdname].get(selection[item]));
                        toggleOkBtn(false);
                    }
                }
            }
            else {
                toggleOkBtn(true);
            }

            if (requery)
                toggleOkBtn(true);
            disposeDataSec();
            var displayType = 0;
            for (var item in displayCols) {
                displayType = displayCols[item].AD_Reference_ID;
                if (displayType == VIS.DisplayType.ID && displayCols[item].ColumnName.toUpperCase() == "VAS_PRODUCT_V_ID") {
                    keyCol = displayCols[item].ColumnName.toUpperCase();
                }
            }

            if (requery == true) {
                var srchValue = null;
                for (var i = 0; i < srchCtrls.length; i++) {
                    srchValue = srchCtrls[i].Ctrl.getValue();
                    if (srchValue == null || srchValue.length == 0 || srchValue == 0 || !srchValue) {
                        srchCtrls[i]["Value"] = "";
                        continue;
                    }

                    srchCtrls[i]["Value"] = srchValue;
                    srchCtrls[i]["CtrlColumnName"] = srchCtrls[i].Ctrl.colName;

                    if (srchCtrls[i].Ctrl.displayType == 10) {
                        srchValue = VIS.DB.to_string(srchValue);
                    }
                }
            }

            if (!pNo) {
                pNo = 1;
            }

            var srhCtrls = [];
            if (srchCtrls && Object.keys(srchCtrls).length > 0) {
                for (var x = 0; x < Object.keys(srchCtrls).length; x++) {
                    var vals = {};
                    vals.CtrlColumnName = srchCtrls[x].CtrlColumnName;
                    vals.ColumnName = srchCtrls[x].ColumnName;
                    vals.Value = srchCtrls[x].Value;
                    srhCtrls.push(vals);
                }
            }

            $.ajax({
                url: VIS.Application.contextUrl + "InfoProduct/GetColumnsData",
                dataType: "json",
                type: "POST",
                data: {
                    tableName: tableName,
                    pageNo: pNo,
                    ForMobile: ismobile,
                    Requery: requery,
                    SrchCtrl: JSON.stringify(srhCtrls),
                    Validation: VIS.secureEngine.encrypt(validation),
                    Window_ID: window_ID
                },
                error: function () {
                    alert(VIS.Msg.getMsg('ErrorWhileGettingData'));
                    bsyDiv[0].style.visibility = 'hidden';
                    return;
                },
                success: function (dyndata) {
                    var res = JSON.parse(dyndata);
                    if (res == null) {
                        bsyDiv[0].style.visibility = "hidden";
                        return;
                    }
                    if (res.Error) {
                        VIS.ADialog.error(res.Error);
                        bsyDiv[0].style.visibility = "hidden";
                        return;
                    }
                    resetPageCtrls(res.pSetting);
                    loadData(res.data);
                }
            });
        };

        var loadData = function (dynData) {
            if (dynData == null) {
                alert(VIS.Msg.getMsg('NoDataFound'));
                bsyDiv[0].style.visibility = "hidden";
                return;
            }
            var grdCols = [];
            var grdRows = [];
            var displayType = null;

            for (var item in dynData) {
                var oColumn = {
                    resizable: true
                }
                displayType = displayCols[item].AD_Reference_ID;

                oColumn.caption = displayCols[item].Name;
                oColumn.field = displayCols[item].ColumnName.toUpperCase();
                oColumn.columnName = displayCols[item].ColumnName.toUpperCase();
                oColumn.sortable = true;
                oColumn.hidden = false;
                oColumn.size = '100px';

                if (VIS.DisplayType.IsNumeric(displayType)) {

                    if (displayType == VIS.DisplayType.Integer) {
                        oColumn.render = 'int';
                    }
                    else {
                        oColumn.render = function (record, index, colIndex) {
                            var val = VIS.Utility.Util.getValueOfDecimal(record[grdCols[colIndex].field]);
                            return (val).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        };
                    }
                    if (displayCols[item].ColumnName.toUpperCase() == 'QTYENTERED') {
                        if (multiSelection && !updating) {
                            oColumn.editable = {
                                type: 'number'
                            },
                                oColumn.render = function (record, index, colIndex) {
                                    var val = record[grdCols[colIndex].field];
                                    val = checkcommaordot(event, val);
                                    return parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2 });
                                };
                        }
                    }
                }
                else if (VIS.DisplayType.IsDate(displayType)) {
                    oColumn.render = function (record, index, colIndex) {

                        var d = record[grdCols[colIndex].field];
                        if (d) {
                            d = new Date(d).toLocaleDateString();
                        }
                        else d = "";
                        return d;
                    }
                }
                else if (displayType == VIS.DisplayType.Location || displayType == VIS.DisplayType.Locator) {
                    oColumn.render = 'int';
                }
                else if (displayType == VIS.DisplayType.Account) {
                    oColumn.render = 'int';
                }
                else if (displayType == VIS.DisplayType.PAttribute) {
                    oColumn.render = 'int';
                }
                else if (displayType == VIS.DisplayType.Button) {
                    oColumn.render = function (record) {
                        return '<div>button</div>';
                    }
                }
                else if (displayType == VIS.DisplayType.Image) {
                    oColumn.render = function (record) {
                        return '<div>Image</div>';
                    }
                }
                else if (VIS.DisplayType.IsLOB(displayType)) {
                    oColumn.render = function (record) {
                        return '<div>[Lob-blob]</div>';
                    }
                }
                grdCols[item] = oColumn;
            }

            grdCols[grdCols.length] = { field: 'M_AttributeSetInstance_ID', caption: 'M_AttributeSetInstance_ID', size: '150px', hidden: true };

            for (var j = 0; j < dynData[0].RowCount; j++) {
                var row = {};
                for (var item in dynData) {
                    row[dynData[item].ColumnName.toUpperCase()] = dynData[item].Values[j];
                }
                row['M_AttributeSetInstance_ID'] = 0;
                row['recid'] = j + 1;
                grdRows[j] = row;
            }

            if (!multiSelection && (multiValues.length > 0 || (w2ui[grdname] && w2ui[grdname].getSelection().length > 0))) {
                toggleOkBtn(true);
            }

            grdname = 'gridPrdInfodata' + Math.random();
            grdname = grdname.replace('.', '');
            w2utils.encodeTags(grdRows);
            dGrid = $(datasec).w2grid({
                name: grdname,
                recordHeight: 40,
                show: {
                    toolbar: false,  // indicates if toolbar is v isible
                    columnHeaders: true,   // indicates if columns is visible
                    lineNumbers: false,  // indicates if line numbers column is visible
                    selectColumn: true,  // indicates if select column is visible
                    toolbarReload: false,   // indicates if toolbar reload button is visible
                    toolbarColumns: true,   // indicates if toolbar columns button is visible
                    toolbarSearch: false,   // indicates if toolbar search controls are visible
                    toolbarAdd: false,   // indicates if toolbar add new button is visible
                    toolbarDelete: false,   // indicates if toolbar delete button is visible
                    toolbarSave: false,   // indicates if toolbar save button is visible
                    selectionBorder: false,	 // display border arround selection (for selectType = 'cell')
                    recordTitles: false	 // indicates if to define titles for records

                },
                columns: grdCols,
                records: grdRows,

                onExpand: function (event) {
                    bsyDiv[0].style.visibility = 'visible';
                    getVariantData(event);

                    if (w2ui.hasOwnProperty('subgrid-' + event.recid))
                        w2ui['subgrid-' + event.recid].destroy();
                    if (SubGridArray.indexOf(event.recid) == -1) {
                        SubGridArray.push(event.recid);
                    }

                    $('#' + event.box_id).css({ margin: '0px', padding: '0px', width: '100%', height: '105px' });
                    setTimeout(function () {
                        $('#' + event.box_id).w2grid({
                            name: 'subgrid-' + event.recid,
                            show: {
                                columnHeaders: true,
                                selectColumn: true
                            },
                            fixedBody: true,
                            columns: SubGridCol,
                            records: variantRecords,
                            onChange: function (event) {
                                var chk = -1;
                                var ParentRec_ID = w2ui[event.target].records[event.index]["ParentRec_ID"];
                                if (multiValues.length > 0) {
                                    for (var item in multiValues) {
                                        if (multiValues[item].M_PRODUCT_ID == w2ui[grdname].records[ParentRec_ID - 1].M_PRODUCT_ID && multiValues[item].M_AttributeSetInstance_ID == w2ui[event.target].records[event.index]["M_AttributeSetInstance_ID"]) {
                                            chk = item;
                                            break;
                                        }
                                    }
                                    if (chk > -1) {
                                        multiValues[chk].QTYENTERED = event.value_new;
                                    }
                                    else {
                                        var obj = w2ui[grdname].records[ParentRec_ID - 1];
                                        var ObjClone = JSON.parse(JSON.stringify(obj));
                                        ObjClone.M_AttributeSetInstance_ID = w2ui[event.target].records[event.index]["M_AttributeSetInstance_ID"];
                                        ObjClone.QTYENTERED = event.value_new;
                                        multiValues.push(ObjClone);
                                    }
                                }
                                else {
                                    var obj = w2ui[grdname].records[ParentRec_ID - 1];
                                    var ObjClone = JSON.parse(JSON.stringify(obj));
                                    ObjClone.M_AttributeSetInstance_ID = w2ui[event.target].records[event.index]["M_AttributeSetInstance_ID"];
                                    ObjClone.QTYENTERED = event.value_new;
                                    multiValues.push(ObjClone);
                                }
                            },
                        });

                        w2ui['subgrid-' + event.recid].resize();
                        bsyDiv[0].style.visibility = 'hidden';
                    }, 500);
                },

                onEditField: function (event) {
                    id = event.recid;
                    if (event.column == 5) {
                        w2ui[grdname].records[event.index]["QTYENTERED"] = checkcommaordot(event, w2ui[grdname].records[event.index]["QTYENTERED"]);
                        var _value = format.GetFormatAmount(w2ui[grdname].records[event.index]["QTYENTERED"], "init", dotFormatter);
                        w2ui[grdname].records[event.index]["QTYENTERED"] = format.GetConvertedString(_value, dotFormatter);
                        $("#grid_" + dGrid.name + "_rec_" + id).keydown(function (event) {
                            if (!dotFormatter && (event.keyCode == 190 || event.keyCode == 110)) {
                                return false;
                            }
                            else if (dotFormatter && event.keyCode == 188) { // . separator
                                return false;
                            }
                            if (event.target.value.contains(".") && (event.which == 110 || event.which == 190 || event.which == 188)) {
                                if (event.target.value.indexOf('.') > -1) {
                                    event.target.value = event.target.value.replace('.', '');
                                }
                            }
                            else if (event.target.value.contains(",") && (event.which == 110 || event.which == 190 || event.which == 188)) {
                                if (event.target.value.indexOf(',') > -1) {
                                    event.target.value = event.target.value.replace(',', '');
                                }
                            }
                            if (event.keyCode != 8 && event.keyCode != 9 && (event.keyCode < 37 || event.keyCode > 40) &&
                                (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)
                                && event.keyCode != 109 && event.keyCode != 189 && event.keyCode != 110
                                && event.keyCode != 144 && event.keyCode != 188 && event.keyCode != 190) {
                                return false;
                            }
                        });
                    }
                },

                onChange: function (event) {
                    var chk = -1;
                    var _val = format.GetConvertedNumber(event.value_new, dotFormatter);
                    w2ui[grdname].records[event.index]["QTYENTERED"] = _val.toFixed(2);
                    if (multiValues.length > 0) {
                        for (var item in multiValues) {
                            if (multiValues[item].VAS_PRODUCTCHARGE_ID == w2ui[grdname].records[event.index].VAS_PRODUCTCHARGE_ID && multiValues[item].M_AttributeSetInstance_ID == 0) {
                                chk = item;
                                break;
                            }
                        }
                        if (chk > -1) {
                            multiValues[chk].QTYENTERED = _val.toFixed(2);
                        }
                        else {
                            multiValues.push(w2ui[grdname].records[event.index]);
                        }
                    }
                    else {
                        multiValues.push(w2ui[grdname].records[event.index]);
                    }
                },
                onSelect: onSelectRow,
                onUnselect: onUnSelectRow
            });
            w2ui[grdname].hideColumn('VAS_PRODUCT_V_ID');
            w2ui[grdname].hideColumn('PRODUCTTYPE');
            w2ui[grdname].hideColumn('VAS_PRODUCTCHARGE_ID');
            w2ui[grdname].hideColumn('C_UOM_ID');
            w2ui[grdname].hideColumn('UOM');
            w2ui[grdname].hideColumn('M_WAREHOUSE_ID');
            w2ui[grdname].hideColumn('M_PRICELIST_VERSION_ID');
            if (!multiSelection || updating) {
                w2ui[grdname].hideColumn('QTYENTERED');
            }
            bsyDiv[0].style.visibility = "hidden";
        };

        var disposeDataSec = function () {
            if (dGrid != null) {
                dGrid.destroy();
            }
            dGrid = null;
        };

        this.getSelectedValues = function () {
            return multiValues;
        };

        this.getRefreshStatus = function () {
            return refreshUI;
        };

        var saveSelection = function () {
            if (multiSelection && (multiValues.length > 0 || w2ui[grdname].getSelection().length > 0)) {
                GetSelectedRowKeys();
            }
            else {
                return;
            }
        };

        var GetSelectedRowKeys = function () {
            if (w2ui[grdname].getSelection().length > 0) {
                var selection = w2ui[grdname].getSelection();
                for (var item in selection) {
                    var prd = w2ui[grdname].get(selection[item]).VAS_PRODUCTCHARGE_ID;
                    var childgrdname = 'subgrid-' + w2ui[grdname].get(selection[item]).recid;
                    if (w2ui[childgrdname] != undefined) {
                        if (w2ui[childgrdname].getSelection().length > 0) {
                            var ChildSelection = w2ui[childgrdname].getSelection();
                            for (var rec in ChildSelection) {
                                if (multiValues.length > 0) {
                                    var removeIndex = multiValues.map(function (i) { return i.VAS_PRODUCTCHARGE_ID == prd && i.M_AttributeSetInstance_ID == w2ui[childgrdname].records[ChildSelection[rec] - 1].M_AttributeSetInstance_ID; }).indexOf(true);
                                    if (removeIndex > -1) {
                                        continue;
                                    }
                                    else {
                                        var obj = w2ui[grdname].get(selection[item]);
                                        var ObjClone = JSON.parse(JSON.stringify(obj));
                                        ObjClone.M_AttributeSetInstance_ID = w2ui[childgrdname].records[ChildSelection[rec] - 1].M_AttributeSetInstance_ID;
                                        ObjClone.QTYENTERED = w2ui[childgrdname].records[ChildSelection[rec] - 1].Quantity;
                                        multiValues.push(ObjClone);
                                    }
                                }
                                else {
                                    var obj = w2ui[grdname].get(selection[item]);
                                    var ObjClone = JSON.parse(JSON.stringify(obj));
                                    ObjClone.M_AttributeSetInstance_ID = w2ui[childgrdname].records[ChildSelection[rec] - 1].M_AttributeSetInstance_ID;
                                    ObjClone.QTYENTERED = w2ui[childgrdname].records[ChildSelection[rec] - 1].Quantity;
                                    multiValues.push(ObjClone);
                                }
                            }
                        }
                        else {
                            if (multiValues.length > 0) {
                                var removeIndex = multiValues.map(function (i) { return i.VAS_PRODUCTCHARGE_ID == prd && i.M_AttributeSetInstance_ID == 0; }).indexOf(true);
                                if (removeIndex > -1) {
                                    continue;
                                }
                                else {
                                    multiValues.push(w2ui[grdname].get(selection[item]));
                                }
                            }
                            else {
                                multiValues.push(w2ui[grdname].get(selection[item]));
                            }
                        }
                    }
                    else {
                        if (multiValues.length > 0) {
                            var removeIndex = multiValues.map(function (i) { return i.VAS_PRODUCTCHARGE_ID == prd && i.M_AttributeSetInstance_ID == 0; }).indexOf(true);
                            if (removeIndex > -1) {
                                continue;
                            }
                            else {
                                multiValues.push(w2ui[grdname].get(selection[item]));
                            }
                        }
                        else {
                            multiValues.push(w2ui[grdname].get(selection[item]));
                        }
                    }
                }
            }
            if (multiValues.length > 0) {
                for (var item in multiValues) {
                    var qty = multiValues[item].QTYENTERED;
                    if (qty > 0) {
                        if (infoLines.length > 0) {
                            var removeIndex = infoLines.map(function (i) { return i._prdID == multiValues[item].VAS_PRODUCTCHARGE_ID && i._Attribute == multiValues[item].M_AttributeSetInstance_ID; }).indexOf(true);
                            if (removeIndex > -1) {
                                infoLines[removeIndex]._prodQty += qty;
                            }
                            else {
                                infoLines.push(
                                    {
                                        _prodQty: qty,
                                        _prdCrgID: multiValues[item].VAS_PRODUCT_V_ID,
                                        _prdID: multiValues[item].VAS_PRODUCTCHARGE_ID,
                                        _prodType: multiValues[item].PRODUCTTYPE,
                                        _prdName: multiValues[item].NAME,
                                        _value: multiValues[item].VALUE,
                                        _uom: multiValues[item].C_UOM_ID,
                                        _uomName: multiValues[item].UOM,
                                        _AD_Session_ID: VIS.Env.getCtx().getContext("#AD_Session_ID"),
                                        _windowNo: WindowNo,
                                        _RefNo: "",
                                        _Attribute: multiValues[item].M_AttributeSetInstance_ID,
                                        _AttributeName: "",
                                        _Locator_ID: 0,
                                        _IsLotSerial: "N",
                                        _countID: 0
                                    }
                                )
                            }
                        }
                        else {
                            infoLines.push(
                                {
                                    _prodQty: qty,
                                    _prdCrgID: multiValues[item].VAS_PRODUCT_V_ID,
                                    _prdID: multiValues[item].VAS_PRODUCTCHARGE_ID,
                                    _prodType: multiValues[item].PRODUCTTYPE,
                                    _prdName: multiValues[item].NAME,
                                    _value: multiValues[item].VALUE,
                                    _uom: multiValues[item].C_UOM_ID,
                                    _uomName: multiValues[item].UOM,
                                    _AD_Session_ID: VIS.Env.getCtx().getContext("#AD_Session_ID"),
                                    _windowNo: WindowNo,
                                    _RefNo: "",
                                    _Attribute: multiValues[item].M_AttributeSetInstance_ID,
                                    _AttributeName: "",
                                    _Locator_ID: 0,
                                    _IsLotSerial: "N",
                                    _countID: 0
                                }
                            )
                        }
                    }
                }
            }
        };

        var disposeComponent = function () {
            inforoot.off('keyup');
            btnCancel.off("click");
            btnOK.off("click");
            btnRequery.off("click");
            liFirstPage.off("click");
            liPrevPage.off("click");
            liNextPage.off("click");
            liLastPage.off("click");
            cmbPage.off("change");
            liFirstPage = liPrevPage = liNextPage = liLastPage = cmbPage = null;
            datasec = null;
            searchSec = null;

            if (dGrid != null) {
                dGrid.destroy();
            }
            dGrid = null;
            subroot = null;
            searchTab = null;
            searchSec = null;
            datasec = null;
            btnsec = null;
            refreshtxt = null;
            canceltxt = null;
            Oktxt = null;
            divbtnRight = null;
            btnCancel = null;
            btnOK = null;
            divbtnLeft = null;
            btnRequery = null;
            btnShowCart = null;
            bsyDiv = null;
            srchCtrls = null;
            displayCols = null;
            dGrid = null;
            self = null;
            keyCol = null;
            multiValues = null;
            windowName = null;
            infoLines = null;
            savedProduct = null;
            refreshUI = false;
            ismobile = null;
            chkDelCart = null;
            if (inforoot != null) {
                inforoot.dialog('destroy');
                inforoot.remove();
            }
            inforoot = null;

            this.btnOKClick = null;
            this.displaySearchCol = null;
            this.displayData = null;
            this.loadData = null;
            this.disposeComponent = null;
            this.disposeDataSec = null;
            this.getSelectedValues = null;
            this.refreshUI = null;
            if (SubGridArray.length > 0) {
                for (var i = 0; i < SubGridArray.length; i++) {
                    w2ui["subgrid-" + SubGridArray[i]].destroy();
                }
                SubGridArray = [];
            }
        };

        function createStatusIndicator(recordCount) {
            $statusDiv = $("<div class='filestatus'> <label class='filestatuscounter'>" + recordCount + " Records Inserted..Please Wait..!!</lable></div>");
            $statusDiv.css({
                "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
            });
            $statusDiv[0].style.visibility = "visible";
            inforoot.append($statusDiv);
        };
        //******************

        function createPageSettings() {
            ulPaging = $('<ul class="vis-statusbar-ul">');
            liPageNo = $('<li class="flex-fill"><section class="vis-ad-w-p-s-result"><span></span></section></li>');
            liFirstPage = $('<li style="opacity: 1;"><div><i class="vis vis-shiftleft" title="' + VIS.Msg.getMsg("FirstPage") + '"  style="opacity: 0.6;"></i></div></li>');
            liPrevPage = $('<li style="opacity: 1;"><div><i class="vis vis-pageup" title="' + VIS.Msg.getMsg("PageUp") + '"  style="opacity: 0.6;"></i></div></li>');
            cmbPage = $("<select>");
            liCurrPage = $('<li>').append(cmbPage);
            liNextPage = $('<li style="opacity: 1;"><div><i class="vis vis-pagedown" title="' + VIS.Msg.getMsg("PageDown") + '" style="opacity: 0.6;"></i></div></li>');
            liLastPage = $('<li style="opacity: 1;"><div><i class="vis vis-shiftright" title="' + VIS.Msg.getMsg("LastPage") + '" style="opacity: 0.6;"></i></div></li>');
            $spanPageResult = liPageNo.find(".vis-ad-w-p-s-result").find("span");
            ulPaging.append(liPageNo).append(liFirstPage).append(liPrevPage).append(liCurrPage).append(liNextPage).append(liLastPage);
            pageEvents();
        }

        function pageEvents() {
            liFirstPage.on("click", function () {
                if ($(this).css("opacity") == "1") {
                    bsyDiv[0].style.visibility = 'visible';
                    if (multiSelection && !updating) {
                        btnAddCart.show();
                    }
                    displayData(true, 1);
                    if (SubGridArray.length > 0) {
                        for (var i = 0; i < SubGridArray.length; i++) {
                            w2ui["subgrid-" + SubGridArray[i]].destroy();
                        }
                        SubGridArray = [];
                    }
                }
            });
            liPrevPage.on("click", function () {
                if ($(this).css("opacity") == "1") {
                    bsyDiv[0].style.visibility = 'visible';
                    if (multiSelection && !updating) {
                        btnAddCart.show();
                    }
                    displayData(true, parseInt(cmbPage.val()) - 1);
                    //Mohit Change
                    if (SubGridArray.length > 0) {
                        for (var i = 0; i < SubGridArray.length; i++) {
                            w2ui["subgrid-" + SubGridArray[i]].destroy();
                        }
                        SubGridArray = [];
                    }
                }
            });
            liNextPage.on("click", function () {
                if ($(this).css("opacity") == "1") {
                    bsyDiv[0].style.visibility = 'visible';
                    if (multiSelection && !updating) {
                        btnAddCart.show();
                    }
                    displayData(true, parseInt(cmbPage.val()) + 1);
                    if (SubGridArray.length > 0) {
                        for (var i = 0; i < SubGridArray.length; i++) {
                            w2ui["subgrid-" + SubGridArray[i]].destroy();
                        }
                        SubGridArray = [];
                    }
                }
            });
            liLastPage.on("click", function () {
                if ($(this).css("opacity") == "1") {
                    bsyDiv[0].style.visibility = 'visible';
                    if (multiSelection && !updating) {
                        btnAddCart.show();
                    }
                    displayData(true, parseInt(cmbPage.find("Option:last").val()));
                    if (SubGridArray.length > 0) {
                        for (var i = 0; i < SubGridArray.length; i++) {
                            w2ui["subgrid-" + SubGridArray[i]].destroy();
                        }
                        SubGridArray = [];
                    }
                }
            });
            cmbPage.on("change", function () {
                bsyDiv[0].style.visibility = 'visible';
                if (multiSelection && !updating) {
                    btnAddCart.show();
                }
                displayData(true, cmbPage.val());
                if (SubGridArray.length > 0) {
                    for (var i = 0; i < SubGridArray.length; i++) {
                        w2ui["subgrid-" + SubGridArray[i]].destroy();
                    }
                    SubGridArray = [];
                }
            });
        }

        function resetPageCtrls(psetting) {
            cmbPage = null;
            liCurrPage.find("select").remove();
            cmbPage = $("<select>");
            liCurrPage.append(cmbPage);

            cmbPage.on("change", function () {
                bsyDiv[0].style.visibility = 'visible';
                if (multiSelection && !updating) {
                    btnAddCart.show();
                }
                displayData(true, cmbPage.val());
            });

            if (psetting.TotalPage > 0) {
                for (var i = 0; i < psetting.TotalPage; i++) {
                    cmbPage.append($("<option value=" + (i + 1) + ">" + (i + 1) + "</option>"))
                }
                cmbPage.val(psetting.CurrentPage);

                if (psetting.TotalPage > psetting.CurrentPage) {
                    liNextPage.css("opacity", "1");
                    liLastPage.css("opacity", "1");
                }
                else {
                    liNextPage.css("opacity", "0.6");
                    liLastPage.css("opacity", "0.6");
                }

                if (psetting.CurrentPage > 1) {
                    liFirstPage.css("opacity", "1");
                    liPrevPage.css("opacity", "1");
                }
                else {
                    liFirstPage.css("opacity", "0.6");
                    liPrevPage.css("opacity", "0.6");
                }

                if (psetting.TotalPage == 1) {
                    liFirstPage.css("opacity", "0.6");
                    liPrevPage.css("opacity", "0.6");
                    liNextPage.css("opacity", "0.6");
                    liLastPage.css("opacity", "0.6");
                }
            }
            else {
                liFirstPage.css("opacity", "0.6");
                liPrevPage.css("opacity", "0.6");
                liNextPage.css("opacity", "0.6");
                liLastPage.css("opacity", "0.6");
            }

            var cp = psetting.CurrentPage;
            var ps = psetting.PageSize;
            var tr = psetting.TotalRecords;

            var s = (cp - 1) * ps;
            var e = s + ps;
            if (e > tr) e = tr;
            if (tr == 0) {
                s -= 1;
            }
            var text = showText + " " + (s + 1) + "-" + e + " " + ofText + " " + tr;
            $spanPageResult.text(text);
        }

        function getVariantData(event) {
            if (event != null) {
                var _M_AttributeSetInstance_ID = 0;
                var _Product_ID = VIS.Utility.Util.getValueOfInt(w2ui[grdname].records[event.recid - 1].VAS_PRODUCTCHARGE_ID);
                var _Warehouse_ID = VIS.Utility.Util.getValueOfInt(w2ui[grdname].records[event.recid - 1].M_WAREHOUSE_ID);
                var _AttributeCode = "";
                for (var i = 0; i < srchCtrls.length; i++) {
                    if (srchCtrls[i].Ctrl.colName == "M_AttributeSetInstance_ID") {
                        _M_AttributeSetInstance_ID = VIS.Utility.Util.getValueOfInt(srchCtrls[i].Ctrl.value);
                    }
                }
                for (var i = 0; i < srchCtrls.length; i++) {
                    if (srchCtrls[i].Ctrl.colName == "AttributeCode") {
                        _AttributeCode = srchCtrls[i].Ctrl.getValue();
                    }
                }

                if (_Product_ID > 0 && _Warehouse_ID > 0) {
                    $.ajax({
                        url: VIS.Application.contextUrl + "InfoProduct/GetVariants",
                        dataType: "json",
                        type: "POST",
                        async: false,
                        data: {
                            M_Product_ID: _Product_ID,
                            M_Warehouse_ID: _Warehouse_ID,
                            ParentRec_ID: event.recid,
                            M_AttributeSetInstance_ID: _M_AttributeSetInstance_ID,
                            AttributeCode: _AttributeCode,
                        },
                        error: function () {
                            alert(VIS.Msg.getMsg('ErrorWhileGettingData'));
                            bsyDiv[0].style.visibility = 'hidden';
                            return;
                        },
                        success: function (dyndata) {
                            var res = JSON.parse(dyndata);
                            LoadVariantData(res);
                        }
                    });
                }
            }
        };

        function LoadVariantData(Res) {
            if (Res != null) {
                variantRecords = Res;
            }
        }
    };
    VIS.VAS_infoProductCharge = VAS_infoProductCharge;
})(VIS, jQuery);