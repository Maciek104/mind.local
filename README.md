# local.mind

**local.mind** is a local knowledge-management application for working with documents and conversations. The project consists of a React web application and a NestJS API backed by SQLite.

> The project is under active development. Authentication, initial setup, and the database structure are implemented; the library, chat, and document modules are still being developed.

## Technologies

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)

### Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Data

![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

The backend also uses bcrypt, `better-sqlite3`, class-validator, class-transformer, and Vitest.

## Features

The current application scope includes:

- first-run setup and administrator account creation,
- user login and logout,
- active session validation,
- protected application views,
- home, chat, library, and settings interfaces,
- REST APIs for users, documents, conversations, and messages,
- automatic local SQLite database initialization.

The database is prepared for documents and content chunks with embedded vectors. Semantic search and AI responses are not yet connected to the interface.

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── auth/          # Login, sessions, and JWT guard
│   │   ├── setup/         # First-run setup
│   │   ├── users/         # Users
│   │   ├── documents/     # Document API
│   │   ├── conversations/ # Conversations
│   │   ├── messages/      # Messages
│   │   └── database/      # SQLite integration
│   └── data/              # SQLite database and runtime data
├── frontend/
│   └── src/
│       ├── components/    # Shared interface components
│       ├── pages/         # Application views
│       └── services/      # API communication
└── database/
    └── schema.sql         # Database schema
```

## Requirements

- Node.js
- npm

## Installation and Running

### 1. Backend

```powershell
cd backend
npm install
npm run start:dev
```

The backend runs at `http://localhost:3000` by default.

During the first startup, the application:

- creates the `backend/data` directory,
- initializes `backend/data/local-mind.sqlite` using `database/schema.sql`,
- creates `backend/.env` when it does not exist,
- generates a random `JWT_SECRET`.

Example environment variables:

```dotenv
JWT_SECRET=<generated-random-secret>
NODE_ENV=development
```

Do not use an existing production secret or commit the `.env` file.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 3. Initial Setup

After starting both services, open `http://localhost:5173`. If the database does not contain an administrator account, the application displays the initial setup form.

After creating the administrator, log in with the provided email address and password.

## Scripts

### Backend

```powershell
cd backend
npm run start:dev  # Development server with watch mode
npm run build      # Production build
npm run start:prod # Run the compiled application
npm run lint       # Code quality checks
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
```

### Frontend

```powershell
cd frontend
npm run dev     # Development server
npm run build   # TypeScript check and production build
npm run preview # Preview the build
npm run lint    # Code quality checks
```

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/setup/status` | Checks whether the application is configured |
| `POST` | `/setup/initialize` | Creates the administrator account |
| `POST` | `/auth/login` | Logs in a user |
| `GET` | `/auth/me` | Checks the current session |
| `POST` | `/auth/logout` | Logs out a user |
| `GET` | `/users` | Lists users |
| `CRUD` | `/documents` | Manages documents |
| `CRUD` | `/conversations` | Manages conversations |
| `CRUD` | `/messages` | Manages messages |

Most REST modules are protected by the JWT guard. `/setup/status`, `/setup/initialize`, and login are public.

## Database

The schema is located in [`database/schema.sql`](./database/schema.sql). It contains the following tables:

- `users`,
- `documents`,
- `document_chunks`,
- `conversations`,
- `messages`,
- `auth_sessions`.

The first startup also creates indexes and triggers that update `updated_at` fields.

## Author

**Maciej Stępień**

- GitHub: [@Maciek104](https://github.com/Maciek104)
