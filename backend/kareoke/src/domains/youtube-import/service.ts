import path from 'path';
import EventEmitter from 'events';
import { YoutubeImportDatasource } from './datasource';
import { YtDlpRunner } from './yt-dlp-runner';
import { SongsService } from '../songs/service';
import { Logger } from '../../utils/logger';
import { ImportJob, ImportJobStatus, StartImportParams, YoutubeSearchResult } from './models';
import { ResultType } from '../songs/models';
import { BadRequestError } from '../../errors';

const VIDEO_PATH = process.env.VIDEO_PATH || path.join(process.cwd(), 'media');
const SEARCH_LIMIT = 20;

const sanitizeForFilename = (value: string): string =>
    value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();

class YoutubeImportService {
    constructor(
        private datasource: YoutubeImportDatasource,
        private ytDlp: YtDlpRunner,
        private songsService: SongsService,
        private eventEmitter: EventEmitter,
        private logger: Logger
    ) {}

    async search(query: string): Promise<YoutubeSearchResult[]> {
        if (!query || !query.trim()) {
            throw new BadRequestError('query is required');
        }
        this.logger.debug('Searching youtube', { query });
        const results = await this.ytDlp.search(query, SEARCH_LIMIT);
        const existing = await this.datasource.filterExistingYoutubeUrls(
            results.map(r => r.youtubeUrl)
        );
        return results.filter(r => !existing.has(r.youtubeUrl));
    }

    async getJob(jobId: string): Promise<ImportJob | null> {
        return this.datasource.getJobById(jobId);
    }

    async startImport(params: StartImportParams): Promise<ImportJob> {
        const { youtubeId, youtubeUrl, title, artist, durationSeconds } = params;
        if (!youtubeId || !youtubeUrl || !title || !artist) {
            throw new BadRequestError('youtubeId, youtubeUrl, title and artist are required');
        }

        const [alreadyImported] = await this.datasource.filterExistingYoutubeUrls([youtubeUrl]);
        if (alreadyImported) {
            throw new BadRequestError('This video has already been imported', 'ALREADY_IMPORTED');
        }

        const job = await this.datasource.createJob(
            youtubeId,
            youtubeUrl,
            title,
            artist,
            durationSeconds || 0
        );
        this.runImport(job).catch(err => {
            this.logger.error('Unhandled error running import job', { jobId: job.jobId, err });
        });
        return job;
    }

    async retryImport(jobId: string): Promise<ImportJob> {
        const job = await this.datasource.getJobById(jobId);
        if (!job) {
            throw new BadRequestError('Import job not found', 'JOB_NOT_FOUND');
        }
        if (job.status !== ImportJobStatus.FAILED) {
            throw new BadRequestError('Only failed import jobs can be retried', 'JOB_NOT_FAILED');
        }

        await this.datasource.updateJobStatus(job.jobId, ImportJobStatus.PENDING, 0, null, null);
        const resetJob: ImportJob = { ...job, status: ImportJobStatus.PENDING, percent: 0, error: null };
        this.emitProgress(resetJob);

        this.runImport(resetJob).catch(err => {
            this.logger.error('Unhandled error retrying import job', { jobId: job.jobId, err });
        });
        return resetJob;
    }

    private emitProgress(job: ImportJob): void {
        this.eventEmitter.emit('importJobChanged', { jobId: job.jobId, job });
    }

    private async runImport(job: ImportJob): Promise<void> {
        const filename = `${sanitizeForFilename(job.artist)}-${sanitizeForFilename(job.title)}-${job.jobId}.mp4`;
        const outputPath = path.join(VIDEO_PATH, filename);

        try {
            await this.datasource.updateJobStatus(job.jobId, ImportJobStatus.DOWNLOADING, 0);
            this.emitProgress({ ...job, status: ImportJobStatus.DOWNLOADING, percent: 0 });

            let lastEmitted = -1;
            await this.ytDlp.download(job.youtubeUrl, outputPath, percent => {
                const rounded = Math.round(percent);
                if (rounded !== lastEmitted) {
                    lastEmitted = rounded;
                    this.datasource
                        .updateJobStatus(job.jobId, ImportJobStatus.DOWNLOADING, rounded)
                        .catch(() => undefined);
                    this.emitProgress({
                        ...job,
                        status: ImportJobStatus.DOWNLOADING,
                        percent: rounded,
                    });
                }
            });

            const createdSong = await this.songsService.createSong({
                id: '',
                title: job.title,
                artist: job.artist,
                source: 'youtube',
                filename,
                resultType: ResultType.SONG,
                plays: 0,
                lastPlay: null,
                duration: job.durationSeconds,
            });
            await this.datasource.setSongYoutubeUrl(createdSong.songId, job.youtubeUrl);

            await this.datasource.updateJobStatus(
                job.jobId,
                ImportJobStatus.READY,
                100,
                null,
                createdSong.songId
            );
            this.emitProgress({
                ...job,
                status: ImportJobStatus.READY,
                percent: 100,
                songId: createdSong.songId,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            this.logger.error('Import job failed', { jobId: job.jobId, error: errorMessage });
            await this.datasource.updateJobStatus(
                job.jobId,
                ImportJobStatus.FAILED,
                job.percent,
                errorMessage
            );
            this.emitProgress({ ...job, status: ImportJobStatus.FAILED, error: errorMessage });
        }
    }
}

export { YoutubeImportService };
