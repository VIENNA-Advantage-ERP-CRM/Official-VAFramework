/********************************************************
 * Module Name    : Vienna Advantage Framework
 * Purpose        : This class is used for record share with other organization
 * Class Used     :
 * Created By     : VIS0228
 * Date           :  09-Nov-2022
**********************************************************/
; (function (VIS, $) {

    /**
     * Record Shared
     * @param {any} record_id
     * @param {any} table_id
     * @param {any} windowNo
     */
    function RecordShared(record_id, table_id, tab_id, window_id, windowNo, parentID, parentTableID, curTab) {
        this.onClose = null;
        var ch = null;
        var self = this;
        var orginalArr = [];
        var sharedIDs = [];
        var mField = [];
        if (curTab && curTab.getFields()) {
            mField = curTab.getFields();
        }
        if (parentID == '999999') {
            parentID = 0;
        }

        var headingText = "";

        if (mField.length > 0) {
            var isIdentifier = $.grep(mField, function (a) {
                return a.getIsIdentifier() == true;
            });

            if (isIdentifier.length > 0) {
                for (var a = 0; a < isIdentifier.length; a++) {
                    headingText += curTab.getValue(isIdentifier[a].getColumnName())
                    if ((a + 1) != isIdentifier.length) {
                        headingText += "_";
                    }
                }
            } else if (curTab.getValue('Value') && curTab.getValue('Value').length > 0) {
                headingText = curTab.getValue('Value');
            } else if (curTab.getValue('Name') && curTab.getValue('Name').length > 0) {
                headingText = curTab.getValue('Name');
            } else {
                headingText = record_id;
            }
        } else {
            headingText = record_id;
        }

        var canEdit = true;

        /**Main Root */
        var root = $('<div class="vis-actionWindowWrapper">'
            + '<div class="vis-apanel-busy vis-recordSharedbusy" style="display:none"></div>'
            + '<div class="vis-actionFeilds" >'
            + '<div class="vis-actionFeild">'
            + '<div class="input-group vis-input-wrap vis-cusmg">'
            + '<div class="vis-control-wrap">'
            + '<input type="text"  id="txtSummaryOrg_' + windowNo + '" maxlength="40" class="" placeholder="' + VIS.Msg.getMsg('SummaryOrg') + '" data-placeholder="' + VIS.Msg.getMsg('SummaryOrg') + '">'
            + '<label>' + VIS.Msg.getMsg('SummaryOrg') + '</label>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="vis-actionFeild">'
            + '<div class="input-group vis-input-wrap vis-cusmg">'
            + '<div class="vis-control-wrap">'
            + '<select id="ddlLegalEntities_' + windowNo + '" class="" placeholder=" " data-placeholder="" data-hasbtn=" ">'
            + '<option value="A">' + VIS.Msg.getMsg('All') + '</option>'
            + '<option value="Y">' + VIS.Msg.getMsg('Yes') + '</option>'
            + '<option value="N">' + VIS.Msg.getMsg('No') + '</option>'
            + '</select>'
            + '<label> ' + VIS.Msg.getMsg('LegalEntities') + '</label>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="vis-actionFeild">'
            + '<div class="input-group vis-input-wrap vis-cusmg">'
            + '<div class="vis-control-wrap">'
            + '<input type="text" id="txtSearchKey_' + windowNo + '" maxlength="40" class="" placeholder="' + VIS.Msg.getMsg('SearchKeyValue') + '/' + VIS.Msg.getMsg('Name') + '" data-placeholder="' + VIS.Msg.getMsg('SearchKeyValue') + '">'
            + '<label>' + VIS.Msg.getMsg('SearchKeyValue') + '/' + VIS.Msg.getMsg('Name') + '</label>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="vis-tableSection">'
            + '<div class="vis-actionWishlistTable">'
            + '<div class="vis-tableHeaderWishlist p-1 pl-2">'
            + '<span class="vis-tableHeadingTtl">' + VIS.Msg.getMsg('Org') + '</span>'
            + '</div>'
            + '<div class="vis-gridtable">'
            + '<table class="vis-gridSingletable">'
            + '<thead class="vis-gridTableHeader">'
            + '<tr>'
            + '<th width="40px">'
            + '<input type="checkbox" name="" id="chkAll_' + windowNo + '" class="inputCheckbox ">'
            + '</th>'
            + '<th>' + VIS.Msg.getMsg('SearchKeyValue') + '</th>'
            + '<th>' + VIS.Msg.getMsg('Org') + '</th>'
            + '<th width="120px" class="text-center">' + VIS.Msg.getMsg('LegalEntities') + '</th>'
            + '<th width="120px" class="text-center">' + VIS.Msg.getMsg('ReadOnly') + '</th>'
            + '</tr>'
            + '</thead>'
            + '<tbody class="vis-gridTableBody tbList">'
            + '</tbody>'
            + '</table>'
            + '<div class="vis-wishlistActionBtn d-flex align-items-center justify-content-between mt-2">'
            + '<div>'
            + '<span id="lblMsg_' + windowNo + '"></span>'
            + '</div>'
            + '<div>'
            + '<button class="vis-actionBtn mr-1" id="btnCancel_' + windowNo + '">' + VIS.Msg.getMsg('Cancel') + '</button>'
            + '<button class="vis-actionBtn mr-2" disabled="" style="cursor:default;opacity:.5" id="btnOk_' + windowNo + '">' + VIS.Msg.getMsg('OK') + '</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>');

        var txtSummaryOrg = root.find("#txtSummaryOrg_" + windowNo);
        var ddlLegalEntities = root.find("#ddlLegalEntities_" + windowNo);
        var txtSearchKey = root.find("#txtSearchKey_" + windowNo);
        var btnOk = root.find("#btnOk_" + windowNo);
        var btnCancel = root.find("#btnCancel_" + windowNo);
        var msg = root.find("#lblMsg_" + windowNo);
        var chkAll = root.find("#chkAll_" + windowNo);
        var isBusyRoot = root.find(".vis-recordSharedbusy");

        /**Get All organization */
        function getOrganization() {
            IsBusy(true);
            var obj = {
                AD_Table_ID: table_id,
                Record_ID: record_id
            }

            var arr = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "RecordShared/GetSharedRecord", obj, null);
            orginalArr = arr;
            prepareList(orginalArr);
            IsBusy(false);
        }

        /**Filter Data */
        function filterData() {
            if (txtSummaryOrg.val() == '') {
                var fData = $.grep(orginalArr, function (element, index) {
                    if (ddlLegalEntities.find('option:selected').val() == 'A') {
                        return element.value.toLowerCase().indexOf(txtSearchKey.val().toLowerCase()) != -1 || element.name.toLowerCase().indexOf(txtSearchKey.val().toLowerCase()) != -1;
                    } else if (ddlLegalEntities.find('option:selected').val() != 'A' && txtSearchKey.val() != '') {
                        return element.value.toLowerCase().indexOf(txtSearchKey.val().toLowerCase()) != -1 && element.isLegalEntity == ddlLegalEntities.find('option:selected').val()
                    } else {
                        return element.isLegalEntity == ddlLegalEntities.find('option:selected').val();
                    }
                });

                fData.sort(function (a, b) {
                    if (a.AD_OrgShared_ID > 0) {
                        return (a.AD_OrgShared_ID < b.AD_OrgShared_ID ? 1 : -1)
                    }
                    //else {
                    //    return (a.name < b.name ? 1 : -1);
                    //}
                });

                prepareList(fData);
            } else {

                var fData = $.grep(orginalArr, function (element, index) {
                    return (element.name.toLowerCase().indexOf(txtSummaryOrg.val().toLowerCase()) != -1 && element.isSummary == true)
                });

                var filterData = $.grep(fData, function (element, index) {
                    if (ddlLegalEntities.find('option:selected').val() == 'A') {
                        return element.value.toLowerCase().indexOf(txtSearchKey.val().toLowerCase()) != -1;
                    } else if (ddlLegalEntities.find('option:selected').val() != 'A' && txtSearchKey.val() != '') {
                        return element.value.toLowerCase().indexOf(txtSearchKey.val().toLowerCase()) != -1 && element.isLegalEntity == ddlLegalEntities.find('option:selected').val()
                    } else {
                        return element.isLegalEntity == ddlLegalEntities.find('option:selected').val();
                    }
                });

                filterData.sort(function (a, b) {
                    if (a.AD_OrgShared_ID > 0) {
                        return (a.AD_OrgShared_ID < b.AD_OrgShared_ID ? 1 : -1)
                    }
                    //else {
                    //    return (a.name < b.name ? -1 : -1);
                    //}
                });

                prepareList(filterData);
            };
        }

        /**
         * Prepare UI according to data
         * At Top . SHOW ORGNIZATION with which record is shared
         * @param {any} list
         */
        function prepareList(list) {
            root.find('.tbList').html('');
            if (!list) {
                return;
            }
            var row = '';
            for (var i = 0; i < list.length; i++) {
                if (list[i].AD_OrgShared_ID) {
                    row += '<tr class="vis-rowSuccess">';
                } else {
                    row += '<tr>';
                }

                row += '</td>'
                    + '<td width="40px">';
                if (list[i].AD_OrgShared_ID) {
                    row += '<input type="checkbox" checked class="chkOrgID" data-shareid="' + list[i].AD_OrgShared_ID + '" value="' + list[i].ID + '">';
                    sharedIDs.push(list[i].AD_OrgShared_ID);
                    if (list[i].CanEdit) {
                        toogleOkBtn(true);
                    }
                    canEdit = list[i].CanEdit;
                } else {
                    row += '<input type="checkbox" class="chkOrgID" value="' + list[i].ID + '">';
                }
                row += '</td>'
                    + '<td title="' + list[i].value + '">' + list[i].value + '</td>'
                    + '<td title="' + list[i].name + '">' + list[i].name + '</td>'
                    + '<td width="120px" class="text-center">' + list[i].isLegalEntity + '</td>'
                    + '<td width="120px" class="text-center">';
                if (list[i].isReadonly) {
                    row += '<input type="checkbox" name="" id="" class="chkIsReadOnly" checked/>';
                    //if (list[i].OrgID != VIS.context.getAD_Org_ID()) {
                    //    row += '<input type="checkbox" name="" id="" readonly disabled class="chkIsReadOnly" checked />';
                    //}
                    //else {
                    //    row += '<input type="checkbox" name="" id="" class="chkIsReadOnly" checked />';
                    //}
                } else {
                    row += '<input type="checkbox" name="" id="" class="chkIsReadOnly" />';
                    //if (list[i].OrgID>0 && list[i].OrgID != VIS.context.getAD_Org_ID()) {
                    //    row += '<input type="checkbox" name="" readonly disabled id="" class="chkIsReadOnly" />';
                    //}
                    //else {
                    //    row += '<input type="checkbox" name="" id="" class="chkIsReadOnly" />';
                    //}
                }
                row += '</td>'
                    + '</tr>';
            }
            root.find('.tbList').append(row);
            root.find('.tbList .chkOrgID').on("click", function (e) {
                if (!canEdit) {
                    e.preventDefault();
                    return;
                }
                var checkedOrgs = root.find('.tbList .chkOrgID:checked');
                if (checkedOrgs && checkedOrgs.length > 0) {
                    toogleOkBtn(true);
                }
                else {
                    if (sharedIDs && sharedIDs.length == 0)
                        toogleOkBtn(false);
                }
            });

        };

        /**
         * Busy Indigater
         * @param {any} isBusy
         */
        function IsBusy(isBusy) {
            if (isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "block" });
            }
            if (!isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "none" });
            }
        };

        function toogleOkBtn(enable) {
            if (enable) {
                btnOk.css("opacity", "1").prop("disabled", "");
            }
            else {
                btnOk.css("opacity", "0.5").prop("disabled", "true");
            }
        };

        function events() {


            txtSummaryOrg.keyup(function () {
                filterData();
            });

            txtSearchKey.keyup(function () {
                filterData();
            });

            ddlLegalEntities.change(function () {
                filterData();
            });

            chkAll.change(function (e) {
                if (!canEdit) {
                    e.preventDefault();
                    return;
                }
                var isFalse = false;
                if (this.checked) {
                    isFalse = true;
                    toogleOkBtn(true);
                }
                else {
                    toogleOkBtn(false);
                }
                root.find('.tbList .chkOrgID').each(function () {

                    this.checked = isFalse;
                });
            });

            btnOk.click(function () {
                if (!canEdit) {
                    e.preventDefault();
                    return;
                }
                msg.text("");
                IsBusy(true);
                var saveObj = {
                    AD_Table_ID: table_id,
                    record_ID: record_id,
                    Tab_ID: tab_id,
                    Window_ID: window_id,
                    WindowNo: windowNo,
                    list: [],
                    Parent_ID: parentID,
                    ParentTable_ID: parentTableID
                }

                root.find('.tbList .chkOrgID:checked').each(function () {
                    saveObj.list.push({
                        AD_OrgShared_ID: Number(this.value),
                        isReadonly: $(this).closest('tr').find('.chkIsReadOnly').is(':checked'),
                        shareID: $(this).data('shareid')

                    });

                });

                $.ajax({
                    type: 'post',
                    url: VIS.Application.contextUrl + "RecordShared/SaveRecord",
                    data: saveObj,
                    success: function (data) {
                        if (JSON.parse(data) == "OK") {
                            msg.text(VIS.Msg.getMsg('Saved'));
                            getOrganization();
                            root.find('.tbList').scrollTop(0);
                            txtSearchKey.val('');
                            txtSummaryOrg.val('');
                            ddlLegalEntities.val('A');
                            ch.close();
                        } else {
                            msg.text(VIS.Msg.getMsg('RecordsNotSaved'));
                        }
                        IsBusy(false);
                    }, error: function (data) {
                        msg.text(VIS.Msg.getMsg('RecordsNotSaved'));
                        IsBusy(false);
                    }
                });
            });

            btnCancel.click(function () {
                ch.close();
            });
        }

        events();
        getOrganization();

        this.dispose = function () {
            root.remove();
            root = null;
            ch = null;
            self = null;
            txtSummaryOrg = null;
            ddlLegalEntities = null;
            txtSearchKey = null;
            btnOk = null;
            btnCancel = null;
            msg = null;
        };

        this.show = function () {
            ch = new VIS.ChildDialog();
            ch.setContent(root);
            ch.setWidth("75%");
            ch.setTitle(VIS.Msg.getMsg("RecordShared") + " (" + headingText + ")");
            ch.setModal(true);
            //Ok Button Click
            //  ch.onOkClick =

            //Disposing Everything on Close
            ch.onClose = function () {

                if (self.onClose) {
                    self.onClose();
                    self.dispose();
                }
            };
            ch.show();
            ch.hidebuttons();
        };
        
    }

    VIS.RecordShared = RecordShared;
})(VIS, jQuery);