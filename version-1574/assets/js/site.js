(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupHeroSlider();
        setupMovieFilters();
    });

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var sliders = document.querySelectorAll("[data-hero-slider]");

        sliders.forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            if (slides.length === 0) {
                return;
            }

            function activate(index) {
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
                    activate(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    activate(dotIndex);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);

            activate(0);
            start();
        });
    }

    function setupMovieFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var search = document.querySelector("[data-movie-search]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
        var counter = document.querySelector("[data-filter-count]");
        var empty = document.querySelector("[data-empty-result]");

        if (cards.length === 0) {
            return;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-category")
            ].join(" ");
        }

        function applyFilters() {
            var query = normalize(search ? search.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;

                if (query && normalize(cardText(card)).indexOf(query) === -1) {
                    matched = false;
                }

                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter-key");
                    var value = normalize(select.value);
                    var cardValue = normalize(card.getAttribute("data-" + key));

                    if (value && cardValue.indexOf(value) === -1) {
                        matched = false;
                    }
                });

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (counter) {
                counter.textContent = "当前显示 " + visible + " 部 / 共 " + cards.length + " 部";
            }

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (search) {
            search.addEventListener("input", applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    }
})();
