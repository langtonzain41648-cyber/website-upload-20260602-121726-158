(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;
    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    var startTimer = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(active + 1);
      }, 6200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });
    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  if (filterInput && params.get('q')) {
    filterInput.value = params.get('q');
  }
  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };
  var applyFilter = function () {
    var keyword = normalize(filterInput ? filterInput.value : '');
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var matched = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };
  if (filterInput && cards.length) {
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }
  Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (button) {
    button.addEventListener('click', function () {
      if (!filterInput) {
        return;
      }
      filterInput.value = button.getAttribute('data-filter-value') || '';
      applyFilter();
      filterInput.focus();
    });
  });
})();
