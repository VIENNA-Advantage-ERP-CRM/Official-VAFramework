import React, { useState, useEffect, useRef } from 'react';
const HomeWidget = (props) => {
    let htmlArray = [
        {
            seqno: 10,
            html: '<div>Column 1</div>',
            row: 2,
            col: 2
        },
        {
            seqno: 15,
            html: '<div>Column 1.5</div>',
            row: 5,
            col: 2
        },
        {
            seqno: 20,
            html: '<div>Column 2</div>',
            row: 2,
            col: 1
        },
        {
            seqno: 30,
            html: '<div>Column 3</div>',
            row: 1,
            col: 3
        }
        ,
        {
            seqno: 40,
            html: '<div>Column 3</div>',
            row: 2,
            col: 4
        }
        ,
        {
            seqno: 50,
            html: '<div>Column 3</div>',
            row: 1,
            col: 1
        }
        ,
        {
            seqno: 60,
            html: '<div>Column 3</div>',
            row: 3,
            col: 3
        }
        ,
        {
            seqno: 70,
            html: '<div>Column 3</div>',
            row: 3,
            col: 1
        },
        {
            seqno: 80,
            html: '<div>Column 3</div>',
            row: 1,
            col: 1
        },
        {
            seqno: 90,
            html: '<div>Column 3</div>',
            row: 2,
            col: 1
        },
        {
            seqno: 100,
            html: '<div>Column 3</div>',
            row: 1,
            col: 1
        },
        {
            seqno: 101,
            html: '<div>Column 3</div>',
            row: 2,
            col: 2
        },
        {
            seqno: 102,
            html: '<div>Column 3</div>',
            row: 2,
            col: 2
        }
    ];

    const [visTestForm, setVisTestForm] = useState(null);
    const formContainerRef = useRef(null);


    let widgetList = htmlArray.map((item, index) => {
        return (
            <WidgetItem item={item} key={index} />
        )
    });

    useEffect(() => {
        // Instantiate VIS.TestForm
        let www = new window.VIS.AForm(500);
        www.openWidget('VIS.React.TestComponent', 99999);
        // Append the root element of VIS.TestForm to the component's DOM
        const rootElement = www.getRoot();
        formContainerRef.current.appendChild(rootElement.get(0));

        // Update state with the testForm object
        setVisTestForm(www);

        // Clean up function
        return () => {
            // Dispose VIS.TestForm when component unmounts
            if (www) {
               // www.dispose();
            }
        };
    }, []); // Empty dependency array to run effect only once on mount



    //let www = new window.VIS.AForm(500);
    //www.openWidget('VIS.React.TestComponent', 99999);
    //return www.getRoot()[0].innerHTML;

    //<div className="vis-widget-container" style={{ '--rowheight': props.rowHeight }}>
    //    {widgetList}
    //</div>
   
    return (
        <>           
            <div ref={formContainerRef}></div>
        </>
    );
};

let WidgetItem = ({ item }) => {
    let hue = Math.floor(Math.random() * 360);
    let v = Math.floor(Math.random() * 16) + 60;
    let pastel = 'hsl(' + hue + ', 100%, ' + v + '%)';
    const myStyle = {
        backgroundColor: pastel,
        gridRow: "span " + item.row,
        gridColumn: "span " + item.col
    }
    return (
        <>
            <div className="vis-widget-item" style={myStyle}>{item.seqno}</div>
        </>
    )
}

export default HomeWidget;