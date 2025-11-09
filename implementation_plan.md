# Plan implementacji: Generator kolorowanek dla dzieci

Dokument opracowany na podstawie wymagań z `plan.md`. Celem jest prosta, nowoczesna aplikacja webowa w React JS, która: nasłuchuje głosu, wysyła nagranie do OpenAI (transkrypcja), na podstawie otrzymanego tekstu generuje czarno‑białą ilustrację do kolorowania, zapisuje artefakty na dysku, wyświetla historię i automatycznie drukuje na drukarce Brother pod adresem `192.168.1.188`.

---

## 1) Architektura i stos technologiczny
- Frontend: React + Vite, TypeScript, React Router, Zustand (lekki store) lub React Query do obsługi żądań i stanów async.
- UI: Tailwind CSS lub CSS Modules + prosty system komponentów (Modal, Button, Icon, Sidebar, Toast).
- Audio: Web MediaDevices + MediaRecorder (opus/webm) do nagrywania w przeglądarce.
- Backend: Node.js + Express. Odpowiedzialny za: upload audio, wysyłkę do OpenAI Whisper, generowanie obrazu przez OpenAI, zapis plików, drukowanie, listowanie historii, serwowanie miniaturek.
- Drukowanie: IPP (Internet Printing Protocol) do drukarki Brother (np. biblioteka `ipp`). Konwersja obrazu do PDF (np. `pdfkit`) lub bezpośredni `image/png` jeśli obsługiwany przez drukarkę.
- Magazyn plików: lokalny system plików.
  - Struktura: `data/<timestamp>/` zawierająca `audio.webm`, `prompt.txt`, `image.png` (oraz opcjonalnie `image-thumb.jpg`, `meta.json`, `print.pdf`).
- Środowisko dev: `.env` dla kluczy OpenAI i konfiguracji drukarki.

## 2) Struktura repozytorium
```
root
├─ backend
│  ├─ src
│  │  ├─ index.ts (Express app)
│  │  ├─ routes
│  │  │  ├─ transcribe.ts
│  │  │  ├─ generate.ts
│  │  │  ├─ print.ts
│  │  │  ├─ history.ts
│  │  ├─ services
│  │  │  ├─ openai.ts (Whisper + Images)
│  │  │  ├─ storage.ts (zapisy/odczyty plików)
│  │  │  ├─ printer.ts (IPP)
│  │  ├─ utils
│  │  │  ├─ logger.ts
│  │  │  ├─ image.ts (miniatury, konwersje)
│  │  ├─ config.ts
│  ├─ package.json
│  ├─ tsconfig.json
├─ frontend
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ routes
│  │  │  ├─ Home.tsx
│  │  ├─ components
│  │  │  ├─ MicButton.tsx
│  │  │  ├─ StopButton.tsx
│  │  │  ├─ TrashButton.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ HistoryItem.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ ImagePreview.tsx
│  │  │  ├─ Toast.tsx
│  │  ├─ store
│  │  │  ├─ useAppStore.ts
│  │  ├─ api
│  │  │  ├─ client.ts
│  │  │  ├─ types.ts
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.ts
├─ data/ (runtime)
├─ implementation_plan.md
├─ plan.md
├─ .env.example
```

## 3) Przepływ użytkownika (UX)
- Ekran główny:
  - Na środku duży przycisk z ikoną mikrofonu.
  - Po rozpoczęciu nagrywania: przycisk zmienia się w stan „nagrzywa się”, pojawiają się dwa dodatkowe: zielony „Stop” oraz „Kosz” (anuluj i usuń bieżące nagranie).
  - Po zatrzymaniu: aplikacja pokazuje modal „Przetwarzanie” z etapami: Transkrypcja → Generowanie obrazu → Drukowanie.
  - Po wygenerowaniu: pod modalem w tle widać podgląd obrazu, a po udanym druku wyświetla się komunikat (toast) o powodzeniu.
- Sidebar po lewej: lista miniatur wydrukowanych kolorowanek (ostatnie najpierw). Kliknięcie otwiera modal z podglądem, oryginalnym promptem i przyciskiem „Drukuj ponownie”.

## 4) Integracje AI
- Transkrypcja (OpenAI Whisper API):
  - Frontend nagrywa `audio/webm` (opus), wysyła do `/api/transcribe` jako `multipart/form-data`.
  - Backend przesyła do OpenAI i zwraca tekst (prompt). Zapisuje `audio.webm` i `prompt.txt` w `data/<timestamp>/`.
