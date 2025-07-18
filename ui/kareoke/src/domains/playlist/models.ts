export enum EnqueueMethod {
  FRONT = 'atFront',
  END = 'atEnd',
  AFTER = 'afterItem',
}
export interface EnqueueRequest {
  method: EnqueueMethod;
  songId: string;
}
export interface PlaylistItem {
  songId: string;
  title: string;
  artist: string;
  position: number;
  source: string;
  filename: string;
  duration: number;
}
