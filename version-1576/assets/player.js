import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
  var player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var playButton = player.querySelector("[data-play]");
  var statusNode = player.querySelector("[data-player-status]");
  var source = player.dataset.source;
  var hlsInstance = null;
  var initialized = false;

  function setStatus(message) {
    if (statusNode) {
      statusNode.textContent = message;
    }
  }

  function initializeSource() {
    if (initialized || !video || !source) {
      return;
    }

    initialized = true;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放清单加载完成，可以开始观看。");
      });

      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("网络异常，正在尝试重新加载播放源。");
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("媒体解码异常，正在尝试恢复播放。");
          hlsInstance.recoverMediaError();
          return;
        }

        setStatus("播放器遇到不可恢复错误，请刷新页面后重试。");
        hlsInstance.destroy();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("当前浏览器使用原生 HLS 播放。");
    } else {
      setStatus("当前浏览器不支持 HLS 播放，请更换新版 Chrome、Edge 或 Safari。");
    }
  }

  async function startPlayback() {
    initializeSource();

    if (!video) {
      return;
    }

    try {
      await video.play();
      if (playButton) {
        playButton.hidden = true;
      }
      setStatus("正在播放。");
    } catch (error) {
      setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
      if (playButton) {
        playButton.hidden = false;
      }
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("play", function () {
      if (playButton) {
        playButton.hidden = true;
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        if (playButton) {
          playButton.hidden = false;
        }
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
