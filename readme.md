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
require('./bootstrap');

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
const HOT_PORT = parseInt(process.env.MIX_HOT_PORT || 8080);
const env = {
    publicPath: `${process.env.APP_URL}:${HOT_PORT}/`,
    hotPort: HOT_PORT,
    isHttps: (process.env.MIX_IS_HTTPS == true)
};

Config.hmrOptions.port = HOT_PORT;

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
        port: env.hotPort,
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
MIX_IS_HTTPS=false
```

Webpack dev server's default port is 8080 (more on this later), if you want to change this, add the following in your .env file:

File ``.env``
```env
MIX_HOT_PORT=<your port here>
```

_Make sure this port is exposed if you're running this in a docker container._

## Transpiling and Generating Scripts

Run the command:

```bash
npm run prod
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
```

After updating, run ``npm run hot`` again. Refresh your browser and your next updates should now happen without react manually refreshing the browser and instead just refresh the components that did change.