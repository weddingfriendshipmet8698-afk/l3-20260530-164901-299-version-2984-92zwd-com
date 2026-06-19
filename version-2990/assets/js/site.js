document.addEventListener("DOMContentLoaded", function () {
  const navButton = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");

  if (navButton && navLinks) {
    navButton.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let slideIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === slideIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  const filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    const keywordInput = filterPanel.querySelector("[data-filter-keyword]");
    const yearSelect = filterPanel.querySelector("[data-filter-year]");
    const regionSelect = filterPanel.querySelector("[data-filter-region]");
    const typeSelect = filterPanel.querySelector("[data-filter-type]");
    const countText = document.querySelector("[data-filter-count]");
    const cards = Array.from(document.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(keywordInput && keywordInput.value);
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedYear = !year || card.dataset.year === year;
        const matchedRegion = !region || card.dataset.region === region;
        const matchedType = !type || card.dataset.type === type;
        const matched = matchedKeyword && matchedYear && matchedRegion && matchedType;

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (countText) {
        countText.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
});
