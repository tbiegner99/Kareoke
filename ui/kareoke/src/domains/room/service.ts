import { RoomDatasource } from './datasource';
import { RoomEventHandler } from './models';

export class RoomService {
  private datasource: RoomDatasource;

  constructor(datasource: RoomDatasource) {
    this.datasource = datasource;
  }

  joinRoom(roomId: string, roomEventHandler: RoomEventHandler) {
    this.datasource.joinRoom(roomId, roomEventHandler);
  }

  leaveRoom(roomId: string, roomEventHandler: RoomEventHandler) {
    this.datasource.leaveRoom(roomId, roomEventHandler);
  }

  skipCurrentSong(roomId: string): Promise<void> {
    return this.datasource.skipCurrentSong(roomId);
  }

  // Future: add more room-related business logic here (video state, user presence, etc)
}
