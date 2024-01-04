/* Purpose: Open Tab in Dialog
 * Developer: VIS228 Date:21-Nov-2023
 */

; (function (VIS, $) {
    function TabDialog(gc, WhereClause) {
        this.bufferList = [];
        this.grid;
        var self = this;
        var root = $("<div id='TabDialog' style='width:100%;height:100%'>");
        var baseUrl = VIS.Application.contextUrl;
        var buffer = null;
        var gTab = gc.gTab;

        this.show = function () {
            ch = new VIS.ChildDialog();
            ch.setContent(root);
            ch.setHeight(500);
            ch.setWidth('80%');
            ch.setTitle(gTab.getName());
            ch.setModal(true);
            ch.onClose = function () {
                // console.log(this.grid);
                self.grid.destroy();
                root.empty();
                root = null;
            };
            ch.show();
            self.gridSetup(gc.getMTab().gridTable.gridFields, root, 'TabDialog', gc.getMTab(), gc);
        }

        //this.show();


        this.gridSetup = function (grdFields, $container, name, mTab, gc) {

            if (!mTab.getIsDisplayed(true))
                return 0;

            this.id = name;
            //this.aPanel = aPanel;
            this.$container = $container;

            var oColumns = [];
            var mField = null;
            var size = grdFields.length;
            var visibleFields = 0;

            var mFields = grdFields.slice(0);


            mFields.sort(function (a, b) { return a.getMRSeqNo() - b.getMRSeqNo() });

            var j = -1;
            for (var i = 0; i < mFields.length; i++) {
                mField = mFields[i];
                if (mField == null)
                    continue;
                var columnName = mField.getColumnName();
                var displayType = mField.getDisplayType();

                //if (VIS.DisplayType.ID == displayType || columnName == "Created" || columnName == "CreatedBy"
                //                                    || columnName == "Updated" || columnName == "UpdatedBy") {
                //    if (!mField.getIsDisplayed()) {
                //        continue;
                //    }
                //}

                ++j;
                if (mField.getIsKey())
                    this.indexKeyColumn = j;
                else if (columnName.equals("IsActive"))
                    this.indexActiveColumn = j;
                else if (columnName.equals("Processed"))
                    this.indexProcessedColumn = j;
                else if (columnName.equals("AD_Client_ID"))
                    this.indexClientColumn = j;
                else if (columnName.equals("AD_Org_ID"))
                    this.indexOrgColumn = j;

                var isDisplayed = mField.getIsDisplayedMR ? mField.getIsDisplayedMR() : mField.getIsDisplayed();

                var mandatory = mField.getIsMandatory(false);      //  no context check
                var readOnly = mField.getIsReadOnly();
                var updateable = mField.getIsEditable(false);      //  no context check
                //int WindowNo = mField.getWindowNo();




                //  Not a Field
                if (mField.getIsHeading())
                    continue;

                var oColumn = {

                    resizable: true,
                    selfCellStyleRender: false  /* self evalauate Style conditions*/
                }

                oColumn.gridField = mField;

                if (readOnly || !updateable) {
                    oColumn.readOnly = true;   //
                }

                oColumn.caption = mField.getHeader();
                if (mandatory) {
                    oColumn.caption += '<sup style="color:red;font-size: 11px;top: 0;">*</sup>';
                }
                oColumn.field = columnName.toLowerCase();
                oColumn.hidden = !isDisplayed;
                var columnWidth = oColumn.gridField.getColumnWidth();

                if (columnWidth) {
                    oColumn.size = columnWidth + 'px';
                }
                else {
                    oColumn.size = '100px';
                }

                if (mField.getIsIdentifier() && mField.getDisplayType() != VIS.DisplayType.Image && this.hyperLinkCell == null) {
                    if (oColumn.hidden == false) {
                        this.hyperLinkCell = columnName;
                        oColumn.style = 'text-decoration:underline; color:rgba(var(--v-c-primary), 1) !important; cursor:pointer';
                    }
                }
                else if (mField.getDisplayType() == VIS.DisplayType.TelePhone) {
                    if (oColumn.hidden == false)
                        oColumn.style = 'text-decoration:underline; color:rgba(var(--v-c-primary), 1) !important; ';
                }

                if (displayType == VIS.DisplayType.Amount) {
                    oColumn.sortable = true;
                    oColumn.customFormat = VIS.DisplayType.GetNumberFormat(displayType);
                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (!val) {
                            val = 0; // show zero if null
                        }
                        //if (record.changes && typeof record.changes[f] != 'undefined') val = record.changes[f];
                        val = parseFloat(val).toLocaleString(undefined, {
                            'minimumFractionDigits': oColumns[colIndex].customFormat.getMinFractionDigit(),
                            'maximumFractionDigits': oColumns[colIndex].customFormat.getMaxFractionDigit()
                        });
                        return '<div data-type="int">' + val + '</div>';
                    };
                    //oColumn.caption = 'class="vis-control-wrap-int-amount"';
                }
                else if (displayType == VIS.DisplayType.Integer) {
                    oColumn.sortable = true;
                    oColumn.customFormat = VIS.DisplayType.GetNumberFormat(displayType);
                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;
                        var val = record[f];

                        if (!val)
                            return;

                        //if (record.changes && typeof record.changes[f] != 'undefined') val = record.changes[f];
                        //val = parseFloat(val).toLocaleString(undefined, {
                        //    'minimumFractionDigits': oColumns[colIndex].customFormat.getMinFractionDigit(),
                        //    'maximumFractionDigits': oColumns[colIndex].customFormat.getMaxFractionDigit()
                        //});
                        return '<div data-type="int">' + val + '</div>';
                    };
                    //oColumn.caption = 'class="vis-control-wrap-int-amount"';
                }
                else if (displayType == VIS.DisplayType.ProgressBar) {
                    oColumn.sortable = true;
                    oColumn.selfCellStyleRender = true;
                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;

                        var gField = oColumns[colIndex].gridField;
                        var style = '';
                        if (gField.getStyleLogic() != '')
                            style = self.evaluateStyleLogic(index, gField.getStyleLogic());
                        if (!style) style = '';

                        var val = record[f];
                        //var maxVal = gField.getMaxValue();
                        //var minVal = gField.getMinValue();
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }
                        //return '<input id="rng' + index + '" type="range" min="' + minVal + '" max="' + maxVal + '" disabled="disabled" value="' + val + '" /><div style="position: absolute"><output class="vis-grid_progress_output"> ' + val+'</output></div>';

                        return '<div class="vis-progress-gridbar" style="' + style + '">' +
                            '<div class="vis-progress-percent-bar" style = "width:' + (val || 0) + '%;' + style + '" ></div>' +
                            '<div class="vis-progress-gridoutput" > ' + (val || '') + '</div></div >';
                    }
                }
                else if (VIS.DisplayType.IsNumeric(displayType)) {
                    oColumn.sortable = true;
                    oColumn.customFormat = VIS.DisplayType.GetNumberFormat(displayType);
                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (!val)
                            return;
                        //if (record.changes && typeof record.changes[f] != 'undefined') val = record.changes[f];
                        // return  Globalize.format(Number(oColumns[colIndex].customFormat.GetFormatedValue(val)));
                        val = parseFloat(val).toLocaleString(undefined, {
                            'minimumFractionDigits': oColumns[colIndex].customFormat.getMinFractionDigit(),
                            'maximumFractionDigits': oColumns[colIndex].customFormat.getMaxFractionDigit()
                        });

                        return '<div data-type="int">' + val + '</div>';
                    };
                    // oColumn.style = 'text-align: right';
                    // oColumn.caption = 'class="vis-control-wrap-int-amount"';
                }
                //	YesNo
                else if (displayType == VIS.DisplayType.YesNo) {

                    oColumn.sortable = true;
                    var lCol = columnName.toLowerCase();
                    if (oColumn.gridField.getIsSwitch()) {
                        oColumn.render = "switch";
                        //oColumn.render = function (record, index, colIndex) {

                        //    var chk = (record[oColumns[colIndex].field]) ? "checked" : "";
                        //    //console.log(chk);
                        //   // return '<input type="checkbox" ' + chk + ' onclick="var obj = w2ui[\'' + name + '\'];     obj.editChange.call(obj, this, ' + index + ', ' + colIndex +', event)" class="vis-switch"><i for="switch" onclick="$(this).prev().click();"   class="vis-switchSlider">Toggle</i></div>';
                        //}
                    }

                    oColumn.editable = { type: 'checkbox' };

                }
                //	String (clear/password)
                else if (displayType == VIS.DisplayType.String
                    || displayType == VIS.DisplayType.Text || displayType == VIS.DisplayType.TextLong
                    || displayType == VIS.DisplayType.Memo) {


                    oColumn.sortable = true;
                    //if (oColumn.hidden == false && (this.hyperLinkCell[name] == "undefined" || this.hyperLinkCell[name] == null)) {
                    //    if (columnName.toLowerCase() == "value" || columnName.toLowerCase() == "name" || columnName.toLowerCase() == "documentno") {
                    //        this.hyperLinkCell[name] = columnName;
                    //        oColumn.style = 'text-decoration:underline; color:rgba(var(--v-c-primary), 1) !important; cursor:pointer';
                    //    }
                    //}

                    if (mField.getIsEncryptedField()) {
                        oColumn.render = function (record, index, colIndex) {
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }

                            var val = record[oColumns[colIndex].field];
                            if (val || (val === 0))
                                return val.replace(/\w|\W/g, "*");
                            return "";
                        }
                    }
                    else if (mField.getObscureType()) {
                        oColumn.render = function (record, index, colIndex) {
                            var val = record[oColumns[colIndex].field];
                            if (val || (val === 0))
                                return VIS.Env.getObscureValue(oColumns[colIndex].gridField.getObscureType(), val);
                            return "";
                        }
                    }
                    else {
                        oColumn.render = function (record, index, colIndex) {
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }



                            if (val || val == 0) {
                                //if (d.toString().indexOf('<') > -1)
                                //    return "";
                                val = w2utils.encodeTags(val);
                                return val;
                            }
                            return "";
                        }
                    }

                }

                else if (VIS.DisplayType.IsLookup(displayType) || displayType == VIS.DisplayType.ID) {

                    oColumn.sortable = true;


                    oColumn.lookup = mField.getLookup();

                    if (isDisplayed) {
                        oColumn.render = function (record, index, colIndex) {
                            var l = oColumns[colIndex].lookup;

                            var f = oColumns[colIndex].field;
                            var val = record[f];

                            var customStyle = oColumns[colIndex].gridField.getGridImageStyle();
                            var winNo = oColumns[colIndex].gridField.getWindowNo();
                            oColumns[colIndex]['customClass'] = '';
                            var customClass;
                            if (customStyle) {
                                customClass = oColumns[colIndex]['customClass'];
                                if (!customClass) {
                                    oColumns[colIndex]['customClass'] = 'vis-grd-custom-' + oColumns[colIndex].gridField.getAD_Column_ID() + winNo;
                                    customClass = '.vis-grd-custom-' + oColumns[colIndex].gridField.getAD_Column_ID() + winNo + "{" + customStyle + "}";
                                    var styleTag = document.createElement('style');
                                    styleTag.type = 'text/css';
                                    styleTag.innerHTML = customClass;
                                    $($('head')[0]).append(styleTag);
                                }
                            }

                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                //val = record.changes[f];
                            }
                            var d;
                            if (l) {
                                // In case of multisearch, show all names separated by commas in gridview.
                                if (l.displayType == VIS.DisplayType.MultiKey) {
                                    if (val) {
                                        var arr = val.toString().split(',');
                                        var sb = "";

                                        for (var i = 0, j = arr.length; i < j; i++) {
                                            var valu = arr[i];
                                            if (!isNaN(valu)) {
                                                valu = Number(valu);
                                            }
                                            if (sb.length == 0) {
                                                sb += l.getDisplay(valu);
                                                continue;
                                            }
                                            sb += ", " + l.getDisplay(valu);
                                        }
                                        d = sb;
                                    }
                                    else {
                                        d = l.getDisplay(val, true, true);
                                    }
                                }
                                else {
                                    d = l.getDisplay(val, true, true);
                                }
                                //if (d.startsWith("<"))
                                //  d = l.getDisplay(nd, false);
                                //d = w2utils.encodeTags(d);
                            }

                            var strDiv = "";
                            if (l && VIS.DisplayType.List == l.displayType) {

                                var hue = Math.floor(Math.random() * (360 - 0)) + 0;
                                var v = 60; //Math.floor(Math.random() * 16) + 75;
                                var pastel = 'hsl(' + hue + ', 100%,' + v + '%)';

                                var lType = l.getLovIconType(val, true);

                                var listIcon = l.getLOVIconElement(val, true);
                                var highlightChar = '';
                                if (!listIcon) {
                                    //highlightChar = d.substring(0, 1);

                                    if (highlightChar.length == 0)
                                        var txt = d.trim().split(' ');
                                    highlightChar = txt[0].substring(0, 1).toUpper();
                                    if (txt.length > 1) {
                                        highlightChar += txt[txt.length - 1].substring(0, 1).toUpper();
                                    } else {
                                        highlightChar = txt[0].substring(0, 2).toUpper();
                                    }
                                }
                                // If both , then show text and image
                                if (lType == "B") {
                                    strDiv = "<div class='vis-grid-td-icon-grp'>";

                                    if (listIcon) {
                                        strDiv += "<div class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon'> " + listIcon + "</div> ";
                                    }
                                    else {
                                        strDiv += "<div style='background-color:" + pastel + "' class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon'><span>" + highlightChar + "</span></div>";
                                    }
                                    strDiv += "<span> " + d + "</span ><div>";
                                }
                                // if Text, then show text only
                                else if (lType == "T") {
                                    return d;
                                }
                                //Show icon only
                                else if (lType == "I") {
                                    strDiv = "<div class='vis-grid-td-icon-grp' style='Justify-Content:center'>";
                                    if (listIcon) {
                                        strDiv += "<div class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon'> " + listIcon + "</div> ";
                                    }
                                    else {
                                        strDiv += "<div style='background-color:" + pastel + "' class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon'><span>" + highlightChar + "</span></div>";
                                    }
                                    strDiv += "<div>";
                                }
                            }

                            else
                                // Based on sequence of image in idenitifer, perform logic and display image with text
                                if (l && l.gethasImageIdentifier()) {
                                    var imgIndex = d.indexOf("Images/");

                                    if (imgIndex == -1)
                                        return d;

                                    //Find Image from Identifier string 
                                    var img = d.substring(imgIndex + 7, d.lastIndexOf("^^"));
                                    img = VIS.Application.contextUrl + "Images/Thumb32x32/" + img;

                                    //Replace Image string with ^^^, so that ^^^ can be used to split Rest of identifer value
                                    d = d.replace("^^" + d.substring(imgIndex, d.lastIndexOf("^^") + 2), "^^^")
                                    if (d.indexOf("Images/") > -1)
                                        d = d.replace(d.substring(imgIndex, d.lastIndexOf("^^") + 2), "^^^");

                                    d = d.split("^^^");

                                    //Start HTMl string to be rendered inside Cell
                                    strDiv = "<div class='vis-grid-td-icon-grp'>";
                                    var highlightChar = '';

                                    //Now 'd' may contains identifier values to be displayed before and after image
                                    for (var c = 0; c < d.length; c++) {
                                        //random pastel color generator 
                                        var hue = Math.floor(Math.random() * (360 - 0)) + 0;
                                        var v = 60; //Math.floor(Math.random() * 16) + 75;
                                        var pastel = 'hsl(' + hue + ', 100%,' + v + '%)';

                                        if (d[c].trim().length > 0) {
                                            //If highlightChar is not found, then get it from first item encounterd.
                                            if (highlightChar.length == 0)
                                                var txt = d[c].trim().split(' ');
                                            highlightChar = txt[0].substring(0, 1).toUpper();
                                            if (txt.length > 1) {
                                                highlightChar += txt[txt.length - 1].substring(0, 1).toUpper();
                                            } else {
                                                highlightChar = txt[0].substring(0, 2).toUpper();
                                            }
                                            //If image contains nothing.png that means image not found in identfier and 
                                            //we will Display highlightChar
                                            if (c > 0 && img.indexOf("nothing.png") > -1 && highlightChar.length > 0) {

                                                strDiv += "<div style='background-color:" + pastel + "' class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon' ><span>" + highlightChar + "</span></div>";
                                            }
                                            strDiv += "<span>" + d[c] + "</span>";
                                        }
                                        //If image found, then display that image.
                                        if (c == 0 || img.indexOf("nothing.png") > -1) {
                                            if (img.indexOf("nothing.png") == -1) {
                                                strDiv += "<div style='background-color:" + pastel + "' class='" + oColumns[colIndex]['customClass'] + " vis-grid-row-td-icon'"
                                                    + " > <img src='" + img +
                                                    "'></div > ";
                                                // "' onerror='this.style.display=\"none\"' ></img></div > ";
                                            }

                                        }
                                    }
                                    +"</div > ";

                                }


                            if (strDiv == "")
                                return d;



                            return strDiv;
                            //return '<span>' + d + '</span>';
                        }

                    }
                }
                //Date /////////
                else if (VIS.DisplayType.IsDate(displayType)) {

                    oColumn.sortable = true;
                    oColumn.displayType = displayType;

                    //oColumn.render = 'date';
                    oColumn.render = function (record, index, colIndex) {
                        var col = oColumns[colIndex];
                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }



                        if (val)
                            if (col.displayType == VIS.DisplayType.Date) {
                                var d = new Date(val);
                                d.setMinutes(d.getTimezoneOffset() + d.getMinutes());
                                //val = Globalize.format(d, 'd');
                                val = d.toLocaleDateString();
                            }
                            else if (col.displayType == VIS.DisplayType.DateTime)
                                val = new Date(val).toLocaleString();
                            //val = Globalize.format(new Date(val), 'f');
                            else
                                val = new Date(val).toTimeString();
                        //val = Globalize.format(new Date(val), 't');
                        else val = "";
                        return val;
                    }
                }

                else if (displayType == VIS.DisplayType.Location || displayType == VIS.DisplayType.Locator) {

                    oColumn.sortable = true;

                    oColumn.lookup = mField.getLookup();
                    if (isDisplayed) {
                        oColumn.render = function (record, index, colIndex) {
                            var l = oColumns[colIndex].lookup;
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }


                            if (l) {
                                val = l.getDisplay(val, true);
                                val = w2utils.encodeTags(val);
                            }

                            return val;
                        }
                    }
                }
                else if (displayType == VIS.DisplayType.AmtDimension) {

                    oColumn.sortable = true;
                    oColumn.lookup = mField.getLookup();
                    if (isDisplayed) {
                        oColumn.render = function (record, index, colIndex) {
                            var l = oColumns[colIndex].lookup;
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }


                            if (l) {
                                val = l.getDisplay(val, true);
                                val = w2utils.encodeTags(val);
                            }

                            return val;
                        }
                    }
                }
                else if (displayType == VIS.DisplayType.ProductContainer) {

                    oColumn.sortable = true;
                    oColumn.lookup = mField.getLookup();
                    if (isDisplayed) {
                        oColumn.render = function (record, index, colIndex) {
                            var l = oColumns[colIndex].lookup;
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }


                            if (l) {
                                val = l.getDisplay(val, true);
                                val = w2utils.encodeTags(val);
                            }

                            return val;
                        }
                    }
                }

                else if (displayType == VIS.DisplayType.Account || displayType == VIS.DisplayType.PAttribute) {

                    oColumn.sortable = true;

                    oColumn.lookup = mField.getLookup();
                    if (isDisplayed) {
                        oColumn.render = function (record, index, colIndex) {
                            var l = oColumns[colIndex].lookup;
                            var f = oColumns[colIndex].field;
                            var val = record[f];
                            if (record.changes && typeof record.changes[f] != 'undefined') {
                                val = record.changes[f];
                            }



                            if (l) {
                                val = l.getDisplay(val, true);
                                val = w2utils.encodeTags(val);
                            }
                            return val;
                        }
                    }
                }

                else if (displayType == VIS.DisplayType.PAttribute) {

                    oColumn.sortable = true;

                    oColumn.render = 'int';
                }

                else if (displayType == VIS.DisplayType.Button) {

                    oColumn.sortable = true;

                    //oColumn.render = function (record) {
                    //    return '<div>button</div>';
                    //}
                }

                else if (displayType == VIS.DisplayType.Image) {

                    oColumn.sortable = true;

                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;

                        var customStyle = oColumns[colIndex].gridField.getGridImageStyle();
                        var winNo = oColumns[colIndex].gridField.getWindowNo();
                        var customClass;
                        if (customStyle) {
                            customClass = oColumns[colIndex]['customClass'];
                            if (!customClass) {
                                oColumns[colIndex]['customClass'] = 'vis-grd-custom-' + oColumns[colIndex].gridField.getAD_Column_ID() + winNo;
                                customClass = '.vis-grd-custom-' + oColumns[colIndex].gridField.getAD_Column_ID() + winNo + "{" + customStyle + "}";
                                var styleTag = document.createElement('style');
                                styleTag.type = 'text/css';
                                styleTag.innerHTML = customClass;
                                $($('head')[0]).append(styleTag);
                            }
                        }

                        var val = record["imgurlcolumn" + f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }

                        if (!val) {
                            val = '<div class="vis-grid-row-td-icon-center">-</div>';
                            return val;
                        }
                        //return VIS.Msg.getElement1('AD_Image_ID') + '-' + val;
                        val = val.toString().replace("Images/", "Images/Thumb32x32/");
                        //var img = $('<img>').attr("src", VIS.Application.contextUrl + val);
                        var img;
                        if (customClass) {
                            img = '<div class="vis-grid-row-td-icon-center"><div class="' + oColumns[colIndex]['customClass'] + ' vis-grid-row-td-icon"><img src="' + VIS.Application.contextUrl + val + '"></div></div>';
                        }
                        else {
                            img = '<div class="vis-grid-row-td-icon-center"><div class="vis-grid-row-td-icon"><img src="' + VIS.Application.contextUrl + val + '"></div></div>';
                        }
                        return img;
                    }
                }

                else if (VIS.DisplayType.IsLOB(displayType)) {

                    oColumn.sortable = true;

                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }

                        if (!val) {
                            val = "";
                        }
                        return "#" + val.toString().length;
                    }
                }

                else if (VIS.DisplayType.TelePhone == displayType) {
                    oColumn.sortable = true;

                    oColumn.render = function (record, index, colIndex) {

                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }

                        if (val) {

                            return VIS.VTelePhoneInstance.getHtml(val, true);
                        }
                        return "";
                    }
                }

                else if (VIS.DisplayType.Color == displayType) {
                    oColumn.sortable = true;

                    oColumn.render = function (record, index, colIndex) {

                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }

                        if (val) {

                            return '<div style="background-color:' + val + ';" ></div>';
                        }
                        return "";
                    }
                }

                else { //all text Type Columns

                    oColumn.sortable = true;

                    oColumn.render = function (record, index, colIndex) {
                        var f = oColumns[colIndex].field;
                        var val = record[f];
                        if (record.changes && typeof record.changes[f] != 'undefined') {
                            val = record.changes[f];
                        }

                        if (val || val == 0) {
                            //if (d.toString().indexOf('<') > -1)
                            //    return "";
                            val = w2utils.encodeTags(val);
                            return val;
                        }
                        return "";
                    }
                }


                if (mField.getHtmlStyle() != "") {
                    oColumn.style = mField.getHtmlStyle();
                }

                if (!oColumn.hidden) {
                    visibleFields++;
                }
                oColumns.push(oColumn);
                oColumn.columnName = columnName;


                //var iControl = VIS.VControlFactory.getControl(mTab, mField, false, false, false);
                //iControl.setReadOnly(false);


                //if (!oColumn.editable) {
                //    oColumn.editable = { type: 'custom', ctrl: iControl };
                //}


                //iControl.addVetoableChangeListener(gc);

                //if (iControl instanceof VIS.Controls.VButton) {
                //    iControl.addActionListner(aPanel);
                //}
            }

            if (visibleFields > 0) {

                var w = Math.floor(100 / visibleFields);
                for (var p in oColumns) {
                    if (oColumns[p].hidden) {
                    }
                    else {
                        if (!oColumns[p].size < 0) {

                            oColumns[p].size = w + '%';
                            //oColumns[p].size = 150+'px';
                            //oColumns[p].size = w + '%';
                            oColumns[p].min = 100;
                        }
                        //if (oColumns[p].gridField.getIsSwitch()) {
                        //    oColumns[p].editable = { type: 'checkbox' };
                        //}

                        if (this.hyperLinkCell == null) {
                            this.hyperLinkCell = oColumns[p].columnName;
                            oColumns[p].style = 'text-decoration:underline; color:rgba(var(--v-c-primary), 1) !important; cursor:pointer';
                        }
                    }
                }
            }


            var dataIn = {
                page: 0, pageSize: 0,
                treeID: 0,
                treeNode_ID: 0, card_ID: 0, ad_Tab_ID: gTab.getAD_Tab_ID(), tableName: gTab.getTableName()
            };


            $.ajax({
                url: baseUrl + "Window/GetWindowRecords",
                type: 'post',
                data: {
                    'ctx': VIS.context.getWindowCtx(gc.windowNo),
                    Columns: Object.keys(gc.getColumnNames()),
                    TableName: gTab.getTableName(),
                    WhereClause: VIS.secureEngine.encrypt(WhereClause),
                    ObscureFields: [],
                    sqlIn: dataIn,
                    AD_Window_ID: gTab.getAD_Window_ID(),
                    WindowNo: gc.windowNo,
                    AD_Tab_ID: gTab.getAD_Tab_ID(),
                    SummaryOnly: false,
                    Encryptedfields: [],
                    AD_Table_ID: gTab.getAD_Table_ID(),
                    MaxRows: 0,
                    DoPaging: false
                },
                success: function (jString) {
                    var retObj = JSON.parse(jString);
                    try {

                        var lookupDirect = null;
                        //var cardViewData = null;
                        if (retObj) {
                            buffer = new VIS.DB.DataSet().toJson(retObj.Tables);
                            lookupDirect = retObj.LookupDirect;
                            //cardViewData = retObj.CardViewTpl;
                        }
                        if (buffer != null) {
                            var count = 0;

                            if (buffer.getTables().length != 0) {

                                var rows = buffer.getTable(0).getRows();
                                var columns = buffer.getTable(0).getColumnsName();
                                for (var row = 0; row < rows.length; row++) {
                                    var cells = rows[row].getJSCells();
                                    for (var cell = 0; cell < columns.length; cell++) {

                                        cells[columns[cell]] = gTab.gridTable.readDataOfColumn(columns[cell], cells[columns[cell]]);
                                    }
                                    cells['recid'] = (row + 1);
                                    cells['editable'] = false;
                                    //cells.recid = row;
                                    self.bufferList[row] = cells;
                                    count++;
                                    //break;
                                }
                                // console.log(buffer.getTable(0).lookupDirect);
                            }
                            buffer.dispose();
                            buffer = null;

                            if (lookupDirect)
                                VIS.MLookupCache.addRecordLookup(gc.windowNo, gTab.getTabNo(), lookupDirect);


                            self.grid = self.$container.w2grid({
                                name: name,
                                columns: oColumns,
                                records: self.bufferList,
                                editable: false,
                                show: {

                                    toolbar: false,  // indicates if toolbar is v isible
                                    columnHeaders: true,   // indicates if columns is visible
                                    lineNumbers: false,  // indicates if line numbers column is visible
                                    selectColumn: true,  // indicates if select column is visible
                                    toolbarReload: false,   // indicates if toolbar reload button is visible
                                    toolbarColumns: true,   // indicates if toolbar columns button is visible
                                    toolbarSearch: false,   // indicates if toolbar search controls are visible
                                    toolbarAdd: false,   // indicates if toolbar add new button is visible
                                    toolbarDelete: false,   // indicates if toolbar delete button is visible
                                    toolbarSave: false,   // indicates if toolbar save button is visible
                                    selectionBorder: false,	 // display border arround selection (for selectType = 'cell')
                                    recordTitles: false	 // indicates if to define titles for records
                                },
                                //toolbar: {
                                //    items: [
                                //        //{ type: 'spacer' },
                                //        { type: 'break' },
                                //        //{ type: 'button', id: 'Add_' + name,  img: 'icon-Add' },
                                //        { type: 'button', id: 'Edit_' + name, img: 'icon-edit' },
                                //        { type: 'break' },
                                //        { type: 'button', id: 'Add_' + name, img: 'icon-add' }
                                //    ],
                                //    onClick: this.onToolBarClick
                                //    //{

                                //    //    console.log(data);
                                //    //}
                                //},
                                recordHeight: 41,
                                //onSelect: this.onSelectLocal,
                                //onUnselect: this.onUnSelect,
                                //onSort: this.onSort,
                                //onClick: this.onSingleClick,
                                //onDblClick: this.onClick,
                                //onEditField: this.onEditField,
                                //onChange: this.onChange,
                                //onRowAdd: this.onRowAdd,
                                //onCellStyleRender: this.cellStyleRender
                                ////onResize: function () { alert('resize') }

                            });

                        }

                        // if (lookupDirect)
                        //VIS.MLookupCache.addRecordLookup(gc.windowNo, gc.tabNo, lookupDirect);


                    }
                    catch (e) {
                        //alert(e);
                        //that.log.Log(Level.SEVERE, that.SQL, e);
                    }
                },
                error: function () {

                }

            });

        };
    }

    VIS.TabMngr = {
        show: function (gc, ColumnName, rcID) {
            var WhereClause = ColumnName + "=" + rcID;
            var t = new TabDialog(gc, WhereClause);
            t.show();
        }
    }

}(VIS, jQuery));