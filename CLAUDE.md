# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack coloring book generator application that uses voice/text prompts to generate printable coloring pages. The backend uses Gemini for image generation, OpenAI for speech-to-text transcription and prompt improvement. The frontend is a React app with Material-UI that provides voice recording and image preview functionality.

## Development Commands

### Backend (TypeScript/Express)
```bash
cd backend
npm install
npm run dev      # Start API with hot-reload on :3000
npm run build    # Type-check and compile to dist/
npm start        # Run compiled server
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev      # Start Vite dev server on :5173
npm run build    # Production build
npm run preview  # Preview production build
```

### Docker Compose
```bash
docker-compose up -d  # Start both services in containers
```

## High-Level Architecture

### Request Flow
1. **Voice/Text Input**: User records audio or selects predefined idea
2. **Transcription** (`/api/transcribe`): Audio → text prompt via OpenAI Whisper
3. **Prompt Improvement** (`/api/improve`, optional): Enhance prompt for better coloring pages
4. **Reference Detection** (`/api/references/detect`): Identify reference images from prompt
5. **Image Generation** (`/api/generate`): Generate coloring page via Gemini
6. **Printing** (`/api/print`, optional): Send to IPP printer

### Session Storage Model
Each generation creates a session directory in `DATA_DIR/:id/` containing:
- `meta.json`: Metadata with prompt, improvedPrompt, references, createdAt, printedAt
- `image.png` or `image.jpg`: Generated coloring page
- `audio.webm`: Original voice recording (if applicable)

Sessions are identified by timestamp IDs and listed via `/api/history`.

### Key Backend Services
- **storage.ts**: Session/file management, meta.json operations
- **gemini.ts**: Image generation with/without reference images using Gemini 3 Pro (supports up to 14 reference images, 1K-4K resolution, aspect ratio handling, retry logic)
- **openai.ts**: Whisper transcription, GPT-4o-mini prompt improvement
- **references.ts**: GPT-4o-5 detects which reference files match the prompt
- **printer.ts**: IPP printing with A4 monochrome settings

### Frontend State Management
The `App.tsx` component manages all state via React hooks:
- Status progression: `idle` → `recording` → `transcribing` → `improving` → `referencing` → `generating` → `printing` → `done`
- Settings persisted to localStorage: autoPrint, improveEnabled, landscapeMode, sfxEnabled, tipsEnabled
- URL params sync with localStorage for easy sharing

### Authentication
Optional password protection via `APP_PASSWORD` env var. If set, `/api/auth/login` creates session token. Frontend shows `LoginOverlay` on 401 responses.

### Environment Configuration
Backend loads `.env` from both current directory and parent directory. Key variables:
- `GEMINI_API_KEY`: Required for image generation
- `OPENAI_API_KEY`: Required for transcription/improvement
- `PRINTER_URI`: Optional IPP printer (e.g., `ipp://hostname/ipp/print`)
- `DATA_DIR`: Storage location (defaults to `../data`)
- `REFERENCE_DIR`: Reference images location (defaults to `../reference`)
- `GEMINI_IMAGE_MODEL`: Model for generation (defaults to `gemini-3-pro-image-preview`)
- `GEMINI_IMAGE_ASPECT_RATIO`: Default aspect ratio like `2:3` (flips to `3:2` for landscape)
- `GEMINI_IMAGE_SIZE`: Image resolution - `1K`, `2K`, or `4K` (defaults to `1K`; only for Gemini 3 models)
- `GEMINI_API_VERSION`: API version - `v1`, `v1beta`, or `v1alpha` (defaults to `v1beta`)
- `GEMINI_TIMEOUT_MS`: Timeout for Gemini API calls in milliseconds (defaults to 600000ms / 10 minutes; Gemini 3 Pro requires more time due to thinking mode)
- `OPENAI_TIMEOUT_MS`: Timeout for OpenAI API calls (defaults to 240000ms)
- `APP_PASSWORD`: Optional password protection

## Code Style and Conventions

### General
- TypeScript strict mode enabled across repo
- ESM modules (`.js` extensions in imports)
- 2-space indentation with semicolons
- Named exports preferred

### Backend
- Files: lowercase (e.g., `openai.ts`, `printer.ts`, `storage.ts`)
- Routes: Router per resource in `src/routes/`
- Validation: Use `zod` for request validation
- Logging: Use `logger` utility with structured data
- Error handling: Polish error messages (many user-facing messages in Polish)

### Frontend
- Components: PascalCase (e.g., `RecordingControls.tsx`)
- API/utils: lowercase or camelCase (e.g., `api/client.ts`)
- Material-UI for all components
- Emotion for styled components

### Language Notes
- User-facing error messages and UI text are in **Polish**
- Code comments and variable names are in English
- When generating error messages or user prompts, use Polish

## Important Patterns

### Prompt System
The app uses three system prompts defined in `constants.ts`:
- `PROMPT_COLORING_BOOK`: Main prompt prefix for Gemini (Polish, specifies black/white, no shading, no text)
- `PROMPT_IMPROVE`: Instructs GPT to expand prompt for better coloring pages
- `PROMPT_DETECT_REFERENCES`: Instructs GPT to return JSON with matching reference files

These can be overridden via environment variables.

### Reference Images Workflow
1. User prompt is sent to `/api/references/detect` with list of available reference files
2. GPT-4o-5 returns JSON with matching filenames: `{ "references": ["file1.jpg"] }`
3. If references found, `generateImageWithReferences()` sends them as `inlineData` parts to Gemini
4. Gemini 3 Pro uses references to create more accurate character likenesses (supports up to 14 reference images, with up to 6 high-fidelity object images and 5 human images)

### Landscape Mode
- Controlled by frontend toggle, persisted to localStorage
- Flips aspect ratio from `2:3` to `3:2` in `flipAspectRatio()` helper
- Passed to backend as `{ landscape: true }` in generate request

### Rate Limiting
Simple in-memory rate limiter per IP:
- `/api/transcribe`: 10 requests per 60s
- `/api/generate`: 15 requests per 60s
- `/api/improve`: 20 requests per 60s
- `/api/references`: 20 requests per 60s

### Error Handling
- Gemini safety blocks: Catch "moderation_blocked" or "safety system" and return Polish message
- Missing inline image: Retry once if references present, check for `IMAGE_OTHER` finish reason
- Frontend: Show error in ProcessingDialog, play error sound, allow retry

## Testing
No test harness configured yet. When adding tests:
- **Frontend**: Vitest + React Testing Library, `*.test.tsx` colocated
- **Backend**: Vitest/Jest + supertest, `*.test.ts` under `src/`
- Focus coverage on routes and critical services (OpenAI/Gemini can be mocked)
