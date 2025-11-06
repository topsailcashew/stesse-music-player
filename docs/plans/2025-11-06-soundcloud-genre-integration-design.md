# SoundCloud Genre Integration Design

**Date:** 2025-11-06
**Status:** Approved

## Goal

Transform the existing music player into a fully dynamic, SoundCloud-powered study/work music player with genre selection and professional UI polish.

## Requirements Summary

- **Genre Selection**: Modal-based UI to choose from 6 study/work music genres
- **Dynamic Content**: All playlists and track data fetched from SoundCloud API (no hardcoded playlists)
- **Minimal UI**: Maintain clean, minimal design with smooth animations
- **Genres**: Lo-Fi Hip Hop, Classical/Piano, Ambient/Electronic, Jazz/Smooth Jazz, Bass Boosted, Chill Trap
- **API Setup**: Temporary mock data during development until SoundCloud API key is obtained

---

## Architecture Overview

### Four-Layer Architecture

**1. Data Layer (React Query)**
- Handles all SoundCloud API calls with automatic caching
- Implements stale-while-revalidate patterns
- Playlists cached by genre (30-minute cache, 10-minute stale time)
- Automatic background refetching on window focus
- Built-in retry logic (2 attempts on failure)

**2. State Layer (Context API)**
- `MusicPlayerContext` manages global player state:
  - Current track and playlist
  - Playing status (playing, paused, loading)
  - Selected genre
  - Volume and mute state
  - Shuffle and repeat modes
- Eliminates prop drilling
- Provides actions to all components via `useMusicPlayer()` hook

**3. Service Layer**
- `soundcloudService.js` contains all API logic
- Genre-specific search strategies
- Track filtering and deduplication
- Temporary mock data fallback

**4. Component Layer**
- React components consume Context and React Query hooks
- New: GenreModal, GenreButton
- Modified: Player (now uses Context + React Query)
- Existing: PlayerDetails, PlayerControls, Seeker (consume Context instead of props)

### Key Benefits
- Automatic loading/error states
- Intelligent caching reduces API calls
- Optimistic updates for better UX
- Easy to test with mock data
- Professional-grade data management

---

## Component Structure

### New Components

#### GenreModal (`src/components/GenreModal.js`)
**Purpose**: Modal overlay for genre selection

