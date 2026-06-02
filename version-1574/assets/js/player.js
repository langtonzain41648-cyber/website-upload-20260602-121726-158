(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = document.querySelectorAll("[data-video-src]");

        players.forEach(function (shell) {
            setupPlayer(shell);
        });
    });

    function setupPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-button]");
        var status = shell.querySelector("[data-player-status]");
        var source = shell.getAttribute("data-video-src");
        var initialized = false;
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function getHlsConstructor() {
            return window.Hls || window.LocalHls || null;
        }

        function initialize() {
            if (initialized) {
                return Promise.resolve();
            }

            initialized = true;
            setStatus("正在连接播放源...");

            var HlsConstructor = getHlsConstructor();

            if (HlsConstructor && HlsConstructor.isSupported && HlsConstructor.isSupported()) {
                hlsInstance = new HlsConstructor({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
                    setStatus("播放源已就绪");
                });

                hlsInstance.on(HlsConstructor.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus("播放连接异常，可刷新页面后重试");
                    }
                });

                return Promise.resolve();
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setStatus("播放源已就绪");
                return Promise.resolve();
            }

            initialized = false;
            setStatus("播放器正在加载，请稍后再点一次播放");
            return Promise.resolve();
        }

        button.addEventListener("click", function () {
            initialize().then(function () {
                shell.classList.add("is-playing");
                video.play().catch(function () {
                    setStatus("浏览器阻止了自动播放，请使用播放器控制条继续播放");
                });
            });
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                setStatus("已暂停，可继续播放");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    }
})();
