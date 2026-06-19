document.addEventListener('DOMContentLoaded', function () {
  var button = document.querySelector('[data-play-button]');
  var video = document.querySelector('[data-video-player]');

  if (!button || !video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hasStarted = false;

  function playVideo() {
    if (!source) {
      return;
    }

    button.style.display = 'none';

    if (hasStarted) {
      video.play();
      return;
    }

    hasStarted = true;

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          video.src = source;
          video.play();
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
      return;
    }

    video.src = source;
    video.play();
  }

  button.addEventListener('click', playVideo);
});
