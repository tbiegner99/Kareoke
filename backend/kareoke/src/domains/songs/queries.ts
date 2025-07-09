import { Song } from './models';

// Base queries without limit placeholders
const INSERT_TITLES_QUERY = `INSERT INTO titles (title, artist) 
    VALUES ($1, $2) 
    ON CONFLICT (title, artist) DO NOTHING`;

const INSERT_SONGS_QUERY = `INSERT INTO songs (title, artist, source, filename) 
    VALUES ($1, $2, $3, $4) 
    RETURNING song_id`;

// Predefined update queries for common operations
const UPDATE_SONG_TITLE_QUERY = `UPDATE songs 
    SET title = $2, updated_at = NOW() 
    WHERE song_id = $1 
    RETURNING *`;

const UPDATE_SONG_ARTIST_QUERY = `UPDATE songs 
    SET artist = $2, updated_at = NOW() 
    WHERE song_id = $1 
    RETURNING *`;

const UPDATE_SONG_SOURCE_QUERY = `UPDATE songs 
    SET source = $2, updated_at = NOW() 
    WHERE song_id = $1 
    RETURNING *`;

const UPDATE_SONG_FILENAME_QUERY = `UPDATE songs 
    SET filename = $2, updated_at = NOW() 
    WHERE song_id = $1 
    RETURNING *`;

const UPDATE_SONG_MULTIPLE_QUERY = `UPDATE songs 
    SET title = COALESCE($2, title),
        artist = COALESCE($3, artist),
        source = COALESCE($4, source),
        filename = COALESCE($5, filename),
        updated_at = NOW()
    WHERE song_id = $1 
    RETURNING *`;

const SELECT_BY_ID_QUERY = `SELECT *, 'song' as resultType 
    FROM songs 
    WHERE song_id = $1
    LIMIT 1`;

const SELECT_ALL_SONGS = `SELECT *, 'song' as resultType 
    FROM songs 
    ORDER BY title, artist
    LIMIT $1
    OFFSET $2`;

const DELETE_QUERY = `DELETE FROM songs 
    WHERE song_id = $1`;

const SEARCH_ARTISTS_QUERY = `SELECT artist, COUNT(*) as count, 'artist' as resultType 
    FROM songs 
    WHERE artist ILIKE $1 || '%' 
    GROUP BY artist 
    ORDER BY artist
    LIMIT $2
    OFFSET $3`;

const SEARCH_TITLES_QUERY = `SELECT title, COUNT(*) as count, 'title' as resultType 
    FROM songs 
    WHERE title ILIKE $1 || '%' 
    GROUP BY title 
    ORDER BY title
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_ARTIST_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND s.artist ILIKE $1 || '%' 
    ORDER BY s.artist, s.title
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_TITLE_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND s.title ILIKE $1 || '%' 
    ORDER BY s.title, s.artist
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_TEXT_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND (s.title ILIKE $1 || '%' OR s.artist ILIKE $1 || '%')
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_ARTIST_EXACT_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND s.artist = $1 
    ORDER BY s.title
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_TITLE_EXACT_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.title = $1 
    ORDER BY s.artist
    LIMIT $2
    OFFSET $3`;

const SEARCH_SONG_BY_TEXT_EXACT_QUERY = `SELECT s.*, 'song' as resultType 
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND (s.title = $1 OR s.artist = $1)
    LIMIT $2
    OFFSET $3`;

const UPDATE_PLAY_COUNT_QUERY = `UPDATE songs 
    SET plays = plays + 1, last_played = NOW() 
    WHERE song_id = $1`;

const SEARCH_SONG_BY_ARTIST_COUNT_QUERY = `SELECT COUNT(*) as count
    FROM songs s
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title
    WHERE s.duration> 0 AND s.artist ILIKE $1 || '%'`;

const SEARCH_SONG_BY_TITLE_COUNT_QUERY = `SELECT COUNT(*) as count
    FROM songs s
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title
    WHERE s.duration> 0 AND s.title ILIKE $1 || '%'`;

const SEARCH_SONG_BY_TEXT_COUNT_QUERY = `SELECT COUNT(*) as count
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND (s.title ILIKE $1 || '%' OR s.artist ILIKE $1 || '%')
   `;

const SEARCH_SONG_BY_ARTIST_EXACT_COUNT_QUERY = `SELECT COUNT(*) as count,
    FROM songs s 
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title 
    WHERE s.duration> 0 AND s.artist = $1`;

const SEARCH_SONG_BY_TITLE_EXACT_COUNT_QUERY = `SELECT COUNT(*) as count
    FROM songs s
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title
    WHERE s.title = $1`;

const SEARCH_SONG_BY_TEXT_EXACT_COUNT_QUERY = `SELECT COUNT(*) as count
    FROM songs s
    INNER JOIN titles t ON t.artist = s.artist AND s.title = t.title
    WHERE s.duration> 0 AND (s.title = $1 OR s.artist = $1)`;

const queries = {
    INSERT_TITLES_QUERY,
    INSERT_SONGS_QUERY,

    UPDATE_SONG_TITLE_QUERY,
    UPDATE_SONG_ARTIST_QUERY,
    UPDATE_SONG_SOURCE_QUERY,
    UPDATE_SONG_FILENAME_QUERY,
    UPDATE_SONG_MULTIPLE_QUERY,
    SELECT_BY_ID_QUERY,
    SELECT_ALL_SONGS,
    DELETE_QUERY,
    SEARCH_TITLES_QUERY,
    SEARCH_ARTISTS_QUERY,
    SEARCH_SONG_BY_ARTIST_QUERY,
    SEARCH_SONG_BY_TITLE_QUERY,
    SEARCH_SONG_BY_TEXT_QUERY,
    SEARCH_SONG_BY_ARTIST_EXACT_QUERY,
    SEARCH_SONG_BY_TITLE_EXACT_QUERY,
    SEARCH_SONG_BY_TEXT_EXACT_QUERY,
    UPDATE_PLAY_COUNT_QUERY,
    SEARCH_SONG_BY_ARTIST_COUNT_QUERY,
    SEARCH_SONG_BY_TITLE_COUNT_QUERY,
    SEARCH_SONG_BY_TEXT_COUNT_QUERY,
    SEARCH_SONG_BY_ARTIST_EXACT_COUNT_QUERY,
    SEARCH_SONG_BY_TITLE_EXACT_COUNT_QUERY,
    SEARCH_SONG_BY_TEXT_EXACT_COUNT_QUERY,
};

export { queries as songsQueries };
