# TubePlay frontend

React + Vite + Tailwind frontend for the existing Youtube-Backend Express API.

## Run locally
1. Keep your backend running on `http://localhost:8000`.
2. Copy `.env.example` to `.env` (adjust `VITE_API_URL` if needed).
3. From this `frontend` directory:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173`.

## Important backend integration notes
- The backend currently hardcodes CORS origin `http://localhost:5173`, which matches this app.
- The current `src/routes/playlist.routes.js` imports video controller handlers instead of playlist handlers. Playlist UI is included, but playlist CRUD requires correcting that backend router.
- The current video router applies `verifyJWT` to every route, including video listing and viewing. TubePlay therefore treats the feed and watch pages as authenticated.
- Tweet comments are not present in the inspected backend routes; video comments are supported.
- Health endpoint is `/api/v1/healthcheck/`.
- Registration requires an avatar file.
- Upload requires both `videoFile` and `thumbnail` multipart fields.

This frontend does not alter backend files. API response parsing is defensive because some backend controllers return `{ success, data, message }` while others return `{ success, data, pagination }`, and a few video handlers use a different argument order in `ApiResponse`.
