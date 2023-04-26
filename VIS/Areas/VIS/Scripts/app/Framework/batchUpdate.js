; (function (VIS, $) {

    function BatchUpdate(windowNo, curTab, minRecord) {
        var title = curTab.getName();
        var AD_Tab_ID = curTab.getAD_Tab_ID();
        var AD_Table_ID = curTab.getAD_Table_ID();
        var tableName = curTab.getTableName();
        var whereExtended = curTab.getWhereClause();
        var findFields = curTab.getFields();
        this.btnfields = [];
        var control1, control2, ulListStaticHtml = "";;


        var $root = $("<div  class='vis-forms-container' style='height:100%'>");
        var $busy = null;

        var $self = this;
        var ch = null;
        this.onClose = null


        function setBusy(busy) {
            //isBusy = busy;
            //$busy.css("visibility", isBusy ? "visible" : "hidden");
            //btnOk.prop("disabled", busy);
            //btnCancel.prop("disabled", busy);
            //btnRefresh.prop("disabled", busy);
        };

        function setView() {

        }



        this.show = function () {
            ch = new VIS.ChildDialog();

            ch.setHeight(550);
            ch.setWidth(860);
            ch.setTitle(VIS.Msg.getMsg("BatchUpdate"));
            ch.setModal(true);
            //Disposing Everything on Close
            ch.onClose = function () {
                //$self.okBtnPressed = false;
                if ($self.onClose) $self.onClose();
                $self.dispose();
            };

            ch.show();
            ch.setContent($root);
            ch.hideButtons();
            setBusy(false);
            
        };

        this.disposeComponent = function () {
            if ($root)
                $root.remove();
            $root = null;
        }

    }

    

    BatchUpdate.prototype.dispose = function () {
        this.disposeComponent();
    };

    VIS.BatchUpdate = BatchUpdate;

}(VIS, jQuery));