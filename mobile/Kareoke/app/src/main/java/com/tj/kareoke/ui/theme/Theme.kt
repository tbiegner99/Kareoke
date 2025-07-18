package com.tj.kareoke.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme
import androidx.tv.material3.lightColorScheme

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun KareokeTheme(
    isInDarkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val Blue1976D2 = Color(0xFF1976D2)
    val colorScheme = if (isInDarkTheme) {
        darkColorScheme(
            primary = Blue1976D2,
            secondary = Blue1976D2,
            tertiary = Blue1976D2
        )
    } else {
        lightColorScheme(
            primary = Blue1976D2,
            secondary = Blue1976D2,
            tertiary = Blue1976D2
        )
    }
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}