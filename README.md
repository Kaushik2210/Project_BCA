# Modern Church Website

<img src="https://raw.githubusercontent.com/Kaushik2210/Project_BCA/main/frontend/src/assets/hero-bg.png" alt="Project Hero" />

A modern church website consisting of:
- A Node.js + Express backend that exposes a REST API for sermons (with Cloudinary audio uploads).
- A React (Vite) frontend with public sermon browsing and an admin dashboard to add/edit/delete sermons.

This README helps you get both parts running locally, documents the API, and provides practical examples.

---

## Table of Contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Environment variables (.env example)](#environment-variables-env-example)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Sermons](#sermons)
- [Examples (curl)](#examples-curl)


---

## Features
- Public paginated sermons listing with audio players.
- Admin login (JWT-based) to add, edit (including re-upload audio), and delete sermons.
- Audio files uploaded to Cloudinary (resource_type: `video`) using streaming upload.
- Protected API endpoints for administration.
- Responsive React UI built with Vite, Tailwind and GSAP.

---

## Tech stack
- Backend: Node.js, Express, Mongoose, Multer, Cloudinary, JSON Web Tokens
- Frontend: React, Vite, Tailwind CSS (project assets, GSAP, Lenis)
- Database: MongoDB (URI supplied via env)
- File storage: Cloudinary

---

## Prerequisites
- Node.js (v18+ recommended)
- npm (or yarn)
- MongoDB instance (Atlas or local)
- Cloudinary account (for audio hosting)

---

## Quick start

You run the backend and frontend as two separate services (typically in two terminals).

### Backend setup

1. Open a terminal and navigate to the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in `backend/` (see the example below).

4. Start the server in development:
   ```
   npm run dev
   ```
   The server listens on the port you set in `PORT` (e.g. `8000`). The frontend expects the API at `http://localhost:8000` in this repo’s code.

### Frontend setup

1. Open another terminal and navigate to the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Vite dev server:
   ```
   npm run dev
   ```
   Vite will print the local dev URL, typically `http://localhost:5173`.

Open the frontend URL in your browser. To interact with admin features use the Login page (Admin -> Login) and set the same admin credentials as in the backend `.env`.

---

## Environment variables (.env example)

Create a `.env` in `backend/`:

```
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority

# JWT config (any strong secret)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Admin account used by /api/v1/auth/login
ADMIN_USER=admin
ADMIN_PASS=supersecretpassword

# Cloudinary credentials (used to upload audio)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Important:
- Set `PORT` to the port consumed by the frontend requests (the frontend in this repo uses `http://localhost:8000`).
- Keep `JWT_SECRET` secure in production.
- Admin credentials used by the backend are simple environment variables in this project.

---

## API Reference

Base URL (local dev):
```
http://localhost:8000/api/v1
```

Notes:
- Backend has CORS enabled.
- Admin-protected routes require a Bearer JWT token in the Authorization header.

### Auth
- POST /auth/login
  - Description: Logs in the admin using the `ADMIN_USER` and `ADMIN_PASS` env variables and returns a JWT.
  - Body (JSON):
    - username (string)
    - password (string)
  - Response:
    - token (string)
    - expires (timestamp ms)

Example:
POST http://localhost:8000/api/v1/auth/login

### Sermons
- GET /sermons
  - Public paginated endpoint
  - Query params: page (default 1), limit (default 6)
  - Response: { data: { sermons: [...], pagination: { total, page, limit, totalPages } } }

- POST /sermons/post
  - Protected (requires Authorization header)
  - Form data (multipart/form-data):
    - title (string)
    - description (string)
    - audio (file)  <-- field name MUST be `audio`
  - Uploads audio to Cloudinary and saves sermon document to MongoDB.

- PUT /sermons/edit/:id
  - Protected
  - Form data (multipart/form-data):
    - title (string) — optional
    - description (string) — optional
    - audio (file) — optional (if provided, Cloudinary will overwrite the existing public_id)

- DELETE /sermons/delete/:id
  - Protected
  - Deletes the Cloudinary asset and removes the sermon from DB.

Sermon model (fields you will see):
- title (String)
- description (String)
- sermon_url (String) — secure URL to Cloudinary-hosted audio
- sermon_public_id (String) — Cloudinary public id (used to overwrite/destroy)

---

## Examples (curl)

1. Login and get token:
```
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"supersecretpassword"}'
```

2. Fetch sermons (public):
```
curl "http://localhost:8000/api/v1/sermons?page=1&limit=6"
```

3. Upload a sermon (multipart/form-data):
(Note: replace $TOKEN and file path)
```
curl -X POST http://localhost:8000/api/v1/sermons/post \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Sunday Service - Grace" \
  -F "description=A short talk about grace." \
  -F "audio=@/path/to/sermon.mp3"
```

4. Edit a sermon (optional new file):
```
curl -X PUT http://localhost:8000/api/v1/sermons/edit/<SERMON_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Updated Title" \
  -F "audio=@/path/to/new-sermon.mp3"
```

5. Delete a sermon:
```
curl -X DELETE http://localhost:8000/api/v1/sermons/delete/<SERMON_ID> \
  -H "Authorization: Bearer $TOKEN"
```

