import { apiClient } from '../../helpers/api-client';
import { PlaylistHelpers } from '../../helpers/playlist';

describe('Playlist Advanced Integration Tests', () => {
    const testPlaylistId = 'advanced-test-playlist';

    beforeEach(async () => {
        // Clear the playlist before each test
        await PlaylistHelpers.safeClear(apiClient, testPlaylistId);
    });

    describe('Complex Playlist Operations', () => {
        it('should handle multiple enqueue operations correctly', async () => {
            const items = await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 5);
            expect(items).toHaveLength(5);

            const playlistItems = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(playlistItems).toHaveLength(5);

            // Verify order
            PlaylistHelpers.assertPlaylistOrder(playlistItems, [
                'test-song-0',
                'test-song-1',
                'test-song-2',
                'test-song-3',
                'test-song-4',
            ]);
        });

        it('should handle mixed enqueue methods (front, end, after)', async () => {
            // Add base item
            await apiClient.post(
                `/api/playlists/${testPlaylistId}/items`,
                PlaylistHelpers.generateTestData({ songId: 'base', title: 'Base Song' })
            );

            // Add at front
            await apiClient.post(
                `/api/playlists/${testPlaylistId}/items`,
                PlaylistHelpers.generateTestData({
                    method: 'front',
                    songId: 'front',
                    title: 'Front Song',
                })
            );

            // Add at end
            await apiClient.post(
                `/api/playlists/${testPlaylistId}/items`,
                PlaylistHelpers.generateTestData({
                    method: 'end',
                    songId: 'end',
                    title: 'End Song',
                })
            );

            const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            PlaylistHelpers.assertPlaylistOrder(items, ['front', 'base', 'end']);
        });

        it('should handle sequential move operations', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 4);

            let items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            const secondItemPosition = items[1].position;

            // Move second item to front
            await apiClient.put(`/api/playlists/${testPlaylistId}/items/${secondItemPosition}`, {
                method: 'front',
            });

            items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            PlaylistHelpers.assertPlaylistOrder(items, [
                'test-song-1',
                'test-song-0',
                'test-song-2',
                'test-song-3',
            ]);

            // Move last item up one position
            const lastItemPosition = items[3].position;
            await apiClient.put(`/api/playlists/${testPlaylistId}/items/${lastItemPosition}`, {
                method: 'upOnePosition',
            });

            items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            PlaylistHelpers.assertPlaylistOrder(items, [
                'test-song-1',
                'test-song-0',
                'test-song-3',
                'test-song-2',
            ]);
        });

        it('should handle dequeue operations on populated playlist', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 3);

            // Dequeue first item
            const dequeueResponse = await apiClient.post(
                `/api/playlists/${testPlaylistId}/items/first`
            );
            expect(dequeueResponse.status).toBe(200);
            expect(dequeueResponse.data.songId).toBe('test-song-0');

            // Verify remaining items
            const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            PlaylistHelpers.assertPlaylistOrder(items, ['test-song-1', 'test-song-2']);

            // Dequeue until empty
            await apiClient.post(`/api/playlists/${testPlaylistId}/items/first`);
            await apiClient.post(`/api/playlists/${testPlaylistId}/items/first`);

            // Should be empty now
            const emptyItems = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(emptyItems).toHaveLength(0);

            // Dequeue from empty should return 204
            const emptyDequeue = await apiClient.post(
                `/api/playlists/${testPlaylistId}/items/first`
            );
            expect(emptyDequeue.status).toBe(204);
        });

        it('should handle peek operations without modifying playlist', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 2);

            // Peek multiple times
            for (let i = 0; i < 3; i++) {
                const peekResponse = await apiClient.get(
                    `/api/playlists/${testPlaylistId}/items/first`
                );
                expect(peekResponse.status).toBe(200);
                expect(peekResponse.data.songId).toBe('test-song-0');
            }

            // Verify playlist unchanged
            const items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(items).toHaveLength(2);
            PlaylistHelpers.assertPlaylistOrder(items, ['test-song-0', 'test-song-1']);
        });

        it('should handle remove operations at different positions', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 5);

            let items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);

            // Remove middle item (index 2)
            const middlePosition = items[2].position;
            await apiClient.delete(`/api/playlists/${testPlaylistId}/items/${middlePosition}`);

            items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(items).toHaveLength(4);
            PlaylistHelpers.assertPlaylistOrder(items, [
                'test-song-0',
                'test-song-1',
                'test-song-3',
                'test-song-4',
            ]);

            // Remove first item
            const firstPosition = items[0].position;
            await apiClient.delete(`/api/playlists/${testPlaylistId}/items/${firstPosition}`);

            items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(items).toHaveLength(3);
            PlaylistHelpers.assertPlaylistOrder(items, [
                'test-song-1',
                'test-song-3',
                'test-song-4',
            ]);

            // Remove last item
            const lastPosition = items[items.length - 1].position;
            await apiClient.delete(`/api/playlists/${testPlaylistId}/items/${lastPosition}`);

            items = await PlaylistHelpers.getItems(apiClient, testPlaylistId);
            expect(items).toHaveLength(2);
            PlaylistHelpers.assertPlaylistOrder(items, ['test-song-1', 'test-song-3']);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle operations on non-existent positions gracefully', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 2);

            try {
                await apiClient.delete(`/api/playlists/${testPlaylistId}/items/999999`);
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should handle concurrent operations', async () => {
            await PlaylistHelpers.createTestPlaylist(apiClient, testPlaylistId, 1);

            // Try to dequeue concurrently
            const promises = [
                apiClient.post(`/api/playlists/${testPlaylistId}/items/first`),
                apiClient.post(`/api/playlists/${testPlaylistId}/items/first`),
                apiClient.post(`/api/playlists/${testPlaylistId}/items/first`),
            ];

            const results = await Promise.allSettled(promises);

            // At least one should succeed, others should handle empty playlist
            const successCount = results.filter(
                r => r.status === 'fulfilled' && (r.value as any).status === 200
            ).length;

            expect(successCount).toBeGreaterThanOrEqual(1);
        });

        it('should validate required fields in enqueue operations', async () => {
            const invalidRequests = [
                { method: 'end' }, // missing songId
                { songId: 'test' }, // missing method
                { method: 'afterItem', songId: 'test' }, // missing afterPosition
                {}, // missing everything
            ];

            for (const invalidRequest of invalidRequests) {
                try {
                    await apiClient.post(`/api/playlists/${testPlaylistId}/items`, invalidRequest);
                    fail(`Should have thrown an error for ${JSON.stringify(invalidRequest)}`);
                } catch (error: any) {
                    expect(error.response.status).toBe(400);
                }
            }
        });
    });
});
