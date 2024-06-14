import { PieChart } from 'react-minimal-pie-chart';
const Charts = (props) => {

    let data = [
        { title: 'One', value: 10, color: '#E38627' },
        { title: 'Two', value: 15, color: '#C13C37' },
        { title: 'Three', value: 20, color: '#6A2135' },
    ]

    const handleClick = (event, i, dataIndex) => {
        props.self.widgetFirevalueChanged(data[i].title);
    };
    

    return (       
            <PieChart
            data={data}
            onClick={handleClick}
            />  
    );
};

export default Charts;
