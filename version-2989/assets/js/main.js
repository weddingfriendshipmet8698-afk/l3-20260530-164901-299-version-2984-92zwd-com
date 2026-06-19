(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-site-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
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
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

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

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }

    var keyword = panel.querySelector("[data-filter-keyword]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var count = panel.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.dataset.search);
        var cardRegion = normalize(card.dataset.region);
        var cardType = normalize(card.dataset.type);
        var cardYear = normalize(card.dataset.year);
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " 部";
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function createCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "  <a href=\"" + item.url + "\" class=\"movie-card-link\">",
      "    <figure class=\"movie-thumb\">",
      "      <img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.closest('.movie-thumb').classList.add('image-missing'); this.remove();\">",
      "      <span class=\"play-pill\">▶</span>",
      "      <span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
      "      <span class=\"genre-badge\">" + escapeHtml(item.genreFirst || item.type) + "</span>",
      "      <figcaption>" + escapeHtml(item.oneLine) + "</figcaption>",
      "    </figure>",
      "    <div class=\"movie-info\">",
      "      <div class=\"movie-meta-row\">",
      "        <span class=\"chip chip-warm\">" + escapeHtml(item.type) + "</span>",
      "        <span>" + escapeHtml(item.region) + "</span>",
      "      </div>",
      "      <h3>" + escapeHtml(item.title) + "</h3>",
      "      <div class=\"tag-line\">" + tags + "</div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = page.querySelector("[data-search-input]");
    var button = page.querySelector("[data-search-button]");
    var summary = page.querySelector("[data-search-summary]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function render() {
      var q = normalize(input.value);
      var data = window.MOVIE_SEARCH_DATA;
      var matched = q
        ? data.filter(function (item) {
            return normalize(item.search).indexOf(q) !== -1;
          })
        : data.slice(0, 60);

      var visible = matched.slice(0, 120);
      results.innerHTML = visible.map(createCard).join("");

      if (summary) {
        if (q) {
          summary.textContent = "关键词“" + input.value.trim() + "”共找到 " + matched.length + " 部，当前展示前 " + visible.length + " 部。";
        } else {
          summary.textContent = "默认展示前 " + visible.length + " 部内容。";
        }
      }
    }

    input.value = initialQuery;
    button.addEventListener("click", render);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        render();
      }
    });
    input.addEventListener("input", function () {
      if (!input.value.trim()) {
        render();
      }
    });
    render();
  }

  ready(function () {
    setupNavigation();
    setupHeaderSearch();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
