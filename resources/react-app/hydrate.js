require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

if (document.getElementById('root')) {
    ReactDOM.hydrate(<RootComponent />, document.getElementById('root'));
}
