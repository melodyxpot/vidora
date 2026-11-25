\# Vidora — Windows Desktop Application



\## Role



Act as a senior desktop application engineer, software architect, UI/UX designer, and QA engineer.



Build a modern, lightweight, secure, and production-ready Windows desktop application called \*\*Vidora\*\*.



\## Project objective



Vidora is a desktop application that allows users to search for YouTube videos using keywords, browse search results, inspect video information, and manage downloads of content they are authorized to download.



The application should provide a fast, intuitive, and visually appealing user experience without requiring users to interact with command-line tools.



\## Technology stack



\- Desktop framework: Tauri 2

\- Frontend: React and TypeScript

\- Build tool: Vite

\- Styling: Tailwind CSS

\- UI components: shadcn/ui

\- Icons: Lucide React

\- Backend: Rust

\- State management: Zustand

\- Data fetching: TanStack Query

\- Database: SQLite

\- Search provider: YouTube Data API v3

\- Download engine: yt-dlp

\- Media processing: FFmpeg

\- Package manager: pnpm

\- Testing: Vitest and Playwright

\- CI/CD: GitHub Actions



\## Core features



\### 1. Video search



\- Search YouTube videos using keywords.

\- Support pasting YouTube video URLs.

\- Display video thumbnails, titles, channel names, durations, view counts, and publication dates where available.

\- Support pagination or infinite scrolling.

\- Provide sorting and filtering by relevance, upload date, duration, and popularity.

\- Implement search history.

\- Provide loading skeletons, empty states, and error handling.

\- Cache search results while respecting API quotas and applicable policies.



\### 2. Video details



\- Display video thumbnails and metadata.

\- Show available download formats and resolutions when permitted.

\- Provide an estimated file size when available.

\- Allow users to open the original video on YouTube.

\- Allow users to select a destination folder.

\- Support video and audio-only downloads for authorized content.



\### 3. Download manager



Implement a reliable download management system with:



\- Download queue

\- Concurrent downloads

\- Real-time progress

\- Download speed

\- Estimated remaining time

\- Download status

\- Cancellation

\- Retry functionality

\- Pause and resume where supported

\- Duplicate download detection

\- Configurable concurrent download limits

\- Desktop notifications upon completion



Download statuses should include:



\- Queued

\- Preparing

\- Downloading

\- Processing

\- Paused

\- Completed

\- Failed

\- Cancelled



The interface must remain responsive while downloads are running.



\### 4. Local media library



\- Display previously downloaded videos and audio files.

\- Support grid and list views.

\- Search and filter downloaded files.

\- Display file sizes, formats, resolutions, and download dates.

\- Open files using the default Windows media player.

\- Open the containing folder.

\- Remove download history entries.

\- Delete local files only after explicit user confirmation.

\- Detect missing or moved files.



\### 5. Application settings



Provide settings for:



\- Default download directory

\- Default video quality

\- Default audio format

\- Maximum concurrent downloads

\- Download speed limit where supported

\- Light, dark, and system themes

\- Desktop notifications

\- YouTube API key configuration

\- Download engine version

\- FFmpeg version

\- Application updates

\- Cache management

\- Diagnostic logs



\### 6. Dependency management



\- Detect whether yt-dlp and FFmpeg are available.

\- Provide a user-friendly setup process for missing dependencies.

\- Use trusted distribution sources.

\- Verify downloaded binaries where possible.

\- Display installed dependency versions.

\- Support safe dependency updates.

\- Handle dependency failures gracefully.



\## UI/UX requirements



Create a premium, modern desktop interface inspired by Linear, Raycast, and contemporary Windows 11 applications.



Use:



\- Clean typography

\- Minimal visual clutter

\- Collapsible sidebar navigation

\- Consistent spacing

\- Subtle animations

\- Accessible color contrast

\- Keyboard shortcuts

\- Toast notifications

\- Context menus

\- Responsive layouts for different window sizes

\- Light and dark themes



The sidebar should contain:



\- Search

\- Downloads

\- Library

\- History

\- Settings



Display active download counts in the sidebar.



Do not create an interface that looks like a generic website inside a desktop window. Make it feel like a native desktop application.



\## Software architecture



Follow a feature-based, modular architecture.



Separate responsibilities into:



\- Presentation layer

\- Application services

\- Domain models

\- API integrations

\- Download engine

\- Process management

\- Database repositories

\- Native filesystem operations

\- Configuration management

\- Error handling

\- Logging



Use typed communication between the React frontend and Rust backend.



Avoid placing business logic directly inside React components.



Create reusable components and maintain clear boundaries between modules.



\## Security requirements



\- Validate all user-provided URLs and inputs.

\- Prevent command injection.

\- Pass subprocess arguments safely without constructing shell command strings.

\- Restrict Tauri permissions using least privilege.

\- Store sensitive configuration securely.

\- Prevent path traversal.

\- Sanitize generated filenames.

\- Do not execute untrusted binaries.

\- Never expose API keys in logs.

\- Respect YouTube's Terms of Service, applicable API policies, and copyright requirements.

\- Only support downloading content for which the user has appropriate authorization and a permitted download method.

\- Do not implement DRM bypass, authentication bypass, or access restriction circumvention.



\## Reliability and observability



\- Implement structured application logging.

\- Capture download engine errors.

\- Provide actionable error messages.

\- Handle network interruptions.

\- Persist download queue information.

\- Recover gracefully after unexpected application shutdown.

\- Provide an option to export diagnostic logs.

\- Avoid collecting personal information without explicit consent.



\## Testing requirements



Implement:



\- Unit tests for business logic

\- Component tests

\- API integration tests using mocks

\- Download engine integration tests

\- Database tests

\- End-to-end tests

\- Error handling tests

\- Security-related input validation tests



Test successful downloads, invalid URLs, network failures, missing dependencies, insufficient disk space, duplicate downloads, and application restarts.



Use authorized test media.



\## Distribution



Prepare the application for Windows 10 and Windows 11.



Support:



\- Windows x64 installer

\- MSI or NSIS installation package

\- GitHub Releases

\- Semantic versioning

\- Automated builds

\- Automated testing

\- Secure application updates

\- Code signing configuration



\## Development workflow



Do not attempt to implement the entire application in a single step.



Before writing code:



1\. Analyze the requirements.

2\. Identify technical risks and external API limitations.

3\. Propose the software architecture.

4\. Design the database schema.

5\. Define the folder structure.

6\. Define frontend and backend communication contracts.

7\. Create a phased implementation roadmap.

8\. Identify dependencies and their licensing requirements.



Then implement the application incrementally.



For every development phase:



\- Explain the implementation objective.

\- Write maintainable, production-quality code.

\- Run relevant tests.

\- Fix linting and type errors.

\- Verify acceptance criteria.

\- Update project documentation.



Avoid unnecessary dependencies, overengineering, placeholder implementations, and hardcoded mock data in production.



Prioritize performance, security, maintainability, and user experience.



Start by producing the architecture, project structure, database schema, and implementation roadmap. Do not begin full implementation until the architecture has been reviewed.

