import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { MusicNote, PlaylistPlay } from '@mui/icons-material';
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const JoinRoomButton: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setRoomId('');
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d+$/.test(roomId)) {
      navigate(`/room/${roomId}/songs`);
      handleClose();
    } else {
      setError('Please enter a valid Room ID.');
    }
  };

  return (
    <>
      <Button
        variant='outlined'
        size='large'
        startIcon={<PlaylistPlay />}
        sx={{ minWidth: 160 }}
        onClick={handleOpen}
      >
        Join Room
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='join-room-modal'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 300,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Typography id='join-room-modal' variant='h6' sx={{ mb: 2 }}>
              Enter Room ID
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label='Room ID'
              value={roomId}
              onChange={handleInputChange}
              error={!!error}
              helperText={error}
              inputProps={{ maxLength: 5 }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleClose} color='secondary'>
                Cancel
              </Button>
              <Button type='submit' variant='contained'>
                Join
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

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
            to={`/room/${Math.floor(10000 + Math.random() * 90000)}`}
            startIcon={<MusicNote />}
            sx={{ minWidth: 160 }}
          >
            Start Singing
          </Button>
          <JoinRoomButton />
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
