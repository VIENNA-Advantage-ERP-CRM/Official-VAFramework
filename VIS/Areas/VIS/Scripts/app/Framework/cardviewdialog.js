; (function (VIS, $) {

    function cvd(aPanel) {
        var self = this;
        var gc = aPanel.curGC;
        var mTab = gc.getMTab();
        var WindowNo = mTab.getWindowNo();
        var cardView = gc.vCardView;
        var AD_Window_ID = mTab.getAD_Window_ID();
        var AD_Tab_ID = mTab.getAD_Tab_ID();
        var AD_CardView_ID = cardView.getAD_CardView_ID();
        var AD_GroupField_ID = cardView.getField_Group_ID();
        var tabField = mTab.getFields();
        var findFields = mTab.getFields().slice();


        var control1 = null;
        var control2 = null;
        var divValue1 = null;
        var cardViewColumns = [];
        var columnFieldArray = [];
        var cardViewColArray = [];
        var totalTabFileds = [];
        var orginalIncludedCols = [];
        var cvTable = null;
        var cardviewCondition = [];
        var cvConditionArray = null;
        var chkDefault = null;
        var chkPublic = null;

        //aPanel.fromCardDialogBtn = false;

        var root, ch, chCopy;
        var btnCardCustomization = null;
        var btnChangeTemplate = null;
        var btnSaveClose = null;
        var DivCradStep1 = null;
        var DivCradStep2 = null;
        var btnLayoutSetting = null;
        var btnFinesh = null;
        var btnOnlySave = null;
        var count = 1;
        var LstCardViewCondition = null;
        var dbResult = null;
        var cardViewInfo = [];
        var cardsList = null;
        var txtCardName = null;
        var cmbColumn = null;
        var drpOp = null;
        var cmbGroupField = null;
        //var availableFeilds = null;
        //var includedFeilds = null;
        var groupSequenceFeilds = null;
        var cmbOrderClause = null;
        var sortList = null;
        var isAsc = "ASC";
        var btnCopy = null;
        var btnEdit = null;
        var btnDelete = null;
        var btnCancle = null;
        var btnNewCards = null;
        var chkGradient = null;
        var txtBgColor = null;
        var DivGrdntBlock = null;
        var txtGrdntColor1 = null;
        var txtGrdntColor2 = null;
        var txtGrdntPrcnt = null;
        var txtGrdntPrcnt2 = null;
        var cmbGrdntDirection = null;
        var btnAddCondition = null;
        var isEdit = false;
        var isNewRecord = false;
        var closeDialog = true;
        var btnAddOrder = null;
        var isBusyRoot = null;
        var isSameUser = true;
        var lastSelectedID = null;
        var mdown = false;
        var DivViewBlock = null;
        var DivStyleSec1 = null;
        var chkAllBorderRadius = null;
        var chkAllPadding = null;
        var chkAllMargin = null;
        var chkAllBorder = null;
        var DivTemplate = null;
        var DivGridSec = null;
        var startRowIndex = null;
        var startCellIndex = null;
        var txtRowGap = null;
        var txtColGap = null;
        var DivCardField = null;
        var activeSection = null;
        //var txtTemplateName = null;
        var sectionCount = 2;
        var AD_HeaderLayout_ID = 0;
        var refTempID = 0;
        var templateID = 0;
        var templateName = null;
        var txtCustomStyle = null;
        var txtSQLQuery = null;
        var CardCreatedby = null;
        var hideShowGridSec = null;
        var txtZoomInOut = null;
        var divTopNavigator = null;
        var btn_BlockCancel = null;
        var btnTemplateBack = null;
        var spnLastSaved = null;
        var isChange = false;
        var isOnlySave = false;
        var isSystemTemplate = 'Y';
        var isCopy = false;
        var dragged = null;
        var rowIdx = null;
        var colIdx = null;
        var addedColPos = [];
        var isNewSection = false;
        var isChangeTemplate = false;
        var btnVaddrow = null;
        var btnVaddCol = null;
        var btnVdelrow = null;
        var btnVdelCol = null;
        var txtFilterField = null;
        var btnClearFilter = null;
        var gridObj = {
        };

        var btnUndo = null;
        var btnRedo = null;
        var btnApply = null;
        var cmbTemplateCategory = null;

        var isUndoRedo = false;
        var history = [];
        var s_history = true;
        var cur_history_index = 0;
        var force = 0;
        var newCopyCard = null;

        function init() {
            root = $('<div style="height:100%"><div class="vis-apanel-busy vis-cardviewmainbusy" style="display:block"></div></div>');
            isBusyRoot = $("<div class='vis-apanel-busy vis-cardviewmainbusy'></div> ");


            var url = VIS.Application.contextUrl + "CardView/GetTemplateDesign";
            var obj = {
                ad_Window_ID: mTab.getAD_Window_ID(),
                ad_Tab_ID: mTab.getAD_Tab_ID()
            }

            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(obj),
                success: function (data) {
                    var result = JSON.parse(data);
                    //console.log(result);
                    CardViewUI(result);

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                }, complete: function () {

                }
            });

        }

        function IsBusy(isBusy) {
            if (isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "block" });
            }
            if (!isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "none" });
            }
        };

        // #region Step 1 Events

        function events() {
            /*Step 1 Events*/
            btnCardCustomization.click(function (e) {
                closeDialog = false;
                divTopNavigator.hide();
                count = 1;
                DivTemplate.show();
                DivCardFieldSec.hide();
                DivCradStep1.hide();
                DivCradStep2.show();
                DivTemplate.find('.mainTemplate[templateid="' + AD_HeaderLayout_ID + '"]').parent().click();
                DivStyleSec1.hide();
                DivCradStep2.find('.vis-two-sec-two').hide();
                scaleTemplate();
                if (!isNewRecord) {
                    btnLayoutSetting.click();
                }
            });

            btnSaveClose.click(function (e) {
                closeDialog = true;
                cardViewColArray = [];
                VIS.context.setContext("CardDialogLaststepSelected_" + WindowNo, 1);
                SaveChanges(e);
            });

            btnTemplateBack.click(function (e) {
                if (AD_CardView_ID == "undefined") {
                    btnBack.click();
                } else {
                    count++;
                    DivTemplate.hide();
                    DivCardFieldSec.show();
                    DivCradStep2.find('.vis-two-sec-two').show();
                    DivStyleSec1.show();
                }
            });

            btnNewCard.click(function () {
                isEdit = false;
                isNewRecord = true;
                resetAll();
                enableDisable(true);
                lastSelectedID = cardsList.find('.crd-active').attr('idx');
                cardsList.find('.crd-active').removeClass('crd-active');

                btnSaveClose.removeClass('vis-disable-event');
                btnFinesh.removeClass('vis-disable-event');
                btnOnlySave.removeClass('vis-disable-event');
                btnChangeTemplate.removeClass('vis-disable-event');
                AD_HeaderLayout_ID = 0;
                refTempID = 0;
                AD_CardView_ID = "undefined";

                cmbTemplateCategory.val('');
                DivTemplate.find('[issystemtemplate="Y"]').removeClass('displayNone');

                btnTemplateBack.text(VIS.Msg.getMsg("Back"));
                btnLayoutSetting.text(VIS.Msg.getMsg("NextLayout"));
                btnCardCustomization.click();
            });

            btnApply.click(function (e) {
                closeDialog = false;
                IsBusy(true);
                SaveChanges(e);
            });

            btnCopy.click(function () {
                newCopyCard = new cardCopyDialog();
                newCopyCard.show();
                newCopyCard.btnCopySave.click(function () {
                    var newcardname = newCopyCard.getName();
                    if (newcardname && newcardname.length > 0) {
                        IsBusy(true);
                        saveCopyCard(newcardname);
                    }
                });

                newCopyCard.btnCopyCancle.click(function () {
                    newCopyCard.close();
                });

            });

            btnCancle.click(function () {
                isNewRecord = false;
                isEdit = true;
                enableDisable(false);
                cardsList.find('[idx="' + lastSelectedID + '"]').click();
            });

            btnLayoutSetting.click(function () {
                txtFilterField.val('');
                DivCardField.find('.fieldLbl:not(:first)').show();
                addSelectedTemplate();
                count++;
                fillcardLayoutfromTemplate();
                DivTemplate.hide();
                DivCardFieldSec.show();
                DivCradStep2.find('.vis-two-sec-two').show();
                DivStyleSec1.show();
                if (AD_HeaderLayout_ID == 0 && DivGridSec.find('.rowBox').length == 1) {
                    DivGridSec.find('.addGridCol').click();
                    DivGridSec.find('.addGridRow').click();
                }

                if (AD_HeaderLayout_ID == 0 && !isCopy) {
                    DivViewBlock.find('.vis-viewBlock').css('backgroundColor', '#fff');
                }



                if (isCopy) {
                    setTimeout(function () {
                        btnFinesh.click();
                    }, 2000);
                }


                var templatePreview = DivCardFieldSec.find('.vis-templatePreview');
                var inner = DivTemplate.find('.vis-active-template .mainTemplate').clone(true);
                templatePreview.html(inner);

                var pH = templatePreview.height();
                var pW = templatePreview.width();
                var iH = inner.height();
                var iW = inner.width();
                var zoom = 1;
                var hR = pH / iH;
                var wR = pW / iW;
                if (hR > wR) {
                    zoom = wR;
                } else {
                    zoom = hR;
                }


                templatePreview.find('.mainTemplate').css("zoom", zoom);
                isUndoRedo = false;
                history = [];
                s_history = true;
                cur_history_index = 0;
                templatechanges();
                btnUndo.attr("disabled", "disabled");
                //FillFields(true, false);
            });

            btnChangeTemplate.click(function () {
                btnTemplateBack.text(VIS.Msg.getMsg("Cancle"));
                btnLayoutSetting.text(VIS.Msg.getMsg("Ok"));
                divTopNavigator.hide();
                count--;
                DivTemplate.show();
                DivCardFieldSec.hide();
                DivStyleSec1.hide();
                DivCradStep2.find('.vis-two-sec-two').hide();
                scaleTemplate();
                isChangeTemplate = true;
                cmbTemplateCategory.val('');
                DivTemplate.find('[issystemtemplate="Y"]').removeClass('displayNone');
            });

            btnFinesh.click(function (e) {
                isOnlySave = false;
                closeDialog = true;
                cardViewColArray = [];
                VIS.context.setContext("CardDialogLaststepSelected_" + WindowNo, 2);
                saveTemplate(e);
            });

            btnOnlySave.click(function (e) {
                isOnlySave = true;
                saveTemplate(e);
                var tme = new Date();
                var dateString = '';
                var h = tme.getHours();
                var m = tme.getMinutes();
                var s = tme.getSeconds();
                var ampm = h >= 12 ? 'PM' : 'AM';
                h %= 12;
                h = h || 12;
                if (h < 10) h = '0' + h;
                if (m < 10) m = '0' + m;
                if (s < 10) s = '0' + s;

                dateString = h + ':' + m + ':' + s + ' ' + ampm;

                spnLastSaved.text(VIS.Msg.getMsg("LastSaved") + " " + dateString);
                DivTemplate.find('.mainTemplate[templateid="' + AD_HeaderLayout_ID + '"]').parent().attr('lastupdated', dateString);
            });

            btnBack.click(function () {
                resetAll();
                DivCradStep1.show();
                DivCradStep2.hide();
                btnCancle.click();
            });

            btnDelete.click(function () {
                VIS.ADialog.confirm("SureWantToDelete", true, "", VIS.Msg.getMsg("Confirm"), function (result) {
                    if (result) {
                        DeleteCardView();
                    }
                });
            });

            btnCardAsc.on('click', function () {
                if (cmbOrderClause.val() == -1 || cmbOrderClause.val() == null)
                    return;

                btnCardAsc.css('color', 'rgba(var(--v-c-primary), 1)');
                btnCardDesc.css('color', 'rgba(var(--v-c-on-secondary), 1)');
                isAsc = "ASC";
            });

            btnCardDesc.on('click', function () {

                if (cmbOrderClause.val() == -1 || cmbOrderClause.val() == null)
                    return;

                btnCardAsc.css('color', 'rgba(var(--v-c-on-secondary), 1)');
                btnCardDesc.css('color', 'rgba(var(--v-c-primary), 1)');
                isAsc = "DESC";
            });

            addCardListEvent();

            groupSequenceFeilds.find('.grpChk').click(function () {
                if ($(this).hasClass('fa-check-square-o')) {
                    $(this).removeClass('fa-check-square-o').addClass('fa-square-o');
                } else {
                    $(this).removeClass('fa-square-o').addClass('fa-check-square-o');
                }
            });

            chkGradient.click(function () {
                if ($(this).is(':checked')) {
                    DivGrdntBlock.show();
                    txtBgColor.hide();
                } else {
                    DivGrdntBlock.hide();
                    txtBgColor.show();
                }
            });

            txtGrdntColor1.on('input', function () {
                updateGradientColor();
            });

            txtGrdntColor2.on('input', function () {
                updateGradientColor();
            });

            txtGrdntPrcnt.on('input', function () {
                updateGradientColor();
            });

            txtGrdntPrcnt2.on('input', function () {
                updateGradientColor();
            });

            cmbGrdntDirection.on('change', function () {
                updateGradientColor();
            });

            $('body').mouseup(function (e) {
                mdown = false;
            });

            btnAddCondition.click(function () {
                if (cmbColumn.find(":selected").val() == -1) {
                    return;
                }

                if (control1.isMandatory && (getControlValue(true) == null || getControlValue(true) == '')) {
                    VIS.ADialog.error("FillMandatory", true, control1.colName);
                    return;
                }

                var condition = {};
                cvConditionArray = {};

                var colorValue = "";
                if (chkGradient.is(':checked')) {
                    colorValue = DivGrdntBlock.find('.grd-preview').css('background');
                } else {
                    if (!Modernizr.inputtypes.color) {
                        colorValue = ctrColor.spectrum('get');
                    }
                    else {
                        colorValue = txtBgColor.val();
                    }
                }

                var index = $.map(cardviewCondition, function (value, i) {
                    if (value.Color == colorValue) {
                        return i;
                    }
                });


                if (index.length <= 0) {
                    cvConditionArray["Color"] = colorValue.toString();
                    cvConditionArray["Condition"] = [];
                    condition["ColHeader"] = cmbColumn.find(":selected").text();
                    condition["ColName"] = cmbColumn.find(":selected").val();
                    condition["Operator"] = drpOp.val();
                    condition["OperatorText"] = drpOp.find(":selected").text();;
                    condition["QueryValue"] = getControlValue(true);
                    condition["QueryText"] = getControlText(true);
                    cvConditionArray["Condition"].push(condition);
                    cardviewCondition.push(cvConditionArray);
                }
                else {
                    condition["ColHeader"] = cmbColumn.find(":selected").text();
                    condition["ColName"] = cmbColumn.find(":selected").val();
                    condition["Operator"] = drpOp.val();
                    condition["OperatorText"] = drpOp.find(":selected").text();;
                    condition["QueryValue"] = getControlValue(true);
                    condition["QueryText"] = getControlText(true);
                    cardviewCondition[index[0]].Condition.push(condition);
                }
                AddRow(cardviewCondition);
                cmbColumn.val('-1');
                drpOp[0].SelectedIndex = -1;
                SetControlValue(true);
                SetControlText(true);
                txtGrdntColor1.val('#000');
                txtGrdntColor2.val('#000');
                txtGrdntPrcnt.val(0);
                txtGrdntPrcnt2.val(0);
                cmbGrdntDirection.val('to bottom');
                DivGrdntBlock.find('.grd-preview').css('background', '#000');
                //divValue1.empty();
            });

            btnAddOrder.on("click", function (e) {
                var selectedVal = cmbOrderClause.val();

                if (selectedVal == -1) {
                    return;
                }

                btnCardAsc.css('color', 'rgba(var(--v-c-on-secondary), 1)');
                btnCardDesc.css('color', 'rgba(var(--v-c-on-secondary), 1)');

                if (sortOrderArray && sortOrderArray.length < 3) {
                    var selectedColtext = cmbOrderClause.find(':selected').text();


                    if (sortOrderArray.indexOf(selectedVal + ' ASC') > -1 || sortOrderArray.indexOf(selectedVal + ' DESC') > -1) {
                        VIS.ADialog.warn("CardSortColAdded");
                        return;
                    }

                    addOrderByClauseItems(selectedColtext, selectedVal, isAsc);
                    sortOrderArray.push(selectedVal + ' ' + isAsc);
                    cmbOrderClause.val(-1);
                }
                else {
                    VIS.ADialog.warn("MaxSortColumn");
                }
            });

            sortList.on("click", function (e) {
                if (isEdit || isNewRecord) {
                    var $target = $(e.target);
                    if ($target.hasClass('fa-close'))
                        $target = $target.parent();

                    if ($target.hasClass('vis-sortListItemClose')) {
                        const itemid = sortOrderArray.indexOf($target.data('text'));
                        sortOrderArray.splice(itemid, 1);
                        $target.closest('.vis-sortListItem').remove();
                    }
                }
            });

            if (cmbColumn != null) {
                cmbColumn.on("change", function (evt) {
                    evt.stopPropagation();
                    var columnName = cmbColumn.val();
                    setControlNullValue(true);
                    if (columnName && columnName != "-1") {
                        var dsOp = null;
                        var dsOpDynamic = null;
                        if (columnName.endsWith("_ID") || columnName.endsWith("_Acct") || columnName.endsWith("_ID_1") || columnName.endsWith("_ID_2") || columnName.endsWith("_ID_3")) {
                            // fill dataset with operators of type ID
                            dsOp = self.getOperatorsQuery(VIS.Query.prototype.CVOPERATORS_ID);
                        }
                        else if (columnName.startsWith("Is")) {
                            // fill dataset with operators of type Yes No
                            dsOp = self.getOperatorsQuery(VIS.Query.prototype.OPERATORS_YN);
                        }
                        else {
                            // fill dataset with all operators available
                            dsOp = self.getOperatorsQuery(VIS.Query.prototype.CVOPERATORS);
                        }

                        var f = mTab.getField(columnName);
                        drpOp.html(dsOp);
                        drpOp[0].SelectedIndex = 0;
                        // get field
                        var field = getTargetMField(columnName);
                        // set control at value1 position
                        setControl(true, field);
                        // enable the save row button
                        // setEnableButton(btnSave, true);//silverlight comment
                        drpOp.prop("disabled", false);
                    }
                    // enable control at value1 position
                    setValueEnabled(true);
                    // disable control at value2 position
                    // setValue2Enabled(false);
                });
            }

            if (drpOp != null) {
                drpOp.on("change", function () {
                    var selOp = drpOp.val();
                    // set control at value2 position according to the operator selected
                    if (!selOp) {
                        selOp = "";
                    }

                    var columnName = "";
                    var field = "";
                    if (selOp && selOp != "0") {
                        //if user selects between operator
                        if (VIS.Query.prototype.BETWEEN.equals(selOp)) {
                            columnName = cmbColumn.val();
                            // get field
                            field = getTargetMField(columnName);
                            // set control at value2 position
                            setControl(false, field);
                            // enable the control at value2 position
                            // setValue2Enabled(true);
                        }
                        else {
                            //setValue2Enabled(false);
                        }
                    }
                    else {
                        setEnableButton(btnSave, false);//
                        // setValue2Enabled(false);
                        setControlNullValue(true);
                    }
                });
            }

            if (cmbGroupField != null) {
                cmbGroupField.on("change", function () {
                    AD_GroupField_ID = parseInt($(this).find(":selected").val());
                    FillforGroupSeq(AD_GroupField_ID);
                });
            }

            if (cvTable != null) {
                cvTable.on("click", "tr .td_Action i", function () {
                    if (isEdit || isNewRecord) {
                        var rowIndex = $(this).parent().parent().index();
                        var selectRowColor = $(this).parent().parent().children().eq(0).attr("value");
                        var colName = $(this).parent().parent().children().eq(1).attr("value");
                        cvTable.find("tr").eq(rowIndex).remove();
                        var idx = $.map(cardviewCondition, function (value, i) {
                            if (value.Color == selectRowColor) {
                                return i;
                            }
                        });
                        for (i = 0; i < cardviewCondition[idx].Condition.length; i++) {

                            if (colName == cardviewCondition[idx].Condition[i].ColName) {
                                cardviewCondition[idx].Condition.splice(i, 1);
                            }
                            if (cardviewCondition[idx].Condition.length <= 0) {
                                cardviewCondition.splice(idx, 1);
                                break;
                            }
                        }
                    }
                    if (cardviewCondition.length == 0) {
                        AddRow("");
                    }
                });
            }

            txtCustomStyle.change(function () {
                var selectedItem = DivViewBlock.find('.vis-active-block');
                selectedItem.attr("style", $(this).val());
            });

            txtSQLQuery.change(function () {
                var selectedItem = DivViewBlock.find('.vis-active-block');
                if ($(this).val() == null || $(this).val() == "") {
                    selectedItem.find('sql').remove();
                    selectedItem.attr("query", "");
                } else {
                    var qry = VIS.secureEngine.encrypt($(this).val());
                    selectedItem.attr("query", qry);
                    if (selectedItem.find('sql').length == 0) {
                        selectedItem.append('<sql>SQL</sql>');
                    }
                }

            });

            txtZoomInOut.on('input', function () {
                DivViewBlock.find('.canvas').css('zoom', $(this).val());
            })

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("dragstart", function (event) {
                // store a ref. on the dragged elem
                dragged = $(event.target);
                if (dragged.hasClass('grdDiv') || !(event.ctrlKey)) {
                    event.preventDefault();
                } else {
                    divTopNavigator.hide();
                    mdown = false;
                }
            }, false);

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("dragover", function (event) {
                // prevent default to allow drop
                event.preventDefault();
            });

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("drop", function (event) {
                // prevent default action (open as link for some elements)
                event.preventDefault();
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                var fldLbl = null;
                var ev = $(event.target);
                if (ev.hasClass('grdDiv')) {
                    if (!dragged.hasClass('.fieldLbl')) {
                        fldLbl = dragged.find('.fieldLbl');
                    }

                    if (fldLbl.length > 0) {
                        ev.append(dragged);
                    } else {
                        ev.addClass('vis-active-block');
                        linkField(dragged);
                    }
                    templatechanges();
                }
            });

            btnUndo.click(function (e) {
                if (cur_history_index > 0) {
                    isUndoRedo = true;
                    s_history = false;
                    canv_data = JSON.parse(history[cur_history_index - 1]);
                    DivViewBlock.find('.vis-viewBlock').html(canv_data);
                    cur_history_index--;
                    btnRedo.removeAttr("disabled");
                    fillcardLayoutfromTemplate();
                    isUndoRedo = false;
                    if (cur_history_index <= 0) {
                        btnUndo.attr("disabled", "disabled");
                    }
                }
                else {
                    btnUndo.attr("disabled", "disabled");
                }
                markfilledField();
            });

            btnRedo.click(function (e) {
                if (history[cur_history_index + 1]) {
                    isUndoRedo = true;
                    s_history = false;
                    canv_data = JSON.parse(history[cur_history_index + 1]);
                    DivViewBlock.find('.vis-viewBlock').html(canv_data);
                    cur_history_index++;
                    btnUndo.removeAttr("disabled");
                    fillcardLayoutfromTemplate();
                    isUndoRedo = false;
                    if (cur_history_index >= history.length - 1) {
                        btnRedo.attr("disabled", "disabled");
                    }
                }
                else {
                    btnRedo.attr("disabled", "disabled");
                }

                markfilledField();
            });

            txtFilterField.keyup(function () {
                var value = $(this).val();
                if (value == "") {
                    DivCardField.find('.fieldLbl:not(:first)').show();
                } else {
                    DivCardField.find('.fieldLbl').hide();
                    DivCardField.find('.fieldLbl:contains(' + value + ')').show();
                }
            });

            btnClearFilter.click(function () {
                txtFilterField.val('');
                txtFilterField.focus();
                DivCardField.find('.fieldLbl:not(:first)').show();
            });

            cmbTemplateCategory.change(function () {
                if ($(this).val() != "") {
                    DivTemplate.find('[issystemtemplate="Y"]').not('.blankTemp').addClass('displayNone');
                    DivTemplate.find('[issystemtemplate="Y"][category="' + $(this).val() + '"]').removeClass('displayNone');
                } else {
                    DivTemplate.find('[issystemtemplate="Y"]').removeClass('displayNone');
                }

                if (DivTemplate.find('.vis-cardSingleViewTemplate:not(:hidden)').length == 1) {
                    DivTemplate.find('.vis-noTemplateIcon').show();
                } else {
                    DivTemplate.find('.vis-noTemplateIcon').hide();
                }
            });

            jQuery.expr[':'].contains = function (a, i, m) {
                return jQuery(a).text().toUpperCase()
                    .indexOf(m[3].toUpperCase()) >= 0;
            };

            DivViewBlock.find('.vis-viewBlock').on('DOMSubtreeModified', function () {
                var iH = DivViewBlock.height();
                var cH = DivViewBlock.find('.canvas').height();
                if (iH && cH && cH > iH) {
                    DivViewBlock.find('.canvas').addClass('canvasOverFlow');
                } else {
                    DivViewBlock.find('.canvas').removeClass('canvasOverFlow');
                }

            });

            /* End Step 1*/

        }

        function markfilledField() {
            DivCardField.find('.linked').removeClass('linked vis-succes-clr');
            DivCardField.find('.fieldLbl:not(:first)').prop("draggable", true);
            DivViewBlock.find('.vis-viewBlock').find('.fieldLbl').each(function () {
                var fidUR = DivCardField.find('[fieldid="' + $(this).attr('fieldid') + '"]');
                fidUR.find('.fa-circle').addClass('linked vis-succes-clr');
                fidUR.prop("draggable", false);
            });

            DivCardField.find('[draggable="true"]:not(:first)').sort(Ascending_sort).appendTo(DivCardField);
            DivViewBlock.find('.grdDiv').unbind('mouseover');
            DivViewBlock.find('.grdDiv').mouseover(function (e) {
                if (mdown && !$(this).hasClass('vis-split-cell')) {
                    selectTo($(this));
                }
            });

        }

        function Ascending_sort(a, b) {
            return ($(b).attr('title').toUpperCase()) <
                ($(a).attr('title').toUpperCase()) ? 1 : -1;
        }

        function addCardListEvent() {
            cardsList.find('div').unbind('click');
            cardsList.find('div').click(function () {
                cardsList.find('.crd-active').removeClass('crd-active');
                $(this).addClass('crd-active');
                cmbOrderClause.val(-1);
                sortOrderArray = [];
                lastSortOrderArray = [];
                LastCVCondition = [];

                var idx = $(this).attr('idx');
                lastSelectedID = idx;
                if (cardViewInfo && cardViewInfo.length != 0) {
                    ControlMgmt(idx);
                    txtCardName.val(cardViewInfo[idx].CardViewName);
                    //txtTemplateName.val(cardViewInfo[idx].CardViewName);
                    AD_CardView_ID = cardViewInfo[idx].CardViewID;
                    cardViewUserID = cardViewInfo[idx].CreatedBy;
                    chkDefault.prop("checked", cardViewInfo[idx].DefaultID ? true : false);
                    chkPublic.prop("checked", cardViewInfo[idx].UserID == 0 ? false : true);
                    AD_HeaderLayout_ID = cardViewInfo[idx].AD_HeaderLayout_ID;
                    //templateID = AD_HeaderLayout_ID;
                    if (cardViewInfo && cardViewInfo[idx].OrderByClause && cardViewInfo[idx].OrderByClause.length) {
                        addOrderByClauseFromDB(cardViewInfo[idx].OrderByClause);
                    }
                    else {
                        clearOrderByClause();
                    }

                    if (AD_CardView_ID > 0) {
                        FillFields(true, false);

                    } else {
                        FillFields(false, false);
                    }
                    FillGroupFields();

                }

            });
        }

        // #endregion

        function CardViewUI(temResult) {
            root.load(VIS.Application.contextUrl + 'CardViewWizard/Index/?windowno=' + WindowNo, function (event) {
                /*step 1*/
                root.append(isBusyRoot);
                IsBusy(true);
                DivCradStep1 = root.find('#DivCardStep1_' + WindowNo);
                DivCradStep1.hide();
                btnCardCustomization = root.find('#btnCardCustomization_' + WindowNo);
                btnSaveClose = root.find('#btnSaveCloseStep1_' + WindowNo);
                btnApply = root.find('#btnApplyStep1_' + WindowNo);
                btnLayoutSetting = root.find('#BtnLayoutSetting_' + WindowNo);
                btnChangeTemplate = root.find('#BtnChangeTemplate_' + WindowNo);
                btnTemplateBack = root.find('#BtnTemplateBack_' + WindowNo);

                btnBack = root.find('#BtnBack_' + WindowNo);
                btnFinesh = root.find('#BtnFinesh_' + WindowNo);
                btnOnlySave = root.find('#btnOnlySave_' + WindowNo);
                cardsList = root.find('#DivCardList_' + WindowNo);
                txtCardName = root.find('#txtCardName_' + WindowNo);
                cmbGroupField = root.find('#cmbGroupField_' + WindowNo);
                //availableFeilds = root.find('#AvailableFeilds_' + WindowNo);
                //includedFeilds = root.find('#IncludedFeilds_' + WindowNo);
                groupSequenceFeilds = root.find('#GroupSequenceFeilds_' + WindowNo);
                cvTable = root.find('#conditionTable_' + WindowNo);
                cmbColumn = root.find('#cmbColumn_' + WindowNo);
                drpOp = root.find('#ddlOperator_' + WindowNo);
                divValue1 = root.find('#valcontainer_' + WindowNo);
                cmbOrderClause = root.find('#cmbOrderClause_' + WindowNo);
                sortList = root.find('#sortList_' + WindowNo);
                chkDefault = root.find('#chkDefault_' + WindowNo);
                chkPublic = root.find('#chkPublic_' + WindowNo);
                btnNewCard = root.find('#btnNewCard_' + WindowNo);
                btnCopy = root.find('#btnCopy_' + WindowNo);
                //btnEdit = root.find('#btnEdit_' + WindowNo);
                btnDelete = root.find('#btnDelete_' + WindowNo);
                btnCancle = root.find('#btnCancle_' + WindowNo);
                chkGradient = root.find('#chkGradient_' + WindowNo);
                txtBgColor = root.find('#txtBgColor_' + WindowNo);
                DivGrdntBlock = root.find('#DivGrdntBlock_' + WindowNo);
                txtGrdntColor1 = root.find('#txtGrdntColor1_' + WindowNo);
                txtGrdntColor2 = root.find('#txtGrdntColor2_' + WindowNo);
                txtGrdntPrcnt = root.find('#txtGrdntPrcnt_' + WindowNo);
                txtGrdntPrcnt2 = root.find('#txtGrdntPrcnt2_' + WindowNo);
                cmbGrdntDirection = root.find('#cmbGrdntDirection_' + WindowNo);

                btnAddCondition = root.find('#btnAddCondition_' + WindowNo);
                btnCardAsc = root.find('#btnCardAsc_' + WindowNo);
                btnCardDesc = root.find('#btnCardDesc_' + WindowNo);
                btnAddOrder = root.find('#btnAddOrder_' + WindowNo);
                spnLastSaved = root.find('#spnLastSaved_' + WindowNo);
                txtFilterField = root.find('#txtFilterField_' + WindowNo);
                btnClearFilter = root.find('#btnClearFilter_' + WindowNo);
                /*END Step 1*/

                /* Step 2*/
                DivCradStep2 = root.find('#DivCardStep2_' + WindowNo);
                DivViewBlock = root.find('#DivViewBlock_' + WindowNo);
                DivStyleSec1 = root.find('#DivStyleSec1_' + WindowNo);
                chkAllBorderRadius = root.find('#chkAllBorderRadius_' + WindowNo);
                chkAllPadding = root.find('#chkAllPadding_' + WindowNo);
                chkAllMargin = root.find('#chkAllMargin_' + WindowNo);
                chkAllBorder = root.find('#chkAllBorder_' + WindowNo);
                DivGridSec = root.find('#DivGridSec_' + WindowNo);
                //hideShowGridSec = root.find('.DivGridSec');
                DivTemplate = root.find('#DivTemplate_' + WindowNo);
                DivCardField = root.find('#DivCardField_' + WindowNo);
                //txtTemplateName = root.find('#txtTemplateName_' + WindowNo);
                DivCardFieldSec = root.find('#DivCardFieldSec_' + WindowNo);
                txtCustomStyle = root.find('#txtCustomStyle_' + WindowNo);
                txtSQLQuery = root.find('#txtSQLQuery_' + WindowNo);
                txtZoomInOut = root.find('#txtZoomInOut_' + WindowNo);
                btn_BlockCancel = root.find('#Btn_BlockCancel_' + WindowNo);

                btnUndo = root.find('#btnUndo_' + WindowNo);
                btnRedo = root.find('#btnRedo_' + WindowNo);

                divTopNavigator = DivCradStep2.find('.vis-topNavigator');
                txtRowGap = DivGridSec.find('.rowGap');
                txtColGap = DivGridSec.find('.colGap');

                btnVaddrow = root.find('#btnVaddrow_' + WindowNo);
                btnVaddCol = root.find('#btnVaddCol_' + WindowNo);

                btnVdelrow = root.find('#btnVdelrow_' + WindowNo);
                btnVdelCol = root.find('#btnVdelCol_' + WindowNo);
                cmbTemplateCategory = root.find('#CmbTemplateCategory_' + WindowNo);

                activeSection = DivViewBlock.find('.section1');

                isEdit = true;
                isNewRecord = false;
                //chkDefault.parent().hide();
                /*END Step 2*/

                ArrayTotalTabFields();
                for (var i = 0; i < temResult.length; i++) {
                    DivTemplate.find('.vis-cardTemplateContainer').append($(temResult[i].template));
                }

                //scaleTemplate();
                setTimeout(function () {
                    scaleTemplate();
                    if (DivTemplate.find('.vis-cardSingleViewTemplate:not(:hidden)').length == 1) {
                        DivTemplate.find('.vis-noTemplateIcon').show();
                    } else {
                        DivTemplate.find('.vis-noTemplateIcon').hide();
                    }
                    DivTemplate.find('.vis-cardSingleViewTemplate').click(function () {
                        DivTemplate.find('.vis-cardSingleViewTemplate').removeClass('vis-active-template');
                        $(this).addClass('vis-active-template');
                    });
                    DivCradStep1.show();

                    GetCards();
                    getTemplateCategory();
                    FillFields(true, false);
                    FillGroupFields();
                    FillCVConditionCmbColumn();
                    events();
                    events2();
                    updateGradientColor();

                    totalTabFileds.sort(function (a, b) {
                        var n1 = a.getHeader().toUpperCase();
                        if (n1 == null || n1.length == 0) {
                            n1 = VIS.Msg.getElement(VIS.context, a.getColumnName());
                        }
                        var n2 = b.getHeader().toUpperCase();
                        if (n2 == null || n2.length == 0) {
                            n2 = VIS.Msg.getElement(VIS.context, b.getColumnName());
                        }
                        if (n1 > n2) return 1;
                        if (n1 < n2) return -1;
                        return 0;
                    });
                    enableDisable(false);
                    cmbOrderClause.find('option').remove();
                    cmbOrderClause.append('<option value="-1"></option>)');

                    for (var j = 0; j < totalTabFileds.length; j++) {
                        var header = totalTabFileds[j].getHeader();
                        if (header == null || header.length == 0) {
                            header = VIS.Msg.getElement(VIS.context, totalTabFileds[j].getColumnName());
                            if (header == null || header.Length == 0)
                                continue;
                        }

                        cmbOrderClause.append('<option value="' + totalTabFileds[j].getColumnName() + '">' + header + '</option>')
                    }

                    if (cardViewInfo && cardViewInfo.length == 0) {
                        isSameUser = true;
                        btnNewCard.click();
                        btnDelete.addClass('vis-disable-event');
                        btnCancle.addClass('vis-disable-event');
                        btnCopy.addClass('vis-disable-event');
                    } else if (VIS.context.getContext("CardDialogLaststepSelected_" + WindowNo) == 2) {
                        btnCardCustomization.click();
                    }
                    IsBusy(false);

                }, 2000);

                //getTemplateDesign();

            });


        }

        // #region Step 1 functions
        var updateGradientColor = function () {
            var color1 = txtGrdntColor1.val();
            var color2 = txtGrdntColor2.val();
            var prct = txtGrdntPrcnt.val();
            var prct2 = txtGrdntPrcnt2.val();
            var deg = cmbGrdntDirection.find('option:selected').val();
            var style = 'linear-gradient(' + deg + ',' + color1 + ' ' + prct + '%,  ' + color2 + ' ' + prct2 + '%)';
            DivGrdntBlock.find('.grd-preview').css('background', style);
        }
        /**
         * Gradient degree
         * @param {any} id
         * @param {any} e
         */
        //var getGradientDeg = function (id, e) {
        //    var radius = 9;
        //    var deg = 0;
        //    var elP = id.parent().offset();
        //    var elPos = { x: elP.left, y: elP.top };

        //    if (mdown) {
        //        var mPos = { x: e.clientX - elPos.x, y: e.clientY - elPos.y };
        //        var atan = Math.atan2(mPos.x - radius, mPos.y - radius);
        //        deg = -atan / (Math.PI / 180) + 180; // final (0-360 positive) degrees from mouse position 
        //        deg = Math.ceil(deg);
        //        return deg;
        //        // AND FINALLY apply exact degrees to ball rotation

        //    }
        //}

        var ArrayTotalTabFields = function () {
            for (var i = 0; i < mTab.getFields().length; i++) {
                totalTabFileds.push(mTab.getFields()[i]);
            }

            for (var i = 0; i < cardView.fields.length; i++) {
                orginalIncludedCols.push(cardView.fields[i].getAD_Field_ID());
            }
        };

        /**
         * Get Login User's Card
         * @param {any} isReload
         */
        var GetCards = function (isReload) {
            var url = VIS.Application.contextUrl + "CardView/GetCardView";
            cardsList.html('');
            $.ajax({
                type: "GET",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: { ad_Window_ID: AD_Window_ID, ad_Tab_ID: AD_Tab_ID },
                success: function (data) {
                    dbResult = JSON.parse(data);
                    cardViewInfo = dbResult[0].lstCardViewData;
                    //roleInfo = dbResult[0].lstRoleData;
                    //LstCardViewRole = dbResult[0].lstCardViewRoleData;
                    LstCardViewCondition = dbResult[0].lstCardViewConditonData;

                    if (cardViewInfo != null && cardViewInfo.length > 0) {
                        btnDelete.removeClass('vis-disable-event');
                        var isDefaultcard = false;
                        for (var i = 0; i < cardViewInfo.length; i++) {
                            var template = "";
                            if (!isReload && AD_CardView_ID) {
                                if (cardViewInfo[i].CardViewID == AD_CardView_ID) {
                                    template = '<div idx="' + i + '" class="vis-lft-sgl p-2 d-flex flex-column mb-2 crd-active">';
                                } else {
                                    template = '<div idx="' + i + '" class="vis-lft-sgl p-2 d-flex flex-column mb-2">';
                                }
                            } else if (cardViewInfo[i].DefaultID && !isReload) {
                                isDefaultcard = true;
                                template = '<div idx="' + i + '" class="vis-lft-sgl p-2 d-flex flex-column mb-2 crd-active">';
                            } else if (isReload && cardViewInfo[i].CardViewID == AD_CardView_ID) {
                                template = '<div idx="' + i + '" class="vis-lft-sgl p-2 d-flex flex-column mb-2 crd-active">';
                            } else {
                                template = '<div idx="' + i + '" class="vis-lft-sgl p-2 d-flex flex-column mb-2">';
                            }

                            template += '<span class="vis-lft-sgl-title">' + w2utils.encodeTags(cardViewInfo[i].CardViewName) + '</span>'
                                + '    <span class="vis-lft-sgl-sub-title">Created By: ' + cardViewInfo[i].CreatedName + '</span>'
                                + '    <span class="vis-lft-sgl-sub-title">Last Modified: ' + new Date(cardViewInfo[i].Updated).toLocaleDateString() + '</span>'
                                + '</div>';

                            cardsList.append($(template));

                            //cardsList.append("<Option idx=" + i + " is_shared=" + cardViewInfo[i].UserID + " ad_user_id=" + cardViewInfo[i].CreatedBy + " cardviewid=" + cardViewInfo[i].CardViewID + " groupSequence='" + cardViewInfo[i].groupSequence + "' excludedGroup='" + cardViewInfo[i].excludedGroup + "'  ad_field_id=" + cardViewInfo[i].AD_GroupField_ID + " isdefault=" + cardViewInfo[i].DefaultID + " ad_headerLayout_id=" + cardViewInfo[i].AD_HeaderLayout_ID + "> " + w2utils.encodeTags(cardViewInfo[i].CardViewName) + "</Option>");
                        }

                        if (!isDefaultcard && !isReload && !AD_CardView_ID) {
                            cardsList.find('div:first').addClass("crd-active");
                            isReload = true;
                        }

                        var idx = cardsList.find(".crd-active").attr('idx');
                        lastSelectedID = idx;
                        AD_CardView_ID = cardViewInfo[idx].CardViewID;
                        txtCardName.val(cardViewInfo[idx].CardViewName);
                        //txtTemplateName.val(cardViewInfo[idx].CardViewName);
                        AD_HeaderLayout_ID = cardViewInfo[idx].AD_HeaderLayout_ID;
                        ControlMgmt(idx);
                        chkPublic.attr("checked", cardViewInfo[idx].UserID > 0 ? true : false);
                        chkDefault.attr("checked", cardViewInfo[idx].DefaultID ? true : false);

                        if (idx && cardViewInfo[idx].OrderByClause && cardViewInfo[idx].OrderByClause.length > 0) {
                            addOrderByClauseFromDB(cardViewInfo[idx].OrderByClause);
                        }
                        else {
                            clearOrderByClause();
                        }
                    } else {
                        btnDelete.addClass('vis-disable-event');
                        cardViewInfo = [];
                    }
                    //if (isReload) {                        
                    addCardListEvent();
                    //}

                    cardsList.scrollTop(cardsList.find('.crd-active').offset().top - cardsList.find('.crd-active').height() - 100); // focus selected card
                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                }
            });


        };

        /**
         * Get Template category for filter
         * */
        function getTemplateCategory() {
            cmbTemplateCategory.find('option').remove();
            cmbTemplateCategory.append('<option value="">All</option>');
            $.ajax({
                type: "POST",
                url: VIS.Application.contextUrl + "CardView/GetTemplateCategory",
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: {},
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result) {
                        for (var i = 0; i < result.length; i++) {
                            cmbTemplateCategory.append('<option value="' + result[i].TemplateCategoryID + '">' + result[i].Name + '</option>');
                        }
                    }
                    IsBusy(false);

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }
            });
        }

        /**
         *  Fill selected card template Layout
         * */

        var fillcardLayoutfromTemplate = function () {
            gridObj = {};
            var sClone = DivGridSec.find('.grid-Section:first').clone(true);
            sClone.removeClass('displayNone');
            DivGridSec.find('.grid-Section:not(:first)').remove();

            DivViewBlock.find('.vis-wizard-section').each(function (i) {
                var secNo = $(this).attr('sectionCount');
                if (i == 0) {
                    sClone.addClass('section-active');
                    $(this).addClass('vis-active-block');
                }
                sClone.attr('sectionCount', secNo);
                var secName = $(this).attr('name');
                sClone.find('.vis-grey-disp-ttl').text(secName);
                DivGridSec.find('.vis-sectionAdd').append(sClone);
                sClone = DivGridSec.find('.grid-Section:first').clone(true);
                sClone.removeClass('displayNone');

                if (!gridObj["section" + secNo]) {
                    var totalRow = $(this).attr('row');
                    var totalCol = $(this).attr('col');
                    var grdAreaCol = $(this)[0].style.gridTemplateColumns.split(' ');
                    var grdAreaRow = $(this)[0].style.gridTemplateRows.split(' ');
                    var Obj = {};
                    for (var i = 0; i < totalRow; i++) {
                        if (grdAreaRow.length > 0 && grdAreaRow[i] != 'auto') {
                            var v = grdAreaRow[i].replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
                            Obj['row_' + i] = {
                                val: v[0],
                                msr: v[1]
                            }
                        } else {
                            Obj['row_' + i] = {
                                val: 1,
                                msr: 'auto'
                            }
                        }
                    };

                    for (var j = 0; j < totalCol; j++) {
                        if (grdAreaCol.length > 0 && grdAreaCol[j] != 'auto') {
                            var c = grdAreaCol[j].replace(/\'/g, '').split(/(\d+)/).filter(Boolean);
                            Obj['col_' + j] = {
                                val: c[0],
                                msr: c[1]
                            }
                        } else {
                            Obj['col_' + j] = {
                                val: 1,
                                msr: 'auto'
                            }
                        }
                    }

                    Obj["sectionNo"] = secNo;
                    Obj["sectionName"] = secName;
                    Obj["rowGap"] = 0;
                    Obj["colGap"] = 0;
                    Obj["totalRow"] = totalRow;
                    Obj["totalCol"] = totalCol;

                    gridObj["section" + secNo] = Obj;
                }
            });

            DivGridSec.find('.vis-sectionAdd').sortable({
                disabled: false,
                update: function (event, ui) {
                    var sectionCount = ui.item.attr('sectioncount');
                    var end_pos = ui.item.index();
                    var next = ui.item.next().attr('sectioncount');
                    if (next) {
                        DivViewBlock.find('[sectioncount="' + next + '"]').before(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                    } else {
                        var pre = ui.item.prev().attr('sectioncount');
                        DivViewBlock.find('[sectioncount="' + pre + '"]').after(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                    }
                }
            });


            DivGridSec.find('.section-active .vis-grey-disp-el').click();
            DivGridSec.find('.vis-grey-disp-el-xross').eq(1).hide();
            if (!isNewRecord && !isChangeTemplate) {
                DivCardField.find('.fieldLbl[seqNo]').each(function (i) {
                    var fID = $(this).attr('fieldid');
                    if (DivViewBlock.find('[fieldid="' + fID + '"]').length == 0) {

                        var vlu = $(this).text();
                        var fidItm = DivViewBlock.find('[seqNo="' + $(this).attr('seqNo') + '"]');
                        //fidItm.html('');
                        if (fidItm.length == 0) {
                            $(this).find('.linked').removeClass('linked vis-succes-clr');
                        } else {

                            $(this).find('.fa-circle').addClass('linked vis-succes-clr');
                            $(this).prop("draggable", false);


                            var vlstyle = "";
                            var imgStyle = "";
                            var spnStyle = "";
                            var firstImg = false;
                            var brStart = 0;
                            var styleArr = fidItm.attr("fieldValuestyle");
                            if (styleArr && styleArr.indexOf('|') > -1) {
                                var brPos = styleArr.split('<br>');
                                styleArr = styleArr.split("|");
                                if (styleArr && styleArr.length > 0) {
                                    if (styleArr[0].indexOf("@img::") > -1) {
                                        firstImg = true;
                                    }


                                    for (var j = 0; j < styleArr.length; j++) {
                                        if (styleArr[j].indexOf("@img::") > -1) {
                                            imgStyle = styleArr[j].replace("@img::", "");
                                        }
                                        else if (styleArr[j].indexOf("@value::") > -1) {
                                            vlstyle = styleArr[j].replace("@value::", "");
                                        } else if (styleArr[j].indexOf("@span::") > -1) {
                                            spnStyle = styleArr[j].replace("@span::", "");
                                        }
                                    }

                                    if (brPos != null && brPos.length > 1) {
                                        if (styleArr[0].indexOf("@img::") > -1) {
                                            brStart = 1;
                                        }
                                        else {
                                            brStart = 2;
                                        }
                                    }

                                }
                            } else {
                                vlstyle = styleArr;
                            }
                        }


                        if (fidItm.length > 0) {
                            var styleflx = fidItm.attr("style");
                            var fIdx = styleflx.indexOf('flex-direction');
                            var lblflxstyle = "";
                            if (fIdx > -1) {
                                var cIdx = styleflx.indexOf(";", fIdx + 'flex-direction'.length)
                                lblflxstyle = 'display:flex; ' + styleflx.substring(fIdx, cIdx);
                            }

                            var fieldHtml = $('<div class="fieldGroup" style="' + lblflxstyle + '" draggable="true">'
                                + '</div>');
                            var hideIcon = fidItm.attr("showfieldicon") == 'Y' ? true : false;
                            var hideTxt = fidItm.attr("showfieldtext") == 'Y' ? true : false;
                            if (mTab.getFieldById(Number(fID)).getShowIcon()) {
                                if (hideIcon) {
                                    fieldHtml.append($('<i class="">&nbsp;</i>'));
                                } else {
                                    fieldHtml.append($('<i class="fa fa-star">&nbsp;</i>'));
                                }
                            }
                            var cls = hideTxt ? "displayNone" : "";
                            var src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='50' height='50'%3E%3Cdefs%3E%3Cpath d='M23 31l-3.97-2.9L19 28l-.24-.09.19.13L13 33v2h24v-2l-3-9-5-3-6 10zm-2-12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zm-11-8c-.55 0-1 .45-1 1v26c0 .55.45 1 1 1h30c.55 0 1-.45 1-1V12c0-.55-.45-1-1-1H10zm28 26H12c-.55 0-1-.45-1-1V14c0-.55.45-1 1-1h26c.55 0 1 .45 1 1v22c-.3.67-.63 1-1 1z' id='a'/%3E%3C/defs%3E%3Cuse xlink:href='%23a' fill='%23fff'/%3E%3Cuse xlink:href='%23a' fill-opacity='0' stroke='%23000' stroke-opacity='0'/%3E%3C/svg%3E";
                            var displayType = mTab.getFieldById(Number(fID)).getDisplayType();
                            if (displayType == VIS.DisplayType.Image) {
                                fieldHtml.append($('<span style="' + fidItm.attr("fieldValueLabel") + '" class="fieldLbl ' + cls + '" draggable="false" showFieldText="' + hideTxt + '" showFieldIcon="' + hideIcon + '"  title="' + vlu + '" fieldid="' + fID + '" id="' + $(this).attr('id') + '">' + vlu + '</span><img class="vis-colorInvert imgField" style="' + imgStyle + '" src="' + src + '"/>'));
                            } else if (displayType == VIS.DisplayType.TableDir || displayType == VIS.DisplayType.Table || displayType == VIS.DisplayType.List || displayType == VIS.DisplayType.Search) {

                                var fldlbl = '<span style="' + fidItm.attr("fieldValueLabel") + '" class="fieldLbl ' + cls + '" draggable="false" showFieldText="' + hideTxt + '" showFieldIcon="' + hideIcon + '" ondragstart="drag(event)" title="' + vlu + '" fieldid="' + fID + '" id="' + $(this).attr('id') + '">' + vlu + '</span>';
                                src = "data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpath id='a' d='m23,31l-3.97,-2.9l-0.03,-0.1l-0.24,-0.09l0.19,0.13l-5.95,4.96l0,2l24,0l0,-2l-3,-9l-5,-3l-6,10zm-2,-12c0,-1.66 -1.34,-3 -3,-3s-3,1.34 -3,3s1.34,3 3,3s3,-1.34 3,-3zm-11,-8c-0.55,0 -1,0.45 -1,1l0,26c0,0.55 0.45,1 1,1l30,0c0.55,0 1,-0.45 1,-1l0,-26c0,-0.55 -0.45,-1 -1,-1l-30,0zm28,26l-26,0c-0.55,0 -1,-0.45 -1,-1l0,-22c0,-0.55 0.45,-1 1,-1l26,0c0.55,0 1,0.45 1,1l0,22c-0.3,0.67 -0.63,1 -1,1z'/%3E%3C/defs%3E%3Cg%3E%3Cuse transform='matrix(0.567292 0 0 0.499809 0.901418 2.3385)' x='0' y='0' stroke='null' id='svg_1' fill='%23fff' xlink:href='%23a'/%3E%3C/g%3E%3C/svg%3E";
                                var img = '<img class="vis-colorInvert imgField" style="' + imgStyle + '" src="' + src + '"/>';
                                var spn = '';
                                if (brStart == 0) {
                                    spn = '<span class="fieldValue" style="' + vlstyle + '">Value</span>';
                                } else if (brStart == 1) {
                                    spn = '<span class="fieldValue" style="' + vlstyle + '"><br>Value</span>';
                                } else if (brStart == 2) {
                                    spn = '<span class="fieldValue" style="' + vlstyle + '">Value<br></span>';
                                }
                                if (firstImg) {
                                    fldlbl += img;
                                    fldlbl += spn;
                                } else {
                                    fldlbl += spn;
                                    fldlbl += img;
                                }

                                fieldHtml.append($(fldlbl));
                            }
                            else {

                                fieldHtml.append($('<span style="' + fidItm.attr("fieldValueLabel") + '" class="fieldLbl ' + cls + '" draggable="false" showFieldText="' + hideTxt + '" showFieldIcon="' + hideIcon + '" ondragstart="drag(event)" title="' + vlu + '" fieldid="' + fID + '" id="' + $(this).attr('id') + '">' + vlu + '</span><span class="fieldValue" style="' + vlstyle + '">:Value</span>'));
                            }

                            if (fidItm.attr("query") != null && fidItm.attr("query") != "") {
                                fieldHtml.append('<sql>SQL</sql>');
                            }
                            fidItm.append(fieldHtml);
                            //$(this).remove();
                        }
                    }
                });
                DivViewBlock.find('.canvas [query]').each(function () {
                    if ($(this).attr('query') != "" && $(this).attr('query') != null && $(this).attr('query') != undefined) {
                        $(this).append('<sql>SQL</sql>');
                    }
                })
            } else {
                isChangeTemplate = false;
                if (isUndoRedo) {
                    return;
                }

                DivCardField.find('.fieldLbl[seqNo]').each(function () {
                    if ($(this).attr('title') && $(this).attr('title').length > 0) {
                        //unlinkField($(this).attr('title'), $(this));
                        $(this).find('.linked').removeClass('linked vis-succes-clr');
                        $(this).removeAttr('seqNo');
                        var fieldName = $(this).attr('title');
                        $(this).prop("draggable", true);
                    }
                });
                DivCardField.find('[draggable="true"]:not(:first)').sort(Ascending_sort).appendTo(DivCardField);
            }
        }

        /**
         * Fill linked field
         * @param {any} isReload
         * @param {any} isShowAllColumn
         */
        var FillFields = function (isReload, isShowAllColumn) {
            //if (!isReload) {
            //var feildClone = availableFeilds.find('.vis-sec-2-sub-itm:first').clone(true);
            //availableFeilds.find('.vis-sec-2-sub-itm').remove();

            fields = null;
            dbResult = null;

            tabField = mTab.getFields();
            tabField.sort(function (a, b) {
                var a1 = a.getHeader().toLower(), b1 = b.getHeader().toLower();
                if (a1 == b1) return 0;
                return a1 > b1 ? 1 : -1;
            });

            FillIncluded(isReload);

            if (mTab != null && mTab.getFields().length > 0) {

                var iClone = DivCardField.find('.fieldLbl:first').clone(true);
                iClone.removeClass('displayNone');

                for (var i = 0; i < tabField.length; i++) {
                    var c = tabField[i].getColumnName().toLower();
                    if (c == "created" || c == "createdby" || c == "updated" || c == "updatedby") {
                        continue;
                    }

                    if (VIS.DisplayType.IsLOB(tabField[i].getDisplayType())) {
                        continue;
                    }

                    if (!tabField[i].getIsDisplayed()) {
                        continue;
                    }

                    if (!isShowAllColumn) {
                        var result = jQuery.grep(columnFieldArray, function (value) {
                            return value == tabField[i].getAD_Field_ID();
                        });
                        if (result.length > 0) {

                            continue;
                        }
                    }

                    //feildClone.find('.vis-sub-itm-title').text(tabField[i].getHeader());
                    //feildClone.attr("fieldid", tabField[i].getAD_Field_ID());
                    //availableFeilds.append(feildClone);
                    //feildClone = availableFeilds.find('.vis-sec-2-sub-itm:first').clone(true);

                    iClone.prepend(tabField[i].getHeader()).attr("title", tabField[i].getHeader());
                    if (tabField[i].getShowIcon()) {
                        iClone.attr("showfieldicon", false);
                    }

                    //if (tabField[i].getDisplayType() == VIS.DisplayType.Image) {
                    //    iClone.attr("fieldid", tabField[i].getAD_Field_ID()).attr("displayType", "img");
                    //} else {
                    //    iClone.attr("fieldid", tabField[i].getAD_Field_ID());
                    //}
                    iClone.attr("fieldid", tabField[i].getAD_Field_ID());
                    iClone.attr("id", WindowNo + "_" + tabField[i].getAD_Field_ID());
                    DivCardField.append(iClone);
                    iClone = DivCardField.find('.fieldLbl:first').clone(true);
                    iClone.removeClass('displayNone');

                }
            }

        };

        /**
         * Fill Included Filled
         * @param {any} isReload
         */
        var FillIncluded = function (isReload) {

            var iClone = DivCardField.find('.fieldLbl:first').clone(true);
            DivCardField.find('.fieldLbl:not(:first)').remove();
            iClone.removeClass('displayNone');

            cardViewColArray = [];
            cardViewColumns = [];
            columnFieldArray = [];
            if (isReload && (AD_CardView_ID > 0 || typeof (AD_CardView_ID) == "undefined")) {
                if (typeof (AD_CardView_ID) == "undefined") {
                    AD_CardView_ID = 0;
                }
                var url = VIS.Application.contextUrl + "CardView/GetCardViewColumns";
                $.ajax({
                    type: "GET",
                    async: false,
                    url: url,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    data: { ad_CardView_ID: AD_CardView_ID },
                    success: function (data) {
                        dbResult = JSON.parse(data);
                        var CVColumns = dbResult[0].lstCardViewData;
                        LstCardViewCondition = dbResult[0].lstCardViewConditonData;
                        if (CVColumns != null && CVColumns.length > 0) {
                            AD_GroupField_ID = CVColumns[0].AD_GroupField_ID;
                            cardViewUserID = CVColumns[0].CreatedBy;
                            for (var i = 0; i < CVColumns.length; i++) {
                                if (CVColumns[i].AD_Field_ID == 0) {
                                    continue;
                                }
                                var fieldItem = jQuery.grep(totalTabFileds, function (value) {
                                    return value.getAD_Field_ID() == CVColumns[i].AD_Field_ID
                                });
                                if (fieldItem.length > 0) {
                                    columnFieldArray.push(fieldItem[0].getAD_Field_ID());
                                }


                                iClone.prepend(CVColumns[i].FieldName).attr("title", CVColumns[i].FieldName);


                                if (mTab.getFieldById(CVColumns[i].AD_Field_ID).getShowIcon()) {
                                    iClone.attr("showfieldicon", false);
                                }

                                iClone.attr("fieldid", CVColumns[i].AD_Field_ID).attr("seqNo", CVColumns[i].SeqNo);
                                iClone.attr("id", WindowNo + "_" + CVColumns[i].AD_Field_ID);
                                DivCardField.append(iClone);
                                iClone = DivCardField.find('.fieldLbl:first').clone(true);
                                iClone.removeClass('displayNone');

                            }

                            DivCardField[0].addEventListener("dragstart", function (event) {
                                // store a ref. on the dragged elem
                                dragged = $(event.target);
                            });
                        }
                        if (LstCardViewCondition != null && LstCardViewCondition.length > 0) {
                            cardviewCondition = [];
                            FillCVConditonTable(LstCardViewCondition);
                        }
                        else {
                            cardviewCondition = [];
                            AddRow(cardviewCondition);
                        }

                        addOrderByClauseFromDB(CVColumns[0].OrderByClause);
                    }, error: function (errorThrown) {
                        alert(errorThrown.statusText);
                    }
                });
            }
            else if (cardView.hasIncludedCols) {
                var fieldItem = null;
                columnFieldArray = [];
                var includedFields = cardView.fields;
                //cardViewColumns = cardView.fields;
                if (includedFields != null && includedFields.length > 0) {
                    for (var i = 0; i < includedFields.length; i++) {
                        fieldItem = jQuery.grep(totalTabFileds, function (value) {
                            return value.getAD_Field_ID() == includedFields[i].getAD_Field_ID()
                        });
                        if (fieldItem.length > 0) {
                            columnFieldArray.push(fieldItem[0].getAD_Field_ID());
                        }

                        cardViewColArray.push({ AD_Field_ID: includedFields[i].getAD_Field_ID(), CardViewID: AD_CardView_ID, SeqNo: 0, FieldName: includedFields[i].getHeader() });


                        iClone.prepend(includedFields[i].getHeader()).attr("title", includedFields[i].getHeader());

                        if (mTab.getFieldById(includedFields[i].getAD_Field_ID()).getShowIcon()) {
                            iClone.attr("showfieldicon", false);
                        }

                        iClone.attr("fieldid", includedFields[i].getAD_Field_ID()).attr("seqNo", includedFields[i].SeqNo);
                        iClone.attr("id", WindowNo + "_" + includedFields[i].getAD_Field_ID());
                        DivCardField.append(iClone);
                        iClone = DivCardField.find('.fieldLbl:first').clone(true);
                        iClone.removeClass('displayNone');
                    }
                }
            }
        }

        /**Fill group filled */
        var FillGroupFields = function () {
            if (cmbGroupField != null) {
                cmbGroupField.children().remove();
            }
            var fields = null;
            var dbResult = null;
            lovcardList = {};
            if (mTab != null && mTab.getFields().length > 0) {
                cmbGroupField.append("<Option value=" + -1 + "></Option>");
                tabField = mTab.getFields();
                for (var i = 0; i < tabField.length; i++) {
                    var c = tabField[i].getColumnName().toLower();
                    if (c == "created" || c == "createdby" || c == "updated" || c == "updatedby") {
                        continue;
                    }

                    if ((VIS.DisplayType.IsLookup(tabField[i].getDisplayType()) && tabField[i].getLookup() && tabField[i].getLookup().getIsValidated() && tabField[i].getIsDisplayed()) || tabField[i].getDisplayType() == VIS.DisplayType.YesNo) {
                        cmbGroupField.append("<Option value=" + tabField[i].getAD_Field_ID() + "> " + VIS.Utility.Util.getIdentifierDisplayVal(tabField[i].getHeader()) + "</Option>");
                        if (tabField[i].getDisplayType() == VIS.DisplayType.List || tabField[i].getDisplayType() == VIS.DisplayType.TableDir || tabField[i].getDisplayType() == VIS.DisplayType.Table || tabField[i].getDisplayType() == VIS.DisplayType.Search) {
                            if (tabField[i].lookup && tabField[i].lookup.getData()) {
                                lovcardList[tabField[i].getAD_Field_ID()] = tabField[i].lookup.getData();
                            }
                        }
                    }
                }

            }
            if (AD_GroupField_ID != null && AD_GroupField_ID > 0) {
                var result = jQuery.grep(tabField, function (value) {
                    return value.getAD_Field_ID() == AD_GroupField_ID;
                });
                cmbGroupField.find("[value='" + AD_GroupField_ID + "']").attr("selected", "selected");
            }
            FillforGroupSeq(AD_GroupField_ID);
        };

        /**
         * Fill Group sequence
         * @param {any} fieldID
         */
        var FillforGroupSeq = function (fieldID) {
            groupSequenceFeilds.find('.onlyLOV').remove();
            var GrpSeqfeildClone = groupSequenceFeilds.find('.vis-sec-2-sub-itm:hidden').clone(true);
            GrpSeqfeildClone.removeClass("displayNone");
            groupSequenceFeilds.find('.vis-sec-2-sub-itm:not(:hidden)').remove();
            if (lovcardList[fieldID]) {
                for (var i = 0, ln = lovcardList[fieldID]; i < ln.length; i++) {
                    if (ln[i].Key.toString().length > 0 && ln[i].Name.toString().length > 0) {
                        GrpSeqfeildClone.attr("key", ln[i].Key);
                        GrpSeqfeildClone.find('.vis-sub-itm-title').text(VIS.Utility.Util.getIdentifierDisplayVal(ln[i].Name));
                        groupSequenceFeilds.append(GrpSeqfeildClone);
                        GrpSeqfeildClone = groupSequenceFeilds.find('.vis-sec-2-sub-itm:last').clone(true);
                        //ulGroupSeqColumns.append('<li key="' + ln[i].Key + '"><input type="checkbox"/>' + ln[i].Name + '</li>');
                    }
                };
                //ulGroupSeqColumns.find('input').prop('checked', true)
                var idx = cardsList.find(".crd-active").attr('idx');
                var seq = cardViewInfo[idx].groupSequence;
                var excGrp = cardViewInfo[idx].excludedGroup;
                if (seq) {
                    seq = seq.split(",");
                    excGrp = excGrp.split(",");
                    for (var j = 0; j < seq.length; j++) {
                        var item = groupSequenceFeilds.find("[key='" + seq[j] + "']");
                        if (excGrp.lastIndexOf(seq[j]) != -1) {
                            item.find('.fa-check-square-o').removeClass('fa-check-square-o').addClass('fa-square-o');
                            //item.find('input').prop('checked', false);
                        }

                        var before = groupSequenceFeilds.find(".vis-sec-2-sub-itm").eq(j);
                        item.insertBefore(before);
                    }
                }
                groupSequenceFeilds.closest('.vis-sec-2-wrapper').css('height', '100%');
                var h = $(window).height() - 248;
                groupSequenceFeilds.css('height', h + 'px');
                groupSequenceFeilds.sortable({
                    disabled: false
                });
            } else {

                groupSequenceFeilds.closest('.vis-sec-2-wrapper').css('height', '100%');
                groupSequenceFeilds.append('<div class="onlyLOV"  key=""><span>' + VIS.Msg.getMsg("OnlyForLOV") + '</span></div>');
                groupSequenceFeilds.sortable({
                    disabled: true
                });
            }

        }

        /** Fill condition dropdown */
        var FillCVConditionCmbColumn = function () {
            var html = '<option value="-1"> </option>';
            for (var c = 0; c < findFields.length; c++) {
                // get field
                var field = findFields[c];

                if (field.getDisplayType() == VIS.DisplayType.Image) {
                    continue;
                }

                if (field.getIsEncrypted())
                    continue;
                // get field's column name
                var columnName = field.getColumnName();
                if (field.getDisplayType() == VIS.DisplayType.Button) {
                    if (field.getAD_Reference_Value_ID() == 0)
                        continue;
                    if (columnName.endsWith("_ID"))
                        field.setDisplayType(VIS.DisplayType.Table);
                    else
                        field.setDisplayType(VIS.DisplayType.List);
                    //field.loadLookUp();
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
                html += '<option value="' + columnName + '">' + header + '</option>';
            }
            cmbColumn.html(html);
        };

        /**
         * Fill condition Table
         * @param {any} data
         */
        function FillCVConditonTable(data) {
            var condition = {};
            cvConditionArray = {};
            var strConditionValue = "";
            var strConditionText = "";

            var s = null;
            var st = null;
            var colHeader = null;
            var colVaue = null;
            var queryValue = null;
            var queryText = null;
            var operator = null;
            var operatorText = null;
            for (var i = 0; i < data.length; i++) {
                cvConditionArray = {};
                cvConditionArray["Color"] = data[i].Color;
                cvConditionArray["Condition"] = [];
                strConditionValue = data[i].ConditionValue.split("&");
                strConditionText = data[i].ConditionText.split("&");

                for (var j = 0; j < strConditionValue.length; j++) {
                    condition = {}
                    if (strConditionValue[j].contains("!")) {
                        s = strConditionValue[j].trim().split("!");
                        st = strConditionText[j].trim().split("!");
                        operator = "!";
                        operatorText = "!=";
                        colHeader = st[0].trim().substring(0 + 1, st[0].lastIndexOf("@"));
                        colVaue = s[0].trim().substring(0 + 1, s[0].lastIndexOf("@"));
                        queryText = st[1];
                        queryValue = s[1];
                    }
                    else if (strConditionValue[j].contains("=")) {
                        s = strConditionValue[j].split("=");
                        st = strConditionText[j].split("=");
                        operator = "="
                        operatorText = "=";
                        colHeader = st[0].trim().substring(0 + 1, st[0].lastIndexOf("@"));
                        colVaue = s[0].trim().substring(0 + 1, s[0].lastIndexOf("@"));
                        queryText = st[1];
                        queryValue = s[1];
                    }
                    else if (strConditionValue[j].contains("<")) {
                        s = strConditionValue[j].split("<");
                        st = strConditionText[j].split("<");
                        operator = "<";
                        operatorText = "<";
                        colHeader = st[0].trim().substring(0 + 1, st[0].lastIndexOf("@"));
                        colVaue = s[0].trim().substring(0 + 1, s[0].lastIndexOf("@"));
                        queryText = st[1];
                        queryValue = s[1];
                    }
                    else if (strConditionValue[j].contains(">")) {
                        s = strConditionValue[j].split(">");
                        st = strConditionText[j].split(">");
                        operator = ">";
                        operatorText = ">";
                        colHeader = st[0].trim().substring(0 + 1, st[0].lastIndexOf("@"));
                        colVaue = s[0].trim().substring(0 + 1, s[0].lastIndexOf("@"));
                        queryText = st[1];
                        queryValue = s[1];
                    }

                    condition["ColHeader"] = colHeader;
                    condition["ColName"] = colVaue;
                    condition["Operator"] = operator;
                    condition["OperatorText"] = operatorText;
                    condition["QueryValue"] = queryValue;
                    condition["QueryText"] = queryText;
                    cvConditionArray["Condition"].push(condition);

                }
                cardviewCondition.push(cvConditionArray);
            }
            //if (!isFirstLoad) {
            AddRow(cardviewCondition);
            //}
        };

        var AddRow = function (data) {
            var rowClone = cvTable.find('tr:first').clone(true);
            rowClone.removeAttr('style');
            cvTable.find('tr:not(:first)').remove();
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].Condition.length; j++) {
                        rowClone.find('.td_bgColor i').css({ 'background': data[i].Color, 'color': 'transparent' });
                        rowClone.find('.td_bgColor').attr("value", data[i].Color);
                        rowClone.find('.td_column').text(data[i].Condition[j].ColHeader).attr('value', data[i].Condition[j].ColName);
                        rowClone.find('.td_operator').text(data[i].Condition[j].Operator).attr('value', data[i].Condition[j].OperatorText);
                        rowClone.find('.td_queryValue').text(data[i].Condition[j].QueryValue).attr('value', data[i].Condition[j].QueryText);
                        cvTable.append(rowClone);
                        rowClone = cvTable.find('tr:last').clone(true);
                    }
                }
            } else {
                cvTable.append("<tr style='height:100%'><td colspan='5' style='background-color: #f1f1f173;'><div class='align-items-center d-flex justify-content-center'><i class='fa fa-database mr-1 fa-2x' aria-hidden='true'></i>" + VIS.Msg.getMsg("NoResult") + "</div></td></tr>");
            }
        };

        /**
         * Delete card
         * */
        var DeleteCardView = function () {
            var url = VIS.Application.contextUrl + "CardView/DeleteCardViewRecord";
            $.ajax({
                type: "POST",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ 'ad_CardView_ID': AD_CardView_ID }),
                success: function (data) {

                    var result = JSON.parse(data);
                    isDefaultcard = false;
                    AD_CardView_ID = 0;
                    GetCards(false);
                    //idx = cardsList.find('.crd-active').attr('idx');
                    //if (cardViewInfo && cardViewInfo.length > 0) {
                    //    cardViewInfo.splice(idx, 1);
                    //}
                    //cardsList.find('.crd-active').remove();

                    //if (cardViewInfo && cardViewInfo.length > 0) {
                    //    cardsList.find('div:first').addClass('crd-active');
                    //    cardsList.find('div:first').clcik();                       
                    //} else {
                    //    AD_CardView_ID = 0;
                    //    idx = -1;
                    //    isSameUser = true;
                    //    btnNewCard.click();
                    //    btnCancle.addClass('vis-disable-event');
                    //}
                    //cardView.getCardViewData(mTab, AD_CardView_ID);
                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                }
            });
        };

        /**
         * manage control according to user
         * @param {any} indx
         */
        var ControlMgmt = function (indx) {
            if (indx && cardViewInfo && cardViewInfo[indx] && cardViewInfo[indx].CreatedBy == VIS.context.getAD_User_ID()) {
                isSameUser = true;
                //btnCopy.addClass('vis-disable-event');
                //btnEdit.removeClass('vis-disable-event');
                btnDelete.removeClass('vis-disable-event');

                btnSaveClose.removeClass('vis-disable-event');
                btnApply.removeClass('vis-disable-event');
                btnFinesh.removeClass('vis-disable-event');
                btnOnlySave.removeClass('vis-disable-event');
                btnChangeTemplate.removeClass('vis-disable-event');
            } else {
                isSameUser = false;
                //btnCopy.removeClass('vis-disable-event');
                //btnEdit.addClass('vis-disable-event');
                btnDelete.addClass('vis-disable-event');

                btnSaveClose.addClass('vis-disable-event');
                btnApply.addClass('vis-disable-event');
                btnFinesh.addClass('vis-disable-event');
                btnOnlySave.addClass('vis-disable-event');
                btnChangeTemplate.addClass('vis-disable-event');
            }

            //if (VIS.MRole.isAdministrator) {
            //    chkPublic.show();
            //} else {
            //    chkPublic.hide();
            //}

        }

        var enableDisable = function (isEnable) {

            if (isNewRecord || isEdit) {
                isNewRecord ? btnDelete.addClass('vis-disable-event') : btnDelete.removeClass('vis-disable-event');

                if (isEdit && !isSameUser) {
                    btnDelete.addClass('vis-disable-event');
                }

            }
        }

        /**
         * Save card details
         * @param {any} e
         */
        function SaveChanges(e) {
            IsBusy(true);
            window.setTimeout(function () {
                var cvConditionValue = "";
                var cvConditionText = "";
                strConditionArray = [];
                var queryValue = "";
                for (i = 0; i < cardviewCondition.length; i++) {
                    cvConditionValue = "";
                    cvConditionText = "";
                    for (j = 0; j < cardviewCondition[i].Condition.length; j++) {
                        if (j == 0) {
                            cvConditionValue += "@" + cardviewCondition[i].Condition[j].ColName + "@" + cardviewCondition[i].Condition[j].Operator + cardviewCondition[i].Condition[j].QueryValue;
                            cvConditionText += "@" + cardviewCondition[i].Condition[j].ColHeader + "@" + cardviewCondition[i].Condition[j].Operator + cardviewCondition[i].Condition[j].QueryText;
                        }
                        else {
                            cvConditionValue += " & " + "@" + cardviewCondition[i].Condition[j].ColName + "@" + cardviewCondition[i].Condition[j].Operator + cardviewCondition[i].Condition[j].QueryValue;
                            cvConditionText += " & " + "@" + cardviewCondition[i].Condition[j].ColHeader + "@" + cardviewCondition[i].Condition[j].Operator + cardviewCondition[i].Condition[j].QueryText
                        }
                    }
                    strConditionArray.push({ "Color": cardviewCondition[i].Color.toString(), "ConditionValue": cvConditionValue, "ConditionText": cvConditionText })
                }


                if (isNewRecord) {
                    if (txtCardName.val() == "") {
                        VIS.ADialog.error("FillMandatory", true, "Name");
                        IsBusy(false);
                        return false;
                    }

                }
                else if (!isNewRecord && (AD_CardView_ID < 1 && VIS.MRole.isAdministrator)) {
                    VIS.ADialog.error("ClickNew", true, "");
                    IsBusy(false);
                    return false;
                }

                //var len = includedFeilds.find('div:not(:first)').length;
                //if (len.length <= 0)
                //    return false;

                SaveCardViewColumn();
                e.stopPropagation();
                e.preventDefault();
            }, 50);
        };

        var SaveCardViewColumn = function () {
            var idx = cardsList.find('.crd-active').attr('idx');
            if (idx && cardViewInfo != null && cardViewInfo.length > 0) {
                cardViewUserID = parseInt(cardViewInfo[idx].CreatedBy);
            } else {
                cardViewUserID = VIS.context.getAD_User_ID();
            }
            AD_User_ID = VIS.context.getAD_User_ID();

            if (isCopy) {
                isNewRecord = true;
                isCopy = false;
                //if (!VIS.MRole.isAdministrator) {
                //    chkPublic.prop("checked", false);
                //    chkDefault.prop("checked", false);
                //}
            }


            if (isNewRecord && cardViewInfo != null) {
                for (var a = 0; a < cardViewInfo.length; a++) {
                    if (cardViewInfo[a].CardViewName.trim() == txtCardName.val().trim()) {
                        VIS.ADialog.error("cardAlreadyExist", true, "");
                        IsBusy(false);
                        return false;
                    }
                }
            }

            cardViewName = txtCardName.val().trim();
            //}

            if (isEdit || isNewRecord) {
                SaveCardInfoFinal();
            }
            else {
                IsBusy(false);
                if (closeDialog) {
                    ch.close();
                    isEdit = false;
                    isNewRecord = false;
                    if (gc.isCardRow && !aPanel.fromCardDialogBtn)
                        //cardView.requeryData();
                        cardView.getCardViewData(mTab, AD_CardView_ID);
                }
                else {
                    isEdit = true;
                    isNewRecord = false;
                    if (!isOnlySave) {
                        DivCradStep1.show();
                        DivCradStep2.hide();
                    }
                }
            }
        };

        var SaveCardInfoFinal = function () {

            var grpSeq = "";
            var skipGrp = "";
            $.each(groupSequenceFeilds.find('.vis-sec-2-sub-itm'), function () {
                grpSeq += $(this).attr('key') + ",";
                if (!$(this).find('.grpChk').hasClass('fa-check-square-o')) {
                    skipGrp += $(this).attr('key') + ",";
                }
            });

            var selIdx = cardsList.find(".crd-active").attr('idx');
            grpSeq = grpSeq.replace(/,\s*$/, "");
            skipGrp = skipGrp.replace(/,\s*$/, "");

            var sortOrder = sortOrderArray.join(',');
            cardViewArray = [];
            var cardID = AD_CardView_ID;
            if (isNewRecord)
                cardID = 0;


            cardViewArray.push({
                AD_Window_ID: AD_Window_ID,
                AD_Tab_ID: AD_Tab_ID,
                UserID: AD_User_ID,
                AD_GroupField_ID: cmbGroupField.find(":selected").val(),
                isNewRecord: isNewRecord,
                CardViewName: cardViewName,
                CardViewID: cardID,
                IsDefault: chkDefault.is(":checked"),
                AD_HeaderLayout_ID: AD_HeaderLayout_ID,
                isPublic: chkPublic.is(":checked") == true ? false : true,
                groupSequence: grpSeq
            });

            var url = VIS.Application.contextUrl + "CardView/SaveCardViewColumns";
            $.ajax({
                type: "POST",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    'lstCardView': cardViewArray,
                    'lstCardViewColumns': cardViewColArray,
                    'lstCardViewCondition': strConditionArray,
                    'excludeGrp': skipGrp,
                    'orderByClause': sortOrder
                }),
                success: function (data) {
                    var result = JSON.parse(data);
                    AD_CardView_ID = result;
                    toastr.success(VIS.Msg.getMsg('SavedSuccessfully'), '', { timeOut: 3000, "positionClass": "toast-top-center", "closeButton": true, });
                    if (closeDialog) {
                        isNewRecord = false;
                        isEdit = false;
                        if (gc.isCardRow && !aPanel.fromCardDialogBtn)
                            cardView.getCardViewData(mTab, AD_CardView_ID);
                        ch.close();
                    }
                    else {

                        if (isNewRecord) {
                            GetCards(true);
                            //getTemplateDesign();                            
                        }
                        else {
                            cardViewInfo[selIdx].groupSequence = grpSeq;
                            cardViewInfo[selIdx].excludedGroup = skipGrp;
                            cardViewInfo[selIdx].AD_GroupField_ID = cmbGroupField.find(":selected").attr("fieldid");
                            //cardViewInfo[selIdx].AD_HeaderLayout_ID = 0;
                            cardViewInfo[selIdx].CardViewName = cardViewName;
                            cardViewInfo[selIdx].UserID = AD_User_ID;
                            cardViewInfo[selIdx].OrderByClause = sortOrder;
                            cardViewInfo[selIdx].Updated = new Date().toLocaleDateString();
                            cardsList.find('.crd-active .vis-lft-sgl-title').text(cardViewName);
                        }
                        getTemplateDesign();
                        isEdit = true;
                        isNewRecord = false;
                        if (!isOnlySave) {
                            DivCradStep1.show();
                            DivCradStep2.hide();
                            FillFields(true, false);
                        }
                    }
                    IsBusy(false);
                    btnCopy.removeClass('vis-disable-event');

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }
            });
            //return includeCols;
        };

        var resetAll = function () {
            txtCardName.val('');
            cmbGroupField.val('-1');
            cmbGroupField.change();
            cmbOrderClause.val('-1');
            sortOrderArray = [];
            lastSortOrderArray = [];
            LastCVCondition = [];
            cardviewCondition = [];
            AddRow(cardviewCondition);
            clearOrderByClause();
            btnDelete.addClass('vis-disable-event');
            btnCancle.addClass('vis-disable-event');
            chkDefault.prop("checked", false);
            chkPublic.prop("checked", false);
            chkDefault.parent().show();
        }

        function getTargetMField(columnName) {
            // if no column name, then return null
            if (columnName == null || columnName.length == 0)
                return null;
            // else find field for the given column
            for (var c = 0; c < mTab.getFields().length; c++) {
                var field = mTab.getFields()[c];
                if (columnName.equals(field.getColumnName()))
                    return field;
            }
            return null;
        };

        function getControlValue(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(2, 1);
                crtlObj = control1;
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
                if (VIS.DisplayType.IsDate(crtlObj.getDisplayType())) {

                    var val = crtlObj.getValue();
                    if (val && val.endsWith('.000Z'))
                        val = val.replace('.000Z', 'Z');
                    return val;
                }

                if (VIS.DisplayType.IsNumeric(crtlObj.getDisplayType())) {
                    // return 0;
                }
                // return control's value
                if (crtlObj.getValue() == '') {
                    return null;
                }
                return crtlObj.getValue();
            }
            return "";
        };

        function SetControlValue(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(2, 1);
                crtlObj = control1;
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
                crtlObj.setValue(null);
            }

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
            // if control exists
            if (crtlObj != null) {
                // get control's text
                return crtlObj.getDisplay();
            }
            return "";
        };

        function SetControlText(isValue1) {
            var crtlObj = null;
            // get control
            if (isValue1) {
                // crtlObj = (IControl)tblpnlA2.GetControlFromPosition(2, 1);
                crtlObj = control1;
            }
            // if control exists
            if (crtlObj != null) {
                // get control's text
                return crtlObj.getDisplayType("");
            }
            return "";
        };

        function setControlNullValue(isValue2) {
            var crtlObj = null;
            if (isValue2) {
                crtlObj = control1;
            }

            // if control exists
            if (crtlObj != null) {
                crtlObj.setValue(null);
            }
        };

        function setValueEnabled(isEnabled) {
            // get control
            var ctrl = divValue1.children()[1];
            var btn = null;
            if (divValue1.children().length > 2)
                btn = divValue1.children()[2];

            if (btn)
                $(btn).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            else if (ctrl != null) {
                $(ctrl).prop("disabled", !isEnabled).prop("readonly", !isEnabled);
            }
        };

        function setEnableButton(btn, isEnable) {
            btn.prop("disabled", !isEnable);
        };

        function setControl(isValue1, field) {

            // set column and row position
            /*****Get control form specified column and row from Grid***********/
            if (isValue1)
                control1 = null;
            control2 = null;
            var ctrl = null;
            var ctrl2 = null;
            if (isValue1) {
                ctrl = divValue1.children()[0];
                if (divValue1.children().length > 1)
                    ctrl2 = divValue1.children()[1];
            }

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
                    divValue1.find('label').remove();
                    divValue1.append(crt.getControl().css("width", "95%"));
                    control1 = crt;
                    if (btn) {
                        divValue1.append(btn);
                        //crt.getControl().css("width", "60%");
                        btn.css("max-width", "35px");
                    }
                    if (VIS.DisplayType.YesNo != field.getDisplayType()) {
                        divValue1.append('<label for="txtQueryValue">' + VIS.Msg.getMsg("QueryValue") + '</label>');
                    }
                }
            }
        };

        function addOrderByClauseFromDB(OrderByClause) {
            clearOrderByClause();
            if (OrderByClause && OrderByClause.length > 0) {
                sortOrderArray = OrderByClause.split(",");
                for (var m = 0; m < sortOrderArray.length; m++) {
                    var val = sortOrderArray[m].split(' ');
                    var f = mTab.getField(val[0]);
                    addOrderByClauseItems(f.getHeader(), val[0], val[1]);
                }
            }
        };

        function clearOrderByClause() {
            sortList.empty();
            sortOrderArray = [];
            lastSortOrderArray = [];
        };

        function addOrderByClauseItems(selectedColtext, val, isAsc) {
            var item = '<div class="vis-sortListItem">'
                + '<p>' + selectedColtext + '</p>'
                + '<div class="vis-sortListIcons">'
                + '<span class="vis-sortAsc">';
            if (isAsc == "ASC")
                item += '<i class="fa fa-sort-amount-asc"></i>';
            else
                item += '<i class="fa fa-sort-amount-asc" style="transform: rotate(180deg);padding-top:1px"></i>';
            item += '</span>'
                + '<span class="vis-sortIcon vis-sortListItemClose" data-text="' + val + ' ' + isAsc + '">'
                + '<i class="fa fa-close"></i>'
                + '</span>'
                + '</div>'
                + '</div>';
            // $divHeadderLay.append('<label>' + selectedColtext + '(' + isAsc + ')</label>');
            sortList.append(item);
        };
        /** Add Selected Template to viewport */
        function addSelectedTemplate() {
            var $this = DivTemplate.find('.vis-active-template').clone(true);
            if ($this.attr("lastupdated")) {
                spnLastSaved.text(VIS.Msg.getMsg("LastSaved") + " " + $this.attr("lastupdated"));
            }
            $this.find('.grdDiv').html('');
            $this.find('.mainTemplate').css("zoom", 1);
            CardCreatedby = $this.attr("createdBy");
            isSystemTemplate = $this.attr("isSystemTemplate");

            AD_HeaderLayout_ID = $this.find('.mainTemplate').attr('templateid');
            refTempID = Number(AD_HeaderLayout_ID);
            templateName = $this.find('.mainTemplate').attr('name');
            if (AD_HeaderLayout_ID == "0") {

                $this.find('.mainTemplate').html($('<div name="Section 1" sectionCount="1" class="section1 vis-wizard-section" style="padding:5px;"></div>'));
            }

            //if (isSystemTemplate == 'N' || AD_HeaderLayout_ID == "0") {
            //    DivCardFieldSec.find('.vis-previewCard').hide();
            //} else {
            //    DivCardFieldSec.find('.vis-previewCard').show();
            //}

            //txtTemplateName.val($(this).find('.mainTemplate').attr('name')).attr("templateid", $(this).find('.mainTemplate').attr('templateid'));

            if ($this.html() != "" || $this.html() != null) {
                $this.find('.vis-wizard-section').each(function () {
                    var row = $(this).attr('row');
                    var col = $(this).attr('col');
                    var arr = [];
                    for (var i = 0; i < (row * col); i++) {
                        arr.push('<div class="grdDiv" style="display:none"></div>');
                    }

                    $(this).find('.grdDiv').each(function () {
                        var areagrid = $(this).css('grid-area').split('/');
                        var idx = col * ($.trim(areagrid[0]) - 1) + ($.trim(areagrid[1]) - 1);
                        if ($.trim(areagrid[0]) != ($.trim(areagrid[2]) - 1) || $.trim(areagrid[1]) != ($.trim(areagrid[3]) - 1)) {
                            -
                            //$(this).append('<span class="vis-split-cell"></span>');
                            $(this).addClass('vis-split-cell');
                        }
                        arr[idx] = $(this)[0].outerHTML;
                    });
                    $(this).html(arr.join(" "));
                });
                DivViewBlock.find('.grdDiv').unbind('mouseover');
                DivViewBlock.find('.vis-viewBlock').attr("style", $this.find('.mainTemplate').attr('style') || '');
                DivViewBlock.find('.vis-viewBlock').html($this.find('.mainTemplate').html());
                DivViewBlock.find('.grdDiv').mouseover(function (e) {
                    if (mdown && (!$(this).hasClass('vis-split-cell'))) {
                        selectTo($(this));
                    }
                });
                DivViewBlock.find('.vis-viewBlock')[0].addEventListener("dragstart", function (event) {
                    dragged = $(event.target);
                    if (dragged.hasClass('grdDiv')) {
                        event.preventDefault();
                    } else {
                        divTopNavigator.hide();
                        mdown = false;
                    }
                }, false);
            }

        }

        // #endregion

        // #region Step 2 events
        var measurment = ['px', '%', 'cm', 'mm', 'in', 'pc', 'pt', 'ch', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax'];
        var editorProp = {
            width: {
                proprty: 'width',
                value: '',
                measurment: true
            },
            minWidth: {
                proprty: 'min-width',
                value: '',
                measurment: true
            },
            height: {
                proprty: 'height',
                value: '',
                measurment: true
            },
            minHeight: {
                proprty: 'min-height',
                value: '',
                measurment: true
            },
            fontSize: {
                proprty: 'font-size',
                value: '',
                measurment: true
            },
            fontFamily: {
                proprty: 'font-family',
                value: '',
                measurment: false
            },
            color: {
                proprty: 'color',
                value: '',
                measurment: false
            },
            border: {
                proprty: 'border',
                value: '',
                measurment: true
            },
            borderType: {
                proprty: 'border-style',
                value: '',
                measurment: false
            },
            borderColor: {
                proprty: 'border-color',
                value: '',
                measurment: false
            },
            borderLeft: {
                proprty: 'border-left-width',
                value: '',
                measurment: true
            },
            borderLeftStyle: {
                proprty: 'border-left-style',
                value: '',
                measurment: false
            },
            borderLeftColor: {
                proprty: 'border-left-color',
                value: '',
                measurment: false
            },
            borderTop: {
                proprty: 'border-top-width',
                value: '',
                measurment: true
            },
            borderTopStyle: {
                proprty: 'border-top-style',
                value: '',
                measurment: false
            },
            borderTopColor: {
                proprty: 'border-top-color',
                value: '',
                measurment: false
            },
            borderRight: {
                proprty: 'border-right-width',
                value: '',
                measurment: true
            },
            borderRightStyle: {
                proprty: 'border-right-style',
                value: '',
                measurment: false
            },
            borderRightColor: {
                proprty: 'border-right-color',
                value: '',
                measurment: false
            },
            borderBottom: {
                proprty: 'border-bottom-width',
                value: '',
                measurment: true
            },
            borderBottomStyle: {
                proprty: 'border-bottom-style',
                value: '',
                measurment: false
            },
            borderBottomColor: {
                proprty: 'border-bottom-color',
                value: '',
                measurment: false
            },

            borderRadius: {
                proprty: 'border-radius',
                value: '',
                measurment: true
            },
            borderTopLeftRadius: {
                proprty: 'border-top-left-radius',
                value: '',
                measurment: true
            },
            borderTopRightRadius: {
                proprty: 'border-top-right-radius',
                value: '',
                measurment: true
            },
            borderBottomRightRadius: {
                proprty: 'border-bottom-right-radius',
                value: '',
                measurment: true
            },
            borderBottomLeftRadius: {
                proprty: 'border-bottom-left-radius',
                value: '',
                measurment: true
            },
            padding: {
                proprty: 'padding',
                value: '',
                measurment: true
            },
            paddingLeft: {
                proprty: 'padding-left',
                value: '',
                measurment: true
            },
            paddingTop: {
                proprty: 'padding-top',
                value: '',
                measurment: true
            },
            paddingRight: {
                proprty: 'padding-right',
                value: '',
                measurment: true
            },
            paddingBottom: {
                proprty: 'padding-bottom',
                value: '',
                measurment: true
            },
            margin: {
                proprty: 'margin',
                value: '',
                measurment: true
            },
            marginLeft: {
                proprty: 'margin-left',
                value: '',
                measurment: true
            },
            marginTop: {
                proprty: 'margin-top',
                value: '',
                measurment: true
            },
            marginRight: {
                proprty: 'margin-right',
                value: '',
                measurment: true
            },
            marginBottom: {
                proprty: 'margin-bottom',
                value: '',
                measurment: true
            }, opacity: {
                proprty: 'opacity',
                value: '',
                measurment: false
            }, backgroundColor: {
                proprty: 'background-color',
                value: '',
                measurment: false
            },
            gradientInput: {
                proprty: 'background',
                value: '',
                measurment: false
            },
            gradient: {
                proprty: 'background',
                value: '',
                measurment: false
            },
            boxShadow: {
                proprty: 'box-shadow',
                value: '',
                measurment: true
            },
            flexDirection: {
                proprty: 'flex-direction',
                value: '',
                measurment: false
            },
            bold: {
                proprty: 'font-weight',
                value: 'bold',
                measurment: false
            },
            italic: {
                proprty: 'font-style',
                value: 'italic',
                measurment: false
            },
            underline: {
                proprty: 'text-decoration',
                value: 'underline',
                measurment: false
            },
            textLeft: {
                proprty: 'text-align',
                value: 'left',
                measurment: false
            },
            textCenter: {
                proprty: 'text-align',
                value: 'center',
                measurment: false
            },
            textJustify: {
                proprty: 'text-align',
                value: 'justify',
                measurment: false
            },
            textRight: {
                proprty: 'text-align',
                value: 'right',
                measurment: false
            },
            upperCase: {
                proprty: 'text-transform',
                value: 'uppercase',
                measurment: false
            },
            capitalize: {
                proprty: 'text-transform',
                value: 'capitalize',
                measurment: false
            },
            lowerCase: {
                proprty: 'text-transform',
                value: 'lowercase',
                measurment: false
            },
            flexJustifyCenter: {
                proprty: 'justify-content',
                value: 'center',
                measurment: false
            },
            flexJustifyStart: {
                proprty: 'justify-content',
                value: 'flex-start',
                measurment: false
            },
            flexJustifyEnd: {
                proprty: 'justify-content',
                value: 'flex-end',
                measurment: false
            },
            flexJustifySpaceBetween: {
                proprty: 'justify-content',
                value: 'space-between',
                measurment: false
            },
            flexJustifySpaceAround: {
                proprty: 'justify-content',
                value: 'space-around',
                measurment: false
            },
            flexAlignCenter: {
                proprty: 'align-items',
                value: 'center',
                measurment: false
            },
            flexAlignEnd: {
                proprty: 'align-items',
                value: 'flex-end',
                measurment: false
            },
            flexAlignStart: {
                proprty: 'align-items',
                value: 'flex-start',
                measurment: false
            },
            maxTextmultiline: {
                proprty: '-webkit-line-clamp',
                value: '',
                measurment: false
            },
            objectFit: {
                proprty: 'object-fit',
                value: '',
                measurment: false
            }
        }

        var events2 = function () {

            chkAllBorderRadius.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allBorderRadius').removeClass('displayNone');
                    DivStyleSec1.find('.singleBorderRadius').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allBorderRadius').addClass('displayNone');
                    DivStyleSec1.find('.singleBorderRadius').removeClass('displayNone');
                }
            });

            chkAllPadding.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allPadding').removeClass('displayNone');
                    DivStyleSec1.find('.singlePadding').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allPadding').addClass('displayNone');
                    DivStyleSec1.find('.singlePadding').removeClass('displayNone');
                }
            });

            chkAllMargin.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allMargin').removeClass('displayNone');
                    DivStyleSec1.find('.singleMargin').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allMargin').addClass('displayNone');
                    DivStyleSec1.find('.singleMargin').removeClass('displayNone');
                }
            });

            chkAllBorder.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allBorder').removeClass('displayNone');
                    DivStyleSec1.find('.singleBorder').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allBorder').addClass('displayNone');
                    DivStyleSec1.find('.singleBorder').removeClass('displayNone');
                }
            })

            //DivStyleSec1.find('.vis-circular-slider-circle').mousedown(function (e) {
            //    mdown = true;
            //}).mousemove(function (e) {
            //    if (mdown) {
            //        var $slider = DivStyleSec1.find('.vis-circular-slider-dot')
            //        var deg = getGradientDeg($slider, e);
            //        $slider.css({ WebkitTransform: 'rotate(' + deg + 'deg)' });
            //        $slider.css({ '-moz-transform': 'rotate(' + deg + 'deg)' });
            //        $slider.attr("deg", deg);
            //        applycommand("gradient", deg);
            //    }
            //});

            divTopNavigator.find("i").click(function () {
                var blok = DivViewBlock.find('.vis-active-block');
                var cmd = $(this).attr('command');
                //isChange = true;
                var f = blok.closest('.fieldGroup').find('.fieldLbl');
                if (cmd == 'Show') {
                    if (blok.prop('tagName') == 'I' && !blok.hasClass('imgField')) {
                        blok.attr("class", "fa fa-star");
                        blok.next().attr('showFieldIcon', false);
                    } else {
                        f.attr('showFieldText', false);
                        f.removeClass("displayNone");
                    }

                    divTopNavigator.find('[command="Hide"]').parent().show();
                    divTopNavigator.find('[command="Show"]').parent().hide();
                    divTopNavigator.hide();
                    templatechanges();
                } else if (cmd == 'Hide') {
                    if (blok.prop('tagName') == 'I' && !blok.hasClass('imgField')) {
                        blok.attr("class", "");
                        blok.next().attr('showFieldIcon', true);
                        templatechanges();
                    } else if (blok.hasClass('imgField')) {
                        blok.css('display', 'none');
                        templatechanges();
                    } else {
                        if (blok.hasClass('fieldValue')) {
                            blok.css("display", "none");
                        } else {
                            blok.attr('showFieldText', true);
                            blok.addClass("displayNone");
                        }
                        templatechanges();
                        //blok.html('&nbsp;');
                    }

                    divTopNavigator.find('[command="Hide"]').parent().hide();
                    divTopNavigator.find('[command="Show"]').parent().show();
                    divTopNavigator.hide();
                } else if (cmd == 'SelectParent') {
                    //isChange = false;
                    if (blok.parent().hasClass("fieldGroup")) {
                        blok.parent().parent().mousedown().mouseup();
                    } else {
                        blok.parent().mousedown().mouseup();
                    }

                } else if (cmd == 'Separate') {
                    applyunMerge(blok);
                    blok.removeClass('vis-split-cell');
                    $(this).parent().hide();
                    templatechanges();
                } else if (cmd == 'Merge') {
                    mergeCell();
                    divTopNavigator.find('[command="Merge"]').parent().hide();
                    templatechanges();
                } else if (cmd == 'Unlink') {
                    divTopNavigator.hide();
                    var fldLbl = blok.closest('.fieldGroup').find('.fieldLbl');
                    unlinkField(fldLbl.attr('title'), fldLbl);
                    templatechanges();
                } else if (cmd == 'ShowImg') {
                    blok.closest('.fieldGroup').find('.imgField').css("display", "unset");
                    divTopNavigator.find('[command="ShowImg"]').parent().hide();
                    templatechanges();
                } else if (cmd == 'ShowValue') {
                    blok.closest('.fieldGroup').find('.fieldValue').css("display", "unset");
                    divTopNavigator.find('[command="ShowValue"]').parent().hide();
                    templatechanges();
                }

                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
            });

            var viewBlock = DivViewBlock.find('.canvas *');

            viewBlock.mousedown(function (e) {

                if (e.target.tagName == 'SQL' || $(e.target).hasClass('fieldGroup')) {
                    return;
                }

                if (e.ctrlKey) {
                    return;
                }
                DivCradStep2.find('.vis-v-rowcol').hide();
                if ($(e.target).hasClass('grdDiv')) {
                    e.preventDefault();
                    ViewBlockAddDelRowCol(e);
                }

                divTopNavigator.find('[command="Merge"]').parent().hide();
                divTopNavigator.find('[command="ShowImg"]').parent().hide();
                divTopNavigator.find('[command="ShowValue"]').parent().hide();
                DivStyleSec1.find('.imgTextCont').addClass('vis-disable-event');
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                if (count == 1) {
                    DivViewBlock.find('.vis-viewBlock').addClass("vis-active-block");
                } else {
                    var secCount = $(e.target).closest('.vis-wizard-section').attr("sectionCount");
                    if (!DivGridSec.find("[sectionCount='" + secCount + "']").hasClass('section-active')) {
                        DivGridSec.find("[sectionCount='" + secCount + "'] .vis-grey-disp-el").click();
                    }

                    $(e.target).addClass("vis-active-block");

                    var top = e.target.offsetTop - divTopNavigator.outerHeight();
                    var left = e.target.offsetLeft;

                    divTopNavigator.css({
                        'top': top,
                        'left': left
                    });

                    divTopNavigator.show();
                    if ($(e.target).closest('.fieldGroup').length > 0) {
                        divTopNavigator.find('[command="Unlink"]').parent().show();
                    } else {
                        divTopNavigator.find('[command="Unlink"]').parent().hide();
                    }
                    divTopNavigator.find('[command="fieldName"]').text('').hide();
                    if ($(e.target).hasClass('fieldLbl')) {
                        divTopNavigator.find('[command="fieldName"]').text($(e.target).closest('.fieldGroup').find('.fieldLbl').attr('title')).show();
                        //divTopNavigator.find('[command="Unlink"]').parent().show();
                        var isTrue = $(e.target).attr('showFieldText') == 'true' ? true : false;
                        if (e.target.hasAttribute('showFieldText') && isTrue) {
                            divTopNavigator.find('[command="Hide"]').parent().hide();
                            divTopNavigator.find('[command="Show"]').parent().show();
                        } else {
                            divTopNavigator.find('[command="Show"]').parent().hide();
                            divTopNavigator.find('[command="Hide"]').parent().show();
                        }
                    } else if (e.target.tagName == 'I' && $(e.target).closest('.fieldGroup').find('.imgField').length == 0) {
                        var isTrue = $(e.target).next().attr('showFieldIcon') == 'true' ? true : false;
                        if ($(e.target).next().attr('showFieldIcon') && isTrue) {
                            divTopNavigator.find('[command="Hide"]').parent().hide();
                            divTopNavigator.find('[command="Show"]').parent().show();
                        } else {
                            divTopNavigator.find('[command="Show"]').parent().hide();
                            divTopNavigator.find('[command="Hide"]').parent().show();
                        }
                    }
                    else {
                        divTopNavigator.find('[command="Show"]').parent().hide();
                        divTopNavigator.find('[command="Hide"]').parent().hide();

                        if ($(e.target).closest('.fieldGroup').length > 0) {
                            var target = $(e.target).closest('.fieldGroup').find('.fieldLbl');
                            var displayType = mTab.getFieldById(Number(target.attr('fieldid'))).getDisplayType();
                            if (displayType == VIS.DisplayType.TableDir || displayType == VIS.DisplayType.Table || displayType == VIS.DisplayType.List || displayType == VIS.DisplayType.Search) {
                                var trget = $(e.target).closest('.fieldGroup');

                                if (trget.find('.imgField:hidden').length > 0) {
                                    divTopNavigator.find('[command="ShowImg"]').parent().show();
                                    divTopNavigator.find('[command="Hide"]').parent().hide();
                                } else if (trget.find('.fieldValue:hidden').length > 0) {
                                    divTopNavigator.find('[command="Hide"]').parent().hide();
                                    divTopNavigator.find('[command="ShowValue"]').parent().show();
                                } else if (trget.find('.imgField').length == 1 && trget.find('.fieldValue').length == 1) {
                                    divTopNavigator.find('[command="Hide"]').parent().show();
                                    DivStyleSec1.find('.imgTextCont').removeClass('vis-disable-event');
                                } else {
                                    DivStyleSec1.find('.imgTextCont').addClass('vis-disable-event');
                                }
                            }

                            var isTrue = target.attr('showFieldText') == 'true' ? true : false;
                            divTopNavigator.find('[command="fieldName"]').text(target.attr('title')).show();

                        }


                        if (isTrue) {
                            divTopNavigator.find('[command="Show"]').parent().show();
                        }

                    }

                    if (!$(e.target).hasClass('vis-split-cell')) {
                        divTopNavigator.find('[command="Separate"]').parent().hide();
                        if ($(e.target).hasClass('grdDiv')) {
                            mdown = true;
                        }
                        var totalCol = DivGridSec.find('.colBox').length - 1;
                        activeSection.find('.grdDiv').each(function (e) {
                            var currentRow = Math.ceil((e + 1) / totalCol);
                            if ($(this).hasClass('vis-active-block')) {
                                startRowIndex = currentRow - 1;
                                startCellIndex = (e) - totalCol * (startRowIndex);
                            }
                        });
                    } else {
                        divTopNavigator.find('[command="Separate"]').parent().show();
                    }
                }

                if ($(e.target).hasClass('vis-wizard-section')) {
                    divTopNavigator.find('[command="fieldName"]').text('Section ' + $(e.target).attr('sectioncount')).show();
                }

                if ($(e.target).hasClass('vis-viewBlock')) {
                    divTopNavigator.find('[command="fieldName"]').text('Main container').show();
                }

                //$(e.target).not('.ui-resizable-handle').addClass("vis-active-block");
                //$(this).resizable();
            }).mouseup(function (e) {
                fill($(e.target));
            });

            DivStyleSec1.find('[data-command]').on('change', function (e) {
                $(this).removeClass('vis-editor-validate');
                var command = $(this).data('command');
                var styleValue = $(this).val();
                var isNegativeNumber = false;
                if (command.indexOf('margin') != -1 && styleValue.indexOf('-') != -1) {
                    isNegativeNumber = true;
                }
                var mtext = styleValue.replace(/\d+/g, "").replace('.', '');
                var mvalue = styleValue.replace(styleValue.replace(/\d+/g, ""), "");
                if (editorProp[command] && editorProp[command].measurment && styleValue != "" && $(this).attr('type') != 'color') {
                    if (measurment.indexOf(mtext) < 0) {
                        if (isNaN(Number(mvalue))) {
                            $(this).addClass('vis-editor-validate');
                            return;
                        }
                        if (isNegativeNumber) {
                            $(this).val("-" + mvalue + "px");
                        } else {
                            $(this).val(mvalue + "px");
                        }
                    } else if (isNaN(Number(mvalue))) {
                        $(this).addClass('vis-editor-validate');
                        return;
                    }
                }

                if (command == 'backgroundColor') {
                    // var clr= rgb2hex(styleValue);
                    DivStyleSec1.find('.vis-zero-BTopLeftBLeft:first').css('background-color', styleValue);
                    DivStyleSec1.find('[data-command="backgroundColor"]').val(styleValue);
                } else if (command == 'color') {
                    DivStyleSec1.find('.vis-zero-BTopLeftBLeft:last').css('background-color', styleValue);
                    DivStyleSec1.find('[data-command="color"]').val(styleValue);
                } else if (command == 'borderColor' || command == 'borderLeftColor' || command == 'borderRightColor' || command == 'borderTopColor' || command == 'borderBottomColor') {
                    var bdrDiv = DivStyleSec1.find("[data-command='" + command + "']").closest('.vis-prop-pan-cont');
                    bdrDiv.find(".vis-back-color03").css('background-color', styleValue);
                }

                applycommand(command, $(this).val());
            });
            DivStyleSec1.find('[data-command2]').on('click', function (e) {
                divTopNavigator.hide();
                var tag = activeSection.find('.vis-active-block').closest('.fieldGroup');
                var command = $(this).data('command2');
                var styleProp = tag.find('.fieldValue').attr('style');
                var classPro = tag.find('.fieldValue').attr('class');
                tag.find('.fieldValue br').remove();
                if (command == 'SwapImgTxt') {
                    tag.find('.imgField').before(tag.find('.fieldValue'));
                } else if (command == 'SwapTxtImg') {
                    tag.find('.fieldValue').before(tag.find('.imgField'));
                } else if (command == 'SwapTxtImgBr') {
                    tag.find('.fieldValue').before(tag.find('.imgField'));
                    tag.find('.fieldValue').prepend('<br>');
                }
                else if (command == 'SwapImgTxtBr') {
                    tag.find('.imgField').before(tag.find('.fieldValue'));
                    tag.find('.fieldValue').append('<br>');
                }
            });

            DivStyleSec1.find('[data-command1]').on('click', function (e) {

                var command = $(this).data('command1');
                var tag = DivViewBlock.find('.vis-active-block');

                var isStyleExist = false;
                if (editorProp[command].measurment) {
                    isStyleExist = checkStyle(editorProp[command].proprty, editorProp[command].value, tag)
                } else {
                    isStyleExist = checkStyle(editorProp[command].proprty, false, tag)
                }

                var activ = $(this).closest('.vis-horz-align-d').find('.vis-hr-elm-inn-active');
                activ.removeClass('vis-hr-elm-inn-active');
                if ((editorProp[command].proprty == "justify-content" || editorProp[command].proprty == "align-items") && checkStyle("display", "flex", tag)) {
                    //applycommand("displayFlex", "");
                    tag[0].style.removeProperty("display");
                    applycommand(command, "");
                    if (activ.find('[data-command1]').attr('data-command1') != command) {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                } else if (editorProp[command].proprty == 'text-align' || editorProp[command].proprty == 'text-transform') {
                    applycommand(command, "");
                    if (activ.find('[data-command1]').attr('data-command1') != command) {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                } else {
                    if (isStyleExist) {
                        $(this).parent().removeClass('vis-hr-elm-inn-active');
                        applycommand(command, "");
                    } else {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                }

                if (tag.attr('style').indexOf('justify-content') != -1 || tag.attr('style').indexOf('align-items') != -1 || tag.attr('style').indexOf('flex-direction') != -1) {
                    tag.css("display", "flex");
                }
            });

            DivGridSec.find('.addGridRow').click(function () {
                var rClone = DivGridSec.find('.rowBox:first').clone(true);
                rClone.show();
                DivGridSec.find('.DivRowBox').append(rClone);
                createGrid();
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.addGridCol').click(function () {
                var cClone = DivGridSec.find('.colBox:first').clone(true);
                cClone.show();
                DivGridSec.find('.DivColBox').append(cClone);
                createGrid();
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.addGridSection').click(function () {
                isNewSection = true;
                DivGridSec.find('.section-active').removeClass('section-active');
                var sClone = DivGridSec.find('.grid-Section:first').clone(true);
                sClone.removeClass('displayNone');
                sClone.addClass('section-active');
                sectionCount = DivGridSec.find('.grid-Section').length; //Number(DivGridSec.find('.grid-Section:last').attr("sectionCount")) + 1;
                sClone.attr('sectionCount', sectionCount);
                sClone.find('.vis-grey-disp-ttl').text("Section " + sectionCount);
                DivGridSec.find('.vis-sectionAdd').append(sClone);
                activeSection = $('<div name="Section ' + sectionCount + '" sectionCount="' + sectionCount + '"  class="section' + sectionCount + ' vis-wizard-section" style="padding:5px"></div>')
                DivViewBlock.find('.vis-viewBlock').append(activeSection);
                //sectionCount++;
                DivGridSec.find('.rowBox:not(:first)').remove();
                DivGridSec.find('.colBox:not(:first)').remove();
                DivGridSec.find('.addGridRow').click();
                DivGridSec.find('.addGridCol').click();

                DivGridSec.find('.vis-sectionAdd').sortable({
                    disabled: false,
                    update: function (event, ui) {
                        var sectionCount = ui.item.attr('sectioncount');
                        var end_pos = ui.item.index();
                        var next = ui.item.next().attr('sectioncount');
                        if (next) {
                            DivViewBlock.find('[sectioncount="' + next + '"]').before(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                        } else {
                            var pre = ui.item.prev().attr('sectioncount');
                            DivViewBlock.find('[sectioncount="' + pre + '"]').after(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                        }
                    }
                });
            });

            DivGridSec.find('.grid-Section .vis-grey-disp-el-xross').click(function () {
                var secNo = $(this).closest('.grid-Section').attr('sectionCount');
                if ($(this).closest('.grid-Section').hasClass('section-active')) {
                    DivGridSec.find('.grid-Section').eq(1).addClass('section-active');
                    DivGridSec.find('.grid-Section').eq(1).find('.vis-grey-disp-el').click();
                }
                $(this).closest('.grid-Section').remove();
                var removeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);

                removeSection.find('.fieldLbl').each(function () {
                    if ($(this).attr('title') && $(this).attr('title').length > 0) {
                        unlinkField($(this).attr('title'), $(this));
                    }
                });
                removeSection.remove();
                delete gridObj['section' + secNo];
                secNo = DivGridSec.find('.section-active').attr('sectionCount');
                activeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.grid-Section .vis-grey-disp-el').click(function () {
                DivGridSec.find('.section-active').removeClass('section-active');
                $(this).parent().addClass('section-active');
                var secNo = DivGridSec.find('.section-active').attr('sectionCount');

                activeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                activeSection.addClass('vis-active-block');
                createGridRowCol();
                if (isUndoRedo) {
                    //isUndoRedo = false;
                } else {
                    templatechanges();
                }

            });

            btnVaddrow.click(function () {
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdRowAdd').eq(Number(gridArea[2]) - 1).click();
            });

            btnVdelrow.click(function () {
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdRowDel').eq(Number(gridArea[2]) - 1).click();
            });

            btnVaddCol.click(function () {
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdColAdd').eq(Number(gridArea[3]) - 1).click();
            });

            btnVdelCol.click(function () {
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdColDel').eq(Number(gridArea[3]) - 1).click();
            });

            DivGridSec.find('.grdRowDel').click(function () {
                var idx = $(this).closest('.rowBox').index();
                rowIdx = idx;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                var dNo = (idx * totalCol + 1) - totalCol;
                for (var i = dNo; i < (dNo + totalCol); i++) {
                    activeSection.find('.grdDiv').eq(i - 1).addClass('del');
                    var blk = activeSection.find('.grdDiv').eq(i - 1).find('.fieldLbl');
                    if (blk && blk.attr('title') && blk.attr('title').length > 0) {
                        unlinkField(blk.attr('title'), blk);
                    }
                }
                activeSection.find('.del').remove();
                $(this).closest('.rowBox').remove();
                gridCss(-1, 0);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.grdRowAdd').click(function () {
                var idx = $(this).closest('.rowBox').index() - 1;
                var rClone = DivGridSec.find('.rowBox:first').clone(true);
                rClone.show();
                DivGridSec.find('.DivRowBox').append(rClone);

                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;


                var pos = ((idx + 1) * totalCol);
                rowIdx = (idx + 1);
                for (var i = 0; i < totalCol; i++) {
                    activeSection.find('.grdDiv').eq(pos - 1).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                }

                gridCss(1, 0);
                templatechanges();
            });

            DivGridSec.find('.grdColDel').click(function () {
                var idx = $(this).closest('.colBox').index() - 1;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                colIdx = (idx + 1);
                for (var i = 0; i < totalRow; i++) {
                    for (var j = 0; j < totalCol; j++) {
                        if (j == idx) {
                            var dNo = totalCol * i + j;
                            activeSection.find('.grdDiv').eq(dNo).addClass('del');
                            var blk = activeSection.find('.grdDiv').eq(dNo).find('.fieldLbl');
                            if (blk && blk.attr('title') && blk.attr('title').length > 0) {
                                unlinkField(blk.attr('title'), blk);
                            }
                        }
                    }
                }

                activeSection.find('.del').remove();
                $(this).closest('.colBox').remove();
                gridCss(0, -1);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.grdColAdd').click(function () {

                var cClone = DivGridSec.find('.colBox:first').clone(true);
                cClone.show();
                DivGridSec.find('.DivColBox').append(cClone);
                addedColPos = [];
                var idx = $(this).closest('.colBox').index() - 1;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                colIdx = idx + 1;
                for (var i = 0; i < totalRow; i++) {
                    for (var j = 0; j < totalCol; j++) {
                        if (j == idx) {
                            var pos = totalCol * i + j;
                            addedColPos.push(pos + 1);
                            activeSection.find('.grdDiv').eq(pos).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                        }
                    }
                }
                gridCss(0, 1);
                templatechanges();
            });

            DivGridSec.find('.mergeCell').click(function () {
                mergeCell();
            });

            txtColGap.change(function () {
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                gridCss();
                templatechanges();
            });

            txtRowGap.change(function () {
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                gridCss();
                templatechanges();
            });

            DivGridSec.find('.rowBox input,select').change(function () {
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                gridCss();
                templatechanges();
            });

            DivGridSec.find('.colBox input,select').change(function () {
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                gridCss();
                templatechanges();
            });

            DivCardField.find('.vis-grey-icon .fa-circle').click(function () {
                if ($(this).hasClass('vis-succes-clr')) {
                    var fid = $(this).closest('.fieldLbl').attr('fieldid');
                    DivViewBlock.find('[fieldid="' + fid + '"]').mousedown().mouseup();
                    setTimeout(function () {
                        divTopNavigator.find('[command="Unlink"]').click();
                    }, 100);

                } else {
                    linkField($(this).closest('.fieldLbl'));
                }
                templatechanges();
            });

            btn_BlockCancel.click(function () {
                DivTemplate.find('.mainTemplate[templateid="' + AD_HeaderLayout_ID + '"]').parent().click();
                if (count > 1) {
                    addSelectedTemplate();
                    fillcardLayoutfromTemplate();
                }

                btn_BlockCancel.hide();
            });
        }
        // #endregion
        // #region Step 2 functions    

        /**
         * Genrate grid css Layout
         * @param {any} r
         * @param {any} c
         */
        function gridCss(r, c) {
            if (!r) {
                r = 0;
            }

            if (!c) {
                c = 0;
            }

            var secNo = DivGridSec.find('.section-active').attr('sectionCount');
            var secName = DivGridSec.find('.section-active .vis-grey-disp-ttl').text();
            var Obj = {
            }
            var rowCss = "";
            DivGridSec.find('.rowBox:not(:first)').each(function (i) {
                if (i == 0) {
                    $(this).find('.grdRowDel').hide();
                }
                if ($(this).find('select :selected').val() == 'auto') {
                    rowCss += $(this).find('select :selected').val() + ' ';
                } else {
                    rowCss += $(this).find('input').val() + '' + $(this).find('select :selected').val() + ' ';
                }

                Obj['row_' + i] = {
                    val: $(this).find('input').val(),
                    msr: $(this).find('select :selected').val(),
                }
            });
            var colCss = "";
            DivGridSec.find('.colBox:not(:first)').each(function (i) {
                if (i == 0) {
                    $(this).find('.grdColDel').hide();
                }

                if ($(this).find('select :selected').val() == 'auto') {
                    colCss += $(this).find('select :selected').val() + ' ';
                } else {
                    colCss += $(this).find('input').val() + '' + $(this).find('select :selected').val() + ' ';
                }
                Obj['col_' + i] = {
                    val: $(this).find('input').val(),
                    msr: $(this).find('select :selected').val()
                }
            });

            var totalRow = DivGridSec.find('.rowBox:not(:first)').length;
            var totalCol = DivGridSec.find('.colBox:not(:first)').length;
            Obj["sectionNo"] = secNo;
            Obj["sectionName"] = secName;
            Obj["rowGap"] = txtRowGap.val();
            Obj["colGap"] = txtColGap.val();
            Obj["totalRow"] = totalRow;
            Obj["totalCol"] = totalCol;

            gridObj["section" + secNo] = Obj;
            var grSec = activeSection;
            grSec.attr("row", totalRow);
            grSec.attr("col", totalCol);

            grSec.css({
                'grid-template-columns': colCss,
                'grid-template-rows': rowCss,
                'gap': txtRowGap.val() + 'px ' + txtColGap.val() + 'px'
            });

            var isEnter = false;
            var ri = rowIdx;
            var ci = colIdx;
            if (r == -1) {
                ri--;
            }
            if (c == -1) {
                ci--;
            }
            var cc = 0;
            var ps = addedColPos;

            grSec.find('.grdDiv').each(function (index) {
                var gArea = $(this).css('grid-area').split('/');
                var r_start = Number($.trim(gArea[0]));
                var r_end = Number($.trim(gArea[2]));
                var c_start = Number($.trim(gArea[1]));
                var c_end = Number($.trim(gArea[3]));

                var rowPosition = (Math.floor(index / totalCol)) + 1;
                if (rowIdx != null) {
                    if ((rowIdx > (r_start - 1) && rowIdx < (r_end - 1))) {
                        $(this).css('grid-area', r_start + '/' + c_start + '/' + (r_end + r) + '/' + (c_end));
                        isEnter = true;
                    }

                    if (isEnter && r > 0) {
                        for (var i = Number(r_start); i <= (Number(r_end)); i++) {
                            for (var j = c_start; j < c_end; j++) {
                                var pos = totalCol * i + j;
                                grSec.find('.grdDiv').eq(pos - 1).css('display', 'none');
                            }
                            if (rowIdx == i) {
                                break;
                            }
                        }
                        isEnter = false;
                        rowIdx = null;
                    }

                } else if (colIdx != null) {
                    if ((colIdx > (c_start - 1) && colIdx < (c_end - 1))) {
                        $(this).css('grid-area', r_start + '/' + c_start + '/' + r_end + '/' + (c_end + c));
                        isEnter = true;
                        grSec.find('.grdDiv').eq(ps[cc]).css('display', 'none');

                    }
                    cc++;
                    if (isEnter && c > 0) {
                        for (var i = 0; i < addedColPos.length; i++) {
                            var rowPos = Math.floor(addedColPos[i] / totalCol) + 1;
                            if (rowPos > (r_start - 1) && rowPos < (r_end)) {
                                grSec.find('.grdDiv').eq(addedColPos[i]).css('display', 'none');
                            }
                        }

                        isEnter = false;
                        //colIdx = null;
                        addedColPos = [];
                    }
                }

                gArea = $(this).css('grid-area').split('/');
                r_start = Number($.trim(gArea[0]));
                r_end = Number($.trim(gArea[2]));
                c_start = Number($.trim(gArea[1]));
                c_end = Number($.trim(gArea[3]));

                var colposition = (index % totalCol) + 1;
                if (!$(this).hasClass('vis-split-cell')) {
                    $(this).css('grid-area', rowPosition + '/' + colposition + '/' + (rowPosition + 1) + '/' + (colposition + 1));
                } else if (c != 0) {
                    if (c > 0) {
                        if (colposition > ci) {
                            $(this).css('grid-area', r_start + '/' + (c_start + c) + '/' + (r_end) + '/' + (c_end + c));
                        }
                    } else {
                        if (colposition > ci) {
                            $(this).css('grid-area', r_start + '/' + (c_start - 1) + '/' + (r_end) + '/' + (c_end - 1));
                        }
                    }
                } else if (r != 0) {
                    if (r > 0) {
                        if (rowPosition > ri) {
                            $(this).css('grid-area', (r_start + r) + '/' + c_start + '/' + (r_end + r) + '/' + c_end);
                        }
                    } else {
                        if (rowPosition > ri) {
                            $(this).css('grid-area', (r_start - 1) + '/' + c_start + '/' + (r_end - 1) + '/' + c_end);
                        }
                    }
                }
            });

            colIdx = null;
        }

        /**Genrate Grid */
        function createGrid() {
            var rowBox = DivGridSec.find('.rowBox');
            var colBox = DivGridSec.find('.colBox');
            var totalRow = rowBox.length - 1;
            var totalCol = colBox.length - 1;
            var grSec = activeSection;

            if (totalCol > 0 && totalRow > 0) {
                var oldrow = grSec.attr('row');
                var oldcol = grSec.attr('col');
                if (oldcol != totalCol && !isNewSection) {
                    for (var r = 1; r <= oldrow; r++) {
                        var pos = (r * oldcol) + (r - 1);
                        grSec.find('.grdDiv').eq(pos - 1).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                    }

                } else {
                    var totalDiv = totalRow * totalCol - grSec.find('.grdDiv').length;
                    for (var i = 0; i < totalDiv; i++) {
                        grSec.append("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                    }
                }

                grSec.find('.grdDiv').unbind('mouseover');
                grSec.find('.grdDiv').mouseover(function (e) {
                    e.preventDefault();
                    if (mdown && !$(this).hasClass('vis-split-cell')) {
                        selectTo($(this));
                    }

                });
                isNewSection = false;
            }

            gridCss();

        }

        function createGridRowCol() {
            DivGridSec.find('.rowBox:not(:first)').remove();
            var secNo = DivGridSec.find('.section-active').attr('sectionCount');
            var section = gridObj["section" + secNo];
            var rClone = DivGridSec.find('.rowBox:first').clone(true);
            rClone.show();
            DivGridSec.find('.colBox:not(:first)').remove();
            var cClone = DivGridSec.find('.colBox:first').clone(true);
            cClone.show();
            if (section) {
                for (let key in section) {
                    var item = section[key];
                    if (key.indexOf('row_') != -1) {
                        rClone.find('input').val(item.val);
                        rClone.find('select').val(item.msr);
                        DivGridSec.find('.DivRowBox').append(rClone);
                        rClone = DivGridSec.find('.rowBox:last').clone(true);
                    } else if (key.indexOf('col_') != -1) {
                        cClone.find('input').val(item.val);
                        cClone.find('select').val(item.msr);
                        DivGridSec.find('.DivColBox').append(cClone);
                        cClone = DivGridSec.find('.colBox:last').clone(true);
                    }
                }
                txtRowGap.val(section.rowGap);
                txtColGap.val(section.colGap);
                DivGridSec.find('.rowBox .grdRowDel').eq(1).hide();
                DivGridSec.find('.colBox .grdColDel').eq(1).hide();
            }

        }

        function selectTo(cell) {
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var idx = activeSection.find(cell).index();
            if (idx < 0) {
                return;
            }

            var currentRow = Math.ceil((idx + 1) / totalCol) - 1;

            //var row = cell.parent();
            var cellIndex = (idx) - totalCol * (currentRow);
            var rowIndex = currentRow;
            var rowStart, rowEnd, cellStart, cellEnd;

            if (rowIndex < startRowIndex) {
                rowStart = rowIndex;
                rowEnd = startRowIndex;
            } else {
                rowStart = startRowIndex;
                rowEnd = rowIndex;
            }

            if (cellIndex < startCellIndex) {
                cellStart = cellIndex;
                cellEnd = startCellIndex;
            } else {
                cellStart = startCellIndex;
                cellEnd = cellIndex;
            }

            //console.log(rowStart, rowEnd, cellStart, cellEnd);
            DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
            for (var i = rowStart; i <= rowEnd; i++) {
                for (var j = cellStart; j <= cellEnd; j++) {
                    activeSection.find('.grdDiv').eq(totalCol * i + j).addClass("vis-active-block");
                }
            }

            if (DivViewBlock.find('.vis-active-block').length > 1) {
                divTopNavigator.find('[command="Merge"]').parent().show();
            } else {
                divTopNavigator.find('[command="Merge"]').parent().hide();
            }
        }

        function mergeCell() {
            var rowStart = 0, rowEnd = 0, colStart = 0, colEnd = 1;
            var rowCount = 0;
            var colCount = 0;
            var countActive = 1;
            var totalActive = activeSection.find('.vis-active-block').length;
            var lastRow = 1;
            var isRowChange = false;
            var activColInRow = 0;
            var colBoxLen = DivGridSec.find('.colBox').length - 1;
            activeSection.find('.grdDiv').each(function (e) {
                colCount++;
                var currentRow = Math.ceil((e + 1) / colBoxLen);
                if (currentRow != lastRow) {
                    colCount = 1;
                }
                lastRow = currentRow;
                //$(this).css('grid-area', currentRow + '/' + colCount + '/' + (currentRow + 1) + '/' + (colCount+1));

                if ($(this).hasClass('vis-active-block')) {
                    if (activColInRow == 0) {
                        activColInRow = currentRow;
                    }
                    if (rowStart == 0 && colStart == 0) {
                        rowStart = currentRow;
                        colStart = colCount;
                        colEnd = colCount;
                    }

                    if (activColInRow == currentRow) {
                        colEnd++;
                    }
                    if (countActive == totalActive) {
                        rowEnd = currentRow + 1;
                    }
                    countActive++;
                    $(this)[0].style.removeProperty('grid-area');
                    $(this)[0].style.removeProperty('display');
                }

            });

            var unMearge = $('<span class="vis-split-cell"></span>');
            activeSection.find('.vis-active-block:not(:first)').hide().removeClass('vis-active-block');
            activeSection.find('.vis-active-block:first').css('grid-area', rowStart + '/' + colStart + '/' + rowEnd + '/' + colEnd).addClass('vis-split-cell');

            unMearge.click(function () {
                applyunMerge($(this).parent());
                $(this).remove();
            });
        }

        function applyunMerge(e) {
            var gArea = e.css('grid-area').split('/');
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var DVB = activeSection.find('.grdDiv');
            for (var i = Number($.trim(gArea[0])); i < Number($.trim(gArea[2])); i++) {
                for (var j = Number($.trim(gArea[1])); j < Number($.trim(gArea[3])); j++) {
                    var gIdx = totalCol * (i - 1) + (j - 1);
                    DVB.eq(gIdx)[0].style.removeProperty('grid-area');
                    DVB.eq(gIdx)[0].style.removeProperty('display');
                }
            }
            gridCss();
        }

        function checkStyle(prop, val, htm) {
            var styles = htm.attr('style'),
                value = false;

            styles && styles.split(";").forEach(function (e) {
                var style = e.split(":");
                if (val && $.trim(style[0]) === prop && $.trim(style[1]) === val) {
                    value = true;
                } else if (!val && $.trim(style[0]) === prop) {
                    value = true;
                }
            });
            return value;
        }

        function applycommand(command, styleValue) {
            //isChange = true;
            //if (isChange && AD_HeaderLayout_ID != "0") {
            //    btn_BlockCancel.show();
            //}
            var tag = DivViewBlock.find('.vis-active-block');

            if (editorProp[command].proprty == "flex-direction") {
                tag[0].style.removeProperty("display");
                tag.find('.fieldGroup').removeAttr('style');
            }

            if (command == 'maxTextmultiline') {
                if (styleValue == "" || styleValue == null) {
                    tag[0].style.removeProperty('overflow');
                    tag[0].style.removeProperty('display');
                    tag[0].style.removeProperty('-webkit-box-orient');
                } else {
                    tag.css({
                        'overflow': 'hidden',
                        'display': '-webkit-box',
                        '-webkit-box-orient': 'vertical'
                    });
                }
            }


            if (command != 'gradient' && (styleValue == "" || styleValue == null)) {
                tag[0].style.removeProperty(editorProp[command].proprty);
                return;
            }

            if (command == 'gradient') {
                var color1 = DivStyleSec1.find('.' + command + '1').val();
                var color2 = DivStyleSec1.find('.' + command + '2').val();
                var prcnt = DivStyleSec1.find('.percent1').val();
                var prcnt2 = DivStyleSec1.find('.percent2').val();
                var deg = DivStyleSec1.find('.grdDirection option:selected').val();
                styleValue = 'linear-gradient(' + deg + ',' + color1 + ' ' + prcnt + '%,  ' + color2 + ' ' + prcnt2 + '%)';
                //DivStyleSec1.find('.vis-gradient-comp').css('background', styleValue);
                DivStyleSec1.find('[data-command="gradientInput"]').val('(' + deg + ',' + color1 + ' ' + prcnt + '%,  ' + color2 + ' ' + prcnt2 + '%)');
            }

            if (command == 'gradientInput') {
                styleValue = 'linear-gradient' + styleValue;
            }

            if (command == 'boxShadow') {
                var x = DivStyleSec1.find('.boxX').val();
                var y = DivStyleSec1.find('.boxY').val();
                var b = DivStyleSec1.find('.boxB').val();
                var c = DivStyleSec1.find('.boxC').val();
                styleValue = x + ' ' + y + ' ' + b + ' ' + c;
            }

            if (editorProp[command].proprty == 'justify-content' || editorProp[command].proprty == "align-items" || editorProp[command].proprty == "flex-direction") {
                tag.css("display", "flex");
                if (editorProp[command].proprty == "flex-direction") {
                    tag.find('.fieldGroup').css({
                        "display": "flex",
                        "flex-direction": $.trim(styleValue)
                    });
                }
            }

            if (styleValue == 'column' || styleValue == 'column-reverse') {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').addClass('vis-disable-event');
            } else {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').removeClass('vis-disable-event');
            }

            tag.css(editorProp[command].proprty, $.trim(styleValue));

            if (command == 'width' || command == 'height') {
                var sty = tag.attr('style'); //+ ';' + editorProp[command].proprty + ':' + $.trim(styleValue) + ' !important';
                sty = sty.replace(editorProp[command].proprty + ': ' + $.trim(styleValue), editorProp[command].proprty + ':' + $.trim(styleValue) + '!important');
                tag.attr('style', sty);
            }

            templatechanges();
        }

        function getTemplateDesign() {
            var url = VIS.Application.contextUrl + "CardView/getTemplateDesign";
            DivTemplate.find('.vis-cardSingleViewTemplate:not(:first)').remove();
            var obj = {
                ad_Window_ID: mTab.getAD_Window_ID(),
                ad_Tab_ID: mTab.getAD_Tab_ID()
            }
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(obj),
                success: function (data) {
                    var result = JSON.parse(data);
                    for (var i = 0; i < result.length; i++) {
                        DivTemplate.find('.vis-cardTemplateContainer').append($(result[i].template));
                    }
                    //scaleTemplate();
                    IsBusy(false);
                    setTimeout(function () {
                        scaleTemplate();
                        IsBusy(false);
                        if (DivTemplate.find('.vis-cardSingleViewTemplate:not(:hidden)').length == 1) {
                            DivTemplate.find('.vis-noTemplateIcon').show();
                        } else {
                            DivTemplate.find('.vis-noTemplateIcon').hide();
                        }
                    }, 1000);

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }, complete: function () {
                    DivTemplate.find('.vis-cardSingleViewTemplate').click(function () {
                        DivTemplate.find('.vis-cardSingleViewTemplate').removeClass('vis-active-template');
                        $(this).addClass('vis-active-template');
                    });
                }
            });
        }

        function saveTemplate(e) {
            if (isNewRecord) {
                if (txtCardName.val() == "") {
                    VIS.ADialog.error("FillMandatory", true, "Name");
                    IsBusy(false);
                    return false;
                }

            }

            if (isNewRecord && cardViewInfo != null) {
                for (var a = 0; a < cardViewInfo.length; a++) {
                    if (cardViewInfo[a].CardViewName.trim() == txtCardName.val().trim()) {
                        VIS.ADialog.error("cardAlreadyExist", true, "");
                        IsBusy(false);
                        return false;
                    }
                }
            }

            IsBusy(true);
            //if (txtTemplateName.val() == "") {
            //    VIS.ADialog.error("FillMandatory", true, "Template Name");
            //    return false;
            //}
            var fieldObj = [];
            var seq = 10;
            var cardSection = [];

            cardViewColArray = [];
            var isFieldLinked = false;
            DivViewBlock.find('.grdDiv:not(:hidden)').each(function (index) {
                var gridArea = $(this).css('grid-area').split('/');
                var secNo = $(this).closest('.vis-wizard-section').attr("sectioncount");
                gridObj['section' + secNo]["style"] = $(this).closest('.vis-wizard-section').attr("style");
                gridObj['section' + secNo]["sectionID"] = $(this).closest('.vis-wizard-section').attr("sectionid") || 0;
                var sectionSeq = ($(this).closest('.vis-wizard-section').index() + 1) * 10;
                gridObj['section' + secNo]["sectionSeq"] = sectionSeq;
                gridObj['section' + secNo]["sectionName"] = $(this).closest('.vis-wizard-section').attr("name");
                var columnSQL = null;
                if ($(this).find('sql').length > 0) {
                    columnSQL = $(this).attr('query') || null;
                }
                if ($(this).find('.fieldGroup:not(:hidden)').length > 0) {
                    $(this).find('.fieldGroup:not(:hidden)').each(function (index) {
                        isFieldLinked = true;
                        var valueStyle = "";
                        if ($(this).find('.imgField').length > 0) {
                            var isBR = $(this).find('br').length;
                            if ($(this).find('.imgField').next('.fieldValue').length > 0) {
                                valueStyle = '@img::' + $(this).find('.imgField').attr('style') || '';
                                if (isBR > 0) {
                                    valueStyle += '|<br>';
                                }
                                valueStyle += ' |@value::' + $(this).find('.fieldValue').attr('style') || 'display:none';
                            } else {
                                valueStyle = '@value::' + $(this).find('.fieldValue').attr('style') || 'display:none';
                                if (isBR > 0) {
                                    valueStyle += '|<br>';
                                }
                                valueStyle += ' |@img::' + $(this).find('.imgField').attr('style') || '';
                            }


                        } else {
                            valueStyle = $(this).find('.fieldValue').attr('style') || '';
                        }



                        var hideFieldIcon = true;
                        if ($(this).find('.fa-star').length == 0) {
                            hideFieldIcon = true;
                        }
                        if ($(this).find('.fieldLbl').attr('showfieldicon')) {
                            hideFieldIcon = $(this).find('.fieldLbl').attr('showfieldicon') == 'true' ? true : false;
                        }


                        var obj1 = {
                            cardFieldID: $(this).attr('cardfieldid'),
                            sectionNo: sectionSeq,
                            rowStart: $.trim(gridArea[0]),
                            rowEnd: $.trim(gridArea[2]),
                            colStart: $.trim(gridArea[1]),
                            colEnd: $.trim(gridArea[3]),
                            seq: seq,
                            style: $(this).closest('.grdDiv').attr('style'),
                            fieldID: $(this).find('.fieldLbl').attr('fieldid'),
                            valueStyle: valueStyle,
                            fieldStyle: $(this).find('.fieldLbl').attr('style') || '',
                            hideFieldIcon: hideFieldIcon,
                            hideFieldText: $(this).find('.fieldLbl').attr('showfieldtext') == 'true' ? true : false,
                            columnSQL: columnSQL,
                            contentFieldValue: null,
                            contentFieldLabel: null
                        }

                        var f = {}
                        f.AD_Field_ID = obj1.fieldID;
                        f.CardViewID = AD_CardView_ID;
                        f.SeqNo = obj1.seq;
                        cardViewColArray.push(f);
                        fieldObj.push(obj1);
                    });
                } else {
                    var hideTxt = false;
                    if ($(this).attr("showfieldtext")) {
                        hideTxt = $(this).attr("showfieldtext") == 'Y' ? true : false;
                    }

                    var hideIcon = false;
                    if ($(this).attr("showfieldicon")) {
                        hideIcon = $(this).attr("showfieldicon") == 'Y' ? true : false;
                    }

                    var obj1 = {
                        cardFieldID: null,
                        sectionNo: sectionSeq,
                        rowStart: $.trim(gridArea[0]),
                        rowEnd: $.trim(gridArea[2]),
                        colStart: $.trim(gridArea[1]),
                        colEnd: $.trim(gridArea[3]),
                        seq: seq,
                        style: $(this).attr('style'),
                        fieldID: null,
                        valueStyle: $(this).attr("fieldValuestyle"),
                        fieldStyle: $(this).attr("fieldValueLabel"),
                        hideFieldIcon: hideIcon,
                        hideFieldText: hideTxt,
                        columnSQL: columnSQL,
                        contentFieldValue: null,
                        contentFieldLabel: null
                    }

                    var f = {}
                    f.AD_Field_ID = obj1.fieldID;
                    f.CardViewID = AD_CardView_ID;
                    f.SeqNo = obj1.seq;
                    cardViewColArray.push(f);
                    fieldObj.push(obj1);
                }
                seq += 10;
            });

            if (!isFieldLinked) {
                VIS.ADialog.error("FillMandatory", true, "Link atleast one field");
                IsBusy(false);
                return false;
            }

            //console.log(gridObj);
            //console.log(fieldObj);
            Object.keys(gridObj).forEach(function (key) {
                var fobj = {
                    sectionName: gridObj[key].sectionName,
                    sectionID: gridObj[key].sectionID,
                    sectionNo: gridObj[key].sectionSeq,
                    style: gridObj[key].style,
                    totalRow: gridObj[key].totalRow,
                    totalCol: gridObj[key].totalCol,
                    rowGap: gridObj[key].rowGap,
                    colGap: gridObj[key].colGap
                };
                cardSection.push(fobj);
            });

            if (isSystemTemplate == "Y") {
                templateName = (templateName || txtCardName.val()) + "_" + Math.floor(Math.random() * 10000);
                AD_HeaderLayout_ID = 0;
            };

            if (isCopy) {
                templateName = (txtCardName.val() + "_" + Math.floor(Math.random() * 10000));
                AD_HeaderLayout_ID = 0;
                AD_CardView_ID = "undefined";
                isNewRecord = true
            }


            var cardID = AD_CardView_ID;
            if (cardID == "undefined") {
                cardID = 0;
            }

            if (isNewRecord)
                cardID = 0;
            var finalobj = {
                CardViewID: cardID,
                templateID: AD_HeaderLayout_ID || 0,
                templateName: templateName,
                templateCategory: 0,
                style: DivViewBlock.find('.vis-viewBlock').attr('style'),
                cardSection: cardSection,
                cardTempField: fieldObj,
                isSystemTemplate: 'N',
                refTempID: refTempID || 0
            }

            var url = VIS.Application.contextUrl + "CardView/SaveCardTemplate";
            $.ajax({
                type: "POST",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(finalobj),
                success: function (data) {
                    var result = JSON.parse(data);
                    if (isNaN(result)) {
                        toastr.error(result, '', { timeOut: 3000, "positionClass": "toast-top-center", "closeButton": true, });
                        IsBusy(false);
                        return;
                    }
                    AD_HeaderLayout_ID = result;
                    isSystemTemplate = 'N';
                    if (!isNewRecord) {
                        isEdit = true;
                    }
                    IsBusy(false);
                    SaveChanges(e);


                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }
            });


        }

        function fill(htm) {
            DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').removeClass('vis-disable-event');
            DivStyleSec1.find('#master001_' + WindowNo + ' input').val('');
            DivStyleSec1.find('#master001_' + WindowNo + ' select').val('');
            DivStyleSec1.find('.vis-back-color03').css('background-color', 'teal');
            DivStyleSec1.find('.gradient2').val('#000');
            DivStyleSec1.find('.percent1').val('0');
            DivStyleSec1.find('.percent2').val('100');
            DivStyleSec1.find('.grdDirection').val('to bottom');
            chkAllBorderRadius.prop('checked', true);
            DivStyleSec1.find('.allBorderRadius').removeClass('displayNone');
            DivStyleSec1.find('.singleBorderRadius').addClass('displayNone');
            DivStyleSec1.find("[data-command1]").parent().removeClass('vis-hr-elm-inn-active');
            var styles = htm.attr('style');
            if (htm.find('sql').length > 0) {
                txtSQLQuery.val(VIS.secureEngine.decrypt(htm.attr("query")));
            } else {
                txtSQLQuery.val('');
            }

            //styles = styles.split(';');
            //styles.join("\n\r");
            txtCustomStyle.val(styles);
            styles && styles.split(";").forEach(function (e) {
                var style = e.split(":");
                for (const a in editorProp) {
                    if ($.trim(style[0]) == 'border-left' || $.trim(style[0]) == 'border-right' || $.trim(style[0]) == 'border-top' || $.trim(style[0]) == 'border-bottom') {
                        style[0] = style[0] + '-width';
                    }

                    if ($.trim(style[0]) == $.trim(editorProp[a].proprty)) {
                        var v = $.trim(style[1]);
                        if (editorProp[a].value == '') {

                            if (a == 'width' || a == 'height') {
                                v = v.replaceAll('!important', '');
                            }

                            if (a == 'fontFamily') {
                                v = v.replaceAll('"', '');
                            }

                            if (a == 'padding' && $.trim(v).split(' ').length > 1) {
                                chkAllPadding.prop('checked', false);
                                DivStyleSec1.find('.allPadding').addClass('displayNone');
                                DivStyleSec1.find('.singlePadding').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='paddingLeft']").val(htm.css('padding-left'));
                                DivStyleSec1.find("[data-command='paddingTop']").val(htm.css('padding-top'));
                                DivStyleSec1.find("[data-command='paddingRight']").val(htm.css('padding-right'));
                                DivStyleSec1.find("[data-command='paddingBottom']").val(htm.css('padding-bottom'));
                            } else if (a == 'padding') {
                                chkAllPadding.prop('checked', true);
                                DivStyleSec1.find('.allPadding').removeClass('displayNone');
                                DivStyleSec1.find('.singlePadding').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else if (a == 'margin' && $.trim(v).split(' ').length > 1) {
                                chkAllMargin.prop('checked', false);
                                DivStyleSec1.find('.allMargin').addClass('displayNone');
                                DivStyleSec1.find('.singleMargin').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='marginLeft']").val(htm.css('margin-left'));
                                DivStyleSec1.find("[data-command='marginTop']").val(htm.css('margin-top'));
                                DivStyleSec1.find("[data-command='marginRight']").val(htm.css('margin-right'));
                                DivStyleSec1.find("[data-command='marginBottom']").val(htm.css('margin-bottom'));
                            } else if (a == 'margin') {
                                chkAllMargin.prop('checked', true);
                                DivStyleSec1.find('.allMargin').removeClass('displayNone');
                                DivStyleSec1.find('.singleMargin').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else if (a == 'borderRadius' && $.trim(v).split(' ').length > 1) {
                                chkAllBorderRadius.prop('checked', false);
                                DivStyleSec1.find('.allBorderRadius').addClass('displayNone');
                                DivStyleSec1.find('.singleBorderRadius').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='borderTopLeftRadius']").val(htm.css('border-top-left-radius'));
                                DivStyleSec1.find("[data-command='borderTopRightRadius']").val(htm.css('border-top-right-radius'));
                                DivStyleSec1.find("[data-command='borderBottomRightRadius']").val(htm.css('border-bottom-right-radius'));
                                DivStyleSec1.find("[data-command='borderBottomLeftRadius']").val(htm.css('border-bottom-left-radius'));
                            } else if (a == 'borderRadius') {
                                chkAllBorderRadius.prop('checked', true);
                                DivStyleSec1.find('.allBorderRadius').removeClass('displayNone');
                                DivStyleSec1.find('.singleBorderRadius').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else {
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            }

                            if (a == 'backgroundColor') {
                                DivStyleSec1.find('.vis-zero-BTopLeftBLeft:first').css('background-color', v);
                                DivStyleSec1.find("[data-command='" + a + "'][type='color']").val(rgb2hex(v));
                            } else if (a == 'color') {
                                DivStyleSec1.find('.vis-zero-BTopLeftBLeft:last').css('background-color', v);
                                DivStyleSec1.find("[data-command='" + a + "'][type='color']").val(rgb2hex(v));
                            }
                            else if (a.indexOf('border') != -1 && a.indexOf('radius') == -1) {
                                var rgb = v.split('rgb');
                                if (rgb.length > 1) {
                                    v = v.replace('rgb' + rgb[1], rgb2hex('rgb' + rgb[1]));
                                }
                                v = v.split(' ');
                                var bdrDiv = DivStyleSec1.find("[data-command='" + a + "']").closest('.vis-prop-pan-cont');
                                if (v.length == 1) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                } else if (v.length == 2) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                    bdrDiv.find("select").val(v[1]);
                                } else if (v.length == 3) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                    bdrDiv.find("select").val(v[1]);
                                    bdrDiv.find("[type='color']").val(v[2]);
                                    bdrDiv.find(".vis-back-color03").css('background-color', v[2]);
                                }

                                if (style[0].indexOf('-width') != -1) {
                                    chkAllBorder.prop('checked', false);
                                    DivStyleSec1.find('.allBorder').addClass('displayNone');
                                    DivStyleSec1.find('.singleBorder').removeClass('displayNone');
                                } else {
                                    chkAllBorder.prop('checked', true);
                                    DivStyleSec1.find('.allBorder').removeClass('displayNone');
                                    DivStyleSec1.find('.singleBorder').addClass('displayNone');
                                }
                            }
                            break;
                        } else {
                            if (editorProp[a].value == v) {
                                DivStyleSec1.find("[data-command1='" + a + "']").parent().addClass('vis-hr-elm-inn-active');
                                break;
                            }
                        }

                    }
                }
            });

            if (DivStyleSec1.find("[data-command='flexDirection'] option:selected").val() == 'column' || DivStyleSec1.find("[data-command='flexDirection'] option:selected").val() == 'column-reverse') {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').addClass('vis-disable-event');
            }

        }

        function rgb2hex(rgb) {
            if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);

        }

        function unlinkField(fieldName, itm) {
            itm.closest('.fieldGroup').remove();
            var fld = DivCardField.find('[fieldid="' + itm.attr('fieldid') + '"]');
            fld.find('.linked').removeClass('linked vis-succes-clr');
            fld.removeAttr('seqNo');

            fld.prop("draggable", true);
            DivCardField.find('[draggable="true"]:not(:first)').sort(Ascending_sort).appendTo(DivCardField);

            itm.remove();
            divTopNavigator.hide();
        }

        function linkField(itm) {
            if (itm) {
                var blok = DivViewBlock.find('.vis-active-block');
                if (blok.hasClass('grdDiv')) {
                    var fieldHtml = $('<div class="fieldGroup" draggable="true"></div>');
                    var fID = itm.attr('fieldid');
                    var newitm = itm.clone(true);
                    newitm.attr("showfieldicon", true);
                    itm.find('.vis-grey-icon').remove();
                    itm.attr('draggable', false);
                    if (mTab.getFieldById(Number(fID)).getShowIcon()) {
                        fieldHtml.append($('<i class="fa fa-star">&nbsp;</i>'));
                    }


                    blok.append(fieldHtml);
                    fieldHtml.append(itm);
                    var displayType = mTab.getFieldById(Number(fID)).getDisplayType();
                    var src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='50' height='50'%3E%3Cdefs%3E%3Cpath d='M23 31l-3.97-2.9L19 28l-.24-.09.19.13L13 33v2h24v-2l-3-9-5-3-6 10zm-2-12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zm-11-8c-.55 0-1 .45-1 1v26c0 .55.45 1 1 1h30c.55 0 1-.45 1-1V12c0-.55-.45-1-1-1H10zm28 26H12c-.55 0-1-.45-1-1V14c0-.55.45-1 1-1h26c.55 0 1 .45 1 1v22c-.3.67-.63 1-1 1z' id='a'/%3E%3C/defs%3E%3Cuse xlink:href='%23a' fill='%23fff'/%3E%3Cuse xlink:href='%23a' fill-opacity='0' stroke='%23000' stroke-opacity='0'/%3E%3C/svg%3E";

                    if (displayType == VIS.DisplayType.Image) {
                        fieldHtml.append($('<img class="vis-colorInvert imgField" style="width:100px;height:100px" src="' + src + '"/>'));
                    } else if (displayType == VIS.DisplayType.TableDir || displayType == VIS.DisplayType.Table || displayType == VIS.DisplayType.List || displayType == VIS.DisplayType.Search) {
                        src = "data:image/svg+xml,%3Csvg width='30' height='30' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3Cpath id='a' d='m23,31l-3.97,-2.9l-0.03,-0.1l-0.24,-0.09l0.19,0.13l-5.95,4.96l0,2l24,0l0,-2l-3,-9l-5,-3l-6,10zm-2,-12c0,-1.66 -1.34,-3 -3,-3s-3,1.34 -3,3s1.34,3 3,3s3,-1.34 3,-3zm-11,-8c-0.55,0 -1,0.45 -1,1l0,26c0,0.55 0.45,1 1,1l30,0c0.55,0 1,-0.45 1,-1l0,-26c0,-0.55 -0.45,-1 -1,-1l-30,0zm28,26l-26,0c-0.55,0 -1,-0.45 -1,-1l0,-22c0,-0.55 0.45,-1 1,-1l26,0c0.55,0 1,0.45 1,1l0,22c-0.3,0.67 -0.63,1 -1,1z'/%3E%3C/defs%3E%3Cg%3E%3Cuse transform='matrix(0.567292 0 0 0.499809 0.901418 2.3385)' x='0' y='0' stroke='null' id='svg_1' fill='%23fff' xlink:href='%23a'/%3E%3C/g%3E%3C/svg%3E";
                        fieldHtml.append($('<img class="vis-colorInvert imgField" style="width:30px;height:30px" style="display:none" src="' + src + '"/>'));
                        fieldHtml.append($('<span class="fieldValue">:Value</span>'));
                    } else {
                        fieldHtml.append($('<span class="fieldValue">:Value</span>'));
                    }

                    var linkedLength = DivCardField.find('.linked').length;

                    newitm.find('.fa-circle').addClass('linked vis-succes-clr');
                    newitm.prop("draggable", false);
                    //newitm.find('.fa-chain-broken').addClass('vis-succes-clr').removeClass('fa-chain-broken');
                    newitm.attr('seqNo', fieldHtml.attr('seqNo') || (linkedLength * 10));
                    DivCardField.find('.fieldLbl').eq(linkedLength).after(newitm);
                    applyLinkCss(blok);
                }
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
            }
        }

        function applyLinkCss(fidItm) {
            var vlstyle = "";
            var imgStyle = "";
            var spnStyle = "";
            var firstImg = false;
            var brStart = 0;
            var styleArr = fidItm.attr("fieldValuestyle");
            if (styleArr && styleArr.indexOf('|') > -1) {
                var brPos = styleArr.split('<br>');
                styleArr = styleArr.split("|");
                if (styleArr && styleArr.length > 0) {
                    if (styleArr[0].indexOf("@img::") > -1) {
                        firstImg = true;
                    }

                    for (var j = 0; j < styleArr.length; j++) {
                        if (styleArr[j].indexOf("@img::") > -1) {
                            imgStyle = styleArr[j].replace("@img::", "");
                        }
                        else if (styleArr[j].indexOf("@value::") > -1) {
                            vlstyle = styleArr[j].replace("@value::", "");
                        } else if (styleArr[j].indexOf("@span::") > -1) {
                            spnStyle = styleArr[j].replace("@span::", "");
                        }
                    }

                    if (brPos != null && brPos.length > 1) {
                        if (styleArr[0].indexOf("@img::") > -1) {
                            brStart = 1;
                        }
                        else {
                            brStart = 2;
                        }
                    }

                }

            } else {
                if (styleArr && styleArr.indexOf("@img::") > -1) {
                    imgStyle = styleArr.replace("@img::", "");
                } else if (styleArr && styleArr.indexOf("@value::") > -1) {
                    vlstyle = styleArr.replace("@value::", "");
                } else {
                    vlstyle = styleArr;
                }
            }


            var cls = "";
            if (fidItm.attr("showfieldicon")) {
                var hideIcon = fidItm.attr("showfieldicon") == 'Y' ? true : false;
                fidItm.find('.fieldLbl').attr('showfieldtext', hideIcon);
            }


            if (fidItm.attr("showfieldtext")) {
                var hideTxt = fidItm.attr("showfieldtext") == 'Y' ? true : false;
                cls = hideTxt ? "displayNone" : "";
                fidItm.find('.fieldLbl').attr('showfieldtext', hideTxt);
            }

            fidItm.find('.fieldValue').attr('style', vlstyle);
            fidItm.find('.fieldLbl').attr('style', fidItm.attr("fieldValueLabel"));
            fidItm.find('.fieldLbl').addClass(cls);
            if (imgStyle != "" && imgStyle != undefined) {
                fidItm.find('.imgField').attr('style', imgStyle);
            }

            if (brStart == 1) {
                fidItm.find('.fieldValue').prepend('<br>');
            } else if (brStart == 2) {
                fidItm.find('.fieldValue').append('<br>');
            }

            var styleflx = fidItm.attr("style");
            var fIdx = styleflx.indexOf('flex-direction');
            var lblflxstyle = "";
            if (fIdx > -1) {
                var cIdx = styleflx.indexOf(";", fIdx + 'flex-direction'.length)
                lblflxstyle = 'display:flex; ' + styleflx.substring(fIdx, cIdx);
                fidItm.find('.fieldGroup').attr("style", lblflxstyle);
            }

            if (fidItm.attr("fieldValuestyle") && fidItm.attr("fieldValuestyle").indexOf('@img::') == -1 && fidItm.find('.fieldGroup .fieldValue').length > 0 && fidItm.find('.fieldGroup .imgField').length > 0) {
                fidItm.find('.fieldGroup .imgField').css('display', 'none');
            }
        }

        function saveCopyCard(copyCardName) {
            if (copyCardName == null || copyCardName == "") {
                VIS.ADialog.info("FileNameMendatory");
                return false;
            }

            for (var a = 0; a < cardViewInfo.length; a++) {
                if (cardViewInfo[a].CardViewName.trim() == copyCardName.trim()) {
                    VIS.ADialog.error("cardAlreadyExist", true, "");
                    IsBusy(false);
                    return false;
                }
            }

            txtCardName.val(copyCardName);
            isCopy = true;
            btnCardCustomization.click();
            newCopyCard.close();
            //setTimeout(function () {
            //    btnFinesh.click();
            //}, 1000);


        }

        function scaleTemplate() {
            DivTemplate.find('.vis-cardSingleViewTemplate').each(function () {
                var pH = $(this).height();
                var pW = $(this).width();
                var inner = $(this).find('.mainTemplate');
                var iH = inner.height();
                var iW = inner.width();
                var zoom = 1;
                var hR = pH / iH;
                var wR = pW / iW;
                if (hR > wR) {
                    zoom = wR;
                } else {
                    zoom = hR;
                }

                inner.css('zoom', zoom);
            });
        }
        // #endregion

        if (aPanel.fromCardDialogBtn) {
            url = VIS.Application.contextUrl + 'JsonData/GetGridWindowSkipRole';
            var obj = {
                windowNo: WindowNo,
                AD_Window_ID: mTab.getField('AD_Window_ID').value
            }

            $.ajax({
                type: "GET",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: obj,
                success: function (data) {
                    dbResult = JSON.parse(data.result);
                    var GridWindow = new VIS.GridWindow(dbResult);
                    if (GridWindow == null) {
                        return;
                    }
                    var _mTab = null;
                    var tabs = GridWindow.getTabs();
                    for (var i = 0; tabs.length > 0; i++) {
                        if (tabs[i].getAD_Tab_ID() == mTab.getRecord_ID()) {
                            _mTab = tabs[i];
                            break;
                        }
                    }
                    if (_mTab == null) {
                        return;
                    }

                    var id = WindowNo + "_" + _mTab.getRecord_ID(); //uniqueID
                    gc = new VIS.GridController(false, false, id);
                    gc.initGrid(true, WindowNo, self, _mTab);

                    mTab = gc.getMTab();

                    //WindowNo = mTab.getWindowNo();
                    cardView = gc.vCardView;
                    AD_Window_ID = mTab.getAD_Window_ID();
                    AD_Tab_ID = mTab.getAD_Tab_ID();
                    tabName = mTab.getName();

                    //WindowName = aPanel.curGC.aPanel.$parentWindow.getName();
                    AD_CardView_ID = cardView.getAD_CardView_ID();
                    AD_GroupField_ID = cardView.getField_Group_ID();
                    tabField = mTab.getFields();
                    findFields = mTab.getFields().slice();
                    init();


                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                }
            });
        } else {
            init();
        }

        this.getRoot = function () {
            return root;
        };

        this.show = function () {
            var w = $(window).width() - 150;
            var h = $(window).height() - 10;
            ch = new VIS.ChildDialog();
            ch.setTitle(VIS.Msg.getMsg("Card"));
            ch.setWidth(w);
            ch.setHeight(h);
            ch.setContent(root);
            ch.onOkClick = function (e) {
            };
            ch.onCancelClick = cancel;
            ch.onClose = cancel;
            ch.show();
            ch.hideButtons();
        }

        function cancel() {
            ch.close();
            aPanel.fromCardDialogBtn = false;
            return true;
        };

        function templatechanges() {
            var Chtml = DivViewBlock.find('.vis-viewBlock').html();
            if (cur_history_index < history.length - 1) {
                history = history.slice(0, cur_history_index + 1);
                cur_history_index++;
                //btnRedo.attr("disabled", "disabled");
            }

            var cur_canvas = JSON.stringify(Chtml);
            if (cur_canvas != history[cur_history_index] || force == 1) {
                history.push(cur_canvas);
                if (history.length > 11) {
                    history.shift();
                }
                cur_history_index = history.length - 1;
            }
            DivCradStep2.find('.vis-v-rowcol').hide();
            btnRedo.attr("disabled", "disabled");
            btnUndo.removeAttr("disabled");
        }

        function ViewBlockAddDelRowCol(e) {

            DivCradStep2.find('.vis-v-rowcol').show();

            var idx = $(e.target).index();
            var rc = getRowColPostion(idx);

            if (rc.rowNo == 1) {
                btnVdelrow.hide();
            }

            if (rc.colNo == 1) {
                btnVdelCol.hide();
            }


            btnVaddrow.css({
                'left': $(e.target).closest('.vis-viewBlock')[0].offsetLeft - 38,
                'top': $(e.target).height() + $(e.target)[0].offsetTop
            });

            btnVdelrow.css({
                'left': $(e.target).closest('.vis-viewBlock')[0].offsetLeft - 20,
                'top': $(e.target).height() + $(e.target)[0].offsetTop
            });

            btnVaddCol.css({
                'top': $(e.target).closest('.vis-viewBlock')[0].offsetTop - 20,
                'left': ($(e.target).width() - 8) + $(e.target)[0].offsetLeft
            })
            btnVdelCol.css({
                'top': $(e.target).closest('.vis-viewBlock')[0].offsetTop - 20,
                'left': ($(e.target).width() - 5) + $(e.target)[0].offsetLeft + 15
            })
        }

        function getRowColPostion(idx) {
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var rowPosition = (Math.floor(idx / totalCol)) + 1;
            var colposition = (idx % totalCol) + 1;
            return {
                rowNo: rowPosition,
                colNo: colposition
            }
        }

        this.disposeComponent = function () {
            self = null;
            root.remove();
            root = null;
        };


    };


    cvd.prototype.getOperatorsQuery = function (vnpObj, translate) {
        var html = "";
        var val = "";
        for (var p in vnpObj) {
            val = vnpObj[p];
            if (translate)
                val = VIS.Msg.getMsg(val);
            html += '<option value="' + p + '">' + val + '</option>';
        }
        return html;
    }
    cvd.prototype.sizeChanged = function (height, width) {
        console.log(height, width);
    }

    cvd.prototype.dispose = function () {
        this.disposeComponent();
    };

    VIS.CVDialog = cvd;

    /**
     * Open dialog for copy any card
     * */
    function cardCopyDialog() {
        var self = this;
        var $root = $('<div>');
        var $inputText = $('<div class="input-group vis-input-wrap mb-0" >');
        var $controlBlock = $('<div class="vis-control-wrap d-block mt-1" >');
        var txtDescription = $('<span style="display:block;margin-bottom:5px;">' + VIS.Msg.getMsg('NewCardInfo') + '</span>');
        $inputText.append(txtDescription).append($controlBlock);
        var $txtName = $('<input type="text">');
        var $lblName = $('<label>' + VIS.Msg.getMsg('EnterName') + '</label>');
        $controlBlock.append($txtName).append($lblName);
        var btnDiv = $('<div class="d-flex align-items-center justify-content-end mt-2">');
        self.btnCopySave = $('<button class="vis-save-cont mr-2">' + VIS.Msg.getMsg('Ok') + '</button>');
        self.btnCopyCancle = $('<button class="vis-save-cont mr-2">' + VIS.Msg.getMsg('Cancle') + '</button>');
        btnDiv.append(self.btnCopySave).append(self.btnCopyCancle);
        $root.append($inputText).append(btnDiv);

        this.show = function () {
            chCopy = new VIS.ChildDialog();
            chCopy.setTitle(VIS.Msg.getMsg("CardName"));
            chCopy.setModal(true);
            chCopy.setContent($root);
            chCopy.setWidth("50%");
            chCopy.show();
            chCopy.onOkClick = ok;
            chCopy.onCancelClick = cancel;
            chCopy.onClose = cancel;
            chCopy.hideButtons();
        };

        this.getName = function () {
            return $txtName.val();
        };

        function ok() {
            if ($txtName.val() == null || $txtName.val() == "") {
                VIS.ADialog.info("FileNameMendatory");
                return false;
            }
            self.onSave();
            return true;
        };

        self.close = function () {
            chCopy.close();
        }

        function cancel() {
            chCopy.close();
            // aPanel.fromCardDialogBtn = false;
            return true;
        };


        function dispose() {
            $txtName.remove();
            $txtName = null;
            txtDescription.remove();
            txtDescription = null;
            self.btnCopyCancle = null;
            self.btnCopyCancle = null;
            $lblName.remove();
            $lblName = null;
            $root.remove();
            $root = null;
            chCopy = null;
        };
    };

    VIS.CardCopyDialog = cardCopyDialog;


}(VIS, jQuery));