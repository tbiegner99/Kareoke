import { useDependencies } from '../../../context/DependenciesProvider';
import { Playlist } from './Playlist';
import { useEffect } from 'react';
import { LoadedItem } from 'models/LoadedItem';
import { RootState } from 'store';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadingPlaylistItems,
  playlistChanged,
  playlistLoadError,
  playStateChanged,
} from '../../../ui/state/room';
import { useParams } from 'react-router-dom';
import { PlaylistItem } from '../../../domains/playlist/models';

export const PlaylistController = ({ mini }: { mini?: boolean }) => {
  const { services } = useDependencies();

  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch();
  const playlistItems = useSelector((state: RootState) =>
    LoadedItem.fromState<PlaylistItem[]>(state.room.playlistItems)
  );
  const currentlyPlaying = useSelector((state: RootState) =>
    LoadedItem.fromState(state.room.currentlyPlaying)
  );

  const loadPlaylistItems = async () => {
    try {
      dispatch(loadingPlaylistItems());
      const items = await services.playlist.getPlaylistItems(roomId!);
      dispatch(playlistChanged({ playlistItems: items }));
    } catch (error) {
      dispatch(
        playlistLoadError(
          error instanceof Error ? error.message : 'Unknown error'
        )
      );
    }
  };
  const loadCurrentlyPlaying = async () => {
    try {
      const item = await services.playlist.getCurrentlyPlaying(roomId!);
      if (item) {
        dispatch(playStateChanged({ currentSong: item }));
      }
    } catch (error) {
      console.error('Failed to load currently playing item:', error);
    }
  };
  const handleRemove = async (position: number) => {
    try {
      await services.playlist.removePlaylistItem(roomId!, position);
      loadPlaylistItems();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };
  const handleClear = async () => {
    try {
      await services.playlist.clearPlaylist(roomId!);
      loadPlaylistItems();
    } catch (error) {
      console.error('Failed to clear playlist:', error);
    }
  };
  useEffect(() => {
    loadPlaylistItems();
    loadCurrentlyPlaying();
  }, []);
  return (
    <Playlist
      songs={playlistItems}
      currentlyPlaying={currentlyPlaying}
      onSkip={() => {
        services.rooms.skipCurrentSong(roomId!);
        const event = new CustomEvent('roomEvent', {
          detail: {
            eventName: 'skipCurrentSong',
            data: {},
            roomId,
          },
        });
        window.dispatchEvent(event);
      }}
      mini={mini}
      onDelete={handleRemove}
      onDeleteAll={handleClear}
      onMoveItem={async (position: number, newPosition: number) => {
        dispatch(
          playlistChanged(
            LoadedItem.loaded(
              playlistItems
                .value!.map(item => {
                  if (item.position === position) {
                    return { ...item, position: newPosition };
                  }
                  return item;
                })
                .sort((a, b) => a.position - b.position)
            )
          )
        );
        await services.playlist.moveItem(roomId!, position, newPosition);
        const items = await services.playlist.getPlaylistItems(roomId!);
        dispatch(playlistChanged(LoadedItem.loaded(items)));
      }}
    />
  );
};
