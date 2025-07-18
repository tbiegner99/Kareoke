package com.tj.kareoke.ui.player

import android.net.Uri
import androidx.annotation.OptIn
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.Placeholder
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.util.EventLogger
import androidx.media3.ui.PlayerView
import androidx.media3.exoplayer.rtsp.RtspMediaSource
import androidx.media3.exoplayer.DefaultRenderersFactory
import androidx.core.net.toUri
import androidx.media3.ui.AspectRatioFrameLayout
import com.tj.kareoke.domains.playlist.PlaylistSong

@OptIn(UnstableApi::class)
@Composable
fun ExoPlayerView(
    url: String,
    modifier: Modifier = Modifier,
    onMediaFinished: () -> Unit = { /* Default no-op */ },
    isPlaceholder: Boolean
) {

    val context = androidx.compose.ui.platform.LocalContext.current
    val exoPlayer = remember(url, context) {
        val builder = ExoPlayer.Builder(context)
        val player = builder.build()
        player.addListener(object : Player.Listener {
            override fun onPositionDiscontinuity(
                oldPosition: Player.PositionInfo,
                newPosition: Player.PositionInfo,
                reason: Int
            ) {
                super.onPositionDiscontinuity(oldPosition, newPosition, reason)
                if(isPlaceholder && reason == Player.DISCONTINUITY_REASON_AUTO_TRANSITION) {
                    onMediaFinished()
                }
            }
            override fun onPlaybackStateChanged(playbackState: Int) {
                super.onPlaybackStateChanged(playbackState)
                if (!isPlaceholder && playbackState == Player.STATE_ENDED) {
                    onMediaFinished()
                }
            }
        })
        player.apply {
            val mediaItem = MediaItem.fromUri(Uri.parse(url))
            setMediaItem(mediaItem)
            repeatMode = if(isPlaceholder)  Player.REPEAT_MODE_ALL else Player.REPEAT_MODE_OFF


            prepare()
            playWhenReady = true
        }
        player
    }

    DisposableEffect(url, context) {
        val mediaItem = MediaItem.fromUri(Uri.parse(url))
        exoPlayer.setMediaItem(mediaItem)
        exoPlayer.prepare()
        exoPlayer.play()
        onDispose {
            exoPlayer.release()
        }
    }

    AndroidView(
        factory = {
            PlayerView(context).apply {
                setPlayer(exoPlayer)
                setUseController(false)
                resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FILL
            }
        },
        modifier = modifier,
        update = { playerView ->
            playerView.setPlayer(exoPlayer)
        }
    )
}
