import { PostgreSQLClient } from './postgresql-client';
import {
    DatabaseClient,
    DatabaseClientFactory,
    ConnectionOptions,
    PoolOptions,
} from '../../utils/data/interfaces';

class DBClientFactoryImpl implements DatabaseClientFactory {
    private clients: Map<string, DatabaseClient> = new Map();

    initialize(
        connectionOptions: ConnectionOptions,
        poolOptions: PoolOptions = {},
        databases: string[] = ['default']
    ): void {
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

    getClient(database: string): DatabaseClient {
        const client = this.clients.get(database);

        if (!client) {
            throw new Error(`No client found for database: ${database}`);
        }

        return client;
    }

    createClient(connectionOptions: ConnectionOptions, poolOptions: PoolOptions): DatabaseClient {
        return new PostgreSQLClient(connectionOptions, poolOptions);
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
