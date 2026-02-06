import React  from "react";
import ReactDOM from "react-dom/client";
import VISControl from "./VISReactControl";
import { visArgs } from "./VISReactControlArgs";

/**
 * Expose a single global namespace for all modules.
 * Usage anywhere:
 *   const { VISControl, VISArgs, React, ReactDOM } = window.VISReact;
 */
window.VISReact = window.VISReact || {};
window.VISReact.VISControl = VISControl;
window.VISReact.VISArgs = visArgs;

// Optional: expose React/ReactDOM if you want modules to share them too.
// If your modules already bundle React, you can remove these two lines.
window.VISReact.React = React;
window.VISReact.ReactDOM = ReactDOM;
