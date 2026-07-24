# EHSS Management System

> Environmental, Health, Safety & Sustainability Management System  
> Built for Capwell Industries — Developed by Angeline Warindi

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://neon.tech)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-purple)](https://render.com)

---

## 🌐 Live URLs

| Resource                 | URL                                              |
| ------------------------ | ------------------------------------------------ |
| **Application**          | https://ehss-system.vercel.app                   |
| **Public Action Portal** | https://ehss-system.vercel.app/public/actions    |
| **Public PPE Matrix**    | https://ehss-system.vercel.app/public/ppe-matrix |
| **Backend API**          | https://ehss-system.onrender.com/api             |

---

## 📋 Overview

A full-stack web application that replaces manual Excel-based EHSS tracking with a centralised, role-based, cloud-hosted platform covering 10 operational modules.

**Modules:**

- 📊 Dashboard — real-time KPI overview
- 🛡️ Safety Metrics — TRIFR/LTIFR auto-calculation
- 🧾 Departmental Costs — budget tracking
- ✅ Compliance Matrix — expiry monitoring
- 📅 EHSS Calendar — training scheduling
- 🏗️ Lifting Equipment — inspection register
- 🦺 PPE Management — inventory, requests, matrix
- 🌿 Sustainability — GHG emissions tracking
- 📌 Action Tracker — corrective actions
- 📊 Reports — PDF export across all modules

---

## 🏗️ Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Frontend         | React 18 + Vite           |
| Routing          | React Router DOM v6       |
| Charts           | Recharts                  |
| HTTP Client      | Axios                     |
| Backend          | Node.js + Express.js      |
| Database         | PostgreSQL (Neon)         |
| Auth             | JWT + bcryptjs            |
| Email            | Nodemailer (Outlook SMTP) |
| PDF Export       | html2canvas + jsPDF       |
| Frontend Hosting | Vercel                    |
| Backend Hosting  | Render                    |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm
- PostgreSQL (local) or Neon account

### Clone the repository

```bash
git clone https://github.com/Warindi118/ehss-system.git
cd ehss-system
```

### Backend Setup

```bash
cd Backend
npm install
```

Create `.env` in the Backend folder:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret_key
SMTP_USER=your_outlook_email@outlook.com
SMTP_PASS=your_outlook_password
LINDA_EMAIL=recipient@email.com
PORT=5000
```

Run the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create `.env` in the Frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`

---

## 🗄️ Database Setup

The database schema can be restored from a backup file:

```bash
psql "your-neon-connection-string" -f ehss_backup.sql
```

Or run migrations manually in Neon SQL Editor / pgAdmin connected to your database.

---

## 👥 User Roles

| Role               | Access                                                      |
| ------------------ | ----------------------------------------------------------- |
| IT Admin           | Full system access including User Management and Audit Logs |
| EHSS Officer       | Full access to all 10 EHSS modules                          |
| QA                 | Compliance, PPE Management, Action Tracker                  |
| Supervisor         | PPE Management, Action Tracker (own submissions)            |
| Storekeeper        | PPE Management (fulfillment), Action Tracker                |
| Production Manager | PPE Management, Action Tracker (own submissions)            |

---

## 🌍 Public Pages

No login required:

- `/public/actions` — Safety issue reporting portal with reference number tracking
- `/public/ppe-matrix` — PPE requirements by department

---

## 📁 Project Structure

```
ehss-system/
├── Frontend/
│   ├── src/
│   │   ├── api/          # Axios instance with JWT interceptor
│   │   ├── assets/       # Logos and images
│   │   ├── components/   # Layout, Sidebar, ChangePasswordModal
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # One folder per module
│   │   ├── styles/       # global.css design system
│   │   └── App.jsx       # Root with React Router
│   ├── .env
│   └── vite.config.js
│
└── Backend/
    ├── config/           # db.js, auth.js
    ├── controllers/      # Business logic per module
    ├── middleware/        # auth.js (requireAuth, requireRole)
    ├── models/           # SQL query functions
    ├── routes/           # Express routers
    ├── utils/            # audit.js, emailService.js
    ├── .env
    └── index.js
```

---

## 🔐 Environment Variables

### Backend (Render)

| Variable       | Description                       |
| -------------- | --------------------------------- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET`   | Secret key for JWT signing        |
| `SMTP_USER`    | Outlook email for notifications   |
| `SMTP_PASS`    | Outlook password                  |
| `LINDA_EMAIL`  | Recipient for safety alerts       |

### Frontend (Vercel)

| Variable       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `VITE_API_URL` | Backend API URL (https://ehss-system.onrender.com/api) |

---

## 🚢 Deployment

### Frontend → Vercel

- Root Directory: `Frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Auto-deploys on push to `main`

### Backend → Render

- Root Directory: `Backend`
- Build Command: `npm install`
- Start Command: `node index.js`
- Auto-deploys on push to `main`

### Database → Neon

- Managed PostgreSQL
- Connect via pgAdmin using `DATABASE_PUBLIC_URL` from Neon dashboard

---

## 📄 Documentation

| Document                | Description                                  |
| ----------------------- | -------------------------------------------- |
| User Manual             | Guide for Linda and all system users         |
| Technical Documentation | Architecture, API, DB schema, deployment     |
| Project Report          | Full project report following Collins' guide |

---

## 👤 Author

**Angeline Warindi**  
IT Intern — Capwell Industries  
GitHub: [@Warindi118](https://github.com/Warindi118)

---

_EHSS Management System — Version 1.0 — July 2026_
