; (function (VIS, $) {

    var self = this;
    var txtName = null;
    var txtSearchKey = null;
    var txtUOM = null;
    var lookupUOM = null;
    var txtUPC = null;
    var txtPType;
    var lookupProductType = null;
    var txtPCategory = null;
    var txtTaxCategory = null;
    var lookupTaxCategory = null;
    var txtAttribute = null;
    var lookupAttributeSet = null;
    var txtPurchased = null;
    var txtSold = null;
    var txtStocked = null;
    var txtDescription = null;
    var lblBottomMsg = $('<label></label>');
    var bsyDiv = null;
    var addMProductDialog = null;
    var okBtn, closeBtn;

    //*************Add New Product by using Popup box  ******************//

    function AddMProduct(windowNo) {
        var root = $('<div>');
        bsyDiv = $("<div class='vis-apanel-busy'>");
        bsyDiv.css({
            "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
        });
        root.append(bsyDiv);

        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="Value_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="Name_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="C_UOM_ID_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="UPC_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="ProductType_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="M_Product_Category_ID_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="C_TaxCategory_ID_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="M_AttributeSet_ID_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="IsPurchased_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="IsSold_' + self.windowNo + '"></div></div>'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="IsStocked_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd p-0"><div class="input-group vis-input-wrap vis-ev-full-h" id="Description_' + self.windowNo + '"></div></div>'
            + '</div>');
        root.append('<div class="vis-ctrfrm-btnwrp">'
            + '<input id="closeBtn' + self.windowNo + '" class= "VIS_Pref_btn-2" type = "button" value = "' + VIS.Msg.getMsg("close") + '">'
            + '<input id="okBtn_' + self.windowNo + '" class="VIS_Pref_btn-2" type="button" value="' + VIS.Msg.getMsg("OK") + '">'
            + '<div class="vis-ad-w-p-s-main pull-left"><div class="vis-ad-w-p-s-infoline"></div><div class="vis-ad-w-p-s-msg" style="align-items:flex-end;" id="lblBottomMsg_' + self.windowNo + '"></div></div>'
            + '</div>');

        srcCtrl = root.find("#Value_" + self.windowNo);
        nameCtrl = root.find("#Name_" + self.windowNo);
        uomCtrl = root.find("#C_UOM_ID_" + self.windowNo);
        upcCtrl = root.find("#UPC_" + self.windowNo);
        pTypeCtrl = root.find("#ProductType_" + self.windowNo);
        pCatCtrl = root.find("#M_Product_Category_ID_" + self.windowNo);
        taxCtrl = root.find("#C_TaxCategory_ID_" + self.windowNo);
        attCtrl = root.find("#M_AttributeSet_ID_" + self.windowNo);
        purCtrl = root.find("#IsPurchased_" + self.windowNo);
        soldCtrl = root.find("#IsSold_" + self.windowNo);
        stockCtrl = root.find("#IsStocked_" + self.windowNo);
        desCtrl = root.find("#Description_" + self.windowNo);
        closeBtn = root.find("#closeBtn" + self.windowNo);
        okBtn = root.find("#okBtn_" + self.windowNo);
        lblBottomMsg = root.find("#lblBottomMsg_" + self.windowNo);

        var srchCtrlWrap = $('<div class="vis-control-wrap">');
        var nameCtrlWrap = $('<div class="vis-control-wrap">');
        var uomCtrlWrap = $('<div class="vis-control-wrap">');
        var upcCtrlWrap = $('<div class="vis-control-wrap">');
        var pTypeCtrlWrap = $('<div class="vis-control-wrap">');
        var pCatCtrlWrap = $('<div class="vis-control-wrap">');
        var taxCtrlWrap = $('<div class="vis-control-wrap">');
        var attCtrlWrap = $('<div class="vis-control-wrap">');
        var purCtrlWrap = $('<div class="vis-control-wrap">');
        var soldCtrlWrap = $('<div class="vis-control-wrap">');
        var stockCtrlWrap = $('<div class="vis-control-wrap">');
        var desCtrlWrap = $('<div class="vis-control-wrap">');

        //*************Controls to get values ******************//

        txtSearchKey = new VIS.Controls.VTextBox("Value", true, false, true);
        srcCtrl.append(srchCtrlWrap);
        srchCtrlWrap.append(txtSearchKey.getControl().attr('placeholder', ' ').attr('data-placeholder', '').attr("autocomplete", "off")).append('<label>' + VIS.Msg.getMsg("EnterSearchKey") + '</label>');

        txtName = new VIS.Controls.VTextBox("Name", true, false, true);
        nameCtrl.append(nameCtrlWrap);
        nameCtrlWrap.append(txtName.getControl().attr('placeholder', ' ').attr('data-placeholder', '').attr("autocomplete", "off")).append('<label>' + VIS.Msg.getMsg("Name") + '</label>');

        lookupUOM = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 0, VIS.DisplayType.TableDir, "C_UOM_ID", 0, true, "IsActive='Y'");
        txtUOM = new VIS.Controls.VComboBox("C_UOM_ID", true, false, true, lookupUOM);
        uomCtrl.append(uomCtrlWrap);
        uomCtrlWrap.append(txtUOM.getControl()).append('<label>' + VIS.Msg.getMsg("UomName") + '</label>');

        txtUPC = new VIS.Controls.VTextBox("UPC", false, false, true);
        upcCtrl.append(upcCtrlWrap);
        upcCtrlWrap.append(txtUPC.getControl().attr('placeholder', ' ').attr('data-placeholder', '').attr("autocomplete", "off")).append('<label>' + VIS.Msg.getMsg("VIS_UPC_EAN") + '</label>');

        lookupProductType = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 0, VIS.DisplayType.List, "ProductType", 270, true, "IsActive='Y'");
        txtPType = new VIS.Controls.VComboBox("ProductType", true, false, true, lookupProductType);
        pTypeCtrl.append(pTypeCtrlWrap);
        pTypeCtrlWrap.append(txtPType.getControl()).append('<label>' + VIS.Msg.getMsg("VIS_Product_Type") + '</label>');

        lookupProductCategory = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 0, VIS.DisplayType.TableDir, "M_Product_Category_ID", 0, true, "IsActive='Y'");
        txtPCategory = new VIS.Controls.VComboBox("M_Product_Category_ID", true, false, true, lookupProductCategory);
        pCatCtrl.append(pCatCtrlWrap);
        pCatCtrlWrap.append(txtPCategory.getControl()).append('<label>' + VIS.Msg.getMsg("VIS_Product_Category") + '</label>');

        lookupTaxCategory = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 0, VIS.DisplayType.TableDir, "C_TaxCategory_ID", 0, true, "IsActive='Y'");
        txtTaxCategory = new VIS.Controls.VComboBox("C_TaxCategory_ID", true, false, true, lookupTaxCategory);
        taxCtrl.append(taxCtrlWrap);
        taxCtrlWrap.append(txtTaxCategory.getControl()).append('<label>' + VIS.Msg.getMsg("VIS_Tax_Category") + '</label>');

        lookupAttributeSet = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 0, VIS.DisplayType.TableDir, "M_AttributeSet_ID", 0, true, "IsActive='Y'");
        txtAttribute = new VIS.Controls.VComboBox("M_AttributeSet_ID", false, false, true, lookupAttributeSet);
        attCtrl.append(attCtrlWrap);
        attCtrlWrap.append(txtAttribute.getControl()).append('<label>' + VIS.Msg.getMsg("VIS_Attribute_Set") + '</label>');

        txtPurchased = new VIS.Controls.VCheckBox("IsPurchased", false, false, true, VIS.Msg.getMsg("VIS_Is_Purchased"), null, false);
        purCtrl.append(purCtrlWrap);
        purCtrlWrap.append(txtPurchased.getControl().addClass("vis-ec-col-lblchkbox"));

        txtSold = new VIS.Controls.VCheckBox("IsSold", false, false, true, VIS.Msg.getMsg("VIS_Is_Sold"), null, false);
        soldCtrl.append(soldCtrlWrap);
        soldCtrlWrap.append(txtSold.getControl().addClass("vis-ec-col-lblchkbox"));

        txtStocked = new VIS.Controls.VCheckBox("IsStocked", false, false, true, VIS.Msg.getMsg("VIS_Is_Stocked"), null, false);
        stockCtrl.append(stockCtrlWrap);
        stockCtrlWrap.append(txtStocked.getControl().addClass("vis-ec-col-lblchkbox"));

        txtDescription = new VIS.Controls.VTextArea("Description", false, false, true);
        desCtrl.append(desCtrlWrap);
        desCtrlWrap.append(txtDescription.getControl().attr('placeholder', ' ').attr('data-placeholder', '')).append('<label>' + VIS.Msg.getMsg("Description") + '</label>')

        events();

        OpenDialogPopup(root);

        //************* Is Busy Indicator ******************//

        function setBusy(isBusy) {
            if (isBusy) {
                bsyDiv[0].style.visibility = "visible";
            } else {
                bsyDiv[0].style.visibility = "hidden";
            }
        }
        setBusy(false);

        //*************All Event ******************//

        function events() {

            okBtn.on(VIS.Events.onClick, function () {
                lblBottomMsg.text(" ");
                SaveMProduct();
            });

            closeBtn.on(VIS.Events.onClick, function () {
                clear();
                dispose();
            });

            txtSearchKey.fireValueChanged = function (e) {
                AddRemoveMandatory(txtSearchKey);
                txtSearchKey.setValue(e.newValue);
            };

            txtName.fireValueChanged = function (e) {
                AddRemoveMandatory(txtName);
                txtName.setValue(e.newValue);
            };

            txtUOM.fireValueChanged = function (e) {
                AddRemoveMandatory(txtUOM);
                txtUOM.setValue(e.newValue);
            };

            txtUPC.fireValueChanged = function (e) {
                txtUPC.setValue(e.newValue);
            };

            txtPType.fireValueChanged = function (e) {
                AddRemoveMandatory(txtPType);
                txtPType.setValue(e.newValue);
            };

            txtPCategory.fireValueChanged = function (e) {
                AddRemoveMandatory(txtPCategory);
                txtPCategory.setValue(e.newValue);
            };

            txtTaxCategory.fireValueChanged = function (e) {
                AddRemoveMandatory(txtTaxCategory);
                txtTaxCategory.setValue(e.newValue);
            };

            txtAttribute.fireValueChanged = function (e) {
                txtAttribute.setValue(e.newValue);
            };

            txtPurchased.fireValueChanged = function (e) {
                txtPurchased.setValue(e.newValue);
            };

            txtSold.fireValueChanged = function (e) {
                txtSold.setValue(e.newValue);
            };

            txtStocked.fireValueChanged = function (e) {
                txtStocked.setValue(e.newValue);
            };

            txtDescription.fireValueChanged = function (e) {
                txtDescription.setValue(e.newValue);
            };
        }

        //************* Mandatory values ******************//

        function AddRemoveMandatory(elm) {
            if (elm.getValue() != null && elm.getValue() != "") {
                elm.getControl().removeClass("vis-ev-col-mandatory");
            }
            else {
                elm.getControl().addClass("vis-ev-col-mandatory");
            }
        }

        //************* Dialog for New Product  ******************//

        function OpenDialogPopup(firstRoot) {
            addMProductDialog = new VIS.ChildDialog();
            addMProductDialog.setContent(firstRoot);
            var windowWidth = $(window).width();
            if (windowWidth >= 1366) {
                addMProductDialog.setWidth(870);
            }
            else {
                addMProductDialog.setWidth(670);
            }
            addMProductDialog.setTitle(VIS.Msg.getMsg("AddProduct"));
            addMProductDialog.setEnableResize(true);
            addMProductDialog.setModal(true);
            addMProductDialog.show();
            addMProductDialog.hideButtons();
            addMProductDialog.getRoot().dialog({ position: [200, 130] });
        };

        //*************Save New Product  ******************//

        function SaveMProduct() {
            var isRequired = false;
            var msg = VIS.Msg.getMsg("FillMandatory") + " ";

            if (txtSearchKey.getValue().trim().length == 0) {
                msg += VIS.Msg.getMsg("EnterSearchKey") + ", ";
                isRequired = true;
            }

            if (txtName.getValue().trim().length == 0) {
                msg += VIS.Msg.getMsg("Name") + ", ";
                isRequired = true;
            }

            if (txtUOM.getValue() == 0 || txtUOM.getValue() == null) {
                msg += VIS.Msg.getMsg("UomName") + ", ";
                isRequired = true;
            }
            if (txtPType.getValue() == 0 || txtPType.getValue() == null) {

                msg += VIS.Msg.getMsg("VIS_Product_Type") + ", ";
                isRequired = true;
            }

            if (txtPCategory.getValue() == 0 || txtPCategory.getValue() == null) {

                msg += VIS.Msg.getMsg("VIS_Product_Category") + ", ";
                isRequired = true;
            }

            if (txtTaxCategory.getValue() == 0 || txtTaxCategory.getValue() == null) {
                msg += VIS.Msg.getMsg("VIS_Tax_Category") + ", ";
                isRequired = true;
            }

            if (isRequired) {
                VIS.ADialog.error("", "", msg.slice(0, -2));
                return false;
            }

            var obj = {
                searchKey: txtSearchKey.getValue(),
                name: txtName.getValue(),
                uom: txtUOM.getValue(),
                upc: txtUPC.getValue(),
                proType: txtPType.getValue(),
                proCategory: txtPCategory.getValue(),
                taxCategory: txtTaxCategory.getValue(),
                attribute: txtAttribute.getValue(),
                purchased: txtPurchased.getValue(),
                sold: txtSold.getValue(),
                stocked: txtStocked.getValue(),
                description: txtDescription.getValue()
            }
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "AddProduct/AddNewProduct",
                type: "POST",
                data: obj,
                success: function (result) {
                    if (result == "OK") {
                        lblBottomMsg.text(VIS.Msg.getMsg("VIS_Product_Save"));
                        clear();
                    }
                    else {
                        setBusy(false);
                        lblBottomMsg.text(result);
                    }
                },
                error: function (error) {
                    setBusy(false);
                    //html to be converted to doc
                    var doc = (new DOMParser).parseFromString(error.responseText, "text/html");
                    //select title element and get its text content
                    var message = doc.querySelector("title").textContent;
                    VIS.ADialog.error(message);

                    
                    
                }
            });
        };

        //*************Empty text field******************//

        function clear() {
            setBusy(false);
            txtSearchKey.setValue("");
            txtName.setValue("");
            txtUOM.setValue("");
            txtUPC.setValue("");
            txtPType.setValue("");
            txtPCategory.setValue("");
            txtTaxCategory.setValue("");
            txtAttribute.setValue("");
            txtDescription.setValue("");
            txtPurchased.setValue(false);
            txtSold.setValue(false);
            txtStocked.setValue(false);

            txtSearchKey.getControl().addClass("vis-ev-col-mandatory");
            txtName.getControl().addClass("vis-ev-col-mandatory");
            txtUOM.getControl().addClass("vis-ev-col-mandatory");
            txtPType.getControl().addClass("vis-ev-col-mandatory");
            txtPCategory.getControl().addClass("vis-ev-col-mandatory");
            txtTaxCategory.getControl().addClass("vis-ev-col-mandatory");
        };

        //*************Clean Up ******************//

        function dispose() {
            addMProductDialog.close();
            if (root != null) {
                root.remove();
            }
            root = null;
            if (okBtn)
                okBtn.off(VIS.Events.onClick);
            okBtn = null;
            if (closeBtn)
                closeBtn.off(VIS.Events.onClick);
            closeBtn = null;
            txtName = null;
            txtSearchKey = null;
            txtUOM = null;
            lookupUOM = null;
            txtUPC = null;
            txtPType = null;
            lookupProductType = null;
            txtPCategory = null;
            lookupProductCategory = null;
            txtTaxCategory = null;
            lookupTaxCategory = null;
            txtAttribute = null;
            lookupAttributeSet = null;
            txtPurchased = null;
            txtSold = null;
            txtStocked = null;
            txtDescription = null;
        };
    };

    VIS.AddUpdateMProduct = AddMProduct;
})(VIS, jQuery);