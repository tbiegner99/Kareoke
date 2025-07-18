import { PlaylistDatasource } from './datasource';
import { PlaylistItem, Song } from './models';
import { Logger } from '../../utils/logger';
import { SongsService } from '../songs/service';
import EventEmitter from 'events';

class PlaylistService {
    constructor(
        private playlistDatasource: PlaylistDatasource,
        private songsService: SongsService,
        private logger: Logger,
        private eventEmitter: EventEmitter
    ) {}
    getCurrentTrack(playlistId: string): Promise<PlaylistItem | null> {
        return this.playlistDatasource.getCurrentTrack(playlistId);
    }
    async setCurrentTrack(playlistId: string, songId: number): Promise<void> {
        this.logger.info('Setting current track', { playlistId, songId });
        await this.playlistDatasource.setCurrentTrack(playlistId, songId);
        await this.emitPlayingStateChangeEvent(playlistId, songId);
    }

    async clearCurrentTrack(playlistId: string): Promise<void> {
        this.logger.info('Clearing current track', { playlistId });
        await this.playlistDatasource.clearCurrentTrack(playlistId);
        await this.emitPlayingStateChangeEvent(playlistId, null);
    }
    private computeNewPosition(lowerBoundPosition: number, upperBoundPosition: number): number {
        return (lowerBoundPosition + upperBoundPosition) / 2;
    }

    private async emitChangeEvent(playlistId: string): Promise<void> {
        const items = await this.getPlaylistItems(playlistId); // Ensure we have the latest items
        this.eventEmitter.emit('playlistChanged', { playlistId, newState: items });
        this.logger.info('Playlist change event emitted', { playlistId });
    }

    private async emitPlayingStateChangeEvent(
        playlistId: string,
        songId: number | null
    ): Promise<void> {
        if (!songId) {
            this.eventEmitter.emit('playingStateChanged', { playlistId, song: null });
            return;
        }
        const song = await this.songsService.getSongById(songId!.toString()); // Ensure we have the latest items
        this.eventEmitter.emit('playingStateChanged', { playlistId, song: song });
        this.logger.info('Playlist play statechange event emitted', { playlistId });
    }

    async peekPlaylistItem(playlistId: string): Promise<PlaylistItem | null> {
        try {
            this.logger.debug('Peeking playlist item', { playlistId });
            const items = await this.playlistDatasource.getTopNItemsOfPlaylist(playlistId, 1);
            const result = items.length > 0 ? items[0] : null;
            this.logger.debug('Peek result', { playlistId, hasItem: !!result });
            return result;
        } catch (error) {
            this.logger.error('Error peeking playlist item', { playlistId, error });
            throw new Error('Failed to peek playlist item');
        }
    }

    async dequeuePlaylistItem(playlistId: string): Promise<PlaylistItem | null> {
        try {
            this.logger.debug('Dequeuing playlist item', { playlistId });
            const firstItem = await this.peekPlaylistItem(playlistId);
            if (!firstItem) {
                this.logger.debug('No item to dequeue', { playlistId });
                return null;
            }

            await this.removeItemAtPosition(playlistId, firstItem.position);
            this.logger.info('Playlist item dequeued successfully', {
                playlistId,
                position: firstItem.position,
            });
            this.emitChangeEvent(playlistId);
            return firstItem;
        } catch (error) {
            this.logger.error('Error dequeuing playlist item', { playlistId, error });
            throw new Error('Failed to dequeue playlist item');
        }
    }

    async removeItemAtPosition(playlistId: string, position: number): Promise<void> {
        try {
            this.logger.debug('Removing item at position', { playlistId, position });
            await this.playlistDatasource.deletePlaylistItemAtPosition(playlistId, position);
            this.logger.info('Item removed successfully', { playlistId, position });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error removing item at position', { playlistId, position, error });
            throw new Error('Failed to remove item at position');
        }
    }

    async getPlaylistItems(playlistId: string, limit?: number): Promise<PlaylistItem[]> {
        try {
            this.logger.debug('Getting playlist items', { playlistId, limit });
            if (!limit || Number.isNaN(Number(limit)) || limit <= 0) {
                const items = await this.playlistDatasource.getAllPlaylistItems(playlistId);
                this.logger.info('Retrieved all playlist items', {
                    playlistId,
                    count: items.length,
                });
                return items;
            }
            const items = await this.playlistDatasource.getTopNItemsOfPlaylist(playlistId, limit);
            this.logger.info('Retrieved limited playlist items', {
                playlistId,
                limit,
                count: items.length,
            });
            return items;
        } catch (error) {
            this.logger.error('Error getting playlist items', { playlistId, limit, error });
            throw new Error('Failed to get playlist items');
        }
    }

