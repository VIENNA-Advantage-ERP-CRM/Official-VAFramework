import { PieChart } from 'react-minimal-pie-chart';
const Charts = (props) => {

    return (
        <div style={{ maxWidth: "400px", margin: "0px auto", padding: "50px" }}>
            <p>Current time:</p>
            <PieChart
                data={[
                    { title: 'One', value: 10, color: '#E38627' },
                    { title: 'Two', value: 15, color: '#C13C37' },
                    { title: 'Three', value: 20, color: '#6A2135' },
                ]}
            />
            <pi />
        </div>
    );
};

export default Charts;
