(function () {
  function setStatus(frame, message) {
    var status = frame.querySelector("[data-player-status]");
    if (status) {
      status.textContent = message;
    }
  }

  function initializeHls(video, sourceUrl, frame) {
    if (!sourceUrl) {
      setStatus(frame, "未找到播放源。");
      return Promise.reject(new Error("Missing video source"));
    }

    if (video.dataset.ready === "true") {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.dataset.ready = "true";
      setStatus(frame, "已使用浏览器原生能力播放。");
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      video.dataset.ready = "true";
      video._hlsInstance = hls;

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus(frame, "播放清单已载入，可以播放。");
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(frame, "播放源加载失败，请检查网络或视频源。 ");
          try {
            hls.destroy();
          } catch (error) {
            console.warn(error);
          }
        }
      });

      return Promise.resolve();
    }

    setStatus(frame, "当前浏览器不支持该播放方式。");
    return Promise.reject(new Error("HLS is not supported"));
  }

  function setupPlayers() {
    var frames = document.querySelectorAll("[data-player]");
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-player-start]");
      var sourceUrl = frame.dataset.src;

      if (!video || !button) {
        return;
      }

      button.addEventListener("click", function () {
        setStatus(frame, "正在加载播放源...");
        initializeHls(video, sourceUrl, frame)
          .then(function () {
            button.classList.add("is-hidden");
            return video.play();
          })
          .catch(function (error) {
            console.warn(error);
          });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPlayers);
  } else {
    setupPlayers();
  }
})();
