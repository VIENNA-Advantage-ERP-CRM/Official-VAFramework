(function (global) {
    global.VISReact = global.VISReact || {};

    global.VISReact.createVISControl = function createVISControl(React) {
        if (!React) throw new Error("React instance is required: createVISControl(React)");

        const { useEffect, useMemo, useRef } = React;

        function safeStableKey(args) {
            if (!args) return "";
            try {
                return JSON.stringify(args);
            } catch (e) {
                return String(args);
            }
        }

        function VISControl(props) {
            const {
                mField,
                windowNo,
                tabNo,
                hideMapBtn,
                disableValidation,

                controlClass,
                columnName,
                args = [],

                value,
                onChange,
                onReady,

                readOnly,
                mandatory,
                visible,
                htmlStyle,

                mount = "replace",
                className,
                style,

                hideButtons,
                hideButtonIndexes,
                showOnlyButtonIndexes,

                hideMenuActions = [],
            } = props;

            const hostRef = useRef(null);
            const ctrlRef = useRef(null);

            const argsKey = useMemo(() => safeStableKey(args), [args]);

            function applyBtnVisibility(ctrl) {
                if (!ctrl) return;

                const $ = global.jQuery || global.$;
                if (!$) return;

                const btnCount = (ctrl.getBtnCount && ctrl.getBtnCount()) || 0;

                const hideSet = new Set(Array.isArray(hideButtonIndexes) ? hideButtonIndexes : []);
                const showOnlySet = new Set(Array.isArray(showOnlyButtonIndexes) ? showOnlyButtonIndexes : []);

                for (let i = 0; i < btnCount; i++) {
                    const btn = ctrl.getBtn && ctrl.getBtn(i);
                    if (!btn) continue;

                    let shouldHide = false;

                    if (hideButtons === true) shouldHide = true;

                    if (showOnlySet.size > 0) {
                        shouldHide = !showOnlySet.has(i);
                    }

                    if (showOnlySet.size === 0 && hideSet.size > 0 && hideSet.has(i)) {
                        shouldHide = true;
                    }

                    if (shouldHide) $(btn).hide();
                    else $(btn).show();
                }
            }

            function applyMenuVisibility(ctrl) {
                if (!ctrl || !Array.isArray(hideMenuActions) || hideMenuActions.length === 0) return;

                const $ = global.jQuery || global.$;
                if (!$) return;

                const btnCount = (ctrl.getBtnCount && ctrl.getBtnCount()) || 0;
                const hiddenActions = new Set(hideMenuActions);

                for (let i = 0; i < btnCount; i++) {
                    const btn = ctrl.getBtn && ctrl.getBtn(i);
                    if (!btn) continue;

                    $(btn)
                        .off(".hideMenuActions")
                        .on("click.hideMenuActions", function () {
                            setTimeout(() => {
                                $(".vis-apanel-rb-ul li").each(function () {
                                    const $li = $(this);
                                    const action = $li.attr("data-action") || $li.data("action");

                                    if (hiddenActions.has(action)) {
                                        $li.hide();
                                    } else {
                                        $li.show();
                                    }
                                });
                            }, 0);
                        });
                }
            }

            useEffect(() => {
                const host = hostRef.current;
                if (!host) return;

                const VIS = global.VIS;
                const $ = global.jQuery || global.$;

                if (!VIS) throw new Error("VIS not found on window. Load VIS scripts before the bridge.");
                if (!$) throw new Error("jQuery not found on window. Load jQuery before the bridge.");

                $(host).empty();
                ctrlRef.current = null;

                let ctrl = null;

                if (mField) {
                    if (!VIS.VControlFactory || !VIS.VControlFactory.getControl) {
                        throw new Error("VIS.VControlFactory.getControl not found. Ensure controls.js is loaded.");
                    }
                    ctrl = VIS.VControlFactory.getControl(mField, windowNo, tabNo, hideMapBtn, disableValidation);
                } else {
                    if (!controlClass) throw new Error("Provide either mField or controlClass");
                    if (!columnName) throw new Error("columnName is required when not using mField");

                    const C = VIS.Controls && VIS.Controls[controlClass];
                    if (!C) throw new Error("VIS.Controls." + controlClass + " not found");

                    ctrl = new C(columnName, ...(args || []));
                }

                ctrlRef.current = ctrl;

                const mainDom = (ctrl.getControl && ctrl.getControl()) || ctrl.ctrl;
                if (!mainDom) throw new Error("Control has no DOM (getControl/ctrl missing)");

                const btnCount = (ctrl.getBtnCount && ctrl.getBtnCount()) || 0;
                if (btnCount > 0) {
                    const $group = $('<div class="input-group"/>');
                    $group.append(mainDom);

                    for (let i = 0; i < btnCount; i++) {
                        const b = ctrl.getBtn(i);
                        if (b) $group.append(b);
                    }

                    if (mount === "append") $(host).append($group);
                    else if (mount === "prepend") $(host).prepend($group);
                    else $(host).html($group);
                } else {
                    if (mount === "append") $(host).append(mainDom);
                    else if (mount === "prepend") $(host).prepend(mainDom);
                    else $(host).html(mainDom);
                }

                applyBtnVisibility(ctrl);
                applyMenuVisibility(ctrl);

                const originalFire = ctrl.fireValueChanged && ctrl.fireValueChanged.bind(ctrl);
                if (originalFire) {
                    ctrl.fireValueChanged = function (evt) {
                        try {
                            originalFire(evt);
                        } finally {
                            onChange && onChange(evt && evt.newValue, evt, ctrl);
                        }
                    };
                } else {
                    const $main = $(mainDom);
                    const handler = function () {
                        try {
                            const v = ctrl.getValue ? ctrl.getValue() : $main.val();
                            onChange && onChange(v, { newValue: v }, ctrl);
                        } catch (e) { }
                    };
                    $main.off(".reactBridge").on("change.reactBridge input.reactBridge", handler);
                }

                if (value !== undefined && ctrl.setValue) {
                    try { ctrl.setValue(value); } catch (e) { }
                }

                try { if (visible !== undefined && ctrl.setVisible) ctrl.setVisible(!!visible); } catch (e) { }
                try { if (readOnly !== undefined && ctrl.setReadOnly) ctrl.setReadOnly(!!readOnly); } catch (e) { }
                try { if (mandatory !== undefined && ctrl.setMandatory) ctrl.setMandatory(!!mandatory); } catch (e) { }
                try { if (htmlStyle !== undefined && ctrl.setHtmlStyle) ctrl.setHtmlStyle(htmlStyle); } catch (e) { }

                onReady && onReady(ctrl);

                return function cleanup() {
                    try {
                        const btnCount = (ctrl.getBtnCount && ctrl.getBtnCount()) || 0;
                        for (let i = 0; i < btnCount; i++) {
                            const btn = ctrl.getBtn && ctrl.getBtn(i);
                            if (btn) $(btn).off(".hideMenuActions");
                        }
                    } catch (e) { }

                    try { $(host).empty(); } catch (e) { }
                    try { ctrl.disposeComponent && ctrl.disposeComponent(); } catch (e) { }
                    ctrlRef.current = null;
                };
            }, [
                mField,
                windowNo,
                tabNo,
                hideMapBtn,
                disableValidation,
                controlClass,
                columnName,
                argsKey,
                mount,
            ]);

            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                if (value !== undefined && ctrl.setValue) {
                    try { ctrl.setValue(value); } catch (e) { }
                }
            }, [value]);

            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                try { if (visible !== undefined && ctrl.setVisible) ctrl.setVisible(!!visible); } catch (e) { }
            }, [visible]);

            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                try { if (readOnly !== undefined && ctrl.setReadOnly) ctrl.setReadOnly(!!readOnly); } catch (e) { }
            }, [readOnly]);

            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                try { if (mandatory !== undefined && ctrl.setMandatory) ctrl.setMandatory(!!mandatory); } catch (e) { }
            }, [mandatory]);

            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                try { if (htmlStyle !== undefined && ctrl.setHtmlStyle) ctrl.setHtmlStyle(htmlStyle); } catch (e) { }
            }, [htmlStyle]);

            useEffect(() => {
                applyBtnVisibility(ctrlRef.current);
            }, [hideButtons, hideButtonIndexes, showOnlyButtonIndexes]);

            useEffect(() => {
                applyMenuVisibility(ctrlRef.current);
            }, [hideMenuActions]);

            return React.createElement("div", { ref: hostRef, className, style });
        }

        return VISControl;
    };
})(window);