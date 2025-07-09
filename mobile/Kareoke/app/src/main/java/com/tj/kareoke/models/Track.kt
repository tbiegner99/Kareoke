package com.tj.kareoke.models

data class Track(
    val id: String,
    val title: String,
    val artist: String? = null
)

