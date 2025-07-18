import { PlaylistItem } from './models';

class PlaylistMapper {
  /**
   * Convert a backend playlist item object to a PlaylistItem model
   */
  toPlaylistItem(item: any): PlaylistItem {
    return {
      position: Number(item.position),
      songId: item.songId || item.song_id,
      title: item.title,
      artist: item.artist,
      source: item.source,
      filename: item.filename,
      duration: item.duration ? Math.round(Number(item.duration)) : 0, // Ensure duration is a number
    };
  }

  /**
   * Convert an array of backend playlist items to PlaylistItem[]
   */
  toPlaylistItems(items: any[]): PlaylistItem[] {
    return items.map(item => this.toPlaylistItem(item));
  }
}

export const playlistMapper = new PlaylistMapper();
