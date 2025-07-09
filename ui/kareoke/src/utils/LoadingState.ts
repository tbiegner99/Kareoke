/**
 * Generic loading state for handling async data
 */
export enum LoadingStatus {
  NOT_LOADED = 'NOT_LOADED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

export class LoadingState<T> {
  private constructor(
    private _value: T | null = null,
    private _status: LoadingStatus = LoadingStatus.NOT_LOADED,
    private _error?: string
  ) {}

  static notLoaded<T>(): LoadingState<T> {
    return new LoadingState<T>(null, LoadingStatus.NOT_LOADED);
  }
  static loading<T>(currentValue: T | null = null): LoadingState<T> {
    return new LoadingState<T>(currentValue, LoadingStatus.LOADING);
  }
  static loaded<T>(value: T): LoadingState<T> {
    return new LoadingState<T>(value, LoadingStatus.LOADED);
  }
  static error<T>(error: string): LoadingState<T> {
    return new LoadingState<T>(null, LoadingStatus.ERROR, error);
  }

  get value(): T | null {
    return this._value;
  }
  get status(): LoadingStatus {
    return this._status;
  }
  get error(): string | undefined {
    return this._error;
  }

  isNotLoaded(): boolean {
    return this._status === LoadingStatus.NOT_LOADED;
  }
  isLoading(): boolean {
    return this._status === LoadingStatus.LOADING;
  }
  isLoaded(): boolean {
    return this._status === LoadingStatus.LOADED;
  }
  isError(): boolean {
    return this._status === LoadingStatus.ERROR;
  }
  hasValue(): boolean {
    return this._value !== null;
  }
}
