# Grand Bazaar — Department Store E-Commerce

A full-stack MERN e-commerce application adapted for a department store.

## Project Structure
```
DEPT-STORE/
├── backend/          # Node.js + Express + MongoDB API
│   ├── config/       # DB & Cloudinary config
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error, upload middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routes
│   ├── utils/        # Helpers, seed data
│   └── server.js     # Entry point
└── frontend/         # React + Vite SPA
    └── src/
        ├── components/  # Navbar, Footer, ProductCard, etc.
        ├── context/     # Auth, Cart, Wishlist contexts
        ├── css/         # All stylesheets
        ├── layouts/     # Main & Admin layouts
        ├── pages/       # User & Admin pages
        └── services/    # Axios API instance
```

## Quick Start

### Backend
```bash
cd backend
npm install
# Configure .env (MongoDB, JWT, Cloudinary)
npm run seed    # Seed demo data
npm run dev     # Start dev server on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Start Vite dev server on :5173
```

## Demo Credentials (after seeding)
| Role  | Email              | Password          |
|-------|--------------------|-------------------|
| Admin | admin@gmail.com    | adminpassword123  |
| User  | priya@gmail.com    | password123       |

## Coupon Codes
- `GRAND10` — 10% off orders above ₹1,000
- `WELCOME500` — ₹500 off orders above ₹5,000
- `TECH15` — 15% off orders above ₹10,000

## Departments
Electronics · Home & Living · Fashion · Groceries · Sports & Outdoors · Beauty & Health

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, Multer
- **Frontend**: React 19, Vite, React Router v7, Axios, Framer Motion, React Toastify
