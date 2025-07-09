#!/bin/bash

# Script to run songs integration tests
echo "Running Songs Integration Tests..."

cd "$(dirname "$0")/.."

# Run the songs tests
npm test -- --testPathPatterns=songs

echo "Songs tests completed."
