import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow,
  Add,
  MusicNote,
  ExpandMore,
  FilterList,
  Clear,
} from '@mui/icons-material';
import styles from './Search.module.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  year: number;
}

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Mock data
  const allSongs: Song[] = Array.from({ length: 100 }, (_, i) => ({
    id: `song-${i + 1}`,
    title: `Song Title ${i + 1}`,
    artist: `Artist ${Math.floor(i / 5) + 1}`,
    genre: ['Pop', 'Rock', 'R&B', 'Country', 'Hip-Hop'][i % 5],
    duration: 180 + Math.floor(Math.random() * 120),
    year: 2000 + Math.floor(Math.random() * 24),
  }));

  const genres = ['all', 'Pop', 'Rock', 'R&B', 'Country', 'Hip-Hop'];
  const years = ['all', '2020s', '2010s', '2000s', '1990s', '1980s'];

  useEffect(() => {
    const searchSongs = () => {
      setIsLoading(true);

      // Simulate API delay
      setTimeout(() => {
        let filtered = allSongs;

        // Filter by search term
        if (searchTerm) {
          filtered = filtered.filter(
            song =>
              song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              song.artist.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Filter by genre
        if (genreFilter !== 'all') {
          filtered = filtered.filter(song => song.genre === genreFilter);
        }

        // Filter by year
        if (yearFilter !== 'all') {
          const yearRanges = {
            '2020s': [2020, 2029],
            '2010s': [2010, 2019],
            '2000s': [2000, 2009],
            '1990s': [1990, 1999],
            '1980s': [1980, 1989],
          };
          const range = yearRanges[yearFilter as keyof typeof yearRanges];
          if (range) {
            filtered = filtered.filter(
              song => song.year >= range[0] && song.year <= range[1]
            );
          }
        }

        setResults(filtered.slice(0, 50)); // Limit results
        setIsLoading(false);
      }, 300);
    };

    searchSongs();
  }, [searchTerm, genreFilter, yearFilter, allSongs]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = (song: Song) => {
    console.log('Playing:', song.title);
  };

  const handleAddToPlaylist = (song: Song) => {
    console.log('Adding to playlist:', song.title);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGenreFilter('all');
    setYearFilter('all');
  };

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Box sx={{ py: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          🔍 Search Songs
        </Typography>
        <Typography
          variant='h6'
          component='p'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Find your favorite songs to add to your playlist
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search by song title or artist...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Accordion
          expanded={filtersExpanded}
          onChange={() => setFiltersExpanded(!filtersExpanded)}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <FilterList sx={{ mr: 1 }} />
            <Typography>Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={genreFilter}
                  label='Genre'
                  onChange={e => setGenreFilter(e.target.value)}
                >
                  {genres.map(genre => (
                    <MenuItem key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={yearFilter}
                  label='Year'
                  onChange={e => setYearFilter(e.target.value)}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='outlined'
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3 }}>
          <Typography variant='h6' gutterBottom>
            {isLoading ? 'Searching...' : `${results.length} songs found`}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Paper elevation={1}>
            <List>
              {results.length === 0 && !isLoading ? (
                <ListItem>
                  <ListItemText
                    primary='No songs found'
                    secondary='Try adjusting your search terms or filters'
                    sx={{ textAlign: 'center', py: 4 }}
                  />
                </ListItem>
              ) : (
                results.map(song => (
                  <ListItem key={song.id} divider>
                    <ListItemButton
                      onClick={() => handlePlay(song)}
                      sx={{ flex: 1 }}
                    >
                      <MusicNote sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={song.title}
                        secondary={`${song.artist} • ${song.year} • ${formatDuration(song.duration)}`}
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
        </Box>
      </Box>
    </Container>
  );
};

export default Search;
