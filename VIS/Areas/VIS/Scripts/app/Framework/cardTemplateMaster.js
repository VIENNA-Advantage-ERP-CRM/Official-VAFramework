; (function (VIS, $) {

    function VCTMaster() {
        this.frame;
        var self = this;
        var WindowNo = VIS.Env.getWindowNo();
        var btnTemplateBack = null;
        var count = 1;
        var DivTemplate = null;
        var DivCardFieldSec = null;
        var DivCradStep2 = null;
        var DivStyleSec1 = null;
        var DivViewBlock = null;
        var btnLayoutSetting = null;
        var AD_HeaderLayout_ID = null;
        var btnChangeTemplate = null;
        var divTopNavigator = null;
        var spnLastSaved = null;
        var DivGridSec = null;
        var activeSection = null;
        var startRowIndex = null;
        var startCellIndex = null;
        var lastSelectedID = null;
        var mdown = false;
        var chkAllBorderRadius = null;
        var chkAllPadding = null;
        var chkAllMargin = null;
        var chkAllBorder = null;
        var txtCustomStyle = null;
        var txtSQLQuery = null;
        var txtRowGap = null;
        var txtColGap = null;
        var btnAddField = null;
        var btnAddImgField = null;
        var btnAddImgTxtField = null;
        var btn_BlockCancel = null;
        var btnFinesh = null;
        var rowIdx = null;
        var colIdx = null;
        var txtTemplateName = null;
        var addedColPos = [];
        var sectionCount = 2;
        var btnEditIcon = null;
        var isNewSection = false;
        var isSystemTemplate = 'Y';
        var btnaddBlankTemplate = null;
        var btnUndo =null;
        var btnRedo = null;
        var dragged = null;
        var btnVaddrow = null;
        var btnVaddCol = null;
        var btnVdelrow =null;
        var btnVdelCol = null;
        var btnRefreshTemplate = null;
        var force = 0;
        var cmbTemplateCategory = null;
        var cmbViwBlockTemplateCategory = null;
        var gridObj = {
        };

        var isUndoRedo = false;
        var history = [];
        var s_history = true;
        var cur_history_index = 0; 

        var measurment = ['px', '%', 'cm', 'mm', 'in', 'pc', 'pt', 'ch', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax'];
        /* Editor Style property */
        var editorProp = {
            width: {
                proprty: 'width',
                value: '',
                measurment: true
            },
            minWidth: {
                proprty: 'min-width',
                value: '',
                measurment: true
            },
            height: {
                proprty: 'height',
                value: '',
                measurment: true
            },
            minHeight: {
                proprty: 'min-height',
                value: '',
                measurment: true
            },
            fontSize: {
                proprty: 'font-size',
                value: '',
                measurment: true
            },
            fontFamily: {
                proprty: 'font-family',
                value: '',
                measurment: false
            },
            color: {
                proprty: 'color',
                value: '',
                measurment: false
            },
            border: {
                proprty: 'border',
                value: '',
                measurment: true
            },
            borderType: {
                proprty: 'border-style',
                value: '',
                measurment: false
            },
            borderColor: {
                proprty: 'border-color',
                value: '',
                measurment: false
            },
            borderLeft: {
                proprty: 'border-left-width',
                value: '',
                measurment: true
            },
            borderLeftStyle: {
                proprty: 'border-left-style',
                value: '',
                measurment: false
            },
            borderLeftColor: {
                proprty: 'border-left-color',
                value: '',
                measurment: false
            },
            borderTop: {
                proprty: 'border-top-width',
                value: '',
                measurment: true
            },
            borderTopStyle: {
                proprty: 'border-top-style',
                value: '',
                measurment: false
            },
            borderTopColor: {
                proprty: 'border-top-color',
                value: '',
                measurment: false
            },
            borderRight: {
                proprty: 'border-right-width',
                value: '',
                measurment: true
            },
            borderRightStyle: {
                proprty: 'border-right-style',
                value: '',
                measurment: false
            },
            borderRightColor: {
                proprty: 'border-right-color',
                value: '',
                measurment: false
            },
            borderBottom: {
                proprty: 'border-bottom-width',
                value: '',
                measurment: true
            },
            borderBottomStyle: {
                proprty: 'border-bottom-style',
                value: '',
                measurment: false
            },
            borderBottomColor: {
                proprty: 'border-bottom-color',
                value: '',
                measurment: false
            },

            borderRadius: {
                proprty: 'border-radius',
                value: '',
                measurment: true
            },
            borderTopLeftRadius: {
                proprty: 'border-top-left-radius',
                value: '',
                measurment: true
            },
            borderTopRightRadius: {
                proprty: 'border-top-right-radius',
                value: '',
                measurment: true
            },
            borderBottomRightRadius: {
                proprty: 'border-bottom-right-radius',
                value: '',
                measurment: true
            },
            borderBottomLeftRadius: {
                proprty: 'border-bottom-left-radius',
                value: '',
                measurment: true
            },
            padding: {
                proprty: 'padding',
                value: '',
                measurment: true
            },
            paddingLeft: {
                proprty: 'padding-left',
                value: '',
                measurment: true
            },
            paddingTop: {
                proprty: 'padding-top',
                value: '',
                measurment: true
            },
            paddingRight: {
                proprty: 'padding-right',
                value: '',
                measurment: true
            },
            paddingBottom: {
                proprty: 'padding-bottom',
                value: '',
                measurment: true
            },
            margin: {
                proprty: 'margin',
                value: '',
                measurment: true
            },
            marginLeft: {
                proprty: 'margin-left',
                value: '',
                measurment: true
            },
            marginTop: {
                proprty: 'margin-top',
                value: '',
                measurment: true
            },
            marginRight: {
                proprty: 'margin-right',
                value: '',
                measurment: true
            },
            marginBottom: {
                proprty: 'margin-bottom',
                value: '',
                measurment: true
            }, opacity: {
                proprty: 'opacity',
                value: '',
                measurment: false
            }, backgroundColor: {
                proprty: 'background-color',
                value: '',
                measurment: false
            },
            gradientInput: {
                proprty: 'background',
                value: '',
                measurment: false
            },
            gradient: {
                proprty: 'background',
                value: '',
                measurment: false
            },
            boxShadow: {
                proprty: 'box-shadow',
                value: '',
                measurment: true
            },
            flexDirection: {
                proprty: 'flex-direction',
                value: '',
                measurment: false
            },
            bold: {
                proprty: 'font-weight',
                value: 'bold',
                measurment: false
            },
            italic: {
                proprty: 'font-style',
                value: 'italic',
                measurment: false
            },
            underline: {
                proprty: 'text-decoration',
                value: 'underline',
                measurment: false
            },
            upperCase: {
                proprty: 'text-transform',
                value: 'uppercase',
                measurment: false
            },
            capitalize: {
                proprty: 'text-transform',
                value: 'capitalize',
                measurment: false
            },
            textLeft: {
                proprty: 'text-align',
                value: 'left',
                measurment: false
            },
            textCenter: {
                proprty: 'text-align',
                value: 'center',
                measurment: false
            },
            textJustify: {
                proprty: 'text-align',
                value: 'justify',
                measurment: false
            },
            textRight: {
                proprty: 'text-align',
                value: 'right',
                measurment: false
            },
            lowerCase: {
                proprty: 'text-transform',
                value: 'lowercase',
                measurment: false
            },
            flexJustifyCenter: {
                proprty: 'justify-content',
                value: 'center',
                measurment: false
            },
            flexJustifyStart: {
                proprty: 'justify-content',
                value: 'flex-start',
                measurment: false
            },
            flexJustifyEnd: {
                proprty: 'justify-content',
                value: 'flex-end',
                measurment: false
            },
            flexJustifySpaceBetween: {
                proprty: 'justify-content',
                value: 'space-between',
                measurment: false
            },
            flexJustifySpaceAround: {
                proprty: 'justify-content',
                value: 'space-around',
                measurment: false
            },
            flexAlignCenter: {
                proprty: 'align-items',
                value: 'center',
                measurment: false
            },
            flexAlignEnd: {
                proprty: 'align-items',
                value: 'flex-end',
                measurment: false
            },
            flexAlignStart: {
                proprty: 'align-items',
                value: 'flex-start',
                measurment: false
            },
            maxTextmultiline: {
                proprty: '-webkit-line-clamp',
                value: '',
                measurment: false
            },
            objectFit: {
                proprty: 'object-fit',
                value: '',
                measurment: false
            }
        }

        var root = $('<div style="height:100%"><div class="vis-apanel-busy vis-cardviewmainbusy" style="display:block"></div></div>');
        var isBusyRoot = $("<div class='vis-apanel-busy vis-cardviewmainbusy'></div> ");
        
        /**
         * Busy Indigater
         * @param {any} isBusy
         */
        function IsBusy(isBusy) {
            if (isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "block" });
            }                                                                                                                                                                                                            
            if (!isBusy && isBusyRoot != null) {
                isBusyRoot.css({ "display": "none" });
            }
        };

        /** Load UI from Partial view */
        function loadUI() {
            root.load(VIS.Application.contextUrl + 'CardViewWizard/GetCardTemplate/?windowno=' + WindowNo, function (event) {
                root.append(isBusyRoot);
                btnTemplateBack = root.find('#BtnTemplateBack_' + WindowNo);
                DivTemplate = root.find('#DivTemplate_' + WindowNo);
                DivCardFieldSec = root.find('#DivCardFieldSec_' + WindowNo);
                DivCradStep2 = root.find('#DivCardStep2_' + WindowNo);
                DivViewBlock = root.find('#DivViewBlock_' + WindowNo);
                DivStyleSec1 = root.find('#DivStyleSec1_' + WindowNo);
                btnLayoutSetting = root.find('#BtnLayoutSetting_' + WindowNo);
                btnChangeTemplate = root.find('#BtnChangeTemplate_' + WindowNo);
                divTopNavigator = DivCradStep2.find('.vis-topNavigator');
                DivGridSec = root.find('#DivGridSec_' + WindowNo);
                activeSection = DivViewBlock.find('.section1');
                chkAllBorderRadius = root.find('#chkAllBorderRadius_' + WindowNo);
                chkAllPadding = root.find('#chkAllPadding_' + WindowNo);
                chkAllMargin = root.find('#chkAllMargin_' + WindowNo);
                chkAllBorder = root.find('#chkAllBorder_' + WindowNo);
                txtTemplateName = root.find('#txtTemplateName_' + WindowNo);
                btnFinesh = root.find('#BtnFinesh_' + WindowNo);
                txtCustomStyle = root.find('#txtCustomStyle_' + WindowNo);
                txtSQLQuery = root.find('#txtSQLQuery_' + WindowNo);
                txtRowGap = DivGridSec.find('.rowGap');
                txtColGap = DivGridSec.find('.colGap');
                btn_BlockCancel = root.find('#Btn_BlockCancel_' + WindowNo);
                btnAddField = root.find('#BtnAddField_' + WindowNo);
                btnAddImgField = root.find('#BtnAddImgField_' + WindowNo);
                btnAddImgTxtField = root.find('#BtnAddImgTxtField_' + WindowNo);
                spnLastSaved = root.find('#spnLastSaved_' + WindowNo);
                btnEditIcon = root.find('#btnEditIcon_' + WindowNo);
                btnaddBlankTemplate = root.find('#btnaddBlankTemplate_' + WindowNo);
                btnUndo = root.find('#btnUndo_' + WindowNo);
                btnRedo = root.find('#btnRedo_' + WindowNo);
                btnVaddrow = root.find('#btnVaddrow_' + WindowNo);
                btnVaddCol = root.find('#btnVaddCol_' + WindowNo);

                btnVdelrow = root.find('#btnVdelrow_' + WindowNo);
                btnVdelCol = root.find('#btnVdelCol_' + WindowNo);
                btnRefreshTemplate = root.find('#BtnRefreshTemplate_' + WindowNo);
                cmbTemplateCategory = root.find('#CmbTemplateCategory_' + WindowNo);
                cmbViwBlockTemplateCategory = root.find('#CmbViwBlockTemplateCategory_' + WindowNo);
                DivStyleSec1.find('.nav-tabs li:last').hide();
                btnTemplateBack.hide();
                events();
                getTemplateDesign();
                getTemplateCategory();
            });
        }


        function events() {
            $('body').mouseup(function (e) {
                mdown = false;
            });

            btnAddField.click(function () {
                divTopNavigator.hide();
                var itm = $('<div class="fieldGroup" draggable="true">'
                    + '<span class="fieldLbl" title="Label" contenteditable="true">Label</span>'
                    + '<span class="fieldValue" contenteditable="true">:Value</span>'
                    + '</div>');
                var blok = DivViewBlock.find('.vis-active-block');
                if (blok.hasClass('grdDiv')) {
                    blok.append(itm);
                }
                templatechanges();
            });

            btnAddImgField.click(function () {
                divTopNavigator.hide();
                self.show(false);
            });

            btnAddImgTxtField.click(function () {
                divTopNavigator.hide();
                self.show(true);
            });

            btnEditIcon.click(function () {
                divTopNavigator.hide();
                var activeblok = DivViewBlock.find('.vis-active-block').closest('.fieldGroup');
                if (activeblok.find('.imgField').length > 0 && activeblok.find('.fieldValue').length > 0) {
                    self.show(true, true);
                } else {
                    self.show(false, true);
                }
                
            });

            btnTemplateBack.click(function (e) {
                count++;
                DivTemplate.hide();
                DivCradStep2.find('.vis-two-sec-two').show();
                DivStyleSec1.show();
            });

            btnLayoutSetting.click(function () {
                addSelectedTemplate();
                count++;
                fillcardLayoutfromTemplate();
                DivTemplate.hide();
                DivCradStep2.find('.vis-two-sec-two').show();
                DivStyleSec1.show();
                if (AD_HeaderLayout_ID == 0 && DivGridSec.find('.rowBox').length == 1) {
                    DivGridSec.find('.addGridCol').click();
                    DivGridSec.find('.addGridRow').click();
                }
                if (AD_HeaderLayout_ID == 0) {
                    DivViewBlock.find('.vis-viewBlock').css('backgroundColor', '#fff');                    
                }
                btnEditIcon.hide();
                isUndoRedo = false;
                history = [];
                s_history = true;
                cur_history_index = 0;
                templatechanges();
                btnUndo.attr("disabled","disabled");
            });

            btnChangeTemplate.click(function () {
                btnTemplateBack.show();
                divTopNavigator.hide();
                count--;
                DivTemplate.show();
                DivStyleSec1.hide();
                DivCradStep2.find('.vis-two-sec-two').hide();
                DivTemplate.find('[templateid="' + lastSelectedID + '"]').click();
                scaleTemplate();
                cmbTemplateCategory.val('');
                DivTemplate.find('[issystemtemplate="Y"]').removeClass('displayNone');
            });

            btnFinesh.click(function (e) {
                saveTemplate(e);
            });

            btnRefreshTemplate.click(function () {
                cmbTemplateCategory.val('');
                getTemplateDesign();
            });

            DivTemplate.find('.vis-cardSingleViewTemplate').click(function () {
                DivTemplate.find('.vis-cardSingleViewTemplate').removeClass('vis-active-template');
                $(this).addClass('vis-active-template');
            });


            chkAllBorderRadius.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allBorderRadius').removeClass('displayNone');
                    DivStyleSec1.find('.singleBorderRadius').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allBorderRadius').addClass('displayNone');
                    DivStyleSec1.find('.singleBorderRadius').removeClass('displayNone');
                }
            });

            chkAllPadding.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allPadding').removeClass('displayNone');
                    DivStyleSec1.find('.singlePadding').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allPadding').addClass('displayNone');
                    DivStyleSec1.find('.singlePadding').removeClass('displayNone');
                }
            });

            chkAllMargin.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allMargin').removeClass('displayNone');
                    DivStyleSec1.find('.singleMargin').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allMargin').addClass('displayNone');
                    DivStyleSec1.find('.singleMargin').removeClass('displayNone');
                }
            });

            chkAllBorder.change(function () {
                if ($(this).is(':checked')) {
                    DivStyleSec1.find('.allBorder').removeClass('displayNone');
                    DivStyleSec1.find('.singleBorder').addClass('displayNone');
                } else {
                    DivStyleSec1.find('.allBorder').addClass('displayNone');
                    DivStyleSec1.find('.singleBorder').removeClass('displayNone');
                }
            })

            DivStyleSec1.find('.vis-circular-slider-circle').mousedown(function (e) {
                mdown = true;
            }).mousemove(function (e) {
                if (mdown) {
                    var $slider = DivStyleSec1.find('.vis-circular-slider-dot')
                    var deg = getGradientDeg($slider, e);
                    $slider.css({ WebkitTransform: 'rotate(' + deg + 'deg)' });
                    $slider.css({ '-moz-transform': 'rotate(' + deg + 'deg)' });
                    $slider.attr("deg", deg);
                    applycommand("gradient", deg);
                }
            });

            divTopNavigator.find("i").click(function () {
                var blok = DivViewBlock.find('.vis-active-block');
                var cmd = $(this).attr('command');
                //isChange = true;
                var f = blok.closest('.fieldGroup').find('.fieldLbl');
                if (cmd == 'Show') {
                    if (blok.prop('tagName') == 'I' && !blok.hasClass('imgField')) {
                        blok.attr("class", "fa fa-star");
                        blok.next().attr('showFieldIcon', false);
                    } else {
                        f.attr('showFieldText', false);
                        f.removeClass("displayNone");
                    }

                    divTopNavigator.find('[command="Hide"]').parent().show();
                    divTopNavigator.find('[command="Show"]').parent().hide();
                    divTopNavigator.hide();
                    templatechanges();
                } else if (cmd == 'Hide') {
                    if (blok.prop('tagName') == 'I' && !blok.hasClass('imgField')) {
                        blok.attr("class", "");
                        blok.next().attr('showFieldIcon', true);
                    } else if (blok.hasClass('imgField')) {
                        blok.css('display', 'none');
                    } else {
                        if (blok.hasClass('fieldValue')) {
                            blok.css("display", "none");
                        } else {
                            blok.attr('showFieldText', true);
                            blok.addClass("displayNone");
                        }
                        //blok.html('&nbsp;');
                    }

                    divTopNavigator.find('[command="Hide"]').parent().hide();
                    divTopNavigator.find('[command="Show"]').parent().show();
                    divTopNavigator.hide();
                    btnEditIcon.hide();
                    templatechanges();
                } else if (cmd == 'SelectParent') {
                    //isChange = false;
                    if (blok.parent().hasClass("fieldGroup")) {
                        blok.parent().parent().mousedown().mouseup();
                    } else {
                        blok.parent().mousedown().mouseup();
                    }

                } else if (cmd == 'Separate') {
                    applyunMerge(blok);
                    blok.find('.vis-split-cell:first').remove();
                    $(this).parent().hide();
                    templatechanges();
                } else if (cmd == 'Merge') {
                    mergeCell();
                    divTopNavigator.find('[command="Merge"]').parent().hide();
                    templatechanges();
                } else if (cmd == 'Unlink') {
                    divTopNavigator.hide();
                    var fldLbl = blok.closest('.fieldGroup').find('.fieldLbl');
                    unlinkField(fldLbl.attr('title'), fldLbl);
                    btnEditIcon.hide();
                    templatechanges();
                } else if (cmd == 'ShowImg') {
                    blok.closest('.fieldGroup').find('.imgField').css("display", "unset");
                    divTopNavigator.find('[command="ShowImg"]').parent().hide();
                    templatechanges();
                } else if (cmd == 'ShowValue') {
                    blok.closest('.fieldGroup').find('.fieldValue').css("display", "unset");
                    divTopNavigator.find('[command="ShowValue"]').parent().hide();
                    templatechanges();
                }

                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                
                // divTopNavigator.hide();
            });

            var viewBlock = DivViewBlock.find('.canvas *');

            //View Block click action going here
             
            viewBlock.mousedown(function (e) {
               
                if (e.target.tagName == 'SQL' || $(e.target).hasClass('fieldGroup') || $(e.target).hasClass('vis-addRemoveRowCol')) {
                    return;
                }

                if (e.ctrlKey) {
                    if ($(e.target).attr('contenteditable')) {
                        $(e.target).attr('contenteditable', false);
                    }
                    return;
                } else {
                    if ($(e.target).attr('contenteditable')) {
                        $(e.target).attr('contenteditable', true);
                    }
                }
               

                DivCradStep2.find('.vis-v-rowcol').hide();
                if ($(e.target).hasClass('grdDiv')) {
                    e.preventDefault();
                    btnAddField.removeClass("vis-disable-event");
                    btnAddImgField.removeClass("vis-disable-event");
                    btnAddImgTxtField.removeClass("vis-disable-event");
                    ViewBlockAddDelRowCol(e);
                    
                } else {
                    
                    btnAddField.addClass('vis-disable-event');
                    btnAddImgField.addClass('vis-disable-event');
                    btnAddImgTxtField.addClass('vis-disable-event');
                }
                divTopNavigator.find('[command="Merge"]').parent().hide();
                divTopNavigator.find('[command="ShowImg"]').parent().hide();
                divTopNavigator.find('[command="ShowValue"]').parent().hide();
                DivStyleSec1.find('.imgTextCont').addClass('vis-disable-event');
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                if (count == 1) {
                    DivViewBlock.find('.vis-viewBlock').addClass("vis-active-block");
                } else {
                    var secCount = $(e.target).closest('.vis-wizard-section').attr("sectionCount");
                    if (!DivGridSec.find("[sectionCount='" + secCount + "']").hasClass('section-active')) {
                        DivGridSec.find("[sectionCount='" + secCount + "'] .vis-grey-disp-el").click();
                    }

                    $(e.target).addClass("vis-active-block");

                    var top = e.target.offsetTop - divTopNavigator.outerHeight();
                    var left = e.target.offsetLeft;

                    divTopNavigator.css({
                        'top': top,
                        'left': left
                    });

                    divTopNavigator.show();
                    //divTopNavigator.find('[command="Unlink"]').parent().hide();
                    divTopNavigator.find('[command="fieldName"]').text('').hide();
                    if ($(e.target).hasClass('imgField')) {
                        btnEditIcon.show();
                        if (e.target.tagName == 'I') {
                            btnEditIcon.css({
                                "left": $(e.target).closest('.grdDiv')[0].offsetLeft + 22,
                                "top": $(e.target).closest('.grdDiv')[0].offsetTop+6
                            });
                        } else {
                            btnEditIcon.css({
                                "left": e.target.offsetLeft + (e.target.width || 0) - 12,
                                "top": e.target.offsetTop,
                            });
                        }
                    } else {
                        btnEditIcon.hide();
                    }

                    var isIcon = false;
                    if ($(e.target).closest('.fieldGroup').length > 0) {
                        divTopNavigator.find('[command="Unlink"]').parent().show();                       
                    } else {
                        divTopNavigator.find('[command="Unlink"]').parent().hide();
                    }

                    if ($(e.target).hasClass('fieldLbl')) {
                        divTopNavigator.find('[command="fieldName"]').text($(e.target).closest('.fieldGroup').find('.fieldLbl').attr('title')).show();
                        //divTopNavigator.find('[command="Unlink"]').parent().show();
                        var isTrue = $(e.target).attr('showFieldText') == 'true' ? true : false;
                        if (e.target.hasAttribute('showFieldText') && isTrue) {
                            divTopNavigator.find('[command="Hide"]').parent().hide();
                            divTopNavigator.find('[command="Show"]').parent().show();
                        } else {
                            divTopNavigator.find('[command="Show"]').parent().hide();
                            divTopNavigator.find('[command="Hide"]').parent().show();
                        }
                    } else if (e.target.tagName == 'I' && $(e.target).closest('.fieldGroup').find('.imgField').length == 0) {
                        var isTrue = $(e.target).next().attr('showFieldIcon') == 'true' ? true : false;
                        if ($(e.target).next().attr('showFieldIcon') && isTrue) {
                            divTopNavigator.find('[command="Hide"]').parent().hide();
                            divTopNavigator.find('[command="Show"]').parent().show();
                        } else {
                            divTopNavigator.find('[command="Show"]').parent().hide();
                            divTopNavigator.find('[command="Hide"]').parent().show();
                        }
                    }
                    else {
                        divTopNavigator.find('[command="Show"]').parent().hide();
                        divTopNavigator.find('[command="Hide"]').parent().hide();

                        if ($(e.target).closest('.fieldGroup').length > 0) {
                            var target = $(e.target).closest('.fieldGroup').find('.fieldLbl');                           
                            var trget = $(e.target).closest('.fieldGroup');
                            if (trget.find('.imgField:hidden').length > 0) {
                                divTopNavigator.find('[command="ShowImg"]').parent().show();
                                divTopNavigator.find('[command="Hide"]').parent().hide();
                            } else if (trget.find('.fieldValue:hidden').length > 0) {
                                divTopNavigator.find('[command="Hide"]').parent().hide();
                                divTopNavigator.find('[command="ShowValue"]').parent().show();
                            } else if (trget.find('.imgField').length == 1 && trget.find('.fieldValue').length == 1) {
                                divTopNavigator.find('[command="Hide"]').parent().show();
                                DivStyleSec1.find('.imgTextCont').removeClass('vis-disable-event');
                            } else {
                                DivStyleSec1.find('.imgTextCont').addClass('vis-disable-event');
                            }

                            var isTrue = target.attr('showFieldText') == 'true' ? true : false;
                            divTopNavigator.find('[command="fieldName"]').text(target.attr('title')).show();
                        }


                        if (isTrue) {
                            divTopNavigator.find('[command="Show"]').parent().show();
                        }

                    }

                    if ($(e.target).find('.vis-split-cell').length == 0) {
                        divTopNavigator.find('[command="Separate"]').parent().hide();
                        if ($(e.target).hasClass('grdDiv')) {
                            mdown = true;
                        }
                        activeSection.find('.grdDiv').each(function (e) {
                        var totalCol = DivGridSec.find('.colBox').length - 1;
                            var currentRow = Math.ceil((e + 1) / totalCol);
                            if ($(this).hasClass('vis-active-block')) {
                                startRowIndex = currentRow - 1;
                                startCellIndex = (e) - totalCol * (startRowIndex);
                            }
                        });
                    } else {
                        divTopNavigator.find('[command="Separate"]').parent().show();
                    }
                }

                if ($(e.target).hasClass('vis-wizard-section')) {
                    divTopNavigator.find('[command="fieldName"]').text('Section ' + $(e.target).attr('sectioncount')).show();
                }

                if ($(e.target).hasClass('vis-viewBlock')) {
                    divTopNavigator.find('[command="fieldName"]').text('Main container').show();
                }
                //$(e.target).not('.ui-resizable-handle').addClass("vis-active-block");
                //$(this).resizable();
            }).mouseup(function (e) {
               fill($(e.target));
            });

            // style input change command
            DivStyleSec1.find('[data-command]').on('change', function (e) {
                $(this).removeClass('vis-editor-validate');
                var command = $(this).data('command');
                var styleValue = $(this).val();
                var isNegativeNumber = false;
                if (command.indexOf('margin')!=-1 && styleValue.indexOf('-') != -1) {
                    isNegativeNumber = true;
                }

                var mtext = styleValue.replace(/\d+/g, "").replace('.', '');
                var mvalue = styleValue.replace(styleValue.replace(/\d+/g, ""), "");
                if (editorProp[command] && editorProp[command].measurment && styleValue != "" && $(this).attr('type') != 'color') {
                    if (measurment.indexOf(mtext) < 0) {
                        if (isNaN(Number(mvalue))) {
                            $(this).addClass('vis-editor-validate');
                            return;
                        }
                        if (isNegativeNumber) {
                            $(this).val("-"+mvalue + "px");
                        } else {
                            $(this).val(mvalue + "px");
                        }
                    } else if (isNaN(Number(mvalue))) {
                        $(this).addClass('vis-editor-validate');
                        return;
                    }
                }
               

                if (command == 'backgroundColor') {
                    // var clr= rgb2hex(styleValue);
                    DivStyleSec1.find('.vis-zero-BTopLeftBLeft:first').css('background-color', styleValue);
                    DivStyleSec1.find('[data-command="backgroundColor"]').val(styleValue);
                } else if (command == 'color') {
                    DivStyleSec1.find('.vis-zero-BTopLeftBLeft:last').css('background-color', styleValue);
                    DivStyleSec1.find('[data-command="color"]').val(styleValue);
                } else if (command == 'borderColor' || command == 'borderLeftColor' || command == 'borderRightColor' || command == 'borderTopColor' || command == 'borderBottomColor') {
                    var bdrDiv = DivStyleSec1.find("[data-command='" + command + "']").closest('.vis-prop-pan-cont');
                    bdrDiv.find(".vis-back-color03").css('background-color', styleValue);
                }

                applycommand(command, $(this).val());
            });

            // Style clickable command
            DivStyleSec1.find('[data-command1]').on('click', function (e) {

                var command = $(this).data('command1');
                var tag = DivViewBlock.find('.vis-active-block');
                var isStyleExist = false;
                if (editorProp[command].measurment) {
                    isStyleExist = checkStyle(editorProp[command].proprty, editorProp[command].value, tag)
                } else {
                    isStyleExist = checkStyle(editorProp[command].proprty, false, tag)
                }


                var activ = $(this).closest('.vis-horz-align-d').find('.vis-hr-elm-inn-active');
                activ.removeClass('vis-hr-elm-inn-active');
                if ((editorProp[command].proprty == "justify-content" || editorProp[command].proprty == "align-items") && checkStyle("display", "flex", tag)) {
                    //applyCommend("displayFlex", "");
                    tag[0].style.removeProperty("display");
                    applycommand(command, "");
                    if (activ.find('[data-command1]').attr('data-command1') != command) {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                } else if (editorProp[command].proprty == 'text-align' || editorProp[command].proprty == 'text-transform') {
                    applycommand(command, "");
                    if (activ.find('[data-command1]').attr('data-command1') != command) {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                }
                else {                    
                    if (isStyleExist) {   
                        $(this).parent().removeClass('vis-hr-elm-inn-active');
                        applycommand(command, "");
                        
                    } else {
                        $(this).parent().addClass('vis-hr-elm-inn-active');
                        applycommand(command, editorProp[command].value);
                    }
                }

                if (tag.attr('style').indexOf('justify-content') != -1 || tag.attr('style').indexOf('align-items') != -1 || tag.attr('style').indexOf('flex-direction') != -1) {
                    tag.css("display", "flex");
                }

            });

            // style align image and text command
            DivStyleSec1.find('[data-command2]').on('click', function (e) {
                divTopNavigator.hide();
                var tag = activeSection.find('.vis-active-block').closest('.fieldGroup');
                var command = $(this).data('command2');
                var styleProp = tag.find('.fieldValue').attr('style');
                var classPro = tag.find('.fieldValue').attr('class');
                tag.find('.fieldValue br').remove();
                if (command == 'SwapImgTxt') {
                    tag.find('.imgField').before(tag.find('.fieldValue'));
                } else if (command == 'SwapTxtImg') {
                    tag.find('.fieldValue').before(tag.find('.imgField'));
                } else if (command == 'SwapTxtImgBr') {
                    tag.find('.fieldValue').before(tag.find('.imgField'));
                    tag.find('.fieldValue').prepend('<br>');
                }
                else if (command == 'SwapImgTxtBr') {
                    tag.find('.imgField').before(tag.find('.fieldValue'));
                    tag.find('.fieldValue').append('<br>');
                }
                templatechanges();
            });

            // apply custom css
            txtCustomStyle.change(function () {
                var selectedItem = DivViewBlock.find('.vis-active-block');
                selectedItem.attr("style", $(this).val());
                templatechanges();
            });


            txtSQLQuery.change(function () {
                var selectedItem = DivViewBlock.find('.vis-active-block');
                if ($(this).val() == null || $(this).val() == "") {
                    selectedItem.find('sql').remove();
                    selectedItem.attr("query", "");
                } else {
                    var qry = VIS.secureEngine.encrypt($(this).val());
                    selectedItem.attr("query", qry);
                    if (selectedItem.find('sql').length == 0) {
                        selectedItem.append('<sql>SQL</sql>');
                    }
                }
                templatechanges();
            });

            DivGridSec.find('.addGridRow').click(function () {
                var rClone = DivGridSec.find('.rowBox:first').clone(true);
                rClone.show();
                DivGridSec.find('.DivRowBox').append(rClone);
                createGrid();
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.addGridCol').click(function () {
                var cClone = DivGridSec.find('.colBox:first').clone(true);
                cClone.show();
                DivGridSec.find('.DivColBox').append(cClone);
                createGrid();
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.addGridSection').click(function () {
                isNewSection = true;
                DivGridSec.find('.section-active').removeClass('section-active');
                var sClone = DivGridSec.find('.grid-Section:first').clone(true);

                sClone.removeClass('displayNone');
                sClone.addClass('section-active');
                sectionCount = DivGridSec.find('.grid-Section').length; //Number(DivGridSec.find('.grid-Section:last').attr("sectionCount")) + 1;
                sClone.attr('sectionCount', sectionCount);
                sClone.find('.vis-grey-disp-ttl').text("Section " + sectionCount);
                DivGridSec.find('.vis-sectionAdd').append(sClone);
                activeSection = $('<div name="Section ' + sectionCount+'" sectionCount="' + sectionCount + '"  class="section' + sectionCount + ' vis-wizard-section" style="padding:5px"></div>')
                DivViewBlock.find('.vis-viewBlock').append(activeSection);
                //sectionCount++;
                DivGridSec.find('.rowBox:not(:first)').remove();
                DivGridSec.find('.colBox:not(:first)').remove();
                DivGridSec.find('.addGridRow').click();
                DivGridSec.find('.addGridCol').click();

                DivGridSec.find('.vis-sectionAdd').sortable({
                    disabled: false,
                    update: function (event, ui) {
                        var sectionCount = ui.item.attr('sectioncount');
                        var end_pos = ui.item.index();
                        var next = ui.item.next().attr('sectioncount');
                        if (next) {
                            DivViewBlock.find('[sectioncount="' + next + '"]').before(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                        } else {
                            var pre = ui.item.prev().attr('sectioncount');
                            DivViewBlock.find('[sectioncount="' + pre + '"]').after(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                        }
                        templatechanges();
                    }
                });
                templatechanges();
            });

            DivGridSec.find('.grid-Section .vis-grey-disp-el-xross').click(function () {
                var secNo = $(this).closest('.grid-Section').attr('sectionCount');
                if ($(this).closest('.grid-Section').hasClass('section-active')) {
                    DivGridSec.find('.grid-Section').eq(1).addClass('section-active');
                    DivGridSec.find('.grid-Section').eq(1).find('.vis-grey-disp-el').click();
                }
                $(this).closest('.grid-Section').remove();
                var removeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);

                removeSection.find('.fieldLbl').each(function () {
                    if ($(this).attr('title') && $(this).attr('title').length > 0) {
                        unlinkField($(this).attr('title'), $(this));
                    }
                });

                removeSection.remove();
                delete gridObj['section' + secNo];
                secNo = DivGridSec.find('.section-active').attr('sectionCount');
                activeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.grid-Section .vis-grey-disp-el').click(function () {
                DivGridSec.find('.section-active').removeClass('section-active');
                $(this).parent().addClass('section-active');
                var secNo = DivGridSec.find('.section-active').attr('sectionCount');

                activeSection = DivViewBlock.find('.vis-viewBlock .section' + secNo);
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                activeSection.addClass('vis-active-block');
                createGridRowCol();
                if (isUndoRedo) {
                    isUndoRedo = false;
                } else {
                    templatechanges();
                }
               
            });

            btnVaddrow.click(function () {                
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdRowAdd').eq(Number(gridArea[2]) - 1).click();
            });

            btnVdelrow.click(function () {                
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdRowDel').eq(Number(gridArea[2]) - 1).click();
            });

            btnVaddCol.click(function () {               
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdColAdd').eq(Number(gridArea[3])-1).click();
            });

            btnVdelCol.click(function () {                
                var gridArea = DivViewBlock.find('.vis-active-block').css('grid-area').split('/');
                DivGridSec.find('.grdColDel').eq(Number(gridArea[3]) - 1).click();
            });

            DivGridSec.find('.grdRowDel').click(function () {
                var idx = $(this).closest('.rowBox').index();
                rowIdx = idx;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                var dNo = (idx * totalCol + 1) - totalCol;
                for (var i = dNo; i < (dNo + totalCol); i++) {
                    activeSection.find('.grdDiv').eq(i - 1).addClass('del');
                    var blk = activeSection.find('.grdDiv').eq(i - 1).find('.fieldLbl');
                    if (blk && blk.attr('title') && blk.attr('title').length > 0) {
                        unlinkField(blk.attr('title'), blk);
                    }
                }
                activeSection.find('.del').remove();
                $(this).closest('.rowBox').remove();
                gridCss(-1, 0);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });          

            DivGridSec.find('.grdRowAdd').click(function () {
                var idx = $(this).closest('.rowBox').index() - 1;
                var rClone = DivGridSec.find('.rowBox:first').clone(true);
                rClone.show();
                DivGridSec.find('.DivRowBox').append(rClone);

                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;


                var pos = ((idx + 1) * totalCol);
                rowIdx = (idx + 1);
                for (var i = 0; i < totalCol; i++) {
                    activeSection.find('.grdDiv').eq(pos - 1).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                }

                grdsecMousehover();
                gridCss(1, 0);
                templatechanges();
            });

            DivGridSec.find('.grdColDel').click(function () {
                var idx = $(this).closest('.colBox').index() - 1;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                colIdx = (idx + 1);
                for (var i = 0; i < totalRow; i++) {
                    for (var j = 0; j < totalCol; j++) {
                        if (j == idx) {
                            var dNo = totalCol * i + j;
                            activeSection.find('.grdDiv').eq(dNo).addClass('del');
                            var blk = activeSection.find('.grdDiv').eq(dNo).find('.fieldLbl');
                            if (blk && blk.attr('title') && blk.attr('title').length > 0) {
                                unlinkField(blk.attr('title'), blk);
                            }
                        }
                    }
                }

                activeSection.find('.del').remove();
                $(this).closest('.colBox').remove();
                gridCss(0, -1);
                //isChange = true;
                //if (isChange && AD_HeaderLayout_ID != "0") {
                //    btn_BlockCancel.show();
                //}
                templatechanges();
            });

            DivGridSec.find('.grdColAdd').click(function () {

                var cClone = DivGridSec.find('.colBox:first').clone(true);
                cClone.show();
                DivGridSec.find('.DivColBox').append(cClone);
                addedColPos = [];
                var idx = $(this).closest('.colBox').index() - 1;
                var totalRow = DivGridSec.find('.rowBox').length - 1;
                var totalCol = DivGridSec.find('.colBox').length - 1;
                colIdx = idx + 1;
                for (var i = 0; i < totalRow; i++) {
                    for (var j = 0; j < totalCol; j++) {
                        if (j == idx) {
                            var pos = totalCol * i + j;
                            addedColPos.push(pos + 1);
                            activeSection.find('.grdDiv').eq(pos).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                        }
                    }
                }
                grdsecMousehover();
                gridCss(0, 1);
                templatechanges();
            });

            DivGridSec.find('.mergeCell').click(function () {
                mergeCell();
                templatechanges();
            });

            txtColGap.change(function () {                
                gridCss();
                templatechanges();
            });

            txtRowGap.change(function () {                
                gridCss();
                templatechanges();
            });

            DivGridSec.find('.rowBox input,select').change(function () {                
                gridCss();
                templatechanges();
            });

            DivGridSec.find('.colBox input,select').change(function () {                
                gridCss();
                templatechanges();
            });            

            btn_BlockCancel.click(function () {
                DivTemplate.find('.mainTemplate[templateid="' + AD_HeaderLayout_ID + '"]').parent().click();
                if (count > 1) {
                    addSelectedTemplate();
                    fillcardLayoutfromTemplate();
                }

                btn_BlockCancel.hide();
            });

            btnaddBlankTemplate.click(function () {
                DivTemplate.find('.mainTemplate[templateid="0"]').parent().click();
                btnLayoutSetting.click();
            });

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("dragstart", function (event) {
                // store a ref. on the dragged elem 
                dragged = $(event.target);
                if (dragged.hasClass('grdDiv') || !(event.ctrlKey)) {
                    event.preventDefault();
                } else {
                    divTopNavigator.hide();
                    mdown = false;
                }
            }, false);

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("dragover", function (event) {
                // prevent default to allow drop
                event.preventDefault();
            });

            DivViewBlock.find('.vis-viewBlock')[0].addEventListener("drop", function (event) {
                // prevent default action (open as link for some elements)
                event.preventDefault();
                DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
                var ev = $(event.target); 
                if (ev.hasClass('grdDiv')) {
                    ev.append(dragged);
                    templatechanges();
                }
            });

            btnUndo.click(function (e) {
                if (cur_history_index > 0) {
                    isUndoRedo = true;
                    s_history = false;
                    canv_data = JSON.parse(history[cur_history_index - 1]);
                    DivViewBlock.find('.vis-viewBlock').html(canv_data);
                    cur_history_index--;                    
                    btnRedo.removeAttr("disabled");
                    if (cur_history_index <= 0) {
                        btnUndo.attr("disabled", "disabled");
                    }
                    fillcardLayoutfromTemplate();
                    DivViewBlock.find('.grdDiv').unbind('mouseover');
                    DivViewBlock.find('.grdDiv').mouseover(function (e) {
                        if (mdown && ($(this).find('.vis-split-cell').length == 0)) {
                            selectTo($(this));
                        }
                    });
                }
                else {
                    btnUndo.attr("disabled","disabled");
                }
                
            });

            btnRedo.click(function (e) {
                if (history[cur_history_index + 1]) {
                    isUndoRedo = true;
                    s_history = false;
                    canv_data = JSON.parse(history[cur_history_index + 1]);
                    DivViewBlock.find('.vis-viewBlock').html(canv_data);
                    cur_history_index++;   
                    btnUndo.removeAttr("disabled");
                    fillcardLayoutfromTemplate();
                    if (cur_history_index >= history.length-1) {
                        btnRedo.attr("disabled", "disabled");
                    }
                    DivViewBlock.find('.grdDiv').unbind('mouseover');
                    DivViewBlock.find('.grdDiv').mouseover(function (e) {
                        if (mdown && ($(this).find('.vis-split-cell').length == 0)) {
                            selectTo($(this));
                        }
                    });
                }
                else {
                    btnRedo.attr("disabled", "disabled");
                } 
                
            });

            cmbTemplateCategory.change(function () {                
                if ($(this).val() != "") {
                    DivTemplate.find('[issystemtemplate="Y"]').not('.blankTemp').addClass('displayNone');
                    DivTemplate.find('[issystemtemplate="Y"][category="' + $(this).val() + '"]').removeClass('displayNone');
                } else {
                    DivTemplate.find('[issystemtemplate="Y"]').removeClass('displayNone');
                }
                if (DivTemplate.find('.vis-cardSingleViewTemplate:not(:hidden)').length == 1) {
                    DivTemplate.find('.vis-noTemplateIcon').show();
                } else {
                    DivTemplate.find('.vis-noTemplateIcon').hide();
                }
            });

            DivViewBlock.find('.vis-viewBlock').on('DOMSubtreeModified', function () {
                var iH = DivViewBlock.height();
                var cH = DivViewBlock.find('.canvas').height();
                if (iH && cH && cH > iH) {
                    DivViewBlock.find('.canvas').addClass('canvasOverFlow');
                } else {
                    DivViewBlock.find('.canvas').removeClass('canvasOverFlow');
                }

            });
           
        };
        /**
         * Genrate Gradient Degree
         * @param {any} id
         * @param {any} e
         */
        var getGradientDeg = function (id, e) {
            var radius = 9;
            var deg = 0;
            var elP = id.parent().offset();
            var elPos = { x: elP.left, y: elP.top };

            if (mdown) {
                var mPos = { x: e.clientX - elPos.x, y: e.clientY - elPos.y };
                var atan = Math.atan2(mPos.x - radius, mPos.y - radius);
                deg = -atan / (Math.PI / 180) + 180; // final (0-360 positive) degrees from mouse position 
                deg = Math.ceil(deg);
                return deg;
                // AND FINALLY apply exact degrees to ball rotation

            }
        }

        /**
         * Add Selected Template into viewport
         * */
        function addSelectedTemplate() {
            var $this = DivTemplate.find('.vis-active-template').clone(true);
            if ($this.attr("lastupdated")) {
                spnLastSaved.text(VIS.Msg.getMsg("LastSaved") + " " + $this.attr("lastupdated"));
            }
            //$this.find('.grdDiv').html('');
            $this.find('.mainTemplate').css("zoom",1);
            CardCreatedby = $this.attr("createdBy");
            isSystemTemplate = $this.attr("isSystemTemplate");
            cmbViwBlockTemplateCategory.val(($this.attr("category") == '0' ? '' : $this.attr("category")));
            AD_HeaderLayout_ID = $this.find('.mainTemplate').attr('templateid');
            lastSelectedID = AD_HeaderLayout_ID;
            templateName = $this.find('.mainTemplate').attr('name');
            if (AD_HeaderLayout_ID == "0") {
                $this.find('.mainTemplate').html($('<div name="Section 1" sectionCount="1" class="section1 vis-wizard-section" style="padding:5px;"></div>'));
            }
            $this.find('[contenteditable]').attr('contenteditable', true);
            txtTemplateName.val($this.find('.mainTemplate').attr('name'));
            AD_HeaderLayout_ID = $this.find('.mainTemplate').attr('templateid');
            if ($this.html() != "" || $this.html() != null) {
                $this.find('.vis-wizard-section').each(function () {
                    var row = $(this).attr('row');
                    var col = $(this).attr('col');
                    var arr = [];
                    for (var i = 0; i < (row * col); i++) {
                        arr.push('<div class="grdDiv" style="display:none"></div>');
                    }

                    $(this).find('.grdDiv').each(function () {
                        var areagrid = $(this).css('grid-area').split('/');
                        var idx = col * ($.trim(areagrid[0]) - 1) + ($.trim(areagrid[1]) - 1);
                        if ($.trim(areagrid[0]) != ($.trim(areagrid[2]) - 1) || $.trim(areagrid[1]) != ($.trim(areagrid[3]) - 1)) {
                            $(this).append('<span class="vis-split-cell"></span>');
                        }
                        arr[idx] = $(this)[0].outerHTML;

                    });
                    $(this).html(arr.join(" "));
                });
               
                DivViewBlock.find('.vis-viewBlock').attr("style", $this.find('.mainTemplate').attr('style') || '');
                DivViewBlock.find('.vis-viewBlock').html($this.find('.mainTemplate').html());
                DivViewBlock.find('.vis-viewBlock').find('.fieldValue').attr("contenteditable", true);
                DivViewBlock.find('.vis-viewBlock').find('.fieldLbl').attr("contenteditable", true);
                DivViewBlock.find('.fieldGroup').each(function () {
                    if ($(this).find('.imgField').length > 0 && ($(this).find('.fieldValue').length > 0)) {
                        $(this).find('.fieldLbl').attr('title', 'Image+Text');
                    } else if ($(this).find('.imgField').length > 0) {
                        $(this).find('.fieldLbl').attr('title', 'Image');
                    }
                });

                DivViewBlock.find('.grdDiv').unbind('mouseover');
                DivViewBlock.find('.grdDiv').mouseover(function (e) {
                    if (mdown && ($(this).find('.vis-split-cell').length == 0)) {
                        selectTo($(this));
                    }
                });
            }

        }

        /**
         * Fill card property into section
         * */
        var fillcardLayoutfromTemplate = function () {
            gridObj = {};
            var sClone = DivGridSec.find('.grid-Section:first').clone(true);
            sClone.removeClass('displayNone');
            DivGridSec.find('.grid-Section:not(:first)').remove();
            DivViewBlock.find('.vis-wizard-section').each(function (i) {
                var secNo = $(this).attr('sectionCount');
                if (i == 0) {
                    sClone.addClass('section-active');
                    $(this).addClass('vis-active-block');
                }
                sClone.attr('sectionCount', secNo);
                var secName = $(this).attr('name');
                sClone.find('.vis-grey-disp-ttl').text(secName);
                DivGridSec.find('.vis-sectionAdd').append(sClone);
                sClone = DivGridSec.find('.grid-Section:first').clone(true);
                sClone.removeClass('displayNone');

                if (!gridObj["section" + secNo]) {
                    var totalRow = $(this).attr('row');
                    var totalCol = $(this).attr('col');
                    var grdAreaCol = $(this)[0].style.gridTemplateColumns.split(' ');
                    var grdAreaRow = $(this)[0].style.gridTemplateRows.split(' ');
                    var Obj = {};
                    for (var i = 0; i < totalRow; i++) {
                        if (grdAreaRow.length > 0 && grdAreaRow[i] != 'auto') {
                            var v = grdAreaRow[i].replace(/\'/g, '').split(/(\d+)/).filter(Boolean);                            
                            Obj['row_' + i] = {
                                val: v[0],
                                msr: v[1]
                            }
                        } else {
                            Obj['row_' + i] = {
                                val: 1,
                                msr: 'auto'
                            }
                        }
                    };

                    for (var j = 0; j < totalCol; j++) {
                        if (grdAreaCol.length > 0 && grdAreaCol[j] != 'auto') {
                            var c = grdAreaCol[j].replace(/\'/g, '').split(/(\d+)/).filter(Boolean);                            
                            Obj['col_' + j] = {
                                val: c[0],
                                msr: c[1]
                            }
                        } else {
                            Obj['col_' + j] = {
                                val: 1,
                                msr: 'auto'
                            }
                        }
                    }

                    Obj["sectionNo"] = secNo;
                    Obj["sectionName"] = secName;
                    Obj["rowGap"] = 0;
                    Obj["colGap"] = 0;
                    Obj["totalRow"] = totalRow;
                    Obj["totalCol"] = totalCol;

                    gridObj["section" + secNo] = Obj;
                }
            });

            DivGridSec.find('.vis-sectionAdd').sortable({
                disabled: false,
                update: function (event, ui) {
                    var sectionCount = ui.item.attr('sectioncount');
                    var end_pos = ui.item.index();
                    var next = ui.item.next().attr('sectioncount');
                    if (next) {
                        DivViewBlock.find('[sectioncount="' + next + '"]').before(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                    } else {
                        var pre = ui.item.prev().attr('sectioncount');
                        DivViewBlock.find('[sectioncount="' + pre + '"]').after(DivViewBlock.find('[sectioncount="' + sectionCount + '"]'));
                    }
                }
            });

            DivGridSec.find('.section-active .vis-grey-disp-el').click();
            DivGridSec.find('.vis-grey-disp-el-xross').eq(1).hide();
         
        }

        function grdsecMousehover() {
            var grSec = activeSection;
            grSec.find('.grdDiv').unbind('mouseover');
            grSec.find('.grdDiv').mouseover(function (e) {
                if (mdown && ($(this).find('.vis-split-cell').length == 0)) {
                    selectTo($(this));
                }

            });


        }

        /**
         * Apply row column grid css
         * @param {any} r row
         * @param {any} c column
         */
        function gridCss(r, c) {
            if (!r) {
                r = 0;
            }

            if (!c) {
                c = 0;
            }

            var secNo = DivGridSec.find('.section-active').attr('sectionCount');
            var secName = DivGridSec.find('.section-active .vis-grey-disp-ttl').text();
            var Obj = {
            }
            var rowCss = "";
            DivGridSec.find('.rowBox:not(:first)').each(function (i) {
                if (i == 0) {
                    $(this).find('.grdRowDel').hide();
                }
                if ($(this).find('select :selected').val() == 'auto') {
                    rowCss += $(this).find('select :selected').val() + ' ';
                } else {
                    rowCss += $(this).find('input').val() + '' + $(this).find('select :selected').val() + ' ';
                }

                Obj['row_' + i] = {
                    val: $(this).find('input').val(),
                    msr: $(this).find('select :selected').val(),
                }
            });
            var colCss = "";
            DivGridSec.find('.colBox:not(:first)').each(function (i) {
                if (i == 0) {
                    $(this).find('.grdColDel').hide();
                }

                if ($(this).find('select :selected').val() == 'auto') {
                    colCss += $(this).find('select :selected').val() + ' ';
                } else {
                    colCss += $(this).find('input').val() + '' + $(this).find('select :selected').val() + ' ';
                }
                Obj['col_' + i] = {
                    val: $(this).find('input').val(),
                    msr: $(this).find('select :selected').val()
                }
            });

            var totalRow = DivGridSec.find('.rowBox:not(:first)').length;
            var totalCol = DivGridSec.find('.colBox:not(:first)').length;
            Obj["sectionNo"] = secNo;
            Obj["sectionName"] = secName;
            Obj["rowGap"] = txtRowGap.val();
            Obj["colGap"] = txtColGap.val();
            Obj["totalRow"] = totalRow;
            Obj["totalCol"] = totalCol;

            gridObj["section" + secNo] = Obj;
            var grSec = activeSection;
            grSec.attr("row", totalRow);
            grSec.attr("col", totalCol);

            grSec.css({
                'grid-template-columns': colCss,
                'grid-template-rows': rowCss,
                'gap': txtRowGap.val() + 'px ' + txtColGap.val() + 'px'
            });

            var isEnter = false;
            var ri = rowIdx;
            var ci = colIdx;
            if (r == -1) {
                ri--;
            }
            if (c == -1) {
                ci--;
            }
            var cc = 0;           
            var ps = addedColPos;
            grSec.find('.grdDiv').each(function (index) {
                var gArea = $(this).css('grid-area').split('/');
                var r_start = Number($.trim(gArea[0]));
                var r_end = Number($.trim(gArea[2]));
                var c_start = Number($.trim(gArea[1]));
                var c_end = Number($.trim(gArea[3]));

                var rowPosition = (Math.floor(index / totalCol)) + 1;
                if (rowIdx != null) {
                    if ((rowIdx > (r_start - 1) && rowIdx < (r_end - 1))) {
                        $(this).css('grid-area', r_start + '/' + c_start + '/' + (r_end + r) + '/' + (c_end));
                        isEnter = true;
                    }

                    if (isEnter && r > 0) {
                        for (var i = Number(r_start); i <= (Number(r_end)); i++) {
                            for (var j = c_start; j < c_end; j++) {
                                var pos = totalCol * i + j;
                                grSec.find('.grdDiv').eq(pos - 1).css('display', 'none');
                            }
                            if (rowIdx == i) {
                                break;
                            }
                        }
                        isEnter = false;
                        rowIdx = null;
                    }

                } else if (colIdx != null) {
                    if ((colIdx > (c_start - 1) && colIdx < (c_end - 1))) {
                        $(this).css('grid-area', r_start + '/' + c_start + '/' + r_end + '/' + (c_end + c));
                        isEnter = true;                        
                        grSec.find('.grdDiv').eq(ps[cc]).css('display', 'none');
                        
                    }
                    cc++;
                    if (isEnter && c > 0) {
                        for (var i = 0; i < addedColPos.length; i++) {
                            var rowPos = Math.floor(addedColPos[i] / totalCol) + 1;
                            if (rowPos > (r_start - 1) && rowPos < (r_end)) {
                                grSec.find('.grdDiv').eq(addedColPos[i]).css('display', 'none');                               
                            }

                        }

                        isEnter = false;
                        //colIdx = null;
                        addedColPos = [];
                    }
                }

                gArea = $(this).css('grid-area').split('/');
                r_start = Number($.trim(gArea[0]));
                r_end = Number($.trim(gArea[2]));
                c_start = Number($.trim(gArea[1]));
                c_end = Number($.trim(gArea[3]));

                var colposition = (index % totalCol) + 1;
                if ($(this).find('.vis-split-cell').length == 0) {
                    $(this).css('grid-area', rowPosition + '/' + colposition + '/' + (rowPosition + 1) + '/' + (colposition + 1));
                } else if (c != 0) {                  
                    if (c > 0) {
                        if (colposition > ci) {
                            $(this).css('grid-area', r_start + '/' + (c_start + c) + '/' + (r_end) + '/' + (c_end + c));
                        }
                    } else {
                        if (colposition > ci) {
                            $(this).css('grid-area', r_start + '/' + (c_start - 1) + '/' + (r_end) + '/' + (c_end -1));
                        }
                    }
                } else if (r != 0) { 
                    if (r > 0) {
                        if (rowPosition > ri) {
                            $(this).css('grid-area', (r_start + r) + '/' + c_start + '/' + (r_end + r) + '/' + c_end);
                        }
                    } else {
                        if (rowPosition > ri) {
                            $(this).css('grid-area', (r_start - 1) + '/' + c_start + '/' + (r_end - 1) + '/' + c_end);
                        }
                    }                   
                }                

            });

            colIdx = null;
        }

        /**
         * Create grid layout
         * */
        function createGrid() {
            var rowBox = DivGridSec.find('.rowBox');
            var colBox = DivGridSec.find('.colBox');
            var totalRow = rowBox.length - 1;
            var totalCol = colBox.length - 1;
            var grSec = activeSection;

            if (totalCol > 0 && totalRow > 0) {
                var oldrow = grSec.attr('row');
                var oldcol = grSec.attr('col');
                if (oldcol != totalCol && !isNewSection) {
                    for (var r = 1; r <= oldrow; r++) {
                        var pos = (r * oldcol) + (r - 1);
                        grSec.find('.grdDiv').eq(pos - 1).after("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                    }

                } else {
                    var totalDiv = totalRow * totalCol - grSec.find('.grdDiv').length;
                    for (var i = 0; i < totalDiv; i++) {
                        grSec.append("<div class='grdDiv' style='padding:5px;display: flex; flex-direction: row;'></div>");
                    }
                }

                grdsecMousehover();
                isNewSection = false;
            }

            gridCss();

        }

        function createGridRowCol() {
            DivGridSec.find('.rowBox:not(:first)').remove();
            var secNo = DivGridSec.find('.section-active').attr('sectionCount');
            var section = gridObj["section" + secNo];
            var rClone = DivGridSec.find('.rowBox:first').clone(true);
            rClone.show();
            DivGridSec.find('.colBox:not(:first)').remove();
            var cClone = DivGridSec.find('.colBox:first').clone(true);
            cClone.show();
            if (section) {
                for (let key in section) {
                    var item = section[key];
                    if (key.indexOf('row_') != -1) {
                        rClone.find('input').val(item.val);
                        rClone.find('select').val(item.msr);
                        DivGridSec.find('.DivRowBox').append(rClone);
                        rClone = DivGridSec.find('.rowBox:last').clone(true);
                    } else if (key.indexOf('col_') != -1) {
                        cClone.find('input').val(item.val);
                        cClone.find('select').val(item.msr);
                        DivGridSec.find('.DivColBox').append(cClone);
                        cClone = DivGridSec.find('.colBox:last').clone(true);
                    }
                }
                txtRowGap.val(section.rowGap);
                txtColGap.val(section.colGap);
                DivGridSec.find('.rowBox .grdRowDel').eq(1).hide();
                DivGridSec.find('.colBox .grdColDel').eq(1).hide();
            }

        }
        /**
         * Select Cell for merge
         * @param {any} cell
         */
        function selectTo(cell) {
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var idx = activeSection.find(cell).index();
            if (idx < 0) {
                return;
            }

            var currentRow = Math.ceil((idx + 1) / totalCol) - 1;

            //var row = cell.parent();
            var cellIndex = (idx) - totalCol * (currentRow);
            var rowIndex = currentRow;
            var rowStart, rowEnd, cellStart, cellEnd;

            if (rowIndex < startRowIndex) {
                rowStart = rowIndex;
                rowEnd = startRowIndex;
            } else {
                rowStart = startRowIndex;
                rowEnd = rowIndex;
            }

            if (cellIndex < startCellIndex) {
                cellStart = cellIndex;
                cellEnd = startCellIndex;
            } else {
                cellStart = startCellIndex;
                cellEnd = cellIndex;
            }

            //console.log(rowStart, rowEnd, cellStart, cellEnd);
            DivViewBlock.find('.vis-active-block').removeClass('vis-active-block');
            for (var i = rowStart; i <= rowEnd; i++) {
                for (var j = cellStart; j <= cellEnd; j++) {
                    activeSection.find('.grdDiv').eq(totalCol * i + j).addClass("vis-active-block");
                }
            }

            if (DivViewBlock.find('.vis-active-block').length > 1) {
                divTopNavigator.find('[command="Merge"]').parent().show();
            } else {
                divTopNavigator.find('[command="Merge"]').parent().hide();
            }
        }

        /**
         * Merge Selected Cell
         * */
        function mergeCell() {
            var rowStart = 0, rowEnd = 0, colStart = 0, colEnd = 1;
            var rowCount = 0;
            var colCount = 0;
            var countActive = 1;
            var totalActive = activeSection.find('.vis-active-block').length;
            var lastRow = 1;
            var isRowChange = false;
            var activColInRow = 0;
            var colBoxLen = DivGridSec.find('.colBox').length - 1;
            activeSection.find('.grdDiv').each(function (e) {
                colCount++;
                var currentRow = Math.ceil((e + 1) / colBoxLen);
                if (currentRow != lastRow) {
                    colCount = 1;
                }
                lastRow = currentRow;
                //$(this).css('grid-area', currentRow + '/' + colCount + '/' + (currentRow + 1) + '/' + (colCount+1));

                if ($(this).hasClass('vis-active-block')) {
                    if (activColInRow == 0) {
                        activColInRow = currentRow;
                    }
                    if (rowStart == 0 && colStart == 0) {
                        rowStart = currentRow;
                        colStart = colCount;
                        colEnd = colCount;
                    }

                    if (activColInRow == currentRow) {
                        colEnd++;
                    }
                    if (countActive == totalActive) {
                        rowEnd = currentRow + 1;
                    }
                    countActive++;
                    $(this)[0].style.removeProperty('grid-area');
                    $(this)[0].style.removeProperty('display');
                }

            });

            var unMearge = $('<span class="vis-split-cell"></span>');
            activeSection.find('.vis-active-block:not(:first)').hide().removeClass('vis-active-block');
            activeSection.find('.vis-active-block:first').css('grid-area', rowStart + '/' + colStart + '/' + rowEnd + '/' + colEnd).append(unMearge);

            unMearge.click(function () {
                applyunMerge($(this).parent());
                $(this).remove();
            });
        }

        /**
         * Split merge Cell
         * @param {any} e
         */
        function applyunMerge(e) {
            var gArea = e.css('grid-area').split('/');
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var DVB = activeSection.find('.grdDiv');
            for (var i = Number($.trim(gArea[0])); i < Number($.trim(gArea[2])); i++) {
                for (var j = Number($.trim(gArea[1])); j < Number($.trim(gArea[3])); j++) {
                    var gIdx = totalCol * (i - 1) + (j - 1);
                    DVB.eq(gIdx)[0].style.removeProperty('grid-area');
                    DVB.eq(gIdx)[0].style.removeProperty('display');
                }
            }
            gridCss();
        }
        /**
         * Check style weather Apply or not
         * @param {any} prop
         * @param {any} val
         * @param {any} htm
         */
        function checkStyle(prop, val, htm) {
            var styles = htm.attr('style'),
                value = false;

            styles && styles.split(";").forEach(function (e) {
                var style = e.split(":");
                if (val && $.trim(style[0]) === prop && $.trim(style[1]) === val) {
                    value = true;
                } else if (!val && $.trim(style[0]) === prop) {
                    value = true;
                }
            });
            return value;
        }

        /**
         * Apply css style on viewblock
         * @param {any} command
         * @param {any} styleValue
         */
        function applyCommand(command, styleValue) {
            DivViewBlock.css({
                'width': DivCradStep2.find('.vis-cardViewTemplateHead')[0].offsetWidth,
                'overflow': 'auto'
            });


            //isChange = true;
            //if (isChange && AD_HeaderLayout_ID != "0") {
            //    btn_BlockCancel.show();
            //}
            var tag = DivViewBlock.find('.vis-active-block');

            if (editorProp[command].proprty == "flex-direction") {
                tag[0].style.removeProperty("display");
                tag.find('.fieldGroup').removeAttr('style');
            }

            if (command == 'maxTextmultiline') {
                if (styleValue == "" || styleValue == null) {
                    tag[0].style.removeProperty('overflow');
                    tag[0].style.removeProperty('display');
                    tag[0].style.removeProperty('-webkit-box-orient');
                } else {
                    tag.css({
                        'overflow': 'hidden',
                        'display': '-webkit-box',
                        '-webkit-box-orient': 'vertical'
                    });
                }
            }

            if (command != 'gradient' && (styleValue == "" || styleValue == null)) {
                tag[0].style.removeProperty(editorProp[command].proprty);
                return;
            }



            if (command == 'gradient') {
                var color1 = DivStyleSec1.find('.' + command + '1').val();
                var color2 = DivStyleSec1.find('.' + command + '2').val();
                var prcnt = DivStyleSec1.find('.percent1').val();
                var prcnt2 = DivStyleSec1.find('.percent2').val();
                var deg = DivStyleSec1.find('.grdDirection option:selected').val();
                styleValue = 'linear-gradient(' + deg + ',' + color1 + ' ' + prcnt + '%,  ' + color2 + ' ' + prcnt2 + '%)';
                //DivStyleSec1.find('.vis-gradient-comp').css('background', styleValue);
                DivStyleSec1.find('[data-command="gradientInput"]').val('(' + deg + ',' + color1 + ' ' + prcnt + '%,  ' + color2 + ' ' + prcnt2 + '%)');
            }

            if (command == 'gradientInput') {
                styleValue = 'linear-gradient' + styleValue;
            }

            if (command == 'boxShadow') {
                var x = DivStyleSec1.find('.boxX').val();
                var y = DivStyleSec1.find('.boxY').val();
                var b = DivStyleSec1.find('.boxB').val();
                var c = DivStyleSec1.find('.boxC').val();
                styleValue = x + ' ' + y + ' ' + b + ' ' + c;
            }

            if (editorProp[command].proprty == 'justify-content' || editorProp[command].proprty == "align-items" || editorProp[command].proprty == "flex-direction") {
                tag.css("display", "flex");
                if (editorProp[command].proprty == "flex-direction") {
                    tag.find('.fieldGroup').css({
                        "display": "flex",
                        "flex-direction": $.trim(styleValue)
                    });
                }
            }

            if (styleValue == 'column' || styleValue == 'column-reverse') {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').addClass('vis-disable-event');
            } else {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').removeClass('vis-disable-event');
            }

            if (command == 'width' || command == 'height') {
                var sty = tag.attr('style') + ';' + editorProp[command].proprty + ':' + $.trim(styleValue) + ' !important';
                tag.attr('style', sty);
            } else {
                tag.css(editorProp[command].proprty, $.trim(styleValue));
            }

            templatechanges();
        }

        /**
         * Fill value back to style while select any block form viewport
         * @param {any} htm
         */
        function fill(htm) {

            DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').removeClass('vis-disable-event');

            DivStyleSec1.find('#master001_' + WindowNo + ' input').val('');
            DivStyleSec1.find('#master001_' + WindowNo + ' select').val('');
            DivStyleSec1.find('.gradient1').val('#000');
            DivStyleSec1.find('.gradient2').val('#000');
            DivStyleSec1.find('.percent1').val('0');
            DivStyleSec1.find('.percent2').val('100');
            DivStyleSec1.find('.grdDirection').val('to bottom');
            DivStyleSec1.find("[data-command1]").parent().removeClass('vis-hr-elm-inn-active');
            var styles = htm.attr('style');
            if (htm.find('sql').length > 0) {
                txtSQLQuery.val(VIS.secureEngine.decrypt(htm.attr("query")));
            } else {
                txtSQLQuery.val('');
            }
            
            txtCustomStyle.val(styles);
            styles && styles.split(";").forEach(function (e) {
                var style = e.split(":");
                for (const a in editorProp) {
                    if ($.trim(style[0]) == 'border-left' || $.trim(style[0]) == 'border-right' || $.trim(style[0]) == 'border-top' || $.trim(style[0]) == 'border-bottom') {
                        style[0] = style[0] + '-width';
                    }

                    if ($.trim(style[0]) == $.trim(editorProp[a].proprty)) {
                        var v = $.trim(style[1]);
                        if (editorProp[a].value == '') {
                            if (a == 'width' || a == 'height') {
                                v = v.replaceAll('!important', '');
                            }

                            if (a == 'fontFamily') {
                                v = v.replaceAll('"','');
                            }
                            if (a == 'padding' && $.trim(v).split(' ').length > 1) {
                                chkAllPadding.prop('checked', false);
                                DivStyleSec1.find('.allPadding').addClass('displayNone');
                                DivStyleSec1.find('.singlePadding').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='paddingLeft']").val(htm.css('padding-left'));
                                DivStyleSec1.find("[data-command='paddingTop']").val(htm.css('padding-top'));
                                DivStyleSec1.find("[data-command='paddingRight']").val(htm.css('padding-right'));
                                DivStyleSec1.find("[data-command='paddingBottom']").val(htm.css('padding-bottom'));
                            } else if (a == 'padding') {
                                chkAllPadding.prop('checked', true);
                                DivStyleSec1.find('.allPadding').removeClass('displayNone');
                                DivStyleSec1.find('.singlePadding').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else if (a == 'margin' && $.trim(v).split(' ').length > 1) {
                                chkAllMargin.prop('checked', false);
                                DivStyleSec1.find('.allMargin').addClass('displayNone');
                                DivStyleSec1.find('.singleMargin').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='marginLeft']").val(htm.css('margin-left'));
                                DivStyleSec1.find("[data-command='marginTop']").val(htm.css('margin-top'));
                                DivStyleSec1.find("[data-command='marginRight']").val(htm.css('margin-right'));
                                DivStyleSec1.find("[data-command='marginBottom']").val(htm.css('margin-bottom'));
                            } else if (a == 'margin') {
                                chkAllMargin.prop('checked', true);
                                DivStyleSec1.find('.allMargin').removeClass('displayNone');
                                DivStyleSec1.find('.singleMargin').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else if (a == 'borderRadius' && $.trim(v).split(' ').length > 1) {
                                chkAllBorderRadius.prop('checked', false);
                                DivStyleSec1.find('.allBorderRadius').addClass('displayNone');
                                DivStyleSec1.find('.singleBorderRadius').removeClass('displayNone');
                                DivStyleSec1.find("[data-command='borderTopLeftRadius']").val(htm.css('border-top-left-radius'));
                                DivStyleSec1.find("[data-command='borderTopRightRadius']").val(htm.css('border-top-right-radius'));
                                DivStyleSec1.find("[data-command='borderBottomRightRadius']").val(htm.css('border-bottom-right-radius'));
                                DivStyleSec1.find("[data-command='borderBottomLeftRadius']").val(htm.css('border-bottom-left-radius'));
                            } else if (a == 'borderRadius') {
                                chkAllBorderRadius.prop('checked', true);
                                DivStyleSec1.find('.allBorderRadius').removeClass('displayNone');
                                DivStyleSec1.find('.singleBorderRadius').addClass('displayNone');
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            } else {
                                DivStyleSec1.find("[data-command='" + a + "']").val(v);
                            }

                            if (a == 'backgroundColor') {
                                DivStyleSec1.find('.vis-zero-BTopLeftBLeft:first').css('background-color', v);
                                DivStyleSec1.find("[data-command='" + a + "'][type='color']").val(rgb2hex(v));
                            } else if (a == 'color') {
                                DivStyleSec1.find('.vis-zero-BTopLeftBLeft:last').css('background-color', v);
                                DivStyleSec1.find("[data-command='" + a + "'][type='color']").val(rgb2hex(v));
                            }else if (a.indexOf('border') != -1 && a.indexOf('radius')==-1) {
                                var rgb = v.split('rgb');
                                if (rgb.length > 1) {
                                    v = v.replace('rgb' + rgb[1], rgb2hex('rgb' + rgb[1]));
                                }
                                v = v.split(' ');
                                var bdrDiv = DivStyleSec1.find("[data-command='" + a + "']").closest('.vis-prop-pan-cont');
                                if (v.length == 1) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                } else if (v.length == 2) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                    bdrDiv.find("select").val(v[1]);
                                } else if (v.length == 3) {
                                    DivStyleSec1.find("[data-command='" + a + "']").val(v[0]);
                                    bdrDiv.find("select").val(v[1]);
                                    bdrDiv.find("[type='color']").val(v[2]);
                                    bdrDiv.find(".vis-back-color03").css('background-color', v[2]);
                                }

                                if (style[0].indexOf('-width') != -1) {
                                    chkAllBorder.prop('checked', false);
                                    DivStyleSec1.find('.allBorder').addClass('displayNone');
                                    DivStyleSec1.find('.singleBorder').removeClass('displayNone');
                                } else {
                                    chkAllBorder.prop('checked', true);
                                    DivStyleSec1.find('.allBorder').removeClass('displayNone');
                                    DivStyleSec1.find('.singleBorder').addClass('displayNone');
                                }
                            }
                           
                            break;
                        } else {
                            if (editorProp[a].value == v) {
                                DivStyleSec1.find("[data-command1='" + a + "']").parent().addClass('vis-hr-elm-inn-active');
                                break;
                            }
                        }
                    }
                }
            });

            if (DivStyleSec1.find("[data-command='flexDirection'] option:selected").val() == 'column' || DivStyleSec1.find("[data-command='flexDirection'] option:selected").val() == 'column-reverse') {
                DivStyleSec1.find('[data-command1="flexJustifyStart"]').closest('.vis-horz-align-d').addClass('vis-disable-event');
            }            
        }
        /**
         * Convert color from RGB To
         * @param {any} rgb
         */
        function rgb2hex(rgb) {
            if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);

        }

        /**
         * Unlink field which is linked
         * @param {any} fieldName
         * @param {any} itm
         */
        function unlinkField(fieldName, itm) {
            itm.closest('.fieldGroup').remove();            
            itm.remove();
            divTopNavigator.hide();
        }

        /** Get System Template */
        function getTemplateDesign() {
            IsBusy(true);
            var url = VIS.Application.contextUrl + "CardView/GetSystemTemplateDesign";
            DivTemplate.find('.mainTemplate[templateid="0"]').parent().click();
            DivTemplate.find('.vis-cardSingleViewTemplate:not(:first)').remove();
            var obj = {
            }
            $.ajax({
                type: "POST",
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(obj),
                success: function (data) {
                    var result = JSON.parse(data);
                    for (var i = 0; i < result.length; i++) {
                        DivTemplate.find('.vis-cardTemplateContainer').append($(result[i].template));
                    }  
                    IsBusy(false);
                    if (DivTemplate.find('.vis-cardSingleViewTemplate:not(:hidden)').length == 1) {
                        DivTemplate.find('.vis-noTemplateIcon').show();
                    } else {
                        DivTemplate.find('.vis-noTemplateIcon').hide();
                    }
                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }, complete: function () {
                    DivTemplate.find('.vis-cardSingleViewTemplate').click(function () {
                        DivTemplate.find('.vis-cardSingleViewTemplate').removeClass('vis-active-template');
                        $(this).addClass('vis-active-template');
                    });

                    DivTemplate.find('.vis-deleteTemplate').click(function () {
                        deleteTemplate(Number($(this).next().attr('templateID')), $(this));
                    });

                    scaleTemplate();                   
                }
            });
        }

        function getTemplateCategory() {
            cmbTemplateCategory.find('option').remove();
            cmbViwBlockTemplateCategory.find('option').remove();
            cmbTemplateCategory.append('<option value="">All</option>');
            cmbViwBlockTemplateCategory.append('<option value="">--Select Category--</option>');
            $.ajax({
                type: "POST",
                url: VIS.Application.contextUrl + "CardView/GetTemplateCategory",
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: {},
                success: function (data) {
                    var result = JSON.parse(data);
                    if (result) {
                        for (var i = 0; i < result.length; i++) {
                            cmbTemplateCategory.append('<option value="' + result[i].TemplateCategoryID + '">' + result[i].Name + '</option>');
                            cmbViwBlockTemplateCategory.append('<option value="' + result[i].TemplateCategoryID + '">' + result[i].Name + '</option>');
                        }
                    }
                    IsBusy(false);

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }
            });
        }
        /**
         * Save Template
         * @param {any} e
         */
        function saveTemplate(e) {
            e.preventDefault();
            if (txtTemplateName.val() == "") {
                VIS.ADialog.error("FillMandatory", true, "Template Name");
                return false;
            }

            //if (cmbViwBlockTemplateCategory.find('option:selected').val() == "" || cmbViwBlockTemplateCategory.find('option:selected').val() == null) {
            //    VIS.ADialog.error("FillMandatory", true, "Template Category");
            //    return false;
            //}

            var isExist = false;
            if (AD_HeaderLayout_ID == 0) {
                DivTemplate.find('.mainTemplate').each(function () {
                    if ($(this).attr('name') && $.trim($(this).attr('name').toUpperCase()) == $.trim(txtTemplateName.val().toUpperCase())) {
                        isExist = true;
                        VIS.ADialog.error("TempalteAlreadyExist", true, "");
                        return false;
                    }
                });
            }
            if (isExist) {
                return false;
            }

            IsBusy(true);
            var fieldObj = [];
            var seq = 10;
            var cardSection = [];

            cardViewColArray = [];
            DivViewBlock.find('.grdDiv:not(:hidden)').each(function (index) {
                var gridArea = $(this).css('grid-area').split('/');
                var secNo = $(this).closest('.vis-wizard-section').attr("sectioncount");
                gridObj['section' + secNo]["style"] = $(this).closest('.vis-wizard-section').attr("style");
                gridObj['section' + secNo]["sectionID"] = $(this).closest('.vis-wizard-section').attr("sectionid") || 0;
                var sectionSeq= ($(this).closest('.vis-wizard-section').index() + 1) *10;
                gridObj['section' + secNo]["sectionSeq"] = sectionSeq;
                gridObj['section' + secNo]["sectionName"] = $(this).closest('.vis-wizard-section').attr("name");
                var columnSQL = null;
                if ($(this).find('sql').length > 0) {
                    columnSQL = $(this).attr('query') || null;
                }
                if ($(this).find('.fieldGroup:not(:hidden)').length > 0) {
                    $(this).find('.fieldGroup:not(:hidden)').each(function (index) {                        
                        var contentValue = "";
                        var contentLabel = $(this).find('.fieldLbl').text();
                        var valueStyle = "";
                        if ($(this).find('.imgField').length > 0 && $(this).find('.fieldValue').length > 0) {
                            if ($(this).find('.imgField').attr('src')) {
                                contentValue = '<img class="imgField" src="' + $(this).find('.imgField').attr('src') + '" style="' + $(this).find('.imgField').attr('style') + '">';
                            } else {
                                var cls = $(this).find('.imgField').attr('class');
                                cls = cls.replace('vis-active-block', '');
                                contentValue = '<i class="imgField ' + cls+'" style="' + $(this).find('.imgField').attr('style') + '"></i>'
                            }
                            contentValue += ' |' + $(this).find('.fieldValue').text();
                            var isBR = $(this).find('br').length;
                            if ($(this).find('.imgField').next('.fieldValue').length > 0) {
                                valueStyle = '@img::' + $(this).find('.imgField').attr('style') || '';
                                if (isBR > 0) {
                                    valueStyle += '|<br>';
                                }
                                valueStyle += ' |@value::' + $(this).find('.fieldValue').attr('style') || 'display:none';
                            } else {
                                valueStyle = '@value::' + $(this).find('.fieldValue').attr('style') || 'display:none';
                                if (isBR > 0) {
                                    valueStyle += '|<br>';
                                }
                                valueStyle += ' |@img::' + $(this).find('.imgField').attr('style') || '';
                            }


                        } else if ($(this).find('.imgField').length > 0) {
                            contentValue = '<img class="imgField" src="' + $(this).find('.imgField').attr('src') + '" style="' + $(this).find('.imgField').attr('style') + '">';
                            valueStyle = '@value::' + $(this).find('.fieldValue').attr('style')||'';
                            valueStyle += ' |@img::' + $(this).find('.imgField').attr('style') || '';
                        } else {
                            contentValue = $(this).find('.fieldValue').text();
                            valueStyle = $(this).find('.fieldValue').attr('style') || '';
                        }

                       
                        var hideFieldIcon = true;
                        if ($(this).find('.fa-star').length == 0) {
                            hideFieldIcon = true;
                        }
                        if ($(this).find('.fieldLbl').attr('showfieldicon')) {
                            hideFieldIcon = $(this).find('.fieldLbl').attr('showfieldicon') == 'true' ? true : false;
                        }

                        obj1 = {
                            cardFieldID: $(this).attr('cardfieldid'),
                            sectionNo: sectionSeq, //secNo * 10,
                            rowStart: $.trim(gridArea[0]),
                            rowEnd: $.trim(gridArea[2]),
                            colStart: $.trim(gridArea[1]),
                            colEnd: $.trim(gridArea[3]),
                            seq: seq,
                            style: $(this).closest('.grdDiv').attr('style'),
                            fieldID: $(this).find('.fieldLbl').attr('fieldid'),
                            valueStyle: valueStyle,
                            fieldStyle: $(this).find('.fieldLbl').attr('style') || '',
                            hideFieldIcon: hideFieldIcon,
                            hideFieldText: $(this).find('.fieldLbl').attr('showfieldtext') == 'true' ? true : false,
                            columnSQL: columnSQL,
                            contentFieldValue: contentValue,
                            contentFieldLabel: contentLabel
                        }

                        //var f = {}
                        //f.AD_Field_ID = obj1.fieldID;
                        //f.CardViewID = 0;
                        //cardViewColArray.push(f);
                       
                        fieldObj.push(obj1);
                    });
                } else {
                    var obj1 = {
                        cardFieldID: null,
                        sectionNo: sectionSeq,
                        rowStart: $.trim(gridArea[0]),
                        rowEnd: $.trim(gridArea[2]),
                        colStart: $.trim(gridArea[1]),
                        colEnd: $.trim(gridArea[3]),
                        seq: seq,
                        style: $(this).attr('style'),
                        fieldID: null,
                        valueStyle: "",
                        fieldStyle: '',
                        hideFieldIcon: false,
                        hideFieldText: false,
                        columnSQL: columnSQL,
                        contentFieldValue: null,
                        contentFieldLable: null
                    }

                   
                    fieldObj.push(obj1);
                }
                seq += 10;
            });
            
            Object.keys(gridObj).forEach(function (key) {
                var fobj = {
                    sectionName: gridObj[key].sectionName,
                    sectionID: gridObj[key].sectionID,
                    sectionNo: gridObj[key].sectionSeq,
                    style: gridObj[key].style,
                    totalRow: gridObj[key].totalRow,
                    totalCol: gridObj[key].totalCol,
                    rowGap: gridObj[key].rowGap,
                    colGap: gridObj[key].colGap
                };
                cardSection.push(fobj);
            });

            var finalobj = {
                CardViewID: 0,
                templateID: AD_HeaderLayout_ID || 0,
                templateName: txtTemplateName.val(),
                templateCategory: cmbViwBlockTemplateCategory.find('option:selected').val() ||0,
                style: DivViewBlock.find('.vis-viewBlock').attr('style'),
                cardSection: cardSection,
                cardTempField: fieldObj,
                isSystemTemplate: 'Y',
                refTempID: 0
            }            
            var url = VIS.Application.contextUrl + "CardView/SaveCardTemplate";
            $.ajax({
                type: "POST",
                async: false,
                url: url,
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(finalobj),
                success: function (data) {
                    var result = JSON.parse(data);
                    if (isNaN(result)) {
                        toastr.error(result, '', { timeOut: 3000, "positionClass": "toast-top-center", "closeButton": true, });
                        IsBusy(false);
                        return;
                    }
                    AD_HeaderLayout_ID = result;
                    isSystemTemplate = 'Y';         
                    toastr.success(VIS.Msg.getMsg('SavedSuccessfully'), '', { timeOut: 3000, "positionClass": "toast-top-center", "closeButton": true, });
                    IsBusy(false);
                    getTemplateDesign();
                    

                }, error: function (errorThrown) {
                    alert(errorThrown.statusText);
                    IsBusy(false);
                }
            });

        }



        this.getRoot = function () {
            return root;
        };

        /**Scale Template to fit in block */
        function scaleTemplate() {
            DivTemplate.find('.vis-cardSingleViewTemplate').each(function () {
                var pH = $(this).height();
                var pW = $(this).width();
                var inner = $(this).find('.mainTemplate');
                var iH = inner.height();
                var iW = inner.width();
                var zoom = 1;
                var hR = pH / iH;
                var wR = pW / iW;
                if (hR > wR) {
                    zoom = wR;
                } else {
                    zoom = hR;
                }

                inner.css('zoom', zoom);
            });
        }

        function addImgValue(element, isText, isEdit, InputIcon) {
            var itm = '<div class="fieldGroup" draggable="true">';
                

            if ($.trim(InputIcon.val()).length > 0) {
                if (!isEdit) {
                    if (isText) {
                        itm +='<span class="fieldLbl" title="Image+Text" contenteditable="true">Label</span>';                        
                        itm += '<i class="imgField ' + $.trim(InputIcon.val()) + '"></i>';
                        itm += '<span class="fieldValue" contenteditable="true">:Value</span>';
                        itm += '</div>';
                        var blok = DivViewBlock.find('.vis-active-block');
                        if (blok.hasClass('grdDiv')) {
                            blok.append($(itm));
                        }
                        templatechanges();
                    }
                } else {                    
                    var dvb = DivViewBlock.find('.vis-active-block');
                    dvb.removeAttr('class');
                    dvb.addClass('imgField vis-active-block');
                    dvb.addClass($.trim(InputIcon.val()));
                    templatechanges();
                }
                
                return;
            }

            var MAX_WIDTH = 320;
            var MAX_HEIGHT = 180;
            var MIME_TYPE = "image/jpeg";
            var QUALITY = 0.7;

            var file = element[0].files[0];
            var blobURL = URL.createObjectURL(file);
            var img = new Image();
            img.src = blobURL;
            img.onerror = function () {
                URL.revokeObjectURL(this.src);
                // Handle the failure properly
                console.log("Cannot load image");
            };
            img.onload = function () {
                URL.revokeObjectURL(this.src);
               
                var wh = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
                newWidth = wh.width;
                newHeight = wh.height;
                var canvas = document.createElement("canvas");
                canvas.width = newWidth;
                canvas.height = newHeight;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                canvas.toBlob(function (blob) {
                },
                    MIME_TYPE,
                    QUALITY);
                //console.log(canvas.toDataURL());  
                if (!isEdit) {
                   
                    if (isText) {
                        itm += '<span class="fieldLbl" title="Image+Text" contenteditable="true">Label</span>';
                        itm += '<img class="imgField" style="width:30px; height:30px" src="' + canvas.toDataURL() + '">';
                        itm += '<span class="fieldValue" contenteditable="true">:Value</span>';
                    } else {
                        itm += '<span class="fieldLbl displayNone" title="Image" contenteditable="true" showfieldtext="true" >Label</span>';  
                        itm += '<img class="imgField" style="width:100px; height:100px" src="' + canvas.toDataURL() + '">';
                    }
                    itm += '</div>';
                    var blok = DivViewBlock.find('.vis-active-block');
                    if (blok.hasClass('grdDiv')) {
                        blok.append($(itm));
                    }
                    templatechanges();
                } else {
                    DivViewBlock.find('.vis-active-block').attr('src', canvas.toDataURL());
                    templatechanges();
                }
            };            
            
        };


        function calculateSize(img, maxWidth, maxHeight) {
            var width = img.width;
            var height = img.height;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * maxHeight / height);
                    height = maxHeight;
                }
            }
            return {
                width: width,
                height: height
            }
        }


        function deleteTemplate(tempID,e) {
            VIS.ADialog.confirm("SureWantToDelete", true, "", VIS.Msg.getMsg("Confirm"), function (result) {
                if (result) {
                    var url = VIS.Application.contextUrl + "CardView/DeleteTemplate";
                    $.ajax({
                        type: "POST",
                        async: false,
                        url: url,
                        dataType: "json",
                        contentType: 'application/json; charset=utf-8',
                        data: JSON.stringify({ 'tempID': tempID }),
                        success: function (data) {
                            var result = JSON.parse(data);
                            e.parent().remove();
                        }, error: function (errorThrown) {
                            alert(errorThrown.statusText);
                        }
                    });
                }
            });
        }


        function templatechanges() {
            var Chtml = DivViewBlock.find('.vis-viewBlock').html();
            if (cur_history_index < history.length - 1) {
                history = history.slice(0, cur_history_index + 1);
                cur_history_index++;
                //btnRedo.attr("disabled", "disabled");
            }

            var cur_canvas = JSON.stringify(Chtml);
            if (cur_canvas != history[cur_history_index] || force == 1) {
                history.push(cur_canvas);
                if (history.length > 11) {
                    history.shift();
                }
                cur_history_index = history.length - 1;
            }

            DivCradStep2.find('.vis-v-rowcol').hide();

            btnRedo.attr("disabled", "disabled");
            btnUndo.removeAttr("disabled");
        }

        function ViewBlockAddDelRowCol(e) {
            
            DivCradStep2.find('.vis-v-rowcol').show();

            var idx = $(e.target).index();           
            var rc = getRowColPostion(idx);

            if (rc.rowNo == 1) {
                btnVdelrow.hide();
            }

            if (rc.colNo == 1) {
                btnVdelCol.hide();
            }
           

            btnVaddrow.css({
                'left': $(e.target).closest('.vis-viewBlock')[0].offsetLeft - 38,
                'top': $(e.target).height() + $(e.target)[0].offsetTop
            });

            btnVdelrow.css({
                'left': $(e.target).closest('.vis-viewBlock')[0].offsetLeft - 20,
                'top': $(e.target).height() + $(e.target)[0].offsetTop
            });

            btnVaddCol.css({
                'top': $(e.target).closest('.vis-viewBlock')[0].offsetTop - 20,
                'left': ($(e.target).width() - 8) + $(e.target)[0].offsetLeft
            })
            btnVdelCol.css({
                'top': $(e.target).closest('.vis-viewBlock')[0].offsetTop - 20,
                'left': ($(e.target).width() - 5) + $(e.target)[0].offsetLeft + 15
            })
        }

        function getRowColPostion(idx) {
            var totalCol = DivGridSec.find('.colBox').length - 1;
            var rowPosition = (Math.floor(idx / totalCol)) + 1;
            var colposition = (idx % totalCol) + 1;
            return {
                rowNo: rowPosition,
                colNo: colposition
            }
        }

        this.show = function (istext, isEdit) {
            var mainDiv = $('<div>');
            var input = $('<input type="file" name="" maxlength="50" style="height: 45px;padding: 10px" class="" accept="image/*" placeholder=" " data-placeholder="">');
            var lbl = $('<label for="">' + VIS.Msg.getMsg("SelectFromFiles") + '</label>');
            var $root = $('<div class="input-group vis-input-wrap"></div>');
            var control = $('<div class="vis-control-wrap"></div>');
            control.append(input).append(lbl);
            $root.append(control);
            mainDiv.append($root);
            IconInput = $('<input type="text" name="" class="" placeholder=" " data-placeholder="">');
            if (istext) {
                var orDiv = $('<div class="mb-2"><center>OR</center></div>');
                $root = $('<div class="input-group vis-input-wrap"></div>');
                lbl = $('<label style="left:10px" for="">' + VIS.Msg.getMsg("Icon") + '</label>');
                control = $('<div class="vis-control-wrap"></div>');
                
                control.append(IconInput).append(lbl);
                $root.append(control);
                mainDiv.append(orDiv).append($root);
                mainDiv.append('<div class="input-group vis-input-wrap "><div class="vis-control-wrap"><p style="word-break: break-all" for="">' + VIS.Msg.getMsg("IconLinkMsg") + '</p></div></div>')
            }

            input.change(function () {
                IconInput.val('');
                if ($(this).val().length > 0) {
                    IconInput.attr('disabled', 'disabled');
                } else {
                    IconInput.removeAttr('disabled');
                }
            });

            IconInput.change(function () {
                input.val('');
                if ($(this).val().length > 0) {                   
                    input.attr('disabled', 'disabled');
                } else {
                    input.removeAttr('disabled');
                }

                if (IconInput.val().indexOf('fa-') != -1 && IconInput.val().indexOf('fa ') == -1) {
                    IconInput.val('fa ' + IconInput.val());
                } else if (IconInput.val().indexOf('vis-') != -1 && IconInput.val().indexOf('vis ') == -1) {
                    IconInput.val('vis ' + IconInput.val())
                }
                //IconInput.val(IconInput.val().replace('fa ', ''));
                //IconInput.val(IconInput.val().replace('vis ', ''));
            })


            ch = new VIS.ChildDialog();
            ch.setTitle(VIS.Msg.getMsg("InsertImage"));
            ch.setWidth('30%');
            //ch.setHeight(h);
            ch.setContent(mainDiv);
            ch.onOkClick = function (e) {
                addImgValue(input, istext, isEdit, IconInput);
                //convertImageToBase64(input, istext, isEdit);
            };
            ch.onCancelClick = cancel;
            ch.onClose = cancel;
            ch.show();
            //ch.hideButtons();
        }

        function cancel() {
            ch.close();
            return true;
        };

        this.disposeComponent = function () {
            self = null;
            root.remove();
            root = null;
        };

        loadUI();
    }

   
    VCTMaster.prototype.init = function (windowNo, frame) {
        //Assign to this Varable
        this.frame = frame;
        this.windowNo = windowNo;
        this.frame.getContentGrid().append(this.getRoot());
    };

    VCTMaster.prototype.dispose = function () {
        this.disposeComponent();
    };




    VIS.CardTemplateMaster = VCTMaster;

})(VIS, jQuery);