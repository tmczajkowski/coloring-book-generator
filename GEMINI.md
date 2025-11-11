# Project Overview

This is a full-stack application for generating, viewing, and printing coloring pages. The user can record a voice prompt, which is then transcribed, optionally improved by an AI, and used to generate an image. The generated image can then be printed.

**Main Technologies:**

*   **Backend:** TypeScript, Node.js, Express.js, OpenAI API (for transcription, image generation, and prompt improvement), Sharp (for image processing), and IPP (for printing).
*   **Frontend:** React, Vite, TypeScript, Material-UI.
*   **Containerization:** Docker, Docker Compose.

**Architecture:**

The application is composed of two main services: a backend API and a frontend web application.

*   The **backend** provides a RESTful API for:
    *   Transcribing audio prompts.
    *   Improving text prompts.
    *   Detecting references in prompts.
    *   Generating images from text prompts.
    *   Printing images.
    *   Managing a history of generated images.
    *   Authentication.
    *   Providing runtime configuration.
*   The **frontend** provides a user interface for:
    *   Recording audio prompts.
    *   Viewing and managing the history of generated images.
    *   Printing images.
    *   Configuring the application (e.g., enabling/disabling auto-printing and prompt improvement).

The backend and frontend are designed to be run in Docker containers, orchestrated by Docker Compose.

# Building and Running

## Local Development

### Backend

```bash
cd backend
npm i
npm run dev
```

The backend API will be available at `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm i
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend.

## Docker Compose

To run the application using Docker Compose, you can use the following command:

```bash
docker-compose up -d
```

You will need to create a `.env` file with the necessary environment variables, as described in the `docker-compose.yml` file.

# Development Conventions

*   **Code Style:** The project uses Prettier for code formatting.
*   **Type-checking:** The project uses TypeScript for static type-checking.
*   **Linting:** The project uses ESLint for linting.
*   **Commits:** Commit messages should follow the Conventional Commits specification.
