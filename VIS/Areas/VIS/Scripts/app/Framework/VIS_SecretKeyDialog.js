/************************************************************
 * Module Name    : VIS
 * Purpose        : popup for confirmation of password
 * chronological  : Development
 * Created Date   : 13 Feb 2025
 * Created by     : VAI050
 ***********************************************************/
; (function (VIS, $) {
    VIS.Framework = VIS.Framework || {};

    function VIS_SecretKeyDialog(windowNo, ad_ClientID, ad_OrgID, adRole_ID, ad_User_ID, projectID, keyName, listDiv, isActive, mode, recordID) {
        var ch = null;
        var $bsyDiv = $('<div class="vis-busyindicatorouterwrap"><div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div></div>');

        var $root = $('<div class="h-100">');
        var $self = this;
        this.windowNo;
        this.onClose = null;
        var isPasswordScreen = true;
        // HTML for saving the key after password confirmation

        var saveKeyHtml =
            '<div class="VIS-key-popup-container">' +
            //'<h2>' + VIS.Msg.getMsg("VAAPI_SaveYourKey") + '</h2>' +
            '<p class="VIS-secret-key-p-content">' + VIS.Msg.getMsg("VAAPI_SaveYourKeyInfo") + '</p>' +
            '<div class="VIS-save-secret-key-key-container">' +
            '<input id="VIS_SecretKeytxt_' + windowNo + '" type="text" value="" readonly>' +
            '<button id="VIS_SaveSecretKey_' + windowNo + '" class="VIS-save-secret-key-copy-btn">' + VIS.Msg.getMsg("VAAPI_Copy") + '</button>' +
            '</div>' +
            '<button id="VIS_DoneSecretKey_' + windowNo + '" class="VIS-save-secret-key-done-btn">' + VIS.Msg.getMsg("VAAPI_Done") + '</button>' +
            '</div>';


        // Function to generate the dialog HTML
        function getPopupHTML() {
            if (mode) {
                return (
                    '<div class="VIS_edit-secret-key-dialog">' +
                    '<div class="VIS_container-key">' +
                    '<div class="key-details">' +
                    //'<h2>' + VIS.Msg.getMsg("VAAPI_EditSecretKey") + '</h2>' +
                    '<label for="keyName">' + VIS.Msg.getMsg("VAAPI_KeyName") + ' </label>' +
                    '<input type="text" id="VIS_EditSecretKeytxt_' + windowNo + '" placeholder="My Test Key"  value="' + keyName + '">' +
                    //'<div id="VIS_PasswordError_' + windowNo + '" class="VIS-key-error-message"></div>' +

                    '<label for="project">' + VIS.Msg.getMsg("VAAPI_Project") + '</label>' +
                    '<select id="VIS_ProjectSelect_' + windowNo + '">' +
                    '<option>Default project</option>' +
                    '</select>' +

                    '<div class="VIS_toggle-switch">' +
                    '<input type="checkbox" id="VIS_ActiveToggle_' + windowNo + '" class="active-toggle" ' + (isActive ? 'checked' : '') + '>' +
                    '<label for="VIS_ActiveToggle_' + windowNo + '"></label>' +
                    '<span>Active</span>' +
                    '</div>' +
                    '<div class="VIS_buttons">' +
                    '<button id="VIS_EditedCancel_' + windowNo + '"  class="VIS_cancel">' + VIS.Msg.getMsg("VAAPI_Cancel") + '</button>' +
                    '<button  id="VIS_SaveEditedSecretKey_' + windowNo + '" class="VIS_save">' + VIS.Msg.getMsg("VIS_OK") + '</button>' +
                    '<div id="VIS_EditKeyError_' + windowNo + '" class="error-message" style="display:none; color: red; font-size: 14px;"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                );

            } else {
                return (
                    '<div id="VIS_PasswordDiv_' + windowNo + '" class="VIS-confirm-password-container">' +
                    '<div   class="VIS-key-confirm-password">' +
                    //'<h2 class="VIS-popup-header">' + VIS.Msg.getMsg("VAAPI_EnterYourPassword") + '</h2>' +
                    '<p class="VIS-popup-description VIS-secret-key-p-content">' + VIS.Msg.getMsg("VAAPI_EnterYourPasswordInfo") + '</p>' +
                    '<input id="VIS_Passwordtxt_' + windowNo + '" type="password" placeholder="Enter your password" class="VIS-popup-input">' +
                    '<button id="VIS_ConfirmPassword_' + windowNo + '" class="VIS-popup-button">' + VIS.Msg.getMsg("VAAPI_Done") + '</button>' +
                    '<div id="VIS_PasswordError_' + windowNo + '" class="VIS-key-error-message"></div>' +
                    '</div>' +
                    '</div>'
                );
            }
        }

        $root.append(getPopupHTML());
        if (mode) {
            getProjects($root.find('#VIS_ProjectSelect_' + windowNo));
        }

        // Event listener for the Save or Confirm button based on mode
        if (mode) {
            $root.find('#VIS_SaveEditedSecretKey_' + windowNo).on("click", function () {
                $root.find('#VIS_PasswordError_' + windowNo).hide();
                $bsyDiv[0].style.visibility = 'visible';
                var keyName = $root.find('#VIS_EditSecretKeytxt_' + windowNo).val();
                var projectID = $root.find('#VIS_ProjectSelect_' + windowNo).val();
                var isActiveChecked = $root.find('#VIS_ActiveToggle_' + windowNo).is(":checked");
                // Validation: Check if keyName is empty
                if (!keyName) {
                    $root.find('#VIS_PasswordError_' + windowNo).text(VIS.Msg.getMsg("VAAPI_KeyNameMandatory")).show();
                    $root.find('#VIS_EditSecretKeytxt_' + windowNo).focus(); // Focus back on input field
                    $bsyDiv[0].style.visibility = 'hidden';

                    return; // Stop further execution
                }
                const updateData = {
                    KeyName: keyName,
                    ProjectID: projectID,
                    IsActive: isActiveChecked,
                    RecordID: recordID
                };

                $.ajax({
                    url: VIS.Application.contextFullUrl + "VIS/UserPreference/UpdateSecretKey",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(updateData),
                    success: function (response) {
                        if (response) {
                            //VIS.ADialog.info("Secret Key updated successfully!");
                            $bsyDiv[0].style.visibility = 'hidden';
                            $self.onClose();
                            ch.close();

                        } else {
                            $root.find('#VIS_EditKeyError_' + windowNo).text("Record not updated").show();
                            $bsyDiv[0].style.visibility = 'hidden';
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error calling API:", error);
                    }
                });
            });

            $root.find('#VIS_EditedCancel_' + windowNo).on("click", function () {
                ch.close();
            }
            );
        }
        else {
            $root.find('#VIS_ConfirmPassword_' + windowNo).on("click", function () {
                $bsyDiv[0].style.visibility = 'visible';
                var password = $root.find('#VIS_Passwordtxt_' + windowNo).val().trim();
                if (password === "") {
                    $root.find('#VIS_PasswordError_' + windowNo).text(VIS.Msg.getMsg("VAAPI_PleaseEnterPassword")).show();
                    $bsyDiv[0].style.visibility = 'hidden';
                    return;
                }
                var userName = VIS.context.getContext("##AD_User_Value");
                const requestData = {
                    password: password,
                    userName: userName,
                    AD_Client_ID: ad_ClientID,
                    AD_Org_ID: ad_OrgID,
                    AD_User_ID: ad_User_ID,
                    AD_Role_ID: adRole_ID,
                    Project_ID: projectID,
                    keyName: keyName
                };

                $.ajax({
                    url: VIS.Application.contextFullUrl + "VIS/UserPreference/LoginAndInitSession",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(requestData),
                    success: function (response) {
                        if (response && response.success) {
                            isPasswordScreen = false;
                            $root.find('#VIS_PasswordDiv_' + windowNo).hide(); // Hide password section
                            $root.append(saveKeyHtml); // Show Save Key UI
                            $root.find('#VIS_SecretKeytxt_' + windowNo).val(response.sessionToken); // Set session token
                            $bsyDiv[0].style.visibility = 'hidden';
                            setTimeout(function () {
                                var contentHeight = $root.find('.VIS-key-popup-container')[0].offsetHeight + 6;
                                ch.changeHeight(contentHeight);
                            }, 50);
                            ch.changeWidth(557);
                            ch.changeTitle(VIS.Msg.getMsg("VAAPI_SaveYourKey"));
                            // Add event listener to "Copy" button
                            $root.find('#VIS_SaveSecretKey_' + windowNo).on("click", function () {
                                var secretKeyText = $root.find('#VIS_SecretKeytxt_' + windowNo).val();

                                // Ensure the text is not empty
                                if (secretKeyText.trim() === '') {
                                    alert('The textbox is empty!');
                                    return;
                                }
                                // Create a temporary textarea element to copy text
                                var tempTextArea = $('<textarea>');
                                $root.append(tempTextArea);
                                tempTextArea.val(secretKeyText);

                                // Select the text properly
                                tempTextArea[0].select();
                                tempTextArea[0].setSelectionRange(0, tempTextArea.val().length); // Explicit selection

                                try {
                                    document.execCommand('copy'); // Copy text
                                    var $copyButton = $root.find('#VIS_SaveSecretKey_' + windowNo);
                                    $copyButton.html('<span class="VIS-copy-tick-icon">✔️</span>');
                                    $copyButton.prop('disabled', true); // Disable the button

                                    // Set timeout to revert back to the original button after 5 seconds
                                    setTimeout(function () {
                                        $copyButton.html(VIS.Msg.getMsg("VAAPI_Copy")); // Revert back to "Copy"
                                        $copyButton.prop('disabled', false); // Enable the button again
                                    }, 5000);

                                } catch (err) {
                                    console.error('Error copying text: ', err);
                                }

                                tempTextArea.remove(); // Remove temporary textarea
                            });

                            $root.find('#VIS_DoneSecretKey_' + windowNo).on("click", function () {
                                $self.onClose();
                                ch.close();

                            });
                        } else {
                            $root.find('#VIS_PasswordError_' + windowNo).text(response.message).show();
                            $bsyDiv[0].style.visibility = 'hidden';
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error calling API:", error);
                    }
                });
            });
        }
      

        $root.find('#VIS_EditSecretKeytxt_' + windowNo).on('input', function () {
            const value = $(this).val().trim();
            const okButton = $root.find('#VIS_SaveEditedSecretKey_' + windowNo);
            if (value == '') {
                $root.find('#VIS_EditSecretKeytxt_' + windowNo).addClass('VIS-editkey-input-border');
            } else {
                $root.find('#VIS_EditSecretKeytxt_' + windowNo).removeClass('VIS-editkey-input-border');
            }
            okButton.prop('disabled', value == '');
        });
        function load() {
            $root.append($bsyDiv);
            busyDiv(false);
        }
        function getProjects(lstID) {
            lstID.empty();
            $.ajax({
                url: VIS.Application.contextUrl + "UserPreference/GetProjects",
                dataType: "json",
                success: function (data) {
                    $self.projectList = JSON.parse(data);
                    $root.find();
                    var cmbProjectContent = "";
                    for (var itm in $self.projectList) {
                        cmbProjectContent += "<option value=" + $self.projectList[itm].RecKey + ">" + $self.projectList[itm].Name + "</option>";
                    }
                    lstID.append(cmbProjectContent);
                    lstID.val(projectID);
                    cmbProjectContent = null;
                }
            });

        };


        this.show = function () {
            var windowWidth = $(window).width();
            if (windowWidth < 768) {
                windowWidth = '50';
            } else if (windowWidth >= 768 && windowWidth < 900) {
                windowWidth = '60';
            } else {
                windowWidth = '30';
            }
            load();
            ch = new VIS.ChildDialog();
            if (mode) {
                ch.setHeight(341);
            }
            else {
                setTimeout(function () {
                    var contentHeight = $root.find('.VIS-confirm-password-container')[0].offsetHeight + 6;
                    ch.setHeight(contentHeight);
                }, 50);
            }
            if (mode) {
                windowWidth -= 4;
            }
            var finalWidth = windowWidth + '%';
            ch.setWidth(finalWidth);
            ch.setTitle(mode ? VIS.Msg.getMsg("VAAPI_EditSecretKeyHeader") : VIS.Msg.getMsg("VAAPI_ConfirmPasswordHeader"));
            ch.setModal(true);
            ch.setEnableResize(false);
            ch.setContent($root);
            ch.show();
            setTimeout(this.display, 1000);
            ch.hideButtons();
            ch.onClose = function () {
                if (isPasswordScreen) {
                    $self.dispose();
                }
                else {
                    $self.onClose();
                    ch.close();
                }
            };
        };

        function busyDiv(Value) {
            if (Value) {
                $bsyDiv[0].style.visibility = 'visible';
            } else {
                $bsyDiv[0].style.visibility = 'hidden';
            }
        }

        /* to dispose the memory*/
        this.disposeComponent = function () {
            $self = null;
            if ($root)
                $root.remove();
            $root = null;
            $bsyDiv = null;
            this.disposeComponent = null;
            ch.close();
        };
    }
    VIS_SecretKeyDialog.prototype.dispose = function () {
        this.disposeComponent();
    };


    VIS.Framework.VIS_SecretKeyDialog = VIS_SecretKeyDialog;

})(VIS, jQuery);
