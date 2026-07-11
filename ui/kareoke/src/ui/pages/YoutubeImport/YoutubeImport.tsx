import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDependencies } from '../../../context/DependenciesProvider';
import { useToast } from '../../context/ToastContext';
import { DurationUtils } from '../../../utils/DurationUtils';
import styles from './YoutubeImport.module.css';
import {
  ImportJob,
  ImportJobStatus,
  YoutubeSearchResult,
} from '../../../domains/youtubeImport/models';

interface ActiveImport {
  job: ImportJob;
  unsubscribe: () => void;
}

const YoutubeImport: React.FC = () => {
  const { services } = useDependencies();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<YoutubeSearchResult[]>([]);
  const [editing, setEditing] = useState<Record<string, { title: string; artist: string }>>({});
  const [imports, setImports] = useState<Record<string, ActiveImport>>({});
  const importsRef = useRef(imports);
  importsRef.current = imports;

  useEffect(() => {
    return () => {
      Object.values(importsRef.current).forEach(active => active.unsubscribe());
    };
  }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const searchResults = await services.youtubeImport.search(query);
      setResults(searchResults);
      const nextEditing: Record<string, { title: string; artist: string }> = {};
      searchResults.forEach(result => {
        nextEditing[result.youtubeId] = { title: result.title, artist: '' };
      });
      setEditing(nextEditing);
    } catch (error) {
      showToast({
        message: 'Failed to search YouTube',
        severity: 'error',
        variant: 'filled',
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeAndTrack = (youtubeId: string, job: ImportJob) => {
    const unsubscribe = services.youtubeImport.subscribeToJob(job.jobId, updatedJob => {
      setImports(prev => ({
        ...prev,
        [youtubeId]: { ...prev[youtubeId], job: updatedJob },
      }));
      if (updatedJob.status === ImportJobStatus.READY) {
        showToast({
          message: `"${updatedJob.title}" added to the library!`,
          severity: 'success',
          variant: 'standard',
        });
      } else if (updatedJob.status === ImportJobStatus.FAILED) {
        showToast({
          message: `Import failed: ${updatedJob.error || 'Unknown error'}`,
          severity: 'error',
          variant: 'filled',
        });
      }
    });
    setImports(prev => ({ ...prev, [youtubeId]: { job, unsubscribe } }));
  };

  const dismissImport = (youtubeId: string) => {
    imports[youtubeId]?.unsubscribe();
    setImports(prev => {
      const next = { ...prev };
      delete next[youtubeId];
      return next;
    });
  };

  const retryImport = async (youtubeId: string, jobId: string) => {
    try {
      const job = await services.youtubeImport.retryImport(jobId);
      imports[youtubeId]?.unsubscribe();
      subscribeAndTrack(youtubeId, job);
    } catch (error: any) {
      showToast({
        message: error?.response?.data || 'Failed to retry import',
        severity: 'error',
        variant: 'filled',
      });
    }
  };

  const startImport = async (result: YoutubeSearchResult) => {
    const meta = editing[result.youtubeId];
    if (!meta?.title.trim() || !meta?.artist.trim()) {
      return;
    }

    try {
      const job = await services.youtubeImport.startImport({
        youtubeId: result.youtubeId,
        youtubeUrl: result.youtubeUrl,
        title: meta.title.trim(),
        artist: meta.artist.trim(),
        durationSeconds: result.durationSeconds,
      });

      subscribeAndTrack(result.youtubeId, job);
      setResults(prev => prev.filter(r => r.youtubeId !== result.youtubeId));
    } catch (error: any) {
      showToast({
        message: error?.response?.data || 'Failed to start import',
        severity: 'error',
        variant: 'filled',
      });
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant='h5' gutterBottom>
        Import from YouTube
      </Typography>

      <Box className={styles.searchRow}>
        <TextField
          fullWidth
          label='Search karaoke videos'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <Button variant='contained' onClick={search} disabled={loading}>
          Search
        </Button>
      </Box>

      {Object.entries(imports).map(([youtubeId, { job }]) => (
        <Paper key={job.jobId} className={styles.resultCard} variant='outlined'>
          <Box className={styles.resultInfo}>
            <Typography variant='subtitle1'>
              {job.artist} - {job.title}
            </Typography>
            {job.status === ImportJobStatus.FAILED ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={`Failed: ${job.error}`} color='error' size='small' />
                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => retryImport(youtubeId, job.jobId)}
                >
                  Retry
                </Button>
              </Box>
            ) : job.status === ImportJobStatus.READY ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label='Added to library' color='success' size='small' />
                <IconButton
                  size='small'
                  aria-label='Dismiss'
                  onClick={() => dismissImport(youtubeId)}
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant='determinate' value={job.percent} />
                <Typography variant='caption'>{job.percent}%</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      ))}

      {results.map(result => {
        const artist = editing[result.youtubeId]?.artist || '';
        const title = editing[result.youtubeId]?.title || '';
        const artistError = !artist.trim() ? 'Artist is required' : '';
        const titleError = !title.trim() ? 'Title is required' : '';

        return (
          <Paper key={result.youtubeId} className={styles.resultCard} variant='outlined'>
            <iframe
              className={styles.thumbnail}
              src={`https://www.youtube.com/embed/${result.youtubeId}`}
              title={result.title}
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
            <Box className={styles.resultInfo}>
              <Typography variant='subtitle2' noWrap>
                {result.title}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {result.channel} · {DurationUtils.formatDuration(result.durationSeconds)}
              </Typography>
              <Box className={styles.editRow}>
                <TextField
                  size='small'
                  label='Artist'
                  value={artist}
                  error={!!artistError}
                  helperText={artistError}
                  onChange={e =>
                    setEditing(prev => ({
                      ...prev,
                      [result.youtubeId]: {
                        ...prev[result.youtubeId],
                        artist: e.target.value,
                      },
                    }))
                  }
                />
                <TextField
                  size='small'
                  label='Title'
                  value={title}
                  error={!!titleError}
                  helperText={titleError}
                  onChange={e =>
                    setEditing(prev => ({
                      ...prev,
                      [result.youtubeId]: {
                        ...prev[result.youtubeId],
                        title: e.target.value,
                      },
                    }))
                  }
                />
                <Button
                  variant='outlined'
                  disabled={!!artistError || !!titleError}
                  onClick={() => startImport(result)}
                >
                  Import
                </Button>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default YoutubeImport;
