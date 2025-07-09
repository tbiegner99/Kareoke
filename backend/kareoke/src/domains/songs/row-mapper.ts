import { Song, Artist, Title, SearchResult, SongInsertParams, ResultType } from './models';

class SongsRowMapper {
    fromSongResult(song: any): Song {
        return {
            id: song.song_id,
            title: song.title,
            artist: song.artist,
            resultType: (song.resultType as ResultType) || ResultType.SONG,
            source: song.source,
            filename: song.filename,
            plays: song.plays,
            lastPlay: song.last_played ? new Date(song.last_played) : null,
            duration: song.duration || 0,
        };
    }

    fromArtistRow(artist: any): Artist {
        return {
            artist: artist.artist,
            count: artist.count,
            resultType: ResultType.ARTIST,
        };
    }

    fromTitleRow(title: any): Title {
        return {
            title: title.title,
            count: title.count,
            resultType: ResultType.TITLE,
        };
    }

    toInsertParams(song: Song): SongInsertParams {
        return {
            title: song.title,
            artist: song.artist,
            source: song.source,
            filename: song.filename,
        };
    }
}

const songsRowMapper = new SongsRowMapper();
export { songsRowMapper };
