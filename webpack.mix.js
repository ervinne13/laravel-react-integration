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