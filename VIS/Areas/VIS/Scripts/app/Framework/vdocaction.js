; (function (VIS, $) {

    function VDocAction(windowNo, tabObj, recordId) {

        var ctx = VIS.Env.getCtx();

        // Change By Lokesh Chauhan 2-Sep
        // To Handle Doc Action's at child Tab
        //var AD_Table_ID = ctx.getContextAsInt(windowNo, "BaseTable_ID");
        var AD_Table_ID = tabObj.getAD_Table_ID();

        var _values = [];
        var _names = [];
        var _descriptions = [];
        var docStatus = null;
        var index = 0;
        var defaultV = "";
        this.log = VIS.Logging.VLogger.getVLogger("VDocAction");
        var options;
        var $cmbAction = $('<select class="vis-select-docAction"></select>');
        var $message = $('<p style="font-size:12px;margin-bottom:-5px"></p>');
        // var $btnbackground = $('<button>');
        //  var $btnok = $('<button>');
        //  var $btncancel = $('<button>');
        var $maindiv = $('<div style="margin-bottom:-5px"></div>');
        var self = this;
        this.batch = false;
        this.isOKPressed = false;
        var $table = $('<table style="width:360px;margin-bottom:9px">');
        var ch = null;
        this.onClose = null;
        var tabmenubusy = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        var loadLabel = $('<label>' + VIS.Msg.getMsg("Loading") + '</label>');
        //VIS_427 03/04/2025 Defined variable for reverse date
        var ReverseDatediv = null;
        var $ReverseDate = null;
        var isPeriodOpen = false;
        /*This array store the column whose value is used to set as reversal date
         and we can add our columns here*/
        var columnArray = ["MovementDate", "DateAcct", "DateTrx", "StatementDate", "VA073_TrxDate","VAMFG_DateAcct"];

        if (VIS.Application.isRTL) {
            //$cmbAction.css({ "margin-left": "0px", "margin-right": "10px" });
            //$message.css({ "margin-right": "3px" });
        }

        function init() {
            createDesign();
            events();
            readReference();
            dynInit(recordId);
        };

        init();

        function readReference() {
            var sql="VIS";
           

            var valueLst = [];
            var nameLst = [];
            var descriptionLst = [];

            try {
              
                var dr = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "DocAction/GetReference", { "RefQry": sql }, null);
                if (dr != null) {
                    for (var i in dr) {
                        var value = dr[i]["Value"];
                        var name = dr[i]["Name"];
                        var description = dr[i]["Description"];
                        if (description == null || description == 'undefined') {
                            description = "";
                        }
                        //
                        valueLst.push(value);
                        nameLst.push(name);
                        descriptionLst.push(description);
                    }
                }
            }
            catch (e) {
               
                console.log(e);
            }
            finally {
                
            }

            //	convert to arrays
            var size = valueLst.length;
            _values = [];
            _names = [];
            _descriptions = [];
            for (var i = 0; i < size; i++) {
                _values.push(valueLst[i]);
                _names.push(nameLst[i]);
                _descriptions.push(descriptionLst[i]);
            }
        };

        function dynInit(Record_ID) {

            docStatus = tabObj.getValue("DocStatus");
            var docAction = tabObj.getValue("DocAction");
            var processing = tabObj.getValue("Processing");

            //Rakesh(VA228):Check processing return value Y/N in case when reference is button and true/false when reference is Checkbox
            if (processing == "N" || !processing) {
                processing = false;
            }
            else {
                processing = true;
            }
            var orderType = ctx.getWindowContext(windowNo, "OrderType");
            var isSOTrx = ctx.isSOTrx(windowNo);


            //   log.Fine("DocStatus=" + docStatus
            //       + ", DocAction=" + docAction + ", OrderType=" + orderType
            //       + ", IsSOTrx=" + isSOTrx + ", Processing=" + processing
            //       + ", AD_Table_ID=" + AD_Table_ID + ", Record_ID=" + Record_ID);
            //
            //options = new Array(_values.Length);
            //  VIS.dataContext.getDocActions(AD_Table_ID, Record_ID, docStatus, processing, orderType, isSOTrx, docAction, tabObj.getTableName(), _values, _names, generateActions);


            $.ajax({
                url: VIS.Application.contextUrl + 'DocAction/GetDocActions',
                type: 'POST',
                dataType: 'Json',
                data: {

                    AD_Table_ID: AD_Table_ID, Record_ID: Record_ID, docStatus: docStatus, processing: processing, orderType: orderType, isSOTrx: isSOTrx, docAction: docAction,

                    tableName: tabObj.getTableName(), values: JSON.stringify(_values), names: JSON.stringify(_names), C_DocType_ID: tabObj.getValue("C_DocType_ID"), C_DocTypeTarget_ID: tabObj.getValue("C_DocTypeTarget_ID")
                },
                success: function (data) {
                    var result = JSON.parse(data);
                    generateActions(result);
                    fillCombo(result);
                }
            });
        };

        function generateActions(result) {


            setVisibility(false);
            docStatus = result.DocStatus;
            if (result.Error != "@PeriodOpen@" && result.Error != "@PeriodClosed@" && result.Error != null && result.Error != "" && result.Error != 'undefined') {
                VIS.ADialog.error(result.Error);
                return;
            }

            if (result.DocStatus == null) {
                $message.text("*** ERROR ***");
                //SetBusy(false);
                return;
            }
            //if period is open then made boolean value true
            if (result.Error == "@PeriodOpen@") {
                isPeriodOpen = true;
            }
            //createDesign();

        };

        function fillCombo(result) {

            /**
             *	Fill actionCombo
             */

            for (var i = 0; i < result.Index; i++) {
                //	Serach for option and add it
                var added = false;
                for (var j = 0; j < _values.length && !added; j++)
                    if (result.Options[i] && result.Options[i].equals(_values[j])) {
                        //actionCombo.addItem(_names[j]);
                        $cmbAction.append('<option data-actionkey="' + _values[j] + '">' + _names[j] + '</option>');
                        added = true;
                    }
            }

            if (result.DefaultV != null && result.DefaultV != "" && result.DefaultV != 'undefined') {
                $cmbAction.val(result.DefaultV).change();
            }

            $maindiv.prop("disable", false);

            if (self.getNumberOfOptions() == 0) {
                VIS.ADialog.info("InfoDocActionNoOptions", "");
                self.log.info("DocAction - No Options");
                ch.close();

                return;
            }
            /*VIS_427 03/04/2025 if document is completed and docAction 
             is Reverse correct or Void then append reversed date field in docaction*/
            if (tabObj.getValue("DocStatus") == "CO") {
                setReversalDate(false);
            }
        };


        /// <summary>
        /// Number of options available (to decide to display it)
        /// </summary>
        /// <returns>item count</returns>
        this.getNumberOfOptions = function () {
            return $cmbAction.children('option').length;
        };


        /// <summary>
        /// Should the process be started?
        /// </summary>
        /// <returns>OK pressed</returns>
        this.isStartProcess = function () {
            return this.isOKPressed;
        }

        /// <summary>
        /// Should the process be started in batch?
        /// </summary>
        /// <returns>batch</returns>
        this.isBatch = function () {
            return this.batch;
        }

        function createDesign() {

            var $tr1 = $('<tr>');
            var $tr2 = $('<tr>');
            var $tr3 = $('<tr>');

            var $td11 = $('<td>');
            var $td12 = $('<td>');
            var $DivInputWrap1 = $("<div class='input-group vis-input-wrap'></div>");
            var $DivInputCtrlWrap1 = $("<div class='vis-control-wrap'></div>");
            //if (VIS.Application.isRTL) {
            //    $td11.append('<span style="margin-right:3px">' + VIS.Msg.getMsg('DocAction') + '</span>');
            //}
            //else {
                $td11.append($DivInputWrap1);
                $DivInputWrap1.append($DivInputCtrlWrap1);
            //}
            $DivInputCtrlWrap1.append($cmbAction);
            $DivInputCtrlWrap1.append('<label >' + VIS.Msg.getMsg('DocAction') + '</label>');
            //$tr1.append($td11).append($td12);
            $tr1.append($td11);

            var $td22 = $('<td>');
            $td22.append($message);
            $tr2.append($td22);

            $td31 = $('<td>');
            $td32 = $('<td style="text-align:right">');

            ////Background button
            //$btnbackground.addClass("VIS_Pref_btn-2");
            //$btnbackground.text(VIS.Msg.getMsg("BackgroundProcess"));
            //$btnbackground.css({ "margin-top": "5px", "margin-bottom": "0px" });
            //$btnbackground.hide();
            //$td31.append($btnbackground);


            ////Cancel Button
            //$btncancel.addClass("VIS_Pref_btn-2");
            //$btncancel.text(VIS.Msg.getMsg("Cancel"));
            //$btncancel.css({ "margin-top": "5px", "margin-bottom": "0px", "margin-left": "5px" });
            //$td32.append($btncancel);



            ////OK Button
            //$btnok.addClass("VIS_Pref_btn-2");
            //$btnok.text(VIS.Msg.getMsg("OK"));
            //$btnok.css({ "margin-top": "5px", "margin-bottom": "0px" });
            //$td32.append($btnok);




            $tr3.append($td31).append($td32);

            $table.append($tr1).append($tr2).append($tr3);

            $maindiv.append($table);
            //VIS_427 Initialised date control
            ReverseDatediv = $('<div class="vis-ReversedateDiv" id="vis_ReverseDate_' + windowNo + '" style="margin-top:12px;">');
            var $ReverseDatewrapDiv = $('<div class="input-group vis-input-wrap">');
            var $ReverseDateCalenderIcon = $('<div class="input-group-prepend"><span class="input-group-text vis-color-primary"> <i class="fa fa-calendar"></i> </span>');
            $ReverseDate = new VIS.Controls.VDate("DateAcct", true, false, true, VIS.DisplayType.Date, "DateAcct");
            var $ReverseDateWrap = $('<div class="vis-control-wrap">');
            $ReverseDatewrapDiv.append($ReverseDateCalenderIcon).append($ReverseDateWrap);
            $ReverseDateWrap.append($ReverseDate.getControl().attr('placeholder', ' ').attr('data-placeholder', '')).append('<label>' + VIS.Msg.getMsg("VIS_ReversalDate") + '</label>');
            ReverseDatediv.append($ReverseDatewrapDiv);

            setVisibility(true);
            $maindiv.append(tabmenubusy).append(loadLabel);
            //  $maindiv.prop("disable", true);
            ch = new VIS.ChildDialog();


        };


        function events() {

            //Seleced Item Change
            $cmbAction.on("change", function () {

                var index = getSelectedIndex();
                //	Display descriprion
                if (index != -1 && _descriptions.length > 0) {
                    $message.text(_descriptions[index]);
                }
                /*VIS_427 03/04/2025 if document is completed and docAction
                  is Reverse correct or Void then append reversed date field in docaction*/
                if (tabObj.getValue("DocStatus") == "CO") {
                    setReversalDate(true);
                }
            });

            //Background button clcik 
            //$btnbackground.on("click", function () {
            //    if ($btnbackground.prop("disabled") == true) {
            //        return;
            //    }
            //    if (save()) {
            //        self.batch = true;
            //        self.isOKPressed = true;
            //        ch.close();
            //    }
            //});

            //Ok button click
            ch.onOkClick = function () {
                //if ($btnok.prop("disabled") == true) {
                //    return;
                //}
                //VIS_427 Checked whether the reverse date exist or not
                var dateVal = null;
                var ReverseDateExistOrNo = $maindiv.find("#vis_ReverseDate_" + windowNo).length;
                if (ReverseDateExistOrNo > 0) {
                    /*here we are getting value of those date whose values to be saved as the
                      value of reversed date in reversal document*/
                    dateVal = getDateForComparision();
                }
                //if Reverse date is null then return message on ok click
                if (ReverseDateExistOrNo > 0
                    && $ReverseDate.getValue() == null && $ReverseDate.getValue() == undefined) {
                    VIS.ADialog.info("VIS_ReverseDateCantBeNull");
                    return false;
                }

                if (ReverseDateExistOrNo > 0
                    && dateVal != null && dateVal > $ReverseDate.getValue()) {
                    VIS.ADialog.info("VIS_ReversalDateCantBeSmall");
                    return false;
                }
                if (save()) {
                    self.isOKPressed = true;

                    if (self.onClose) {
                        self.onClose();
                    }
                    //ch.close();

                }
            };

            //Cancel button click
            ch.onCancelClick = function () {
                //if ($btncancel.prop("disabled") == true) {
                //    return;
                //}
                //ch.close();
                if (self.onClose) {
                    self.onClose();
                }
            };
        };

        /* this function is used to compare the date fields which exist in window which
         can be compared with reverse date*/
        function getDateForComparision() {
            var dateVal = null;
            for (i = 0; i < columnArray.length; i++) {
                if (tabObj.getValue(columnArray[i]) != null && tabObj.getValue(columnArray[i]) != undefined) {
                    dateVal = tabObj.getValue(columnArray[i]);
                    break;
                }
            }
            return dateVal;
        }

        /**
         * this function is used to append thee reverse date if docaction is ReverseCorrect
         * or void and used to set the reverse date using its date fields
         * @param {any} isReverseDateToRemove
         */
        function setReversalDate(isReverseDateToRemove) {
            if (($cmbAction.find('option:selected').data("actionkey") == 'RC' || $cmbAction.find('option:selected').data("actionkey") == 'VO')) {
                $maindiv.append(ReverseDatediv);
                if (isPeriodOpen) {
                    for (i = 0; i < columnArray.length; i++) {
                        if (tabObj.getValue(columnArray[i]) != null && tabObj.getValue(columnArray[i]) != undefined) {
                            $ReverseDate.setValue(tabObj.getValue(columnArray[i]));
                            break;
                        }
                    }
                }
            }
            //here if true then remove the reverse div else not
            else if (isReverseDateToRemove) {
                $ReverseDate.setValue(null);
                $maindiv.find("#vis_ReverseDate_" + windowNo).remove();
            }
        }
        this.show = function () {
            ch.setContent($maindiv);
            ch.setTitle(VIS.Msg.getMsg("DocAction"));
            ch.setModal(true);
            ch.show();
            //  ch.hidebuttons();
        };

        ch.onClose = function () { self.dispose(); };

        function setVisibility(tvisible) {
            if (tvisible) {
                tabmenubusy.show(); loadLabel.show();
                $maindiv.find("button").prop("disabled", true);
            }
            else {
                tabmenubusy.hide();
                loadLabel.hide();
                $maindiv.find("button").prop("disabled", false);
            }
        }


        /// <summary>
        /// Get index of selected choice
        /// </summary>
        /// <returns>index or -1</returns>
        function getSelectedIndex() {
            var index = -1;

            if ($cmbAction.val() == null)
                return index;
            //	get Selection
            var sel = $cmbAction.val();

            //	find it in vector
            for (var i = 0; i < _names.length && index == -1; i++)
                if (sel.equals(_names[i])) {
                    index = i;
                    break;
                }
            //
            return index;
        }

        function save() {
            setVisibility(true);
            var selectedindex = getSelectedIndex();
            if (selectedindex == -1) {
                setVisibility(false);
                return false;
            }
            
            //set the value of reversed date so that it can be used on the time of reversal
            if ($ReverseDate.getValue() != null && $ReverseDate.getValue() != undefined) {
                tabObj.setValue("VAS_ReversedDate", $ReverseDate.getValue())
            }
            //	Save Selection
            // thi.log.Config("DocAction=" + _values[selectedindex]);
            var windowID = tabObj.getAD_Window_ID();
            var tabID = tabObj.getAD_Tab_ID();
            var docAction = _values[selectedindex];

            //Check any tab panel exist
            if (tabObj.getHasPanel()) {
                var panels = tabObj.getTabPanels();
                var isSurveyPanel = false;
                for (var i = 0; i < panels.length; i++) {
                    if (panels[i].getClassName() == 'VIS.SurveyPanel') {
                        isSurveyPanel = true;
                        i = panels.length;
                    }
                }

                if (isSurveyPanel) {
                    var result = false;
                    $.ajax({
                        type: "POST",
                        url: VIS.Application.contextUrl + "VIS/SurveyPanel/CheckDocActionCheckListResponse",
                        dataType: "json",
                        async: false,  
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify({
                            "AD_Window_ID": windowID,
                            "AD_Tab_ID": tabID,
                            "Record_ID": recordId,
                            "DocAction": docAction,
                            "AD_Table_ID": tabObj.getAD_Table_ID()
                        }),
                        success: function (data) {
                            if (data == 'false') {
                                VIS.ADialog.error("CheckListRequired");
                                result= false;
                            } else {
                                tabObj.setValue("DocAction", docAction);
                                result= true;
                            }
                        },
                        error: function (e) {
                        }
                    });

                    return result;
                } else {
                    tabObj.setValue("DocAction", docAction);
                    return true;
                }
            } else {
                tabObj.setValue("DocAction", docAction);
                return true;
            }
        };

        this.dispose = function () {
            ch.close();
            ch = null;
            AD_Table_ID = null;
            _values = null;
            _names = null;
            _descriptions = null;
            docStatus = null;
            index = 0;
            defaultV = null;
            options = null;
            // $cmbAction.empty();
            $cmbAction = null;
            $message = null;
            // // $btnbackground = null;
            // $btnok = null;
            // $btncancel = null;
            // $maindiv.empty();
            $maindiv = null;
            self = null;
            if ($table)
                $table.empty();

            $table = null;
        };

    };


    function documentEngine() {
        //Complete = CO
        this.ACTION_COMPLETE = "CO";
        //Wait Complete = WC 
        this.ACTION_WAITCOMPLETE = "WC";
        // Approve = AP 
        this.ACTION_APPROVE = "AP";
        // Reject = RJ 
        this.ACTION_REJECT = "RJ";
        // Post = PO 
        this.ACTION_POST = "PO";
        // Void = VO 
        this.ACTION_VOID = "VO";
        // Close = CL
        this.ACTION_CLOSE = "CL";
        // Reverse - Correct = RC 
        this.ACTION_REVERSE_CORRECT = "RC";
        // Reverse - Accrual = RA 
        this.ACTION_REVERSE_ACCRUAL = "RA";
        // ReActivate = RE 
        this.ACTION_REACTIVATE = "RE";
        // <None> = -- 
        this.ACTION_NONE = "--";
        // Prepare = PR
        this.ACTION_PREPARE = "PR";
        // Unlock = XL 
        this.ACTION_UNLOCK = "XL";
        // Invalidate = IN 
        this.ACTION_INVALIDATE = "IN";
        // ReOpen = OP 
        this.ACTION_REOPEN = "OP";

        // Drafted = DR
        this.STATUS_DRAFTED = "DR";
        // Completed = CO 
        this.STATUS_COMPLETED = "CO";
        // Approved = AP 
        this.STATUS_APPROVED = "AP";
        // Invalid = IN 
        this.STATUS_INVALID = "IN";
        //Not Approved = NA 
        this.STATUS_NOTAPPROVED = "NA";
        //Voided = VO 
        this.STATUS_VOIDED = "VO";
        // Reversed = RE 
        this.STATUS_REVERSED = "RE";
        // Closed = CL 
        this.STATUS_CLOSED = "CL";
        // Unknown = ??
        this.STATUS_UNKNOWN = "??";
        //In Progress = IP 
        this.STATUS_INPROGRESS = "IP";
        // Waiting Payment = WP 
        this.STATUS_WAITINGPAYMENT = "WP";
        //Waiting Confirmation = WC 
        this.STATUS_WAITINGCONFIRMATION = "WC";
    };

    VIS.VDocAction = VDocAction;
    VIS.DocumentEngine = documentEngine;

})(VIS, jQuery);