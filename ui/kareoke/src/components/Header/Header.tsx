import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/songs', label: 'Songs' },
    { path: '/playlist', label: 'Playlist' },
    { path: '/search', label: 'Search' },
  ];

  return (
    <AppBar position='static' className={styles.header}>
      <Toolbar>
        <IconButton
          size='large'
          edge='start'
          color='inherit'
          aria-label='karaoke'
          sx={{ mr: 2 }}
        >
          <MusicNote />
        </IconButton>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          Karaoke
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map(item => (
            <Button
              key={item.path}
              color='inherit'
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                color: 'white',
                borderColor:
                  location.pathname === item.path ? 'white' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
