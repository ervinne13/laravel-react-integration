require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import Root from 'Scenes/Root';

if (document.getElementById('root')) {
    ReactDOM.hydrate(<Root />, document.getElementById('root'));
}