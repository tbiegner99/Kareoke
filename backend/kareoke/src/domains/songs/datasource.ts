import { DatabaseClient } from '../../utils/data/interfaces';
import { songsQueries } from './queries';
import { songsRowMapper } from './row-mapper';
import { Song, SearchResult, ResultType } from './models';
import { Logger } from '../../utils/logger';
import { DEFAULT_LIMIT } from '../../utils/constants';

interface SearchOptions {
    exact?: boolean;
    fullSearch?: boolean;
    limit?: number;
    page?: number;
}

interface SearchParams {
    artist?: string;
    title?: string;
    text?: string;
    limit?: number;
}

interface CreateSongResult extends Song {
    songId: string;
}

const isEmpty = <T>(arr: T[]): boolean => arr.length === 0;

class SongsDatasource {
    constructor(
        private dbClient: DatabaseClient,
        private logger: Logger
    ) {}

    async createSong(songData: Song): Promise<CreateSongResult> {
        this.logger.debug('Creating new song', { artist: songData.artist, title: songData.title });
        const params = songsRowMapper.toInsertParams(songData);

        // First insert into titles table
        await this.dbClient.execute(songsQueries.INSERT_TITLES_QUERY, [
            params.title,
            params.artist,
        ]);

        // Then insert into songs table and get the ID
        const result = await this.dbClient.insert<{ song_id: string }>(
            songsQueries.INSERT_SONGS_QUERY,
            [params.title, params.artist, params.source, params.filename]
        );

        this.logger.info('Song created successfully', {
            songId: result.song_id,
            artist: songData.artist,
            title: songData.title,
        });
        return { ...songData, songId: result.song_id };
    }

    async deleteSong(songId: string): Promise<void> {
        this.logger.debug('Deleting song', { songId });
        await this.dbClient.execute(songsQueries.DELETE_QUERY, [songId]);
        this.logger.info('Song deleted successfully', { songId });
    }

    async getSongById(songId: string): Promise<Song | null> {
        this.logger.debug('Getting song by ID', { songId });
        const results = await this.dbClient.query(songsQueries.SELECT_BY_ID_QUERY, [songId]);

        if (isEmpty(results)) {
            this.logger.debug('Song not found', { songId });
            return null;
        }

        const result = songsRowMapper.fromSongResult(results[0]);
        this.logger.debug('Song retrieved successfully', {
            songId,
            artist: result.artist,
            title: result.title,
        });
        return result;
    }

    async getAllSongs(limit: number = 1000, page = 0): Promise<Song[]> {
        this.logger.debug('Getting all songs');
        const results = await this.dbClient.query(songsQueries.SELECT_ALL_SONGS, [
            limit,
            limit * page,
        ]);
        this.logger.info('Retrieved all songs', { count: results.length });

        return results.map(songsRowMapper.fromSongResult);
    }

    async searchSongsByArtist(artist: string, opts: SearchOptions = {}): Promise<SearchResult> {
        this.logger.debug('Searching songs by artist', { artist, opts });
        const { exact = false, fullSearch = false } = opts;
        let query;

        query = exact
            ? songsQueries.SEARCH_SONG_BY_ARTIST_EXACT_QUERY
            : songsQueries.SEARCH_SONG_BY_ARTIST_QUERY;

        const countQuery = exact
            ? songsQueries.SEARCH_SONG_BY_ARTIST_EXACT_COUNT_QUERY
            : songsQueries.SEARCH_SONG_BY_ARTIST_COUNT_QUERY;

        return this.runSearch(query, countQuery, { artist }, opts);
    }

    async searchSongsByTitle(title: string, opts: SearchOptions = {}): Promise<SearchResult> {
        this.logger.debug('Searching songs by title', { title, opts });
        const { exact = false, fullSearch = false } = opts;
        let query;

        query = exact
            ? songsQueries.SEARCH_SONG_BY_TITLE_EXACT_QUERY
            : songsQueries.SEARCH_SONG_BY_TITLE_QUERY;
        const countQuery = exact
            ? songsQueries.SEARCH_SONG_BY_TITLE_EXACT_COUNT_QUERY
            : songsQueries.SEARCH_SONG_BY_TITLE_COUNT_QUERY;

        return this.runSearch(query, countQuery, { title }, opts);
    }

    async searchSongsByText(text: string, opts: SearchOptions = {}): Promise<SearchResult> {
        this.logger.debug('Full text search', { text, opts });
        const query = opts.exact
            ? songsQueries.SEARCH_SONG_BY_TEXT_EXACT_QUERY
            : songsQueries.SEARCH_SONG_BY_TEXT_QUERY;
        const countQuery = opts.exact
            ? songsQueries.SEARCH_SONG_BY_TEXT_EXACT_COUNT_QUERY
            : songsQueries.SEARCH_SONG_BY_TEXT_COUNT_QUERY;
        return this.runSearch(query, countQuery, { text }, opts);
    }

    async updatePlayCount(songId: string): Promise<void> {
        this.logger.debug('Updating play count', { songId });
        await this.dbClient.execute(songsQueries.UPDATE_PLAY_COUNT_QUERY, [songId]);
        this.logger.info('Play count updated successfully', { songId });
    }

    private async runSearch(
        query: string,
        countQuery: string,
        params: SearchParams,
        opts: SearchOptions = {}
    ): Promise<SearchResult<Song>> {
        this.logger.debug('Running search query', { params, opts });
        const { limit = DEFAULT_LIMIT, page = 0 } = opts;

        // Build parameter array based on the query parameters
        const paramArray: (string | number)[] = [];
        if (params.artist !== undefined) paramArray.push(params.artist);
        if (params.title !== undefined) paramArray.push(params.title);
        if (params.text !== undefined) paramArray.push(params.text);
        paramArray.push(limit);
        paramArray.push(page * limit);
        const countParams = paramArray.slice(0, -2); // Exclude limit and page for count query

        const results = await this.dbClient.query(query, paramArray);
        this.logger.debug('Search query completed', { resultCount: results.length, params });

        const count = await this.dbClient
            .queryRow<{ count: number }>(countQuery, countParams)
            .then(row => Object.values(row)[0]);

        const songs = results.map((row: any) => songsRowMapper.fromSongResult(row));
        return {
            results: songs,
            total: count,
            resultType: ResultType.SONG,
        };
    }
}

export { SongsDatasource };
