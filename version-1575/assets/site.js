(function() {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs("[data-mobile-menu-button]");
  var mobileMenu = qs("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      mobileMenu.classList.toggle("open");
      menuButton.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = qsa("[data-hero-slide]", hero);
    var buttons = qsa("[data-hero-target]", hero);
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      buttons.forEach(function(button, i) {
        button.classList.toggle("active", i === index);
      });
    }

    buttons.forEach(function(button) {
      button.addEventListener("click", function() {
        var next = Number(button.getAttribute("data-hero-target") || "0");
        show(next);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    restart();
  }

  function initLocalFilters() {
    qsa("[data-filter-scope]").forEach(function(scope) {
      var input = qs("[data-filter-input]", scope);
      var year = qs("[data-filter-year]", scope);
      var genre = qs("[data-filter-genre]", scope);
      var grid = qs("[data-filter-grid]") || scope.parentElement.querySelector("[data-filter-grid]");
      var count = qs("[data-filter-count]", scope);

      if (!grid) {
        return;
      }

      var cards = qsa("[data-title]", grid);

      function applyFilter() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedGenre = genre ? genre.value : "";
        var visible = 0;

        cards.forEach(function(card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();

          var matchesTerm = !term || haystack.indexOf(term) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesGenre = !selectedGenre || (card.getAttribute("data-genre") || "").indexOf(selectedGenre) !== -1;
          var keep = matchesTerm && matchesYear && matchesGenre;

          card.hidden = !keep;
          if (keep) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + " 部";
        }
      }

      [input, year, genre].forEach(function(control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-region="' + escapeHtml(item.region) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml(item.tags) + '">',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '    <span class="poster-frame">',
      '      <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '      <span class="poster-shade"></span>',
      '      <span class="play-badge">▶</span>',
      '      <span class="genre-badge">' + escapeHtml((item.genre || item.type || "").split(/[，,、/]/)[0]) + '</span>',
      '    </span>',
      '    <span class="movie-info">',
      '      <strong>' + escapeHtml(item.title) + '</strong>',
      '      <span class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></span>',
      '      <span class="movie-line">' + escapeHtml(item.oneLine) + '</span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join("\n");
  }

  function initSearchPage() {
    var page = qs("[data-search-page]");
    if (!page) {
      return;
    }

    var input = qs("[data-global-search-input]", page);
    var results = qs("[data-search-results]", page);
    var meta = qs("[data-search-meta]", page);
    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    if (!query.trim()) {
      return;
    }

    fetch("assets/search-index.json")
      .then(function(response) {
        return response.json();
      })
      .then(function(items) {
        var keyword = query.trim().toLowerCase();
        var matched = items.filter(function(item) {
          var text = [
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.oneLine
          ].join(" ").toLowerCase();

          return text.indexOf(keyword) !== -1;
        }).slice(0, 200);

        results.innerHTML = matched.map(cardTemplate).join("\n");

        if (meta) {
          meta.textContent = "关键词“" + query + "”共找到 " + matched.length + " 条结果，最多展示前 200 条。";
        }
      })
      .catch(function() {
        if (meta) {
          meta.textContent = "搜索索引加载失败，请检查 assets/search-index.json 是否存在。";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initHero();
    initLocalFilters();
    initSearchPage();
  });
})();
