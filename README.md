# 🎵 Moodify — Rebuilt

A mood-based music discovery app with a real Node.js/Express backend, JWT authentication, and user favourites — ready to deploy on Render.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router v6, Recharts |
| Backend | Node.js, Express 4, JWT, bcryptjs |
| Storage | In-memory (Map) — swap for MongoDB/Postgres anytime |
| Deployment | Render (single web service, free tier) |

## What's new vs the original

- **Real auth** — register/login via `/api/auth/*` with hashed passwords and JWT tokens
- **Protected routes** use the JWT, not just `localStorage.getItem("loggedIn")`
- **Favourites** — logged-in users can heart/un-heart any category; saved server-side
- **Categories from API** — `GET /api/categories` (easy to extend with a DB)
- **Analytics from API** — `GET /api/analytics` returns per-user data
- **Mobile-friendly Navbar** — hamburger menu on small screens
- **Skeleton loaders** on the home page while categories load
- **Error banners** on login/register with real server error messages

---

## Local Development

### 1. Backend
```bash
cd backend
cp .env.example .env          # fill in JWT_SECRET
npm install
npm run dev                   # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start                     # runs on http://localhost:3000
                              # proxied to backend via package.json "proxy"
```

---

## Deploy on Render (step-by-step)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/moodify-rebuilt.git
git push -u origin main
```

### Step 2 — Create a Render Web Service
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Set these fields:

| Field | Value |
|---|---|
| **Name** | moodify |
| **Region** | Singapore (closest to India) |
| **Branch** | main |
| **Build Command** | `cd backend && npm install && cd ../frontend && npm install && npm run build` |
| **Start Command** | `cd backend && node server.js` |
| **Plan** | Free |

### Step 3 — Environment Variables
In Render dashboard → **Environment** tab, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | any long random string (e.g. generate with `openssl rand -hex 32`) |
| `CLIENT_URL` | your Render URL, e.g. `https://moodify.onrender.com` |

### Step 4 — Deploy
Click **Deploy**. Render will build frontend and start the backend which serves the React build as static files.

> **Note:** On the free tier, the service sleeps after 15 min of inactivity. The first request after sleep takes ~30 seconds. Upgrade to Starter ($7/mo) to avoid this.

---

## Adding a Database (optional upgrade)

The in-memory store resets on every deploy. To persist data:

1. Create a **MongoDB Atlas** free cluster
2. `npm install mongoose` in backend
3. Replace the `users` Map with Mongoose models
4. Add `MONGO_URI` env var on Render

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/categories` | — | All mood categories |
| GET | `/api/user/favorites` | ✅ | User's favourites |
| POST | `/api/user/favorites/toggle` | ✅ | Toggle a favourite |
| GET | `/api/analytics` | ✅ | User analytics data |
| GET | `/api/health` | — | Health check |
