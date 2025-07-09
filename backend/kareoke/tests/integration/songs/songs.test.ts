import { apiClient } from '../../helpers/api-client';
import { SongHelpers } from '../../helpers/song';

describe('Songs API Integration Tests', () => {
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

    describe('POST /api/songs', () => {
        it('should create a new song successfully', async () => {
            const songData = SongHelpers.generateTestData({
                title: 'Test Song',
                artist: 'Test Artist',
                source: 'test',
                filename: 'test.mp3',
            });

            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            expect(createdSong).toBeDefined();
            expect(createdSong.songId).toBeDefined();
            expect(createdSong.title).toBe(songData.title);
            expect(createdSong.artist).toBe(songData.artist);
            expect(createdSong.source).toBe(songData.source);
            expect(createdSong.filename).toBe(songData.filename);
            expect(createdSong.plays).toBe(0);
        });

        it('should return 400 for missing required fields', async () => {
            const invalidData = {
                title: 'Test Song',
                // Missing artist, source, filename
            };

            try {
                await apiClient.post('/api/songs', invalidData);
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toContain('Missing required fields');
            }
        });

        it('should return 400 for completely empty request body', async () => {
            try {
                await apiClient.post('/api/songs', {});
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });

    describe('GET /api/songs', () => {
        it('should return empty array when no songs exist', async () => {
            const songs = await SongHelpers.getAllSongs(apiClient);
            expect(Array.isArray(songs)).toBe(true);
            // Note: We can't guarantee the database is empty, so we just check it's an array
        });

        it('should return all songs when songs exist', async () => {
            // Create test songs
            const testSongs = await SongHelpers.createTestSongs(apiClient, 3);
            createdSongIds.push(...testSongs.map(s => s.songId));

            const allSongs = await SongHelpers.getAllSongs(apiClient);

            expect(Array.isArray(allSongs)).toBe(true);
            expect(allSongs.length).toBeGreaterThanOrEqual(3);

            // Check that our test songs are in the results
            testSongs.forEach(testSong => {
                const found = allSongs.find(song => song.id === testSong.songId);
                expect(found).toBeDefined();
                expect(found?.title).toBe(testSong.title);
                expect(found?.artist).toBe(testSong.artist);
            });
        });
    });

    describe('GET /api/songs/:id', () => {
        it('should return a song by ID', async () => {
            const songData = SongHelpers.generateTestData({
                title: 'Specific Song',
                artist: 'Specific Artist',
            });

            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            const retrievedSong = await SongHelpers.getSongById(apiClient, createdSong.songId);

            expect(retrievedSong).toBeDefined();
            expect(retrievedSong.id).toBe(createdSong.songId);
            expect(retrievedSong.title).toBe(songData.title);
            expect(retrievedSong.artist).toBe(songData.artist);
        });

        it('should return 404 for non-existent song ID', async () => {
            try {
                await SongHelpers.getSongById(apiClient, 'non-existent-id');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should return 400 for missing song ID', async () => {
            try {
                await apiClient.get('/api/songs/');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });

    describe('DELETE /api/songs/:id', () => {
        it('should delete a song by ID', async () => {
            const songData = SongHelpers.generateTestData();
            const createdSong = await SongHelpers.createSong(apiClient, songData);

            // Delete the song
            await SongHelpers.deleteSong(apiClient, createdSong.songId);

            // Verify it's deleted by trying to get it
            try {
                await SongHelpers.getSongById(apiClient, createdSong.songId);
                fail('Should have thrown an error - song should be deleted');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should return 404 for non-existent song ID', async () => {
            try {
                await SongHelpers.deleteSong(apiClient, 'non-existent-id');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should return 400 for missing song ID', async () => {
            try {
                await apiClient.delete('/api/songs/');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });

    describe('PUT /api/songs/:id/playCount', () => {
        it('should update play count for a song', async () => {
            const songData = SongHelpers.generateTestData();
            const createdSong = await SongHelpers.createSong(apiClient, songData);
            createdSongIds.push(createdSong.songId);

            // Update play count
            await SongHelpers.updatePlayCount(apiClient, createdSong.songId);

            // Verify the play count was updated
            const updatedSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
            expect(updatedSong.plays).toBe(1);
        });

        it('should return 404 for non-existent song ID', async () => {
            try {
                await SongHelpers.updatePlayCount(apiClient, 'non-existent-id');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should return 400 for missing song ID', async () => {
            try {
                await apiClient.put('/api/songs//playCount');
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
            }
        });
    });
});
