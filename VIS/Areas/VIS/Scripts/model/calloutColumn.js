VIS = window.VIS || {};

(function (VIS, $) {
    var Util = VIS.Utility.Util;
    function calloutColumn() {
        VIS.CalloutEngine.call(this, "calloutColumn"); //must call
    };

    VIS.Utility.inheritPrototype(calloutColumn, VIS.CalloutEngine);

    calloutColumn.prototype.setDBColumnName = function (ctx, windowNo, mTab, mField, value, oldValue) {
        if (this.isCalloutActive() || value == null || value == 0) {
            return;
        }

        this.setCalloutActive(true);

        var _mTab = mTab;

        $.ajax({
            url: VIS.Application.contextUrl + "VIS/CalloutColumn/GetDBColunName",
            data: { AD_Element_ID: value },
            success: function (result) {
                if (result)
                    _mTab.setValue("ColumnName", result);
            },
            error: function (err) {
                this.log.severe(err);
            }
        });

        this.setCalloutActive(false);

        ctx = windowNo = mTab = mField = value = oldValue = null;

        return "";

    };

    calloutColumn.prototype.checkColumnLength = function (ctx, windowNo, mTab, mField, value, oldValue) {
        if (this.isCalloutActive() || value == null || value == 0) {
            return;
        }

        this.setCalloutActive(true);
        if (value.length > 43) {
            mField.setValue('');
            VIS.ADialog.error('VIS_CheckColumnLength');
        }
        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    calloutColumn.prototype.checkTableLength = function (ctx, windowNo, mTab, mField, value, oldValue) {
        if (this.isCalloutActive() || value == null || value == 0) {
            return;
        }

        this.setCalloutActive(true);
        if (value.length > 40) {
            mField.setValue('');
            VIS.ADialog.error('VIS_CheckTableLength');
        }
        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    //Check organisation access for user.

    calloutColumn.prototype.checkOrgAccess = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        var userID = Util.getValueOfInt(mTab.getValue("AD_User_ID"));
        this.setCalloutActive(true);
        $.ajax({
            url: VIS.Application.contextUrl + "VIS/CalloutColumn/CheckOrgAccessByRole",
            data: { AD_Role_ID: value, AD_User_ID: userID },
            success: function (result) {
                if (Util.getValueOfInt(result) == 0)
                    VIS.ADialog.info(VIS.Msg.getMsg("VIS_NoOrgAccess"));
            },
            error: function (err) {
                this.log.severe(err);
            }
        });

        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    VIS.calloutColumn = calloutColumn;

    //*********** Callout check DocAction in table  Start ****
    function CalloutCheckDocAction() {
        VIS.CalloutEngine.call(this, "VIS.CalloutCheckDocAction");//must call
    };
    VIS.Utility.inheritPrototype(CalloutCheckDocAction, VIS.CalloutEngine); //inherit prototype

    CalloutCheckDocAction.prototype.CheckDocActionInTable = function (ctx, windowNo, mTab, mField, value, oldValue) {
        if (this.isCalloutActive() || value == null || value.toString() == "") {
            return "";
        }
        this.setCalloutActive(true);
        var isExist = VIS.dataContext.getJSONRecord("VIS/SurveyPanel/CheckDocActionInTable", Util.getValueOfInt(value));
        if (isExist) {
            mTab.setValue("IsDocAction", 'Y');
        } else {
            mTab.setValue("IsDocAction", 'N');
        }

        this.setCalloutActive(false);
        return "";
    }
    VIS.CalloutCheckDocAction = CalloutCheckDocAction;
    //**************Callout check DocAction in table End*************

    //*********** Callout check DocAction in table  Start ****
    function CalloutGetTableID() {
        VIS.CalloutEngine.call(this, "VIS.CalloutGetTableID");//must call
    };
    VIS.Utility.inheritPrototype(CalloutGetTableID, VIS.CalloutEngine); //inherit prototype

    CalloutGetTableID.prototype.CalloutGetTableIDByTab = function (ctx, windowNo, mTab, mField, value, oldValue) {
        if (this.isCalloutActive() || value == null || value.toString() == "") {
            return "";
        }
        this.setCalloutActive(true);
        var TableID = VIS.dataContext.getJSONRecord("VIS/SurveyPanel/CalloutGetTableIDByTab", Util.getValueOfInt(value));
        mTab.setValue("AD_Table_ID", TableID);

        var isExist = VIS.dataContext.getJSONRecord("VIS/SurveyPanel/CheckDocActionInTable", Util.getValueOfInt(TableID));
        if (isExist) {
            mTab.setValue("IsDocAction", 'Y');
        } else {
            mTab.setValue("IsDocAction", 'N');
        }

        this.setCalloutActive(false);
        return "";
    }
    VIS.CalloutGetTableID = CalloutGetTableID;
    //**************Callout check DocAction in table End*************

})(VIS, jQuery);
