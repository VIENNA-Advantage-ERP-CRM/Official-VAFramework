; (function (VIS, $) {
    VIS.Apps = VIS.Apps || {};





VIS.Apps.ReactTemplate = function () {
}

VIS.Apps.ReactTemplate.prototype.init = function (windowNo, frame,componentName) {
    //Assign to this Varable
    this.frame = frame;
    // frame.hideHeader(true);
    var area = componentName.split('.');
    const MyComponent = React.lazy(() => import(VIS.Application.contextUrl + 'Areas/' + area[1] +'/Scripts/react/Component/'+area[2]+'.jsx'));
    ReactDOM.render(
        <React.Suspense fallback={<div>Loading...</div>}>
            <MyComponent windowNo={windowNo} frame={frame}/></React.Suspense>,
        this.frame.getContentGrid()[0]
    );
    };

})(VIS, jQuery);