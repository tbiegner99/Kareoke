import { useDependencies } from '../../../context/DependenciesProvider';
import { useParams } from 'react-router-dom';
import { Room } from './Room';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { BASE_VIDEO_PATH } from '../../../utils/constants';

export const RoomController = () => {
  const { services } = useDependencies();
  const { roomId } = useParams<{ roomId: string }>();
  const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
  const playlistItems = useSelector(
    (state: RootState) => state.room.playlistItems
  );
  const onLoadNextVideo = async () => {
    if (videoSrc) {
      setVideoSrc(undefined);
      services.playlist.clearCurrentPlaying(roomId!);
      return;
    }
    const item = await services.playlist.dequeue(roomId!);

    if (item) {
      setVideoSrc(
        `${BASE_VIDEO_PATH}/songs/${encodeURIComponent(item.filename)}`
      );
      await services.playlist.setCurrentPlaying(roomId!, item.songId);
    } else {
      setVideoSrc(undefined);
      await services.playlist.clearCurrentPlaying(roomId!);
      return;
    }
  };
  const onRoomEvent = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const { eventName } = event.detail;
    if (eventName === 'skipCurrentSong') {
      onLoadNextVideo();
    }
  };
  useEffect(() => {
    services.playlist.getPlaylistItems(roomId!);

    window.addEventListener('roomEvent', onRoomEvent);
    return () => {
      window.removeEventListener('roomEvent', onRoomEvent);
    };
  }, []);

  return (
    <Room
      roomId={roomId!}
      videoSrc={videoSrc}
      playlistSize={playlistItems.value?.length || 0}
      onLoadNextVideo={onLoadNextVideo}
    />
  );
};
