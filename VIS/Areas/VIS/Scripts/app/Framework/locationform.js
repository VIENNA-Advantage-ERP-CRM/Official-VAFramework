
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
        // the search list) the detail fields open read-only; the green Edit icon
        // unlocks them. The search box and the Additional Info box always stay
        // editable. See setReadOnly() / setLocationBound().
        var isReadOnly = false;
        var editBtn = null;
        var sharedInd = null;

        var maintainVer = maintainVersinos;

        // Additional Address Info (e.g. flat number) - optional section.
        // Only rendered when the calling location control enables it via
        // setAdditionalAddressInfo(), i.e. when the current tab/table has an
        // "AdditionalAddressInfo" column. Seeded from that column/context value
        // and returned through onClose so the control can write it back.
        var showAdditionalAddress = false;
        var additionalAddressInfo = null;
        var addlInfo = null;

        // Enable and seed the Additional Address Info section.
        // Called by the location control before load().
        this.setAdditionalAddressInfo = function (value) {
            showAdditionalAddress = true;
            additionalAddressInfo = value;
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
                });
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
                    // Show the picked address read-only; user clicks Edit to change it.
                    setLocationBound(Number($C_Location_ID) > 0);
                    setReadOnly(true);
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

        // Set C_Location_ID as 0, 
        // if maintain Version is marked on column and there is any change in value on Location Control
        if (maintainVer && change)
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

    // Green Edit icon: toggles the detail fields between read-only and editable.
    editBtn = $root.find("#aEditLocation_" + windowNo);
    sharedInd = $root.find("#visLocShared_" + windowNo);
    editBtn.on("click", function () {
        setReadOnly(!isReadOnly);
    });

    // Initial state: an address opened on an existing record starts read-only
    // (Edit icon + Shared indicator shown); a blank/new address starts editable.
    var hasExisting = Number($C_Location_ID) > 0;
    setLocationBound(hasExisting);
    setReadOnly(hasExisting);

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

// Show/hide the Edit icon and the "Shared Address" indicator. They are only
// relevant once an existing master address is bound to the form.
function setLocationBound(bound) {
    if (editBtn) editBtn.toggle(!!bound);
    if (sharedInd) sharedInd.toggle(!!bound);
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

    editBtn = null;
    sharedInd = null;

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