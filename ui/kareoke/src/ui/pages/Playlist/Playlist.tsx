import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
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
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Delete,
  DragHandle,
  Clear,
  MusicNote,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PlaylistItem } from '../../../domains/playlist/models';
import { LoadedItem } from 'models/LoadedItem';
import styles from './Playlist.module.css';
import { DurationUtils } from '../../../utils/DurationUtils';

type PlaylistProps = {
  mini?: boolean;
  currentlyPlaying: LoadedItem<PlaylistItem>;
  songs: LoadedItem<PlaylistItem[]>;
  onSkip: () => void;
  onDelete: (position: number) => void;
  onDeleteAll: () => void;
  onMoveItem: (currentPosition: number, newPosition: number) => void;
};

// If you get type errors for react-beautiful-dnd, run: npm install --save-dev @types/react-beautiful-dnd
// eslint-disable-next-line object-curly-newline
export const Playlist: React.FC<PlaylistProps> = ({
  songs,

  currentlyPlaying,
  onSkip,
  mini = false,
  onDelete,
  onDeleteAll,
  onMoveItem,
}) => {
  const onMoveUp = (position: number, index: number) => {
    if (index === 0) return;
    if (index === 1) {
      onMoveItem(position, songs.value![0].position - 1);
      return;
    }
    const newPosition =
      (songs.value![index - 1].position + songs.value![index - 2].position) / 2;
    onMoveItem(position, newPosition);
  };
  const onMoveDown = (song: PlaylistItem, index: number) => {
    if (index === songs.value!.length - 1) return;
    if (index === songs.value!.length - 2) {
      onMoveItem(
        song.position,
        songs.value![songs.value!.length - 1].position + 1
      );
      return;
    }
    const newPosition =
      (songs.value![index + 1].position + songs.value![index + 2].position) / 2;
    onMoveItem(song.position, newPosition);
  };
  // DnD handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    const currentItemPosition = songs.value![from].position;
    if (from !== to) {
      if (to === 0) {
        onMoveItem(currentItemPosition, songs.value![0].position - 1);
      } else if (to === songs.value!.length - 1) {
        onMoveItem(
          currentItemPosition,
          songs.value![songs.value!.length - 1].position + 1
        );
      } else {
        const newPosition =
          (songs.value![to].position + songs.value![to + 1].position) / 2;
        onMoveItem(currentItemPosition, newPosition);
      }
    }
  };

  const getTotalDuration = () => {
    return songs.value!.reduce(
      (total, song) => total + (song.duration || 0),
      0
    );
  };

  return (
    <Container maxWidth='lg' className={styles.container}>
      <Box sx={{ py: 0 }}>
        {!mini && (
          <Box sx={{ pt: 3 }}>
            <Typography variant='h5' component='h1' gutterBottom>
              📋 Current Playlist
            </Typography>
          </Box>
        )}
        {currentlyPlaying.hasValue() && (
          <Paper
            elevation={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              mb: 2,
              mt: 1,
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MusicNote sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant='subtitle1' fontWeight={600}>
                  Now Playing
                </Typography>
                <Typography variant='body1'>
                  {currentlyPlaying.value!.title} {' • '}
                  {currentlyPlaying.value!.artist} {' • '}
                  {DurationUtils.formatDuration(
                    currentlyPlaying.value!.duration
                  )}
                </Typography>
              </Box>
            </Box>
            <IconButton
              color='error'
              aria-label='remove current'
              onClick={onSkip}
              sx={{ ml: 2 }}
            >
              <Delete />
            </IconButton>
          </Paper>
        )}

        {!songs.hasValue() && !songs.isError() && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {songs.isError() && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
            }}
          >
            <ErrorOutlineIcon color='error' sx={{ fontSize: 48, mb: 2 }} />
            <Alert severity='error'>{songs.error}</Alert>
          </Box>
        )}
        {songs.hasValue() && (
          <>
            <Paper elevation={1}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <Typography variant='h6' sx={{ color: 'inherit' }}>
                  {songs.value!.length} songs •{' '}
                  {DurationUtils.formatDuration(getTotalDuration())} total
                </Typography>
                <Button
                  variant='contained'
                  color='error'
                  startIcon={<Clear />}
                  onClick={onDeleteAll}
                  disabled={songs.value!.length === 0}
                >
                  Purge
                </Button>
              </Box>
              <Divider />
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId='playlist'>
                  {(provided: DroppableProvided) => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={mini ? styles.miniList : undefined}
                    >
                      {songs.value!.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary='No songs in playlist'
                            secondary='Add some songs to get started!'
                            sx={{ textAlign: 'center', py: 4 }}
                          />
                        </ListItem>
                      ) : (
                        songs.value!.map((song, index) => (
                          <Draggable
                            key={song.songId + '_' + song.position}
                            draggableId={song.songId + '_' + song.position}
                            index={index}
                          >
                            {(
                              provided: DraggableProvided,
                              snapshot: DraggableStateSnapshot
                            ) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                divider
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: snapshot.isDragging
                                    ? 'rgba(255, 255, 255, 0.6)'
                                    : 'white',
                                }}
                              >
                                <Box
                                  sx={{ mr: 1 }}
                                  {...provided.dragHandleProps}
                                >
                                  <DragHandle />
                                </Box>
                                <Box
                                  sx={{
                                    minWidth: 32,
                                    textAlign: 'center',
                                  }}
                                >
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ margin: 0 }}
                                  >
                                    {index + 1}
                                  </Typography>
                                </Box>
                                <ListItemButton
                                  sx={{
                                    flex: 1,
                                    p: 0,
                                    bgcolor: 'transparent',
                                  }}
                                >
                                  <MusicNote
                                    sx={{ mr: 2, color: 'primary.main' }}
                                  />
                                  <ListItemText
                                    primary={song.title}
                                    secondary={`${song.artist} • ${DurationUtils.formatDuration(song.duration)}`}
                                  />
                                </ListItemButton>
                                {/* Move Up/Down Buttons */}
                                <IconButton
                                  size='small'
                                  aria-label='move up'
                                  disabled={index === 0}
                                  onClick={() => onMoveUp(song.position, index)}
                                >
                                  <ArrowUpward fontSize='inherit' />
                                </IconButton>
                                <IconButton
                                  size='small'
                                  aria-label='move down'
                                  disabled={index === songs.value!.length - 1}
                                  onClick={() => onMoveDown(song, index)}
                                >
                                  <ArrowDownward fontSize='inherit' />
                                </IconButton>
                                <IconButton
                                  onClick={() => onDelete(song.position)}
                                  color='error'
                                  aria-label='remove'
                                >
                                  <Delete />
                                </IconButton>
                              </ListItem>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};
