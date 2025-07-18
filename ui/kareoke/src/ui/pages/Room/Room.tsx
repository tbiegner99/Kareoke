import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SongsListController } from '../SongList/SongsListController';
import { PlaylistController } from '../Playlist/PlaylistController';
import styles from './Room.module.css';
import { BASE_VIDEO_PATH } from '../../../utils/constants';

const PLACEHOLDER_VIDEO_SRC = `${BASE_VIDEO_PATH}/placeholder/discoball10.mp4`;

export const Room = ({
  // roomId,
  videoSrc,
  playlistSize,
  onLoadNextVideo,
}: {
  roomId: string;
  videoSrc?: string;
  playlistSize: number;
  onLoadNextVideo: () => void;
}) => {
  const interval = React.useRef<any>(null);
  const [expanded, setExpanded] = React.useState<
    'playlist' | 'addSongs' | false
  >('playlist');
  const [isStarted, setIsStarted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      if (videoRef.current) {
        const vid = videoRef.current;
        const isPlaying = Boolean(
          vid.currentTime > 0 && !vid.paused && !vid.ended && vid.readyState > 2
        );
        if (!isPlaying) {
          setIsStarted(false);
        } else {
          setIsStarted(true);
        }
        clearInterval(interval.current!);
      }
    }, 300);
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);
  return (
    <div className={styles.container}>
      {/* Main content: Video and controls */}
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <Accordion
            expanded={expanded === 'playlist'}
            onChange={(_, isExpanded) =>
              setExpanded(isExpanded ? 'playlist' : false)
            }
            disableGutters
            className={styles.accordionPlaylist}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='playlist-content'
              id='playlist-header'
              className={styles.accordionSummary}
            >
              <Typography variant='subtitle1' fontWeight={600}>
                Playlist ({playlistSize})
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionDetails}>
              <PlaylistController mini={true} />
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === 'addSongs'}
            onChange={(_, isExpanded) =>
              setExpanded(isExpanded ? 'addSongs' : false)
            }
            disableGutters
            className={styles.accordionAddSongs}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='add-songs-content'
              id='add-songs-header'
              className={styles.accordionSummary}
            >
              <Typography variant='subtitle1' fontWeight={600}>
                Add Songs
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={styles.accordionDetailsAddSongs}>
              <SongsListController mini={true} />
            </AccordionDetails>
          </Accordion>
        </div>
        <div className={styles.videoPanel}>
          <div className={styles.videoContainer}>
            <video
              autoPlay
              ref={videoRef}
              key={videoSrc || PLACEHOLDER_VIDEO_SRC}
              src={videoSrc || PLACEHOLDER_VIDEO_SRC}
              className={styles.video}
              onEnded={() => {
                console.log('Video ended');
                onLoadNextVideo();
                if (videoRef.current && !videoSrc) {
                  videoRef.current.play();
                }
              }}
            />
            <div className={styles.nextButtonContainer}>
              <Button
                variant='contained'
                color='primary'
                size='large'
                className={styles.nextButton}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = videoRef.current.duration;
                  }
                }}
              >
                Next Track
              </Button>
            </div>
          </div>
          {!isStarted ? (
            <>
              <div className={styles.overlay} />
              <Button
                variant='contained'
                color='primary'
                size='large'
                className={styles.startButton}
                onClick={() => {
                  videoRef.current?.play();
                  setIsStarted(true);
                }}
              >
                Start
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
