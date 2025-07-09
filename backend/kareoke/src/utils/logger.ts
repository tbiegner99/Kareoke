import bunyan from 'bunyan';

// Logger configuration interface
interface LoggerConfig {
    name: string;
    level?: bunyan.LogLevel;
    streams?: bunyan.Stream[];
}

// Create application logger with sensible defaults
const createLogger = (config: LoggerConfig): bunyan => {
    const defaultLevel = (process.env.LOG_LEVEL as bunyan.LogLevel) || 'info';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const streams: bunyan.Stream[] = config.streams || [
        {
            level: config.level || defaultLevel,
            stream: process.stdout,
        },
    ];

    return bunyan.createLogger({
        name: config.name,
        level: config.level || defaultLevel,
        streams,
        serializers: {
            req: bunyan.stdSerializers.req,
            res: bunyan.stdSerializers.res,
            err: bunyan.stdSerializers.err,
        },
    });
};

// Application-wide logger instance
export const logger = createLogger({
    name: 'kareoke-server',
    level: (process.env.LOG_LEVEL as bunyan.LogLevel) || 'info',
});

// Factory function for creating domain-specific loggers
export const createDomainLogger = (domain: string): bunyan => {
    return createLogger({
        name: `kareoke-server:${domain}`,
        level: (process.env.LOG_LEVEL as bunyan.LogLevel) || 'info',
    });
};

// Export types for use in other modules
export type Logger = bunyan;
export { bunyan };
