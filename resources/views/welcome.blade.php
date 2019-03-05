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
