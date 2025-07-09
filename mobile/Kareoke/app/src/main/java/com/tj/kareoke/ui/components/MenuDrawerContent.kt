package com.tj.kareoke.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.material3.MaterialTheme

@Composable
fun MenuDrawerContent(onOptionSelected: (Int) -> Unit) {
    val drawerWidth: Dp = 160.dp // Halved typical drawer width (default is 320.dp)
    ModalDrawerSheet(
        modifier = Modifier.width(drawerWidth).background(MaterialTheme.colorScheme.primary)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Home",
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOptionSelected(1) }
                    .padding(12.dp),
                color = Color.White
            )
            Text(
                text = "Settings",
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOptionSelected(2) }
                    .padding(12.dp),
                color = Color.White
            )
        }
    }
}
