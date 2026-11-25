# Vidora architecture

Status: accepted. Phase 1 shell is in the repo: navigation, themes, and shortcuts run in the Vite shell. The native window still needs the Microsoft C++ build tools before `pnpm tauri dev` can compile. Later phases stay stopped until that window opens.

Vidora is a Windows 10 and Windows 11 desktop application for searching YouTube, inspecting video metadata, and downloading content the user is authorized to save. The interface is a native window, not a website wrapped in a frame.

## 1. Requirements, reduced to behavior

Search accepts keywords and YouTube URLs. Results show thumbnail, title, channel, duration, view count, and publication date when the API provides them. Results page on demand. Sort and filter cover relevance, upload date, duration, and popularity. Search history is kept. Loading, empty, and error states are explicit. Search responses are cached only as a quota shield.

Video details show metadata, permitted format buckets, and an estimated size when yt-dlp provides one. The user can open the watch page, choose a folder, and enqueue a video or audio-only download.

The download manager keeps a persistent queue, a concurrency cap, live progress, speed, remaining time, cancellation, retry, and pause/resume where the partial file supports it. Duplicate jobs are rejected. Completion can raise a Windows notification. Status values are queued, preparing, downloading, processing, paused, completed, failed, and cancelled. The window stays responsive while jobs run.

The library lists completed video and audio files in a grid and a list, with search, size, format, resolution, and download date. It opens the file, reveals it in Explorer, drops a history row, and deletes a file only after a separate confirmation. Missing files are marked.

Settings cover the download directory, default video quality, default audio format, concurrency, speed limit, theme, notifications, the YouTube API key, tool versions, updates, cache, and log export.

yt-dlp and FFmpeg are detected, installed from pinned trusted builds, checksum-verified, and updated by the same path. A missing tool produces a setup state, not a crash.

## 2. Product boundary

Vidora talks to YouTube hosts only: `youtube.com`, `www.youtube.com`, `youtu.be`, and `music.youtube.com`.

The download engine has no cookie import, browser-session import, age-gate bypass, membership bypass, DRM bypass, or user-supplied binary path. Format selection is a bucket the app turns into a yt-dlp selector (`1080p`, `720p`, audio, and similar). Raw extractor arguments from the user are not accepted.

Continuous integration uses a fake yt-dlp and local fixture media. It does not download from YouTube.

## 3. Technical risks

| Risk | Why it matters | Response |
| --- | --- | --- |
| YouTube Terms restrict downloading | The Data API is a metadata service. Saving streams is allowed only when the user has a permitted reason and method. | Host allowlist. No restriction-bypass features. Copy in the UI states that the user is responsible for having the right to save the file. |
| `search.list` costs 100 quota units per call | The default project quota is 10,000 units per day. A page that is also hydrated with `videos.list` costs about 101 units. | `maxResults=50`. Pasted URLs skip search and call `videos.list` (1 unit). Search cache TTL is 15 minutes. Settings shows a local 24-hour usage estimate, labeled as an estimate. |
| The Data API returns no media URLs or file sizes | Search cannot download anything. | Formats and sizes come from `yt-dlp -J`. |
| yt-dlp breaks when YouTube changes player code | Downloads fail until the binary is updated. | Pinned GitHub release, SHA-256 check, in-app updater, actionable error when the probe fails. |
| Pause is weak for fragmented DASH | A suspended process is not a reliable resume. | Pause terminates the child. Resume uses yt-dlp continue (`-c`) when a partial file exists. The UI says when a resume must start over. |
| A desktop API key cannot be hidden | Anything bundled in the binary can be extracted. | The user pastes their own key. Windows Credential Manager stores it. IPC returns `configured` or `missing`. Logs pass through a redaction layer. |
| Command injection and path traversal | Titles and paths contain quotes, `..`, and reserved device names. | `std::process::Command` argument vectors. No shell. Paths are canonicalized and must stay inside the chosen directory. Filenames are sanitized. Format selectors match an allowlist. |
| FFmpeg licensing | GPL builds include encoders that change distribution terms. | An LGPL Windows build is invoked as a subprocess. MP3 is offered only when that build already contains an allowed encoder. |
| Process death mid-download | The queue and the partial file can disagree. | SQLite WAL. Part files use a `.vidora-part` suffix. On startup, `preparing`, `downloading`, and `processing` return to `queued`. `paused` stays paused. |
| Replaced tool binaries | The app would execute attacker-controlled code. | Checksum verification. Execution is limited to `%LOCALAPPDATA%\Vidora\tools`. |

Quota costs and the YouTube data-retention window are rechecked against current Google and YouTube terms before Phase 3 ships. The schema assumes a 30-day hard cap on API-derived rows until that check says otherwise.

## 4. Architecture

