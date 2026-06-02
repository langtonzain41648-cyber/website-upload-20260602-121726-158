(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-hidden");
      });
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function initLocalFilters() {
    document.querySelectorAll("[data-local-filter]").forEach(function (panel) {
      var scope = panel.parentElement;
      var grid = scope.querySelector("[data-filter-grid]");
      var empty = scope.querySelector("[data-empty-state]");
      var queryInput = panel.querySelector("[data-filter-query]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var resetButton = panel.querySelector("[data-filter-reset]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applyFilter() {
        var query = normalize(queryInput ? queryInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visibleCount = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags")
          ].join(" "));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || cardYear === year;
          var visible = matchesQuery && matchesYear;
          card.classList.toggle("is-hidden", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      if (queryInput) {
        queryInput.addEventListener("input", applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (queryInput) {
            queryInput.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          applyFilter();
        });
      }
      applyFilter();
    });
  }

  function createSearchCard(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2) : [];
    var tagHtml = tags.map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-category=\"" + escapeHtml(movie.category) + "\" data-tags=\"" + escapeHtml(movie.genre + " " + movie.tags.join(" ")) + "\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "    <span class=\"poster-frame\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">",
      "      <span class=\"poster-shade\"></span>",
      "      <span class=\"play-hover\">▶</span>",
      "    </span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <div class=\"card-tags\"><a href=\"" + escapeHtml(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span></div>",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"mini-tags\">" + tagHtml + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!page || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var queryInput = page.querySelector("[data-search-input]");
    var yearSelect = page.querySelector("[data-search-year]");
    var categorySelect = page.querySelector("[data-search-category]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function render() {
      var query = normalize(queryInput ? queryInput.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.genre,
          movie.category,
          movie.region,
          movie.tags.join(" ")
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || normalize(movie.year) === year;
        var matchesCategory = !category || normalize(movie.category) === category;
        return matchesQuery && matchesYear && matchesCategory;
      }).slice(0, 96);
      results.innerHTML = list.map(createSearchCard).join("\n");
      initImages();
      if (empty) {
        empty.classList.toggle("is-visible", list.length === 0);
      }
    }

    [queryInput, yearSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", render);
    });
    render();
  }

  ready(function () {
    initImages();
    initMobileMenu();
    initHeroSlider();
    initLocalFilters();
    initSearchPage();
  });
})();
