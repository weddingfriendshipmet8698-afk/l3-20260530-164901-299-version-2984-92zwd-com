(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
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
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function bindFilters() {
        var search = document.querySelector("[data-list-search]");
        var year = document.querySelector("[data-year-filter]");
        var region = document.querySelector("[data-region-filter]");
        var count = document.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
        if (!cards.length || (!search && !year && !region)) {
            return;
        }

        function getText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-type")
            ].join(" ").toLowerCase();
        }

        function update() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = getText(card);
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                var isVisible = matchesQuery && matchesYear && matchesRegion;
                card.hidden = !isVisible;
                if (isVisible) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        [search, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    }

    window.initMoviePlayer = function (video, cover, source) {
        if (!video || !cover || !source) {
            return;
        }
        var hlsInstance = null;
        var started = false;

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                return;
            }

            video.src = source;
            playVideo();
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
    });
})();
