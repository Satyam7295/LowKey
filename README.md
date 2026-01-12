# LOWKEY

Full-stack MERN starter with Express, MongoDB, Vite + React, and TailwindCSS. Auth wiring (JWT middleware) and error handling are scaffolded; plug in your own auth logic to ship fast.

## Folder structure

```
LOWKEY/
├─ backend/
│  ├─ .eslintrc.json
│  ├─ .env.example
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ index.js
│     ├─ config/
│     │  ├─ database.js
│     │  └─ env.js
│     ├─ controllers/
│     │  └─ authController.js
│     ├─ middleware/
│     │  ├─ auth.js
│     │  └─ errorHandler.js
│     ├─ models/
│     │  └─ User.js
│     ├─ routes/
│     │  ├─ auth.routes.js
│     │  ├─ health.routes.js
│     │  └─ index.js
│     ├─ services/
│     │  └─ authService.js
│     └─ utils/
│        ├─ apiError.js
│        └─ asyncHandler.js
├─ frontend/
│  ├─ .eslintrc.json
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  └─ src/
│     ├─ App.jsx
│     ├─ index.css
│     └─ main.jsx
└─ .gitignore
```

## Backend setup

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and update values.
4. Start dev server: `npm run dev`

API mounts at `http://localhost:5000` (default). Routes: `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login` (placeholders).

## Frontend setup

1. `cd frontend`
2. `npm install`
3. Start dev server: `npm run dev` (defaults to http://localhost:5173)

## Auth wiring notes

- `backend/src/middleware/auth.js` verifies Bearer JWT and attaches `req.user` (id and roles). Provide `sub` when signing tokens.
- `backend/src/controllers/authController.js` and `backend/src/services/authService.js` are placeholders for real registration/login logic. Add password hashing (e.g., bcrypt) and token issuance with `jsonwebtoken`.

## Error handling

- `backend/src/middleware/errorHandler.js` provides 404 and JSON error responses. Throw `ApiError` or let async handlers bubble to it.

## Linting

- Backend: `npm run lint` inside `backend`
- Frontend: `npm run lint` inside `frontend`

## Production build (frontend)

- From `frontend`: `npm run build` then serve `dist/` with your host of choice (or wire to the Express app as needed).
