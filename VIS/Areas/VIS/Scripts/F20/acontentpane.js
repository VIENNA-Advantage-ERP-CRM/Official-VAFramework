﻿; (function (VIS, $) {
    //****************************************************//
    //**             VTabbedPane                       **//
    //**************************************************//

    /**
     *  multiptab and link tab view manager Pane - Window Tab
     *
     */
    function ContentPane(aTabbedPane, parentDiv) {
        this.aTabbedPane = aTabbedPane;

        var $root = parentDiv;

        this.tabLIObj = []; //Li element for tabs
        this.tabItems = []; //tab elements 
        this.tabIds = []; // ids of tab
        this.tabs = [];
        this.headerTab = null;

        this.aNew = null;
        this.aSave = null;
        this.aSaveNew = null;
        this.aDelete = null;
        this.aRefresh = null;

        this.isHidden = false;
        //tolbar 
        var $ulTabControl = null;
        var $divTabControl = null;
        var $divTabNav = null;
        var $divHeaderNav = null;
        var $divContent = null;
        var $ulToolbar = null;
        var $dynActionList = null;
        var $actionDiv = null;
        var $divUlTabNav = null;

        

        var self = this;

        function init() {
            //navigation and tab control
            $ulTabControl = $root.find(".vis-ad-w-p-t-c-inc-tc");;  // $("<ul class='vis-appsaction-ul vis-apanel-tabcontrol-ul'>");//tab control
            $divTabControl = $root.find(".vis-ad-w-p-t-c-inc");// $("<div class='vis-apanel-tabcontrol'>").append($ulTabControl);
            $divTabNav = $root.find(".vis-ad-w-p-inc-tabs-oflow").hide();// $("<div class='vis-apanel-tab-oflow'>").hide();
            $divHeaderNav = $root.find(".vis-ad-w-p-inc-tabs");
            $divUlTabNav = $root.find(".vis-ad-w-p-inc-tb").hide();

            $root.css('display', 'flex');

            $divContent = $root.find(".vis-ad-w-p-inc-content");
            $ulToolbar = $root.find(".vis-ad-w-p-inc-tb-lc");
            $dynActionList = $root.find(".vis-ad-w-p-inc-tab-a-list");
            $actionDiv = $root.find(".vis-ad-w-p-inc-tab-ac-buttons");
        }
        init();

        function display(hide) {
            self.isHidden = hide;
            if (hide) {
                $root.css('display', 'none');
            }
            else {
                $root.css('display', 'flex');
            }
            $root.data('lasttab', hide ? 'Y' : 'N');
        };
        //Action Perormed
        var onAction = function (action) {
            self.actionPerformed(action);
        };

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
            if (dir == 'r') {
                if ((cPos + offSet) >= ulWidth - offSet)
                    return;
                var ms = ulWidth - dWidth;
                s = cPos + offSet;
                $divTabControl.animate({ scrollLeft: s > ms ? ms : s }, 1000);
            }
            else if (dir == 'b') {
                if (cPos == 0)
                    return;
                s = (cPos - offSet);
                $divTabControl.animate({ scrollLeft: s < 0 ? 0 : s }, 1000);
                //$divTabControl.scrollLeft(cPos - offSet);
            }
            if (dir == 'rl') {
                if ((cPos + offSet) >= ulWidth - offSet)
                    return;
                var ms = ulWidth - dWidth;
                //s = cPos + offSet;
                $divTabControl.animate({ scrollLeft: ms }, 500);
            }
            else if (dir == 'bf') {
                if (cPos == 0)
                    return;
                s = (cPos - offSet);
                $divTabControl.animate({ scrollLeft: 0 }, 500);
                //$divTabControl.scrollLeft(cPos - offSet);
            }

        });

        /* set sub tabs for coposite view */
        this.setTabControl = function (tab) {
            this.resetListners();
            this.headerTab = tab;
            $ulTabControl.empty();
            //$divUlTabNav.show();
            if (tab.ChildTabsItems.length == 0) {
                display(true);
                return;
            }
            display();
            var isShowIcon = false;
            for (var i = 0; i < tab.ChildTabsItems.length; i++) {

                var childTab = tab.ChildTabsItems[i];
                var li = childTab.getListItm();

                //hide tab 
                if (tab.ChildTabs[i].getIsHideTabName()) {
                    li.hide();
                    continue;
                }
                else {
                    isShowIcon = true;
                    li.show();
                }

                this.tabLIObj[childTab.action] = li;
                $ulTabControl.append(li);

                childTab.setEnabled(false);
                childTab.onAction = null;

                if (tab.TabLevel + 1 >= tab.ChildTabs[i].getTabLevel()) {
                    childTab.onAction = this.onTabChange;
                    childTab.setEnabled(true);
                }

                


                //Tab elements
                tab.ChildEle[i].addSubTabDataStatusListner(this);
                this.tabItems.push(tab.ChildEle[i]);
                this.tabIds.push(childTab.getAction());
                this.tabs.push(childTab);

                if (i == 0) {
                    this.selectedTab = li;
                   // this.onTabChange(childTab.getAction());
                }
            }

            if (isShowIcon)
                $divUlTabNav.show();
            else
                $divUlTabNav.hide();
            
            //  this.setTabNavigation();
        };

        this.setSelectedTab = function (id) {
            if (this.selectedTab)
                this.selectedTab.removeClass("vis-apanel-tab-selected");
            this.selectedTab = this.tabLIObj[id];
            this.selectedTab.addClass("vis-apanel-tab-selected");
        };

        this.onTabChange = function (action) {
            self.tabActionPerformed(action);
            //alert("sub tab change" + action);
        };

        this.getLayout = function () {
            return $divContent;
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

        this.createToolBar = function () {

            var pnl = this.aTabbedPane.getAPanel();
            //1. toolbar action
            this.aRefresh = pnl.addActions(pnl.ACTION_NAME_REFRESH, null, true, true, false, onAction, null, "Shct_CV_Refresh", "Refresh");
            this.aDelete = pnl.addActions(pnl.ACTION_NAME_DELETE, null, true, true, false, onAction, null, "Shct_CV_Delete", "Delete");
            this.aNew = pnl.addActions(pnl.ACTION_NAME_NEW, null, true, true, false, onAction, null, "Shct_CV_New", "New");
            this.aIgnore = pnl.addActions("UNO", null, true, true, false, onAction, null, "Shct_CV_Ignore", "Ignore");
            this.aSave = pnl.addActions("SAR", null, true, true, false, onAction, null, "Shct_CV_Save", "Save");
            this.aSaveNew = pnl.addActions("SAN", null, true, true, false, onAction, null, "Shct_CV_SaveNew", "save-new");
            //this.aFind = pnl.addActions("Find", null, true, true, false, onAction, null, "Shct_Find");
            //this.aInfo = pnl.addActions("Info", null, true, true, false, onAction, null, "Shct_Info");
            //this.aReport = pnl.addActions("Report", null, true, true, false, onAction, null, "Shct_Report");
            //this.aPrint = pnl.addActions("Print", null, true, true, false, onAction, null, "Shct_Print");
            this.aMulti = pnl.addActions("Multi", null, false, true, true, onAction, true, "Shct_CV_MultiRow");

            $ulToolbar.append(this.aIgnore.getListItm());
            $ulToolbar.append(this.aNew.getListItm());
            $ulToolbar.append(this.aDelete.getListItm());
            $ulToolbar.append(this.aSave.getListItm());
            $ulToolbar.append(this.aSaveNew.getListItm());
            $ulToolbar.append(this.aRefresh.getListItm());
            $ulToolbar.append(this.aMulti.getListItm());

            
            //$ulToobar.append(this.aReport.getListItm());
            //$ulToobar.append(this.aPrint.getListItm());
            this.toolbarCreated = true;
        }

        this.createToolBar();

        this.finishLayout = function () {
            if (!VIS.Application.isMobile)
                $divTabControl.addClass("vis-ad-w-p-t-c-mob");
            $root.find('.vis-ad-w-p-c-inc-main').css('display', '');
        };

        this.setDynamicActions = function (gc,remove) {
            $actionDiv.css('display', 'none');
            if (gc == null)
                return;
            if (remove) {
                gc.detachDynamicAction();
            }
            else {
               
                var index = 0;
                var actions = [];
                if (gc.leftPaneLinkItems.length > 0) {
                    actions = this.curGC.leftPaneLinkItems;
                    for (index = 0; index < actions.length; index++) {
                        $dynActionList.append(actions[index].getControl());
                    }
                }
                index = 0;
                if (gc.rightPaneLinkItems.length > 0) {
                    actions = this.curGC.rightPaneLinkItems;
                    for (index = 0; index < actions.length; index++) {
                        $dynActionList.append(actions[index].getControl());
                    }
                }
                if (gc.leftPaneLinkItems.length > 0 || gc.rightPaneLinkItems.length > 0) {
                    $actionDiv.css('display', 'flex');
                    $actionDiv.find('span').show();
                }

                actions = null;
            }
        };

        this.disposeComponents = function () {
            self = null;
            $root.remove();
            $ulToobar = $ulNav = $root = $ulTabControl = $divTabControl = $divTabNav = $divHeaderNav = null;
            $dynActionList = $actionDiv = null;
        };
    };

    /**
     *  tab change event 
     * @param {string} action name
     */

    ContentPane.prototype.getIsHidden = function () {
        return this.isHidden;
    };


    /**
     * remove all listner and do cleanup 
     * */
    ContentPane.prototype.resetListners = function () {

        for (var i = 0; i < this.tabItems.length; i++) {
            this.tabItems[i].removeSubTabDataStatusListner();
            //this.tabItems[i].setVisible(false);
        }

        this.tabLIObj = [];
        this.tabItems = []; //tab elements 
        this.tabIds = [];
        this.tabs = [];
        this.setDynamicActions(this.curGC,true);

        if (this.curST)
            this.curST.setVisible(false);
        if (this.curGC)
            this.curGC.setVisible(false);

        this.curST = this.curGC = null;
        this.curTabIndex = -1;
    };

    ContentPane.prototype.getTabElement = function (action) {
        this.newTabIndex = this.tabIds.indexOf(action);
        return this.tabItems[this.newTabIndex];
    };

    ContentPane.prototype.getIsZoomToHeader = function (action) {
        if (this.curTabIndex == this.tabIds.indexOf(action)) {
            return true;
        }
        return false;
    };

    ContentPane.prototype.onParentTabChange = function (action,gc) {
        if (gc) {
            if (gc.aPanel.curTab.needSave()) {
                VIS.ADialog.warn('VIS_SaveParentFirst');
                return;
            }
            gc.switchRowPresentation();
        }
        action = action.replace('st_', '');
        
        this.aTabbedPane.getAPanel().onTabChange(action);
    };

    /**
     *	tab change
     *  @param action tab item's id
     */
    ContentPane.prototype.tabActionPerformed = function (action) {

        var back = false;
        var isAPanelTab = false;
        var tabEle = this.getTabElement(action);
        var curEle = this.curST || this.curGC;
        var oldGC = null;

        //// END

        var selfPanel = this;
        //  Workbench Tab Change

        
            ////  Just a Tab Change
            ////log.Info("Tab=" + tp);
            //this.curWinTab = this.vTabbedPane;
            //var tpIndex = this.curWinTab.getSelectedIndex();
        back = this.newTabIndex < this.curTabIndex ;
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
                        if (VIS.Env.getCtx().isAutoCommit(this.curWindowNo)) {
                            if (!this.curTab.dataSave(true)) {	//  there is a problem, so we go back	
                                //this.vTabbedPane.restoreTabChange();//m_curWinTab.setSelectedIndex(m_curTabIndex);
                                this.setBusy(false, true);
                                return false;
                            }
                        }
                       

                        else {
                            canExecute = false;
                            VIS.ADialog.confirm("SaveChanges?", true, this.curTab.getCommitWarning(), 'Confirm', function (results) {
                                if (results) {
                                    if (!selfPanel.curTab.dataSave(true)) {   //  there is a problem, so we go back
                                       
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
                    //this.curST.unRegisterAPanel();
                    curEle = this.curST;
                    this.curST = null;
                }

                 
                //if (!isAPanelTab)
                //    this.curGC = gc;
            }

        
        if (canExecute) {
            selfPanel.tabActionPerformedCallback(action, back, isAPanelTab, tabEle, curEle, oldGC, gc, st);
        }

        return true;
    };

    ContentPane.prototype.sizeChanged = function () {
        this.setTabNavigation();
        return;
    };

    ContentPane.prototype.refresh = function () {
        if (this.curGC) {
            this.curGC.vTable.resize();
        }
        this.setTabNavigation();
        return;
    };

    ContentPane.prototype.tabActionPerformedCallback = function (action, back, isAPanelTab, tabEle, curEle, oldGC, gc, st) {

        this.setDynamicActions(oldGC,true); //remove action

        if (this.getIsZoomToHeader(action)) {
            console.log("zoom to parent tab");

            this.onParentTabChange(action,oldGC);
            return false;
        }
        this.curTabIndex = this.newTabIndex;
        this.action = action;
        


        if (isAPanelTab) {
            this.curST = st;
            //st.registerAPanel(this);
            st.loadData();
        }
        else {
            this.curGC = gc;
            gc.activate(oldGC, null, true);


            //switchMutiview laways
            gc.switchMultiRow();


            this.setDynamicActions(this.curGC);
           
            this.curTab = gc.getMTab();
            //this.setDynamicActions();
            //PopulateSerachCombo(false);
            /*	Refresh only current row when tab is current(parent)*/

            if (!gc.isZoomAction && this.curTab.getTabLevel() > 0) {
                var queryy = new VIS.Query();
                this.curTab.query = queryy;
            }

            if (back && this.curTab.getIsCurrent()) {
                gc.dataRefresh();
            }
            else	//	Requery and bind
            {
                this.reQuery();
                
            }


            //if (this.curGC.onDemandTree) {
            //    this.aShowSummaryLevel.show();
            //}
            //else {
            //    this.aShowSummaryLevel.hide();
            //}


        }

        //	Order Tab
        if (isAPanelTab) {
            this.aMulti.setPressed(false);
            this.aMulti.setEnabled(false);
            this.aNew.setEnabled(false);
            this.aDelete.setEnabled(false);
            this.aRefresh.setEnabled(false);
        }
        else	//	Grid Tab
        {
            this.aMulti.setEnabled(true);
            this.aMulti.setPressed(this.curGC.getIsSingleRow() || this.curGC.getIsMapRow());
            this.aRefresh.setEnabled(true);
        }

        //hide Multiview
        this.aMulti.hide();

        if (curEle) {
            curEle.setVisible(false);
            curEle.getRoot().detach();
        }

        this.getLayout().append(tabEle.getRoot());
        tabEle.setVisible(true);

        this.setSelectedTab(action); //set Seleted tab

        this.setTabNavigation();

        curEle = tabEle = null;

        //if (this.curTab.getAD_Process_ID() == 0) {
        //    this.aPrint.setEnabled(false);
        //}
        //else this.aPrint.setEnabled(true);

        //if (this.curTab.getIsMapView()) {
        //    this.aMap.show();
        //}
        //else {
        //    this.aMap.hide();
        //}
    };

    ContentPane.prototype.reQuery = function () {

        if (this.curTabIndex < 0 && this.tabs.length>0) {
            this.onTabChange(this.tabs[0].getAction());
            return;
        }

        if (this.curGC) {
            this.curTab.getTableModel().setCurrentPage(1);
            if (!this.curGC.onDemandTree || this.curGC.isZoomAction) {
                this.curTab.searchText = "";
                this.curGC.query(this.curTab.getOnlyCurrentDays(), 0, false);	//	updated
            }
        }
    };

    /**
    *	Data Status Listener (row change)			^ | v
    *  @param e event 
    */
    ContentPane.prototype.dataStatusChanged = function (e) {
        if (!e) {
            if (this.curGC) {
                if (this.curTab.needSave(true, false)) {   //  do we have real change
                    if (this.curTab.needSave(true, true)) {
                        this.curGC.dataIgnore();
                    }
                }
                this.curGC.activateTree();
            }
            this.reQuery();
        }
        else {
            $ths = this;
            //  Confirm Error
            if (e.getIsError() && !e.getIsConfirmed()) {
               // VIS.ADialog.error(e.getAD_Message(), true, e.getInfo());

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
            //  Confirm Warning
            else if (e.getIsWarning() && !e.getIsConfirmed()) {
                VIS.ADialog.warn(e.getAD_Message(), true, e.getInfo());
                e.setConfirmed(true);   //  show just once - if MTable.setCurrentRow is involved the status event is re-issued
            }

            //	update Change
            var changed = e.getIsChanged() || e.getIsInserting();
            var readOnly = this.curTab.getIsReadOnly();
            var insertRecord = !readOnly;
            if (insertRecord)
                insertRecord = this.curTab.getIsInsertRecord();
            this.aNew.setEnabled(!changed && insertRecord);
           
            this.aRefresh.setEnabled(!changed);
            this.aDelete.setEnabled(!changed && !readOnly && e.getCurrentRow() > -1);
            //
            if (readOnly && this.curTab.getIsAlwaysUpdateField())
                readOnly = false;
            this.aIgnore.setEnabled(changed && !readOnly);
            this.aSave.setEnabled(changed && !readOnly);
            this.aSaveNew.setEnabled(changed && !readOnly);
           
            //
            //	No Rows
            if (e.getTotalRows() == 0 && insertRecord) {
                this.aNew.setEnabled(true);
                this.aDelete.setEnabled(false);
            }

            //	Single-Multi
            this.aMulti.setPressed(this.curGC.getIsSingleRow() || this.curGC.getIsMapRow());
            

            if (this.curTab.getRecord_ID() < 1) {
               // this.aIgnore.setEnabled(false);
                //this.aSave.setEnabled(false);
                this.aDelete.setEnabled(false);
               // this.aNew.setEnabled(false);
            }
            else {
            }

            //	Transaction info
            //if (this.curWinTab == this.vTabbedPane) {
                this.evaluate(null);
            //}
        /******End Header Panel******/
        }
    };   //

    ContentPane.prototype.actionPerformed = function (action) {
        if (this.getIsUILocked())
            return;
        //	Do Screenrt w/o busy

        var selfPan = this;
        setTimeout(function () {
            //  Command Buttons

            if (action.source instanceof VIS.Controls.VButton) {
                if (!selfPan.actionButton(action.source)) {
                    selfPan.setBusy(false, true);
                }
                return;
            }

            selfPan.actionPerformedCallback(selfPan, action);

        });
        this.setBusy(true);
    };

    ContentPane.prototype.actionPerformedCallback = function (tis, action) {

        if (tis.aMulti.getAction() === action) { 
            //switch view depriciated . should open single view in Main tab
            //tis.aMulti.setPressed(!tis.curGC.getIsSingleRow());
            tis.tabActionPerformed(tis.action);
        }
        else if (tis.aRefresh.getAction() === action) {
            tis.cmd_save(false);
            tis.curGC.dataRefreshAll();
        }
        else if (tis.aIgnore.getAction() === action) {
            tis.curGC.dataIgnore();
        }
        else if (tis.aSave.getAction() === action) {
            tis.cmd_save(true);
        }
        else if (tis.aSaveNew.getAction() === action) {
            tis.cmd_saveNew(true);
        }
        else if (tis.aNew.getAction() === action) {
            if (this.curGC.aPanel.curTab.needSave()) {
                VIS.ADialog.warn('VIS_SaveParentFirst');
            }
            else {
                if (!tis.curTab.getIsInsertRecord()) {
                    return;
                }
                tis.curGC.dataNew(false);
            }
        }
        else if (tis.aDelete.getAction() === action) {
            tis.cmd_delete();
        }

        tis.setBusy(false);
        tis = null;
    };

    ContentPane.prototype.cmd_saveNew = function (manual) {
        var $this = this;
        this.cmd_save(true, function (result) {
            if (result) {
                $this.cmd_new(false);
            }
        });
    }

    ContentPane.prototype.cmd_save = function (manual, callback) {
        //cmd_save(false);
        //this.curGC.dataRefreshAll();
        if (this.curST != null)
            manual = false;
        this.errorDisplayed = false;
        //this.curGC.stopEditor(true);

        if (this.curST != null) {
            this.curST.saveData();
            this.aSave.setEnabled(false);	//	set explicitly
            this.aSaveNew.setEnabled(false);	//	set explicitly
            return;
        }

        var needExecute = true;

        if (this.curTab.getCommitWarning().length > 0 && this.curTab.needSave(true, false)) {
            needExecute = false;

            var selfPanel = this;

            VIS.ADialog.confirm("SaveChanges?", true, this.curTab.getCommitWarning(), "Confirm", function (result) {

                if (!result) {
                    return;
                }
                var retValue = selfPanel.curGC.dataSave(manual);

                if (manual && !retValue && !selfPanel.errorDisplayed) {

                }
                this.aTabbedPane.getAPanel().setStatusInfo(null, 'S');
                if (manual)
                    selfPanel.curGC.dynamicDisplay(-1);

            });

            if (callback) {
                callback(retValue);
            }
        }

        if (needExecute) {

            var retValue = this.curGC.dataSave(manual);

            if (manual && !retValue && !this.errorDisplayed) {

            }

            if (manual)
                this.curGC.dynamicDisplay(-1);

            if (callback) {
                callback(retValue);
            }
            this.aTabbedPane.getAPanel().setStatusInfo(null, 'S');
            return retValue;
        }

    };//Save

    ContentPane.prototype.cmd_delete = function () {
        if (this.curTab.getIsReadOnly())
            return;
        //var keyID = this.curTab.getRecord_ID();
        //prevent deletion if client access for Read Write does not exist for this Role.

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
                thisPanel.curGC.dataDeleteAsync(true);               
            }
            thisPanel = null;
        });


    };

    ContentPane.prototype.actionButton = function (btn) {
        this.aTabbedPane.getAPanel().actionButton(btn,this);
    };

    // Added By Mandeep --30-Mar-2023
    ContentPane.prototype.keyDown = function (evt) {
        if (evt.altKey && evt.ctrlKey && this.curGC) {
            var en = this.aNew.getIsEnabled();
            switch (evt.keyCode) {
                case 78:      //N for ADD
                    if (en)
                        this.actionPerformed(this.aNew.getAction());
                    break;
                case 68:      // D for Delete
                    if (en)
                        this.actionPerformed(this.aDelete.getAction());
                    break;
                case 81:      // Q for Refresh
                    if (en)
                        this.actionPerformed(this.aRefresh.getAction());
                    break;
                case 83:      //S for save                   
                    this.actionPerformed(this.aSave.getAction());
                    break;
                case 84:      // Arrow Down for next record
                    this.actionPerformed(this.aMulti.getAction());
                    break;
                case 90:      // Z for undo
                    if (!en)
                        this.actionPerformed(this.aIgnore.getAction());
                    break;

            }
            evt.preventDefault();
            evt.stopPropagation();
        }
    };

    /**
     * evaluate other tab logics
     * @param {any} e
     */
    ContentPane.prototype.evaluate = function (e) {
       // var tl = this.headerTab.TabLevel;
        for (var i = 0; i < this.tabItems.length; i++) {
            var c = this.tabItems[i];
            if (c instanceof VIS.GridController) {
                var gc = c;
                var display = (this.headerTab.TabLevel +1) >= this.headerTab.ChildTabs[i].getTabLevel()  &&     gc.getIsDisplayed();
                this.tabs[i].setEnabled(display);
            }
        }
    };

    ContentPane.prototype.setBusy = function (isBusy) {
        this.aTabbedPane.getAPanel().setBusy(isBusy);
    };

    ContentPane.prototype.getIsUILocked = function () {
        this.aTabbedPane.getAPanel().getIsUILocked();
    };

    ContentPane.prototype.dispose = function () {
        this.disposeComponents();
        this.aNew.dispose();
        this.aSave.dispose();
        this.aSaveNew.dispose();
        this.aDelete.dispose();
        this.aRefresh.dispose();

        this.aPanel = null;
    };

    VIS.ContentPane = ContentPane;

    } (VIS, jQuery));