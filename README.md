# 📚 BookBase — MERN Book Management System

A full-stack book database with reviews, ratings, pricing, favourites, audio books, and more — built with the MERN stack.

---

## 🗂️ Project Structure

```
bookbase/
├── frontend/                    ← React + Tailwind CSS (Vite)
│   └── src/
│       ├── components/
│       │   ├── Layout.jsx       ← Shell with sidebar + navbar
│       │   ├── Sidebar.jsx      ← Navigation sidebar
│       │   ├── Navbar.jsx       ← Top search/profile bar
│       │   ├── BookCard.jsx     ← Book thumbnail card
│       │   ├── CategoryFilter.jsx
│       │   └── StarRating.jsx
│       ├── pages/
│       │   ├── Discover.jsx     ← Home / dashboard
│       │   ├── Category.jsx     ← Browse + search + filter
│       │   ├── MyLibrary.jsx    ← User's book collection
│       │   ├── Download.jsx     ← Downloaded books
│       │   ├── AudioBooks.jsx   ← Audio book listing
│       │   ├── Favourite.jsx    ← Favourited books
│       │   ├── Settings.jsx     ← Profile & password
│       │   ├── Support.jsx      ← FAQ + contact form
│       │   ├── BookDetail.jsx   ← Book info + reviews
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── context/
│       │   └── AuthContext.jsx  ← Global auth state (JWT)
│       ├── hooks/
│       │   └── useBooks.js      ← Reusable data fetching
│       └── services/
│           └── api.js           ← Axios instance
│
└── backend/                     ← Node.js + Express
    ├── config/
    │   └── db.js                ← MongoDB Atlas connection
    ├── models/
    │   ├── User.js              ← User schema (bcrypt hashed)
    │   ├── Book.js              ← Book schema (full-text index)
    │   └── Review.js            ← Review + auto rating calc
    ├── controllers/
    │   ├── authController.js    ← Register, login, me, password
    │   ├── bookController.js    ← CRUD, search, download
    │   ├── reviewController.js  ← Review CRUD
    │   └── userController.js    ← Profile, library, favourites
    ├── middleware/
    │   ├── authMiddleware.js    ← JWT protect + adminOnly
    │   └── errorMiddleware.js   ← Global error handler
    ├── routes/
    │   ├── authRoutes.js
    │   ├── bookRoutes.js
    │   └── reviewRoutes.js
    │   └── userRoutes.js
    ├── server.js                ← Express app entry point
    └── .env.example             ← Environment variables template
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Backend
cd bookbase/backend
npm install
cp .env.example .env        # Fill in your values

# Frontend
cd ../frontend
npm install
```

### 2. Set Up MongoDB Atlas
- Create a free cluster at https://cloud.mongodb.com
- Copy the connection string into `backend/.env` as `MONGO_URI`

### 3. Run Dev Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev    # Runs on :5000

# Terminal 2 — Frontend
cd frontend && npm run dev   # Runs on :5173
```

---

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✅ | Get current user |
| PUT | /api/auth/password | ✅ | Change password |
| GET | /api/books | — | List books (filter/search/page) |
| GET | /api/books/:id | — | Single book |
| POST | /api/books | 🔒 Admin | Create book |
| PUT | /api/books/:id | 🔒 Admin | Update book |
| DELETE | /api/books/:id | 🔒 Admin | Delete book |
| GET | /api/books/:id/download | ✅ | Get download URL |
| GET | /api/reviews/book/:id | — | Book reviews |
| POST | /api/reviews/book/:id | ✅ | Add review |
| PUT | /api/reviews/:id | ✅ | Update own review |
| DELETE | /api/reviews/:id | ✅ | Delete review |
| PUT | /api/users/profile | ✅ | Update profile |
| PUT | /api/users/favourites/:id | ✅ | Toggle favourite |
| POST | /api/users/library/:id | ✅ | Add to library |
| GET | /api/users/downloads | ✅ | Get downloads |

---

## ☁️ Deployment

**Frontend → Vercel**
```bash
cd frontend && npm run build
# Push to GitHub → connect repo in Vercel
# Set env: VITE_API_URL=https://your-backend.onrender.com/api
```

**Backend → Render**
- New Web Service → connect GitHub repo
- Build command: `npm install`
- Start command: `node server.js`
- Add all `.env` variables in Render dashboard

---

## ✨ Features

- 🔐 JWT Authentication with bcrypt password hashing
- 📖 Full book CRUD (Admin only)
- ⭐ Reviews & ratings (auto-calculated average)
- ❤️ Favourites & personal library
- 📥 Download tracking
- 🎧 Audio book support
- 🔍 Full-text search across title, author, description
- 📂 Category filtering
- 📄 Pagination
- 🌐 Cloudinary-ready for cover images
MIT License
