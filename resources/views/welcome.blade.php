<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>My Application</title>

        <meta name="csrf-token" content="{{ csrf_token() }}">

        <link rel="stylesheet" type="text/css" href="{{ mix('css/app.css') }}" />
    </head>
    <body>
        <div id="root">{!! ssr('js/index-ssr.js')->render() !!}</div>
        <script src="{{ mix('js/hydrate.js') }}"></script>
    </body>
</html>
