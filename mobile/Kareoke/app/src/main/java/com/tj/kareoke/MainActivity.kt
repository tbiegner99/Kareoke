package com.tj.kareoke

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.material3.Text
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tj.kareoke.ui.player.VLCPlayerView
import com.tj.kareoke.ui.tracks.UpcomingTracksPanel
import com.tj.kareoke.ui.theme.KareokeTheme
import androidx.compose.material3.DrawerState
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.runtime.rememberCoroutineScope
import com.tj.kareoke.ui.components.MenuBar
import com.tj.kareoke.ui.components.MenuDrawerContent
import kotlinx.coroutines.launch
import androidx.compose.ui.unit.toSize
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalDensity

class MainActivity : ComponentActivity() {
    companion object {
        const val AUTHORIZATION = "b7e8e2e2-1c2a-4e2e-8e2e-1c2a4e2e8e2e"
        const val ROOM_ID = 12345
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // val url = "https://storage.googleapis.com/exoplayer-test-media-0/BigBuckBunny_320x180.mp4"
        val url = "rtsp://192.168.2.201:4586/kareoke/$ROOM_ID/$AUTHORIZATION"
        setContent {
            KareokeTheme {
                val drawerState = rememberDrawerState(initialValue = androidx.compose.material3.DrawerValue.Closed)
                val scope = rememberCoroutineScope()
                // Handle back/exit/return button to close drawer if open
                BackHandler(enabled = drawerState.isOpen) {
                    scope.launch { drawerState.close() }
                }
                ModalNavigationDrawer(
                    drawerState = drawerState,
                    drawerContent = {
                        MenuDrawerContent { option ->
                            // Handle menu option selection here
                            // For example, close the drawer
                            scope.launch { drawerState.close() }
                            // You can add navigation or logic based on option
                        }
                    },
                    content = {
                        Column(modifier = Modifier.fillMaxSize()) {
                            MenuBar(drawerState = drawerState, scope = scope, roomId = ROOM_ID)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .fillMaxHeight()
                                    .background(Color.Black),
                                contentAlignment = Alignment.Center
                            ) {
                                VLCPlayerView(
                                    url = url,
                                    modifier = Modifier.fillMaxHeight()
                                )

                            }
                            UpcomingTracksPanel()
                        }
                    }
                )
            }
        }
    }
}
