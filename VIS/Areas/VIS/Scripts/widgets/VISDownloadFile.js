/************************************************************
 * Module Name : VIS
 * Purpose : To show & download the excel template files with respect to window name from cloud
 * chronological  : Development
 * Created Date   : 04 October 2024
 * Created by     : VAI049
 ***********************************************************/
; VIS = window.VIS || {};
; (function (VIS, $) {

    VIS.VIS_DownloadFile = function () {
        this.frame;
        this.windowNo;
        this.widgetInfo;
        var $bsyDiv;
        var $self = this;
        var $root = $('<div class="h-100 w-100">');
        this.log = VIS.Logging.VLogger.getVLogger("VIS_DownloadFile");
        var widgetID = 0;
        var templateExcelDetailLink;
        var formDialog;
        var excelItemDiv = null;
        var excelItem = null;

        // Initialize UI Elements
        this.load = function () {
            $root = $("<div>");
            excelItemDiv = $("<div class='VIS-excelItemsBlock'>");
            $root.append(excelItemDiv);
            createBusyIndicator();
            setBusy(true);
            $self.templateExcelData();
        }

        this.initalize = function () {
            createBusyIndicator();
            setBusy(false);
            widgetID = (VIS.Utility.Util.getValueOfInt(this.widgetInfo.AD_UserHomeWidgetID) != 0 ? this.widgetInfo.AD_UserHomeWidgetID : $self.windowNo);

            $root.append('<div class="vis-downloadFile-col" id=' + widgetID +'>' +
                '<span class="fa fa-download vis-downloadwidgeticonsize vis-color-primary"></span>' +
                '<a href="#">' + VIS.Msg.getMsg("VIS_TemplateExcelDetails") +'</a>' +
                '</div>');
            //$root.append('<div class="VIS-template-excel-container" id=' + widgetID +'>' +
            //    '<div class="VIS-template-excel-block">' +
            //    '<h6>' + VIS.Msg.getMsg("VIS_TemplateExcelDetails") +'</h6>' +
            //    '</div>' +
            //    '</div>');
            templateExcelDetailLink = $root.find('.vis-downloadFile-col');
            templateExcelDetailLink.off(VIS.Events.onTouchStartOrClick);
            templateExcelDetailLink.on(VIS.Events.onTouchStartOrClick, function () {
                $self.show();
            });
        };

        /* Function to load the template excel data */
        this.templateExcelData = function () {
            var wName = VIS.context.getWindowContext($self.windowNo, "WindowName");

            if ($self.windowNo == -99999) {
                wName = "HomePage";
            }

            $.ajax({
                type: 'GET',
                url: VIS.Application.contextUrl + "TemplateExcel/TemplateExcel",
                data: {
                    windowName: wName
                },
                success: function (data) {
                    data = JSON.parse(data);
                    // console.log(data);
                    if (data && data.length > 0) {
                        excelItemDiv.empty();
                        for (var i = 0; i < data.length; i++) {
                            excelItem = $('<div class="VIS-excelItem" fileId="' + data[i].FileID + '" fileName="' + data[i].FileName + '" fileUrl="' + data[i].URL + '"><span class="excelFileName">' + data[i].FileName +'</span><button class="VIS-excelDownloadBtn"><i class="fa fa-download vis-downloadwidgetpopupiconsize vis-color-primary" aria-hidden="true"></i></button></div>');
                            excelItemDiv.append(excelItem);
                        }
                        excelItemDiv.find('button.VIS-excelDownloadBtn').off(VIS.Events.onTouchStartOrClick);
                        excelItemDiv.find('button.VIS-excelDownloadBtn').on(VIS.Events.onTouchStartOrClick, function () {
                            setBusy(true);
                            var fileId = $(this).parent('.VIS-excelItem').attr('fileId');
                            var fileName = $(this).parent('.VIS-excelItem').attr('fileName');
                            var url = $(this).parent('.VIS-excelItem').attr('fileUrl');
                            $self.downloadFile(fileId, fileName,url);
                        });
                    }
                    else {
                        VIS.ADialog.info("VIS_NoDataFound");
                        formDialog.close();
                    }
                    setBusy(false);
                },
                error: function (err) {
                    console.log(err);
                    setBusy(false);
                }
            });
        }

        /**
        * Function used to download the file
        * @param {any} fileId
        * @param {any} fileName
        */
        this.downloadFile = function (fileId, fileName, fileurl) {

            if (fileurl) {
                window.open(fileurl);
                return;
            }
            $.ajax({
                type: 'GET',
                url: VIS.Application.contextUrl + "TemplateExcel/DownloadTemplateExcel",
                data: {
                    fileId: fileId,
                    fileName: fileName
                },
                success: function (data) {
                    data = JSON.parse(data);
                    console.log(data);
                    if (data && data.length > 0) {
                        window.open(VIS.Application.contextUrl + data);
                        setBusy(false);
                    }
                    else {
                        VIS.ADialog.info("VIS_FileNotAvailable");
                    }
                },
                error: function (err) {
                    console.log(err);
                    setBusy(false);
                }
            });
        }

        this.show = function () {
            $self.load();
            var ch = new VIS.ChildDialog(); //create object of child dialog
            formDialog = ch;
            ch.setHeight(340);
            ch.setWidth(500);
            ch.setTitle(VIS.Msg.getMsg("VIS_TemplateExcelDetails"));
            ch.setContent($root); //set the content
            ch.show();
            ch.hideButtons();
            ch.onClose = function () {
                if ($self.onClose) $self.onClose();
                $self.dispose("child");
            };

        }

        /*
           Function used for Busy Indicator
        */
        function createBusyIndicator() {
            $bsyDiv = $('<div class="vis-busyindicatorouterwrap" style="visibility: hidden;"></div>');
            $bsyDiv.append($('<div class="vis-busyindicatorinnerwrap"><i class="vis-busyindicatordiv"></i></div>'));
            setBusy(false);
            $root.append($bsyDiv);
        };

        function setBusy(isBusy) {
            if (isBusy) {
                $bsyDiv[0].style.visibility = "visible";
            }
            else {
                $bsyDiv[0].style.visibility = "hidden";
            }
        };

        this.intialLoad = function () {
            
        };

        this.getRoot = function () {
            return $root;
        };

        this.refreshWidget = function () {
            $bsyDiv[0].style.visibility = "visible";
            $self.intialLoad();
        };
    };

    VIS.VIS_DownloadFile.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo;
        this.windowNo = windowNo;
        this.initalize();
        this.frame.getContentGrid().append(this.getRoot());
        var ssef = this;
        window.setTimeout(function () {
            ssef.intialLoad();
        }, 50);
    };

    VIS.VIS_DownloadFile.prototype.widgetSizeChange = function (widget) {
        this.widgetInfo = widget;
    };

    VIS.VIS_DownloadFile.prototype.refreshWidget = function () {
        this.refreshWidget();
        alert();
    };

    VIS.VIS_DownloadFile.prototype.dispose = function (value) {
        if (value != "child") {
            this.frame = null;
            this.windowNo = null;
            $bsyDiv = null;
            $self = null;
            $root = null;
        }
        else {
            excelItemDiv = null;
            excelItem = null;
        }
        
    };

})(VIS, jQuery);