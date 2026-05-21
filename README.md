# 💊 MediCare — AI-Powered Medicine Reminder System

A full-stack medicine reminder and verification system for elderly patients, built with Next.js, Express.js, MongoDB, Cloudinary, Firebase, and AI-powered medicine verification.

---

## 🗂 Project Structure

```
medicine/
├── backend/          # Node.js + Express REST API
│   └── src/
│       ├── config/       # DB, Cloudinary, Firebase
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, error handler
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routers
│       └── services/     # AI verification, OCR, scheduler
│
└── frontend/         # Next.js 15 + Tailwind CSS
    ├── app/          # Pages (App Router)
    ├── components/   # Reusable UI components
    ├── context/      # Auth context
    └── lib/          # Axios API client
```

---

## ⚙️ Setup

### 1. Backend

```bash
cd backend
cp .env.example .env       # Fill in your credentials
npm install
npm run dev                # Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.local .env.local   # Already configured for localhost
npm install
npm run dev                # Runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `CLOUDINARY_*` | Cloudinary API credentials |
| `FIREBASE_*` | Firebase Admin SDK credentials |
| `EMAIL_*` | SMTP credentials for email alerts |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web SDK credentials |

---

## 🚀 Features

| Feature | Status |
|---------|--------|
| JWT Authentication (patient, doctor, caregiver) | ✅ |
| Medicine scheduling with image upload | ✅ |
| Patient dashboard (upcoming/taken/missed) | ✅ |
| Push notifications via Firebase FCM | ✅ |
| AI medicine verification (color + OCR) | ✅ |
| Camera-based verification (webcam/mobile) | ✅ |
| Voice assistant (Web Speech API) | ✅ |
| Family alerts for missed doses | ✅ |
| Analytics with charts | ✅ |
| Dose history logs | ✅ |
| Elderly-friendly large-text UI | ✅ |
| Mobile responsive design | ✅ |

---

## 📡 API Endpoints

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

---

## ⚕️ Medical Disclaimer

> This system is an assistive tool only. Always consult your doctor before changing medication dosage or timing. AI verification is not a substitute for professional medical advice.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, Recharts, react-webcam
- **Backend**: Node.js, Express.js, node-cron
- **Database**: MongoDB + Mongoose
- **Auth**: JWT
- **Storage**: Cloudinary
- **Notifications**: Firebase Cloud Messaging
- **AI/OCR**: Tesseract.js, Sharp
- **Voice**: Web Speech API
