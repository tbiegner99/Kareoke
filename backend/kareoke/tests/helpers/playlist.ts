import { TestClient } from './api-client';

/**
 * Response types for playlist items
 */
export interface PlaylistItem {
    position: number;
    songId: string;
    title: string;
    artist: string;
    source: string;
    filename: string;
}

/**
 * Request types for playlist operations
 */
export interface EnqueueRequest {
    method?: 'front' | 'end';
    songId: string;
    title: string;
    artist: string;
    source: string;
    filename: string;
}

/**
 * Playlist specific helper methods
 * All methods are static and take a test client as an argument
 */
export class PlaylistHelpers {
    /**
     * Generate test data for playlist items
     * @param overrides Optional overrides for default test data
     */
    static generateTestData(overrides: Partial<EnqueueRequest> = {}): EnqueueRequest {
        const timestamp = Date.now();
        const defaultData: EnqueueRequest = {
            method: 'end',
            songId: `test-song-${timestamp}`,
            title: `Test Song ${timestamp}`,
            artist: `Test Artist ${timestamp}`,
            source: 'test',
            filename: `test-song-${timestamp}.mp3`,
        };

        return {
            ...defaultData,
            ...overrides,
        };
    }

    /**
     * Get all playlist items for a specific playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param limit Optional limit for number of items to retrieve
     */
    static async getItems(
        client: TestClient,
        playlistId: string,
        limit?: number
    ): Promise<PlaylistItem[]> {
        const query = limit ? `?limit=${limit}` : '';
        const response = await client.get<PlaylistItem[]>(
            `/api/playlists/${playlistId}/items${query}`
        );
        return response.data;
    }

    /**
     * Add a new item to a playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param item The playlist item data
     */
    static async addItem(
        client: TestClient,
        playlistId: string,
        item: EnqueueRequest
    ): Promise<PlaylistItem[]> {
        const response = await client.post<PlaylistItem[]>(
            `/api/playlists/${playlistId}/items`,
            item
        );
        return response.data;
    }

    /**
     * Delete all items from a playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     */
    static async clear(client: TestClient, playlistId: string): Promise<void> {
        await client.delete<void>(`/api/playlists/${playlistId}/items`);
    }

    /**
     * Safe delete that ignores errors
     * @param client The test client to use
     * @param playlistId The playlist ID
     */
    static async safeClear(client: TestClient, playlistId: string): Promise<void> {
        try {
            await PlaylistHelpers.clear(client, playlistId);
        } catch (error) {
            // Ignore errors (like 404 Not Found)
        }
    }

    /**
     * Remove a specific item from a playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param position The position of the item to remove
     */
    static async removeItem(
        client: TestClient,
        playlistId: string,
        position: number
    ): Promise<PlaylistItem[]> {
        const response = await client.delete<PlaylistItem[]>(
            `/api/playlists/${playlistId}/items/${position}`
        );
        return response.data;
    }

    /**
     * Move a playlist item to a new position
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param position The current position of the item
     * @param method The movement method (front, end, upOnePosition, downOnePosition)
     */
    static async moveItem(
        client: TestClient,
        playlistId: string,
        position: number,
        method: 'front' | 'end' | 'upOnePosition' | 'downOnePosition'
    ): Promise<PlaylistItem[]> {
        const response = await client.put<PlaylistItem[]>(
            `/api/playlists/${playlistId}/items/${position}`,
            { method }
        );
        return response.data;
    }

    /**
     * Peek at the first item in the playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     */
    static async peekFirstItem(
        client: TestClient,
        playlistId: string
    ): Promise<PlaylistItem | null> {
        try {
            const response = await client.get<PlaylistItem>(
                `/api/playlists/${playlistId}/items/first`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 204) {
                return null; // Empty playlist
            }
            throw error;
        }
    }

    /**
     * Dequeue (retrieve and remove) the first item in the playlist
     * @param client The test client to use
     * @param playlistId The playlist ID
     */
    static async dequeueFirstItem(
        client: TestClient,
        playlistId: string
    ): Promise<PlaylistItem | null> {
        try {
            const response = await client.post<PlaylistItem>(
                `/api/playlists/${playlistId}/items/first`
            );
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 204) {
                return null; // Empty playlist
            }
            throw error;
        }
    }

    /**
     * Creates a playlist with multiple items for testing
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param itemCount Number of items to create
     */
    static async createTestPlaylist(
        client: TestClient,
        playlistId: string,
        itemCount: number = 3
    ): Promise<PlaylistItem[]> {
        // Clear playlist first
        await PlaylistHelpers.safeClear(client, playlistId);

        let allItems: PlaylistItem[] = [];
        for (let i = 0; i < itemCount; i++) {
            const item = PlaylistHelpers.generateTestData({
                songId: `test-song-${i}`,
                title: `Test Song ${i}`,
                artist: `Test Artist ${i}`,
            });

            const items = await PlaylistHelpers.addItem(client, playlistId, item);
            allItems = items; // Each response contains the full playlist
        }

        return allItems;
    }

    /**
     * Asserts that a playlist has the expected order of songs
     */
    static assertPlaylistOrder(items: PlaylistItem[], expectedSongIds: string[]): void {
        expect(items).toHaveLength(expectedSongIds.length);

        items.forEach((item, index) => {
            expect(item.songId).toBe(expectedSongIds[index]);
        });
    }

    /**
     * Verifies that a playlist contains specific songs (unordered)
     */
    static assertPlaylistContains(items: PlaylistItem[], expectedSongIds: string[]): void {
        const actualSongIds = items.map(item => item.songId);
        expectedSongIds.forEach(songId => {
            expect(actualSongIds).toContain(songId);
        });
    }

    /**
     * Waits for a condition to be met (useful for async operations)
     */
    static async waitFor(
        condition: () => Promise<boolean>,
        timeout: number = 5000,
        interval: number = 100
    ): Promise<boolean> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error(`Condition not met within ${timeout}ms`);
    }

    /**
     * Runs a sequence of operations on a playlist and verifies the final state
     * @param client The test client to use
     * @param playlistId The playlist ID
     * @param operations Array of operations to execute in sequence
     * @param expectedFinalOrder Expected order of song IDs after operations
     */
    static async runSequence(
        client: TestClient,
        playlistId: string,
        operations: Array<() => Promise<any>>,
        expectedFinalOrder: string[]
    ): Promise<PlaylistItem[]> {
        for (const operation of operations) {
            await operation();
        }

        const finalItems = await PlaylistHelpers.getItems(client, playlistId);
        PlaylistHelpers.assertPlaylistOrder(finalItems, expectedFinalOrder);
        return finalItems;
    }
}
