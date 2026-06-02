(function() {
  function setStatus(shell, message) {
    var status = shell.querySelector("[data-player-status]");
    if (status) {
      status.textContent = message;
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-player-start]");
    var source = shell.getAttribute("data-video-source");
    var Hls = window.Hls;

    if (!video || !button || !source) {
      setStatus(shell, "播放源不可用");
      return;
    }

    var initialized = false;

    function startPlayback() {
      if (initialized) {
        video.play();
        return;
      }

      initialized = true;
      button.classList.add("is-hidden");
      setStatus(shell, "正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function() {
          video.play();
        }, { once: true });
        setStatus(shell, "已启用浏览器原生 HLS 播放");
        return;
      }

      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          setStatus(shell, "播放源已就绪");
          video.play();
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal) {
            setStatus(shell, "播放加载失败，请稍后重试");
          }
        });
        return;
      }

      video.src = source;
      video.play();
      setStatus(shell, "已尝试直接播放");
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("play", function() {
      button.classList.add("is-hidden");
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