```
React features
  Zustand (chrome) + TanStack Query (server state)
  typed Tauri commands and events
Rust command adapters
Rust services
  domain models
  YouTube client | repositories | credential store | download engine | filesystem
yt-dlp    FFmpeg    SQLite    Windows Credential Manager
```

React components render and send commands. They do not decide queue transitions, path safety, or process lifetime.

Zustand stores sidebar collapse, the active section if needed, and the selected video id. Persisted settings, jobs, and API data live in SQLite and the credential store, and are read through TanStack Query.

Rust services own validation, caching, duplicates, retention, and the worker loop. Command functions translate IPC into service calls and map errors.

The YouTube client calls `search.list` and `videos.list` only. The download engine spawns yt-dlp and FFmpeg, parses progress, and cancels by killing the process group. Repositories are the only SQL. `fsutil` canonicalizes paths, sanitizes filenames, and checks free space. `secure` wraps the `keyring` crate.

### Search

1. Debounce the field.
2. If the text is a YouTube URL, parse the video id locally and call `videos.list`.
3. Otherwise call `search.list` with the order and duration filters, then one `videos.list` for that page of ids so duration and view count are present. `search.list` snippets omit both.
4. Return a fresh cache row when `expires_at` is in the future.
5. Append search history.

Order maps to Data API `order`: relevance, date, viewCount. Duration maps to `videoDuration`: any, short, medium, long. Popularity uses `viewCount`.

### Download

1. Validate the URL, folder, quality bucket, and free space (estimate times 1.1, plus 50 MB, when an estimate exists).
2. Reject a duplicate: same video id, kind, and destination directory while a job is queued, active, paused, or completed and the file still exists.
3. Insert `queued`.
4. A worker claims the row with a conditional update from `queued` to `preparing`.
5. Run yt-dlp with an argument vector and a progress template. Forward bytes, speed, and eta on `download://progress`.
6. If the selected quality needs a merge, set `processing` and run FFmpeg with `-c copy` into a temp file, then replace the output.
7. Insert the library row, set `completed`, notify if notifications are on.

Audio-only jobs request the best audio and, when needed, extract to the default audio container with FFmpeg.

Concurrency is a semaphore, default 2, range 1 to 4. The speed limit maps to yt-dlp `--limit-rate` when set.

Cancellation kills the child and, after the user confirms, deletes the part file. Retry increments `retry_count` and sets `queued` for `failed` jobs.

### Library

A scan on focus sets `missing` when `file_path` does not exist. Open and reveal go through the Tauri opener plugin. Delete with `delete_file: false` removes the row. Delete with `delete_file: true` is sent only after the confirm dialog, then the file is removed and the row is removed.

### History

The History section is search history. The Downloads section keeps the queue and finished jobs, with filters for active, completed, and failed. The Library section is files. This split gives the sidebar History item a single job and avoids a second copy of the queue.

### Settings and tools

Non-secret settings are a key-value table. The API key is written to Windows Credential Manager under the Vidora service name.

On launch, the dependency service checks for `yt-dlp.exe` and `ffmpeg.exe` in the tools directory and reads their versions. Install and update download a pinned release, verify SHA-256 against a checksum shipped with the app (or fetched from the same signed release metadata), write the file, and only then replace the previous binary. A mismatch deletes the temp file and leaves the previous binary in place.

### Logging

`tracing` writes a rolling file under `%LOCALAPPDATA%\Vidora\logs`. A layer redacts query parameters named `key`, Authorization headers, and credential-shaped strings. Export copies that file to a user-chosen path.

### Window

Native title bar. Default size about 1120 by 760, minimum 900 by 600. Mica on Windows 11 when the window effect is available. Sidebar entries: Search, Downloads (active count), Library, History, Settings. The sidebar collapses to icons. Themes: light, dark, system, applied with the Tailwind class strategy.

Shortcuts: Ctrl+K focuses search, Ctrl+1 Search, Ctrl+2 Downloads, Ctrl+3 Library, Ctrl+4 History, Ctrl+, Settings.

## 5. Database

File: `%LOCALAPPDATA%\Vidora\vidora.db`.

Pragmas: `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000`.

Migrations are numbered SQL files in `src-tauri/migrations`, applied in one transaction per version and recorded in `schema_migrations`.

