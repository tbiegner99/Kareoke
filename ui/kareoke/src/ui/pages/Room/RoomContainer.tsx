import { Outlet, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDependencies } from '../../../context/DependenciesProvider';
import { useAppDispatch } from '../../../ui/hooks/redux';
import {
  joinRoom as joinRoomAction,
  leaveRoom,
  playlistChanged,
  playStateChanged,
} from '../../state/room';
export const RoomContainer = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { services } = useDependencies();
  const dispatch = useAppDispatch();

  const RoomsService = services.rooms;
  const roomEventHandler = (eventName: string, data: any) => {
    const event = new CustomEvent('roomEvent', {
      detail: {
        eventName,
        data,
        roomId,
      },
    });
    window.dispatchEvent(event);
    switch (eventName) {
      case 'playlistChanged':
        console.log('Playlist changed:', data);
        dispatch(playlistChanged({ playlistItems: data }));
        break;
      case 'playingStateChanged':
        console.log('Playing state changed:', data.song);
        dispatch(playStateChanged({ currentSong: data.song }));
        break;
    }
  };
  const joinRoom = async () => {
    if (!roomId) return;
    await RoomsService.joinRoom(roomId, roomEventHandler);
    dispatch(joinRoomAction(roomId));
  };
  useEffect(() => {
    joinRoom();
    return () => {
      RoomsService.leaveRoom(roomId!, roomEventHandler);
      dispatch(leaveRoom());
    };
  }, [roomId]);

  return <Outlet />;
};
