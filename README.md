# FreshNest — Post-Harvest Storage & Logistics Management System

A full-stack web application for managing post-harvest storage conditions and logistics for farmers, transporters, and dealers in Bangladesh.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Authentication:** JWT + bcrypt

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp backend/.env.example backend/.env
# Edit .env with your database credentials and JWT secret
```

3. **Initialize database:**
```bash
node db_init.js
```

4. **Start the backend server:**
```bash
cd backend
npm run dev
```
API runs at: http://localhost:5000/api

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp frontend/.env.example frontend/.env
# VITE_API_BASE should be http://localhost:5000/api
```

3. **Start the frontend:**
```bash
npm run dev
```
Frontend runs at: http://localhost:5173

### Demo Mode

Demo mode works without a backend connection. Admin can login with:
- **Email:** admin@harvest.bd | **Password:** admin123

Click the "Admin Demo" button on the login page to access demo mode.

## Demo Credentials (with backend)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@harvest.bd | admin123 |
| Farmer | rahim@farm.bd | pass123 |
| Transport | karim@trans.bd | pass123 |
| Dealer | dhaka@fresh.bd | pass123 |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Produce
- `GET /api/produce` — List produce
- `POST /api/produce` — Add produce (farmer)
- `DELETE /api/produce/:id` — Remove produce
- `PATCH /api/produce/:id/status` — Update status

### Transport
- `GET /api/transport` — List transport requests
- `POST /api/transport` — Create request (farmer)
- `PATCH /api/transport/:id` — Update status

### Deals
- `GET /api/deals` — List deals
- `POST /api/deals` — Create deal (dealer)
- `PATCH /api/deals/:id` — Respond to deal (farmer)

### Failures
- `GET /api/failures` — List failures
- `POST /api/failures` — Report failure (transport)

### Users (Admin)
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user by ID

## Project Structure

```
FreshNest/
├── backend/
│   ├── server.js          # Main API server
│   ├── db_init.js        # Database initialization + migrations
│   ├── app.js            # Express app configuration
│   ├── routes/           # API route handlers
│   ├── middleware/       # Auth & error handling
│   ├── config/          # Database config
│   ├── utils/           # Response helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios + API modules
│   │   ├── components/ # UI components
│   │   ├── context/    # React Context (Auth, AppData)
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Route pages by role
│   │   ├── utils/      # Helpers, normalizers, seed data
│   │   ├── App.jsx     # Main app with routing
│   │   └── main.jsx    # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | freshnest_db |
| JWT_SECRET | JWT signing secret | - |
| NODE_ENV | Production/development | development |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE | Backend API URL | http://localhost:5000/api |

## Features

- **Farmer:** Add produce with image upload, create transport requests, respond to deals, storage guide for 24 crops
- **Transport:** Browse and accept jobs, mark as completed, report delivery failures
- **Dealer:** Browse available produce, make deal offers, track deal status
- **Admin:** Overview dashboard, manage all users/produce/transport/deals/failures

## Security Notes

1. Change `JWT_SECRET` to a strong, unique value in production
2. Never commit `.env` files with real credentials
3. Use `.gitignore` to exclude sensitive files
4. The app validates JWT tokens on every protected route
5. Passwords are hashed with bcrypt (12 rounds)

## License

MIT