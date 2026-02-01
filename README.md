# Timetjek

Personnel time registration web application. Employees register working time (clock in/out), view and edit entries. Built with Laravel 11 (API) and Vue 3 + TypeScript (SPA).

## Requirements

- PHP 8.3+
- Composer
- Node.js 18+
- MariaDB (or MySQL/SQLite)

## Setup

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
   For development: run `npm run dev` (Vite on port 5173) and in another terminal `php artisan serve` (Laravel on 8000). Open `http://localhost:5173` and ensure `VITE_API_URL` and Sanctum stateful domains are set as above.

6. **Run tests**
   ```bash
   php artisan test
   ```
   (Use PHP 8.3+; if using Docker, run these inside the app container.)

## Demo flow

1. Open the app (browser at `http://localhost:5173` in dev or your Laravel URL if serving built assets).
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
