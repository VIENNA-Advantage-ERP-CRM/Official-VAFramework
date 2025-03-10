VIS = window.VIS || {};
(function () {

    function surveyPanel(height) {
        this.record_ID = 0;
        this.windowNo = 99999;
        this.curTab = null;
        this.selectedRow = null;
        this.panelWidth;
        this.extraInfo = null;
        this.isCheckListFill = false;
        this.selectdIdx = -1;
        this.TabPanelName = "SurveyPanel";
        var self = this;
        var $root;
        var questionSection = null;
        var responseSection = null;
        var _AD_Window_ID = 0;
        var _AD_Tab_ID = 0;
        var _AD_Table_ID = 0;
        var _AD_WF_Activity_ID = 0;
        var iFrame;
        var IsMandatoryAll = false;
        var pageSize = 0;
        var Limit = 0;
        var AD_SurveyAssignment_ID = 0;
        var AD_SurveyResponse_ID = 0;
        var ResponseCount = 0;
        var userResponse = {};
        var userResIdx = 0;
        var isSelfShow = true;
        var surveyTab = null;
        var $clickHere = ('<a href="javascript:;">' + VIS.Msg.getMsg("VIS_ClickHere") + '</a>');
        var bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        var setBusy = function (isBusy) {
            bsyDiv.css("display", isBusy ? 'block' : 'none');
        };
        var h = null;
        var ht = null;
        this.init = function () {
            setBusy(false);
            $root = $('<div class="vis-surveyTab-root"></div>').append(bsyDiv);
            // h = $('.vis-ad-w-p-ap-tp-o-b-content').height() - 19;
            h = height - 4;

            if (!h || h < 0) {
                h = $('.divWorkflowActivity').height() - 19;
            }

            if (self.curTab && self.curTab.getIsTPBottomAligned()) {
                h = null;
            }

            if (!h) {
                h = 100 + '%';
                ht = 100 + '%';
            } else {
                ht = (h - 38) + 'px';
                h = h + 'px';

            }

            var tab = $('<div class="vis-surveyTab">'
                + '<div class="vis-tabPrimary">'
                + '<ul class="nav vis-primarySection nav-tabs mb-1" id="surveyTab_' + self.windowNo + '" role="tablist">'
                + '<li class="nav-item vis-firstResLink  text-center ">'
                + '  <a'
                + '    class="nav-link active quesTab text-center"'
                + '    id="home-tab"'
                + '    data-toggle="tab"'
                + '    href="#quesSec_' + self.windowNo + '"'
                + '    >' + VIS.Msg.getMsg("VIS_Questions") + '</a>'
                + '</li>'
                + '<li class="nav-item text-center" >'
                + '  <a style="display:none"'
                + '    class="nav-link respTab text-center"'
                + '    id="profile-tab"'
                + '    data-toggle="tab"'
                + '    href="#resp_' + self.windowNo + '"'
                + '    >' + VIS.Msg.getMsg("Response") + '<span class="badge badge-light responseCount' + (VIS.Application.isRTL ? " mr-1" : " ml-1") + '">0</span></a>'
                + '</li>'
                + '</ul>'
                + '<div class="tab-content">'
                + '<div class="tab-pane fade show active" style="width:100%;" id="quesSec_' + self.windowNo + '">'
                + '<div class="align-items-center d-flex justify-content-center vis-displayNone" style="height:' + (ht) + '" id="quesMessage_' + self.windowNo + '"></div>'
                + '<div style="height:' + (ht) + ';overflow-y:auto !important;" id="ques_' + self.windowNo + '"></div>'
                + '</div>'
                + '<div class="tab-pane fade mt-2" style="height:' + (ht) + ';width:100%;overflow:auto !important;" id="resp_' + self.windowNo + '">'
                + '<div class="d-flex align-items-center justify-content-between mr-2 ml-2">'
                + '<div class="d-flex align-items-center ' + (VIS.Application.isRTL ? " ml-1" : " mr-1") + '">'
                + '<span class="d-inline-block ' + (VIS.Application.isRTL ? " ml-1" : " mr-1") + '">' + VIS.Msg.getMsg("SelectUser") + '</span>'
                + '<select class="w-100"></select>'
                + '</div> '
                + '<div class="align-items-center d-flex"> '
                + '<span class="' + (VIS.Application.isRTL ? "ml-1" : "mr-1") + ' ">' + VIS.Msg.getMsg("Response") + ':</span>'
                + '<span class="align-items-center d-flex">'
                + '<button class="vis-cusPagination prev">'
                + '<i class="fa fa-chevron-circle-' + (VIS.Application.isRTL ? "right ml-1" : "left mr-1") + ' " aria-hidden="true"></i>'
                + '</button>'
                + '<span class="resStatus vis-surveyPagination">0/0</span class="d-flex align-items-center">'
                + '<button class="vis-cusPagination next">'
                + '<i class="fa fa-chevron-circle-' + (VIS.Application.isRTL ? "left mr-1" : "right ml-1") + '" aria-hidden="true"></i>'
                + '</button>'
                + '</span>'
                + '</div>'
                + '</div> '
                + '<div class="' + (VIS.Application.isRTL ? "text-left ml-2" : "text-right mr-2") + ' mt-2"  style="font-size: 12px;font-style: italic;" >' + VIS.Msg.getMsg("VIS_Submitted") + ': <span class="submittedDate"></span></div>'
                + '<div class="response"></div>'
                + '</div > '
                + '</div>'
                + '</div>'
                + '</div>'
            );

            $root.append(tab);
            surveyTab = $root.find('#surveyTab_' + self.windowNo);
            questionSection = $root.find('#ques_' + self.windowNo);
            responseSection = $root.find('#resp_' + self.windowNo);
            // panelDetails(this.curTab.vo.AD_Window_ID, this.curTab.vo.AD_Tab_ID, $root);
        };

        this.update = function (Record_ID) {
            if (self.isCheckListFill) {
                if (Record_ID < 0) {
                    return false;
                }

                self.SaveData(Record_ID);
            } else {
                self.panelDetails(this.curTab.vo.AD_Window_ID, this.curTab.vo.AD_Tab_ID, this.curTab.getAD_Table_ID(), Record_ID, $root, 0);
            }
        }

        this.setisCheckListFill = function (value) {
            this.isCheckListFill = value;
        }

        this.panelDetails = function (AD_window_ID, AD_Tab_ID, AD_Table_ID, Record_ID, $root, AD_WF_Activity_ID) {
            self.isCheckListFill = false;
            self.record_ID = Record_ID;
            _AD_Window_ID = AD_window_ID;
            _AD_Tab_ID = AD_Tab_ID;
            _AD_Table_ID = AD_Table_ID;
            _AD_WF_Activity_ID = AD_WF_Activity_ID;
           
            IsMandatoryAll = false;
            pageSize = 0;
            userResIdx = 0;
            Limit = 0;

            var uri = "GetSurveyAssignmentsClientSide";
            if (_AD_WF_Activity_ID > 0) {
                uri = "GetSurveyAssignments";
            }
            setBusy(true);
            function processAssignment(res) {
                var indx = -1;
                if (_AD_WF_Activity_ID == 0) {
                    for (var i = 0; i < res.length; i++) {
                        if (!res[i].ShowEverytime) {
                            indx = 0;
                            break;
                        }
                        var isValidate = VIS.Evaluator.evaluateLogicByRowData(self.curTab, res[i].ConditionStr);
                        if (isValidate) {
                            indx = i;
                            break;
                        }
                    }

                    if (indx == -1) {
                        return;
                    }

                } else {
                    indx = 0;
                }

                IsMandatoryAll = res[indx].IsMandatory;
                pageSize = res[indx].QuestionsPerPage;
                isSelfShow = res[indx].IsSelfshow;
                Limit = res[indx].Limit;
                ResponseCount = res[indx].ResponseCount;
                AD_SurveyAssignment_ID = res[indx].SurveyAssignment_ID;
                AD_SurveyResponse_ID = res[indx].SurveyResponse_ID;

                if (self.selectdIdx != indx) {
                    questionSection.empty();
                    $root.find('.vis-surveyTab .vis-primarySection').show();
                    $root.find("#quesMessage_" + self.windowNo).addClass('vis-displayNone');
                    responseSection.find('.response').empty();
                    loadSurveyUI(res[indx].Survey_ID, res[indx].SurveyType, $root);
                } 
                setBusy(false);
                self.selectdIdx = indx;
            }

            if (self.ChecklistRes) {
                processAssignment(self.ChecklistRes)
            } else {               

                $.ajax({
                    url: VIS.Application.contextUrl + "VIS/SurveyPanel/" + uri,
                    //async: false,
                    data: { AD_window_ID: AD_window_ID, AD_Tab_ID: AD_Tab_ID, AD_Table_ID: AD_Table_ID, AD_Record_ID: self.record_ID, AD_WF_Activity_ID: _AD_WF_Activity_ID },
                    success: function (data) {
                        setBusy(false);
                        var res = [];
                        res = JSON.parse(data);
                        if (res != null && res.length > 0) {
                            self.ChecklistRes = res;
                            processAssignment(res);

                        } else {
                            if (_AD_WF_Activity_ID > 0) {
                                $root.find('.vis-surveyTab .vis-primarySection').hide();
                                $root.find("#quesMessage_" + self.windowNo).html(VIS.Msg.getMsg("VIS_NoCheckListFound"));
                                $root.find("#quesMessage_" + self.windowNo).removeClass('vis-displayNone');
                            }
                        }
                    },
                    error: function (e) {
                        setBusy(false);
                    }
                });
            }
        }

        

        this.getRoot = function () {
            return $root;
        };

        this.SaveData = function (recordID) {
            setBusy(true);
            var main = questionSection.find('.VIS_SI_Main' + self.windowNo);
            var asnwers = main.find('[class^=VIS_Answ_]'); //get all answer start VIS_Quest_
            var questions = main.find('[class^=VIS_Quest_]'); // get all question start VIS_Quest_
            var Final_Data = {};
            Final_Data.Questions = [];
            var AD_Survey_ID = 0;
            for (var i = 0; i < questions.length; i++) {
                var required = true;
                var lisItem = questionSection.find('[data-id="' + questions[i].classList[0] + '"]');
                AD_Survey_ID = lisItem[0].dataset.survey;
                if (questions[i].dataset.qtype == 'CB' || questions[i].dataset.qtype == 'OP' || questions[i].dataset.qtype == 'CL') {
                    if (lisItem.length > 0) {
                        for (var j = 0; j < lisItem.length; j++) {
                            if ($(lisItem[j]).is(":checked")) {
                                required = false;
                                Final_Data.Questions.push({
                                    "Question": questions[i].textContent,
                                    "Answer": $(lisItem[j]).val(),
                                    "AD_SurveyItem_ID": lisItem[j].dataset.surveyitem,
                                    "AD_SurveyValue_ID": lisItem[j].dataset.surveyvalue
                                });
                            }
                        }
                        if ((IsMandatoryAll || questions[i].dataset.mandatory == 'Y') && required) {
                            VIS.ADialog.error("FillMandatory", true, "Ques-" + (i + 1));
                            setBusy(false);
                            return;
                        }
                    }
                }
                else if (questions[i].dataset.qtype == 'TX') {
                    if ($(lisItem[0]).val().length > 0) {
                        required = false;
                    };
                    Final_Data.Questions.push({
                        "Question": questions[i].textContent,
                        "Answer": $(lisItem[0]).val(),
                        "AD_SurveyItem_ID": lisItem[0].dataset.surveyitem,
                        "AD_SurveyValue_ID": lisItem[0].dataset.surveyvalue
                    });

                    if ((IsMandatoryAll || questions[i].dataset.mandatory == 'Y') && required) {
                        VIS.ADialog.error("FillMandatory", true, "Ques-" + (i + 1));
                        setBusy(false);
                        return;
                    }
                }
            }

            if (_AD_WF_Activity_ID == 0 && recordID <= 0 && Final_Data.Questions.length > 0) {
                self.isCheckListFill = true;
                toastr.success(VIS.Msg.getMsg("CheckWillAutoSaveAfterNewRecordSave"), '', { timeOut: 3000, "positionClass": "toast-top-right", "closeButton": true, });
                setBusy(false);
                return;
            } else {
                self.isCheckListFill = false;
            }


            $.ajax({
                type: "POST",
                url: VIS.Application.contextUrl + "VIS/SurveyPanel/SaveSurveyResponse",
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({
                    "surveyResponseValue": Final_Data.Questions,
                    "AD_Window_ID": _AD_Window_ID,
                    "AD_Survey_ID": AD_Survey_ID,
                    "AD_Tab_ID": _AD_Tab_ID,
                    "Record_ID": recordID,
                    "AD_Table_ID": _AD_Table_ID,
                    "AD_WF_Activity_ID": _AD_WF_Activity_ID
                }),
                success: function (data) {
                    questionSection.find('input').prop('checked', false);
                    questionSection.find('textarea').val('');
                    toastr.success(VIS.Msg.getMsg("CheckListSaved"), '', { timeOut: 3000, "positionClass": "toast-top-right", "closeButton": true, });
                    self.isCheckListFill = false;
                    //loadAccessData(AD_Survey_ID);                        
                    if (_AD_WF_Activity_ID == 0) {
                        self.update(self.record_ID);
                    } else {
                        self.panelDetails(_AD_Window_ID, _AD_Tab_ID, _AD_Table_ID, self.record_ID, $root, _AD_WF_Activity_ID);
                    }
                    setBusy(false);

                },
                error: function (e) {
                    setBusy(false);
                }
            });
        }       

        this.disposeComponent = function () {
            if (iFrame)
                iFrame.remove();
            $root.remove();
            iFrame = null;
            $root = null;
        };

        /**
         * Load Survey UI
         * @param {any} AD_Survey_ID
         * @param {any} SurveyType
         * @param {any} $root
         */
        function loadSurveyUI(AD_Survey_ID, SurveyType, root) {
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/SurveyPanel/GetSurveyItems",
                //async: false,
                data: { AD_Survey_ID: AD_Survey_ID },
                success: function (data) {
                    setBusy(false);
                    var res = [];
                    res = JSON.parse(data);
                    if (res != null) {
                        loadSurveyDesign(res, SurveyType, root, AD_Survey_ID);
                        findControls();
                    };
                },
                error: function (e) {
                    setBusy(false);
                }
            });
        };

        /**
         * Create survey Question Answer
         * @param {any} SurveyData
         * @param {any} SurveyType
         * @param {any} $root
         */
        function loadSurveyDesign(SurveyData, SurveyType, root, AD_Survey_ID) {
            var $dsgn;
            var stl = "width: calc(100% - 1px);height: calc(100% - 30px);position: absolute;";
            if (self.curTab && self.curTab.getIsTPBottomAligned()) {
                stl = "";
            }
            var dsg = '<div class="VIS_SI_Main' + self.windowNo + '" style="' + stl+'">' +
                '<div class="vis-tp-mainContainer"> ' +
                '<ol class="list-unstyled vis-tp-orderListWrap"> ';
            if (SurveyType == "CL") //if survey type is Checklist.
            {

                if (SurveyData.length > 0) {
                    for (var i = 0; i < SurveyData.length; i++) {
                        dsg += '<li class="VIS_SI_' + SurveyData[i].Item.AD_SurveyItem_ID + ' align-items-center d-flex mb-3 pb-3 vis-tp-listItem">' +
                            '<h6 class="mr-2 mb-0" style="min-width:15px;text-algin:right">' + (i + 1) + '.</h6><input class="VIS_Answ_' + self.windowNo + '" data-id="VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + '" data-surveyitem=' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-surveyvalue="0" data-survey=' + SurveyData[i].Item.AD_Survey_ID + ' type= "checkbox" ><p class="VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + '" data-qtype="' + SurveyType + '" data-mandatory="' + SurveyData[i].Item.IsMandatory + '">' + SurveyData[i].Item.Question;

                        if (IsMandatoryAll || SurveyData[i].Item.IsMandatory == 'Y') {
                            dsg += '<sub style="color:red;font-size: 100%;bottom: unset;">*</sub>';
                        }
                        dsg += '</p>' +
                            '</li>';
                    }
                }
                dsg += '</ol>';

                //$dsgn = $(dsg);
            }
            else // if survey type is Questionnarie.
            {
                if (SurveyData.length > 0) {
                    for (var i = 0; i < SurveyData.length; i++) {
                        if (SurveyData[i].Item.AnswerType == "CB") { //if answer type check box
                            dsg += '<li class="mb-3"> ' +
                                '<h6 data-qtype="' + SurveyData[i].Item.AnswerType + '" data-mandatory="' + SurveyData[i].Item.IsMandatory + '" class= "VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + ' mb-3 vis-tp-qus ml"> ' + (i + 1) + '. ' + SurveyData[i].Item.Question;
                            if (IsMandatoryAll || SurveyData[i].Item.IsMandatory == 'Y') {
                                dsg += '<sub style="color:red;font-size: 100%;bottom: unset;">*</sub>';
                            }
                            dsg += '</h6 > ' +
                                '<div class="vis-tp-listWrap"> ';
                            for (var j = 0; j < SurveyData[i].Values.length; j++) {
                                dsg += ' <div class="VIS_SI_' + SurveyData[i].Values[j].AD_SurveyValue_ID + ' align-items-center d-flex mb-3 vis-tp-listItem"> ' +
                                    ' <input  data-id="VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + '"';
                                if (SurveyData[i].Item.AnswerSelection == 'SL') {
                                    dsg += ' class="VIS_Answ_' + SurveyData[i].Values[j].AD_SurveyValue_ID + ' group_' + SurveyData[i].Item.AD_SurveyItem_ID + '" ';
                                } else {
                                    dsg += ' class="VIS_Answ_' + SurveyData[i].Values[j].AD_SurveyValue_ID + '"';
                                }
                                dsg += ' data-surveyitem=' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-surveyvalue=' + SurveyData[i].Values[j].AD_SurveyValue_ID + '  data-survey=' + SurveyData[i].Item.AD_Survey_ID + ' value="' + SurveyData[i].Values[j].Answer + '" type="checkbox">' +
                                    ' <p>' + SurveyData[i].Values[j].Answer + '</p>' +
                                    ' </div>';
                            }
                            dsg += '</div> ' +
                                '</li > ';
                        }
                        else if (SurveyData[i].Item.AnswerType == "OP") { // if answer type optional 
                            dsg += '<li class="mb-3"> ' +
                                '<h6 data-qtype=' + SurveyData[i].Item.AnswerType + ' data-mandatory="' + SurveyData[i].Item.IsMandatory + '" class="VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + ' mb-3 vis-tp-qus">' + (i + 1) + '. ' + SurveyData[i].Item.Question;
                            if (IsMandatoryAll || SurveyData[i].Item.IsMandatory == 'Y') {
                                dsg += '<sub style="color:red;font-size: 100%;bottom: unset;">*</sub>';
                            }
                            dsg += '</h6 > ' +
                                '<div class="vis-tp-listWrap"> ';
                            for (var j = 0; j < SurveyData[i].Values.length; j++) {
                                dsg += '<div  class=" VIS_SI_' + SurveyData[i].Values[j].AD_SurveyValue_ID + ' align-items-center d-flex mb-3 vis-tp-listItem"> ' +
                                    '<input type="radio" name=VIS_' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-id=VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID +
                                    ' data-surveyitem=' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-surveyvalue=' + SurveyData[i].Values[j].AD_SurveyValue_ID + ' data-survey=' + SurveyData[i].Item.AD_Survey_ID + ' class = "VIS_Answ_' + SurveyData[i].Values[j].AD_SurveyValue_ID + '" value="' + SurveyData[i].Values[j].Answer + '" > <p>' + SurveyData[i].Values[j].Answer + '</p>' +
                                    '</div>';
                            }
                            dsg += '</div>' +
                                '</li > ';
                        }
                        else if (SurveyData[i].Item.AnswerType == "TX") {// if answer type textbox
                            dsg += '<li class="mb-3"> ' +
                                '<h6 data-qtype=' + SurveyData[i].Item.AnswerType + ' data-mandatory="' + SurveyData[i].Item.IsMandatory + '" class="VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + ' mb-3 vis-tp-qus ml">' + (i + 1) + '. ' + SurveyData[i].Item.Question;
                            if (IsMandatoryAll || SurveyData[i].Item.IsMandatory == 'Y') {
                                dsg += '<sub style="color:red;font-size: 100%;bottom: unset;">*</sub>';
                            }
                            dsg += '</h6 > ' +
                                '<textarea class="VIS_Answ_' + SurveyData[i].Item.AD_SurveyItem_ID + '" data-id=VIS_Quest_' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-surveyitem=' + SurveyData[i].Item.AD_SurveyItem_ID + ' data-surveyvalue="0" data-survey=' + SurveyData[i].Item.AD_Survey_ID + '  cols="30" rows="4" placeholder="Enter your text here"></textarea> ' +
                                /*'<small class="mb-3">Max 200 letters</small> ' +*/
                                '</li > ';
                        }
                    }
                }

                dsg += '</ol > ';
                // $dsgn = $(dsg);
            }
            dsg += '</div >' +
                '</div > ';

            $dsgn = $(dsg);
            if (_AD_WF_Activity_ID == 0) {
                responseSection.find('.response').append($dsgn.clone(true).removeAttr('style'));
                responseSection.find('input,textarea').attr('disabled', 'disabled');
            }
            if (Limit > 0 && ResponseCount >= Limit) {
                questionSection.hide();               
                $root.find("#quesMessage_" + self.windowNo).html(VIS.Msg.getMsg("VIS_AlreadySubmittedResponse"));                
                $root.find("#quesMessage_" + self.windowNo).removeClass('vis-displayNone');
            } else {
                questionSection.append($dsgn);
                var main = questionSection.find('.VIS_SI_Main' + self.windowNo);
                var stl1 ="bottom: 0px;position: absolute;width: calc(100% - 1px);"
                if (self.curTab && self.curTab.getIsTPBottomAligned()) {
                    stl1 = "bottom: 0px;position: absolute;width: calc(100% - 10px);";
                }
                var btns = '<div class="vis-survey" style="'+stl1+'">';
                var totalQues = main.find('[class^=VIS_Quest_]').length;

                //show pagging button according to page size and question length.
                if (pageSize > 0 && totalQues > pageSize) {
                    btns += '<div class="' + (VIS.Application.isRTL ? " float-right" : " float-left") + '"><a class="prev btn mr-2"><i class="fa fa-chevron-' + (VIS.Application.isRTL ? "right" : "left") +'" aria-hidden="true"></i> ' + VIS.Msg.getMsg('VIS_Prev') + '</a></div>';
                }

                btns += '<div style="padding-bottom: 10px;" class="vis-tp-btnWrap' + (VIS.Application.isRTL ? " float-left" : " float-right") + '" > ' +
                    '<a class="next btn">' + VIS.Msg.getMsg('VIS_Next') + ' <i class="fa fa-chevron-' + (VIS.Application.isRTL ? "left" : "right") +'" aria-hidden="true"></i></a>' +
                    '<a href="#" id="VIS_SI_BtnSubmit_' + self.windowNo + '" class="btn" >' + VIS.Msg.getMsg("VIS_Submit") +'</a> ' +
                    '</div >';

                btns += '<div>';
                questionSection.append(btns);

                //paging setup
                if (pageSize > 0 && totalQues > pageSize) {
                    questionSection.find('.vis-tp-orderListWrap li:gt(' + (pageSize - 1) + ')').addClass('hideQuestion');
                }

                if (ResponseCount > 0) {
                    questionSection.hide();
                    $root.find("#quesMessage_" + self.windowNo).html('<span class="d-block px-2 text-center w-100">' + VIS.Msg.getMsg('VIS_SubmitAgain') + ' ' + $clickHere + '</span>');
                    $root.find("#quesMessage_" + self.windowNo).removeClass('vis-displayNone');

                    $root.find("#quesMessage_" + self.windowNo + " a").click(function () {
                        questionSection.show();
                        $root.find("#quesMessage_" + self.windowNo).addClass('vis-displayNone');
                        questionSection.find('.vis-tp-orderListWrap li').removeClass('hideQuestion');
                        questionSection.find('.vis-tp-orderListWrap li:gt(' + (pageSize - 1) + ')').addClass('hideQuestion');
                        showHideSubmit();
                    });
                } else {
                    questionSection.show();
                    $root.find("#quesMessage_" + self.windowNo).addClass('vis-displayNone');
                    questionSection.find('.vis-tp-orderListWrap li').removeClass('hideQuestion');
                    questionSection.find('.vis-tp-orderListWrap li:gt(' + (pageSize - 1) + ')').addClass('hideQuestion');
                    showHideSubmit();
                }
            }

           
            //if (!isSelfShow) {
               // responseSection.hide();
            //} 
            if (_AD_WF_Activity_ID == 0) {
                loadAccessData(AD_Survey_ID);
            } else {
                //if (_AD_WF_Activity_ID == 0) {
                //    questionSection.css('height', h);
                //} else {
                //    questionSection.css('height', '74vh');
                //}
                questionSection.css('height', h);
                surveyTab.find('.respTab').hide();
                surveyTab.find('.quesTab').hide();
                return;
            }
           
           
        };

        function loadAccessData(AD_Survey_ID) {
            userResponse = {};
            userResIdx = 0;
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/SurveyPanel/CheckResponseAccess",
                //async: false,
                data: {
                    AD_Survey_ID: AD_Survey_ID,
                    AD_SurveyAssignment_ID: AD_SurveyAssignment_ID,
                    AD_User_ID: VIS.context.getAD_User_ID(),
                    AD_Role_ID: VIS.context.getAD_Role_ID(),
                    Record_ID: self.record_ID,
                    AD_window_ID: _AD_Window_ID,
                    AD_Table_ID: _AD_Table_ID,
                    IsSelfShow: isSelfShow
                },
                success: function (data) {
                    setBusy(false);
                    var res = [];
                    res = JSON.parse(data);
                    
                   
                    if (res != null && res.length > 0) {
                        var count = 0;
                        //responseSection.show();
                        surveyTab.find('.respTab').show();
                        surveyTab.find('.quesTab').show();

                        if (isSelfShow) {
                            questionSection.css('height', (ht));
                        } else {
                            questionSection.css('height', h);
                        }


                        surveyTab.find('.responseCount').text(res.length);
                        for (var i = 0; i < res.length; i++) {
                            if (!userResponse['U' + res[i].User_ID]) {
                                userResponse['U' + res[i].User_ID] = [];
                            }

                            userResponse['U' + res[i].User_ID].push({ id: res[i].AD_SurveyResponse_ID, Created: new Date(res[i].Created).toLocaleString() });


                            if (responseSection.find('select option[value="' + res[i].User_ID + '"]').length > 0) {

                            } else {
                                if (res[i].Name == 'Self' && count == 0) {
                                    count++;
                                    responseSection.find('select').append('<option selected value="' + res[i].User_ID + '">' + res[i].Name + '</option>');
                                } else {
                                    responseSection.find('select').append('<option value="' + res[i].User_ID + '" >' + res[i].Name + '</option>');
                                }
                            }
                        }
                    } else {
                        //if (_AD_WF_Activity_ID == 0) {
                        //    questionSection.css('height', h);
                        //} else {
                        //    questionSection.css('height', '74vh');
                        //}
                        questionSection.css('height', h);
                        surveyTab.find('.respTab').hide();
                        surveyTab.find('.quesTab').hide();
                        return;
                    }
                    var uID = VIS.context.getAD_User_ID();

                    if (!userResponse['U' + uID]) {
                        responseSection.find('select option:selected').change();
                        return;
                    } 

                    AD_SurveyResponse_ID = userResponse['U' + uID][0].id;
                    if (userResponse['U' + uID].length > 1) {
                        responseSection.find('.next').removeAttr('disabled');
                        responseSection.find('.prev').attr('disabled','disabled');
                    } else {
                        responseSection.find('.prev').attr('disabled','disabled');
                        responseSection.find('.next').attr('disabled','disabled');
                    }

                    responseSection.find('.resStatus').text((1) + '/' + userResponse['U' + uID].length);
                    responseSection.find('.submittedDate').text(userResponse['U' + uID][0].Created);
                    var notLimitExpaire = true;
                    if (Limit > 0 && userResponse['U' + uID].length >= Limit) {
                        questionSection.hide();
                        $root.find("#quesMessage_" + self.windowNo).html(VIS.Msg.getMsg("VIS_AlreadySubmittedResponse"));
                        $root.find("#quesMessage_" + self.windowNo).removeClass('vis-displayNone');
                        notLimitExpaire = false;
                    }

                    if (notLimitExpaire && userResponse['U' + uID].length > 0) {
                        questionSection.hide();
                        $root.find("#quesMessage_" + self.windowNo).html('<span class="d-block px-2 text-center w-100">' + VIS.Msg.getMsg('VIS_SubmitAgain') + ' ' + $clickHere + '</span>');
                            $root.find("#quesMessage_" + self.windowNo).removeClass('vis-displayNone');
                            $root.find("#quesMessage_" + self.windowNo+" a").click(function () {
                                questionSection.show();
                                $root.find("#quesMessage_" + self.windowNo).addClass('vis-displayNone');
                                questionSection.find('.vis-tp-orderListWrap li').removeClass('hideQuestion');
                                questionSection.find('.vis-tp-orderListWrap li:gt(' + (pageSize - 1) + ')').addClass('hideQuestion');
                                showHideSubmit();
                            });                       
                    }   

                    if (_AD_WF_Activity_ID == 0) {
                        loadSurveyResponse(uID);
                    }
                                 
                },
                error: function (e) {
                    setBusy(false);
                }
            });

        }

        function loadSurveyResponse(userID) {
            responseSection.find('input').prop('checked', false);
            responseSection.find('textarea').val('');
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VIS/SurveyPanel/GetResponseList",
                //async: false,
                data: {
                    AD_window_ID: _AD_Window_ID,
                    AD_Table_ID: _AD_Table_ID,
                    Record_ID: self.record_ID,
                    AD_User_ID: userID,
                    AD_SurveyResponse_ID: AD_SurveyResponse_ID
                },
                success: function (data) {
                    var res = [];
                    res = JSON.parse(data);
                    if (res != null && res.length > 0) {
                        //responseSection.show();
                        for (var i = 0; i < res.length; i++) {
                            if (res[i].AnswerType == 'TX') {
                                responseSection.find('[data-surveyitem="' + res[i].AD_SurveyItem_ID + '"][data-surveyvalue="' + res[i].AD_SurveyValue_ID + '"]').val(res[i].Answer);
                            } else {
                                responseSection.find('[data-surveyitem="' + res[i].AD_SurveyItem_ID + '"][data-surveyvalue="' + res[i].AD_SurveyValue_ID + '"]').prop("checked", true);
                            }
                        }
                    };
                    setBusy(false);
                },
                error: function (e) {
                    setBusy(false);
                }
            });
        }

        //control setup
        function findControls() {           
            $mainDiv = questionSection.find('.VIS_SI_Main' + self.windowNo);
            $btnSubmit = questionSection.find('#VIS_SI_BtnSubmit_' + self.windowNo);
            eventHandling(); 
            showHideSubmit();
        };

        //Submit button show hide on the behalf of pagging
        function showHideSubmit() {
            setTimeout(function () {
                if (questionSection.find('.vis-tp-orderListWrap li:last').is(':hidden')) {
                    $btnSubmit.hide();
                    questionSection.find('.next').show();
                } else {
                    $btnSubmit.show();
                    questionSection.find('.next').hide();
                }

                //if first item  is hidden
                if (questionSection.find('.vis-tp-orderListWrap li:first').is(':hidden')) {
                    questionSection.find('.prev').show();
                } else {
                    questionSection.find('.prev').hide();
                }
                questionSection.find('.vis-tp-orderListWrap').scrollTop(0);
            }, 200);
           
        }

        function eventHandling() {
            // Save response
            

            $btnSubmit.off().on("click", function (e) {
                self.SaveData(self.record_ID);
            });

            questionSection.find('[class*=group_]').off().click(function () {
                if ($(this).next().attr('data-qtype') && $(this).next().attr('data-qtype') == 'CL') {
                    return;
                }
                singleChkBoxSelection(this, 'group_' + $(this).data('surveyitem'));
            });

            //Next Page
            questionSection.find('.next').off().click(function () {
                var last = questionSection.find('.vis-tp-orderListWrap').children('li:visible:last');
                last.nextAll(':lt(' + pageSize + ')').removeClass('hideQuestion');
                last.next().prevAll().addClass('hideQuestion');
                showHideSubmit();
            });
            // Previous Page
            questionSection.find('.prev').off().click(function () {
                var first = questionSection.find('.vis-tp-orderListWrap').children('li:visible:first');
                first.prevAll(':lt(' + pageSize + ')').removeClass('hideQuestion');
                first.prev().nextAll().addClass('hideQuestion');
                showHideSubmit();
            });

            responseSection.find('select').off().change(function () {
                userResIdx = 0;              
                var userID = responseSection.find('select option:selected').val();
                AD_SurveyResponse_ID = userResponse['U' + userID][0].id;
                responseSection.find('.submittedDate').text(userResponse['U' + userID][0].Created);
                responseSection.find('.resStatus').text((userResIdx + 1) + '/' + userResponse['U' + userID].length);
                if (userResponse['U' + userID].length == 1) {
                    responseSection.find('.next').attr('disabled', 'disabled');
                    responseSection.find('.prev').attr('disabled', 'disabled');
                } else {
                    responseSection.find('.next').removeAttr('disabled');
                    responseSection.find('.prev').attr('disabled', 'disabled');
                }
                loadSurveyResponse(userID);
            });

            responseSection.find('.next').off().click(function () {
                userResIdx++;
                var userID = responseSection.find('select option:selected').val();
                AD_SurveyResponse_ID = userResponse['U' + userID][userResIdx].id;
                responseSection.find('.submittedDate').text(userResponse['U' + userID][userResIdx].Created);
                if (userResIdx >=userResponse['U' + userID].length - 1){
                    $(this).attr('disabled','disabled');
                }
                responseSection.find('.prev').removeAttr('disabled');
                responseSection.find('.resStatus').text((userResIdx + 1) + '/' + userResponse['U' + userID].length);
                loadSurveyResponse(userID);
            });

            responseSection.find('.prev').off().click(function () {
                userResIdx--;
                var userID = responseSection.find('select option:selected').val();
                AD_SurveyResponse_ID = userResponse['U' + userID][userResIdx].id;
                responseSection.find('.submittedDate').text(userResponse['U' + userID][userResIdx].Created);
                if (userResIdx == 0) {
                    $(this).attr('disabled', 'disabled');
                }
                responseSection.find('.next').removeAttr('disabled');
                responseSection.find('.resStatus').text((userResIdx + 1) + '/' + userResponse['U' + userID].length);
                loadSurveyResponse(userID);
            });

            
        };

        //Single selection of checkbox
        function singleChkBoxSelection(which, theClass) {
            var checkbox = questionSection[0].getElementsByClassName(theClass);
            for (var i = 0; i < checkbox.length; i++) {
                if (checkbox[i] == which) {

                } else {
                    checkbox[i].checked = false;
                }
            }
        }
    };

    /**
    *	Invoked when user click on panel icon
    */
    surveyPanel.prototype.startPanel = function (windowNo, curTab, extraInfo) {
        this.windowNo = windowNo;
        this.curTab = curTab;
        this.extraInfo = extraInfo;
        this.init();
    };

    /**
         *	This function will execute when user navigate  or refresh a record
         */
    surveyPanel.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID;
        this.selectedRow = selectedRow;
        this.update(recordID);

    };

    /**
     *	Fired When Size of panel Changed
     */
    surveyPanel.prototype.sizeChanged = function (width) {
        this.panelWidth = width;
    };


    /**
     *	Dispose Component
     */
    surveyPanel.prototype.dispose = function () {
        this.disposeComponent();
    };

    /*
        * Fully qualified class name
        */
    VIS.SurveyPanel = surveyPanel;

})();
