require('./bootstrap');

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

if (module.hot) {
    module.hot.accept();
}

if (document.getElementById('root')) {
    ReactDOM.render(<RootComponent />, document.getElementById('root'));
}