export interface PlaylistItem {
    position: number;
    songId: string;
    title: string;
    artist: string;
    source: string;
    filename: string;
}

export interface Song {
    title: string;
    artist: string;
    source: string;
}

export interface PlaylistItemRow {
    position: string | number;
    song_id: string;
    title: string;
    artist: string;
    source: string;
    filename: string;
}
