export enum ResultType {
    SONG = 'song',
    ARTIST = 'artist',
    TITLE = 'title',
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    resultType: ResultType;
    source: string;
    filename: string;
    plays: number;
    lastPlay: Date | null;
    duration: number;
}

export interface Artist {
    artist: string;
    count: number;
    resultType: ResultType.ARTIST;
}

export interface Title {
    title: string;
    count: number;
    resultType: ResultType.TITLE;
}

export type SearchResultObject = Song | Artist | Title;

export type SearchResult<T extends SearchResultObject = SearchResultObject> = {
    results: T[];
    total: number;
    resultType: ResultType;
};

export interface ArtistRow {
    artist: string;
    count: number;
    resultType: string;
}

export interface TitleRow {
    title: string;
    count: number;
    resultType: string;
}

export interface SongInsertParams {
    title: string;
    artist: string;
    source: string;
    filename: string;
}

// Database row interface
export interface SongRow {
    song_id: string;
    title: string;
    artist: string;
    resultType?: string;
    source: string;
    filename: string;
    plays: number;
    last_played: Date | string | null;
}

// PATCH update interface - all fields are optional
export interface SongUpdateParams {
    title?: string;
    artist?: string;
    source?: string;
    filename?: string;
}

// Helper type for update field mapping
export type SongUpdateFields = keyof SongUpdateParams;
