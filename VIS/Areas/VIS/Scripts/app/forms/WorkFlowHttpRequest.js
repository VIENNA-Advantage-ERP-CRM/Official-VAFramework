; (function (VIS, $) {

    var txtURL = null;
    var txtURL = null;
    var txtMethod = null;
    var txtBodyContent = null;
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

    var columnList = $();
    this.records = [];
    var parentDiv1;
    var desCtrl = null;
    var _recordID = 0;
    var root = null;
    var _divBodyType = null;
    var _divBodyContent = null;
    var listDiv = null;

    //*************Add New Product by using Popup box  ******************//

    function httpRequest(windowNo) {
        var $self = this;
        columnList = $();
        root = $('<div>');
        bsyDiv = $("<div class='vis-apanel-busy'>");
        bsyDiv.css({
            "position": "absolute", "width": "98%", "height": "97%", 'text-align': 'center', 'z-index': '999'
        });
        root.append(bsyDiv);

        this.Initialize = function () {
            setBusy(true);
            var mainDiv = $('<div class="vis-wf-httprequest-container">');
            mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap" id="URL_' + windowNo + '"></div></div>'
                + '</div>');
            mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap" id="Method_' + windowNo + '"></div></div>'
                + '</div>');
            mainDiv.append('<div id="HeaderDiv_' + windowNo + '" style="margin-bottom: 10px;"><div class="VIS_Pref_show vis-formouterwrpdiv">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-wf-req-input-wrap" id="Headers_' + windowNo + '" style="margin-bottom: 5px;"></div></div>'
                + '</div></div>');
            mainDiv.append('<div id="QueryStringDiv_' + windowNo + '"><div class="VIS_Pref_show vis-formouterwrpdiv">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-wf-req-input-wrap" id="QueryString_' + windowNo + '"></div></div>'
                + '</div></div>');
            mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-BodyType" style="margin-top: 8px;">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div style="margin-bottom: 0px;" class="input-group vis-input-wrap" id="BodyType_' + windowNo + '"></div></div>'
                + '</div>');
            mainDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-BodyContent">'
                + '<div class="VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap vis-ev-full-h" id="Description_' + windowNo + '"></div></div>'
                + '</div>');
            root.append(mainDiv);
            root.append('<div class="vis-ctrfrm-btnwrp" style="padding-right: 10px;">'
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
            desCtrl = root.find("#Description_" + windowNo);
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
                + '<option>POST</option>'
                + '<option>GET</option>'
                + '<option>PUT</option>'
                + '<option>DELETE</option>'
                + '</select>');
            methodCtrlWrap.append(txtMethod).append('<label class=" VIS_Pref_Label_Font">' + VIS.Msg.getMsg("VIS_Method") + '</label>');

            lblHeader = new VIS.Controls.VLabel("Headers", "Headers", true);
            headerCtrl.append(headerCtrlWrap);
            headerCtrlWrap.append(lblHeader.getControl().css("display", "block")).append('<a style="color:rgba(var(--v-c-primary), 1); cursor: pointer;">' + VIS.Msg.getMsg("VIS_Addheader") + '</a>');

            lblQueryString = new VIS.Controls.VLabel("QueryString", "QueryString", true);
            queryStringCtrl.append(queryStringCtrlWrap);
            queryStringCtrlWrap.append(lblQueryString.getControl().css("display", "block")).append('<a style="color:rgba(var(--v-c-primary), 1); cursor: pointer;">' + VIS.Msg.getMsg("VIS_AddParameter") + '</a>');
            txtBodyType = $('<select>'
                + '<option>JSON</option>'
                + '<option>Plain Text</option>'
                + '</select>');
            bodyTypeCtrl.append(bodyTypeCtrlWrap);
            bodyTypeCtrlWrap.append(txtBodyType).append('<label class=" VIS_Pref_Label_Font">' + VIS.Msg.getMsg("VIS_BodyType") + '</label>');

            desCtrl.append(desCtrlWrap);
            desCtrlWrap.append('<label class= "VIS_wf_req_Pref_Label_Font"> ' + VIS.Msg.getMsg("VIS_BodyContent") + '</label><div contenteditable="true" class="vis-wf-Descriptiontext vis-wf-req-contentEdit" id ="descriptiontxt_' + windowNo + '"></div>');
            txtBodyContent = desCtrl.find('#descriptiontxt_' + windowNo);

            _divBodyType = root.find(".vis-wf-req-BodyType");
            _divBodyContent = root.find(".vis-wf-req-BodyContent");

            events();
            GetColumns();
            getHttpRequestData();
            //setBusy(false);
        };

        //************* Is Busy Indicator ******************//

        function setBusy(isBusy) {
            if (isBusy) {
                bsyDiv[0].style.visibility = "visible";
            } else {
                bsyDiv[0].style.visibility = "hidden";
            }
        }

        function fillcombo(requestData) {
            if (requestData != null) {
                let txtBodyContent = desCtrl.find('#descriptiontxt_' + windowNo);
                let originalWidth = txtBodyContent.outerWidth();// find the widht of the div before insert body content
                txtURL.setValue(requestData[0].URL);
                txtMethod.val(requestData[0].Method);
                txtBodyType.val(requestData[0].BodyType);
                //txtBodyContent.text(requestData[0].BodyContent);
                txtBodyContent.html(formatBodyContent(requestData[0].BodyContent));
                txtBodyContent.css("width", originalWidth + "px"); // set manually width to the body content.
                var queryString = requestData[0].QueryString;
                if (queryString && typeof queryString === 'object') {
                    for (let key in queryString) {
                        if (queryString.hasOwnProperty(key)) {
                            var value = queryString[key];
                            queryStringDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-centerRightPad">'
                                + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero" style="padding-right: 0px;"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="queryStringNameCtrl_' + windowNo + '" placeholder=" Name" value="' + key + '"></div></div></div>'
                                + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="queryStringvalueCtrl_' + windowNo + '" placeholder=" Value" value="' + value + '"></div></div></div>'
                                + '<span id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn vis-wf-req-crossFont" style="margin-bottom: 25px;"></span>'
                                + '</div>');
                        }
                    }
                }
                var headers = requestData[0].Headers;
                if (headers && typeof headers === 'object') {
                    for (let key in headers) {
                        if (headers.hasOwnProperty(key)) {
                            var value = headers[key];
                            headerDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-centerRightPad">'
                                + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero" style="padding-right: 0px;"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="headerNameCtrl_' + windowNo + '" placeholder="Header Name" value="' + key + '"></div></div></div>'
                                + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="headerValueCtrl_' + windowNo + '" placeholder="Header Value" value="' + value + '"></div></div></div>'
                                + '<span id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn vis-wf-req-crossFont" style="margin-bottom: 25px;"></span>'
                                + '</div>');
                        }
                    }
                }
                setBusy(false);
            }
        }

        function formatBodyContent(bodyContent) {
            if (bodyContent) {
                const placeholderRegex = /@([a-zA-Z_0-9]+)@/g; // Restrict to valid placeholder names
                const formattedContent = bodyContent.replace(placeholderRegex, (match, column) => {
                    return `<span class="vis-wf-columnlist vis-wf-highlight" contenteditable="false">
                @${column}@ <span class="vis-wf-column-remove vis vis-cross" onclick="this.parentElement.remove()"></span>
</span>`;
                });

                return formattedContent;
            }
            return "";
        };

        function getHttpRequestData() {
            var obj = {
                AD_WF_Node_ID: $self._recordID,
            }

            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "JsonData/GetRequestData",
                type: "POST",
                data: obj,
                success: function (result) {
                    result = JSON.parse(result);
                    if (result && result.length > 0) {
                        fillcombo(result);
                    }
                    showhideBodySection();
                    setBusy(false);
                },
                error: function (error) {
                    setBusy(false);
                    var message = VIS.Msg.getMsg("VIS_SomethingWentWrong");
                    VIS.ADialog.error(message);
                }
            });
        }

        //*************All Event ******************//
        // Function to insert the selected column at the correct position
        function selectColumn(column, cursorPosition) {
            const textbox = desCtrl.find('#descriptiontxt_' + windowNo)[0];
            // Create a span element for the column value
            const tag = document.createElement('span');
            tag.className = 'vis-wf-columnlist'; // Apply the class to the span
            tag.contentEditable = false;
            tag.innerHTML = `@${column}@<span class="vis-wf-column-remove vis vis-cross" onclick="this.parentElement.remove()"></span>`;
            txtBodyContent.append(tag).attr('contenteditable', 'true');
            // Get the current selection
            const selection = window.getSelection();
            // Create a range and set it to the cursor position
            const range = document.createRange();
            // Find the correct node and offset for the cursor position
            let node = textbox;
            let offset = cursorPosition;
            // Traverse the DOM to find the correct node and offset
            while (node && node.nodeType !== Node.TEXT_NODE && node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    const childLength = child.textContent.length;
                    if (offset <= childLength) {
                        node = child;
                        break;
                    } else {
                        offset -= childLength;
                    }
                }
            }
            // If a valid node is found, set the range start
            if (node) {
                range.setStart(node, offset);
                range.collapse(true);
                // Insert the new span at the cursor position
                range.insertNode(tag);
                const comma = document.createTextNode(' '); // Create a text node for the comma
                range.setStartAfter(tag); // Move the range to the end of the inserted span
                range.insertNode(comma);
                // Move the cursor to the end of the inserted column value
                const newCursorPosition = cursorPosition + `@${column}@`.length;
                setCursorPosition(textbox, newCursorPosition);
            } else {
                console.error("No valid node found at the specified position.");
            }
            const parentDiv = $(textbox).closest(".vis-control-wrap");
            listDiv = parentDiv.find(".vis-input-list");
            listDiv.remove();
        }

        function setCursorPosition(element, position) {
            const range = document.createRange();
            const selection = window.getSelection();
            // Find the correct text node and offset
            let node = element;
            let offset = position;
            // Traverse the DOM to find the text node at the specified position
            while (node && node.nodeType !== Node.TEXT_NODE && node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    const childLength = child.textContent.length;
                    if (offset <= childLength) {
                        node = child;
                        break;
                    } else {
                        offset -= childLength;
                    }
                }
            }
            // If a text node is found, set the cursor position
            if (node && node.nodeType === Node.TEXT_NODE) {
                range.setStart(node, offset);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                console.error("No valid text node found at the specified position.");
            }
        }

        //function selectColumn(column) {
        //    const tag = document.createElement('span');
        //    tag.className = 'vis-wf-columnlist';
        //    tag.contentEditable = false;
        //    tag.innerHTML = `@${column}@ <span class="vis-wf-column-remove vis vis-cross" onclick="this.parentElement.remove()"></span>`;
        //    desCtrl.find('#descriptiontxt_' + windowNo).append(tag).attr('contenteditable', 'true');
        //}

        // Modify the events function to bind to the relevant fields
        function events() {
            okBtn.on('click', function () {
                SavehttpReqDetails();
            });

            closeBtn.on('click', function () {
                $self.frame.close();
            });

            headerCtrl.find('a').on('click', function () {
                headerDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-centerRightPad">'
                    + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero" style="padding-right: 0px;"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="headerNameCtrl_' + windowNo + '" placeholder="Header Name"></div></div></div>'
                    + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="headerValueCtrl_' + windowNo + '" placeholder="Header Value"></div></div></div>'
                    + '<span id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn vis-wf-req-crossFont" style="margin-bottom: 25px;"></span>'
                    + '</div>');
                headerDiv.off('input', '#headerValueCtrl_' + windowNo, handleInputEvent);
                headerDiv.on('input', '#headerValueCtrl_' + windowNo, handleInputEvent);
            });

            queryStringCtrl.find('a').on('click', function () {
                queryStringDiv.append('<div class="VIS_Pref_show vis-formouterwrpdiv vis-wf-req-centerRightPad">'
                    + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero" style="padding-right: 0px;"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="queryStringNameCtrl_' + windowNo + '" placeholder=" Name"></div></div></div>'
                    + '<div class= "VIS_Pref_dd vis-wf-req-marginBottomZero"><div class="input-group vis-input-wrap"><div class="vis-control-wrap"><input type="text" id="queryStringvalueCtrl_' + windowNo + '" placeholder=" Value"></div></div></div>'
                    + '<span id="crossbtn_' + windowNo + '" class="vis vis-cross vis-wf-column-iconbtn vis-wf-req-crossFont" style="margin-bottom: 25px;"></span>'
                    + '</div>');
                queryStringDiv.off('input', '#queryStringvalueCtrl_' + windowNo, handleInputEvent);
                queryStringDiv.on('input', '#queryStringvalueCtrl_' + windowNo, handleInputEvent);
            });

            let cursorPosition = 0; // Global variable to store the cursor position
            desCtrl.find('#descriptiontxt_' + windowNo).on('keydown', function (event) {
                if (event.key === '@') {
                    // Save the cursor position
                    cursorPosition = getCursorPosition(event.target);
                    var inputField = $(event.target);
                    var parentDiv = inputField.closest(".vis-control-wrap");
                    listDiv = parentDiv.find(".vis-input-list");
                    if (listDiv.length === 0) {
                        // Create the list
                        listDiv = $('<div class="vis-input-list">');
                        listDiv.append(columnList);
                        parentDiv.append(listDiv);
                        // Position the dropdown above the textbox
                        listDiv.css({
                            'width': inputField.outerWidth()
                        });
                    }
                    // Add the event listener using event delegation to handle clicks on dynamically added elements
                    parentDiv.off('click', '.column-item');
                    parentDiv.on('click', '.column-item', function () {
                        var column = $(this).data('column');
                        selectColumn(column, cursorPosition); // Pass the cursor position to selectColumn

                        // Close the list once a column is selected
                        listDiv.remove();
                    });
                    event.preventDefault();
                }
            });

            // Function to get the cursor position
            function getCursorPosition(element) {
                if (window.getSelection) {
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(element);
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        return preCaretRange.toString().length;
                    }
                }
                return 0;
            };

            root.on('click', '#crossbtn_' + windowNo, function () {
                var parentDiv = $(this).closest('.VIS_Pref_show');
                parentDiv.remove();
            });

            txtMethod.on("change", function (e) {
                showhideBodySection();
            });

            root.on('click.hideList', function (e) {
                // Check if the click target is outside the list and input field
                if (!$(e.target).closest('.vis-input-list').length) {
                    if (listDiv)
                        listDiv.remove(); // Hide the list
                    //root.off('click.hideList'); // Remove the event listener
                }
            });
        };

        function showhideBodySection() {
            if (txtMethod.val() == "GET") {
                _divBodyType.hide();
                _divBodyContent.hide();
            }
            else {
                _divBodyType.show();
                _divBodyContent.show();
            }
        };

        function GetColumns() {
            columnList = $();
            var obj = {
                AD_Workflow_ID: $self._recordID,
            }

            setBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "JsonData/GetWorkflowColumn",
                type: "POST",
                data: obj,
                success: function (result) {
                    result = JSON.parse(result);
                    if (result && result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                            columnList = columnList.add('<div data-column="' + result[i]['ColumnName'] + '" class="column-item" style="width: 30%;">' + result[i]['ColumnName'] + '</div>');
                        }

                        // Define parentDiv here
                        parentDiv1 = root;
                        parentDiv1.find(".vis-input-list").append(columnList);

                        parentDiv1.find(".vis-input-list .column-item").on('click', function () {
                            var column = $(this).text();
                            selectColumn(column);
                        });
                    }
                    setBusy(false);
                },
                error: function (error) {
                    setBusy(false);
                    var message = VIS.Msg.getMsg("VIS_SomethingWentWrong");
                    VIS.ADialog.error(message);
                }
            });
        };

        function handleInputEvent(event) {
            event.preventDefault();
            var inputField = $(event.target);

            var value = inputField.val();
            var parentDiv = inputField.closest(".vis-control-wrap");
            // Check if '@' is typed in the input
            if (value.includes('@')) {
                // Create or show the list below the input field
                listDiv = parentDiv.find(".vis-input-list");

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
                listDiv = parentDiv.find(".vis-input-list");
                listDiv.remove();
            }
        }

        function getHeaders() {
            var headers = "";
            if (headerDiv.find('.VIS_Pref_show').length > 0) {
                headerDiv.find('.VIS_Pref_show').each(function () {
                    var nameInput = $(this).find('#headerNameCtrl_' + windowNo);
                    var valueInput = $(this).find('#headerValueCtrl_' + windowNo);
                    if (nameInput.val() && nameInput.val().length > 1 && valueInput.val() && valueInput.val().length > 1) {
                        if (headers == "")
                            headers = {};
                        var headerName = nameInput.val().trim();
                        var headerValue = valueInput.val().trim();
                        if (headerName && headerValue) {
                            headers[headerName] = headerValue;
                        }
                    }
                });
            }
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
            var regex = /"([^"]+)"\s*:\s*(?:"([\s\S]*?)"|(@[^@]+@)|(-?\d+(\.\d+)?)|({.*?}))/g;
            var result = {};
            var match;

            while ((match = regex.exec(bodyContent)) !== null) {
                var key = match[1].trim(); // Trim key
                var value;

                if (match[3] !== undefined) {
                    value = match[3].trim(); // Trim placeholders like @AD_Client_ID@
                }
                else if (match[2] !== undefined) {
                    value = match[2].replace(/\s+/g, " ").trim(); // Normalize spaces in values
                }
                else if (match[4] !== undefined) {
                    value = parseFloat(match[4]); // Convert number values
                }
                else if (match[5] !== undefined) {
                    value = convertBodyContentToJson(match[5]); // Handle nested objects
                }

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
            var description = txtBodyContent.text();

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
            if (headers != "")
                headers = JSON.stringify(headers);
            var queryStrings = getQueryStrings();

            // Prepare the request data
            var text = "";
            if (BodyType == "JSON") {
                text = `{
"url":  "${URL}",
"method":"${method}",
"queryString": ${JSON.stringify(queryStrings)},
"bodyType":"${BodyType}",
"bodyContent": ${JSON.stringify(convertBodyContentToJson(description))}
}`;
            } else {
                text = `{
"url":  "${URL}",
"method":"${method}",
"queryString": ${JSON.stringify(queryStrings)},
"bodyType":"${BodyType}",
"bodyContent": "${description}" 
}`;
            }

            var obj = {
                AD_WF_Node_ID: $self._recordID,
                URL: URL,
                headers: headers,
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
                        setBusy(false);
                        $self.frame.gridDataRefreshAll();
                        $self.frame.close();
                        return true;
                    }
                    else {
                        setBusy(false);
                        lblBottomMsg.text(result);
                        return false;
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
            txtURL.setValue('');
            txtMethod.val('POST')
            headerDiv = null;
            queryStringDiv = null;
            txtBodyType.val('JSON')
            // txtDescription = null;
        };

        //*************Clean Up ******************//

        function dispose() {

        };

        this.getRoot = function () {
            return root;
        };

        this.formSizeChanged = function (height, width) { };

        this.sizeChanged = function (height, width) { };

        this.setWidth = function (w) {
            var windowWidth = $(window).width();
            if (windowWidth <= 1366) {
                return 470;
            }
            else {
                return 670;
            }
        };

        this.setHeight = function () {
            return 600;
        };

        this.disposeComponent = function () {
            if (txtMethod) {
                txtMethod.off("change");
            }
            if (okBtn) {
                okBtn.off('click');
            }
            if (closeBtn) {
                closeBtn.off('click');
            }
            if (headerCtrl) {
                headerCtrl.find('a').off('click');
            }
            if (queryStringCtrl) {
                queryStringCtrl.find('a').off('click');
            }
            root.off('click', '#crossbtn_' + windowNo);
            desCtrl.find('#descriptiontxt_' + windowNo).off('keydown');
            setBusy(false);
            clear();
        };
    };

    httpRequest.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this._recordID = frame.getRecord_ID();
        this.windowNo = windowNo;
        var obj = this.Initialize();
        this.frame.getContentGrid().append(this.getRoot());
    };


    httpRequest.prototype.sizeChanged = function (height, width) {
        this.formSizeChanged(height, width);
    };

    httpRequest.prototype.refresh = function (height, width) {
        this.formSizeChanged();
    };

    //Must implement dispose
    httpRequest.prototype.dispose = function () {
        /*CleanUp Code */
        this.disposeComponent();
        //if (this.frame)
        //    this.frame.dispose();
        this.frame = null;
    };

    VIS.WorkFlowHttpRequest = httpRequest;
})(VIS, jQuery);
