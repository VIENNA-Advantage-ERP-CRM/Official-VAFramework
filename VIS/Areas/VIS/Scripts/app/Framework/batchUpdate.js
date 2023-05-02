; (function (VIS, $) {
    var baseUrl = VIS.Application.contextUrl;

    function BatchUpdate(windowNo, curTab, minRecord) {
        var title = curTab.getName();
        var AD_Tab_ID = curTab.getAD_Tab_ID();
        var AD_Table_ID = curTab.getAD_Table_ID();
        var tableName = curTab.getTableName();
        var whereExtended = curTab.getWhereClause();
        var findFields = curTab.getFields();
        this.btnfields = [];
        var control1, control2, ulListStaticHtml = "";;


        var $root = $("<div  class='vis-forms-container' style='height:100%'>");
        var $busy = null;

        var $self = this;
        var ch = null;
        this.onClose = null
        var drpSetColumns = null;
        var drpSetOp = null;
        var divSetValue1 = null;
        var lblSetQryValue = null;

        var drpColumns = null;
        var drpOp = null;
        var drpAndOr = null;
        var divValue1 = null;
        var lblQryValue = null;
        var divValue2 = null;
        var btnSave = null;
        var btnSetSave = null;
        var tblSetValue = null;
        var tblWhereCondition = null;
        var btnOk, btnCancel;
        var divMessage = null;
        function setBusy(busy) {
            //isBusy = busy;
            //$busy.css("visibility", isBusy ? "visible" : "hidden");
            //btnOk.prop("disabled", busy);
            //btnCancel.prop("disabled", busy);
            //btnRefresh.prop("disabled", busy);
        };

        function setView() {
            var dStyle = '';
            var isRTL = false;

            var html = '<div class="vis-advancedSearch-contentWrap">'
                + '<div class="vis-advancedSearchContentArea vis-pull-left" style = "' + dStyle + '" > '

                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps vis-pull-left">'
                + '  <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v">'
                + '    <label id="lblSetColumn_' + windowNo + '"  for="Column">' + VIS.Msg.getMsg("Column") + '</label>'
                + '  <select id="drpSetColumn_' + windowNo + '">'
                + '</select>'
                + '</div>'

                + '<div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-op">'
                + '<label id="lblSetOperator_' + windowNo + '" for="Oprator">' + VIS.Msg.getMsg("Operator") + '</label>'
                + '<select id="drpSetOperator_' + windowNo + '">'
                + '<option value="=">=</option>'
                + '</select>'
                + '</div>'

                + ' <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v" id="divSetValue1_' + windowNo + '">'
                + '   <label  id="lblSetQryValue_' + windowNo + '" for="QueryValue">' + VIS.Msg.getMsg("QueryValue") + '</label>'
                + ' <input  id="txtSetQryValue_' + windowNo + '" type="text" name="QueryValue">'
                + '</div>'

                + '<div class="vis-advancedSearch-calender-Icon vis-pull-left">'
                + '<ul>'
                + '<li class="vis-pull-left"><button id="btnSetSave_' + windowNo + '" disabled class="vis-ads-icon"><i class="vis vis-plus" aria-hidden="true"></i></button></li>'
                + '</ul>'
                + '</div>'


                + '</div>'
                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps vis-pull-left" style="overflow:auto; height:200px; margin-bottom:30px;border: 1px solid rgba(var(--v-c-on-secondary), .2);">'
                + '<table id="tblSetValue_' + windowNo + '" rules="rows" class="vis-advancedSearchTable">'
                + '<thead>'
                + '<tr class="vis-advancedSearchTableHead">'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "AD_Column_ID") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "QueryValue") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "Action") + '</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody></tbody></table>'
                + '</div>'

                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps vis-pull-left">'
                + '  <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v">'
                + '    <label  for="Column">' + VIS.Msg.getMsg("ANDOR") + '</label>'
                + '  <select id="drpAndOr_' + windowNo + '">'
                + '     <option value="And">And</option>'
                + '     <option value="Or">Or</option>'
                + '</select>'
                + '</div>'

                + '  <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v">'
                + '    <label id="lblColumn_' + windowNo + '"  for="Column">' + VIS.Msg.getMsg("Column") + '</label>'
                + '  <select id="drpColumn_' + windowNo + '">'
                + '</select>'
                + '</div>'

                + '<div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-op">'
                + '<label id="lblOperator_' + windowNo + '" for="Oprator">' + VIS.Msg.getMsg("Operator") + '</label>'
                + '<select id="drpOperator_' + windowNo + '">'
                + '</select>'
                + '</div>'

                + ' <div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v" id="divValue1_' + windowNo + '">'
                + '   <label  id="lblQryValue_' + windowNo + '" for="QueryValue">' + VIS.Msg.getMsg("QueryValue") + '</label>'
                + ' <input  id="txtQryValue_' + windowNo + '" type="text" name="QueryValue">'
                + '</div>'

                + '<div class="vis-form-group vis-advancedSearchInput vis-advancedSearchInput-v" id="divValue2_' + windowNo + '">'
                + '<label for="QueryName"  id="lblToQryValue_' + windowNo + '">' + VIS.Msg.getMsg("ToQueryValue") + '</label>'
                + '<input  id="txtToQryValue_' + windowNo + '" type="text" name="QueryName">'
                + '</div>'

                + '<div class="vis-advancedSearch-calender-Icon vis-pull-left">'
                + '<ul>'
                + '<li class="vis-pull-left"><button id="btnSave_' + windowNo + '" disabled class="vis-ads-icon"><i class="vis vis-plus" aria-hidden="true"></i></button></li>'
                + '</ul>'
                + '</div>'

                + '</div>'
                + '<div class="vis-advanedSearch-InputsWrap vis-advs-inputwraps vis-pull-left" style="overflow:auto; height: 200px;border: 1px solid rgba(var(--v-c-on-secondary), .2);">'
                + '<table id="tblWhereCondition_' + windowNo + '" rules="rows"  class="vis-advancedSearchTable">'
                + '<thead>'
                + '<tr class="vis-advancedSearchTableHead">'
                + '<th>And/Or</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "AD_Column_ID") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "OperatorName") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "QueryValue") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "QueryValue2") + '</th>'
                + '<th>' + VIS.Msg.translate(VIS.Env.getCtx(), "Action") + '</th>'
                + '</tr>'
                + '</thead>'
                + '<tbody ></tbody></table>'
                + '</div>'

                + '<div class="vis-advancedSearchContentArea-button">'
                + '<div class="vis-advcedfooterBtn">'
                + '<div id="divMessage_' + windowNo + '"></div>'
                + '<div class="vis-pull-right">'
                + '<button id="btnOk_' + windowNo + '" class="ui-button ui-corner-all ui-widget" >' + VIS.Msg.getMsg("Apply") + '</button>'
                + '  <button id="btnCancel_' + windowNo + '" class="ui-button ui-corner-all ui-widget"  style="margin: 0 10px;">' + VIS.Msg.getMsg("close") + '</button>'

                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';


            html += '<div class="vis-advancedSearch-RecentRecords">'
                + '  <div class="vis-RecentRecords-Heading">';

            //dStyle = isRTL ? "margin-right:15px" : "margin-left:15px";

            html += '<h4>' + VIS.Msg.getMsg("VHistory") + '</h4>'


                + '</div>'
                + '<div class="vis-RecentRecords-listWrap">'
                + '<ul >';

            $("#vis_home_org option").each(function () {
                html += '<li><input type="checkbox" value="' + $(this).val() + '" checked/>' + $(this).text() + '</li>';
            })

            html+= '</ul></div>'
                + '</div>';
            + '</div>';

            $root.append(html);
            initUI();
            bindEvents();
        }



        function initUI() {
            drpSetColumns = $root.find("#drpSetColumn_" + windowNo);
            drpSetOp = $root.find("#drpSetOperator_" + windowNo);
            divSetValue1 = $root.find("#divSetValue1_" + windowNo);
            lblSetQryValue = $root.find("#lblSetQryValue" + windowNo);
            tblSetValue = $root.find("#tblSetValue_" + windowNo);
           
            drpColumns = $root.find("#drpColumn_" + windowNo);
            drpOp = $root.find("#drpOperator_" + windowNo);
            drpAndOr = $root.find("#drpAndOr_" + windowNo);
            divValue1 = $root.find("#divValue1_" + windowNo);
            lblQryValue = $root.find("#lblQryValue_" + windowNo);
            divValue2 = $root.find("#divValue2_" + windowNo);
            tblWhereCondition = $root.find("#tblWhereCondition_" + windowNo);

            btnSave = $root.find("#btnSave_" + windowNo);
            btnSetSave = $root.find("#btnSetSave_" + windowNo);

            btnOk = $root.find("#btnOk_" + windowNo);
            btnCancel = $root.find("#btnCancel_" + windowNo);
            divMessage = $root.find("#divMessage_" + windowNo);

            var html = '<option value="-1"> </option>';
            var sortedFields = [];
            for (var c = 0; c < findFields.length; c++) {
                // get field
                var field = findFields[c];
                if (field.getIsEncrypted())
                    continue;
                // get field's column name
                var columnName = field.getColumnName();
                if (field.getDisplayType() == VIS.DisplayType.Button) {
                    if (field.getAD_Reference_Value_ID() == 0)
                        // change done here to display textbox for search in case where buttons don't have Reference List bind with Column
                        //continue;
                        field.setDisplayType(VIS.DisplayType.String);
                    else {
                        if (columnName.endsWith("_ID"))
                            field.setDisplayType(VIS.DisplayType.Table);
                        else {
                            field.setDisplayType(VIS.DisplayType.List);
                            // bind lookup for buttons having Reference List bind with column
                            field.lookup = new VIS.MLookupFactory.getMLookUp(VIS.context, windowNo, field.getAD_Column_ID(), VIS.DisplayType.List);
                        }
                        //field.loadLookUp();
                    }
                }
                // get text to be displayed
                var header = field.getHeader();
                if (header == null || header.length == 0) {
                    // get text according to the language selected
                    header = VIS.Msg.getElement(VIS.context, columnName);
                    if (header == null || header.Length == 0)
                        continue;
                }
                // if given field is any key, then add "(ID)" to it
                if (field.getIsKey())
                    header += (" (ID)");

               
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
                    setControl(true, field, divSetValue1, null);    
                    setEnableButton(btnSetSave, true);
                } else {
                    //showValue2(true);
                }

                setValueEnabled(true, divSetValue1);
                
            });

            drpColumns.on("change", function () {
                var columnName = drpColumns.val();
                setControlNullValue(true);
                if (columnName && columnName != "-1") {
                    var dsOp = null;
                    var dsOpDynamic = null;
                    if (columnName.endsWith("_ID") || columnName.endsWith("_Acct") || columnName.endsWith("_ID_1") || columnName.endsWith("_ID_2") || columnName.endsWith("_ID_3")) {
                       
                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS_ID);
                    }
                    else if (columnName.startsWith("Is")) {
                       
                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS_YN);
                    }
                    else {
                        // fill dataset with all operators available
                        dsOp = $self.getOperatorsQuery(VIS.Query.prototype.OPERATORS);
                    }

                    var f = curTab.getField(columnName);
                    $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 150px)');                   
                    if ($self.getIsUserColumn(columnName)) {                       
                        $root.find('.vis-advancedSearchContentArea-down').css('height', 'calc(100% - 195px)');                       
                        showValue2(false);                        
                    }                  

                    showValue2(true);

                    if (f.getDisplayType() == VIS.DisplayType.YesNo) {
                        lblQryValue.hide();
                    }
                    else {
                        lblQryValue.show();
                    }

                    drpOp.html(dsOp);
                    drpOp[0].SelectedIndex = 0;
                    var field = getTargetMField(columnName);
                    setControl(true, field, divValue1, divValue2);                   
                    setEnableButton(btnSave, true);
                    drpOp.prop("disabled", false);
                }
                else {                   
                    showValue2(true);
                }
               
                setValueEnabled(true, divValue1);
                setValue2Enabled(false);

            });

            drpOp.on("change", function () {
                //if (isBusy) return;
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
                        setControl(false, field, divValue1, divValue2);



                        // enable the control at value2 position
                        setValue2Enabled(true);
                    }
                    else {
                        columnName = drpColumns.val();
                        field = getTargetMField(columnName);
                        if (field.getDisplayType() == VIS.DisplayType.DateTime && VIS.Query.prototype.EQUAL.equals(selOp)) {
                            showValue2(true);
                            //showFullDay(true);
                        }
                        else {
                            showValue2(true);
                            //showFullDay(false);
                            setValue2Enabled(false);
                        }
                    }
                }
                else {
                    setEnableButton(btnSave, false);//
                    setValue2Enabled(false);
                    setControlNullValue(true);
                }
            });
            btnSetSave.on("click", saveSetRowTemp);
            btnSave.on("click", saveRowTemp);
            btnOk.on("click", function () {               
                excuteQuery();
            });
        }

        function setControlNullValue(isValue2) {
            var crtlObj = null;
            if (isValue2) {
                crtlObj = control2;
            }
            else {
                crtlObj = control1;
            }

            // if control exists
            if (crtlObj != null) {
                crtlObj.setValue(null);
            }

        };

        function setValueEnabled(isEnabled,div1) {
            // get control
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

        function setValue2Enabled(isEnabled) {
            var ctrl = divValue2.children()[1];
            var btn = null;
            if (divValue2.children().length > 2)
                btn = divValue2.children()[2];

            if (btn)
                $(btn).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            else if (ctrl != null) {
                $(ctrl).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            }
        };

        function showValue2(show) {
            divValue2.css("display", show ? "block" : "none");
        };

        function getTargetMField(columnName) {
            // if no column name, then return null
            if (columnName == null || columnName.length == 0)
                return null;
            // else find field for the given column
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

        function setControl(isValue1, field,div1,div2) {
            // set column and row position
            /*****Get control form specified column and row from Grid***********/
            if (isValue1)
                control1 = null;
            control2 = null;
            var ctrl = null;
            var ctrl2 = null;
            if (isValue1) {
                ctrl = div1.children()[1];
                if (div1.children().length > 2)
                    ctrl2 = div1.children()[2];
            }
            else {
                ctrl = div2.children()[1];
                if (div2.children().length > 2)
                    ctrl2 = div2.children()[2];
            }

            //var eList = from child in tblpnlA.Children
            //where Grid.GetRow((FrameworkElement)child) == row && Grid.GetColumn((FrameworkElement)child) == col
            //select child;

            //Remove any elements in the list
            if (ctrl != null) {
                $(ctrl).remove();
                if (ctrl2 != null)
                    $(ctrl2).remove();
                ctrl = null;
            }
            /**********************************/
            var crt = null;
            // if any filed is given
            if (field != null) {
                // if field id any key, then show number textbox 
                if (field.getIsKey()) {
                    crt = new VIS.Controls.VNumTextBox(field.getColumnName(), false, false, true, field.getDisplayLength(), field.getFieldLength(),
                        field.getColumnName());
                }
                else {
                    crt = VIS.VControlFactory.getControl(null, field, true, true, false);
                }
            }
            else {
                // if no field is given show an empty disabled textbox
                crt = new VIS.Controls.VTextBox("columnName", false, true, false, 20, 20, "format",
                    "GetObscureType", false);// VAdvantage.Controls.VTextBox.TextType.Text, DisplayType.String);
            }
            if (crt != null) {
                //crt.SetIsMandatory(false);
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
                else {
                    div2.append(crt.getControl());
                    control2 = crt;
                    if (btn) {
                        div2.append(btn);
                        crt.getControl().css("width", "calc(100% - 30px)");
                        btn.css("max-width", "30px");
                    }
                }

                if (field.getDisplayType() == VIS.DisplayType.AmtDimension) {
                    crt.getControl().css("width", "100%");
                }
            }
        };


        function getControlValue(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(2, 1);
                crtlObj = control1;
            }
            else {
                //  crtlObj = (IControl)tblpnlA2.GetControlFromPosition(3, 1);
                crtlObj = control2;
            }
            // if control exists
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
                // return control's value
                if (crtlObj.displayType == VIS.DisplayType.AmtDimension) {
                    return crtlObj.getText();
                }
                else {
                    return crtlObj.getValue();
                }
            }
            return "";
        };

        /* <param name="isValue1">true if get control's text at value1 position else false</param>
         */
        function getControlText(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(2, 1);
                crtlObj = control1;
            }
            else {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(3, 1);
                crtlObj = control2;
            }
            // if control exists
            if (crtlObj != null) {
                // get control's text

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
                // set column value
                colValue = cVal.toString();
            }

            var opName = drpOp.find("option:selected").text();            
            // set operator (sign)
            var opValue = drpOp.val();

            var andOr = drpAndOr.val();

            if (tblSetValue.find('tbody [data-cVal="' + cVal + '"]').length > 0) {
                return;
            }

            var htm = '<tr class="vis-advancedSearchTableRow">'
                + '<td>' + andOr+'</td>'
                + '<td data-cVal="' + cVal + '">' + colName + '</td>'
                + '<td data-opValue="' + opValue + '">' + opName+'</td>'
                + '<td data-QryVal="' + getControlValue(true) + '">' + getControlText(true) + '</td>'
                + '<td data-QryVal2="' + getControlValue(false) + '">' + getControlText(false) + '</td>'
                + '<td><i style="cursor:pointer" class="vis vis-delete" onclick="$(this).closest(\'tr\').remove()"></i></td></tr>'
                + '</tr>';

            tblWhereCondition.find('tbody').append(htm);

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
                // set column value
                colValue = cVal.toString();
            }

            if (tblSetValue.find('tbody [data-cVal="' + cVal + '"]').length > 0) {
                return;
            }

            var htm = '<tr class="vis-advancedSearchTableRow"><td data-cVal="' + cVal + '">' + colName + '</td>'
                + '<td data-setVal="' + getControlValue(true) + '">' + getControlText(true) + '</td>'
                + '<td><i style="cursor:pointer" class="vis vis-delete" onclick="$(this).closest(\'tr\').remove()"></i></td></tr>'
            tblSetValue.find('tbody').append(htm);
        }

        function excuteQuery() {
            var objSetValue = [];
            tblSetValue.find('tbody tr').each(function () {
                objSetValue.push({
                    column: $(this).find('td:eq(0)').data('cval'),
                    setValue: $(this).find('td:eq(1)').data('setval')
                });
            });

            var objWhere = [];
            tblWhereCondition.find('tbody tr').each(function () {
                objWhere.push({
                    andOr: $(this).find('td:eq(0)').text(),
                    column: $(this).find('td:eq(1)').data('cval'),
                    opValue: $(this).find('td:eq(2)').data('opvalue'),
                    qryval: $(this).find('td:eq(3)').data('qryval'),
                    qryval2: $(this).find('td:eq(3)').data('qryval2')
                });
            });

            var orgList = [];

            $('.vis-RecentRecords-listWrap ul input:checked').each(function () {
                orgList.push({
                    orgID:$(this).val()
                });
            })


            if (whereExtended != null && whereExtended.length > 0) {
                if (whereExtended.indexOf("@") > 0) {
                    whereExtended = VIS.Env.parseContext(VIS.context, windowNo, whereExtended, false);
                }
            }

            var obj = {
                AD_Table_ID: AD_Table_ID,
                whereExtended: whereExtended,
                setValue: objSetValue,
                whereCondition: objWhere,
                orgList: orgList
            }


            $.ajax({
                url: baseUrl + 'BatchUpdate/ExcuteBatchUpdate',
                type: "POST",
                datatype: "json",
                contentType: "application/json; charset=utf-8",
                async: false,
                data: JSON.stringify(obj)
            }).done(function (json) {
                divMessage.text(json);
            });


        }

        setView();

        this.show = function () {
            ch = new VIS.ChildDialog();

            ch.setHeight(700);
            ch.setWidth(900);
            ch.setTitle(VIS.Msg.getMsg("BatchUpdate"));
            ch.setModal(true);
            //Disposing Everything on Close
            ch.onClose = function () {
                //$self.okBtnPressed = false;
                if ($self.onClose) $self.onClose();
                $self.dispose();
            };

            ch.show();
            ch.setContent($root);
            ch.hideButtons();
            setBusy(false);
            
        };

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