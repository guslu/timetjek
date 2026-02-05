# Timetjek

Personnel time registration web application. Employees register working time (clock in/out), view and edit entries. Built with Laravel 11 (API) and Vue 3 + TypeScript (SPA).

## Requirements

- PHP 8.3+
- Composer
- Node.js 18+
- MariaDB (or MySQL/SQLite)

## Setup

**Quick setup (after cloning):**
```bash
chmod +x setup.sh && ./setup.sh
```
Then start the app (see “Run the app” below). If you use Docker, run the same steps inside the app container or use `docker compose up -d` after configuring `.env` for Docker.

**Manual setup:**

1. **Clone and install PHP dependencies**
   ```bash
   composer install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Configure `.env`: set `DB_*` for your database. For local SPA dev with Vite:
   - `APP_URL=http://localhost:8000`
   - `VITE_API_URL=http://localhost:8000`
   - `FRONTEND_URL=http://localhost:5173`
   - `SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:5173`

3. **Migrations**
   ```bash
   php artisan migrate
   ```

4. **Seed demo user**
   ```bash
   php artisan db:seed
   ```
   **Demo credentials:** personal number `1234567890`, password `password`.

5. **Frontend**
   ```bash
   npm install
   npm run build
   ```
   For development: run `npm run dev` (Vite on port 5173) and in another terminal `php artisan serve` (Laravel on 8000). **Open `http://localhost:8000`** (Laravel serves the page; Vite provides hot-reload). Ensure `VITE_API_URL=http://localhost:8000` and `SANCTUM_STATEFUL_DOMAINS` include `localhost,localhost:8000`.

6. **Run tests**
   ```bash
   php artisan test
   ```
   (Use PHP 8.3+; if using Docker, run these inside the app container.)

## Run the app

- **Local (one command):** `chmod +x run.sh && ./run.sh` — uses `.env` (SQLite by default in `.env.example`), runs migrate/seed, then starts PHP and Vite. Open **http://localhost:8000**. Stop with Ctrl+C.
- **Local (manual):** `php artisan serve` in one terminal, `npm run dev` in another; open **http://localhost:8000**.
- **Docker:** Ensure `.env` has `DB_HOST=db` and MySQL settings, then `docker compose up -d` and open **http://localhost:8000**.

If you use MySQL locally (no Docker), set `DB_CONNECTION=mysql` and `DB_*` in `.env` before migrating or running.

## Demo flow

1. Open the app in the browser at **`http://localhost:8000`** (or your Laravel URL).
2. **Login** with personal number `1234567890` and password `password`.
3. **Dashboard**: Clock in (optionally with geolocation). Status shows “Clocked in” and start time. Clock out when done.
4. **Entries**: View paginated list of your time entries. Click an entry to edit.
5. **Edit entry**: Change start/end (UTC stored; UI shows local time). Save; overlap validation applies.
6. **Profile**: Change password (current + new + confirm).

## API (REST under `/api`)

- **Auth (Breeze/Sanctum):** `POST /login`, `POST /logout`, `GET /api/user`, `GET /sanctum/csrf-cookie`, `PUT /api/user/password`.
- **Time entries:**  
  `POST /api/time-entries/clock-in`, `POST /api/time-entries/clock-out`,  
  `GET /api/time-entries/current`, `GET /api/time-entries`, `GET /api/time-entries/{id}`, `PUT /api/time-entries/{id}`.

All timestamps are UTC (ISO 8601); frontend displays in local timezone.

## Intentional non-goals

- No admin UI, roles beyond ownership, soft deletes, exports (CSV/PDF), audit logs, or maps.
- **Postman:** Session-cookie (Sanctum stateful) auth may not persist reliably in Postman; browser SPA with `withCredentials` is the supported flow.

## License

MIT.
