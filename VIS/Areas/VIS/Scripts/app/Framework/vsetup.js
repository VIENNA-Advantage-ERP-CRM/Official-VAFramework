/********************************************************
 * Module Name    :     Application
 * Purpose        :     Create New Tenant
 * Author         :     Lakhwinder
 * Date           :     10-Oct-2014
  ******************************************************/
; (function (VIS, $) {
    VIS.Apps = VIS.Apps || {};
    VIS.Apps.AForms = VIS.Apps.AForms || {}



    function VSetup() {


        var url = VIS.Application.contextFullUrl;
        if (!url)
            url = VIS.Application.contextUrl;
        if (url) {
            if (url.toString().toLowerCase().indexOf("softwareonthecloud.com") > -1) {
                VIS.ADialog.info("VIS_GotoControlPanel", true, "", "");
                return;
            }
        }



        var $root = $("<div class='vis-forms-container' style='height:100%'>");
        // $root.height($(window).height() - 70);
        var container = $("<div class='vis-its-main-wrap vis-pull-left'>");

        var subRoot = $("<div style='height:100%'>");
        $root.append(subRoot);
        subRoot.append(container);
        var divRight = $("<div class='vis-its-ryt-panel vis-pull-right' >");
        var divRightInner = $("<div class='vis-its-ryt-panel-inner vis-pull-left' >");
        var btnSave = $('<a href="javascript:void(o)"  style="display:none;" class="vis-initial-btn vis-initial-btn-blue">').append($("<i class='vis vis-save'></i>"));

        /* Header and body kept apart: a run starts by clearing the body, and the header
           has to survive that - it used to sit in the same div and vanished with it. */
        var divResultBody = $("<div class='vis-its-result-body'>");
        subRoot.append(divRight);
        divRight.append(divRightInner).append(btnSave);
        divRightInner.append($('<h3>').append(VIS.Msg.getMsg('Result'))).append(divResultBody);
        /* The one line that says what the run is doing right now - "initiated...",
           "Starting..." - replaced as the run moves on, removed when there is a result. */
        var $statusLine = null;
        var $busyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');
        var windowNo = VIS.Env.getWindowNo();

        var txtTenant = null;
        var txtOrg = null;
        var txtUTenant = null;
        var txtUOrg = null;
        var cmbCurr = null;
        var cmbCou = null;
        var txtCity = null;
        var cmbReg = null;
        var chkOpprotunity = null;
        var chkSR = null;
        var chkProduct = null;
        var chkCam = null;
        var chkBP = null;
        var btnLoadFile = null;
        var btnCancel = null;
        var btnOK = null;
        var fileBrowser = null;
        var folderKey = null;
        var fileName = null
        var chkDA = null;
        var lblDA = null;
        var cmbPackage = null;
        var $pkgBusy = null;
        /* Tenant name check - AD_Client refuses a name it already holds, and the user
           should hear that when leaving the field, not after filling in the rest and
           pressing Done. Shown the way the Screen Composer shows "Invalid: Name already
           exist": red label and underline, and a small message under the control. It
           sits in the row gap (widened for every field in ClientSetup.css), absolutely
           positioned, so nothing moves when it appears. */
        var $tenantWrap = null;
        var $tenantMsg = null;
        /* Name the last check was for, and its answer - so Done need not ask again for
           a name already known to be taken, and a blur with nothing changed is free. */
        var checkedTenantName = null;
        var tenantNameTaken = false;
        /* Packages come from the Market API on their own request, so the rest of
           the form is usable while that is still running. */
        var packagesLoading = false;
        /* Full package payload returned by GetLocalizationPackages, keyed by
           Value - the combo only carries Name/Value, so ModuleDetails is kept here. */
        var packageInfo = {};

        /* Module install progress, shown in the result panel once the tenant is created.
           Market installs the modules after the tenant response has gone out, so the
           only way to follow it is to keep reading its log. */
        var divModules = null;
        var divModuleList = null;
        /* One row per module of the package, keyed by module name - Market reports
           progress by name, and a row is updated in place rather than redrawn. */
        var moduleRows = {};
        /* Kept so the details can be handed to the module log page on the way out. */
        var tenantInfo = null;
        var installPollTimer = null;
        var installPollCount = 0;
        /* 5s is short enough to see each module change state, and the cap keeps a stuck
           installation from polling for the rest of the session - together ~10 minutes. */
        var INSTALL_POLL_INTERVAL = 5000;
        var MAX_INSTALL_POLLS = 120;

        /* Message lookup that falls back to plain text when the key is not
           translated - VIS.Msg.getMsg returns "[key]" for a missing key. */
        var msgOr = function (key, fallback) {
            var val = VIS.Msg.getMsg(key);
            return val === ("[" + key + "]") ? fallback : val;
        };

        /* Three dots that pulse one after another - the "still going" sign for a step
           that is running. Pure CSS (ClientSetup.css), so there is no timer to stop. */
        var busyDots = function () {
            return $('<span class="vis-its-dots"><i></i><i></i><i></i></span>');
        };

        /* Puts up, or replaces, the run's status line in a container. busy adds the
           animated dots after the text. */
        var setStatusLine = function ($into, text, busy) {
            clearStatusLine();
            $statusLine = $('<div class="vis-its-status">').append($('<span>').text(text));
            if (busy) {
                $statusLine.append(busyDots());
            }
            $into.append($statusLine);
        };

        var clearStatusLine = function () {
            if ($statusLine != null) {
                $statusLine.remove();
                $statusLine = null;
            }
        };

        /* Wraps a control the way VIS.VGridPanel wraps a window field:
           vis-ev-col > input-group vis-input-wrap > vis-control-wrap > control, label.
           The vis-ev-col ancestor is what the edit view CSS keys off, and control
           before label is the order the "control ~ label" rules need. colClass stays
           the form's own 50% column class, so the field order and the two column
           layout are untouched - only the control markup changes. */
        var buildField = function (colClass, $ctrl, labelText) {
            var col = $("<div class='vis-ev-col " + colClass + "'>");
            var inner = $("<div class='vis-control-wrap'>");
            /* Blank placeholder - inside the edit view the label always sits above
               the control, so a real placeholder would only repeat it. */
            inner.append($ctrl.attr('placeholder', ' ').attr('data-placeholder', ''));
            inner.append($('<label>').append(labelText));
            col.append($("<div class='input-group vis-input-wrap'>").append(inner));
            return col;
        };

        /* Yes/No drawn as the toggle switch, same markup VCheckBox builds when it
           is asked for a switch. */
        var buildSwitch = function ($chk, labelText) {
            $chk.addClass('vis-ctrl-switch');
            var lbl = $('<label class="vis-ec-col-lblchkbox">').html(labelText)
                .prepend('<i for="switch" class="vis-ctrl-switchSlider">Toggle</i>')
                .prepend($chk);
            if ($chk.prop('disabled')) {
                lbl.css('opacity', .7);
            }
            return lbl;
        };

        this.load = function () {



            var dContent = $("<div class='vis-graywrap'>");
            container.append(dContent);
            /* vis-ad-w-p-vc-editview is the class the window's single view puts
               around its fields, and it is what carries the whole underlined
               control look. vis-its-editview only undoes the absolute positioning
               that class needs inside a real window view. */
            var dTForm = $("<div class='initial-client-form vis-ad-w-p-vc-editview vis-its-editview'>");
            dContent.append(dTForm);

            //dTForm.append($("<div Style='margin-left:15px;margin-top:15px'>").append($("<label>").append(VIS.Msg.getMsg('TenantHeaderComment'))));
            dTForm.append($("<h3 class='VIS_Pref_change-pass'>").append($("<label class='VIS_Pref_Label_Font'>").append(VIS.Msg.getMsg("TenantHeaderComment"))));

            txtTenant = $('<input type="text" name="tenant">');
            var dTenant = buildField('vis-intial-form-data', txtTenant, VIS.Msg.getMsg("VIS_TenantName"));
            $tenantWrap = dTenant.find('.vis-input-wrap');
            /* Inside the wrap, which is the positioned ancestor - the message hangs
               off the bottom of it, under the underline. Hidden until there is
               something to say. */
            $tenantMsg = $('<span class="vis-its-field-msg" style="display:none">')
                .append('<i class="fa fa-times-circle"></i>')
                .append($('<span>'));
            $tenantWrap.append($tenantMsg);
            dTForm.append(dTenant);
            txtTenant.on('blur', function () {
                checkTenantName();
            });
            /* Typing again means the answer no longer applies - clear it rather than
               leave a stale message under a name that may be fine. */
            txtTenant.on('input', function () {
                if (tenantNameTaken) {
                    setTenantNameError(false);
                }
            });

            txtOrg = $('<input type="text" name="tenant">');
            dTForm.append(buildField('vis-intial-form-data', txtOrg, VIS.Msg.getMsg("VIS_OrgName")));

            txtUTenant = $('<input type="text" name="tenant">');
            dTForm.append(buildField('vis-intial-form-data', txtUTenant, VIS.Msg.getMsg("VIS_TenantAdminName")));

            txtUOrg = $('<input type="text" name="tenant" style="visibility:hidden">');
            //dTForm.append(buildField('vis-intial-form-data', txtUOrg, VIS.Msg.parseTranslation(VIS.context, "@AD_User_ID@ @AD_Org_ID@")));


            cmbCurr = $('<select>');
            dTForm.append(buildField('vis-intial-form-dataCombo', cmbCurr, VIS.Msg.translate(VIS.context, "C_Currency_ID")));

            cmbCou = $('<select>');
            dTForm.append(buildField('vis-intial-form-dataCombo', cmbCou, VIS.Msg.translate(VIS.context, "C_Country_ID")));

            txtCity = $('<input type="text">');
            dTForm.append(buildField('vis-intial-form-dataCombo', txtCity, VIS.Msg.translate(VIS.context, "City")));

            cmbReg = $('<select>');
            dTForm.append(buildField('vis-intial-form-dataCombo', cmbReg, VIS.Msg.translate(VIS.context, "C_Region_ID")));

            /* Localization package - same combo pattern as Currency / Country,
               but with its own busy indicator: the list is fetched separately. */
            cmbPackage = $('<select>');
            var dPkg = buildField('vis-intial-form-dataCombo', cmbPackage, msgOr("LocalizationPackage", "Package"));
            /* Small spinner sitting on top of the combo only - the page level
               $busyDiv covers the whole form and is not used for this. */
            $pkgBusy = $('<div style="position:absolute;top:0;right:8px;height:35px;z-index:5;display:none;align-items:center;">')
                .append($('<i class="vis-busyindicatordiv" style="width:16px;height:16px;border-width:2px;">'));
            dPkg.find('.vis-control-wrap').append($pkgBusy);
            dTForm.append(dPkg);

            //var ulCase = $('<ul  class="initial-client-form-list">');
            //dTForm.append(ulCase);

            //var liCurr = $('<li>');
            //ulCase.append(liCurr);
            //var dCurr = $('<div class="intial-form-dataCombo">');
            //liCurr.append(dCurr);
            //dCurr.append($('<label>').append(VIS.Msg.translate(VIS.context, "C_Currency_ID")));
            //cmbCurr = $('<select placeholder="Currency">');
            //dCurr.append(cmbCurr);

            //var liCou = $('<li>');
            //ulCase.append(liCou);
            //var dCou = $('<div class="intial-form-dataCombo">');
            //liCou.append(dCou);
            //dCou.append($('<label>').append(VIS.Msg.translate(VIS.context, "C_Country_ID")));
            //cmbCou = $('<select placeholder="Country">');
            //dCou.append(cmbCou);

            //var liCity = $('<li>');
            //ulCase.append(liCity);
            //var dCity = $('<div class="intial-form-dataCombo">');
            //liCity.append(dCity);
            //dCity.append($('<label>').append(VIS.Msg.translate(VIS.context, "City")));
            //txtCity = $('<input type="text" placeholder="City" style="width:100%;">');
            //dCity.append(txtCity);

            //var liReg = $('<li>');
            //ulCase.append(liReg);
            //var dReg = $('<div class="intial-form-dataCombo">');
            //liReg.append(dReg);
            //dReg.append($('<label>').append(VIS.Msg.translate(VIS.context, "C_Region_ID")));
            //cmbReg = $('<select placeholder="Region">');
            //dReg.append(cmbReg);

            //var liChks = $("<li>");
            //ulCase.append(liChks);

            dTForm.append($('<div style="width:100%;float:left;">').append($("<label  class='vis-cs-op-lbl' class='vis-pull-left'>").append(VIS.Msg.getMsg("Optional"))));
            var dChkContainer = $('<div class="vis-fieldset-wrap">');
            var dChkBox = $("<div class='vis-intial-form-data vis-fieldset-inn'>");
            dChkContainer.append(dChkBox);
            dTForm.append(dChkContainer);
            //liChks.append(dChkBox);


            var dOpprotunity = $('<div class="vis-initial-form-checkbox" >');
            chkOpprotunity = $('<input type="checkbox">');
            dOpprotunity.append(buildSwitch(chkOpprotunity, VIS.Msg.translate(VIS.context, "C_Project_ID")));
            dChkBox.append(dOpprotunity);

            var dSR = $('<div class="vis-initial-form-checkbox">');
            chkSR = $('<input type="checkbox">');
            dSR.append(buildSwitch(chkSR, VIS.Msg.translate(VIS.context, "C_SalesRegion_ID")));
            dChkBox.append(dSR);

            var dProduct = $('<div class="vis-initial-form-checkbox">');
            chkProduct = $('<input type="checkbox" checked disabled>');
            dProduct.append(buildSwitch(chkProduct, VIS.Msg.translate(VIS.context, "M_Product_ID")));
            dChkBox.append(dProduct);

            var dCam = $('<div class="vis-initial-form-checkbox">');
            chkCam = $('<input type="checkbox">');
            dCam.append(buildSwitch(chkCam, VIS.Msg.translate(VIS.context, "C_Campaign_ID")));
            dChkBox.append(dCam);

            var dBP = $('<div class="vis-initial-form-checkbox">');
            chkBP = $('<input type="checkbox" checked disabled>');
            dBP.append(buildSwitch(chkBP, VIS.Msg.translate(VIS.context, "C_BPartner_ID")));
            dChkBox.append(dBP);



            //var liBtns= $("<li>");
            //ulCase.append(liBtns);
            //var dBtns = $("<div class='initial-form-buttons' >");
            //dTForm.append(dBtns);
            //liBtns.append(dBtns);

            // var dRbtns = $("<div class='initial-btn-right'>");
            var dLbtns = $("<div class='vis-initial-btn-left vis-pull-right'>");
            dContent.append(dLbtns);

            var dDefaulAcct = $('<div style="display: inline;">');
            dLbtns.append(dDefaulAcct);
            chkDA = $('<input type="checkbox" style="margin-right: 5px;margin-left: 10px;margin-top: 5px;display:none">');
            chkDA.prop('checked', true);
            chkDA.on('click', function () {
                if (chkDA.prop('checked')) {
                    btnLoadFile.css('display', 'none');
                }
                else {
                    btnLoadFile.css('display', 'initial');
                }
            });
            dDefaulAcct.append(chkDA);
            lblDA = $("<label style='margin-right: 10px;font-size: 14px;color: #666;font-weight: normal;display:none'>").append(VIS.Msg.getMsg("UseDefault"));
            dDefaulAcct.append(lblDA);
            btnLoadFile = $("<a class='vis-initial-btn vis-initial-btn-blue' style='margin-right:10px;display:none;'>").append(VIS.Msg.getMsg("LoadAccountingValues"));
            btnLoadFile.on('click', function () {
                fileBrowser.trigger('click');
            });
            // dRbtns.append(btnLoadFile);
            // dBtns.append(dRbtns);
            dLbtns.append(btnLoadFile);
            fileBrowser = $("<input type='file' style='display:none;' accept='.csv*'>");
            fileBrowser.change(function () {

                uploadFile(this);
            });
            //dRbtns.append(fileBrowser);
            dLbtns.append(fileBrowser);


            btnOK = $("<a href='javascript:;' class='vis-initial-btn' style='margin-right: 15px;'>").append(VIS.Msg.getMsg("Done"));
            btnOK.on('click', function () {
                createTenant();
            });
            dLbtns.append(btnOK);
            //btnCancel = $("<a class='initial-btn'>").append(VIS.Msg.getMsg("Cancel"));
            //dLbtns.append(btnCancel);
            //dBtns.append(dLbtns);

            /* Over the form panel only, not the whole screen - the result panel on the
               right stays reachable, so the tenant credentials can be saved while the
               modules are still installing. vis-its-main-wrap is the positioned ancestor
               that bounds it (see ClientSetup.css). */
            container.append($busyDiv);

            cmbCou.change(function () {
                if (cmbCou.val() > 0) {
                    $.ajax({
                        url: VIS.Application.contextUrl + "VSetup/GetRegion",
                        dataType: "json",
                        data: { countryID: cmbCou.val() },
                        error: function () {
                            VIS.ADialog.error(VIS.Msg.getMsg('ERRORGettingInitialData'));
                            $busyDiv[0].style.visibility = "hidden";
                        },
                        success: function (data) {
                            var result = data.result;
                            if (result == null) {
                                VIS.ADialog.error(VIS.Msg.getMsg('ERRORGettingInitialData'));
                                $busyDiv[0].style.visibility = "hidden";
                                return;
                            }
                            cmbReg.empty();
                            loadRegion(result);
                            $busyDiv[0].style.visibility = "hidden";
                        }
                    });
                }

            });

            $busyDiv[0].style.visibility = "visible";

            $.ajax({
                url: VIS.Application.contextUrl + "VSetup/GetInitialData",
                dataType: "json",
                error: function () {
                    VIS.ADialog.error(VIS.Msg.getMsg('ERRORGettingInitialData'));
                    $busyDiv[0].style.visibility = "hidden";
                },
                success: function (data) {

                    var result = data.result;
                    if (result == null) {
                        VIS.ADialog.error(VIS.Msg.getMsg('ERRORGettingInitialData'));
                        $busyDiv[0].style.visibility = "hidden";
                        return;
                    }
                    loadCurrency(result.currency);
                    loadCountry(result.country);
                    loadRegion(result.region);
                    $busyDiv[0].style.visibility = "hidden";
                }
            });

            /* Fired alongside GetInitialData, not after it - this one goes out to
               the Market API and must not hold up the rest of the form. A failure
               here only leaves the package list empty, the package is optional. */
            loadPackages();

        };

        /* Marks the tenant field as clashing (or clears it) - red label and underline on
           the wrap, message under it. Styled in ClientSetup.css. */
        var setTenantNameError = function (taken) {
            tenantNameTaken = taken;
            if ($tenantWrap == null || $tenantMsg == null) {
                return;
            }
            $tenantWrap.toggleClass('vis-its-field-error', taken);
            if (taken) {
                $tenantMsg.children('span').text(msgOr("VIS_TenantNameExists", "Invalid: Tenant name already exists"));
                $tenantMsg.show();
            }
            else {
                $tenantMsg.hide();
            }
        };

        /* Asks the server whether the typed name is still free, and marks the field when
           it is not. Runs on blur, and again from createTenant - answered from the last
           blur when the name has not changed since. A failed request leaves the field
           alone: the server refuses the name on Done anyway, and a network hiccup should
           not block typing. */
        var checkTenantName = function (onDone) {
            var name = txtTenant == null ? '' : txtTenant.val();
            name = name == null ? '' : name.trim();
            if (name.length == 0) {
                setTenantNameError(false);
                checkedTenantName = null;
                if (onDone) { onDone(false); }
                return;
            }
            if (name == checkedTenantName) {
                if (onDone) { onDone(tenantNameTaken); }
                return;
            }
            $.ajax({
                url: VIS.Application.contextUrl + "VSetup/IsTenantNameAvailable",
                dataType: "json",
                data: { clientName: name },
                error: function () {
                    checkedTenantName = null;
                    if (onDone) { onDone(false); }
                },
                success: function (data) {
                    /* The field may have changed while the request was out - an answer
                       for an older name must not be pinned on the current one. */
                    if (txtTenant == null || txtTenant.val().trim() != name) {
                        if (onDone) { onDone(false); }
                        return;
                    }
                    if (data == null || typeof (data.result) != "boolean") {
                        //  no usable answer - same as a failed request
                        checkedTenantName = null;
                        if (onDone) { onDone(false); }
                        return;
                    }
                    checkedTenantName = name;
                    setTenantNameError(!data.result);
                    if (onDone) { onDone(tenantNameTaken); }
                }
            });
        };

        var loadPackages = function () {
            setPackageBusy(true);
            $.ajax({
                url: VIS.Application.contextUrl + "VSetup/GetLocalizationPackages",
                dataType: "json",
                error: function () {
                    loadLocalizationPackages(null);
                    setPackageBusy(false);
                },
                success: function (data) {
                    loadLocalizationPackages(data == null ? null : data.result);
                    setPackageBusy(false);
                }
            });
        };

        /* Locks the package combo while its list is on the way - the rest of the
           form stays usable. */
        var setPackageBusy = function (busy) {
            packagesLoading = busy;
            if (cmbPackage == null) {
                return;
            }
            cmbPackage.prop('disabled', busy);
            if (busy) {
                cmbPackage.empty();
                cmbPackage.append($('<option>').attr('value', '').text(msgOr("Loading", "Loading...")));
            }
            if ($pkgBusy != null) {
                $pkgBusy.css('display', busy ? 'flex' : 'none');
            }
        };

        var loadLocalizationPackages = function (packages) {
            if (cmbPackage == null) {
                return;
            }
            cmbPackage.empty();
            packageInfo = {};
            /* Blank first entry - picking a package is not mandatory. */
            cmbPackage.append($('<option>').attr('value', ''));
            if (packages == null) {
                return;
            }
            for (var itm in packages) {
                var pkg = packages[itm];
                /* Value is the option value, so key the cache with it as a
                   string - option.val() always hands back a string. */
                packageInfo[String(pkg.Value)] = pkg;
                cmbPackage.append($('<option>')
                    .attr('value', pkg.Value)
                    .attr('data-value', pkg.Name)
                    .text(pkg.Name));
            }
        };

        /* Package object (Name / Value / ModuleDetails) for a package value,
           or null when the value is unknown. */
        var getPackage = function (value) {
            if (value == null || value === '' || packageInfo == null) {
                return null;
            }
            var pkg = packageInfo[String(value)];
            return pkg == null ? null : pkg;
        };

        var getSelectedPackage = function () {
            return cmbPackage == null ? null : getPackage(cmbPackage.val());
        };

        /* ModuleDetails of the selected package - each entry carries Name,
           Prefix, LatestAvailableVersion, Installedversion, AvailableVersions. */
        var getSelectedPackageModules = function () {
            var pkg = getSelectedPackage();
            return pkg == null || pkg.ModuleDetails == null ? [] : pkg.ModuleDetails;
        };

        /* Selected package trimmed to what the server needs - package Name and
           Value plus Name / LatestAvailableVersion of each module. Empty string
           when no package is picked, the parameter is optional. */
        var getSelectedPackageJson = function () {
            var pkg = getSelectedPackage();
            if (pkg == null) {
                return '';
            }
            var modules = getSelectedPackageModules();
            var trimmed = [];
            for (var i = 0; i < modules.length; i++) {
                trimmed.push({
                    Name: modules[i].Name,
                    LatestAvailableVersion: modules[i].LatestAvailableVersion
                });
            }
            return JSON.stringify({
                Name: pkg.Name,
                Value: pkg.Value,
                Modules: trimmed
            });
        };

        var loadCurrency = function (currency) {

            if (currency == null) {
                return;
            }
            for (var itm in currency) {

                cmbCurr.append($('<option value="' + currency[itm].ID + '">').append(currency[itm].Name + " (" + currency[itm].ISO_Code + ")"));
            }
        };
        var loadCountry = function (country) {

            if (country == null) {
                return;
            }
            for (var itm in country) {

                cmbCou.append($('<option value="' + country[itm].ID + '">').append(country[itm].Name));
            }
        };
        var loadRegion = function (region) {

            if (region == null) {
                return;
            }
            for (var itm in region) {
                cmbReg.append($('<option value="' + region[itm].ID + '">').append(region[itm].Name));
            }
        };

        var uploadFile = function (file) {
            fileName = file.files[0].name;
            $busyDiv[0].style.visibility = "visible";
            window.setTimeout(function () {
                folderKey = Date.now().toString();
                var xhr = new XMLHttpRequest();
                var fd = new FormData();
                fd.append("file", file.files[0]);
                xhr.open("POST", VIS.Application.contextUrl + "Attachment/SaveFileinTemp/?filename=" + fileName + "&folderKey=" + folderKey, false);
                xhr.send(fd);
                $busyDiv[0].style.visibility = "hidden";
            }, 2);


        };


        var createTenant = function () {
            //showLog(null);
            //return;
            /* The panel is about to be emptied - anything the previous run was still
               polling for has nowhere left to go. */
            stopInstallPolling();
            divModules = null;
            divModuleList = null;
            moduleRows = {};
            $statusLine = null;
            divResultBody.empty();
            btnSave.hide();
            var clientName = txtTenant.val();
            if (clientName == null || clientName.length == 0 || clientName.trim().length == 0) {
                VIS.ADialog.error('FillTenantName');
                return;
            }
            var orgName = txtOrg.val();
            if (orgName == null || orgName.length == 0 || orgName.trim().length == 0) {
                VIS.ADialog.error('FillOrgName');
                return;
            }
            var userClient = txtUTenant.val();
            if (userClient == null || userClient.length == 0 || userClient.trim().length == 0) {
                VIS.ADialog.error('FillUserClient');
                return;
            }
            var userOrg = "";
            //var userOrg = txtUOrg.val();
            //if (userOrg == null || userOrg.length == 0 || userOrg.trim().length == 0) {
            //    VIS.ADialog.error('FillUserOrg');
            //    return;
            //}
            var city = txtCity.val();
            if (city == null || city.length == 0 || city.trim().length == 0) {
                VIS.ADialog.error('FillCity');
                return;
            }
            var currencyID = cmbCurr.val();
            var currencyName = cmbCurr.find('option:selected').text();
            if (currencyName == null || currencyName.length == 0 || currencyName.trim().length == 0) {
                VIS.ADialog.error('FillCurrency');
                return;
            }
            //  var countryID = cmbCurr.val();
            var countryID = cmbCou.val();
            var countryName = cmbCou.find('option:selected').text();
            if (countryName == null || countryName.length == 0 || countryName.trim().length == 0) {
                VIS.ADialog.error('FillCountry');
                return;
            }
            var regionID = cmbReg.val();
            var regionName = cmbReg.find('option:selected').text();
            if (regionName == null || regionName.length == 0 || regionName.trim().length == 0) {
                VIS.ADialog.error('FillRegion');
                return;
            }
            if (chkDA.prop('checked')) {
                fileName = null;
            }
            else {
                if (fileName == null || fileName.length == 0 || fileName.trim().length == 0) {
                    VIS.ADialog.error('SelectFile');
                    return;
                }
            }

            if (userClient == userOrg) {
                VIS.ADialog.error("UsernameMustBeDifferent");
                return;
            }

            /* Packages still on the way - creating now would silently drop the
               package the user meant to pick. */
            if (packagesLoading) {
                /* ADialogUI takes the text as is - ADialog.info would run the
                   already translated string through getMsg a second time. */
                VIS.ADialogUI.info(msgOr("LoadingLocalizationPackages", "Loading packages, please wait..."), "");
                return;
            }

            var cfProduct = chkProduct.prop('checked');
            var cfBPartner = chkBP.prop('checked');
            var cfProject = chkOpprotunity.prop('checked');
            var cfMCampaign = chkCam.prop('checked');
            var cfSRegion = chkSR.prop('checked');
            $busyDiv[0].style.visibility = "visible";

            /* Last of the checks, and the only one that goes to the server - a name the
               blur check already flagged, or one typed and submitted without leaving the
               field, is caught here rather than by CreateClient. Answered from the last
               blur when the name has not changed since. */
            checkTenantName(function (taken) {
                if (taken) {
                    //  the field is already marked - just put the user back on it
                    $busyDiv[0].style.visibility = "hidden";
                    txtTenant.focus();
                    return;
                }
                postCreateTenant(clientName, orgName, userClient, userOrg, city, currencyID, currencyName,
                    countryID, countryName, regionID, regionName, cfProduct, cfBPartner, cfProject, cfMCampaign, cfSRegion);
            });
        };

        var postCreateTenant = function (clientName, orgName, userClient, userOrg, city, currencyID, currencyName,
            countryID, countryName, regionID, regionName, cfProduct, cfBPartner, cfProject, cfMCampaign, cfSRegion) {
            /* The call is one long round trip with nothing to report in between - the
               line says it is running, and goes when the answer arrives. */
            setStatusLine(divResultBody, msgOr("VIS_TenantCreationInitiated", "Tenant creation process initiated"), true);
            $.ajax({
                url: VIS.Application.contextUrl + "VSetup/InitailizeClientSetup",
                type: "POST",
                dataType: "json",
                data: {
                    clientName: clientName,
                    orgName: orgName,
                    userClient: userClient,
                    userOrg: userOrg,
                    city: city,
                    currencyID: currencyID,
                    currencyName: currencyName,
                    countryID: countryID,
                    countryName: countryName,
                    regionID: regionID,
                    regionName: regionName,
                    cfProduct: cfProduct,
                    cfBPartner: cfBPartner,
                    cfProject: cfProject,
                    cfMCampaign: cfMCampaign,
                    cfSRegion: cfSRegion,
                    fileName: fileName,
                    folderKey: folderKey,
                    selectedPackage: getSelectedPackageJson()
                },

                error: function () {
                    setStatusLine(divResultBody, VIS.Msg.getMsg("ErrorCreatingTenant"), false);
                    VIS.ADialog.error("ErrorCreatingTenant");
                    $busyDiv[0].style.visibility = "hidden";
                },
                success: function (data) {
                    var tInfo = data.result;
                    //if (tInfo.Log != null && tInfo.Log.trim().length > 0) {
                    //    $busyDiv[0].style.visibility = "hidden";
                    //    VIS.ADialog.error(tInfo.Log);
                    //    return;
                    //}
                    $busyDiv[0].style.visibility = "hidden";
                    clearStatusLine();
                    showLog(tInfo);
                }
            });

        };

        /* The form is disposed while a poll may still be in flight, and dispose drops
           $busyDiv - so never assume it is still there. */
        var setBusy = function (visible) {
            if ($busyDiv != null && $busyDiv.length > 0) {
                $busyDiv[0].style.visibility = visible ? "visible" : "hidden";
            }
        };

        /* Installation runs on the server after the tenant response, so the only way to
           tell what it is doing is to keep asking Market for its log. */
        var startInstallPolling = function (logKey) {
            stopInstallPolling();

            /* Creating the tenant is only half the job - keep the form marked busy until
               the modules are in as well, so it does not look finished while work is
               still running. The overlay has no background of its own, so the progress
               list behind it stays readable. */
            setBusy(true);

            divModules = $('<div class="vis-its-modules">');
            divModules.append($('<h3>').append(msgOr("PackageInstallation", "Package Installation")));
            divModuleList = $('<div>');
            divModules.append(divModuleList);
            divResultBody.append(divModules);

            /* Market writes its log lines when the install request reaches it, so for the
               first moment there is nothing to read yet - that is not "nothing to do".
               The module list is not drawn until then either: the first reading is the
               moment the modules have actually been fetched, and the list follows a
               "Fetched modules" line (showInstallLog). */
            moduleRows = {};
            setStatusLine(divModules, msgOr("Starting", "Starting"), true);

            installPollCount = 0;
            var poll = function () {
                $.ajax({
                    url: VIS.Application.contextUrl + "VSetup/GetInstallLog",
                    dataType: "json",
                    /* Kept out of the global ajaxError handler in desktopmgr.js. Installing
                       modules writes files into the running application, so the AppDomain
                       restarts mid installation - any request caught in that window fails,
                       and the global handler answers a failure by showing the "session
                       expired" dialog and reloading the page. That would throw away the
                       tenant details and the progress the user is watching. */
                    global: false,
                    data: { logKey: logKey },
                    error: function (xhr) {
                        /* 401 is the one failure worth stopping for - the user really is
                           logged out and no amount of retrying brings the log back. */
                        if (xhr != null && xhr.status === 401) {
                            showInstallMessage(msgOr("ModuleInstallSignedOut",
                                "Signed out - the installation carries on in the background."));
                            stopInstallPolling();
                            return;
                        }
                        /* Anything else is the restart, or a blip - the installation is
                           still going, so keep asking until the cap runs out. */
                        scheduleNextPoll(poll);
                    },
                    success: function (data) {
                        var rows = data == null ? null : data.result;
                        showInstallLog(rows);
                        if (rows != null && rows.length > 0 && isInstallFinished(rows)) {
                            /* Say it is over - a list that simply stops changing does not
                               tell the user whether it finished or stalled. Note that this
                               only covers the database side, the application files are
                               still waiting - hence the log that follows. */
                            var failed = hasInstallError(rows);
                            showInstallMessage(failed
                                ? msgOr("ModuleInstallFinishedWithErrors", "Installation finished with errors.")
                                : msgOr("ModuleInstalled", "All modules installed successfully."));
                            /* Busy off first, or a confirm sits behind an overlay and the
                               save button underneath it cannot be reached. */
                            stopInstallPolling();
                            if (failed) {
                                /* Something to read here before the page is left - ask, as
                                   before, and leave a link if the user stays. */
                                showInstallMessage(msgOr("ReplaceModuleFilesHint",
                                    "Replacing the application files restarts the application - sign in again from the log."));
                                confirmInstallFilesLog(logKey);
                                return;
                            }
                            /* Straight on to the log page. The tenant details go with it
                               (sessionStorage) and it has its own save button, so there is
                               nothing left here to keep the user for - unless the hand over
                               failed, in which case leaving would lose the passwords, and
                               the old question is the right thing to ask. */
                            if (handOverTenantInfo(logKey)) {
                                showInstallFilesLog(logKey);
                            }
                            else {
                                confirmInstallFilesLog(logKey);
                            }
                            return;
                        }
                        scheduleNextPoll(poll);
                    }
                });
            };
            poll();
        };

        /* Stops after MAX_INSTALL_POLLS so a stuck installation does not leave the
           screen polling for the rest of the session. */
        var scheduleNextPoll = function (poll) {
            installPollCount++;
            if (installPollCount >= MAX_INSTALL_POLLS) {
                showInstallMessage(msgOr("ModuleInstallStillRunning",
                    "Still running - check the module log for the rest."));
                /* Giving up on the log also releases the form - leaving it busy for a
                   run we have stopped watching would strand the user. */
                stopInstallPolling();
                return;
            }
            installPollTimer = window.setTimeout(poll, INSTALL_POLL_INTERVAL);
        };

        /* Installing a module only puts its database side in - Market holds the
           application files back (ReplaceAllModuleFilesTogether) and hands them to
           ModuleFilesLog, which copies them into bin and renders the log of it. Until
           that page is requested the files stay pending, so opening it is the last step
           of the installation.

           The tab navigates to it, the same way the Market screen navigates to ModuleLog
           (moduledialog.js). That leaves the application behind: replacing the files
           restarts it and drops the session, so anything still running here would only go
           stale - and the page is built to stand alone, with Re-Login as the way back in.

           It has to be a navigation rather than a frame or a background call: the response
           is rendered before the new bin files restart the application, so the page the
           user is left on is already complete. */
        var showInstallFilesLog = function (logKey) {
            handOverTenantInfo(logKey);
            window.location = VIS.Application.contextUrl + "Market/Module/ModuleFilesLog?logKey="
                + encodeURIComponent(logKey);
        };

        /* The tenant details do not survive the navigation, and they cannot be fetched
           again - the passwords are generated during setup and kept hashed, so what the
           browser holds is the only copy. They are left in sessionStorage for the log page
           to pick up (ModuleFilesLog.cshtml): same origin and same tab, so the navigation
           carries them, and no password goes through the URL, the request log or a
           referrer the way a query string would.

           Keyed by the log key, so two setups in different tabs cannot read each other's.
           The log page removes the entry once it has rendered them.

           Returns whether the details are in storage - the caller decides whether leaving
           without them is acceptable. Safe to call twice for the same key. */
        var handOverTenantInfo = function (logKey) {
            if (tenantInfo == null) {
                return false;
            }
            try {
                window.sessionStorage.setItem('VIS_TenantInfo_' + logKey, JSON.stringify({
                    TenantName: tenantInfo.TenantName,
                    OrgName: tenantInfo.OrgName,
                    AdminRole: tenantInfo.AdminRole,
                    AdminUser: tenantInfo.AdminUser,
                    AdminUserPwd: tenantInfo.AdminUserPwd
                }));
                return true;
            }
            catch (e) {
                /* Private mode, or storage full - the log page is still worth opening, it
                   just shows the log alone. */
                console.log("Tenant details not handed to the log page - " + e.message);
                return false;
            }
        };

        /* The Market screen navigates to its log without asking. This one asks, because the
           tab is about to leave a screen the user may not be finished with - the details
           travel to the log page now, but the save button here does not. */
        var confirmInstallFilesLog = function (logKey) {
            /* ADialogUI takes the text as it is - ADialog.confirm would run an already
               translated string through getMsg a second time. */
            VIS.ADialogUI.ask(
                msgOr("ConfirmOpenModuleLog",
                    "Modules installed. The installation log opens on its own page, with the "
                    + "tenant details on it. Open the log now?"),
                msgOr("PackageInstallation", "Package Installation"),
                function (ok) {
                    if (ok) {
                        showInstallFilesLog(logKey);
                        return;
                    }
                    showInstallFilesLogLink(logKey);
                });
        };

        /* Left behind when the user stays. The application files are still pending until
           the log page is requested, so choosing to save first must not become a dead end -
           this is the way back to it. */
        var showInstallFilesLogLink = function (logKey) {
            if (divModuleList == null) {
                return;
            }
            divModuleList.append($('<div style="margin-top:10px">')
                .append($('<a href="javascript:;">')
                    .append(msgOr("OpenModuleLog", "Open the installation log"))
                    .on('click', function () {
                        showInstallFilesLog(logKey);
                    })));
        };

        /* Closing note under the module list - how the run ended. */
        var showInstallMessage = function (text) {
            if (divModuleList == null) {
                return;
            }
            divModuleList.append($('<div style="margin-top:10px;margin-bottom:10px">').append(text));
        };

        var hasInstallError = function (rows) {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].IsSuccess) {
                    return true;
                }
            }
            return false;
        };

        /* The one place polling ends, whichever way it ended - so the busy indicator is
           cleared here rather than at each of the call sites. */
        var stopInstallPolling = function () {
            if (installPollTimer != null) {
                window.clearTimeout(installPollTimer);
                installPollTimer = null;
            }
            setBusy(false);
        };

        /* Done once no module is still queued or running - Market reports "NotStarted"
           for a module it has not reached yet and "InProgress" for the one it is on. */
        var isInstallFinished = function (rows) {
            for (var i = 0; i < rows.length; i++) {
                var msg = rows[i].Message;
                if (!rows[i].IsSuccess && (msg === "InProgress" || msg === "NotStarted")) {
                    return false;
                }
            }
            return true;
        };

        /* One line in the module list: name, status word, state icon. Starts pending. */
        var addModuleRow = function (name) {
            if (divModuleList == null || name == null || moduleRows[name] != null) {
                return null;
            }
            var $row = $('<div class="vis-its-module">')
                .append($('<span class="vis-its-module-name">').text(name))
                .append($('<span class="vis-its-module-status">'))
                .append($('<i class="vis-its-module-icon">'));
            divModuleList.append($row);
            moduleRows[name] = $row;
            setModuleState($row, "pending", null);
            return $row;
        };

        /* States: pending (clock), installing (spinner - only the one Market is on),
           installed (green tick), failed (red cross, with Market's message as title). */
        var setModuleState = function ($row, state, message) {
            var text, icon;
            if (state === "installed") {
                text = msgOr("Installed", "Installed");
                icon = "fa fa-check-circle";
            }
            else if (state === "installing") {
                text = msgOr("InProgress", "Installing");
                icon = "fa fa-refresh fa-spin";
            }
            else if (state === "failed") {
                text = msgOr("Failed", "Failed");
                icon = "fa fa-times-circle";
            }
            else {
                text = msgOr("Pending", "Pending");
                icon = "fa fa-clock-o";
            }
            $row.attr('class', 'vis-its-module vis-its-module-' + state);
            $row.children('.vis-its-module-status').text(text)
                .attr('title', message == null ? '' : message);
            $row.children('.vis-its-module-icon').attr('class', 'vis-its-module-icon ' + icon);
        };

        /* Applies one Market log reading to the rows - by name, in place. Market reports
           "NotStarted" for a module it has not reached, "InProgress" for the one it is
           on, IsSuccess when done; anything else is the error it failed with. */
        var showInstallLog = function (rows) {
            if (divModuleList == null) {
                return;
            }
            /* Nothing yet - leave the "Starting..." line rather than blanking the section. */
            if (rows == null || rows.length === 0) {
                return;
            }
            /* First reading with rows: "Starting" is over, the modules are known. The
               line stays, above the list, as the record of that step. */
            if ($statusLine != null) {
                clearStatusLine();
                divModuleList.before($('<div class="vis-its-status">')
                    .append($('<span>').text(msgOr("VIS_ModulesFetched", "Fetched modules from package"))));
            }
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                /* Rows are drawn from the log itself, in Market's order - a name seen
                   for the first time gets a line. */
                var $row = moduleRows[row.Name] || addModuleRow(row.Name);
                if ($row == null) {
                    continue;
                }
                var msg = row.Message;
                if (row.IsSuccess) {
                    setModuleState($row, "installed", null);
                }
                else if (msg === "InProgress") {
                    setModuleState($row, "installing", null);
                }
                else if (msg === "NotStarted") {
                    setModuleState($row, "pending", null);
                }
                else {
                    setModuleState($row, "failed", msg);
                }
            }
        };

        var showLog = function (tInfo) {
            //var divLog=$('<div>');

            tenantInfo = tInfo;



            if (tInfo.Log != null && tInfo.Log.trim().length > 0) {
                divResultBody.append($('<div style="margin-bottom:10px">').append(" Error - " + tInfo.Log));
                divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_TenantErrorMsg')));
            }

            divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_TenantName') + ": " + tInfo.TenantName));
            divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_OrgName') + ": " + tInfo.OrgName));
            divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_AdminRole') + ": " + tInfo.AdminRole));
            divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_AdminUserName') + ": " + tInfo.AdminUser));
            divResultBody.append($('<div style="margin-bottom:10px">').append(VIS.Msg.getMsg('VIS_AdminUserPW') + ": " + tInfo.AdminUserPwd));

            /* A LogKey means a package was picked and the modules are being installed
               in the background - show what is happening rather than leaving the user
               with a finished looking screen while work is still going on. */
            if (tInfo.LogKey != null && tInfo.LogKey.length > 0) {
                startInstallPolling(tInfo.LogKey);
            }


            //divRight.append($('<div style="margin-bottom:10px">').append(" Tenant Name - A"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Organization Name - A"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Admin Role - AAdmin"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" User Role - AUser"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Admin Username - AA"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Admin User Password - AA"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Org Username - BB"));
            //divRight.append($('<div style="margin-bottom:10px">').append(" Org User Password - BB"));

            //btnSave = null;
            //if (VIS.Application.isRTL) {
            //    btnSave = $('<a href="javascript:void(o)" style="float:left;" class="vis-initial-btn vis-initial-btn-blue">').append($("<i class='vis vis-save'></i>"));
            //}
            //else {
            // btnSave = $('<a href="javascript:void(o)" class="vis-initial-btn vis-initial-btn-blue">').append($("<i class='vis vis-save'></i>"));
            //}
            btnSave.on('click', function () {

                var text = '';
                text += " Tenant Name - " + tInfo.TenantName + "\t\n";
                text += " Organization Name - " + tInfo.OrgName + "\t\n";
                text += " Admin Role - " + tInfo.AdminRole + "\t\n";
                text += " Admin Username - " + tInfo.AdminUser + "\t\n";
                text += " Admin User Password - " + tInfo.AdminUserPwd + "\t\n";

                //text += " Tenant Name - AA" +"\t\n";
                //text += " Organization Name - AA" +"\t\n";
                //text += " Admin Role - AA" + "\t\n";
                //text += " User Role - AA" + "\t\n";
                //text += " Admin Username - AA" + "\t\n";
                //text += " Admin User Password - AA" + "\t\n";
                //text += " Org Username - AA"+ "\t\n";
                //text += " Org User Password - AA" +"\t\n";

                var d = new Date().toISOString().slice(0, 19).replace(/-/g, "");
                var fileData = "data:text/csv;base64," + window.btoa(text);
                $(this).attr("href", fileData).attr("download", "file-" + d + ".txt");

                //divLog.dialog('close');
                // divLog = null;
            });
            btnSave.show();
            // divRight.append(btnSave);

            //divLog.dialog({
            //    width: 520,
            //    height: 284,
            //    resizable: false,
            //    modal: true
            //    //close: function () { };
            //});

        };
        this.disposeComponent = function () {
            /* The timer outlives the form otherwise, and would keep asking for a log
               nothing is listening to. */
            stopInstallPolling();
            divModules = null;
            divModuleList = null;
            moduleRows = {};
            $statusLine = null;
            tenantInfo = null;
            txtTenant = null;
            $tenantWrap = null;
            $tenantMsg = null;
            txtOrg = null;
            txtUTenant = null;
            txtUOrg = null;
            cmbCurr = null;
            cmbCou = null;
            txtCity = null;
            cmbReg = null;
            chkOpprotunity = null;
            chkSR = null;
            chkProduct = null;
            chkCam = null;
            chkBP = null;
            btnLoadFile = null;
            btnCancel = null;
            btnOK = null;
            cmbPackage = null;
            $pkgBusy = null;
            packageInfo = null;
            $busyDiv = null;
            //$root.dialog("close");
            $root = null;
        };


        this.getRoot = function () {
            return $root;
        };


    };


    //Must Implement with same parameter
    VSetup.prototype.sizeChanged = function (height, width) {
        //this.sizeChanged(height, width);
    };


    //Must Implement with same parameter
    VSetup.prototype.init = function (windowNo, frame) {
        //Assign to this Varable
        this.frame = frame;
        this.windowNo = windowNo;
        //frame.hideHeader(true);
        this.load();
        this.frame.getContentGrid().append(this.getRoot());

    };

    //Must implement dispose
    VSetup.prototype.dispose = function () {
        /*CleanUp Code */
        //dispose this component
        this.disposeComponent();

        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };




    VIS.Apps.AForms.VSetup = VSetup;
})(VIS, jQuery);