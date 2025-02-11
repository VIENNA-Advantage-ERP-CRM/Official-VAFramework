﻿; (function (VIS, $) {
    //****************************************************//
    //**             VPanel                            **//
    //**************************************************//
    VIS.VGridPanel = function () {

        var oldFieldGroup = null, columnIndex = -2, allControlCount = -1;;
        var allControls = [];
        var allLinkControls = [];

        let colCount = 4;

        var toolbarButtonList = {};

        var $table;

        var $td0, $td1, $td2, $td3;

        var $spndisplayFG = $('<span class="vis-ev-fgbtn" data-state="N">' + VIS.Msg.getMsg("More") + '</span>');

        var _curParent = null;

        var col0 = { rSpan: 1, cSpan: 0, cSpace: 0, orgRSpan: 1 };
        var col1 = { rSpan: 1, cSpan: 0, cSpace: 0, orgRSpan: 1 };
        var col2 = { rSpan: 1, cSpan: 0, cSpace: 0, orgRSpan: 1 };
        var col3 = { rSpan: 1, cSpan: 0, cSpace: 0, orgRSpan: 1 };

        /** Map of group name to list of components in group. */
        //control = field array
        var compToFieldMap = {};

        /** Map of group name to list of components in group. */
        var groupToCompsMap = {};

        var fieldToCompParentMap = {};
        var colDescHelpList = {};

        var lastPopover = null;

        var agGroupToAGInsMap = {};

        function initComponent() {
            $table = $("<div class='vis-ad-w-p-vc-ev-grid'>"); //   $("<table class='vis-gc-vpanel-table'>");
            //$table.on("click", "label", onInfoClick);
            $table.on("click", "span.vis-ev-ctrlinfowrap", onInfoClick);
            $table.on("click", "span.vis-ev-fgbtn", onBtnFGClick);
        };

        function onInfoClickold(e) {
            var curTgt = $(e.currentTarget);
            showpopover(curTgt, curTgt);
        }

        function onInfoClick(e) {
            var curTgt = $(e.currentTarget);
            //var curTgt = lblTgt.siblings('span.vis-ev-ctrlinfowrap');
            if (!curTgt || curTgt.length == 0)
                return;
            showpopover(curTgt);
        }
        function showpopover(curTgt) {

            var colName = curTgt.data('colname');
            if (colName != '') {
                if (lastPopover) {
                    lastPopover.popover('dispose');
                    lastPopover = null;
                }
                curTgt.attr('data-content', colDescHelpList[colName].help);
                //attr('title', colDescHelpList[colName].desc);
                lastPopover = curTgt.popover('show');
            }
        }

        initComponent();

        function initCols(isCol0, isCol1, isCol2, isCol3) {

            if (isCol0)
                _curParent = $td0 = $("<div class='vis-ev-col'></div>");
            if (isCol1)
                _curParent = $td1 = $("<div class='vis-ev-col vis-ev-col-start2'></div>");
            if (isCol2)
                _curParent = $td2 = $("<div class='vis-ev-col vis-ev-col-start3'></div>");
            if (isCol3)
                _curParent = $td3 = $("<div class='vis-ev-col vis-ev-col-start4'></div>");
        };
        function reset(col) {
            if (!col) {
                col0 = { rSpan: 1, cSpan: 0, cSpace: 0, set: false };
                col1 = { rSpan: 1, cSpan: 0, cSpace: 0, set: false };
                col2 = { rSpan: 1, cSpan: 0, cSpace: 0, set: false };
                col3 = { rSpan: 1, cSpan: 0, cSpace: 0, set: false };
            }
            else if (col.rSpan <= 1) {
                col = { rSpan: 1, cSpan: 0, cSpace: 0, set: false };
            }
        };

        function adjustRowSpanForSameLine(colIndex) {
            // if(colIndex)

        }

        function adjustRowSpan(colIndex) {

            if (col0.rSpan > 1) { //skip column 
                //if (col0.set && colIndex == 1 &&  col0.cSpan < 4) { //special case
                //    col0.set = false;
                //}
                //else
                --col0.rSpan;

                reset(col0);
            }
            if (col1.rSpan > 1) { //skip column 
                //if (colIndex == 2 && col1.set &&  col1.cSpan < 3) { //special case
                //    col1.set = false;
                //}
                //else
                --col1.rSpan;
                reset(col1);
            }
            if (col2.rSpan > 1) { //skip column 
                //if (colIndex == 3 && col2.set && col2.cSpan <2) { //special case
                //    col2.set = false;
                //}
                //else
                --col2.rSpan;
                reset(col2);
            }
            if (col3.rSpan > 1) { //skip column 
                --col3.rSpan;
                reset(col3);
            }
        };
        function adjustLayout(mField, isNewRow) {
            var rowSpan = mField.getFieldBreadth();
            var colSpan = mField.getFieldColSpan();
            var cellSpace = mField.getCellSpace();
            var isLongFiled = mField.getIsLongField();
            var isLineBreak = mField.getIsLineBreak();

            if (colCount - 1 ==0) {
                cellSpace = 0;
                rowSpan = 0;
            }
            if (colSpan > colCount - 1)
                colSpan = colCount;


            if (isLineBreak) {
                reset();
                isNewRow = true;
            }
            if (isNewRow) {
                adjustRowSpan(columnIndex);
                addRow();
                columnIndex = 0;
            }


            if (columnIndex == 0) {
                if (isLongFiled) {
                    addRow();//add last row;
                    reset();
                    initCols(true);
                    if (colCount>1)
                    $td0.addClass("vis-ev-col-end" + colCount);
                    columnIndex = colCount+4; //outbound
                } 
                else {
                    // check for row span
                    if (col0.rSpan > 1) { //skip column 
                        columnIndex += col0.cSpan;
                        if (columnIndex >= colCount)
                            columnIndex = 6;//outbound
                        //--col0.rSpan;
                        //reset(col0);
                    }
                    else if (cellSpace > 0) {
                        if (cellSpace > colCount-1)
                            cellSpace = colCount -1;
                        columnIndex += cellSpace;
                        cellSpace = 0; //reset
                    }
                    else if ($td0) {
                        columnIndex += 1;
                    }
                    else {

                        initCols(true);
                        if (colSpan == 2) {
                            if (col1.rSpan <= 1) //if nor row span on on colujn 1
                                $td0.addClass("vis-ev-col-end2");
                        }

                        else if (colSpan == 3) {
                            if (col1.rSpan <= 1 && col2.rSpan <= 1)
                                $td0.addClass("vis-ev-col-end3");
                            else if (col1.cSpan < 1)
                                $td0.addClass("vis-ev-col-end2");
                        }
                        else if (colSpan > 3) {
                            if (col1.rSpan <= 1 && col2.rSpan <= 1 && col3.rSpan <= 1)
                                $td0.addClass("vis-ev-col-end4");
                            else if (col1.rSpan <= 1 && col2.rSpan <= 1)
                                $td0.addClass("vis-ev-col-end3");
                            else if (col1.rSpan <= 1)
                                $td0.addClass("vis-ev-col-end2");
                        }
                        columnIndex += colSpan - 1;

                        if (rowSpan > 1) {
                            col0.rSpan = rowSpan + 1; //extra to fill addnew minus
                            col0.set = true;
                            col0.cSpan = colSpan;
                            col0.cSpace = cellSpace;
                            $td0.css("grid-row", "span " + rowSpan);
                        }
                        return;
                    }
                }
            }

            if (columnIndex == 1) {

                // check for row span
                if (col1.rSpan > 1) { //skip column 
                    columnIndex += col1.cSpan;
                    if (columnIndex >= colCount)
                        columnIndex = 6;//outbound
                    //--col1.rSpan;
                    //reset(col1);
                }
                else if (cellSpace > 0) {
                    if (cellSpace > 2)
                        cellSpace = 2;
                    columnIndex += cellSpace;
                    cellSpace = 0;
                }
                else if ($td1) {
                    columnIndex += 1;
                }
                else {

                    initCols(false, true);
                    if (colSpan == 2) {
                        if (col2.rSpan <= 1) //if nor row span on on colujn 1
                            $td1.addClass("vis-ev-col-end3");
                    }

                    else if (colSpan >= 3) {
                        if (col2.rSpan <= 1 && col3.rSpan <= 1)
                            $td1.addClass("vis-ev-col-end4");
                        else if (col2.cSpan < 1)
                            $td1.addClass("vis-ev-col-end3");
                    }

                    columnIndex += colSpan - 1;
                    if (rowSpan > 1) {
                        col1.rSpan = rowSpan + 1;
                        col1.set = true;
                        col1.cSpan = colSpan;
                        col1.cSpace = cellSpace;
                        $td1.css("grid-row", "span " + rowSpan);
                    }
                    return;
                }
            }

            if (columnIndex == 2) {

                // check for row span
                if (col2.rSpan > 1) { //skip column 
                    columnIndex += col2.cSpan;
                    if (columnIndex >= colCount)
                        columnIndex = 6;//outbound
                    //--col2.rSpan;
                    //reset(col2);
                }
                else if (cellSpace > 0) {
                    if (cellSpace > 1)
                        cellSpace = 1;
                    columnIndex += cellSpace;
                    cellSpace = 0;
                }
                else if ($td2) {
                    columnIndex += 1;
                }
                else {

                    initCols(false, false, true);
                    if (colSpan >= 2) {
                        if (col3.rSpan <= 1) //if nor row span on on colujn 1
                            $td2.addClass("vis-ev-col-end4");
                    }

                    columnIndex += colSpan - 1;
                    if (rowSpan > 1) {
                        col2.rSpan = rowSpan + 1;
                        col2.set = true;
                        col2.cSpan = colSpan;
                        col2.cSpace = cellSpace;
                        $td2.css("grid-row", "span " + rowSpan);
                    }
                    return;
                }
            }

            if (columnIndex == 3) {

                // check for row span
                if (col3.rSpan > 1) { //skip column 
                    //--col3.rSpan;
                    //reset(col3);
                }
                else if ($td3) {
                    isNewRow = true;
                    //addRow();
                    //columnIndex = 0;
                }
                else {
                    initCols(false, false, false, true);
                    if (colSpan >= 2) {
                        $td3.addClass("vis-ev-col-end4");
                    }
                    if (rowSpan > 1) {
                        col3.rSpan = rowSpan + 1;
                        col3.set = true;
                        col3.cSpan = colSpan;
                        col3.cSpace = cellSpace;
                        $td3.css("grid-row", "span " + rowSpan);
                    }
                }
                return;
            }

            //if all col index are skipped
            if (!$td0 && !$td1 && !$td2 && !$td3) {
                //columnIndex = 0;
                adjustLayout(mField, isNewRow);
            }
            else if (!isLongFiled && columnIndex > colCount-1) {
                adjustLayout(mField, true);
            }
        };

        function addRow() {

            if ($td0)
                $table.append($td0);
            if ($td1)
                $table.append($td1);
            if ($td2)
                $table.append($td2);
            if ($td3)
                $table.append($td3);

            $td0 = $td1 = $td2 = $td3 = $td4 = null;
            //if (td3RSpan < 0)
            //    $table.append($td3)
            //else if (td3RSpan > 100) {
            //    td3RSpan = td3RSpan - 100;
            //    $table.append($td3.css('grid-row', 'span ' + td3RSpan));
            //}
        };

        function onGroupClick(e) {
            e.stopPropagation();
            var divGroup = $(this);
            var target = $(e.target);
            var name = divGroup.data("name") + "_" + divGroup.data("seqno");
            // var idx = div.Group.data("seqno");
            var dis = divGroup.data("display");
            var viewMore = $(divGroup.find('.vis-ev-col-fg-more')[0]);
            //console.log(name);
            //console.log(dis);
            var show = false;
            var showGroupFieldDefault = false;


            if (target.is('span') || target.hasClass('vis-ev-col-fg-more')) {
                if (dis !== "show") {// If group is vlosed and user click on show more then no processing.
                    return;
                }
                show = true;
                if (divGroup.data("showmore") == 'Y') {
                    showGroupFieldDefault = true;
                    divGroup.data("showmore", "N");
                    viewMore.text(VIS.Msg.getMsg("ShowLess"));
                }
                else {
                    divGroup.data("showmore", "Y");
                    viewMore.text(VIS.Msg.getMsg("ShowMore"));
                }
            }
            else {
                if (divGroup.data("showmore") == 'N') {
                    showGroupFieldDefault = true;
                }

                if (dis === "show") {
                    divGroup.data("display", "hide");
                    viewMore.hide();
                    $(divGroup.children()[2]).addClass("vis-ev-col-fg-rotate");
                } else {

                    divGroup.data("display", "show");
                    viewMore.show();
                    show = true;
                    $(divGroup.children()[2]).removeClass("vis-ev-col-fg-rotate");
                }
            }
            displayFieldGroupControls(name, show, showGroupFieldDefault)

        };

        /**
         * show/hide controls
         * @param {any} name nam of group
         * @param {any} show flag to show controls
         * @param {any} showGroupFieldDefault  default state of field gp controls
         */
        function displayFieldGroupControls(name, show, showGroupFieldDefault) {
            var list = groupToCompsMap[name];

            for (var i = 0; i < list.length; i++) {
                var field = list[i];
                var ctrls = compToFieldMap[field.getColumnName()];

                for (var j = 0; j < ctrls.length; j++) {
                    ctrls[j].tag = show;
                    ctrls[j].setVisible(show && field.getIsDisplayed(true));
                }
                if (show && field.getIsDisplayed(true) && (field.getIsFieldgroupDefault() || showGroupFieldDefault))
                    fieldToCompParentMap[field.getColumnName()].show();
                else
                    fieldToCompParentMap[field.getColumnName()].hide();
            }
        }

        function addGroup(fieldGroup) {
            if (oldFieldGroup == null) {
                //addTop();
                oldFieldGroup = "";
            }

            if (fieldGroup == null || fieldGroup.length == 0 || fieldGroup.equals(oldFieldGroup))
                return false;

            var seqSuffix = Object.keys(groupToCompsMap).length + 1;
            oldFieldGroup = fieldGroup;// + "_" + seqSuffix;

            //setColumns(columnIndex);
            // clearRowSpan();
            addRow();
            reset();
            initCols(true);
            //<i class="fa fa-ellipsis-h"></i>
            var gDiv = $('<div class="vis-ev-col-fieldgroup" data-showmore="Y" data-name="' + fieldGroup
                + '" data-display="show" data-seqno="' + seqSuffix + '">' +
                '<span class="vis-ev-col-fg-hdr"  >' + fieldGroup + ' </span> ' +
                '<button class="vis-ev-col-fg-more">' + VIS.Msg.getMsg("ShowMore") + '</button>' +
                '<button class="vis-ev-fg-arrowBtn"><i class= "fa fa-angle-up"></button>' +
                '</span>' +
                '</div>');


            $td0.append(gDiv);
            $td0.addClass("vis-ev-col-end"+colCount+"");
            columnIndex = 0;

            //VLine fp = new VLine(fieldGroup);
            gDiv.on("click", onGroupClick);

            return true;
        };

        function addToCompList(comp) {

            if (oldFieldGroup != null && !oldFieldGroup.equals("")) {
                var compList = null;

                if (groupToCompsMap[oldFieldGroup]) {
                    compList = groupToCompsMap[oldFieldGroup];
                }

                if (compList == null) {
                    compList = [];
                    groupToCompsMap[oldFieldGroup] = compList;
                }
                compList.push(comp);
            }
        };

        function addCompToFieldList(name, comp) {

            if (compToFieldMap[name])
                compToFieldMap[name].push(comp);
            else {
                compToFieldMap[name] = [];
                compToFieldMap[name].push(comp);
            }
        }

        function addFieldToGroupList(mField) {

            if (oldFieldGroup != null && !oldFieldGroup.equals("")) {
                var fieldList = null;
                var seqSuffix = Object.keys(groupToCompsMap).length;
                var oldFg = oldFieldGroup + "_" + seqSuffix;
                if (groupToCompsMap[oldFg]) {
                    fieldList = groupToCompsMap[oldFg];
                }

                if (fieldList == null) {
                    //add unique entry
                    fieldList = [];
                    groupToCompsMap[oldFieldGroup + "_" + (seqSuffix + 1)] = fieldList;
                }
                fieldList.push(mField);
                if (!mField.getIsFieldgroupDefault()) {
                    fieldToCompParentMap[mField.getColumnName()].hide();
                }
            }
        };

        /**
         * Show hide field group
         * 
         * @param {any} hideFGFrom
         */
        function addFGDisplayBtn(hideFGFrom) {
            //addRow();
            reset();
            
            initCols(colCount < 2,colCount==2,colCount == 3, colCount >3);
            $spndisplayFG.data('position', hideFGFrom);
            _curParent.append($spndisplayFG);
            //hide fg group
            addRow();
            displayFiledGroup(hideFGFrom, true);
        };

        /**
         * show hide Field Group based on position
         * @param {any} position start seq no
         * @param {any} hide true if hide
         */
        function displayFiledGroup(position, hide) {
            var idx = 1;
            for (var prop in groupToCompsMap) {
                if (idx >= position) {
                    var ele = $table.find("[data-name='" + prop + "'],[data-seqno=" + idx + "]");
                    if (ele && ele.length > 0) {
                        if (hide) {
                            ele.hide();
                            displayFieldGroupControls(prop, false, false);
                        }
                        else {
                            ele.show();
                            displayFieldGroupControls(prop, true, ele.data("showmore") == 'N');
                        }
                    }
                }
                idx++;
            }
        };

        function onBtnFGClick() {



            var state = $spndisplayFG.data("state");
            var pos = $spndisplayFG.data("position");
            if (state == "Y") {
                //var scrollDiv = $table.parent();
                displayFiledGroup(pos, true);
                state = "N";
                $spndisplayFG.text(VIS.Msg.getMsg("More"));
            }
            else {
                var sPos = $table.parent().scrollTop();

                displayFiledGroup(pos, false);
                state = "Y";
                $spndisplayFG.text(VIS.Msg.getMsg("Less"));
                $table.parent().scrollTop(sPos);
            }
            $spndisplayFG.data("state", state);
        };

        function addActionGroup(mField, editor) {

            if (mField.getAGName() == "" || mField.getDisplayType() != VIS.DisplayType.Button || editor == null) {
                return null;
            }
            var agName = mField.getAGName().replace(' ', '');
            var agIns = null;
            if (agName in agGroupToAGInsMap) {
                agIns = agGroupToAGInsMap[agName];
            }
            else {
                agIns = new VIS.ActionGroup(agName, mField.getAGFontName(),mField.getAGStyle());
                agGroupToAGInsMap[agName] = agIns;
            }
            agIns.addItem(editor);
            return agIns;
        };

        this.addField = function (editor, mField) {

            var insertRow = false;

            /* Dont Add in control panel */
            if (mField.getIsLink() && mField.getIsRightPaneLink()) {
                allControls[++allControlCount] = editor;
                //allControls.push(editor);
                allLinkControls.push(editor);
                return;
            }

            if (mField.getDisplayType() == VIS.DisplayType.Button && mField.getAD_Reference_Value_ID() == 435) {
                var defaultValue = mField.getDefault(VIS.context, this.windowNo);
                toolbarButtonList[defaultValue] = editor;
            }


            var label = VIS.VControlFactory.getLabel(mField);
            if (label == null && editor == null)
                return;
            var sameLine = mField.getIsSameLine();

            var agInstance = addActionGroup(mField, editor);
            //Check for Action Group
            //var isAGNew = agInstance && agInstance.getItemCount() == 1;

            if (!agInstance) {
                if (addGroup(mField.getFieldGroup(), columnIndex)) {
                    sameLine = false;
                }
            }
            if (!agInstance || agInstance.getIsNewIns()) {
                if (sameLine) {
                    ++columnIndex;
                    if (columnIndex > colCount-1) {
                        sameLine = false;
                        insertRow = true;
                        // columnIndex = 0;
                    }
                    else if (columnIndex < 0) {
                        //addRow();
                        insertRow = true;
                        //columnIndex = 0;
                    }
                }
                else {
                    //columnIndex = 0;
                    insertRow = true;
                    //addRow();
                }
                adjustLayout(mField, insertRow);
            }

            if (label != null) {

                if (mField.getDescription().length > 0) {
                    //label.getControl().prop('title', mField.getDescription());
                }

                //addToCompList(label);
                //compToFieldMap[label.getName()] = mField;
                addCompToFieldList(mField.getColumnName(), label);
                allControls[++allControlCount] = label;
            }

            if (editor != null) {

                var fieldVFormat = mField.getVFormat();
                var formatErr = mField.getVFormatError();
                switch (fieldVFormat) {
                    case '': {
                        break;
                    }
                    default: {
                        editor.getControl().on("focusout", function (e) {
                            var patt = new RegExp(fieldVFormat);
                            if (VIS.DisplayType.IsString(mField.getDisplayType())) {
                                if ($(e.target).val() != null) {
                                    if ($(e.target).val().toString().trim().length > 0) {
                                        if (!patt.test($(e.target).val())) {
                                            if (!formatErr && formatErr.length > 0) {
                                                formatErr = VIS.Msg.getMsg('RegexFailed') + ":" + mField.getHeader()
                                            }
                                            //Work DOne to set focus in field whose value does not match with regular expression.
                                            VIS.ADialogUI.warn(formatErr, "", function () {
                                                $(e.target).focus();
                                            });

                                        }
                                    }
                                }
                            }
                        });
                    }
                }

                var count = editor.getBtnCount();

                //addToCompList(editor);
                // compToFieldMap[editor.getName()] = mField;
                addCompToFieldList(mField.getColumnName(), editor);
                allControls[++allControlCount] = editor;
            }

            //new design container
            if (label != null || editor != null) {

                var ctnr = _curParent;

                //check for agGroup
                if (agInstance) {
                    if (agInstance.getIsNewIns()) { //only Once
                        insertCWrapper(label, agInstance, ctnr, mField);
                    }
                    //apply style only
                    var customStyle = mField.getHtmlStyle();
                    if (editor != null && customStyle != "") {
                        editor.getControl().attr('style', customStyle);
                    }
                }
                else {
                    insertCWrapper(label, editor, ctnr, mField);
                }


                fieldToCompParentMap[mField.getColumnName()] = ctnr;
                addFieldToGroupList(mField);
                colDescHelpList[mField.getColumnName()] = {
                    // 'desc': mField.getDescription(),
                    'help': mField.getHelp()
                };
            }
        };

        this.flushLayout = function (hideFGFrom) {
            addRow();
            if (hideFGFrom > 0 && Object.keys(groupToCompsMap).length >= hideFGFrom) {
                addFGDisplayBtn(hideFGFrom);
            }
        };

        this.getRoot = function () {
            return $table;
        };

        this.getComponents = function () {
            return allControls;
        };

        this.getLinkComponents = function () {
            return allLinkControls;
        };

        this.setEnabled = function (action, enable) {
            if (Object.keys(toolbarButtonList).length > 0 && toolbarButtonList[action]) {
                //toolbarButtonList[action].css({
                //    "opacity": (enable ? 1 : .6),
                //    "pointer-events": (enable ? "unset" : "none")
                //});
                toolbarButtonList[action].setReadOnly(!enable);
            }
        };

        this.setVisible = function (colName, show) {
            if (fieldToCompParentMap[colName])
                show ? fieldToCompParentMap[colName].show() : fieldToCompParentMap[colName].hide();
        };

        this.showAsPopUp = function (parent) {

            var sPanel = parent;// this.getRoot();//.detach();

            sPanel.addClass("vis-ad-w-p-vc-ev-grid-abs");
            var img = $('<span class="vis-ad-w-p-vc-ev-grid-abs-close"><i class="vis vis-close"></span>');
            sPanel.append(img);

            img.on('click', function () {
                sPanel.removeClass("vis-ad-w-p-vc-ev-grid-abs");
                img.remove();
            })

            // var chDia = new VIS.ChildDialog();
            // chDia.setTitle("");
            // var wdth = window.innerWidth - 200;
            // var hgt = window.innerHeight - 100;
            //// var diaCtr = $('<div style="max-height: ' + hgt + 'px; max-width: ' + wdth + 'px; min-width: 150px; min-height: 60px;"></div>');
            //// diaCtr.append(message);
            // chDia.setContent(this.getRoot());



            // chDia.close = function () {
            //    // sPanel.detach();
            //     parent.append(sPanel);
            // }
            // chDia.show();
            // chDia.hidebuttons();
        };

        this.setColumnLayout = function (count) {
            colCount = count;
            if (colCount < 1 || colCount > 4) {
                colCount = 4;
            };
            $table[0].style.gridTemplateColumns='repeat(' + colCount + ', 1fr)';
        };

        this.dispose = function () {
            $table.off("click", "label", onInfoClick);
            $table.off();
            colDescHelpList = {};
            if (lastPopover) {
                lastPopover.popover('dispose');
            }
            lastPopover = null;

            allLinkControls.length = 0;
            allLinkControls = null;

            while (allControls.length > 0) {
                allControls.pop().dispose();
            };



            // console.log(compToFieldMap);
            for (var p in compToFieldMap) {
                compToFieldMap[p] = null;
                delete compToFieldMap[p];
            }
            compToFieldMap = null;
            fieldToCompParentMap = {};
            fieldToCompParentMap = null;

            // console.log(groupToCompsMap);
            for (var p1 in groupToCompsMap) {
                groupToCompsMap[p1].length = 0;
                groupToCompsMap[p1] = null;
                delete groupToCompsMap[p];
            }
            groupToCompsMap = null;

            allControlCount = null;
            allControls = null;
            $table.remove();
            $table = null;
            this.addField = null;
            $spndisplayFG = null;
            // addRow = null;
            //addToCompList = null;
        };

    };

    /**
     * create wrapeer div and add conrols and label in parent div
     * @param {any} label label to add
     * @param {any} editor controls to add
     * @param {any} parent current row/column div
     * @param {any} mField model field 
     */
    function insertCWrapper(label, editor, parent, mField) {
        var customStyle = mField.getHtmlStyle();

        var wraper = '<div class="input-group vis-input-wrap">';
        //special case for textarea and image button strech height to 100%
        if (editor && (editor.getControl()[0].tagName == 'TEXTAREA' || editor.getControl().hasClass("vis-ev-col-img-ctrl"))) {
            wraper = '<div class="input-group vis-input-wrap vis-ev-full-h">';
        }

        var ctrl = $(wraper);

        if (!mField.getIsLink() && mField.getDisplayType() != VIS.DisplayType.Button) {
            if (mField.getShowIcon() && (mField.getFontClass() != '' || mField.getImageName() != '')) {

                var btns = ['<div class="input-group-prepend"><span class="input-group-text vis-color-primary">'];
                if (mField.getFontClass() != '')
                    btns.push('<i class="' + mField.getFontClass() + '"></i>');
                else
                    btns.push('<img src="' + VIS.Application.contextUrl + 'Images/Thumb16x16/' + mField.getImageName() + '"></img>');
                btns.push('</span></div>');
                ctrl.append(btns.join(' '));

            }
        }

        if (!(editor && editor instanceof VIS.ActionGroup) && editor != null && customStyle != "") {
            if (mField.getDisplayType() == VIS.DisplayType.ProgressBar) {
                editor.setHtmlStyle(customStyle);
            } else {
                editor.getControl().attr('style', customStyle);
            }
        }

        var ctrlP = $("<div class='vis-control-wrap'>");

        if (editor && (editor.getControl()[0].tagName == 'INPUT' || editor.getControl()[0].tagName == "SELECT" ||
            editor.getControl()[0].tagName == 'TEXTAREA' || editor.getControl()[0].className == 'vis-progressCtrlWrap')
            && editor.getControl()[0].type != 'checkbox') {
            //editor.getControl().addClass("custom-select");
            ctrlP.append(editor.getControl().attr("placeholder", " ").attr("data-placeholder", ""));
            if (label != null) { // && mField.getDisplayType() != VIS.DisplayType.TelePhone)
                ctrlP.append(label.getControl());
            }
        }
        else {
            if (label != null)
                ctrlP.append(label.getControl());
            if (editor)
                ctrlP.append(editor.getControl());
        }

        
            if (!(editor && editor instanceof VIS.ActionGroup) && mField.getDisplayType() != VIS.DisplayType.Label && !mField.getIsLink() && mField.getDisplayType() != VIS.DisplayType.TelePhone) { // exclude Label display type
            //ctrlP.append("<span class='vis-ev-ctrlinfowrap' data-colname='" + mField.getColumnName() + "' title='" + mField.getDescription() + "'  tabindex='-1' data-toggle='popover' data-trigger='focus'>" +
             //    "<i class='vis vis-info' aria-hidden='true'></i></span'>");
                if (label != null) {
                    label.getControl().append("<span class='vis-ev-ctrlinfowrap' data-colname='" + mField.getColumnName() + "' title='" + mField.getDescription() + "'  tabindex='-1' data-toggle='popover' data-trigger='focus'>" +
                        "<i class='vis vis-info' aria-hidden='true'></i></span'>");
                }
        }

        //if (editor && mField.getDisplayType() == VIS.DisplayType.ProgressBar) {
        //    if (customStyle != "") {
        //        editor.getProgressOutput().attr('style', customStyle);
        //    }
        //    ctrlP.prepend(editor.getProgressOutput());
        //}

        ctrlP.append("<span class='vis-ev-col-msign'><i class='fa fa-exclamation' aria-hidden='true'></span'>");
        ctrl.append(ctrlP);
        if (editor) {
            var count = editor.getBtnCount();
            if (count > 0) {
                editor.getControl().attr("data-hasBtn", " ");
                var i = 0;
                while (i < count) {
                    var btn = editor.getBtn(i);
                    if (btn != null) {
                        ctrl.append($('<div class="input-group-append">').append(btn));
                    }
                    ++i;
                }
                count = -1;
                i = 0;
            }
        }
        parent.append(ctrl);

        //Init Control
        if (mField.getDisplayType() == VIS.DisplayType.TelePhone) {
            editor.init();
            ctrlP.css("z-index", "auto");
        }
    }

    function ActionGroup(name, fontname,style,isHdrItem) {
        this.name = name;
        this.vEditors = [];
        var $root = null;
        var $actionList = null;
      
        var id = "vis_ev_col_ag_btn" + Math.random();
        var popup = null;
        function InitUI() {

            var styl = '';
            if (style && style != '') {
                styl = ' style=' + style;
            }
            
            var html = '<div class="dropdown vis-ev-col-actiongroup" >' 
                + '<span class="dropdown-toggle btn vis-ev-col-ag-dropdown-btn" id="' + id + '"' + styl + '  data-toggle="dropdown">'
                + '<i class="' + fontname + '"></i>'
                + name + '</span>'
                + '<div class="dropdown-menu dropdown-menu-right vis-ev-col-ag-div" aria-labelledby="' + id + '">'
                + '<ul class="vis-ev-col-ag-btn-list">'
                + '</ul>'
                + '</div>'
                + '</div>';

            

           //var  html = '<div class="vis-ev-col-actiongroup">'
           //                 + ' <div id="' + id + '" class="vis-ev-col-ag-dropdown-btn btn dropdown-toggle"  '+styl+'>'
           //                  + '<span class="' + fontname + '"></span>'
           //                      + name + '<span class="caret"></span>'
           //           +'</div> '
           //          //+ '<div class="dropdown-menu" aria-labelledby="' + id + '" > '
           //          //  + '<ul class="vis-ev-col-ag-btn-list">'
           //          //  + '</ul>'
           //          //+ '</div>'
           //    + '</div>';

            $root = $(html);
            if (!isHdrItem) {
                $root.find(".vis-ev-col-ag-dropdown-btn").addClass("vis-ev-col-ag-dropdown-btn-color");
            }   

            //$actionList = $("<ul class='vis-apanel-rb-ul'>");

            $actionList = $root.find('.vis-ev-col-ag-btn-list');

            
        };

        InitUI();

        function events() {
            //$root.on('click', function (e) {
            //    $root.w2overlay($actionList.clone(true));
            //});
        }
        events();

        this.getControl = function () {
            return $root;
        }
        this.getActionList = function () {
            return $actionList;
        }
        this.dispose = function () {
            $actionList.remove();
            $root.remove();
        }

    }
    ActionGroup.prototype.addItem = function (veditor) {
        this.vEditors.push(veditor);
        var li = $('<li>');
        li.append(veditor.getControl());
        this.getActionList().append(li);
    };
    ActionGroup.prototype.getItemCount = function () {
        return this.vEditors.length;
    };

    ActionGroup.prototype.getBtnCount = function () {
        return 0;
    }

    ActionGroup.prototype.getIsNewIns = function () {
        return this.getItemCount() == 1;
    }

    VIS.ActionGroup = ActionGroup;

}(VIS, jQuery));


