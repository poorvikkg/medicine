# 💊 MediCare — Next.js Frontend Client

This directory contains the modern, elderly-friendly React & Next.js client for **MediCare**, our AI-powered medicine reminder and verification system.

## 🗂 Key Directories

*   `/app` — Next.js 15 pages and app router routes
    *   `/dashboard` — Main schedule tracking and real-time clinical alerts
    *   `/medicines` — Regimen management and filter tools for patients & doctors
    *   `/patients` — Caregiver directory for searching and viewing patient files
    *   `/profile` — Account preferences, contact details, and voice language controls
    *   `/verify` — Clinical OCR scanner and color recognition pill verification
*   `/components` — Core interface elements (AppShell, Navigation, Voice Assistant, Medicine Card)
*   `/context` — Authentication providers and user role states
*   `/lib` — API clients with unified error reporting

## 🚀 Running the Client

First, install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🎨 UI & UX Design

MediCare's interface is custom-tailored for elderly users:
*   **Large, Readable Typography**: Uses the **Inter** font family with ideal contrast levels.
*   **Intuitive Layouts**: Dynamic sidebar/navbar responsive breakpoints designed for mobile screens.
*   **Clear Callouts**: Colors indicate morning (info/teal), afternoon (warning/orange), taken (success/green), or missed (danger/red) doses.
