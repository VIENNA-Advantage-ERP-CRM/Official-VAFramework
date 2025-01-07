
/************************************************************
* Module Name    : VIS
* Purpose        : Assign Record To User
* chronological  : Development
* Created Date   : 17 DECEMBER ,2024
* Created by     : Rahul(VAI061)
***********************************************************/
;
(function (VIS, $) {
    //var $record_id, $chat_id, $table_id, $description, $chatclose;
    function userAssign(record_id, table_id, windowNo, WindowId, assignedRecords) {
        var ch = null;
        this.onClose = null;
        var data = [];
        var $self = this;
        var dGrid = null;
        var arrListColumns = [];
        var data = [];
        var userNameId = null;
        var UpperDiv = null;
        var recordInputDiv = null;
        var loginUserID = VIS.context.getAD_User_ID();
        var $deleteButton, $doneButton, $cancelBtn, $okBtn;
        var enableDelete = true;
        var enableOk = true;
        var enableDone = true;
        var assignMatchRecord = [];
        var unMatchRecords = [];
        var userId = null;
        var adminUser = null;
        var PrimaryKey = null;


       // design of popup
        var mainDiv = $('<div class="vis-forms-container"style="height:100%; display:inline-block; width:100%"></div>');
        $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        mainDiv.append($bsyDiv);
        busyDiv(false);
        UpperDiv = $('<div class = "Vis_upperDiv" style=" height: calc(100% - 60px);"></div>')
        recordInputDiv = $('<div style="display:flex">')    
        var $inputDiv = $(
            '<div class="input-group vis-input-wrap mb-0" style="height:calc(100% - 60px)";>' +
            '<div class="vis-control-wrap"></div><div class="input-group-append"></div>' +
            '</div>'
        );
        //users control
        var lookup = VIS.MLookupFactory.get(VIS.Env.getCtx(), windowNo, 212, VIS.DisplayType.Search, "AD_User_ID", 0, false, "AD_Client_ID=" + VIS.Env.getCtx().getAD_Client_ID());
        colTableCtrl = new VIS.Controls.VTextBoxButton("AD_User_ID", true, false, true, VIS.DisplayType.Search, lookup);
        var $userButtonWrap = $('<div class="input-group-append">');
        $inputDiv.find('.vis-control-wrap').append(colTableCtrl.getControl())
            .append('<label style="color: rgba(var(--v-c-mandatory),1);">' + VIS.Msg.getMsg('VIS_SearchUser') + '<sup>*</sup></label>');
        $userButtonWrap.append(colTableCtrl.getBtn(0));
        $userButtonWrap.append(colTableCtrl.getBtn(1));
        $inputDiv.append($userButtonWrap);
        var lowerDiv = $("<div class='vis-lowerDiv'>");
        bottomDiv = $("<div style='width: 100%; float: left;'>");


        //Buttons
        $deleteButton = $("<input class='VIS_Pref_btn-2 VIS_recordDelete' id='VIS_recordDltBtn" + windowNo + "' style='margin-left: 15px; width:70px;' type='button' value= " + VIS.Msg.getMsg('VIS_Delete') +">");
        $doneButton = $("<input class='VIS_Pref_btn-2 VIS_Donebtn'id='VIS_assignDoneBtn" + windowNo + "' style='margin-left:15px; width:106px;' type='button' value=" + VIS.Msg.getMsg('Done') +">");
        $cancelBtn = $("<input class='VIS_Pref_btn-2 VIS_Cancelbtn'id='VIS_assignCancelBtn" + windowNo + "' style='margin-left:15px; width:70px;' type='button' value= " + VIS.Msg.getMsg('Cancle') +">");
        $okBtn = $("<input class='VIS_Pref_btn-2 VIS_OKbtn'id='VIS_AssignOkBtn" + windowNo + "' style='margin-left: 15px ;width: 70px;' type='button' value= " + VIS.Msg.getMsg('VIS_OK') + ">");


        //appending design to main div
        recordInputDiv.append($inputDiv);
        UpperDiv.append(recordInputDiv);
        bottomDiv.append($cancelBtn).append($okBtn).append($deleteButton).append($doneButton);
        mainDiv.append(UpperDiv).append(lowerDiv).append(bottomDiv);


     
       /* seperate the assigned and unassigned records from selected record*/
            if (assignedRecords.length) {
                record_id.forEach(id => {
                    var matched = assignedRecords.find(record => record.ID === id);
                    matched ? assignMatchRecord.push(matched) : unMatchRecords.push(id);
                });
        }
            else {
                unMatchRecords.push(...record_id);
            }

       // get assigned User and assigneby User
        if (assignMatchRecord.length > 0) {
            userId = assignMatchRecord[0].userId;
            adminUser = assignMatchRecord[0].createdBy;        
        }


       /* handling buttons according to assigned and unassigned records*/
        if (record_id.length > 0) {
         // if records selected more than 1
            if (record_id.length > 1) {              
                // If more than one record is selected, only show OK and Cancel buttons
                
                mainDiv.find('#VIS_assignDoneBtn' + windowNo).hide();
                mainDiv.find('#VIS_recordDltBtn' + windowNo).hide();
             
                mainDiv.find('#VIS_AssignOkBtn' + windowNo).attr('disabled', true).css({
                    'opacity': '0.5',
                    'pointer-events': 'none'
                });
                enableDone = false;
                enableDelete = false;

               //  one record selected
            } else {
                if (userId) {
                    if (loginUserID === adminUser) {
                        if (userId === adminUser) {
                            colTableCtrl.setValue(userId);
                            colTableCtrl.setReadOnly(true);
                            enableOk = false;
                            mainDiv.find('#VIS_AssignOkBtn' + windowNo).hide();
                        } else if (userId !== adminUser) {
                            colTableCtrl.setValue(userId);
                            colTableCtrl.setReadOnly(true);
                            enableDone = false;
                            enableOk = false;
                            mainDiv.find('#VIS_AssignOkBtn' + windowNo).hide();
                            mainDiv.find('#VIS_assignDoneBtn' + windowNo).hide();
                        }
                    } else if (loginUserID !== adminUser && userId !== loginUserID) {
                        colTableCtrl.setValue(userId);
                        colTableCtrl.setReadOnly(true);
                        mainDiv.find('#VIS_assignDoneBtn' + windowNo).hide();
                        mainDiv.find('#VIS_recordDltBtn' + windowNo).hide();
                        enableDelete = false;
                        enableOk = false;
                        enableDone = false;
                        mainDiv.find('#VIS_AssignOkBtn' + windowNo).attr('disabled', true).css({
                            'opacity': '0.5',
                            'pointer-events': 'none'
                        });
                    } else {
                        colTableCtrl.setValue(userId);
                        colTableCtrl.setReadOnly(true);
                        mainDiv.find('#VIS_AssignOkBtn' + windowNo).hide();
                        mainDiv.find('#VIS_recordDltBtn' + windowNo).hide();
                        enableDelete = false;
                        enableOk = false;
                    }
                } else {
                    mainDiv.find('#VIS_AssignOkBtn' + windowNo).attr('disabled', true).css({
                        'opacity': '0.5',
                        'pointer-events': 'none'
                    });
                    mainDiv.find('#VIS_assignDoneBtn' + windowNo).hide();
                    mainDiv.find('#VIS_recordDltBtn' + windowNo).hide();
                }

            };
        };

        InitEvents();

        //calling init events 
        function InitEvents() {
            //handling ok btn security
            if (enableOk) {
                //click event for ok btn
                mainDiv.find('.VIS_OKbtn').off('click')
                mainDiv.find('#VIS_AssignOkBtn' + windowNo).on('click', function () {
                    userNameId = VIS.Utility.Util.getValueOfInt(colTableCtrl.getValue());
                    var isMatch = true;
                    if (unMatchRecords.length == 0) {
                        VIS.ADialog.info("VIS_RecordNotAssigned");
                        isMatch = false;
                        return;
                    }
                   // check assign record userid match with selected user id from search controller
                    assignMatchRecord.forEach((record) => {
                        if (record.userId != userNameId) {
                            VIS.ADialog.info("VIS_UserNotAssigned");
                            isMatch = false;
                            return;
                            
                        };
                    });

                    // match user id than assign unassigned record
                    if (isMatch) {
                        assignedUser();
                        busyDiv(false);
                    }
                    });
            };
            

          // handling delete btn security
            if (enableDelete) {

               // click event for delete
                mainDiv.find('.VIS_recordDelete').off('click')
                mainDiv.find('#VIS_recordDltBtn' + windowNo).on('click', function () {
                    deleteRecord();
                    mainDiv.find('#VIS_assignDoneBtn' + windowNo).hide();
                    colTableCtrl.setValue(null);
                    colTableCtrl.setReadOnly(false);
                    enableDone = false;
                    //clone the delete btn 
                    $deleteButton
                        .attr('id', 'VIS_AssignOkBtn_Modified') // Change the ID for clarity
                        .val(VIS.Msg.getMsg('VIS_OK')) // Update the button text
                        .off('click') // Remove the existing click handler
                        .on('click', function () {
                            userNameId = VIS.Utility.Util.getValueOfInt(colTableCtrl.getValue());                          
                            assignedUser();
                            busyDiv(false);
                        });


                    mainDiv.find('#VIS_recordDltBtn').hide();
                    
                    mainDiv.find('#VIS_AssignOkBtn_Modified').attr('disabled', true).css({
                        'opacity': '0.5',
                        'pointer-events': 'none'
                    });
                });
            };

           // handling done btn security
            if (enableDone) {
                mainDiv.find('.VIS_Donebtn').off('click')
                mainDiv.find('#VIS_assignDoneBtn' + windowNo).on('click', function () {
                    RecordStatus('DNE');
                    
                });
            }
            //cancel btn click
            mainDiv.find('.VIS_Cancelbtn').off('click')
            mainDiv.find('#VIS_assignCancelBtn' + windowNo).on('click', function () {
                ch.close();

            });

            
            colTableCtrl.fireValueChanged = function () {
                if (VIS.Utility.Util.getValueOfInt(colTableCtrl.getValue()) > 0) {
                    if (enableDelete) {
                        mainDiv.find('#VIS_AssignOkBtn_Modified').attr('disabled', false).css({
                            'opacity': '1',
                            'pointer-events': 'all'
                        });
                    }
                    mainDiv.find('#VIS_AssignOkBtn' + windowNo).attr('disabled', false).css({
                        'opacity': '1',
                        'pointer-events': 'all'
                    });

                }
                else {
                    if (enableDelete) {
                        mainDiv.find('#VIS_AssignOkBtn_Modified').attr('disabled', true).css({
                            'opacity': '0.6',
                            'pointer-events': 'none'
                        });
                    }
                        mainDiv.find('#VIS_AssignOkBtn' + windowNo).attr('disabled', true).css({
                            'opacity': '0.6',
                            'pointer-events': 'none'
                        });
                    }
                

            }
        };

       //status assign
        function RecordStatus(status) {
            assignMatchRecord.forEach(record => {
                unMatchRecords.push(record.ID)
            });
            busyDiv(true);
            $.ajax({
                url: VIS.Application.contextUrl + "AssignedRecordToUser/SetStatus",
                type: "POST",
                data: {
                    status: status,
                    AD_Window_ID: WindowId,
                    AD_Table_ID: table_id,
                    Record_ID: unMatchRecords,
                },
                dataType: 'json',
                success: function (response) {
                    var statusresult = JSON.parse(response)
                    if (!(statusresult.toLowerCase().startsWith("error"))) {
                        removeAssignRecord();
                        ch.close();
                        busyDiv(false);

                    }
                    else {
                        busyDiv(false);
                        VIS.ADialog.info(statusresult);
                    }
                }
            });
        };


       // delete the record
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
                    var deleteresult = JSON.parse(response);
                    if (!(deleteresult.toLowerCase().startsWith("error"))) {
                        removeAssignRecord();
                        busyDiv(false);
                       
                    }
                    else {
                        busyDiv(false);
                        VIS.ADialog.info(deleteresult);
                    }
                }
            });
        };

       
       // show function
        this.show = function () {
            ch = new VIS.ChildDialog();
            ch.setContent(mainDiv);
            ch.setHeight(220);
            ch.setWidth(450);
            ch.setTitle(VIS.Msg.getMsg("VIS_AssignUser"));
            ch.setModal(true);

            //Disposing Everything on Close
            ch.onClose = function () {
                if ($self.onClose) $self.onClose();
                $self.dispose();
            };

            ch.show();
            ch.hideButtons();

           
        };


       // assign the record
        function assignedUser() {
            busyDiv(true);
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
                    if (assignedresult != '01') {
                        if (assignedresult === '02') {
                            VIS.ADialog.info("VIS_RecordAssigned");
                        }
                        else {
                            VIS.ADialog.info(assignedresult);
                        }

                    };
                }

            });

        };

        function removeAssignRecord() {
            assignMatchRecord.forEach((record) => {
                const index = assignedRecords.findIndex(match => match.ID === record.ID);
                if (index > -1) {
                    assignedRecords.splice(index, 1);
                }
            });        
        };


         this.disposeComponent = function () {
        $deleteButton, $doneButton, $cancelBtn, $okBtn = null;
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
