#!/bin/bash

# This script runs the refactored playlist integration tests

# Change to the project directory
cd "$(dirname "$0")/.."

# Compile TypeScript files
echo "Compiling TypeScript files..."
npx tsc --noEmit tests/helpers/playlist.ts tests/integration/playlists/playlists-refactored.test.ts

# Check if compilation was successful
if [ $? -ne 0 ]; then
  echo "TypeScript compilation failed. Please fix the errors before running tests."
  exit 1
fi

# Run the tests
echo "Running refactored playlist tests..."
npm test -- -t "Playlist API Integration Tests" --testPathPattern="playlists-refactored"
