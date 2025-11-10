Public deployment with Docker Compose

Goal: allow anyone to install and run the app using only Docker and a compose file, without cloning this repository.

1) Choose a container registry
- Docker Hub: docker.io/<youruser>
- GitHub Container Registry (GHCR): ghcr.io/<yourorg or user>

2) Build and push multi-arch images
Login (pick your registry):
- Docker Hub: `docker login`
- GHCR: `echo <TOKEN> | docker login ghcr.io -u <USER> --password-stdin`

Enable Buildx (for linux/amd64 and linux/arm64):
- `docker buildx create --use --name cbg-builder || true`
- `docker buildx use cbg-builder`

Build and push backend:
- `docker buildx build -f backend/Dockerfile . \
    --platform linux/amd64,linux/arm64 \
    -t <REGISTRY>/<USER>/coloring-backend:<TAG> \
    --push`

Build and push frontend:
- `docker buildx build -f frontend/Dockerfile . \
    --platform linux/amd64,linux/arm64 \
    -t <REGISTRY>/<USER>/coloring-frontend:<TAG> \
    --push`

Notes:
- Keep <TAG> semver-like (e.g., 1.0.0) and also push `:latest` for a stable default if desired.
- Do NOT bake secrets into images; runtime uses `.env` variables.

3) Prepare a public docker-compose.yml for users
- Use `deploy/docker-compose.yml` provided here.
- Replace placeholders:
  - Set `BACKEND_IMAGE` and `FRONTEND_IMAGE` (or hardcode images in the file).
  - Optionally set a specific `TAG`.

Example (hardcoded):

```
services:
  backend:
    image: ghcr.io/youruser/coloring-backend:1.0.0
    ... (rest unchanged)
  frontend:
    image: ghcr.io/youruser/coloring-frontend:1.0.0
    ...
```

4) Distribute to users
Provide users:
- A link to your compose file (e.g., Raw GitHub URL or a Gist),
- The `.env.example` contents (or tell them which variables to set).

User install steps (no git clone required):
- Create a folder anywhere on their machine.
- Download compose: `curl -fsSL -o docker-compose.yml <RAW_URL_TO_YOUR_COMPOSE>`
- Download `.env` template and fill values:
  - `curl -fsSL -o .env <RAW_URL_TO_YOUR_ENV_EXAMPLE>`
  - Edit `.env` and set at minimum:
    - `OPENAI_API_KEY=<their_openai_key>`
    - `PRINTER_URI=ipp://<printer_ip>/ipp/print` (or their printer endpoint)
- Create data folder: `mkdir -p data`
- Run: `docker compose up -d`
- App: `http://localhost:5173` (Frontend), health: `http://localhost:3000/health`

5) Update instructions for users
- To update to a new version:
  - Update image tags in compose (or set `TAG` env), then:
  - `docker compose pull && docker compose up -d`

6) Security and printing
- The backend exposes `:3000`, frontend `:5173`; you can remove the backend port mapping from the compose if you prefer only frontend exposed.
- Ensure the printer endpoint is reachable from the host network (containers can access it outbound). mDNS names may not resolve in all environments; prefer IP or resolvable DNS.

7) Minimal .env template for users
```
OPENAI_API_KEY=
PRINTER_URI=
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_STT_MODEL=whisper-1
PRINTER_MEDIA=iso_a4_210x297mm
OPENAI_TIMEOUT_MS=120000
```

