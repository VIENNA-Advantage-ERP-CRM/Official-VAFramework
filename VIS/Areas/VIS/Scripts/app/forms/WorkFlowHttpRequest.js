; (function (VIS, $) {

    var txtURL = null;
    var txtURL = null;
    var txtMethod = null;
    var lblHeader = null;
    var lblQueryString = null;
    var headerDiv = null;
    var queryStringDiv = null;
    var txtBodyType = null;
    var lblBottomMsg = $('<label></label>');
    var bsyDiv = null;
    var HttpRequestDialog = null;
    var okBtn, closeBtn, headerCtrl, queryStringCtrl;
    this.frame;
    this.windowNo;
    this.WidgetID;
    var self = this;
    var columnList = $();
    this.records = [];
    var parentDiv1;

    //*************Add New Product by using Popup box  ******************//

    function httpRequest(windowNo) {
        columnList = $();
        var root = $('<div>');
        bsyDiv = $("<div class='vis-apanel-busy'>");
        bsyDiv.css({
            "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
        });
        root.append(bsyDiv);
        var mainDiv = $('<div class="vis-wf-httprequest-container">');
        mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="URL_' + windowNo + '"></div></div>'
            + '</div>');
        mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="Method_' + windowNo + '"></div></div>'
            + '</div>');
        mainDiv.append('<div id="HeaderDiv_' + windowNo + '"><div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="Headers_' + windowNo + '"></div></div>'
            + '</div></div>');
        mainDiv.append('<div id="QueryStringDiv_' + windowNo + '"><div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="QueryString_' + windowNo + '"></div></div>'
            + '</div></div>');
        mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap" id="BodyType_' + windowNo + '"></div></div>'
            + '</div>');
        mainDiv.append('<label class= " VIS_Pref_Label_Font"> ' + VIS.Msg.getMsg("VIS_BodyContent") + '</label><div class="VIS_Pref_show vis-formouterwrpdiv">'
            + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap vis-ev-full-h" id="Description_' + windowNo + '"></div></div>'
            + '</div>');
        root.append(mainDiv);
        root.append('<div class="vis-ctrfrm-btnwrp">'
            + '<input id="closeBtn' + windowNo + '" class= "VIS_Pref_btn-2" type = "button" value = "' + VIS.Msg.getMsg("close") + '">'
            + '<input id="okBtn_' + windowNo + '" class="VIS_Pref_btn-2" type="button" value="' + VIS.Msg.getMsg("OK") + '">'
            + '<div class="vis-ad-w-p-s-main pull-left"><div class="vis-ad-w-p-s-infoline"></div><div class="vis-ad-w-p-s-msg" style="align-items:flex-end;" id="lblBottomMsg_' + windowNo + '"></div></div>'
            + '</div>');

        var urlCtrl = root.find("#URL_" + windowNo);
        var methodCtrl = root.find("#Method_" + windowNo);
        headerCtrl = root.find("#Headers_" + windowNo);
        headerDiv = root.find("#HeaderDiv_" + windowNo);
        queryStringCtrl = root.find("#QueryString_" + windowNo);
        queryStringDiv = root.find("#QueryStringDiv_" + windowNo);
        var bodyTypeCtrl = root.find("#BodyType_" + windowNo);
        var desCtrl = root.find("#Description_" + windowNo);
        closeBtn = root.find("#closeBtn" + windowNo);
        okBtn = root.find("#okBtn_" + windowNo);
        lblBottomMsg = root.find("#lblBottomMsg_" + windowNo);

        var urlCtrlWrap = $('<div class="vis-control-wrap">');
        var methodCtrlWrap = $('<div class="vis-control-wrap">');
        var headerCtrlWrap = $('<div class="vis-control-wrap">');
        var queryStringCtrlWrap = $('<div class="vis-control-wrap">');
        var bodyTypeCtrlWrap = $('<div class="vis-control-wrap">');
        var desCtrlWrap = $('<div class="vis-control-wrap">');


        txtURL = new VIS.Controls.VTextBox("URL", true, false, true);
        urlCtrl.append(urlCtrlWrap);
        urlCtrlWrap.append(txtURL.getControl().attr('placeholder', ' ').attr('data-placeholder', '').attr("autocomplete", "off")).append('<label class=" VIS_Pref_Label_Font">' + VIS.Msg.getMsg("Url") + '</label>');

        methodCtrl.append(methodCtrlWrap);
        txtMethod = $('<select>'
            + '<option>GET</option>'
            + '<option>POST</option>'
            + '<option>PUT</option>'
            + '<option>DELETE</option>'
            + '</select>');
        methodCtrlWrap.append(txtMethod).append('<label class=" VIS_Pref_Label_Font">' + VIS.Msg.getMsg("VIS_Method") + '</label>');


        lblHeader = new VIS.Controls.VLabel("Headers", "Headers", true);
        headerCtrl.append(headerCtrlWrap);
        headerCtrlWrap.append(lblHeader.getControl()).append('<a style="color:rgba(var(--v-c-primary), 1);">' + VIS.Msg.getMsg("VIS_Addheader") + '</a>');


        lblQueryString = new VIS.Controls.VLabel("QueryString", "QueryString", true);
        queryStringCtrl.append(queryStringCtrlWrap);
        queryStringCtrlWrap.append(lblQueryString.getControl()).append('<a style="color:rgba(var(--v-c-primary), 1);">' + VIS.Msg.getMsg("VIS_AddParameter") + '</a>');

        txtBodyType = $('<select>'
            + '<option>JSON</option>'
            + '<option>Plain Text</option>'
            + '</select>');
        bodyTypeCtrl.append(bodyTypeCtrlWrap);
        bodyTypeCtrlWrap.append(txtBodyType).append('<label class=" VIS_Pref_Label_Font">' + VIS.Msg.getMsg("VIS_BodyType") + '</label>');

        desCtrl.append(desCtrlWrap);
        desCtrlWrap.append('<div contenteditable="true" class="vis-wf-Descriptiontext" id ="descriptiontxt_' + windowNo + '"></div>');

        events();
        GetColumns();

        OpenDialogPopup(root);

        //************* Is Busy Indicator ******************//

        function setBusy(isBusy) {
            if (isBusy) {
                bsyDiv[0].style.visibility = "visible";
            } else {
                bsyDiv[0].style.visibility = "hidden";
            }
        }
        setBusy(false);

        //*************All Event ******************//


        function selectColumn(column) {
            const tag = document.createElement('span');
            tag.className = 'vis-wf-columnlist';
            tag.contentEditable = false;
            tag.innerHTML = `@${column}@ <span class="vis-wf-column-remove vis vis-cross" onclick="this.parentElement.remove()"></span>`;
            desCtrl.find('#descriptiontxt_' + windowNo).append(tag).attr('contenteditable', 'true');
        }

        // Modify the events function to bind to the relevant fields
        function events() {
            okBtn.on(VIS.Events.onClick, function () {
                SavehttpReqDetails();
            });

            closeBtn.on(VIS.Events.onClick, function () {
                dispose();
            });

            headerCtrl.find('a').on(VIS.Events.onClick, function () {
                headerDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
                    + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap"><div style="margin-right:10px;" class="vis-control-wrap"><input type="text" id="headerNameCtrl_' + windowNo + '" placeholder="Header Name"></div></div></div>'
                    + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap"><div  style="margin-right:10px;" class="vis-control-wrap"><input type="text" id="headerValueCtrl_' + windowNo + '" placeholder="Header Value"></div></div></div>'
                    + '<button id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn"></button>'
                    + '</div>');
                headerDiv.off('input', '#headerValueCtrl_' + windowNo, handleInputEvent);
                headerDiv.on('input', '#headerValueCtrl_' + windowNo, handleInputEvent);
                headerDiv.on('click', '#crossbtn_' + windowNo, removeCrossIcon);
            });

            queryStringCtrl.find('a').on(VIS.Events.onClick, function () {
                queryStringDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
                    + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap"><div  style="margin-right:10px;" class="vis-control-wrap"><input type="text" id="queryStringNameCtrl_' + windowNo + '" placeholder=" Name"></div></div></div>'
                    + '<div class= "VIS_Pref_dd"><div class="input-group vis-input-wrap"><div  style="margin-right:10px;" class="vis-control-wrap"><input type="text" id="queryStringvalueCtrl_' + windowNo + '" placeholder=" Value"></div></div></div>'
                    + '<button id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn"></button>'
                    + '</div>');
                queryStringDiv.off('input', '#queryStringvalueCtrl_' + windowNo, handleInputEvent);
                queryStringDiv.on('input', '#queryStringvalueCtrl_' + windowNo, handleInputEvent);
                queryStringDiv.on('click', '#crossbtn_' + windowNo, removeCrossIcon);
            });

            desCtrl.find('#descriptiontxt_' + windowNo).on('keydown', function (event) {
                if (event.key === '@') {
                    var inputField = $(event.target);
                    var parentDiv = inputField.closest(".vis-control-wrap");

                    var listDiv = parentDiv.find(".vis-input-list");

                    if (listDiv.length === 0) {
                        // Create the list
                        listDiv = $('<div class="vis-input-list">');
                        listDiv.append(columnList);
                        parentDiv.append(listDiv);
                    }

                    // Add the event listener using event delegation to handle clicks on dynamically added elements
                    parentDiv.off('click', '.column-item');
                    parentDiv.on('click', '.column-item', function () {
                        var column = $(this).data('column');
                        selectColumn(column);  // Call the selectColumn function with the correct column

                        // Close the list once a column is selected
                        listDiv.remove();
                    });
                    event.preventDefault();
                }

            });
        }

        function removeCrossIcon(event) {
            event.target.parentElement.remove();

        }

        function GetColumns() {
            // Assuming columnList is already populated with column names from GetColumns()
            columnList = $();
            var obj = {
                AD_Workflow_ID: VIS.Utility.Util.getValueOfInt(VIS.context.m_map[1]["1|AD_Workflow_ID"]),
            }

            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "JsonData/GetWorkflowColumn",
                type: "POST",
                data: obj,
                success: function (result) {
                    result = JSON.parse(result);
                    if (result && result.Table.length > 1) {
                        for (var i = 0; i < result.Table.length; i++) {
                            columnList = columnList.add('<div data-column="' + result.Table[i]["COLUMNNAME"] + '" class="column-item" style="width: 30%;">' + result.Table[i]["COLUMNNAME"] + '</div>');
                        }
                        // Define parentDiv here
                        parentDiv1 = root;  // Or another appropriate container
                        parentDiv1.find(".vis-input-list").append(columnList);

                        // Attach click event to each column item after they're appended
                        parentDiv1.find(".vis-input-list .column-item").on('click', function () {
                            var column = $(this).text(); // Get the text (column name) of the clicked div
                            selectColumn(column); // Call selectColumn with the column name
                        });
                    }
                },
                error: function (error) {
                    setBusy(false);
                    var message = VIS.Msg.getMsg("VIS_SomethingWentWrong");
                    VIS.ADialog.error(message);
                }
            });
        }

        function handleInputEvent(event) {
            event.preventDefault();
            var inputField = $(event.target);

            var value = inputField.val();
            var parentDiv = inputField.closest(".vis-control-wrap");
            // Check if '@' is typed in the input
            if (value.includes('@')) {
                // Create or show the list below the input field
                var listDiv = parentDiv.find(".vis-input-list");

                if (listDiv.length === 0) {
                    // Create the list
                    listDiv = $('<div class="vis-input-list">');
                    listDiv.append(columnList);
                    parentDiv.append(listDiv);
                }

                // Add the event listener using event delegation to handle clicks on dynamically added elements
                parentDiv.off('click', '.column-item');
                parentDiv.on('click', '.column-item', function () {
                    var column = $(this).data('column');
                    inputField.val('@' + column + '@');  // Set value to input field with selected column

                    // Close the list once a column is selected
                    listDiv.remove();
                });

            } else {
                // If '@' is not present, remove the list
                var listDiv = parentDiv.find(".vis-input-list");
                listDiv.remove();
            }
        }

        function OpenDialogPopup(firstRoot) {
            HttpRequestDialog = new VIS.ChildDialog();
            HttpRequestDialog.setContent(firstRoot);
            var windowWidth = $(window).width();
            if (windowWidth >= 1366) {
                HttpRequestDialog.setWidth(470);
            }
            else {
                HttpRequestDialog.setWidth(670);
            }
            HttpRequestDialog.setTitle(VIS.Msg.getMsg("HttpRequest"));
            HttpRequestDialog.setEnableResize(true);
            HttpRequestDialog.setModal(true);
            HttpRequestDialog.show();
            HttpRequestDialog.hideButtons();
            HttpRequestDialog.getRoot().dialog({ position: [200, 130] });
        };

        function getHeaders() {
            var headers = {};
            headerDiv.find('.VIS_Pref_show').each(function () {
                var nameInput = $(this).find('#headerNameCtrl_' + windowNo);
                var valueInput = $(this).find('#headerValueCtrl_' + windowNo);
                if (nameInput.val() && nameInput.val().length > 1 && valueInput.val() && valueInput.val().length > 1) {
                    var headerName = nameInput.val().trim();
                    var headerValue = valueInput.val().trim();
                    if (headerName && headerValue) {
                        headers[headerName] = headerValue;
                    }
                }
            });
            return headers;
        }

        function getQueryStrings() {
            var queryStrings = {};
            queryStringDiv.find('.VIS_Pref_show').each(function () {
                var nameInput = $(this).find('#queryStringNameCtrl_' + windowNo);
                var valueInput = $(this).find('#queryStringvalueCtrl_' + windowNo);
                if (nameInput.val() && nameInput.val().length > 1 && valueInput.val() && valueInput.val().length > 1) {
                    var queryName = nameInput.val().trim();
                    var queryValue = valueInput.val().trim();
                    if (queryName && queryValue) {
                        queryStrings[queryName] = queryValue;
                    }
                }
            });
            return queryStrings;
        }

        function convertBodyContentToJson(bodyContent) {
            var regex = /@([A-Za-z0-9_]+)@([^@]+)/g;
            var result = {};
            var match;

            while ((match = regex.exec(bodyContent)) !== null) {
                var key = match[1];  
                var value = match[2].trim();  
                result[key] = value;  
            }

            return result;
        }


        function SavehttpReqDetails() {
            var isRequired = false;
            var msg = VIS.Msg.getMsg("FillMandatory") + " ";
            var URL = txtURL.getValue();
            var method = txtMethod.val();
            var BodyType = txtBodyType.val();
            var description = desCtrl.find('#descriptiontxt_' + windowNo).text();

            if (URL.length < 1) {
                msg += VIS.Msg.getMsg("EnterURL") + ", ";
                isRequired = true;
            }

            if (method.length < 1) {
                msg += VIS.Msg.getMsg("Method") + ", ";
                isRequired = true;
            }

            if (BodyType.length < 1) {
                msg += VIS.Msg.getMsg("BodyType") + ", ";
                isRequired = true;
            }


            if (isRequired) {
                VIS.ADialog.error("", "", msg.slice(0, -2));
                return false;
            }

            var headers = getHeaders();
            var queryStrings = getQueryStrings();

            // Prepare the request data
            var text = "";
            if (BodyType == "JSON") {
                text = `{
"url":  "${URL}",
"method":"${method}",
"headers": ${JSON.stringify(headers)},
"queryString": ${JSON.stringify(queryStrings)},
"bodyType":"${BodyType}",
"bodyContent": ${JSON.stringify(convertBodyContentToJson(description))}
}`;
            } else {
                text = `{
"url":  "${URL}",
"method":"${method}",
"headers": ${JSON.stringify(headers)},
"queryString": ${JSON.stringify(queryStrings)},
"bodyType":"${BodyType}",
"bodyContent": "${description}" 
}`;
            }

            var obj = {
                AD_WF_Node_ID: VIS.Utility.Util.getValueOfInt(VIS.context.m_map[1]["1|AD_WF_Node_ID"]),
                result: text
            }
            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "JsonData/SaveHttpRequest",
                type: "POST",
                data: obj,
                success: function (result) {
                    result = JSON.parse(result);
                    if (result == "OK") {
                        lblBottomMsg.text(VIS.Msg.getMsg("SavedSuccessfully")).css('color', 'green');
                        setTimeout(function () {
                            dispose();
                        }, 1000);
                    }
                    else {
                        setBusy(false);
                        lblBottomMsg.text(result);
                    }
                },
                error: function (error) {
                    setBusy(false);
                    //html to be converted to doc
                    message = VIS.Msg.getMsg("VIS_SomethingWentWrong");
                    VIS.ADialog.error(message);
                }
            });

        };


        function clear() {
            setBusy(false);
            txtURL.setValue('');
            txtMethod.val('GET')
            headerDiv = null;
            queryStringDiv = null;
            txtBodyType.val('JSON')
            // txtDescription = null;
        };

        //*************Clean Up ******************//

        function dispose() {
            setBusy(false);
            HttpRequestDialog.close();
            clear();
        };
    };

    VIS.WorkFlowHttpRequest = httpRequest;
})(VIS, jQuery);
