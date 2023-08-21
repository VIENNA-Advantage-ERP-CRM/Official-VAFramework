//const Grid = React.lazy(() => import('./Grid.jsx'));


class GetPost extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        return (<table className="table table-bordered table-hover">
            <thead>
                <tr>
                    <th>userId</th>
                    <th>title</th>
                    <th>body</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {
                    this.props.posts.map((post, index) => {
                  return <tr key={index}>
                        <td>{post.userId}</td>
                        <td>{post.title}</td>
                      <td>{post.body}</td>
                      <td onClick={() => this.props.tableRowRemove(index)}>Delete</td>
                        </tr>
                    })
                }
            </tbody>
        </table>);
    }
}

class AddProduct extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Mandeep',
            email: '',
            phone: '',
            ProductData: []
        };
    };

   

    componentDidMount() {
        axios.get("https://jsonplaceholder.typicode.com/posts").then(response => {
            console.log(response.data);  
            this.setState({
                ProductData: response.data
            });
        });
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        console.log(this.state);
    }

    tableRowRemove = (index) => {
        const posts = this.state.ProductData;
        posts.splice(index, 1);
        this.setState({
            ProductData: posts
        })
    };
    
    render() {
        return (<>
            <div className="container">
                <form onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input type="text" className="form-control" value={this.state.name} name="name" onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="form-control" value={this.state.email} name="email" onChange={this.handleChange}  />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" className="form-control" value={this.state.phone} name="phone" onChange={this.handleChange}  />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Submit</button>
                </form>
                <hr />
                <GetPost posts={this.state.ProductData} tableRowRemove={this.tableRowRemove} />
            </div>

        </>);
    }
}

export default AddProduct;