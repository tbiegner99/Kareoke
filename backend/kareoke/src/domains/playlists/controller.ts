import { Request, Response, NextFunction } from 'express';
import { PlaylistService } from './service';
import { Logger } from '../../utils/logger';
import { HTTPStatus } from '../../utils/constants';
import { PlaylistItem } from './models';
import { SongsService } from '../songs/service';

// Enqueue types enum
enum EnqueueTypes {
    FRONT = 'atFront',
    AFTER_ITEM = 'afterItem',
    END = 'atEnd',
    UP_ONE_POSITION = 'up',
    DOWN_ONE_POSITION = 'down',
}

interface EnqueueRequestBody {
    method: EnqueueTypes;
    songId: string;
    title?: string;
    artist?: string;
    source?: string;
    filename?: string;
    afterPosition?: number;
}

interface MoveItemRequestBody {
    method: EnqueueTypes;
    afterPosition?: number;
}

class PlaylistsController {
    constructor(
        private playlistService: PlaylistService,
        private songService: SongsService,
        private logger: Logger
    ) {}

    selectPlaylistItems = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params;
            const { limit } = req.query;

            this.logger.debug('Getting playlist items', { playlistId, limit });

            if (!playlistId) {
                this.logger.warn('Missing playlist ID in request');
                res.status(HTTPStatus.BAD_REQUEST).send('Playlist ID is required');
                return;
            }

            const limitNumber = limit ? Number(limit) : undefined;
            const response = await this.playlistService.getPlaylistItems(playlistId, limitNumber);

