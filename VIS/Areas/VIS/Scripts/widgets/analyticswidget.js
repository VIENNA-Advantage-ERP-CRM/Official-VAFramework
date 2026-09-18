/**
 * Home Widget - embeds an Onfinity Analytics report.
 * AD_WidgetSize.ClassName = "VIS.AnalyticsWidget"
 * The report is chosen per user and kept in AD_UserHomeWidget.AdditionalInfo as
 * { "reportId": "<uuid>", "name": "<report name>", "interactive": true|false }.
 * The embed token is minted server-side by AnalyticsPanel/Embed on every render.
 */
; VIS = window.VIS || {};

; (function (VIS, $) {

    VIS.AnalyticsWidget = function () {
        this.frame = null;
        this.windowNo = 0;
        this.widgetInfo = null;
        var $self = this;
        var $root = $('<div class="vis-analytics-widget" style="height:100%;width:100%;display:flex;flex-direction:column;">');
        var $head = null, $body = null, $iframe = null;
        var config = null;   // { reportId, name, interactive }

        // translated label with a plain-English fallback when the AD_Message row is missing
        function msg(key, fallback) {
            var text = VIS.Msg.getMsg(key);
            return text === '[' + key + ']' ? fallback : text;
        }

        this.Initalize = function () {
            config = readConfig();
            $head = $('<div style="display:flex;align-items:center;padding:4px 8px;gap:6px;flex:0 0 auto;">');
            $body = $('<div style="flex:1 1 auto;min-height:0;position:relative;">');
            $root.append($head).append($body);
            if (config && config.reportId) {
                showReport();
            }
            else {
                showSettings();
            }
        };

        function readConfig() {
            try {
                var raw = $self.widgetInfo ? $self.widgetInfo.additionalInfo : null;
                if (!raw)
                    return null;
                return typeof raw === "string" ? JSON.parse(raw) : raw;
            }
            catch (e) {
                return null;
            }
        }

        function header(title, showSettingsBtn) {
            $head.empty();
            $head.append($('<strong style="flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">').text(title));
            var $refresh = $('<a href="javascript:void(0)" title="' + msg("Refresh", "Refresh") + '"><i class="vis vis-refresh"></i></a>');
            $refresh.on("click", function () { if ($iframe) showReport(); });
            $head.append($refresh);
            if (showSettingsBtn) {
                var $settings = $('<a href="javascript:void(0)" title="' + msg("Settings", "Settings") + '"><i class="vis vis-customize"></i></a>');
                $settings.on("click", showSettings);
                $head.append($settings);
            }
        }

        function showReport() {
            header(config.name || msg("Report", "Report"), true);
            var extraInfo = "reportId=" + encodeURIComponent(config.reportId)
                + "&interactive=" + (config.interactive ? "Y" : "N")
                + "&allowExport=" + (config.interactive ? "Y" : "N");
            $iframe = $('<iframe style="border:0;width:100%;height:100%;" allow="fullscreen"></iframe>');
            $iframe.prop("src", VIS.Application.contextUrl + "AnalyticsPanel/Embed?recID=0&extraInfo=" + encodeURIComponent(extraInfo));
            $body.empty().append($iframe);
        }

        function showSettings() {
            $iframe = null;
            header(msg("Settings", "Settings"), false);
            var $form = $('<div style="padding:8px;display:flex;flex-direction:column;gap:8px;">');
            var $select = $('<select style="width:100%;"></select>');
            var $input = $('<input type="text" style="width:100%;" placeholder="Report ID" />');
            var $interactive = $('<label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" /> <span>' + msg("VA_AnalyticsShowFilters", "Show filters in the report") + '</span></label>');
            var $save = $('<button type="button" class="vis-btn vis-btn-primary">' + msg("Save", "Save") + '</button>');
            var $msg = $('<div style="color:var(--v-c-error, #c00);"></div>');
            $form.append($select).append($input).append($interactive).append($save).append($msg);
            $body.empty().append($form);

            if (config) {
                $input.val(config.reportId || "");
                $interactive.find("input").prop("checked", !!config.interactive);
            }
            $select.hide();

            // published reports through the service account; falls back to typing the id
            $.ajax({
                url: VIS.Application.contextUrl + "AnalyticsPanel/Reports",
                type: "GET",
                dataType: "json",
                success: function (result) {
                    if (result.message)
                        $msg.text(result.message);
                    if (result.reports && result.reports.length > 0) {
                        $select.append($('<option value="">').text("--"));
                        for (var i = 0; i < result.reports.length; i++) {
                            $select.append($('<option>').val(result.reports[i].id).text(result.reports[i].name));
                        }
                        if (config && config.reportId)
                            $select.val(config.reportId);
                        $select.show();
                        $select.on("change", function () { $input.val($select.val()); });
                    }
                }
            });

            $save.on("click", function () {
                var reportId = $.trim($input.val());
                if (!reportId) {
                    $msg.text(msg("VA_AnalyticsReportIDMissing", "Choose a report"));
                    return;
                }
                var name = $select.val() === reportId ? $select.find("option:selected").text() : "";
                config = { reportId: reportId, name: name, interactive: $interactive.find("input").prop("checked") };
                persist(JSON.stringify(config));
                showReport();
            });
        }

        function persist(json) {
            var info = $self.widgetInfo;
            if (!info)
                return;
            // keep the in-memory dashboard state (saved with the layout) and the stored row in sync
            if (info.setAdditionalInfo)
                info.setAdditionalInfo(info.AD_UserHomeWidgetID, json);
            info.additionalInfo = json;
            if (info.AD_UserHomeWidgetID > 0) {
                $.ajax({
                    url: VIS.Application.contextUrl + "AnalyticsPanel/SaveWidgetInfo",
                    type: "POST",
                    data: { AD_UserHomeWidget_ID: info.AD_UserHomeWidgetID, info: json }
                });
            }
        }

        this.getRoot = function () {
            return $root;
        };

        this.disposeComponent = function () {
            if ($iframe)
                $iframe.remove();
            $iframe = null;
            $root.remove();
        };
    };

    /* init method called on loading a widget */
    VIS.AnalyticsWidget.prototype.init = function (windowNo, frame) {
        this.frame = frame;
        this.widgetInfo = frame.widgetInfo;
        this.windowNo = windowNo;
        this.Initalize();
        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.AnalyticsWidget.prototype.refreshWidget = function () {
    };

    VIS.AnalyticsWidget.prototype.widgetSizeChange = function (height, width) {
        // iframe is 100% of the widget body; nothing to recompute
    };

    //Must implement dispose
    VIS.AnalyticsWidget.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };

})(VIS, jQuery);