- Generowanie obrazu (OpenAI Images, np. `gpt-image-1`):
  - Endpoint `/api/generate` przyjmuje `prompt` oraz `id` sesji (timestamp). Backend wysyła rozszerzony prompt instruujący model o „czarno-białej wektorowej linii” do kolorowania (line art, bez tła), rozmiar np. `1024x1024`.
  - Wynik zapisuje jako `image.png` oraz tworzy miniaturę `image-thumb.jpg`.

Przykładowe rozszerzenie promptu:
> „Narysuj czarno-białą ilustrację do kolorowania (line art, wyraźne kontury, bez tła, brak szarości, brak cieniowania), na temat: {transkrybowany_tekst}. Styl przyjazny dla dzieci.”

## 5) Drukowanie
- Backend używa IPP do wysłania joba na `ipp://192.168.1.188/ipp/print` (lub odpowiedni URI; konfigurowalne przez `.env`).
- Jeśli drukarka nie przyjmuje PNG, generujemy `print.pdf` (A4, marginesy 0, tło białe) i wysyłamy z MIME `application/pdf`.
- Endpointy:
  - `POST /api/print` body: `{ id: string, source?: "image|pdf" }`.
  - Weryfikacja dostępności drukarki i obsługiwanych formatów na starcie aplikacji (log warning jeśli nieznane).
- Obsługa statusów: po wysłaniu joba zwracamy `jobId` i optimistic success, a finalny status wyświetlamy przez polling `/api/print/status?jobId=...` lub szybciej – traktujemy druk jako „fire-and-forget” i pokazujemy tylko „Job wysłany”.

## 6) API backendu (wstępny kontrakt)
- `POST /api/transcribe` (multipart): `audio` → `{ id, prompt }`.
- `POST /api/generate` (json): `{ id, prompt }` → `{ imageUrl, thumbUrl }`.
- `POST /api/print` (json): `{ id }` → `{ jobId }`.
- `GET /api/history` → lista: `[{ id, createdAt, prompt, imageUrl, thumbUrl, printedAt? }]`.
- `GET /api/item/:id` → szczegóły: `{ id, prompt, imageUrl, audioUrl, createdAt, printedAt? }`.
- Pliki statyczne (obrazy, audio): serwowane z `data/` po sprawdzeniu ścieżki (whitelist id, brak traversala).

## 7) Model danych i pliki
- Folder `data/<timestamp>` tworzony na początku procesu (po kliknięciu „Stop”).
- Zawartość:
  - `audio.webm` (nagranie)
  - `prompt.txt` (tekst po transkrypcji)
  - `image.png` (wygenerowany obraz)
  - `image-thumb.jpg` (miniatura)
  - `meta.json` (opcjonalnie: `{ id, createdAt, printedAt, model, size, status }`)
  - `print.pdf` (opcjonalnie, jeśli wymagane dla drukarki)

## 8) Frontend – komponenty i logika
- `MicButton`: obsługa MediaRecorder, stany: idle/recording. Po start – rozpoczyna nagrywanie, po stop – emituje blob.
- `StopButton`: zatrzymuje nagrywanie.
- `TrashButton`: anuluje nagrywanie i czyści tymczasowe dane.
- `Modal`: duży modal do etapów procesu (progress bar / statusy).
- `Sidebar` + `HistoryItem`: pobiera listę `/api/history`, renderuje miniatury, kliknięcie otwiera szczegóły.
- `ImagePreview`: podgląd aktualnie wygenerowanego obrazu.
- `Toast`: komunikaty o powodzeniu/błędach.
- Store (Zustand/React Query): przechowuje bieżący `id`, `status` (listening, transcribing, generating, printing, done), `prompt`, `imageUrl`.

## 9) Przebieg procesu end-to-end
1. Użytkownik klika mikrofon.
2. Rozpoczyna się nagrywanie; UI pokazuje „Stop” (zielony) i „Kosz”.
3. Po „Stop”: frontend pakuje `audio` i wysyła do `/api/transcribe`.
4. Backend tworzy `id = Date.now()`, zapisuje `audio.webm`, woła Whisper, zapisuje `prompt.txt`, zwraca `{ id, prompt }`.
5. Frontend ustawia `prompt` i natychmiast wywołuje `/api/generate` z `{ id, prompt }`.
6. Backend woła OpenAI Images, zapisuje `image.png` i miniaturę, zwraca ścieżki.
7. Frontend wyświetla obraz i odpala `/api/print` dla `{ id }`.
8. Backend pakuje do `pdf` (jeśli potrzeba) i wysyła do drukarki IPP, zwraca `jobId`.
9. UI pokazuje komunikat o wysłaniu joba; modal znika po chwili lub po pozytywnej odpowiedzi.
10. Sidebar aktualizuje listę historii.

