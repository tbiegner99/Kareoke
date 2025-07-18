import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../../../domains/songs/models';
import styles from './SongList.module.css';
import { DurationUtils } from '../../../utils/DurationUtils';
import { Add, Search as SearchIcon, MusicNote } from '@mui/icons-material';

interface SongListProps {
  songs: any;
  paginationInfo: any;
  searchTerm: string;
  mini?: boolean;
  onPageChange: (pageInfo: any) => void;
  onSearch: (searchTerm: string) => void;
  onAddToPlaylist: (song: Song) => void;
}
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
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';

const SongList: React.FC<SongListProps> = ({
  songs,
  mini = false,
  paginationInfo,
  onSearch,
  searchTerm,
  onAddToPlaylist,
  onPageChange,
}) => {
  // Debounced search state
  const [localSearch, setLocalSearch] = useState(searchTerm);
  // Use number | null for browser setTimeout
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = window.setTimeout(() => {
      if (localSearch !== searchTerm) {
        onSearch(localSearch);
      }
    }, 300);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const totalPages = Math.ceil(
    paginationInfo.itemCount / paginationInfo.pageSize
  );

  let pageSizeOptions = [mini ? 5 : undefined, 10, 20, 50, 100];

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Box
        sx={{
          py: mini ? 1 : { sm: 4, xs: 2 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!mini && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='h5' component='h1' gutterBottom>
              🎵 Add Songs to Playlist
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search songs or artists...'
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Item count above results, right-aligned, with range */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            {(() => {
              const start =
                paginationInfo.itemCount === 0
                  ? 0
                  : (paginationInfo.page - 1) * paginationInfo.pageSize + 1;
              const end = Math.min(
                paginationInfo.page * paginationInfo.pageSize,
                paginationInfo.itemCount
              );
              return `Showing ${start} to ${end} of ${paginationInfo.itemCount}`;
            })()}
          </Typography>
        </Box>

        <Paper elevation={1} sx={{ flexGrow: 1 }}>
          <List
            sx={{
              maxHeight: { sm: '60vh', xs: '50vh' },
              overflowY: 'scroll',
            }}
          >
            {songs.value!.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary='No songs found'
                  secondary='Try adjusting your search terms'
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            ) : (
              songs.value!.map((song: Song) => (
                <ListItem key={song.id} divider>
                  <ListItemButton
                    sx={{
                      flex: 1,
                      p: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <MusicNote sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={song.title}
                      secondary={`${song.artist} • ${DurationUtils.formatDuration(song.duration)}`}
                    />
                  </ListItemButton>
                  <Chip
                    label={song.source}
                    size='small'
                    color='primary'
                    variant='outlined'
                    sx={{ mr: 2 }}
                  />
                  <IconButton
                    onClick={() => onAddToPlaylist(song)}
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2,
              mt: 3,
              flexWrap: 'wrap',
            }}
          >
            <Pagination
              count={totalPages}
              page={paginationInfo.page}
              onChange={(_, page) => {
                onPageChange({
                  ...paginationInfo,
                  page,
                });
              }}
              color='primary'
            />
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <InputLabel id='page-size-label'>Page Size</InputLabel>
              <Select
                labelId='page-size-label'
                value={paginationInfo.pageSize}
                label='Page Size'
                onChange={e => {
                  onPageChange({
                    ...paginationInfo,
                    pageSize: Number(e.target.value),
                    page: 1, // Reset to first page on page size change
                  });
                }}
              >
                {pageSizeOptions.map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default SongList;
