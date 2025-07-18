package com.tj.kareoke.domains.playlist;

class PlaylistService(private var datasource: PlaylistDatasource) {
    suspend fun getPlaylistSongs(id: String) = datasource.getPlaylistSongs(id)
    suspend fun clearPlaylist(id: String) = datasource.clearPlaylist(id)
    suspend fun dequeue(id: String) = datasource.dequeue(id)
    suspend fun leaveRoom(roomId: String) = datasource.leaveRoom(roomId)
    suspend fun enterRoom(roomId: String, onEvent: (event:String,data:Any) -> Unit) = datasource.enterRoom(roomId, onEvent)
    suspend fun setCurrentSong(id: String, songId: Int) = datasource.setCurrentSong(id, songId)
    suspend fun clearCurrentSong(id: String) = datasource.clearCurrentSong(id)
    
}
