package com.tj.kareoke.domains.playlist

data class PlaylistSong (
    val songId : Int,
    val position: Float,
    val title: String,
    val artist: String,
    val source: String,
    val filename: String,
    val duration: Float,


)

data class Playlist(
    val id: String,
    val name: String,
    val songs: List<PlaylistSong>
)