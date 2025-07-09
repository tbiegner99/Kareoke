package com.tj.kareoke.data

import com.tj.kareoke.models.Track
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class TrackApiDatasource(private val apiBaseUrl: String) : TrackDatasource {
    private val api: TrackDatasource by lazy {
        Retrofit.Builder()
            .baseUrl(apiBaseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TrackDatasource::class.java)
    }
    override suspend fun getTracks(apiKey :String, roomId: Int): List<Track> = api.getTracks(apiKey,roomId)
}
