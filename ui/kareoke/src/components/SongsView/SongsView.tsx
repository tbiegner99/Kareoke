import React from 'react';
import { LoadingState } from '../../models/LoadingState';
import { Song } from '../../domains/songs/models';
import styles from './SongsView.module.css';

export interface SongsViewProps {
  songsState: LoadingState<Song[]>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSongSelect: (song: Song) => void;
  onLoadMore: () => void;
}

/**
 * SongsView - Pure View Component
 *
 * This component is responsible only for rendering the UI.
 * It receives all data and handlers as props and doesn't manage any state.
 */
export const SongsView: React.FC<SongsViewProps> = ({
  songsState,
  searchQuery,
  onSearchChange,
  onSongSelect,
  onLoadMore,
}) => {
  return (
    <div className={styles.container}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <input
          type='text'
          placeholder='Search songs...'
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {songsState.isNotLoaded() && (
          <div className={styles.message}>
            <p>Ready to load songs...</p>
          </div>
        )}

        {songsState.isLoading() && (
          <div className={styles.loading}>
            <p>Loading songs...</p>
          </div>
        )}

        {songsState.isError() && (
          <div className={styles.error}>
            <p>Error: {songsState.error}</p>
            <button onClick={onLoadMore} className={styles.retryButton}>
              Retry
            </button>
          </div>
        )}

        {songsState.isLoaded() && (
          <>
            {songsState.value?.length === 0 ? (
              <div className={styles.empty}>
                <p>No songs found</p>
              </div>
            ) : (
              <>
                <div className={styles.songsList}>
                  {songsState.value?.map(song => (
                    <div
                      key={song.id}
                      className={styles.songItem}
                      onClick={() => onSongSelect(song)}
                    >
                      <div className={styles.songInfo}>
                        <h3 className={styles.songTitle}>{song.title}</h3>
                        <p className={styles.songArtist}>{song.artist}</p>
                        {song.genre && (
                          <span className={styles.songGenre}>{song.genre}</span>
                        )}
                        {song.year && (
                          <span className={styles.songYear}>{song.year}</span>
                        )}
                      </div>
                      {song.duration && (
                        <div className={styles.songDuration}>
                          {Math.floor(song.duration / 60)}:
                          {String(song.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.loadMoreSection}>
                  <button
                    onClick={onLoadMore}
                    className={styles.loadMoreButton}
                    disabled={songsState.isLoading()}
                  >
                    {songsState.isLoading() ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
