(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    document.querySelectorAll("[data-filter-root]").forEach(function (root) {
      var search = root.querySelector("[data-search]");
      var year = root.querySelector("[data-year-filter]");
      var type = root.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-card"));
      var empty = root.querySelector(".no-match");

      function apply() {
        var q = normalize(search && search.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var shown = 0;

        cards.forEach(function (card) {
          var hay = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          var ok = (!q || hay.indexOf(q) !== -1) && (!y || normalize(card.getAttribute("data-year")) === y) && (!t || normalize(card.getAttribute("data-type")) === t);
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });

  window.setupMoviePlayer = function (mediaUrl, videoId, buttonId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !mediaUrl) {
        return;
      }

      var shell = video.closest(".player-shell");
      var attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }
      }

      function play() {
        attach();
        if (shell) {
          shell.classList.add("playing");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });

      if (shell) {
        shell.addEventListener("click", function (event) {
          if (event.target !== video) {
            play();
          }
        });
      }
    });
  };
})();
