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
  TextField,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Search as SearchIcon,
  MusicNote,
} from '@mui/icons-material';
import { Song, SongSearchParams } from '../../domains/songs/models';
import { PageInfo } from '../../models';
import styles from './SongList.module.css';
import { LoadingState } from '@/types/LoadingState';

interface SongListProps {
  songs: LoadingState<Song[]>;
  paginationInfo: PageInfo;
  onSearch: (params: Partial<SongSearchParams>) => void;
}

const SongList: React.FC<SongListProps> = ({
  songs,
  paginationInfo,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    onSearch({
      query,
      page: 1,
      pageSize: paginationInfo.pageSize,
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    onSearch({
      query: searchTerm,
      page,
      pageSize: paginationInfo.pageSize,
    });
  };

  const handlePlay = (song: Song) => {
    console.log('Playing song:', song);
    // TODO: Implement play functionality
  };

  const handleAddToPlaylist = (song: Song) => {
    console.log('Adding to playlist:', song);
    // TODO: Implement add to playlist functionality
  };

  const totalPages = Math.ceil(
    paginationInfo.itemCount / paginationInfo.pageSize
  );

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          🎵 Song Library
        </Typography>
        <Typography
          variant='h6'
          component='p'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Browse and manage your song collection
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search songs or artists...'
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper elevation={1}>
          <List>
            {songs.value!.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary='No songs found'
                  secondary='Try adjusting your search terms'
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              songs.value!.map(song => (
                <ListItem key={song.id} divider>
                  <ListItemButton
                    onClick={() => handlePlay(song)}
                    sx={{ flex: 1 }}
                  >
                    <MusicNote sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={song.title}
                      secondary={`${song.artist} • ${song.formattedDuration}`}
                    />
                    <Chip
                      label={song.genre}
                      size='small'
                      color='primary'
                      variant='outlined'
                      sx={{ mr: 2 }}
                    />
                  </ListItemButton>
                  <IconButton
                    onClick={() => handlePlay(song)}
                    color='primary'
                    aria-label='play'
                  >
                    <PlayArrow />
                  </IconButton>
                  <IconButton
                    onClick={() => handleAddToPlaylist(song)}
                    color='secondary'
                    aria-label='add to playlist'
                  >
                    <Add />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={paginationInfo.page}
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SongList;
