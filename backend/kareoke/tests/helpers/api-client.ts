import * as axios from 'axios';
type AxiosResponse<T = any> = {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
};
type AxiosError = Error & {
    response?: {
        status: number;
        headers: any;
        config: any;
    };
};

/**
 * Interface for test clients that make HTTP requests
 */
export interface TestClient {
    get<T = any>(url: string): Promise<any>;
    post<T = any>(url: string, data?: any): Promise<any>;
    put<T = any>(url: string, data?: any): Promise<any>;
    delete<T = any>(url: string): Promise<any>;
}

/**
 * API Test client for making HTTP requests to the server
 */
export class ApiTestClient implements TestClient {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.TEST_API_BASE_URL || 'http://localhost:3000';
    }

    /**
     * Make a GET request to the specified URL
     */
    async get<T = any>(url: string): Promise<any> {
        return axios.get<T>(`${this.baseURL}${url}`);
    }

    /**
     * Make a POST request to the specified URL with optional data
     */
    async post<T = any>(url: string, data?: any): Promise<any> {
        return axios.post<T>(`${this.baseURL}${url}`, data);
    }

    /**
     * Make a PUT request to the specified URL with optional data
     */
    async put<T = any>(url: string, data?: any): Promise<any> {
        return axios.put<T>(`${this.baseURL}${url}`, data);
    }

    /**
     * Make a DELETE request to the specified URL
     */
    async delete<T = any>(url: string): Promise<any> {
        return axios.delete<T>(`${this.baseURL}${url}`);
    }
}

/**
 * Singleton instance of the API test client
 */
export const apiClient = new ApiTestClient();

/**
 * Common error response shape
 */
export interface ApiErrorResponse {
    message: string;
    status?: number;
}
