import { DatabaseClient } from '../../utils/data/interfaces';
import { youtubeImportQueries } from './queries';
import { ImportJob, ImportJobRow, ImportJobStatus } from './models';
import { Logger } from '../../utils/logger';

const fromRow = (row: ImportJobRow): ImportJob => ({
    jobId: row.job_id,
    youtubeId: row.youtube_id,
    youtubeUrl: row.youtube_url,
    title: row.title,
    artist: row.artist,
    status: row.status as ImportJobStatus,
    percent: Number(row.percent),
    error: row.error,
    songId: row.song_id,
    durationSeconds: Number(row.duration_seconds) || 0,
});

class YoutubeImportDatasource {
    constructor(
        private dbClient: DatabaseClient,
        private logger: Logger
    ) {}

    async createJob(
        youtubeId: string,
        youtubeUrl: string,
        title: string,
        artist: string,
        durationSeconds: number
    ): Promise<ImportJob> {
        this.logger.debug('Creating import job', { youtubeId, title, artist });
        const row = await this.dbClient.insert<ImportJobRow>(youtubeImportQueries.INSERT_JOB_QUERY, [
            youtubeId,
            youtubeUrl,
            title,
            artist,
            ImportJobStatus.PENDING,
            durationSeconds,
        ]);
        return fromRow(row);
    }

    async getJobById(jobId: string): Promise<ImportJob | null> {
        const rows = await this.dbClient.query<ImportJobRow>(
            youtubeImportQueries.SELECT_JOB_BY_ID_QUERY,
            [jobId]
        );
        return rows.length > 0 ? fromRow(rows[0]) : null;
    }

    async updateJobStatus(
        jobId: string,
        status: ImportJobStatus,
        percent: number,
        error: string | null = null,
        songId: string | null = null
    ): Promise<void> {
        await this.dbClient.execute(youtubeImportQueries.UPDATE_JOB_STATUS_QUERY, [
            jobId,
            status,
            percent,
            error,
            songId,
        ]);
    }

    async filterExistingYoutubeUrls(youtubeUrls: string[]): Promise<Set<string>> {
        if (youtubeUrls.length === 0) {
            return new Set();
        }
        const rows = await this.dbClient.query<{ youtube_url: string }>(
            youtubeImportQueries.SELECT_EXISTING_YOUTUBE_IDS_QUERY,
            [youtubeUrls]
        );
        return new Set(rows.map(row => row.youtube_url));
    }

    async setSongYoutubeUrl(songId: string, youtubeUrl: string): Promise<void> {
        await this.dbClient.execute(youtubeImportQueries.SET_SONG_YOUTUBE_URL_QUERY, [
            songId,
            youtubeUrl,
        ]);
    }
}

export { YoutubeImportDatasource };
