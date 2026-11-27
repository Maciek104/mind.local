# local.mind

**local.mind** is a local-first knowledge-management application for organizing documents and personal information. It consists of a React frontend and a NestJS API backed by SQLite.

> The project is under active development. Authentication, user profiles, document-library operations, plan metadata, and administrator tools are implemented. Chat messages are currently client-side only, while Notes and persistent Settings remain in development. AI responses and semantic search are not connected.

## Features and project status

### Implemented

- First-run setup for creating the initial administrator.
- Login and logout using an HTTP-only session cookie, JWT validation, and server-side session records.
- Protected application pages and user profile management:
  - display name and bio,
  - plan and role information,
  - profile avatar upload, retrieval, and removal.
- Application navigation includes Home, Chat, Notes, Library, Settings, About, and Account pages.
- Document library operations:
  - upload files up to 25 MB,
  - upload multiple files individually or by drag and drop,
  - list file metadata and totals, download originals, and delete a user's documents.
- Chat page with prompt suggestions and in-session message rendering.
- Settings page with appearance, language, chat model, prompt, Enter-to-send, and library controls.
- Account plan and role display, profile editing, and avatar management.
- FREE, PRO, and ULTRA plan records with configurable storage and model metadata.
- Administrator panel for user management and reviewing or downloading uploaded files.
- Local SQLite database initialization, foreign-key constraints, indexes, and update triggers.
- About page describing the project, its capabilities, and its creators.

### In progress or not yet implemented

- Chat messages are stored only in the current browser session and are not sent to an AI service or persisted.
- Notes is a concept page and does not yet create or organize notes.
- Settings controls are currently interface previews and are not persisted as user preferences.
- Conversation and message API modules are NestJS scaffolds; their service methods currently return placeholder values and do not persist data.
- The database schema includes document chunks and a field for BGE-M3 embeddings, but document extraction, chunking, embedding generation, semantic search, and AI responses are not connected to the application.
- Plan storage limits and allowed model lists are metadata only; application quotas and model access are not enforced yet.

## Technology

### Frontend

- React 19, TypeScript, Vite, and React Router

### Backend

- NestJS 12 and TypeScript
- SQLite through `better-sqlite3`
- JWT, bcrypt, cookie-parser, and Multer
- Request validation with `class-validator` and `class-transformer`

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── auth/          # Login, logout, session validation, and JWT guard
│   │   ├── setup/         # First-run administrator setup
│   │   ├── users/         # User profiles and avatar operations
│   │   ├── documents/     # Document upload and library API
│   │   ├── plan/          # FREE, PRO, and ULTRA plan metadata
│   │   ├── conversations/ # Conversation API scaffold
│   │   ├── messages/      # Message API scaffold
│   │   └── database/      # SQLite initialization and migrations
│   └── data/              # Runtime database, documents, and avatars
├── admin/
│   └── src/               # Administrator panel (React + TypeScript + Vite)
├── database/
│   └── schema.sql         # SQLite schema
└── frontend/
    └── src/
        ├── components/    # Shared interface components
        ├── pages/         # Application pages
        └── services/      # API clients
```

## Requirements

- Node.js
- npm

## Run locally

### 1. Start the backend

```powershell
cd backend
npm install
npm run start:dev
```

The API listens at `http://localhost:3000`.

On startup, the backend creates `backend/data/` and initializes `local-mind.sqlite` from `database/schema.sql` when the database is new. It also creates a `.env` file with a generated `JWT_SECRET` if one does not exist. Keep `.env` private and do not commit secrets.

### 2. Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend currently uses the API at `http://localhost:3000`.

### 3. Initial setup

When no administrator account exists, the application displays the setup form. Create the initial administrator there, then sign in with the email and password you chose.

### 4. Start the administrator panel

In another terminal:

```powershell
cd admin
npm install
npm run dev
```

Open `http://localhost:5174` and sign in with an administrator account. The panel supports user creation, editing, activation/deactivation and deletion, as well as browsing and downloading user-uploaded files.

## Development commands

### Backend

```powershell
cd backend
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
```

Other scripts include `npm start`, `npm run start:prod`, `npm run start:debug`, `npm run test:watch`, and `npm run format`.

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Administrator panel

```powershell
cd admin
npm run dev
npm run build
npm run lint
```

## API overview

The global authentication guard protects API routes by default. Setup status, setup initialization, and login are public. The frontend authenticates with the HTTP-only `local_mind_session` cookie. User administration routes and the all-users document listing/download routes require an authenticated `ADMIN` account.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/setup/status` | Check whether initial setup is complete (public) |
| `POST` | `/setup/initialize` | Create the initial administrator (public) |
| `POST` | `/auth/login` | Sign in and create a session (public) |
| `GET` | `/auth/me` | Return the current authenticated user |
| `POST` | `/auth/logout` | End the current session |
| `GET`, `POST` | `/users` | List users or create a user (administrator only) |
| `GET`, `PATCH`, `DELETE` | `/users/:id` | Read, update, activate/deactivate, or delete a user (administrator only) |
| `GET`, `PATCH` | `/users/me` | Read or update the current user's profile |
| `POST`, `GET`, `DELETE` | `/users/me/avatar` | Upload (up to 5 MB), retrieve, or remove the current user's avatar |
| `GET`, `POST` | `/documents` | List documents or upload one using multipart field `file` (up to 25 MB) |
| `GET`, `PATCH`, `DELETE` | `/documents/:id` | Read, rename, or delete a document |
| `GET` | `/documents/:id/download` | Download a document |
| `GET` | `/documents/admin` | List document metadata across users (administrator only) |
| `GET` | `/documents/admin/:id/download` | Download any user's document (administrator only) |
| `GET` | `/plan` | List plan metadata |
| `GET` | `/plan/:code` | Read one plan |
| `PATCH` | `/plan/:code` | Update a plan's storage or model metadata (administrator only) |
| `CRUD` | `/conversations`, `/messages` | Scaffold routes; persistence and functional operations are not implemented |

Document operations are scoped to the authenticated user. Uploaded files and avatars are saved under `backend/data/`; their metadata is kept in SQLite.

## Database

The schema is in [`database/schema.sql`](./database/schema.sql). It defines:

- `users` — credentials, profile fields, plan, role, and active status,
- `auth_sessions` — session identifiers and expiration times,
- `documents` — document metadata and processing status,
- `document_chunks` — text chunks and an optional serialized embedding,
- `conversations` and `messages` — schema for planned conversation functionality.

SQLite foreign keys and WAL mode are enabled. The backend applies user-profile column additions to an existing database at startup.

## Creators

- **Maciej Stępień** — [@Maciek104](https://github.com/Maciek104)
- **Paweł Kieliszak** — @kaszlak
- **HanzaStudios** — project association
