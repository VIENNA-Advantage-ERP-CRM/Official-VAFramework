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

    /// <summary>
    /// Check organisation access for user.
    /// </summary>
    /// <returns>Message</returns>

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
                if (result == 'NoRoleAcc')
                    VIS.ADialog.warn("VIS_NoRoleAccess");
                if (result == 'NoUserAcc')
                    VIS.ADialog.warn("VIS_NoUserAccess");
            },
            error: function (err) {
                this.log.severe(err);
            }
        });

        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    /// <summary>
    ///   Activate User button enable when IsExpireLink is False
    /// </summary>
    /// <returns></returns>

    calloutColumn.prototype.buttonDisable = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        this.setCalloutActive(true);
        mTab.setValue("IsExpireLink", 'N')
        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    /// <summary>
    ///   Set Email Id in BI User Name  when BI User CheckBox is True
    /// </summary>
    /// <returns></returns>

    calloutColumn.prototype.SetBIUserName = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        this.setCalloutActive(true);
        var userID = Util.getValueOfInt(mTab.getValue("AD_User_ID"));
        $.ajax({
            url: VIS.Application.contextUrl + "VIS/CalloutColumn/GetEmailAddress",
            data: { AD_User_ID: userID },
            async: false, 
            success: function (result) {
                if (result)
                   mTab.setValue("VA037_BIUserName",result);
            },
            error: function (err) {
                this.log.severe(err);
            }
        });

        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    calloutColumn.prototype.IsSingleScreen = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        this.setCalloutActive(true);
        if (mTab.getValue("AD_Widget_ID") > 0 && value != oldValue && value.includes(',')) {
            VIS.ADialog.warn("VIS_EffectDataSource");
        }
      
        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    calloutColumn.prototype.ShowTable = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        var TableID = Util.getValueOfInt(mTab.getValue("AD_Table_ID"));
        if (TableID > 0) {
            VIS.ADialog.warn("Column");
        }

        this.setCalloutActive(false);
        ctx = windowNo = mTab = mField = value = oldValue = null;
        return "";
    };

    calloutColumn.prototype.ShowField = function (ctx, windowNo, mTab, mField, value, oldValue) {

        if (this.isCalloutActive() || value == null) {
            return;
        }

        var TableID = Util.getValueOfInt(mTab.getValue("AD_Table_ID"));
        if (TableID > 0) {
            VIS.ADialog.warn("Field");
        }

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
