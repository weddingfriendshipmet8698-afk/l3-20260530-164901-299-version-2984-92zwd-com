(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('#navList');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupImages() {
    qsa('img.cover-image').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      }, { once: true });
    });
  }

  function setupHero() {
    var slider = qs('.hero-slider');
    if (!slider) return;
    var slides = qsa('.hero-slide', slider);
    if (slides.length <= 1) return;
    var index = 0;

    function show(next) {
      slides[index].classList.remove('active');
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
    }

    var prev = qs('[data-hero="prev"]', slider);
    var next = qs('[data-hero="next"]', slider);
    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });
    window.setInterval(function () { show(index + 1); }, 6200);
  }

  function setupFilters() {
    var bar = qs('.filter-bar');
    if (!bar) return;
    var buttons = qsa('[data-filter]', bar);
    var cards = qsa('.movie-card');
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) { item.classList.remove('active'); });
        button.classList.add('active');
        var value = button.getAttribute('data-filter');
        cards.forEach(function (card) {
          var type = card.getAttribute('data-type') || '';
          var visible = value === 'all' || type.indexOf(value) !== -1;
          card.style.display = visible ? '' : 'none';
        });
      });
    });
  }

  function attachVideo(video, overlay) {
    var source = video.getAttribute('data-hls');
    if (!source) return Promise.resolve();
    if (video.dataset.ready === '1') return Promise.resolve();
    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function setupPlayers() {
    qsa('.video-wrap').forEach(function (wrap) {
      var video = qs('video', wrap);
      var overlay = qs('.play-overlay', wrap);
      var playButton = qs('.play-button', wrap);
      if (!video || !overlay || !playButton) return;

      function start() {
        attachVideo(video, overlay).then(function () {
          var play = video.play();
          if (play && typeof play.then === 'function') {
            play.then(function () {
              overlay.classList.add('hidden');
            }).catch(function () {
              overlay.classList.remove('hidden');
            });
          } else {
            overlay.classList.add('hidden');
          }
        });
      }

      playButton.addEventListener('click', start);
      overlay.addEventListener('click', start);
      video.addEventListener('play', function () {
        overlay.classList.add('hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove('hidden');
        }
      });
    });
  }

  function renderSearch() {
    var box = qs('#searchResults');
    if (!box || !window.SEARCH_INDEX) return;
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var input = qs('#searchInput');
    if (input) input.value = q;

    if (!q) {
      box.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签，即可查找相关影片。</div>';
      return;
    }

    var results = window.SEARCH_INDEX.filter(function (item) {
      var text = [item.title, item.region, item.type, item.genre, item.tags].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    }).slice(0, 80);

    if (!results.length) {
      box.innerHTML = '<div class="empty-state">暂未找到匹配影片，可尝试更换关键词。</div>';
      return;
    }

    box.innerHTML = '<div class="movie-grid">' + results.map(function (item) {
      return '<article class="movie-card">' +
        '<a class="movie-poster" href="./' + item.url + '">' +
        '<div class="poster-frame"><img class="cover-image" src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy"></div>' +
        '<span class="poster-play">▶</span></a>' +
        '<div class="movie-card-body"><a class="movie-title" href="./' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</p>' +
        '<p class="movie-desc">' + escapeHtml(item.line) + '</p></div></article>';
    }).join('') + '</div>';
    setupImages();
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupImages();
    setupHero();
    setupFilters();
    setupPlayers();
    renderSearch();
  });
})();
