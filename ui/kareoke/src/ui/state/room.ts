import { createSlice } from '@reduxjs/toolkit';
import { PlaylistItem } from '../../domains/playlist/models';
import { LoadedItem, LoadedItemState } from 'models/LoadedItem';

export interface RoomState {
  roomId: string | null;
  currentlyPlaying: LoadedItemState<PlaylistItem>;
  playlistItems: LoadedItemState<PlaylistItem[]>;
}

export const initialState: RoomState = {
  roomId: null,
  currentlyPlaying: LoadedItem.unloaded<PlaylistItem>().toState(),
  playlistItems: LoadedItem.unloaded<PlaylistItem[]>().toState(),
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    joinRoom: (state, action) => {
      state.roomId = action.payload.roomId;
    },
    leaveRoom: state => {
      state.roomId = null;
      state.playlistItems = LoadedItem.unloaded<PlaylistItem[]>().toState();
    },
    loadingPlaylistItems: state => {
      state.playlistItems = LoadedItem.loading(
        state.playlistItems.value
      ).toState();
    },
    playlistChanged: (state, action) => {
      state.playlistItems = LoadedItem.loaded(
        action.payload.playlistItems
      ).toState();
    },
    playStateChanged: (state, action) => {
      if (!action.payload?.currentSong) {
        state.currentlyPlaying = LoadedItem.unloaded<PlaylistItem>().toState();
        return;
      }
      state.currentlyPlaying = LoadedItem.loaded(
        action.payload.currentSong
      ).toState();
    },
    playlistLoadError: (state, action) => {
      state.playlistItems = LoadedItem.error<PlaylistItem[]>(
        action.payload
      ).toState();
    },
  },
});

export const {
  joinRoom,
  leaveRoom,
  playlistChanged,
  playStateChanged,
  loadingPlaylistItems,
  playlistLoadError,
} = roomSlice.actions;
export default roomSlice.reducer;