**Features**:
- Grid layout of genre cards (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each card shows: icon, genre name, brief description
- Click genre → updates Context → triggers React Query refetch
- Close via X button or clicking backdrop
- Smooth animations: fade-in backdrop, scale-up modal

**Props**: None (uses Context)

#### GenreButton (`src/components/GenreButton.js`)
**Purpose**: Floating button to open genre selector

**Features**:
- Fixed position bottom-right corner (top-right on mobile)
- Settings/filter icon
- Shows current genre in tooltip on hover
- Pulse animation on first load to draw attention
- Opens GenreModal on click

**Props**: None (uses Context)

### Modified Components

#### Player (`src/components/Player.js`)
**Changes**:
- Wraps children with `QueryClientProvider` and `MusicPlayerProvider`
- Uses `useQuery` to fetch playlist based on selected genre
- No longer manages playlist state directly (moved to Context)
- Passes data through Context instead of props

#### PlayerDetails, PlayerControls, Seeker
**Changes**:
- Now consume `useMusicPlayer()` hook instead of receiving props
- Access current track, playback state, control functions from Context
- Otherwise unchanged (same UI and behavior)

### Data Flow

```
1. User clicks GenreButton
   → Opens GenreModal

2. User selects "Lo-Fi Hip Hop"
   → Context updates selectedGenre state

3. React Query detects genre change
   → Triggers new SoundCloud API query

4. Query returns playlist
   → React Query caches results
   → Components update automatically

5. Player components re-render with new tracks
   → Music plays seamlessly
```

**Benefits**: Genre switching is instant on cache hits. Loading states are automatic. Background refetching keeps playlists fresh.

---

## SoundCloud API Integration

### Genre-to-Query Mapping

Each genre maps to multiple search queries for variety and quality:

```javascript
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
```

### Service Implementation (`src/services/soundcloudService.js`)

**Main Function**: `fetchPlaylistByGenre(genre, clientId)`

**Process**:
1. Execute parallel searches for each genre's query terms
2. Fetch top 20 tracks per query
3. Filter out tracks with unavailable streams (`stream_url` null or 403 errors)
4. Sort by play count (popularity)
5. Deduplicate by track ID
6. Return top 50 unique tracks

**Track Object Format**:
```javascript
{
  id: string,
  title: string,
  artist: string,
  album: string,
  duration: number, // seconds
  audioUrl: string, // streamable URL
  coverUrl: string, // album art
  genre: string,
  playbackCount: number,
  likesCount: number,
  permalink: string
}
```

### Temporary Mock Data

**Location**: `src/data/mockPlaylists.js`

**Behavior**:
- Service detects missing `REACT_APP_SOUNDCLOUD_CLIENT_ID`
- Returns genre-specific mock data (10-15 tracks per genre)
- Clear `// TODO: Remove after SoundCloud API configured` comments

**Purpose**: Allows development and testing before API key is obtained

### React Query Configuration

```javascript
{
  cacheTime: 30 * 60 * 1000,      // 30 minutes
  staleTime: 10 * 60 * 1000,      // 10 minutes
  retry: 2,                        // 2 retry attempts
  refetchOnWindowFocus: true,      // Keep fresh
  refetchOnReconnect: true
}
```

---

## Animations & UI Polish

### Modal Animations

**Entry**:
- Backdrop: Fade 0→0.5 opacity (200ms)
- Modal: Scale 0.9→1.0 + fade 0→1 opacity (300ms, spring easing)

**Exit**:
- Reverse animation (300ms)

**Genre Cards**:
- Hover: Scale to 1.05 with shadow increase (150ms ease-out)
- Active: Slight press effect (scale 0.98)

### Track Transition Animations

**Album Art**:
- Crossfade between images (500ms) to avoid jarring switches
- Rotating animation continues during track changes

**Track Info**:
- Old info slides out left (200ms)
- New info slides in right (200ms with 150ms delay)

**Progress Bar**:
- Smooth reset with CSS transition instead of instant jump

### Loading States

React Query states trigger appropriate UI:

**`isLoading`** (initial load):
- Skeleton UI with pulsing placeholders
- Placeholder album art (grey circle)
- Placeholder track info (grey bars)

**`isFetching`** (background refetch):
- Small spinner icon in GenreButton
- Doesn't block playback or interaction

**`isError`**:
- Error message with retry button
- Falls back to cached data if available

**Empty State**:
- "No tracks found for this genre" message
- Suggestion to try different genre

### Responsive Design Breakpoints

**Desktop (>768px)**:
- GenreModal: 3-column grid of genre cards
- GenreButton: Bottom-right corner (24px from edges)
- Full-width player controls

**Tablet (768px-480px)**:
- GenreModal: 2-column grid
- Larger touch targets (48px minimum)
- Same layout otherwise

**Mobile (<480px)**:
- GenreModal: Single column, full-screen
- GenreButton: Top-right to avoid control conflicts
- Stacked player controls if needed

### Accessibility

- **Keyboard Navigation**: Tab through all interactive elements, Enter to select
- **ARIA Labels**: Screen reader descriptions for all buttons and controls
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Motion**: Respect `prefers-reduced-motion` for animations

---

## Error Handling & Edge Cases

### SoundCloud API Errors

**No API Key**:
- Display "Configure SoundCloud API" message in modal
- Show link to setup instructions
- Fall back to mock data automatically

**Rate Limit Exceeded**:
- Toast notification: "Too many requests, please wait"
- Show countdown timer until retry available
- Use cached data if available

**Network Errors**:
- "Connection lost" banner at top
- Background retry every 30 seconds
- Visual indicator of offline state

**Invalid Tracks**:
- Service filters out tracks where `stream_url` is null or returns 403
- Prevents playback failures before reaching UI

### Playback Errors

**Audio Load Failure**:
- Auto-skip to next track after 5-second timeout
- Log error to console for debugging
- Show brief toast notification

**Streaming Interruption**:
- Display "Buffering..." indicator
- Attempt resume 3 times before skipping
- Track retry count to avoid infinite loops

**Invalid Audio URL**:
- Remove track from current queue
- Show toast: "Track unavailable"
- Continue to next track automatically

### Empty States

**No Tracks in Genre**:
- Message: "No tracks found for [genre]"
- Suggestion: "Try a different genre or check your API configuration"

**Search Returns Nothing**:
- Automatic fallback to broader search terms
- Example: "Lo-Fi Hip Hop" → "lofi beats"
- Log warning if all fallbacks exhausted

### Context Safety

**Missing Provider**:
- `useMusicPlayer()` hook throws descriptive error if used outside `MusicPlayerProvider`
- Helps catch integration errors during development

### Persistence Recovery

**Corrupted localStorage**:
- Try to parse stored state
- If JSON parse fails, reset to defaults
- Log warning to console
- Gracefully handle outdated state formats

---

## Testing Strategy

### Unit Tests

**soundcloudService.js**:
- Mock `fetch` calls with MSW (Mock Service Worker)
- Verify genre query mapping correct
- Test deduplication logic removes duplicate track IDs
- Validate track filtering (invalid URLs removed)
- Test error handling (network failures, invalid responses)

**useMusicPlayer hook**:
- Test play/pause/skip functions
- Verify audio event handlers (timeupdate, ended, error)
- Check volume and mute controls
- Test playback rate adjustments

**usePlaylist hook**:
- Test shuffle algorithm maintains current track position
- Verify repeat modes (off, all, one) work correctly
- Test next/previous track logic

**MusicPlayerContext**:
- Test state updates propagate to consumers
- Verify actions dispatch correctly
- Test Context with multiple consumers

### Integration Tests

**Genre Switching Flow**:
1. Select genre from modal
2. Verify correct API call made with proper search terms
3. Playlist updates in Context
4. First track loads and is ready to play

**Playback Continuation**:
- Switch genres mid-playback
- Verify current track finishes or new playlist starts
- Check state consistency throughout switch

**Cache Behavior**:
1. Select genre A (API call)
2. Switch to genre B (API call)
3. Return to genre A (no API call, uses cache)
4. Verify cached data is fresh and correct

### Component Tests (React Testing Library)

**GenreModal**:
- Renders all 6 genre options
- Clicking genre updates Context
- Close button dismisses modal
- Clicking backdrop dismisses modal
- Keyboard navigation works (Tab, Enter, Escape)

**Player**:
- Displays loading skeleton while fetching
- Renders track info when data loaded
- Shows error message on API failure
- Handles empty playlist gracefully

**PlayerControls**:
- Play button toggles playback state
- Skip buttons change current track
- Controls disabled during loading
- Keyboard shortcuts work (Space, Arrow keys)

### Manual Testing Checklist

- [ ] Verify animations smooth on low-end devices (throttle CPU in DevTools)
- [ ] Test with actual SoundCloud API after key obtained
- [ ] Confirm responsive layout on mobile/tablet/desktop (DevTools + real devices)
- [ ] Check keyboard navigation through all interactive elements
- [ ] Validate localStorage persistence across browser sessions
- [ ] Test error recovery (disconnect network, then reconnect)
- [ ] Verify genre switching doesn't cause memory leaks (long session testing)
- [ ] Confirm audio playback works across browsers (Chrome, Firefox, Safari, Edge)

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing (user-centric)
- **MSW (Mock Service Worker)**: API mocking
- **React Hooks Testing Library**: Isolated hook testing

---

## Implementation Notes

### Dependencies to Add

```json
{
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-query-devtools": "^5.0.0"
}
```

### Environment Variables

```bash
REACT_APP_SOUNDCLOUD_CLIENT_ID=your_client_id_here
```

**How to obtain**:
1. Register at https://soundcloud.com/you/apps
2. Create new app
3. Copy client ID
4. Add to `.env` file

### File Structure

```
src/
├── components/
│   ├── GenreModal.js          [NEW]
│   ├── GenreButton.js         [NEW]
│   ├── Player.js              [MODIFIED]
│   ├── PlayerDetails.js       [MODIFIED - use Context]
│   ├── PlayerControls.js      [MODIFIED - use Context]
│   └── Seeker.js              [MODIFIED - use Context]
├── context/
│   └── MusicPlayerContext.js  [NEW]
├── services/
│   └── soundcloudService.js   [MODIFIED]
├── data/
│   └── mockPlaylists.js       [NEW - temporary]
└── hooks/
    ├── useAudioPlayer.js      [EXISTING]
    └── usePlaylist.js         [EXISTING]
```

### Migration Strategy

1. Install React Query
2. Create Context and Provider
3. Build new components (GenreModal, GenreButton)
4. Enhance soundcloudService with genre queries
5. Wrap app with providers
6. Migrate existing components to use Context
7. Test with mock data
8. Obtain SoundCloud API key
9. Test with real API
10. Remove mock data fallback

---

## Success Criteria

- [ ] User can select from 6 different study/work music genres
- [ ] All playlists are fetched dynamically from SoundCloud API
- [ ] Genre switching is smooth with appropriate loading states
- [ ] Animations are polished and professional
- [ ] UI remains minimal and clean
- [ ] Player works on mobile, tablet, and desktop
- [ ] Error states are handled gracefully
- [ ] Cache reduces unnecessary API calls
- [ ] Tests provide confidence in implementation

---

## Future Enhancements (Out of Scope)

- User-created playlists and favorites
- Advanced search within genres
- Social features (share playlists, follow artists)
- Offline playback with service workers
- Analytics and listening history
- Custom genre creation
