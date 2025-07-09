import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LoadingState,
  LoadingStateHelpers,
  LoadingStatus,
} from '../models/LoadingState';
import { Song, SongSearchParams, SongsList } from '../domains/songs/models';
import { SongService } from '../domains/songs';
import { PageInfo } from '../models';
import { services } from '../dependencies';
import { useServices } from '../context';

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
  paginationState: LoadingState<PageInfo>;
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
  // Try to get services from context, fallback to default services, then fallback to prop
  let contextServices;
  try {
    contextServices = useServices();
  } catch {
    // Context not available, use default services
    contextServices = null;
  }

  // Create default service if not provided (simple DI)
  const service = useMemo(
    () => songService || contextServices?.songs || services.songs,
    [songService, contextServices]
  );

  const [songsState, setSongsState] = useState<LoadingState<Song[]>>(
    LoadingStateHelpers.notLoaded()
  );
  const [paginationState, setPaginationState] = useState<
    LoadingState<PageInfo>
  >(LoadingStateHelpers.notLoaded());
  const [searchParams, setSearchParams] = useState<SongSearchParams>({
    page: 1,
    pageSize: 20,
  });

  const load = useCallback(async (): Promise<void> => {
    try {
      setSongsState(LoadingStateHelpers.loading(songsState.value));
      setPaginationState(LoadingStateHelpers.loading(paginationState.value));

      const result: SongsList = await service.getSongs(searchParams);

      setSongsState(LoadingStateHelpers.loaded(result.songs));
      setPaginationState(LoadingStateHelpers.loaded(result.pagination));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load songs';
      setSongsState(LoadingStateHelpers.error(errorMessage, songsState.value));
      setPaginationState(
        LoadingStateHelpers.error(errorMessage, paginationState.value)
      );
    }
  }, [service, searchParams, songsState.value, paginationState.value]);

  const refresh = useCallback(async (): Promise<void> => {
    await load();
  }, [load]);

  const search = useCallback(
    async (params: Partial<SongSearchParams>): Promise<void> => {
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
    },
    [service, searchParams, songsState.value]
  );

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
      setSongsState(LoadingStateHelpers.error(errorMessage, songsState.value));
    }
  }, [service, searchParams, songsState]);

  const add = useCallback(
    async (song: Song): Promise<void> => {
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
    },
    [songsState.value]
  );

  const update = useCallback(
    async (id: string, songData: Partial<Song>): Promise<void> => {
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
    },
    [songsState.value]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
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
    },
    [songsState.value]
  );

  // Initialize data on mount
  useEffect(() => {
    load();
  }, [load]);

  const controllerState: SongsControllerState = {
    songsState,
    paginationState,
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
