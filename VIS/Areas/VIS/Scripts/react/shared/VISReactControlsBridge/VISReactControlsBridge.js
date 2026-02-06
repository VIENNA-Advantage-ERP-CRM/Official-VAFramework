(function (global) {
    global.VISReact = global.VISReact || {};

    // Factory: caller passes their React instance
    global.VISReact.createVISControl = function createVISControl(React) {
        if (!React) throw new Error("React instance is required: createVISControl(React)");

        const { useEffect, useMemo, useRef } = React;

        function safeStableKey(args) {
            if (!args) return "";
            try {
                return JSON.stringify(args);
            } catch (e) {
                // fallback: if lookup objects inside args break stringify
                return String(args);
            }
        }

        function VISControl(props) {
            const {
                // Vienna factory mode (optional)
                mField,
                windowNo,
                tabNo,
                hideMapBtn,
                disableValidation,

                // Direct control mode
                controlClass,
                columnName,
                args = [],

                // Controlled value
                value,
                onChange,
                onReady,

                // ERP/UI props (optional)
                readOnly,
                mandatory,
                visible,
                htmlStyle,

                // mounting behavior
                mount = "replace",
                className,
                style,
            } = props;

            const hostRef = useRef(null);
            const ctrlRef = useRef(null);

            // ✅ Important: args is an array, avoid re-create due to new ref each render
            const argsKey = useMemo(() => safeStableKey(args), [args]);

            // Create + mount control
            useEffect(() => {
                const host = hostRef.current;
                if (!host) return;

                const VIS = global.VIS;
                const $ = global.jQuery || global.$;

                if (!VIS) throw new Error("VIS not found on window. Load VIS scripts before the bridge.");
                if (!$) throw new Error("jQuery not found on window. Load jQuery before the bridge.");

                // cleanup any previous
                $(host).empty();
                ctrlRef.current = null;

                let ctrl = null;

                // --- Mode 1: mField (VControlFactory)
                if (mField) {
                    if (!VIS.VControlFactory || !VIS.VControlFactory.getControl) {
                        throw new Error("VIS.VControlFactory.getControl not found. Ensure controls.js is loaded.");
                    }
                    ctrl = VIS.VControlFactory.getControl(mField, windowNo, tabNo, hideMapBtn, disableValidation);
                }
                // --- Mode 2: controlClass + args (direct)
                else {
                    if (!controlClass) throw new Error("Provide either mField or controlClass");
                    if (!columnName) throw new Error("columnName is required when not using mField");

                    const C = VIS.Controls && VIS.Controls[controlClass];
                    if (!C) throw new Error("VIS.Controls." + controlClass + " not found");

                    ctrl = new C(columnName, ...(args || []));
                }

                ctrlRef.current = ctrl;

                // DOM
                const mainDom = (ctrl.getControl && ctrl.getControl()) || ctrl.ctrl;
                if (!mainDom) throw new Error("Control has no DOM (getControl/ctrl missing)");

                // If control has buttons, wrap in input-group
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

                // Hook change event -> React onChange
                const originalFire = ctrl.fireValueChanged && ctrl.fireValueChanged.bind(ctrl);
                if (originalFire) {
                    ctrl.fireValueChanged = function (evt) {
                        try {
                            originalFire(evt);
                        } finally {
                            // evt.newValue is the important part in Vienna controls
                            onChange && onChange(evt && evt.newValue, evt, ctrl);
                        }
                    };
                } else {
                    // fallback
                    const $main = $(mainDom);
                    const handler = function () {
                        try {
                            const v = ctrl.getValue ? ctrl.getValue() : $main.val();
                            onChange && onChange(v, { newValue: v }, ctrl);
                        } catch (e) { }
                    };
                    $main.off(".reactBridge").on("change.reactBridge input.reactBridge", handler);
                }

                // set initial value
                if (value !== undefined && ctrl.setValue) {
                    try {
                        ctrl.setValue(value);
                    } catch (e) { }
                }

                // apply ERP props initially
                try { if (visible !== undefined && ctrl.setVisible) ctrl.setVisible(!!visible); } catch (e) { }
                try { if (readOnly !== undefined && ctrl.setReadOnly) ctrl.setReadOnly(!!readOnly); } catch (e) { }
                try { if (mandatory !== undefined && ctrl.setMandatory) ctrl.setMandatory(!!mandatory); } catch (e) { }
                try { if (htmlStyle !== undefined && ctrl.setHtmlStyle) ctrl.setHtmlStyle(htmlStyle); } catch (e) { }

                onReady && onReady(ctrl);

                return function cleanup() {
                    try { $(host).empty(); } catch (e) { }
                    try { ctrl.disposeComponent && ctrl.disposeComponent(); } catch (e) { }
                    ctrlRef.current = null;
                };
            }, [
                // identity
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

            // controlled value update
            useEffect(() => {
                const ctrl = ctrlRef.current;
                if (!ctrl) return;
                if (value !== undefined && ctrl.setValue) {
                    try { ctrl.setValue(value); } catch (e) { }
                }
            }, [value]);

            // ERP props updates
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

            return React.createElement("div", { ref: hostRef, className, style });
        }

        return VISControl;
    };
})(window);
