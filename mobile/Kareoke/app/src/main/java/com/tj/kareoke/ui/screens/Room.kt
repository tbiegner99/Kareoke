package com.tj.kareoke.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import com.tj.kareoke.ui.components.MenuBar
import com.tj.kareoke.ui.components.MenuDrawerContent
import com.tj.kareoke.ui.screens.main.VideoPlayer
import com.tj.kareoke.ui.theme.KareokeTheme
import com.tj.kareoke.ui.viewmodels.RoomViewModel
import kotlinx.coroutines.launch

@Composable
fun Room(    viewModel: RoomViewModel,
             roomId:String) {
    val state = viewModel.playlistState.collectAsState().value

    LaunchedEffect(Unit) {
        viewModel.loadPlaylist(roomId)

    }
    LaunchedEffect(state.currentItem) {
        viewModel.notifyCurrentItemUpdated(state.currentItem.value)

    }
    KareokeTheme {
        val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
        val scope = rememberCoroutineScope()
        // Handle back/exit/return button to close drawer if open
        BackHandler(enabled = drawerState.isOpen) {
            scope.launch { drawerState.close() }
        }
        ModalNavigationDrawer(

            drawerState = drawerState,
            drawerContent = {
                MenuDrawerContent(currentSong = state.currentItem.value,
                    onSkip = {
                        viewModel.itemFinished(roomId)
                        scope.launch {
                            drawerState.close()
                        }
                    },
                    onClose = {
                        scope.launch { drawerState.close() }
                    },
                )
            },
            content = {
                Column(modifier = Modifier.fillMaxSize()) {
                    MenuBar(drawerState = drawerState, scope = scope, roomId = roomId,
                        )
                    if (state.songs.hasValue()) {
                        VideoPlayer(currentItem = state.currentItem, songs = state.songs,
                            onMediaFinished = {
                                viewModel.itemFinished(roomId)
                            }
                        )
                    }
                }
            }
        )
    }
}