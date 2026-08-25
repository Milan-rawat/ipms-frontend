# IPMS Frontend

React SPA for the Internal Project Management System.

**Live:** https://ipms-frontend-895w.onrender.com

**Backend:** https://github.com/Milan-rawat/ipms-backend

---

## Tech Stack

- React 19 + Vite 8
- Zustand (state management)
- React Router (client-side routing)
- Axios (HTTP client with JWT interceptor)
- Socket.IO Client (real-time updates)
- Vitest + Testing Library (testing)

---

## Architecture

```
App
 ├── Pages (Login, Register, Projects, ProjectDetail, TaskBoard)
 ├── Components (Modal, TaskCard, TaskColumn, TaskForm, ProjectCard, MemberList)
 ├── Stores (authStore, projectStore, taskStore) — Zustand
 ├── Services (apiClient, auth, projects, tasks) — Axios
 └── Sockets (socket.js) — Socket.IO Client
```

**State management:** Zustand with selective subscriptions. Socket.IO events update stores directly from outside React — components re-render only when their subscribed slice changes.

**Real-time flow:**
```
Socket event → socket.js listener → store.applyTask*() → Zustand update → React re-render
```

---

## Features

- Login / Registration with JWT
- Session restoration on refresh
- Protected routing (redirect unauthenticated users)
- Project list with creation
- Project detail with member management (Admin only)
- Kanban task board (Todo / In Progress / Done columns)
- Task CRUD with assignment, priority, status
- Real-time task events (create/update/delete)
- Real-time member events (added/removed)
- Reconnection with automatic room rejoin + API state refresh
- Loading, error, and empty states
- Responsive design
- Accessible forms and modals

---

## Local Setup

```bash
npm install
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:5000/api
#   VITE_SOCKET_URL=http://localhost:5000
npm run dev
```

Requires the backend running at the configured URL.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (35 tests) |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API (e.g., `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | Socket.IO server (e.g., `http://localhost:5000`) |

These are **public** (baked into the browser build). No secrets.

---

## Testing

- 4 test suites, 35 tests passing
- Covers: auth store, project store, task store real-time handlers
- Lint: 0 errors, 0 warnings
- Build: successful

---

## Project Structure

```
src/
├── config/         # Environment configuration
├── services/       # API client + endpoint modules
├── stores/         # Zustand state (auth, projects, tasks)
├── sockets/        # Socket.IO client lifecycle + event listeners
├── pages/          # Route-level components
├── components/     # Reusable UI (common/, layout/, projects/, tasks/)
├── hooks/          # Custom React hooks
├── utils/          # Constants, storage utility
├── tests/          # Test files
├── App.jsx         # Router + auth initialization
└── main.jsx        # Entry point
```
