# CityPulse OS

A full-stack emergency response simulation and management platform built with a Next.js frontend and an Express backend. The project combines immersive visual design, role-based incident workflows, scheduling simulation algorithms, and optional data persistence for emergency response management.

## Project Overview

`CityPulse OS` is designed to simulate and manage emergency incidents, dispatch roles, and compare scheduling behavior. It includes:

- A **Next.js 16 App Router frontend** with rich animations, 3D visuals, and a dark ember-inspired theme.
- An **Express 5 backend** with authentication, incident reporting, and scheduling simulation APIs.
- Support for **multiple scheduling algorithms**: FCFS, SJF, Priority, and Round Robin.
- Role-based incident handling and mock assignment logic.
- Optional **MongoDB** integration for persistence via environment configuration.

## Repository Structure

```
/ (project root)
  README.md
  /backend
    server.js
    package.json
    /routes
      auth.js
      incidents.js
      simulate.js
    /utils
      assign.js
      scheduler.js
  /frontend
    package.json
    next.config.mjs
    tsconfig.json
    /app
      landing/page.tsx
      login/page.tsx
      simulation/page.tsx
      comparison/page.tsx
      /admin
        layout.tsx
        incidents/page.tsx
        users/page.tsx
        settings/page.tsx
        roles/page.tsx
    /components
      animated-ui.tsx
      scene-3d.tsx
      sidebar.tsx
    /styles
      globals.css
    /public
      ...assets
```

## Key Features

### Frontend

- **Landing Page** with animated hero, visual storytelling, and CTA flow.
- **Admin portal** for managing incidents, users, roles, and app settings.
- **Simulation page** for selecting scheduling algorithms and reviewing results.
- **Comparison pages** for observing algorithm behavior and response performance.
- **3D scene and animated UI components** for a modern emergency command center feel.

### Backend

- **Express API server** with REST endpoints.
- **Authentication** using JWTs and a simple in-memory user store.
- **Incident reporting** and assignment logic.
- **Scheduling simulation engine** supporting four algorithms.
- **Optional MongoDB support** via `MONGO_URI`.

## Technology Stack

- Frontend
  - Next.js 16
  - React 19
  - Tailwind CSS 4
  - Framer Motion
  - @react-three/fiber / drei
  - Lucide icon system
- Backend
  - Node.js + Express 5
  - Mongoose (optional)
  - JWT-based auth
  - bcryptjs for password hashing
  - CORS + dotenv

## Setup and Run

### Prerequisites

- Node.js 20.x or compatible
- npm 10.x or compatible
- Optional: MongoDB if you want database persistence

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend` with optional values:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/citypulse
```

Run the backend server:

```bash
node server.js
```

The backend API will be available at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend app will run at `http://localhost:3000` by default.

## Available Endpoints

### Backend API

- `POST /api/auth/login` — authenticate users
- `POST /api/auth/signup` — create test user in memory
- `POST /api/incidents/report` — report a new incident
- `GET /api/incidents` — retrieve current incident list
- `POST /api/simulate` — run incident scheduling simulation

### Frontend Pages

- `/` — Landing page
- `/login` — login form
- `/simulation` — scheduling simulation interface
- `/comparison` — algorithm comparison dashboard
- `/admin` — admin dashboard wrapper
- `/admin/incidents` — incident management
- `/admin/users` — user management
- `/admin/settings` — app settings
- `/admin/roles` — role assignment management

## Development Notes

- The backend currently uses an **in-memory store** for users and incidents when `MONGO_URI` is not configured.
- The authentication routes are implemented for quick development and can be replaced with a real database integration.
- The frontend uses custom theme variables and reusable animated UI components in `frontend/components/animated-ui.tsx`.
- `Scene3D` provides a dynamic background environment using `@react-three/fiber`.

## Extending the Project

Suggested improvements:

- Add a root `package.json` for monorepo scripts.
- Implement persistent storage for users and incidents with MongoDB.
- Add a backend `start` script in `backend/package.json`.
- Add frontend test coverage and API error handling.
- Expand role-based access control and admin permissions.

## Troubleshooting

- If the frontend cannot reach the backend, verify the backend port and update API calls accordingly.
- If `MONGO_URI` is missing, the backend will still run in simulation mode but will not persist data.
- Ensure `JWT_SECRET` is set for consistent token validation when restarting the server.

## Credits

Built as a responsive emergency command system with modern animation, simulation, and dashboard UX.
