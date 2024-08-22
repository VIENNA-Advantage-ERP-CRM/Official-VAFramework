﻿; (function (VIS, $) {


    var tmpTabPnl = document.querySelector('#vis-ad-tabpnltmp').content;// $("#vis-ad-windowtmp");

    function VTabPanel(windowNo,wWidth) {
        this.width = wWidth;
        this.tabPanels = []; //All object
        this.isShowAll = false;
        this.curTabPanel = null;
        this.windowNo = windowNo;
      

        var clone = document.importNode(tmpTabPnl, true);

        var $outerwrap = $(clone.querySelector(".vis-ad-w-p-ap-tp-outerwrap"));
        var $ulIconList = $outerwrap.find('.vis-ad-w-p-ap-tp-o-icorbar ul');
        var $divHead = $outerwrap.find('.vis-ad-w-p-ap-tp-o-b-head');
        var $spnName = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-head h6");
        var $spnClose = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-head span");
        var $divContent = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-content");
        var $divBody = $outerwrap.find(".vis-ad-w-p-ap-tp-o-body");

        this.isClosed = true;

        
        if (wWidth <= 25) {
            if (wWidth <= 0)
                wWidth = 75;
            else
                wWidth = 25;
        }
        else if (wWidth > 75)
            wWidth = 75

       
            wWidth = 100 - wWidth;
        wWidth = ($(document).width() * wWidth) / 100;
        this.width = wWidth;
        

    /********************************* END Tab Panels ***********************************/
        var self = this;
        var selLI = null;

        $ulIconList.on("click", 'LI', function (e) {
            setContent($(e.currentTarget));
        });

        function setContent($target) {
            if (selLI)
                selLI.removeClass("vis-ad-w-p-ap-tp-o-li-selected");
            selLI = null;

            $divContent.empty();

            if ($target) {
                selLI= $target.addClass('vis-ad-w-p-ap-tp-o-li-selected');
                $spnName.text($target.data('name'));
                var pnl = self.initalizeTabPanel($target.data('cname'), windowNo, $target.data('extrainfo'));
                self.resetTabPanel(pnl);
            }
            else 
                self.resetTabPanel(null);
            if (self.curTabPanel) {
                $divContent.append(self.curTabPanel.getRoot());
                self.setSize(wWidth);
            }
            else
                self.setSize(35);
        };

        $spnClose.on("click", function () {
            setContent(null);
            
        });
        this.getBody = function () {
            return $divBody;
        }

        this.getRoot = function () {
            return $outerwrap;
        }
        this.getContentDiv = function () {
            return $divContent;
        }

        this.setPanelList = function (htm) {
            $ulIconList.append(htm);
            var defaultPanel = $ulIconList.find("[default='true']").first();
            if (defaultPanel && defaultPanel.length > 0) {
                defaultPanel.trigger("click");
            }
            else {
                setContent(null);
            }
        };

        this.setSize = function (size,evt) {

            if (!this.isClosed && size && size > 40) {
                return;
            }
            if (size == 0) {
                size = this.width;
            }
            var tWidth = $outerwrap.closest('vis-ad-w-p-center-view').width() -20;
            var height = $outerwrap.closest('.vis-ad-w-p-center').height() - 40;

            if (evt && !evt.isClosed) {
                //if (this.isHorizontalAligned && !evt.isHorizontal)
                //    tWidth = tWidth - evt.width;
                //else if (!this.curTabPanel.curTab.getIsTPBottomAligned() && evt.isHorizontal) {
                //    //height
                //}
            }
            
            if (size && size > 40 && (this.curTabPanel || this.tabPanels.length>0)) {

                if (this.isHorizontalAligned) { // VIS0228 - for Horizontal as discussed with Mukesh Sir 10/07/2023

                    if (!this.isShowAll) {
                        $outerwrap.css({
                            'height': '100%',
                            'width': '100%'
                        });

                        $divContent.css({
                            'height': '100%',
                            'width': tWidth + 'px',
                            'overflow': 'auto'
                        });
                    }
                    else { //show all
                        $outerwrap.css({
                            'height': 'auto',
                            'width': '100%'
                        });

                        $divContent.css({
                            'height': 'auto',
                            'width': tWidth + 'px',
                            'display': 'flex',
                            'flex-direction': 'column',
                            'overflow': 'auto'
                        });
                    }

                    $divHead.hide();
                }
                else { //vertical
                    
                    $outerwrap.css({
                        'height': height + 'px',
                        'width': size + 'px'
                    });

                    $divContent.css({
                        'height': height + 'px',
                        'width': size - 35 + 'px',
                        'overflow': 'auto'
                    });
                   
                    $divHead.show();
                }

                $divContent.show();
                this.isClosed = false;
            }
            else {
                $outerwrap.css({
                    'height': '35px',
                    'width': '35px'
                });
                $divContent.css({
                    'height': '35px',
                    'width': '0px'
                });
                this.isClosed = true;
                $divHead.hide();
                $divContent.hide();
            }
            if (this.sizeChangedListner && this.sizeChangedListner.onSizeChanged)
                this.sizeChangedListner.onSizeChanged();
        };

        this.disposeComponent = function () {
            $outerwrap.remove();
            $divContent.remove();
            selLI = null;
            self = null;
        }
    }

    /**
     * 
     * @param {any} gTab
     */
    VTabPanel.prototype.init = function (gTab) {
        this.gTab = gTab;
        this.isHorizontalAligned = this.gTab.getIsTPBottomAligned()
        var panels = this.gTab.getTabPanels();
        this.isShowAll = this.gTab.getIsTPBottomShowAll();

        if (!this.isShowAll) { //old
            if (panels && panels.length > 0) {
                var str = [];

                for (var i = 0; i < panels.length; i++) {
                    var iconPath = '';
                    if (panels[i].getIconPath()) {
                        iconPath = panels[i].getIconPath();
                    }
                    else {
                        iconPath = 'fa fa-object-group';// 'VIS/Images/base/defPanel.ico';// "fa fa-window-maximize";//'VIS/Images/base/defPanel.ico';
                    }
                    str.push('<li default="' + panels[i].getIsDefault() + '" data-panelid="' + panels[i].getAD_TabPanel_ID() +
                        '" data-cname="' + panels[i].getClassName() + '" data-name="' + panels[i].getName() + '"  data-extrainfo="' + panels[i].getExtraInfo() + '" >');
                    if (iconPath.indexOf('.') > -1)
                        str.push('<img alt = "' + panels[i].getName() + '" title = "' + panels[i].getName() +
                            '"  src = "' + VIS.Application.contextUrl + 'Areas/' + iconPath + '" onerror=this.src="' + VIS.Application.contextUrl + 'Areas/VIS/Images/base/defpanel.ico"></img >');
                    else
                        str.push('<span> <i title = "' + panels[i].getName() + '" class="' + iconPath + '" ></i></span>');

                    str.push('</li>');


                }
            }

            this.setPanelList(str.join(' '));
        }
        else {
            this.appedAllPanel(panels);
        }
    };

  /**
   * append all tab panel in conatiner
   * @param {any} panels
   */
    VTabPanel.prototype.appedAllPanel = function (panels) {
        //remove border

        var body = this.getBody();
        body.css({ 'box-shadow': 'unset', 'border-top': 'unset' });

        if (panels && panels.length > 0) {
            for (var i = 0; i < panels.length; i++) {
                var iconPath = '';
                if (panels[i].getIconPath()) {
                    iconPath = panels[i].getIconPath();
                }
                else {
                    iconPath = '';// fa fa-object-group';// 'VIS/Images/base/defPanel.ico';// "fa fa-window-maximize";//'VIS/Images/base/defPanel.ico';
                }
                var panel = this.initalizeTabPanel(panels[i].getClassName(), this.windowNo, panels[i].getExtraInfo(), panels[i]);
                if (panel) {
                    var contectDiv = this.getContentDiv();
                    var html = "<div class='vis-ad-w-p-ap-tp-body-head'>";
                    if (iconPath != '') {
                        html += "<span class='vis-ad-w-p-ap-tp-body-head-img'>" +
                            "<i class='" + iconPath + "'></i></span>";
                    }
                     html+="<span class='vis-ad-w-p-ap-tp-body-head-txt'> "
                        + panels[i].getName()
                        + "</span></div>";
                    contectDiv.append(html).append(panel.getRoot());
                    this.tabPanels.push(panel);
                }
            }
        }
        //add
        if (this.tabPanels.length < 1) {
            this.setSize(0);
            return;
        }
        this.setSize(this.width);
    };

    VTabPanel.prototype.addSizeChangeListner = function (lsner) {
        this.sizeChangedListner = lsner;
    };


    VTabPanel.prototype.resetTabPanel = function (tblPanel) {
        if (this.curTabPanel) {
            if (this.curTabPanel.dispose) {
                this.curTabPanel.dispose();
            }
            this.curTabPanel = null;
        }
        this.curTabPanel = tblPanel;
    }

    /**
     * Create Tab Pnale Object and set in variables
     * @param {any} className  class name of Tab Panel
     * @param {any} windowNo  current window No
     * @param {any} extrainfo  additional info if any
     */
    VTabPanel.prototype.initalizeTabPanel = function (className, windowNo, extrainfo) {
            
        var panel = null;
        if (className) {
            var type = VIS.Utility.getFunctionByName(className, window);
            if (type) {
                panel = new type();
                panel.startPanel(windowNo, this.gTab, extrainfo);
                if (this.gTab.getRecord_ID() > -1 || this.gTab.getCurrentRow() > -1) {
                    panel.refreshPanelData(this.gTab.getRecord_ID(), this.gTab.getTableModel().getRow(this.gTab.getCurrentRow()));
                }
            }
        }
       
        return panel;
    };


    /**
     * Refresh tab panel data
     * @param {any} rec_Id record Id
     * @param {any} dataRow  slected row object
     */


    VTabPanel.prototype.refreshPanelData = function (rec_Id,dataRow,action) {


        if (this.curTabPanel) {
            this.curTabPanel.refreshPanelData(rec_Id, dataRow,action);
        }
        else {
            for (var i = 0; i < this.tabPanels.length; i++) {

                this.tabPanels[i].refreshPanelData(rec_Id, dataRow,action);

            }
        }
    };

    VTabPanel.prototype.setTabPanelSize = function (size) {
        if (size == 0) {
            size = this.width;
        }
        this.setSize(size);
    }

    VTabPanel.prototype.dispose = function () {
        this.disposeComponent();
        this.sizeChnagedListner = null;
        this.gTab = null;
        if (this.curTabPanel) {
            this.curTabPanel.dispose();
            this.curTabPanel = null;
        }
        for (var i = 0; i < this.tabPanels.length; i++) {
            this.tabPanels[i].dispose();
            this.tabPanels[i] = null;
        }
        this.tabPanels = [];
    }

    VIS.VTabPanel = VTabPanel;

}(VIS, jQuery));