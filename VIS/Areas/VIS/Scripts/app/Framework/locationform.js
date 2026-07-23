
; (function (VIS, $) {

    //form declaration
    // added new parameter for Maintain Versions
    function LocationForm(locationId, maintainVersinos) {

        //call parent function on close
        this.onClose = null;

        var $C_Location_ID = locationId;
        var $self = this;
        var $root = $("<div style='position:relative;'>");
        var $busyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        var windowNo = VIS.Env.getWindowNo();

        var searchlst = null;
        var country = null;
        var add1 = null;
        var add2 = null;
        var add3 = null;
        var add4 = null;

        var city = null;
        var state = null;
        var zip = null;

        var contryId = null;
        var stateId = null;
        var cityId = null;

        var Okbtn = null;
        var cancelbtn = null;
        var customAddList = null;

        var stringAddress = null;
        var change = false;

        // Read-only / edit-toggle state.
        // When an address is bound (opened on an existing record, or picked from
        // the search list) the detail fields open read-only; the Edit icon
        // unlocks them. The search box and the Additional Info box always stay
        // editable. See setReadOnly() / setBound() / refreshActionIcons().
        var isReadOnly = false;
        var editBtn = null;
        var sharedInd = null;

        // isBound     - an existing master address is currently shown on the form.
        // isEditing   - the detail fields are unlocked via the Edit icon (transient).
        // editedExisting - latched once an existing address is opened for editing,
        //               so a subsequent change is saved as a NEW location (insert)
        //               instead of mutating the shared master. Reset on
        //               search-select, add-mode and (re)open.
        var isBound = false;
        var isEditing = false;
        var editedExisting = false;
        // Snapshot taken when the Edit icon unlocks an existing address, so the
        // same icon can Undo (restore the original values) on the next click -
        // exactly like the New(+) icon does in add-mode.
        var editSnapshot = null;

        // Add / New state.
        // The New (+) icon clears the form to create a brand-new location.
        // While in add-mode it acts as an Undo toggle: pressing it again restores
        // the snapshot taken when add-mode was entered. In both add-mode and
        // edit-mode the search box is locked read-only so the user can't switch
        // to a different address mid-entry. See newBtn wiring / setSearchReadOnly().
        var newBtn = null;
        var isNewMode = false;
        var newSnapshot = null;

        var maintainVer = maintainVersinos;

        // Additional Address Info (e.g. flat number) - optional section.
        // Only rendered when the calling location control enables it via
        // setAdditionalAddressInfo(), i.e. when the current tab/table has an
        // "AdditionalAddressInfo" column. Seeded from that column/context value
        // and returned through onClose so the control can write it back.
        var showAdditionalAddress = false;
        var additionalAddressInfo = null;
        var addlInfo = null;

        // Read-only preview line under the search box showing the additional info
        // together with the address string - the same text the location control
        // paints once this dialog closes. Only used with the additional info
        // section, so plain address dialogs look exactly as before.
        var summary = null;
        // Master address as formatted by the caller's lookup; used as the base of
        // the preview while the address fields are untouched. Once they are
        // edited the preview is rebuilt from the fields instead.
        var addressDisplay = null;
        var addressEdited = false;

        // Enable and seed the Additional Address Info section.
        // Called by the location control before load().
        this.setAdditionalAddressInfo = function (value) {
            showAdditionalAddress = true;
            additionalAddressInfo = value;
        };

        // Master address string as currently shown by the calling control.
        // Optional - without it the preview is composed from the form fields.
        this.setAddressDisplay = function (text) {
            addressDisplay = text;
        };

        this.load = function () {
            // Parameter - AD_Language - Added to get country from location
            $root.load(VIS.Application.contextUrl + 'Location/Locations/?windowno=' + windowNo + '&locationId=' + $C_Location_ID + '&AD_Language=' + VIS.context.getContext("#AD_Language"), function (event) {
                $root.append($busyDiv);
                setBusy(true);
                $self.init();
                setBusy(false);
            });
        };

        this.init = function () {

            Okbtn = $root.find("#btnOk_" + windowNo);
            cancelbtn = $root.find("#btnCancel_" + windowNo);
            searchlst = $root.find("#lstLocation_" + windowNo);
            country = $root.find("#txtCountry_" + windowNo);
            add1 = $root.find("#txtAddress1_" + windowNo);
            add2 = $root.find("#txtAddress2_" + windowNo);
            add3 = $root.find("#txtAddress3_" + windowNo);
            add4 = $root.find("#txtAddress4_" + windowNo);

            //check Arebic Calture
            if (VIS.Application.isRTL) {
                Okbtn.removeClass("pull-left");
                Okbtn.addClass("pull-right");
                $root.find("Sup").css("float", "right");
                $($root.find(".cat2 a")[0]).removeClass("pull-right");
                $($root.find(".cat2 a")[0]).addClass("pull-left");
                $($root.find(".cat3 a")[0]).removeClass("pull-right");
                $($root.find(".cat3 a")[0]).addClass("pull-left");
                //$($root.find(".cat2 a")[0]).css("margin-left", "10px");
                //$($root.find(".cat3 a")[0]).css("margin-left", "10px");
            }


            if (add1.val()) {
                add1.val((add1.val()));
            }

            if (add2.val()) {
                add2.val((add2.val()));
            }

            if (add3.val()) {
                var obj = $root.find("#aCollection");
                var ctrl = $root.find('.cat' + $(obj).attr('data-prod-cat'));
                if (ctrl) {
                    if (ctrl.length > 0)
                        ctrl.toggle();
                }
                else {
                    $root.find('.cat' + $(obj).attr('data-prod-close')).hide()
                }
                add3.val((add3.val()));
            }

            if (add4.val()) {
                var obj = $root.find(".cat3").find("a")[0];
                var ctrl = $root.find('.cat' + $(obj).attr('data-prod-cat'));
                if (ctrl) {
                    if (ctrl.length > 0)
                        ctrl.toggle();
                }
                else {
                    $root.find('.cat' + $(obj).attr('data-prod-close')).hide()
                }
                add4.val((add4.val()));
            }

            city = $root.find("#txtCity_" + windowNo);
            if (city.val()) {
                city.val((city.val()));
            }

            state = $root.find("#txtState_" + windowNo);
            zip = $root.find("#txtZipCode_" + windowNo);
            if (zip.val()) {
                zip.val((zip.val()));
            }
            contryId = $root.find("#countryhdn_" + windowNo).val();
            stateId = $root.find("#Statehdn_" + windowNo).val();

            /*Additional Address Info Fill*/
            // Reveal the extra section (flat number etc.) - rendered hidden in
            // the view - when the calling tab/table carries an
            // "AdditionalAddressInfo" column. This box is intentionally left out
            // of the read-only field set so it stays editable at all times.
            if (showAdditionalAddress) {
                $root.find(".vis-additional-address-info").show();
                addlInfo = $root.find("#txtAdditionalAddressInfo_" + windowNo);
                if (additionalAddressInfo != null) {
                    addlInfo.val(additionalAddressInfo);
                }
                addlInfo.bind('change', function (e) {
                    change = true;
                    updateSummary();
                });
                // Live preview while typing - the change flag stays tied to the
                // real change event so a stray keystroke can't force an insert.
                addlInfo.bind('keyup', function (e) {
                    updateSummary();
                });
                summary = $root.find("#divLocSummary_" + windowNo);
            }


            /*Country Fill*/
            country.autocomplete({
                source: function (request, response) {
                    if (request.term.trim().length == 0) {
                        return;
                    }
                    $.ajax({
                        url: VIS.Application.contextUrl + "Location/GetCountry",
                        dataType: "json",
                        data: {
                            //featureClass: "P",
                            style: "full",
                            //maxRows: 12,
                            name_startsWith: request.term
                        },
                        success: function (data) {
                            if (data.result == 'ok')
                                response(null);
                            else {
                                response($.map(data.result, function (item) {
                                    return {
                                        label: item.Name,
                                        value: item.Name,
                                        id: item.Key
                                    }
                                }));
                            }
                        }
                    });
                },
                minLength: 1,
                select: function (event, ui) {
                    if (ui.item.id==0) {
                        country.val('');
                    }
                    contryId = ui.item.id;
                    addressEdited = true;
                    updateSummary();
                    //var contryId = null;
                    //var stateId = null;
                    //var cityId = null;
                },
                open: function () {
                    $root.find(this).removeClass("ui-corner-all").addClass("ui-corner-top");
                },
                close: function () {
                    $root.find(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                    //state.val("");
                    //city.val("");
                    //stateId = 0;
                    //cityId = 0;
                    if (Number(contryId) > 0) {
                        change = true;
                    }
                    else {
                        country.val('');
                    }
                    updateSummary();
                }
            });

            /*State Fill*/
            state.autocomplete({
                source: function (request, response) {
                    if (request.term.trim().length == 0) {
                        return;
                    }
                    $.ajax({
                        url: VIS.Application.contextUrl + "Location/GetStates",
                        dataType: "json",
                        data: {
                            style: "full",
                            name_startsWith: request.term,
                            countryId: contryId
                        },
                        success: function (data) {
                            if (data.result == 'ok')
                                response(null);
                            else {
                                response($.map(data.result, function (item) {
                                    return {
                                        label: item.Name,
                                        value: item.Name,
                                        id: item.Key
                                    }
                                }));
                            }
                        }
                    });
                },
                minLength: 1,
                select: function (event, ui) {
                    stateId = ui.item.id;
                    addressEdited = true;
                    updateSummary();
                },
                open: function () {
                    $root.find(this).removeClass("ui-corner-all").addClass("ui-corner-top");
                },
                close: function () {
                    $root.find(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                }
            });

            /*Address Fill*/
            searchlst.autocomplete({
                source: function (request, response) {
                    if (request.term.trim().length == 0) {
                        return;
                    }

                    $.ajax({
                        url: VIS.Application.contextUrl + "Location/GetAddresses",
                        dataType: "json",
                        data: {
                            style: "full",
                            name_startsWith: request.term
                        },
                        success: function (data) {
                            if (data.result == 'ok')
                                response(null);
                            else { 
                            response($.map(data.result, function (item) {
                                return {
                                    label: item.ADDRESS,
                                    value: item.ADDRESS,
                                    C_COUNTRY_ID: item.C_COUNTRY_ID,
                                    C_LOCATION_ID: item.C_LOCATION_ID,
                                    C_REGION_ID: item.C_REGION_ID,
                                    COUNTRYNAME: item.COUNTRYNAME,
                                    ADDRESS1: item.ADDRESS1,
                                    ADDRESS2: item.ADDRESS2,
                                    ADDRESS3: item.ADDRESS3,
                                    ADDRESS4: item.ADDRESS4,
                                    CITYNAME: item.CITYNAME,
                                    STATENAME: item.STATENAME,
                                    ZIPCODE: item.ZIPCODE
                                }
                            }));
                        }
                    }
                    });
        },
            minLength: 1,
                select: function (event, ui) {
                    country.val(ui.item.COUNTRYNAME);
                    add1.val(ui.item.ADDRESS1);
                    add2.val(ui.item.ADDRESS2);
                    add3.val(ui.item.ADDRESS3);
                    add4.val(ui.item.ADDRESS4);
                    city.val(ui.item.CITYNAME);
                    state.val(ui.item.STATENAME);
                    zip.val(ui.item.ZIPCODE);
                    change = true;
                    stateId = ui.item.C_REGION_ID;
                    // Bind the SELECTED location's id so an edit updates that same
                    // master record instead of creating a new one. (Was forced to
                    // 0, which is what caused a new C_Location on every save.)
                    $C_Location_ID = ui.item.C_LOCATION_ID;
                    cityId = 0;
                    contryId = ui.item.C_COUNTRY_ID;
                    // A freshly picked address is shown read-only and treated as an
                    // update-in-place reference (same C_Location_ID) until the user
                    // clicks Edit. Reset the edit latch so selecting alone never
                    // forces an insert.
                    isEditing = false;
                    editedExisting = false;
                    setBound(Number($C_Location_ID) > 0);
                    setReadOnly(true);
                    // Preview now describes the picked master address.
                    addressDisplay = ui.item.ADDRESS;
                    addressEdited = false;
                    updateSummary();
                },
        open: function () {
            $root.find(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        },
        close: function () {
            $root.find(this).removeClass("ui-corner-top").addClass("ui-corner-all");

        }
    });


    Okbtn.on("click", function () {
        setBusy(true);
        if (Number(contryId) <= 0) {
            VIS.ADialog.warn("SelectCountry", true, null);
            setBusy(false);
            return;
        }

        // Save as a NEW location (insert) instead of updating the bound master when:
        //   - the user unlocked an existing address via Edit and changed something
        //     (protects the shared master record from in-place mutation), or
        //   - Maintain Versions is enabled on the column and a value changed.
        if (change && (editedExisting || maintainVer))
            $C_Location_ID = 0;

        var objValue = {
            countryName: country.val(),
            addvalue1: add1.val(),
            addvalue2: add2.val(),
            addvalue3: add3.val(),
            addvalue4: add4.val(),
            cityValue: city.val(),
            stateValue: state.val(),
            zipValue: zip.val(),
            clocationId: $C_Location_ID,
            countryId: contryId,
            stateId: stateId,
            cityId: cityId
        };

        var callbackValue = saveLocation(objValue);
    });

    cancelbtn.on("click", function () {
        $root.dialog('close');
    });

    $root.find(".VIS-Location-toggler").click(function (e) {
        e.preventDefault();
        var ctrl = $root.find('.cat' + $root.find(this).attr('data-prod-cat'));
        if (ctrl && ctrl.length > 0) {
            ctrl.toggle();
        }
        else {
            $root.find('.cat' + $root.find(this).attr('data-prod-close')).hide()
        }
        // $('img.expand').toggleClass('collapse');
    });

    country.bind('change', function (e) {
        change = true;
    });
    add1.bind('change', function (e) {
        change = true;
    });
    add2.bind('change', function (e) {
        change = true;
    });
    add3.bind('change', function (e) {
        change = true;
    });
    add4.bind('change', function (e) {
        change = true;
    });

    city.bind('change', function (e) {
        change = true;
    });
    state.bind('change', function (e) {
        change = true;
    });
    zip.bind('change', function (e) {
        change = true;
    });

    // Any edit to an address detail field invalidates the address string handed
    // over by the caller, so the preview is rebuilt from the fields from now on.
    $.each([country, add1, add2, add3, add4, city, state, zip], function (i, fld) {
        if (fld && fld.length) {
            fld.bind('change keyup', function (e) {
                addressEdited = true;
                updateSummary();
            });
        }
    });

    // Edit icon (pencil): now behaves exactly like the New(+) icon.
    //   - first click  -> snapshot the current values, unlock the detail fields
    //                     and lock the search box; the icon swaps to the undo
    //                     arrow (title "Undo").
    //   - second click -> Undo: restore the snapshot, re-lock the fields and the
    //                     icon reverts to the pencil (title "Edit").
    // Entering edit-mode locks the search box so the user can't switch to a
    // different master record mid-edit.
    editBtn = $root.find("#aEditLocation_" + windowNo);
    sharedInd = $root.find("#visLocShared_" + windowNo);
    editBtn.on("click", function () {
        // Edit and Add are mutually exclusive; ignore Edit while adding.
        if (isNewMode) {
            return;
        }
        if (!isEditing) {
            // Enter edit-mode: snapshot so the next click can undo.
            editSnapshot = captureSnapshot();
            isEditing = true;
            // Latch that an existing address was opened for editing, so a
            // subsequent change is saved as a new location (insert) rather than
            // an in-place update of the shared master.
            editedExisting = true;
            setReadOnly(false);
            setSearchReadOnly(true);
            setEditIconEditing(true);
            editBtn.attr("title", VIS.Msg.getMsg("Undo"));
        } else {
            // Undo: restore the snapshot and the read-only state it came from.
            restoreSnapshot(editSnapshot);
            editSnapshot = null;
            isEditing = false;
            editedExisting = false;
            setReadOnly(true);
            setSearchReadOnly(false);
            setEditIconEditing(false);
            editBtn.attr("title", VIS.Msg.getMsg("Edit"));
        }
        // Refresh which icons are visible (New is hidden while editing).
        refreshActionIcons();
    });

    // New (+) icon: clear the form to create a new location, or - when
    // already in add-mode - undo back to the snapshot taken on entry.
    newBtn = $root.find("#aNewLocation_" + windowNo);
    newBtn.on("click", function () {
        if (!isNewMode) {
            // Enter add-mode: snapshot current values, then blank the form.
            newSnapshot = captureSnapshot();
            clearFields();
            $C_Location_ID = 0;
            contryId = 0;
            stateId = 0;
            cityId = 0;
            change = true;
            isNewMode = true;
            isEditing = false;
            editedExisting = false;
            isBound = false;
            newBtn.addClass("adding");
            setNewIconAdding(true);
            newBtn.attr("title", VIS.Msg.getMsg("Undo"));
            // Blank form is fully editable; existing-record Edit icon is hidden.
            setReadOnly(false);
            setSearchReadOnly(true);
            refreshActionIcons();
        } else {
            // Undo: restore the snapshot and the state it was captured in.
            restoreSnapshot(newSnapshot);
            newSnapshot = null;
            isNewMode = false;
            isEditing = false;
            editedExisting = false;
            newBtn.removeClass("adding");
            setNewIconAdding(false);
            newBtn.attr("title", VIS.Msg.getMsg("New"));
            var bound = Number($C_Location_ID) > 0;
            isBound = bound;
            setReadOnly(bound);
            setSearchReadOnly(false);
            refreshActionIcons();
        }
    });

    // Initial state: an address opened on an existing record starts read-only
    // (Edit + New icons shown); a blank/new address starts editable. When opened
    // without a bound location there is nothing to edit or undo, so BOTH icons
    // stay hidden (the form is already a blank, fully-editable new entry).
    var hasExisting = Number($C_Location_ID) > 0;
    isEditing = false;
    editedExisting = false;
    setBound(hasExisting);
    setReadOnly(hasExisting);
    setSearchReadOnly(false);
    updateSummary();

    // Snapshot the editable field values + ids so add-mode can be undone.
    function captureSnapshot() {
        return {
            clocationId: $C_Location_ID,
            change: change,
            addressDisplay: addressDisplay,
            addressEdited: addressEdited,
            country: country.val(),
            add1: add1.val(),
            add2: add2.val(),
            add3: add3.val(),
            add4: add4.val(),
            city: city.val(),
            state: state.val(),
            zip: zip.val(),
            contryId: contryId,
            stateId: stateId,
            cityId: cityId
        };
    }

    // Restore a snapshot produced by captureSnapshot().
    function restoreSnapshot(s) {
        if (!s) {
            return;
        }
        $C_Location_ID = s.clocationId;
        change = s.change;
        addressDisplay = s.addressDisplay;
        addressEdited = s.addressEdited;
        country.val(s.country);
        add1.val(s.add1);
        add2.val(s.add2);
        add3.val(s.add3);
        add4.val(s.add4);
        city.val(s.city);
        state.val(s.state);
        zip.val(s.zip);
        contryId = s.contryId;
        stateId = s.stateId;
        cityId = s.cityId;
        updateSummary();
    }

    // Blank all address detail fields for a fresh entry. The search box and the
    // Additional Info box are intentionally left untouched.
    function clearFields() {
        country.val("");
        add1.val("");
        add2.val("");
        add3.val("");
        add4.val("");
        city.val("");
        state.val("");
        zip.val("");
        // Nothing left of the caller's address string to preview.
        addressEdited = true;
        updateSummary();
    }

    //Save data in the database
    function saveLocation(data, callback) {
        var result = null;
        $.ajax({
            url: VIS.Application.contextUrl + "Location/SaveLocation",
            type: "POST",
            datatype: "json",
            contentType: "application/json; charset=utf-8",
            async: false,
            data: JSON.stringify({ pref: data })
        }).done(function (json) {
            result = json;
            $C_Location_ID = result.locationid;
            stringAddress = result.locaddress;
            this.location = $C_Location_ID;
            setBusy(false);
            if ($self.onClose)
                $self.onClose($C_Location_ID, change, addlInfo ? addlInfo.val() : null, showAdditionalAddress);
            $root.dialog('close');
            change = null;
        })
    };
};

function setBusy(isBusy) {
    $busyDiv.css("display", isBusy ? 'block' : 'none');
};

// Toggle the address detail fields between read-only and editable.
// The search box and the Additional Info box are deliberately excluded so
// the user can always search a different address / edit the extra info.
function setReadOnly(ro) {
    isReadOnly = ro;
    var flds = [country, add1, add2, add3, add4, city, state, zip];
    for (var i = 0; i < flds.length; i++) {
        if (flds[i] && flds[i].length) {
            flds[i].prop("readonly", ro);
        }
    }
    var $form = $root.find(".vis-locform");
    if (ro) {
        $form.addClass("vis-loc-readonly");
        if (editBtn) editBtn.removeClass("editing");
    } else {
        $form.removeClass("vis-loc-readonly");
        if (editBtn) editBtn.addClass("editing");
    }
};

// Refresh the read-only preview under the search box: the Additional Address
// Info joined to the address string, exactly as the location control paints it
// (VIS.MLocationLookup.combineAddress is the single formatting rule). Only in
// use when the calling tab carries an AdditionalAddressInfo column - other
// callers never get a summary element, so this is a no-op for them.
function updateSummary() {
    if (!summary || !summary.length) {
        return;
    }
    var text = VIS.MLocationLookup.combineAddress(getBaseAddress(), addlInfo ? addlInfo.val() : null);
    $root.find("#spnLocSummary_" + windowNo).text(text);
    summary.toggle(text.length > 0);
};

// Address part of the preview: the caller's formatted string while the detail
// fields are untouched, otherwise rebuilt from the fields so the preview keeps
// up with what is being typed.
function getBaseAddress() {
    if (!addressEdited && addressDisplay) {
        return addressDisplay;
    }
    var flds = [add1, add2, add3, add4, city, state, zip, country];
    var parts = [];
    for (var i = 0; i < flds.length; i++) {
        var v = (flds[i] && flds[i].length) ? $.trim(flds[i].val() || "") : "";
        if (v.length > 0) {
            parts.push(v);
        }
    }
    return parts.join(", ");
};

// Lock/unlock the address search box. It is locked while the user is actively
// editing an existing address or adding a new one, so they can't switch to a
// different master record mid-entry.
function setSearchReadOnly(ro) {
    if (searchlst && searchlst.length) {
        searchlst.prop("readonly", ro);
    }
}

// Record whether an existing master address is currently shown, then refresh
// the action-icon visibility.
function setBound(bound) {
    isBound = !!bound;
    refreshActionIcons();
};

// Central visibility rule for the New(+) and Edit(pencil) icons:
//   - nothing bound and not adding    -> both hidden (blank / new entry);
//   - editing an existing address     -> only Edit shown (New hidden);
//   - adding a new address            -> only New shown (acts as Undo);
//   - a bound address shown read-only -> both shown.
function refreshActionIcons() {
    var showEdit = isBound && !isNewMode;
    var showNew = isNewMode || (isBound && !isEditing);
    if (editBtn) editBtn.toggle(!!showEdit);
    if (newBtn) newBtn.toggle(!!showNew);
    if (sharedInd) sharedInd.toggle(!!(isBound && !isNewMode && !isEditing));
};

// Swap the New icon between "+" (create) and the window's undo arrow shown while
// in add-mode, so the icon reflects what the next click will do. Uses the same
// Font Awesome undo glyph (fa fa-undo) as the main window toolbar.
function setNewIconAdding(adding) {
    if (!newBtn) return;
    var $ic = newBtn.find(".vis-loc-btn-ico");
    if (!$ic.length) return;
    if (adding) {
        $ic.removeClass("glyphicon glyphicon-plus").addClass("fa fa-undo");
    } else {
        $ic.removeClass("fa fa-undo").addClass("glyphicon glyphicon-plus");
    }
};

// Swap the Edit icon between the pencil (edit) and the window's undo arrow shown
// while in edit-mode, mirroring setNewIconAdding().
function setEditIconEditing(editing) {
    if (!editBtn) return;
    var $ic = editBtn.find(".vis-loc-btn-ico");
    if (!$ic.length) return;
    if (editing) {
        $ic.removeClass("glyphicon glyphicon-pencil").addClass("fa fa-undo");
    } else {
        $ic.removeClass("fa fa-undo").addClass("glyphicon glyphicon-pencil");
    }
};

this.showDialog = function () {
    $root.append($busyDiv);
    $root.dialog({
        modal: true,
        resizable: false,
        title: VIS.Msg.getMsg("Location") + " / " + VIS.Msg.getMsg("Address"),
        closeText: VIS.Msg.getMsg("close"),
        // height: 440,
        width: 620,
        position: { at: "center top", of: window },
        close: function () {
            $self.dispose();
            $self = null;
            $root.dialog("destroy");
            $root = null;
        }
    });
};

this.disposeComponent = function () {
    $self = null;
    if (Okbtn)
        Okbtn.off("click");
    if (cancelbtn)
        cancelbtn.off("click");
    if (editBtn)
        editBtn.off("click");
    if (newBtn)
        newBtn.off("click");

    editBtn = null;
    sharedInd = null;
    newBtn = null;
    newSnapshot = null;
    editSnapshot = null;

    $C_Location_ID = 0;
    searchlst = null;
    country = null;
    add1 = null;
    add2 = null;
    add3 = null;
    add4 = null;

    city = null;
    state = null;
    zip = null;

    contryId = null;
    stateId = null;
    cityId = null;

    Okbtn = null;
    cancelbtn = null;
    customAddList = null;

    stringAddress = null;

    addlInfo = null;
    summary = null;
    addressDisplay = null;



    this.disposeComponent = null;
};
    };

//dispose call
LocationForm.prototype.dispose = function () {

    /*CleanUp Code */
    //dispose this component
    this.disposeComponent();
};

//Load form into VIS
VIS.LocationForm = LocationForm;

}) (VIS, jQuery);