            this.logger.info('Playlist items retrieved', { playlistId, count: response.length });
            res.status(HTTPStatus.OK).send(response);
        } catch (error) {
            this.logger.error('Error getting playlist items', {
                error,
                playlistId: req.params.playlistId,
            });
            next(error);
        }
    };

    clearPlaylist = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params;

            this.logger.debug('Clearing playlist', { playlistId });

            if (!playlistId) {
                this.logger.warn('Missing playlist ID in clear request');
                res.status(HTTPStatus.BAD_REQUEST).send('Playlist ID is required');
                return;
            }

            await this.playlistService.clearPlaylist(playlistId);

            this.logger.info('Playlist cleared successfully', { playlistId });
            res.sendStatus(HTTPStatus.NO_CONTENT);
        } catch (error) {
            this.logger.error('Error clearing playlist', {
                error,
                playlistId: req.params.playlistId,
            });
            next(error);
        }
    };

    private async enqueueAtFront(req: Request, playlistId: string): Promise<void> {
        const { songId, title = '', artist = '', source = '', filename = '' } = req.body;

        if (!songId) {
            throw new Error('Song ID is required for front enqueue');
        }

        const item: Omit<PlaylistItem, 'position'> = {
            songId,
            title,
            artist,
            source,
            filename,
        };
        await this.playlistService.addItemAtFront(playlistId, item);
    }

    private async enqueueAfterItem(req: Request, playlistId: string): Promise<void> {
        const {
            songId,
            title = '',
            artist = '',
            source = '',
            filename = '',
            afterPosition,
        } = req.body;

        if (!songId || afterPosition === undefined) {
            throw new Error('Song ID and afterPosition are required for after item enqueue');
        }

        const item: Omit<PlaylistItem, 'position'> = {
            songId,
            title,
            artist,
            source,
            filename,
        };
        await this.playlistService.addItemAfter(playlistId, afterPosition, item);
    }

    private async enqueueAtEnd(req: Request, playlistId: string): Promise<void> {
        const { songId, title = '', artist = '', source = '', filename = '' } = req.body;

        if (!songId) {
            throw new Error('Song ID is required for end enqueue');
        }

        const item: Omit<PlaylistItem, 'position'> = {
            songId,
            title,
            artist,
            source,
            filename,
        };
        await this.playlistService.enqueuePlaylistItem(playlistId, item);
    }

    enqueueItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { method, songId } = req.body as EnqueueRequestBody;
            const { playlistId } = req.params;

            this.logger.debug('Enqueuing item', { playlistId, method, songId });

            if (!playlistId || !method || !songId) {
                this.logger.warn('Missing required fields in enqueue request', {
                    playlistId,
                    method,
                    songId,
                });
                res.status(HTTPStatus.BAD_REQUEST).send(
                    'Playlist ID, method, and song ID are required'
                );
                return;
            }

            await this.songService.getSongById(songId);

            switch (method) {
                case EnqueueTypes.FRONT:
                    await this.enqueueAtFront(req, playlistId);
                    break;
                case EnqueueTypes.AFTER_ITEM:
                    await this.enqueueAfterItem(req, playlistId);
                    break;
                case EnqueueTypes.END:
                default:
                    await this.enqueueAtEnd(req, playlistId);
            }

            const response = await this.playlistService.getPlaylistItems(playlistId);

            this.logger.info('Item enqueued successfully', { playlistId, method, songId });
            res.status(HTTPStatus.CREATED).send(response);
        } catch (error) {
            this.logger.error('Error enqueuing item', {
                error,
                playlistId: req.params.playlistId,
                body: req.body,
            });
            next(error);
        }
    };

    private async moveAfterItem(
        req: Request,
        playlistId: string,
        currentItemPosition: number
    ): Promise<void> {
        const { afterPosition } = req.body;

        if (afterPosition === undefined) {
            throw new Error('afterPosition is required for move after item');
        }

        await this.playlistService.moveItemAfter(playlistId, currentItemPosition, afterPosition);
    }

    moveItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { method } = req.body as MoveItemRequestBody;
            const { playlistId, position: currentItemPositionStr } = req.params;

            if (!playlistId || !currentItemPositionStr || !method) {
                this.logger.warn('Missing required fields in move request', {
                    playlistId,
                    position: currentItemPositionStr,
                    method,
                });
                res.status(HTTPStatus.BAD_REQUEST).send(
                    'Playlist ID, position, and method are required'
                );
                return;
            }

            const currentItemPosition = Number(currentItemPositionStr);

            if (isNaN(currentItemPosition)) {
                this.logger.warn('Invalid position in move request', {
                    position: currentItemPositionStr,
                });
                res.status(HTTPStatus.BAD_REQUEST).send('Position must be a valid number');
                return;
            }

            this.logger.debug('Moving item', { playlistId, currentItemPosition, method });

            switch (method) {
                case EnqueueTypes.UP_ONE_POSITION:
                    await this.playlistService.moveUp(playlistId, currentItemPosition);
                    break;
                case EnqueueTypes.DOWN_ONE_POSITION:
                    await this.playlistService.moveDown(playlistId, currentItemPosition);
                    break;
                case EnqueueTypes.FRONT:
                    await this.playlistService.moveItemToFront(playlistId, currentItemPosition);
                    break;
                case EnqueueTypes.AFTER_ITEM:
                    await this.moveAfterItem(req, playlistId, currentItemPosition);
                    break;
                case EnqueueTypes.END:
                default:
                    await this.playlistService.moveItemToEnd(playlistId, currentItemPosition);
            }

            const response = await this.playlistService.getPlaylistItems(playlistId);

            this.logger.info('Item moved successfully', {
                playlistId,
                currentItemPosition,
                method,
            });
            res.status(HTTPStatus.CREATED).send(response);
        } catch (error) {
            this.logger.error('Error moving item', {
                error,
                playlistId: req.params.playlistId,
                body: req.body,
            });
            next(error);
        }
    };

    removePlaylistItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId, position: positionStr } = req.params;

            if (!playlistId || !positionStr) {
                this.logger.warn('Missing required fields in remove request', {
                    playlistId,
                    position: positionStr,
                });
                res.status(HTTPStatus.BAD_REQUEST).send('Playlist ID and position are required');
                return;
            }

            const position = Number(positionStr);

            if (isNaN(position)) {
                this.logger.warn('Invalid position in remove request', { position: positionStr });
                res.status(HTTPStatus.BAD_REQUEST).send('Position must be a valid number');
                return;
            }

            this.logger.debug('Removing playlist item', { playlistId, position });

            await this.playlistService.removeItemAtPosition(playlistId, position);

            this.logger.info('Playlist item removed successfully', { playlistId, position });
            res.sendStatus(HTTPStatus.NO_CONTENT);
        } catch (error) {
            this.logger.error('Error removing playlist item', {
                error,
                playlistId: req.params.playlistId,
                position: req.params.position,
            });
            next(error);
        }
    };

    dequeue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params;

            this.logger.debug('Dequeuing item', { playlistId });

            if (!playlistId) {
                this.logger.warn('Missing playlist ID in dequeue request');
                res.status(HTTPStatus.BAD_REQUEST).send('Playlist ID is required');
                return;
            }

            const dequeuedItem = await this.playlistService.dequeuePlaylistItem(playlistId);

            if (!dequeuedItem) {
                this.logger.debug('No item to dequeue', { playlistId });
                res.sendStatus(HTTPStatus.NO_CONTENT);
                return;
            }

            this.logger.info('Item dequeued successfully', {
                playlistId,
                songId: dequeuedItem.songId,
            });
            res.status(HTTPStatus.OK).send(dequeuedItem);
        } catch (error) {
            this.logger.error('Error dequeuing item', { error, playlistId: req.params.playlistId });
            next(error);
        }
    };

    peek = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playlistId } = req.params;

            this.logger.debug('Peeking playlist', { playlistId });

            if (!playlistId) {
                this.logger.warn('Missing playlist ID in peek request');
                res.status(HTTPStatus.BAD_REQUEST).send('Playlist ID is required');
                return;
            }

            const response = await this.playlistService.peekPlaylistItem(playlistId);

            if (!response) {
                this.logger.debug('No item to peek', { playlistId });
                res.sendStatus(HTTPStatus.NO_CONTENT);
                return;
            }

            this.logger.debug('Peek successful', { playlistId, songId: response.songId });
            res.status(HTTPStatus.OK).send(response);
        } catch (error) {
            this.logger.error('Error peeking playlist', {
                error,
                playlistId: req.params.playlistId,
            });
            next(error);
        }
    };
}

export { PlaylistsController };
