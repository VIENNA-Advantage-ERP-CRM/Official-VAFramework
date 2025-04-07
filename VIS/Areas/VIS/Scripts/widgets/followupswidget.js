/************************************************************
* Module Name    : VIS
* Purpose        : Assign Record To User Widget
* chronological  : Development
* Created Date   : 17 DECEMBER ,2024
* Created by     : (VAI061)
***********************************************************/
; VIS = window.VIS || {};

(function (VIS, $) {

    //Form Class function
    VIS.VISFollowUps = function ($thisObj) {
        /* Variables */
        this.frame;
        this.windowNo;
        var $self = this;
        var $root = $('<div class="vis-maindiv">');
        var widgetID = null;
        var $bsyDiv = null;


        /* Initialize the form design */
        this.Initalize = function (widgetId) {
            createBusyIndicator();
            if ((this.widgetInfo && this.widgetInfo.AD_UserHomeWidgetID)) {
                widgetID = this.widgetInfo.AD_UserHomeWidgetID;
                var followUpContainer = $('<div id="openModal">' +
                    '<i class="fa fa-wifi mt-3 mr-2" style="transform: rotate(45deg);font-size: 4.5rem;"></i>' +
                    '<div class="" style="font-size: 1.5rem;">Follow Ups</div>' +
                    '</div>');
                $root.append(followUpContainer);
                $root.find('#openModal').on('click', function () {
                    createFollowUpsModal();

                });
            } else {
                widgetID = widgetId;
                createFollowUpsModal();
            }
            setBusy(false);
        };

        /* Function used to open the FollowUp Modal */
        function createFollowUpsModal() {
            // Start building the dynamic HTML
            var fllupsScreen = $('<div id="fllupsScreen" class="vis-followuplayout">');

            // App FollowUps Heading
            var heading = $('<div class="row align-items-center vis-followUpsHeader" style="margin: 0px;padding-right: 0;">')
                .append('<h2 style="margin-right: 5px;margin-bottom: 0px;font-size: 1.125rem;display:inline-flex;"><span class="mr-2"><i class="fa fa-rss" aria-hidden="true"></i></span> FollowUps - <strong id="follupsCount" class="vis-followupsCount">0</strong></h2>')
                .append('<a id="hlnkFllupsRef" style="border: none;" href="javascript:void(0)" title="' + VIS.Msg.getMsg('Refresh') + '" class="vis-w-feedicon"><i class="vis vis-refresh"></i></a>');

            fllupsScreen.append(heading);

            // FollowUps Data
            var fllupsList = $('<div id="fllupsList" class="scrollerVertical vis-followups-list" style="width:96%;height: calc(100% - 70px);top:58px;overflow: auto;">');

            /* if (result.HomeFolloUpsInfo && result.HomeFolloUpsInfo.lstFollowups.length > 0) {
                 $.each(result.HomeFolloUpsInfo.lstFollowups, function (index, item) {
                     var divfllupsID = item.ChatID + '-' + item.RecordID + '-' + item.SubscriberID + '-' + item.TableID + '-' + item.WinID + '-' + item.TableName;
                     var divfllcmntID = 'divfllcmntdata' + item.ChatID;
                     var divfllvmID = 'divfllvm_' + item.ChatID;
                     var divfllvlID = 'divfllvl_' + item.ChatID;
                     var txtFllCmntID = 'txtFllCmnt' + item.ChatID;
                     var btnFllCmntID = 'btnFllCmnt' + item.ChatID;
 
                     var divFeedContainer = $('<div id="' + divfllupsID + '" data-fll="divfllups" class="vis-feedContainer">')
                         .append('<h3>' + item.WinName + ' :  ' + item.Identifier + '</h3>')
                         .append(
                             $('<div class="vis-feedTitleBar-buttons">').append(
                                 $('<ul>').append(
                                     $('<li>').append('<a href="javascript:void(0)" data-fll="azoomfllups" title="' + VIS.Msg.getMsg('ViewFollowups') + '" class="vis vis-find"></a>'),
                                     $('<li>').append('<a href="javascript:void(0)" data-fll="asubscribefllups" title="' + VIS.Msg.getMsg('UnsubscribeFollowups') + '" class="fa fa-rss"></a>')
                                 )
                             )
                         );
 
                     var divFeedDetails = $('<div id="' + divfllcmntID + '" data-fll="divfllupscmntdata" class="vis-feedDetails">')
                         .append(
                             $('<div class="vis-feedDetails-cmnt" data-fll="fll-cmnt">').append(
                                 item.AD_Image_ID === 0 ?
                                     $('<i class="fa fa-user" data-fll="UID" data-UID="' + item.AD_User_ID + '"></i>') :
                                     $.each(result.HomeFolloUpsInfo.lstUserImg, function (index, uitem) {
                                         if (uitem.AD_Image_ID === item.AD_Image_ID && uitem.UserImg !== 'NoRecordFound' && uitem.UserImg !== 'FileDoesn\'tExist') {
                                             return $('<div class="vis-feedimgwrap" data-fll="UID" data-UID="' + item.AD_User_ID + '"><img data-fll="UID" data-UID="' + item.AD_User_ID + '" class="userAvatar-Feeds" src="' + uitem.UserImg + '" alt="' + VIS.Msg.getMsg('UserImage') + '" title="' + VIS.Msg.getMsg('UserImage') + '" /></div>');
                                         } else {
                                             return $('<i data-fll="UID" data-UID="' + item.AD_User_ID + '" class="fa fa-user"></i>');
                                         }
                                     })
                             )
                         )

                         .append('<p>' +
                             (result.User_ID === item.AD_User_ID ? '<strong data-fll="UID" data-UID="' + item.AD_User_ID + '">' + VIS.Msg.getMsg('Me') + '</strong><br />' : '<strong data-fll="UID" data-UID="' + item.AD_User_ID + '">' + item.Name + '</strong><br />') +
                             item.ChatData +
                             '</p>')
                         .append('<p class="vis-feedDateTime">' + GetLocalDate(item.Cdate, result.Current_Ad_Lang) + '</p>');
 
                     var divViewMore = $('<a id="' + divfllvmID + '" data-fll="viewmorefllupscmnt" href="javascript:void(0)" class="vis-viewMoreComments"><span class="vis-feedIcons vis-icon-viewMoreComments"></span>' + VIS.Msg.getMsg('ViewMoreComments') + ' ..</a>');
                     var divViewLess = $('<a id="' + divfllvlID + '" data-fll="viewlessfllupscmnt" style="display:none;" href="javascript:void(0)" class="vis-viewMoreComments"><span class="vis-feedIcons vis-icon-viewMoreComments"></span>' + VIS.Msg.getMsg('ViewLessComments') + ' ..</a>');
 
                     var divFeedMessage = $('<div id="' + item.ChatID + '" class="vis-feedMessage">')
                         .append('<input id="' + txtFllCmntID + '" placeholder="' + VIS.Msg.getMsg('TypeMessage') + ' ...." data-fll="txtcmntfll" type="text" value="" />')
                         .append('<span id="' + btnFllCmntID + '" data-fll="btncmntfll" title="' + VIS.Msg.getMsg('PostMessage') + '" class="vis vis-sms"></span>');
 
                     // Append all parts
                     divFeedContainer.append(divFeedDetails, divViewMore, divViewLess, $('<div class="clearfix"></div>'), divFeedMessage);
                     fllupsList.append(divFeedContainer);
                 });
             } else {*/
            fllupsList.append('<p class="vis-not-subscribed" style="margin-top: 200px; text-align: center">' + VIS.Msg.getMsg('VIS_NotSubscribedYet') + '</p>');
            /*}*/

            // Loader
            var loader = $('<div id="divFllMainLoder" style="margin: 0;" class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            fllupsScreen.append(fllupsList, loader);

            w2popup.open({
                title: '',  // Empty title
                header: '', // Empty header (will hide the header)
                body: fllupsScreen.html() + '<button id="followupsCloseBtn' + widgetID + '" type="button" class="close vis-a-closeBtnCls" data-dismiss="modal" aria-label="Close"><span style="top: -2px;" aria-hidden="true">×</span></button>',
                width: 500,
                modal: false,  // Makes the popup modal (blocks interaction with the rest of the page)
                showMax: true,  // Optional: allows user to maximize the modal
                style: 'padding:12px 11px;  overflow: visible;', // This ensures centering and responsiveness
                onOpen: function () {
                    setTimeout(function () {
                        $('.w2ui-box1').parent('.w2ui-popup').css('overflow', 'visible');
                        $('.w2ui-box1').parent('.w2ui-popup').addClass('vis-custom-center-popup');
                        $('body').off('click', '#followupsCloseBtn' + widgetID);
                        $('body').on('click', '#followupsCloseBtn' + widgetID, function (e) {
                            $thisObj.unReadMsgCount();
                            w2popup.close();
                            $(this).remove();
                        });

                        $('#w2ui-lock').on('click', function () {
                            $('body').find('#followupsCloseBtn' + widgetID).trigger('click');
                            w2popup.close();
                        });
                        $('#w2ui-lock').on('contextmenu', function (event) {
                            $('body').find('#followupsCloseBtn' + widgetID).remove();
                            w2popup.close();
                        });
                        // Detect the Esc key press
                        $(document).on('keydown', function (e) {
                            if (e.key === 'Escape') {
                                w2popup.close();
                                $('body').find('#followupsCloseBtn' + widgetID).remove();
                            }
                        });
                    }, 1);
                }
            });

            /*########### Start FolloUps ###########*/
            var $FllUpsRefresh = $("#hlnkFllupsRef"), $FllupsCnt = $("#follupsCount"), $FllMainLoder = $("#divFllMainLoder");
            var FllCmntTxt = "", FllCmntBtn = "", FllupsID = "";
            var fllpcount = 0, fllPageSize = 10, fllPage = 1, fllLastPage = 0, fllcntpage = 0;
            var fllCmntPageSize = 10, fllCmntPage = 0, fllCmntLastPage = 0, fllCmntcntpage = 0;
            var fllChatID = 0, fllSubscriberID = 0, isFllScroll = false, isRef = false, isfllBusy = false;
            var FllUpsMain = $("#fllupsList");

            FllUpsMain.empty();
            getFllUps(fllPageSize, fllPage, true);

            //if (VIS.Application.isRTL) {
            //    $FllUpsRefresh.css("margin-right", "10px");
            //}
            //resize change event
            //$("#fllupsScreen").on("orientationchange", function (evnt) {
            //    alert("call fllups");
            //    $("#fllupsScreen").height(50);
            //});
            FllUpsMain.off('click');
            //Click events for follups
            FllUpsMain.on("click", function (evnt) {
                var datafll = $(evnt.target).data("fll");
                if (datafll === "viewmorefllupscmnt") {

                    FllupsID = evnt.target.parentNode.id;
                    fllChatID = 0, fllSubscriberID = 0;
                    fllChatID = evnt.target.parentNode.children[3].id;
                    getFllUpsCmnt(FllupsID, fllCmntPageSize, fllCmntPage);

                    //View Less comment
                    var targetID = evnt.target.id;
                    var arrtarget = targetID.split('_');
                    $("#divfllvl_" + arrtarget[1]).show();
                    $("#" + targetID).hide();
                }
                else if (datafll === "viewlessfllupscmnt") {
                    FllupsID = evnt.target.parentNode.id;
                    fllChatID = 0, fllSubscriberID = 0;
                    fllChatID = evnt.target.parentNode.children[3].id;

                    //View Less comment
                    var targetID = evnt.target.id;
                    var arrtarget = targetID.split('_');
                    $("#divfllvm_" + arrtarget[1]).show();
                    // $("#divfllcmntdata" + arrtarget[1]).empty();
                    var $divFllupsCmndData = $("#divfllcmntdata" + arrtarget[1]);
                    var divLastChild = $divFllupsCmndData.find("div:last-child");
                    $divFllupsCmndData.empty();
                    $divFllupsCmndData.html(divLastChild);
                    $("#" + targetID).hide();
                }
                else if (datafll === "azoomfllups") {
                    FllupsID = evnt.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                    var arr = FllupsID.toString().split('-');
                    var zoomQuery = new VIS.Query();
                    zoomQuery.addRestriction(arr[5] + "_ID", VIS.Query.prototype.EQUAL, VIS.Utility.Util.getValueOfInt(arr[1]));
                    VIS.viewManager.startWindow(arr[4], zoomQuery);
                    w2popup.close();
                    $('body').find('#followupsCloseBtn' + widgetID).remove();
                }

                else if (datafll === "asubscribefllups") {
                    FllupsID = evnt.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                    var arr = FllupsID.toString().split('-');
                    $.ajax({
                        url: VIS.Application.contextUrl + 'Subscribe/UnSubscribe',
                        type: 'GET',
                        dataType: 'Json',
                        data: { AD_Window_ID: arr[4], Record_ID: arr[1], AD_Table_ID: arr[3] },
                        success: function (result) {
                            if (result == false) {
                                alert(VIS.Msg.getMsg("UnSubscription Failed"));
                            }
                            else {
                                $("#" + FllupsID).animate({ "width": "100%", "height": "132px", "margin-top": "-132px" }, 700, function () {
                                    $("#" + FllupsID).remove();
                                });
                                var fcnt = $FllupsCnt.text();
                                $FllupsCnt.text(fcnt - 1);
                            }
                        }
                    });
                }
                else if (datafll === "btncmntfll") {
                    fllChatID = evnt.target.parentNode.id;
                    FllupsID = evnt.target.parentNode.parentNode.id;
                    var arr = FllupsID.toString().split('-');
                    FllupsData = $("#" + evnt.target.parentNode.parentNode.children[1].id);
                    FllCmntTxt = $("#" + evnt.target.previousElementSibling.id);
                    FllCmntBtn = $("#" + evnt.target.id);
                    var cmntTxt = $(FllCmntTxt).val();
                    var subscriberID = evnt.target.parentNode.getAttribute('subscriberid');
                    if (cmntTxt !== "") {
                        var cd = new Date();
                        var Cdate = Globalize.format(cd, "F", Globalize.cultureSelector);
                        SaveFllCmnt(cmntTxt, FllupsData, arr, subscriberID);
                        $(FllCmntTxt).val("");
                        $(FllCmntTxt).css('height', 'auto');
                    }
                }
                //else if (datafll == "UID") {
                //    var UID = $(evnt.target).data("uid");
                //    var windoNo = VIS.Env.getWindowNo();
                //    var contactInfo = new VIS.ContactInfo(UID, windoNo);
                //    contactInfo.show();
                //}
            });

            // Attach the 'input' event listener to the textarea only once
            $(document).on('input', '.vis-followups-list .vis-feedContainer textarea', function () {
                // Adjust height based on content
                var textareaValue = $(this).val().trim();
                if (textareaValue !== "") {
                    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
                    this.style.overflowY = this.scrollHeight > 150 ? 'auto' : 'hidden';
                }
                else {
                    this.style.height = '';
                    this.style.overflowY = '';
                }
            });

            FllUpsMain.off('keydown');
            //key down events for follups
            FllUpsMain.on("keydown", function (evnt) {
                var datafll = $(evnt.target).data("fll");
                if (datafll === "txtcmntfll") {
                    FllupsID = evnt.target.parentNode.parentNode.id;
                    var arr = FllupsID.toString().split('-');
                    fllChatID = evnt.target.parentNode.id;
                    FllupsData = $("#" + evnt.target.parentNode.parentNode.children[1].id);
                    FllCmntTxt = $("#" + evnt.target.id);
                    var cmntTxt = $(FllCmntTxt).val();
                    var subscriberID = evnt.target.parentNode.getAttribute('subscriberid');
                    if (cmntTxt !== "" && cmntTxt !== null) {
                        var code = evnt.charCode || evnt.keyCode;
                        if (code === 13) {
                            evnt.preventDefault(); // Prevent default Enter action
                            //  BindFllCmnt(uname, uimage, Cdate, cmntTxt, FllupsData);
                            if (evnt.altKey) {
                                var textarea = $(evnt.target)[0];
                                var cursorPos = textarea.selectionStart; // Get the current cursor position
                                var value = textarea.value; // Get the current value of the textarea

                                // Insert a newline at the cursor position and update the textarea value
                                textarea.value = value.substring(0, cursorPos) + "\r\n" + value.substring(cursorPos);

                                // Move the cursor to the position after the new line
                                textarea.setSelectionRange(cursorPos + 2, cursorPos + 2);
                            }
                            else {
                                var cmntTxt = $(FllCmntTxt).val(); // Get the current value of the textarea
                                // Check if there is text in the textarea before calling SaveFllCmnt
                                if (cmntTxt.trim() !== "") { // Use trim() to ignore leading/trailing spaces
                                    SaveFllCmnt(cmntTxt, FllupsData, arr, subscriberID);
                                    $(FllCmntTxt).val(""); // Clear the textarea after saving the comment
                                    $(FllCmntTxt).css('height', 'auto');
                                }
                            }
                        }
                    }
                }
            });

            var followUpScroll = true;
            //Bind Scroll evnt on Follups
            FllUpsMain.bind('scroll', function () {
                //var thisscroll = this;
                //clearTimeout($.data(this, 'scrollTimer'));//Clear scroll timer to wait next scroll event happens after 250 ms
                //$.data(this, 'scrollTimer', setTimeout(function () {
                if ($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight * 0.99) && followUpScroll) {//Condition true when 75 scroll is done
                    isRef = false;
                    followUpScroll = false;
                    fllLastPage = $FllupsCnt.text();

                    if (fllLastPage > fllPageSize) {
                        fllcntpage = fllPage * fllPageSize;
                        fllPage += 1;
                        if (fllcntpage <= fllLastPage) {
                            getFllUps(fllPageSize, fllPage, isRef);
                        }
                        else {
                            followUpScroll = true;
                            return;
                        }
                    }
                    followUpScroll = true;
                }
                //}, 200));
            });
            $FllUpsRefresh.off('click');
            //To refresh fllups
            $FllUpsRefresh.on("click", function () {
                if (isfllBusy == false) {
                    fllPageSize = 10, fllPage = 1;
                    fllpcount = $FllupsCnt.text();
                    isRef = true;
                    FllUpsMain.empty();
                    getFllUps(fllPageSize, fllPage, isRef);
                }

            });

            //To get Follups form Controller
            function getFllUps(fllPageSize, fllPage, isRef) {
                $FllMainLoder.show();
                isfllBusy = true;
                var url = VIS.Application.contextUrl + 'Home/GetJSONFllups';
                $.ajax({
                    url: url,
                    data: { "fllPageSize": fllPageSize, "fllPage": fllPage, "isRef": isRef },
                    type: 'GET',
                    cache: false,
                    datatype: 'json',
                    success: function (result) {
                        var data = JSON.parse(result);
                        var cnt = 0;
                        var str = "";
                        var uimg = "";
                        var dbdate = "";
                        if (data.lstFollowups.length > 0) {
                            if (isRef) {
                                $FllupsCnt.text(data.FllCnt)
                            }
                            for (var s in data.lstFollowups) {
                                var divfllupsID = data.lstFollowups[cnt].ChatID + "-" + data.lstFollowups[cnt].RecordID + "-" + data.lstFollowups[cnt].SubscriberID + "-" + data.lstFollowups[cnt].TableID + "-" + data.lstFollowups[cnt].WinID + "-" + data.lstFollowups[cnt].TableName;
                                if (data.lstFollowups[cnt].Cdate != null && data.lstFollowups[cnt].Cdate != "") {
                                    var cd = new Date(data.lstFollowups[cnt].Cdate);
                                    dbdate = Globalize.format(cd, "F", Globalize.cultureSelector);
                                }
                                if (data.lstFollowups[cnt].AD_Image_ID == 0) {
                                    uimg = "<i data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "' class='fa fa-user'></i>";
                                }
                                else {
                                    for (var a in data.lstUserImg) {
                                        if (data.lstUserImg[a].AD_Image_ID == data.lstFollowups[cnt].AD_Image_ID) {
                                            if (data.lstUserImg[a].UserImg != "NoRecordFound" && data.lstUserImg[a].UserImg != "FileDoesn'tExist" && data.lstUserImg[a].UserImg != null) {
                                                uimg = "<div class='vis-feedimgwrap'  data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'><img data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "' alt='" + VIS.Msg.getMsg("UserImage") + "' title='" + VIS.Msg.getMsg("UserImage") + "' class='userAvatar-Feeds' src='" + VIS.Application.contextUrl + data.lstUserImg[a].UserImg + "?" + new Date($.now()).getSeconds() + "'/></div>";
                                            }
                                            else {
                                                uimg = "<i data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "' class='fa fa-user'></i>";
                                            }
                                            break;
                                        }
                                    }
                                }

                                str += "<div id=" + divfllupsID + " data-fll='divfllups' style='background: white;margin-right: 2px;' class='vis-feedContainer'>"
                                    + "<div class='vis-feedTitleBar'>"
                                    + "<h3> " + data.lstFollowups[cnt].WinName + ' : ' + data.lstFollowups[cnt].Identifier + " </h3>"
                                    + "<div class='vis-feedTitleBar-buttons'>"
                                    + "<ul><li> <a href='javascript:void(0)'  data-fll='azoomfllups'  title='" + VIS.Msg.getMsg("ViewFollowups") + "'  class='vis vis-find'></a></li>"
                                    + "<li> <a href='javascript:void(0)'  data-fll='asubscribefllups'  title='" + VIS.Msg.getMsg("UnsubscribeFollowups") + "' class='fa fa-rss'></a></li></ul>"
                                    + " </div></div>"

                                    + "<div id='divfllcmntdata" + data.lstFollowups[cnt].ChatID + "' data-fll='fll-cmnt' class='vis-feedDetails vis-feedDetails-follup'>"
                                    + "<div class='vis-feedDetails-cmnt vis-feedDetails-cmnt-followup' data-fll='fll-cmnt'>"
                                    + uimg
                                    + "<p class='vis-comment-desc'>"
                                    + " <strong data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'>";
                                if (data.lstFollowups[cnt].AD_User_ID == VIS.Env.getCtx().getAD_User_ID()) {
                                    str += VIS.Msg.getMsg("Me") + " </strong> <br />"
                                }
                                else {
                                    str += data.lstFollowups[cnt].Name + "</strong> <br />"
                                }

                                str += VIS.Utility.encodeText(data.lstFollowups[cnt].ChatData)
                                    + "</p>"
                                    + "<p class='vis-feedDateTime'>" + dbdate + "</p>"
                                    + "</div></div>"

                                    + "<a id='divfllvm_" + data.lstFollowups[cnt].ChatID + "'  data-fll='viewmorefllupscmnt' href='javascript:void(0)' class='vis-viewMoreComments'><span class='vis-feedIcons vis-icon-viewMoreComments'></span>" + VIS.Msg.getMsg("ViewMoreComments") + "...</a>"
                                    + "<a id='divfllvl_" + data.lstFollowups[cnt].ChatID + "' style='display:none;'  data-fll='viewlessfllupscmnt' href='javascript:void(0)' class='vis-viewMoreComments'><span class='vis-feedIcons vis-icon-viewMoreComments'></span>" + VIS.Msg.getMsg("ViewLessComments") + "...</a>"
                                    + " <div class='clearfix'></div> "

                                    + "<div subscriberId = " + data.lstFollowups[cnt].SubscriberID + " id=" + data.lstFollowups[cnt].ChatID + " class='vis-feedMessage'>"
                                    + " <textarea class='w-100 vis-txtFllCmnt' id='txtFllCmnt" + data.lstFollowups[cnt].ChatID + "' data-fll='txtcmntfll' placeholder='" + VIS.Msg.getMsg('TypeMessage') + "' rows='1' /></textarea>"
                                    + " <span  id='btnFllCmnt" + data.lstFollowups[cnt].ChatID + "' data-fll='btncmntfll' title='" + VIS.Msg.getMsg('PostMessage') + "'  class='vis vis-sms' ></span>"
                                    + " <div class='clearfix'></div> "
                                    + "</div></div> ";
                                cnt++;
                            }
                            FllUpsMain.append(str);
                        }
                        else {
                            if (isFllScroll == false) {
                                if (VIS.Application.isRTL) {
                                    FllUpsMain.append("<p style='margin-top: 200px;text-align: center '>" + VIS.Msg.getMsg("VIS_NotSubscribedYet") + "</p>");
                                }
                                else {
                                    FllUpsMain.append("<p style='margin-top: 200px;text-align: center '>" + VIS.Msg.getMsg("VIS_NotSubscribedYet") + "</p>");
                                }
                            }
                        }
                        isfllBusy = false;
                        followUpScroll = true;
                        $FllMainLoder.hide();
                    },
                    error: function () {
                        followUpScroll = true;
                    }
                });
            }
            //get fllups comment from Controller
            function getFllUpsCmnt(FllupsID, fllCmntPageSize, fllCmntPage) {
                var url = VIS.Application.contextUrl + 'Home/GetJSONFllupsCmnt/';
                $.ajax({
                    url: url,
                    data: { FllupsID: FllupsID, fllCmntPageSize: fllCmntPageSize, fllCmntPage: fllCmntPage },
                    type: 'GET',
                    cache: false,
                    datatype: 'json',
                    success: function (result) {
                        var data = JSON.parse(result);
                        var cnt = 0;
                        var str = "";
                        var dbdate = "";
                        var ChatID = data.lstFollowups[cnt].ChatID;
                        var uimg = "";
                        for (var r in data.lstFollowups) {

                            if (data.lstFollowups[r].Cdate != null && data.lstFollowups[r].Cdate != "") {
                                var cd = new Date(data.lstFollowups[r].Cdate);
                                dbdate = Globalize.format(cd, "F", Globalize.cultureSelector);
                            }
                            if (data.lstFollowups[cnt].AD_Image_ID == 0) {
                                uimg = "<i data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "' class='fa fa-user'></i>"
                            }
                            else {
                                for (var b in data.lstUserImg) {
                                    if (data.lstUserImg[b].AD_Image_ID == data.lstFollowups[cnt].AD_Image_ID) {
                                        if (data.lstUserImg[b].UserImg != "NoRecordFound" && data.lstUserImg[b].UserImg != "FileDoesn'tExist" && data.lstUserImg[b].UserImg != null) {
                                            uimg = "<div class='vis-feedimgwrap' data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'><img  alt='" + VIS.Msg.getMsg("UserImage") + "'  title='" + VIS.Msg.getMsg("UserImage") + "'  class='userAvatar-Feeds' src='" + data.lstUserImg[b].UserImg + "?" + new Date($.now()).getSeconds() + "'/></div>"
                                        }
                                        else {
                                            //uimg = "<img  style='cursor:pointer;'  data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'  alt='" + VIS.Msg.getMsg("UserImage") + "'  title='" + VIS.Msg.getMsg("UserImage") + "'  class='userAvatar-Feeds' src='" + VIS.Application.contextUrl + "Areas/VIS/Images/home/defaultUser46X46.png'/>"

                                            uimg = "<i  data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'    class='fa fa-user'></i>"

                                        }
                                        break;
                                    }
                                }
                            }
                            str += "<div class='vis-feedDetails-cmnt vis-feedDetails-cmnt-followup'  data-fll='fll-cmnt'>"
                                + uimg
                                + "<p class='vis-comment-desc'>"
                                + " <strong  data-fll='UID' data-UID='" + data.lstFollowups[cnt].AD_User_ID + "'>";

                            if (data.lstFollowups[cnt].AD_User_ID == VIS.Env.getCtx().getAD_User_ID()) {
                                str += VIS.Msg.getMsg("Me") + " </strong> <br />"
                            }
                            else {
                                str += data.lstFollowups[cnt].Name + "</strong> <br />"
                            }

                            str += VIS.Utility.encodeText(data.lstFollowups[cnt].ChatData)
                                + "</p>"
                                + "<p class='vis-feedDateTime'>" + dbdate + "</p></div>";
                            cnt++;
                        }

                        var FllupsData = $("#divfllcmntdata" + ChatID)
                        // $("#divfllvm" + ChatID).hide();
                        FllupsData.html("");
                        FllupsData.append(str);
                        //FllUpsMain.animate({ scrollTop: 1000 }, '50');                
                    },
                    error: function () {
                        console.log("Error");
                    }
                });
            }


            //Save follups Comment in DB
            function SaveFllCmnt(cmntTxt, FllupsData, arr, subscriberID) {
                var url = VIS.Application.contextUrl + 'Home/PostFllupsCmnt/';
                $.ajax({
                    url: url,
                    data: { fllChatID: fllChatID, fllSubscriberID: subscriberID, cmntTxt: cmntTxt, recordId: arr[1], tableId: arr[3], windowId: arr[4] },
                    type: 'POST',
                    cache: false,
                    datatype: 'json',
                    success: function (data) {
                        var cd = new Date();
                        var cdate = Globalize.format(cd, "F", Globalize.cultureSelector);
                        var user_image = data;
                        var name = VIS.context.getContext("##AD_User_Name");
                        var uimg = "";
                        if (user_image !== null) {

                            if (user_image != "NoRecordFound" && user_image != "FileDoesn'tExist") {
                                uimg = "<div class='vis-feedimgwrap'  data-fll='UID' data-UID='" + VIS.Env.getCtx().getAD_User_ID() + "' ><img data-fll='UID' data-UID='" + VIS.Env.getCtx().getAD_User_ID() + "'  alt='" + VIS.Msg.getMsg("UserImage") + "'  class='userAvatar-Feeds' src='" + user_image + "?" + new Date($.now()).getSeconds() + "' /></div>"
                            }
                            else {
                                uimg = "<i data-fll='UID' data-UID='" + VIS.Env.getCtx().getAD_User_ID() + "' class='fa fa-user'></i>"
                            }
                        }
                        else {
                            uimg = "<i data-fll='UID' data-UID='" + VIS.Env.getCtx().getAD_User_ID() + "' class='fa fa-user'></i>"
                        }
                        var str = "<div class='vis-feedDetails-cmnt vis-feedDetails-cmnt-followup' data-fll='fll-cmnt'>"
                            + uimg
                            + "<p class='vis-comment-desc'>"
                            + " <strong  data-fll='UID' data-UID='" + VIS.Env.getCtx().getAD_User_ID() + "'>" + VIS.Msg.getMsg("Me") + "</strong><br />"
                            + VIS.Utility.encodeText(cmntTxt)
                            + "</p>"
                            + "<p class='vis-feedDateTime'>" + cdate + "</p></div>";
                        FllupsData.append(str);

                    },
                    error: function () {
                        console.log("Error");
                    }
                });
            }

            /*########### End Folloups ########### */
        }



        function GetLocalDate(dateString, locale) {
            var date = new Date(dateString); // Create a Date object from the date string

            // Check if locale is provided, otherwise fall back to the default locale
            var options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };

            // If the locale isn't passed, you can use 'en-US' or any default locale
            return date.toLocaleDateString(locale || 'en-US', options);
        }


        /* busy Indicator*/
        function createBusyIndicator() {
            $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis_widgetloader"></i></div></div>');
            $bsyDiv.css({
                "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
            });
            setBusy(true);
            $root.append($bsyDiv);
        };

        /**
         * Function used to check whether the Busy indicator is visible or not
         * @param {any} isBusy
         */
        function setBusy(isBusy) {
            if (isBusy) {
                $bsyDiv[0].style.visibility = "visible";
            }
            else {
                $bsyDiv[0].style.visibility = "hidden";
            }
        };


        /*this function is used to refresh the design and data of the widget*/
        this.refreshWidget = function () {
            setBusy(true);
            $root.find('#Vis_Widget-container_' + widgetID).remove();
            $self.Initalize();
        };

        /* get design from root */
        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            $('body').find('#followupsCloseBtn' + widgetID).remove();
            $root.remove();
        };
    }

    /* init method called on loading a form */
    VIS.VISFollowUps.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.VISFollowUps.prototype.refreshWidget = function () {
        this.refreshWidget();
    };

    VIS.VISFollowUps.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };
})(VIS, jQuery);