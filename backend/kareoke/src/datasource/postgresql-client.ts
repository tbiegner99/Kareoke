import { Pool, PoolClient, PoolConfig } from 'pg';
import {
    DatabaseClient,
    QueryResult,
    ConnectionOptions,
    PoolOptions,
} from '../utils/data/interfaces.js';

export class PostgreSQLClient implements DatabaseClient {
    private pool: Pool;
    private connectionOptions: ConnectionOptions;
    private terminated = false;

    constructor(connectionOptions: ConnectionOptions, options: PoolOptions = {}) {
        this.connectionOptions = connectionOptions;
        const poolConfig: PoolConfig = {
            host: this.connectionOptions.host,
            port: this.connectionOptions.port,
            user: this.connectionOptions.user,
            password: this.connectionOptions.password,
            database: this.connectionOptions.database,
            max: options.max || 10,
            min: options.min || 0,
            idleTimeoutMillis: options.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: options.connectionTimeoutMillis || 2000,
        };

        this.pool = new Pool(poolConfig);
    }

    async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
        if (this.terminated) {
            throw new Error('Cannot query terminated client');
        }

        try {
            const result = await this.pool.query(query, params);
            return result.rows as T[];
        } catch (error) {
            throw new Error(
                `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
    async queryRow<T = any>(query: string, params: any[] = []): Promise<T> {
        const rows = await this.query<T>(query, params);
        if (rows.length === 0) {
            throw new Error('No rows returned');
        }
        return rows[0];
    }
    async execute<T = any>(query: string, params: any[] = []): Promise<void> {
        if (this.terminated) {
            throw new Error('Cannot execute on terminated client');
        }

        try {
            await this.pool.query(query, params);
        } catch (error) {
            throw new Error(
                `Database execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
    async insert<T = any>(query: string, params: any[] = []): Promise<T> {
        if (this.terminated) {
            throw new Error('Cannot insert on terminated client');
        }

        try {
            const result = await this.pool.query(query, params);
            if (result.rows.length === 0) {
                throw new Error('Insert did not return any rows');
            }
            return result.rows[0] as T;
        } catch (error) {
            throw new Error(
                `Database insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    async withTransaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T> {
        if (!this.pool) {
            throw new Error('Transaction requires a connection pool');
        }

        const poolClient = await this.pool.connect();

        try {
            await poolClient.query('BEGIN');
            const result = await callback(this);
            await poolClient.query('COMMIT');
            return result;
        } catch (error) {
            await poolClient.query('ROLLBACK');
            throw error;
        } finally {
            poolClient.release();
        }
    }

    async terminate(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
        }
        this.terminated = true;
    }
}
