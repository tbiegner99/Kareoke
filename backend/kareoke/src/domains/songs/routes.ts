import express from 'express';
import { controllers } from '../../dependencies';

export const songsRouter = express.Router();

// Songs routes
songsRouter.post('/', controllers.songsController.createSong);
songsRouter.post('/search', controllers.songsController.searchSong);
songsRouter.get('/', controllers.songsController.getAllSongs);
songsRouter.get('/:id', controllers.songsController.getSongById);
songsRouter.delete('/:id', controllers.songsController.deleteSongById);
songsRouter.put('/:id/playCount', controllers.songsController.updatePlayCount);
