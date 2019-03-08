import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Root from 'Scenes/Root';

//  We're telling spatie's ssr to take whatever markup we pass in here
//  will be served when we call the ssr(/*...*/)->render() in PHP
dispatch(ReactDOMServer.renderToString(<Root />));