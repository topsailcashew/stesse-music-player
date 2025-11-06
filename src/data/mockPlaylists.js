/**
 * Mock Playlists for Development
 *
 * TODO: Remove after SoundCloud API configured
 *
 * Provides temporary mock data for testing genre selection
 * without requiring SoundCloud API key
 */

const MOCK_PLAYLISTS = {
  'lofi': [
    {
      id: 'lofi-1',
      title: 'Chill Lo-Fi Beats',
      artist: 'ChillHop Music',
      album: 'Lo-Fi Collection',
      duration: 180,
      audioUrl: 'https://example.com/lofi1.mp3',
      coverUrl: 'https://via.placeholder.com/400/667eea/ffffff?text=Lo-Fi',
      genre: 'Lo-Fi Hip Hop',
      playbackCount: 125000,
      likesCount: 8500,
      permalink: 'https://soundcloud.com/mock/lofi1'
    },
    {
      id: 'lofi-2',
      title: 'Study Session',
      artist: 'Lofi Girl',
      album: 'Study Vibes',
      duration: 210,
      audioUrl: 'https://example.com/lofi2.mp3',
      coverUrl: 'https://via.placeholder.com/400/667eea/ffffff?text=Study',
      genre: 'Lo-Fi Hip Hop',
      playbackCount: 98000,
      likesCount: 6200,
      permalink: 'https://soundcloud.com/mock/lofi2'
    },
    {
      id: 'lofi-3',
      title: 'Rainy Day Focus',
      artist: 'Dreamscape',
      album: 'Rainy Moods',
      duration: 195,
      audioUrl: 'https://example.com/lofi3.mp3',
      coverUrl: 'https://via.placeholder.com/400/667eea/ffffff?text=Rain',
      genre: 'Lo-Fi Hip Hop',
      playbackCount: 87000,
      likesCount: 5400,
      permalink: 'https://soundcloud.com/mock/lofi3'
    },
  ],
  'classical': [
    {
      id: 'classical-1',
      title: 'Moonlight Sonata',
      artist: 'Classical Piano',
      album: 'Piano Classics',
      duration: 240,
      audioUrl: 'https://example.com/classical1.mp3',
      coverUrl: 'https://via.placeholder.com/400/8b5cf6/ffffff?text=Classical',
      genre: 'Classical',
      playbackCount: 156000,
      likesCount: 12000,
      permalink: 'https://soundcloud.com/mock/classical1'
    },
    {
      id: 'classical-2',
      title: 'Peaceful Piano',
      artist: 'Relaxing Piano',
      album: 'Study Classical',
      duration: 220,
      audioUrl: 'https://example.com/classical2.mp3',
      coverUrl: 'https://via.placeholder.com/400/8b5cf6/ffffff?text=Piano',
      genre: 'Classical',
      playbackCount: 134000,
      likesCount: 9800,
      permalink: 'https://soundcloud.com/mock/classical2'
    },
    {
      id: 'classical-3',
      title: 'Morning Meditation',
      artist: 'Zen Orchestra',
      album: 'Calm Morning',
      duration: 200,
      audioUrl: 'https://example.com/classical3.mp3',
      coverUrl: 'https://via.placeholder.com/400/8b5cf6/ffffff?text=Zen',
      genre: 'Classical',
      playbackCount: 112000,
      likesCount: 7600,
      permalink: 'https://soundcloud.com/mock/classical3'
    },
  ],
  'ambient': [
    {
      id: 'ambient-1',
      title: 'Deep Space',
      artist: 'Ambient Waves',
      album: 'Space Journey',
      duration: 300,
      audioUrl: 'https://example.com/ambient1.mp3',
      coverUrl: 'https://via.placeholder.com/400/06b6d4/ffffff?text=Space',
      genre: 'Ambient',
      playbackCount: 89000,
      likesCount: 5200,
      permalink: 'https://soundcloud.com/mock/ambient1'
    },
    {
      id: 'ambient-2',
      title: 'Ocean Drift',
      artist: 'Atmospheric Sounds',
      album: 'Water Elements',
      duration: 280,
      audioUrl: 'https://example.com/ambient2.mp3',
      coverUrl: 'https://via.placeholder.com/400/06b6d4/ffffff?text=Ocean',
      genre: 'Ambient',
      playbackCount: 76000,
      likesCount: 4800,
      permalink: 'https://soundcloud.com/mock/ambient2'
    },
    {
      id: 'ambient-3',
      title: 'Forest Atmosphere',
      artist: 'Nature Sounds',
      album: 'Earth Tones',
      duration: 260,
      audioUrl: 'https://example.com/ambient3.mp3',
      coverUrl: 'https://via.placeholder.com/400/06b6d4/ffffff?text=Forest',
      genre: 'Ambient',
      playbackCount: 71000,
      likesCount: 4200,
      permalink: 'https://soundcloud.com/mock/ambient3'
    },
  ],
  'jazz': [
    {
      id: 'jazz-1',
      title: 'Smooth Jazz Evening',
      artist: 'Jazz Collective',
      album: 'Evening Moods',
      duration: 250,
      audioUrl: 'https://example.com/jazz1.mp3',
      coverUrl: 'https://via.placeholder.com/400/f59e0b/ffffff?text=Jazz',
      genre: 'Jazz',
      playbackCount: 102000,
      likesCount: 7100,
      permalink: 'https://soundcloud.com/mock/jazz1'
    },
    {
      id: 'jazz-2',
      title: 'Coffee Shop Vibes',
      artist: 'Cafe Jazz',
      album: 'Coffeehouse',
      duration: 230,
      audioUrl: 'https://example.com/jazz2.mp3',
      coverUrl: 'https://via.placeholder.com/400/f59e0b/ffffff?text=Cafe',
      genre: 'Jazz',
      playbackCount: 95000,
      likesCount: 6400,
      permalink: 'https://soundcloud.com/mock/jazz2'
    },
    {
      id: 'jazz-3',
      title: 'Bossa Nova Sunset',
      artist: 'Latin Jazz',
      album: 'Bossa Collection',
      duration: 215,
      audioUrl: 'https://example.com/jazz3.mp3',
      coverUrl: 'https://via.placeholder.com/400/f59e0b/ffffff?text=Bossa',
      genre: 'Jazz',
      playbackCount: 88000,
      likesCount: 5900,
      permalink: 'https://soundcloud.com/mock/jazz3'
    },
  ],
  'bass': [
    {
      id: 'bass-1',
      title: 'Deep Bass Focus',
      artist: 'BassBoost',
      album: 'Heavy Bass',
      duration: 190,
      audioUrl: 'https://example.com/bass1.mp3',
      coverUrl: 'https://via.placeholder.com/400/ef4444/ffffff?text=Bass',
      genre: 'Bass Boosted',
      playbackCount: 145000,
      likesCount: 9200,
      permalink: 'https://soundcloud.com/mock/bass1'
    },
    {
      id: 'bass-2',
      title: 'Sub Frequencies',
      artist: 'Low End Theory',
      album: 'Bass Collection',
      duration: 205,
      audioUrl: 'https://example.com/bass2.mp3',
      coverUrl: 'https://via.placeholder.com/400/ef4444/ffffff?text=Sub',
      genre: 'Bass Boosted',
      playbackCount: 128000,
      likesCount: 8100,
      permalink: 'https://soundcloud.com/mock/bass2'
    },
    {
      id: 'bass-3',
      title: 'Bass Drop Study',
      artist: 'Heavy Hitters',
      album: 'Study Bass',
      duration: 185,
      audioUrl: 'https://example.com/bass3.mp3',
      coverUrl: 'https://via.placeholder.com/400/ef4444/ffffff?text=Drop',
      genre: 'Bass Boosted',
      playbackCount: 115000,
      likesCount: 7300,
      permalink: 'https://soundcloud.com/mock/bass3'
    },
  ],
  'chill-trap': [
    {
      id: 'trap-1',
      title: 'Melodic Trap',
      artist: 'TrapBeats',
      album: 'Chill Trap Mix',
      duration: 175,
      audioUrl: 'https://example.com/trap1.mp3',
      coverUrl: 'https://via.placeholder.com/400/a855f7/ffffff?text=Trap',
      genre: 'Chill Trap',
      playbackCount: 167000,
      likesCount: 11200,
      permalink: 'https://soundcloud.com/mock/trap1'
    },
    {
      id: 'trap-2',
      title: 'Soft 808s',
      artist: 'Chill Producer',
      album: 'Trap Study',
      duration: 165,
      audioUrl: 'https://example.com/trap2.mp3',
      coverUrl: 'https://via.placeholder.com/400/a855f7/ffffff?text=808',
      genre: 'Chill Trap',
      playbackCount: 142000,
      likesCount: 9600,
      permalink: 'https://soundcloud.com/mock/trap2'
    },
    {
      id: 'trap-3',
      title: 'Ambient Trap',
      artist: 'Trap Vibes',
      album: 'Atmospheric Trap',
      duration: 180,
      audioUrl: 'https://example.com/trap3.mp3',
      coverUrl: 'https://via.placeholder.com/400/a855f7/ffffff?text=Ambient',
      genre: 'Chill Trap',
      playbackCount: 135000,
      likesCount: 8900,
      permalink: 'https://soundcloud.com/mock/trap3'
    },
  ],
};

/**
 * Get mock playlist by genre
 * @param {string} genre - Genre ID
 * @returns {Array} Mock track data
 */
export const getMockPlaylistByGenre = (genre) => {
  const playlist = MOCK_PLAYLISTS[genre] || MOCK_PLAYLISTS['lofi'];
  console.log(`📀 Using mock data for genre: ${genre}`);
  return playlist;
};

export default MOCK_PLAYLISTS;
