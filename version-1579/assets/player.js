(function () {
  var setupPlayer = function (wrap) {
    var video = wrap.querySelector('video');
    var cover = wrap.querySelector('[data-player-cover]');
    var button = wrap.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls');
    var loaded = false;
    var hls = null;
    var attachSource = function () {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    };
    var startPlay = function (event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      video.setAttribute('controls', 'controls');
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };
    if (button) {
      button.addEventListener('click', startPlay);
    }
    if (cover && cover !== button) {
      cover.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
