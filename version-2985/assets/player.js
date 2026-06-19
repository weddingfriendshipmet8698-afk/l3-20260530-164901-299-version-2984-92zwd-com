import { H as Hls } from './hls.js';

export function startPlayer(source) {
  const video = document.getElementById('moviePlayer');
  const cover = document.getElementById('playStart');
  let ready = false;
  let hls = null;

  if (!video || !source) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function begin() {
    prepare();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.play().catch(function () {
      if (cover) {
        cover.classList.remove('is-hidden');
      }
    });
  }

  if (cover) {
    cover.addEventListener('click', begin);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
