package com.tj.kareoke.ui.tracks

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import com.tj.kareoke.domains.playlist.PlaylistSong

data class TrackCardArgs(
    val track: PlaylistSong,
    val index: Int
)

@Composable
fun TrackCard(args: TrackCardArgs, onClick: () -> Unit = {}) {
    Surface(
        modifier = Modifier
            .padding(vertical = 8.dp, horizontal = 8.dp)
            .fillMaxWidth()
            .fillMaxHeight()
            .clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        color = Color.Black,
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${args.index + 1}. ${args.track.title} - ${args.track.artist}",
                color = Color.Yellow,
                fontSize = 18.sp
            )
        }
    }
}
