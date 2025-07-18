/**
 * Generic loading state for handling async data
 */
export enum LoadingState {
  NOT_LOADED = 'NOT_LOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export interface LoadedItemState<T> {
  value: T | null;
  status: LoadingState;
  error?: string;
}

export class LoadedItem<T> {
  private constructor(
    private _value: T | null = null,
    private _status: LoadingState = LoadingState.NOT_LOADED,
    private _error?: string
  ) {}

  static fromState<T>(state: LoadedItemState<T>): LoadedItem<T> {
    return new LoadedItem<T>(state.value, state.status, state.error);
  }

  static unloaded<T>(initialValue?: T): LoadedItem<T> {
    return LoadedItem.notLoaded<T>(initialValue);
  }
  static notLoaded<T>(value?: T): LoadedItem<T> {
    return new LoadedItem<T>(value ?? null, LoadingState.NOT_LOADED);
  }
  static loading<T>(currentValue: T | null = null): LoadedItem<T> {
    return new LoadedItem<T>(currentValue, LoadingState.LOADING);
  }
  static loaded<T>(value: T): LoadedItem<T> {
    return new LoadedItem<T>(value, LoadingState.LOADED);
  }
  static error<T>(error: string): LoadedItem<T> {
    return new LoadedItem<T>(null, LoadingState.ERROR, error);
  }

  toState(): LoadedItemState<T> {
    return {
      value: this._value,
      status: this._status,
      error: this._error,
    };
  }

  get value(): T | null {
    return this._value;
  }
  get status(): LoadingState {
    return this._status;
  }
  get error(): string | undefined {
    return this._error;
  }

  isNotLoaded(): boolean {
    return this._status === LoadingState.NOT_LOADED;
  }
  isLoading(): boolean {
    return this._status === LoadingState.LOADING;
  }
  isLoaded(): boolean {
    return this._status === LoadingState.LOADED;
  }
  isError(): boolean {
    return this._status === LoadingState.ERROR;
  }
  hasValue(): boolean {
    return this._value !== null;
  }
}
