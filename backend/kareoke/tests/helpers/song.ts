import { TestClient } from './api-client';

/**
 * Response types for song items
 */
export interface Song {
    id: string;
    title: string;
    artist: string;
    resultType: string;
    source: string;
    filename: string;
    plays: number;
    lastPlay: Date | null;
}

/**
 * Request types for song operations
 */
export interface CreateSongRequest {
    artist: string;
    title: string;
    source: string;
    filename: string;
}

export interface SearchSongRequest {
    query: string;
    searchMode: 'title' | 'artist' | 'text' | 'id';
    exact?: boolean;
    resultType?: 'short' | 'full';
}

export interface SearchResult {
    id?: string;
    title?: string;
    artist?: string;
    resultType: string;
    source?: string;
    filename?: string;
    plays?: number;
    lastPlay?: Date | null;
    count?: number;
}

/**
 * Song specific helper methods
 * All methods are static and take a test client as an argument
 */
export class SongHelpers {
    /**
     * Generate test data for song creation
     * @param overrides Optional overrides for default test data
     */
    static generateTestData(overrides: Partial<CreateSongRequest> = {}): CreateSongRequest {
        const timestamp = Date.now();
        const defaultData: CreateSongRequest = {
            artist: `Test Artist ${timestamp}`,
            title: `Test Song ${timestamp}`,
            source: 'test',
            filename: `test-song-${timestamp}.mp3`,
        };

        return {
            ...defaultData,
            ...overrides,
        };
    }

    /**
     * Create a new song
     * @param client The test client to use
     * @param songData The song data to create
     */
    static async createSong(
        client: TestClient,
        songData: CreateSongRequest
    ): Promise<Song & { songId: string }> {
        const response = await client.post<Song & { songId: string }>('/api/songs', songData);
        return response.data;
    }

    /**
     * Get all songs
     * @param client The test client to use
     */
    static async getAllSongs(client: TestClient): Promise<Song[]> {
        const response = await client.get<Song[]>('/api/songs');
        return response.data;
    }

    /**
     * Get a song by ID
     * @param client The test client to use
     * @param songId The song ID
     */
    static async getSongById(client: TestClient, songId: string): Promise<Song> {
        const response = await client.get<Song>(`/api/songs/${songId}`);
        return response.data;
    }

    /**
     * Delete a song by ID
     * @param client The test client to use
     * @param songId The song ID
     */
    static async deleteSong(client: TestClient, songId: string): Promise<void> {
        await client.delete<void>(`/api/songs/${songId}`);
    }

    /**
     * Safe delete that ignores errors
     * @param client The test client to use
     * @param songId The song ID
     */
    static async safeDeleteSong(client: TestClient, songId: string): Promise<void> {
        try {
            await SongHelpers.deleteSong(client, songId);
        } catch (error) {
            // Ignore errors (like 404 Not Found)
        }
    }

    /**
     * Update play count for a song
     * @param client The test client to use
     * @param songId The song ID
     */
    static async updatePlayCount(client: TestClient, songId: string): Promise<void> {
        await client.put<void>(`/api/songs/${songId}/playCount`);
    }

    /**
     * Search songs
     * @param client The test client to use
     * @param searchData The search parameters
     * @param limit Optional limit for number of results
     */
    static async searchSongs(
        client: TestClient,
        searchData: SearchSongRequest,
        limit?: number
    ): Promise<SearchResult[]> {
        const url = limit ? `/api/songs/search?limit=${limit}` : '/api/songs/search';
        const response = await client.post<SearchResult[]>(url, searchData);
        return response.data;
    }

    /**
     * Search songs by title
     * @param client The test client to use
     * @param title The title to search for
     * @param options Optional search options
     */
    static async searchSongsByTitle(
        client: TestClient,
        title: string,
        options: { exact?: boolean; limit?: number } = {}
    ): Promise<SearchResult[]> {
        return SongHelpers.searchSongs(
            client,
            {
                query: title,
                searchMode: 'title',
                exact: options.exact,
            },
            options.limit
        );
    }

    /**
     * Search songs by artist
     * @param client The test client to use
     * @param artist The artist to search for
     * @param options Optional search options
     */
    static async searchSongsByArtist(
        client: TestClient,
        artist: string,
        options: { exact?: boolean; limit?: number } = {}
    ): Promise<SearchResult[]> {
        return SongHelpers.searchSongs(
            client,
            {
                query: artist,
                searchMode: 'artist',
                exact: options.exact,
            },
            options.limit
        );
    }

    /**
     * Search songs by text (general search)
     * @param client The test client to use
     * @param text The text to search for
     * @param options Optional search options
     */
    static async searchSongsByText(
        client: TestClient,
        text: string,
        options: { exact?: boolean; limit?: number } = {}
    ): Promise<SearchResult[]> {
        return SongHelpers.searchSongs(
            client,
            {
                query: text,
                searchMode: 'text',
                exact: options.exact,
            },
            options.limit
        );
    }

    /**
     * Search song by ID
     * @param client The test client to use
     * @param songId The song ID to search for
     */
    static async searchSongById(client: TestClient, songId: string): Promise<SearchResult[]> {
        return SongHelpers.searchSongs(client, {
            query: songId,
            searchMode: 'id',
        });
    }

    /**
     * Create multiple test songs for testing
     * @param client The test client to use
     * @param count Number of songs to create
     * @param baseData Base data for songs (will be modified for each song)
     */
    static async createTestSongs(
        client: TestClient,
        count: number = 3,
        baseData: Partial<CreateSongRequest> = {}
    ): Promise<(Song & { songId: string })[]> {
        const songs: (Song & { songId: string })[] = [];

        for (let i = 0; i < count; i++) {
            const songData = SongHelpers.generateTestData({
                ...baseData,
                artist: baseData.artist || `Test Artist ${i}`,
                title: baseData.title || `Test Song ${i}`,
            });

            const createdSong = await SongHelpers.createSong(client, songData);
            songs.push(createdSong);
        }

        return songs;
    }

    /**
     * Clean up test songs by deleting them
     * @param client The test client to use
     * @param songIds Array of song IDs to delete
     */
    static async cleanupSongs(client: TestClient, songIds: string[]): Promise<void> {
        for (const songId of songIds) {
            await SongHelpers.safeDeleteSong(client, songId);
        }
    }

    /**
     * Assert that a song has the expected properties
     * @param song The song to check
     * @param expectedData The expected song data
     */
    static assertSongMatches(song: Song, expectedData: Partial<Song>): void {
        if (expectedData.title !== undefined) {
            expect(song.title).toBe(expectedData.title);
        }
        if (expectedData.artist !== undefined) {
            expect(song.artist).toBe(expectedData.artist);
        }
        if (expectedData.source !== undefined) {
            expect(song.source).toBe(expectedData.source);
        }
        if (expectedData.filename !== undefined) {
            expect(song.filename).toBe(expectedData.filename);
        }
        if (expectedData.plays !== undefined) {
            expect(song.plays).toBe(expectedData.plays);
        }
    }

    /**
     * Assert that search results contain expected songs
     * @param results The search results
     * @param expectedSongs Array of expected song data
     */
    static assertSearchResultsContain(
        results: SearchResult[],
        expectedSongs: Partial<Song>[]
    ): void {
        expectedSongs.forEach(expectedSong => {
            const found = results.find(result => {
                return (
                    (!expectedSong.title || result.title === expectedSong.title) &&
                    (!expectedSong.artist || result.artist === expectedSong.artist) &&
                    (!expectedSong.id || result.id === expectedSong.id)
                );
            });
            expect(found).toBeDefined();
        });
    }
}
