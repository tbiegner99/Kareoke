import { Song } from '../../../domains/songs/models';
import { LoadedItem } from '../../../models/LoadedItem';
import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import SongList from './SongList';
import { useDependencies } from '../../../context/DependenciesProvider';
import { PageInfo } from 'models/PageInfo';
import { EnqueueMethod } from '../../../domains/playlist/models';
import { useParams } from 'react-router-dom';

export const SongsListController = ({ mini }: { mini?: boolean }) => {
  const { showToast } = useToast();
  const [songsList, setSongsList] = useState<LoadedItem<Song[]>>(
    LoadedItem.unloaded<Song[]>()
  );
  const [query, setQuery] = useState<string>('');
  const [paginationInfo, setPaginationInfo] = useState<PageInfo>({
    page: 1,
    pageSize: mini ? 5 : 20,
    itemCount: 0,
  });
  const { roomId } = useParams<{ roomId: string }>();
  const { services: Services } = useDependencies();
  const fetchSongsList = async () => {
    try {
      setSongsList(LoadedItem.loading<Song[]>(songsList.value));
      const songs = await Services.songs.getSongs(query, paginationInfo);
      setSongsList(LoadedItem.loaded<Song[]>(songs.results));
      setPaginationInfo(songs);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load songs';
      setSongsList(LoadedItem.error<Song[]>(errorMessage));
    }
  };

  useEffect(() => {
    fetchSongsList();
  }, [paginationInfo.page, paginationInfo.pageSize, query]);

  if (songsList.error) return <div>{songsList.error}</div>;
  if (!songsList.hasValue()) return <div>Loading...</div>;

  return (
    <SongList
      songs={songsList}
      searchTerm={query}
      mini={mini}
      paginationInfo={paginationInfo}
      onAddToPlaylist={async (song: Song) => {
        try {
          await Services.playlist.enqueueItem(roomId!, {
            songId: song.id,
            method: EnqueueMethod.END,
          });
          showToast({
            message: `Added "${song.title}" to playlist!`,
            severity: 'success',
            variant: 'standard',
          });
        } catch (error) {
          showToast({
            message: 'Failed to add song to playlist',
            severity: 'error',
            variant: 'filled',
          });
          console.error('Failed to add song to playlist:', error);
        }
      }}
      onPageChange={(pageInfo: PageInfo) => {
        setPaginationInfo(pageInfo);
      }}
      onSearch={(query: string) => {
        setQuery(query);
        setPaginationInfo({
          ...paginationInfo,
          page: 1,
        });
      }}
    />
  );
};
