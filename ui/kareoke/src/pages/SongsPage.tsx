import React, { useState } from 'react';
import { SongsController } from '../controllers/SongsController';
import { SongsView } from '../components/SongsView/SongsView';
import { Song } from '../domains/songs/models';
import { LoadingStateGuards } from '../models/LoadingState';

/**
 * Songs Page Component
 *
 * This component follows the controller pattern:
 * - It uses the SongsController component to manage data loading and state
 * - It handles UI interactions and passes them to the controller
 * - It renders the pure SongsView component with data from the controller
 */
export const SongsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSongSelect = (song: Song) => {
    console.log('Selected song:', song);
    // Handle song selection (e.g., add to playlist, play, etc.)
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <header
        style={{
          padding: '1rem',
          textAlign: 'center',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <h1>Karaoke Songs</h1>
        <p>Browse and search through our collection of karaoke songs</p>
      </header>

      <SongsController>
        {controllerState => {
          // Handle search with the controller's search method
          const handleSearch = (query: string) => {
            if (query.trim()) {
              controllerState.search({ query, page: 1 });
            } else {
              controllerState.search({ query: undefined, page: 1 });
            }
          };

          // Handle load more
          const handleLoadMore = () => {
            if (LoadingStateGuards.isNotLoaded(controllerState.songsState)) {
              controllerState.load();
            } else {
              controllerState.loadMore();
            }
          };

          return (
            <SongsView
              songsState={controllerState.songsState}
              onSongSelect={handleSongSelect}
              onLoadMore={handleLoadMore}
              searchQuery={searchQuery}
              onSearchChange={query => {
                setSearchQuery(query);
                // Debounce search - you could add a debounce hook here
                handleSearch(query);
              }}
            />
          );
        }}
      </SongsController>
    </div>
  );
};
