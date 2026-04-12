# 🌿 FreshNest
### Post-Harvest Storage & Logistics Management System
**Daffodil International University — SE331 Capstone Project**

---

## 📁 Project Files

| File | Description |
|------|-------------|
| `index.html` | Complete frontend SPA — open directly in browser (no build needed) |
| `server.js` | Node.js + Express REST API backend |
| `database.sql` | MySQL schema + seed data |
| `package.json` | Node.js dependencies |
| `.env.example` | Environment variable template |

---

## 🚀 Quick Start

### Option A — Frontend Only (Demo Mode)
Simply open `index.html` in your browser. Data is stored in the browser via the storage API. No backend required for demo purposes.

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@harvest.bd | admin123 |
| Farmer | rahim@farm.bd | pass123 |
| Transport | karim@trans.bd | pass123 |
| Dealer | dhaka@fresh.bd | pass123 |

> **Note:** clicking the “Quick Demo Login” chips now works even without a backend server; the frontend will fall back to seeded data when the API cannot be reached.

---

### Option B — Full Stack Setup

#### 1. Set Up MySQL Database
```bash
# Create database and tables
mysql -u root -p < database.sql
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

Your `.env` file:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=freshnest_db
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
```

#### 3. Install & Run Backend
```bash
npm install
npm run dev       # Development with auto-reload
npm start         # Production
```

#### 4. Connect Frontend to Backend
In `index.html`, find the `API_BASE` constant and update:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

---

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (index.html)               │
│              HTML5 + CSS3 + Vanilla JavaScript           │
│         Role-based SPA: Farmer / Transport / Dealer / Admin │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JSON)
                           │ JWT Authentication
┌──────────────────────────▼──────────────────────────────┐
│                    Backend (server.js)                    │
│                  Node.js + Express.js                     │
│              Rate Limiting · CORS · Helmet                │
└──────────────────────────┬──────────────────────────────┘
                           │ mysql2 connection pool
┌──────────────────────────▼──────────────────────────────┐
│                  Database (database.sql)                  │
│                     MySQL 8.0+                           │
│  users · produce · produce_conditions · transport_requests │
│              deals · delivery_failures                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🌱 Supported Produce

### Fruits (12)
Mango · Banana · Litchi · Pineapple · Guava · Papaya · Jackfruit · Watermelon · Coconut · Orange · Strawberry · Grape

### Vegetables (12)
Tomato · Potato · Onion · Eggplant · Cucumber · Cauliflower · Cabbage · Carrot · Spinach · Green Bean · Bitter Gourd · Pumpkin

Each crop has: storage temperature, humidity range, freshness duration, harvest months, and specific storage tips.

---

## 📋 API Endpoints

### Auth
```
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login, returns JWT token
```

### Users
```
GET    /api/users            All users (Admin only)
GET    /api/users/me         Current user profile
```

### Produce
```
GET    /api/produce          List produce (filtered by role)
POST   /api/produce          Add produce listing (Farmer)
DELETE /api/produce/:id      Remove listing (Farmer/Admin)
PATCH  /api/produce/:id/status  Update status
```

### Transport
```
GET    /api/transport        List requests (filtered by role)
POST   /api/transport        Create request (Farmer)
PATCH  /api/transport/:id    Update status (Accept/Complete/Cancel)
```

### Deals
```
GET    /api/deals            List deals (filtered by role)
POST   /api/deals            Create deal offer (Dealer)
PATCH  /api/deals/:id        Respond to deal (Farmer: Accept/Decline)
```

### Failures
```
GET    /api/failures         List failures
POST   /api/failures         Report failure (Transport)
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Farmer** | Add/remove produce, create transport requests, respond to deal offers, view storage guide |
| **Transport Provider** | Browse & accept transport requests, mark deliveries complete, report delivery failures |
| **Dealer/Supplier** | Browse available produce, send deal offers to farmers, track deal status |
| **Admin** | View all users, produce, transport requests, deals, and failures across the system |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Backend | Node.js 18+, Express.js 4 |
| Database | MySQL 8.0 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Security | helmet, cors, express-rate-limit |

---

## 📅 Project Timeline

| Phase | Activity | Duration |
|-------|----------|----------|
| Phase 1 | Requirement Analysis | Week 1–2 |
| Phase 2 | System Design & Architecture | Week 3–4 |
| Phase 3 | Frontend & Backend Development | Week 5–8 |
| Phase 4 | Integration & Testing | Week 9–10 |
| Phase 5 | Bug Fixing & Validation | Week 11 |
| Phase 6 | Documentation & Submission | Week 12 |

---

## 👨‍💻 Team

- **Khan Maisha Moon** — Student ID: 0242310005341215
- **Riyan Khalashi** — Student ID: 0242310005341014
- **Khorshed Alom Mozahid** — Student ID: 0242310005341228

**Supervisor:** Rahat Uddin Azad, Lecturer, Dept. of SWE, Daffodil International University
**Course:** SE331 — Software Engineering Design Capstone Project
