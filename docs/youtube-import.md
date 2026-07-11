# YouTube Import Feature

Lets users search YouTube for karaoke videos and add them straight into the
song library, instead of manually sourcing/uploading files.

## v1 Scope

- **Search**: backend wraps `yt-dlp` search (e.g. `ytsearch20:<query> karaoke`)
  and returns candidates (videoId, title, channel, duration, thumbnail).
  - Results exclude any video whose YouTube URL/ID already exists in the
    `songs` table (see Dedup below), so users can't queue the same video twice.
- **Metadata**: raw YouTube title is shown as a suggestion; user must fill in
  / edit artist + title before confirming the import. No auto-parsing is
  trusted as final.
- **Import job**: kicking off an import creates an `import_jobs` row
  (status: `pending -> downloading -> ready|failed`) and starts an async
  yt-dlp download (`--newline` for progress parsing) in-process. On success,
  a `songs` row is created via the existing `SongsService.createSong`.
- **Progress UI**: client opens an SSE connection
  (`GET /youtube/import/:jobId/events`) to drive a progress bar from parsed
  yt-dlp download percentages. A plain `GET /youtube/import/:jobId` status
  endpoint exists as a fallback for reconnect/page-reload.
- **Dedup**: the source YouTube video URL/ID is stored on the `songs` row
  (new column, e.g. `songs.youtube_url` or reuse/extend `source`). Search
  filters out any YouTube ID already present in that column.

## Out of scope for v1 (see TODO)

Karaoke-track videos are assumed to already be vocal-free — v1 does not do
any audio processing beyond what yt-dlp downloads.

## TODO: Option 2 — arbitrary song import via vocal removal

Allow importing *any* YouTube song (not just existing karaoke uploads) by
running vocal/instrumental separation after download.

- Candidate tool: **Demucs** (`htdemucs` model) — best open-source
  separation quality available; GPU strongly recommended (CPU is slow,
  multiple minutes per song). UVR (Ultimate Vocal Remover) is a viable
  alternative front-end/model ensemble if quality needs tuning further.
  Spleeter is faster but noticeably lower quality — not recommended.
- This is a real additional pipeline stage: a Python worker process,
  GPU/CPU capacity planning, extra storage for stems, and materially longer
  job runtimes than v1's plain download.
- Ship behind an experiment/feature flag — do not fold into the default
  import flow until quality and infra cost are validated.
- Job status model should extend to include a `separating-vocals` stage
  between `downloading` and `ready`.
