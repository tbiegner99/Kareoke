# Integration Tests

This directory contains integration tests for the Karaoke backend API.

## Setup

1. Make sure the backend server is running:

    ```bash
    npm run dev
    ```

2. Set the test environment variables in `.env.test` or as environment variables:
    ```bash
    export TEST_API_BASE_URL=http://localhost:3000
    ```

## Running Tests

Run all tests:

```bash
npm test
```

Run only integration tests:

```bash
npm run test:integration
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Test Structure

- `tests/helpers/` - Shared test utilities and API client
- `tests/utils/` - Domain-specific test utilities
- `tests/integration/playlists/` - Playlist API integration tests
- `tests/setup.ts` - Global test setup configuration

## Test Data

Tests use isolated test data and playlist IDs to avoid conflicts. Each test suite cleans up after itself.

## Environment Variables

- `TEST_API_BASE_URL` - Base URL for the API being tested (default: http://localhost:3000)
- Database connection variables (if using a separate test database)

## Writing New Tests

1. Use the `apiClient` helper for making HTTP requests
2. Use the domain-specific test utilities in `tests/utils/`
3. Follow the existing naming conventions
4. Clean up test data in `beforeEach` or `afterEach` hooks
5. Use descriptive test names that explain the expected behavior

## Playlist Test Utilities

The `PlaylistTestUtils` class provides helper methods to simplify testing playlist operations:

### Basic Utilities

- `createTestPlaylist(playlistId, itemCount)` - Creates a test playlist with the specified number of items
- `getPlaylistItems(playlistId)` - Gets all items from a playlist
- `createTestItem(overrides)` - Creates test data with specific properties
- `waitFor(condition, timeout, interval)` - Waits for a condition to be met (useful for async operations)

### Assertion Utilities

- `assertPlaylistOrder(items, expectedSongIds)` - Asserts that a playlist has the expected order of songs
- `assertPlaylistContains(items, expectedSongIds)` - Verifies that a playlist contains specific songs (unordered)

### Playlist Operations

- `moveItem(playlistId, position, method)` - Moves an item in the playlist by position
- `dequeueFirstItem(playlistId)` - Dequeues the first item from a playlist
- `peekFirstItem(playlistId)` - Peeks at the first item without removing it
- `removeItemAtPosition(playlistId, position)` - Removes a specific item by position
- `runSequence(playlistId, operations, expectedFinalOrder)` - Runs a sequence of operations on a playlist and verifies the final state

### Example Usage

```typescript
// Create a playlist with 3 items
await testUtils.playlist.createTestPlaylist('test-playlist', 3);

// Define operations sequence
const operations = [
    () =>
        apiClient.post('/api/playlists/test-playlist/items', {
            /* item data */
        }),
    () => testUtils.playlist.dequeueFirstItem('test-playlist'),
];

// Run sequence and verify final state
await testUtils.playlist.runSequence(
    'test-playlist',
    operations,
    ['song-2', 'song-3'] // expected final order
);
```
