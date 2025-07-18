import { Socket } from 'socket.io-client';
import { RoomEventHandler } from './models';

export class RoomDatasource {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  joinRoom(roomId: string, roomEventHandler: RoomEventHandler) {
    this.socket.emit('joinRoom', roomId);

    this.socket.onAny(roomEventHandler);
  }

  leaveRoom(roomId: string, roomEventHandler: RoomEventHandler) {
    this.socket.emit('leaveRoom', roomId);
    this.socket.offAny(roomEventHandler);
  }
  skipCurrentSong(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('skipCurrentSong', roomId, (error: any) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }
}
