const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// SoundCloud credentials
const CLIENT_ID = process.env.REACT_APP_SOUNDCLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_SOUNDCLOUD_CLIENT_SECRET;

// Token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth2 access token from SoundCloud
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth2 failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry to 5 minutes before actual expiry
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    console.log('✓ Successfully authenticated with SoundCloud');
    return accessToken;
  } catch (error) {
    console.error('Failed to get SoundCloud access token:', error);
    throw error;
  }
}

/**
 * Proxy endpoint for SoundCloud API requests
 */
app.use('/api/soundcloud', async (req, res) => {
  try {
    const token = await getAccessToken();

    // Build SoundCloud API URL from the remaining path
    const path = req.path.replace('/', '');  // Remove leading slash
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.soundcloud.com/${path}${queryString ? '?' + queryString : ''}`;

    console.log('Proxying request to:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `OAuth ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Resolve SoundCloud stream URL - returns the final playable URL with auth
 */
app.get('/api/soundcloud-resolve', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { url, trackId } = req.query;

    console.log('Resolving stream URL for:', { url, trackId });

    // If we have a transcoding URL, resolve it
    if (url) {
      const response = await fetch(`${url}?client_id=${CLIENT_ID}`, {
        headers: {
          'Authorization': `OAuth ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const data = await response.json();
      // Return the final playable URL with client_id
      return res.json({ url: `${data.url}?client_id=${CLIENT_ID}` });
    }

    // If we have a track ID, get the track and resolve its stream URL
    if (trackId) {
      const trackResponse = await fetch(`https://api.soundcloud.com/tracks/${trackId}`, {
        headers: {
          'Authorization': `OAuth ${token}`,
        },
      });

      if (!trackResponse.ok) {
        const error = await trackResponse.text();
        console.error('Failed to fetch track:', trackResponse.status, error);
        return res.status(trackResponse.status).json({ error });
      }

      const track = await trackResponse.json();

      console.log('Track info:', {
        id: track.id,
        title: track.title,
        has_stream_url: !!track.stream_url,
        has_transcodings: !!track.media?.transcodings,
        transcoding_count: track.media?.transcodings?.length || 0
      });

      // Check if track has direct stream_url (older tracks)
      if (track.stream_url) {
        console.log('Using direct stream_url');
        // Don't add client_id - we use OAuth in the stream proxy instead
        const soundcloudUrl = track.stream_url;
        // Return our proxy URL to avoid CORS
        const proxyUrl = `http://localhost:${PORT}/api/stream?url=${encodeURIComponent(soundcloudUrl)}`;
        console.log('✓ Returning proxied stream URL');
        return res.json({ url: proxyUrl });
      }

      // Otherwise resolve from media.transcodings (newer tracks)
      if (track.media?.transcodings && track.media.transcodings.length > 0) {
        // Find progressive (MP3) transcoding - this is playable in HTML5 audio
        const progressive = track.media.transcodings.find(t =>
          t.format?.protocol === 'progressive'
        );

        if (!progressive) {
          console.error('No progressive transcoding found! Available formats:',
            track.media.transcodings.map(t => t.format?.protocol));
          return res.status(400).json({ error: 'No playable format available (progressive required)' });
        }

        console.log('Resolving progressive transcoding URL:', progressive.url);
        console.log('Format:', progressive.format);

        const transcodingResponse = await fetch(progressive.url, {
          headers: {
            'Authorization': `OAuth ${token}`,
          },
        });

        if (transcodingResponse.ok) {
          const data = await transcodingResponse.json();
          console.log('✓ Successfully resolved progressive stream URL');
          console.log('Stream URL format:', data.url?.substring(0, 100) + '...');
          // Return our proxy URL to avoid CORS
          const proxyUrl = `http://localhost:${PORT}/api/stream?url=${encodeURIComponent(data.url)}`;
          return res.json({ url: proxyUrl });
        } else {
          const error = await transcodingResponse.text();
          console.error('Failed to resolve transcoding:', transcodingResponse.status, error);
          return res.status(transcodingResponse.status).json({ error: 'Failed to resolve stream' });
        }
      }

      console.error('Track has neither stream_url nor transcodings');
    }

    return res.status(400).json({ error: 'No valid stream URL found' });
  } catch (error) {
    console.error('Resolve error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Proxy audio stream - forwards SoundCloud audio with proper headers
 */
app.get('/api/stream', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    console.log('Streaming audio from:', url.substring(0, 100) + '...');

    const response = await fetch(url, {
      headers: {
        'Authorization': `OAuth ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Stream fetch failed:', response.status);
      return res.status(response.status).send('Stream not available');
    }

    // Forward headers
    res.set({
      'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
      'Content-Length': response.headers.get('content-length'),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });

    // Pipe the audio stream
    response.body.pipe(res);
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).send('Stream error');
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    authenticated: !!accessToken,
    tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
  });
});

app.listen(PORT, () => {
  console.log(`🎵 SoundCloud proxy server running on http://localhost:${PORT}`);
  console.log(`   Frontend should be at http://localhost:3000`);
});
