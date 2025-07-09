#!/bin/bash

# Test script to verify integration test setup
set -e

echo "🧪 Verifying integration test setup..."

# Check if required dependencies are installed
echo "📦 Checking dependencies..."
npm list jest >/dev/null 2>&1 && echo "✅ Jest installed" || echo "❌ Jest not found"
npm list axios >/dev/null 2>&1 && echo "✅ Axios installed" || echo "❌ Axios not found"
npm list ts-jest >/dev/null 2>&1 && echo "✅ ts-jest installed" || echo "❌ ts-jest not found"
npm list @types/jest >/dev/null 2>&1 && echo "✅ Jest types installed" || echo "❌ Jest types not found"
npm list supertest >/dev/null 2>&1 && echo "✅ Supertest installed" || echo "❌ Supertest not found"

# Check if configuration files exist
echo ""
echo "📁 Checking configuration files..."
[[ -f "jest.config.json" ]] && echo "✅ Jest config found" || echo "❌ Jest config missing"
[[ -f "tests/setup.ts" ]] && echo "✅ Test setup found" || echo "❌ Test setup missing"
[[ -f ".env.test" ]] && echo "✅ Test env file found" || echo "❌ Test env file missing"

# Check test files
echo ""
echo "🧪 Checking test files..."
[[ -f "tests/helpers/api-client.ts" ]] && echo "✅ API client helper found" || echo "❌ API client helper missing"
[[ -f "tests/utils/playlist-utils.ts" ]] && echo "✅ Playlist utils found" || echo "❌ Playlist utils missing"
[[ -f "tests/integration/playlists/playlists.test.ts" ]] && echo "✅ Basic playlist tests found" || echo "❌ Basic playlist tests missing"
[[ -f "tests/integration/playlists/playlists-advanced.test.ts" ]] && echo "✅ Advanced playlist tests found" || echo "❌ Advanced playlist tests missing"
[[ -f "tests/integration/playlists/playlist-sequence.test.ts" ]] && echo "✅ Playlist sequence tests found" || echo "❌ Playlist sequence tests missing"

echo ""
echo "🚀 Setup verification complete!"
echo ""
echo "To run the tests:"
echo "1. Start the backend server: npm run dev"
echo "2. Run tests: npm run test:integration"
echo "3. Or run with specific environment: TEST_API_BASE_URL=http://localhost:3000 npm test"
echo ""
echo "For testing just the infrastructure without a running API server:"
echo "npm test -- --passWithNoTests"
echo ""
echo "💡 New utility functions available in PlaylistTestUtils class:"
echo "- moveItem: Move an item in the playlist"
echo "- dequeueFirstItem: Dequeue the first item from a playlist"
echo "- peekFirstItem: Peek at the first item without removing it"
echo "- removeItemAtPosition: Remove an item at a specific position"
echo "- assertPlaylistContains: Verify playlist contains specific songs"
echo "- runSequence: Run a sequence of operations on a playlist"
echo ""
echo "See tests/README.md for full documentation"
