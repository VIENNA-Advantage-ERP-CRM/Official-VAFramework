import React from 'react';
import ReactDOM from 'react-dom';

//VIS Replace with module prefix

// Ensure VIS namespace and dependencies are available
window.VIS = window.VIS || {};
(function (VIS, $) {
    // Ensure VIS.React namespace is initialized
    VIS.React = VIS.React || {};

    // Constructor function for VIS.React
    VIS.React = function () { };

    // Initialize method to render React component dynamically
    VIS.React.prototype.init = function (windowNo, frame, componentName) {
        // Lazy load the component based on componentName
        const MyComponent = React.lazy(() => import(`./pages/${componentName}`));

        // Render the component with Suspense for fallback
        ReactDOM.createRoot(frame.getContentGrid()[0]).render(
            <React.Suspense fallback={<div>Loading...</div>}>
                <MyComponent windowNo={windowNo} frame={frame} />
            </React.Suspense>
        );
    };
})(VIS, jQuery);

