import { YoutubeImportDatasource } from './datasource';
import { ImportJob, StartImportParams, YoutubeSearchResult } from './models';

export class YoutubeImportService {
  constructor(private datasource: YoutubeImportDatasource) {}

  async search(query: string): Promise<YoutubeSearchResult[]> {
    return this.datasource.search(query);
  }

  async startImport(params: StartImportParams): Promise<ImportJob> {
    return this.datasource.startImport(params);
  }

  async getJob(jobId: string): Promise<ImportJob> {
    return this.datasource.getJob(jobId);
  }

  async retryImport(jobId: string): Promise<ImportJob> {
    return this.datasource.retryImport(jobId);
  }

  subscribeToJob(jobId: string, onUpdate: (job: ImportJob) => void): () => void {
    return this.datasource.subscribeToJob(jobId, onUpdate);
  }
}
