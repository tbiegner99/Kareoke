import { SongDatasource } from './datasource';
import { PageInfo } from '../../models/PageInfo';
import { Song } from './models';
import { SearchResult } from 'models/SearchResult';

export class SongService {
  constructor(private datasource: SongDatasource) {
    this.datasource = datasource;
  }

  /**
   * Get paginated songs with search and filtering
   */
  async getSongs(
    query: string,
    pageInfo: PageInfo
  ): Promise<SearchResult<Song>> {
    try {
      return await this.datasource.searchSongs(query, pageInfo);
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
      return await this.datasource.getSongById(id);
    } catch (error) {
      console.error(`Error fetching song ${id}:`, error);
      throw new Error('Failed to load song. Please try again.');
    }
  }
}
