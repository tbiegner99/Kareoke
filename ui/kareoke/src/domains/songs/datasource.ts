import axios from 'axios';

import {
  API_ENDPOINTS,
  API_BASE_CONFIG,
  getApiBaseUrl,
} from '../../config/api.config';
import { Song } from './models';
import { PageInfo } from '../../models/PageInfo';
import { AxiosInstance } from 'axios';
import { SongMapper } from './mapper';
import { SearchResult } from 'models/SearchResult';

// Interface for backend search requests (different from UI search)
interface BackendSearchRequest {
  query: string;
  searchMode: 'title' | 'artist' | 'text' | 'id';
  exact?: boolean;
  resultType?: 'short' | 'full';
}

export class SongDatasource {
  private client: AxiosInstance;
  private mapper: SongMapper;

  constructor(baseUrl?: string) {
    const apiBaseUrl = baseUrl || getApiBaseUrl();
    this.mapper = new SongMapper();

    this.client = axios.create({
      baseURL: apiBaseUrl,
      timeout: API_BASE_CONFIG.TIMEOUT,
      headers: {
        ...API_BASE_CONFIG.DEFAULT_HEADERS,
      },
    });
  }

  /**
   * Get a single song by ID
   */
  async getSongById(id: string): Promise<Song> {
    try {
      const response = await this.client.get(API_ENDPOINTS.SONGS.BY_ID(id));
      return this.mapper.toSong(response.data);
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
      return this.mapper.toSong(response.data);
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
      return this.mapper.toSong(response.data);
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
  async searchSongs(
    query: string,
    pageInfo: PageInfo
  ): Promise<SearchResult<Song>> {
    try {
      const backendRequest: BackendSearchRequest = {
        query: query || '',
        searchMode: 'text',
        exact: false,
        resultType: 'full',
      };

      const response = await this.client.post(
        API_ENDPOINTS.SONGS.SEARCH,
        backendRequest,
        {
          params: {
            page: pageInfo.page || 1,
            limit: pageInfo.pageSize || 20,
          },
        }
      );

      return {
        results: this.mapper.toSongs(response.data?.results || []),
        itemCount: response.data?.total || 0,
        page: pageInfo.page || 1,
        pageSize: pageInfo.pageSize || 20,
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
