import React, { useState, useEffect, useCallback } from 'react';
import {
  LoadingState,
  LoadingStatus,
} from '../models/LoadingState';
import { Song, SongSearchParams } from '../domains/songs/models';
import { SongService } from '../domains/songs';

/**
 * Props for the SongsController component
 */
export interface SongsControllerProps {
  songService?: SongService;
  children: (controllerState: SongsControllerState) => React.ReactNode;
}

/**
 * State and handlers provided by the SongsController
 */
export interface SongsControllerState {
  songsState: LoadingState<Song[]>;
  searchParams: SongSearchParams;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (params: Partial<SongSearchParams>) => Promise<void>;
  loadMore: () => Promise<void>;
  add: (song: Song) => Promise<void>;
  update: (id: string, songData: Partial<Song>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Songs Controller Component
 * 
 * This is a React component that manages songs data state and provides
 * handlers for CRUD operations. It follows the controller pattern by
 * accepting a render prop that receives the controller state.
 */
export const SongsController: React.FC<SongsControllerProps> = ({
  songService,
  children,
}) => {
  // Use DI to get the song service if not provided
  const service = songService || Services.getSongService();
  
  const [songsState, setSongsState] = useState<LoadingState<Song[]>>(
    LoadingStateHelpers.notLoaded()
  );
  const [searchParams, setSearchParams] = useState<SongSearchParams>({
    page: 1,
    pageSize: 20,
  });

  const load = useCallback(async (): Promise<void> => {
    try {
      setSongsState(LoadingStateHelpers.loading(songsState.value));

      const result = await service.getSongs(searchParams);

      setSongsState(LoadingStateHelpers.loaded(result.songs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load songs';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [service, searchParams, songsState.value]);

  const refresh = useCallback(async (): Promise<void> => {
    await load();
  }, [load]);

  const search = useCallback(async (params: Partial<SongSearchParams>): Promise<void> => {
    const newSearchParams = { ...searchParams, ...params };
    setSearchParams(newSearchParams);
    
    try {
      setSongsState(LoadingStateHelpers.loading(songsState.value));

      const result = await service.getSongs(newSearchParams);

      setSongsState(LoadingStateHelpers.loaded(result.songs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search songs';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [service, searchParams, songsState.value]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (songsState.status === LoadingStatus.LOADING) {
      return; // Prevent multiple simultaneous loads
    }

    try {
      const nextPage = searchParams.page! + 1;
      setSongsState(LoadingStateHelpers.loading(songsState.value));

      const result = await service.getSongs({
        ...searchParams,
        page: nextPage,
      });

      const currentSongs = songsState.value || [];
      const newSongs = [...currentSongs, ...result.songs];

      setSearchParams(prev => ({ ...prev, page: nextPage }));
      setSongsState(LoadingStateHelpers.loaded(newSongs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load more songs';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [service, searchParams, songsState]);

  const add = useCallback(async (song: Song): Promise<void> => {
    try {
      const currentSongs = songsState.value || [];
      const newSongs = [...currentSongs, song];
      setSongsState(LoadingStateHelpers.loaded(newSongs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add song';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [songsState.value]);

  const update = useCallback(async (id: string, songData: Partial<Song>): Promise<void> => {
    try {
      const currentSongs = songsState.value || [];
      const updatedSongs = currentSongs.map(song =>
        song.id === id ? { ...song, ...songData } : song
      );
      setSongsState(LoadingStateHelpers.loaded(updatedSongs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update song';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [songsState.value]);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      const currentSongs = songsState.value || [];
      const filteredSongs = currentSongs.filter(song => song.id !== id);
      setSongsState(LoadingStateHelpers.loaded(filteredSongs));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove song';
      setSongsState(
        LoadingStateHelpers.error(errorMessage, songsState.value)
      );
    }
  }, [songsState.value]);

  // Initialize data on mount
  useEffect(() => {
    load();
  }, [load]);

  const controllerState: SongsControllerState = {
    songsState,
    searchParams,
    load,
    refresh,
    search,
    loadMore,
    add,
    update,
    remove,
  };

  return <>{children(controllerState)}</>;
};
