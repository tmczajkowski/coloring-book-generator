# Build and serve the Vite frontend with Nginx

FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/tsconfig.json ./tsconfig.json
COPY frontend/vite.config.ts ./vite.config.ts
COPY frontend/index.html ./index.html
COPY frontend/public ./public
COPY frontend/src ./src

# Allow optional build-time timeout override via Vite (not required)
ARG VITE_OPENAI_TIMEOUT_MS
ENV VITE_OPENAI_TIMEOUT_MS=$VITE_OPENAI_TIMEOUT_MS

RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config with proxy to backend service for /api and /files
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

