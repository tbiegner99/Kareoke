package com.tj.kareoke.utls

object Constants {
    const val VIDEO_DOMAIN = "192.168.2.132"
    const val VIDEO_PROTO = "http"
     val BACKEND_SERVER = "$VIDEO_PROTO://$VIDEO_DOMAIN"
    const val SONGS_LOCATION = "songs"
    const val PLACEHOLDER_LOCATION = "placeholder"
    const val VIDEO_BASEPATH = "kareoke/video"


     val VIDEO_LOCATION = "$BACKEND_SERVER/$VIDEO_BASEPATH"
}
