# Code review – Coloring-book-generator

Poniżej szczegółowy przegląd kodu (React, Node/Express, AI) z rekomendacjami i priorytetami zmian.

## Podsumowanie
- Solidna, prosta architektura: frontend (Vite + MUI) i backend (Express + TS), klarowny podział na `routes`/`services`/`utils`.
- UX jest przemyślany (kroki, dialog z postępem, cache-busting podglądu).
- Najważniejsze ryzyka: bezpieczeństwo (brak walidacji `id`, brak limitów uploadu i rate-limitów), niezawodność (brak timeoutów w requestach do OpenAI/printera), oraz problemy buildowe backendu (kompilacja do `dist`).

## Backend (Node/Express, TS)
1) Build/ESM/TS
- `backend/tsconfig.json` ma `noEmit: true`, a `package.json` używa `npm start` -> `node dist/index.js`. To się nie zbuduje (brak plików w `dist`).
- Importy mają rozszerzenia `.ts` (np. `import { config } from './config.ts'`). Po kompilacji do JS to przestanie działać w Node (będzie oczekiwał `.js`).
Sugestia:
- Ustawić `noEmit: false` i usunąć `allowImportingTsExtensions`, a importy zmienić na ścieżki bez rozszerzeń (np. `./config`). Alternatywnie zrezygnować z buildu i używać `tsx`/`ts-node` również w produkcji.

2) Bezpieczeństwo i walidacja
- `getSessionDir(id)` używa `path.join(config.dataDir, id)` bez walidacji. Gdy `id` zawiera `../`, można wyjść poza katalog danych; `deleteSession` używa `fs.rm(..., recursive: true, force: true)` — bardzo niebezpieczne.
- `multer.memoryStorage()` bez limitów → ryzyko DoS przy dużych plikach.
Sugestie (P0):
- Walidacja `id` regexem `^[a-zA-Z0-9_-]+$` lub użycie UUID (generowane wyłącznie po stronie serwera).

3) Niezawodność i błędy
- Brak timeoutów na `fetch` do OpenAI; możliwe wieszanie requestów. Podobnie dla IPP.
- Brak rate limiting na ścieżkach `/api/transcribe`, `/api/generate`.
- Logger to proste `console.*`, brak korelacji po `id` w middleware.
Sugestie:
- Użyć `AbortController` i timeoutów (10–30s), retry/backoff dla 5xx.
- `express-rate-limit` dla krytycznych endpointów.
- Middleware logujący `requestId`/`sessionId` w `req` i logach.

4) OpenAI (AI)
- `whisper-1` i `audio/transcriptions` z `FormData` i `Blob` – OK w Node 18+; doprecyzować wymóg Node 18+.
- Generowanie obrazu: dobry prompt do line-artu i `sharp.flatten()` → białe tło. 

5) Drukowanie (IPP)
- Użycie `sharp` do recompress → OK. `print-content-optimize: 'text'` może być gorsze dla grafiki; lepsze `'graphic'`.
- Nieużywane `PRINTER_SCALING_FIT`; można przekazać atrybuty skalowania dla lepszego wypełnienia A4.
- Brak timeoutu i obsługi stanu drukarki (offline/kolejka).
Sugestie:
- Ustawić `print-content-optimize: 'graphic'`, dodać timeout i odpytać `Get-Printer-Attributes` przy starcie z logiem stanu.


## Frontend (React + Vite + MUI)
1) Architektura/Stan
- Płynny przepływ: nagrywanie → transkrypcja → generowanie → (druk). Dobrze zmapowane statusy i UI.
- `App.tsx` jest duży; warto wydzielić: Sidebar `HistoryList`, `PreviewPane`, `RecordControls`, `ProgressDialog`.

2) UX i błędy
- Błędy są tylko w konsoli (`console.error`) + ogólny Alert. Dobrze byłoby pokazać czytelne komunikaty (np. „brak uprawnień do mikrofonu”, „czas oczekiwania minął”).
- Brak blokady wieloklików (np. `Regenerate`, `Print`) — w większości jest status gating, ale warto dodać `disabled={status !== 'idle' && status !== 'done'}` lub lokalny stan pending na przyciskach.

3) API-klient
- Prosty `fetch` + proxy Vite. Warto dodać timeout (AbortController) oraz spójne mapowanie błędów na komunikaty UI.
- Dla dłuższej sesji warto rozważyć React Query (retry, cache, loading states), ale nie jest to konieczne.

4) Drobne
- Nazwa `previewBust` → raczej `previewBustToken`/`cacheBust`.
- Dodać napisy ARIA tam, gdzie to istotne (jest nieźle, ale można poprawić np. dla Fab/ikon).

## Testy i DX
- Brak testów. Proponuję:
  - Backend: Vitest/Jest + supertest dla `routes` i mocków OpenAI/IPP.
  - Frontend: Vitest + RTL dla scenariuszy UI (statusy, dialog, interakcje listy historii).
- Lint/format: dodać ESLint + Prettier, skrypty `lint`, `format` i pre-commit hook.

## Priorytety (P0 → P2)
- P0: (1) Walidacja `id`/UUID i bezpieczne ścieżki, (2) limity Multer + rate-limit, (3) timeouty i obsługa błędów OpenAI/IPP, (4) naprawa procesu build (`noEmit`, importy bez `.ts`).
- P1: (1) CORS/helmet dla prod, (2) logowanie skorelowane z `id`, (3) lepsze komunikaty błędów w UI, (4) optymalizacja drukowania (`graphic`, DPI, rozmiar).
- P2: (1) Retencja historii, (2) refaktor komponentów, (3) testy i CI, (4) moderacja treści.

## Konkretne poprawki (snippety)
- Walidacja `id` (serwer):
```ts
const isValidId = (s: string) => /^[a-zA-Z0-9_-]+$/.test(s);
if (!isValidId(id)) return res.status(400).json({ error: 'Nieprawidłowe id' });
```
- Multer limity:
```ts
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
```
- Timeout dla fetch:
```ts
const ac = new AbortController();
const t = setTimeout(() => ac.abort(), 30000);
const res = await fetch(url, { signal: ac.signal, ...opts });
clearTimeout(t);
```
- Build (tsconfig): ustawić `"noEmit": false` i usunąć `allowImportingTsExtensions`; w importach usunąć `.ts`.
- IPP optimize:
```ts
'job-attributes-tag': { ..., 'print-content-optimize': 'graphic' }
```

Jeśli chcesz, mogę przygotować PR z poprawkami P0 (walidacja `id`, limity i timeouty) oraz naprawą buildu backendu. Czy wdrażamy od razu? 
