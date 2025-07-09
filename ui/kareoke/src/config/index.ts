// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api',
  ENDPOINTS: {
    SONGS: '/songs',
    PLAYLISTS: '/playlists',
    USERS: '/users',
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Environment-specific configurations
export const getApiBaseUrl = (): string => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'development':
      return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
    case 'test':
      return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
    case 'production':
      return process.env.REACT_APP_API_BASE_URL || '/api';
    default:
      return '/api';
  }
};

// Feature flags
export const FEATURES = {
  ENABLE_REAL_API: process.env.REACT_APP_ENABLE_REAL_API === 'true',
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA !== 'false',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
};

// App configuration
export const APP_CONFIG = {
  NAME: 'Karaoke App',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SEARCH_DEBOUNCE_MS: 300,
};
