import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { PlaylistController } from '../pages/Playlist/PlaylistController';
import { Urls } from '../../utils/Urls';

const PlaylistDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <IconButton
        color='inherit'
        aria-label='open menu'
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
          <List>
            <ListItemButton
              onClick={() => {
                setOpen(false);
                navigate(Urls.import);
              }}
            >
              <ListItemIcon>
                <YouTubeIcon />
              </ListItemIcon>
              <ListItemText primary='Import from YouTube' />
            </ListItemButton>
          </List>
          {Boolean(roomId) && (
            <>
              <Divider sx={{ mb: 2 }} />
              <PlaylistController />
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default PlaylistDrawer;
