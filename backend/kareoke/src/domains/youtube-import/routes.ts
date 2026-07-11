import express from 'express';
import { controllers } from '../../dependencies';

export const youtubeImportRouter = express.Router();

youtubeImportRouter.post('/search', controllers.youtubeImportController.search);
youtubeImportRouter.post('/import', controllers.youtubeImportController.startImport);
youtubeImportRouter.get('/import/:jobId', controllers.youtubeImportController.getJob);
youtubeImportRouter.post('/import/:jobId/retry', controllers.youtubeImportController.retryImport);
