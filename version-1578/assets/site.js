(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function bindMenu() {
    var button = $('[data-menu-button]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
      button.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
  }

  function bindHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $$('.hero-slide', hero);
    var dots = $$('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    if (!slides.length) return;
    var index = 0;
    var timer;

    function show(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function bindLocalFilters() {
    $$('[data-filter-list]').forEach(function (list) {
      var scope = list.closest('section') || document;
      var input = $('[data-local-search]', scope);
      var clear = $('[data-filter-clear]', scope);
      var buttons = $$('[data-filter-value]', scope);
      var cards = $$('.movie-card', list);
      var value = '';

      function apply() {
        var query = ((input && input.value) || '').trim().toLowerCase();
        cards.forEach(function (card) {
          var hay = textOf(card);
          var matchedQuery = !query || hay.indexOf(query) !== -1;
          var matchedValue = !value || hay.indexOf(value.toLowerCase()) !== -1;
          card.setAttribute('data-filter-hidden', matchedQuery && matchedValue ? 'false' : 'true');
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (clear) {
        clear.addEventListener('click', function () {
          value = '';
          if (input) input.value = '';
          apply();
        });
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          value = button.getAttribute('data-filter-value') || '';
          apply();
        });
      });
    });
  }

  window.initPlayer = function (sourceUrl) {
    var video = document.querySelector('.watch-video');
    var overlay = document.querySelector('.play-overlay');
    if (!video || !overlay || !sourceUrl) return;
    var hls;
    var ready = false;

    function attach() {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      attach();
      overlay.classList.add('hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) hls.destroy();
    });
  };

  window.startSearchPage = function () {
    var form = document.getElementById('searchPanel');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    if (!form || !input || !results || !window.SEARCH_MOVIES) return;
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var q = input.value.trim().toLowerCase();
      var found = window.SEARCH_MOVIES.filter(function (movie) {
        var hay = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(' ').toLowerCase();
        return !q || hay.indexOf(q) !== -1;
      }).slice(0, 240);
      results.innerHTML = found.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster" href="./' + movie.file + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="play-dot">▶</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>' +
          '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>' +
          '<p class="movie-line">' + escapeHtml(movie.one) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    render();
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindHero();
    bindLocalFilters();
  });
})();
