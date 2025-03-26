; (function (VIS, $) {
    //var $record_id, $chat_id, $table_id, $description, $chatclose;
    function Chat(record_id, chat_id, table_id, description, windowNo, windowId) {

        this.onClose = null; //outer apanel close function

        var $maindiv = $('<div class="vis-forms-container vis-chat-container"></div>'); //layout
        var $div = $('<div class="vis-chatdetailouterwrap"></div>');
        var $inputChat = $('<div class="d-flex flex-column vis-chatBoxInputWrap ">');
        var $textArea = $('<div><textarea  id="chatBox_textArea" rows="1" class="vis-chat-msgbox" /></textarea></div>');
        var $sendIconDiv = $('<div>');
        var $sendIconButton = $('<button id="chatBox_sendicon" class="pull-right"><i title="' + VIS.Msg.getMsg("Send") + '"class="fa fa-paper-plane"></i></button>');
        var $showMoreIcon = $('<div class="vis-chat-showmore" style="display:none"><a class="vis-chat-arrowdown">' + VIS.Msg.getMsg("ShowMore") + '</a></div>');
        var $bsyDiv = $('<div id="chatBusyDiv" style="width:90%; display:none;" class="vis-busyindicatorouterwrap"><div id="busyDiv2Id"'
            + ' class= "vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div ></div> ');
        //  var $buttonsdiv = $('<div style="overflow:auto"></div>');
        // var $btnOK = $('<button>');
        // var $btnCancel = $('<button>');
        $sendIconDiv.append($sendIconButton);
        $inputChat.append($textArea).append($sendIconDiv);
        $maindiv.append($inputChat).append($div).append($bsyDiv);//.append($buttonsdiv); //ui
        this.windowNo = windowNo;
        this.pageSize = 10;
        this.isBtmTapPanel = false;
        this.record_ID = record_id;
        this.AD_Table_ID = table_id;
        this.AD_Window_ID = windowId;
        this.Description = description;
        this.ChatID = chat_id;
        // this.isLoading = false;


        function showBusy(show) {
            if (show) {
                $maindiv.find("#chatBusyDiv").show();
            }
            else {
                $maindiv.find("#chatBusyDiv").hide();
            }
        };

        var ch = null;
        if (record_id > 0 && table_id > 0) {
            this.prop = { WindowNo: windowNo, ChatID: chat_id, AD_Table_ID: table_id, Record_ID: record_id, Description: description, TrxName: null, ChatText: "", page: 1, pageSize: this.pageSize, AD_Window_ID: this.AD_Window_ID };
            init($div, windowNo, this.prop);
        }
        var self = this;
        //createButtons();
        //events();


        $sendIconButton.on(VIS.Events.onTouchStartOrClick, function (e) {
            triggerSave(e);
        });


        $showMoreIcon.on(VIS.Events.onTouchStartOrClick, function (e) {
            if (self.prop != null) {
                showBusy(true);
                self.prop.pageSize += 4;
                init($div, self.windowNo, self.prop);
            }
        });

        $textArea.find('#chatBox_textArea').on('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
            this.style.overflowY = this.scrollHeight > 150 ? 'auto' : 'hidden';
        });

        $textArea.find('#chatBox_textArea').on('keydown', function (e) {
            if (e.keyCode === 13) {
                if (e.altKey) {
                    this.value += "\r\n";
                }
                else {
                    showBusy(true);
                    e.preventDefault();
                    triggerSave(e);
                }
            }
        });

        setTimeout(function () {
            const onScroll = throttle(function () {
                if ($maindiv != null) {
                    if ($maindiv.parent().scrollTop() + $maindiv.parent().height() >= $maindiv.height() - 50) {
                        if (self.prop) {
                            self.prop.pageSize += 10;
                            showBusy(true);
                            init($div, self.windowNo, self.prop);
                        }
                    }
                }
            }, 200); // adjust the wait time as needed

            $maindiv.parent().on('scroll', onScroll);
        }, 100);

        function throttle(fn, wait) {
            let lastTime = 0;
            return function () {
                const now = new Date().getTime();
                if (now - lastTime >= wait) {
                    lastTime = now;
                    return fn.apply(this, arguments);
                }
            };
        }


        function triggerSave(e) {
            saveMsg(e);
            $textArea.find('#chatBox_textArea').val('');
            $textArea.find('#chatBox_textArea').css('height', 'auto');
            self.refreshPanelData(self.record_ID, 0);
        }


        this.initializeComponent = function (windowNo, prop) {
            showBusy(true);
            $maindiv.parent().scrollTop(0);
            $maindiv.append($showMoreIcon);
            /*$maindiv.addClass('p-2');*/
            isBottomTapPanel();
            if (this.isBtmTapPanel) {
                prop.pageSize = 4;
            }
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
            // events();
            ch.hidebuttons();
        };

        this.dispose = function () {
            this.prop = null;
            $div = null;
            $maindiv.remove();
            $maindiv = null;

            ch = null;
            self = null;


        };

        function isBottomTapPanel() {
            $.ajax({
                url: VIS.Application.contextUrl + "Chat/IsBottomTabPanel",
                async: false,
                data: {
                    tabID: VIS.context.getContextAsInt(self.windowNo, "0|AD_Tab_ID"),
                },
                success: function (data) {
                    self.isBtmTapPanel = VIS.Utility.Util.getValueOfBoolean(data);;
                }
            });
        }

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
            //if (self.isLoading) return; // Prevent new fetch if already loading
            //self.isLoading = true;
            showBusy(true);
            VIS.dataContext.getChatRecords(prop, function (result) {
                //self.isLoading = false;
                var data = JSON.parse(result);
                //set retrieved chatid in local var
                self.prop.ChatID = data.chatId;
                if (self.isBtmTapPanel && data.subChat.length >= 4 && data.subChat.length != data.totalCount) {
                    $showMoreIcon.show();
                } else {
                    $showMoreIcon.hide();
                }
                var htmll = "";
                for (var chat in data.subChat) {

                    var d = new Date(data.subChat[chat].ChatDate);
                    var date = d.toLocaleString();

                    //     (Globalize.format(date, 'G', Globalize.cultureSelector));


                    var str = '   <div style="border:none;" class="vis-chatboxwrap">';

                    /*if (VIS.Application.isRTL) {
                        str += '<div style="border-radius: 1.75rem; min-width: 48px;" class="vis-chatimgwrap">';
                    }
                    else {
                        str += '<div style="border-radius: 1.75rem; min-width: 48px;" class="vis-chatimgwrap">';
                    }*/

                    if (!self.isBtmTapPanel) {
                        str += '<div style="border-radius: 1.75rem; width:38px;height:38px; min-width: 38px;" class="vis-chatimgwrap">';
                    } else {
                        str += '<div style="border-radius: 1.75rem;  min-width: 48px;" class="vis-chatimgwrap">';
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
                        str += '</span></div><div class="vis-chat-textwrap" style="overflow:auto">';
                    }
                    else {
                        str += '</span></div><div class="vis-chat-textwrap">';
                    }

                    //+ '<textarea readonly style="width:640px">' + data[chat].ChatData + '</textarea>'
                    if (VIS.Application.isRTL) {
                        str += '<span style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
                    }
                    else {
                        str += '<span style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
                    }

                    if (VIS.Application.isRTL) {
                        str += '</span><span class="vis-chat-date">' + date + '</span></div>';
                    }
                    else {
                        str += '</span><span class="vis-chat-date">' + date + '</span></div>';
                    }

                    str += '</div>'
                    str += '            </div>  ';

                    htmll += str;
                }
                $container.html(htmll);
                showBusy(false);
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
            var text = $textArea.find('#chatBox_textArea').val();
            if ($.trim(text) == "" || text == "" || text == null) {
                VIS.ADialog.info("EnterData");
                /* if (e != undefined) {
                     e.preventDefault();
                 }*/
                showBusy(false);
                return false;
            }
            self.prop.ChatText = text;
            VIS.dataContext.saveChat(self.prop);
            /*if (ch != null) {
                ch.close();
            }*/
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
        if (recordID > 0) {
            this.record_ID = recordID;
            this.selectedRow = selectedRow;
            if (this.curTab) {
                this.prop = { WindowNo: this.windowNo, ChatID: this.curTab.getCM_ChatID(), AD_Table_ID: this.curTab.getAD_Table_ID(), Record_ID: recordID, Description: "", TrxName: null, ChatText: "", page: 1, pageSize: this.pageSize, AD_Window_ID: this.AD_Window_ID };
            } else {
                this.prop = { WindowNo: this.windowNo, ChatID: this.ChatID, AD_Table_ID: this.AD_Table_ID, Record_ID: recordID, Description: "", TrxName: null, ChatText: "", page: 1, pageSize: this.pageSize, AD_Window_ID: this.AD_Window_ID };
            }
            this.initializeComponent(this.windowNo, this.prop);
        }
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