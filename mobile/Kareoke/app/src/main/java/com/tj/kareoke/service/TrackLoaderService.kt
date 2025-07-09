package com.tj.kareoke.service

import com.tj.kareoke.data.TrackDatasource
import com.tj.kareoke.models.Track

class TrackLoaderService(private val repository: TrackDatasource) {
    suspend fun loadTracks(apiKey: String, roomId: Int): List<Track> = repository.getTracks(roomId = roomId, apiKey = apiKey)
}
