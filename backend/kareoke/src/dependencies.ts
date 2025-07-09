import { Pool } from 'postgresql-client';
import fs from 'fs';
import { DBClientFactory } from './utils/data/db-client-factory';
import { ConnectionOptions, PoolOptions } from './utils/data/interfaces';
import { PlaylistDatasource } from './domains/playlists/datasource';
import { SongsDatasource } from './domains/songs/datasource';
import { PlaylistService } from './domains/playlists/service';
import { SongsService } from './domains/songs/service';
import { PlaylistsController } from './domains/playlists/controller';
import { SongsController } from './domains/songs/controller';
import { logger, createDomainLogger } from './utils/logger';

const readDBPassword = (): string => {
    const { DB_PASSWORD_FILE, DB_PASSWORD } = process.env;
    if (DB_PASSWORD) {
        logger.debug('Using DB password from environment variable');
        return DB_PASSWORD;
    }
    if (DB_PASSWORD_FILE) {
        logger.debug('Reading DB password from file', { file: DB_PASSWORD_FILE });
        return fs.readFileSync(DB_PASSWORD_FILE, 'utf8').trim();
    }

    logger.error('DB_PASSWORD_FILE environment variable not defined');
    throw new Error('DB_PASSWORD_FILE must be defined');
};

const readDBUser = (): string => {
    const { DB_USER_FILE, DB_USER } = process.env;
    if (DB_USER) {
        logger.debug('Using DB user from environment variable');
        return DB_USER;
    }
    if (DB_USER_FILE) {
        logger.debug('Reading DB user from file', { file: DB_USER_FILE });
        return fs.readFileSync(DB_USER_FILE, 'utf8').trim();
    }
    logger.error('DB_USER_FILE environment variable not defined');
    throw new Error('DB_USER_FILE must be defined');
};

const dbName = process.env.DB_NAME || 'kareoke';

// Initialize database with inline configuration
logger.info('Initializing database connection', {
    host: process.env.DB_HOST || 'kareoke-db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: dbName,
});

DBClientFactory.initialize(
    {
        host: process.env.DB_HOST || 'kareoke-db',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        user: readDBUser(),
        password: readDBPassword(),
        database: dbName,
    } as ConnectionOptions,
    {
        min: 1,
        max: 10,
        idleTimeoutMillis: 15000,
        connectionTimeoutMillis: 2000,
    } as PoolOptions,
    [dbName]
);

// Create dependency chain inline
const dbClient = DBClientFactory.getClient(dbName);

// Create domain-specific loggers
const playlistLogger = createDomainLogger('playlists');
const songsLogger = createDomainLogger('songs');

export const datasources = {
    playlistDatasource: new PlaylistDatasource(dbClient, playlistLogger),
    songsDatasource: new SongsDatasource(dbClient, songsLogger),
};

const songsService = new SongsService(datasources.songsDatasource, songsLogger);

export const services = {
    playlistService: new PlaylistService(datasources.playlistDatasource, playlistLogger),
    songsService: new SongsService(datasources.songsDatasource, songsLogger),
};

export const controllers = {
    playlistsController: new PlaylistsController(
        services.playlistService,
        services.songsService,
        playlistLogger
    ),
    songsController: new SongsController(services.songsService, songsLogger),
};

// Logger exports
export const logging = {
    logger,
    createDomainLogger,
    playlistLogger,
    songsLogger,
};

export const database = {
    client: dbClient,
    factory: DBClientFactory,
    terminate: async (): Promise<void> => {
        await DBClientFactory.terminate();
    },
};

// Legacy pool export for backward compatibility
export const pool = new Pool({
    host: process.env.DB_HOST || 'kareoke-db',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: readDBUser(),
    password: readDBPassword(),
    database: process.env.DB_NAME || 'kareoke',
    min: 1,
    max: 10,
    idleTimeoutMillis: 15000,
});
