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


        var scrollDiv = $div;
        
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
            showBusy(true);
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
                //if (e.altKey) {
                //    this.value += "\r\n";
                if (e.altKey || e.shiftKey) {
                    e.preventDefault(); // Prevent default newline behavior
                    const textarea = this;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    // Insert \r\n at the cursor position
                    textarea.value = value.substring(0, start) + "\r\n" + value.substring(end);
                    // Move cursor to just after the inserted newline
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                }
                else {
                    showBusy(true);
                    e.preventDefault();
                    triggerSave(e);
                }
            }
        });

        setTimeout(function () {
            function onScroll() {
                if (scrollDiv != null) {
                    if (scrollDiv.height() + scrollDiv.scrollTop() >= scrollDiv[0].scrollHeight - 1) {
                        if (self.prop) {
                            self.prop.pageSize += 10;
                            showBusy(true);
                            init($div, self.windowNo, self.prop);
                        }
                    }
                }
            }
            //}, 200); // adjust the wait time as needed
            if (scrollDiv == null)
                scrollDiv = $maindiv.parent(); //reset scroll div to main div
            scrollDiv.on('scroll', onScroll);
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
            showBusy(true);
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
            VIS.dataContext.saveChatAsync(self.prop, function (saved) {
                if (!saved) {
                    showBusy(false);
                    return;
                };

                $textArea.find('#chatBox_textArea').val('');
                $textArea.find('#chatBox_textArea').css('height', 'auto');
                self.refreshPanelData(self.record_ID, 0);
            });
        }


        this.initializeComponent = function (windowNo, prop) {
            showBusy(true);
            $maindiv.parent().scrollTop(0);
            $maindiv.append($showMoreIcon);
            /*$maindiv.addClass('p-2');*/
            //isBottomTapPanel();
            if (this.isBtmTapPanel) {
                prop.pageSize = 4;
            }
            init($div, windowNo, prop);
        }

        this.getRoot = function () {
            return $maindiv;
        };

        this.show = function () {

            scrollDiv = $div; //reset scroll div to main div

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


                    //var str = '   <div style="border:none;" class="vis-chatboxwrap">';
                    var str = '   <div style="border:none;" class="vis-chatboxwrap" id="' + data.subChat[chat].ChatEntry_ID + '">';

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

                    str += '</div><div class="vis-chatdetailwrap"><div style="display: flex; position:relative;">';


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
                        if (data.isDelete == 'Y') {
                            //str += '</span></div><div class="vis-chat-textwrap" style="overflow:auto">';
                            str += '<span class="vis vis-delete vis_del_chat vis-chat-delete-icon" style="left:6%;" data-chatid="' + data.subChat[chat].ChatEntry_ID + '" title="Delete Chat"></span>';
                        }
                        str += '<span class="vis vis-pencil vis_edit_chat vis-chat-edit-icon" style="left:1%;" data-chatid="' + data.subChat[chat].ChatEntry_ID + '" title="Edit Chat"></span>';
                    }
                    else {
                        if (data.isDelete == 'Y') {
                        //str += '</span></div><div class="vis-chat-textwrap">';
                            str += '<span class="vis vis-delete vis_del_chat vis-chat-delete-icon" style="right:6%;" data-chatid="' + data.subChat[chat].ChatEntry_ID + '" title="Delete Chat"></span>';
                        }
                        str += '<span class="vis vis-pencil vis_edit_chat vis-chat-edit-icon" style="right:1%;" data-chatid="' + data.subChat[chat].ChatEntry_ID + '" title="Edit Chat"></span>';
                    }

                    if (VIS.Application.isRTL) {
                        // str += '</span></div><div class="vis-chat-textwrap" style="overflow:auto; background: rgba(var(--v-c-primary), 1; border-radius:5px;">';
                        str += '</span></div><div class="vis-chat-textwrap" style="overflow:auto; background: background: rgb(0 152 247 / 6%); border-radius:7px;">';
                    }
                    else {
                        str += '</span></div><div class="vis-chat-textwrap" style="background: rgb(0 152 247 / 6%); border-radius:7px;">';
                    }

                    //+ '<textarea readonly style="width:640px">' + data[chat].ChatData + '</textarea>'
                    if (VIS.Application.isRTL) {
                        str += '<span class="vis-chat-msg" style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
                        //str += '<span style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
                    }
                    else {
                        //str += '<span style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
                        str += '<span class="vis-chat-msg" style="font-size: .75rem;padding-right:5px;white-space: pre-line;">' + VIS.Utility.encodeText(data.subChat[chat].ChatData);
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

            $container.on("click", ".vis_edit_chat", function () {
                var $chatBox = $(this).closest(".vis-chatboxwrap");
                var chatId = $(this).data("chatid");
                var $chatTextSpan = $chatBox.find(".vis-chat-msg");
                var $editIcon = $chatBox.find(".vis_edit_chat");
                var $delIcon = $chatBox.find(".vis_del_chat");
                var $sendIcon = null;
                var $undoIcon = null;
                $editIcon.hide();          // Hide the pencil icon
                $delIcon.hide();        // Show the ignore icon
                var originalText = $chatTextSpan.text();
                // Create wrapper to simulate icon inside input
                /* var $wrapper = $('<div class="vis-chat-edit-wrapper" style="position: relative; width: 90%; display: inline-block;"></div>');
                 var $input = $('<input type="text" class="vis-chat-edit-input" style="width: 100%; padding: 5px 60px 5px 10px; border-radius: 10px; border: 1px solid #ccc;">');
                 var $sendIcon = $('<i class="fa fa-check vis-chat-send-icon" title="Update" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #007bff; font-size:20px;"></i>');
                 var $undoIcon = $('<i class="fa fa-times vis-chat-send-icon" title="Undo" style="position: absolute; right: 35px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #007bff; font-size:20px;"></i>');
 */
                var $wrapper = $('<div class="vis-chat-edit-wrapper"></div>');
                var $input = $('<input type="text" class="vis-chat-edit-input">');
                if (VIS.Application.isRTL) {
                    $sendIcon = $('<i class="fa fa-check vis-chat-send-icon vis-chat-send-update" style="left: 35px;" title="Update"></i>');
                    $undoIcon = $('<i class="fa fa-times vis-chat-send-icon vis-chat-send-undo" style="left: 10px;" title="Undo"></i>');
                }
                else {
                    $sendIcon = $('<i class="fa fa-check vis-chat-send-icon vis-chat-send-update" style=" right: 10px;" title="Update"></i>');
                    $undoIcon = $('<i class="fa fa-times vis-chat-send-icon vis-chat-send-undo" style="right: 35px;" title="Undo"></i>');
                }
                $wrapper.append($input, $undoIcon, $sendIcon);
                $input.val(originalText);
                $wrapper.append($input).append($sendIcon).append($undoIcon);
                $chatTextSpan.replaceWith($wrapper);
                $input.focus();
                function sendUpdate() {
                    var newText = $input.val().trim();
                    if (newText.length === 0) return;
                    showBusy(true);
                    // AJAX to update chat
                    $.ajax({
                        url: VIS.Application.contextUrl + "Chat/EditChatEntry",
                        type: "POST",
                        data: { chatID: chatId, content: newText },
                        success: function (response) {
                            if (response.success) {
                                var $newSpan = $('<span class="vis-chat-msg" style="font-size: .75rem;padding-right:5px;white-space: pre-line;">').text(newText);
                                $wrapper.replaceWith($newSpan);
                                showBusy(false);
                                // message = VIS.Msg.getMsg("VIS_Chatupdated");
                                //VIS.ADialog.info("", "", message);
                            } else {
                                showBusy(false);
                                VIS.ADialog.error(response.message || "Update failed.");
                            }
                            /* $editIcon.show();   // Restore pencil icon
                             $ignoreIcon.hide(); // Hide ignore icon*/
                        },
                        error: function () {
                            showBusy(false);
                            VIS.ADialog.error("Something went wrong.");
                            /*  $editIcon.show();   // Restore pencil icon
                              $ignoreIcon.hide(); // Hide ignore icon*/
                        }
                    });
                }
                // Handle Enter key
                $input.on("keydown", function (e) {
                    if (e.key === "Enter") {
                        sendUpdate();
                        $editIcon.show();
                        $delIcon.show();
                    }
                });
                // Handle click on paper plane icon
                $sendIcon.on("click", function () {
                    sendUpdate();
                    $editIcon.show();
                    $delIcon.show();
                });
                $undoIcon.off("click").on("click", function () {
                    var $originalSpan = $('<span class="vis-chat-msg" style="font-size: .75rem;padding-right:5px;white-space: pre-line;">').text(originalText);
                    $wrapper.replaceWith($originalSpan);
                    $editIcon.show();
                    $delIcon.show();
                });
            });

            $container.off("click", ".vis_del_chat").on("click", ".vis_del_chat", function (e) {
                e.stopPropagation(); // Prevent other click handlers
                var chatId = $(this).data("chatid");
                if (!chatId) return;
                // Show confirmation dialog
                VIS.ADialog.confirm("DeleteChat?", true, "", "Confirm", function (result) {
                    if (result) {
                        showBusy(true);
                        $.ajax({
                            url: VIS.Application.contextUrl + "Chat/DeleteChatEntry",
                            type: "POST",
                            data: { chatID: chatId },
                            success: function (response) {
                                showBusy(false);
                                if (response.success) {
                                    $("#" + chatId).remove();
                                    //  var message = VIS.Msg.getMsg("VIS_Chatdeleted");
                                    //    VIS.ADialog.info("", "", message);
                                } else {
                                    VIS.ADialog.error(response.message || "Failed to delete chat.");
                                }
                            },
                            error: function (xhr, status, error) {
                                showBusy(false);
                                VIS.ADialog.error("Error: " + error);
                            }
                        });
                    }
                });
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
        var self = this;
        //$.ajax({
        //    url: VIS.Application.contextUrl + "Chat/IsBottomTabPanel",
        //    async: false,
        //    data: {
        //        tabID: VIS.context.getContextAsInt(self.windowNo, "0|AD_Tab_ID"),
        //    },
        //    success: function (data) {
        //        self.isBtmTapPanel = VIS.Utility.Util.getValueOfBoolean(data);;
        //    }
        //});
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