```sql
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  channel_id TEXT,
  channel_title TEXT,
  thumbnail_url TEXT,
  duration_sec INTEGER,
  view_count INTEGER,
  published_at TEXT,
  fetched_at TEXT NOT NULL
);

CREATE TABLE search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  searched_at TEXT NOT NULL
);

CREATE TABLE search_cache (
  cache_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE downloads (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('video', 'audio')),
  format_selector TEXT NOT NULL,
  quality_label TEXT,
  destination_dir TEXT NOT NULL,
  output_path TEXT,
  part_path TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'queued', 'preparing', 'downloading', 'processing',
    'paused', 'completed', 'failed', 'cancelled'
  )),
  bytes_downloaded INTEGER,
  bytes_total INTEGER,
  speed_bps INTEGER,
  eta_sec INTEGER,
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE library_items (
  id TEXT PRIMARY KEY,
  download_id TEXT UNIQUE REFERENCES downloads(id),
  video_id TEXT,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('video', 'audio')),
  format TEXT,
  resolution TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  downloaded_at TEXT NOT NULL,
  missing INTEGER NOT NULL DEFAULT 0 CHECK (missing IN (0, 1))
);

CREATE TABLE format_cache (
  video_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX idx_downloads_status ON downloads(status);
CREATE INDEX idx_downloads_video ON downloads(video_id, kind, destination_dir);
CREATE INDEX idx_library_downloaded_at ON library_items(downloaded_at DESC);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);
CREATE INDEX idx_videos_fetched_at ON videos(fetched_at);
```

`settings` holds `download_dir`, `video_quality`, `audio_format`, `max_concurrent`, `speed_limit_kbps`, `theme`, `notifications_enabled`. It does not hold the API key.

Search history keeps the latest 50 rows. A startup sweep deletes `search_cache` and `format_cache` rows past `expires_at`, and deletes `videos` rows whose `fetched_at` is older than the retention cap.

Duplicate detection is a query, not a unique constraint, because failed and cancelled rows must remain:

```sql
SELECT id FROM downloads
WHERE video_id = ? AND kind = ? AND destination_dir = ?
  AND status IN ('queued', 'preparing', 'downloading', 'processing', 'paused', 'completed');
```

A completed row whose library file is missing does not block a new download.

## 6. IPC contract

Rust types are annotated with specta and serde `camelCase`. The frontend imports generated bindings. Hand-written duplicate interfaces are not added.

Commands:

| Command | Notes |
| --- | --- |
| `searchVideos` | Query, order, duration, optional page token. Returns videos and the next token. |
| `getVideo` | Video id. |
| `listFormats` | Video id. Returns quality buckets and size estimates. |
| `enqueueDownload` | Video id, kind, quality bucket, destination directory. |
| `pauseDownload` | Job id. |
| `resumeDownload` | Job id. |
| `cancelDownload` | Job id, plus whether to delete the part file. |
| `retryDownload` | Job id. |
| `listDownloads` | Optional status filter. |
| `listLibrary` | Optional query, sort. |
| `deleteLibraryItem` | Id and `deleteFile`. `deleteFile` is true only after the confirm dialog. |
| `openFile` | Library id. |
| `revealFolder` | Library id. |
| `openOnYouTube` | Video id. Builds `https://www.youtube.com/watch?v=`. |
| `pickFolder` | Native dialog. Returns a canonical path or a cancel. |
| `getSettings` | Non-secret map. |
| `updateSettings` | Validated patch. |
| `apiKeyStatus` | `configured` or `missing`. |
| `setApiKey` | Write. Empty string is rejected. |
| `clearApiKey` | Delete the credential. |
| `dependencyStatus` | Name, version, installed path, update availability. |
| `installDependency` | Name. |
| `updateDependency` | Name. |
| `clearCache` | Search, video, and format caches. |
| `exportLogs` | Destination path chosen by the user. |
| `appInfo` | Version and release channel. |

Events:

| Event | Payload |
| --- | --- |
| `download://progress` | Job id, status, bytes downloaded, bytes total, speed, eta |
| `download://status` | Job id, status, error code |
| `dependency://progress` | Tool name, phase, bytes |

Error codes: `invalid_input`, `invalid_url`, `unsupported_host`, `api_key_missing`, `api_quota`, `api_unavailable`, `video_unavailable`, `dependency_missing`, `checksum_mismatch`, `disk_full`, `path_invalid`, `duplicate_download`, `download_failed`, `interrupted`, `cancelled`, `not_found`, `internal`.

Video ids match `^[A-Za-z0-9_-]{11}$`. Format selectors are built from a fixed table, not from free text. Thumbnail URLs must be HTTPS and on YouTube or `ytimg.com` hosts before the UI renders them.

## 7. Repository layout

One pnpm package. Not a workspace monorepo.

```
src/
  app/                  shell, memory router, providers, shortcuts
  features/
    search/
    video/
    downloads/
    library/
    history/
    settings/
  components/ui/        shadcn/ui
  lib/ipc/              generated bindings and client
  stores/uiStore.ts
src-tauri/
  src/
    commands/
    services/
    domain/
    db/
    youtube/
    engine/
    fsutil/
    secure/
    error.rs
    logsetup.rs
    lib.rs
  migrations/
  capabilities/
  tauri.conf.json
tests/e2e/
.github/workflows/
docs/architecture.md
```

Tauri capabilities include the opener, dialog, notification, single-instance, and updater plugins. They do not grant a broad filesystem scope or an open shell. Child processes are spawned from Rust with absolute paths inside the tools directory.

