package com.tj.kareoke.ui.screens.main


import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.tj.kareoke.domains.playlist.PlaylistSong
import com.tj.kareoke.models.LoadedItem
import com.tj.kareoke.ui.components.MenuBar
import com.tj.kareoke.ui.player.ExoPlayerView
import com.tj.kareoke.ui.tracks.UpcomingTracksPanel
import com.tj.kareoke.utls.Constants.PLACEHOLDER_LOCATION
import com.tj.kareoke.utls.Constants.SONGS_LOCATION
import com.tj.kareoke.utls.Constants.VIDEO_BASEPATH
import com.tj.kareoke.utls.Constants.VIDEO_DOMAIN
import com.tj.kareoke.utls.Constants.VIDEO_LOCATION
import com.tj.kareoke.utls.Constants.VIDEO_PROTO
import java.net.URI


@Composable
fun VideoPlayer(currentItem: LoadedItem<PlaylistSong>, songs : LoadedItem<List<PlaylistSong>>, onMediaFinished: () -> Unit = {}) {
    var filename ="$PLACEHOLDER_LOCATION/discoball10.mp4"
    if(currentItem.hasValue()) {
        val encodedName=currentItem.value!!.filename
        //URLEncoder.encode(currentItem.value!!.filename,"UTF8")
        filename = "$SONGS_LOCATION/${encodedName}"
    }



   val url = URI(
            VIDEO_PROTO,
        VIDEO_DOMAIN,

        "/$VIDEO_BASEPATH/$filename",
       null
    ).toURL().toString()
    Column(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            ExoPlayerView(
                url = url,
                modifier = Modifier
                    .aspectRatio(16f / 9f)
                    .fillMaxWidth()
                    .background(Color.Black),
                onMediaFinished = onMediaFinished,
                isPlaceholder = !currentItem.hasValue()
            )

        }
        UpcomingTracksPanel(songs=if(songs.hasValue()) songs.value!! else emptyList(),)
    }
}