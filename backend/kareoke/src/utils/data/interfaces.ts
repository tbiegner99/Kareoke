export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}

export interface DatabaseClient {
    query<T = any>(query: string, params?: any[]): Promise<T[]>;
    queryRow<T = any>(query: string, params?: any[]): Promise<T>;
    execute<T = any>(query: string, params?: any[]): Promise<void>;
    insert<T = any>(query: string, params?: any[]): Promise<T>;
    withTransaction<T>(callback: (client: DatabaseClient) => Promise<T>): Promise<T>;
    terminate(): Promise<void>;
}

export interface DatabaseClientFactory {
    getClient(database?: string): DatabaseClient;
    initialize(connectionOptions: any, poolOptions?: any, databases?: string[]): void;
    terminate(): Promise<void>;
    createClient(connectionOptions: ConnectionOptions, poolOptions: PoolOptions): DatabaseClient;
}

export interface ConnectionOptions {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

export interface PoolOptions {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}
