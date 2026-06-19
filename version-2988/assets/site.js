(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var mobile = qs('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupScroller() {
    qsa('[data-scroll-row]').forEach(function (row) {
      var wrap = row.closest('.slider-wrap');
      if (!wrap) {
        return;
      }
      qsa('[data-scroll]', wrap).forEach(function (button) {
        button.addEventListener('click', function () {
          var direction = button.getAttribute('data-scroll') === 'next' ? 1 : -1;
          row.scrollBy({ left: direction * Math.round(row.clientWidth * 0.85), behavior: 'smooth' });
        });
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupSearch() {
    var panel = qs('[data-search-panel]');
    if (!panel) {
      return;
    }
    var input = qs('[data-search-input]', panel);
    var category = qs('[data-search-category]', panel);
    var region = qs('[data-search-region]', panel);
    var year = qs('[data-search-year]', panel);
    var cards = qsa('.movie-card[data-title]');
    var empty = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && input) {
      input.value = initial;
    }

    function run() {
      var keyword = normalize(input && input.value);
      var cat = normalize(category && category.value);
      var reg = normalize(region && region.value);
      var yr = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }
        if (cat && normalize(card.getAttribute('data-category')) !== cat) {
          ok = false;
        }
        if (reg && normalize(card.getAttribute('data-region')) !== reg) {
          ok = false;
        }
        if (yr && normalize(card.getAttribute('data-year')) !== yr) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, category, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', run);
    });
    run();
  }

  window.MoviePlayer = {
    init: function (videoId, overlayId, buttonId, streamUrl) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var button = document.getElementById(buttonId);
      if (!video || !streamUrl) {
        return;
      }
      var attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupScroller();
    setupSearch();
  });
})();
