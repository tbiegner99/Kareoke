import { LoadingState } from '../models/LoadingState';

/**
 * Base interface for all controllers
 */
export interface BaseController {
  /**
   * Initialize the controller (load initial data, set up subscriptions, etc.)
   */
  initialize(): Promise<void> | void;

  /**
   * Cleanup resources when controller is destroyed
   */
  destroy(): void;
}

/**
 * Interface for controllers that manage a single entity
 */
export interface SingleEntityController<T> extends BaseController {
  /**
   * The current state of the entity
   */
  readonly state: LoadingState<T>;

  /**
   * Load the entity
   */
  load(): Promise<void>;

  /**
   * Refresh the entity (reload from source)
   */
  refresh(): Promise<void>;
}

/**
 * Interface for controllers that manage a collection of entities
 */
export interface CollectionController<T> extends BaseController {
  /**
   * The current state of the collection
   */
  readonly state: LoadingState<T[]>;

  /**
   * Load the collection
   */
  load(): Promise<void>;

  /**
   * Refresh the collection (reload from source)
   */
  refresh(): Promise<void>;

  /**
   * Add an item to the collection
   */
  add(item: T): Promise<void>;

  /**
   * Update an item in the collection
   */
  update(id: string, item: Partial<T>): Promise<void>;

  /**
   * Remove an item from the collection
   */
  remove(id: string): Promise<void>;
}
