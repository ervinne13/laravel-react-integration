# Laravel & React Integration

## Enabling React

Change from default (vuejs) to react with the following commands in your terminal

```bash
php artisan preset react
npm install && npm run dev
```

## Setting up React Root Component

First, rename the ``resources/js`` to ``resources/react-app`` as react may contain non js scripts as well. You may delete the files ``resources/react-app/components/Example.js`` and ``resources/react-app/app.js`` if it exists.

Clean up Laravel generated assets as well by deleting the following:
``public/css/*``
``public/js/app.js``

We will follow a convention which will require us to rename `bootstrap.js` to `bootstrap-spa.js` so rename the file now.

Create a new file ``resources/react-app/components/RootComponent.js`` with the following contents:

File: ``resources/react-app/components/RootComponent.js``
```jsx
import React, { Component } from 'react';

class RootComponent extends Component {
    render() {
        return (
            <div>
                I'm the root component! Have the Front-end team replace me with their own.
            </div>
        );
    }
}

export default RootComponent
```

Create a new file ``resources/react-app/index-spa.js`` with the following contents:

File: ``resources/react-app/index-spa.js``

```js
require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

if (document.getElementById('root')) {
    ReactDOM.render(<RootComponent />, document.getElementById('root'));
}
```

## Configuring Laravel Mix for Transpiling and Generating Scripts

Update ``webpack.mix.js`` with the following:

_Note: the following script might be overwhelming. Just keep in mind that most of the added scripts are for us to work around some of Laravel's still existing issues when enabling hot reloading which we will test later on._

File ``webpack.mix.js``
```js
const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Env Management
 |--------------------------------------------------------------------------
 |
 | Configurations taken from Laravel's .env or the server's environment
 | variables.
 |
 */
const WEBPACK_DEV_SERVER_PORT = parseInt(process.env.WEBPACK_DEV_SERVER_PORT || 8080);
const env = {
    publicPath: `${process.env.APP_URL}:${WEBPACK_DEV_SERVER_PORT}/`,
    isHttps: (process.env.WEBPACK_IS_HTTPS == true),
    webpackDevServerPort: WEBPACK_DEV_SERVER_PORT,    
    webpackDevServerHost: process.env.WEBPACK_DEV_SERVER_HOST
};

Config.hmrOptions.port = env.webpackDevServerPort;

/*
 |--------------------------------------------------------------------------
 | Webpack Config for Hot Reloading
 |--------------------------------------------------------------------------
 |
 | We'll enable a webpack-dev-server that will serve hot loaded assets
 | to our laravel application. Note that laravel generates a "hot"
 | file inside the /public/ folder.
 |
 | IMPORTANT!!!
 | Currently, Laravel hardcodes the value of the "hot" file so you will
 | have to replace its contents to match our configuration if it is
 | not the same as defaults. If you don't mix() or ssr() helpers 
 | wont properly locate the compiled assets from webpack.
 |
 */

