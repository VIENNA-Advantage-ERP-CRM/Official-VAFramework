; (function (VIS, $) {


    var tmpTabPnl = document.querySelector('#vis-ad-tabpnltmp').content;// $("#vis-ad-windowtmp");

    function VTabPanel(windowNo,wWidth) {
        this.width = wWidth;
        this.tabPanels = [];
       // this.panelSize = 50;
        //var panelMaxWidth = $(document).width() / 2;

        var clone = document.importNode(tmpTabPnl, true);

        var $outerwrap = $(clone.querySelector(".vis-ad-w-p-ap-tp-outerwrap"));
        var $ulIconList = $outerwrap.find('.vis-ad-w-p-ap-tp-o-icorbar ul');
        var $divHead = $outerwrap.find('.vis-ad-w-p-ap-tp-o-b-head');
        var $spnName = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-head h6");
        var $spnClose = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-head span");
        var $divContent = $outerwrap.find(".vis-ad-w-p-ap-tp-o-b-content");

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
                self.setCurrentPanel($target.data('cname'), windowNo, $target.data('extrainfo'));
            }
            else 
                self.setCurrentPanel(null);
            if (self.curTabPanel) {
                $divContent.append(self.curTabPanel.getRoot());
                self.setSize(wWidth);
            }
            else
                self.setSize(35);
        };

        $spnClose.on("click", function () {
            setContent(null);
            //$divContent.empty();
            //self.setCurrentPanel(null);
            //self.setWidth(35);
            //if (selLI)
            //    selLI.removeClass("vis-selected-list");
        });

        this.getRoot = function () {
            return $outerwrap;
        }

        this.getcurTabPanel = function () {
            return this.curTabPanel;
        }

        this.setPanelList = function (htm, defPnlId) {
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
            var tWidth = $outerwrap.closest('.vis-ad-w-p-center').width() -40;
            var height = $outerwrap.closest('.vis-ad-w-p-center').height() - 40;

            if (evt && !evt.isClosed) {
                //if (this.isHorizontalAligned && !evt.isHorizontal)
                //    tWidth = tWidth - evt.width;
                //else if (!this.curTabPanel.curTab.getIsTPBottomAligned() && evt.isHorizontal) {
                //    //height
                //}
            }
            

            if (size && size > 40 && this.curTabPanel) {

                if (this.isHorizontalAligned) { // VIS0228 - for Horizontal as discussed with Mukesh Sir 10/07/2023 

                    $outerwrap.css({
                        'height': '100%',
                        'width': '100%'
                    });
                    
                    
                    $divContent.css({
                        'height': '100%',
                        'width': tWidth+'px',
                        'overflow': 'auto'
                    });
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

    VTabPanel.prototype.init = function (gTab) {
        this.gTab = gTab;
        this.isHorizontalAligned = this.gTab.getIsTPBottomAligned()
        var panels = this.gTab.getTabPanels();

        var defPnlId = 0;

        if (panels && panels.length > 0) {
            var str = [];
            defPnlId = panels[0].getAD_TabPanel_ID();

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
                if (iconPath.indexOf('.')>-1)
                    str.push('<img alt = "' + panels[i].getName() + '" title = "' + panels[i].getName() +
                        '"  src = "' + VIS.Application.contextUrl + 'Areas/' + iconPath + '" onerror=this.src="' + VIS.Application.contextUrl + 'Areas/VIS/Images/base/defpanel.ico"></img >');
                else
                    str.push('<span> <i title = "' + panels[i].getName() +'" class="' + iconPath + '" ></i></span>');

                str.push('</li>');

                if (panels[i].getIsDefault())
                    defPnlId = panels[i].getAD_TabPanel_ID();
            }
        }
        this.setPanelList(str.join(' '),defPnlId);
    };

    VTabPanel.prototype.addSizeChangeListner = function (lsner) {
        this.sizeChangedListner = lsner;
    };

    VTabPanel.prototype.setCurrentPanel = function (className, windowNo,extrainfo) {
        if (this.curTabPanel) {
            if (this.curTabPanel.dispose) {
                this.curTabPanel.dispose();
            }
            this.curTabPanel = null;
        }
        if (className) {
            var type = VIS.Utility.getFunctionByName(className, window);
            if (type) {
                var panel = new type();
                panel.startPanel(windowNo, this.gTab, extrainfo);
                this.curTabPanel = panel;
                if (this.gTab.getRecord_ID() > -1 || this.gTab.getCurrentRow() > -1) {
                    panel.refreshPanelData(this.gTab.getRecord_ID(), this.gTab.getTableModel().getRow(this.gTab.getCurrentRow()));
                }
            }
        }
    };

    VTabPanel.prototype.refreshPanelData = function (rec_Id,dataRow) {
        if (this.curTabPanel) {
            this.curTabPanel.refreshPanelData(rec_Id, dataRow);
        }
    }

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
    }

    VIS.VTabPanel = VTabPanel;

}(VIS, jQuery));