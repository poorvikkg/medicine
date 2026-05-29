# MediCare - Vercel Deployment Guide

This guide explains how to deploy both the **Express Backend** and **Next.js Frontend** to Vercel in just a few steps.

---

## Architecture Overview

Since this repository is a monorepo, we will deploy it as **two separate Vercel projects**:
1. **`medicare-backend`**: Hosts the Express API, processes database updates, and runs cron events.
2. **`medicare-frontend`**: Hosts the senior-friendly Next.js web application.

---

## Step 1: Deploy the Backend API

1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)** and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project configuration screen, configure the following settings:
   * **Project Name:** `medicare-backend`
   * **Framework Preset:** `Other` (Vercel will auto-detect the configuration)
   * **Root Directory:** Click **Edit** and select `backend`.
4. Open the **Environment Variables** section and add the following variables:

| Variable Name | Example Value | Description |
|---|---|---|
| `MONGO_URI` | `mongodb+srv://...` | Your production MongoDB connection string (e.g. MongoDB Atlas). |
| `JWT_SECRET` | `your_long_production_secret` | A secure string for encrypting user login tokens. |
| `NODE_ENV` | `production` | Set to `production`. |
| `CRON_SECRET` | `generate_some_secure_token` | **(Highly Recommended)** A secure key to protect your cron triggers from unauthorized hits. |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP Server Host for Caregiver Alerts. |
| `EMAIL_PORT` | `587` | SMTP Port. |
| `EMAIL_USER` | `your-email@gmail.com` | Your Sender Email address. |
| `EMAIL_PASS` | `your-smtp-app-password` | Your SMTP Email Password (use App Passwords for Gmail). |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_name` | **(Highly Recommended)** Cloudinary account name for persistent image uploads. |
| `CLOUDINARY_API_KEY` | `your_cloudinary_key` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_secret` | Cloudinary API Secret. |

5. Click **Deploy**. Vercel will build the API and provide you with a production URL (e.g., `https://medicare-backend.vercel.app`).
6. **Note down your Backend Production URL.**

---

## Step 2: Deploy the Frontend Application

1. Go back to your Vercel Dashboard and click **Add New > Project**.
2. Import the **same repository** again.
3. Configure the project settings:
   * **Project Name:** `medicare`
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click **Edit** and select `frontend`.
4. Open the **Environment Variables** section and add the following:

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://medicare-backend.vercel.app/api` | **Replace this** with the production URL of your backend + `/api`. |

5. Click **Deploy**. Vercel will build the Next.js static and serverless components.
6. Open your new production app!

---

## Step 3: Configure Scheduled Alerts (Cron Jobs)

Since Vercel Serverless Functions spin down when idle, the in-memory `node-cron` scheduler does not run continuously in production. Instead, we have pre-configured a serverless-ready route: `/api/cron/trigger`.

### Option A: Using Vercel's Built-in Cron (Automated)
Your backend contains a `vercel.json` file which automatically configures Vercel's native cron scheduler to trigger daily logs and reminders.
* Vercel will automatically detect the `"crons"` field and register it when you deploy the backend.
* If you set `CRON_SECRET` in your backend environment variables, Vercel will automatically pass a secure header (`Authorization: Bearer <CRON_SECRET>`) when calling the webhook.

### Option B: Using an External Cron Service (Free)
If you are on a Vercel Hobby plan and want custom 5-minute precision (Vercel Hobby is limited to hourly/daily schedules):
1. Sign up for a free account on **[cron-job.org](https://cron-job.org/)**.
2. Click **Create Cronjob**.
3. Set the **URL** to: `https://medicare-backend.vercel.app/api/cron/trigger`
4. Set the **Schedule** to run every **5 minutes**.
5. Under **Request Headers**, add:
   * **Key:** `Authorization`
   * **Value:** `Bearer <your_cron_secret_here>` (matching the `CRON_SECRET` env variable).
6. Save the cronjob. It will now ping your backend every 5 minutes to trigger reminders and caregiver email alerts!

---

## Production Recommendations

* **MongoDB Atlas:** Do not use `localhost` for production database! Register for a free Sandbox cluster on MongoDB Atlas and set your `MONGO_URI`.
* **Cloudinary:** Because Vercel's filesystem is read-only and ephemeral, any pill photos uploaded locally to `backend/uploads` will disappear. Provide your Cloudinary credentials in the backend environment variables to save all images permanently in the cloud.
