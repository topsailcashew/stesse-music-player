import { useState, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * Automatically saves and loads state from localStorage
 */
const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        setStoredValue((currentValue) => {
          const valueToStore =
            value instanceof Function ? value(currentValue) : value;

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }

          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook specifically for persisting player state
 */
export const usePlayerPersistence = () => {
  const [savedState, setSavedState, clearSavedState] = useLocalStorage('stesse_player_state', {
    currentTrackId: null,
    currentTime: 0,
    volume: 0.7,
    isShuffled: false,
    repeatMode: 'off',
  });

  // Save current playing state
  const savePlayerState = useCallback(
    (state) => {
      setSavedState({
        currentTrackId: state.currentTrackId || null,
        currentTime: state.currentTime || 0,
        volume: state.volume !== undefined ? state.volume : 0.7,
        isShuffled: state.isShuffled || false,
        repeatMode: state.repeatMode || 'off',
      });
    },
    [setSavedState]
  );

  // Load saved state
  const loadPlayerState = useCallback(() => {
    return savedState;
  }, [savedState]);

  // Clear saved state
  const clearPlayerState = useCallback(() => {
    clearSavedState();
  }, [clearSavedState]);

  return {
    savedState,
    savePlayerState,
    loadPlayerState,
    clearPlayerState,
  };
};

export default useLocalStorage;
