import { SongDatasource } from './datasource';
import { SongMapper } from './mapper';
import {
  Song,
  SongsList,
  SongSearchParams,
  SongSearchFilters,
  CreateSongData,
  UpdateSongData,
  SortBy,
  SortOrder,
} from './models';

export class SongService {
  constructor(private datasource: SongDatasource) {
    this.datasource = datasource;
  }

  /**
   * Get paginated songs with search and filtering
   */
  async getSongs(params: SongSearchParams): Promise<SongsList> {
    try {
      const apiRequest = {
        query: params.query,
        genre: params.genre,
        artist: params.artist,
        year: params.year,
        page: params.page,
        pageSize: params.pageSize,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      };

      const apiResponse = await this.datasource.getSongs(apiRequest);
      return SongMapper.toUiSongsList(apiResponse);
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw new Error('Failed to load songs. Please try again.');
    }
  }

  /**
   * Get a single song by ID
   */
  async getSongById(id: string): Promise<Song> {
    try {
      const apiResponse = await this.datasource.getSongById(id);
      return SongMapper.toUiModel(apiResponse);
    } catch (error) {
      console.error(`Error fetching song ${id}:`, error);
      throw new Error('Failed to load song. Please try again.');
    }
  }

  /**
   * Search songs with filters
   */
  async searchSongs(
    filters: SongSearchFilters,
    page = 1,
    pageSize = 20
  ): Promise<SongsList> {
    const searchParams: SongSearchParams = {
      ...filters,
      page,
      pageSize,
    };
    return this.getSongs(searchParams);
  }

  /**
   * Create a new song
   */
  async createSong(songData: CreateSongData): Promise<Song> {
    try {
      // Business logic validation
      this.validateSongData(songData);

      const apiRequest = SongMapper.toCreateApiRequest(songData);
      const apiResponse = await this.datasource.createSong(apiRequest);
      return SongMapper.toUiModel(apiResponse);
    } catch (error) {
      console.error('Error creating song:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create song. Please try again.');
    }
  }

  /**
   * Update an existing song
   */
  async updateSong(id: string, songData: UpdateSongData): Promise<Song> {
    try {
      // Business logic validation
      if (Object.keys(songData).length === 0) {
        throw new Error('No changes to update');
      }

      const apiRequest = { ...SongMapper.toUpdateApiRequest(songData), id };
      const apiResponse = await this.datasource.updateSong(apiRequest);
      return SongMapper.toUiModel(apiResponse);
    } catch (error) {
      console.error(`Error updating song ${id}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update song. Please try again.');
    }
  }

  /**
   * Delete a song
   */
  async deleteSong(id: string): Promise<void> {
    try {
      await this.datasource.deleteSong(id);
    } catch (error) {
      console.error(`Error deleting song ${id}:`, error);
      throw new Error('Failed to delete song. Please try again.');
    }
  }

  /**
   * Get songs by artist with business logic
   */
  async getSongsByArtist(
    artist: string,
    page = 1,
    pageSize = 20
  ): Promise<SongsList> {
    return this.searchSongs({ artist }, page, pageSize);
  }

  /**
   * Get recent songs (newest first)
   */
  async getRecentSongs(limit = 10): Promise<Song[]> {
    try {
      const response = await this.getSongs({
        page: 1,
        pageSize: limit,
        sortBy: SortBy.YEAR,
        sortOrder: SortOrder.DESC,
      });
      return response.songs;
    } catch (error) {
      console.error('Error fetching recent songs:', error);
      return [];
    }
  }

  /**
   * Validate song data for business rules
   */
  private validateSongData(songData: CreateSongData): void {
    if (!songData.title.trim()) {
      throw new Error('Song title is required');
    }
    if (!songData.artist.trim()) {
      throw new Error('Artist name is required');
    }
    if (!songData.genre.trim()) {
      throw new Error('Genre is required');
    }
    if (songData.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }
    if (songData.year < 1900 || songData.year > new Date().getFullYear()) {
      throw new Error('Invalid year');
    }
    if (!songData.filePath.trim()) {
      throw new Error('File path is required');
    }
  }

  /**
   * Format duration helper (can be used by components)
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Parse formatted duration back to seconds
   */
  static parseDuration(formatted: string): number {
    const [mins, secs] = formatted.split(':').map(Number);
    return (mins || 0) * 60 + (secs || 0);
  }
}
