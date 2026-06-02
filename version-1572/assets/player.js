(function () {
  var hlsScriptPromise = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsScriptPromise) {
      return hlsScriptPromise;
    }

    hlsScriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS 脚本加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsScriptPromise;
  }

  function playNative(video, src) {
    video.src = src;
    return video.play();
  }

  function playWithHls(video, src) {
    return loadHlsScript().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        return playNative(video, src);
      }

      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      video._hlsInstance = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      return new Promise(function (resolve, reject) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(resolve).catch(resolve);
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            reject(new Error('播放源加载失败'));
          }
        });
      });
    });
  }

  function setupPlayer(card) {
    var video = card.querySelector('.movie-player');
    var button = card.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      var src = video.dataset.videoSrc;

      if (!src) {
        button.querySelector('span:last-child').textContent = '暂未配置播放源';
        return;
      }

      button.querySelector('span:last-child').textContent = '正在加载';

      var promise;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        promise = playNative(video, src);
      } else {
        promise = playWithHls(video, src);
      }

      Promise.resolve(promise)
        .then(function () {
          button.classList.add('is-hidden');
        })
        .catch(function () {
          button.querySelector('span:last-child').textContent = '点击重试';
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(setupPlayer);
  });
})();
