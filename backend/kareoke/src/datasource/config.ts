import { ConnectionOptions, PoolOptions } from '../utils/data/interfaces.js';

const readEnvVar = (envVar: string, fileVar: string): string => {
    const value = process.env[envVar];
    if (value) {
        return value;
    }

    const filePath = process.env[fileVar];
    if (filePath) {
        const fs = require('fs');
        return fs.readFileSync(filePath, 'utf8').trim();
    }

    throw new Error(`Either ${envVar} or ${fileVar} must be defined`);
};

export const connectionOptions: ConnectionOptions = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: readEnvVar('DB_USER', 'DB_USER_FILE'),
    password: readEnvVar('DB_PASSWORD', 'DB_PASSWORD_FILE'),
    database: process.env.DB_NAME || 'kareoke',
};

export const poolOptions: PoolOptions = {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
};