mix.webpackConfig({
    output: {
        publicPath: env.publicPath
    },
    devServer: {
        hot: true,
        inline: true, // use inline method for hmr
        disableHostCheck: true,
        contentBase: path.join(__dirname, "public"),
        https: env.isHttps,
        port: env.webpackDevServerPort,
        host: env.webpackDevServerHost,
        headers: { "Access-Control-Allow-Origin": "*" },
        watchOptions: {
            exclude: [/bower_components/, /node_modules/]
        }
    },
    node: {
        fs: "empty",
        module: "empty"
    }
});
// Per this issue: https://github.com/JeffreyWay/laravel-mix/issues/1483
Mix.listen("configReady", webpackConfig => {
    if (Mix.isUsing("hmr")) {
        // Remove leading '/' from entry keys
        webpackConfig.entry = Object.keys(webpackConfig.entry).reduce(
            (entries, entry) => {
                entries[entry.replace(/^\//, "")] = webpackConfig.entry[entry];
                // }
                console.log(entries);
                return entries;
            },
            {}
        );
        // Remove leading '/' from ExtractTextPlugin instances
        webpackConfig.plugins.forEach(plugin => {
            if (plugin.constructor.name === "ExtractTextPlugin") {
                console.log(plugin.filename);
                plugin.filename = plugin.filename.replace(/^\//, "");
                console.log(plugin.filename);
            }
        });
    }
});

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.react("resources/react-app/index-spa.js", "public/js");
```

If you're running the application locally and don't have https yet, add the following configuration in your .env file:

File ``.env``
```env
WEBPACK_IS_HTTPS=false
```

Webpack dev server's default port is 8080 (more on this later), if you want to change this, add the following in your .env file:

File ``.env``
```env
WEBPACK_DEV_SERVER_PORT=<your port here>
```

Add the webpack dev server's host (defaults to localhost). This is important to be set if you're running this inside a docker container.

File ``.env``
```env
WEBPACK_DEV_SERVER_HOST=<ip>
```

_Make sure this port is exposed if you're running this in a docker container._

## Transpiling and Generating Scripts

Run the command:

```bash
npm run dev
```

This will transpile a production version of our scripts and put the files to ``public/js`` as we configured at the end of ``webpack.mix.js`` file.

## Removing Transpiled Scripts from Source Control

Webpack generates our scripts for us, add them to the .gitignore so that the are not included to our source control.

File: ``.gitignore``
```
... Laravel's default ignored files, dont remove them, append only what's below:
/public/js/index-spa.js
/public/js/index-ssr.js
/public/js/hydrator.js
```

_Note: we deliberately did not create a folder react or a folder where we can just ignore the contents. This is so that the front-end being made from React is not so obvious._

## Testing & Displaying React

Replace the contents of the welcome page ``resources/views/welcome.blade.php`` with the following:

```html
<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>My Application</title>

        <meta name="csrf-token" content="{{ csrf_token() }}">
    </head>
    <body>
        <div id="root"></div>
        <script src="{{ mix('js/index-spa.js') }}"></script>
    </body>
</html>

```

## Hot Reloading & Watching

Laravel has several open issues about hot reloading with react but we've pretty much resolved them already.

To "watch" updates to our files, just run:

```bash
npm run watch
```

This will have the terminal "watch" for changes in our files and retranspile our scripts automatically and more efficiently (you'll notice that it's faster than running ``npm run dev`` or ``npm run prod``). Refresh the browser and the changes should reflect.

We also have the option to have the view automatically reflect changes without us refreshing the browser. This is called "hot reloading".

To enable, first install ``webpack-dev-server`` with the command:

```bash
npm install -D webpack-dev-server
```

Then run hot reloading using the command:

```bash
npm run hot
```

_This will take several seconds slower than ``npm run watch``. Wait for it to say "DONE  Compiled successfully in ???ms??:??:??"_

The hot reloading command will cause webpack to spin up a dev server running on a port we specify in our ``HOT_PORT`` env variable. This server will host our assets for us instead of replacing the scripts in our ``resources/js`` folder.

Refresh your browser one more time so that Laravel will take the assets from the webpack dev server instead of its own server. You may open the console and also notice logs like: ``[HMR] Waiting for update signal from WDS...``. This is your sign that hot reloading is properly working and is now listening to events from webpack dev server that triggers whenever we update something.

At this point, try updating anything in the ``RootComponent`` and changes should reflect without us refreshing the server.

## Hot Reload Full Page Reload Problem

You may notice that instead of just replacing the content of the DOM, hot reloading will cause the browser to do a full reload instead. This is usually not desirable. A good sign of this is the log: ``[HMR] Cannot apply update. Need to do a full reload!`` before refreshing.

To resolve this, add ``module.hot.accept()`` if the application is hot reloading in the ``resources/react-app/index-spa.js``. See full update below:

File ``resources/react-app/index-spa.js``
```js
require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

if (module.hot) {
    module.hot.accept();
}

if (document.getElementById('root')) {
    ReactDOM.render(<RootComponent />, document.getElementById('root'));
}
```

After updating, run ``npm run hot`` again. Refresh your browser and your next updates should now happen without react manually refreshing the browser and instead just refresh the components that did change.

# Setting up Server Side Rendering

First of, we'll need spatie's ssr package to enable running node applications on the background from php for us.

Install the dependency using:
```bash
composer require spatie/laravel-server-side-rendering
php artisan vendor:publish --provider="Spatie\Ssr\SsrServiceProvider" --tag="config"
```

## Prerequisites (Taken from Spatie's Docs)
First you'll need to pick an engine to execute your scripts. The server-side-rendering library ships with V8 and Node engines. By default, the package is configured to use node, since you probably already have that installed on your system.

Set up the NODE_PATH environment variable in your .env file to get started:

Inside your .env:
```
NODE_PATH=/path/to/my/node
```

You'll also need to ensure that a storage/app/ssr folder exists, or change the ssr.node.temp_path config value to something else.

## Configuring React to Run by SSR + SPA

Create a new file called ``index-ssr.js``. As the name implies, this is the ssr version of our ``index-spa.js``, hence, why we had this naming convention earlier.

File: ``index-ssr.js``
```js
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RootComponent from './components/RootComponent';

//  We're telling spatie's ssr to take whatever markup we pass in here
//  will be served when we call the ssr(/*...*/)->render() in PHP
dispatch(ReactDOMServer.renderToString(<RootComponent />));
```

_IMPORTANT! Notice that we don't load the `bootstrap-spa.js` file, this is because `window` does not exist in node. This will also mean that whatever we attach to axios in the bootstrap will not take effect in SSR. If you need to do some tasks similar to what `bootstrap-spa.js` do in SSR, create a separate file for it called `bootstrap-ssr.js` to follow our convention._

_In our case, we deliberately did not include axios for dynamic loading of contents from Laravel later. By default, SSR will execute all commands (INCLUDING AJAX calls) in the server which we find very resource exhaustive when we can just make use of `spatie`'s `context` which we will demonstrate later._

And update our view to render the markup from the server with:
``{!! ssr('js/index-ssr.js')->render() !!}``

File: ``resources/views/welcome.blade.php``
```html
<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>My Application</title>

        <meta name="csrf-token" content="{{ csrf_token() }}">
    </head>
    <body>
        <div id="root">
            {!! ssr('js/index-ssr.js')->render() !!}
        </div>
        <!-- <script src="{{ mix('js/index-spa.js') }}"></script> -->
    </body>
</html>
```

Add this file to Laravel's mix (``webpack.mix.js``):

```js
mix
    .react("resources/react-app/index-spa.js", "public/js")
    .react("resources/react-app/index-ssr.js", "public/js") // added
```

_Note: we commented out the spa for us to test that react really renders_

Transpile the files for SSR:

```bash
npm run dev
```

Make sure that SSR is enabled (it's enabled by default only in production).

File: ``config/ssr.php``
```php
/*
 * Enable or disable the server renderer. Enabled in production by default.
 */
// 'enabled' => env('APP_ENV') === 'production',
'enabled' => true,
```

This will result in the markup being rendered, but we have a new problem. React's events does not work anymore, for this, we'll need to ``hydrate`` React.

## Adding React Events for Testing Hydration

To simulate events inside React, let's add a new component that makes use of React events and state management.

New FIle: ``resources/components/ClickDemo.js``
```jsx
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
```

Then include the ``ClickDemo`` component in our ``RootComponent`` like so:

File: ``resources/components/RootComponent.js``
```jsx
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
```

Rebuild the app by ``npm run watch``, ``npm run dev`` or ``npm run prod`` and try it out on the browser, you should notice that clicking the button won't have any effect.

## Hydrating React

To "re attach" events to React components that are already rendered, we `hydrate` it.

Create a new file `resources/react-app/hydrate.js`.

File `resources/react-app/hydrate.js`:
```js
require('./bootstrap-spa');

import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './components/RootComponent';

if (document.getElementById('root')) {
    ReactDOM.hydrate(<RootComponent />, document.getElementById('root'));
}
```

Then add this to our `webpack.mix.js` config:

File `/webpack.mix.js`
```js
//  ...

mix
    .react("resources/react-app/index-spa.js", "public/js")
    .react("resources/react-app/index-ssr.js", "public/js")
    .react("resources/react-app/hydrate.js", "public/js")   //  added
```

Finally, import the hydrate script in place of `index-ssr.js`.

IMPORTANT! Also remove whitespace inside the root element, React has a bug in dev mode that recognizes this whitespace as an error, see below:

File: ``resources/views/welcome.blade.php``
```html
<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>My Application</title>

        <meta name="csrf-token" content="{{ csrf_token() }}">
    </head>
    <body>
        <!-- Notice removed whitespaces/new lines inside root -->
        <div id="root">{!! ssr('js/index-ssr.js')->render() !!}</div>
        <script src="{{ mix('js/hydrate.js') }}"></script>
    </body>
</html>
```

Now try testing your application and increment should now work.

# Managing Server Side Data

This portion will have too many code to put to a documentation so we'll be referencing the source code directly. Make sure you're either in the `master` branch or in the `feature-ssr-spa-hybrid` branch.