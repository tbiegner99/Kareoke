export interface PlaylistItem {
    position: number;
    songId: string;
    title: string;
    artist: string;
    source: string;
    filename: string;
    duration: number; // Duration in seconds
}

export interface Song {
    title: string;
    artist: string;
    source: string;
}
