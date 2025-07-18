import { PlaylistDatasource } from './datasource';
import { PlaylistItem, EnqueueRequest } from './models';

export class PlaylistService {
  private datasource: PlaylistDatasource;

  constructor(datasource: PlaylistDatasource) {
    this.datasource = datasource;
  }

  clearCurrentPlaying(roomId: string): Promise<void> {
    return this.datasource.clearCurrentPlaying(roomId);
  }

  setCurrentPlaying(roomId: string, songId: string): Promise<void> {
    return this.datasource.setCurrentPlaying(roomId, songId);
  }

  getCurrentlyPlaying(roomId: string): Promise<PlaylistItem | null> {
    return this.datasource.getCurrentlyPlaying(roomId);
  }

  getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return this.datasource.getPlaylistItems(playlistId);
  }

  clearPlaylist(playlistId: string): Promise<void> {
    return this.datasource.clearPlaylist(playlistId);
  }

  enqueueItem(
    playlistId: string,
    item: EnqueueRequest
  ): Promise<PlaylistItem[]> {
    return this.datasource.enqueueItem(playlistId, item);
  }

  dequeue(playlistId: string): Promise<PlaylistItem | null> {
    return this.datasource.dequeue(playlistId);
  }

  peek(playlistId: string): Promise<PlaylistItem | null> {
    return this.datasource.peek(playlistId);
  }

  moveItem(
    playlistId: string,
    position: number,
    newPosition: number
  ): Promise<PlaylistItem[]> {
    return this.datasource.moveItem(playlistId, position, newPosition);
  }

  removePlaylistItem(playlistId: string, position: number): Promise<void> {
    return this.datasource.removePlaylistItem(playlistId, position);
  }
}
