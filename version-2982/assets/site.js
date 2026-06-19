(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initMenu() {
    const btn = $('[data-menu-toggle]');
    const drawer = $('[data-mobile-drawer]');
    if (!btn || !drawer) return;
    btn.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      drawer.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    $$('.mobile-link', drawer).forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        drawer.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHero() {
    const slides = $$('.hero-slide');
    const dots = $$('.hero-dot');
    if (!slides.length || !dots.length) return;
    let current = 0;
    const activate = (idx) => {
      current = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => activate(i)));
    const hero = $('.hero');
    let timer = setInterval(() => activate(current + 1), 5000);
    hero?.addEventListener('mouseenter', () => clearInterval(timer));
    hero?.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => activate(current + 1), 5000);
    });
    activate(0);
  }

  function filterCards(input) {
    const query = (input.value || '').trim().toLowerCase();
    const cards = $$('[data-filter-card]');
    cards.forEach(card => {
      if (!query) {
        card.style.display = '';
        return;
      }
      const hay = (card.dataset.title + ' ' + card.dataset.keywords).toLowerCase();
      card.style.display = hay.includes(query) ? '' : 'none';
    });
    const empty = $('[data-filter-empty]');
    if (empty) {
      const visible = cards.some(card => card.style.display !== 'none');
      empty.hidden = visible;
    }
  }

  function initFilter() {
    const input = $('[data-filter-input]');
    if (!input) return;
    input.addEventListener('input', () => filterCards(input));
    input.addEventListener('change', () => filterCards(input));
    filterCards(input);
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      if ([...document.scripts].some(s => s.src === src)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function attachHls(video, url) {
    if (!url) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (!window.Hls) {
      try {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js');
      } catch (err) {
        video.src = video.dataset.fallbackSrc || video.src;
        return;
      }
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hls) {
        try { video._hls.destroy(); } catch (e) {}
      }
      const hls = new window.Hls();
      video._hls = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = video.dataset.fallbackSrc || video.src;
  }

  function initPlayers() {
    const shells = $$('.player-shell');
    shells.forEach(shell => {
      const video = $('video', shell);
      if (!video) return;
      const localSrc = video.dataset.fallbackSrc || video.getAttribute('src');
      const hlsSrc = video.dataset.hlsSrc || '';
      const playLocal = $('[data-play-local]', shell);
      const playRemote = $('[data-play-remote]', shell);
      const overlayBtn = $('.player-big', shell);
      const overlay = $('.player-overlay', shell);

      const play = async (mode) => {
        overlay?.classList.add('is-hidden');
        if (mode === 'remote') {
          await attachHls(video, hlsSrc);
        } else {
          if (localSrc) video.src = localSrc;
        }
        try { await video.play(); } catch (e) {}
      };

      playLocal?.addEventListener('click', () => play('local'));
      playRemote?.addEventListener('click', () => play('remote'));
      overlayBtn?.addEventListener('click', () => play('local'));

      if (localSrc && !video.getAttribute('src')) {
        video.src = localSrc;
      }

      video.addEventListener('play', () => overlay?.classList.add('is-hidden'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initFilter();
    initPlayers();
  });
})();
