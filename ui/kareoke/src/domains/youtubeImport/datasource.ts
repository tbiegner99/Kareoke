import axios, { AxiosInstance } from 'axios';
import { Socket } from 'socket.io-client';
import { API_BASE_CONFIG, getApiBaseUrl } from '../../config/api.config';
import { ImportJob, StartImportParams, YoutubeSearchResult } from './models';

export class YoutubeImportDatasource {
  private client: AxiosInstance;
  private socket: Socket;

  constructor(socket: Socket, baseUrl?: string) {
    this.socket = socket;
    this.client = axios.create({
      baseURL: baseUrl || getApiBaseUrl(),
      timeout: API_BASE_CONFIG.TIMEOUT,
      headers: { ...API_BASE_CONFIG.DEFAULT_HEADERS },
    });
  }

  async search(query: string): Promise<YoutubeSearchResult[]> {
    const response = await this.client.post('/youtube/search', { query });
    return response.data.results as YoutubeSearchResult[];
  }

  async startImport(params: StartImportParams): Promise<ImportJob> {
    const response = await this.client.post('/youtube/import', params);
    return response.data as ImportJob;
  }

  async getJob(jobId: string): Promise<ImportJob> {
    const response = await this.client.get(`/youtube/import/${jobId}`);
    return response.data as ImportJob;
  }

  async retryImport(jobId: string): Promise<ImportJob> {
    const response = await this.client.post(`/youtube/import/${jobId}/retry`);
    return response.data as ImportJob;
  }

  subscribeToJob(jobId: string, onUpdate: (job: ImportJob) => void): () => void {
    this.socket.emit('joinImportJob', jobId);
    const handler = (job: ImportJob) => onUpdate(job);
    this.socket.on('importJobChanged', handler);

    return () => {
      this.socket.emit('leaveImportJob', jobId);
      this.socket.off('importJobChanged', handler);
    };
  }
}
