﻿/************************************************************
* Module Name    : VIS
* Purpose        : Assign Record To User
* chronological  : Development
* Created Date   : 17 DECEMBER ,2024
* Created by     : Rahul(VAI061)
***********************************************************/
;
(function (VIS, $) {

    function userAssign(record_id, table_id, windowNo, WindowId, assignedRecords) {
        var ch = null;
        this.onClose = null;
        var $self = this;
        var userNameId = null;
        var UpperDiv = null;
        var recordInputDiv = null;
        var loginUserID = VIS.context.getAD_User_ID();
        var $cancelBtn, $okBtn;
        var assignMatchRecord = [];
        var unMatchRecords = [];
        var unAssignedArray = [];

        var userId = null;
        var adminUser = null;
        var PrimaryKey = null;


        // design of popup
        var mainDiv = $('<div class="vis-forms-container"style="height:100%; display:inline-block; width:100%"></div>');
        $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        mainDiv.append($bsyDiv);
        busyDiv(false);
        UpperDiv = $('<div class = "Vis_upperDiv"></div>')
        recordInputDiv = $('<div style="display:flex">')
        var $inputDiv = $(
            '<div class="input-group vis-input-wrap mb-0";>' +
            '<div class="vis-control-wrap"></div><div class="input-group-append"></div>' +
            '</div>'
        );

        //users control
        var lookup = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 212, VIS.DisplayType.Search, "AD_User_ID", 0, false, "AD_Client_ID=" + VIS.Env.getCtx().getAD_Client_ID());
        colTableCtrl = new VIS.Controls.VTextBoxButton("AD_User_ID", false, false, true, VIS.DisplayType.Search, lookup);
        var $userButtonWrap = $('<div class="input-group-append">');
        $inputDiv.find('.vis-control-wrap').append(colTableCtrl.getControl())
            .append('<label>' + VIS.Msg.getMsg('VIS_SearchUser') + '</label>');
        $userButtonWrap.append(colTableCtrl.getBtn(0));
        $inputDiv.append($userButtonWrap);
        var lowerDiv = $("<div class='vis-lowerDiv'>");
        bottomDiv = $("<div style='width: 100%;margin-top:10px'>");


        //Buttons      
        $cancelBtn = $("<input class='VIS_Pref_btn-2 VIS_Cancelbtn mt-0'id='VIS_assignCancelBtn" + windowNo + "' style='margin-left:15px;' type='button' value= " + VIS.Msg.getMsg('Cancle') + ">");
        $okBtn = $("<input class='VIS_Pref_btn-2 VIS_OKbtn mt-0'id='VIS_AssignOkBtn" + windowNo + "' style='margin-left: 15px;' type='button' value= " + VIS.Msg.getMsg('VIS_OK') + ">");


        //appending design to main div
        recordInputDiv.append($inputDiv);
        UpperDiv.append(recordInputDiv);
        bottomDiv.append($cancelBtn).append($okBtn);
        mainDiv.append(UpperDiv).append(lowerDiv).append(bottomDiv);
        InitEvents();


        //calling init events 
        function InitEvents() {
            //click event for ok btn
            mainDiv.find('.VIS_OKbtn').off('click')
            mainDiv.find('#VIS_AssignOkBtn' + windowNo).on('click', function () {
                userNameId = VIS.Utility.Util.getValueOfInt(colTableCtrl.getValue());
                var isMatch = false

                /* if only assigned record selected*/
                if (unMatchRecords.length == 0) {
                    isMatch = false;
                    if (userNameId <= 0) {
                        /* multiple records selected than confirmation popup for delete*/
                        handleDeleteOrConfirm(assignMatchRecord.length > 1, deleteRecord);
                    }
                    else {
                        /*  multiple records selected for assigning */
                        assignMatchRecord.forEach((record) => {
                            if (record.AD_User_ID != userNameId) {
                                unMatchRecords.push(record.ID);
                                isMatch = true;
                            }
                        });
                        if (isMatch) {
                            if (unMatchRecords.length > 1) {
                                /*confirmation popup to assign records*/
                                confirmRecordsAssign();
                            }
                            else {
                                busyDiv(true);
                                assignedUser();
                                return;
                            }
                        }
                        else {
                            ch.close();
                            return;
                        }
                    }
                }
                else {
                    if (VIS.Utility.Util.getValueOfInt(colTableCtrl.getValue()) > 0) {

                        /*  multiple records selected including unassigned records */
                        assignMatchRecord.forEach((record) => {
                            if (record.AD_User_ID != userNameId) {
                                unMatchRecords.push(record.ID);
                                isMatch = true;
                            };
                        });

                        if (isMatch) {
                            /*confirmation popup to assign records*/
                            confirmRecordsAssign();
                        }

                        else {
                            busyDiv(true);
                            assignedUser();
                            return;
                        };
                    }
                    else {
                        VIS.ADialog.info("SelectUser");
                        ch.close();
                        return;
                    }
                };
            });


            //cancel btn click
            mainDiv.find('.VIS_Cancelbtn').off('click')
            mainDiv.find('#VIS_assignCancelBtn' + windowNo).on('click', function () {
                ch.close();

            });

            // get primary key of table in order to show the Popup
            var data = {
                AD_Table_ID: table_id
            };
            var res = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetKeyColumns", data);
            if (res == null) {
                return;
            }
        };

        /**
         * Function used to delete the multiple records
         * @param {any} isMultiple
         * @param {any} deleteFn
         */
        function handleDeleteOrConfirm(isMultiple, deleteFn) {
            if (isMultiple) {
                VIS.ADialog.confirm("VIS_DeleteRecord", true, "", "Confirm", function (response) {
                    if (response) {
                        deleteFn();
                    }
                });
            } else {
                deleteFn();
            }
        };

        /*  delete record*/
        function deleteRecord() {
            assignMatchRecord.forEach(record => {
                unMatchRecords.push(record.ID)
            });
            busyDiv(true);
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/DeleteRecord",
                type: "POST",
                data: {
                    AD_Window_ID: WindowId,
                    AD_Table_ID: table_id,
                    Record_ID: unMatchRecords,

                },
                dataType: 'json',
                success: function (response) {
                    busyDiv(false);
                    var deleteresult = JSON.parse(response);
                    if (!(deleteresult.toLowerCase().startsWith("error"))) {
                        /*remove the deleted record from assigrecord array*/
                        removeAssignRecord();
                        ch.close();
                    }
                    else {
                        VIS.ADialog.info(deleteresult);
                    }
                },
                error: function () {
                    busyDiv(false);
                }
            });
        };

        // Function used to handle User ID
        function handleuserId() {
            // get assigned User and assigneby User
            if (assignMatchRecord.length > 0) {
                userId = assignMatchRecord[0].AD_User_ID;
                adminUser = assignMatchRecord[0].CreatedBy;
            };
            /*  set the value of userid if record is already assigned*/
            if (record_id.length == 1 && userId) {
                colTableCtrl.setValue(userId);
            }
        };

        /*  confirmation popup*/
        function confirmRecordsAssign() {
            VIS.ADialog.confirm("VIS_MultipleRecords", true, "", "Confirm", function (response) {
                if (response) {
                    busyDiv(true);
                    assignedUser();
                    return;
                }
            });
        };

        /* get the data of selected record if they are already assigned*/
        function getSelectedAssignRec() {
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/GetAssignedRecord",
                type: "POST",
                data: {
                    Record_ID: record_id
                },
                dataType: 'json',
                success: function (response) {
                    var result = JSON.parse(response);
                    unAssignedArray = record_id.filter(id => {
                        return !result.find(record => record.ID === id);
                    });
                    uAssignedRecords();

                    if (result.length > 0) {
                        record_id.forEach(id => {
                            var matched = result.find(record => record.ID === id);
                            matched ? assignMatchRecord.push(matched) : unMatchRecords.push(id);
                        });
                        result.forEach(record => {
                            var matched = assignedRecords.find(existingRecord => existingRecord.ID === record.ID);
                            if (!matched) {
                                assignedRecords.push(record);
                            }
                        });
                    }
                    else {
                        unMatchRecords.push(...record_id);
                    }
                    handleuserId();
                }
            });
        }

        // show function
        this.show = function () {
            ch = new VIS.ChildDialog();
            ch.setContent(mainDiv);
            ch.setHeight(195);
            ch.setWidth(450);
            ch.setEnableResize(false);
            ch.setTitle(VIS.Msg.getMsg("VIS_AssignUser"));
            ch.setModal(true);
            getSelectedAssignRec();
            //Disposing Everything on Close
            ch.onClose = function () {
                if ($self.onClose) $self.onClose();
                $self.dispose();
            };

            ch.show();
            ch.hideButtons();


        };
        function uAssignedRecords() {
            unAssignedArray.forEach(id => {
                var matchedIndex = assignedRecords.findIndex(existingRecord => existingRecord.ID === id);
                if (matchedIndex !== -1) {
                    assignedRecords.splice(matchedIndex, 1);
                }
            });
        }

        // assign the record
        function assignedUser() {
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/AssignRecord",
                type: "POST",
                data: {
                    AD_User_ID: userNameId,
                    AD_Table_ID: table_id,
                    Record_ID: unMatchRecords,
                    AD_Window_ID: WindowId
                },
                dataType: 'json',
                success: function (response) {
                    busyDiv(false);
                    var assignedresult = JSON.parse(response)
                    if (assignedresult == '01') {
                        var result = [];
                        //add unmatch record in already assigned record array
                        unMatchRecords.forEach(record => {
                            result.push({
                                ID: record,
                                userId: userNameId,
                                createdBy: loginUserID
                            });
                        });
                        assignedRecords.push(...result);
                        ch.close();
                    }
                    else if (assignedresult == '02') {
                        VIS.ADialog.info("VIS_RecordAssigned");
                    }
                    else if (assignedresult == '03') {
                        // Function to update records using map

                        unMatchRecords.forEach(id => {
                            var matched = assignedRecords.find(record => record.ID === id);
                            if (matched) {
                                matched.userId = userNameId;
                                matched.createdBy = loginUserID;
                            }
                            else {
                                assignedRecords.push({
                                    ID: id,
                                    userId: userNameId,
                                    createdBy: loginUserID
                                });
                            }
                        });



                        ch.close();
                    }
                    else {
                        VIS.ADialog.info("assignedresult");

                    }
                },
                error: function () {
                    busyDiv(false);
                }

            });

        };

        /*remove the record from assign record array*/
        function removeAssignRecord() {
            assignMatchRecord.forEach((record) => {
                const index = assignedRecords.findIndex(match => match.ID === record.ID);
                if (index > -1) {
                    assignedRecords.splice(index, 1);
                }
            });
        };

        /* dispose elements*/
        this.disposeComponent = function () {
            $cancelBtn, $okBtn = null;
            ch = null;
            UpperDiv = null;
            bottom = null;
            $inputDiv = null;
            mainDiv.remove();
        };

    };

    /* Get design from root */
    this.getRoot = function () {
        return $root;
    };

    /* busydiv indicator*/
    function busyDiv(Value) {
        if (Value) {
            $bsyDiv[0].style.visibility = 'visible';
        }
        else {
            $bsyDiv[0].style.visibility = 'hidden';
        }
    };

    /* init method called on loading a form */
    userAssign.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    userAssign.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame) this.frame.dispose();
        this.frame = null;
    };
    VIS.userAssign = userAssign;
})(VIS, jQuery);