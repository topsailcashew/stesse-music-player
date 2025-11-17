/**
 * Music API Service
 * Handles fetching playlist data from SoundCloud
 */

import { getConcentrationHardRock, isSoundCloudConfigured } from './soundcloudApi';

/**
 * Fetch playlist from SoundCloud
 * @returns {Promise<Array>} Array of track objects
 */
export const fetchPlaylist = async () => {
  const isConfigured = await isSoundCloudConfigured();

  if (!isConfigured) {
    throw new Error('SoundCloud proxy server is not running or not authenticated. Please start the proxy server with: npm run dev');
  }

  console.log('Fetching concentration hard rock from SoundCloud...');
  const tracks = await getConcentrationHardRock();

  if (!tracks || tracks.length === 0) {
    throw new Error('No tracks found from SoundCloud');
  }

  console.log(`Successfully loaded ${tracks.length} tracks from SoundCloud`);
  return tracks;
};

/**
 * Fetch single track by ID from SoundCloud
 * @param {string|number} trackId - The track ID
 * @returns {Promise<Object>} Track object
 */
export const fetchTrackById = async (trackId) => {
  const playlist = await fetchPlaylist();
  const track = playlist.find((t) => t.id === trackId);
  if (!track) {
    throw new Error(`Track with ID ${trackId} not found`);
  }
  return track;
};

/**
 * Search tracks by query in current playlist
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching tracks
 */
export const searchTracks = async (query) => {
  const playlist = await fetchPlaylist();
  const lowercaseQuery = query.toLowerCase();
  return playlist.filter((track) => {
    return (
      track.title?.toLowerCase().includes(lowercaseQuery) ||
      track.artist?.toLowerCase().includes(lowercaseQuery) ||
      track.album?.toLowerCase().includes(lowercaseQuery)
    );
  });
};

/**
 * Get current data source being used
 * @returns {string} 'soundcloud'
 */
export const getCurrentDataSource = () => {
  return 'soundcloud';
};
