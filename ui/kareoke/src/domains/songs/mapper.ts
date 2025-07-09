import { Song, SongsList, CreateSongData, UpdateSongData } from './models';

export class SongMapper {
  /**
   * Maps a single song from API response to UI model
   */
  static toUiModel(apiSong: any): Song {
    return {
      id: apiSong.id,
      title: apiSong.title,
      artist: apiSong.artist,
      genre: apiSong.genre,
      duration: apiSong.duration,
      year: apiSong.year,
      filePath: apiSong.filePath,
      formattedDuration: this.formatDuration(apiSong.duration),
      isPlaying: false,
      isInPlaylist: false,
    };
  }

  /**
   * Maps songs list from API response to UI model
   */
  static toUiSongsList(apiResponse: any): SongsList {
    return {
      songs: apiResponse.songs.map((song: any) => this.toUiModel(song)),
      pagination: {
        page: apiResponse.page,
        pageSize: apiResponse.pageSize,
        itemCount: apiResponse.total,
      },
    };
  }

  /**
   * Maps create song data from UI to API request
   */
  static toCreateApiRequest(uiData: CreateSongData): any {
    return {
      title: uiData.title,
      artist: uiData.artist,
      genre: uiData.genre,
      duration: uiData.duration,
      year: uiData.year,
      filePath: uiData.filePath,
    };
  }

  /**
   * Maps update song data from UI to API request
   */
  static toUpdateApiRequest(uiData: UpdateSongData): any {
    const request: any = {
      title: uiData.title,
      artist: uiData.artist,
      genre: uiData.genre,
      duration: uiData.duration,
      year: uiData.year,
      filePath: uiData.filePath,
    };

    return request;
  }

  /**
   * Formats duration from seconds to MM:SS format
   */
  private static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Maps multiple songs to UI models
   */
  static toUiModels(apiSongs: any[]): Song[] {
    return apiSongs.map(song => this.toUiModel(song));
  }
}
