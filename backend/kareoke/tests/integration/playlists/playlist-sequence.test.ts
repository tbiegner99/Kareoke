import { apiClient } from '../../helpers/api-client';
import { PlaylistHelpers } from '../../helpers/playlist';

describe('Playlist Sequence Tests', () => {
    const testPlaylistId = 'sequence-test-playlist';

    beforeEach(async () => {
        // Clear the playlist before each test
        await PlaylistHelpers.safeClear(apiClient, testPlaylistId);
    });

    it('should handle a sequence of operations correctly using utility methods', async () => {
        // Create initial playlist with 3 songs
        await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 3);

        // Define a sequence of operations
        const operations = [
            // Add a song at the front
            () =>
                apiClient.post(
                    `/api/playlists/${testPlaylistId}/items`,
                    PlaylistHelpers.generateTestData({
                        method: 'front',
                        songId: 'front-song',
                        title: 'Front Song',
                    })
                ),

            // Get the items to find positions
            async () => {
                const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
                const thirdPosition = items[2].position;

                // Move third item to the front
                return PlaylistHelpers.moveItem(apiClient, testPlaylistId, thirdPosition, 'front');
            },

            // Dequeue the first item
            () => PlaylistHelpers.dequeueFirstItem(apiClient, testPlaylistId),

            // Add another item at the end
            () =>
                apiClient.post(
                    `/api/playlists/${testPlaylistId}/items`,
                    PlaylistHelpers.generateTestData({
                        method: 'end',
                        songId: 'end-song',
                        title: 'End Song',
                    })
                ),
        ];

        // Run the sequence and check final order
        const finalItems = await PlaylistHelpers.runSequence(
            apiClient,
            testPlaylistId,
            operations,
            ['test-song-1', 'test-song-0', 'end-song']
        );

        // Additional assertions
        expect(finalItems.length).toBe(3);
    });

    it('should verify playlist contains specific songs using utility method', async () => {
        // Create a playlist with specific songs
        await apiClient.post(
            `/api/playlists/${testPlaylistId}/items`,
            PlaylistHelpers.generateTestData({ songId: 'song-a', title: 'Song A' })
        );

        await apiClient.post(
            `/api/playlists/${testPlaylistId}/items`,
            PlaylistHelpers.generateTestData({ songId: 'song-b', title: 'Song B' })
        );

        await apiClient.post(
            `/api/playlists/${testPlaylistId}/items`,
            PlaylistHelpers.generateTestData({ songId: 'song-c', title: 'Song C' })
        );

        const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);

        // Verify specific songs are in the playlist (unordered)
        PlaylistHelpers.assertPlaylistContains(items, ['song-b', 'song-a', 'song-c']);
    });

    it('should wait for a condition to be met when modifying playlist', async () => {
        await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 1);

        // Start an async operation
        setTimeout(async () => {
            await apiClient.post(
                `/api/playlists/${testPlaylistId}/items`,
                PlaylistHelpers.generateTestData({ songId: 'delayed-song' })
            );
        }, 500);

        // Wait for the condition (playlist length = 2)
        await PlaylistHelpers.waitFor(async () => {
            const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            return items.length === 2;
        }, 2000);

        // Verify the final state
        const finalItems = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
        expect(finalItems.length).toBe(2);
        expect(finalItems.some((item: any) => item.songId === 'delayed-song')).toBe(true);
    });

    it('should handle multiple peek and dequeue operations correctly', async () => {
        await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 3);

        // Peek at first item
        const firstPeek = await PlaylistHelpers.peekFirstItem(apiClient, testPlaylistId);
        expect(firstPeek).not.toBeNull();
        expect(firstPeek?.songId).toBe('test-song-0');

        // Dequeue first item
        const dequeued = await PlaylistHelpers.dequeueFirstItem(apiClient, testPlaylistId);
        expect(dequeued).not.toBeNull();
        expect(dequeued?.songId).toBe('test-song-0');

        // Peek at new first item
        const secondPeek = await PlaylistHelpers.peekFirstItem(apiClient, testPlaylistId);
        expect(secondPeek).not.toBeNull();
        expect(secondPeek?.songId).toBe('test-song-1');

        // Verify final state
        const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
        PlaylistHelpers.assertPlaylistOrder(items, ['test-song-1', 'test-song-2']);
    });

    it('should handle removing items at different positions', async () => {
        await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 5);
        let items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);

        // Remove middle item (position 2)
        const middlePosition = items[2].position;
        await PlaylistHelpers.removeItem(apiClient, testPlaylistId, middlePosition);

        items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
        PlaylistHelpers.assertPlaylistOrder(items, [
            'test-song-0',
            'test-song-1',
            'test-song-3',
            'test-song-4',
        ]);
    });
});
