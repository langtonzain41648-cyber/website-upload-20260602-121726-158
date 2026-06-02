document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroSlider();
  setupCatalogFilters();
});

function setupMobileMenu() {
  var button = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    var isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });
}

function setupHeroSlider() {
  var slider = document.querySelector("[data-hero-slider]");

  if (!slider) {
    return;
  }

  var slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
  var dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startTimer();
    });
  });

  slider.addEventListener("mouseenter", stopTimer);
  slider.addEventListener("mouseleave", startTimer);

  showSlide(0);
  startTimer();
}

function setupCatalogFilters() {
  var panel = document.querySelector("[data-filter-form]");

  if (!panel) {
    return;
  }

  var keywordInput = panel.querySelector("[data-filter-keyword]");
  var genreSelect = panel.querySelector("[data-filter-genre]");
  var regionSelect = panel.querySelector("[data-filter-region]");
  var yearSelect = panel.querySelector("[data-filter-year]");
  var resetButton = panel.querySelector("[data-filter-reset]");
  var countNode = panel.querySelector("[data-filter-count]");
  var cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  var emptyNode = document.querySelector("[data-filter-empty]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    var keyword = normalize(keywordInput && keywordInput.value);
    var genre = normalize(genreSelect && genreSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.dataset.search);
      var cardGenre = normalize(card.dataset.genre);
      var cardRegion = normalize(card.dataset.region);
      var cardYear = normalize(card.dataset.year);
      var visible = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        visible = false;
      }

      if (genre && cardGenre.indexOf(genre) === -1) {
        visible = false;
      }

      if (region && cardRegion.indexOf(region) === -1) {
        visible = false;
      }

      if (year && cardYear.indexOf(year) === -1) {
        visible = false;
      }

      card.hidden = !visible;

      if (visible) {
        visibleCount += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visibleCount);
    }

    if (emptyNode) {
      emptyNode.hidden = visibleCount !== 0;
    }
  }

  [keywordInput, genreSelect, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (keywordInput) {
        keywordInput.value = "";
      }
      if (genreSelect) {
        genreSelect.value = "";
      }
      if (regionSelect) {
        regionSelect.value = "";
      }
      if (yearSelect) {
        yearSelect.value = "";
      }
      applyFilters();
    });
  }

  applyFilters();
}
