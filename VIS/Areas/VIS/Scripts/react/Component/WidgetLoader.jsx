const WidgetLoader = ({ Load }) => {
    return (
        <>
            <div
                className="vis-busyindicatorouterwrap"
                style={{ display: Load ? "block" : "none" }}
            >
                <div className="vis-busyindicatorinnerwrap">
                    <i className="vis_widgetloader"></i>
                </div>
            </div>


        </>
    )
};
export default WidgetLoader;