Plugins expected at scaffold time: `tauri-plugin-opener`, `tauri-plugin-dialog`, `tauri-plugin-notification`, `tauri-plugin-single-instance`, `tauri-plugin-updater`. SQL stays in rusqlite with the bundled SQLite feature. Credentials use the `keyring` crate.

## 8. Security controls

- Validate URLs and ids before any network or process call.
- Pass subprocess arguments as a vector. Do not build a command string.
- Canonicalize destination paths and reject paths that escape the chosen directory.
- Sanitize filenames: strip Windows-forbidden characters and trailing dots and spaces, reject device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, `LPT1`–`LPT9`), and cap the base name length.
- Store the API key in Credential Manager. Keep it out of SQLite, frontend state, and logs.
- Execute only checksum-verified binaries in the managed tools directory.
- Restrict Tauri permissions to the plugins listed above.
- Redact secrets in logs.
- Keep API-derived metadata inside the retention window.

## 9. Testing

Tests land with the phase that introduces the behavior.

- Rust unit tests for URL parsing, filename sanitization, status transitions, duplicate detection, and quota estimation.
- Repository tests against a temporary SQLite file, including migration from empty and startup reconciliation.
- YouTube client tests against recorded JSON fixtures, including quota and invalid-id errors.
- Engine tests against a fake yt-dlp executable that emits progress lines, fails, or exits mid-write. Cases: success, invalid URL, missing tool, disk full, duplicate, and restart recovery.
- Vitest and Testing Library for search states, the quality picker, and the delete confirmation.
- Playwright for sidebar navigation, theme, and the settings key field never rendering a stored key.

Authorized fixture media is a short locally generated file. Live YouTube downloads are out of CI.

## 10. Distribution

Windows x64. NSIS installer first, produced by Tauri. MSI is a later addition if an enterprise package is required. Versioning is semver. GitHub Actions runs typecheck, lint, Rust tests, frontend tests, and a release workflow that builds the installer. The Tauri updater is configured for signed update artifacts. The Authenticode certificate is referenced by CI secret and thumbprint configuration, and is not committed.

`THIRD_PARTY_NOTICES` ships in the installer and names yt-dlp (Unlicense), FFmpeg (LGPL, subprocess), SQLite (public domain), and the MIT and Apache crates and npm packages.

## 11. Licenses

| Dependency | License |
| --- | --- |
| Tauri 2, Tokio, Serde, rusqlite, specta, keyring | MIT or Apache-2.0 |
| React, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query | MIT |
| shadcn/ui | MIT, components copied into the repo |
| Lucide React | ISC |
| SQLite | Public domain |
| yt-dlp | Unlicense |
| FFmpeg | LGPL 2.1 or later, separate executable |
| YouTube Data API v3 | YouTube API Services Terms of Service |

Exact versions are pinned when Phase 1 scaffolds the project.

## 12. Roadmap

Each phase includes tests for the code it adds, a lint and typecheck pass, and a short note in this document if a decision changes.

| Phase | Objective | Done when |
| --- | --- | --- |
| 1. Shell | Tauri 2, React, Vite, TypeScript, Tailwind, shadcn, sidebar, themes, empty sections, CI typecheck | The app window opens and navigation works |
| 2. Platform | Migrations, settings, credential store, logging, shared error type | Settings persist and the key never appears in logs or IPC responses |
| 3. Search | YouTube client, cache, history, filters, URL paste, skeletons, empty and error states | Mocked API tests cover quota, bad URLs, and an empty page |
| 4. Tools | Detect, install, verify, and update yt-dlp and FFmpeg | A bad checksum is refused and versions render in Settings |
| 5. Details | Format buckets and size estimates | The picker renders from fixture JSON |
| 6. Downloads | Queue, cap, progress, cancel, retry, pause, duplicate detection, restart recovery, notifications | Fake yt-dlp covers success and the failure cases in section 9 |
| 7. Library | Grid, list, search, open, reveal, missing files, confirmed delete | File deletion requires the confirm flag |
| 8. Release | Shortcuts, context menus, Playwright, NSIS, updater signing config, notices file | CI builds a Windows x64 installer |

## 13. Defaults proposed for acceptance

1. YouTube hosts only, with no credential or restriction bypass.
2. API key in Windows Credential Manager.
3. Tools installed on demand into `%LOCALAPPDATA%\Vidora\tools` after a SHA-256 check.
4. Cooperative pause, with interrupted active jobs requeued and paused jobs left paused.
5. History means search history.
6. NSIS first.
7. specta-generated IPC types.
8. Search cache 15 minutes, video metadata 24 hours, API-derived rows retained at most 30 days pending the terms check.
9. Single pnpm package.
10. CI uses fixture media and a fake yt-dlp.
