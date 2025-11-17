# Generator Kolorowanek

Aplikacja do generowania, przeglądania i drukowania kolorowanek na podstawie promptów głosowych lub tekstowych.

### Desktop:
![](https://github.com/Patresss/coloring-book-generator/blob/main/screenshots/desktop.png?raw=true)

### Mobile:
![](https://github.com/Patresss/coloring-book-generator/blob/main/screenshots/mobile.png?raw=true)

## 🎨 AI, które rozwiązuje realne problemy... czyli kolorowanki dla dzieci!

Zawsze byłem fanem AI, jednak zdecydowanie sprzeciwiam się szukaniu problemu pod narzędzie na zasadzie: "ZRÓBMY COŚ W AI".
No i przyszedł ten dzień, kiedy problem znalazł się sam...

Żona na studiach podyplomowych, ja mam "dyżur" z dziećmi, a one bombardują mnie prośbami o... kolorowanki. I to nie byle jakie: "Tata, wydrukuj mi X na Y". Wtedy zapaliła się lampka: przecież to można zautomatyzować!

I tu AI okazało się niezbędne:
* Do zmiany mowy na tekst (dzieciaki nie piszą).
* Do wygenerowania samych kolorowanek.
* Do zaprogramowania całości... w specyficznych warunkach.

---

### 👨‍💻 Vibe Coding

Tradycyjne "kraftowe" programowanie wymaga 100% skupienia, co przy dzieciach jest niemożliwe. Jedyne wyjście to "Vibe Codding":
* ⏱️ 30 sekund promptowania.
* 👶 Powrót do dzieciaków i czekanie na wygenerowaną funkcjonalność
* 🔄 Cykl powtórzony X razy.

> Komercyjnym odpowiednikiem dzieci mogą być spotkania na Zoomie. Przy dużej ich liczbie "Vibe Coding" może być jedynym wyjściem 😉

---

### 🎨 Co robi aplikacja?

1.  Dziecko klika mikrofon i mówi, co chce pokolorować.
2.  AI zamienia mowę na tekst (i opcjonalnie "upiększa" prompt).
3.  **NAJLEPSZE:** Apka dorzuca do promptu zdjęcia referencyjne (np. członków rodziny z dedykowanego folderu).
4.  Wysyła request o kolorowankę, np. "Wiktor na Charizardzie", "mama walcząca z Harrym Potterem", "przypadkowy polityk kradnący coś z Ikea".
5.  Obrazek leci prosto na drukarkę.

---

### 🛠️ Testowane narzędzi CLI

* 🥇 **Codex (OpenAI):** Po prostu robił robotę. Bez zbędnego gadania, implementacje prawie zawsze działały. Co ciekawe, często widziałem, jak "myśląc", odpalał sobie lokalnie skrypty w Pythonie, żeby lepiej rozwiązać problem (mimo że apka była w TypeScripcie).
* 🥈 **Claude Code:** Też całkiem nieźle, ale... mam wrażenie, że chciał zrobić za dużo. Często dopytywał, dyskutował, a czasem przez to "wysypywał" apkę
* 🥉 **Gemini (CLI):** Nie wiem, czy udało mi się z nim dowieźć choć jedną funkcjonalność. Często myślał w nieskończoność, a jego kod wymagał poprawek (przez inne narzędzia).

> Copilot też był w grze, ale przy zadaniach wymagających pełnego kontekstu aplikacji radził sobie gorzej niż narzędzia CLI
>
> *<Jednak co ważne, miałem darmową wersję, która nie miała aż tak mocnych modeli>*

---

### 🤔 Pzemyślenia

* Ważne jest częstsze commitowanie. W narzędziach CLI "cofnij" nie jest tak proste jak w Copilocie.
* Wybór modelu to podstawa. Początkowo używałem OpenAI do generowania obrazów... i to była tragedia (kolorowanki słabe, nie trzymały referencji, nie pozwalały na generowanie postaci z bajek jak np. Pokemonów).
* Dużo mniej bolało usuwanie kodu wygenerowanego przez AI niż własnego, „dopieszczonego” dzieła, które okazywało się ślepą uliczką (patrz punkt wyżej)

## Czym jest ta aplikacja?

Generator Kolorowanek to pełno-stackowa aplikacja webowa, która wykorzystuje sztuczną inteligencję (Gemini) do tworzenia czarno-białych ilustracji idealnych do kolorowania. Aplikacja umożliwia:
- **Generowanie kolorowanek** z opisów głosowych lub tekstowych
- **Automatyczne ulepszanie promptów** dla lepszych rezultatów
- **Rozpoznawanie obrazów referencyjnych** do dokładniejszego odwzorowania postaci
- **Drukowanie** bezpośrednio z aplikacji (opcjonalne)
- **Przeglądanie historii** wcześniej wygenerowanych kolorowanek

## Funkcje

### Główne możliwości
- **Prompt głosowy lub tekstowy**: Nagraj swoją prośbę lub wybierz gotową sugestię
- **Orientacja obrazu**: Tryb pionowy (2:3) lub poziomy (3:2)
- **Automatyczne drukowanie**: Opcja automatycznego wydruku po wygenerowaniu
- **Ulepszanie promptów**: AI rozszerza Twój opis dla lepszych rezultatów
- **Obrazy referencyjne**: Automatyczne wykrywanie i używanie obrazów referencyjnych z folderu
- **Historia**: Przeglądaj i ponownie drukuj wcześniej wygenerowane kolorowanki
- **Dźwięki**: Opcjonalne efekty dźwiękowe
- **Wskazówki**: Pomocne podpowiedzi dla nowych użytkowników
- **Ochrona hasłem**: Opcjonalna autentykacja

### Panel ustawień
- ✅ Automatyczne drukowanie po wygenerowaniu
- ✅ Ulepszanie promptów przez AI
- ✅ Tryb poziomy (domyślnie pionowy)
- ✅ Efekty dźwiękowe

### Proces generowania
1. **Nagrywanie** - Nagraj prompt głosowy lub wybierz sugestię
2. **Transkrypcja** - Przekształcenie mowy na tekst (OpenAI Whisper)
3. **Ulepszanie** - Opcjonalne wzbogacenie promptu (GPT)
4. **Wykrywanie referencji** - Automatyczne dopasowanie obrazów referencyjnych
5. **Generowanie** - Tworzenie kolorowanki (Gemini)
6. **Drukowanie** - Opcjonalne automatyczne wydrukowanie
7. **Gotowe** - Podgląd i możliwość pobrania/wydruku

## Wymagania

- **Node.js** 20+ i npm
- **Docker** i Docker Compose (opcjonalnie)
- **Klucz API Gemini** (wymagany)
- **Klucz API OpenAI** (wymagany)
- **Drukarka IPP** (opcjonalnie, dla funkcji drukowania)

## Instalacja i uruchomienie

### Docker Compose (zalecane)

#### Podstawowa konfiguracja

Stwórz plik `docker-compose.yml`:

```yaml
services:
  backend:
    image: ghcr.io/patresss/coloring-backend:latest
    container_name: coloring-backend
    environment:
      - OPENAI_API_KEY=sk-twoj-klucz-openai
      - GEMINI_API_KEY=twoj-klucz-gemini
    volumes:
      - ./data:/data
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 5

  frontend:
    image: ghcr.io/patresss/coloring-frontend:latest
    container_name: coloring-frontend
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "5173:80"
```

Uruchom aplikację:
```bash
docker-compose up -d
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

#### Konfiguracja zaawansowana (wszystkie opcje)

```yaml
services:
  backend:
    image: ghcr.io/patresss/coloring-backend:latest
    container_name: coloring-backend
    environment:
      # WYMAGANE
      - OPENAI_API_KEY=sk-twoj-klucz-openai
      - GEMINI_API_KEY=twoj-klucz-gemini

      # OPCJONALNE - Drukowanie
      - PRINTER_URI=ipp://192.168.1.100/ipp/print
      - PRINTER_MEDIA=iso_a4_210x297mm

      # OPCJONALNE - Modele AI
      - GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
      - GEMINI_IMAGE_ASPECT_RATIO=2:3
      - OPENAI_TEXT_MODEL=gpt-5-mini
      - OPENAI_STT_MODEL=whisper-1

      # OPCJONALNE - Konfiguracja
      - OPENAI_TIMEOUT_MS=240000
      - NODE_ENV=production
      - DATA_DIR=/data
      - REFERENCE_DIR=/reference
      - CORS_ORIGIN=http://localhost:5173
      - APP_PASSWORD=twoje-haslo-dostepu

      # OPCJONALNE - Dostosowanie promptów systemowych
      - PROMPT_COLORING_BOOK=prompt-dla-gemini
      - PROMPT_IMPROVE=prompt-do-ulepszania
      - PROMPT_DETECT_REFERENCES=prompt-do-wykrywania-referencji
    volumes:
      - ./data:/data
      - ./reference:/reference
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 5

  frontend:
    image: ghcr.io/patresss/coloring-frontend:latest
    container_name: coloring-frontend
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "5173:80"
```


### Lokalne uruchomienie (bez Docker)

#### Tryb deweloperski

1. **Backend** (API dostępne na `http://localhost:3000`):
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   # Edytuj .env i uzupełnij klucze API
   npm run dev
   ```

2. **Frontend** (Vite na `http://localhost:5173`):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

#### Tryb produkcyjny

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

## Konfiguracja

### Zmienne środowiskowe

Stwórz plik `.env` w głównym katalogu lub w katalogu `backend/`:

```bash
# WYMAGANE
OPENAI_API_KEY=sk-twoj-klucz-openai
GEMINI_API_KEY=twoj-klucz-gemini

# OPCJONALNE - Drukowanie
PRINTER_URI=ipp://adres-drukarki/ipp/print
PRINTER_MEDIA=iso_a4_210x297mm

# OPCJONALNE - Foldery
DATA_DIR=./data
REFERENCE_DIR=./reference

# OPCJONALNE - Modele
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_IMAGE_ASPECT_RATIO=2:3
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_STT_MODEL=whisper-1

# OPCJONALNE - Pozostałe
OPENAI_TIMEOUT_MS=240000
CORS_ORIGIN=http://localhost:5173
APP_PASSWORD=haslo-dostepu

# OPCJONALNE - Dostosowanie promptów systemowych
PROMPT_COLORING_BOOK=twoj-custom-prompt-dla-gemini
PROMPT_IMPROVE=twoj-custom-prompt-do-ulepszania
PROMPT_DETECT_REFERENCES=twoj-custom-prompt-do-wykrywania-referencji
```

### Obrazy referencyjne

Umieść obrazy referencyjne (np. zdjęcia członków rodziny, zwierząt domowych) w folderze `reference/`. Aplikacja automatycznie wykryje i użyje odpowiednich obrazów na podstawie promptu.

Przykład:
```
reference/
  ├── mama.jpg
  ├── tata.png
  ├── pies_burek.jpg
  └── kot_mruczek.jpg
```

Gdy użytkownik poprosi o "kolorowankę z Burkiem", aplikacja automatycznie użyje `pies_burek.jpg` jako referencję.

## Architektura

### Backend
- **TypeScript + Express** - API REST
- **Gemini** - Generowanie obrazów kolorowanek
- **OpenAI Whisper** - Transkrypcja mowy na tekst
- **OpenAI GPT** - Ulepszanie promptów i wykrywanie referencji
- **IPP (Internet Printing Protocol)** - Drukowanie

### Frontend
- **React + Vite** - Szybki interfejs użytkownika
- **Material-UI** - Komponenty UI
- **Emotion** - Stylowanie


## Licencja
MIT

## Autor

Patryk Piechaczek ([@patresss](https://github.com/patresss))
