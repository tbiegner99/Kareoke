import { spawn } from 'child_process';
import { Logger } from '../../utils/logger';
import { YoutubeSearchResult } from './models';

interface RawSearchEntry {
    id: string;
    title: string;
    uploader?: string;
    channel?: string;
    duration?: number;
    thumbnail?: string;
    thumbnails?: { url: string; width?: number; height?: number }[];
    webpage_url?: string;
}

const pickThumbnail = (entry: RawSearchEntry): string => {
    if (entry.thumbnail) {
        return entry.thumbnail;
    }
    if (entry.thumbnails && entry.thumbnails.length > 0) {
        return entry.thumbnails[entry.thumbnails.length - 1].url;
    }
    return '';
};

const YT_DLP_BIN = process.env.YT_DLP_BIN || 'yt-dlp';

class YtDlpRunner {
    constructor(private logger: Logger) {}

    async search(query: string, limit: number): Promise<YoutubeSearchResult[]> {
        const searchTerm = `ytsearch${limit}:${query} karaoke`;
        const args = ['-j', '--flat-playlist', '--no-warnings', searchTerm];

        this.logger.debug('Running yt-dlp search', { query, limit });
        const output = await this.run(args);

        return output
            .split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => JSON.parse(line) as RawSearchEntry)
            .map(entry => ({
                youtubeId: entry.id,
                youtubeUrl: entry.webpage_url || `https://www.youtube.com/watch?v=${entry.id}`,
                title: entry.title,
                channel: entry.uploader || entry.channel || '',
                durationSeconds: entry.duration || 0,
                thumbnailUrl: pickThumbnail(entry),
            }));
    }

    // Downloads a video, invoking onProgress(percent) as yt-dlp reports it.
    download(
        youtubeUrl: string,
        outputTemplate: string,
        onProgress: (percent: number) => void
    ): Promise<void> {
        const args = [
            '--newline',
            '--no-warnings',
            '-f',
            'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format',
            'mp4',
            '-o',
            outputTemplate,
            youtubeUrl,
        ];

        this.logger.debug('Running yt-dlp download', { youtubeUrl, outputTemplate });

        return new Promise((resolve, reject) => {
            const child = spawn(YT_DLP_BIN, args);
            let stderr = '';

            child.stdout.on('data', (chunk: Buffer) => {
                const text = chunk.toString();
                const match = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
                if (match) {
                    onProgress(parseFloat(match[1]));
                }
            });

            child.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });

            child.on('error', reject);
            child.on('close', code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}: ${stderr.slice(-500)}`));
                }
            });
        });
    }

    private run(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const child = spawn(YT_DLP_BIN, args);
            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (chunk: Buffer) => {
                stdout += chunk.toString();
            });
            child.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });

            child.on('error', reject);
            child.on('close', code => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}: ${stderr.slice(-500)}`));
                }
            });
        });
    }
}

export { YtDlpRunner };
