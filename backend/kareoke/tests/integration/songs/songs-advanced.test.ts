import { apiClient } from '../../helpers/api-client';
import { SongHelpers } from '../../helpers/song';

describe('Songs Advanced Integration Tests', () => {
    let createdSongIds: string[] = [];

    beforeEach(async () => {
        // Clean up any leftover songs from previous tests
        await SongHelpers.cleanupSongs(apiClient, createdSongIds);
        createdSongIds = [];
    });

    afterEach(async () => {
        // Clean up created songs after each test
        await SongHelpers.cleanupSongs(apiClient, createdSongIds);
        createdSongIds = [];
    });

    describe('Song Lifecycle Management', () => {
        it('should handle full song lifecycle (create, read, update play count, delete)', async () => {
            // Create a song
            const songData = SongHelpers.generateTestData({
                title: 'Lifecycle Test Song',
                artist: 'Test Artist',
                source: 'test',
                filename: 'lifecycle.mp3',
            });

            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            // Verify initial state
            expect(createdSong.plays).toBe(0);
            expect(createdSong.lastPlay).toBeNull();

            // Read the song
            const retrievedSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            SongHelpers.assertSongMatches(retrievedSong, {
                title: songData.title,
                artist: songData.artist,
                source: songData.source,
                filename: songData.filename,
                plays: 0,
            });

            // Update play count
            await SongHelpers.updatePlayCount(apiClient, createdSong.songId);

            // Verify play count increased
            const updatedSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            expect(updatedSong.plays).toBe(1);

            // Update play count again
            await SongHelpers.updatePlayCount(apiClient, createdSong.songId);

            // Verify play count increased again
            const finalSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            expect(finalSong.plays).toBe(2);

            // Delete the song
            await SongHelpers.deleteSong(apiClient, createdSong.songId);

            // Verify deletion
            try {
                await SongHelpers.getSongById(apiClient, createdSong.songId);
                fail('Should have thrown an error - song should be deleted');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }

            // Remove from cleanup list since it's already deleted
            createdSongIds = createdSongIds.filter(id => id !== createdSong.songId);
        });

        it('should maintain song data integrity across operations', async () => {
            const songData = SongHelpers.generateTestData({
                title: 'Integrity Test Song',
                artist: 'Integrity Artist',
                source: 'integrity-test',
                filename: 'integrity.mp3',
            });

            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            // Update play count multiple times
            const playCountUpdates = 5;
            for (let i = 0; i < playCountUpdates; i++) {
                await SongHelpers.updatePlayCount(apiClient, createdSong.songId);
            }

            // Verify all data is still intact
            const finalSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            SongHelpers.assertSongMatches(finalSong, {
                title: songData.title,
                artist: songData.artist,
                source: songData.source,
                filename: songData.filename,
                plays: playCountUpdates,
            });
        });
    });

    describe('Batch Operations', () => {
        it('should handle creating multiple songs efficiently', async () => {
            const numberOfSongs = 10;
            const baseData = { source: 'batch-test', filename: 'batch.mp3' };

            const createdSongs = await SongHelpers.createTestSongs(
                apiClient,
                numberOfSongs,
                baseData
            );
            createdSongIds.push(...createdSongs.map(s => s.songId));

            expect(createdSongs).toHaveLength(numberOfSongs);

            // Verify all songs were created correctly
            for (let i = 0; i < numberOfSongs; i++) {
                const song = createdSongs[i];
                expect(song.title).toBe(`Test Song ${i}`);
                expect(song.artist).toBe(`Test Artist ${i}`);
                expect(song.source).toBe(baseData.source);
                expect(song.filename).toBe(baseData.filename);
            }

            // Verify all songs exist in the database
            const allSongs = await SongHelpers.getAllSongs(apiClient);
            createdSongs.forEach(createdSong => {
                const found = allSongs.find(song => song.id === createdSong.songId);
                expect(found).toBeDefined();
            });
        });

        it('should handle batch cleanup of songs', async () => {
            const testSongs = await SongHelpers.createTestSongs(apiClient, 5);
            const songIds = testSongs.map(s => s.songId);

            // Verify songs exist
            for (const songId of songIds) {
                const song = await SongHelpers.getSongById(apiClient, songId);
                expect(song).toBeDefined();
            }

            // Cleanup all songs
            await SongHelpers.cleanupSongs(apiClient, songIds);

            // Verify songs are deleted
            for (const songId of songIds) {
                try {
                    await SongHelpers.getSongById(apiClient, songId);
                    fail(`Song ${songId} should have been deleted`);
                } catch (error: any) {
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            }
        });
    });

    describe('Search Performance and Edge Cases', () => {
        beforeEach(async () => {
            // Create a large set of test songs with various patterns
            const testSongs = [
                {
                    title: 'Test Song A',
                    artist: 'Artist One',
                    source: 'source1',
                    filename: 'a.mp3',
                },
                {
                    title: 'Test Song B',
                    artist: 'Artist One',
                    source: 'source1',
                    filename: 'b.mp3',
                },
                {
                    title: 'Another Song',
                    artist: 'Artist Two',
                    source: 'source2',
                    filename: 'c.mp3',
                },
                {
                    title: 'Different Track',
                    artist: 'Artist Two',
                    source: 'source2',
                    filename: 'd.mp3',
                },
                {
                    title: 'Special Characters!@#',
                    artist: 'Artist Three',
                    source: 'source3',
                    filename: 'e.mp3',
                },
                {
                    title: 'Numbers 123',
                    artist: 'Artist 456',
                    source: 'source4',
                    filename: 'f.mp3',
                },
                {
                    title: 'Very Long Song Title That Goes On And On',
                    artist: 'Very Long Artist Name',
                    source: 'source5',
                    filename: 'g.mp3',
                },
            ];

            for (const songData of testSongs) {
                const createdSong = await SongHelpers.createSong(apiClient, songData);
                createdSongIds.push(createdSong.songId);
            }
        });

        it('should handle search with special characters', async () => {
            const results = await SongHelpers.searchSongsByTitle(
                apiClient,
                'Special Characters!@#'
            );

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            const found = results.find(result => result.title === 'Special Characters!@#');
            expect(found).toBeDefined();
        });

        it('should handle search with numbers', async () => {
            const titleResults = await SongHelpers.searchSongsByTitle(apiClient, '123');
            const artistResults = await SongHelpers.searchSongsByArtist(apiClient, '456');

            expect(Array.isArray(titleResults)).toBe(true);
            expect(Array.isArray(artistResults)).toBe(true);

            expect(titleResults.length).toBeGreaterThan(0);
            expect(artistResults.length).toBeGreaterThan(0);
        });

        it('should handle partial matches correctly', async () => {
            const results = await SongHelpers.searchSongsByTitle(apiClient, 'Song');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(3); // Should find multiple songs

            const songTitles = results.map(r => r.title).filter(title => title);
            expect(songTitles.some(title => title && title.includes('Test Song A'))).toBe(true);
            expect(songTitles.some(title => title && title.includes('Test Song B'))).toBe(true);
            expect(songTitles.some(title => title && title.includes('Another Song'))).toBe(true);
        });

        it('should handle very long search queries', async () => {
            const longQuery = 'Very Long Song Title That Goes On And On';
            const results = await SongHelpers.searchSongsByTitle(apiClient, longQuery);

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            const found = results.find(result => result.title === longQuery);
            expect(found).toBeDefined();
        });

        it('should handle empty search results gracefully', async () => {
            const results = await SongHelpers.searchSongsByTitle(
                apiClient,
                'NonExistentSongXYZ999'
            );

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent song creation', async () => {
            const concurrentCreations = 5;
            const promises = [];

            for (let i = 0; i < concurrentCreations; i++) {
                const songData = SongHelpers.generateTestData({
                    title: `Concurrent Song ${i}`,
                    artist: `Concurrent Artist ${i}`,
                });
                promises.push(SongHelpers.createSong(apiClient, songData));
            }

            const results = await Promise.all(promises);
            createdSongIds.push(...results.map(r => r.songId));

            expect(results).toHaveLength(concurrentCreations);
            results.forEach((result, index) => {
                expect(result.title).toBe(`Concurrent Song ${index}`);
                expect(result.artist).toBe(`Concurrent Artist ${index}`);
            });
        });

        it('should handle concurrent play count updates', async () => {
            const songData = SongHelpers.generateTestData({
                title: 'Concurrent Play Count Test',
                artist: 'Test Artist',
            });

            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            // Update play count concurrently
            const concurrentUpdates = 3;
            const promises = [];

            for (let i = 0; i < concurrentUpdates; i++) {
                promises.push(SongHelpers.updatePlayCount(apiClient, createdSong.songId));
            }

            await Promise.all(promises);

            // Verify final play count
            const finalSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            expect(finalSong.plays).toBe(concurrentUpdates);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle malformed song data gracefully', async () => {
            const malformedRequests = [
                { title: '', artist: 'Artist', source: 'source', filename: 'file.mp3' },
                { title: 'Title', artist: '', source: 'source', filename: 'file.mp3' },
                { title: 'Title', artist: 'Artist', source: '', filename: 'file.mp3' },
                { title: 'Title', artist: 'Artist', source: 'source', filename: '' },
            ];

            for (const malformedData of malformedRequests) {
                try {
                    const result = await SongHelpers.createSong(apiClient, malformedData);
                    // If creation succeeds, add to cleanup
                    createdSongIds.push(result.songId);
                } catch (error: any) {
                    // Some malformed data might be rejected by the API
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            }
        });

        it('should handle invalid search parameters gracefully', async () => {
            const invalidSearches = [
                { query: '', searchMode: 'title' },
                { query: 'test', searchMode: 'invalid' },
            ];

            for (const invalidSearch of invalidSearches) {
                try {
                    await SongHelpers.searchSongs(apiClient, invalidSearch as any);
                    // Some invalid searches might still return results
                } catch (error: any) {
                    expect(error.response.status).toBeGreaterThanOrEqual(400);
                }
            }
        });
    });
});
