package com.tj.kareoke.data

import com.tj.kareoke.models.Track
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * TrackDatasource defines the contract for any data source that can provide a list of tracks.
 * Implementations may fetch tracks from a remote API, local database, or other sources.
 */
interface TrackDatasource {
    /**
     * Fetches a list of tracks.
     * This is a suspending function and should be called from a coroutine.
     * @return a list of [Track] objects
     */
    @GET("room/{roomId}/tracks")
    suspend fun getTracks(
        @Header("x-api-key") apiKey: String,
        @Path("roomId") roomId: Int,

    ): List<Track>
}
