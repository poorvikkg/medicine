# MediCare Frontend Client

This directory contains the React and Next.js client for MediCare.

## Tech Stack
* Next.js 15, React
* Tailwind CSS, Vanilla CSS for custom theming
* Recharts for Analytics
* react-webcam for AI Verification
* Web Speech API for Voice Assistant

## Project Structure

* `/app` - Next.js 15 pages and app router routes
    * `/dashboard` - Main schedule tracking and real-time clinical alerts
    * `/medicines` - Regimen management and filter tools for patients and doctors
    * `/patients` - Caregiver directory for searching and viewing patient files
    * `/profile` - Account preferences, contact details, and voice language controls
    * `/verify` - Clinical OCR scanner and color recognition pill verification
* `/components` - Core interface elements (AppShell, Navigation, Voice Assistant, Medicine Card)
* `/context` - Authentication providers and user role states
* `/lib` - API clients with unified error reporting

## Setup

First, install the required dependencies:

```bash
npm install
```

Ensure your `.env.local` is configured correctly:

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL (default: http://localhost:5000/api) |
| NEXT_PUBLIC_FIREBASE_* | Firebase web SDK credentials |

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the application.
