# Mini JSONPlaceholder

A simplified, educational REST API inspired by [JSONPlaceholder](https://jsonplaceholder.typicode.com/), built to teach backend development and REST API concepts. The project is written in Italian (field names, error messages, documentation), but this README is in English for broader accessibility.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES Modules) |
| Backend | Express 4 |
| Frontend | Plain HTML / CSS / Vanilla JS |
| Database | MySQL 8 (via Docker) |
| DB Driver | mysql2/promise — raw SQL, no ORM |
| Auth | bcrypt + jsonwebtoken (installed, not yet wired) |
| Package Manager | npm |

## Folder Structure

```
mini-jsonplaceholder/
├── docker-compose.yml          # MySQL 8 + phpMyAdmin, auto-seeds on first run
├── docs/
│   ├── guida-setup-mysql.md    # Step-by-step setup guide
│   ├── cheatsheet-sql.md       # SQL reference for the project
│   ├── spiegazione-migrazione.md  # Array-to-MySQL migration explained
│   ├── esercizi.md             # 7 progressive exercises (⭐ to ⭐⭐⭐)
│   └── esercizioparte2.md      # 8 auth & security exercises (bcrypt, JWT, roles)
├── api/                        # Express REST API
│   ├── server.js               # Entry point — CORS, routes, logger, port 3000
│   ├── .env.example            # DB credentials template
│   ├── data/
│   │   └── database.vecchio.js # Legacy in-memory DB (kept for reference)
│   ├── database/
│   │   ├── connessione.js      # mysql2 connection pool
│   │   ├── schema.sql          # CREATE TABLE statements (auto-run by Docker)
│   │   ├── seed.sql            # Seed data (auto-run by Docker)
│   │   └── queries/
│   │       ├── utenti.js       # Async SQL functions for users
│   │       ├── post.js         # Async SQL functions for posts
│   │       └── commenti.js     # Async SQL functions for comments
│   └── routes/
│       ├── utenti.js           # /api/utenti — CRUD
│       ├── post.js             # /api/post — CRUD
│       └── commenti.js         # /api/commenti — CRUD
└── web/                        # Frontend — no build tools, no frameworks
    ├── index.html
    ├── stile.css
    └── js/
        ├── api.js              # Fetch wrapper with BASE_URL
        ├── ui.js               # DOM rendering functions
        └── app.js              # Orchestrator: nav, forms, drill-down state
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) — for MySQL and phpMyAdmin
- [Node.js](https://nodejs.org/) v18+

### 1. Start the database

```bash
# From the project root
docker compose up -d
```

On first run, Docker automatically executes `schema.sql` and `seed.sql` to create and populate the database.

### 2. Start the backend

```bash
cd api
cp .env.example .env   # fill in your DB credentials
npm install
npm run dev            # starts with auto-restart (node --watch)
```

### 3. Start the frontend

```bash
cd web
npm run dev            # serves on port 8080
```

### Services

| Service | URL |
|---------|-----|
| REST API | http://localhost:3000 |
| Frontend | http://localhost:8080 |
| phpMyAdmin | http://localhost:8081 |

### Reset data

```bash
docker compose down -v && docker compose up -d
```

## API Endpoints

All field names and responses are in Italian.

### Users — `/api/utenti`

**Fields:** `id`, `nome`, `email`, `citta`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/utenti` | List all users. Filter: `?citta=Roma` |
| GET | `/api/utenti/:id` | Get a single user |
| POST | `/api/utenti` | Create user — required: `nome`, `email`; optional: `citta` |
| PUT | `/api/utenti/:id` | Full update — required: `nome`, `email` |
| PATCH | `/api/utenti/:id` | Partial update |
| DELETE | `/api/utenti/:id` | Delete user (cascades to posts and comments) |

### Posts — `/api/post`

**Fields:** `id`, `userId`, `titolo`, `corpo`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/post` | List all posts. Filter: `?userId=1` |
| GET | `/api/post/:id` | Get a single post |
| POST | `/api/post` | Create post — required: `userId`, `titolo`, `corpo` |
| PUT | `/api/post/:id` | Full update |
| PATCH | `/api/post/:id` | Partial update |
| DELETE | `/api/post/:id` | Delete post (cascades to comments) |

### Comments — `/api/commenti`

**Fields:** `id`, `postId`, `nome`, `email`, `corpo`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commenti` | List all comments. Filter: `?postId=4` |
| GET | `/api/commenti/:id` | Get a single comment |
| POST | `/api/commenti` | Create comment — required: `postId`, `nome`, `email`, `corpo` |
| PUT | `/api/commenti/:id` | Full update |
| PATCH | `/api/commenti/:id` | Partial update |
| DELETE | `/api/commenti/:id` | Delete comment |

### Response conventions

```jsonc
// Validation or not-found error
{ "errore": "descrizione del problema" }

// Successful DELETE
{ "messaggio": "risorsa eliminata", "risorsa": { /* deleted object */ } }
```

| Scenario | HTTP Status |
|----------|-------------|
| Created | `201` |
| Validation error | `400` |
| Not found | `404` |
| Database error | `500` |

## Architecture

```
routes/*.js          → validate input, call query functions, return JSON
  └─ database/queries/*.js  → parameterized SQL (no ORM, no SQL injection)
       └─ database/connessione.js  → mysql2 connection pool (.env credentials)
```

- All queries use `?` placeholders — SQL injection is not possible
- Route handlers are `async/await` with `try/catch`
- Foreign keys use `ON DELETE CASCADE`: deleting a user removes their posts and comments automatically
