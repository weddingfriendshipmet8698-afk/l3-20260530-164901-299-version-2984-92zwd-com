
(() => {
  const SAMPLE_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  const SAMPLE_MP4 = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));
  const toInt = (v, fallback = 0) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  function formatCount(n) {
    const num = Number(n) || 0;
    if (num >= 100000000) return (num / 100000000).toFixed(1) + "亿";
    if (num >= 10000) return (num / 10000).toFixed(1) + "万";
    return String(num);
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function movieGradient(movie) {
    const cat = (movie.bucket || movie.category || "").toString();
    const palette = {
      "动作冒险": ["#fb7185", "#f97316"],
      "爱情浪漫": ["#ec4899", "#8b5cf6"],
      "悬疑惊悚": ["#1f2937", "#4338ca"],
      "喜剧轻松": ["#f59e0b", "#fb7185"],
      "科幻奇幻": ["#06b6d4", "#7c3aed"],
      "恐怖暗夜": ["#111827", "#7f1d1d"],
      "动画专区": ["#0ea5e9", "#22c55e"],
      "剧集热播": ["#10b981", "#3b82f6"],
      "经典剧情": ["#14b8a6", "#475569"],
      "国际精选": ["#2563eb", "#f59e0b"],
    };
    if (palette[cat]) return palette[cat];
    const seed = (movie.id || movie.title || "0").toString();
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const colors = [
      "#0ea5e9", "#7c3aed", "#16a34a", "#f59e0b",
      "#ef4444", "#14b8a6", "#2563eb", "#ec4899"
    ];
    return [colors[h % colors.length], colors[(h + 3) % colors.length]];
  }

  function buildPosterStyle(movie) {
    const [a, b] = movieGradient(movie);
    return `--poster-a:${a};--poster-b:${b};`;
  }

  function makeCard(movie, options = {}) {
    const title = escapeHtml(movie.title);
    const text = escapeHtml(movie.one_line || movie.summary || "");
    const meta = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
    const tags = (movie.tags || []).slice(0, 3).map(t => `<span class="poster-chip">${escapeHtml(t)}</span>`).join("");
    const path = movie.path || `movie-${movie.id}.html`;
    const num = options.rank ? `<div class="poster-number">#${options.rank}</div>` : `<div class="poster-number">${escapeHtml(movie.id)}</div>`;
    return `
      <a class="card" href="${path}" aria-label="${title}" style="${buildPosterStyle(movie)}">
        <div class="card__poster">
          <div class="card__poster-content">
            ${num}
            <div>
              <div class="poster-tagline">${tags}</div>
            </div>
          </div>
        </div>
        <div class="card__body">
          <h3 class="card__title">${title}</h3>
          <p class="card__text">${text}</p>
          <div class="card__meta">
            <span>${escapeHtml(meta)}</span>
            <span class="card__badge">在线观看</span>
          </div>
        </div>
      </a>
    `;
  }

  function makeRankItem(movie, index) {
    const title = escapeHtml(movie.title);
    const text = escapeHtml(movie.one_line || movie.summary || "");
    const meta = [
      movie.year ? `年份 ${movie.year}` : "",
      movie.region ? movie.region : "",
      movie.type ? movie.type : "",
    ].filter(Boolean).join(" · ");
    return `
      <a class="rank-item" href="${movie.path || `movie-${movie.id}.html`}" style="${buildPosterStyle(movie)}">
        <div class="rank-number">${index}</div>
        <div class="rank-content">
          <h3>${title}</h3>
          <p>${text}</p>
          <div class="meta">
            <span class="badge">${escapeHtml(meta)}</span>
            <span class="badge">热度 ${formatCount(movie.score || 0)}</span>
          </div>
        </div>
      </a>
    `;
  }

  function wireHeader() {
    const header = qs("[data-site-header]");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = qs("[data-mobile-toggle]");
    const mobileMenu = qs("[data-mobile-menu]");
    if (toggle && mobileMenu) {
      toggle.addEventListener("click", () => {
        const open = mobileMenu.hidden;
        mobileMenu.hidden = !open;
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function wireSearchForms() {
    qsa("[data-search-form]").forEach(form => {
      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const input = qs("input[type='search'], input[name='q']", form);
        const q = (input?.value || "").trim();
        const url = new URL(window.location.href);
        url.pathname = "/search.html";
        url.search = q ? `?q=${encodeURIComponent(q)}` : "";
        window.location.href = url.pathname + url.search;
      });
    });
  }

  const MAX_RENDER = 120;

  function initSearchPage() {
    const data = window.MOVIE_CATALOG;
    const root = qs("#search-page");
    if (!root || !Array.isArray(data)) return;

    const results = qs("#search-results", root);
    const count = qs("#search-count", root);
    const qInput = qs("#search-q", root);
    const categorySelect = qs("#search-category", root);
    const typeSelect = qs("#search-type", root);
    const yearSelect = qs("#search-year", root);

    const params = new URLSearchParams(window.location.search);
    const initialQ = params.get("q") || "";
    const initialCategory = params.get("category") || "";
    const initialType = params.get("type") || "";
    const initialYear = params.get("year") || "";

    if (qInput) qInput.value = initialQ;
    if (categorySelect) categorySelect.value = initialCategory;
    if (typeSelect) typeSelect.value = initialType;
    if (yearSelect) yearSelect.value = initialYear;

    const apply = () => {
      const q = (qInput?.value || "").trim().toLowerCase();
      const category = (categorySelect?.value || "").trim();
      const type = (typeSelect?.value || "").trim();
      const year = (yearSelect?.value || "").trim();

      let filtered = data.filter(m => {
        const hay = [
          m.title, m.one_line, m.summary, m.review,
          (m.tags || []).join(" "), m.region, m.type, m.year, m.bucket
        ].join(" ").toLowerCase();

        if (q && !hay.includes(q)) return false;
        if (category && m.bucket !== category) return false;
        if (type && m.type !== type) return false;
        if (year && String(m.year) !== year) return false;
        return true;
      });

      filtered = filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
      if (count) count.textContent = String(filtered.length);

      const displayList = filtered.slice(0, MAX_RENDER);
      if (!filtered.length) {
        results.innerHTML = `
          <div class="empty-state">
            没有找到匹配内容，试试更换关键词、年份或分类。
          </div>
        `;
        return;
      }

      const moreNote = filtered.length > MAX_RENDER
        ? `<div class="empty-state" style="grid-column:1/-1;">已显示前 ${MAX_RENDER} 条结果，共 ${filtered.length} 条，继续调整筛选可缩小范围。</div>`
        : "";
      results.innerHTML = displayList.map((movie, idx) => makeCard(movie, { rank: idx + 1 })).join("") + moreNote;
    };

    [qInput, categorySelect, typeSelect, yearSelect].forEach(el => {
      if (!el) return;
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
    });

    apply();
  }

  function initPlayer() {
    const movie = window.PAGE_MOVIE;
    const video = qs("#movie-video");
    if (!movie || !video) return;

    const playButton = qs("[data-play-btn]");
    const overlay = qs("[data-player-overlay]");
    const stream = movie.stream || SAMPLE_HLS;

    const setSource = () => {
      const canUseHls = window.Hls && typeof window.Hls.isSupported === "function" && window.Hls.isSupported();
      if (canUseHls && stream.endsWith(".m3u8")) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, (_ev, data) => {
          if (data && data.fatal) {
            video.src = SAMPLE_MP4;
          }
        });
        video.dataset.hlsAttached = "1";
      } else {
        video.src = stream;
      }
    };

    setSource();

    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
      if (overlay) overlay.style.opacity = "0";
      if (playButton) playButton.hidden = true;
    };

    if (playButton) playButton.addEventListener("click", play);
    video.addEventListener("play", () => {
      if (overlay) overlay.style.opacity = "0";
      if (playButton) playButton.hidden = true;
    });
    video.addEventListener("pause", () => {
      if (overlay) overlay.style.opacity = "1";
      if (playButton) playButton.hidden = false;
    });

    const shareBtn = qs("[data-share-btn]");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const url = window.location.href;
        const text = `${movie.title}｜${movie.one_line || movie.summary || ""}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: movie.title, text, url });
          } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            shareBtn.textContent = "链接已复制";
            setTimeout(() => (shareBtn.textContent = "分享"), 1400);
          }
        } catch (_) {}
      });
    }
  }

  function initCommonData() {
    qsa("[data-format-count]").forEach(el => {
      const val = el.getAttribute("data-format-count") || el.textContent;
      el.textContent = formatCount(val);
    });
  }

  window.MovieSite = {
    formatCount,
    makeCard,
    makeRankItem,
    movieGradient,
  };

  document.addEventListener("DOMContentLoaded", () => {
    wireHeader();
    wireSearchForms();
    initSearchPage();
    initPlayer();
    initCommonData();
  });
})();
