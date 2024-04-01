; (function (VIS, $) {
    var baseUrl = VIS.Application.contextUrl;

    function BatchUpdate(windowNo, curTab, selectedRows) {
        var AD_Table_ID = curTab.getAD_Table_ID();
        var tableName = curTab.getTableName();
        var findFields = curTab.getFields();
        this.btnfields = [];
        var control1;
        var $root = $("<div class='vis-forms-container'>");
        var $self = this;
        var ch = null;
        this.onClose = null
        var drpSetColumns = null;
        var divSetValue1 = null;
        var lblSetQryValue = null;
        var drpColumns = null;
        var drpOp = null;
        var divValue1 = null;
        var lblQryValue = null;
        var btnSave = null;
        var btnSetSave = null;
        var tblSetValue = null;
        var btnOk, btnCancel;
        var divMessage = null;
        var bsyDiv = null;

        //*************Upadte records by using Popup box  ******************//

        function setView() {
            var html = '<div class="vis-BatchUpdateContentArea" > '
                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps ">'
                + '  <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v">'
                + '    <label id="lblSetColumn_' + windowNo + '"  for="Column">' + VIS.Msg.getMsg("Column") + '</label>'
                + '  <select id="drpSetColumn_' + windowNo + '">'
                + '</select>'
                + '</div>'

                + '<div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-op">'
                + '<label id="lblSetOperator_' + windowNo + '" for="Oprator">' + VIS.Msg.getMsg("Operator") + '</label>'
                + '<input id="drpSetOperator_' + windowNo + '"value="=" disabled>'
                //+ '<option value="=">=</option>'
               // + '</select>'
                + '</div>'

                + ' <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v" id="divSetValue1_' + windowNo + '">'
                + '   <label  id="lblSetQryValue_' + windowNo + '" for="QueryValue">' + VIS.Msg.getMsg("QueryValue") + '</label>'
                + ' <input class="vis-batchUpdate-font" id="txtSetQryValue_' + windowNo + '" type="text" name="QueryValue">'
                + '</div>'

                + '<div class="vis-advancedSearch-calender-Icon ">'
                + '<ul>'
                + '<li class=""><button id="btnSetSave_' + windowNo + '" disabled class="vis-ads-icon"><i class="vis vis-plus" aria-hidden="true"></i></button></li>'
                + '</ul>'
                + '</div>'

                + '</div>'
                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps vis-batchUpdate-inputwrap">'
                + '<table id="tblSetValue_' + windowNo + '" rules="rows" class="vis-advancedSearchTable">'
                + '<thead>'
                + '<tr class="vis-advancedSearchTableHeadBatch">'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "AD_Column_ID") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "QueryValue") + '</th>'
                + '<th class="vis-batchUpdate-deletewrap">' + VIS.Msg.translate(VIS.Env.getCtx(), "Action") + '</th>'
                + '</tr>'
                + '</thead>'
                + '<div><tbody></tbody></div></table>'
                + '</div>'
                + '</div>';

            html +=
                '<div class="vis-advcedfooterBtn vis-batchUpdate-footerbtn">'
                + '<div class="vis-ctrfrm-btnwrp">'
                + '<button id="btnCancel_' + windowNo + '" class="ui-button ui-widget vis-pull-right ml-2 mr-2" style="border-radius: 0.1rem">' + VIS.Msg.getMsg("close") + '</button>'
                + '<button id="btnOk_' + windowNo + '" class="ui-button ui-widget vis-pull-right ml-2" style="border-radius: 0.1rem">' + VIS.Msg.getMsg("Apply") + '</button>'
                + '<div class="vis-ad-w-p-s-main pull-left"><div class="vis-ad-w-p-s-infoline"></div><div class="vis-ad-w-p-s-msg" style="align-items:flex-end;" id="divMessage_' + windowNo + '"></div></div>'
                + '</div>'
                + '</div>';

            bsyDiv = $("<div class='vis-apanel-busy'>");
            bsyDiv.css({
                "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
            });
            $root.append(bsyDiv);
            $root.append(html);
            initUI();
            bindEvents();
        }

        //************* Is Busy Indicator ******************//

        function setBusy(isBusy) {
            if (isBusy) {
                bsyDiv[0].style.visibility = "visible";
            } else {
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function initUI() {
            drpSetColumns = $root.find("#drpSetColumn_" + windowNo);
            divSetValue1 = $root.find("#divSetValue1_" + windowNo);
            lblSetQryValue = $root.find("#lblSetQryValue_" + windowNo);
            tblSetValue = $root.find("#tblSetValue_" + windowNo);
            drpColumns = $root.find("#drpColumn_" + windowNo);
            drpOp = $root.find("#drpOperator_" + windowNo);
            btnSave = $root.find("#btnSave_" + windowNo);
            btnSetSave = $root.find("#btnSetSave_" + windowNo);
            btnOk = $root.find("#btnOk_" + windowNo);
            btnCancel = $root.find("#btnCancel_" + windowNo);
            divMessage = $root.find("#divMessage_" + windowNo);
            var html = '<option value="-1"> </option>';
            var sortedFields = [];
            for (var c = 0; c < findFields.length; c++) {
                var field = findFields[c];  // get field                       
                var columnName = field.getColumnName();   // get field's column name
                /*if (field.getDisplayType() == VIS.DisplayType.Button) {
                    if (field.getAD_Reference_Value_ID() == 0)
                        // change done here to display textbox for search in case where buttons don't have Reference List bind with Column
                        field.setDisplayType(VIS.DisplayType.String);
                    else {
                        if (columnName.endsWith("_ID"))
                            field.setDisplayType(VIS.DisplayType.Table);
                        else {
                            field.setDisplayType(VIS.DisplayType.List);
                            // bind lookup for buttons having Reference List bind with column
                            field.lookup = new VIS.MLookupFactory.getMLookUp(VIS.context, windowNo, field.getAD_Column_ID(), VIS.DisplayType.List);
                        }
                    }
                }*/
                if (field.getDisplayType() == VIS.DisplayType.Image || field.getDisplayType() == VIS.DisplayType.Button) {
                    continue;
                }
                var header = field.getHeader();
                if (header == null || header.length == 0) {
                    // get text according to the language selected
                    header = VIS.Msg.getElement(VIS.context, columnName);
                    if (header == null || header.Length == 0)
                        continue;
                }
                if (!field.vo.IsUpdateable) {
                    continue;
                }
                if (field.getIsKey() || field.getIsReadOnly() || !field.getIsDisplayed() || field.getIsEncrypted() || field.getCallout() != '') {
                    continue;
                }
                sortedFields.push({ 'value': columnName, 'text': header });
            }

            // sort by text
            sortedFields.sort(function (a, b) {
                var n1 = a.text.toUpperCase();
                var n2 = b.text.toUpperCase();
                if (n1 > n2) return 1;
                if (n1 < n2) return -1;
                return 0;
            });
            for (var col = 0; col < sortedFields.length; col++) {
                html += '<option value="' + sortedFields[col].value + '">' + sortedFields[col].text + '</option>';
            }
            drpSetColumns.html(html);
            drpColumns.html(html);
        }

        //*************All Event ******************//

        function bindEvents() {
            drpSetColumns.on("change", function () {
                var columnName = drpSetColumns.val();
                setControlNullValue(true);
                if (columnName && columnName != "-1") {
                    var f = curTab.getField(columnName);
                    $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 150px)');
                    if ($self.getIsUserColumn(columnName)) {
                        $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 195px)');
                    }
                    if (f.getDisplayType() == VIS.DisplayType.YesNo) {
                        lblSetQryValue.hide();
                    }
                    else {
                        lblSetQryValue.show();
                    }
                    var field = getTargetMField(columnName);
                    setControl(true, field, divSetValue1);
                    setEnableButton(btnSetSave, true);
                }
                setValueEnabled(true, divSetValue1);
            });

            drpColumns.on("change", function () {
                var columnName = drpColumns.val();
                setControlNullValue(true);
                if (columnName && columnName != "-1") {
                    var dsOp = null;
                    if (columnName.endsWith("_ID") || columnName.endsWith("_Acct") || columnName.endsWith("_ID_1") || columnName.endsWith("_ID_2") || columnName.endsWith("_ID_3")) {

                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS_ID);
                    }
                    else if (columnName.startsWith("Is")) {

                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS_YN);
                    }
                    else {
                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS);   // fill dataset with all operators available
                    }
                    var f = curTab.getField(columnName);
                    $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 150px)');
                    if ($self.getIsUserColumn(columnName)) {
                        $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 195px)');
                    }
                    if (f.getDisplayType() == VIS.DisplayType.YesNo) {
                        lblQryValue.hide();
                    }
                    else {
                        lblQryValue.show();
                    }
                    drpOp.html(dsOp);
                    drpOp[0].SelectedIndex = 0;
                    var field = getTargetMField(columnName);
                    setControl(true, field, divValue1);
                    setEnableButton(btnSave, true);
                    drpOp.prop("disabled", false);
                }
                setValueEnabled(true, divValue1);
            });

            drpOp.on("change", function () {
                var selOp = drpOp.val();
                // set control at value2 position according to the operator selected
                if (!selOp) {
                    selOp = "";
                }
                var columnName = drpColumns.val();
                // get field
                var field = getTargetMField(columnName);
                if (selOp && selOp != "0") {
                    //if user selects between operator
                    if (VIS.Query.prototype.BETWEEN.equals(selOp)) {
                        // set control at value2 position
                        setControl(false, field, divValue1);
                    }
                    else {
                        columnName = drpColumns.val();
                        field = getTargetMField(columnName);
                    }
                }
                else {
                    setEnableButton(btnSave, false);
                    setControlNullValue(true);
                }
            });
            btnSetSave.on("click", saveSetRowTemp);
            btnSave.on("click", saveRowTemp);
            btnOk.on("click", function () {
                excuteQuery();
                curTab.dataRefreshAll();
            });
            btnCancel.on("click", function () {
                dispose();
            });
        }

        function setControlNullValue(isValue2) {
            var crtlObj = null;
            crtlObj = control1;
            if (crtlObj != null) {
                crtlObj.setValue(null);
            }
        };

        // get control

        function setValueEnabled(isEnabled, div1) {
            var ctrl = div1.children()[1];
            var btn = null;
            if (div1.children().length > 2)
                btn = div1.children()[2];
            if (btn)
                $(btn).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            else if (ctrl != null) {
                $(ctrl).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            }
        };

        function getTargetMField(columnName) {
            if (columnName == null || columnName.length == 0)
                return null;
            for (var c = 0; c < findFields.length; c++) {
                var field = findFields[c];
                if (columnName.equals(field.getColumnName()))
                    return field;
            }
            return null;
        };

        function setEnableButton(btn, isEnable) {
            btn.prop("disabled", !isEnable);
        };

        /*****Get control form specified column and row from Grid***********/

        function setControl(isValue1, field, div1) {
            control1 = null;
            var ctrl = null;
            var ctrl2 = null;
            if (isValue1) {
                ctrl = div1.children()[1];
                if (div1.children().length > 2)
                    ctrl2 = div1.children()[2];
            }
            //Remove any elements in the list
            if (ctrl != null) {
                $(ctrl).remove();
                if (ctrl2 != null)
                    $(ctrl2).remove();
                ctrl = null;
            }
            var crt = null;
            // if any filed is given
            if (field != null) {
                // if field id any key, then show number textbox 
                if (field.getIsKey()) {
                    crt = new VIS.Controls.VNumTextBox(field.getColumnName(), false, false, true, field.getDisplayLength(), field.getFieldLength(),
                        field.getColumnName());
                }
                else {
                    crt = VIS.VControlFactory.getControl(null, field, true, false, false);
                }
            }
            else {
                // if no field is given show an empty disabled textbox
                crt = new VIS.Controls.VTextBox("columnName", false, true, false, 20, 20, "format",
                    "GetObscureType", false);
            }
            if (crt != null && field!=null) {
                crt.setReadOnly(false);
                if (field.getDisplayType() == VIS.DisplayType.AmtDimension) {
                    crt.hideButton(false);
                    crt.setReadOnlyTextbox(false);
                }
                if (VIS.DisplayType.Text == field.getDisplayType() || VIS.DisplayType.TextLong == field.getDisplayType()) {
                    crt.getControl().attr("rows", "1");
                    crt.getControl().css("width", "100%");
                }
                else if (VIS.DisplayType.YesNo == field.getDisplayType()) {
                    crt.getControl().css("clear", "both");
                }
                else if (VIS.DisplayType.IsDate(field.getDisplayType())) {
                    crt.getControl().css("line-height", "1");
                }
                var btn = null;
                if (crt.getBtnCount() > 0 && !(crt instanceof VIS.Controls.VComboBox))
                    btn = crt.getBtn(0);
                if (isValue1) {
                    div1.append(crt.getControl());
                    control1 = crt;
                    if (btn) {
                        div1.append(btn);
                        crt.getControl().css("width", "calc(100% - 30px)");
                        btn.css("max-width", "30px");
                    }
                }
                if (field.getDisplayType() == VIS.DisplayType.AmtDimension) {
                    crt.getControl().css("width", "100%");
                }
            } else {
                div1.append(crt.getControl());
                lblSetQryValue.show();
            }
        };

        function getControlValue(isValue1) {
            var crtlObj = null;
            if (isValue1) {
                crtlObj = control1;
            }
            if (crtlObj != null) {
                // if control is any checkbox
                if (crtlObj.getDisplayType() == VIS.DisplayType.YesNo) {
                    if (crtlObj.getValue().toString().toLowerCase() == "true") {
                        return "Y";
                    }
                    else {
                        return "N";
                    }
                }
                if (crtlObj.displayType == VIS.DisplayType.AmtDimension) {
                    return crtlObj.getText();
                }
                else {
                    return crtlObj.getValue();
                }
            }
            return "";
        };

        function getControlType() {
            var crtlObj = null;
            crtlObj = control1;
            if (crtlObj != null) {
                return crtlObj.getDisplayType();
            }
            return 0;
        };

        function getControlText(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                crtlObj = control1;
            }
            if (crtlObj != null) {
                if (crtlObj.displayType == VIS.DisplayType.AmtDimension) {
                    return crtlObj.getText();
                }
                else {
                    return crtlObj.getDisplay();
                }
            }
            return "";
        };

        function saveRowTemp() {
            var cVal = drpColumns.val();
            if (!cVal || cVal == "-1")
                return false;
            var colName = drpColumns.find("option:selected").text();
            var colValue = "";
            if (colName == null || colName.trim().length == 0) {
                return false;
            }
            else {
                colValue = cVal.toString();
            }
            if (tblSetValue.find('tbody [data-cVal="' + cVal + '"]').length > 0) {
                return;
            }
        }

        function saveSetRowTemp() {
            var cVal = drpSetColumns.val();
            if (!cVal || cVal == "-1")
                return false;
            var colName = drpSetColumns.find("option:selected").text();
            var colValue = "";
            if (colName == null || colName.trim().length == 0) {
                return false;
            }
            else {
                colValue = cVal.toString();
            }
            if (tblSetValue.find('tbody [data-cVal="' + cVal + '"]').length > 0) {
                VIS.ADialog.info('AlreadyAdded');
                return;
            }
            var controlText = getControlValue(true);
            if (getControlType() == VIS.DisplayType.Date) {
                controlText=controlText.replace('Z','');
            }
            var htm = '<tr class="vis-advancedSearchTableRowBatch"><td data-cVal="' + cVal + '">' + colName + '</td>'
                + '<td data-settype="' + getControlType() + '" data-setVal="' + controlText + '">' + controlText + '</td>'
                + '<td class="vis-batchUpdate-deletewrap"><i style="cursor:pointer;" class="vis vis-delete" onclick="$(this).closest(\'tr\').remove()"></i></td></tr>'
            tblSetValue.find('tbody').append(htm);
            setControl(true, null, divSetValue1);
            drpSetColumns.val(-1);
            setControlNullValue(true);
        }

        //*************Update records ******************//

        function excuteQuery() {
            var objSetValue = [];
            var recordIds = [];
            tblSetValue.find('tbody tr').each(function () {
                objSetValue.push({
                    column: $(this).find('td:eq(0)').data('cval'),
                    setValue: $(this).find('td:eq(1)').data('setval'),
                    setType: $(this).find('td:eq(1)').data('settype')
                });
            });
            if (objSetValue.length == 0) {
                return divMessage.text(VIS.Msg.getMsg("VIS_AddAction"));
            }

            for (var i = 0; i < selectedRows.length; i++) {
                recordIds.push(selectedRows[i][(tableName + '_ID').toLower()]);
            }
            var obj = {
                AD_Table_ID: AD_Table_ID,
                setValue: objSetValue,
                recordIds: recordIds
            }
            VIS.ADialog.confirm("UpdateRecord", true, "", "Confirm", function (result) {
                if (result) {
                    setBusy(true);
                    $.ajax({
                        url: baseUrl + 'BatchUpdate/ExcuteBatchUpdate',
                        type: "POST",
                        datatype: "json",
                        contentType: "application/json; charset=utf-8",
                        async: false,
                        data: JSON.stringify(obj),
                        success: function (result) {
                            if (result == "OK") {
                                curTab.dataRefreshAll();
                                dispose();
                            }
                            else {
                                divMessage.text(result);
                                setBusy(false);
                            }
                        },
                        error: function (error) {
                            divMessage.text(error);
                        }
                    });
                }
                else {
                    return;
                }
            });
        }

        setView();

        //************* Dialog for Batch Update ******************//

        this.show = function () {
            ch = new VIS.ChildDialog();
            var windowWidth = $(window).width();
            if (windowWidth >= 1366) {
                ch.setHeight(550);
                ch.setWidth(870);
            }
            else {
                ch.setHeight(450);
                ch.setWidth(670);
            }
            ch.setTitle(VIS.Msg.getMsg("BatchUpdate"));
            ch.setEnableResize(true);
            ch.setModal(true);
            ch.onClose = function () {
                $self.onClose();
                $self.dispose();
            };
            ch.show();
            ch.setContent($root);
            ch.hideButtons();
            setBusy(false);
        };

        //*************Clean Up ******************//

        function dispose() {
            ch.close();
            if ($root)
                $root.remove();
            $root = null;
            if (btnOk)
                btnOk.off(VIS.Events.onClick);
            btnOk = null;
            if (btnCancel)
                btnCancel.off(VIS.Events.onClick);
            btnCancel = null;
            AD_Table_ID = null;
            tableName = null;
            findFields = null;
            control1 = null;
            ch = null;
            drpSetColumns = null;
            divSetValue1 = null;
            lblSetQryValue = null;
            drpColumns = null;
            drpOp = null;
            divValue1 = null;
            lblQryValue = null;
            btnSave = null;
            btnSetSave = null;
            tblSetValue = null;
            divMessage = null;
            setBusy(false);
        }

        this.disposeComponent = function () {
            if ($root)
                $root.remove();
            $root = null;
        }
    }

    BatchUpdate.prototype.getOperatorsQuery = function (vnpObj, translate) {
        var html = "";
        var val = "";
        for (var p in vnpObj) {
            val = vnpObj[p];
            if (translate)
                val = VIS.Msg.getMsg(val);
            html += '<option value="' + p + '">' + val + '</option>';
        }
        return html;
    };

    BatchUpdate.prototype.getIsUserColumn = function (columnName) {
        if (columnName.endsWith("atedBy") || columnName.equals("AD_User_ID"))
            return true;
        if (columnName.equals("SalesRep_ID"))
            return true;
        return false;
    };

    BatchUpdate.prototype.getIsCreated = function () {
        return this.created;
    };

    BatchUpdate.prototype.dispose = function () {
        this.disposeComponent();
    };

    VIS.BatchUpdate = BatchUpdate;

}(VIS, jQuery));