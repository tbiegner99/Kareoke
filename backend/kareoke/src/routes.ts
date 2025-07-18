import express, { Request, Response } from 'express';
import { controllers } from './dependencies';
import { HTTPStatus } from './utils/constants';
import { songsRouter } from './domains/songs/routes';
import { playlistsRouter } from './domains/playlists/routes';

export const router = express.Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    res.status(HTTPStatus.OK).json({ status: 'healthy' });
});

// Mount domain routers
router.use('/songs', songsRouter);
router.use('/playlist', playlistsRouter);