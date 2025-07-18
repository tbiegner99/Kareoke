const SELECT_ALL_PLAYLIST_ITEMS = `SELECT p.position, s.song_id, s.artist, s.title, s.source, s.filename,s.duration
    FROM playlist_items p
    INNER JOIN songs s ON s.song_id = p.song_id 
    WHERE p.playlist_id = $1 
    ORDER BY p.position::DECIMAL`;

const SELECT_MOVE_UP_ITEM_AFTER = `SELECT * FROM playlist_items 
    WHERE playlist_id = $1 AND position::DECIMAL < $2 
    ORDER BY position::DECIMAL DESC 
    LIMIT 1 OFFSET 1`;

const CLEAR_PLAYLIST = `DELETE FROM playlist_items WHERE playlist_id = $1`;

const SELECT_TOP_N_PLAYLIST_ITEMS = `SELECT p.position, s.song_id, s.artist, s.title, s.source, s.filename,s.duration
    FROM playlist_items p
    INNER JOIN songs s ON s.song_id = p.song_id 
    WHERE p.playlist_id = $1 
    ORDER BY p.position::DECIMAL
    LIMIT $2`;

const FIRST_POSITION = `SELECT COALESCE(MIN(position::DECIMAL), 1) as position 
    FROM playlist_items 
    WHERE playlist_id = $1`;

const LAST_POSITION = `SELECT COALESCE(MAX(position::DECIMAL), 0) as position 
    FROM playlist_items 
    WHERE playlist_id = $1`;

const NEXT_POSITION = `SELECT position
    FROM playlist_items 
    WHERE playlist_id = $1 AND position::DECIMAL > $2 
    ORDER BY position::DECIMAL 
    LIMIT 1`;

const CREATE_PLAYLIST_ITEM = `INSERT INTO playlist_items (playlist_id, song_id, position) 
    VALUES ($1, $2, $3)`;

const DELETE_PLAYLIST_ITEM = `DELETE FROM playlist_items 
    WHERE playlist_id = $1 AND position = $2`;

const MOVE_PLAYLIST_ITEM = `UPDATE playlist_items 
    SET position = $1 
    WHERE playlist_id = $2 AND position = $3`;

const UPDATE_CURRENT_TRACK = `INSERT INTO playlists (playlist_id, current_track) 
    VALUES ($1, $2)
    ON CONFLICT (playlist_id) DO UPDATE SET current_track = $2`;

const CLEAR_CURRENT_TRACK = `UPDATE playlists
    SET current_track = NULL 
    WHERE playlist_id = $1`;

export const SELECT_CURRENT_TRACK = `
  SELECT s.song_id, s.artist, s.title, s.source, s.filename,s.duration
    FROM playlists p
    INNER JOIN songs s ON s.song_id = p.current_track 
  WHERE playlist_id = $1
`;

const queries = {
    SELECT_MOVE_UP_ITEM_AFTER,
    SELECT_TOP_N_PLAYLIST_ITEMS,
    SELECT_ALL_PLAYLIST_ITEMS,
    CLEAR_PLAYLIST,
    FIRST_POSITION,
    LAST_POSITION,
    CREATE_PLAYLIST_ITEM,
    DELETE_PLAYLIST_ITEM,
    NEXT_POSITION,
    MOVE_PLAYLIST_ITEM,
    UPDATE_CURRENT_TRACK,
    CLEAR_CURRENT_TRACK,
    SELECT_CURRENT_TRACK,
};

export { queries };
