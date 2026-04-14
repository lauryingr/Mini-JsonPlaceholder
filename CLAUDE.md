# Mini JSONPlaceholder

Educational monorepo — a simplified Italian version of JSONPlaceholder for teaching backend/REST API concepts to students.

## Stack

- **Runtime:** Node.js (ES Modules)
- **Backend:** Express 4 (in `api/`)
- **Frontend:** Plain HTML / CSS / vanilla JS (in `web/`)
- **Database:** MySQL 8 via Docker (was: in-memory arrays)
- **DB driver:** mysql2/promise (raw SQL, no ORM)
- **Package manager:** npm

## Monorepo structure

```
mini-jsonplaceholder/
├── CLAUDE.md
├── .gitignore
├── docker-compose.yml             # MySQL 8 container, auto-seeds on first run
├── docs/
│   ├── guida-setup-mysql.md       # Step-by-step setup guide (Italian)
│   ├── cheatsheet-sql.md          # SQL reference for the project
│   └── spiegazione-migrazione.md  # Why and how the migration from arrays to MySQL
├── api/                           # Backend — Express REST API
│   ├── .env.example               # DB credentials template
│   ├── .env                       # Actual credentials (gitignored)
│   ├── server.js                  # Entry point — dotenv, cors, routes, logger, :3000
│   ├── data/
│   │   └── database.vecchio.js    # Old in-memory DB (kept as reference for students)
│   ├── database/
│   │   ├── connessione.js         # mysql2 connection pool
│   │   ├── schema.sql             # CREATE TABLE statements (auto-run by Docker)
│   │   ├── seed.sql               # INSERT seed data (auto-run by Docker)
│   │   └── queries/
│   │       ├── utenti.js          # Async SQL functions for utenti
│   │       ├── post.js            # Async SQL functions for post
│   │       └── commenti.js        # Async SQL functions for commenti
│   ├── routes/
│   │   ├── utenti.js              # /api/utenti — CRUD (async, uses queries/)
│   │   ├── post.js                # /api/post — CRUD (async, uses queries/)
│   │   └── commenti.js            # /api/commenti — CRUD (async, uses queries/)
│   └── package.json
└── web/                           # Frontend — plain HTML/CSS/JS (unchanged)
    ├── index.html
    ├── stile.css
    ├── js/
    │   ├── api.js
    │   ├── ui.js
    │   └── app.js
    └── package.json
```

## Commands

```bash
# Database + phpMyAdmin (from project root)
docker compose up -d       # Start MySQL + phpMyAdmin containers
docker compose down        # Stop all containers
docker compose down -v     # Stop + delete all data (re-seeds on next start)

# Backend
cd api
npm install
npm run dev                # node --watch server.js (auto-restart on changes)

# Frontend
cd web
npm run dev                # serve -l 8080
```

Backend runs on `http://localhost:3000`. Frontend runs on `http://localhost:8080`. phpMyAdmin runs on `http://localhost:8081`. CORS is enabled.

## API endpoints

All responses and field names are in Italian. Same contract as before the MySQL migration.

### Utenti (`/api/utenti`)
- Fields: `id`, `nome`, `email`, `citta`
- GET `/` — list all (filter: `?citta=Roma`)
- GET `/:id`
- POST `/` — required: `nome`, `email`; optional: `citta`
- PUT `/:id` — required: `nome`, `email`
- PATCH `/:id` — partial update
- DELETE `/:id` — cascades to post and commenti

### Post (`/api/post`)
- Fields: `id`, `userId`, `titolo`, `corpo`
- GET `/` — list all (filter: `?userId=1`)
- GET `/:id`
- POST `/` — required: `userId`, `titolo`, `corpo`
- PUT `/:id` — required: `userId`, `titolo`, `corpo`
- PATCH `/:id` — partial update
- DELETE `/:id` — cascades to commenti

### Commenti (`/api/commenti`)
- Fields: `id`, `postId`, `nome`, `email`, `corpo`
- GET `/` — list all (filter: `?postId=4`)
- GET `/:id`
- POST `/` — required: `postId`, `nome`, `email`, `corpo`
- PUT `/:id` — required: `postId`, `nome`, `email`, `corpo`
- PATCH `/:id` — partial update
- DELETE `/:id`

## Backend architecture

- **`database/connessione.js`** — creates a mysql2 connection pool from `.env` variables
- **`database/queries/*.js`** — one module per entity, exports async functions (e.g., `trovaUtenti`, `creaUtente`, `eliminaUtente`). All use parameterized queries (`?` placeholders) to prevent SQL injection
- **`routes/*.js`** — async Express handlers with try/catch. Import from queries/, validate input, return JSON responses
- **`database/schema.sql`** + **`seed.sql`** — auto-executed by Docker on first container creation via `/docker-entrypoint-initdb.d/`

## Frontend architecture

- **No build tools, no frameworks** — plain HTML/CSS/JS with ES Modules
- **Navigation:** 3 `<section>` elements toggled via `.nascosta` CSS class
- **Drill-down:** click user → filtered posts → click post → filtered comments (with breadcrumbs)
- **JS modules:**
  - `api.js` — fetch wrapper with `BASE_URL`, one exported function per API call
  - `ui.js` — rendering functions that take data + container + callbacks, build DOM with template literals
  - `app.js` — orchestrator: imports api + ui, handles nav/forms/delete/drill-down state

## Conventions

- Error responses use `{ "errore": "..." }` (Italian)
- Successful DELETE returns `{ "messaggio": "... eliminato", "<risorsa>": { ... } }`
- POST returns `201`; validation errors return `400`; not found returns `404`; DB errors return `500`
- IDs are auto-generated by MySQL (AUTO_INCREMENT)
- MySQL column names match JSON field names exactly — no aliasing needed
- Foreign keys: `post.userId → utenti.id`, `commenti.postId → post.id` (both ON DELETE CASCADE)
- DB credentials live in `api/.env` (gitignored), template in `api/.env.example`

## Documentation (docs/)

- `guida-setup-mysql.md` — Docker setup, DB verification, env configuration, troubleshooting
- `cheatsheet-sql.md` — SQL commands used in the project, parameterized queries, result types
- `spiegazione-migrazione.md` — Array vs MySQL comparison, async/await, try/catch, connection pools, foreign keys

## Key notes

- `api/data/database.vecchio.js` is the old in-memory approach — kept as reference for students to compare
- Data persists across server restarts (stored in MySQL Docker volume)
- To reset data: `docker compose down -v && docker compose up -d`
- The project language (comments, field names, error messages) is Italian
- CORS is enabled in `api/server.js` via the `cors` npm package
