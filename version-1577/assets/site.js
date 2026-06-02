document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initHeaderSearchDefaults();
});

function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".mobile-panel");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        const isOpen = !panel.hasAttribute("hidden");
        if (isOpen) {
            panel.setAttribute("hidden", "");
            toggle.setAttribute("aria-expanded", "false");
        } else {
            panel.removeAttribute("hidden");
            toggle.setAttribute("aria-expanded", "true");
        }
    });
}

function initHeroCarousel() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-slide-dot]"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");

    if (slides.length === 0) {
        return;
    }

    let active = 0;
    let timer = null;

    function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === active);
        });
    }

    function schedule() {
        clearInterval(timer);
        timer = setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener("click", function () {
            show(active - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(active + 1);
            schedule();
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
            schedule();
        });
    });

    schedule();
}

function initHeaderSearchDefaults() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const filterInput = document.querySelector(".filter-input");

    if (filterInput && query) {
        filterInput.value = query;
        filterInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

function initFilters() {
    const panels = Array.from(document.querySelectorAll(".filter-panel"));

    panels.forEach(function (panel) {
        const input = panel.querySelector(".filter-input");
        const region = panel.querySelector(".filter-region");
        const type = panel.querySelector(".filter-type");
        const year = panel.querySelector(".filter-year");
        const cards = Array.from(document.querySelectorAll(".filter-card"));
        const resultCount = document.querySelector("[data-result-count]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function update() {
            const q = normalize(input ? input.value : "");
            const regionValue = normalize(region ? region.value : "");
            const typeValue = normalize(type ? type.value : "");
            const yearValue = normalize(year ? year.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));
                const matchesQuery = !q || haystack.includes(q);
                const matchesRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
                const matchesType = !typeValue || normalize(card.dataset.type).includes(typeValue);
                const matchesYear = !yearValue || normalize(card.dataset.year).includes(yearValue);
                const shouldShow = matchesQuery && matchesRegion && matchesType && matchesYear;

                card.classList.toggle("hidden-card", !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = "共 " + visible + " 部";
            }
        }

        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        update();
    });
}
