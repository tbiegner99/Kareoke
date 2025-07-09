import { Song } from '@/domains/songs/models';
import { LoadingState } from '../../models/LoadingState';
import { useEffect, useState } from 'react';
import SongList from './SongList';
import { useDependencies } from '../../context/DependenciesProvider';
import { PageInfo } from '@/models/PageInfo';

export const SongsListController = () => {
  const [songsList, setSongsList] = useState<LoadingState<Song[]>>(
    LoadingState.notLoaded<Song[]>()
  );
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    page: 1,
    pageSize: 20,
    itemCount: 0,
  });
  const { services: Services } = useDependencies();
  const fetchSongsList = async () => {
    try {
      setSongsList(LoadingState.loading<Song[]>(songsList.value));
      const songs = await Services.songs.getSongs(paginationInfo);
      setSongsList(LoadingState.loaded<Song[]>(songs.songs));
      setPaginationInfo(songs.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load songs';
      setSongsList(LoadingState.error<Song[]>(errorMessage));
    }
  };

  useEffect(() => {
    fetchSongsList();
  }, []);

  if (songsList.error) return <div>{songsList.error}</div>;
  if (!songsList.isLoaded()) return <div>Loading...</div>;

  return (
    <SongList
      songs={songsList}
      paginationInfo={paginationInfo}
      onSearch={() => {}}
    />
  );
};