    async clearPlaylist(playlistId: string): Promise<void> {
        try {
            this.logger.info('Clearing playlist', { playlistId });
            await this.playlistDatasource.clearPlaylist(playlistId);
            this.logger.info('Playlist cleared successfully', { playlistId });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error clearing playlist', { playlistId, error });
            throw new Error('Failed to clear playlist');
        }
    }

    async enqueuePlaylistItem(
        playlistId: string,
        playlistItem: Omit<PlaylistItem, 'position'>
    ): Promise<void> {
        try {
            this.logger.debug('Enqueuing playlist item', {
                playlistId,
                songId: playlistItem.songId,
            });
            const lastPosition =
                await this.playlistDatasource.getLastPositionForPlaylist(playlistId);
            const positionToAdd = lastPosition + 1;
            if (Number.isNaN(positionToAdd)) {
                this.logger.error('Invalid position to add', {
                    playlistId,
                    songId: playlistItem.songId,
                });
                throw new Error('Invalid position to add item');
            }
            const itemToAdd: PlaylistItem = { ...playlistItem, position: positionToAdd };

            await this.playlistDatasource.createPlaylistItem(playlistId, itemToAdd);
            this.logger.info('Playlist item enqueued successfully', {
                playlistId,
                songId: playlistItem.songId,
                position: positionToAdd,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error enqueuing playlist item', {
                playlistId,
                songId: playlistItem.songId,
                error,
            });
            throw new Error('Failed to enqueue playlist item');
        }
    }

    async addItemAtFront(
        playlistId: string,
        playlistItem: Omit<PlaylistItem, 'position'>
    ): Promise<void> {
        try {
            this.logger.debug('Adding item at front', { playlistId, songId: playlistItem.songId });
            const firstPosition =
                await this.playlistDatasource.getFirstPositionForPlaylist(playlistId);
            const positionToAdd = firstPosition - 1;
            const itemToAdd: PlaylistItem = { ...playlistItem, position: positionToAdd };

            await this.playlistDatasource.createPlaylistItem(playlistId, itemToAdd);
            this.logger.info('Item added at front successfully', {
                playlistId,
                songId: playlistItem.songId,
                position: positionToAdd,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error adding item at front', {
                playlistId,
                songId: playlistItem.songId,
                error,
            });
            throw new Error('Failed to add item at front');
        }
    }

    async addItemAfter(
        playlistId: string,
        position: number,
        playlistItem: Omit<PlaylistItem, 'position'>
    ): Promise<void> {
        try {
            this.logger.debug('Adding item after position', {
                playlistId,
                position,
                songId: playlistItem.songId,
            });
            const upperBoundPosition = await this.playlistDatasource.getNextPositionAfter(
                playlistId,
                position
            );

            if (upperBoundPosition === null) {
                await this.enqueuePlaylistItem(playlistId, playlistItem);
            } else {
                const positionToAdd = this.computeNewPosition(position, upperBoundPosition);
                const itemToAdd: PlaylistItem = { ...playlistItem, position: positionToAdd };

                await this.playlistDatasource.createPlaylistItem(playlistId, itemToAdd);
                this.logger.info('Item added after position successfully', {
                    playlistId,
                    position,
                    songId: playlistItem.songId,
                    newPosition: positionToAdd,
                });
                this.emitChangeEvent(playlistId);
            }
        } catch (error) {
            this.logger.error('Error adding item after position', {
                playlistId,
                position,
                songId: playlistItem.songId,
                error,
            });
            throw new Error('Failed to add item after position');
        }
    }

    async moveUp(playlistId: string, itemPositionToMove: number): Promise<void> {
        try {
            this.logger.debug('Moving item up', { playlistId, itemPositionToMove });
            const twoItemsBefore = await this.playlistDatasource.getItemPositionForMoveUpOperation(
                playlistId,
                itemPositionToMove
            );

            if (!twoItemsBefore) {
                await this.moveItemToFront(playlistId, itemPositionToMove);
                return;
            }

            await this.moveItemAfter(playlistId, itemPositionToMove, twoItemsBefore.position);
            this.logger.info('Item moved up successfully', { playlistId, itemPositionToMove });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item up', { playlistId, itemPositionToMove, error });
            throw new Error('Failed to move item up');
        }
    }

