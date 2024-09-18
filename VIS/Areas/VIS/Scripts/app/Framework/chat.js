; (function (VIS, $) {
    //var $record_id, $chat_id, $table_id, $description, $chatclose;
    function Chat(record_id, chat_id, table_id, description, windowNo) {

        this.onClose = null; //outer apanel close function

        var $maindiv = $('<div class="vis-forms-container"></div>'); //layout
        var $div = $('<div class="vis-chatdetailouterwrap"></div>');
        var $inputChat = $('<div class="d-flex vis-chatBoxInputWrap"><textarea  id="input-chat-new" class="vis-chat-msgbox"  maxlength="500" /></textarea>');
        var $enterIcon = $('<button><i class="fa fa-paper-plane"></i></button>');
        //  var $buttonsdiv = $('<div style="overflow:auto"></div>');
        // var $btnOK = $('<button>');
        // var $btnCancel = $('<button>');
        $maindiv.append($inputChat).append($div);//.append($buttonsdiv); //ui
        this.windowNo = 0;

        var ch = null;
        if (record_id > 0 && table_id > 0) {
            this.prop = { WindowNo: windowNo, ChatID: chat_id, AD_Table_ID: table_id, Record_ID: record_id, Description: description, TrxName: null, ChatText: "", page: 0, pageSize: 10 };
            init($div, windowNo, this.prop);
        }
        var self = this;
        //createButtons();
        //events();


        $enterIcon.on(VIS.Events.onTouchStartOrClick, function (e) {
            triggerSave(e);
        });

        $inputChat.find('textarea').on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();  // Prevents the default action of creating a new line
                triggerSave(e);
            }
        });

        function triggerSave(e) {
            saveMsg(e);
            $inputChat.find('textarea').val('');
            self.refreshPanelData(self.record_ID, 0);
        }


        this.initializeComponent = function (windowNo, prop) {
            $inputChat.append($enterIcon);
            $maindiv.addClass('p-2');
            init($div, windowNo, prop);
        }

        this.getRoot = function () {
            return $maindiv;
        };

        this.show = function () {

            ch = new VIS.ChildDialog();
            ch.setContent($maindiv);
            ch.setHeight(450);
            ch.setWidth(655);
            ch.setTitle(VIS.Msg.getMsg("Chat"));
            ch.setModal(true);
            //Ok Button Click
            //  ch.onOkClick =

            //Disposing Everything on Close
            ch.onClose = function () {

                if (self.onClose) self.onClose();
                self.dispose();
            };
            ch.show();
            events();
            //ch.hidebuttons();
        };

        this.dispose = function () {
            this.prop = null;
            $div = null;
            $maindiv.remove();
            $maindiv = null;

            ch = null;
            self = null;

        };

        function createButtons() {
            //Ok Button
            //$btnOK.addClass("VIS_Pref_btn-2");
            //$btnOK.text(VIS.Msg.getMsg("OK"));
            //$btnOK.css({ "margin-top": "0px", "margin-bottom": "0px" });


            ////Cancel Button
            //$btnCancel.addClass("VIS_Pref_btn-2");
            //$btnCancel.text(VIS.Msg.getMsg("Cancel"));
            //$btnCancel.css({ "margin-top": "0px", "margin-bottom": "0px", "margin-left": "5px" });

            // $buttonsdiv.append($btnCancel).append($btnOK);
        }

        function events() {
            ch.onOkClick = function (e) {
                saveMsg(e);
                /* var text = $inputChat.val();
                 if ($.trim(text) == "" || text == "" || text == null) {
                     VIS.ADialog.info("EnterData");
                     if (e != undefined) {
                         e.preventDefault();
                     }
                     return false;
                 }
                 //  $btnOK.prop('disabled', true);
                 self.prop.ChatText = text;
                 VIS.dataContext.saveChat(self.prop);*/
                //ch.close();
                //if (self.onClose) self.onClose();
                //self.dispose();
            };

            ch.onCancelClick = function () {
                // ch.close();
                //if (self.onClose) self.onClose();
                //  self.dispose();
            };

        };

        function init($container, windowNo, prop) {

            VIS.dataContext.getChatRecords(prop, function (result) {

                var data = JSON.parse(result);
                //set retrieved chatid in local var
                self.prop.ChatID = data.chatId;
                var htmll = "";
                for (var chat in data.subChat) {

                    var d = new Date(data.subChat[chat].ChatDate);
                    var date = d.toLocaleString();

                    //     (Globalize.format(date, 'G', Globalize.cultureSelector));


                    var str = '   <div class="vis-chatboxwrap">';


                    if (VIS.Application.isRTL) {
                        str += '<div class="vis-chatimgwrap">';
                    }
                    else {
                        str += '<div class="vis-chatimgwrap">';
                    }

                    var ispic = false;


                    if (data.subChat[chat].AD_Image_ID == 0) {
                        //str += "<img  data-uID='" + data.subChat[chat].AD_User_ID + "'  src= '" + VIS.Application.contextUrl + "Areas/VIS/Images/Home/userAvatar.png'/>";
                        str += "<i class='fa fa-user' data-uID='" + data.subChat[chat].AD_User_ID + "'></i>";

                        ispic = true;
                    }
                    else {
                        for (var a in data.userimages) {
                            if (data.userimages[a].AD_Image_ID == data.subChat[chat].AD_Image_ID && data.userimages[a].UserImg != "NoRecordFound" && data.userimages[a].UserImg != "FileDoesn'tExist") {

                                str += '<img  data-uID="' + data.subChat[chat].AD_User_ID + '" src="' + VIS.Application.contextUrl + data.userimages[a].UserImg + '" />';
                                ispic = true;
                                break;
                            }

                        }
                    }


                    if (ispic == false) {
                        str += "<i class='fa fa-user' data-uID='" + data.subChat[chat].AD_User_ID + "'></i>";
                    }


                    str += '</div><div class="vis-chatdetailwrap"><div style="display: flex;">';

                    if (VIS.Application.isRTL) {
                        str += '<span data-uID="' + data.subChat[chat].AD_User_ID + '" class="vis-chatusername">';
                    }
                    else {
                        str += '<span data-uID="' + data.subChat[chat].AD_User_ID + '" class="vis-chatusername">';
                    }

                    if (VIS.Env.getCtx().getAD_User_ID() == data.subChat[chat].AD_User_ID) {
                        str += "Me";
                    }
                    else {
                        str += data.subChat[chat].UserName;
                    }

                    if (VIS.Application.isRTL) {
                        str += '</span><span style="font-size: .75rem; padding-right: 5px;">' + date + '</span></div><div  style="overflow:auto">';
                    }
                    else {
                        str += '</span><span style="font-size: .75rem; padding-right: 5px;">' + date + '</span></div><div>';
                    }

                    //+ '<textarea readonly style="width:640px">' + data[chat].ChatData + '</textarea>'
                    if (VIS.Application.isRTL) {
                        str += '<span style="font-size: .75rem;padding-right:5px">' + VIS.Utility.encodeText(data.subChat[chat].ChatData) + '</span></div>'
                    }
                    else {
                        str += '<span style="font-size: .75rem;padding-right:5px">' + VIS.Utility.encodeText(data.subChat[chat].ChatData) + '</span></div>'
                    }
                    str += '</div>'
                    str += '            </div>  ';

                    htmll += str;
                }
                $container.html(htmll);
            });


            $container.on("click", function (e) {
                if ($(e.target).is("span") || $(e.target).is("img")) {
                    var uID = $(e.target).data("uid");
                    if (uID != undefined && uID != null && uID > 0) {
                        var contactInfo = new VIS.ContactInfo(uID, windowNo);
                        contactInfo.show();
                        ch.close();
                    }

                }
            });

        };

        function saveMsg(e) {
            var text = $inputChat.find('textarea').val();
            if ($.trim(text) == "" || text == "" || text == null) {
                VIS.ADialog.info("EnterData");
                /* if (e != undefined) {
                     e.preventDefault();
                 }*/
                return false;
            }
            self.prop.ChatText = text;
            VIS.dataContext.saveChat(self.prop);
        }

    };

    /**
     *	Invoked when user click on panel icon
     */
    Chat.prototype.startPanel = function (windowNo, curTab, extraInfo) {
        this.windowNo = windowNo;
        this.curTab = curTab;
        this.extraInfo = extraInfo;

    };

    /**
         *	This function will execute when user navigate  or refresh a record
         */
    Chat.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID;
        this.selectedRow = selectedRow;
        this.prop = { WindowNo: this.windowNo, ChatID: this.curTab.getCM_ChatID(), AD_Table_ID: this.curTab.getAD_Table_ID(), Record_ID: recordID, Description: "", TrxName: null, ChatText: "", page: 0, pageSize: 10 };
        this.initializeComponent(this.windowNo, this.prop);

        // this.update(recordID);
    };

    /**
     *	Fired When Size of panel Changed
     */
    Chat.prototype.sizeChanged = function (width) {
        this.panelWidth = width;
    };


    /**
     *	Dispose Component
     */
    Chat.prototype.dispose = function () {
        this.disposeComponent();
    };


    VIS.Chat = Chat;

})(VIS, jQuery);