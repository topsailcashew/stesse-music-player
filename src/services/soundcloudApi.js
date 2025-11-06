/**
 * SoundCloud API Service
 * Handles fetching tracks from SoundCloud
 *
 * SETUP REQUIRED:
 * 1. Go to https://developers.soundcloud.com
 * 2. Create an app and get your Client ID
 * 3. Add to .env: REACT_APP_SOUNDCLOUD_CLIENT_ID=your_client_id
 */

const SOUNDCLOUD_API_BASE = 'https://api.soundcloud.com';
const CLIENT_ID = process.env.REACT_APP_SOUNDCLOUD_CLIENT_ID;

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

// Fallback: Try to extract client ID from SoundCloud widget (public method)
let extractedClientId = null;

/**
 * Extract client ID from SoundCloud widget script (fallback method)
 * This is a workaround when you don't have official API access
 */
const extractClientIdFromWidget = async () => {
  if (extractedClientId) return extractedClientId;

  try {
    const response = await fetch('https://widget.soundcloud.com/widget-v2.json');
    const data = await response.json();

    // Try to find client_id in widget data
    if (data?.client_id) {
      extractedClientId = data.client_id;
      return extractedClientId;
    }

    // Alternative: fetch a SoundCloud page and extract from script
    const pageResponse = await fetch('https://soundcloud.com');
    const html = await pageResponse.text();
    const match = html.match(/"client_id":"([^"]+)"/);

    if (match && match[1]) {
      extractedClientId = match[1];
      return extractedClientId;
    }
  } catch (error) {
    console.error('Failed to extract SoundCloud client ID:', error);
  }

  return null;
};

/**
 * Get client ID (from env or extracted)
 */
const getClientId = async () => {
  if (CLIENT_ID) return CLIENT_ID;
  return await extractClientIdFromWidget();
};

/**
 * Search SoundCloud tracks by query and genre
 * @param {string} query - Search query (e.g., "concentration", "focus")
 * @param {string} genre - Genre filter (e.g., "rock", "hard rock", "metal")
 * @param {number} limit - Number of results (max 200)
 * @returns {Promise<Array>} Array of track objects
 */
export const searchSoundCloudTracks = async (query = '', genre = 'rock', limit = 50) => {
  try {
    const clientId = await getClientId();

    if (!clientId) {
      throw new Error('SoundCloud Client ID not configured. Please add REACT_APP_SOUNDCLOUD_CLIENT_ID to .env');
    }

    // Build search query
    const searchParams = new URLSearchParams({
      q: query,
      genres: genre,
      limit: limit.toString(),
      linked_partitioning: '1',
      client_id: clientId,
    });

    const response = await fetch(`${SOUNDCLOUD_API_BASE}/tracks?${searchParams}`);

    if (!response.ok) {
      throw new Error(`SoundCloud API error: ${response.status}`);
    }

    const data = await response.json();
    const tracks = data.collection || [];

    // Transform to our app's format
    return tracks
      .filter(track => track.streamable && track.stream_url) // Only streamable tracks
      .map(track => ({
        id: track.id.toString(),
        title: track.title,
        artist: track.user?.username || 'Unknown Artist',
        album: track.genre || 'SoundCloud',
        duration: Math.floor(track.duration / 1000), // Convert ms to seconds
        audioUrl: `${track.stream_url}?client_id=${clientId}`,
        coverUrl: track.artwork_url || track.user?.avatar_url || 'https://via.placeholder.com/400',
        year: new Date(track.created_at).getFullYear(),
        genre: track.genre || 'Unknown',
        description: track.description,
        playbackCount: track.playback_count,
        likesCount: track.likes_count,
        permalink: track.permalink_url,
      }));
  } catch (error) {
    console.error('SoundCloud API error:', error);
    throw error;
  }
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
  try {
    const clientId = await getClientId();

    // If no client ID, fall back to mock data
    if (!clientId) {
      console.warn('No SoundCloud client ID found. Using mock data.');
      // TODO: Remove after SoundCloud API configured
      const { getMockPlaylistByGenre } = await import('../data/mockPlaylists');
      return getMockPlaylistByGenre(genre);
    }

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

  } catch (error) {
    console.error(`Failed to fetch playlist for genre "${genre}":`, error);
    // Fall back to mock data on error
    try {
      const { getMockPlaylistByGenre } = await import('../data/mockPlaylists');
      return getMockPlaylistByGenre(genre);
    } catch (fallbackError) {
      console.error('Mock data fallback failed:', fallbackError);
      return [];
    }
  }
};

/**
 * Get track by ID
 * @param {string} trackId - SoundCloud track ID
 * @returns {Promise<Object>} Track object
 */
export const getSoundCloudTrack = async (trackId) => {
  try {
    const clientId = await getClientId();

    if (!clientId) {
      throw new Error('SoundCloud Client ID not configured');
    }

    const response = await fetch(
      `${SOUNDCLOUD_API_BASE}/tracks/${trackId}?client_id=${clientId}`
    );

    if (!response.ok) {
      throw new Error(`SoundCloud API error: ${response.status}`);
    }

    const track = await response.json();

    return {
      id: track.id.toString(),
      title: track.title,
      artist: track.user?.username || 'Unknown Artist',
      album: track.genre || 'SoundCloud',
      duration: Math.floor(track.duration / 1000),
      audioUrl: `${track.stream_url}?client_id=${clientId}`,
      coverUrl: track.artwork_url || track.user?.avatar_url,
      year: new Date(track.created_at).getFullYear(),
      genre: track.genre || 'Unknown',
    };
  } catch (error) {
    console.error('Failed to get SoundCloud track:', error);
    throw error;
  }
};

/**
 * Check if SoundCloud API is configured
 * @returns {Promise<boolean>}
 */
export const isSoundCloudConfigured = async () => {
  try {
    const clientId = await getClientId();
    return !!clientId;
  } catch {
    return false;
  }
};
