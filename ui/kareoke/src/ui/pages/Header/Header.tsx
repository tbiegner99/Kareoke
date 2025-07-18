import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
// import { Mic } from '@mui/icons-material';
import styles from './Header.module.css';
import PlaylistDrawer from '../../components/PlaylistDrawer';

const Header: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  if (params.get('fullscreen') === 'true') {
    return null;
  }
  console.log(roomId);

  return (
    <AppBar
      position='static'
      className={styles.header}
      sx={{ background: 'primary.main', color: '#fff' }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {Boolean(roomId) && <PlaylistDrawer />}
          <Button
            color='inherit'
            startIcon={
              <span style={{ fontSize: 24, color: '#fff', lineHeight: 1 }}>
                🎤
              </span>
            }
            sx={{ ml: 1, pl: 1, pr: 2, textTransform: 'none', fontWeight: 600 }}
            aria-label='karaoke'
            onClick={() => navigate('/')}
          >
            <Typography variant='h6' component='div' sx={{ ml: 1 }}>
              Karaoke
            </Typography>
          </Button>
        </Box>
        {roomId && (
          <Typography
            variant='subtitle1'
            sx={{ ml: 2, fontWeight: 500, opacity: 0.85 }}
          >
            Room ID: <b>{roomId}</b>
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
