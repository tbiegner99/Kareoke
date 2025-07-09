import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Delete,
  DragHandle,
  Add,
  Clear,
  Save,
  MusicNote,
} from '@mui/icons-material';
import styles from './Playlist.module.css';

interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  isPlaying?: boolean;
}

const Playlist: React.FC = () => {
  const [songs, setSongs] = useState<PlaylistSong[]>([
    { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', duration: 355 },
    { id: '2', title: 'Sweet Caroline', artist: 'Neil Diamond', duration: 203 },
    {
      id: '3',
      title: "Don't Stop Believin'",
      artist: 'Journey',
      duration: 251,
    },
  ]);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = (songId: string) => {
    setCurrentSong(songId);
    console.log('Playing song:', songId);
  };

  const handleRemove = (songId: string) => {
    setSongs(songs.filter(song => song.id !== songId));
    if (currentSong === songId) {
      setCurrentSong(null);
    }
  };

  const handleClear = () => {
    setSongs([]);
    setCurrentSong(null);
  };

  const handleSave = () => {
    if (playlistName.trim()) {
      console.log('Saving playlist:', playlistName, songs);
      setSaveDialogOpen(false);
      setPlaylistName('');
      // In real app, this would save to backend
    }
  };

  const getTotalDuration = () => {
    return songs.reduce((total, song) => total + song.duration, 0);
  };

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          📋 Current Playlist
        </Typography>
        <Typography
          variant='h6'
          component='p'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Manage your karaoke queue
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => console.log('Add songs')}
          >
            Add Songs
          </Button>
          <Button
            variant='outlined'
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            disabled={songs.length === 0}
          >
            Save Playlist
          </Button>
          <Button
            variant='outlined'
            color='error'
            startIcon={<Clear />}
            onClick={handleClear}
            disabled={songs.length === 0}
          >
            Clear All
          </Button>
        </Box>

        <Paper elevation={1}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant='h6'>
              {songs.length} songs • {formatDuration(getTotalDuration())} total
            </Typography>
          </Box>
          <Divider />
          <List>
            {songs.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary='No songs in playlist'
                  secondary='Add some songs to get started!'
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              songs.map((song, index) => (
                <ListItem key={song.id} divider>
                  <IconButton sx={{ mr: 1 }} disabled>
                    <DragHandle />
                  </IconButton>
                  <Box sx={{ minWidth: 32, textAlign: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      {index + 1}
                    </Typography>
                  </Box>
                  <ListItemButton
                    onClick={() => handlePlay(song.id)}
                    sx={{
                      flex: 1,
                      bgcolor:
                        currentSong === song.id
                          ? 'action.selected'
                          : 'transparent',
                    }}
                  >
                    <MusicNote sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={song.title}
                      secondary={`${song.artist} • ${formatDuration(song.duration)}`}
                    />
                    {currentSong === song.id && (
                      <Chip
                        label='Playing'
                        size='small'
                        color='primary'
                        sx={{ mr: 2 }}
                      />
                    )}
                  </ListItemButton>
                  <IconButton
                    onClick={() => handlePlay(song.id)}
                    color='primary'
                    aria-label='play'
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    onClick={() => handleRemove(song.id)}
                    color='error'
                    aria-label='remove'
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Box>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Playlist Name'
            fullWidth
            variant='outlined'
            value={playlistName}
            onChange={e => setPlaylistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Playlist;
