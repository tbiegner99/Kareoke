import { queries as playlistQueries } from './queries';
import { playlistRowMapper } from './row-mapper';
import { DatabaseClient } from '../../utils/data/interfaces';
import { PlaylistItem } from './models';
import { Logger } from '../../utils/logger';

interface PlaylistItemRow {
    position: string;
    song_id: string;
    artist: string;
    title: string;
    source: string;
    filename: string;
}

interface PositionResult {
    position: number;
}

interface NextPositionResult {
    position: number;
}

class PlaylistDatasource {
    constructor(
        private dbClient: DatabaseClient,
        private logger: Logger
    ) {}
    async getAllPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
        this.logger.debug('Fetching all playlist items', { playlistId });
        const result = await this.dbClient.query<PlaylistItemRow>(
            playlistQueries.SELECT_ALL_PLAYLIST_ITEMS,
            [playlistId]
        );
        this.logger.info('Retrieved playlist items', { playlistId, count: result.length });
        return result.map(playlistRowMapper.fromPlaylistItemRow);
    }

    async getTopNItemsOfPlaylist(playlistId: string, n: number): Promise<PlaylistItem[]> {
        this.logger.debug('Fetching top N playlist items', { playlistId, n });
        const result = await this.dbClient.query<PlaylistItemRow>(
            playlistQueries.SELECT_TOP_N_PLAYLIST_ITEMS,
            [playlistId, n]
        );
        this.logger.info('Retrieved top N playlist items', { playlistId, n, count: result.length });
        return result.map(playlistRowMapper.fromPlaylistItemRow);
    }

    async clearPlaylist(playlistId: string): Promise<void> {
        this.logger.info('Clearing playlist', { playlistId });
        await this.dbClient.execute(playlistQueries.CLEAR_PLAYLIST, [playlistId]);
        this.logger.info('Playlist cleared successfully', { playlistId });
    }

    async createPlaylistItem(playlistId: string, playlistItem: PlaylistItem): Promise<void> {
        this.logger.debug('Creating playlist item', {
            playlistId,
            songId: playlistItem.songId,
            position: playlistItem.position,
        });
        await this.dbClient.execute(playlistQueries.CREATE_PLAYLIST_ITEM, [
            playlistId,
            playlistItem.songId,
            playlistItem.position,
        ]);
        this.logger.info('Playlist item created successfully', {
            playlistId,
            songId: playlistItem.songId,
            position: playlistItem.position,
        });
    }

    async deletePlaylistItemAtPosition(playlistId: string, position: number): Promise<void> {
        this.logger.debug('Deleting playlist item at position', { playlistId, position });
        await this.dbClient.execute(playlistQueries.DELETE_PLAYLIST_ITEM, [playlistId, position]);
        this.logger.info('Playlist item deleted successfully', { playlistId, position });
    }

    async getFirstPositionForPlaylist(playlistId: string): Promise<number> {
        this.logger.debug('Getting first position for playlist', { playlistId });
        const result = await this.dbClient.queryRow<PositionResult>(
            playlistQueries.FIRST_POSITION,
            [playlistId]
        );

        return Number(result.position);
    }

    async getLastPositionForPlaylist(playlistId: string): Promise<number> {
        this.logger.debug('Getting last position for playlist', { playlistId });
        const result = await this.dbClient.queryRow<PositionResult>(playlistQueries.LAST_POSITION, [
            playlistId,
        ]);

        return Number(result.position);
    }

    async getNextPositionAfter(playlistId: string, position: number): Promise<number | null> {
        this.logger.debug('Getting next position after', { playlistId, position });
        const results = await this.dbClient.query<NextPositionResult>(
            playlistQueries.NEXT_POSITION,
            [playlistId, position]
        );

        if (results.length === 0) {
            this.logger.debug('No next position found', { playlistId, position });
            return null;
        }

        return Number(results[0].position);
    }

    async updateItemPosition(
        playlistId: string,
        currentPosition: number,
        newPosition: number
    ): Promise<void> {
        this.logger.debug('Updating item position', { playlistId, currentPosition, newPosition });
        await this.dbClient.execute(playlistQueries.MOVE_PLAYLIST_ITEM, [
            newPosition,
            playlistId,
            currentPosition,
        ]);
        this.logger.info('Item position updated successfully', {
            playlistId,
            currentPosition,
            newPosition,
        });
    }

    async getItemPositionForMoveUpOperation(
        playlistId: string,
        position: number
    ): Promise<PlaylistItem | null> {
        this.logger.debug('Getting item position for move up operation', { playlistId, position });
        const results = await this.dbClient.query<PlaylistItemRow>(
            playlistQueries.SELECT_MOVE_UP_ITEM_AFTER,
            [playlistId, position]
        );

        if (results.length === 0) {
            this.logger.debug('No item found for move up operation', { playlistId, position });
            return null;
        }

        return playlistRowMapper.fromPlaylistItemRow(results[0]);
    }
}

export { PlaylistDatasource };
