import express from 'express';
import { controllers } from '../../dependencies';

export const playlistsRouter = express.Router();

// Playlists routes
playlistsRouter.get('/:playlistId/items', controllers.playlistsController.selectPlaylistItems);
playlistsRouter.delete('/:playlistId/items', controllers.playlistsController.clearPlaylist);
playlistsRouter.post('/:playlistId/items', controllers.playlistsController.enqueueItem);
playlistsRouter.delete('/:playlistId/items/dequeue', controllers.playlistsController.dequeue);
playlistsRouter.get('/:playlistId/items/peek', controllers.playlistsController.peek);
playlistsRouter.put('/:playlistId/items/:position', controllers.playlistsController.moveItem);
playlistsRouter.delete(
    '/:playlistId/items/:position',
    controllers.playlistsController.removePlaylistItem
);
