import axios from 'axios';

import {
  API_ENDPOINTS,
  API_BASE_CONFIG,
  getApiBaseUrl,
} from '../../config/api.config';
import { Song } from './models';

// Interface for API search requests
interface SongSearchApiRequest {
  query?: string;
  genre?: string;
  artist?: string;
  year?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

// Interface for backend search requests (different from UI search)
interface BackendSearchRequest {
  query: string;
  searchMode: 'title' | 'artist' | 'text' | 'id';
  exact?: boolean;
  resultType?: 'short' | 'full';
}

export class SongDatasource {
  private client: any; // axios instance

  constructor(baseUrl?: string) {
    const apiBaseUrl = baseUrl || getApiBaseUrl();

    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: API_BASE_CONFIG.TIMEOUT,
      headers: {
        ...API_BASE_CONFIG.DEFAULT_HEADERS,
      },
    });
  }

  /**
   * Get all songs with optional filtering and pagination
   * Note: Backend doesn't support pagination yet, so we handle filtering client-side
   */
  async getSongs(params: SongSearchApiRequest = {}): Promise<any> {
    try {
      // If we have search parameters, use the search endpoint
      if (params.query || params.artist || params.genre) {
        return this.searchSongs(params);
      }

      // Otherwise get all songs
      const response = await this.client.get(API_ENDPOINTS.SONGS.BASE);

      // Simulate pagination response structure for frontend compatibility
      const songs = response.data;
      const startIndex = ((params.page || 1) - 1) * (params.pageSize || 20);
      const endIndex = startIndex + (params.pageSize || 20);
      const paginatedSongs = songs.slice(startIndex, endIndex);

      return {
        songs: paginatedSongs,
        total: songs.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch songs: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Get a single song by ID
   */
  async getSongById(id: string): Promise<Song> {
    try {
      const response = await this.client.get(API_ENDPOINTS.SONGS.BY_ID(id));
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch song: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Create a new song
   */
  async createSong(songData: Song): Promise<Song> {
    try {
      const response = await this.client.post(
        API_ENDPOINTS.SONGS.BASE,
        songData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to create song: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Update an existing song
   */
  async updateSong(songData: Song): Promise<Song> {
    try {
      const response = await this.client.put(
        API_ENDPOINTS.SONGS.BY_ID(songData.id),
        songData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to update song: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Delete a song
   */
  async deleteSong(id: string): Promise<void> {
    try {
      await this.client.delete(API_ENDPOINTS.SONGS.BY_ID(id));
    } catch (error: any) {
      throw new Error(
        `Failed to delete song: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Search songs with advanced filtering
   */
  async searchSongs(searchRequest: SongSearchApiRequest): Promise<any> {
    try {
      const backendRequest: BackendSearchRequest = {
        query: searchRequest.query || '',
        searchMode: searchRequest.artist ? 'artist' : 'text',
        exact: false,
        resultType: 'full',
      };

      const response = await this.client.post(
        API_ENDPOINTS.SONGS.SEARCH,
        backendRequest
      );

      // Transform backend response to match expected format
      const songs = response.data;
      const page = searchRequest.page || 1;
      const pageSize = searchRequest.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSongs = songs.slice(startIndex, endIndex);

      return {
        songs: paginatedSongs,
        total: songs.length,
        page: page,
        pageSize: pageSize,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to search songs: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }

  /**
   * Get songs by artist
   */
  async getSongsByArtist(
    artist: string,
    page = 1,
    pageSize = 20
  ): Promise<any> {
    return this.searchSongs({ artist, page, pageSize });
  }

  /**
   * Update play count for a song
   */
  async updatePlayCount(id: string): Promise<void> {
    try {
      await this.client.put(API_ENDPOINTS.SONGS.UPDATE_PLAY_COUNT(id));
    } catch (error: any) {
      throw new Error(
        `Failed to update play count: ${error.response?.status || 'Unknown error'} ${
          error.response?.statusText || error.message
        }`
      );
    }
  }
}
