import { Song, SongsList, CreateSongData, UpdateSongData } from './models';

export class SongMapper {
  /**
   * Maps a single song from API response to UI model
   */
  toSong(apiSong: any): Song {
    return {
      id: apiSong.id,
      title: apiSong.title,
      artist: apiSong.artist,
      genre: apiSong.genre,
      duration: apiSong.duration,
      year: apiSong.year,
      filePath: apiSong.filePath,
      source: apiSong.source,
    };
  }

  /**
   * Maps songs list from API response to UI model
   */
  toSongsList(apiResponse: any): SongsList {
    return {
      songs: apiResponse.songs.map((song: any) => this.toSong(song)),
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
  toCreateApiRequest(uiData: CreateSongData): any {
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
  toUpdateApiRequest(uiData: UpdateSongData): any {
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
   * Maps multiple songs to UI models
   */
  toSongs(apiSongs: any[]): Song[] {
    return apiSongs.map(song => this.toSong(song));
  }
}
