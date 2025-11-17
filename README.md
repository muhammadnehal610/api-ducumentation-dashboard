# API Documentation Dashboard (Full-Stack Monorepo)

This project has been restructured into a full-stack monorepo with a separate frontend and backend.

- **Frontend**: React + Vite (`frontend/`)
- **Backend**: Express.js (Serverless Compatible) (`backend/`)

## Project Structure

```
api-documentation-dashboard/
├─ backend/                # Express serverless backend
│  ├─ api/
│  ├─ .env                 # Backend environment variables (SECRET)
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend/               # React + Vite frontend
│  ├─ public/
│  ├─ src/
│  ├─ .env.local           # Frontend environment variables
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ vite.config.ts
├─ package.json            # Root package for running both apps concurrently
└─ README.md
```

## Prerequisites

- Node.js (v18 or later)
- npm or yarn

## Getting Started

### 1. Installation

Install dependencies for the root, backend, and frontend applications.

```bash
# Install root dependency (concurrently)
npm install

# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

### 2. Environment Variables

You need to create and configure environment files for both the backend and frontend.

#### Backend (`backend/.env`)

Create a `.env` file inside the `backend` directory and add your secrets.

```env
# A long, random string for signing JSON Web Tokens
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY

# Optional: Port for the local development server
PORT=5001
```

#### Frontend (`frontend/.env.local`)

Create a `.env.local` file inside the `frontend` directory. This tells the frontend where to find the backend API.

```env
# URL for the backend API server
VITE_API_BASE_URL=http://localhost:5001/api
```

### 3. Running the Application

From the root directory, run the following command to start both the frontend Vite development server and the backend Express server simultaneously.

```bash
npm start
```

- The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use).
- The backend API will be available at `http://localhost:5001`.

## Available Scripts

### Root

- `npm start`: Starts both backend and frontend dev servers concurrently.

### Backend (`backend/`)

- `npm run dev`: Starts the backend server using `ts-node-dev` for live reloading.
- `npm run build`: Compiles TypeScript to JavaScript for production.
- `npm run start`: Runs the compiled JavaScript code from the `dist` folder.

### Frontend (`frontend/`)

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the frontend for production.
- `npm run preview`: Previews the production build locally.
