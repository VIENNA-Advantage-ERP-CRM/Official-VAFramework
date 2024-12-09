; (function (VIS, $) {
    //****************************************************//
    //**             APanel                             **//
    //****************************************************//

    var baseUrl = VIS.Application.contextUrl;
    var dataSetUrl = baseUrl + "JsonData/JDataSetWithCode";
    //executeDataSet
    var executeDataSet = function (sql, param, callback) {
        var async = callback ? true : false;

        var dataIn = { sql: sql, page: 1, pageSize: 0 };
        if (param) {
            dataIn.param = param;
        }

        var dataSet = null;

        getDataSetJString(dataIn, async, function (jString) {
            dataSet = new VIS.DB.DataSet().toJson(jString);
            if (callback) {
                callback(dataSet);
            }
        });

        return dataSet;
    };

    var executeScalar = function (sql, params, callback) {
        var async = callback ? true : false;
        var dataIn = { sql: sql, page: 1, pageSize: 0 }
        if (params) {
            dataIn.param = params;
        }

        var value = null;


        getDataSetJString(dataIn, async, function (jString) {
            dataSet = new VIS.DB.DataSet().toJson(jString);
            var dataSet = new VIS.DB.DataSet().toJson(jString);
            if (dataSet.getTable(0).getRows().length > 0) {
                value = dataSet.getTable(0).getRow(0).getCell(0);

            }
            else { value = null; }
            dataSet.dispose();
            dataSet = null;
            if (async) {
                callback(value);
            }
        });

        return value;
    };
    //DataSet String
    function getDataSetJString(data, async, callback) {
        var result = null;
        // data.sql = VIS.secureEngine.encrypt(data.sql);
        $.ajax({
            url: dataSetUrl,
            type: "POST",
            datatype: "json",
            contentType: "application/json; charset=utf-8",
            async: async,
            data: JSON.stringify(data)
        }).done(function (json) {
            result = json;
            if (callback) {
                callback(json);
            }
            //return result;
        });
        return result;
    };

    var tmpAPanel = document.querySelector('#vis-ad-paneltmp').content;// $("#vis-ad-windowtmp");

    /**
     *	Main Application Panel.
     *  Structure:
     *  HeaderPanel
     *	ToolBar
     *  tabPanel
     *  Actionpanel
     *  StatusBar
     *
     */

    function APanel() {
        //This variable public to Instance
        var clsSuffix;
        this.$parentWindow;
        this.ctx = VIS.Env.getCtx();
        this.curGC;
        this.curST;
        this.curTab;
        this.vTabbedPane = new VIS.VTabbedPane(false);

        this.statusBar = new VIS.StatusBar();
        /* current Tab panel */
        this.curWinTab = null;
        /* Tab Index */
        this.curTabIndex;
        /* Sort Tab */
        this.firstTabId = null;
        this.masterTabId = null;
        this.DocActionVariables = {};
        this.DocActionVariables.STATUS_COMPLETED = "CO";
        this.DocActionVariables.STATUS_CLOSED = "CL";
        this.DocActionVariables.STATUS_VOIDED = "VO";
        this.DocActionVariables.STATUS_REVERSED = "RE";

        this.toolbarCreated = false;
        this.errorDisplayed = false;

        this.isPersonalLock = VIS.MRole.getIsPersonalLock();
        this.isShowSharedRecord = VIS.MRole.getIsShowSharedRecord();
        this.log = VIS.Logging.VLogger.getVLogger("APanel");

        this.isSummaryVisible = false;
        this.lastView = "";

        this.advanceWhere = "";
        this.filterWhere = "";
        this.advanceFlag = false;
        this.filterFlag = false;
        this.isAdvancesearch = false;
        this.isFilter = false;
        //private 
        var $divContentArea, $ulNav, $ulToobar, $divStatus, $ulTabControl, $divTabControl, $divTabNav;
        var $txtSearch, $imgSearch, $btnClrSearch, $imgdownSearch, $btnFilter;
        var $root, $busyDiv, $landingpage;
        var $ulRightBar2; //right bar
        var $btnlbToggle, $ulactionbar, $uldynactionbar, $divlbMain, $divlbNav; //right bar
        var $hdrPanel = "", $divIncludeTab, $divHeaderNav;
        var $fltrPanel = "";
        var $fltrPnlBody = "";
        var $btnFPClose = "";
        var $tabPanel = null;
        var $spnAdvSearch = null;
        var $btnClose = null;
        var $spnTitle = null;
        var $spanSetting = null;
        var $divRightbar = null;
        var $landingpage = null;
        this.excludeFromShare = ['ad_org', 'm_warehouse', 'ad_sharerecordorg'];
        /***END Tab panel**/

        /* reserve pnl for right tab panel */
        var $divReserveTabPanel = null;



        var tabItems = [], tabLIObj = {};
        this.defaultSearch = true;
        this.isAutoCompleteOpen = false;
        this.instructionPop = {};
        this.instructionPop[this.ACTION_NAME_NEW] = false;

        this.tabStack = []; // Maintain tab and view change history;

        this.toolbarActionList = ['UNO', 'NRD', 'SAR', 'DRD', 'RQY', 'RET', 'PRT', 'BVW', 'SAN', 'HOE']; // ToolBar Action

        function initComponenet() {
            var clone = document.importNode(tmpAPanel, true);
            $root = $(clone.querySelector(".vis-ad-w-p"));
            $busyDiv = $root.find(".vis-ad-w-p-busy"); // busy indicator
            $landingpage = $root.find(".vis-landingpage");
            $windowpage = $root.find(".vis-windowpage");
            $root.find('.vis-ad-w-p-tb').attr('style', 'display:none');

            //tolbar and search 
            $ulToobar = $root.find(".vis-ad-w-p-tb-lc");// $("<ul class='vis-appsaction-ul'>"); //toolbar item list
            //navigation and tab control
            $ulNav = $root.find(".vis-ad-w-p-nav-btns");   // $("<ul class='vis-appsaction-ul vis-apanel-nav-ul'>"); //navigation list
            $ulTabControl = $root.find(".vis-ad-w-p-t-c-tc");;  // $("<ul class='vis-appsaction-ul vis-apanel-tabcontrol-ul'>");//tab control
            $divTabControl = $root.find(".vis-ad-w-p-t-c");// $("<div class='vis-apanel-tabcontrol'>").append($ulTabControl);
            $divTabNav = $root.find(".vis-ad-w-p-tabs-oflow").hide();// $("<div class='vis-apanel-tab-oflow'>").hide();
            $divHeaderNav = $root.find(".vis-ad-w-p-tabs-t");

            $divRightbar = $root.find(".vis-ad-w-p-action").hide();
            $btnlbToggle = $root.find(".vis-ad-w-p-tb-rc-abar").hide();

            $ulactionbar = $root.find('.vis-ad-w-p-a-m-slist');   // $ ("<ul class='vis-apanel-lb-ul'>");
            $uldynactionbar = $root.find('.vis-ad-w-p-a-m-dlist');   // $ ("<ul class='vis-apanel-lb-ul'>");

            $divlbMain = $root.find('.vis-ad-w-p-a-main');//  ( '<div class="vis-ad-w-p-a-main">');
            $divlbNav = $root.find('.vis-ad-w-p-a-oflow');// ("<div class='vis-ad-w-p-a-oflow'>").hide();

            $hdrPanel = $root.find(".vis-ad-w-p-header-l");



            $divIncludeTab = $root.find(".vis-ad-w-p-center-inctab");

            $ulRightBar2 = $root.find(".vis-ad-w-p-tb-rc-a-list");


            $divContentArea = $root.find(".vis-ad-w-p-center-view");

            //StatusBar
            //$divStatus = $("<div class='vis-apanel-statusbar'>").hide();
            $divStatus = $root.find(".vis-ad-w-p-status");

            $tabPanel = $root.find('.vis-ad-w-p-actionpanel-r');

            $divReserveTabPanel = $root.find('.vis-ad-w-p-actionpanel-r-b');
            /********* END Tab Panels **************/

            //Search 
            $txtSearch = $root.find(".vis-ad-w-p-tb-s-input");
            $btnClrSearch = $root.find(".vis-ad-w-p-tb-s-icon");
            $imgdownSearch = $root.find(".vis-ad-w-p-tb-s-icon-down");
            // $imgFilter = $root.find(".fa-filter");

            $txtSearch.attr('placeholder', VIS.Msg.getMsg("Search"));
            // Mohit - Shortcut as title.
            $imgSearch = $root.find(".vis-ad-w-p-tb-s-btn");
            //Advance Search 
            $spnAdvSearch = $root.find(".vis-ad-w-p-tb-advsrch");

            //close 
            $btnClose = $root.find(".vis-ad-w-p-t-close");
            $spnTitle = $root.find('.vis-ad-w-p-t-name h5');

            //Filter Panel
            $btnFilter = $root.find("span.vis-ad-w-p-tb-rc-action");
            $fltrPanel = $root.find('.vis-ad-w-p-filterpnl').hide();
            $spanSetting = $root.find('.vis-ad-w-p-setting');
            $fltrPnlBody = $fltrPanel.find('.vis-fp-bodywrap');
            $fltrPanel.find('.vis-fp-header h4').text(VIS.Msg.getMsg("Filter"));
            $btnFPClose = $fltrPanel.find('.vis-fp-header .vis-mark');

            setToolTipMessages();

            eventHandling();
        };

        var setToolTipMessages = function () {
            $btnFilter.attr('title', VIS.Msg.getMsg('FilterRecord'));
            $spanSetting.attr('title', VIS.Msg.getMsg('Settings'));
        };
        var self = this;
        var eventHandling = function () {
            $root.on('click', function (e) {
                $root.find('.vis-window-instruc-overlay-new').remove();
                $root.find('.vis-window-instruc-overlay-new-li').removeClass('.vis-window-instruc-overlay-new-li');
                if ($(e.target).is(':focus')) {
                    self.compositViewChangeSave(e);
                }
            });

            $landingpage.on('click', function () {
                self.showLandingPage(true);
            });

            $windowpage.on('click', function () {
                self.showLandingPage(false);
            });

        };

        this.createSearchAutoComplete = function (text) {
            if ($txtSearch) {

                var $selfpanel = this;
                var isDel = false;
                $txtSearch.autocomplete({
                    select: function (ev, ui) {
                        self.defaultSearch = false;
                        if (self.isSummaryVisible) {
                            self.curTab.setShowSummaryNodes(true);
                        }
                        else {
                            self.curTab.setShowSummaryNodes(false);
                        }
                        var query = new VIS.Query(self.curTab.getTableName(), false);
                        self.curGC.aFilterPanel.hardRefreshFilterPanel();
                        self.curTab.searchText = ui.item.value;
                        self.curTab.userQueryID = ui.item.id;

                        if (ui.item.code != VIS.Msg.getMsg("All")) {
                            //query.addRestriction(ui.item.code);
                            self.curGC.searchCode = ui.item.code;
                            self.curTab.searchCode = ui.item.code;
                        }
                        //	History

                        //Set Page value to 1
                        //self.curTab.getTableModel().setCurrentPage(1);
                        ////	Confirmed query
                        //self.curTab.setQuery(query);
                        //self.curGC.query(0, 0, false);   //  autoSize
                        //self.curGC.applyFilters(query);
                        $btnClrSearch.css("visibility", "visible");
                        $imgdownSearch.css("visibility", "visible").css("transform", "rotate(360deg)");
                        self.curGC.aFilterPanel.setFilterLineAdvance(self.curTab.userQueryID);
                        $txtSearch.attr('readonly', 'readonly');
                        ev.stopPropagation();
                    },
                    minLength: 0,
                    open: function (ev, ui) {
                        $selfpanel.isAutoCompleteOpen = true;
                    },
                    close: function (event, ui) {
                        $imgdownSearch.css("transform", "rotate(360deg)");
                        window.setTimeout(function () {
                            $selfpanel.isAutoCompleteOpen = false;

                        }, 400);
                    },
                    source: []
                });
                $txtSearch.autocomplete().data('ui-autocomplete')._renderItem = function (ul, item) {

                    var span = null;
                    if ($selfpanel.curTab.getTabLevel() == 0) {
                        if (item.defaultids && item.userid > 0) {
                            span = $("<span title='" + VIS.Msg.getMsg("DefaultSearch") + "'  data-id='" + item.id + "' class='VIS-winSearch-defaultIcon'></span>");

                        }
                        else {
                            span = $("<span title='" + VIS.Msg.getMsg("MakeDefaultSearch") + "' data-id='" + item.id + "' class='VIS-winSearch-NonDefaultIcon'></span>");
                        }
                    }
                    else {
                        span = $("<span title='" + VIS.Msg.getMsg("DefaultSearch") + "'  data-id='" + item.id + "'></span>");
                    }

                    var del = $("<span data-id='" + item.id + "' title='" + VIS.Msg.getMsg("Delete") + "'   class='fa fa-trash-o'></span>");

                    var d = $('<div class="d-flex align-items-center justify-content-center">');
                    d.append(span).append(del);

                    var li = $("<li>")
                        .append($("<a style='display:block' title='" + item.title + "'>" + item.label + "</a>").append(d))
                        .appendTo(ul);


                    span.on("click", function (e) {

                        var uQueryID = $(this).data('id');

                        $.ajax({
                            url: VIS.Application.contextUrl + "JsonData/InsertUpdateDefaultSearch",
                            dataType: "json",
                            data: { AD_Tab_ID: self.curTab.getAD_Tab_ID(), AD_Table_ID: self.curTab.getAD_Table_ID(), AD_User_ID: self.ctx.getAD_User_ID(), AD_UserQuery_ID: uQueryID },
                            success: function (data) {

                            },
                            error: function (er) {
                                console.log(er);
                            }

                        });
                    });

                    del.on("click", function (ev) {
                        ev.stopPropagation();
                        var $t = $(this);
                        var uQueryID = $(this).data('id');
                        var no = -1;
                        self.setBusy(true);
                        $.ajax({
                            url: VIS.Application.contextUrl + 'ASearch/DeleteQuery',
                            type: "POST",
                            datatype: "json",
                            async: false,
                            data: { id: uQueryID }
                        }).done(function (json) {
                            self.setBusy(false);
                            $t.closest('li').remove();
                            no = parseInt(json);
                            self.removeSearchOnDelete();
                            toastr.success(VIS.Msg.getMsg('DeleteSuccessfully'), '', { timeOut: 3000, "positionClass": "toast-top-center", "closeButton": true, });
                        })
                    });

                    return li;
                };
            }
        };



        function finishLayout() {
            $divHeaderNav.show();
            $divStatus.show();
            if (VIS.Application.isMobile) {
                $divlbNav.hide();
                $divlbMain.addClass("vis-ad-w-p-a-main-mob");
                $divTabControl.addClass("vis-ad-w-p-t-c-mob");
            }
            self.vTabbedPane.finishLayout(VIS.Application.isMobile);

            if (self.gridWindow.getIsHideTabLinks()) {
                $divHeaderNav.find('*').css('visibility', 'hidden');
            }



            setToolTipMessages();
        };
        /* Tool bar */

        initComponenet();
        $divStatus.append(this.statusBar.getRoot()); //Status bar

        this.hideToolbar = function (hide) {
            if (hide)
                $ulToobar.find('*').hide();
            else
                $ulToobar.find('*').show();
        };

        this.hideTabLinks = function (hide) {
            if (hide)
                $divHeaderNav.find('*').css('visibility', 'hidden');
            else
                $divHeaderNav.find('*').css('visibility', 'visible');
        };

        this.hideActionbar = function (hide) {
            if (hide) {
                $btnlbToggle.hide();
                $divRightbar.hide();
            }
            else {
                $btnlbToggle.show();
                $divRightbar.show();
            }
        };

        this.setSize = function (height, width) {
            return;
        };

        this.setFilterActive = function (isActive) {
            if (isActive) {
                $btnFilter.find('i').addClass("vis-color-primary");
            } else {
                $btnFilter.find('i').removeClass("vis-color-primary");
            }
        }

        /**
         * Check given refrence is window action.
         * @param {any} refrenceValue
         */
        this.getIsWindowAction = function (refrenceValue) {
            if (refrenceValue == 435) {
                return true;
            } else {
                return false;
            }
        }

        //Action Perormed
        var onAction = function (action) {
            self.actionPerformed(action);
        };

        //tabAction
        this.onTabChange = function (action) {
            self.tabActionPerformed(action);
        };

        this.statusBar.onComboChange = function (index) {
            self.setBusy(true);
            //console.log(index);
            setTimeout(function () {
                self.curGC.navigatePageExact(index + 1);
                if (!self.curGC.onDemandTree) {
                    self.setBusy(false);
                }
            }, 100);
        };

        this.createToolBar = function () {

            //1. toolbar action
            this.aHome = this.addActions("HOE", null, true, true, false, onAction, null, "Shct_Home", "home");
            this.aRefresh = this.addActions(this.ACTION_NAME_REFRESH, null, true, true, false, onAction, null, "Shct_Refresh", "Refresh");
            this.aDelete = this.addActions(this.ACTION_NAME_DELETE, null, true, true, false, onAction, null, "Shct_Delete", "Delete");
            this.aNew = this.addActions(this.ACTION_NAME_NEW, null, true, false, false, onAction, null, "Shct_New", "New");
            this.aIgnore = this.addActions("UNO", null, true, true, false, onAction, null, "Shct_Ignore", "Ignore");
            this.aSave = this.addActions(this.ACTION_NAME_SAVE, null, true, true, false, onAction, null, "Shct_Save", "Save");
            this.aSaveNew = this.addActions(this.ACTION_NAME_SAVENEW, null, true, true, false, onAction, null, "Shct_SaveNew", "save-new");
            this.aFind = this.addActions("Find", null, true, true, false, onAction, null, "Shct_Find");
            this.aInfo = this.addActions("Info", null, true, true, false, onAction, null, "Shct_Info");
            this.aReport = this.addActions("RET", null, true, true, false, onAction, null, "Shct_Report", "Report");
            this.aPrint = this.addActions("PRT", null, true, true, false, onAction, null, "Shct_Print", "Print");
            // this.aBatchUpdate = this.addActions("BatchUpdate", null, true, true, false, onAction, null, "Shct_BatchUpdate");

            //Ndw Back button
            this.aBack = this.addActions("BVW", null, true, true, false, onAction, null, "Shct_Back", "back-arrow");
            //check toolbar
            // if (!this.gridWindow.getIsHideToolbar()) {
            $ulToobar.append(this.aHome.getListItm());
            $ulToobar.append(this.aBack.getListItm());
            $ulToobar.append(this.aIgnore.getListItm());
            $ulToobar.append(this.aNew.getListItm());
            $ulToobar.append(this.aDelete.getListItm());
            $ulToobar.append(this.aSave.getListItm());
            $ulToobar.append(this.aSaveNew.getListItm());
            $ulToobar.append(this.aRefresh.getListItm());
            $ulToobar.append(this.aReport.getListItm());
            $ulToobar.append(this.aPrint.getListItm());
            // $ulToobar.append(this.aBatchUpdate.getListItm());
            // }

            if (!this.gridWindow.getIsHideToolbar()) {
                $ulToobar.find("LI").hide();
            }

            //lakhwinder
            //$ulToobar.append(this.aInfo.getListItm());

            // $ulToobar.append(new VIS.AppsAction().getSeprator(false, true));
            //$ulToobar.append(this.aFind.getListItm());

            $spnAdvSearch.append(this.aFind.getListItm());

            // Mohit - Shortcut as title.
            ////2.Navigation sub-tollbar
            this.aPrevious = this.addActions(this.ACTION_NAME_PREV, null, true, true, true, onAction, null, "Shct_PrevRec");
            this.aFirst = this.addActions(this.ACTION_NAME_FIRST, null, true, true, true, onAction, null, "Shct_FirstRec");
            this.aLast = this.addActions(this.ACTION_NAME_LAST, null, true, true, true, onAction, null, "Shct_LastRec");
            this.aNext = this.addActions(this.ACTION_NAME_NEXT, null, true, true, true, onAction, null, "Shct_NextRec");
            this.aMulti = this.addActions("Multi", null, false, true, true, onAction, false, "Shct_MultiRow", "Multix");
            this.aSingle = this.addActions("Single", null, false, true, true, onAction, false, "Shct_MultiRow", "Multi");
            this.aCard = this.addActions("Card", null, false, true, true, onAction, false, "Shct_CardView", "card-o");

            this.aMap = this.addActions("Map", null, false, true, true, onAction);

            $ulNav
                //.append(this.aFirst.getListItm())
                .append(this.aPrevious.getListItm())
                .append(this.aNext.getListItm())
            //.append(this.aLast.getListItm());
            $ulNav.append(this.aMulti.getListItm());
            $ulNav.append(this.aSingle.getListItm());
            $ulNav.append(this.aCard.getListItm());
            $ulNav.append(this.aMap.getListItm().hide());

            // Mohit - Shortcut as title.
            ///3. bottom toolbar 
            this.aPageUp = this.addActions(this.ACTION_NAME_PAGEUP, null, true, true, true, onAction, null, "Shct_PageUp");
            this.aPageFirst = this.addActions("PageFirst", null, true, true, true, onAction, null, "Shct_PageFirst");
            this.aPageLast = this.addActions("PageLast", null, true, true, true, onAction, null, "Shct_PageLast");
            this.aPageDown = this.addActions(this.ACTION_NAME_PAGEDOWN, null, true, true, true, onAction, null, "Shct_PageDown");

            //Action Bar[] 

            var mWindow = this.gridWindow;
            actionItemCount_Right = 0;

            if (!mWindow.getIsHideActionbar()) {
                //hide action bat toggle 
                $btnlbToggle.show();
                $divRightbar.show();
            }

            this.aBatchUpdate = this.addActions("BUE", null, false, false, false, onAction); //1
            if (VIS.Env.getCtx().getContext('#ENABLE_BATCHUPDATE') === 'Y' && this.ctx.getAD_User_ID() == 100) {
                this.aBatchUpdate.setTextDirection("r");
                $ulactionbar.append(this.aBatchUpdate.getListItmIT());
            }
            if (mWindow.getIsAppointment()) {
                this.aAppointment = this.addActions("APT", null, false, false, false, onAction); //1
                this.aAppointment.setTextDirection("r");
                $ulactionbar.append(this.aAppointment.getListItmIT());
            }
            if (mWindow.getIsTask()) {
                this.aTask = this.addActions("TAK", null, false, false, false, onAction); //1
                this.aTask.setTextDirection("r");
                $ulactionbar.append(this.aTask.getListItmIT());
            }
            if (mWindow.getIsEmail()) {
                this.aEmail = this.addActions("EML", null, false, false, false, onAction); //1
                this.aEmail.setTextDirection("r");
                $ulactionbar.append(this.aEmail.getListItmIT());
            }
            if (mWindow.getIsLetter()) {
                this.aLetter = this.addActions("LER", null, false, false, false, onAction); //1
                this.aLetter.setTextDirection("r");
                $ulactionbar.append(this.aLetter.getListItmIT());
            }
            if (mWindow.getIsSms()) {
                this.aSms = this.addActions("SMS", null, false, false, false, onAction); //1
                this.aSms.setTextDirection("r");
                $ulactionbar.append(this.aSms.getListItmIT());
            }
            if (mWindow.getIsFaxEmail()) {
                this.aFaxEmail = this.addActions("FaxEmail", null, false, false, false, onAction); //1
                this.aFaxEmail.setTextDirection("r");
                $ulactionbar.append(this.aFaxEmail.getListItmIT());
            }
            //add
            if (mWindow.getIsChat()) {
                this.aChat = this.addActions(this.ACTION_NAME_CHAT, null, false, false, false, onAction, true);  //1
                this.aChat.setTextDirection("r");
                $ulactionbar.append(this.aChat.getListItmIT());
            }
            if (mWindow.getIsAttachment()) {
                this.aAttachment = this.addActions("ATT", null, false, false, false, onAction, true); //1
                this.aAttachment.setTextDirection("r");
                $ulactionbar.append(this.aAttachment.getListItmIT());
            }
            if (mWindow.getIsHistory()) {
                this.aHistory = this.addActions("HIY", null, false, false, false, onAction); //1
                this.aHistory.setTextDirection("r");
                $ulactionbar.append(this.aHistory.getListItmIT());
            }
            if (mWindow.getIsCheckRequest()) {
                this.aRequest = this.addActions("CRT", null, true, false, false, onAction);
                this.aRequest.setTextDirection("r");
                $ulactionbar.append(this.aRequest.getListItmIT());
            }
            if (VIS.AEnv.getIsWorkflowProcess()) {
                this.aWorkflow = this.addActions("Workflow", null, true, false, false, onAction);
                this.aWorkflow.setTextDirection("r");
                $ulactionbar.append(this.aWorkflow.getListItmIT());
            }
            if (mWindow.getIsCopyReocrd()) {
                this.aCopy = this.addActions("CRD", null, false, false, false, onAction);
                this.aCopy.setTextDirection("r");
                $ulactionbar.append(this.aCopy.getListItmIT());
            }
            if (mWindow.getIsSubscribedRecord()) {
                this.aSubscribe = this.addActions("SRD", null, true, false, false, onAction, true);
                this.aSubscribe.setTextDirection("r");
                $ulactionbar.append(this.aSubscribe.getListItmIT());
            }
            if (mWindow.getIsZoomAcross()) {
                this.aZoomAcross = this.addActions("ZAS", null, true, false, false, onAction);
                this.aZoomAcross.setTextDirection("r");
                $ulactionbar.append(this.aZoomAcross.getListItmIT());
            }
            // VIS0008 Check applied if access is there for DMS form to this Role then only display these actions for the window
            if (VIS.MRole.getFormAccess(this.ctx.getContextAsInt("DMS_Form_ID"))) {
                if (mWindow.getIsCreatedDocument()) {
                    this.aCreateDocument = this.addActions("CDT", null, false, false, false, onAction); //1
                    this.aCreateDocument.setTextDirection("r");
                    $ulactionbar.append(this.aCreateDocument.getListItmIT());
                }
                if (mWindow.getIsUploadedDocument()) {
                    this.aUploadDocument = this.addActions("UDT", null, false, false, false, onAction); //1
                    this.aUploadDocument.setTextDirection("r");
                    $ulactionbar.append(this.aUploadDocument.getListItmIT());
                }
                if (mWindow.getIsViewDocument()) {
                    this.aViewDocument = this.addActions("VDT", null, false, false, false, onAction, true); //1
                    this.aViewDocument.setTextDirection("r");
                    $ulactionbar.append(this.aViewDocument.getListItmIT());
                }
                if (mWindow.getIsAttachDocumentFrom()) {
                    this.aAttachFrom = this.addActions("ADF", null, false, false, false, onAction, true); //1
                    this.aAttachFrom.setTextDirection("r");
                    $ulactionbar.append(this.aAttachFrom.getListItmIT());
                }
                //Added by Anil Kumar as Discussed with Vinay Bhatt
                if (mWindow.getIsGenerateAttachmentCode()) {
                    this.aGenerateAttachmentCode = this.addActions("CAC", null, false, false, false, onAction); //1
                    this.aGenerateAttachmentCode.setTextDirection("r");
                    $ulactionbar.append(this.aGenerateAttachmentCode.getListItmIT());
                }
            }
            if (mWindow.getIsMarkToExport()) {
                this.aMarkToExport = this.addActions("MTE", null, false, false, false, onAction, true); //1
                this.aMarkToExport.setTextDirection("r");
                $ulactionbar.append(this.aMarkToExport.getListItmIT());
            }

            if (mWindow.getIsImportMap()) {
                this.aImportMap = this.addActions("IMP", null, false, false, false, onAction); //1
                this.aImportMap.setTextDirection("r");
                $ulactionbar.append(this.aImportMap.getListItmIT());
            }

            if (mWindow.getIsArchive()) {
                //this.aArchive = this.addActions("Archive", null, false, false, false, onAction); //1
                //$ulactionbar.append(this.aArchive.getListItmIT());
            }
            if (mWindow.getIsAttachmail()) {
                //this.aEmailAttach = this.addActions("EmailAttach", null, false, false, false, onAction); //1
                //$ulactionbar.append(this.aEmailAttach.getListItmIT());
            }
            if (mWindow.getIsRoleCenterView()) {
                //this.aRoleCenterView = this.addActions("RoleCenterView", null, false, false, false, onAction); //1
                //$ulactionbar.append(this.aRoleCenterView.getListItmIT());
            }

            if (this.isPersonalLock) {
                this.aLock = this.addActions("Lock", null, true, false, false, onAction, true);
                this.aLock.setTextDirection("r");
                $ulactionbar.append(this.aLock.getListItmIT());
                this.aRecAccess = this.addActions("RecordAccess", null, true, false, false, onAction, true);
                this.aRecAccess.setTextDirection("r");
                $ulactionbar.append(this.aRecAccess.getListItmIT());
            }

            if (this.isShowSharedRecord && mWindow.getWindowType() == 'M') {
                this.aSharedRecord = this.addActions(this.ACTION_NAME_SHAREDREC, null, true, false, false, onAction, true);
                this.aSharedRecord.setTextDirection("r");
                $ulactionbar.append(this.aSharedRecord.getListItmIT());
            }
            else {
                this.isShowSharedRecord = false;
            }


            this.aPreference = this.addActions("Preference", null, false, false, true, onAction); //2
            /////5 Right bar
            if (VIS.MRole.getDefault().getIsShowPreference()) {

                $ulRightBar2.append(this.aPreference.getListItmIT());
            }

            this.aHelp = this.addActions("Help", null, true, false, true, onAction);
            $ulRightBar2.append(this.aHelp.getListItmIT());

            this.aCardDialog = this.addActions("CardDialog", null, true, false, true, onAction);
            $ulRightBar2.append(this.aCardDialog.getListItmIT());

            this.aShowSummaryLevel = this.addActions("ShowSummaryNodes", null, true, false, true, onAction, true);
            $ulRightBar2.append(this.aShowSummaryLevel.getListItmIT());

            mWindow = null;

            //this.statusBar.setPageItem(this.aPageFirst.getListItm());
            this.statusBar.setPageItem(this.aPageUp.getListItm());
            this.statusBar.setComboPage();
            this.statusBar.setPageItem(this.aPageDown.getListItm());
            //this.statusBar.setPageItem(this.aPageLast.getListItm());
            this.statusBar.render();
            this.toolbarCreated = true;

            this.setRightBarVisibility = function (hide) {
                if (hide)
                    $($ulRightBar2.parent()[0]).removeClass('show');
                //else
                //    $ulRightBar2.parent().addclass('show')
            };
            /* Set Tool Bar */
            finishLayout();
        };

        this.setDynamicActions = function () {
            if (this.curGC == null)
                return;
            $uldynactionbar.css('display', 'none');
            var index = 0;
            var actions = [];
            if (this.curGC.leftPaneLinkItems.length > 0) {
                actions = this.curGC.leftPaneLinkItems;
                for (index = 0; index < actions.length; index++) {
                    $uldynactionbar.append(actions[index].getControl());
                }
            }
            index = 0;
            if (this.curGC.rightPaneLinkItems.length > 0) {
                actions = this.curGC.rightPaneLinkItems;
                for (index = 0; index < actions.length; index++) {
                    $uldynactionbar.append(actions[index].getControl());
                }
            }
            if (this.curGC.leftPaneLinkItems.length > 0 || this.curGC.rightPaneLinkItems.length > 0) {
                $uldynactionbar.css('display', 'flex');
                this.updateLabelVisbility();
            }

            actions = null;
        };

        //privilized function
        this.getRoot = function () {
            return $root;
        };

        this.getLayout = function () {
            return $divContentArea;
        };

        this.getIncludedEmptyArea = function () {
            return $divIncludeTab;
        };
        /*left bar */

        this.getParentDetailPane = function () {
            return $hdrPanel;
        };

        this.getFilterPane = function () {
            return $fltrPnlBody;
        };

        /**Clear search box
         * */
        this.clearSearchBox = function () {
            $btnClrSearch.css("visibility", "hidden");
            self.defaultSearch = true;
            self.clearSearchText();
            $txtSearch.val("");
            $txtSearch.removeAttr('readonly');
        }

        /**
        *   Show OR hide tab panel depending on, if linked tab panel or not
        *   @param {boolean} show - show tab panel if true
        */
        this.showTabPanel = function (show) {
            var clsName = 'vis-ad-w-p-center-flow-';
            var cls2 = "vis-ad-w-p-actionpanel-";
            if (show) {
                var tpalign = this.curTab.getIsTPBottomAligned();// && !this.showMultiViewOnly; //only multiview
                clsSuffix = tpalign ? 'b' : 'r';
                var clsSuffixOld = tpalign ? 'r' : 'b';

                if (!$tabPanel.hasClass(cls2 + clsSuffix)) {
                    $tabPanel.removeClass();
                    $tabPanel.addClass(cls2 + clsSuffix);
                }
                if (!$tabPanel.parent().hasClass(cls2 + clsSuffix)) {
                    $tabPanel.parent().removeClass(clsName + clsSuffixOld).addClass(
                        clsName + clsSuffix);
                }
                if (this.curGC) {
                    $tabPanel.append(this.curGC.getTabPanel());
                    if (this.curTab.getIsShowBothTP()) {
                        $divReserveTabPanel.append(this.curGC.getSpecialTabPanel());
                        $divReserveTabPanel.css({ "display": "grid" });
                    }
                }
                $tabPanel.css({ "display": "grid" });
                if (this.curGC) {
                    this.curGC.onSizeChanged(true);
                    if (this.curTab.getRecord_ID() > -1) {
                        this.curGC.refreshTabPanelData(this.curTab.getRecord_ID(), 'R');
                    }
                }


            }
            else {
                $tabPanel.css({ "display": "none" });
                $tabPanel.parent().removeClass(clsName + 'b').removeClass(
                    clsName + 'r').addClass(clsName + 'r');
                $divReserveTabPanel.css({ "display": "none" });
            }
        };

        this.showFilterPanel = function (back) {
            //$fltrPanel.empty();
            if (this.curGC) {
                $fltrPnlBody.append(this.curGC.getFilterPanel());
                this.curGC.initFilterUI();
                if (!back) {
                    this.curGC.refreshFilterPanelData();
                }

            }
            else {
                $fltrPanel.hide();
            }
        };

        this.setTabPanelclass = function (clss) {

        };

        this.isHideFilterIcon = function (hide) {
            if (hide) {
                $btnFilter.hide();
            } else {
                $btnFilter.show();
            }
        }



        /* END Set Tab Panel Icons */

        this.getTabControl = function () {
            return $ulTabControl;
        }

        this.getLinkControl = function () {
            return " New Link Control for header Composite";
        }

        ///*tabcontrol */
        this.setTabControl = function (tabs) {
            tabItems = tabs;
            for (var i = 0; i < tabs.length; i++) {
                var li = tabs[i].getListItm();
                tabLIObj[tabItems[i].action] = li;
                $ulTabControl.append(li);
            }
            if ($ulTabControl.width() > $divTabControl.width()) {
                if (!VIS.Application.isMobile)
                    $divTabNav.show();
            }
        };

        this.setTabNavigation = function () {
            if ($ulTabControl.width() > $divTabControl.width()) {
                if (!VIS.Application.isMobile)
                    $divTabNav.show();
            }
            else {
                $divTabNav.hide();
            }
        };

        this.setSelectedTab = function (id) {
            if (this.selectedTab)
                this.selectedTab.removeClass("vis-apanel-tab-selected");
            this.selectedTab = tabLIObj[id];
            this.selectedTab.addClass("vis-apanel-tab-selected");
        };

        this.navigateThroghtShortcut = function (forward) {
            var next = null;
            if (forward) {
                next = $ulTabControl.find('.vis-apanel-tab-selected').nextAll("[style='opacity: 1;']:first");
                if (!next || next.length <= 0) {
                    next = $ulTabControl.children().first();
                }
            }
            else {
                next = $ulTabControl.find('.vis-apanel-tab-selected').prevAll("[style='opacity: 1;']:first");
                if (!next || next.length <= 0) {
                    next = $ulTabControl.children().last();
                }
            }
            //$ulTabControl.find('.vis-apanel-tab-selected').removeClass('vis-apanel-tab-selected');
            //next.addClass('vis-current-nav-window').focus();
            next.trigger('click');
        };

        this.setBusy = function (busy, focus) {
            this.isLocked = busy;
            if (busy) {

                $busyDiv[0].style.visibility = 'visible';// .show();
            }
            else {
                //$busyDiv.hide();
                $busyDiv[0].style.visibility = 'hidden';
                if (focus) {
                    //void 0;
                }
            }
        };

        this.startFilterPanel = function (hide) {

            if (typeof hide == "undefined") {
                hide = true;
            }

            if (!hide) {
                $fltrPanel.show();
                this.refresh();
            }
            else {
                $fltrPanel.hide();
                this.refresh();
            }

            this.curTab.isFPManualHide = hide;
        };

        this.getTabSuffix = function () {
            return clsSuffix;
        }

        /**
         * Handle Landing page hide/show and manage event
         * @param {any} show
         * @param {any} actionParams
         */
        this.showLandingPage = function (show, actionParams) {
            if (show) {
                this.cmd_ignore();
                this.landingPage.getRoot().show();
                this.vTabbedPane.restoreTabChange(null);
                //this.curTabIndex = 0;
                this.getRoot().hide();
            } else {
                this.landingPage.getRoot().hide();
                this.getRoot().show();
                //tab selection
                if (actionParams && actionParams.TabIndex) {
                    this.vTabbedPane.restoreTabChange(this.vTabbedPane.getSelectedOldIndex());
                    this.tabActionPerformed(this.vTabbedPane.getNextTabId(actionParams.TabIndex), "", "", actionParams);
                }
                else {
                    this.actionParams = {};
                    if (!this.isFromSearch) {
                        this.isFromSearch = false;
                    }
                    this.cmd_find('');
                }
                //this.setTabNavigation();
                this.refresh();
            }
        }

        $btnFilter.on("click", function (e) {
            self.startFilterPanel(false);
        });

        $btnFPClose.on("click", function (e) {
            self.startFilterPanel(true);
        });

        $divTabNav.on("click", function (e) {
            e.stopPropagation();
            var dir = $(e.target).data('dir');
            if (!dir) return;

            var dWidth = $divTabControl.width();
            var ulWidth = $ulTabControl.width();
            var cPos = $divTabControl.scrollLeft();
            var offSet = Math.ceil(dWidth / 2);
            //console.log(dWidth + "--" + ulWidth + '---' + cPos);
            var s = 0;
            if (VIS.Application.isRTL) {
                if (dir == 'r') {
                    dir = 'b';
                }
                else if (dir == 'rl') {
                    dir = 'bf';
                }
                else if (dir == 'bf') {
                    dir = 'rl';
                }
                else if (dir == 'b') {
                    dir = 'r';
                }
            }
            if (dir == 'r') {

                if ((cPos + offSet) >= ulWidth - offSet && !VIS.Application.isRTL)
                    return;
                var ms = ulWidth - dWidth;
                s = cPos + offSet;
                $divTabControl.animate({ scrollLeft: s > ms ? ms : s }, 1000);
            }
            else if (dir == 'b') {
                if (VIS.Application.isRTL) {
                    s = (cPos - offSet);
                    $divTabControl.animate({ scrollLeft: s > 0 ? 0 : s }, 1000);
                }
                else {
                    if (cPos == 0)
                        return;
                    s = (cPos - offSet);
                    $divTabControl.animate({ scrollLeft: s < 0 ? 0 : s }, 1000);
                    //$divTabControl.scrollLeft(cPos - offSet);
                }
            }
            if (dir == 'rl') {
                if ((cPos + offSet) >= ulWidth - offSet)
                    return;
                if (VIS.Application.isRTL) {
                    $divTabControl.animate({ scrollLeft: 0 }, 500);
                }
                else {
                    var ms = ulWidth - dWidth;
                    //s = cPos + offSet;
                    $divTabControl.animate({ scrollLeft: ms }, 500);
                }
            }
            else if (dir == 'bf') {
                if (VIS.Application.isRTL) {
                    var ms = ulWidth - dWidth;
                    //s = cPos + offSet;
                    $divTabControl.animate({ scrollLeft: -ms }, 500);
                }
                else {
                    if (cPos == 0)
                        return;
                    s = (cPos - offSet);
                    $divTabControl.animate({ scrollLeft: 0 }, 500);
                    //$divTabControl.scrollLeft(cPos - offSet);
                }
            }

        });

        $divlbNav.on("click", function (e) {
            e.stopPropagation();
            var dir = $(e.target).data('dir');
            if (!dir) return;

            var dHeight = $divlbMain.height();
            var ulheight = $ulactionbar.height() + $uldynactionbar.height();
            var cPos = $divlbMain.scrollTop();
            var offSet = Math.ceil(dHeight / 2);
            var s = 0;
            if (dir == 'd') {
                if ((cPos + offSet) >= ulheight - offSet)
                    return;
                var ms = ulheight - dHeight;
                s = cPos + offSet;
                $divlbMain.animate({ scrollTop: s > ms ? ms : s }, 1000);
            }
            else if (dir == 'u') {
                if (cPos == 0)
                    return;
                s = (cPos - offSet);
                $divlbMain.animate({ scrollTop: s < 0 ? 0 : s }, 1000);
            }
        });

        //Search
        $imgSearch.on(VIS.Events.onTouchStartOrClick, function (e) {

            if (self.curTab.userQueryID > 0) {
                self.curGC.aFilterPanel.fireValChanged();
            } else {
                self.isFromSearch = true;
                self.cmd_find($txtSearch.val());

                //self.curTab.searchText = "";
                //self.clearSearchText();
                //$txtSearch.val("");
            }

            e.stopPropagation();
        });

        if (!VIS.Application.isMobile) {
            $txtSearch.on("keyup", function (e) {
                self.setAdvanceWhere("");
                self.setFilterWhere("");
                self.setAdvanceFlag(false);
                self.setFilterFlag(false);
                var code = e.charCode || e.keyCode;
                if (code == 13) {
                    if (!self.defaultSearch) {
                        return;
                    }
                    self.isFromSearch = true;

                    self.cmd_find($txtSearch.val());
                    // $txtSearch.val("");

                    $txtSearch.removeAttr('readonly');
                }
                else if (code == 8 && $btnClrSearch.css('visibility') == 'visible') {
                    e.preventDefault();
                    self.defaultSearch = true;
                    $txtSearch.val("");
                    $txtSearch.removeAttr('readonly');
                    $btnClrSearch.css('visibility', 'hidden');
                    var query = new VIS.Query();
                    query.addRestriction(" 1 = 1 ");
                    self.findRecords(query);
                }
            });
        }

        $imgdownSearch.on("click", function () {
            if (!self.isAutoCompleteOpen) {
                $imgdownSearch.css("transform", "rotate(180deg)");
                self.refreshSavedASearchList(true);
            }
            else {
                $imgdownSearch.css("transform", "rotate(360deg)");
            }
        });

        $btnClrSearch.on("click", function () {
            self.removeSearchOnDelete();
        });

        this.removeSearchOnDelete = function () {
            $btnClrSearch.css("visibility", "hidden");
            self.defaultSearch = true;
            //self.curTab.searchText = "";
            self.clearSearchText();
            $txtSearch.val("");
            //var query = new VIS.Query();
            ////query.addRestriction(" 1 = 1 ");
            //self.findRecords(query);
            //self.findRecords(query);
            $imgdownSearch.css("transform", "rotate(360deg)");
            self.curTab.searchCode = "";
            self.curTab.searchText = "";
            self.curTab.userQueryID = 0;
            $txtSearch.removeAttr('readonly');
            self.curGC.aFilterPanel.removeAdvance();
        };

        this.setAdvancedSerachText = function (hideicon, text) {
            if (hideicon) {
                $btnClrSearch.css("visibility", "hidden");
                $txtSearch.removeAttr("readonly");
            }
            else {
                $btnClrSearch.css("visibility", "visible");
                $txtSearch.attr('readonly', 'readonly');
                $imgdownSearch.css("visibility", "visible");
            }
            $txtSearch.val(text);

        };

        this.toggleASearchIcons = function (show, hasDefault) {
            if (show && hasDefault) {
                $btnClrSearch.css('visibility', 'visible');
                $imgdownSearch.css('visibility', 'visible');
                $txtSearch.attr('readonly', 'readonly');
            }
            else if (show && !hasDefault) {
                $btnClrSearch.css('visibility', 'hidden');
                $txtSearch.removeAttr("readonly");
                $imgdownSearch.css('visibility', 'visible');
            }
            else {
                $btnClrSearch.css('visibility', 'hidden');
                $txtSearch.removeAttr("readonly");
                $imgdownSearch.css('visibility', 'visible');
            }

        };

        this.setSearchFocus = function (focus) {
            if (focus) {
                $txtSearch.focus();
            }
            else {
                $txtSearch.trigger('focusout');
            }
        };

        this.refreshSavedASearchList = function (showData, text) {
            var sqlUserSearch = "VIS_116";
            var param = [];
            param[0] = new VIS.DB.SqlParam("@AD_Tab_ID", self.curTab.getAD_Tab_ID());
            param[1] = new VIS.DB.SqlParam("@AD_User_ID", parseInt(self.ctx.getAD_User_ID()));
            param[2] = new VIS.DB.SqlParam("@AD_Tab_ID1", self.curTab.getAD_Tab_ID());
            param[3] = new VIS.DB.SqlParam("@AD_User_ID1", parseInt(self.ctx.getAD_User_ID()));
            param[4] = new VIS.DB.SqlParam("@AD_Client_ID", parseInt(self.ctx.getAD_Client_ID()));
            param[5] = new VIS.DB.SqlParam("@AD_Tab_ID2", self.curTab.getAD_Tab_ID());
            param[6] = new VIS.DB.SqlParam("@AD_Table_ID", self.curTab.getAD_Table_ID());

            var $selfpanel = this;
            executeDataSet(sqlUserSearch, param, function (data) {
                var userQueries = [];

                if (data && data.tables[0].rows && data.tables[0].rows.length > 0) {

                    //$($txtSearch[1]).css("display", "inherit");
                    $imgdownSearch.css('visibility', 'visible');
                    /* userQueries.push({ 'label': VIS.Msg.getMsg("All"), 'value': VIS.Msg.getMsg("All"), 'code': VIS.Msg.getMsg("All") });*/
                    var hasDefaultSearch = false;
                    for (var i = 0; i < data.tables[0].rows.length; i++) {

                        if (data.tables[0].rows[i].cells["ad_defaultuserquery_id"] > 0) {
                            userQueries.push({ 'title': data.tables[0].rows[i].cells["title"], 'label': data.tables[0].rows[i].cells["name"], 'value': data.tables[0].rows[i].cells["name"], 'code': data.tables[0].rows[i].cells["code"], 'id': data.tables[0].rows[i].cells["ad_userquery_id"], 'defaultids': data.tables[0].rows[i].cells["ad_defaultuserquery_id"], 'userid': data.tables[0].rows[i].cells["ad_defaultuserquery_id"] });
                            hasDefaultSearch = true;
                        }
                        else {
                            userQueries.push({ 'title': data.tables[0].rows[i].cells["title"], 'label': data.tables[0].rows[i].cells["name"], 'value': data.tables[0].rows[i].cells["name"], 'code': data.tables[0].rows[i].cells["code"], 'id': data.tables[0].rows[i].cells["ad_userquery_id"] });
                        }
                    }
                }
                else {
                    $imgdownSearch.css("transform", "rotate(360deg)");
                    $selfpanel.toggleASearchIcons(false, false);
                }

                if (!text) {
                    text = $txtSearch.val();
                }

                if (text && text.length > 0) {

                    if (text.length > 25) {
                        $txtSearch.val(text.substr(0, 25) + '...');
                    }
                    else {
                        $txtSearch.val(text);
                    }
                    $btnClrSearch.css('visibility', 'visible');
                    $txtSearch.attr("readonly", "readonly");
                    $selfpanel.defaultSearch = false;
                }
                else {
                    $btnClrSearch.css('visibility', 'hidden');
                    $txtSearch.removeAttr("readonly");
                }

                $txtSearch.autocomplete('option', 'source', userQueries);
                if (showData) {
                    $txtSearch.autocomplete("search", "");
                    $txtSearch.trigger("focus");
                }
            })
        };

        this.findRecords = function (query) {

            var onlyCurrentDays = 0;
            var created = false;

            this.curTab.getTableModel().setCurrentPage(1);

            if (this.isSummaryVisible) {
                this.curTab.setShowSummaryNodes(true);
            }
            else {
                this.curTab.setShowSummaryNodes(false);
            }

            this.curGC.skipRowInserting(true); // do - not insert row 
            if (!query)
                query = new VIS.Query();
            //if (query != null && query.getIsActive()) {
            this.curGC.applyFilters(query);
            //, this.curGC.treeNodeID, this.treeID
            //}
            //else {
            //    //var maxRows = VIS.MRole.getMaxQueryRecords();
            //    var maxRows = 0;
            //    //log.config("OnlyCurrentDays=" + onlyCurrentDays + ", MaxRows=" + maxRows);
            //    this.curTab.setQuery(null);	//	reset previous queries
            //    this.curGC.query(onlyCurrentDays, maxRows, created);   //  autoSize
            //}
        };

        this.setTitle = function (title) {
            $spnTitle.text(title);
        };


        /**
         * If window don't have any record, then show instruction for new record
         * @param {any} highlight
         */
        this.highlightButton = function (highlight, button) {
            var $bLi = button.$li;
            var $root = this.getRoot();


            if (button.getAction() == this.ACTION_NAME_NEW) {

                if (!highlight || $txtSearch.val().length > 0) {
                    this.instructionPop[this.ACTION_NAME_NEW] = true;
                }


                if (this.instructionPop[this.ACTION_NAME_NEW]) {
                    if ($root.find('.vis-window-instruc-overlay-new').length > 0) {
                        $root.find('.vis-window-instruc-overlay-new').remove();
                        $bLi.removeClass('vis-window-instruc-overlay-new-li');
                    }
                    return;
                }
                if ($root.find('.vis-window-instruc-overlay-new').length <= 0) {
                    $root.prepend('<div class="vis-window-instruc-overlay-new"><div class="vis-window-instruc-overlay-new-inn">'
                        + '<p>' + VIS.Msg.getMsg('CreateNewRec') + '</p></div></div>');

                    $bLi.addClass('vis-window-instruc-overlay-new-li');
                    this.instructionPop[this.ACTION_NAME_NEW] = true;
                }
            }
        };

        //End

        $btnClose.on('click', function (e) {
            self.$parentWindow.dispose(); //dispose
        });

        /* left bar toggle */
        this.updateLabelVisbility = function () {
            var w = parseInt($divlbMain.width());

            if (w > 50) {
                $ulactionbar.find('span').show();
                $uldynactionbar.find('span').show();
            }
            else {
                $ulactionbar.find('span').hide();
                $uldynactionbar.find('span').hide();
            }

        };

        $btnlbToggle.on(VIS.Events.onTouchStartOrClick, function (e) {
            e.stopPropagation();
            e.preventDefault();
            var w = parseInt($divlbMain.width());

            if (w > 50) {
                $ulactionbar.find('span').hide();
                $uldynactionbar.find('span').hide();
            }
            else
                $divlbMain.css({ "position": "absolute" });

            $divlbMain.animate({
                "width": w > 50 ? "30" : "220",
            }, 300, 'swing', function () {

                if (w < 50) {
                    $ulactionbar.find('span').show();
                    $uldynactionbar.find('span').show();
                }
                else {
                    $divlbMain.css({ "position": "" });
                    $divlbMain.css({ "width": "" });
                }
                if (self.curGC) {
                    self.curGC.multiRowResize();
                }
                //self.setWidth(-1, true);
                self.setTabNavigation();
            });
        });

        this.disposeComponent = function () {

            //Search
            $imgSearch.off(VIS.Events.onTouchStartOrClick);
            $txtSearch.remove();
            $txtSearch = null;

            //left bar
            $btnlbToggle.off(VIS.onTouchStartOrClick);
            $divlbNav.off("click");
            $divTabNav.off("click");

            $root.remove();
            $busyDiv.remove();

            $root = $busyDiv = $divContentArea = $ulNav = $ulToobar = $divStatus = null;
            self = null;
            onAction = null;
            //
            if (this.toolbarCreated) {
                this.aRefresh.dispose();
                this.aDelete.dispose();
                this.aNew.dispose();
                this.aSave.dispose();
                this.aSaveNew.dispose();
                this.aPrevious.dispose();
                this.aFirst.dispose();
                this.aLast.dispose();
                this.aNext.dispose();

                this.aPageUp.dispose();
                this.aPageFirst.dispose();
                this.aPageLast.dispose();
                this.aPageDown.dispose();
                this.aCard.dispose();
                this.aCardDialog.dispose();

                if (this.aShowSummaryLevel) {
                    this.aShowSummaryLevel.dispose();
                }


                if (this.aChat) {
                    this.aChat.dispose();
                }
                if (this.aAppointment) {
                    this.aAppointment.dispose();
                }
                if (this.aBatchUpdate) {
                    this.aBatchUpdate.dispose();
                }
                this.aHelp.dispose();
                if (this.aSubscribe) {
                    this.aSubscribe.dispose();
                }
                if (this.aAttachment) {
                    this.aAttachment.dispose();
                }
                if (this.aHistory) {
                    this.aHistory.dispose();
                }
                if (this.aZoomAcross) {
                    this.aZoomAcross.dispose();
                }
                if (this.aRequest) {
                    this.aRequest.dispose();
                }
                if (this.aMarkToExport) {
                    this.aMarkToExport.dispose();
                }
                if (this.aWorkflow) {
                    this.aWorkflow.dispose();
                }
                if (this.aRecAccess) {
                    this.aRecAccess.dispose();
                }
                if (this.aImportMap) {
                    this.aImportMap.dispose();
                }

                this.aRefresh = this.aDelete = this.aNew = this.aPrevious = this.aFirst = this.aLast = this.aNext = null;
                this.aChat = this.aPageUp = this.aPageFirst = this.aPageLast = this.aPageDown = null;
                this.aHelp = this.aSubscribe = this.aAttachment = null, this.toolbarCreated = null;
                this.aZoomAcross = this.aRequest = this.aMark = this.aWorkflow = this.aHistory = null;
                this.aAppointment = null; this.aBatchUpdate = null; this.aRecAccess = this.aImportMap = this.aCard = this.aCardDialog = this.aShowSummaryLevel = null;
            }

            this.statusBar.dispose();
            this.statusBar.onComboChange = null;
            this.statusBar = null;

            this.getRoot = null;
            this.getLayout = null;
            this.setBusy = null;
            this.createToolBar = null;

            this.$parentWindow = null;
            this.ctx = null;
            //this.tabPages = {};
            this.curGC = null;
            this.curST = null;
            this.curTab = null;
            this.vTabbedPane = null;
            /* current Tab panel */
            this.curWinTab = null;
            /* Tab Index */
            this.curTabIndex = null;
            /* Sort Tab */
            this.firstTabId = null;
            this.masterTabId = null;



            $hdrPanel.remove();
            $hdrPanel = null;
            this.getParentDetailPane = null;
            if (tabItems) {
                for (var i = 0; i < tabItems.length; i++) {
                    tabItems[i].dispose();
                }
            }
            tabItems = null;
            tabLIObj = null;
            $ulTabControl.remove();
        };
    };
    /** Shared action names*/
    APanel.prototype.ACTION_NAME_FIRST = "First";
    APanel.prototype.ACTION_NAME_LAST = "Last";
    APanel.prototype.ACTION_NAME_PREV = "Previous";// "Previous";
    APanel.prototype.ACTION_NAME_NEXT = "Next";// "Next";
    APanel.prototype.ACTION_NAME_PAGEDOWN = "PageDown";// "Previous";
    APanel.prototype.ACTION_NAME_PAGEUP = "PageUp";// "Next";

    APanel.prototype.ACTION_NAME_NEW = "NRD";
    APanel.prototype.ACTION_NAME_SAVE = "SAR";
    APanel.prototype.ACTION_NAME_SAVENEW = "SAN";

    APanel.prototype.ACTION_NAME_DELETE = "DRD";
    APanel.prototype.ACTION_NAME_REFRESH = "RQY";
    APanel.prototype.ACTION_NAME_FIND = "Find";
    APanel.prototype.ACTION_NAME_CHAT = "CHT";
    APanel.prototype.ACTION_NAME_APPOINTMENT = "Appointment";
    APanel.prototype.ACTION_NAME_ARCHIVE = "Archive";
    APanel.prototype.ACTION_NAME_SHAREDREC = "RSD";

    var currentFocusClass = null;
    APanel.prototype.keyDown = function (evt) {
        if (!evt.ctrlKey && evt.altKey && this.curGC) {
            var en = this.aNew.getIsEnabled();
            switch (evt.keyCode) {
                case 78:      //N for ADD
                    if (en)
                        this.actionPerformed(this.aNew.getAction());
                    break;
                case 83:      //S for save
                    //if (!en) {
                    //this.setSearchFocus(true);
                    //var selfPanel = this;
                    //window.setTimeout(function () {
                    //selfPanel.actionPerformed(selfPanel.aSave.getAction());
                    this.ShortcutNavigation(this.aSave.getAction());
                    //selfPanel.setSearchFocus(false);
                    //}, 100);
                    //}
                    break;
                case 66:      // B for Back to Multiview
                    if (en) {
                        if (this.aBack.getIsEnabled())
                            this.actionPerformed(this.aBack.getAction());
                    }
                    break;
                case 68:      // D for Delete
                    if (en)
                        this.actionPerformed(this.aDelete.getAction());
                    break;
                case 90:      // Z for undo
                    if (!en)
                        this.actionPerformed(this.aIgnore.getAction());
                    break;
                case 80:      // P for print
                    if (en)
                        this.actionPerformed(this.aPrint.getAction());
                    break;
                case 82:      // R for GridReport
                    if (en)
                        this.actionPerformed(this.aReport.getAction());
                    break;
                case 81:      // Q for Refresh
                    if (en)
                        this.actionPerformed(this.aRefresh.getAction());
                    break;
                case 65:      // A for Advanced Search
                    this.actionPerformed(this.aFind.getAction());
                    break;
                case 70:      // F for Find
                    this.setSearchFocus(true);
                    break;
                case 37:      // Left Arrow for First Record
                    // this.actionPerformed(this.aFirst.getAction());
                    this.ShortcutNavigation(this.aFirst.getAction());
                    break;
                case 39:      // Right Arrow for Last record
                    //this.actionPerformed(this.aLast.getAction());
                    this.ShortcutNavigation(this.aLast.getAction());
                    break;
                case 38:      // ArrowUP for preivious Record

                    this.ShortcutNavigation(this.aPrevious.getAction());
                    break;
                case 40:      // Arrow Down for next record
                    //this.actionPerformed(this.aNext.getAction());
                    this.ShortcutNavigation(this.aNext.getAction());
                    break;
                case 84:      // Arrow Multi/single  Alt+T
                    if (this.curGC && this.curGC.getIsSingleRow()) {
                        this.actionPerformed(this.aMulti.getAction());
                    } else {
                        this.actionPerformed(this.aSingle.getAction());
                    }
                    break;
                case 86:      // Arrow Down for next record
                    this.actionPerformed(this.aCard.getAction());
                    break;
                case 72: //H for Home
                    this.cmd_home()
                    break;
                case 88:      // X for close
                    this.$parentWindow.dispose();
                    break;
                case 79: // O for close
                    this.startFilterPanel(false);
                    break;
                case 33:
                    if (evt.ctrlKey) {
                        if (this.aPageFirst.isEnabled) {
                            //this.actionPerformed(this.aPageFirst.getAction());
                            this.ShortcutNavigation(this.aPageFirst.getAction());
                        }
                        break;
                    }
                    else {
                        if (this.aPageUp.isEnabled) // move to previous Page
                            //this.actionPerformed(this.aPageUp.getAction());
                            this.ShortcutNavigation(this.aPageUp.getAction());
                        break;
                    }
                case 34:
                    if (evt.ctrlKey) {
                        if (this.aPageLast.isEnabled) { // move to Last Page
                            //this.actionPerformed(this.aPageLast.getAction());
                            this.ShortcutNavigation(this.aPageLast.getAction());
                        }
                        break;
                    }
                    else {
                        if (this.aPageDown.isEnabled) { // move to Next Page
                            //this.actionPerformed(this.aPageDown.getAction());
                            this.ShortcutNavigation(this.aPageDown.getAction());
                        }
                        break;
                    }
            }
            evt.preventDefault();
            evt.stopPropagation();
        }
        else if (evt.keyCode == 112) {
            this.actionPerformed(this.aHelp.getAction());
            evt.preventDefault();
            evt.stopPropagation();
        } else if (evt.altKey && evt.keyCode == 33) {
            if (evt.ctrlKey) {
                if (this.aPageFirst.isEnabled) {
                    //this.actionPerformed(this.aPageFirst.getAction());
                    this.ShortcutNavigation(this.aPageFirst.getAction());
                }

            }
            else {
                if (this.aPageUp.isEnabled) // move to previous Page
                    //this.actionPerformed(this.aPageUp.getAction());
                    this.ShortcutNavigation(this.aPageUp.getAction());

            }

        } else if (evt.altKey && evt.keyCode == 34) {

            if (evt.ctrlKey) {
                if (this.aPageLast.isEnabled) { // move to Last Page
                    //this.actionPerformed(this.aPageLast.getAction());
                    this.ShortcutNavigation(this.aPageLast.getAction());
                }
            }
            else {
                if (this.aPageDown.isEnabled) { // move to Next Page
                    //this.actionPerformed(this.aPageDown.getAction());
                    this.ShortcutNavigation(this.aPageDown.getAction());
                }
            }
        } else {
            if (this.vTabbedPane && this.vTabbedPane.keyDown)
                this.vTabbedPane.keyDown(evt);
        }

        if (evt.keyCode === 9) {
            this.compositViewChangeSave(evt);
        }
    }

    APanel.prototype.ShortcutNavigation = function (action) {
        var tis = this;
        var fEle = $(document.activeElement);
        if (fEle && fEle.length > 0)
            fEle.trigger("change");
        window.setTimeout(function () {
            tis.actionPerformed(action);
        }, 200);

    };

    APanel.prototype.sizeChanged = function (height, width) {
        this.setTabNavigation();
        this.vTabbedPane.sizeChanged();
        return;
    };

    APanel.prototype.refresh = function () {
        if (this.curGC) {
            this.curGC.onSizeChanged(true);
        }
        if (this.curTab) {
            this.setUI();
        }
        this.setTabNavigation();
        this.vTabbedPane.refresh();
    };

    APanel.prototype.refreshData = function () {
        var ssel = this;
        window.setTimeout(function () {
            if (ssel.curTab.getAD_Tab_ID() == ssel.firstTabId.split('_')[1]) {
                ssel.curGC.dataRefreshAll();
            }
            else {

                ssel.selectFirstTab(false, function () {
                    ssel.curGC.dataRefreshAll();
                });
            }
            ssel.setBusy(false);
        }, 100);
        this.setBusy(true);
    };

    APanel.prototype.addActions = function (action, parent, disableIcon, imageOnly, isSmall, onAction, toggle, toolTipText, iconName) {
        var obj = { action: action, parent: parent, enableDisable: disableIcon, toggle: toggle, imageOnly: imageOnly, isSmall: isSmall, onAction: onAction, toolTipText: toolTipText };
        if (iconName) {
            obj.iconName = iconName;
        }
        var action = new VIS.AppsAction(obj); //Create Apps Action
        return action;
    };

    //Handle Composite view Change focus Save
    APanel.prototype.compositViewChangeSave = function (e) {
        var $ths = this;
        if ($(e.target).closest('.vis-ad-w-p-center-inctab').length > 0 || $(e.target).closest('.vis-ad-w-p-vc').length > 0) {
            var activeElement = $(document.activeElement);
            setTimeout(function () {
                var newFocusClass = $(document.activeElement).closest('.vis-ad-w-p-center-inctab').length > 0 ? 'vis-ad-w-p-center-inctab' : 'vis-ad-w-p-vc';
                if (!currentFocusClass) {
                    currentFocusClass = newFocusClass;
                }

                if (currentFocusClass !== newFocusClass && currentFocusClass !== '') {

                    if (currentFocusClass == 'vis-ad-w-p-vc') {
                        var lf = $ths.vTabbedPane.contentPane.curTab.getLastFocus();
                        $ths.vTabbedPane.contentPane.curTab.setLastFocus(null);
                        if (lf) {
                            $ths.curTab.setLastFocus(lf);
                        }
                        //$ths.curTab.setLastFocus(activeElement);
                    }
                    //lastFocus.focus();
                    if (currentFocusClass == 'vis-ad-w-p-center-inctab') {
                        var lf = $ths.curTab.getLastFocus();
                        $ths.curTab.setLastFocus(null);
                        $ths = $ths.vTabbedPane.contentPane;
                        if (lf) {
                            $ths.curTab.setLastFocus(lf);
                        }
                        //$ths.curTab.setLastFocus(activeElement);
                        //$ths.lastFocus = activeElement;
                    }

                    if ($ths.curGC != null) {
                        if ($ths.curTab.needSave(true, false)) {   //  do we have real change
                            if ($ths.curTab.needSave(true, true)) {
                                if (VIS.Env.getCtx().isAutoCommit($ths.curWindowNo)) {
                                    if (currentFocusClass == 'vis-ad-w-p-vc') {
                                        var isCheckListRequire = $ths.curGC.IsCheckListRequire();
                                        if (!isCheckListRequire) {
                                            //$ths.lastFocus.focus();
                                            $ths.curTab.getLastFocus().focus();
                                            return false;
                                        }
                                    }
                                    if (!$ths.curTab.dataSave(true)) {	//  there is a problem, so we go back
                                        //$ths.lastFocus.focus();
                                        //$ths.curTab.getLastFocus().focus();
                                        return false;
                                    } else {
                                        $ths.curTab.setLastFocus(activeElement);
                                    }
                                }
                                else {
                                    canExecute = false;
                                    VIS.ADialog.confirm("SaveChanges?", true, $ths.curTab.getCommitWarning(), 'Confirm', function (results) {
                                        if (results) {
                                            if (!$ths.curTab.dataSave(true)) {
                                                //$ths.lastFocus.focus();
                                                //$ths.curTab.getLastFocus().focus();
                                                return false;
                                            } else {
                                                $ths.curTab.setLastFocus(activeElement);
                                            }
                                        }

                                    });
                                }
                            } else {
                                $ths.curTab.setLastFocus(activeElement);
                            }
                        }
                        else {
                            $ths.curTab.setLastFocus(activeElement);
                        }
                    } else {
                        $ths.curTab.setLastFocus(activeElement);
                    }
                } else {
                    $ths.curTab.setLastFocus(activeElement);
                }
                currentFocusClass = newFocusClass;
            }, 100)
        }
    }

    APanel.prototype.showHideViewIcon = function (action) {
        if (this.curTab != null && this.curGC != null) {
            if (this.actionParams.IsHideGridToggle != null) {
                if (this.actionParams.IsHideGridToggle)
                    this.aMulti.hide();
                else this.aMulti.show();
            }
            else if (!this.curTab.getIsHideGridToggle()) {
                this.aMulti.show();


            } else {
                this.aMulti.hide();

            }

            if (this.actionParams.IsHideSingleToggle != null) {
                if (this.actionParams.IsHideSingleToggle)
                    this.aSingle.hide();
                else
                    this.aSingle.show();
            }
            else if (!this.curTab.getIsHideSingleToggle()) {

                this.aSingle.show();

            } else {

                this.aSingle.hide();
            }

            if (this.actionParams.IsHideCardToggle != null) {
                if (this.actionParams.IsHideCardToggle)
                    this.aCard.hide();
                else
                    this.aCard.show();
            }
            else if (!this.curTab.getIsHideCardToggle()) {
                this.aCard.show();
            } else {
                this.aCard.hide();
            }
            action.hide();
        } else {
            this.aMulti.hide();
            this.aSingle.hide();
            this.aCard.hide();
        }


    }

    /** ************************************************************************
     *	Dynamic Panel Initialization -  single window .
     *  <pre>
     *  - Workbench tabPanel    (VTabbedPane)
     *      - Tab               (GridController)
       - Tab           (GridController)
     *  </pre>
     *  tabPanel
     *  @param jsonData  window properties
     *  @param query			if not a Workbench, Zoom Query - additional SQL where clause
     *  @return true if Panel is initialized successfully
     */

    APanel.prototype.initPanel = function (jsonData, query, $parent, goSingleRow, sel, aParams) {

        this.$parentWindow = $parent;
        var gridWindow = new VIS.GridWindow(jsonData, this);
        this.gridWindow = gridWindow; //ref to call dispose
        //this.setWidth(gridWindow.getWindowWidth());
        this.actionParams = aParams || {};

        this.createToolBar(); // Init ToolBar

        var curWindowNo = $parent.getWindowNo();
        var autoNew = this.ctx.isAutoNew();

        var tabs = gridWindow.getTabs(); //Tabs VO

        this.ctx.setAutoCommit(curWindowNo, this.ctx.isAutoCommit());
        this.ctx.setAutoNew(curWindowNo, autoNew);

        //	Set SO/AutoNew for Window
        this.ctx.setIsSOTrx(curWindowNo, gridWindow.getIsSOTrx());
        if (!autoNew && gridWindow.getIsTransaction())
            this.ctx.setAutoNew(curWindowNo, true);

        this.ctx.setContext(curWindowNo, "ScreenName", gridWindow.getName());

        var multiTabview = gridWindow.getIsCompositeView();
        this.showMultiViewOnly = gridWindow.getIsDependentInDetailView(); //new porp
        this.vTabbedPane.init(this, multiTabview);


        /* Select Record */
        if (!query && sel) {
            query = new VIS.Query();
            //	Current row
            var link = tabs[0].getKeyColumnName();
            //	Link for detail records
            if (link.length == 0)
                link = tabs[0].getLinkColumnName();
            if (link.length != 0) {
                if (link.endsWith('_ID'))
                    query.addRestriction(link, VIS.Query.prototype.EQUAL, sel);
                else
                    query.addRestriction(link, VIS.Query.prototype.EQUAL, sel);
            }
        }

        var gTab;
        var tabActions = []; //Tabs Apps Action

        var includedMap = {};

        var setCurrent = false;
        var isCheckCurrentTab = true;
        for (var i = 0; i < tabs.length; i++) {

            var id = curWindowNo + "_" + tabs[i].getAD_Tab_ID(); //uniqueID
            var tObj = { action: id, text: tabs[i].getName(), toolTipText: tabs[i].getDescription(), textOnly: true, iconName: '', isHideTab: tabs[i].getIsHideTabName() };
            if (tabs[i].getTabLevel() > 0) {
                tObj.textOnly = false;
                if (tabs[i].getTabLevel() > 3)
                    tObj.iconName = 'tl-4';
                else
                    tObj.iconName = 'tl-' + tabs[i].getTabLevel();
            }

            tabActions[i] = new VIS.AppsAction(tObj); //Create Apps Action
            if (i == 0) {
                this.masterTabId = id;
            }
            gTab = tabs[i];
            //if (i === 0) {
            //    this.curTab = gTab;
            //    if (query != null) {

            //        gTab.setQuery(query);
            //    }
            //}	//	query on first tab
            //ZoomChildTab
            if (isCheckCurrentTab) {
                if (i === 0 && (query == null || (query.list != null && query.list.length == 0) || (query.list[0].code == -10))) {
                    this.curTab = gTab;
                    this.firstTabId = id;
                    setCurrent = true;
                    isCheckCurrentTab = false;
                    if (query != null) {

                        gTab.setQuery(query);
                    }
                }
                else {
                    //if (i === 0)
                    //    this.curTab = gTab;
                    if (query != null && query.list != null && query.list.length > 0) {
                        if (query.list[0].columnName && gTab.getKeyColumnName().toUpperCase() == query.list[0].columnName.toUpperCase()) {
                            this.firstTabId = id;
                            gTab.setQuery(query);
                            this.curTab = gTab;
                            setCurrent = true;
                            isCheckCurrentTab = false;
                            if (i > 0) {
                                this.setParentsContext(tabs, i);
                            }
                        }
                    }
                }//	query on first tab
            }


            var tabElement = null;
            //        //  GridController
            if (gTab.getIsSortTab())//     .IsSortTab())
            {
                //var st = new VIS.VSortTab(curWindowNo, id);
                var st = new VIS.VSortTab(curWindowNo, gTab.getAD_Table_ID(),
                    gTab.getAD_ColumnSortOrder_ID(), gTab.getAD_ColumnSortYesNo_ID(), gTab.getIsReadOnly(), id);
                st.setTabLevel(gTab.getTabLevel());
                tabElement = st;
                if (i == 0) {
                    firstTabId = id;
                }
            }

            else	//	normal tab
            {
                var gc = new VIS.GridController(true, true, id, multiTabview, this.showMultiViewOnly);
                gc.initGrid(false, curWindowNo, this, gTab);

                //if (i === 0 && !setCurrent) {
                //    if (query != null) {
                //        gTab.setQuery(query);
                //    }
                //}

                //ZoomChildTab

                // set current grid  controller
                if (setCurrent) {
                    //in case of zoom always swir=tch parent tab n single row
                    if (this.vHeaderPanel) {
                        this.switchRow(this.vHeaderPanel.curGC, "Y", true);
                    }
                    this.curGC = gc;
                    setCurrent = false;
                    //in case of zoom always swir=tch parent tab n single row
                }



                // Set first tab as current tab in case not marked aby tab as current tab.
                if (i === 0 && !setCurrent) {
                    this.curTab = gTab;
                    this.curGC = gc;
                    this.firstTabId = id;
                }
                if (i === 0) {
                    if (gTab.getIsHeaderPanel()) {
                        gc.initHeaderPanel(this.getParentDetailPane());
                        this.vHeaderPanel = gc.vHeaderPanel; // set in parent class , so it is accessible in all GC
                    }
                }
                gc.initFilterPanel(curWindowNo, this.getFilterPane());

                tabElement = gc;
                if (i === 0 && goSingleRow) {
                    this.switchRow(gc, "Y", true);
                    //this.showHideViewIcon(this.aSingle);
                    //gc.switchSingleRow();
                }
                //	Store GC if it has a included Tab
                if (gTab.getIncluded_Tab_ID() != 0) {
                    includedMap[gTab.getIncluded_Tab_ID()] = gc;
                }

                if (gTab.getHasPanel()) {
                    gc.initTabPanel(gridWindow.getWindowWidth(), curWindowNo);
                }

                //	Is this tab included?
                if (!multiTabview && !$.isEmptyObject(includedMap)) {
                    var parent = includedMap[gTab.getAD_Tab_ID()];
                    if (parent != null) {
                        var included = parent.includeTab(gc);
                    }
                }
            }	//	normal tab

            this.vTabbedPane.addTab(id, gTab, tabElement, tabActions[i]);

            //TabChange Action Callback
            tabActions[i].onAction = this.onTabChange; //Perform tab Change
        }
        if (isCheckCurrentTab && (query != null && query.list != null && query.list.length > 0)) {
            this.curTab.setQuery(query);
        }

        this.vTabbedPane.setTabControl(tabActions);

        tabActions = null;

        this.ctx.setWindowContext(curWindowNo, "WindowName", jsonData._vo.DisplayName);
        this.ctx.setWindowContext(curWindowNo, "AD_Window_ID", jsonData._vo.AD_Window_ID);
        $parent.setTitle(VIS.Env.getHeader(this.ctx, curWindowNo));
        this.setTitle(VIS.Env.getHeader(this.ctx, curWindowNo));
        $parent.setName(jsonData._vo.DisplayName);
        this.curWindowNo = curWindowNo;
        if (multiTabview) {

            this.getLayout().removeClass('vis-ad-w-p-center-view-height');
            this.getLayout().find('.vis-ad-w-p-vc-editview').css("position", "unset");
            this.getLayout().find('.vis-ad-w-p-center-inctab').css("background", "rgba(var(--v-c-common), 1)");
        }
        jsonData = null;
        $parent = null;

        /**
         * Handle Landing Page
         */
        var busy = $('<div class="vis-ad-w-p-busy"><i style="text-align:center" class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');

        if (gridWindow.getIsLandingPage()) {
            this.getRoot().parent().append(busy);
            //this.getRoot().hide();
            var landingPage = new VIS.VLandingPage(this, curWindowNo);
            this.landingPage = landingPage;
            this.getRoot().parent().append(landingPage.getRoot().hide());
            //$landingpage.show();
            //$windowpage.show();
            this.getRoot().find('.vis-ad-w-p-t-toolbar').css('visibility', 'visible');
        }
        //by pass for zoom query and action parameter
        if (query != null || this.actionParams != null) {
            this.getRoot().show();

        } else if (this.landingPage) {
            this.getRoot().hide();
            this.landingPage.getRoot().show();
        } else {
            this.getRoot().show();
        }
        busy.remove();
        this.getRoot().find('.vis-ad-w-p-tb').removeAttr('style');
        // this.curGC.setVisible(true);
    };

    /**
     * make Include tab Resizable 
     * */
    APanel.prototype.setIncTabReziable = function () {
        var incTab = this.getIncludedEmptyArea();
        var aPanel = this;
        if (!incTab.is('.ui-resizable')) {
            incTab.resizable({
                handles: 'n',
                ghost: true,
                minHeight: 40,
                maxHeight: 500,
                //width: 'auto',

                resize: function (event, ui) {
                    //self.panelWidth = ui.size.width;
                    //incTab.css({ 'position': 'absolute', "left": "", "z-index": "99" });
                    incTab.css('flex-basis', ui.size.height + 'px');
                },
                start: function (event, ui) {
                    // incTab.css({ 'position': 'absolute', "z-index": "99" });
                    //windowWidth=
                },
                stop: function (event, ui) {
                    incTab.css({
                        'flex-basis': ui.size.height + 'px',
                        'top': '',
                        'width': ''
                    });

                    aPanel.refresh();
                }
            });
        }
    };

    /**
     * make Include tab Resizable 
     * */
    APanel.prototype.setIncTabReziable = function () {
        var incTab = this.getIncludedEmptyArea();
        var aPanel = this;
        if (!incTab.is('.ui-resizable')) {
            incTab.resizable({
                handles: 'n',
                ghost: true,
                minHeight: 40,
                maxHeight: 500,
                //width: 'auto',

                resize: function (event, ui) {
                    //self.panelWidth = ui.size.width;
                    //incTab.css({ 'position': 'absolute', "left": "", "z-index": "99" });
                    incTab.css('flex-basis', ui.size.height + 'px');
                },
                start: function (event, ui) {
                    // incTab.css({ 'position': 'absolute', "z-index": "99" });
                    //windowWidth=
                },
                stop: function (event, ui) {
                    incTab.css({
                        'flex-basis': ui.size.height + 'px',
                        'top': '',
                        'width': ''
                    });

                    aPanel.refresh();
                }
            });
        }
    };

    //ZoomChildTab
    // if zoomed to any child tab - find all the parents and set the values in context and set the query on parent tab.
    APanel.prototype.setParentsContext = function (gTabs, index) {
        var parentDict = [];
        var parentRecID = gTabs[index].query.list[0].code;
        for (var i = index - 1; i >= 0; i--) {
            if (gTabs[i].getTabLevel() != gTabs[index].getTabLevel() && gTabs[i].getTabLevel() < gTabs[index].getTabLevel()) {
                parentDict.push({ "TabNo": gTabs[i].getTabNo(), "columnName": gTabs[i].getKeyColumnName(), "childTableKeyColumn": gTabs[index].getKeyColumnName(), "index": i });
                index = i;
            }
        }
        if (parentDict) {

            var windowNo = gTabs[index].getWindowNo();
            for (var i = 0; i < parentDict.length; i++) {
                if (parentRecID) {
                    gTabs[parentDict[i].index].query.addRestriction(parentDict[i].childTableKeyColumn, VIS.Query.prototype.EQUAL, parentRecID);
                    gTabs[parentDict[i].index].setIsZoomAction(true);
                }

                var data = {
                    SelectColumn: parentDict[i].columnName,
                    SelectTable: parentDict[i].childTableKeyColumn.substr(0, parentDict[i].childTableKeyColumn.length - 3),
                    WhereColumn: parentDict[i].childTableKeyColumn,
                    WhereValue: parentRecID
                };

                var parentRecRowID = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetZoomParentRec", data);

                if (parentRecRowID) {
                    VIS.context.setWindowContext(windowNo, parentDict[i].columnName, parentRecRowID.toString());

                    if (i == parentDict.length - 1) {// last one

                        var gTabPrnt = gTabs[parentDict[i].index];

                        var query = new VIS.Query(gTabPrnt.getTableName(), false);
                        query.addRestriction(parentDict[i].columnName + ' = ' + parentRecRowID.toString());
                        gTabPrnt.setQuery(query, true);
                        gTabPrnt.prepareQuery(0, 0, false, false);
                    }
                }
            }
        }
    }

    //Updated by  
    //date:19-01-2016
    //Change/Update for:Zoom from workflow on home page
    APanel.prototype.selectFirstTab = function (isSelect) {
        //this.curGC.isZoomAction = isSelect;
        this.curTab.setIsZoomAction(isSelect);
        setTimeout(function (that) {
            //that.curGC.isZoomAction = isSelect;
            var tid = that.firstTabId;
            if (that.actionParams && that.actionParams.TabIndex) {
                tid = that.vTabbedPane.getNextTabId(that.actionParams.TabIndex)
            }
            that.tabActionPerformed(tid, "", "", that.actionParams);
            that.setTabNavigation();
            that = null;
        }, 10, this);
    };

    /**
     *  Is the UI locked (Internal method)
     *  @return true, if UI is locked
     */
    APanel.prototype.getIsUILocked = function () {
        return this.isLocked;
    }   //  isLoacked

    /**
     *  Lock User Interface.
     *  Called from the Worker before processing
     *  @param pi process info
     */
    APanel.prototype.lockUI = function (pi) {
        //	log.fine("" + pi);
        this.setBusy(true, false);
    };  //  lockUI

    /**
     *  Unlock User Interface.
     *  Called from the Worker when processing is done
     *  @param pi of execute ASync call
     */
    APanel.prototype.unlockUI = function (pi) {
        //	log.fine("" + pi);
        var notPrint = pi != null
            && pi.getAD_Process_ID() != this.curTab.getAD_Process_ID();
        //  Process Result
        if (notPrint)		//	refresh if not print
        {
            if (!pi.getIsError()) {
                if (this.isHdrBtn) { // if headr "docaction" button click on child tab 
                    this.curGC.dataRefreshAll();
                }
                else {
                    //	Refresh data
                    this.curTab.dataRefresh();
                }
            }
            //	Timeout
            if (pi.getIsTimeout())		//	set temporarily to R/O
                VIS.context.setWindowContext(this.curWindowNo, "Processed", "Y");
            this.curGC.dynamicDisplay(-1);
            //	Update Status Line
            this.setStatusLine(pi.getSummary(), pi.getIsError());

            // 1 Change Lokesh Chauhan
            if (pi.customHTML && pi.customHTML != "") {
                this.displayDialog($(pi.customHTML));
            }
            else {
                //	Get Log Info
                VIS.ProcessInfoUtil.setLogFromDB(pi);
                var logInfo = pi.getLogInfo();
                if (logInfo.length > 0) {
                    VIS.ADialog.info(pi.getTitle(), true, logInfo, "");
                    this.setStatusLine(pi.getSummary(), pi.getIsError());
                }
            }
            //ADialog.info(m_curWindowNo, this, Env.getHeader(m_ctx, m_curWindowNo),
            //      pi.getTitle(), logInfo);	//	 clear text
        }
        this.setBusy(false, notPrint);
    };  //  unlockUI

    // 1 Change Lokesh Chauhan
    APanel.prototype.displayDialog = function (message) {
        var chDia = new VIS.ChildDialog();
        chDia.setTitle("");
        var wdth = window.innerWidth - 150;
        var hgt = window.innerHeight - 120;
        var diaCtr = $('<div style="max-height: ' + hgt + 'px; max-width: ' + wdth + 'px; min-width: 150px; min-height: 60px;"></div>');
        diaCtr.append(message);
        chDia.setContent(diaCtr);
        chDia.close = function () {
            chDia.dispose();
        }
        chDia.show();
        chDia.hidebuttons();
    };

    /**
     *	Action Listener
     *  @param action string or object
     *  Controller object called fron header panel
     */
    APanel.prototype.actionPerformed = function (action, controller) {

        if (this.getIsUILocked())
            return;

        if (action.source instanceof VIS.Controls.VButton) {
            var btnField = action.source.getField();
            //exempt window action button, and field Button actions from Readonly state of tab and field
            if (!this.getIsWindowAction(btnField.getAD_Reference_Value_ID()) && !btnField.getIsAction() && (!btnField.getIsEditable(true) || this.curTab.getIsReadOnly())) {
                return;
            }
        }
        //	Do Screenrt w/o busy
        this.setBusy(true);
        var selfPan = this;
        setTimeout(function () {
            //  Command Buttons


            if (action.source instanceof VIS.Controls.VButton) {
                var btnactionName = action.source.getField().vo.DefaultValue;
                if (selfPan.getIsWindowAction(action.source.mField.getAD_Reference_Value_ID()) && selfPan.toolbarActionList.indexOf(btnactionName) > -1) {
                    // handle Toolbar action by Button
                    selfPan.actionPerformedCallback(selfPan, btnactionName);
                    return;
                } else {
                    if (!selfPan.actionButton(action.source, controller)) {
                        selfPan.setBusy(false, true);
                    }

                    if (action.source.mField.getIsAction()) {
                        selfPan.setBusy(false, true);
                    }

                    return;
                }
            }

            selfPan.actionPerformedCallback(selfPan, action);

        }, 10);
    };

    APanel.prototype.setTabstackview = function (action) {
        if (action === "Multi" || action === "Card" || action === "Single") {
            var view = "Y";
            if (action === "Multi") {
                view = "N";
                this.isHideFilterIcon(false);
                this.startFilterPanel(this.curTab.isFPManualHide);
                //if (tis.curGC.getIsSingleRow()) {
                //    view = "N";
                //} else {
                //    view = "Y";
                //}
            } else if (action === "Single") {
                view = "Y";
                var lastFP = this.curTab.isFPManualHide;
                this.startFilterPanel(true);
                this.isHideFilterIcon(true);
                this.curTab.isFPManualHide = lastFP;

            }

            else if (action === "Card") {
                view = "C";
                this.isHideFilterIcon(false);
                this.startFilterPanel(this.curTab.isFPManualHide);
                //if (tis.curGC.getIsCardRow()) {
                //    view = "N";
                //}
                //else {
                //    view = "C";
                //}
            }


            //Maintain stack for view change
            if (this.tabStack.length > 0) {
                var currentTabSeq = this.curWinTab.getSelectedIndex();
                if (currentTabSeq == -1) {
                    currentTabSeq = this.curTabIndex;
                }
                var currentTab = this.tabStack.find(function (tab) {
                    return tab.tabSeq === currentTabSeq;
                });

                if (currentTab && !currentTab.tabView) {
                    currentTab.tabView = [];
                }

                if (currentTab.tabView.includes(view)) {
                    currentTab.tabView = [];
                }
                currentTab.tabView.push(view);
                //}
                this.setBackEnable();
            }
        }
    }

    APanel.prototype.actionPerformedCallback = function (tis, action) {
        /*Handle view change for back button */
        this.setTabstackview(action);

        /*Naviagtion */
        if (tis.aFirst.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigate(0)
        } else if (tis.aPrevious.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigateRelative(-1);
        } else if (tis.aLast.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigate(tis.curTab.getRowCount() - 1);
        } else if (tis.aNext.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigateRelative(+1);
        } else if (tis.aSingle.getAction() === action) {
            //tis.showHideViewIcon(tis.aSingle);
            //tis.curGC.switchSingleRow(true);
            tis.switchRow(tis.curGC, "Y", true);
        }
        else if (tis.aMulti.getAction() === action) {
            //tis.showHideViewIcon(tis.aMulti);
            //tis.curGC.switchMultiRow();
            tis.switchRow(tis.curGC, "N", true);
        } else if (tis.aCard.getAction() === action) {
            //tis.showHideViewIcon(tis.aCard);
            //tis.curGC.switchCardRow();    
            tis.switchRow(tis.curGC, "C", true);

            // tis.aBack.setEnabled(!tis.curGC.getIsCardRow());
        } else if (tis.aMap.getAction() === action) {
            //tis.aMulti.setPressed(true);
            //tis.aCard.setPressed(false);
            tis.curGC.switchMapRow();
        } else if (tis.aHome.getAction() === action) {
            tis.cmd_home();
        } else if (tis.aBack.getAction() === action) {
            tis.cmd_back();
        } else if (tis.aPageUp.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigatePage(-1);
        } else if (tis.aPageFirst.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigatePage(0);
        } else if (tis.aPageDown.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigatePage(1);
        } else if (tis.aPageLast.getAction() === action) {
            tis.isDefaultFocusSet = false;
            tis.curGC.navigatePage('last');
        }
        /*MainToolBar */
        else if (tis.aRefresh.getAction() === action) {
            tis.cmd_refresh();
        }
        else if (tis.aIgnore.getAction() === action) {
            tis.cmd_ignore();
        }
        else if (tis.aSave.getAction() === action) {
            tis.cmd_save(true);
        }
        else if (tis.aSaveNew.getAction() === action) {
            tis.cmd_saveNew(true);
        }
        else if (tis.aNew.getAction() === action) {
            tis.cmd_new(false);
        }
        else if (tis.aCopy && tis.aCopy.getAction() === action) {
            tis.cmd_new(true);
        }
        else if (tis.aDelete.getAction() === action) {
            tis.cmd_delete();
        }
        else if (tis.aFind.getAction() === action) {
            tis.cmd_finddialog();
        }
        else if (tis.aBatchUpdate && tis.aBatchUpdate.getAction() === action) {
            tis.cmd_batchUpdatedialog();
        }
        else if (tis.aChat && tis.aChat.getAction() === action) {
            tis.cmd_chat();
        }
        else if (tis.aAttachment && tis.aAttachment.getAction() === action) {
            tis.cmd_attachment();
        }
        else if (tis.aHistory && tis.aHistory.getAction() == action) {
            tis.cmd_history();
        }
        else if (tis.aPreference.getAction() === action) {
            tis.cmd_preference();
        }
        else if (tis.aHelp.getAction() === action) {
            tis.cmd_help();
        }

        else if (tis.aCardDialog.getAction() === action) {
            tis.cmd_cardDialog();
        }

        else if (tis.aAppointment && tis.aAppointment.getAction() === action) {
            tis.cmd_appointment();
        }
        else if (tis.aTask && tis.aTask.getAction() === action) {
            tis.cmd_task();
        }

        else if (tis.aSubscribe && tis.aSubscribe.getAction() === action) {
            tis.cmd_subscribe();
        }
        else if (tis.aImportMap && tis.aImportMap.getAction() === action) {
            tis.cmd_ImportMap();
        }
        else if (tis.aEmail && tis.aEmail.getAction() === action) {
            tis.cmd_email();
        }
        else if (tis.aLetter && tis.aLetter.getAction() === action) {
            tis.cmd_letter();
        }
        else if (tis.aSms && tis.aSms.getAction() === action) {
            tis.cmd_sms();
        }
        //lakhwinder
        else if (tis.aInfo.getAction() === action) {
            tis.cmd_infoWindow();

        }
        else if (tis.aZoomAcross && tis.aZoomAcross.getAction() === action) {
            tis.cmd_zoomAcross();
        }
        else if (tis.aRequest && tis.aRequest.getAction() === action) {
            tis.cmd_request();
        }
        else if (tis.aReport.getAction() === action) {
            tis.cmd_report();
        }

        else if (tis.isPersonalLock && tis.aLock.getAction() === action)
            tis.cmd_lock();

        else if (tis.isPersonalLock && tis.aRecAccess.getAction() === action) {
            tis.cmd_recAccess();
        }
        else if (tis.isShowSharedRecord && tis.aSharedRecord.getAction() === action) {
            tis.cmd_RecordShared();
        }

        //	Tools
        else if (tis.aWorkflow != null && action === (tis.aWorkflow.getAction())) {

            if (tis.curTab.getRecord_ID() > 0) {
                VIS.AEnv.startWorkflowProcess(tis.curTab.getAD_Table_ID(), tis.curTab.getRecord_ID());
            }


        }

        else if (tis.aPrint.getAction() === action) {
            tis.cmd_print();
        }
        else if (tis.aCreateDocument && tis.aCreateDocument.getAction() === action) {
            actionVADMSDocument(tis, action);

        }
        else if (tis.aUploadDocument && tis.aUploadDocument.getAction() === action) {

            actionVADMSDocument(tis, action);

        }
        else if (tis.aViewDocument && tis.aViewDocument.getAction() === action) {
            actionVADMSDocument(tis, action);
        }
        else if (tis.aAttachFrom && tis.aAttachFrom.getAction() === action) {
            actionVADMSDocument(tis, action);
        }
        else if (tis.aGenerateAttachmentCode && tis.aGenerateAttachmentCode.getAction() === action) {
            actionVADMSDocument(tis, action);
        }
        else if (tis.aMarkToExport && tis.aMarkToExport.getAction() === action) {

            tis.cmd_markToExport();
        }
        else if (tis.aShowSummaryLevel.getAction() == action) {
            tis.ShowSummaryNodes();
        }

        //else if (tis.aCall && tis.aCall.getAction() === action) {
        //    tis.cmd_call();
        //}
        tis.setRightBarVisibility(true);
        tis.setBusy(false);
        tis = null;
    };

    /**
     *	Start Button Process
     *  @param vButton button
     *  @retrun true to hide busy indicator
     */
    APanel.prototype.actionButton = function (vButton, curCtrller) {
        var startWOasking = false;
        var batch = false;
        var dateScheduledStart = null;
        var columnName = vButton.getColumnName();
        var ctx = VIS.context;
        if (!curCtrller)
            curCtrller = this;
        var aPanel = this;
        // self.curWindowNo = this.curWindowNo;


        var curTabNo = 0;
        var AD_Table_ID = 0;
        var Record_ID = 0;

        if (curCtrller.curTab) {
            curTabNo = curCtrller.curTab.getTabNo();
            // resolved issue for zoom from notification button
            AD_Table_ID = ctx.getTabRecordContext(aPanel.curWindowNo, curTabNo, "AD_Table_ID", false);
            Record_ID = ctx.getTabRecordContext(aPanel.curWindowNo, curTabNo, "Record_ID", false);

            //AD_Table_ID = ctx.getContextAsInt(aPanel.curWindowNo, curTabNo, "AD_Table_ID");
            //Record_ID = ctx.getContextAsInt(aPanel.curWindowNo, curTabNo, "Record_ID");
        }
        if (AD_Table_ID < 0)
            AD_Table_ID = ctx.getContextAsInt(aPanel.curWindowNo, "AD_Table_ID");
        if (Record_ID < 0)
            Record_ID = ctx.getContextAsInt(aPanel.curWindowNo, "Record_ID");


        //  Zoom Button
        if (columnName.equals("Record_ID")) {
            VIS.AEnv.zoom(AD_Table_ID, Record_ID);
            return;
        }   //  Zoom

        //  save first	---------------

        var needExecute = true;

        //check action type

        //Undo  and tab change   
        if (vButton.getField().getIsAction() && vButton.getField().getAction() === "MTU") {
            aPanel.cmd_ignore();
            aPanel.tabActionPerformed(aPanel.vTabbedPane.getNextTabId(vButton.getField().getTabSeqNo()), vButton.getField().getAction(), "", vButton.getField().getActionParams());
            needExecute = false;
        }

        else if (curCtrller.curTab.needSave(true, false)) {
            needExecute = false;
            curCtrller.cmd_save(true, function (result) {
                if (result) {
                    aPanel.actionButtonCallBack(vButton, startWOasking, batch, dateScheduledStart, columnName, ctx, curCtrller);
                }
            });
        }


        /**
         *  Start Process ----
         */
        if (needExecute) {
            return aPanel.actionButtonCallBack(vButton, startWOasking, batch, dateScheduledStart, columnName, ctx, curCtrller);
        }


    };

    APanel.prototype.actionButtonCallBack = function (vButton, startWOasking, batch, dateScheduledStart, columnName, ctx, self) {
        var table_ID = self.curTab.getAD_Table_ID();
        //	Record_ID
        var record_ID = self.curTab.getRecord_ID();

        var curTab = self.curTab;
        var curGC = self.curGC;
        var aPanel = this;
        var curWindowNo = this.curWindowNo;
        var mField = vButton.getField();

        //	Record_ID - Language Handling
        if (record_ID == -1 && curTab.getKeyColumnName().equals("AD_Language"))
            record_ID = ctx.getContextAsInt(curWindowNo, "AD_Language_ID");
        //	Record_ID - Change Log ID
        if (record_ID == -1
            && (vButton.getProcess_ID() == 306 || vButton.getProcess_ID() == 307)) {
            var id = curTab.getValue("AD_ChangeLog_ID");
            record_ID = id;
        }
        //	Record_ID - EntityType
        if (record_ID == -1 && curTab.getKeyColumnName().equals("EntityType")) {
            record_ID = curTab.getValue("AD_EntityType_ID");
        }
        //	Ensure it's saved
        if (record_ID == -1 && curTab.getKeyColumnName().toUpperCase().endsWith("_ID")) {
            VIS.ADialog.error("SaveErrorRowNotFound", true, "");
            return;
        }

        /*Special handling
          Move to next tab */
        if (mField.getIsAction()) {
            /* is tab index in range (tab count) */
            if (mField.getTabSeqNo() < this.vTabbedPane.getCount()) {
                this.tabActionPerformed(this.vTabbedPane.getNextTabId(mField.getTabSeqNo()), mField.getAction(),
                    mField.getActionName(), mField.getActionParams());
                return true;
            }
            console.log(" Tab index is greater than total count ");
            return;
        }

        //	Pop up Payment Rules
        if (columnName.equals("PaymentRule")) {
            var vp = new VIS.VPayment(curWindowNo, curTab, vButton);
            vp.show();
            vp.init();
            vp.onClose = function () {

                if (vp.isInitOK()) {
                    curGC.dynamicDisplay(vButton.getName());
                    curGC.cmd_save(false);

                    this.checkAndCallProcess(vButton, table_ID, record_ID, ctx, self, startWOasking, batch);
                }
            };
            return;


        }	//	PaymentRule

        //	Pop up Document Action (Workflow)
        else if (columnName.equals("DocAction")) {
            var vda = new VIS.VDocAction(curWindowNo, curTab, record_ID);
            vda.show();
            vda.onClose = function () {

                //	Something to select from?
                if (vda.getNumberOfOptions() == 0) {
                    vda.dispose();
                    aPanel.log.info("DocAction - No Options");
                    return;
                }
                else {
                    // vda.setVisible(true);
                    if (!vda.isStartProcess()) {
                        vda.dispose();
                        return;
                    }
                    batch = vda.isBatch();
                    //  dateScheduledStart = vda.getDateScheduledStart();
                    startWOasking = true;

                    aPanel.checkAndCallProcess(vButton, table_ID, record_ID, ctx, self, startWOasking, batch);

                    vda.dispose();
                    self = null;
                }


            };
            return;

        }	//	DocAction

        //  Pop up Create From
        else if (columnName.equals("CreateFrom")) {
            //  m_curWindowNo
            // Change by Lokesh Chauhan 18/05/2015
            var chkModule = false;
            if (curTab.getAD_Window_ID() == 341 || curTab.getAD_Window_ID() == 170
                || curTab.getAD_Table_ID() == 323 || curTab.getAD_Table_ID() == 321) {
                if (window.MMPM) {
                    var vvcf = MMPM.Requisition.prototype.create(curTab.getAD_Window_ID(), curTab.getRecord_ID(), curTab.getAD_Table_ID());
                    chkModule = true;
                }
                else if (window.DTD001) {
                    var vvcf = DTD001.Requisition.prototype.create(curTab.getAD_Window_ID(), curTab.getRecord_ID(), curTab.getAD_Table_ID());
                    chkModule = true;
                }
            }
            if (chkModule) {
                return;
            }
            var vcf = VIS.VCreateFrom.prototype.create(curTab);
            if (vcf != null) {
                if (vcf.isInitOK()) {
                    vcf.showDialog();
                    vcf.onClose = function (value) {
                        curTab.dataRefresh();//DataRefreshRow
                        vcf.dispose();
                    vcf = null;
                    };
                }
                else {
                    vcf.dispose();
                    vcf = null;
                }
                return;
            }

            //	else may start process
        }	//	CreateFrom

        else if (columnName.equals("GenerateSticker")) {

            if (window.DTD001) {

                var vvcf = DTD001.StickerProduct.prototype.create(curTab.getAD_Window_ID(), curTab.getRecord_ID());
            }
            return;
        }
        else if (columnName.equals("DTD001_GenerateSticker")) {

            if (window.DTD001) {

                var vvcf = DTD001.MRProductSticker.create(curTab.getAD_Window_ID(), curTab.getRecord_ID(), curTab.getTabLevel());
            }
            return;
        }
        //Lakhwinder
        //requested by Mohit ,Mukesh Arora
        else if (columnName.equals("BGT01_CreateLinePo")) {
            if (window.BGT01) {
                BGT01.CreateLineMovement(curTab.getAD_Window_ID(), curTab.getAD_Tab_ID(), curTab.getRecord_ID());
            }
            return;
        }

        //  Posting -----

        else if (columnName == "Posted" && VIS.MRole.getDefault().getIsShowAcct()) {
            //  Check Doc Status
            var processed = VIS.context.getWindowContext(curWindowNo, "Processed");//
            if (processed != "Y") {
                var docStatus = VIS.context.getWindowContext(curWindowNo, "DocStatus");
                if (this.DocActionVariables.STATUS_COMPLETED == docStatus
                    || this.DocActionVariables.STATUS_CLOSED == docStatus
                    || this.DocActionVariables.STATUS_REVERSED == docStatus
                    || this.DocActionVariables.STATUS_VOIDED == docStatus)
                    ;
                else {
                    //ADialog.error(m_curWindowNo, this, "PostDocNotComplete");
                    VIS.ADialog.info(VIS.Msg.getMsg("PostDocNotComplete"));
                    return;
                }
            }

            //  Check Post Status
            var ps = curTab.getValue("Posted");
            if (ps != null && ps == "Y") {
                //get Current record orgID by window no
                var obj = new VIS.AcctViewer(VIS.context.getAD_Client_ID(), curTab.getAD_Table_ID(), curTab.getRecord_ID(), curWindowNo, curTab.getAD_Window_ID());
                if (obj != null) {
                    aPanel.setBusy(false);
                    obj.showDialog();
                }
                obj = null;
            }
            else {
                //  if (VIS.ADialog.ask("PostImmediate?")) {
                VIS.ADialog.confirm("PostImmediate?", true, "", "Confirm", function (results) {

                    if (results) {

                        aPanel.setBusy(true, true);

                        var force = ps != null && ps != "N";//	force when problems
                        //check for old and new posting logic
                        checkPostingByNewLogic(function (result) {
                            var postingByNewLogic = false;
                            if (result == "Yes") {
                                postingByNewLogic = true;
                            }
                            if (window.FRPT && postingByNewLogic) {
                                var orgID = Number(VIS.context.getWindowTabContext(curWindowNo, 0, "AD_Org_ID"));
                                var winID = curTab.getAD_Window_ID();
                                var docTypeID = Number(VIS.context.getWindowTabContext(curWindowNo, 0, "C_DocType_ID"));
                                var postObj = FRPT.PostingLogic(curWindowNo, curTab.getAD_Table_ID(), curTab.getRecord_ID(), force, orgID, winID, docTypeID, function () {
                                    curGC.dataRefresh();
                                    aPanel.setBusy(false, true);
                                    return;
                                });
                            }
                            else {
                                $.ajax({
                                    url: VIS.Application.contextUrl + "Posting/PostImmediate",
                                    dataType: "json",
                                    data: {
                                        AD_Client_ID: VIS.context.getAD_Client_ID(),
                                        AD_Table_ID: curTab.getAD_Table_ID(),
                                        Record_ID: curTab.getRecord_ID(),
                                        force: force
                                    },
                                    error: function (e) {
                                        aPanel.setBusy(false, true);
                                        VIS.ADialog.info('ERRORGettingPostingServer');
                                        //bsyDiv[0].style.visibility = "hidden";
                                    },
                                    success: function (data) {

                                        if (data.result != "OK") {
                                            aPanel.setBusy(false, true);
                                            VIS.ADialog.info(data.result);
                                        }
                                        else {
                                            aPanel.setBusy(false, true);
                                            curGC.dataRefresh();
                                            //refresh Row
                                        }

                                    }
                                });
                            }
                        });
                    }
                    else {
                        aPanel.setBusy(false, true);
                        return false;
                    }
                });
                //}
                // else return false;
            }
            return false;
        }   //  Posted

        //	Send Email -----
        else if (columnName.equals("SendNewEMail")) {
            // AD_Process_ID = vButton.getProcess_ID();
            //if (AD_Process_ID != 0)
            //{
            //}
            ////	Mail Defaults
            //String title = getTitle();
            //String to = null;
            //Object oo = m_curTab.getValue("AD_User_ID");
            //if (oo instanceof Integer)
            //{
            //    MUser user = new MUser(Env.getCtx (), ((Integer)oo).intValue (), null);
            //    to = user.getEMail();
            //}
            //if (to == null)
            //    to = (String)m_curTab.getValue("EMail");
            //String subject = (String)m_curTab.getValue("Name");;
            //String message = "";
            //new EMailDialog (Env.getFrame(this), title,
            //		MUser.get(Env.getCtx()),
            //		to,	subject, message,
            //		null);
            return;
        }
        else if (columnName.equals("OpenCardDialog")) {

            aPanel.cmd_cardDialog(true);
        }


        if (vButton.AD_Process_ID > 0) {

            var ret = this.checkAndCallProcess(vButton, table_ID, record_ID, ctx, self);
            self = null;
            return ret;
        }
        else if (vButton.AD_Form_ID > 0) {

            if (VIS.MRole.getFormAccess(vButton.AD_Form_ID)) {
                var wForm = new VIS.WForm(VIS.Env.getScreenHeight(), vButton.AD_Form_ID, curGC, curWindowNo);
            }
            else {
                VIS.ADialog.warn("AccessTableNoView");
            }
        }

        if (aPanel.getIsWindowAction(vButton.mField.getAD_Reference_Value_ID())) {

            switch (vButton.mField.vo.DefaultValue) {
                case 'APT':
                    aPanel.cmd_appointment();
                    break;
                case 'BUE':
                    aPanel.cmd_batchUpdatedialog();
                    break;
                case 'EML':
                    aPanel.cmd_email();
                    break;
                case 'SMS':
                    aPanel.cmd_sms();
                    break;
                case 'LER':
                    aPanel.cmd_letter();
                    break;
                case 'TAK':
                    aPanel.cmd_task();
                    break;
                case 'CHT':
                    aPanel.cmd_chat();
                    break;
                case 'ATT':
                    aPanel.cmd_attachment(vButton.getField().evaluateLogicsOnly());
                    break;
                case 'HIY':
                    aPanel.cmd_history();
                    break;
                case 'CRT':
                    aPanel.cmd_request();
                    break;
                case 'CRD':
                    aPanel.cmd_new(true);
                    break;
                case 'SRD':
                    aPanel.cmd_subscribe();
                    break;
                case 'ZAS':
                    aPanel.cmd_zoomAcross();
                    break;
                case 'MTE':
                    aPanel.cmd_markToExport();
                    break;
                case 'IMP':
                    aPanel.cmd_ImportMap();
                    break;
                case 'RSD':
                    aPanel.cmd_RecordShared();
                    break;
                case 'NRD':
                    aPanel.cmd_new()
                    break;
                case 'SAR':
                    aPanel.cmd_save(false)
                    break;
                case 'SAN':
                    aPanel.cmd_saveNew(false)
                    break;
                case 'DRD':
                    aPanel.cmd_delete()
                    break;
                case 'RQY':
                    aPanel.cmd_refresh()
                    break;
                case 'BVW':
                    aPanel.cmd_back()
                    break;
                case 'UNO':
                    aPanel.cmd_ignore();
                    break;
                case 'RET':
                    aPanel.cmd_report();
                    break;
                case 'PRT':
                    aPanel.cmd_print();
                    break;
                case 'HOE':
                    aPanel.cmd_home();
                    break;

                default: actionVADMSDocument(aPanel, vButton.value)
            }

            curTab = curGC = aPanel = null;

        };
    }

    /**
     * Handle widget Action
     * @param {any} actionParams
     */
    APanel.prototype.landingPageActionPerformed = function (actionParams) {
        this.vTabbedPane.restoreTabChange();
        this.showLandingPage(false);
        this.tabActionPerformed(this.vTabbedPane.getNextTabId(actionParams.TabIndex), "", "", actionParams);
    }

    function checkPostingByNewLogic(callback) {
        $.ajax({
            url: VIS.Application.contextUrl + "Posting/PostByNewLogic",
            dataType: "json",
            async: true,
            data: {
                AD_Client_ID: VIS.context.getAD_Client_ID()
            },
            error: function (e) {
                VIS.ADialog.info(VIS.Msg.getMsg('ERRORGettingPostingServer'));
            },
            success: function (data) {
                if (callback) {
                    callback(data.result);
                }
            }
        });
    }

    APanel.prototype.checkAndCallProcess = function (vButton, table_ID, record_ID, ctx, curCtrler, startWOasking, batch) {
        if (vButton.getProcess_ID() == 0)
            return;
        //	Save item changed

        var canExecute = true;
        var aPanel = this;

        if (curCtrler.curTab.needSave(true, false)) {
            canExecute = false;
            curCtrler.cmd_save(true, function (result) {
                if (!result)
                    return;
                else {
                    return btnClickAfterSave2(vButton, table_ID, record_ID, ctx, aPanel, startWOasking, batch);
                }
            });
        }
        if (canExecute) {
            return btnClickAfterSave2(vButton, table_ID, record_ID, ctx, aPanel, startWOasking, batch);
        }
    };

    function btnClickAfterSave2(vButton, table_ID, record_ID, ctx, aPanel, startWOasking, batch) {
        var columnName = vButton.getName();
        var ret = false;

        var needExecute = true;

        try {

            // If admin wants user to set background option
            // If background checkbox is checked, then user can see the setting throguh dialog but cannot change
            // if this checkbox is unchecked, then user will not be asked about setting, but process execute according to settings in DB.
            if (vButton.getAskUserBGProcess() == true || vButton.getIsBackgroundProcess() == true) {
                // Create Custom UI and pass root div as parameter to confirmCustomUI.
                var $customDIv = $('<div class="vis-confirm-popup-check"><label>' + VIS.Msg.translate(VIS.context, 'IsBackgroundProcess') + '</label></div>');
                var $chkBG = $('<input type="checkbox">');
                var isChecked = vButton.getIsBackgroundProcess();
                // Set (Disable or enable) and (checked or unchecked) based on DB setting
                $chkBG.prop('checked', isChecked);
                $chkBG.prop('disabled', isChecked);
                $customDIv.prepend($chkBG);
                VIS.ADialog.confirmCustomUI("StartProcess?", true, vButton.getDescription() + "\n" + vButton.getHelp(), "Confirm", $customDIv, function (result) {
                    if (result) {
                        isBg = $chkBG.is(':checked');
                        return btnClickAfterSave2New(vButton, table_ID, record_ID, ctx, batch, aPanel, ret, columnName, isBg);
                    }
                });


            }
            else {
                var isbg = vButton.getIsBackgroundProcess();
                //	Ask user to start process, if Description and Help is not empty
                if (!startWOasking && !(vButton.getDescription().equals("") && vButton.getHelp().equals(""))) {
                    needExecute = false;
                    VIS.ADialog.confirm("StartProcess?", true, vButton.getDescription() + "\n" + vButton.getHelp(), "Confirm", function (result) {
                        if (result) {
                            return btnClickAfterSave2New(vButton, table_ID, record_ID, ctx, batch, aPanel, ret, columnName, isbg);
                        }
                    });
                }

                if (needExecute) {
                    return btnClickAfterSave2New(vButton, table_ID, record_ID, ctx, batch, aPanel, ret, columnName, isbg);
                }
            }

            // }



            //if (needExecute) {
            //    return btnClickAfterSave2New(vButton, table_ID, record_ID, ctx, batch, aPanel, ret, columnName);
            //}


        }
        catch (ex) {
            VIS.ADialog.error("Error?", true, "error in process : " + ex.message);
            ret = false;
        }
        return false;
    };

    function btnClickAfterSave2New(vButton, table_ID, record_ID, ctx, batch, aPanel, ret, columnName, isbackground) {
        var title = vButton.getDescription();
        if (title == null || title.length == 0)
            title = columnName;
        var pi = new VIS.ProcessInfo(title, vButton.getProcess_ID(), table_ID, record_ID);
        pi.setAD_User_ID(ctx.getAD_User_ID());
        pi.setAD_Client_ID(ctx.getAD_Client_ID());
        pi.setAD_Window_ID((aPanel.$parentWindow === undefined ? 0 : aPanel.$parentWindow.AD_Window_ID));// vinay bhatt window id
        pi.setUseCrystalReportViewer(ctx.getIsUseCrystalReportViewer());
        pi.setIsBatch(batch);
        pi.setIsBackground(isbackground);
        //start process

        /* Special flag to determine click event form header panel*/
        aPanel.isHdrBtn = vButton.isHdrBtn;
        /* */

        var pCtl = new VIS.ProcessCtl(aPanel, pi, null);
        //pCtl.setIsPdf(vButton.isPdf);
        //pCtl.setIsCsv(vButton.isCsv);
        if (vButton.isPdf) {
            pi.setFileType(VIS.ProcessCtl.prototype.REPORT_TYPE_PDF);
        }
        else if (vButton.isCsv) {
            pi.setFileType(VIS.ProcessCtl.prototype.REPORT_TYPE_CSV);
        }

        pCtl.process(aPanel.curWindowNo); //  calls lockUI, unlockUI
        ret = true;
        aPanel = null;
        vButton = null;
        batch = false;
        startWOasking = false;
        actionProcessAfterSave = null;
        return ret;
    };

    function actionVADMSDocument(aPanel, action) {
        if (window.VADMS) {
            if (action == 'CDT') {
                var frame = new VIS.CFrame();
                var editDoc = new window.VADMS.editDocument(0, "", 0, "", 0, null, "", aPanel.curTab.getAD_Window_ID(), aPanel.curTab.getAD_Table_ID(), aPanel.curTab.getRecord_ID());
                frame.setName(VIS.Msg.getMsg("VADMS_CreateDocument"));
                frame.setTitle(VIS.Msg.getMsg("VADMS_CreateDocument"));
                frame.hideHeader(true);
                frame.setContent(editDoc);
                editDoc.initialize();
                frame.show();
            }
            else if (action == 'ADF') {
                var documentID = VIS.context.getContext("VADMS_Document_ID");
                if (documentID.length > 0) {
                    var dataIn = {
                        docID: documentID,
                        winID: aPanel.curTab.getAD_Window_ID(),
                        tableID: aPanel.curTab.getAD_Table_ID(),
                        recID: aPanel.curTab.getRecord_ID()
                    };
                    $.ajax({
                        url: VIS.Application.contextUrl + "JsonData/AttachFrom",
                        dataType: "json",
                        data: dataIn,
                        success: function (data) {
                            if (JSON.parse(data) == "OK") {
                                aPanel.curTab.loadDocuments();
                                aPanel.aViewDocument.setPressed(aPanel.curTab.hasDocument());
                                //if (!VIS.ADialog.ask("AttachWithOther")) {
                                //    VIS.context.setContext("VADMS_Document_ID", 0);
                                //}


                                VIS.ADialog.confirm("AttachWithOther", true, "", "Confirm", function (result) {
                                    if (!result) {
                                        VIS.context.setContext("VADMS_Document_ID", 0);
                                    }
                                });


                                aPanel = null;
                            }
                            else {
                                VIS.ADialog.error('NotAttached', true, "");
                            }
                        }
                    });
                }
            }
            else if (action == 'VDT') {
                var frame = new VIS.CFrame();
                var doc = new window.VADMS.DocumentManagementSystem();
                frame.setName(VIS.Msg.getMsg("VADMS_Document"));
                frame.setTitle(VIS.Msg.getMsg("VADMS_Document"));
                frame.hideHeader(true);
                doc.setWindowNo(VIS.Env.getWindowNo());
                doc.setWindowID(aPanel.curTab.getAD_Window_ID());
                doc.setTableID(aPanel.curTab.getAD_Table_ID());
                doc.setRecordID(aPanel.curTab.getRecord_ID());
                doc.setWindowName(aPanel.gridWindow.getName());
                frame.setContent(doc);
                doc.initialize();
                frame.show();
            }
            else if (action == 'UDT') {
                window.VADMS.uploaddocument(0, aPanel.curTab.getAD_Window_ID(), aPanel.curTab.getAD_Table_ID(), aPanel.curTab.getRecord_ID(), aPanel.$parentWindow.name, aPanel.curTab.getName());
            }
            else if (action == 'CAC') {
                var wtrid = aPanel.curTab.getAD_Window_ID() + "|" + aPanel.curTab.getAD_Table_ID() + "|" + aPanel.curTab.getRecord_ID() + "|" + aPanel.$parentWindow.name + "|" + aPanel.curTab.getName();
                VIS.context.setContext("VADMS_WinTableRecID", wtrid);
                VIS.ADialog.info('VADMS_CodeSetIntoContext', true, "");
            }
        } else {
            VIS.ADialog.error('PleaseInstallDMSModule', true, "");
        }

    }

    /**
     *	tab change
     *  @param action tab item's id
     */
    APanel.prototype.tabActionPerformed = function (action, actionType, actionName, actionParams) {

        /* Check for any window or form added in action*/
        if ((actionType == 'WIW' || actionType == 'FOM') && actionName != "") {
            var obj = {
                tableID: this.curTab.getAD_Table_ID(),
                actionType: actionType,
                actionName: actionName
            }
            var $this = this;
            $this.setBusy(true);
            $.ajax({
                url: baseUrl + "JsonData/CheckTableMapWithAction",
                type: "POST",
                datatype: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(obj)
            }).done(function (json) {
                $this.setBusy(false);
                list = JSON.parse(json);
                var popover = $("<div>");
                var ul = $('<ul class=vis-apanel-rb-ul>');
                popover.append(ul);
                if (list.length > 1) {
                    for (var i in list) {
                        var li = $("<li data-id='" + list[i].ID + "' data-action='" + list[i].ActionType + "'>");
                        li.append(list[i].Name);
                        li.on('click', function (e) {
                            e.stopImmediatePropagation();
                            var ID = $(this).data('id');
                            var atype = $(this).data('action');
                            VIS.viewManager.startAction(atype, ID);
                            var overlay = $('#w2ui-overlay-main');
                            overlay.hide();
                            overlay = null;
                        });
                        ul.append(li);
                    }
                    $(document.activeElement).w2overlay(popover.clone(true), { align: "right", css: { height: '200px' } });
                } else if (list.length == 1) {
                    VIS.viewManager.startAction(list[0].ActionType, list[0].ID);
                }

            }).error(function () {
                $this.setBusy(false);
            });
            return;
        }



        if (!this.vTabbedPane.getIsTabChanged(action)) {
            console.log("tabNotChange");
            this.setBusy(false, true);
            return false;
        }


        var back = false;
        var isAPanelTab = false;
        var tabEle = this.vTabbedPane.getTabElement(action);
        var curEle = this.curST || this.curGC;
        var oldGC = null;

        //Handle Open Tab in Dialog
        if (actionType == 'OTD') {
            VIS.TabMngr.show(tabEle, curEle.gTab.keyColumnName, curEle.gTab.getRecord_ID());
            this.vTabbedPane.restoreTabChange(this.vTabbedPane.getSelectedOldIndex());
            return;
        }



        //// To Clear SearchText Box on Tab Change
        this.toggleASearchIcons(false, false);
        this.setAdvancedSerachText(true, "");
        //// END


        var selfPanel = this;
        //  Workbench Tab Change
        if (this.vTabbedPane.getIsWorkbench()) {
            //
        }
        else {
            //  Just a Tab Change
            //log.Info("Tab=" + tp);
            this.curWinTab = this.vTabbedPane;
            var tpIndex = this.curWinTab.getSelectedIndex();
            back = tpIndex < this.curTabIndex;
            var gc = null, st = null;
            if (tabEle instanceof VIS.VSortTab) {
                st = tabEle;
                isAPanelTab = true;
            } else {
                gc = tabEle;
            }

            var canExecute = true;

            if (this.curGC != null) {


                //  has anything changed?
                if (this.curTab.needSave(true, false)) {   //  do we have real change
                    if (this.curTab.needSave(true, true)) {
                        //	Automatic Save
                        if (this.ctx.isAutoCommit(this.curWindowNo)) {

                            var isCheckListRequire = this.curGC.IsCheckListRequire();

                            if (!isCheckListRequire) {
                                this.vTabbedPane.restoreTabChange(this.vTabbedPane.getSelectedOldIndex());//m_curWinTab.setSelectedIndex(m_curTabIndex);
                                this.setBusy(false, true);
                                VIS.ADialog.error("CheckListRequired");
                                return false;
                            }

                            if (!this.curTab.dataSave(true)) {	//  there is a problem, so we go back	
                                this.vTabbedPane.restoreTabChange(this.vTabbedPane.getSelectedOldIndex());//m_curWinTab.setSelectedIndex(m_curTabIndex);
                                this.setBusy(false, true);
                                return false;
                            }
                        }
                        //    //  explicitly ask when changing tabs
                        //else if (VIS.ADialog.ask("SaveChanges?", true, this.curTab.getCommitWarning(), '')) {//  yes we want to save
                        //    if (!this.curTab.dataSave(true)) {   //  there is a problem, so we go back
                        //        //m_curWinTab.setSelectedIndex(m_curTabIndex);
                        //        this.vTabbedPane.restoreTabChange();
                        //        this.setBusy(false, true);
                        //        return false;
                        //    }
                        //}
                        //else    //  Don't save
                        //    this.curTab.dataIgnore();

                        else {
                            canExecute = false;
                            VIS.ADialog.confirm("SaveChanges?", true, this.curTab.getCommitWarning(), 'Confirm', function (results) {
                                if (results) {
                                    if (!selfPanel.curTab.dataSave(true)) {   //  there is a problem, so we go back
                                        //m_curWinTab.setSelectedIndex(m_curTabIndex);
                                        selfPanel.vTabbedPane.restoreTabChange(this.vTabbedPane.getSelectedOldIndex());
                                        selfPanel.setBusy(false, true);
                                        return false;
                                    }
                                }
                                else {
                                    selfPanel.curTab.dataIgnore();
                                }

                                curEle = selfPanel.curGC;
                                oldGC = selfPanel.curGC;
                                selfPanel.curGC = null;
                                //selfPanel.tabActionPerformedCallback3(curEle, isAPanelTab, gc, tpIndex);

                                if (selfPanel.curST != null) {
                                    selfPanel.curST.saveData();
                                    selfPanel.curST.unRegisterAPanel();
                                    curEle = selfPanel.curST;
                                    selfPanel.curST = null;
                                }

                                selfPanel.curTabIndex = tpIndex;
                                if (!isAPanelTab)
                                    selfPanel.curGC = gc;


                                selfPanel.tabActionPerformedCallback(action, back, isAPanelTab, tabEle, curEle, oldGC, gc, st);
                            });
                        }
                    }
                    else    //  new record, but nothing changed
                        selfPanel.curTab.dataIgnore();
                }
                if (canExecute) {
                    curEle = this.curGC;
                    oldGC = this.curGC;
                    this.curGC = null;
                }
            }

            if (canExecute) {
                if (this.curST != null) {
                    this.curST.saveData();
                    this.curST.unRegisterAPanel();
                    curEle = this.curST;
                    this.curST = null;
                }

                this.curTabIndex = tpIndex;
                if (!isAPanelTab)
                    this.curGC = gc;

            }

            //assign action params
            if (actionParams)
                this.actionParams = actionParams;
            else this.actionParams = {};


            var clickedTabSeq = tpIndex; //Get Tab index
            var clickedTabID = action; // Get the tab ID
            var winNo = this.curWindowNo;

            //Remove tab which sequence ias higher then ccurrent selected tab
            if (actionType != 'OTD') {
                this.tabStack = this.tabStack.filter(function (tab) {
                    return tab.tabSeq <= clickedTabSeq;
                });
                //Check Selected tab is exist or not
                var clickedTab = undefined;
                if (this.tabStack.length > 0) {
                    clickedTab = this.tabStack.find(function (tab) {
                        return tab.tabSeq === clickedTabSeq;
                    });
                }

                if (!clickedTab) { // if selected tab not exist then add.
                    this.tabStack.push({ tabSeq: clickedTabSeq, tabID: clickedTabID, tabView: [(isAPanelTab ? '' : gc.getMTab().getTabLayout())] });
                }
            }




        }
        if (canExecute) {
            selfPanel.tabActionPerformedCallback(action, back, isAPanelTab, tabEle, curEle, oldGC, gc, st);
        }

        return true;
    };

    APanel.prototype.tabActionPerformedCallback = function (action, back, isAPanelTab, tabEle, curEle, oldGC, gc, st) {

        curEle.setVisible(false);
        curEle.getRoot().detach();
        this.getLayout().prepend(tabEle.getRoot());
        this.vTabbedPane.setSelectedTab(action); //set Seleted tab
        var keepFilters = back;
        if (isAPanelTab) {
            tabEle.setVisible(true);
            this.curST = st;
            st.registerAPanel(this);
            st.loadData();
        }
        else {
            var mTab = gc.getMTab();
            tabEle.setVisible(true);
            gc.activate(oldGC, JSON.parse(JSON.stringify(this.actionParams)));
            if (oldGC)
                oldGC.detachDynamicAction();
            this.curTab = gc.getMTab();
            this.setDynamicActions();
            //PopulateSerachCombo(false);
            /*	Refresh only current row when tab is current(parent)*/
            if (!this.curTab.getIsZoomAction() && this.curTab.getTabLevel() > 0) {
                //if (!gc.isZoomAction && this.curTab.getTabLevel() > 0) {
                var queryy = new VIS.Query();
                this.curTab.query = queryy;
                keepFilters = false;
            }
            var defaultTabLayout = mTab.getTabLayout();
            if (back && this.curTab.getIsCurrent()) {


                if (this.curTab.getTabLevel() == 0) {
                    if (this.curTab.searchText) {
                        this.setAdvancedSerachText(false, this.curTab.searchText);
                    }
                    else if (this.curTab.hasSavedAdvancedSearch) {
                        this.toggleASearchIcons(true, false);
                    }
                }
                else {
                    if (this.curTab.searchText) {
                        this.setAdvancedSerachText(false, this.curTab.searchText);
                    }
                    else if (this.curTab.hasSavedAdvancedSearch) {
                        this.toggleASearchIcons(true, false);
                    }
                }

                gc.dataRefresh();

                this.showFilterPanel(keepFilters);

                if (this.tabStack.length > 0) {
                    var currentTabSeq = this.curWinTab.getSelectedIndex();
                    var currentTab = this.tabStack.find(function (tab) {
                        return tab.tabSeq === currentTabSeq;
                    });

                    if (currentTab.tabView.length > 0) {
                        defaultTabLayout = currentTab.tabView[currentTab.tabView.length - 1];
                    }
                }
            }
            else	//	Requery and bind
            {

                var resetLayout = mTab.getIsResetLayout();
                if (this.actionParams.TabLayout &&
                    ['N', 'Y', 'C'].indexOf(this.actionParams.TabLayout) > -1) {
                    defaultTabLayout = this.actionParams.TabLayout;
                    resetLayout = true;
                }



                /* if reset tab is true then set default view which is set on tab */
                if (resetLayout) {
                    //if (defaultTabLayout == 'N') {
                    //    gc.switchMultiRow();
                    //}
                    //else if (defaultTabLayout == 'Y') {
                    //    gc.switchSingleRow(true);
                    //}
                    //else if (defaultTabLayout == 'C') {
                    //    gc.switchCardRow(true);
                    //}
                    this.switchRow(gc, defaultTabLayout)
                }
                else {
                    if (gc.getIsSingleRow()) {
                        defaultTabLayout = 'Y'
                    } else if (gc.getIsCardRow()) {
                        defaultTabLayout = 'C'
                    } else if (!gc.getIsMapRow()) {
                        defaultTabLayout = 'N'
                    }
                }


                var AD_UserQuery_ID = 0;
                if (this.actionParams && this.actionParams.AD_UserQuery_ID) {
                    AD_UserQuery_ID = this.actionParams.AD_UserQuery_ID;
                }

                this.curTab.getTableModel().setCurrentPage(1);

                this.showFilterPanel(keepFilters);

                if (!this.curGC.onDemandTree || gc.isZoomAction) {

                    this.clearSearchText();

                    // this.setDefaultSearch(gc, AD_UserQuery_ID);                  

                    if ((this.actionParams.TabWhereClause || '') != '') { // check if param has where clause or not
                        var query = new VIS.Query(this.curTab.getTableName(), false);
                        query.addRestriction(this.actionParams.TabWhereClause);
                        this.curTab.setQuery(query, true);
                    } else {
                        this.setDefaultSearch(gc, AD_UserQuery_ID);
                    }

                    gc.query(this.curTab.getOnlyCurrentDays(), 0, false);	//	updated
                }
                else {
                    if ((this.actionParams.TabWhereClause || '') == '') {
                        this.setDefaultSearch(gc, AD_UserQuery_ID);
                    }
                }
            }

            //Change Icon
            //if (defaultTabLayout == 'N') {
            //    this.showHideViewIcon(this.aMulti);
            //}
            //else if (defaultTabLayout == 'Y') {
            //    this.showHideViewIcon(this.aSingle);
            //}
            //else if (defaultTabLayout == 'C') {
            //    this.showHideViewIcon(this.aCard);
            //}

            this.switchRow(null, defaultTabLayout, true);


            if (this.curGC.onDemandTree) {
                this.aShowSummaryLevel.show();
            }
            else {
                this.aShowSummaryLevel.hide();
            }
        }

        var gPanel = null;
        if (this.curGC) {
            gPanel = this.curGC;
        } else {
            gPanel = {};
            gPanel.setToolbarBtnState = function (action, enable) {
                ;
            }
        }
        //	Order Tab
        if (isAPanelTab) {
            this.showHideViewIcon(null);
            //this.aMulti.setPressed(false);
            //this.aMulti.setEnabled(false);
            //this.aCard.setEnabled(false);
            this.aCardDialog.setEnabled(false);

            this.aNew.setEnabled(false);
            //gPanel.setToolbarBtnState("NRD", false);

            this.aDelete.setEnabled(false);
            // gPanel.setToolbarBtnState("DRD", false);

            this.aFind.setEnabled(false);
            this.aBatchUpdate.setEnabled(false);

            this.aRefresh.setEnabled(false);
            //gPanel.setToolbarBtnState("RQY", false);

            this.aNext.setEnabled(false);
            this.aLast.setEnabled(false);
            this.aFirst.setEnabled(false);
            this.aPrevious.setEnabled(false);

            this.aPageFirst.setEnabled(false);
            this.aPageUp.setEnabled(false);
            this.aPageLast.setEnabled(false);
            this.aPageDown.setEnabled(false);
            //aAttachment.setEnabled(false);
            //aChat.setEnabled(false);


        }
        else	//	Grid Tab
        {
            //this.aMulti.setEnabled(true);
            //this.aMulti.setPressed(this.curGC.getIsSingleRow() || this.curGC.getIsMapRow());
            //this.aCard.setEnabled(true);
            this.aCardDialog.setEnabled(true);
            this.aFind.setEnabled(true);
            this.aBatchUpdate ? this.aBatchUpdate : '';
            this.aRefresh.setEnabled(true);
            gPanel.setToolbarBtnState("RQY", true);
            //aAttachment.setEnabled(true);
            //aChat.setEnabled(true);
        }

        this.showTabPanel(!this.actionParams.IsHideTabPanel && this.curTab.getHasPanel());

        if (!isAPanelTab && this.showMultiViewOnly) { // in case of compiste and grid mode
            this.curGC.refreshRowPresentation();
        }


        if (this.actionParams.IsShowFilterPanel != null || this.curTab.getIsShowFilterPanel()) {//set
            var lastFP = this.curTab.isFPManualHide;
            if (lastFP == undefined || lastFP == 'undefined') {
                lastFP = !this.curTab.getIsShowFilterPanel();
            }

            this.startFilterPanel(false);
            this.curTab.isFPManualHide = lastFP;
        } else {
            this.startFilterPanel(this.curTab['isFPManualHide']);
        }


        if (!isAPanelTab && this.curGC.getIsSingleRow()) {
            this.isHideFilterIcon(true);
            var lastFP = this.curTab.isFPManualHide;
            this.startFilterPanel(true);
            this.curTab.isFPManualHide = lastFP;
        } else {
            this.isHideFilterIcon(false);
        }

        //}

        this.refresh();

        this.setTabNavigation();

        /*******    END Tab Panels     ******/

        if (this.aParentDetail)
            this.aParentDetail.evaluate(tabEle);

        curEle = tabEle = null;

        if (this.curTab.getAD_Process_ID() == 0) {
            this.aPrint.setEnabled(false);
            gPanel.setToolbarBtnState("PRT", false);
        }
        else {
            this.aPrint.setEnabled(true);
            gPanel.setToolbarBtnState("PRT", true);
        }

        this.setUI();

        if (this.actionParams.AD_UserQuery_ID) {
            this.curGC.aFilterPanel.setFilterLineAdvance(this.actionParams.AD_UserQuery_ID, true);
        }

        var tbParams = {};
        if (this.actionParams) {
            //copy UI required prop
            tbParams.IsHideGridToggle = this.actionParams.IsHideGridToggle;
            tbParams.IsHideCardToggle = this.actionParams.IsHideCardToggle;
            tbParams.IsHideSingleToggle = this.actionParams.IsHideSingleToggle;
            tbParams.IsReadOnly = this.actionParams.IsReadOnly;
            tbParams.IsDeleteDisabled = this.actionParams.IsDeleteDisabled;
        }

        this.actionParams = tbParams; //clear one time setting  properties not all

        if (!isAPanelTab && this.curGC && this.curTab.getRecord_ID() > -1) {
            this.curGC.refreshTabPanelData(this.curTab.getRecord_ID(), 'R');
        }

    };

    /**
     * set UI 
     */
    APanel.prototype.setUI = function () {
        if (!this.actionParams) {
            this.actionParams = {};
        }

        if (!this.actionParams.IsHideMapToggle && this.curTab.getIsMapView()) {
            this.aMap.show();
        }
        else {
            this.aMap.hide();
        }

        if (this.actionParams.IsHideRecordNav || this.curTab.getIsHideRecordNav()) {
            this.aNext.hide();
            this.aPrevious.hide();
        }
        else {
            this.aNext.show();
            this.aPrevious.show();
        }

        //Hide tool bar
        if (this.actionParams.IsHideToolbar || this.gridWindow.getIsHideToolbar()) {
            this.hideToolbar(true);
        }
        else {
            this.hideToolbar(false);
        };

        //hide Tab Links
        if (this.actionParams.IsHideTabLinks || this.gridWindow.getIsHideTabLinks()) {
            this.hideTabLinks(true);
        }
        else {
            this.hideTabLinks(false);
        };

        //hide action bar Links
        if (this.actionParams.IsHideTabLinks || this.gridWindow.getIsHideTabLinks()) {
            this.hideTabLinks(true);
        }
        else {
            this.hideTabLinks(false);
        };

        //hide action bar Links
        if (this.actionParams.IsHideActionbar || this.gridWindow.getIsHideActionbar()) {
            this.hideActionbar(true);
        }
        else {
            this.hideActionbar(false);
        }
    };



    /**
     * 
     * @param {any} gc    grid controller null if dont want to switch row
     * @param {any} tabLayout  char for layout
     * @param {any} updateViewIconState   true if want to show hide icon based on tablayout
     */
    APanel.prototype.switchRow = function (gc, tabLayout, updateViewIconState) {

        if (gc) {
            if (tabLayout == 'N') {
                gc.switchMultiRow();
            }
            else if (tabLayout == 'Y') {
                gc.switchSingleRow(true);
            }
            else if (tabLayout == 'C') {
                gc.switchCardRow(true);
            }
        }

        if (updateViewIconState) {
            if (tabLayout == 'N') {
                this.showHideViewIcon(this.aMulti);
            }
            else if (tabLayout == 'Y') {
                this.showHideViewIcon(this.aSingle);
            }
            else if (tabLayout == 'C') {
                this.showHideViewIcon(this.aCard);
            }
        }

    }

    APanel.prototype.displayIncArea = function (show) {
        var tdArea = this.getIncludedEmptyArea();
        if (show && tdArea.data('lasttab') != 'Y') {
            tdArea.css('display', 'flex');
        }
        else
            tdArea.css('display', 'none');
    }

    APanel.prototype.onQueryCompleted = function () {

    };

    APanel.prototype.setDefaultSearch = function (gc, AD_UserQuery_ID) {

        var $selfpanel = this;

        var sqlUserSearch = "VIS_117";
        var param = [];
        if (AD_UserQuery_ID > 0) {
            sqlUserSearch = "VIS_159";
            param[0] = new VIS.DB.SqlParam("@AD_UserQuery_ID", AD_UserQuery_ID);

        } else {
            param[0] = new VIS.DB.SqlParam("@AD_Tab_ID", this.curTab.getAD_Tab_ID());
            param[1] = new VIS.DB.SqlParam("@AD_User_ID", parseInt(this.ctx.getAD_User_ID()));
            param[2] = new VIS.DB.SqlParam("@AD_Tab_ID1", this.curTab.getAD_Tab_ID());
            param[3] = new VIS.DB.SqlParam("@AD_User_ID1", parseInt(this.ctx.getAD_User_ID()));
            param[4] = new VIS.DB.SqlParam("@AD_Client_ID", parseInt(this.ctx.getAD_Client_ID()));
            param[5] = new VIS.DB.SqlParam("@AD_Tab_ID2", this.curTab.getAD_Tab_ID());
            param[6] = new VIS.DB.SqlParam("@AD_Table_ID", this.curTab.getAD_Table_ID());
        }

        var data = executeDataSet(sqlUserSearch, param);

        if (data && data.tables[0].rows && data.tables[0].rows.length > 0) {
            $selfpanel.curTab.hasSavedAdvancedSearch = true;
            if ($selfpanel.curTab.getTabLevel() == 0 && !gc.gTab.getIsZoomAction()) {
                var hasDefaultSearch = false;
                for (var i = 0; i < data.tables[0].rows.length; i++) {
                    if (data.tables[0].rows[i].cells["ad_defaultuserquery_id"] > 0) {
                        hasDefaultSearch = true;
                        $selfpanel.setAdvancedSerachText(false, data.tables[0].rows[i].cells["name"]);
                        var query = new VIS.Query($selfpanel.curTab.getTableName(), false);
                        query.addRestriction(data.tables[0].rows[i].cells["code"]);
                        $selfpanel.curTab.setQuery(query);
                        $selfpanel.defaultSearch = false;
                        $selfpanel.curTab.searchText = data.tables[0].rows[i].cells["name"];
                        var userquery_id = data.tables[0].rows[i].cells["ad_userquery_id"];
                        setTimeout(function (id) {
                            $selfpanel.curGC.aFilterPanel.setFilterLineAdvance(userquery_id, true);
                        }, 1000, userquery_id);

                        toastr.success(VIS.Msg.getMsg("DefaultSerachExist"), '', { timeOut: 4000, "positionClass": "toast-top-center", "closeButton": true, });

                    }
                }

                if (!$selfpanel.curTab.hasSavedAdvancedSearch) {
                    //var query = new VIS.Query($selfpanel.curTab.getTableName(), true);
                    //$selfpanel.curTab.setQuery(query);
                }

                $selfpanel.toggleASearchIcons(true, hasDefaultSearch);
            }
            else {
                //var query = new VIS.Query($selfpanel.curTab.getTableName(), true);
                //$selfpanel.curTab.setQuery(query);
                $selfpanel.toggleASearchIcons(true, false);
            }
        }
        else {
            //var query = new VIS.Query($selfpanel.curTab.getTableName(), true);
            //$selfpanel.curTab.setQuery(query);
            $selfpanel.toggleASearchIcons(false, false);
            $selfpanel.setAdvancedSerachText(true, "");
        }

        ///});



    };

    /**
     *	Data Status Listener (row change)			^ | v
     *  @param e event 
     */
    APanel.prototype.dataStatusChanged = function (e) {
        var gPanel = null;
        if (this.curGC) {
            gPanel = this.curGC;
        } else {
            gPanel = {};
            gPanel.setToolbarBtnState = function (action, enable) {

            }
        }

        var dbInfo = e.getMessage();
        var findPressed = this.curTab.getIsQueryActive() || this.curTab.getOnlyCurrentDays() > 0;
        if (findPressed)
            dbInfo = "[ " + dbInfo + " ]";
        this.statusBar.setStatusDB(dbInfo, e);
        var $ths = this;
        //	Set Message / Info
        if (e.getAD_Message() != null || e.getInfo() != null) {
            var sb = new StringBuilder();
            var msg = e.getAD_Message();
            if (msg != null && msg.length > 0)
                sb.append(VIS.Msg.getMsg(e.getAD_Message()));
            var info = e.getInfo();
            if (info != null && info.length > 0) {
                if (sb.length() > 0 && !sb.endsWith(":"))
                    sb.append(": ");
                sb.append(info);
            }
            if (sb.length() > 0) {
                var pos = sb.indexOf("\n");
                if (pos != -1)  // replace 
                    sb.replace("\n", " - ");
                this.setStatusLine(sb.toString(), e.getIsError());
            }
        }

        //  Confirm Error with CallBack
        if (e.getIsError() && !e.getIsConfirmed()) {

            VIS.ADialogCallback.error(e.getAD_Message(), e.getInfo(), null, function () {
                var lf = $ths.curTab.getLastFocus();
                if (lf) {
                    lf.focus();
                    $ths.curTab.setLastFocus(null);
                }
            });

            e.setConfirmed(true);   //  show just once - if MTable.setCurrentRow is involved the status event is re-issued
            this.errorDisplayed = true;
        }
        //  Confirm Warning with Call back
        else if (e.getIsWarning() && !e.getIsConfirmed()) {
            VIS.ADialogCallback.warn(e.getAD_Message(), e.getInfo(), null, function () {
                var lf = $ths.curTab.getLastFocus();
                if (lf) {
                    lf.focus();
                    $ths.curTab.setLastFocus(null);
                }
            });
            e.setConfirmed(true);   //  show just once - if MTable.setCurrentRow is involved the status event is re-issued
        }

        //	update Navigation
        var firstRow = e.getIsFirstRow();
        this.aFirst.setEnabled(!firstRow);
        this.aPrevious.setEnabled(!firstRow);
        var lastRow = e.getIsLastRow();
        this.aNext.setEnabled(!lastRow);
        this.aLast.setEnabled(!lastRow);

        var firstPage = e.getIsFirstPage();
        this.aPageFirst.setEnabled(!firstPage);
        this.aPageUp.setEnabled(!firstPage);
        var lastPage = e.getIsLastPage();
        this.aPageLast.setEnabled(!lastPage);
        this.aPageDown.setEnabled(!lastPage);

        //	update Change
        var changed = e.getIsChanged() || e.getIsInserting();
        var readOnly = this.curTab.getIsReadOnly();
        var insertRecord = !readOnly;
        if (insertRecord)
            insertRecord = this.curTab.getIsInsertRecord();
        this.aNew.setEnabled(!changed && insertRecord);
        gPanel.setToolbarBtnState("NRD", !changed && insertRecord);
        if (this.aCopy) {
            this.aCopy.setEnabled(!changed && insertRecord);
        }
        this.aRefresh.setEnabled(!changed);
        gPanel.setToolbarBtnState("RQY", !changed);
        this.aDelete.setEnabled(!changed && !readOnly && e.getCurrentRow() > -1 && !this.actionParams.IsDeleteDisabled);
        gPanel.setToolbarBtnState("DRD", !changed && !readOnly && e.getCurrentRow() > -1 && !this.actionParams.IsDeleteDisabled);
        //
        if (readOnly && this.curTab.getIsAlwaysUpdateField())
            readOnly = false;
        this.aIgnore.setEnabled(changed && !readOnly);
        gPanel.setToolbarBtnState("UNO", changed && !readOnly);

        this.aSave.setEnabled(changed && !readOnly);
        gPanel.setToolbarBtnState("SAR", changed && !readOnly);

        this.aSaveNew.setEnabled(changed && !readOnly);
        gPanel.setToolbarBtnState("SAN", changed && !readOnly);

        this.aCardDialog.setEnabled(!changed);

        //
        //	No Rows
        if (e.getTotalRows() == 0 && insertRecord) {
            this.aNew.setEnabled(true);
            gPanel.setToolbarBtnState("NRD", true);

            this.aDelete.setEnabled(false);
            gPanel.setToolbarBtnState("DRD", true);

            if (!this.curGC.isZoomAction) {
                this.highlightButton(true, this.aNew);
            }
        }
        else {
            this.highlightButton(false, this.aNew);
        }


        //	Single-Multi
        //this.aMulti.setPressed(this.curGC.getIsSingleRow() || this.curGC.getIsMapRow());
        //this.aCard.setPressed(this.curGC.getIsCardRow());
        this.setBackEnable();

        if (this.aChat) {
            this.aChat.setPressed(this.curTab.hasChat());
        }
        if (this.aAttachment) {
            this.aAttachment.setPressed(this.curTab.hasAttachment());
        }
        if (this.aMarkToExport) {
            this.aMarkToExport.setPressed(this.curTab.hasMarked());
        }

        if (this.aSubscribe) {
            this.aSubscribe.setPressed(this.curTab.HasSubscribed());
        }

        //  this.aChat.setEnabled(true);

        if (this.isPersonalLock) {
            this.aLock.setEnabled(true);
            gPanel.setToolbarBtnState(this.aLock.getAction(), true);
            this.aLock.setPressed(this.curTab.getIsLocked());
            this.aRecAccess.setEnabled(true);
            gPanel.setToolbarBtnState(this.aRecAccess.getAction(), true);
        }

        if (this.isShowSharedRecord && this.aSharedRecord) {
            if (this.curTab.getValue('AD_Org_ID') > 0 && this.excludeFromShare.indexOf(this.curTab.getTableName().toLowerCase()) == -1) {
                this.aSharedRecord.setEnabled(true);
                gPanel.setToolbarBtnState(this.aSharedRecord.getAction(), true);
                this.aSharedRecord.setPressed(this.curTab.hasShared());
            } else {
                this.aSharedRecord.setEnabled(false);
                gPanel.setToolbarBtnState(this.aSharedRecord.getAction(), false);
            }
        }



        if (this.curTab.getRecord_ID() == -1) {
            //this.aMulti.setEnabled(false);
            if (this.aChat) {
                this.aChat.setEnabled(false);
                gPanel.setToolbarBtnState(this.aChat.getAction(), false);
            }
            if (this.aAttachment) {
                this.aAttachment.setEnabled(false);
                gPanel.setToolbarBtnState(this.aAttachment.getAction(), false);
            }
            if (this.aSubscribe) {
                this.aSubscribe.setEnabled(false);
                gPanel.setToolbarBtnState(this.aSubscribe.getAction(), false);
            }
            //if (this.aImportMap) {
            //    this.aImportMap.setEnabled(false);
            //}
            if (this.aHistory) {
                this.aHistory.setEnabled(false);
                gPanel.setToolbarBtnState(this.aHistory.getAction(), false);
            }
            if (this.aEmail) {
                this.aEmail.setEnabled(false);
                gPanel.setToolbarBtnState(this.aEmail.getAction(), false);
            }
            if (this.aLetter) {
                this.aLetter.setEnabled(false);
                gPanel.setToolbarBtnState(this.aLetter.getAction(), false);
            }
            if (this.aSms) {
                this.aSms.setEnabled(false);
                gPanel.setToolbarBtnState(this.aSms.getAction(), false);
            }
            if (this.aFaxEmail) {
                this.aFaxEmail.setEnabled(false);
                gPanel.setToolbarBtnState(this.aFaxEmail.getAction(), false);
            }

            if (this.aCreateDocument) {
                this.aCreateDocument.setEnabled(false);
                gPanel.setToolbarBtnState(this.aCreateDocument.getAction(), false);
            }
            if (this.aUploadDocument) {
                this.aUploadDocument.setEnabled(false);
                gPanel.setToolbarBtnState(this.aUploadDocument.getAction(), false);
            }
            if (this.aViewDocument) {
                this.aViewDocument.setEnabled(false);
                gPanel.setToolbarBtnState(this.aViewDocument.getAction(), false);
            }
            if (this.aAttachFrom) {
                this.aAttachFrom.setEnabled(false);
                gPanel.setToolbarBtnState(this.aAttachment.getAction(), false);
            }
            if (this.aZoomAcross) {
                this.aZoomAcross.setEnabled(false);
                gPanel.setToolbarBtnState(this.aZoomAcross.getAction(), false);
            }
            if (this.aMarkToExport) {
                this.aMarkToExport.setEnabled(false);
                gPanel.setToolbarBtnState(this.aMarkToExport.getAction(), false);
            }
            if (this.aArchive) {
                this.aArchive.setEnabled(false);
                gPanel.setToolbarBtnState(this.aArchive.getAction(), false);
            }
            if (this.aEmailAttach) {
                this.aEmailAttach.setEnabled(false);
                gPanel.setToolbarBtnState(this.aEmailAttach.getAction(), false);
            }
            if (this.aAppointment) {
                this.aAppointment.setEnabled(false);
                gPanel.setToolbarBtnState(this.aAppointment.getAction(), false);
            }
            if (this.aTask) {
                this.aTask.setEnabled(false);
                gPanel.setToolbarBtnState(this.aTask.getAction(), false);
            }
            if (this.aRequest) {
                this.aRequest.setEnabled(false);
                gPanel.setToolbarBtnState(this.aRequest.getAction(), false);
            }
            if (this.aWorkflow) {
                this.aWorkflow.setEnabled(false);
                gPanel.setToolbarBtnState(this.aWorkflow.getAction(), false);
            }
            if (this.aCopy) {
                this.aCopy.setEnabled(false);
                gPanel.setToolbarBtnState(this.aCopy.getAction(), false);
            }
            if (this.aLock) {
                this.aLock.setEnabled(false);
                gPanel.setToolbarBtnState(this.aLock.getAction(), false);
            }
            if (this.aRecAccess) {
                this.aRecAccess.setEnabled(false);
                gPanel.setToolbarBtnState(this.aRecAccess.getAction(), false);
            }

            if (this.aSharedRecord) {
                this.aSharedRecord.setEnabled(false);
                gPanel.setToolbarBtnState(this.aSharedRecord.getAction(), false);
            }

            if (this.aBatchUpdate) {
                this.aBatchUpdate.setEnabled(false);
                gPanel.setToolbarBtnState(this.aBatchUpdate.getAction(), false);
            }

            //if (this.aCall) {
            //    this.aCall.setEnabled(false);
            //}
        }
        else {

            if (this.aChat) {
                this.aChat.setEnabled(true);
                gPanel.setToolbarBtnState(this.aChat.getAction(), true);
            }
            if (this.aAttachment) {
                this.aAttachment.setEnabled(true);
                gPanel.setToolbarBtnState(this.aAttachment.getAction(), true);
            }
            if (this.aSubscribe) {
                this.aSubscribe.setEnabled(true);
                gPanel.setToolbarBtnState(this.aSubscribe.getAction(), true);
            }
            if (this.aHistory) {
                this.aHistory.setEnabled(true);
                gPanel.setToolbarBtnState(this.aHistory.getAction(), true);
            }
            if (this.aEmail) {
                this.aEmail.setEnabled(true);
                gPanel.setToolbarBtnState(this.aEmail.getAction(), true);
            }
            if (this.aLetter) {
                this.aLetter.setEnabled(true);
                gPanel.setToolbarBtnState(this.aLetter.getAction(), true);
            }
            if (this.aSms) {
                this.aSms.setEnabled(true);
                gPanel.setToolbarBtnState(this.aSms.getAction(), true);
            }
            if (this.aFaxEmail) {
                this.aFaxEmail.setEnabled(true);
                gPanel.setToolbarBtnState(this.aFaxEmail.getAction(), true);
            }
            if (this.aImportMap) {
                this.aImportMap.setEnabled(true);
                gPanel.setToolbarBtnState(this.aImportMap.getAction(), true);
            }
            if (this.aCreateDocument) {
                this.aCreateDocument.setEnabled(true);
                gPanel.setToolbarBtnState(this.aCreateDocument.getAction(), true);
            }
            if (this.aUploadDocument) {
                this.aUploadDocument.setEnabled(true);
                gPanel.setToolbarBtnState(this.aUploadDocument.getAction(), true);
            }
            if (this.aViewDocument) {
                this.aViewDocument.setEnabled(true);
                gPanel.setToolbarBtnState(this.aViewDocument.getAction(), true);
            }
            if (this.aAttachFrom) {
                this.aAttachFrom.setEnabled(true);
                gPanel.setToolbarBtnState(this.aAttachFrom.getAction(), true);
            }
            if (this.aZoomAcross) {
                this.aZoomAcross.setEnabled(true);
                gPanel.setToolbarBtnState(this.aZoomAcross.getAction(), true);
            }
            if (this.aMarkToExport) {
                this.aMarkToExport.setEnabled(true);
                gPanel.setToolbarBtnState(this.aMarkToExport.getAction(), true);
            }
            if (this.aArchive) {
                this.aArchive.setEnabled(true);
                gPanel.setToolbarBtnState(this.aArchive.getAction(), true);
            }
            if (this.aEmailAttach) {
                this.aEmailAttach.setEnabled(true);
                gPanel.setToolbarBtnState(this.aEmailAttach.getAction(), true);
            }
            if (this.aAppointment) {
                this.aAppointment.setEnabled(true);
                gPanel.setToolbarBtnState(this.aAppointment.getAction(), true);
            }
            if (this.aTask) {
                this.aTask.setEnabled(true);
                gPanel.setToolbarBtnState(this.aTask.getAction(), true);
            }
            if (this.aRequest) {
                this.aRequest.setEnabled(true);
                gPanel.setToolbarBtnState(this.aRequest.getAction(), true);
            }
            if (this.aWorkflow) {
                this.aWorkflow.setEnabled(true);
                gPanel.setToolbarBtnState(this.aWorkflow.getAction(), true);
            }
            if (this.aCopy) {
                this.aCopy.setEnabled(true);
                gPanel.setToolbarBtnState(this.aCopy.getAction(), true);
            }
            if (this.aLock) {
                this.aLock.setEnabled(true);
                gPanel.setToolbarBtnState(this.aLock.getAction(), true);
            }

            if (this.aBatchUpdate) {
                this.aBatchUpdate.setEnabled(true);
                gPanel.setToolbarBtnState(this.aBatchUpdate.getAction(), true);
            }
            //if (this.aCall) {
            //    this.aCall.setEnabled(true);
            //}


            //this.aMulti.setEnabled(true);
            //this.aChat.setEnabled(true);
            //this.aAttachment.setEnabled(true);
            //this.aSubscribe.setEnabled(true);
            //this.aHistory.setEnabled(true);
            //this.aEmail.setEnabled(true);
            //this.aLetter.setEnabled(true);
            //this.aSms.setEnabled(true);
            //this.aFaxEmail.setEnabled(true);
            //this.aSubscribe.setEnabled(true);
            //this.aCreateDocument.setEnabled(true);
            //this.aUploadDocument.setEnabled(true);
            //this.aViewDocument.setEnabled(true);
            //this.aAttachFrom.setEnabled(true);
            //this.aZoomAcross.setEnabled(true);
            //this.aMarkToExport.setEnabled(true);
            //this.aArchive.setEnabled(true);
            //this.aEmailAttach.setEnabled(true);
            //this.aAppointment.setEnabled(true);
            //this.aTask.setEnabled(true);
            //this.aRequest.setEnabled(true);
            //this.aWorkflow.setEnabled(true);
        }

        //	Transaction info

        if (!e.getIsInserting()) {
            //var trxInfo = VIS.GridTab.prototype.getTrxInfo(this.curTab.getTableName(), VIS.context, this.curTab.getWindowNo(), this.curTab.getTabNo());
            this.setStatusInfo(e.getRecord_ID());

            //if (trxInfo != null)
            //    this.statusBar.setInfo(trxInfo);
        }
        else {
            this.statusBar.setInfo(null);
        }

        if (this.curWinTab == this.vTabbedPane) {
            VIS.context.setContext(this.curWindowNo, "tb_Index", this.curTabIndex);
            this.curWinTab.evaluate(null);
            if (e.getChangedColumn() < 0 || !e.getIsInserting()) {
                this.curWinTab.notifyDataChanged(e);
            }
        }

        if (this.curTab.getParentTab() && this.aSharedRecord) {
            this.curTab.loadShared();
            this.aSharedRecord.setPressed(this.curTab.hasShared());
        }

        /******End Header Panel******/


    };   //

    // Common function for set footer
    APanel.prototype.setStatusInfo = function (record_ID, action) {
        if (!record_ID && this.curTab) {
            record_ID = this.curTab.getRecord_ID();
        }
        var tht = this;
        VIS.GridTab.prototype.getFooterInfo(this.curTab.getTableName(), VIS.context, this.curTab.getWindowNo(),
            this.curTab.getTabNo(), record_ID).then(function (info) {
                if (tht && tht.statusBar)
                    tht.statusBar.setInfo(info);
            }, function (err) {
                if (tht && tht.statusBar)
                    tht.statusBar.setInfo(err);
            });

        // refesh current tab panel
        if (action && action != '' && this.curGC) {
            this.curGC.refreshTabPanelData(this.curTab.getRecord_ID(), action)
        }
    }



    /**
     *	Set Status Line to text
     *  @param text clear text
     *  @param error error flag
     */
    APanel.prototype.setStatusLine = function (text, error) {
        this.statusBar.setStatusLine(text, error);
    };

    //Cmd_Actions

    APanel.prototype.cmd_refresh = function () {
        //this.cmd_save(false); // Comment As discused with Harwinder Sir
        this.curGC.dataRefreshAll();
    };//Refresh

    APanel.prototype.cmd_ignore = function () {
        //m_curGC.stopEditor(false);
        if (this.curGC) {
            this.curGC.dataIgnore();
        }
    };//Undo

    APanel.prototype.cmd_help = function ()//sarab
    {
        var help = new VIS.Apps.help(this.gridWindow);
    };

    APanel.prototype.cmd_cardDialog = function (fromCardDialogBtn) {
        var card = new VIS.CVDialog(this, fromCardDialogBtn);
        card.show();
    };

    APanel.prototype.cmd_home = function () {
        this.firstTabId = this.masterTabId;
        this.selectFirstTab();
        this.getRoot().find(".vis-ad-w-p-t-c").animate({ scrollLeft: 0 }, 500);
    }

    /**
     * Save and new
     * @param {any} manual
     */
    APanel.prototype.cmd_saveNew = function (manual) {
        var $this = this;
        this.cmd_save(true, function (result) {
            if (result) {
                $this.cmd_new(false);
            }
        });
    }

    APanel.prototype.cmd_save = function (manual, callback) {
        //cmd_save(false);
        //this.curGC.dataRefreshAll();
        if (this.curST != null)
            manual = false;
        this.errorDisplayed = false;
        //this.curGC.stopEditor(true);

        if (this.curST != null) {
            this.curST.saveData();
            this.aSave.setEnabled(false);	//	set explicitly
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled("SAR", false);
            }
            return;
        }

        var $this = this;

        // Check valid condition for checklist
        //this.curGC.IsCheckListRequire(function (isCheckListRequire) {
        //    if (!isCheckListRequire) {
        //        VIS.ADialog.error("CheckListRequired");
        //        return false;
        //    }

        //});

        return $this.cmd_save2(manual, $this.curTab, $this.curGC, $this, callback);
    };

    APanel.prototype.cmd_save2 = function (manual, curTab, curGC, selfPanel, callback) {
        var needExecute = true;

        if (curTab.getCommitWarning().length > 0 && curTab.needSave(true, false)) {
            needExecute = false;

            //var selfPanel = this;

            VIS.ADialog.confirm("SaveChanges?", true, curTab.getCommitWarning(), "Confirm", function (result) {

                if (!result) {
                    return;
                }
                var retValue = curGC.dataSave(manual);

                if (manual && !retValue && !selfPanel.errorDisplayed) {

                }
                curGC.refreshTabPanelData(selfPanel.curTab.getRecord_ID(), 'S');
                if (manual) {
                    curGC.dynamicDisplay(-1);
                    selfPanel.vTabbedPane.notifyDataChanged();
                }

                if (callback) {
                    callback(retValue);
                }

            });


        }

        if (needExecute) {

            var retValue = curGC.dataSave(manual);

            if (manual && !retValue && !selfPanel.errorDisplayed) {

            }

            if (manual) {
                curGC.dynamicDisplay(-1);
                selfPanel.vTabbedPane.notifyDataChanged();
            }

            if (callback) {
                callback(retValue);
            }

            curGC.refreshTabPanelData(curTab.getRecord_ID(), 'S');

            this.curTab.loadShared();
            if (this.aSharedRecord) {
                this.aSharedRecord.setPressed(this.curTab.hasShared());
            }
            return retValue;
        }

    };//Save

    APanel.prototype.cmd_new = function (copy) { //Create New Record

        //If the record is shared, then copying the record is not allowed.
        if (this.curTab.isCurrentRecordShare && copy) {
            VIS.ADialog.info('ActionNotAllowedHere');
            return;
        }

        if (!this.curTab.getIsInsertRecord()) {
            //log.warning("Insert Record disabled for Tab");
            return;
        }

        //if (this.curTab.getParentTab() && this.curTab.getParentTab().IsSharedReadOnly) {
        //    VIS.ADialog.error("AccessCannotInsert", true, "");
        //    return;
        //}

        this.curGC.setNewRecordLayout();
        this.curGC.dataNew(copy);

    };// New

    APanel.prototype.cmd_batchUpdatedialog = function () {
        if (this.curTab.getIsReadOnly())
            return;
        var bUpdate = new VIS.BatchUpdate(this.curWindowNo, this.curTab, this.curGC.getSelectedRows());
        bUpdate.onClose = function () {
        };
        bUpdate.show();
    };

    APanel.prototype.cmd_delete = function () {

        if (this.curTab.getIsReadOnly())
            return;
        //var keyID = this.curTab.getRecord_ID();
        //prevent deletion if client access for Read Write does not exist for this Role.

        if (this.curTab.IsSharedReadOnly) {
            VIS.ADialog.error("CannotDelete", true, "");
            return;
        }

        var ids = this.curGC.canDeleteRecords()


        // if (!VIS.MRole.getDefault().getIsClientAccess(this.curTab.getAD_Client_ID(), true))
        if (ids.length > 0) {
            VIS.ADialog.error("CannotDelete", true, " [ " + ids.join(",") + "]");
            return;
        }

        //if (VIS.ADialog.ask("DeleteRecord?")) {
        //    this.curGC.dataDelete();
        //}

        var thisPanel = this;

        VIS.ADialog.confirm("DeleteRecord?", true, "", "Confirm", function (result) {
            if (result) {
                thisPanel.curGC.dataDeleteAsync();
            }
        });


    };

    APanel.prototype.cmd_back = function () {
        var tis = this;
        if (this.tabStack.length > 0) {
            var currentTab = this.tabStack[this.tabStack.length - 1];
            if (currentTab.tabView.length > 0) {
                this.tabStack[this.tabStack.length - 1].tabView.pop();
                var defaultTabLayout = currentTab.tabView[(currentTab.tabView.length - 1)];
                if (defaultTabLayout == 'N') {
                    tis.showHideViewIcon(tis.aMulti);
                    tis.curGC.switchMultiRow();
                    tis.isHideFilterIcon(false);
                    this.startFilterPanel(this.curTab.isFPManualHide);
                }
                else if (defaultTabLayout == 'Y') {
                    tis.showHideViewIcon(tis.aSingle);
                    tis.curGC.switchSingleRow(true);

                    var lastFP = tis.curTab.isFPManualHide;
                    tis.startFilterPanel(true);
                    tis.isHideFilterIcon(true);
                    tis.curTab.isFPManualHide = lastFP;
                }
                else if (defaultTabLayout == 'C') {
                    tis.showHideViewIcon(tis.aCard);
                    tis.curGC.switchCardRow(true);
                    tis.isHideFilterIcon(false);
                    this.startFilterPanel(this.curTab.isFPManualHide);
                }
            }
        }

        this.setBackEnable();



        if (this.tabStack.length > 1 && this.tabStack[this.tabStack.length - 1].tabView.length === 0) {

            this.tabStack.pop();
            currentTab = this.tabStack[this.tabStack.length - 1];
            if (currentTab && Object.keys(currentTab).length > 0) {
                if (this.curTab.needSave(true, false) && this.curTab.needSave(true, true)) {
                    this.cmd_ignore();
                }
                this.onTabChange(currentTab.tabID);
            } else {
                this.setBackEnable();
            }
        }

        //if (tis.getLastView() == "Multi") {
        //    tis.aMulti.setPressed(!tis.curGC.getIsSingleRow());
        //    tis.aCard.setPressed(false);
        //    tis.curGC.switchMultiRow(true);
        //}
        //else if (tis.getLastView() == "Card") {
        //    tis.curGC.switchCardRow(true);
        //    tis.aMulti.setPressed(false);
        //    tis.aCard.setPressed(true);
        //}
        //tis.setLastView("");
    }
    /* 
     -Quick Search 
     @param val text to search
     */

    APanel.prototype.cmd_find = function (val) {

        if (!this.curTab)
            return;

        if (!this.defaultSearch) {
            this.defaultSearch = true;
            return;
        }

        this.setBusy(true);
        if (this.isFromSearch) {
            var query = null;

            if (val && val.trim() !== "") {
                val = "%" + val + "%";
                query = this.curTab.getSearchQuery(val);
            }
        }

        this.findRecords(query);
    };

    APanel.prototype.cmd_chat = function () {
        var record_ID = this.curTab.getRecord_ID();
        if (record_ID == -1)	//	No Key
        {
            this.aChat.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aChat.getAction(), false);
            }
            return;
        }

        //	Find display
        var infoName = null;
        var infoDisplay = null;
        for (var i = 0; i < this.curTab.getFieldCount(); i++) {
            var field = this.curTab.getField(i);
            if (field.getIsKey())
                infoName = field.getHeader();
            if ((field.getColumnName().toString() == "Name" || field.getColumnName().toString() == "DocumentNo")
                && (field.getValue() != null && field.getValue() != ""))
                infoDisplay = field.getValue();
            if (infoName != null && infoDisplay != null)
                break;
        }

        var self = this;
        //var onchatClose = function () { self.curTab.loadChats(); self.aChat.setPressed(self.curTab.hasChat()); };

        var chat = new VIS.Chat(record_ID, this.curTab.getCM_ChatID(), this.curTab.getAD_Table_ID(), infoName + ": " + infoDisplay, this.curWindowNo);

        chat.onClose = function () {
            self.curTab.loadChats();
            self.aChat.setPressed(self.curTab.hasChat());
            self = null;
        }
        chat.show();
    };

    APanel.prototype.cmd_appointment = function () {
        var record_ID = this.curTab.getRecord_ID();
        ///Check table has Email column

        var AD_Table_ID = this.curTab.getAD_Table_ID();
        //log.Info("Record_ID=" + record_ID);
        if (record_ID == -1)	//	No Key
        {
            return;
        }
        VIS.AppointmentsForm.init(AD_Table_ID, record_ID, 0, 0, false, true);
    };

    APanel.prototype.cmd_task = function () {
        var record_ID = this.curTab.getRecord_ID();
        ///Check table has Email column

        var AD_Table_ID = this.curTab.getAD_Table_ID();
        //log.Info("Record_ID=" + record_ID);
        if (record_ID == -1)	//	No Key
        {
            return;
        }
        VIS.AppointmentsForm.init(AD_Table_ID, record_ID, 0, 0, true);
    };

    APanel.prototype.cmd_letter = function () {
        var record_ID = this.curTab.getRecord_ID();
        if (record_ID == -1)	//	No Key
        {
            this.aLetter.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aLetter.getAction(), false);
            }
            return;
        }

        var email = new VIS.Email("", this.curTab, this.curGC, record_ID, false);
        var c = new VIS.CFrame();
        c.setName(VIS.Msg.getMsg("Letter"));
        c.setTitle(VIS.Msg.getMsg("Letter"));
        c.hideHeader(true);
        c.setContent(email);
        c.show();
        email.initializeComponent();

    };

    APanel.prototype.cmd_email = function () {
        var record_ID = this.curTab.getRecord_ID();
        //List<DataGridRow> Rows = new List<DataGridRow>();
        //IList rowsource = _curGC.GetSelectedRows();
        // log.Info("Record_ID=" + record_ID);
        if (record_ID == -1)	//	No Key
        {
            this.aEmail.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aEmail.getAction(), false);
            }
            return;
        }

        //string to = "";
        //if (((DataUtil.DataObject)rowsource[0]).GetFieldValue("EMAIL") != null)
        //{
        //    if (_curGC.IsSingleRow())
        //    {
        //        object a = _curTab.GetValue("Email");
        //        if (a != null)
        //        {
        //            to = a.ToString();
        //        }
        //    }

        //    else//multi row selected
        //    {
        //        //_curGC.ge
        //        int count = rowsource.Count;
        //        if (count == 1)
        //        {
        //            object a = _curTab.GetValue("Email");
        //            if (a != null)
        //            {
        //                to = a.ToString();
        //            }
        //        }
        //        else
        //        {
        //            for (int i = 0; i < rowsource.Count; i++)
        //            {
        //                if (((DataUtil.DataObject)rowsource[i]).GetFieldValue("EMAIL") != null)
        //                {
        //                    to += ((DataUtil.DataObject)rowsource[i]).GetFieldValue("EMAIL").ToString().Trim() + ",";
        //                }
        //            }
        //            while (to.EndsWith(","))
        //            {
        //                to = to.Substring(0, to.Length - 1);
        //            }
        //        }
        //    }
        //}
        //else
        //{

        //}
        var email = new VIS.Email("", this.curTab, this.curGC, record_ID, true);

        var c = new VIS.CFrame();
        c.setName(VIS.Msg.getMsg("EMail"));
        c.setTitle(VIS.Msg.getMsg("EMail"));
        c.hideHeader(true);
        c.setContent(email);
        c.show();
        email.initializeComponent();

        //email.show();
    };

    APanel.prototype.cmd_report = function () {

        if (!VIS.MRole.getDefault().getIsCanReport(this.curTab.getAD_Table_ID())) {
            VIS.ADialog.warn("AccessCannotReport");
            return;
        }
        if (this.curTab.needSave(true, false)) {
            this.cmd_save(true);
            return;
        }
        //var rquery = this.curTab.query; //new VIS.Query(this.curTab.getTableName());
        var rquery = null;
        if (this.curTab.query && this.curTab.query.list.length > 0)
            rquery = this.curTab.query;
        else
            rquery = new VIS.Query(this.curTab.getTableName());


        rquery.tableName = this.curTab.getTableName();
        var queryColumn = this.curTab.getLinkColumnName();
        if (queryColumn.length == 0)
            queryColumn = this.curTab.getKeyColumnName();
        var infoName = null;
        var infoDisplay = null;
        for (var i = 0, j = this.curTab.getFieldCount(); i < j; i++) {
            var field = this.curTab.getField(i);
            if (field.getIsKey())
                infoName = field.getHeader();
            if ((field.getColumnName() == "Name" || field.getColumnName() == "DocumentNo")
                && field.getValue() != null)
                infoDisplay = field.getValue();
            if (infoName != null && infoDisplay != null)
                break;
        }

        var isParent = this.curTab.getParentColumnNames().length == 0;
        if (queryColumn.length != 0) {
            if (!isParent || (this.curTab.getLinkColumnName() != null && this.curTab.getLinkColumnName() != ""))    //only selected record to be printed
            {
                if (queryColumn.endsWith("_ID")) {
                    if (infoName == null && infoDisplay == null) {
                        rquery.addRestriction(queryColumn, VIS.Query.prototype.EQUAL,
                            VIS.context.getContextAsInt(this.curWindowNo, queryColumn));
                    }
                    else {
                        rquery.addRestriction(queryColumn, VIS.Query.prototype.EQUAL,
                            VIS.context.getContextAsInt(this.curWindowNo, queryColumn),
                            infoName, infoDisplay);
                    }
                }
                else {
                    if (infoName == null && infoDisplay == null) {
                        rquery.addRestriction(queryColumn, VIS.Query.prototype.EQUAL,
                            VIS.context.getContext(this.curWindowNo, queryColumn));
                    }
                    else {
                        rquery.addRestriction(queryColumn, VIS.Query.prototype.EQUAL,
                            VIS.context.getContext(this.curWindowNo, queryColumn),
                            infoName, infoDisplay);
                    }
                }
            }
        }

        if (this.curGC.onDemandTree) {
            if (!this.isSummaryVisible) {
                var report = new VIS.AReport(this.curTab.getAD_Table_ID(), rquery, this.curTab.getAD_Tab_ID(), this.curWindowNo, this.curTab, this.curGC.treeID, this.curGC.treeNodeID, false);
            }
            else {
                var report = new VIS.AReport(this.curTab.getAD_Table_ID(), rquery, this.curTab.getAD_Tab_ID(), this.curWindowNo, this.curTab, this.curGC.treeID, this.curGC.treeNodeID, true);
            }
        }
        else {
            var report = new VIS.AReport(this.curTab.getAD_Table_ID(), rquery, this.curTab.getAD_Tab_ID(), this.curWindowNo, this.curTab, 0, 0, false);
        }
    };

    APanel.prototype.cmd_print = function () {
        var rowsSource = this.curGC.getSelectedRows();
        if (rowsSource.length == 0) {
            VIS.ADialog.info('SelectRecord');
            return;
        }

        var AD_Process_ID = this.curTab.getAD_Process_ID();
        if (AD_Process_ID == 0) {
            return;
        }


        var sql = "VIS_118";
        var param = [];
        param[0] = new VIS.DB.SqlParam("@AD_Process_ID", AD_Process_ID);
        var AD_ReportFormat_ID = executeScalar(sql, param);


        sql = "VIS_119";
        var InstalledVersion = executeScalar(sql);



        if (rowsSource.length > 1 && AD_ReportFormat_ID > 0 && InstalledVersion && (InstalledVersion.toString() > ('1.0.0.3'))) {

            if (this.curTab.needSave(true, false)) {
                this.cmd_save(true);
                return;
            }

            var recIds = '';

            for (var i = 0; i < rowsSource.length; i++) {
                if (i == 0) {
                    recIds = rowsSource[i][this.curTab.getKeyColumnName().toLower()];
                }
                else {
                    recIds += ',' + rowsSource[i][this.curTab.getKeyColumnName().toLower()];
                }
            }
            var print = new VIS.APrint(AD_Process_ID, this.curTab.getAD_Table_ID(), 0, this.curWindowNo, recIds, this.curTab, true);
            print.start(this.aPrint.getListItmIT());
        }
        else {
            var recID = this.curTab.getRecord_ID();
            if (recID == -1) {
                VIS.ADialog.info(VIS.Msg.getMsg('SelectRecord'));
                return;
            }

            if (this.curTab.needSave(true, false)) {
                this.cmd_save(true);
                return;
            }

            var print = new VIS.APrint(AD_Process_ID, this.curTab.getAD_Table_ID(), recID, this.curWindowNo, null, this.curTab);
            print.start(this.aPrint.getListItmIT());
        }
        //var table_ID = this.curTab.getAD_Table_ID();
        //var record_ID = this.curTab.getRecord_ID();
        //var pi = new VIS.ProcessInfo('Print', AD_Process_ID, table_ID, record_ID);        
        //pi.setAD_User_ID(VIS.context.getAD_User_ID());
        //pi.setAD_Client_ID(VIS.context.getAD_Client_ID());

        //pctrl.process(this.curWindowNo);
    };

    APanel.prototype.cmd_sms = function () {
        var record_ID = this.curTab.getRecord_ID();
        //List<DataGridRow> Rows = new List<DataGridRow>();
        //IList rowsource = _curGC.GetSelectedRows();
        // log.Info("Record_ID=" + record_ID);
        if (record_ID == -1)	//	No Key
        {
            this.aSms.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aSms.getAction(), false);
            }
            return;
        }

        //string to = "";
        //if (((DataUtil.DataObject)rowsource[0]).GetFieldValue("EMAIL") != null)
        //{
        //    if (_curGC.IsSingleRow())
        //    {
        //        object a = _curTab.GetValue("Email");
        //        if (a != null)
        //        {
        //            to = a.ToString();
        //        }
        //    }

        //    else//multi row selected
        //    {
        //        //_curGC.ge
        //        int count = rowsource.Count;
        //        if (count == 1)
        //        {
        //            object a = _curTab.GetValue("Email");
        //            if (a != null)
        //            {
        //                to = a.ToString();
        //            }
        //        }
        //        else
        //        {
        //            for (int i = 0; i < rowsource.Count; i++)
        //            {
        //                if (((DataUtil.DataObject)rowsource[i]).GetFieldValue("EMAIL") != null)
        //                {
        //                    to += ((DataUtil.DataObject)rowsource[i]).GetFieldValue("EMAIL").ToString().Trim() + ",";
        //                }
        //            }
        //            while (to.EndsWith(","))
        //            {
        //                to = to.Substring(0, to.Length - 1);
        //            }
        //        }
        //    }
        //}
        //else
        //{

        //}
        var sms = new VIS.Sms(this.curTab, this.curGC, record_ID, false);
        var c = new VIS.CFrame();
        c.setName(VIS.Msg.getMsg("Sms"));
        c.setTitle(VIS.Msg.getMsg("Sms"));
        c.hideHeader(true);
        c.setContent(sms);
        c.show();
        sms.initializeComponent();
    };

    APanel.prototype.cmd_subscribe = function () {
        var record_ID = this.curTab.getRecord_ID();
        if (record_ID == -1)	//	No Key
        {
            this.aSubscribe.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aSubscribe.getAction(), false);
            }
            return;
        }
        var self = this;
        var reloadSubscribe = function () {
            self.curTab.loadSubscribe();
            self.aSubscribe.setPressed(self.curTab.HasSubscribed());
        };
        VIS.dataContext.subscribeUnsubscribeRecords(this.curTab.getCM_SubScribedID(), this.curTab.getAD_Window_ID(), record_ID, this.curTab.getAD_Table_ID(), reloadSubscribe);
    };

    APanel.prototype.cmd_ImportMap = function () {
        if (window.VDIU) {

            if (this.curTab.getIsReadOnly()) {
                VIS.ADialog.warn("ReadOnly");
                return;
            }

            var excel = new VDIU.ImportExcel(this.curTab.getAD_Window_ID(), this.gridWindow.getName());
            var c = new VIS.CFrame();
            c.setName(VIS.Msg.getMsg("Import"));
            c.setTitle(VIS.Msg.getMsg("Import"));
            //c.hideHeader(true);
            c.setContent(excel);
            c.show();
            excel.initialize();
        }
        else {
            VIS.ADialog.error("PleaseInstallExcelImportModule");

        }
    };

    APanel.prototype.cmd_attachment = function (isViewOnly) {
        //alert("attachment");
        if (this.curTab.getRecord_ID() < 1) {
            this.aAttachment.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aAttachment.getAction(), false);
            }
            return;
        }
        var self = this;
        var att = new VIS.attachmentForm(this.curTab.getWindowNo(), 0, this.curTab.getAD_Table_ID(),
            this.curTab.getRecord_ID(), '', null, null, null, isViewOnly);
        att.setIsWindowAction(true);

        att.show();
        att.onClose = function () {
            self.curTab.loadAttachments();
            if (self.aAttachment)
                self.aAttachment.setPressed(self.curTab.hasAttachment());
            self = null;
        };

        //att.on('close', function () {
        //    self.curTab.loadAttachments();
        //    self.aChat.setPressed(self.curTab.hasAttachment());
        //    self = null;
        //    //this.aAttachment.setPressed(this.curTab.hasAttachment());
        //});

    };

    APanel.prototype.cmd_history = function () {
        var atHistory = null;
        var c_Bpartner_ID = 0;
        var AD_User_ID = 0;
        if (Object.keys(this.curGC.getColumnNames()).indexOf("C_BPartner_ID") > 0 || (this.curTab.getField("C_BPartner_ID") != null && this.curTab.getField("C_BPartner_ID").getValue() > 0)) {
            c_Bpartner_ID = this.curTab.getField("C_BPartner_ID").getValue();
            //atHistory = new VIS.AttachmentHistory(this.curTab.getAD_Table_ID(), this.curTab.getRecord_ID(), this.curTab.getField("C_BPartner_ID").getValue());
        }

        if (Object.keys(this.curGC.getColumnNames()).indexOf("AD_User_ID") > 0 || (this.curTab.getField("AD_User_ID") != null && this.curTab.getField("AD_User_ID").getValue() > 0)) {
            AD_User_ID = this.curTab.getField("AD_User_ID").getValue();
        }

        atHistory = new VIS.AttachmentHistory(this.curTab.getAD_Table_ID(), this.curTab.getRecord_ID(), c_Bpartner_ID, AD_User_ID, this.curTab.getKeyColumnName());

        atHistory.show();
    };

    APanel.prototype.cmd_RecordShared = function () {
        if (this.curTab.getRecord_ID() < 1) {
            this.aSharedRecord.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aSharedRecord.getAction(), false);
            }
            return;
        }

        if (this.curTab.isCurrentRecordShare) {
            VIS.ADialog.info('ActionNotAllowedHere');
            return;
        }

        if (this.curGC.getSelectedRows().length > 1) {
            VIS.ADialog.info('ShareOneRecordOnly');
            return;
        }

        var isAccess = 'Y';
        $.ajax({
            url: VIS.Application.contextUrl + "JsonData/CheckAccessForAction",
            dataType: "json",
            async: false,
            data: {
                columnName: 'ShowSharedRecords',
                roleID: VIS.context.getAD_Role_ID()
            },
            error: function (e) {
                //VIS.ADialog.info(VIS.Msg.getMsg('ERRORGettingPostingServer'));
            },
            success: function (result) {
                isAccess = JSON.parse(result);
            }
        });

        if (isAccess != 'Y') {
            VIS.ADialog.info('ActionNotAllowedHere');
            return false;
        }

        var self = this;
        var parentTableID = 0;
        if (this.curTab.getParentTab()) {
            parentTableID = this.curTab.getParentTab().getAD_Table_ID();
            if (!this.curTab.getParentTab().hasShared() && this.curTab.getParentTab().getValue('AD_Org_ID') != 0) {
                VIS.ADialog.info("ShareParentFirst", true, "", "");
                this.aSharedRecord.setPressed(false);
                return;;
            }

        }


        var atRecordShared = new VIS.RecordShared(this.curTab.getRecord_ID(), this.curTab.getAD_Table_ID(), this.curTab.getAD_Tab_ID(), this.curTab.getAD_Window_ID(), this.curWindowNo, this.curTab.linkValue, parentTableID, this.curTab);
        atRecordShared.onClose = function () {
            self.curTab.loadShared();
            self.aSharedRecord.setPressed(self.curTab.hasShared());
            self = null;
        }
        atRecordShared.show();
    }

    APanel.prototype.clearSearchText = function () {
        if (this.curGC) {
            this.curGC.searchCode = "";
            this.curTab.searchText = "";
            this.curTab.userQueryID = "";
        }
    };

    APanel.prototype.cmd_finddialog = function () {

        var find = new VIS.Find(this.curWindowNo, this.curTab, 0, this);
        var self = this;
        var savedSearchName = "";
        find.onClose = function () {

            if (find.getIsOKPressed() || find.needRefresh()) {
                //if (find.getIsOKPressed()) {

                self.setAdvancedSerachText(true, "");
                self.clearSearchText();

                if (self.isSummaryVisible) {
                    self.curTab.setShowSummaryNodes(true);
                }
                else {
                    self.curTab.setShowSummaryNodes(false);
                }
                var query = find.getQuery();
                //	History
                var onlyCurrentDays = find.getCurrentDays();
                var created = find.getIsCreated();
                savedSearchName = find.getSavedQueryName();
                self.curTab.userQueryID = find.getSavedID(); //find.getID();
                self.curTab.searchCode = find.getSearchCode();
                self.curTab.searchText = find.getSearchName();
                find.dispose();
                find = null;

                //Set Page value to 1
                self.curTab.getTableModel().setCurrentPage(1);
                //	Confirmed query
                if (query != null && query.getIsActive()) {
                    //log.config(query.toString());
                    self.curTab.setQuery(query);
                    self.curGC.query(0, 0, created);   //  autoSize
                }
                else if (query != null) {
                    var maxRows = VIS.MRole.getDefault().getMaxQueryRecords();
                    //self.log.config("OnlyCurrentDays=" + onlyCurrentDays
                    //        + ", MaxRows=" + maxRows);
                    self.curTab.setQuery(null);	//	reset previous queries
                    self.curGC.query(onlyCurrentDays, maxRows, created);   //  autoSize
                }
                var findPressed = self.curTab.getIsQueryActive() || self.curTab.getOnlyCurrentDays() > 0;
                self.aFind.setPressed(findPressed);

                self.curGC.aFilterPanel.setFilterLineAdvance(self.curTab.userQueryID);

            }
            ////Refresh everytime bcoz smtimes user create an ASearch and save it, 
            ////but this search has no data for now. but search will be saved, so we have to refresh list everytime
            self.refreshSavedASearchList(false, savedSearchName);

            self = null;
        };
        find.show();

    };

    APanel.prototype.cmd_preference = function () {

        var uf = new VIS.Framework.UserPreference();
        uf.load();
        uf.showDialog();
        uf = null;

    };

    //lakhwinder
    APanel.prototype.cmd_infoWindow = function () {

        VIS.InfoMenu.show(this.aInfo.getItem());
    };

    APanel.prototype.cmd_zoomAcross = function () {
        var Record_ID = this.curTab.getRecord_ID();

        if (Record_ID > 0) {
            //alert('ZoomAcross');
            //	Query
            var query = new VIS.Query();
            //	Current row
            var link = this.curTab.getKeyColumnName();
            //	Link for detail records
            if (link.length == 0)
                link = this.curTab.getLinkColumnName();
            if (link.length != 0) {
                if (link.endsWith('_ID'))
                    query.addRestriction(link, VIS.Query.prototype.EQUAL, VIS.context.getContextAsInt(this.curWindowNo, link));
                else
                    query.addRestriction(link, VIS.Query.prototype.EQUAL, VIS.context.getContext(this.curWindowNo, link));
            }
            //AZoomAcross zoom = new AZoomAcross(aZoomAcross.GetDropDownButton(), _curTab.GetTableName(), query, _curTab.GetAD_Window_ID());
            var zoom = new VIS.AZoomAcross(this.aZoomAcross, this.curTab.getTableName(), query, this.curTab.getAD_Window_ID(), this, this.aZoomAcross.getListItmIT(), link, Record_ID);
            zoom.init();

            //zoom.ShowPopup(bnavZoomAcross, _curTab.GetTableName(), query, windowV0.AD_Window_ID);

            //zoom = null;
        }

        // VIS.InfoMenu.show(this.aInfo.getItem());

    };

    /**
     * 	Open/View Request
     */
    APanel.prototype.cmd_request = function () {
        var record_ID = this.curTab.getRecord_ID();
        //log.Info("ID=" + record_ID);
        if (record_ID > 0) {
            var AD_Table_ID = this.curTab.getAD_Table_ID();
            //var C_BPartner_ID = 0;
            var BPartner_ID = this.curTab.getValue("C_BPartner_ID");
            //if (BPartner_ID != null)
            //    C_BPartner_ID = parseInt(BPartner_ID);

            var req = new VIS.ARequest(this.aRequest, AD_Table_ID, record_ID, BPartner_ID, null, this.aRequest.getListItmIT());
            req.getRequests();
            req = null;
        }
    };

    APanel.prototype.cmd_markToExport = function () {
        var recID = this.curTab.getRecord_ID();
        var rowsource = this.curGC.getSelectedRows();
        var recStr = null;
        var table_ID = this.curTab.getAD_Table_ID();
        var tableName = this.curTab.getTableName();
        if (recID == -1)	//	No Key
        {
            var data = {
                AD_Table_ID: table_ID
            };
            var res = VIS.dataContext.getJSONData(VIS.Application.contextUrl + "JsonData/GetKeyColumns", data);
            if (res == null) {
                return;
            }

            //$.ajax({
            //    url: VIS.Application.contextUrl + "JsonData/GetKeyColumns",
            //    dataType: "json",
            //    type: "POST",                
            //    data: {
            //        AD_Table_ID: table_ID
            //    },
            //    error: function () {
            //        return;
            //    },
            //    success: function (dyndata) {

            //        var _recordID = "";
            //        var _recordID2 = "";

            //        if (this.curGC.singleRow)
            //        {
            //            var a = this.curGC.getValue(keyNames[0]);
            //            var b = this.curGC.getValue(keyNames[1]);
            //            if (a != null && b != null)
            //            {
            //                _recordID = a.toString();
            //                _recordID2 = b.toString();
            //            }
            //        }
            //    }
            //});
        }
        else {
            var _primaryKey = tableName + "_ID";
            var _recordID = "";

            //Single Row
            if (this.curGC.singleRow) {
                recStr = recID;
                var markM = new VIS.MarkModule();

                markM.init(recStr, table_ID, tableName);
                markM.show();
                var self = this;
                markM.onClose = function () {
                    self.curTab.loadMarking();
                    self.aMarkToExport.setPressed(self.curTab.hasMarked());
                    self = null;
                };
                return;
            }
            //MultiRow 
            else {
                var count = rowsource.length;
                if (count == 1) {
                    _recordID = recID;
                }
                else {
                    for (var i = 0; i < rowsource.length; i++) {
                        _recordID += rowsource[i][_primaryKey.toLowerCase()] + ',';

                    }
                    if (_recordID.endsWith(",")) {
                        _recordID = _recordID.substring(0, _recordID.length - 1);
                    }
                }

                var markM = new VIS.MarkModule();
                markM.init(_recordID, table_ID, tableName);
                markM.show();
                var self = this;
                markM.onClose = function () {
                    self.curTab.loadMarking();
                    self.aMarkToExport.setPressed(self.curTab.hasMarked());
                    self = null;
                };
                return;
            }
        }


        //var markM = new VIS.MarkModule();
        //markM.show();
    };

    APanel.prototype.cmd_lock = function () {
        var locked = false;
        if (!this.isPersonalLock) {
            return;
        }
        var record_ID = this.curTab.getRecord_ID();
        if (record_ID == -1 || record_ID < 0)	//	No Key
        {
            return;
        }

        var isAccess = 'Y';
        $.ajax({
            url: VIS.Application.contextUrl + "JsonData/CheckAccessForAction",
            dataType: "json",
            async: false,
            data: {
                columnName: 'IsPersonalLock',
                roleID: VIS.context.getAD_Role_ID()
            },
            error: function (e) {
                //VIS.ADialog.info(VIS.Msg.getMsg('ERRORGettingPostingServer'));
            },
            success: function (result) {
                isAccess = JSON.parse(result);
            }
        });

        if (isAccess != 'Y') {
            VIS.ADialog.info('ActionNotAllowedHere');
            return false;
        }


        this.curTab.locks(VIS.context, record_ID, this.aLock.getIsPressed());
        this.curTab.loadAttachments();			//	reload
        locked = this.curTab.getIsLocked();
        this.aLock.setPressed(locked);
    };


    APanel.prototype.cmd_recAccess = function () {


        var isAccess = 'Y';
        $.ajax({
            url: VIS.Application.contextUrl + "JsonData/CheckAccessForAction",
            dataType: "json",
            async: false,
            data: {
                columnName: 'IsPersonalAccess',
                roleID: VIS.context.getAD_Role_ID()
            },
            error: function (e) {
                //VIS.ADialog.info(VIS.Msg.getMsg('ERRORGettingPostingServer'));
            },
            success: function (result) {
                isAccess = JSON.parse(result);
            }
        });

        if (isAccess != 'Y') {
            VIS.ADialog.info('ActionNotAllowedHere');
            return false;
        }

        var recAccessDialog = new VIS.RecordAccessDialog();
        recAccessDialog.Load(this.curTab.getAD_Table_ID(), this.curTab.getRecord_ID());

    };

    APanel.prototype.ShowSummaryNodes = function () {
        if (this.isSummaryVisible) {
            this.aShowSummaryLevel.setPressed(false);
            this.isSummaryVisible = false;
        }
        else {
            this.aShowSummaryLevel.setPressed(true);
            this.isSummaryVisible = true;
        }
    };

    APanel.prototype.cmd_call = function () {

        var record_ID = this.curTab.getRecord_ID();
        if (record_ID == -1)	//	No Key
        {
            this.aCall.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled(this.aCall.getAction(), false);
            }
            return;
        }
        var table_ID = this.curTab.getAD_Table_ID();

        if (VA048 && VA048.Apps) {
            var call = new VA048.Apps.CallForm();
            call.initializeComponent(table_ID, record_ID);

            var c = new VIS.CFrame();
            c.setName(VIS.Msg.getMsg("Call"));
            c.setTitle(VIS.Msg.getMsg("Call"));
            c.hideHeader(true);
            c.setContent(call);
            c.show();
        }
        else {
            alert(VIS.Msg.getMsg("Please install Communication module first"));
        }
    };

    /* END */

    /**
     *return Last selected view  (card Or Multi)
     * */
    APanel.prototype.getLastView = function () {
        if (!this.lastView)
            this.lastView = "";
        return this.lastView;
    };

    /**
     * Set Enable disable Back button   
     */
    APanel.prototype.setBackEnable = function () {
        if (this.tabStack.length == 1 && this.tabStack[0].tabView.length <= 1) {
            this.aBack.setEnabled(false);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled("BVW", false);
            }
        } else {
            this.aBack.setEnabled(true);
            if (this.curGC) {
                this.curGC.vGridPanel.setEnabled("BVW", true);
            }
        }
    };


    /** 
     *  dispose
     */


    APanel.prototype.dispose = function () {

        if (this.aParentDetail)
            this.aParentDetail.dispose();

        if (this.curST != null) {
            this.curST.unRegisterAPanel();
            this.curST = null;
        }
        this.vTabbedPane.dispose();
        this.vTabbedPane = null;
        if (this.gridWindow) {
            this.gridWindow.dispose();
            this.gridWindow = null;
            this.ctx.setAutoCommit(this.$parentWindow.getWindowNo(), false);
            this.ctx.removeWindow(this.$parentWindow.getWindowNo());
            VIS.MLookupCache.cacheReset(this.$parentWindow.getWindowNo());
        }



        this.ctx = null;
        this.$parentWindow = null;
        this.tabPages = null;
        this.curGC = null;
        this.curST = null;
        this.aParentDetail = null;
        this.curTab = null;
        this.disposeComponent();

    };

    APanel.prototype.setAdvanceWhere = function (advanceWhere) {
        this.advanceWhere = advanceWhere;
    };

    APanel.prototype.getAdvanceWhere = function () {
        return this.advanceWhere;
    };

    APanel.prototype.setFilterWhere = function (filterWhere) {
        this.filterWhere = filterWhere;
    };

    APanel.prototype.getFilterWhere = function () {
        return this.filterWhere;
    };

    APanel.prototype.setAdvanceFlag = function (advanceFlag) {
        this.advanceFlag = advanceFlag;
    };

    APanel.prototype.getAdvanceFlag = function () {
        return this.advanceFlag;
    };

    APanel.prototype.setFilterFlag = function (filterFlag) {
        this.filterFlag = filterFlag;
    };

    APanel.prototype.getFilterFlag = function () {
        return this.filterFlag;
    };

    APanel.prototype.setIsAdvanceSearch = function (isAdvancesearch) {
        this.isAdvancesearch = isAdvancesearch;
    };

    APanel.prototype.getIsAdvanceSearch = function () {
        return this.isAdvancesearch;
    };

    APanel.prototype.getIsFilter = function (isFilter) {
        this.isFilter = isFilter;
    };

    APanel.prototype.setIsFilter = function () {
        return this.isFilter;
    };

    //****************** APanel END ***********************//

    //Assignment Gobal Namespace
    VIS.APanel = APanel;

}(VIS, jQuery));