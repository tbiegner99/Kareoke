import { SongsDatasource } from './datasource';
import { Song, SearchResult, SongUpdateParams, SongRow } from './models';
import { Logger } from '../../utils/logger';
import { NotFoundError } from '../../errors';

interface QueryOptions {
    limit?: number;
    fullSearch?: boolean;
    exact?: boolean;
    page?: number;
}

interface SearchOptions {
    limit?: number;
    fullSearch?: boolean;
    exact?: boolean;
    page?: number;
}

const getQueryOpts = (opts: QueryOptions = {}): SearchOptions => ({
    limit: opts.limit,
    fullSearch: opts.fullSearch || false,
    exact: opts.exact || false,
    page: opts.page || 0,
});

class SongsService {
    constructor(
        private songsDatasource: SongsDatasource,
        private logger: Logger
    ) {}

    async getSongById(songId: string): Promise<Song> {
        try {
            this.logger.debug('Getting song by ID', { songId });
            const result = await this.songsDatasource.getSongById(songId);
            if (!result) {
                this.logger.warn('No song found with ID', { songId });
                throw new NotFoundError('No song found with this id.', 'NO_SONG_FOUND');
            }
            const song = result;
            this.logger.debug('Song retrieved successfully', {
                songId,
                resultType: song.resultType,
            });
            // Type guard to ensure we have a Song
            if (song.resultType === 'song') {
                return song as Song;
            }
            throw new Error('Retrieved result is not a song.');
        } catch (err) {
            this.logger.error('Error retrieving song by ID', { songId, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred retrieving song by id: ${errorMessage}`);
        }
    }

    async getAllSongs(limit: number = 1000, page = 0): Promise<Song[]> {
        try {
            this.logger.debug('Getting all songs');
            const songs = await this.songsDatasource.getAllSongs(limit, page);
            this.logger.info('Retrieved all songs', { count: songs.length });
            return songs;
        } catch (err) {
            this.logger.error('Error retrieving all songs', { error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred retrieving songs: ${errorMessage}`);
        }
    }

    async createSong(songData: Song): Promise<Song & { songId: string }> {
        try {
            this.logger.debug('Creating song', { artist: songData.artist, title: songData.title });
            const result = await this.songsDatasource.createSong(songData);
            this.logger.info('Song created successfully', {
                songId: result.songId,
                artist: songData.artist,
                title: songData.title,
            });
            return result;
        } catch (err) {
            this.logger.error('Error creating song', { songData, error: err });
            const errorDetails = err instanceof Error ? `Error: ${err.message}` : 'Unknown error';

            this.logger.error(
                `Error creating song ${songData.artist} - ${songData.title} ${songData.source}. ${errorDetails}`
            );
            throw new Error('An error occurred creating song');
        }
    }

    async deleteSong(songId: string): Promise<void> {
        try {
            this.logger.debug('Deleting song', { songId });
            await this.songsDatasource.deleteSong(songId);
            this.logger.info('Song deleted successfully', { songId });
        } catch (err) {
            this.logger.error('Error deleting song', { songId, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred deleting song: ${errorMessage}`);
        }
    }

    async searchSongsByTitle(title: string, opts: QueryOptions = {}): Promise<SearchResult> {
        try {
            this.logger.debug('Searching songs by title', { title, opts });
            const results = await this.songsDatasource.searchSongsByTitle(
                title,
                getQueryOpts(opts)
            );
            this.logger.info('Title search completed', {
                title,
                resultCount: results.total,
            });
            return results;
        } catch (err) {
            this.logger.error('Error searching songs by title', { title, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred searching for song by title: ${errorMessage}`);
        }
    }

    async searchSongsByArtist(artist: string, opts: QueryOptions = {}): Promise<SearchResult> {
        try {
            this.logger.debug('Searching songs by artist', { artist, opts });
            const results = await this.songsDatasource.searchSongsByArtist(
                artist,
                getQueryOpts(opts)
            );
            this.logger.info('Artist search completed', { artist, resultCount: results.total });
            return results;
        } catch (err) {
            this.logger.error('Error searching songs by artist', { artist, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred searching for song by artist: ${errorMessage}`);
        }
    }

    async searchSongsByText(text: string, opts: QueryOptions = {}): Promise<SearchResult> {
        try {
            this.logger.debug('Searching songs by text', { text, opts });
            const results = await this.songsDatasource.searchSongsByText(text, getQueryOpts(opts));
            this.logger.info('Text search completed', { text, resultCount: results.total });
            return results;
        } catch (err) {
            this.logger.error('Error searching songs by text', { text, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred searching for song: ${errorMessage}`);
        }
    }

    async updatePlayCount(songId: string): Promise<void> {
        try {
            this.logger.debug('Updating play count', { songId });
            await this.songsDatasource.updatePlayCount(songId);
            this.logger.info('Play count updated successfully', { songId });
        } catch (err) {
            this.logger.error('Error updating play count', { songId, error: err });
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new Error(`An error occurred updating play count: ${errorMessage}`);
        }
    }
}

export { SongsService };
