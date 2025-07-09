import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { MusicNote, PlaylistPlay, Search } from '@mui/icons-material';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <Container maxWidth='lg' className={styles.home}>
      <Box className={styles.hero} sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant='h2' component='h1' gutterBottom>
          🎤 Welcome to Karaoke
        </Typography>
        <Typography
          variant='h5'
          component='p'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Sing your favorite songs and create amazing playlists!
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant='contained'
            size='large'
            component={Link}
            to='/search'
            startIcon={<MusicNote />}
            sx={{ minWidth: 160 }}
          >
            Start Singing
          </Button>
          <Button
            variant='outlined'
            size='large'
            component={Link}
            to='/songs'
            startIcon={<PlaylistPlay />}
            sx={{ minWidth: 160 }}
          >
            Browse Songs
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          py: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            width: { xs: '100%', md: '320px' },
            height: '100%',
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <MusicNote color='primary' sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant='h5' component='h3' gutterBottom>
              Browse Songs
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Discover thousands of songs in our library
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            width: { xs: '100%', md: '320px' },
            height: '100%',
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <PlaylistPlay color='primary' sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant='h5' component='h3' gutterBottom>
              Create Playlists
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Build your perfect karaoke playlist
            </Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            width: { xs: '100%', md: '320px' },
            height: '100%',
            textAlign: 'center',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Search color='primary' sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant='h5' component='h3' gutterBottom>
              Search & Filter
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Find songs by title, artist, or genre
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Home;
