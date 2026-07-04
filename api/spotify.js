const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const currentTrackEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode';

const sendJson = (response, statusCode, payload) => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.end(JSON.stringify(payload));
};

const getAccessToken = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
};

const normalizeTrack = (payload) => {
  const item = payload && payload.item;
  if (!item) return null;

  if (payload.currently_playing_type === 'episode') {
    return {
      title: item.name,
      artist: item.show && item.show.name,
      subtitle: 'Spotify episode',
      image: item.images && item.images[0] && item.images[0].url,
      url: item.external_urls && item.external_urls.spotify,
    };
  }

  const artists = Array.isArray(item.artists)
    ? item.artists.map((artist) => artist.name).filter(Boolean).join(', ')
    : '';

  return {
    title: item.name,
    artist: artists,
    subtitle: item.album && item.album.name,
    image: item.album && item.album.images && item.album.images[0] && item.album.images[0].url,
    url: item.external_urls && item.external_urls.spotify,
  };
};

module.exports = async (request, response) => {
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      sendJson(response, 200, { isConfigured: false, isPlaying: false, item: null });
      return;
    }

    const spotifyResponse = await fetch(currentTrackEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (spotifyResponse.status === 204 || spotifyResponse.status === 202) {
      sendJson(response, 200, { isConfigured: true, isPlaying: false, item: null });
      return;
    }

    if (!spotifyResponse.ok) {
      throw new Error(`Spotify playback request failed with ${spotifyResponse.status}`);
    }

    const payload = await spotifyResponse.json();
    sendJson(response, 200, {
      isConfigured: true,
      isPlaying: Boolean(payload.is_playing),
      item: normalizeTrack(payload),
    });
  } catch (error) {
    sendJson(response, 500, {
      error: 'Unable to fetch Spotify playback',
      message: error.message,
    });
  }
};
