import { Request, Response, NextFunction } from 'express';
import EventEmitter from 'events';
import { YoutubeImportService } from './service';
import { Logger } from '../../utils/logger';
import { HTTPStatus } from '../../utils/constants';
import { servers } from '../../dependencies';

interface SearchRequestBody {
    query: string;
}

interface StartImportRequestBody {
    youtubeId: string;
    youtubeUrl: string;
    title: string;
    artist: string;
    durationSeconds: number;
}

class YoutubeImportController {
    constructor(
        private youtubeImportService: YoutubeImportService,
        private logger: Logger,
        private eventEmitter: EventEmitter
    ) {
        this.eventEmitter.on('importJobChanged', data => {
            servers.socketIO.to(`import:${data.jobId}`).emit('importJobChanged', data.job);
        });
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { query } = req.body as SearchRequestBody;
            this.logger.debug('Youtube search request', { query });
            const results = await this.youtubeImportService.search(query);
            res.status(HTTPStatus.OK).send({ results });
        } catch (error) {
            this.logger.error('Error searching youtube', { error });
            next(error);
        }
    };

    startImport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body as StartImportRequestBody;
            this.logger.debug('Starting youtube import', { body });
            const job = await this.youtubeImportService.startImport(body);
            res.status(HTTPStatus.ACCEPTED).send(job);
        } catch (error) {
            this.logger.error('Error starting youtube import', { error });
            next(error);
        }
    };

    getJob = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { jobId } = req.params;
            const job = await this.youtubeImportService.getJob(jobId);
            if (!job) {
                res.sendStatus(HTTPStatus.NOT_FOUND);
                return;
            }
            res.status(HTTPStatus.OK).send(job);
        } catch (error) {
            this.logger.error('Error getting import job', { error });
            next(error);
        }
    };

    retryImport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { jobId } = req.params;
            this.logger.debug('Retrying youtube import', { jobId });
            const job = await this.youtubeImportService.retryImport(jobId);
            res.status(HTTPStatus.ACCEPTED).send(job);
        } catch (error) {
            this.logger.error('Error retrying youtube import', { error });
            next(error);
        }
    };
}

export { YoutubeImportController };
