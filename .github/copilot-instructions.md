<!-- Copilot / AI agent instructions for the WiChat 2.0 repository -->

# WiChat 2.0 — AI Coding Assistant Notes (expanded)

This file gives focused, actionable guidance for AI coding agents working in this repository.

1. Big-picture architecture

- Backend: Node.js + Express (ES modules) in `backend/src`. Real-time handled by `socket.io` in `backend/src/lib/socket.js`.
- Frontend: React + Vite in `frontend/src` (Zustand for state). Client uses `frontend/src/lib/axiosInstance.js` and `socket.io-client` to talk to the backend.
- Data: MongoDB via Mongoose models in `backend/src/models` (see `user.model.js`, `message.model.js`).
- Production: Backend serves the built frontend from `frontend/dist` when `NODE_ENV === 'production'` (see `backend/src/index.js`).

2. Auth & sessions (critical)

- JWT is issued server-side by `backend/src/lib/utils.js` using `generateToken(userId, res)` and stored as an httpOnly cookie named `jwt`.
- The protect middleware `backend/src/middleware/auth.middleware.js` reads `req.cookies.jwt`, verifies with `JWT_SECRET`, and attaches `req.user` (no header-based tokens are used).
- Frontend uses `withCredentials: true` in `frontend/src/lib/axiosInstance.js`. Changing to header-based auth requires coordinated backend and frontend changes.

3. Real-time / sockets (how to integrate)

- Socket server is in `backend/src/lib/socket.js`. It keeps an in-memory `userSocketMap` mapping `userId` → `socketId`. Helpers exported: `getSocketIdFromUserId(userId)` and `emitNewUserSignup(newUser)`.
- Client connects with the user id in the query string: `io(BASE_URL, { query: { userId: authUser._id } })` (see `frontend/src/store/useAuthStore.js`). Keep this when changing socket authentication.
- Important socket events (server ↔ client):
  - `getOnlineUsers`: sent when connections change (list of online userIds).
  - `newMessage`: server emits when a message is delivered to an online recipient.
  - `newUserSignup`: server notifies clients when a new user signs up.
  - `user-started-typing` / `user-stopped-typing`: typing indicators.
  - `userLastSeenUpdated`: emitted when a user's lastSeen is updated.

4. Media uploads

- Cloudinary is used from controllers via `backend/src/lib/cloudinary.js`. Code expects base64 encoded images and calls `cloudinary.uploader.upload(image, { folder, tags })`.

5. Key APIs and examples

- Auth routes: mounted at `/api/auth` (`backend/src/routes/auth.route.js`). Examples:

  - Client: `await axiosInstance.post('/auth/login', { email, password })`
  - Client check: `await axiosInstance.get('/auth/check')` (used in `useAuthStore.checkAuth`).

- Messages routes: `/api/messages` (`backend/src/routes/message.route.js`). The `sendMessage` controller populates `repliedMessage` and may emit `newMessage` to the recipient socket.

6. Common tasks — short examples

- Add a new socket event (server):

  ```js
  // backend/src/lib/socket.js (inside io.on('connection'))
  socket.on("mark-as-read", async ({ messageId, userId }) => {
    // update DB, then optionally emit to the sender
    const senderSocketId = getSocketIdFromUserId(senderId);
    if (senderSocketId)
      io.to(senderSocketId).emit("message-read", { messageId });
  });
  ```

- Client emit / listen (frontend):

  ```js
  // send
  socket.emit("mark-as-read", { messageId, userId: authUser._id });

  // listen
  socket.on("message-read", ({ messageId }) => {
    /* update local state */
  });
  ```

- Add a protected route (backend):

  ```js
  import express from "express";
  import protectRoute from "../middleware/auth.middleware.js";
  import { someController } from "../controllers/some.controller.js";

  const router = express.Router();
  router.get("/me", protectRoute, someController);
  export default router;
  ```

  Frontend call remains `await axiosInstance.get('/some/me')` (cookies handled by `withCredentials`).

7. Dev & build workflow (how to run)

- Backend dev (watch): `cd backend && npm install && npm run dev` (uses `node --watch` per `backend/package.json`).
- Backend production: `cd backend && npm start` (no watcher).
- Frontend dev: `cd frontend && npm install && npm run dev` (Vite default host 5173).
- Build frontend for production: `cd frontend && npm run build` → outputs `frontend/dist` which backend will serve when `NODE_ENV === 'production'`.

Example PowerShell commands:

```pwsh
cd backend
npm install
npm run dev

# in another terminal
cd frontend
npm install
npm run dev
```

8. Environment variables & gotchas

- Required env vars (used in code): `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NODE_ENV`.
- README mentions `MONGO_URI` but code uses `MONGODB_URI` — align `.env` to `MONGODB_URI`.
- CORS origin is hard-coded to `http://localhost:5173` in `backend/src/index.js`. Change when deploying to production.

9. Project-specific conventions / patterns

- State: Uses Zustand (`frontend/src/store/*`). Stores contain logic for side effects (API calls + socket setup), e.g., `useAuthStore.checkAuth()` both checks auth and calls `connectSocket()` on success.
- API client: `frontend/src/lib/axiosInstance.js` sets `baseURL` depending on `import.meta.env.MODE` and always uses `withCredentials: true`.
- JWT cookie logic: `backend/src/lib/utils.js` sets cookie attributes `httpOnly`, `sameSite: 'strict'` and `secure: process.env.NODE_ENV !== 'development'`.
- Socket identity: socket connections are tied to `userId` query param (not token). If switching to token-based socket auth, update both `io()` client options and server `socket.handshake` parsing.

10. Troubleshooting & tips

- If sockets don't appear online: ensure frontend connects using `BASE_URL` matching backend host and port; check browser console for CORS/socket errors.
- If auth fails: verify the `jwt` cookie is present and `JWT_SECRET` matches between environments.
- Cloudinary uploads failing: ensure `CLOUDINARY_*` env vars are set and uploaded data is valid base64.

11. Where to look first when making a change

- `backend/src/index.js` — application boot, CORS, route mounts, static serving.
- `backend/src/lib/socket.js` — socket behavior, `userSocketMap`, and emitted events.
- `backend/src/middleware/auth.middleware.js` — cookie/JWT verification and `req.user` population.
- `frontend/src/store/useAuthStore.js` — login/signup flow and socket connect/disconnect flows.
- `frontend/src/lib/axiosInstance.js` — central API client and credential handling.

12. Safety and testing notes

- There are no automated tests in the repo; prefer small iterative changes and manual verification using the local dev servers.
- Keep cookie auth and socket mapping consistent — changes will likely require coordinated frontend and backend edits.

If you'd like, I can also add short example PR templates, a checklist for deploying (env var list + CORS updates), or inline code snippets for the most common tasks — tell me which and I'll add them.
