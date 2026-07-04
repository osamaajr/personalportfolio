(() => {
  const widget = document.querySelector('[data-spotify-now]');
  if (!widget) return;

  const profileUrl = widget.dataset.profileUrl || 'https://open.spotify.com/user/itzghost_26';
  const disc = widget.querySelector('[data-spotify-link]');
  const cover = widget.querySelector('[data-spotify-cover]');
  const kicker = widget.querySelector('[data-spotify-kicker]');
  const track = widget.querySelector('[data-spotify-track]');
  const artist = widget.querySelector('[data-spotify-artist]');

  const setLink = (url) => {
    if (!url) return;
    if (disc) disc.href = url;
    if (track) track.href = url;
  };

  const setFallback = () => {
    widget.classList.remove('is-playing');
    if (kicker) kicker.textContent = 'currently listening on';
    if (track) track.textContent = 'Spotify';
    if (artist) artist.textContent = 'open profile';
    if (disc) disc.classList.remove('has-art');
    if (cover) cover.style.backgroundImage = '';
    setLink(profileUrl);
  };

  const updateWidget = (payload) => {
    if (!payload || !payload.isConfigured || !payload.item) {
      setFallback();
      return;
    }

    const item = payload.item;
    const itemUrl = item.url || profileUrl;
    widget.classList.toggle('is-playing', Boolean(payload.isPlaying));

    if (kicker) {
      kicker.textContent = payload.isPlaying ? 'currently listening to' : 'last paused on';
    }

    if (track) {
      track.textContent = item.title || 'Spotify';
    }

    if (artist) {
      artist.textContent = item.artist || item.subtitle || 'Spotify';
    }

    if (cover && item.image) {
      cover.style.backgroundImage = `url("${item.image.replace(/"/g, '\\"')}")`;
      if (disc) disc.classList.add('has-art');
    } else if (disc) {
      disc.classList.remove('has-art');
    }

    setLink(itemUrl);
  };

  fetch('/api/spotify', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Spotify endpoint unavailable');
      return response.json();
    })
    .then(updateWidget)
    .catch(setFallback);
})();
