package com.tj.kareoke

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.lifecycle.ViewModelProvider
import com.tj.kareoke.ui.player.ExoPlayerView
import com.tj.kareoke.ui.screens.MainScreen
import com.tj.kareoke.ui.viewmodels.RoomViewModel

class MainActivity : ComponentActivity() {
    companion object {
        const val AUTHORIZATION = "b7e8e2e2-1c2a-4e2e-8e2e-1c2a4e2e8e2e"
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val viewMoel = ViewModelProvider(this)[RoomViewModel::class.java]
        setContent {
            MainScreen(viewMoel);
        }
    }
}
