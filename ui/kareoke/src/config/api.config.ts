/**
 * API Configuration for Karaoke Application
 *
 * This file centralizes all API endpoint definitions and configuration.
 * It provides environment-specific URL management and timeout settings.
 */

// Base API configuration
export const API_BASE_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API endpoint definitions
export const API_ENDPOINTS = {
  // Songs endpoints
  SONGS: {
    BASE: '/songs',
    BY_ID: (id: string) => `/songs/${id}`,
    SEARCH: '/songs/search',
    POPULAR: '/songs/popular',
    BY_GENRE: (genre: string) => `/songs?genre=${encodeURIComponent(genre)}`,
    BY_ARTIST: (artist: string) =>
      `/songs?artist=${encodeURIComponent(artist)}`,
    UPDATE_PLAY_COUNT: (id: string) => `/songs/${id}/playCount`,
  },

  // Playlists endpoints
  PLAYLISTS: {
    BASE: '/playlists',
    BY_ID: (id: string) => `/playlists/${id}`,
    BY_USER: (userId: string) => `/playlists?userId=${userId}`,
    SONGS: (playlistId: string) => `/playlists/${playlistId}/songs`,
    ADD_SONG: (playlistId: string, songId: string) =>
      `/playlists/${playlistId}/songs/${songId}`,
  },

  // Users endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
  },

  // Health check
  HEALTH: '/health',
};

// Environment-specific base URL configuration
export const getApiBaseUrl = (): string => {
  const env = process.env.NODE_ENV;
  const envApiUrl = process.env.REACT_APP_API_BASE_URL;

  switch (env) {
    case 'development':
      return envApiUrl || 'http://localhost:3000/api/kareoke';
    case 'test':
      return envApiUrl || 'http://localhost:3001/api/kareoke';
    case 'production':
      return envApiUrl || '/api/kareoke';
    default:
      return envApiUrl || '/api/kareoke';
  }
};
