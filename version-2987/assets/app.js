(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    selectAll('[data-filter-root]').forEach(function (root) {
      var input = root.querySelector('[data-filter-input]');
      var region = root.querySelector('[data-filter-region]');
      var type = root.querySelector('[data-filter-type]');
      var year = root.querySelector('[data-filter-year]');
      var count = root.querySelector('[data-filter-count]');
      var list = document.querySelector('[data-card-list]');
      var cards = list ? selectAll('.movie-card', list) : [];

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (input && query) {
        input.value = query;
      }

      function valueOf(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = valueOf(input);
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        var yearValue = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
          var cardType = (card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
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

          card.classList.toggle('is-hidden-card', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '共 ' + visible + ' 部';
        }
      }

      [input, region, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var trigger = document.querySelector('[data-play-trigger]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function initialize() {
      if (initialized || !source) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      initialize();
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          video.controls = true;
        });
      }
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      initialize();
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
