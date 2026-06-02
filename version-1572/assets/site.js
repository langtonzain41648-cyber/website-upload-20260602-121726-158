(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var active = 0;

    if (slides.length < 2) {
      return;
    }

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var input = qs('.js-filter-input', panel);
    var year = qs('.js-filter-year', panel);
    var category = qs('.js-filter-category', panel);
    var count = qs('.js-filter-count', panel);
    var cards = qsa('.movie-card');
    var emptyState = qs('[data-empty-state]');

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword') || params.get('q') || '';

    if (input && keyword) {
      input.value = keyword;
    }

    function apply() {
      var q = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedCategory = normalize(category && category.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var matchesKeyword = !q || haystack.indexOf(q) !== -1;
        var matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var matchesCategory = !selectedCategory || normalize(card.dataset.category) === selectedCategory;
        var show = matchesKeyword && matchesYear && matchesCategory;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