    async moveDown(playlistId: string, itemPositionToMove: number): Promise<void> {
        try {
            this.logger.debug('Moving item down', { playlistId, itemPositionToMove });
            const nextPosition = await this.playlistDatasource.getNextPositionAfter(
                playlistId,
                itemPositionToMove
            );

            if (nextPosition === null) {
                this.logger.debug('Item already at bottom', { playlistId, itemPositionToMove });
                return; // Already at the bottom
            }

            await this.moveItemAfter(playlistId, itemPositionToMove, nextPosition);
            this.logger.info('Item moved down successfully', { playlistId, itemPositionToMove });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item down', { playlistId, itemPositionToMove, error });
            throw new Error('Failed to move item down');
        }
    }

    async moveItemToEnd(playlistId: string, itemPositionToMove: number): Promise<void> {
        try {
            this.logger.debug('Moving item to end', { playlistId, itemPositionToMove });
            const upperBoundPosition =
                await this.playlistDatasource.getLastPositionForPlaylist(playlistId);
            const newPosition = Math.ceil(upperBoundPosition + 1); // Remove decimals to conserve space

            await this.playlistDatasource.updateItemPosition(
                playlistId,
                itemPositionToMove,
                newPosition
            );
            this.logger.info('Item moved to end successfully', {
                playlistId,
                itemPositionToMove,
                newPosition,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item to end', {
                playlistId,
                itemPositionToMove,
                error,
            });
            throw new Error('Failed to move item to end');
        }
    }

    async moveItemToFront(playlistId: string, itemPositionToMove: number): Promise<void> {
        try {
            this.logger.debug('Moving item to front', { playlistId, itemPositionToMove });
            const upperBoundPosition =
                await this.playlistDatasource.getFirstPositionForPlaylist(playlistId);
            const newPosition = Math.floor(upperBoundPosition - 1); // Remove decimals to conserve space

            await this.playlistDatasource.updateItemPosition(
                playlistId,
                itemPositionToMove,
                newPosition
            );
            this.logger.info('Item moved to front successfully', {
                playlistId,
                itemPositionToMove,
                newPosition,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item to front', {
                playlistId,
                itemPositionToMove,
                error,
            });
            throw new Error('Failed to move item to front');
        }
    }

    async moveItemToNewPosition(
        playlistId: string,
        currentItemPosition: number,
        newPosition: number
    ): Promise<void> {
        try {
            this.logger.debug('Moving item to new position', {
                playlistId,
                currentItemPosition,
                newPosition,
            });
            await this.playlistDatasource.updateItemPosition(
                playlistId,
                currentItemPosition,
                newPosition
            );
            this.logger.info('Item moved to new position successfully', {
                playlistId,
                currentItemPosition,
                newPosition,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item to new position', {
                playlistId,
                currentItemPosition,
                newPosition,
                error,
            });
            throw new Error('Failed to move item to new position');
        }
    }

    async moveItemAfter(
        playlistId: string,
        itemPositionToMove: number,
        afterPosition: number
    ): Promise<void> {
        try {
            this.logger.debug('Moving item after position', {
                playlistId,
                itemPositionToMove,
                afterPosition,
            });
            const upperBoundPosition = await this.playlistDatasource.getNextPositionAfter(
                playlistId,
                afterPosition
            );

            if (upperBoundPosition === itemPositionToMove) {
                this.logger.debug('Item already in target position', {
                    playlistId,
                    itemPositionToMove,
                    afterPosition,
                });
                return; // Moving to same place
            }

            let newPosition: number;
            if (upperBoundPosition === null) {
                // Moving to end of list
                newPosition = Math.ceil(afterPosition + 1);
            } else {
                newPosition = this.computeNewPosition(afterPosition, upperBoundPosition);
            }

            await this.playlistDatasource.updateItemPosition(
                playlistId,
                itemPositionToMove,
                newPosition
            );
            this.logger.info('Item moved after position successfully', {
                playlistId,
                itemPositionToMove,
                afterPosition,
                newPosition,
            });
            this.emitChangeEvent(playlistId);
        } catch (error) {
            this.logger.error('Error moving item after position', {
                playlistId,
                itemPositionToMove,
                afterPosition,
                error,
            });
            throw new Error('Failed to move item after position');
        }
    }
}

export { PlaylistService };
