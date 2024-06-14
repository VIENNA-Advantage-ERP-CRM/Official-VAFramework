// TestComponent.jsx

import Chart from '../component/helloWord';
const Component = (props) => {  

    return (
        <div>
            <Chart self={props.self} />
        </div>
    );
};

export default Component;
