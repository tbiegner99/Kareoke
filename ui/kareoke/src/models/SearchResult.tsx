import { PageInfo } from './PageInfo';

export interface SearchResult<T> extends PageInfo {
  results: T[];
}
