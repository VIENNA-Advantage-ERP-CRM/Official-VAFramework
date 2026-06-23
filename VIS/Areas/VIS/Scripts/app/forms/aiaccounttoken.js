; (function (VIS, $) {
    VIS.Apps = VIS.Apps || {};

    /*
     *  AgentCI Flow Tracer — VIS.Apps Form
     *
     *  Implements the standard VIS.Apps form contract:
     *    1. AgentCIForm.prototype.init    = function(windowNo, frame)
     *    2. AgentCIForm.prototype.dispose = function()
     *
     *  Usage (open as a standalone window):
     *    var f = new VIS.Apps.AgentCIForm();
     *    f.show();
     *
     *  Usage (embed inside an existing AWindow/CFrame):
     *    var f = new VIS.Apps.AgentCIForm();
     *    frame.getContentGrid().append(f.getRoot());
     *    f.init(windowNo, frame);
     */

    // ─────────────────────────────────────────────
    //  Constructor
    // ─────────────────────────────────────────────
    VIS.AITokenUsage = function () {
        this.frame = null;
        this.windowNo = null;

        // ── private state ──
        var self = this;
        var $root = null;

        var logsData = [];
        var selectedCmdId = null;
       // var currentFilter = 'assistant';
        var currentFilter = 'all';
        var currentSearch = '';
        var TOTAL_TOKEN_QUOTA = 0; // will be computed from actual data
        var apiSummary = {
            isAIKeyExist: false,
            aiKeySuffix: '',
            totalEndpointTokens: 0,
            userTotalTokens: 0,
            userTotalTasks: 0,
            pendingTokens: 0,
            successRate: 0,
            totalTokenInEndpoint:0
        };
        var currentPage = 1;
        var pageSize = 10;
        var totalPages = 1;
        var totalRecords = 0;

        // ── DOM references (set during initializeComponent) ──
        var $liveDot, $lastRefresh, $fetchBtn, $toggleConfig, $themeToggle;
        var $configPanel, $apiUrl, $userId, $endpointUrl;
        var $errorBanner;
        var $statAutoTok, $statAutoTokSub;
        var $statTenantUsed, $statTenantUsedSub;
        var $statTotalToken, $statTotalTokenSub;
        var $statCmds, $statCmdsSub;
        var $statRate, $statRateSub;
        var $statUserUsed, $statUserUsedSub, $statUserUsedBar;
        var $statPending, $statPendingSub, $statPendingBar;
        var $fAll, $fAssistant, $fOrchestration, $fDms, $fAura;
        var $cmdCount, $cmdList, $searchInput, $filterChips;
        var $detailContent, $detailPane;
        var $pagePrev, $pageNext, $pageInfo;
        var $stats, $sidebar;
        //date filter
        var currentDateFilter = 'all'; // 'all', 'custom', or YYYY-MM-DD
        var currentStartDate = '';
        var currentEndDate = '';
        var $dateSelect, $customDateRange, $startDateInput, $endDateInput;
        // ─────────────────────────────────────────
        //  Constants / helpers
        // ─────────────────────────────────────────
        var TASK_GROUPS = [
            {
                id: 'orchestration', label: VIS.Msg.getMsg("VAI_OrchestrationTask"), match: /orchestrat/i,
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>'
            },
            {
                id: 'assistance', label: VIS.Msg.getMsg("VAI_AIAssistanceTask"), match: /assist/i,
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>'
            },
            {
                id: 'dms', label: VIS.Msg.getMsg("VAI_DMSTask"), match: /dms/i,
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'
            },
            {
                id: 'aura', label: VIS.Msg.getMsg("VAI_AURAAITask") , match: /aura/i,
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
            },
            {
                id: 'other', label: VIS.Msg.getMsg("VAI_OtherTasks") , match: null,
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
            }
        ];

        function categorize(taskfrom) {
            var v = taskfrom == null ? '' : String(taskfrom);
            for (var i = 0; i < TASK_GROUPS.length; i++) {
                if (TASK_GROUPS[i].match && TASK_GROUPS[i].match.test(v)) return TASK_GROUPS[i].id;
            }
            return 'other';
        }

        function methodIconClass(apiMethod) {
            var m = (apiMethod || '').toLowerCase();
            if (m.includes('search') && m.includes('kb')) return 'kb';
            if (m.includes('mail') || m.includes('email')) return 'mail';
            if (m.includes('search') || m.includes('insert') || m.includes('update') || m.includes('select') || m.includes('data')) return 'db';
            if (m.includes('chat') || m.includes('aura')) return 'chat';
            if (m.includes('invoke') || m.includes('assistant')) return 'ai';
            return 'default';
        }

        var METHOD_ICON_SVG = {
            kb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
            mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
            db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
            chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
            ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',
            'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>'
        };

        function agentTypeLabel(t) {
            if (t === 'SU') return 'Supervisor';
            if (t === 'AC') return 'Action';
            if (t === 'inbuiltAgent') return 'Built-in';
            return t || '—';
        }
        function agentTypePillClass(t) {
            if (t === 'SU' || t === 'AC' || t === 'inbuiltAgent') return t;
            return 'unknown';
        }
        function parseErrorMessage(raw) {
            if (!raw) return null;
            var s = String(raw);
            var httpM = s.match(/^(\d{3})\s*:\s*(.+)$/);
            var code = null, msg = s;
            if (httpM) { code = httpM[1]; msg = httpM[2]; }
            var tag = 'Error';
            var lo = msg.toLowerCase();
            if (lo.includes('json')) tag = 'JSON';
            else if (lo.includes('serializ')) tag = 'Serialization';
            else if (lo.includes('updat')) tag = 'DB Update';
            else if (lo.includes('creat')) tag = 'DB Create';
            else if (lo.includes('format specifier')) tag = 'Format';
            else if (lo.includes('session')) tag = 'Session';
            return { code: code, tag: tag, msg: msg };
        }

        // ── Format helpers ──
        function fmtTokens(n) {
            if (n == null) return '—';
            if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
            if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
            return n.toLocaleString();
        }
        function fmtDuration(ms) {
            if (ms == null) return '—';
            if (ms < 1000) return ms + 'ms';
            if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
            return (ms / 60000).toFixed(1) + 'm';
        }
        function fmtTime(ts) {
            if (!ts) return '—';
            return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }
        function fmtDate(ts) {
            if (!ts) return '—';
            var d = new Date(ts);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + fmtTime(ts);
        }
        function fmtRelative(ts) {
            if (!ts) return '—';
            var diff = (Date.now() - new Date(ts).getTime()) / 1000;
            if (diff < 60) return Math.round(diff) + 's ago';
            if (diff < 3600) return Math.round(diff / 60) + 'm ago';
            if (diff < 86400) return Math.round(diff / 3600) + 'h ago';
            return Math.round(diff / 86400) + 'd ago';
        }
        function calcDurationMs(start, end) {
            if (!start || !end) return null;
            return new Date(end) - new Date(start);
        }
        function statusClass(s) {
            if (!s) return '';
            return s.toLowerCase().replace(/\s+/g, '-');
        }
        function escHtml(s) {
            if (s == null) return '';
            return String(s)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
        function truncate(text, len) {
            len = len || 80;
            if (!text) return '—';
            var s = typeof text === 'string' ? text : JSON.stringify(text);
            return s.length > len ? s.slice(0, len) + '…' : s;
        }
        function extractSubject(cmdText) {
            if (!cmdText) return 'Untitled command';
            var m = cmdText.match(/'subject'\s*:\s*'([^']+)'/);
            if (m) return m[1];
            var m2 = cmdText.match(/"subject"\s*:\s*"([^"]+)"/);
            if (m2) return m2[1];
            return truncate(cmdText, 120);
        }
        function safeParseJSON(val) {
            if (val == null) return null;
            if (typeof val === 'object') return val;
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        function parseAgents(agentsRaw) {
            if (!agentsRaw) return [];
            if (typeof agentsRaw === 'string') {
                try { return JSON.parse(agentsRaw); } catch (e) { return []; }
            }
            return Array.isArray(agentsRaw) ? agentsRaw : [];
        }

        // ── JSON Syntax Highlight ──
        function highlightJSON(obj, depth) {
            depth = depth || 0;
            if (obj === null) return '<span class="aci-jnull">null</span>';
            if (obj === undefined) return '<span class="aci-jnull">undefined</span>';
            if (typeof obj === 'string') {
                try {
                    var inner = JSON.parse(obj);
                    if (typeof inner === 'object' && inner !== null) return highlightJSON(inner, depth);
                } catch (e) { }
                var escaped = obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (escaped.length > 4000) return '<span class="aci-js">"' + escaped.slice(0, 4000) + '…"</span>';
                return '<span class="aci-js">"' + escaped + '"</span>';
            }
            if (typeof obj === 'number') return '<span class="aci-jn">' + obj + '</span>';
            if (typeof obj === 'boolean') return '<span class="aci-jb">' + obj + '</span>';
            if (Array.isArray(obj)) {
                if (!obj.length) return '<span class="aci-jbrace">[]</span>';
                var ind = '  '.repeat(depth + 1);
                var indC = '  '.repeat(depth);
                var items = obj.map(function (v) { return ind + highlightJSON(v, depth + 1); });
                return '<span class="aci-jbrace">[</span>\n' + items.join(',\n') + '\n' + indC + '<span class="aci-jbrace">]</span>';
            }
            var keys = Object.keys(obj);
            if (!keys.length) return '<span class="aci-jbrace">{}</span>';
            var ind2 = '  '.repeat(depth + 1);
            var indC2 = '  '.repeat(depth);
            var entries = keys.map(function (k) {
                return ind2 + '<span class="aci-jk">"' + k + '"</span>: ' + highlightJSON(obj[k], depth + 1);
            });
            return '<span class="aci-jbrace">{</span>\n' + entries.join(',\n') + '\n' + indC2 + '<span class="aci-jbrace">}</span>';
        }

        function sanitizeHTML(html) {
            if (!html) return '';
            var s = String(html);
            s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
            s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
            s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
            s = s.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
            s = s.replace(/javascript:/gi, '');
            return s;
        }

        function formatFinalOutput(text) {
            if (!text) return { html: '', isRichHTML: false };
            var s = String(text);
            var isHTML = false;
            try {
                var parsed = JSON.parse(s);
                if (parsed && typeof parsed === 'object') {
                    if (typeof parsed.answer === 'string') { s = parsed.answer; isHTML = /<\w+[\s>]/.test(s); }
                    else if (typeof parsed.result === 'string') s = parsed.result;
                    else if (typeof parsed.message === 'string') s = parsed.message;
                    else if (typeof parsed.output === 'string') s = parsed.output;
                }
            } catch (e) {
                var m = s.match(/'result'\s*:\s*'([\s\S]*?)'\s*,\s*'has_more_question'/);
                if (m) s = m[1];
            }
            if (isHTML) return { html: sanitizeHTML(s), isRichHTML: true };
            s = s.replace(/\\n/g, '\n');
            s = escHtml(s);
            s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            s = s.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:10px;font-size:.95em;color:var(--aci-text)">$1</strong>');
            s = s.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:12px;font-size:1em;color:var(--aci-text)">$1</strong>');
            s = s.replace(/^- (.+)$/gm, '• $1');
            s = s.replace(/`([^`]+)`/g, '<code style="background:var(--aci-surface3);padding:1px 5px;border-radius:3px;font-family:var(--aci-mono);font-size:.88em">$1</code>');
            s = s.replace(/\n/g, '<br>');
            return { html: s, isRichHTML: false };
        }

        // ─────────────────────────────────────────
        //  Build the DOM
        // ─────────────────────────────────────────
        function buildDOM() {
            $root = $('<div class="aci-root">');

            // ── toolbar ──
            var $toolbar = $('<div class="VAI-aci-toolbar">');
            var $logoMark = $('<div class="VAI-aci-logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>');
           // var $logoText = $('<div class="aci-logo-text">AgentCI <span>/ Flow Tracer</span></div>');
            var $logoText = $(
                '<div class="VAI-aci-logo-text">' +
                VIS.Msg.getMsg("VAI_AgentCI") +
                ' <span>/ ' +
                VIS.Msg.getMsg("VAI_FlowTracer") +
                '</span>' +
                '</div>'
            );
            $liveDot = $('<span class="VAI-aci-live-dot off">');
            $lastRefresh = $('<span>').text(VIS.Msg.getMsg("VAI_Waitingforlogs"));
            var $sessionPill = $('<div class="VAI-aci-session-pill">').append($liveDot).append($lastRefresh);
            var $spacer = $('<div class="VAI-aci-spacer">');
            $themeToggle = $('<button class="VAI-aci-icon-btn" title="Toggle theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></button>');
            $toggleConfig = $('<button class="VAI-aci-icon-btn" title="Connection settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>');
            $fetchBtn = $('<button class="VAI-aci-btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Refresh</button>');
            $toolbar.append($logoMark).append($logoText).append($sessionPill).append($spacer)
                .append($themeToggle).append($toggleConfig).append($fetchBtn);

            // ── stats ──
            var $stats = $('<div class="VAI-aci-stats">');
            var $row1 = $('<div class="VAI-aci-stats-row r3">');
            var $row2 = $('<div class="VAI-aci-stats-row r4">');

            function statTile(iconClass, iconSvg, labelId, valueId, subId, barId) {
                var $tile = $('<div class="VAI-aci-stat">');
                var $icon = $('<div class="VAI-aci-stat-icon ' + iconClass + '">').html(iconSvg);
                var $body = $('<div class="VAI-aci-stat-body">');
                var $lbl = $('<div class="VAI-aci-stat-label">' + labelId + '</div>');
                var $val = $('<div class="VAI-aci-stat-value" id="' + valueId + '">0</div>');
                var $sub = $('<div class="VAI-aci-stat-sub" id="' + subId + '">—</div>');
                $body.append($lbl).append($val).append($sub);
                if (barId) {
                    var $bar = $('<div class="VAI-aci-tile-bar"><div class="VAI-aci-tile-bar-fill" id="' + barId + '" style="width:0%"></div></div>');
                    $body.append($bar);
                }
                return $tile.append($icon).append($body);
            }

            var ICON_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
            var ICON_TABLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>';
            var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
            var ICON_BAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 00-2 2v7h6v-9zM15 7h-6v13h6V7zM21 3h-6v17h6V3z"/></svg>';
            var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>';
            var ICON_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
            var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';

            $row1.append(statTile('cyan', ICON_BOLT, VIS.Msg.getMsg("VAI_CreateAIKey"), 'aci-sAutoTok', 'aci-sAutoTokSub'))
                .append(statTile('purple', ICON_TABLE, VIS.Msg.getMsg("VAI_TotalUsedToken"), 'aci-sTenantUsed', 'aci-sTenantUsedSub'))
                .append(statTile('accent', ICON_CLOCK, VIS.Msg.getMsg("VAI_TotalToken"), 'aci-sTotalToken', 'aci-sTotalTokenSub'));
            $row2.append(statTile('blue', ICON_BAR, VIS.Msg.getMsg("VAI_TotalTask"), 'aci-sCmds', 'aci-sCmdsSub'))
                .append(statTile('green', ICON_CHECK, VIS.Msg.getMsg("VAI_SuccessRate"), 'aci-sRate', 'aci-sRateSub'))
                .append(statTile('orange', ICON_USER, VIS.Msg.getMsg("VAI_UsedTokenbyLoginUser"), 'aci-sUserUsed', 'aci-sUserUsedSub', 'aci-sUserUsedBar'))
                .append(statTile('yellow', ICON_SUN, VIS.Msg.getMsg("VAI_PendingToken"), 'aci-sPending', 'aci-sPendingSub', 'aci-sPendingBar'));

            $stats.append($row1).append($row2);

            // ── sidebar ──
             $sidebar = $('<div class="VAI-aci-sidebar">');
            var $sHead = $('<div class="VAI-aci-sidebar-head">');
            var $sTitleRow = $('<div class="VAI-aci-sidebar-title-row">');
            var $sTitle = $('<div class="VAI-aci-sidebar-title">' + VIS.Msg.getMsg("VAI_Commands") +'</div>');
            $cmdCount = $('<span class="VAI-aci-count-pill">0</span>');
            $sTitleRow.append($sTitle).append($cmdCount);

            var $searchWrap = $('<div class="VAI-aci-search-wrap">');
            var $searchIcon = $('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>');           
            //$searchInput = $('<input type="text" placeholder="' + VIS.Msg.getMsg("VAI_AISearchPH") + '">');
            $searchInput = $('<input type="text" ' + 'placeholder="' + VIS.Msg.getMsg("VAI_AISearchPH") + '" ' + 'style="padding-left:7%;">');
            // ── Filter button ──
            var $filterBtn = $('<button class="VAI-aci-icon-btn VAI-aci-filter-toggle-btn" title="Date Filter" style="flex-shrink:0;position:relative;">' +
                '<i class="fa fa-filter"></i>' +
                '</button>');
            var $customRangeHtml = $(
                '<div style="display:flex;gap:6px;align-items:center;">' +
                '<input type="date" id="aci-startDate" style="flex:1;padding:6px;border-radius:var(--aci-radius-sm);border:1px solid var(--aci-border);background:var(--aci-surface2);color:var(--aci-text);font-size:0.78rem;outline:none;">' +
                '<span style="font-size:0.75rem;color:var(--aci-text-muted);flex-shrink:0;">' + msgTo + '</span>' +
                '<input type="date" id="aci-endDate" style="flex:1;padding:6px;border-radius:var(--aci-radius-sm);border:1px solid var(--aci-border);background:var(--aci-surface2);color:var(--aci-text);font-size:0.78rem;outline:none;">' +
                '</div>'
            );
            var $dateFilterWrap = $('<div class="VAI-aci-date-filter-wrap" style="display:none;flex-direction:column;gap:6px;margin-bottom:6px;">');
            var msgTo = VIS.Msg.getMsg("VAI_To") || "to";
            var $customRangeHtml = $(
                '<div style="display:flex;gap:6px;align-items:center;">' +
                '<input type="date" id="aci-startDate" style="flex:1;padding:6px;border-radius:var(--aci-radius-sm);border:1px solid var(--aci-border);background:var(--aci-surface2);color:var(--aci-text);font-size:0.78rem;outline:none;">' +
                '<span style="font-size:0.75rem;color:var(--aci-text-muted);flex-shrink:0;">' + msgTo + '</span>' +
                '<input type="date" id="aci-endDate" style="flex:1;padding:6px;border-radius:var(--aci-radius-sm);border:1px solid var(--aci-border);background:var(--aci-surface2);color:var(--aci-text);font-size:0.78rem;outline:none;">' +
                '</div>'
            );
            $dateFilterWrap.append($customRangeHtml);

            $searchWrap.append($searchIcon).append($searchInput).append($filterBtn);
            $filterChips = $('<div class="VAI-aci-filter-chips">');
            $filterChips.html(
                '<span class="VAI-aci-fchip active" data-filter="all">' + VIS.Msg.getMsg("VAI_All") +" "+' <span class="ct" id="aci-fAll">0</span></span>' +
                '<span class="VAI-aci-fchip " data-filter="assistant">' + VIS.Msg.getMsg("VAI_AIAssistant") + " " +' <span class="ct" id="aci-fAssistant">0</span></span>' +
                /*'<span class="aci-fchip" data-filter="orchestration">' + VIS.Msg.getMsg("VAI_OrcheupdateDateFilterDropdownstration") + " " +' <span class="ct" id="aci-fOrchestration">0</span></span>' +*/
                '<span class="VAI-aci-fchip" data-filter="orchestration">' + VIS.Msg.getMsg("VAI_Orchestration") + " " +' <span class="ct" id="aci-fOrchestration">0</span></span>' +
                '<span class="VAI-aci-fchip" data-filter="dms">' + VIS.Msg.getMsg("VAI_DMS") + " " +' <span class="ct" id="aci-fDms">0</span></span>' +
                '<span class="VAI-aci-fchip" data-filter="aura">' + VIS.Msg.getMsg("VAI_Aura") + " " +'  <span class="ct" id="aci-fAura">0</span></span>'
            );

          //  $sHead.append($sTitleRow).append($searchWrap).append($filterChips);
           $sHead.append($sTitleRow).append($searchWrap).append($dateFilterWrap).append($filterChips);
            $cmdList = $('<div class="VAI-aci-cmd-list">').html(
                '<div class="VAI-aci-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><div>No commands loaded yet</div></div>'
            );
            var $pager = $('<div class="VAI-aci-pager">' +
                '<button class="VAI-aci-mini-btn VAI-aci-page-prev">Prev</button>' +
                '<span class="aci-page-info">Page 1 / 1</span>' +
                '<button class="VAI-aci-mini-btn VAI-aci-page-next">Next</button>' +
                '</div>');
            $sidebar.append($sHead).append($cmdList).append($pager);

            // ── detail ──
            $detailPane = $('<div class="VAI-aci-detail">');
            $errorBanner = $('<div class="VAI-aci-error-banner">').hide();
            $configPanel = $('<div class="VAI-aci-config">').hide();
            // Config hidden — API is hardcoded inside fetchLogs
            $detailContent = $('<div>').html(
                '<div class="VAI-aci-detail-empty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' +
                '<h3>' + VIS.Msg.getMsg("VAI_SelectCommand") + '</h3>' +
                '<p>' + VIS.Msg.getMsg("VAI_SelectCommandDesc") + '</p>' +
                '</div>'
            );
           /* $detailContent = $('<div>').html(
                '<div class="VAI-aci-detail-empty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' +
                '<h3>Select a command to view trace</h3>' +
                '<p>Choose any command from the left panel to inspect its execution timeline, agent pipeline, tool calls, and full results.</p>' +
                '</div>'
            );*/
            $detailPane.append($errorBanner).append($configPanel).append($detailContent);

            // ── body ──
            var $body = $('<div class="aci-body">').append($sidebar).append($detailPane);

            $root.append($toolbar).append($stats).append($body);

            // Gather references to stat elements AFTER they are in the DOM
            $statAutoTok = $root.find('#aci-sAutoTok');
            $statAutoTokSub = $root.find('#aci-sAutoTokSub');
            $statTenantUsed = $root.find('#aci-sTenantUsed');
            $statTenantUsedSub = $root.find('#aci-sTenantUsedSub');
            $statTotalToken = $root.find('#aci-sTotalToken');
            $statTotalTokenSub = $root.find('#aci-sTotalTokenSub');
            $statCmds = $root.find('#aci-sCmds');
            $statCmdsSub = $root.find('#aci-sCmdsSub');
            $statRate = $root.find('#aci-sRate');
            $statRateSub = $root.find('#aci-sRateSub');
            $statUserUsed = $root.find('#aci-sUserUsed');
            $statUserUsedSub = $root.find('#aci-sUserUsedSub');
            $statUserUsedBar = $root.find('#aci-sUserUsedBar');
            $statPending = $root.find('#aci-sPending');
            $statPendingSub = $root.find('#aci-sPendingSub');
            $statPendingBar = $root.find('#aci-sPendingBar');
            $fAll = $root.find('#aci-fAll');
            $fAssistant = $root.find('#aci-fAssistant');
            $fOrchestration = $root.find('#aci-fOrchestration');
            $fDms = $root.find('#aci-fDms');
            $fAura = $root.find('#aci-fAura');
            $apiUrl = $('<input>'); $userId = $('<input>'); $endpointUrl = $('<input>');
            $pagePrev = $root.find('.VAI-aci-page-prev');
            $pageNext = $root.find('.VAI-aci-page-next');
            $pageInfo = $root.find('.aci-page-info');
            $dateSelect = $root.find('#aci-dateSelect');
            $customDateRange = $root.find('#aci-customDateRange');
            $startDateInput = $root.find('#aci-startDate');
            $endDateInput = $root.find('#aci-endDate');
            $startDateInput = $root.find('#aci-startDate');
            $endDateInput = $root.find('#aci-endDate');
        }

        // ─────────────────────────────────────────
        //  Events
        // ─────────────────────────────────────────
        function bindEvents() {
            //$fetchBtn.on('click', fetchLogs);
            $fetchBtn.on('click', function () {
                fetchLogs(currentPage);
            });
            $themeToggle.on('click', function () {
                var isDark = $root.hasClass('aci-dark');
                applyTheme(!isDark);
            });

            $toggleConfig.on('click', function () {
                $configPanel.toggle();
            });

            $searchInput.on('input', function () {
                currentSearch = $searchInput.val().trim();
                renderSidebar();
            });

            $filterChips.on('click', '.VAI-aci-fchip', function () {
                $filterChips.find('.VAI-aci-fchip').removeClass('active');
                $(this).addClass('active');
                currentFilter = $(this).data('filter');
                //renderSidebar();
                fetchLogs(1);
            });

            $cmdList.on('click', '.VAI-aci-cmd-item', function () {
                var id = parseInt($(this).data('cmdId'));
                selectedCmdId = id;
                var cmd = findCmd(id);
                renderSidebar();
                if (cmd) renderDetail(cmd);
            });

            // Agent expand/collapse (delegated)
            $detailContent.on('click', '.VAI-aci-agent-header', function () {
                $(this).closest('.VAI-aci-agent-node').toggleClass('expanded');
            });

            // Method expand/collapse (delegated)
            $detailContent.on('click', '.VAI-aci-method-header', function () {
                $(this).closest('.VAI-aci-method-card').toggleClass('expanded');
            });

            // IO tab switch (delegated)
            $detailContent.on('click', '.VAI-aci-io-tab', function () {
                var $tabs = $(this).closest('.VAI-aci-io-tabs');
                var $wrap = $tabs.closest('.VAI-aci-method-body');
                $tabs.find('.VAI-aci-io-tab').removeClass('active');
                $(this).addClass('active');
                var dir = $(this).data('dir');
                $wrap.find('.VAI-aci-io-in').toggle(dir === 'in');
                $wrap.find('.aci-io-out').toggle(dir === 'out');
            });

            // Expand/collapse all agents
            $detailContent.on('click', '.aci-expand-all', function () { $detailContent.find('.VAI-aci-agent-node').addClass('expanded'); });
            $detailContent.on('click', '.aci-collapse-all', function () { $detailContent.find('.VAI-aci-agent-node').removeClass('expanded'); });

            // Copy JSON
            $detailContent.on('click', '.VAI-aci-copy-btn', function () {
                var $btn = $(this);
                var text = $btn.siblings('.aci-json-block').text();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(function () {
                        $btn.text('✓ Copied').addClass('copied');
                        setTimeout(function () { $btn.text('Copy').removeClass('copied'); }, 1500);
                    });
                }
            });
            $root.on('click', '.VAI-aci-page-prev', function () {
                if (currentPage > 1) fetchLogs(currentPage - 1);
            });

            $root.on('click', '.VAI-aci-page-next', function () {
                if (currentPage < totalPages) fetchLogs(currentPage + 1);
            });
            $root.on('click', '.aci-create-key-action', function () {
                //console.log("button clicked")
                createAIKey();
            });
            $dateSelect.on('change', function () {
                currentDateFilter = $(this).val();
                if (currentDateFilter === 'custom') {
                    $customDateRange.css('display', 'flex');
                } else {
                    $customDateRange.hide();
                    currentStartDate = '';
                    currentEndDate = '';
                    $startDateInput.val('');
                    $endDateInput.val('');
                }
                renderSidebar();
            });

            $startDateInput.on('change', function () {
                currentStartDate = $(this).val();
                renderSidebar();
            });

            $endDateInput.on('change', function () {
                currentEndDate = $(this).val();
                renderSidebar();
            });

            //date click event
            // ── Filter button toggles date panel ──
            // ── Filter button toggles date panel ──
            $root.on('click', '.VAI-aci-filter-toggle-btn', function () {
                var $btn = $(this);
                var $panel = $root.find('.VAI-aci-date-filter-wrap');
                var isOpen = $panel.is(':visible');

                if (isOpen) {
                    $panel.css('display', 'none');
                    $btn.removeClass('active');
                    // Reset date filters on close
                    currentStartDate = '';
                    currentEndDate = '';
                    $startDateInput.val('');
                    $endDateInput.val('');
                    renderSidebar();
                } else {
                    $panel.css('display', 'flex');
                    $btn.addClass('active');
                    // Default to last 7 days
                    var today = new Date();
                    var prior = new Date();
                    prior.setDate(today.getDate() - 7);
                    var toDateStr = today.toISOString().substring(0, 10);
                    var fromDateStr = prior.toISOString().substring(0, 10);
                    $startDateInput.val(fromDateStr);
                    $endDateInput.val(toDateStr);
                    currentStartDate = fromDateStr;
                    currentEndDate = toDateStr;
                    renderSidebar();
                }
            });

            // ── Start date change ──
            $startDateInput.on('change', function () {
                currentStartDate = $(this).val();
                // Ensure end date is not before start date
                if (currentEndDate && currentStartDate > currentEndDate) {
                    currentEndDate = currentStartDate;
                    $endDateInput.val(currentStartDate);
                }
                renderSidebar();
            });

            // ── End date change ──
            $endDateInput.on('change', function () {
                currentEndDate = $(this).val();
                // Ensure start date is not after end date
                if (currentStartDate && currentEndDate < currentStartDate) {
                    currentStartDate = currentEndDate;
                    $startDateInput.val(currentEndDate);
                }
                renderSidebar();
            });


        }
        //reder page info
        function renderPager() {
            if (!$pageInfo) return;

            $pageInfo.text('Page ' + currentPage + ' / ' + totalPages + ' · ' + totalRecords + ' records');

            $pagePrev.prop('disabled', currentPage <= 1);
            $pageNext.prop('disabled', currentPage >= totalPages);
        }

       //  Theme
        function applyTheme(dark) {
            $root.toggleClass('aci-dark', dark);
            try { localStorage.setItem('aci-theme', dark ? 'dark' : 'light'); } catch (e) { }
            if (dark) {
                $themeToggle.html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>');
            } else {
                $themeToggle.html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>');
            }
        }   

     
        function fetchLogs(page) {
           currentPage = page || 1;
            $fetchBtn.prop('disabled', true)
                .html('<span class="aci-spinner"></span> Loading...');
            $errorBanner.hide();
            var taskFromMap = {
                'all': 'All',
                'assistant': 'AIAssistant',
                'orchestration': 'AIOrchestration',
                'dms': 'DMS',
                'aura': 'Aura'
            };
            var taskFrom = taskFromMap[currentFilter] || '';
            $.ajax({
                url: VIS.Application.contextUrl + "Window/getTokenData",
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                 //   userID: API_USER_ID,
                 //  endPoints: API_ENDPOINT,
                    task_from: taskFrom,
                    page: currentPage,
                 //  counter: 1,
                 // page_size: pageSize
                }),
                success: function (data) {
                    data = data || {};
                   
                    if (data.message === "Sorry user not found" || data.IsAIKeyExist === false) {
                        logsData = [];
                        totalRecords = 0;
                        totalPages = 1;
                       // $root.children().hide();
                        showCreateKeyBoxOnly();
                        resetFetchBtn();
                        return;
                    }
                    apiSummary.isAIKeyExist = data.IsAIKeyExist === true;
                    apiSummary.aiKeySuffix = data.AIKeySuffix || '';

                    apiSummary.totalEndpointTokens = data.total_token_used_in_endpoint != null
                        ? Number(data.total_token_used_in_endpoint)
                        : 0;

                    apiSummary.totalTokenInEndpoint = data.total_token_in_endpoint != null
                        ? Number(data.total_token_in_endpoint)
                        : 0;

                    apiSummary.userTotalTokens =
                        data.user_total_tokens && data.user_total_tokens.total_tokens != null
                            ? Number(data.user_total_tokens.total_tokens)
                            : 0;

                    apiSummary.userTotalTasks =
                        data.user_total_task && data.user_total_task.total_tasks != null
                            ? Number(data.user_total_task.total_tasks)
                            : 0;

                    apiSummary.successRate = data.success_rate != null
                        ? Number(data.success_rate)
                        : null;

                    apiSummary.pendingTokens = data.pending_tokens != null
                        ? Number(data.pending_tokens)
                        : 0;

                    if (data.all_task) {
                        currentPage = Number(data.all_task.page || currentPage);
                        pageSize = Number(data.all_task.page_size || pageSize);
                        totalRecords = Number(data.all_task.total_records || 0);
                        totalPages = Number(data.all_task.total_pages || 1);

                        logsData = Array.isArray(data.all_task.data)
                            ? data.all_task.data
                            : [];
                    } else {
                        logsData = [];
                        totalRecords = 0;
                        totalPages = 1;
                    }

                    renderAll();
                    renderPager();
                    
                    $lastRefresh.text(" " + VIS.Msg.getMsg("VAI_Lastsync") + " " + fmtTime(new Date().toISOString()));
                    $liveDot.removeClass('off');
                    resetFetchBtn();
                  //  showCreateKeyBoxOnly();
                },
                error: function (xhr) {
                    showError('Failed to fetch: HTTP ' + xhr.status + ' ' + xhr.statusText);
                    $liveDot.addClass('off');
                    resetFetchBtn();
                }
            });
        }
       function createAIKey() {
            var $btn = $root.find('.aci-create-key-action');

            $btn.prop('disabled', true)
               .html('<span class="aci-spinner"></span> Creating...');

            $errorBanner.hide();

            $.ajax({
                url: VIS.Application.contextUrl + "Window/createAIKey",
                method: 'POST',
                dataType: 'json',
                success: function (data) {
                    data = data || {};

                    if (data.error) {
                        showError(data.message || 'Failed to create AI key');
                        $btn.prop('disabled', false)
                            .html(
                                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                                '<path d="M12 5v14"></path>' +
                                '<path d="M5 12h14"></path>' +
                                '</svg>' +
                                VIS.Msg.getMsg("VAI_CreateAIKey")
                            );
                        return;
                    }

                    $root.find('.VAI-aci-create-key-only').remove();
                    $root.children().show();
                   
                    fetchLogs(1);
                },
                error: function (xhr) {
                    showError('Failed to create key: HTTP ' + xhr.status + ' ' + xhr.statusText);

                    $btn.prop('disabled', false)
                        .html(
                            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                            '<path d="M12 5v14"></path>' +
                            '<path d="M5 12h14"></path>' +
                            '</svg>' +
                            VIS.Msg.getMsg("VAI_CreateAIKey")
                        );
                }
            });
        }
        function buildCreateKeyBox() {
            return $(
                '<div class="VAI-aci-create-key-card">' +
                '<div class="VAI-aci-stat-icon cyan">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>' +
                '</svg>' +
                '</div>' +
                '<div class="VAI-aci-create-key-body">' +
                '<div class="VAI-aci-stat-label">' + VIS.Msg.getMsg("VAI_CreateAIKey") + '</div>' +
                '<div class="VAI-aci-create-key-title">' + VIS.Msg.getMsg("VAI_Keynotcreatedyet") + '</div>' +
                '<div class="VAI-aci-stat-sub">' + VIS.Msg.getMsg("VAI_Createkey") + '</div>' +
                '<button class="VAI-aci-btn primary aci-create-key-action" type="button">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M12 5v14"></path>' +
                '<path d="M5 12h14"></path>' +
                '</svg>' +
                VIS.Msg.getMsg("VAI_CreateAIKey") +
                '</button>' +
                '</div>' +
                '</div>'
            );
        }
        function showCreateKeyBoxOnly() {
            var $box = buildCreateKeyBox();
            $root.children().hide();
            $root.append(
                $('<div class="VAI-aci-create-key-only">').append($box)
            );
        }

        function resetFetchBtn() {
            $fetchBtn.prop('disabled', false)
                .html('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> Refresh');
        }

        function showError(msg) {
            $errorBanner.text(msg).show();
        }

        function findCmd(id) {
            for (var i = 0; i < logsData.length; i++) {
                if (logsData[i].aicommand_id === id) return logsData[i];
            }
            return null;
        }
     /*   function updateDateFilterDropdown() {
            if (!$dateSelect) return;
            var dates = {};
            logsData.forEach(function (cmd) {
                if (cmd.starttime) {
                    var dateStr = cmd.starttime.substring(0, 10);
                    dates[dateStr] = true;
                }
            });
            var sortedDates = Object.keys(dates).sort(function (a, b) {
                return new Date(b) - new Date(a);
            });
            var msgAllDates = VIS.Msg.getMsg("VAI_AllDates") || "All Dates";
            var msgCustomRange = VIS.Msg.getMsg("VAI_CustomRange") || "Custom Range";
            var html = '<option value="all">' + msgAllDates + '</option>';
            sortedDates.forEach(function (d) {
                var formatted = new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                html += '<option value="' + d + '">' + formatted + '</option>';
            });
            html += '<option value="custom">' + msgCustomRange + '</option>';
            $dateSelect.html(html);
            $dateSelect.val(currentDateFilter);
        }*/
        // ─────────────────────────────────────────
        //  Render
        // ─────────────────────────────────────────
        function renderAll() {
            //  updateDateFilterDropdown();aci - fchip
            renderStats(); 
            renderSidebar();

            $filterChips.find('.VAI-aci-fchip').removeClass('active');
            $filterChips.find('.VAI-aci-fchip[data-filter="' + currentFilter + '"]').addClass('active');
           /* if (!logsData.length) {
                // No data for this filter — leave detail pane as-is
                return;
            }*/
            if (selectedCmdId != null) {
                var found = findCmd(selectedCmdId);
                if (found) { renderDetail(found); return; }
               /* $detailContent.html(
                    '<div class="VAI-aci-detail-empty">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' +
                    '<h3>Select a command to view trace</h3>' +
                    '<p>Choose any command from the left panel to inspect its execution timeline, agent pipeline, tool calls, and full results.</p>' +
                    '</div>'
                );*/
                $detailContent = $('<div>').html(
                    '<div class="VAI-aci-detail-empty">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>' +
                    '<h3>' + VIS.Msg.getMsg("VAI_SelectCommand") + '</h3>' +
                    '<p>' + VIS.Msg.getMsg("VAI_SelectCommandDesc") + '</p>' +
                    '</div>'
                );

            }
            if (logsData.length) {
                var sorted = logsData.slice().sort(function (a, b) { return new Date(b.starttime) - new Date(a.starttime); });
                selectedCmdId = sorted[0].aicommand_id;
                renderSidebar();
                renderDetail(sorted[0]);
            }
           /* var sorted = logsData.slice().sort(function (a, b) {
                return new Date(b.starttime) - new Date(a.starttime);
            });
            selectedCmdId = sorted[0].aicommand_id;
            renderSidebar();
            renderDetail(sorted[0]);*/
        }
        function renderStats() {
            // Compute quota dynamically as sum of all tokens in dataset
            if (logsData.length) {
                var computedTotal = 0;
                logsData.forEach(function (cmd) { computedTotal += (cmd.total_tokens || 0); });
                TOTAL_TOKEN_QUOTA = computedTotal;
            }

            // ── Always render these — they come from apiSummary, not logsData ──
            var totalQuota = apiSummary.totalTokenInEndpoint;
            var tenantUsed = apiSummary.totalEndpointTokens;
            var usedPct = totalQuota ? Math.min(100, tenantUsed / totalQuota * 100) : 0;
            var pendPct = totalQuota ? Math.min(100, apiSummary.pendingTokens / totalQuota * 100) : 0;
            var totTasks = Number(apiSummary.userTotalTasks || 0);
            var successTasks = apiSummary.successRate != null
                ? Math.round(totTasks * Number(apiSummary.successRate) / 100) : 0;

            $statTotalToken.text(fmtTokens(apiSummary.totalTokenInEndpoint));
            $statTotalTokenSub.text(VIS.Msg.getMsg("VAI_TenantQuota"));

            $statAutoTok.text(apiSummary.aiKeySuffix ? '*******' + apiSummary.aiKeySuffix : '—');
            $statAutoTokSub.text(' ');

            $statTenantUsed.text(fmtTokens(apiSummary.totalEndpointTokens));
            $statTenantUsedSub.text(' ');

            $statCmds.text(apiSummary.userTotalTasks);
            $statCmdsSub.text(' ');

            $statRate.text(apiSummary.successRate != null
                ? Number(apiSummary.successRate).toFixed(1) + '%' : '—');
            $statRateSub.text(apiSummary.successRate != null
                ? successTasks + '/' + totTasks + ' ' + VIS.Msg.getMsg("VAI_tasks") : '—');

            $statUserUsed.text(fmtTokens(apiSummary.userTotalTokens));
            $statUserUsedSub.text(usedPct.toFixed(1) + '% ' + VIS.Msg.getMsg("VAI_quota"));
            $statUserUsedBar.css({
                width: usedPct + '%',
                background: usedPct > 85 ? 'var(--aci-red)'
                    : usedPct > 60 ? 'var(--aci-yellow)' : 'var(--aci-orange)'
            });

            $statPending.text(fmtTokens(apiSummary.pendingTokens));
            $statPendingSub.text(pendPct.toFixed(1) + VIS.Msg.getMsg("VAI_Remaining"));
            $statPendingBar.css({
                width: pendPct + '%',
                background: pendPct < 15 ? 'var(--aci-red)'
                    : pendPct < 40 ? 'var(--aci-yellow)' : 'var(--aci-green)'
            });

          
           
            $fAll.text(totTasks);
            // ── Filter chip counts — based on logsData (current page) ──
            if (!logsData.length) {
                // No task data for this filter, but keep summary stats above intact
                $statUserUsedBar.css('width', usedPct + '%');
               // [$fAll, $fAssistant, $fOrchestration, $fDms, $fAura]
                [$fAssistant, $fOrchestration, $fDms, $fAura]
                    .forEach(function ($e) { $e.text('0'); });
                // Show totalRecords in All chip (0 for this filter)
              //  $fAll.text(totalRecords);
                return;
            }

            // ── Chip counts from current page data ──
            var assistantCount = logsData.filter(function (c) {
                return /assistant/i.test(String(c.taskfrom || ''));
            }).length;
            var orchestrationCount = logsData.filter(function (c) {
                return /orchestrat/i.test(String(c.taskfrom || ''));
            }).length;
            var dmsCount = logsData.filter(function (c) {
                return /dms/i.test(String(c.taskfrom || ''));
            }).length;
            var auraCount = logsData.filter(function (c) {
                return /aura/i.test(String(c.taskfrom || ''));
            }).length;
          
            $fAssistant.text(assistantCount);
            $fOrchestration.text(orchestrationCount);
            $fDms.text(dmsCount);
            $fAura.text(auraCount);
           
        }


       /* function getFilteredCommands() {
            var list = logsData.slice();
            // Date Filter logic
            if (currentDateFilter === 'custom') {
                if (currentStartDate) {
                    var startLimit = new Date(currentStartDate + 'T00:00:00');
                    list = list.filter(function (c) {
                        return c.starttime && new Date(c.starttime) >= startLimit;
                    });
                }
                if (currentEndDate) {
                    var endLimit = new Date(currentEndDate + 'T23:59:59');
                    list = list.filter(function (c) {
                        return c.starttime && new Date(c.starttime) <= endLimit;
                    });
                }
            } else if (currentDateFilter !== 'all') {
                // Specific date filter, e.g. YYYY-MM-DD
                list = list.filter(function (c) {
                    return c.starttime && c.starttime.substring(0, 10) === currentDateFilter;
                });
            }
            if (currentFilter === 'assistant') {
                list = list.filter(function (c) { return /assistant/i.test(String(c.taskfrom || '')); });
            } else if (currentFilter === 'orchestration') {
                list = list.filter(function (c) { return /orchestrat/i.test(String(c.taskfrom || '')); });
            } else if (currentFilter === 'dms') {
                list = list.filter(function (c) { return /dms/i.test(String(c.taskfrom || '')); });
            } else if (currentFilter === 'aura') {
                list = list.filter(function (c) { return /aura/i.test(String(c.taskfrom || '')); });
            }
            if (currentSearch) {
                var q = currentSearch.toLowerCase();
                list = list.filter(function (c) {
                    return extractSubject(c.commandtext).toLowerCase().includes(q) ||
                        String(c.aicommand_id).includes(q) ||
                        parseAgents(c.agents).map(function (a) { return (a.agent_name || '').toLowerCase(); }).join(' ').includes(q);
                });
            }
            return list.sort(function (a, b) { return new Date(b.starttime) - new Date(a.starttime); });
        }*/
        function getFilteredCommands() {
            var list = logsData.slice();

            // ── Date range filter (local) ──
            if (currentStartDate) {
                var startLimit = new Date(currentStartDate + 'T00:00:00');
                list = list.filter(function (c) {
                    return c.starttime && new Date(c.starttime) >= startLimit;
                });
            }
            if (currentEndDate) {
                var endLimit = new Date(currentEndDate + 'T23:59:59');
                list = list.filter(function (c) {
                    return c.starttime && new Date(c.starttime) <= endLimit;
                });
            }

            // ── Search filter ──
            if (currentSearch) {
                var q = currentSearch.toLowerCase();
                list = list.filter(function (c) {
                    return extractSubject(c.commandtext).toLowerCase().includes(q) ||
                        String(c.aicommand_id).includes(q) ||
                        parseAgents(c.agents).map(function (a) {
                            return (a.agent_name || '').toLowerCase();
                        }).join(' ').includes(q);
                });
            }

            return list.sort(function (a, b) {
                return new Date(b.starttime) - new Date(a.starttime);
            });
        }

        function renderSidebar() {
            var list = getFilteredCommands();
            $cmdCount.text(list.length);

            if (!list.length) {
                $cmdList.html(
                    '<div class="VAI-aci-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>' +
                    '<div>' + (logsData.length ? 'No commands match filter' : 'No commands loaded yet') + '</div></div>'
                );
                return;
            }

            var buckets = {};
            TASK_GROUPS.forEach(function (g) { buckets[g.id] = []; });
            list.forEach(function (cmd) { buckets[categorize(cmd.taskfrom)].push(cmd); });

            var html = '';
            TASK_GROUPS.forEach(function (g) {
                var items = buckets[g.id];
                if (!items.length) return;
                html += '<div class="VAI-aci-group-head ' + g.id + '"><span class="aci-gicon">' + g.icon + '</span><span class="aci-gname">' + g.label + '</span><span class="aci-gcount">' + items.length + '</span></div>';
                items.forEach(function (cmd) { html += buildCmdItem(cmd); });
            });

            $cmdList.html(html);
        }

        function buildCmdItem(cmd) {
            var agents = parseAgents(cmd.agents);
            var dur = calcDurationMs(cmd.starttime, cmd.endtime);
            var sc = statusClass(cmd.status);
            var cat = categorize(cmd.taskfrom);
            var isSel = cmd.aicommand_id === selectedCmdId;

            var ctxInfo = safeParseJSON(cmd.contextinfo) || {};
            var orchId = ctxInfo.orchestration_id || ' ';
            return '<div class="VAI-aci-cmd-item cat-' + cat + (isSel ? ' selected' : '') + '" data-cmd-id="' + cmd.aicommand_id + '">' +
                '<div class="VAI-aci-cmd-item-top"><span class="VAI-aci-status-dot ' + sc + '"></span><span class="VAI-aci-cmd-id-tag">#' + orchId + '</span><span class="VAI-aci-cmd-time">' + fmtRelative(cmd.starttime) + '</span></div>' +
                '<div class="VAI-aci-cmd-subject">' + escHtml(extractSubject(cmd.commandtext)) + '</div>' +
                '<div class="VAI-aci-cmd-meta">' +
                '<span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' + agents.length + '</span>' +
                '<span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' + fmtDuration(dur) + '</span>' +
                '<span class="m"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' + fmtTokens(cmd.total_tokens) + '</span>' +
                '</div></div>';
        }

        function renderDetail(cmd) {
            var agents = parseAgents(cmd.agents);
            var agentsSorted = agents.slice().sort(function (a, b) { return (a.sequence_no || 0) - (b.sequence_no || 0); });
            var dur = calcDurationMs(cmd.starttime, cmd.endtime);
            var sc = statusClass(cmd.status);
            var pctIn = cmd.total_tokens ? (cmd.input_tokens || 0) / cmd.total_tokens * 100 : 0;
            var pctOut = cmd.total_tokens ? (cmd.output_tokens || 0) / cmd.total_tokens * 100 : 0;
            var subject = extractSubject(cmd.commandtext);

            var ctxInfo = safeParseJSON(cmd.contextinfo) || {};
            if (typeof ctxInfo !== 'object') ctxInfo = {};
            var sessionId = ctxInfo.sessionID || ctxInfo.session_ID || ctxInfo.sessionId;
            var fo = safeParseJSON(cmd.finaloutput) || {};
            var cat = categorize(cmd.taskfrom);
            var catLabel = (TASK_GROUPS.filter(function (g) { return g.id === cat; })[0] || {}).label || 'Other';

            var chipCls = cat === 'orchestration' ? 'purple' : cat === 'assistance' ? 'blue' : cat === 'aura' ? 'pink' : '';
            var chipRow = '<div class="VAI-aci-chip-row">';
            if (cmd.taskfrom) chipRow += '<span class="VAI-aci-chip ' + chipCls + '">' + escHtml(catLabel) + ' · <strong>' + escHtml(cmd.taskfrom) + '</strong></span>';
            if (ctxInfo.assistant_name) chipRow += '<span class="VAI-aci-chip pink">Assistant · <strong>' + escHtml(ctxInfo.assistant_name) + '</strong></span>';
            if (ctxInfo.assistant_id) chipRow += '<span class="VAI-aci-chip cyan">Assistant ID · <strong>' + escHtml(ctxInfo.assistant_id) + '</strong></span>';
            if (fo.chat_id) chipRow += '<span class="VAI-aci-chip green">Chat #<strong>' + escHtml(fo.chat_id) + '</strong></span>';
            if (fo.question_id) chipRow += '<span class="VAI-aci-chip">Q · <strong>#' + escHtml(fo.question_id) + '</strong></span>';
            if (fo.answer_id) chipRow += '<span class="VAI-aci-chip">A · <strong>#' + escHtml(fo.answer_id) + '</strong></span>';
            if (fo.function_calling === true) chipRow += '<span class="VAI-aci-chip orange">Function Calling</span>';
            chipRow += '</div>';

            var metaGrid = '<div class="VAI-aci-meta-grid">' +
                '<div class="VAI-aci-meta-cell"><div class="ml">Start</div><div class="mv">' + fmtDateLocal(cmd.starttime) + '</div></div>' +
                '<div class="VAI-aci-meta-cell"><div class="ml">End</div><div class="mv">' + fmtDateLocal(cmd.endtime) + '</div></div>' +
                '<div class="VAI-aci-meta-cell"><div class="ml">Duration</div><div class="mv">' + fmtDuration(dur) + '</div></div>' +
                '<div class="VAI-aci-meta-cell"><div class="ml">Total Tokens</div><div class="mv">' + fmtTokens(cmd.total_tokens) + '</div></div>' +
                '<div class="VAI-aci-meta-cell"><div class="ml">Agents</div><div class="mv">' + agentsSorted.length + '</div></div>';
            if (sessionId) metaGrid += '<div class="VAI-aci-meta-cell"><div class="ml">Session</div><div class="mv">' + escHtml(sessionId) + '</div></div>';
            if (ctxInfo.user_id) metaGrid += '<div class="VAI-aci-meta-cell"><div class="ml">User</div><div class="mv">' + escHtml(ctxInfo.user_id) + '</div></div>';
            if (ctxInfo.thread_id) metaGrid += '<div class="VAI-aci-meta-cell"><div class="ml">Thread</div><div class="mv">' + escHtml(truncate(ctxInfo.thread_id, 22)) + '</div></div>';
            if (ctxInfo.endpoint) metaGrid += '<div class="VAI-aci-meta-cell"><div class="ml">Endpoint</div><div class="mv normal">' + escHtml(truncate(ctxInfo.endpoint, 18)) + '</div></div>';
            metaGrid += '</div>';

            var tokenSection = '';
            if (cmd.total_tokens) {
                tokenSection = '<div class="VAI-aci-token-section"><h4>Token Usage — ' + fmtTokens(cmd.total_tokens) + ' total</h4>' +
                    '<div class="VAI-aci-token-bar"><div class="seg in" style="width:' + pctIn + '%"></div><div class="seg out" style="width:' + pctOut + '%"></div></div>' +
                    '<div class="VAI-aci-token-legend">' +
                    '<span><span class="ld" style="background:var(--aci-blue)"></span>Input: ' + fmtTokens(cmd.input_tokens) + ' (' + Math.round(pctIn) + '%)</span>' +
                    '<span><span class="ld" style="background:var(--aci-purple)"></span>Output: ' + fmtTokens(cmd.output_tokens) + ' (' + Math.round(pctOut) + '%)</span>' +
                    '</div></div>';
            }

            var pipelineHtml = agentsSorted.length
                ? buildAgentTree(agentsSorted)
                : '<div style="padding:18px;text-align:center;color:var(--aci-text-muted);font-size:.84rem">No agents recorded</div>';

            var finalOutHtml = '';
            if (cmd.finaloutput) {
                var f = formatFinalOutput(cmd.finaloutput);
                finalOutHtml = '<div class="VAI-aci-section"><div class="VAI-aci-section-head"><h3>' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>Final Output</h3></div>' +
                    '<div class="VAI-aci-fo-text' + (f.isRichHTML ? ' html-rich' : '') + '">' + f.html + '</div></div>';
            }

            var errorHtml = '';
            if (cmd.errormessage) {
                var e = parseErrorMessage(cmd.errormessage);
                errorHtml = '<div class="VAI-aci-section"><div class="VAI-aci-section-head"><h3 style="color:var(--aci-red)">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>Error</h3></div>' +
                    '<div class="VAI-aci-error-block"><div class="err-head">' +
                    (e.code ? '<span class="VAI-aci-err-code">HTTP ' + e.code + '</span>' : '') +
                    '<span class="VAI-aci-err-tag">' + e.tag + '</span></div>' +
                    '<div class="VAI-err-msg">' + escHtml(e.msg) + '</div></div></div>';
            }

            var rawCmd = (cmd.commandtext && cmd.commandtext.length > 200)
                ? '<details style="margin-top:8px"><summary style="font-size:.68rem;color:var(--aci-text-muted);font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">View raw command text</summary><div class="VAI-aci-cmd-subject-full">' + escHtml(cmd.commandtext) + '</div></details>'
                : '';

            var html =
                '<div class="VAI-aci-hero">' +
                '<div class="VAI-aci-hero-top">' +
               /* '<div class="VAI-aci-hero-title"><span class="id"></span><h2>' + escHtml(subject) + '</h2></div>' +*/
                '<div class="VAI-aci-hero-title"><span></span><h2>' + escHtml(subject) + '</h2></div>' +
                '<span class="VAI-aci-status-badge ' + sc + '"><span class="dot"></span>' + (cmd.status || 'Unknown') + '</span>' +
                '</div>' +
                chipRow + rawCmd + metaGrid +
                '</div>' +
                tokenSection +
                '<div class="VAI-aci-section">' +
                '<div class="VAI-aci-section-head"><h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Agent Pipeline <span class="aci-count-pill">' + agentsSorted.length + '</span></h3>' +
                '<div style="display:flex;gap:6px"><button class="VAI-aci-mini-btn aci-expand-all">Expand all</button><button class="VAI-aci-mini-btn aci-collapse-all">Collapse all</button></div></div>' +
                '<div class="VAI-aci-pipeline">' + pipelineHtml + '</div>' +
                '</div>' +
                finalOutHtml + errorHtml;

            $detailContent.html(html);
            $detailPane[0].scrollTop = 0;
        }
        function fmtDateLocal(ts) {
            if (!ts) return '—';
            var d = new Date(ts);
            // If the timestamp has no timezone info, treat it as UTC
            if (typeof ts === 'string' && !ts.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(ts)) {
                d = new Date(ts + 'Z'); // append Z to force UTC parsing
            }
            return d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }) + ' ' + d.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }
        function buildAgentTree(agents) {
            var supervisors = agents.filter(function (a) { return !a.is_delegated_agent; });
            var delegated = agents.filter(function (a) { return a.is_delegated_agent; });

            var supervisorMap = {};
            supervisors.forEach(function (s) { supervisorMap[s.agent_id] = []; });
            delegated.forEach(function (d) {
                var sid = d.supervisor_agent_id;
                if (sid != null && supervisorMap[sid]) supervisorMap[sid].push(d);
            });
            var orphan = delegated.filter(function (d) { return d.supervisor_agent_id == null || !supervisorMap[d.supervisor_agent_id]; });

            var html = '';
            supervisors.forEach(function (sup) {
                html += buildAgentNode(sup, agents);
                var children = (supervisorMap[sup.agent_id] || []).slice().sort(function (a, b) { return (a.sequence_no || 0) - (b.sequence_no || 0); });
                if (children.length) {
                    html += '<div class="VAI-aci-delegated-children">';
                    children.forEach(function (child) { html += buildAgentNode(child, agents); });
                    html += '</div>';
                }
            });
            orphan.forEach(function (d) { html += buildAgentNode(d, agents); });
            return html;
        }

        function findSupervisorName(agents, sid) {
            if (sid == null) return null;
            var found = agents.filter(function (a) { return a.agent_id === sid; });
            return found.length ? found[0].agent_name : null;
        }

        function buildAgentNode(agent, allAgents) {
            var sc = statusClass(agent.status);
            var methods = agent.methods || [];
            var durMs = agent.duration_ms || calcDurationMs(agent.start_time, agent.end_time);
            var isDelegated = agent.is_delegated_agent === true;
            var supName = isDelegated ? findSupervisorName(allAgents, agent.supervisor_agent_id) : null;

            var methodsHtml = methods.length
                ? methods.map(buildMethodCard).join('')
                : '<div class="VAI-aci-methods-title" style="color:var(--aci-text-muted)">No API calls recorded</div>';

            return '<div class="VAI-aci-agent-node status-' + sc + '">' +
                '<div class="VAI-aci-agent-header">' +
                '<span class="VAI-aci-agent-seq">' + (agent.sequence_no != null ? agent.sequence_no : '?') + '</span>' +
                '<span class="VAI-aci-agent-name">' + escHtml(agent.agent_name || 'Unknown') + '</span>' +
                '<span class="VAI-aci-agent-type-pill ' + agentTypePillClass(agent.agent_type) + '">' + agentTypeLabel(agent.agent_type) + '</span>' +
                (isDelegated ? '<span class="VAI-aci-delegated-tag">Delegated</span>' : '') +
                (isDelegated && supName ? '<span style="font-size:.68rem;color:var(--aci-cyan)">' + escHtml(supName) + '</span>' : '') +
                '<span class="VAI-aci-status-badge ' + sc + '" style="font-size:.58rem;padding:2px 7px"><span class="dot"></span>' + (agent.status || '—') + '</span>' +
                '<span class="VAI-aci-agent-dur">' + fmtDuration(durMs) + '</span>' +
                '<span class="VAI-aci-agent-tokens">' + fmtTokens(agent.total_tokens) + '</span>' +
                (methods.length ? '<span class="VAI-aci-agent-tokens" style="color:var(--aci-accent)">' + methods.length + '↻</span>' : '') +
                '<svg class="aci-agent-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
                '</div>' +
                '<div class="VAI-aci-agent-body">' +
                '<div class="VAI-aci-agent-detail-row">' +
                '<div class="VAI-ad"><div class="VAI-adl">Agent ID</div><div class="VAI-adv">' + (agent.agent_id != null ? agent.agent_id : '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Seq</div><div class="VAI-adv">' + (agent.sequence_no != null ? agent.sequence_no : '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Type</div><div class="VAI-adv">' + (agent.agent_type || '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Delegated</div><div class="VAI-adv" style="color:' + (isDelegated ? 'var(--aci-orange)' : 'var(--aci-text-dim)') + '">' + (isDelegated ? 'Yes' : 'No') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Supervisor</div><div class="VAI-adv">' + (isDelegated && agent.supervisor_agent_id != null ? '#' + agent.supervisor_agent_id : '—') + '</div></div>' +
                '</div>' +
                '<div class="VAI-aci-agent-detail-row">' +
                '<div class="VAI-ad"><div class="VAI-adl">Start</div><div class="VAI-adv">' + fmtTime(agent.start_time) + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">End</div><div class="VAI-adv">' + fmtTime(agent.end_time) + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Duration</div><div class="VAI-adv">' + fmtDuration(durMs) + '</div></div>' +
                '<div class="VAi-ad"><div class="VAI-adl">In Tok</div><div class="VAI-adv" style="color:var(--aci-blue)">' + fmtTokens(agent.input_tokens) + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Out Tok</div><div class="VAI-adv" style="color:var(--aci-purple)">' + fmtTokens(agent.output_tokens) + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Total</div><div class="VAI-adv" style="color:var(--aci-accent)">' + fmtTokens(agent.total_tokens) + '</div></div>' +
                '</div>' +
                '<div class="VAI-aci-methods">' +
                '<div class="VAI-aci-methods-title"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg> API / Tool Calls <span class="aci-count-pill" style="font-size:.6rem;padding:1px 6px">' + methods.length + '</span></div>' +
                methodsHtml +
                '</div>' +
                '</div>' +
                '</div>';
        }

        function buildMethodCard(method) {
            var sc = statusClass(method.status);
            var inputD = safeParseJSON(method.input);
            var outputD = safeParseJSON(method.output);
            var iconCls = methodIconClass(method.api_method);
            var steps = (outputD && typeof outputD === 'object' && Array.isArray(outputD.agent_intermediate_steps)) ? outputD.agent_intermediate_steps : [];

            var stepsHtml = '';
            if (steps.length) {
                stepsHtml = '<div class="VAI-aci-tool-steps"><div class="VAI-aci-tool-steps-head">Tool Interactions <span class="aci-count-pill" style="font-size:.6rem;padding:1px 6px">' + steps.length + '</span></div>';
                steps.forEach(function (st, si) {
                    stepsHtml += '<div class="VAI-aci-tool-step"><div class="VAI-tn"><span class="VAI-seq">#' + (si + 1) + '</span><span>' + escHtml(st.tool_name || st.role || 'tool') + '</span>' +
                        (st.tool_call_id ? '<span style="font-size:.64rem;color:var(--aci-text-muted)">' + escHtml(truncate(st.tool_call_id, 26)) + '</span>' : '') + '</div>' +
                        (st.arguments ? '<div class="VAI-arg-line">' + Object.keys(st.arguments).map(function (k) { return '<span class="ak">' + escHtml(k) + '</span>: ' + escHtml(typeof st.arguments[k] === 'object' ? JSON.stringify(st.arguments[k]) : String(st.arguments[k])); }).join(' &nbsp;·&nbsp; ') + '</div>' : '') +
                        (st.observation ? '<div class="VAI-obs">' + escHtml(typeof st.observation === 'object' ? JSON.stringify(st.observation) : String(st.observation)) + '</div>' : '') +
                        '</div>';
                });
                stepsHtml += '</div>';
            }

            var errHtml = '';
            if (method.error) {
                var e = parseErrorMessage(method.error);
                errHtml = '<div class="VAI-aci-error-block" style="margin-top:8px"><div class="err-head">' +
                    (e.code ? '<span class="VAI-aci-err-code">HTTP ' + e.code + '</span>' : '') +
                    '<span class="VAI-aci-err-tag">' + e.tag + '</span></div><div class="VAI-err-msg">' + escHtml(e.msg) + '</div></div>';
            }

            return '<div class="VAI-aci-method-card">' +
                '<div class="VAI-aci-method-header">' +
                '<svg class="VAI-aci-method-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
                '<span class="VAI-aci-method-icon ' + iconCls + '">' + (METHOD_ICON_SVG[iconCls] || METHOD_ICON_SVG['default']) + '</span>' +
                '<span class="mn">' + escHtml(method.api_method || method.method || '—') + '</span>' +
                '<span class="ma">' + escHtml(method.api_name || '') + '</span>' +
                '<span class="VAI-aci-agent-dur">' + fmtDuration(method.duration_ms) + '</span>' +
                '<span class="VAI-aci-status-badge ' + sc + '" style="font-size:.58rem;padding:2px 6px"><span class="dot"></span>' + (method.status || '—') + '</span>' +
                '</div>' +
                '<div class="VAI-aci-method-body">' +
                '<div class="VAI-aci-agent-detail-row" style="margin-bottom:7px;border-bottom:1px solid var(--aci-border)">' +
                '<div class="VAI-ad"><div class="VAI-adl">API Name</div><div class="VAI-adv">' + escHtml(method.api_name || '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Method</div><div class="VAI-adv">' + escHtml(method.api_method || '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Method ID</div><div class="VAI-adv">' + (method.method_id != null ? method.method_id : '—') + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Start</div><div class="VAI-adv">' + fmtTime(method.start_time) + '</div></div>' +
                '<div class="VAI-ad"><div class="VAI-adl">Duration</div><div class="VAI-adv">' + fmtDuration(method.duration_ms) + '</div></div>' +
                '</div>' +
                stepsHtml +
                '<div class="VAI-aci-io-tabs">' +
                '<div class="VAI-aci-io-tab active" data-dir="in">Input</div>' +
                '<div class="VAI-aci-io-tab" data-dir="out">Output</div>' +
                '</div>' +
                '<div class="VAI-aci-io-in">' +
                '<div class="VAI-aci-json-wrap"><button class="VAI-aci-copy-btn">Copy</button><div class="aci-json-block">' + highlightJSON(inputD) + '</div></div>' +
                '</div>' +
                '<div class="aci-io-out" style="display:none">' +
                '<div class="VAI-aci-json-wrap"><button class="VAI-aci-copy-btn">Copy</button><div class="aci-json-block">' + highlightJSON(outputD) + '</div></div>' +
                '</div>' +
                errHtml +
                '</div>' +
                '</div>';
        }

        // ─────────────────────────────────────────
        //  Bootstrap — auto-fetch on load
        // ─────────────────────────────────────────
        function loadBootstrap() {
            fetchLogs(currentPage);
        }

        // ─────────────────────────────────────────
        //  initialize (called internally)
        // ─────────────────────────────────────────
        function initialize() {
          //  injectStyles();
            buildDOM();
            bindEvents();

            var savedTheme = 'light';
            try { savedTheme = localStorage.getItem('aci-theme') || 'light'; } catch (e) { }
            applyTheme(savedTheme === 'dark');

            loadBootstrap();
        }

        // Run immediately so `getRoot()` is available before `init()` is called
        initialize();

        // ─────────────────────────────────────────
        //  Privileged public methods
        // ─────────────────────────────────────────
        this.getRoot = function () { return $root; };

        // Containers required by VIS.AWindow / CPanel when it injects toolbars etc.
        this.getParameterContainer = function () { return $root; };
        this.getContentContainer = function () { return $detailPane; };
        this.getToolbarContainer = function () { return $root.find('.VAI-aci-toolbar'); };
        this.getBusyIndicatorContainer = function () { return $root; };

        /**
         * Load data programmatically instead of fetching.
         * @param {Array}  data        - Array of command-log objects
         * @param {number} [totalQuota]- Override the total-token quota
         */
        this.loadData = function (data, totalQuota) {
            if (Array.isArray(data)) logsData = data;
            if (totalQuota && isFinite(+totalQuota)) TOTAL_TOKEN_QUOTA = +totalQuota;
            renderAll();
            $lastRefresh.text('Loaded ' + logsData.length + ' commands');
            $liveDot.removeClass('off');
        };

        this.disposeComponent = function () {
            $fetchBtn.off('click');
            $themeToggle.off('click');
            $toggleConfig.off('click');
            $searchInput.off('input');
            $filterChips.off('click');
            $cmdList.off('click');
            $detailContent.off('click');
            if ($root) $root.remove();
            $root = null;
            self = null;
        };
    };

    // ─────────────────────────────────────────────
    //  VIS.Apps contract: init
    // ─────────────────────────────────────────────
    VIS.AITokenUsage.prototype.init = function (windowNo, frame) {
        this.windowNo = windowNo;
        this.frame = frame;
        this.frame.getContentGrid().append(this.getRoot());
    };

    // ─────────────────────────────────────────────
    //  VIS.Apps contract: dispose
    // ─────────────────────────────────────────────
    VIS.AITokenUsage.prototype.dispose = function () {
        this.disposeComponent();
        if (this.frame) this.frame.dispose();
        this.frame = null;
    };

    // ─────────────────────────────────────────────
    //  Convenience: open as a standalone CFrame window
    // ─────────────────────────────────────────────
    VIS.AITokenUsage.prototype.show = function () {
        var c = new VIS.CFrame();
        c.setName(VIS.Msg.getMsg('AgentCI'));
        c.setTitle(VIS.Msg.getMsg('AgentCI Flow Tracer'));
        c.hideHeader(false);
        c.setContent(this);
        c.show();
    };

})(VIS, jQuery);