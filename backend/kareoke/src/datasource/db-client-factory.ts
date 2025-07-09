import { PostgreSQLClient } from '../utils/data/postgresql-client';
import {
    DatabaseClient,
    DatabaseClientFactory,
    ConnectionOptions,
    PoolOptions,
} from './interfaces';

class DBClientFactoryImpl implements DatabaseClientFactory {
    private clients: Map<string, DatabaseClient> = new Map();
    private connectionOptions: ConnectionOptions | null = null;
    private poolOptions: PoolOptions | null = null;
    private defaultDB: string | null = null;
    private databases: string[] = [];

    initialize(
        connectionOptions: ConnectionOptions,
        poolOptions: PoolOptions = {},
        defaultDB: string = 'default',
        databases: string[] = ['default']
    ): void {
        this.connectionOptions = connectionOptions;
        this.poolOptions = poolOptions;
        this.defaultDB = defaultDB;
        this.databases = databases;

        // Initialize clients for each database
        for (const dbName of databases) {
            const dbConnectionOptions = { ...connectionOptions };
            if (dbName !== 'default') {
                dbConnectionOptions.database = dbName;
            }
            const client = new PostgreSQLClient(dbConnectionOptions, poolOptions);
            this.clients.set(dbName, client);
        }
    }

    getClient(database?: string): DatabaseClient {
        const dbName = database || this.defaultDB || 'default';
        const client = this.clients.get(dbName);

        if (!client) {
            throw new Error(`No client found for database: ${dbName}`);
        }

        return client;
    }

    createClient(connectionOptions: ConnectionOptions): DatabaseClient {
        return new PostgreSQLClient(connectionOptions, this.poolOptions || {});
    }

    async terminate(): Promise<void> {
        const terminationPromises = Array.from(this.clients.values()).map(client =>
            client.terminate()
        );

        await Promise.all(terminationPromises);
        this.clients.clear();
    }
}

// Export singleton instance
const DBClientFactory = new DBClientFactoryImpl();
export { DBClientFactory };
