; (function (VIS, $) {
    VIS.React = VIS.React || {};
    VIS.React = function () {}

    VIS.React.prototype.init = function (windowNo, frame, componetName) {

        const MyComponent = React.lazy(() => import('./Component/' + componetName));
        ReactDOM.render(
            <React.Suspense fallback={<div>Loading...</div>}>
                <MyComponent windowNo={windowNo} frame={frame} /></React.Suspense>,
            frame.getContentGrid()[0]
        );
    };

})(VIS, jQuery);

