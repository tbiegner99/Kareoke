import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { router } from './routes';
import { logger } from './utils/logger';

import bodyParser from 'body-parser';
import { HTTPStatus } from './utils/constants';
import { servers } from './dependencies';
import e from 'express';

const app = servers.express;
const io = servers.socketIO;
const emitter = servers.eventEmitter;
const { server } = servers;

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

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
    let currentRoom: string | null = null;
    logger.info('Client connected', { socketId: socket.id });

    socket.on('disconnect', () => {
        logger.info('Client disconnected', { socketId: socket.id });
    });

    // Add karaoke-specific event handlers here
    socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        currentRoom = roomId;
        logger.info('User joined room', { socketId: socket.id, roomId });
    });

    socket.on('leaveRoom', (roomId: string) => {
        socket.leave(roomId);
        logger.info('User left room', { socketId: socket.id, roomId });
    });

    socket.on('skipCurrentSong', (roomId: string, callback: (error?: any) => void) => {
        if (!currentRoom || currentRoom !== roomId) {
            const error = new Error('Not in the specified room');
            logger.error('Error skipping song', { error: error.message, roomId });
            return callback(error);
        }

        socket.to(roomId).emit('skipCurrentSong');
        logger.info('Current song skipped', { socketId: socket.id, roomId });
        callback();
    });
});

const port = process.env.APP_PORT || 8080;
server.listen(port, () => {
    logger.info(`Karaoke server started on port ${port}`);
});
