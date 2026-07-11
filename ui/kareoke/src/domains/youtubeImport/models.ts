export enum ImportJobStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  READY = 'ready',
  FAILED = 'failed',
}

export interface YoutubeSearchResult {
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  channel: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

export interface StartImportParams {
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  artist: string;
  durationSeconds: number;
}

export interface ImportJob {
  jobId: string;
  youtubeId: string;
  youtubeUrl: string;
  title: string;
  artist: string;
  status: ImportJobStatus;
  percent: number;
  error: string | null;
  songId: string | null;
}
