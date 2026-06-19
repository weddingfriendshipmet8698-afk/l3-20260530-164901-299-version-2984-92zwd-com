document.addEventListener("DOMContentLoaded", function () {
  const panel = document.querySelector("[data-player]");
  if (!panel) {
    return;
  }

  const video = panel.querySelector("video");
  const button = panel.querySelector("[data-play-button]");
  const source = panel.dataset.source;
  let initialized = false;

  function initPlayer() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      initPlayer();
    });
  }

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("is-hidden");
    }
  });
});
