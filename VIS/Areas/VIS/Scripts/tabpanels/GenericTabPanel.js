/********************************************************
 * Generic Record tab-panel
 * ------------------------------------------------------
 * ONE reusable tab-panel class bindable to ANY window. It works out of the box
 * with NO dictionary configuration: the endpoints, page size and renderer are
 * the DEFAULTS below, and it feeds the record timeline.
 *
 * Binding (AD_TabPanel):
 *   ClassName = "VIS.GenericTabPanel"   (alias: "VIS.TimelineTabPanel")
 *   ExtraInfo = (leave empty)
 *
 * AD_TabPanel.ExtraInfo is only an OVERRIDE, for pointing the same class at a
 * different feed without writing a new JS class. Any subset of DEFAULTS may be
 * given as JSON; a plain string is taken as the dataUrl:
 *   { "title": "...", "dataUrl": "...", "countUrl": "...",
 *     "pageSize": 12, "render": "timeline", "params": { } }
 *
 * The panel calls dataUrl / countUrl with { RecordId, AD_Table_ID, Page } (+ any
 * config.params). Responses are double-serialized (Json(JsonConvert...)) so they
 * are JSON.parse'd. AD_Table_ID / RecordId come from the current tab, so the same
 * class works on every window with no per-window code.
 *
 * Contract (resolved by GridController.setCurrentPanel / VTabPanel.initalizeTabPanel):
 *   new Panel(height?) ; startPanel(windowNo, curTab, extraInfo?) ; getRoot() ;
 *   refreshPanelData(recordId, row) ; sizeChanged(width) ; dispose()
 * Both the old (windowframe.js) and F20 (atabpanel.js) hosts are supported. The
 * old host passes neither height nor extraInfo, which costs nothing now that the
 * config defaults live in this file.
 ******************************************************/
