package com.tj.kareoke.domains.playlist


import com.tj.kareoke.utls.Constants.BACKEND_SERVER
import io.socket.client.IO
import io.socket.client.Socket
import okhttp3.ResponseBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.Converter


data class SetCurrentSongRequest(val songId: Int)

// Define Playlist API interface
interface PlaylistApi {
    @DELETE("/api/kareoke/playlist/{id}/items")
    suspend fun clearPlaylist(@Path("id") id: String): List<Playlist>
    @DELETE("/api/kareoke/playlist/{id}/items/dequeue")
    suspend fun dequeue(@Path("id") id: String): PlaylistSong?
    @GET("/api/kareoke/playlist/{id}/items/peek")
    suspend fun peek(@Path("id") id: String): PlaylistSong?


    @DELETE("/api/kareoke/playlist/{id}/current")
    suspend fun clearCurrentSong(@Path("id") id: String): Unit
    @GET("/api/kareoke/playlist/{id}/current")
    suspend fun getCurrentSong(@Path("id") id: String): PlaylistSong?

    @GET("/api/kareoke/playlist/{id}/items")
    suspend fun getPlaylistSongs(@Path("id") id: String): List<PlaylistSong>

    @PUT("/api/kareoke/playlist/{id}/current")
    suspend fun setCurrentSong(@Path("id") id:  String,@Body songId: SetCurrentSongRequest): Unit

}

// Data class for Playlist (adjust fields as needed)



class PlaylistDatasource {
    private var socket: Socket? = null;

    fun getApi() : PlaylistApi{
        val retrofit = Retrofit.Builder()
            .baseUrl(BACKEND_SERVER)
            .addConverterFactory(NullOnEmptyConverterFactory())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        return retrofit.create(PlaylistApi::class.java)
    }

    fun enterRoom(roomId: String, onEvent: (event:String, data:Any) -> Unit) {
        if(socket!=null) {
            leaveRoom(roomId)
        }
        socket = IO.socket(BACKEND_SERVER)
        socket!!.connect()
        socket!!.on(Socket.EVENT_CONNECT) {
            android.util.Log.d("PlaylistDatasource", "Socket connected to room $roomId")
        }
        socket!!.on(Socket.EVENT_CONNECT_ERROR) { args ->
            android.util.Log.e("PlaylistDatasource", "Socket connect error: ${args.joinToString()}")
        }
        socket!!.emit("joinRoom", roomId)
        socket!!.onAnyIncoming(fun (args) {
            val event = args[0].toString();
            if(args.size < 2) {
                onEvent(event, Unit)

            } else {
                val data = args[1];
                onEvent(event, data)
            }
        })

    }
    fun leaveRoom(roomId:String) {
        if(socket==null) {
            return
        }
        socket!!.emit("leaveRoom", roomId)
        socket!!.off();
        socket!!.disconnect();
    }

    suspend fun getPlaylistSongs(id: String): List<PlaylistSong> = getApi().getPlaylistSongs(id)
    suspend fun clearPlaylist(id: String): List<Playlist> = getApi().clearPlaylist(id)
    suspend fun dequeue(id: String) = getApi().dequeue(id)
    suspend fun peek(id: String): PlaylistSong? = getApi().peek(id)
    suspend fun setCurrentSong(id: String, songId: Int): Unit = getApi().setCurrentSong(id,
        SetCurrentSongRequest(songId))
    suspend fun clearCurrentSong(id: String): Unit = getApi().clearCurrentSong(id)
    suspend fun getCurrentSong(id: String): PlaylistSong? = getApi().getCurrentSong(id)
}