## 10) Prompt engineering (obrazy do kolorowania)
- Wymuś: czarno-białe, wyraźne kontury, brak wypełnień, brak cieniowania, bez tła, format A4/kwadrat przeskalowany do A4 przy druku.
- Przykładowe parametry: `size=1024x1024`, `background=white` (po konwersji), filtr słów zabronionych.

## 11) Walidacje i bezpieczeństwo
- Limit czasu nagrania (np. 30–60 s) i rozmiaru pliku (np. 20 MB).
- Filtr/normalizacja promptu (usuwanie wulgaryzmów/PII jeśli potrzebne domowo minimalnie).
- Ochrona ścieżek: whitelist `id` jako folderu, brak możliwości `../`.
- Rate limiting prosty po IP (opcjonalnie dla LAN).
- `.env`: `OPENAI_API_KEY`, `PRINTER_URI`, `DATA_DIR`.

## 12) Obsługa błędów i stany graniczne
- Brak mikrofonu/przeglądarka bez MediaRecorder → fallback komunikat i przycisk upload audio (opcjonalnie).
- Błąd transkrypcji / brak rozpoznania → pozwól edytować prompt ręcznie w modalu i kontynuować.
- Błąd generowania obrazu → umożliw ponowną próbę.
- Błąd drukarki / offline → pokaż przycisk „Drukuj później” (job queue lokalna) i status w historii.

## 13) Testy i weryfikacja
- Backend: testy jednostkowe usług `storage`, `printer` (mock IPP), `openai` (mock HTTP).
- Frontend: testy komponentów kluczowych (MicButton, Modal) z mockami API.
- Testy e2e ręczne: ścieżka pełna, powtórny druk z historii, awarie (brak drukarki, brak sieci).

## 14) Konfiguracja i uruchomienie
- `.env.example`:
  - `OPENAI_API_KEY=...`
  - `PRINTER_URI=ipp://192.168.1.188/ipp/print`
  - `DATA_DIR=./data`
  - `OPENAI_IMAGE_MODEL=gpt-image-1`
- Skrypty:
  - backend: `dev`, `build`, `start`.
  - frontend: `dev`, `build`, `preview`.
- Tryb dev: uruchom frontend na `http://localhost:5173`, backend na `http://localhost:3000`, CORS włączony dla dev.

## 15) Plan wdrożenia etapami (MVP → rozbudowa)
- Faza 1 (MVP):
  - Nagrywanie audio, transkrypcja, generowanie obrazu, zapis do `data/`, UI z modalem statusu, pojedynczy wydruk „fire-and-forget”, prosta historia (miniatury, ponowny druk).
- Faza 2:
  - Miniatury, statusy drukarek, fallback do PDF, edycja promptu po transkrypcji, lepsze komunikaty błędów.
- Faza 3:
  - Kolejka zadań drukowania, websockety statusów, profile dzieci (tagi/tematy), preferencje (rozmiar papieru, marginesy), PWA (tryb offline historii).

## 16) Ryzyka i mitigacje
- Drukarka nie obsługuje PNG: fallback do PDF.
- Jakość obrazów (zbyt „szare”): agresywne wymuszenie line art, ew. post‑processing (threshold/monochromatyzacja) po stronie backendu.
- Długi czas odpowiedzi AI: czytelny progress + możliwość ponowienia.
- Zgodność przeglądarek z MediaRecorder: sprawdzenie wsparcia, alternatywa upload.

## 17) Kryteria akceptacji
- Możliwość nagrania głosu, transkrypcji, wygenerowania i automatycznego wydruku bez błędów w typowym scenariuszu.
- Zapis artefaktów w `data/<timestamp>/` wraz z historią w sidebarze.
- Ponowny druk z historii działa.
- UI proste, czytelne dla dziecka; przycisk mikrofonu, stop (zielony), kosz.

---

## Lista zadań (checklist)
- Backend
  - [ ] Endpointy: `/api/transcribe`, `/api/generate`, `/api/print`, `/api/history`, `/api/item/:id`.
  - [ ] Usługi: openai (Whisper + Images), storage (zapisy/miniatury), printer (IPP + opcjonalny PDF).
  - [ ] Konfiguracja `.env`, walidacje wejść, CORS dev.
- Frontend
  - [ ] UI: Mic, Stop, Kosz, Modal, Sidebar, Historia, Podgląd.
  - [ ] Integracja API + stany procesu, toast’y.
  - [ ] Obsługa błędów, edycja promptu w razie niepowodzenia transkrypcji.
- DevOps
  - [ ] Skrypty uruchomieniowe, README z instrukcjami.
  - [ ] `.env.example` i folder `data/` w `.gitignore`.

