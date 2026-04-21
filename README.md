# ChibiHabits

ChibiHabits is a gamified habit tracker inspired by Chiikawa. Build routines, level up your companion, and stay accountable with your buddy.

## Features

- Gamified habit tracking with EXP and coins
- Pet growth and progression
- Buddy accountability and nudges
- Shared social town experience
- Rewards and shop system

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Firebase (Firestore, Authentication, Analytics, Messaging)
- UI: Tailwind CSS, Lucide React, Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase CLI (`npm install -g firebase-tools`) for deployment

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a .env file from .env.example and fill in your Firebase web config values:

```bash
# PowerShell (Windows)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Required Vite Firebase variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_FIRESTORE_DATABASE_ID` (use `(default)` unless you configured a named database)

### 3. Run locally

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Security

Firestore rules are defined in `firestore.rules`, including:

- Per-user access controls
- Buddy-sharing access restrictions
- Input validation safeguards

## License

MIT
