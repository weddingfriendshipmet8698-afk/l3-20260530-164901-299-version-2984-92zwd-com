(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let index = 0;

    function activate(next) {
      slides[index]?.classList.remove('is-active');
      dots[index]?.classList.remove('is-active');
      index = next;
      slides[index]?.classList.add('is-active');
      dots[index]?.classList.add('is-active');
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5200);
    }
  });

  const localSearch = document.querySelector('[data-local-search]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  function filterCards(value) {
    const words = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    cards.forEach(function (card) {
      const text = card.getAttribute('data-search') || card.textContent.toLowerCase();
      const matched = words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
      card.hidden = words.length > 0 && !matched;
    });
  }

  if (localSearch && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q') || '';
    if (preset) {
      localSearch.value = preset;
      filterCards(preset);
    }
    localSearch.addEventListener('input', function () {
      filterCards(localSearch.value);
    });
  }
})();
