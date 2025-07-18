package com.tj.kareoke.ui.tracks

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.unit.dp
import com.tj.kareoke.domains.playlist.PlaylistSong



@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UpcomingTracksPanel(modifier: Modifier = Modifier, songs:List<PlaylistSong>) {

    Surface(
        modifier = modifier.height(40.dp)
            .fillMaxWidth(),
        shape = RectangleShape,
        color = Color.Black
    ) {
        LazyRow(modifier = Modifier.fillMaxSize()) {
                itemsIndexed(songs) { index, song ->
                    TrackCard(
                        args = TrackCardArgs(track = song, index = index)
                    )
                }
            }

    }
}
