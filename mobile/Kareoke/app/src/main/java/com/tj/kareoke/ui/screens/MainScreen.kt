package com.tj.kareoke.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.saveable.rememberSaveable
import com.tj.kareoke.ui.viewmodels.RoomViewModel

@Composable
fun MainScreen (
    viewModel: RoomViewModel
) {

    val roomId = rememberSaveable {
        var id = ""
        repeat(5) { id += (0..9).random().toString() }
        id
        "4"
    }

    DisposableEffect(Unit) {
        viewModel.enterRoom(roomId)
        onDispose {
            viewModel.leaveRoom(roomId)
        }
    }
    Room(viewModel,
        roomId = roomId
    )
}