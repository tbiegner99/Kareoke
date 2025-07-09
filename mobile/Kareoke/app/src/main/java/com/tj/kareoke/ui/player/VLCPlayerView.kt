package com.tj.kareoke.ui.player

import android.net.Uri
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import org.videolan.libvlc.LibVLC
import org.videolan.libvlc.Media
import org.videolan.libvlc.MediaPlayer
import org.videolan.libvlc.util.VLCVideoLayout

@Composable
fun VLCPlayerView(
    url: String,
    modifier: Modifier = Modifier
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val libVLC = remember { LibVLC(context) }
    val media = Media(libVLC, Uri.parse(url))
    val mediaPlayer = remember { MediaPlayer(media) }
    val videoLayout = remember { VLCVideoLayout(context) }

    DisposableEffect(url) {

//        media.setHWDecoderEnabled(true, false)
//        media.addOption("network-caching=1500")
//        media.addOption(":rtsp-tcp")
        mediaPlayer.media = media
        mediaPlayer.attachViews(videoLayout, null, false, false)
        mediaPlayer.play()
        // Log errors if playback fails
        mediaPlayer.setEventListener { event ->
            if (event.type == MediaPlayer.Event.EncounteredError) {
                android.util.Log.e("VLCPlayerView", "Playback error encountered!")
            }
        }
        onDispose {
            mediaPlayer.stop()
            mediaPlayer.detachViews()
            mediaPlayer.release()
            libVLC.release()
        }
    }

    AndroidView(
        factory = { videoLayout },
        modifier = modifier
    )
}

