# MediCare Backend API

This directory contains the Node.js and Express REST API for MediCare.

## Tech Stack
* Node.js, Express.js, node-cron
* MongoDB + Mongoose
* JWT for Authentication
* Cloudinary for Storage
* Firebase Cloud Messaging for Notifications
* Tesseract.js, Sharp for AI/OCR

## Project Structure
* `/src/config` - DB, Cloudinary, Firebase setup
* `/src/controllers` - Route handlers
* `/src/middleware` - Auth, error handler
* `/src/models` - Mongoose schemas
* `/src/routes` - Express routers
* `/src/services` - AI verification, OCR, scheduler

## Setup

First, install dependencies:

```bash
npm install
```

Configure your environment variables by copying the example file:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret for JWT signing |
| CLOUDINARY_* | Cloudinary API credentials |
| FIREBASE_* | Firebase Admin SDK credentials |
| EMAIL_* | SMTP credentials for email alerts |

Run the development server:

```bash
npm run dev
```
Runs on `http://localhost:5000`

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/medicines` | Add medicine (doctor) |
| GET | `/api/medicines/patient/:id` | Get patient medicines |
| GET | `/api/medicines/today/:id` | Today's schedule |
| PUT | `/api/logs/:id/take` | Mark dose taken |
| POST | `/api/logs/:id/verify` | Verify with image |
| GET | `/api/dashboard/:id` | Dashboard data |
| GET | `/api/analytics/:id` | Analytics data |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/family-alerts` | Family alerts |
