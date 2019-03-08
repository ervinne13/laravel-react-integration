import React, { Component } from 'react';

class ClickDemo extends Component {
    constructor(props) {
        super(props);
        this.state = { clicks: 0};
    }

    onClick() {
        let clicks = this.state.clicks + 1;
        this.setState({ clicks });
    }

    render() {
        return (
            <div>
                <button onClick={this.onClick.bind(this)}>Click to Increment Count</button>
                Number of clicks so far: {this.state.clicks}
            </div>
        );
    }
}

export default ClickDemo