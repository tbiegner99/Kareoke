import axios from 'axios';
import { PlaylistItem } from './models';
import { playlistMapper } from './mapper';
import { API_BASE_CONFIG, getApiBaseUrl } from '../../config/api.config';
import { EnqueueRequest } from './models';
import { AxiosInstance } from 'axios';

export class PlaylistDatasource {
  private client: AxiosInstance;

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
   * Get all items in a playlist
   */
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const response = await this.client.get(`/playlist/${playlistId}/items`);
    return playlistMapper.toPlaylistItems(response.data);
  }

  async clearCurrentPlaying(roomId: string): Promise<void> {
    await this.client.delete(`/playlist/${roomId}/current`);
  }

  /**
   * Get the currently playing item in a playlist
   */
  async getCurrentlyPlaying(roomId: string): Promise<PlaylistItem | null> {
    const response = await this.client.get(`/playlist/${roomId}/current`);
    return response.data ? playlistMapper.toPlaylistItem(response.data) : null;
  }

  /**
   * Set the currently playing item in a playlist
   */
  async setCurrentPlaying(roomId: string, songId: string): Promise<void> {
    await this.client.put(`/playlist/${roomId}/current`, { songId });
  }

  /**
   * Clear all items from a playlist
   */
  async clearPlaylist(playlistId: string): Promise<void> {
    await this.client.delete(`/playlist/${playlistId}/items`);
  }

  /**
   * Enqueue (add) an item to the playlist
   */
  async enqueueItem(
    playlistId: string,
    item: EnqueueRequest
  ): Promise<PlaylistItem[]> {
    const response = await this.client.post(
      `/playlist/${playlistId}/items`,
      item
    );
    return playlistMapper.toPlaylistItems(response.data);
  }

  /**
   * Dequeue (remove the first item) from the playlist
   */
  async dequeue(playlistId: string): Promise<PlaylistItem | null> {
    const response = await this.client.delete(
      `/playlist/${playlistId}/items/dequeue`
    );
    return response.data ? playlistMapper.toPlaylistItem(response.data) : null;
  }

  /**
   * Peek at the next item in the playlist
   */
  async peek(playlistId: string): Promise<PlaylistItem | null> {
    const response = await this.client.get(
      `/playlist/${playlistId}/items/peek`
    );
    return response.data ? playlistMapper.toPlaylistItem(response.data) : null;
  }

  /**
   * Move an item to a new position in the playlist
   */
  async moveItem(
    playlistId: string,
    position: number,
    newPosition: number
  ): Promise<PlaylistItem[]> {
    const response = await this.client.put(
      `/playlist/${playlistId}/items/${position}`,
      { method: 'newPosition', newPosition }
    );
    return playlistMapper.toPlaylistItems(response.data);
  }

  /**
   * Remove an item by position from the playlist
   */
  async removePlaylistItem(
    playlistId: string,
    position: number
  ): Promise<void> {
    await this.client.delete(`/playlist/${playlistId}/items/${position}`);
  }
}
