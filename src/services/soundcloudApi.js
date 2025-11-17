/**
 * SoundCloud API Service
 * Uses proxy server to handle OAuth2 and bypass CORS
 */

// Proxy server base URL
const PROXY_BASE = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';

// Genre-to-Query Mapping for study/work music
const GENRE_QUERIES = {
  'lofi': [
    'lofi hip hop beats',
    'chillhop study',
    'lofi beats to study'
  ],
  'classical': [
    'classical piano study',
    'peaceful piano',
    'classical focus music'
  ],
  'ambient': [
    'ambient study music',
    'ambient electronic focus',
    'atmospheric concentration'
  ],
  'jazz': [
    'smooth jazz instrumental',
    'jazz for studying',
    'bossa nova chill'
  ],
  'bass': [
    'bass boosted study',
    'deep bass concentration'
  ],
  'chill-trap': [
    'chill trap beats',
    'melodic trap study'
  ]
};

/**
 * Get playable stream URL from SoundCloud track
 * Uses proxy server to resolve with proper authentication
 */
export const resolveStreamUrl = async (trackData) => {
  try {
    // Use the proxy server to resolve the stream URL
    // This handles both stream_url and media.transcodings cases
    const response = await fetch(`${PROXY_BASE}/api/soundcloud-resolve?trackId=${trackData.id}`);

    if (response.ok) {
      const data = await response.json();
      console.log('Resolved stream URL for track:', trackData.title);
      return data.url;
    } else {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to resolve stream URL:', error);
      return null;
    }
  } catch (error) {
    console.error('Error resolving stream URL for track:', trackData.title, error);
    return null;
  }
};

/**
 * Search SoundCloud tracks by query and genre
 * @param {string} query - Search query (e.g., "concentration", "focus")
 * @param {string} genre - Genre filter (e.g., "rock", "hard rock", "metal")
 * @param {number} limit - Number of results (max 200)
 * @returns {Promise<Array>} Array of track objects
 */
export const searchSoundCloudTracks = async (query = '', genre = 'rock', limit = 50) => {
  // Build search query for API v1
  const searchParams = new URLSearchParams({
    q: query + (genre ? ` ${genre}` : ''),
    limit: limit.toString(),
    linked_partitioning: '1',
  });

  // Use proxy server to make the request
  const response = await fetch(`${PROXY_BASE}/api/soundcloud/tracks?${searchParams}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`SoundCloud API error: ${response.status} ${error.error || response.statusText}`);
  }

  const data = await response.json();
  const tracks = Array.isArray(data) ? data : (data.collection || []);

  // Transform to our app's format
  // Note: We store the track reference and resolve stream URLs lazily when needed
  return tracks
    .filter(track => track.streamable || track.media?.transcodings?.length > 0) // Only streamable tracks
    .map(track => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.user?.username || 'Unknown Artist',
      album: track.genre || 'SoundCloud',
      duration: Math.floor(track.duration / 1000), // Convert ms to seconds
      // Store a placeholder - we'll resolve actual stream URL when playing
      audioUrl: track.stream_url || 'pending',
      coverUrl: track.artwork_url || track.user?.avatar_url || 'https://via.placeholder.com/400',
      year: track.created_at ? new Date(track.created_at).getFullYear() : new Date().getFullYear(),
      genre: track.genre || 'Unknown',
      description: track.description,
      playbackCount: track.playback_count,
      likesCount: track.likes_count,
      permalink: track.permalink_url,
      // Store raw track data for stream URL resolution
      _rawTrack: track,
    }));
};

/**
 * Get concentration / focus hard rock playlist
 * @returns {Promise<Array>} Array of track objects
 */
export const getConcentrationHardRock = async () => {
  try {
    // Search for concentration/focus music in hard rock/rock genre
    const queries = [
      { query: 'concentration', genre: 'rock' },
      { query: 'focus', genre: 'rock' },
      { query: 'instrumental', genre: 'rock' },
      { query: 'hard rock', genre: 'rock' },
    ];

    // Try each query and combine results
    const allTracks = [];

    for (const { query, genre } of queries) {
      try {
        const tracks = await searchSoundCloudTracks(query, genre, 25);
        allTracks.push(...tracks);
      } catch (err) {
        console.warn(`Failed to fetch ${query}:`, err);
      }
    }

    // Remove duplicates by ID
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );

    // Sort by playback count (popularity)
    return uniqueTracks
      .sort((a, b) => (b.playbackCount || 0) - (a.playbackCount || 0))
      .slice(0, 50); // Return top 50

  } catch (error) {
    console.error('Failed to get concentration hard rock:', error);
    throw error;
  }
};

/**
 * Fetch playlist by genre for study/work music
 * @param {string} genre - Genre ID (e.g., 'lofi', 'classical')
 * @returns {Promise<Array>} Array of track objects (top 50)
 */
export const fetchPlaylistByGenre = async (genre) => {
  const queries = GENRE_QUERIES[genre] || GENRE_QUERIES['lofi'];
  const allTracks = [];

  // Execute parallel searches for each genre's query terms
  const searchPromises = queries.map(query =>
    searchSoundCloudTracks(query, '', 20).catch(err => {
      console.warn(`Failed to fetch "${query}":`, err);
      return [];
    })
  );

  const results = await Promise.all(searchPromises);
  results.forEach(tracks => allTracks.push(...tracks));

  // Filter out tracks with unavailable streams
  const validTracks = allTracks.filter(track => track.audioUrl);

  // Remove duplicates by ID
  const uniqueTracks = Array.from(
    new Map(validTracks.map(track => [track.id, track])).values()
  );

  // Sort by play count (popularity)
  const sortedTracks = uniqueTracks.sort(
    (a, b) => (b.playbackCount || 0) - (a.playbackCount || 0)
  );

  // Return top 50 unique tracks
  return sortedTracks.slice(0, 50);
};

/**
 * Get track by ID
 * @param {string} trackId - SoundCloud track ID
 * @returns {Promise<Object>} Track object
 */
export const getSoundCloudTrack = async (trackId) => {
  const response = await fetch(`${PROXY_BASE}/api/soundcloud/tracks/${trackId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`SoundCloud API error: ${response.status} ${error.error || response.statusText}`);
  }

  const track = await response.json();

  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.user?.username || 'Unknown Artist',
    album: track.genre || 'SoundCloud',
    duration: Math.floor(track.duration / 1000),
    audioUrl: track.stream_url || 'pending',
    coverUrl: track.artwork_url || track.user?.avatar_url,
    year: track.created_at ? new Date(track.created_at).getFullYear() : new Date().getFullYear(),
    genre: track.genre || 'Unknown',
    _rawTrack: track,
  };
};

/**
 * Check if SoundCloud API is configured (check if proxy is available)
 * @returns {Promise<boolean>}
 */
export const isSoundCloudConfigured = async () => {
  try {
    const response = await fetch(`${PROXY_BASE}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch {
    return false;
  }
};
