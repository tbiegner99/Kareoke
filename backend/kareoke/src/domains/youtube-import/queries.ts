const INSERT_JOB_QUERY = `INSERT INTO import_jobs (youtube_id, youtube_url, title, artist, status, percent, duration_seconds)
    VALUES ($1, $2, $3, $4, $5, 0, $6)
    RETURNING *`;

const SELECT_JOB_BY_ID_QUERY = `SELECT * FROM import_jobs WHERE job_id = $1 LIMIT 1`;

const UPDATE_JOB_STATUS_QUERY = `UPDATE import_jobs
    SET status = $2, percent = $3, error = $4, song_id = $5, updated = NOW()
    WHERE job_id = $1`;

const SELECT_EXISTING_YOUTUBE_IDS_QUERY = `SELECT youtube_url FROM songs WHERE youtube_url = ANY($1::text[])`;

const SET_SONG_YOUTUBE_URL_QUERY = `UPDATE songs SET youtube_url = $2 WHERE song_id = $1`;

const queries = {
    INSERT_JOB_QUERY,
    SELECT_JOB_BY_ID_QUERY,
    UPDATE_JOB_STATUS_QUERY,
    SELECT_EXISTING_YOUTUBE_IDS_QUERY,
    SET_SONG_YOUTUBE_URL_QUERY,
};

export { queries as youtubeImportQueries };
