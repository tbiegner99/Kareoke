import { Request, Response, NextFunction } from 'express';
import { SongsService } from './service';
import { Logger } from '../../utils/logger';
import { DEFAULT_LIMIT, HTTPStatus } from '../../utils/constants';
import { Song, SearchResult, ResultType } from './models';
import { NotFoundError } from '../../errors';

// Search modes enum (we should create proper enums later)
enum SearchModes {
    TITLE = 'title',
    ARTIST = 'artist',
    TEXT = 'text',
    ID = 'id',
}

// Search result types enum
enum SearchResultType {
    SHORT = 'short',
    FULL = 'full',
}

interface SearchRequestBody {
    query: string;
    searchMode: SearchModes;
    exact?: boolean;
    resultType?: SearchResultType;
}

interface CreateSongRequestBody {
    artist: string;
    title: string;
    source: string;
    filename: string;
    duration: number; // Duration in seconds
}

// Interface for creating a song (without the full Song properties)
interface CreateSongData {
    artist: string;
    title: string;
    source: string;
    filename: string;
}

class SongsController {
    constructor(
        private songsService: SongsService,
        private logger: Logger
    ) {}

    createSong = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.logger.debug('Creating song', { body: req.body });

            const songData = req.body as CreateSongRequestBody;

            // Basic validation
            if (
                !songData.artist ||
                !songData.title ||
                !songData.source ||
                !songData.filename ||
                !songData.duration
            ) {
                this.logger.warn('Invalid song creation request', { body: req.body });
                res.status(HTTPStatus.BAD_REQUEST).send(
                    'Missing required fields: artist, title, source, filename,duration'
                );
                return;
            }

            // Create Song object with all required properties
            const songToCreate: Song = {
                id: '', // Will be assigned by the service
                artist: songData.artist,
                title: songData.title,
                source: songData.source,
                filename: songData.filename,
                resultType: ResultType.SONG,
                plays: 0,
                lastPlay: null,
                duration: songData.duration, // Default duration, can be updated later
            };

            const createdSong = await this.songsService.createSong(songToCreate);

            this.logger.info('Song created successfully', {
                songId: createdSong.songId,
                artist: songData.artist,
                title: songData.title,
            });

            res.status(HTTPStatus.CREATED).send(createdSong);
        } catch (error) {
            this.logger.error('Error creating song', { error, body: req.body });
            next(error);
        }
    };

    searchSong = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.logger.debug('Searching songs', { body: req.body, query: req.query });

            const {
                query,
                searchMode,
                exact = false,
                resultType = SearchResultType.SHORT,
            } = req.body as SearchRequestBody;
            const { limit, page } = req.query;

            if (!query || !searchMode) {
                this.logger.warn('Invalid search request', { body: req.body });
                res.status(HTTPStatus.BAD_REQUEST).send(
                    'Missing required fields: query, searchMode'
                );
                return;
            }

            const opts = {
                limit: limit ? Number(limit) : DEFAULT_LIMIT,
                page: page ? Number(page) - 1 : 0,
                exact,
                fullSearch: resultType === SearchResultType.FULL,
            };

            let results: SearchResult;

            switch (searchMode) {
                case SearchModes.TITLE:
                    results = await this.songsService.searchSongsByTitle(query, opts);
                    break;
                case SearchModes.ARTIST:
                    results = await this.songsService.searchSongsByArtist(query, opts);
                    break;
                case SearchModes.ID:
                    try {
                        const song = await this.songsService.getSongById(query);
                        results = { results: [song], total: 1, resultType: ResultType.SONG };
                    } catch (error: any) {
                        if (error instanceof NotFoundError) {
                            results = { results: [], total: 0, resultType: ResultType.SONG };
                            break;
                        }
                        throw error;
                    }

                    break;
                case SearchModes.TEXT:
                default:
                    results = await this.songsService.searchSongsByText(query, opts);
                    break;
            }

            this.logger.info('Search completed', {
                searchMode,
                query,
                resultCount: results.total,
                opts,
            });

            res.status(HTTPStatus.OK).send(results);
        } catch (error) {
            this.logger.error('Error searching songs', { error, body: req.body });
            next(error);
        }
    };

    getSongById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            this.logger.debug('Getting song by ID', { id });

            if (!id) {
                this.logger.warn('Missing song ID in request');
                res.status(HTTPStatus.BAD_REQUEST).send('Song ID is required');
                return;
            }

            const song = await this.songsService.getSongById(id);

            this.logger.debug('Song retrieved successfully', { id });
            res.status(HTTPStatus.OK).send(song);
        } catch (error) {
            this.logger.error('Error getting song by ID', { error, id: req.params.id });
            next(error);
        }
    };

    getAllSongs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            this.logger.debug('Getting all songs');
            const { limit, page } = req.query;

            const songs = await this.songsService.getAllSongs(
                limit ? Number(limit) : DEFAULT_LIMIT,
                page ? Number(page) - 1 : 0
            );

            this.logger.info('All songs retrieved', { count: songs.length });
            res.status(HTTPStatus.OK).send(songs);
        } catch (error) {
            this.logger.error('Error getting all songs', { error });
            next(error);
        }
    };

    deleteSongById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            this.logger.debug('Deleting song by ID', { id });

            if (!id) {
                this.logger.warn('Missing song ID in delete request');
                res.status(HTTPStatus.BAD_REQUEST).send('Song ID is required');
                return;
            }

            await this.songsService.deleteSong(id);

            this.logger.info('Song deleted successfully', { id });
            res.sendStatus(HTTPStatus.NO_CONTENT);
        } catch (error) {
            this.logger.error('Error deleting song', { error, id: req.params.id });
            next(error);
        }
    };

    updatePlayCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;

            this.logger.debug('Updating play count', { id });

            if (!id) {
                this.logger.warn('Missing song ID in play count update request');
                res.status(HTTPStatus.BAD_REQUEST).send('Song ID is required');
                return;
            }

            await this.songsService.updatePlayCount(id);

            this.logger.info('Play count updated successfully', { id });
            res.sendStatus(HTTPStatus.NO_CONTENT);
        } catch (error) {
            this.logger.error('Error updating play count', { error, id: req.params.id });
            next(error);
        }
    };
}

export { SongsController };
