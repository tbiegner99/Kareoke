// UI models for the frontend
import { PageInfo } from '../../models';

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  year: number;
  filePath: string;
  formattedDuration: string;
  isPlaying?: boolean;
  isInPlaylist?: boolean;
}

export interface SongsList {
  songs: Song[];
  pagination: PageInfo;
}

export interface SongSearchFilters {
  query?: string;
  genre?: string;
  artist?: string;
  year?: number;
  sortBy?: 'title' | 'artist' | 'year' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface SongSearchParams extends SongSearchFilters {
  page: number;
  pageSize: number;
}

export interface CreateSongData {
  title: string;
  artist: string;
  genre: string;
  duration: number;
  year: number;
  filePath: string;
}

export interface UpdateSongData {
  title?: string;
  artist?: string;
  genre?: string;
  duration?: number;
  year?: number;
  filePath?: string;
}

// Enums for better type safety
export enum SongGenre {
  POP = 'Pop',
  ROCK = 'Rock',
  RNB = 'R&B',
  COUNTRY = 'Country',
  HIP_HOP = 'Hip-Hop',
  JAZZ = 'Jazz',
  CLASSICAL = 'Classical',
  ELECTRONIC = 'Electronic',
  FOLK = 'Folk',
  BLUES = 'Blues',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  TITLE = 'title',
  ARTIST = 'artist',
  YEAR = 'year',
  DURATION = 'duration',
}
