import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import { PlaylistController } from '../pages/Playlist/PlaylistController';

const PlaylistDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        color='inherit'
        aria-label='open playlist'
        onClick={() => setOpen(true)}
        sx={{ ml: 1 }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor='left'
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: '98vw', sm: 600, md: 600 } } }}
      >
        <Box sx={{ width: { xs: '98vw', sm: 600, md: 600 }, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton
              onClick={() => setOpen(false)}
              aria-label='close drawer'
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <PlaylistController />
        </Box>
      </Drawer>
    </>
  );
};

export default PlaylistDrawer;
