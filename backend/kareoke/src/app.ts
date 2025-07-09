import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { router } from './routes';
import { logger } from './utils/logger';

import bodyParser from 'body-parser';
import { HTTPStatus } from './utils/constants';

const app = express();
app.use(bodyParser.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
        });
    });

    next();
});

app.use('/api/kareoke', router);

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error('Application error', {
        error: err,
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });
    res.status(err.status ? err.status : HTTPStatus.SERVER_ERROR).send(
        err.message || 'Internal Server Error'
    );
};
app.use(errorHandler);

const port = process.env.APP_PORT || 8080;
app.listen(port, () => {
    logger.info(`Karaoke server started on port ${port}`);
});
