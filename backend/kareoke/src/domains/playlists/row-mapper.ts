import { PlaylistItem, Song } from './models.js';

class PlaylistRowMapper {
    fromPlaylistItemRow(item: any): PlaylistItem {
        return {
            position: Number(item.position),
            songId: item.song_id,
            title: item.title,
            artist: item.artist,
            source: item.source,
            filename: item.filename,
            duration: item.duration ? Number(item.duration) : 0, // Ensure duration is a number
        };
    }

    toInsertParams(song: Song): Song {
        return {
            title: song.title,
            artist: song.artist,
            source: song.source,
        };
    }

    toUpdateParams(): Record<string, never> {
        return {};
    }
}

const playlistRowMapper = new PlaylistRowMapper();
export { playlistRowMapper };
