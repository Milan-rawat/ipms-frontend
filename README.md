# IPMS Frontend

React SPA for the Internal Project Management System.

## Tech Stack

- React 19 + Vite
- Zustand (state management)
- React Router (routing)
- Axios (HTTP client)
- Socket.IO Client (real-time)

## Setup

```bash
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g., `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | Socket.IO server URL (e.g., `http://localhost:5000`) |

## Architecture

```
src/
├── config/         # Environment configuration
├── services/       # API client + endpoint services
├── stores/         # Zustand state stores
├── sockets/        # Socket.IO client
├── pages/          # Route-level page components
├── components/     # Reusable UI components
│   ├── common/     # Buttons, inputs, modals
│   └── layout/     # AppLayout, ProtectedRoute
├── hooks/          # Custom React hooks
├── utils/          # Helpers
├── tests/          # Test files
├── App.jsx         # Router + app shell
└── main.jsx        # Entry point
```
