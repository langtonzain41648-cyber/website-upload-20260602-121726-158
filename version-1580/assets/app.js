(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll('.movie-player').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var layer = wrap.querySelector('.play-layer');
      var url = wrap.getAttribute('data-video-url');
      var loaded = false;

      function attachAndPlay() {
        if (!video || !url) {
          return;
        }
        if (layer) {
          layer.classList.add('hidden');
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            loaded = true;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            loaded = true;
          } else {
            video.src = url;
            loaded = true;
          }
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener('click', attachAndPlay);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded || video.paused) {
            attachAndPlay();
          }
        });
      }
    });
  });
})();
