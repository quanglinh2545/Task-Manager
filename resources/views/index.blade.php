<!DOCTYPE html>
<html lang="vi-VN">

<head>
    <script>
        const global = globalThis;
    </script>
    <meta charset="UTF-8" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ config('app.name') }}</title>
    <link rel="stylesheet" href="/gantt/dhtmlxgantt.css?v=7.1.12" />
    <script src="/gantt/dhtmlxgantt.js"></script>
    @env('production')
    {{-- Production --}}
    @if (isset($manifest['resources/js/main.tsx']['css']))
        @foreach ($manifest['resources/js/main.tsx']['css'] as $css)
            <link rel="stylesheet" href="{{ config('app.url') . '/' . $css }}" />
        @endforeach
    @endif
    <script type="module" crossorigin src="{{ config('app.url') . '/' . $manifest['resources/js/main.tsx']['file'] }}">
    </script>
@else
    {{-- Development --}}
    <script type="module">
        import RefreshRuntime from "http://localhost:{{ env('VITE_PORT') }}/@react-refresh";
        RefreshRuntime.injectIntoGlobalHook(window)
        window.__vite_plugin_react_preamble_installed__ = true
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => () => {};
    </script>
    <script type="module" src="http://localhost:{{ env('VITE_PORT') }}/@vite/client"></script>
    <script type="module" src="http://localhost:{{ env('VITE_PORT') }}/resources/js/main.tsx"></script>
    @endenv
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto+Mono|Roboto+Slab|Roboto:300,400,500,700" />

</head>

<body>
    <div id="app">
        <style>
            .spinner-container {
                background: white;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0;
                padding: 0;
                position: fixed;
                top: 0;
                left: 0;
            }

            .spinner {
                width: 40px;
                height: 40px;
                position: relative;
                text-align: center;
                -webkit-animation: sk-rotate 2.0s infinite linear;
                animation: sk-rotate 2.0s infinite linear;
            }

            .dot1,
            .dot2 {
                width: 60%;
                height: 60%;
                display: inline-block;
                position: absolute;
                top: 0;
                background-color: #F8E047;
                border-radius: 100%;
                -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
                animation: sk-bounce 2.0s infinite ease-in-out;
            }

            .dot2 {
                top: auto;
                bottom: 0;
                -webkit-animation-delay: -1.0s;
                animation-delay: -1.0s;
            }

            @-webkit-keyframes sk-rotate {
                100% {
                    -webkit-transform: rotate(360deg)
                }
            }

            @keyframes sk-rotate {
                100% {
                    transform: rotate(360deg);
                    -webkit-transform: rotate(360deg)
                }
            }

            @-webkit-keyframes sk-bounce {

                0%,
                100% {
                    -webkit-transform: scale(0.0)
                }

                50% {
                    -webkit-transform: scale(1.0)
                }
            }

            @keyframes sk-bounce {

                0%,
                100% {
                    transform: scale(0.0);
                    -webkit-transform: scale(0.0);
                }

                50% {
                    transform: scale(1.0);
                    -webkit-transform: scale(1.0);
                }
            }
        </style>
        <div class="spinner-container">
            <div class="spinner">
                <div class="dot1"></div>
                <div class="dot2"></div>
            </div>
        </div>
    </div>
</body>

</html>
