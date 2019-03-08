import React, { Component } from 'react';
import ClickDemo from './ClickDemo';

class RootComponent extends Component {
    render() {
        return (
            <div>
                I'm the root component! Have the Front-end team replace me with their own.
                <ClickDemo />
            </div>
        );
    }
}

export default RootComponent