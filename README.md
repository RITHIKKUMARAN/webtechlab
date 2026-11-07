# Northstar Supply — Full-Stack MERN E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-brightgreen.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **CS3801 — Web Technologies Lab (Exercise 8)**  
> **Institution:** Shiv Nadar University Chennai  
> **Student:** Rithik Kumaran K ([@RITHIKKUMARAN](https://github.com/RITHIKKUMARAN))

---

## 🌟 Executive Summary

**Northstar Supply** is a production-grade, full-stack MERN (MongoDB, Express, React, Node.js) technology and equipment marketplace. Engineered with modern enterprise practices, it provides public catalog discovery, secure authentication via bcrypt and JSON Web Tokens (JWT), complete CRUD user profile management, interactive cart persistence, and an administrator management dashboard.

---

## 🛠️ Technology Stack

### Frontend
- **React 19**: Component-based reactive user interface.
- **TypeScript**: End-to-end static typing for components, API contracts, and domain models.
- **Vite**: Ultra-fast development tooling and optimized production bundler.
- **Tailwind CSS 4**: Modern utility-first styling with custom glassmorphism design.
- **Motion**: Fluid micro-interactions and animated state transitions.
- **Lucide Icons**: Comprehensive iconography for modern web applications.
- **HTML Canvas API**: Custom interactive scratch-card reveal for discount coupons.

### Backend & Database
- **Node.js & Express**: High-throughput REST API runtime.
- **MongoDB & Mongoose**: Object Data Modeling (ODM), schemas, indexes, and transactions.
- **Zod**: Robust runtime schema validation and request sanitization.
- **bcryptjs**: Adaptive salt hashing for user passwords.
- **jsonwebtoken (JWT)**: Cryptographically signed bearer tokens and HTTP-only session cookies.
- **Helmet & CORS**: HTTP security header fortification and origin enforcement.
- **express-rate-limit**: Protection against brute-force attacks and volumetric abuse.

### Deployment & Infrastructure
- **Vercel Serverless Functions**: Serverless deployment via `api/index.ts` and `vercel.json`.
- **MongoDB Atlas**: Cloud database cluster with automatic failover and TLS encryption.

---

## 🔒 Security Architecture

Security was prioritized across all layers of the application:

1. **Zero Credential Exposure**: Real credentials, database connection strings, and cryptographic secrets are strictly managed via environment variables (`.env`). Secrets are never committed to version control; `.gitignore` actively prevents sensitive file tracking.
2. **Password Cryptography**: Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` before database persistence.
3. **Session Revocation**: JWT sessions include session versioning (`sessionVersion`), allowing instantaneous server-side session revocation upon logout or password reset.
4. **Ownership Verification**: Profile operations (`PUT`, `PATCH`, `DELETE`) enforce strict authorization checks—users can only modify or delete their own accounts.
5. **Least Privilege**: Administrative endpoints (product catalog authoring, user listing) are guarded by role-based access control (RBAC).

---

## 📡 RESTful API Reference

All API routes are prefixed under `/api`.

### Authentication & Sessions

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/users` | Register a standard customer account | No | `201 Created` |
| `POST` | `/api/login` | Authenticate credentials and issue session token | No | `200 OK` |
| `POST` | `/api/logout` | Invalidate active session and clear cookies | Yes | `200 OK` |
| `GET` | `/api/me` | Fetch authenticated user profile | Yes | `200 OK` |

### User Profile Management (Exercise-8 Requirements)

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :---: |
| `PUT` | `/api/users?emailId=...` | Replace editable profile fields (complete update) | Yes (Owner) | `200 OK` |
| `PATCH` | `/api/users?emailId=...` | Update selected profile fields (partial update) | Yes (Owner) | `200 OK` |
| `DELETE` | `/api/users?emailId=...` | Permanently delete user registration | Yes (Owner) | `200 OK` |

### Products & Storefront

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/api/products` | Retrieve catalog products with filtering and search | Optional | `200 OK` |
| `POST` | `/api/products` | Add a new product to the catalog | Admin Only | `201 Created` |
| `PUT` | `/api/products/:id` | Update product details | Admin Only | `200 OK` |
| `DELETE`| `/api/products/:id` | Remove product from catalog | Admin Only | `204 No Content` |

### Orders & System Health

| Method | Endpoint | Description | Auth Required | Expected Status |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/orders/checkout` | Process order checkout and deduct stock | Yes | `201 Created` |
| `GET` | `/api/orders` | Retrieve authenticated user's order history | Yes | `200 OK` |
| `GET` | `/health` | Server and database connectivity health probe | No | `200 OK` |

---

## 📂 Repository Structure

```text
webtechlab/
├── api/                     # Vercel serverless function entrypoint
│   └── index.ts             # Serverless bridge for Express API
├── public/                  # Static assets, SVG icons, and generated images
│   ├── northstar-favicon.svg
│   └── products/            # Deterministic product imagery
├── scripts/                 # Utility and build automation scripts
│   └── generate-product-images.mjs
├── src/                     # React frontend source code
│   ├── components/          # Reusable UI components (Navbar, Cart, Modal, etc.)
│   ├── server/              # Mongoose database client & schema definitions
│   │   ├── db.ts            # Database connection & seeding logic
│   │   └── models/          # Mongoose models (User, Product, Order)
│   ├── types/               # TypeScript interface and type declarations
│   ├── App.tsx              # Root storefront application component
│   └── main.tsx             # React DOM entrypoint
├── .env.example             # Clean environment variable blueprint
├── .gitignore               # Strict exclusion of secrets and dependencies
├── index.html               # Single Page Application HTML document
├── metadata.json            # Application metadata
├── package.json             # Node dependencies and project scripts
├── PROJECT_DOCUMENTATION.md # In-depth technical architecture documentation
├── README.md                # Comprehensive project guide (this document)
├── server.ts                # Express HTTP API application server
├── tsconfig.json            # TypeScript compiler configuration
├── vercel.json              # Vercel deployment route mapping
└── vite.config.ts           # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your workstation:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB Community Server or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

---

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RITHIKKUMARAN/webtechlab.git
   cd webtechlab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the `.env.example` template:
   ```bash
   cp .env.example .env
   ```

   Open `.env` in your editor and configure:
   ```env
   # MongoDB connection string (Local or MongoDB Atlas)
   MONGODB_URI="mongodb+srv://<db_username>:<db_password>@<cluster-host>/northstar_supply?retryWrites=true&w=majority"

   # Cryptographically secure random secret (at least 32 characters)
   JWT_SECRET="generate-a-secure-random-secret-key-min-32-chars"

   # Optional: Initial administrator bootstrap credentials
   ADMIN_USERNAME="Administrator"
   ADMIN_EMAIL="admin@northstar.internal"
   ADMIN_PASSWORD="YourStrongAdminPassword123!"

   # Base port and application URL
   PORT=3000
   APP_URL="http://localhost:3000"
   ```

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Storefront UI: [`http://localhost:3000`](http://localhost:3000)
   - Health Probe: [`http://localhost:3000/health`](http://localhost:3000/health)

---

## 🏗️ Production Build & Deployment

### Build for Production
To generate the optimized production bundles:
```bash
npm run build
```

To run the production server:
```bash
npm start
```

### Deploying to Vercel
This repository is pre-configured with `vercel.json` and `api/index.ts` for deployment on Vercel:
1. Import the repository in [Vercel Dashboard](https://vercel.com).
2. Under **Project Settings &rarr; Environment Variables**, configure:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
3. Deploy! Vercel will automatically build the React SPA and serve the Express backend via serverless functions.

---

## 📜 Academic Integrity & License

This project was developed for academic coursework in **CS3801 Web Technologies Lab** at **Shiv Nadar University Chennai**.  
Distributed under the [MIT License](LICENSE).