VIS = window.VIS || {};
(function () {

    // ---- shared helpers -------------------------------------------------
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
        });
    }
    // getMsg with English fallback (framework returns the key when missing).
    function msg(key, fallback) {
        var m = VIS.Msg.getMsg(key);
        return (m && m !== key) ? m : fallback;
    }
    function toInt(v) { return VIS.Utility.Util.getValueOfInt(v); }

    // Styles live in Content/GenericTabPanel.css (a source partial @imported by
    // css-style.css and compiled into the VIS.all.min<ver>.css bundle by webpack)
    // - NOT injected here, so they follow the same build path as every other
    // tab-panel's CSS (HistoryTabPanel.css / SurveyTabPanel.css).

    // ---- renderer registry ---------------------------------------------
    // A renderer is function($list, rows, api) that fills $list. api = {esc,msg,cfg}.
    var RENDERERS = {};

    // Generic list: shows whatever common fields are present. Tolerant of any
    // array-of-objects payload so the panel is usable before a bespoke renderer
    // is written.
    RENDERERS.list = function ($list, rows, api) {
        $list.attr("class", "vis-gtp-list");
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var title = r.Title || r.Name || r.Type || r.Subject || r.DocumentNo || "";
            var actor = r.Actor || r.FromUser || r.UserName || r.SalesRep || "";
            var when = r.EventDateStr || r.CreatedDateTime || r.Created || "";
            var note = r.Note || r.Description || r.CharacterData || "";
            var meta = [];
            if (actor) meta.push(api.esc(api.msg("By", "by")) + " <b>" + api.esc(actor) + "</b>");
            if (when) meta.push(api.esc(String(when)));
            $list.append(
                '<li class="vis-gtp-row">' +
                    '<h4 class="vis-gtp-row-title">' + api.esc(title) + "</h4>" +
                    (meta.length ? '<p class="vis-gtp-row-meta">' + meta.join(' <span style="color:#D9E2EB">&middot;</span> ') + "</p>" : "") +
                    (note ? '<p class="vis-gtp-row-note">' + api.esc(note) + "</p>" : "") +
                "</li>"
            );
        }
    };

    // Timeline: date-grouped lifecycle feed. Expects rows shaped by
    // HistoryDetailsDataModel.GetTimeline (Type/Actor/Node/Note/EventDate...).
    var TL_TYPE = {
        created:     { icon: "fa-plus",           tone: "info" },
        updated:     { icon: "fa-pencil",         tone: "neutral" },
        prepared:    { icon: "fa-check-square-o", tone: "warning" },
        completed:   { icon: "fa-check-circle",   tone: "success" },
        voided:      { icon: "fa-ban",            tone: "risk" },
        reactivated: { icon: "fa-repeat",         tone: "info" },
        closed:      { icon: "fa-lock",           tone: "neutral" },
        sent_for:    { icon: "fa-paper-plane-o",  tone: "warning" },
        workflow:    { icon: "fa-check",          tone: "success" },
        shared:      { icon: "fa-share-alt",      tone: "info" }
    };
    function tlDate(ev) {
        if (ev.EventDate) { var d = new Date(ev.EventDate); if (!isNaN(d.getTime())) return d; }
        return null;
    }
    function tlTime(ev) {
        var d = tlDate(ev);
        return d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (ev.EventDateStr || "");
    }
    function tlDay(ev) {
        var d = tlDate(ev);
        return d ? d.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
                 : ((ev.EventDateStr || "").split(" ")[0] || msg("Unknown", "Unknown"));
    }
    function tlTitle(ev) {
        // Server-resolved translated title wins (e.g. DocAction -> localised
        // _Document Status name). Falls back to the per-type label below.
        if (ev.Title) return esc(ev.Title);
        switch (ev.Type) {
            case "created":     return msg("Created", "Created");
            case "updated":     return msg("Updated", "Updated");
            case "prepared":    return msg("Prepared", "Prepared");
            case "completed":   return msg("Completed", "Completed");
            case "voided":      return msg("Voided", "Voided");
            case "reactivated": return msg("ReActivate", "Re-activated");
            case "closed":      return msg("Closed", "Closed");
            case "sent_for":    return msg("SentFor", "Sent for") + " " + esc(ev.Node);
            case "workflow":    return esc(ev.Node || msg("Workflow", "Workflow"));
            case "shared":      return msg("Shared", "Shared");
            default:            return esc(ev.RawEventType || ev.Type || "");
        }
    }
    RENDERERS.timeline = function ($list, rows, api) {
        $list.attr("class", "vis-gtp-tl");
        var groups = [], byKey = {};
        for (var i = 0; i < rows.length; i++) {
            var key = tlDay(rows[i]);
            if (!byKey[key]) { byKey[key] = { day: key, items: [] }; groups.push(byKey[key]); }
            byKey[key].items.push(rows[i]);
        }
        for (var g = 0; g < groups.length; g++) {
            var grp = groups[g], evHtml = "";
            for (var j = 0; j < grp.items.length; j++) {
                var ev = grp.items[j];
                var cfg = TL_TYPE[ev.Type] || { icon: "fa-circle-o", tone: "neutral" };
                var actor = ev.Actor ? "<b>" + api.esc(ev.Actor) + "</b>" : "";
                var note = ev.Note ? '<p class="vis-gtp-tl-note">' + api.esc(ev.Note) + "</p>" : "";
                evHtml +=
                    '<li class="vis-gtp-tl-ev">' +
                        '<div class="vis-gtp-tl-head">' +
                            '<span class="vis-gtp-tl-ico vis-gtp-tone-' + cfg.tone + '"><i class="fa ' + cfg.icon + '"></i></span>' +
                            '<h4 class="vis-gtp-tl-title">' + tlTitle(ev) + "</h4>" +
                        "</div>" +
                        '<p class="vis-gtp-tl-meta">' + api.esc(api.msg("By", "by")) + " " + actor +
                            '<span class="sep">&middot;</span>' + api.esc(tlTime(ev)) + "</p>" +
                        note +
                    "</li>";
            }
            $list.append(
                '<li class="vis-gtp-tl-day">' +
                    '<span class="vis-gtp-tl-rail" aria-hidden="true"><span class="vis-gtp-tl-dot"></span><span class="vis-gtp-tl-trail"></span></span>' +
                    '<div class="vis-gtp-tl-dbody"><h3 class="vis-gtp-tl-date">' + api.esc(grp.day) + "</h3>" +
                        '<ul class="vis-gtp-tl-events">' + evHtml + "</ul></div>" +
                "</li>"
            );
        }
    };

    // ---- config ---------------------------------------------------------
    // Everything the panel needs lives here, NOT in AD_TabPanel.ExtraInfo: a
    // dictionary row only has to name the class. ExtraInfo overrides these when
    // the same class is pointed at another feed.
    // pageSize must stay in step with EventTimelineModel.TIMELINE_PAGE_SIZE, or
    // the pager's "of N" will not match the rows a page actually returns.
    var DEFAULTS = {
        title: "",
        dataUrl: "VIS/EventTimeline/GetRecordTimeline",
        countUrl: "VIS/EventTimeline/GetRecordTimelineCount",
        pageSize: 12,
        render: "timeline",
        params: {}
    };

    function defaultConfig() {
        return {
            title: DEFAULTS.title, dataUrl: DEFAULTS.dataUrl, countUrl: DEFAULTS.countUrl,
            pageSize: DEFAULTS.pageSize, render: DEFAULTS.render, params: DEFAULTS.params
        };
    }

    function parseConfig(extraInfo) {
        var cfg = defaultConfig();
        if (!extraInfo) return cfg;
        var raw = extraInfo;
        if (typeof extraInfo === "string") {
            var s = extraInfo.trim();
            // The hosts stringify an unset ExtraInfo straight into the
            // data-extrainfo attribute, so an empty binding arrives as the
            // literal "undefined"/"null" - not a URL.
            if (!s || s === "undefined" || s === "null") return cfg;
            if (s.charAt(0) === "{") {
                // Malformed JSON must not silently redirect the panel at a junk
                // URL - keep the defaults instead.
                try { raw = JSON.parse(s); }
                catch (e) {
                    if (window.console && console.warn) console.warn("GenericTabPanel: bad ExtraInfo JSON, using defaults -", s);
                    return cfg;
                }
            } else {
                raw = { dataUrl: s };   // plain string == the data endpoint
            }
        }
        if (raw.title != null) cfg.title = raw.title;
        if (raw.dataUrl) cfg.dataUrl = raw.dataUrl;
        if (raw.countUrl) cfg.countUrl = raw.countUrl;
        if (raw.pageSize) cfg.pageSize = toInt(raw.pageSize) || cfg.pageSize;
        if (raw.render) cfg.render = raw.render;
        if (raw.params && typeof raw.params === "object") cfg.params = raw.params;
        return cfg;
    }

    // ---- the panel ------------------------------------------------------
    function GenericTabPanel(height) {
        this.record_ID = 0;
        this.windowNo = 0;
        this.table_ID = 0;
        this.curTab = null;
        this.selectedRow = null;
        this.panelWidth = 0;
        this.height = height;

        var $self = this;
        var $root = $('<div class="VIS-root-div vis-gtp-wrap"></div>');
        var $body, $list, $empty, $pager, $pinfo, $ppos, $prev, $next, $loader;
        var cfg = defaultConfig();   // usable before/without setConfig()
        var _recordId = 0, _page = 1, _total = 0;

        this.setConfig = function (extraInfo) { cfg = parseConfig(extraInfo); };

        this.init = function () {
            $body = $('<div class="vis-gtp-body"></div>');
            $list = $('<ol class="vis-gtp-list"></ol>');
            $empty = $('<div class="vis-gtp-empty" style="display:none;">' + esc(msg("NoRecordsFound", "No records yet.")) + '</div>');
            $body.append($list).append($empty);

            $pinfo = $('<span class="vis-gtp-pinfo"></span>');
            $ppos = $('<span class="vis-gtp-ppos"></span>');
            $prev = $('<button class="vis-gtp-pbtn" title="' + esc(msg("Newer", "Newer")) + '"><i class="fa fa-chevron-left"></i></button>');
            $next = $('<button class="vis-gtp-pbtn" title="' + esc(msg("Older", "Older")) + '"><i class="fa fa-chevron-right"></i></button>');
            var $pctrl = $('<div class="vis-gtp-pctrl"></div>').append($prev).append($ppos).append($next);
            $pager = $('<div class="vis-gtp-pager hide"></div>').append($pinfo).append($pctrl);

            $loader = $('<div class="VIS-tabPanelDataLoader" style="display:none;"><div class="vis-busyindicatorinnerwrap"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div></div>');

            $root.empty().append($body).append($pager).append($loader);
            $prev.on("click", function () { if (_page > 1) { _page--; load(); } });
            $next.on("click", function () { if (_page < totalPages()) { _page++; load(); } });
        };

        this.getRoot = function () { return $root; };

        this.update = function (recordID) {
            _recordId = recordID;
            if (!$self.table_ID && $self.curTab) $self.table_ID = $self.curTab.getAD_Table_ID();
            _page = 1;
            $self.init();
            loadCount();
            load();
        };

        function baseParams() {
            var p = { RecordId: _recordId, AD_Table_ID: $self.table_ID, Page: _page };
            for (var k in cfg.params) { if (cfg.params.hasOwnProperty(k)) p[k] = cfg.params[k]; }
            return p;
        }
        function totalPages() { return Math.max(1, Math.ceil(_total / cfg.pageSize)); }

        // A failed fetch used to look exactly like an empty feed, which makes a
        // misconfigured dataUrl or a server error impossible to tell apart from
        // "nothing happened yet". Both are now reported.
        function fail(what, xhr) {
            if (window.console && console.error) {
                console.error("GenericTabPanel: " + what + " failed - " +
                    VIS.Application.contextUrl + (what === "count" ? cfg.countUrl : cfg.dataUrl) +
                    " [" + (xhr ? xhr.status : "?") + "]", xhr && xhr.responseText);
            }
        }
        function loadCount() {
            if (!cfg.countUrl) { _total = 0; renderPager(); return; }
            $.ajax({
                url: VIS.Application.contextUrl + cfg.countUrl,
                data: baseParams(),
                success: function (data) { _total = toInt(JSON.parse(data)); renderPager(); },
                error: function (xhr) { fail("count", xhr); }
            });
        }
        function load() {
            if ($loader) $loader.show();   // cfg.dataUrl always set - see DEFAULTS
            $.ajax({
                url: VIS.Application.contextUrl + cfg.dataUrl,
                data: baseParams(),
                success: function (data) {
                    if ($loader) $loader.hide();
                    var rows;
                    try { rows = JSON.parse(data) || []; }
                    catch (e) { fail("data", null); showError(msg("Error", "Error")); return; }
                    render(rows);
                },
                error: function (xhr) {
                    if ($loader) $loader.hide();
                    fail("data", xhr);
                    showError(msg("Error", "Error") + " (" + (xhr ? xhr.status : "?") + ")");
                }
            });
        }
        function showError(text) {
            if (!$list) return;
            $list.empty();
            $empty.text(text).show();
            renderPager();
        }
        function render(rows) {
            $list.empty();
            $empty.text(msg("NoRecordsFound", "No records yet."));   // clear any earlier error text
            $empty.toggle(!(rows && rows.length));
            var renderer = RENDERERS[cfg.render] || RENDERERS.list;
            renderer($list, rows, { esc: esc, msg: msg, cfg: cfg });
            renderPager();
        }
        function renderPager() {
            if (!$pager) return;
            var pages = totalPages();
            var from = _total ? ((_page - 1) * cfg.pageSize) + 1 : 0;
            var to = Math.min(_page * cfg.pageSize, _total);
            $pinfo.text(_total ? (msg("ShowingResult", "Showing") + " " + from + "-" + to + " " + msg("Of", "of") + " " + _total) : "");
            $ppos.text(_page + " / " + pages);
            $prev.prop("disabled", _page <= 1);
            $next.prop("disabled", _page >= pages);
            $pager.toggleClass("hide", pages <= 1);
        }

        this.disposeComponent = function () {
            if ($prev) $prev.off("click");
            if ($next) $next.off("click");
            if ($root) { $root.empty(); $root.remove(); }
            $root = $body = $list = $empty = $pager = $pinfo = $ppos = $prev = $next = $loader = null;
            $self = null;
        };
    }

    /** Invoked when the user clicks the panel icon. extraInfo carries the JSON
     *  config in the F20 host; the old host omits it (config then defaults, or
     *  can be set via curTab metadata). */
    GenericTabPanel.prototype.startPanel = function (_window_No, curTab, extraInfo) {
        this.windowNo = _window_No;
        this.curTab = curTab;
        this.table_ID = curTab ? curTab.getAD_Table_ID() : 0;
        this.setConfig(extraInfo);
        this.init();
    };

    /** Fired when the user navigates to / refreshes a record. */
    GenericTabPanel.prototype.refreshPanelData = function (recordID, selectedRow) {
        this.record_ID = recordID;
        this.selectedRow = selectedRow;
        this.update(recordID);
    };

    GenericTabPanel.prototype.sizeChanged = function (width) { this.panelWidth = width; };
    GenericTabPanel.prototype.dispose = function () { if (this.disposeComponent) this.disposeComponent(); };

    /** Register a custom renderer: name -> function($list, rows, api). */
    GenericTabPanel.registerRenderer = function (name, fn) {
        if (name && typeof fn === "function") RENDERERS[name] = fn;
    };

    /* AD_TabPanel.ClassName resolves against these names. Both are registered:
       the class is generic, but existing dictionary rows bind it as
       VIS.TimelineTabPanel. */
    //VIS.GenericTabPanel = GenericTabPanel;
    VIS.TimelineTabPanel = GenericTabPanel;
})();
