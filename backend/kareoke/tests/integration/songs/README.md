# Songs Integration Tests

This directory contains integration tests for the Songs API endpoints.

## Test Structure

### Test Files

- **`songs.test.ts`** - Basic CRUD operations tests
    - Creating songs
    - Retrieving songs (all and by ID)
    - Deleting songs
    - Updating play counts

- **`songs-search.test.ts`** - Search functionality tests
    - Search by title, artist, text, and ID
    - Exact and partial matching
    - Search result limiting
    - Complex search scenarios

- **`songs-advanced.test.ts`** - Advanced integration tests
    - Full lifecycle management
    - Batch operations
    - Performance and edge cases
    - Concurrent operations
    - Error handling

### Test Helper: SongHelpers

The `SongHelpers` class provides static methods for common song operations in tests:

#### Core Operations

- `createSong(client, songData)` - Create a new song
- `getAllSongs(client)` - Get all songs
- `getSongById(client, songId)` - Get a song by ID
- `deleteSong(client, songId)` - Delete a song
- `updatePlayCount(client, songId)` - Update play count

#### Search Operations

- `searchSongs(client, searchData, limit?)` - General search
- `searchSongsByTitle(client, title, options?)` - Search by title
- `searchSongsByArtist(client, artist, options?)` - Search by artist
- `searchSongsByText(client, text, options?)` - General text search
- `searchSongById(client, songId)` - Search by ID

#### Utility Operations

- `generateTestData(overrides?)` - Generate test song data
- `createTestSongs(client, count, baseData?)` - Create multiple test songs
- `cleanupSongs(client, songIds)` - Clean up test songs
- `safeDeleteSong(client, songId)` - Delete song (ignore errors)

#### Assertion Helpers

- `assertSongMatches(song, expectedData)` - Assert song properties
- `assertSearchResultsContain(results, expectedSongs)` - Assert search results

## Usage Example

```typescript
import { apiClient } from '../../helpers/api-client';
import { SongHelpers } from '../../helpers/song';

describe('My Song Tests', () => {
    let createdSongIds: string[] = [];

    afterEach(async () => {
        await SongHelpers.cleanupSongs(apiClient, createdSongIds);
        createdSongIds = [];
    });

    it('should create and retrieve a song', async () => {
        const songData = SongHelpers.generateTestData({
            title: 'Test Song',
            artist: 'Test Artist',
        });

        const createdSong = await SongHelpers.createSong(apiClient, songData);
        createdSongIds.push(createdSong.songId);

        const retrievedSong = await SongHelpers.getSongById(apiClient, createdSong.songId);
        SongHelpers.assertSongMatches(retrievedSong, songData);
    });
});
```

## Running Tests

### Run all songs tests:

```bash
npm test -- --testPathPatterns=songs
```

### Run specific test file:

```bash
npm test tests/integration/songs/songs.test.ts
```

### Run with script:

```bash
./scripts/run-songs-tests.sh
```

## API Endpoints Covered

- `POST /api/songs` - Create song
- `GET /api/songs` - Get all songs
- `GET /api/songs/:id` - Get song by ID
- `DELETE /api/songs/:id` - Delete song
- `PUT /api/songs/:id/playCount` - Update play count
- `POST /api/songs/search` - Search songs

## Test Data Management

The tests use a cleanup strategy where:

1. Song IDs are tracked in `createdSongIds` array
2. `afterEach` hook cleans up all created songs
3. `SongHelpers.cleanupSongs()` safely deletes all test songs
4. Failed deletions are ignored to prevent test failures

This ensures test isolation and prevents database pollution.
