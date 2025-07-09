import { apiClient } from '../../helpers/api-client';
import { SongHelpers } from '../../helpers/song';

describe('Songs Search API Integration Tests', () => {
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

    describe('POST /api/songs/search', () => {
        beforeEach(async () => {
            // Create test songs for search tests
            const testSongs = [
                {
                    title: 'Bohemian Rhapsody',
                    artist: 'Queen',
                    source: 'test',
                    filename: 'queen1.mp3',
                },
                {
                    title: 'We Will Rock You',
                    artist: 'Queen',
                    source: 'test',
                    filename: 'queen2.mp3',
                },
                {
                    title: 'Imagine',
                    artist: 'John Lennon',
                    source: 'test',
                    filename: 'lennon1.mp3',
                },
                {
                    title: 'Hotel California',
                    artist: 'Eagles',
                    source: 'test',
                    filename: 'eagles1.mp3',
                },
            ];

            for (const songData of testSongs) {
                const createdSong = await SongHelpers.createSong(apiClient, songData);
                createdSongIds.push(createdSong.songId);
            }
        });

        it('should search songs by title', async () => {
            const results = await SongHelpers.searchSongsByTitle(apiClient, 'Bohemian');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            const found = results.find(result => result.title?.includes('Bohemian'));
            expect(found).toBeDefined();
        });

        it('should search songs by title with exact match', async () => {
            const results = await SongHelpers.searchSongsByTitle(apiClient, 'Bohemian Rhapsody', {
                exact: true,
            });

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            const found = results.find(result => result.title === 'Bohemian Rhapsody');
            expect(found).toBeDefined();
        });

        it('should search songs by artist', async () => {
            const results = await SongHelpers.searchSongsByArtist(apiClient, 'Queen');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(2);

            SongHelpers.assertSearchResultsContain(results, [
                { title: 'Bohemian Rhapsody', artist: 'Queen' },
                { title: 'We Will Rock You', artist: 'Queen' },
            ]);
        });

        it('should search songs by text (general search)', async () => {
            const results = await SongHelpers.searchSongsByText(apiClient, 'California');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            const found = results.find(result => result.title?.includes('California'));
            expect(found).toBeDefined();
        });

        it('should search songs by ID', async () => {
            // Get a song ID from our created songs
            const allSongs = await SongHelpers.getAllSongs(apiClient);
            const testSong = allSongs.find(song => song.title === 'Imagine');

            if (!testSong) {
                fail('Test song not found');
                return;
            }

            const results = await SongHelpers.searchSongById(apiClient, testSong.id);

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(1);
            expect(results[0].id).toBe(testSong.id);
        });

        it('should limit search results when limit is specified', async () => {
            const results = await SongHelpers.searchSongsByArtist(apiClient, 'Queen', { limit: 1 });

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(1);
        });

        it('should return empty array for non-matching search', async () => {
            const results = await SongHelpers.searchSongsByTitle(apiClient, 'NonExistentSong12345');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });

        it('should return 400 for missing query parameter', async () => {
            try {
                await apiClient.post('/api/songs/search', {
                    searchMode: 'title',
                    // Missing query
                });
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toContain('Missing required fields');
            }
        });

        it('should return 400 for missing searchMode parameter', async () => {
            try {
                await apiClient.post('/api/songs/search', {
                    query: 'test',
                    // Missing searchMode
                });
                fail('Should have thrown an error');
            } catch (error: any) {
                expect(error.response.status).toBe(400);
                expect(error.response.data).toContain('Missing required fields');
            }
        });

        it('should handle different search modes correctly', async () => {
            const searchModes = ['title', 'artist', 'text'];

            for (const mode of searchModes) {
                const results = await SongHelpers.searchSongs(apiClient, {
                    query: 'Queen',
                    searchMode: mode as any,
                });

                expect(Array.isArray(results)).toBe(true);
                // Results might be empty but should be an array
            }
        });

        it('should handle resultType parameter', async () => {
            const shortResults = await SongHelpers.searchSongs(apiClient, {
                query: 'Queen',
                searchMode: 'artist',
                resultType: 'short',
            });

            const fullResults = await SongHelpers.searchSongs(apiClient, {
                query: 'Queen',
                searchMode: 'artist',
                resultType: 'full',
            });

            expect(Array.isArray(shortResults)).toBe(true);
            expect(Array.isArray(fullResults)).toBe(true);
        });
    });

    describe('Complex Search Scenarios', () => {
        beforeEach(async () => {
            // Create a diverse set of test songs
            const testSongs = [
                { title: 'Love Song', artist: 'The Cure', source: 'test', filename: 'cure1.mp3' },
                {
                    title: 'Love Me Do',
                    artist: 'The Beatles',
                    source: 'test',
                    filename: 'beatles1.mp3',
                },
                {
                    title: 'All You Need Is Love',
                    artist: 'The Beatles',
                    source: 'test',
                    filename: 'beatles2.mp3',
                },
                {
                    title: 'Crazy Little Thing Called Love',
                    artist: 'Queen',
                    source: 'test',
                    filename: 'queen3.mp3',
                },
                {
                    title: 'Love Is All Around',
                    artist: 'Wet Wet Wet',
                    source: 'test',
                    filename: 'wet1.mp3',
                },
            ];

            for (const songData of testSongs) {
                const createdSong = await SongHelpers.createSong(apiClient, songData);
                createdSongIds.push(createdSong.songId);
            }
        });

        it('should find songs with common words in title', async () => {
            const results = await SongHelpers.searchSongsByTitle(apiClient, 'Love');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(5);

            // Should find all songs with "Love" in the title
            const loveSongs = results.filter(result => result.title?.includes('Love'));
            expect(loveSongs.length).toBeGreaterThanOrEqual(5);
        });

        it('should find songs by partial artist match', async () => {
            const results = await SongHelpers.searchSongsByArtist(apiClient, 'Beatles');

            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThanOrEqual(2);

            SongHelpers.assertSearchResultsContain(results, [
                { title: 'Love Me Do', artist: 'The Beatles' },
                { title: 'All You Need Is Love', artist: 'The Beatles' },
            ]);
        });

        it('should handle case-insensitive search', async () => {
            const upperCaseResults = await SongHelpers.searchSongsByTitle(apiClient, 'LOVE');
            const lowerCaseResults = await SongHelpers.searchSongsByTitle(apiClient, 'love');

            expect(upperCaseResults.length).toBeGreaterThan(0);
            expect(lowerCaseResults.length).toBeGreaterThan(0);
            expect(upperCaseResults.length).toBe(lowerCaseResults.length);
        });
    });
});
