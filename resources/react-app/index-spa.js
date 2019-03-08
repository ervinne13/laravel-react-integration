require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import Root from 'Scenes/Root';

if (module.hot) {
    module.hot.accept();
}

if (document.getElementById('root')) {
    ReactDOM.render(<Root />, document.getElementById('root'));
}