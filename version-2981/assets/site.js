document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);

    showSlide(0);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
  var activeYear = '';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilter() {
    if (!filterList) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var items = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var visibleCount = 0;

    items.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-type'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags')
      ].join(' '));
      var yearMatch = !activeYear || item.getAttribute('data-year') === activeYear;
      var queryMatch = !query || haystack.indexOf(query) !== -1;
      var visible = yearMatch && queryMatch;

      item.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('is-visible', visibleCount === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeYear = button.getAttribute('data-filter-year') || '';
      yearButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  if (yearButtons.length) {
    yearButtons[0].classList.add('is-active');
  }
});
