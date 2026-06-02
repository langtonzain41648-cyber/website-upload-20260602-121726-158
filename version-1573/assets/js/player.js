(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video[data-src]");
    var button = shell.querySelector("[data-player-start]");
    var status = shell.querySelector("[data-player-status]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    var attached = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (attached || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放源正在重新连接");
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      shell.classList.add("is-loading");
      setStatus("正在加载高清片源");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-loading");
          setStatus("点击播放器继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("playing", function () {
      shell.classList.add("is-playing");
      shell.classList.remove("is-loading");
      setStatus("正在播放");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        setStatus("已暂停");
      }
    });
    video.addEventListener("ended", function () {
      setStatus("播放结束");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
