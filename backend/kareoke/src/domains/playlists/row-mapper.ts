import { PlaylistItem, Song, PlaylistItemRow } from './models.js';

class PlaylistRowMapper {
    fromPlaylistItemRow(item: PlaylistItemRow): PlaylistItem {
        return {
            position: Number(item.position),
            songId: item.song_id,
            title: item.title,
            artist: item.artist,
            source: item.source,
            filename: item.filename,
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
