package com.tj.kareoke.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.common.reflect.TypeToken
import com.google.gson.Gson
import com.tj.kareoke.domains.playlist.PlaylistDatasource
import com.tj.kareoke.domains.playlist.PlaylistService
import com.tj.kareoke.domains.playlist.PlaylistSong
import com.tj.kareoke.models.LoadedItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class PlaylistState(
    var currentItem: LoadedItem<PlaylistSong>,
    var songs: LoadedItem<List<PlaylistSong>>,
    var roomId: LoadedItem<String>
)

class RoomViewModel() : ViewModel() {
    private val playlistService: PlaylistService = PlaylistService(PlaylistDatasource())
    private val _playlistState = MutableStateFlow(PlaylistState(
        currentItem = LoadedItem.unloaded(),
        songs = LoadedItem.unloaded(),
        roomId = LoadedItem.unloaded()
    ))
    val playlistState: StateFlow<PlaylistState> = _playlistState



    fun loadPlaylist(roomId: String) {
        _playlistState.update {
            it.copy(songs = LoadedItem.loading())
        }
        viewModelScope.launch {
            val songs = playlistService.getPlaylistSongs(roomId)
            _playlistState.update {
                it.copy(songs= LoadedItem.loaded(songs))
            }
        }
    }

    fun notifyCurrentItemUpdated(song: PlaylistSong?) {
        viewModelScope.launch {
            if (_playlistState.value.roomId.hasValue()) {
                if (song == null) {
                    playlistService.clearCurrentSong(playlistState.value.roomId.value!!)
                } else {
                    playlistService.setCurrentSong(playlistState.value.roomId.value!!, song.songId)
                }
            }
        }
    }

    fun itemFinished(roomId: String)  {
        viewModelScope.launch {
            _playlistState.update {

                if(it.currentItem.hasValue()) {
                    it.copy(currentItem = LoadedItem.unloaded())
                } else {
                    try {
                        // If current item is unloaded, dequeue the next song
                        val song = playlistService.dequeue(roomId)

                        it.copy(currentItem = LoadedItem.loaded(song))
                    } catch (e: Exception) {
                        android.util.Log.e("RoomViewModel", "Failed to dequeue playlist: $e")
                        it.copy(currentItem = LoadedItem.error(Error("Failed to dequeue playlist")))
                    }
                }
            }
        }
    }

    private fun onRoomEvent(event: String, data: Any) : Unit {
        android.util.Log.d("RoomViewModel", "Room event: $event, data: $data")
        when(event) {
            "skipCurrentSong" -> {
                if(_playlistState.value.roomId.hasValue()) {
                    itemFinished(playlistState.value.roomId.value!!)

                }

            }
            "playlistChanged" -> {
                try {
                    val gson = Gson()
                    val type = object : TypeToken<List<PlaylistSong>>() {}.type
                    val songs: List<PlaylistSong> = gson.fromJson(data.toString(), type)
                    _playlistState.update { it.copy(songs = LoadedItem.loaded(songs)) }
                } catch (e: Exception) {
                    android.util.Log.e("RoomViewModel", "Failed to parse playlistChanged data: $data", e)
                }
            }
        }
    }

    private suspend fun updateRoomId(roomId: String) {
        if(_playlistState.value.roomId.value == roomId) {
            return
        }
        if(_playlistState.value.roomId.hasValue()) {
            leaveRoom(roomId)
        }
        playlistService.clearCurrentSong(roomId)
        playlistService.enterRoom(roomId){evt:String,data:Any->onRoomEvent(evt,data )}
        _playlistState.update {
            it.copy(roomId = LoadedItem.loaded(roomId))
        }
    }

    fun enterRoom(roomId: String) {
        viewModelScope.launch {
            updateRoomId(roomId)
        }
    }

    fun leaveRoom(roomId: String) {
        viewModelScope.launch {
            if(_playlistState.value.roomId.hasValue()) {
                playlistService.leaveRoom(roomId)
                _playlistState.update {
                    it.copy(roomId = LoadedItem.unloaded())
                }
            }
        }
    }
}
