# 🚀 Production Deployment Guide: Secure Digital Assessment Platform

This guide walks you through deploying the **MERN Exam Platform** to **Render** using a single, unified full-stack web service backed by a free cloud **MongoDB Atlas** database.

---

## 🏗️ Architecture Overview

- **Unified Full-Stack Deployment on Render**:
  - The Express backend serves both the `/api/*` REST endpoints and the optimized React SPA static production build (`frontend/build`).
  - **Zero CORS friction**: Frontend and backend live on the exact same domain URL (e.g., `https://secure-assessment.onrender.com`).
  - **Seamless Cookies & Auth**: HttpOnly `refreshToken` cookies work reliably without third-party cookie blocking.
  - **Single Free Service**: Fits completely within Render's free tier.
- **Database**:
  - **MongoDB Atlas** (Free Tier M0) cloud database.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:
1. A **GitHub account** with access to your repository: `https://github.com/Keerthanavenkatesh16/mern-exam-platform`.
2. A free **MongoDB Atlas account** ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).
3. A free **Render account** ([render.com](https://render.com)).

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

1. **Sign in** to [MongoDB Atlas](https://account.mongodb.com/account/login).
2. Click **Create** to deploy a new database:
   - Select the **M0 (Free)** tier.
   - Choose a cloud provider and region closest to you (e.g., AWS / `us-east-1` or `eu-central-1`).
   - Click **Create Deployment**.
3. **Set up Database Access (User Credentials)**:
   - Go to **Security > Database Access** in the left sidebar.
   - Click **+ Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `platform_admin`.
   - Password: Click **Autogenerate Secure Password** or enter your own (copy this down safely!).
   - Database User Privileges: Select **Read and write to any database**.
   - Click **Add User**.
4. **Set up Network Access (IP Whitelist)**:
   - Go to **Security > Network Access** in the left sidebar.
   - Click **+ Add IP Address**.
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`).
   - *(Note: Render dynamic instances do not have static IPs on the free tier, so 0.0.0.0/0 is required).*
   - Click **Confirm**.
5. **Get Your Connection String**:
   - Go to **Deployment > Database**.
   - Click the **Connect** button next to your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
   - Add your database name after `.mongodb.net/`, for example:
     ```
     mongodb+srv://platform_admin:YourStrongPassword123@cluster0.xxxxx.mongodb.net/secure_assessment_platform?retryWrites=true&w=majority
     ```

---

## Step 2: Commit & Push Changes to GitHub

Run these commands in your project terminal (`mern-exam-platform` folder):

```bash
git add .
git commit -m "Configure production deployment for Render monorepo"
git push origin master
```

---

## Step 3: Deploy on Render

You can deploy using either **Method A (Render Blueprint - Fastest)** or **Method B (Manual Setup)**.

### Method A: Automated Deployment via Blueprint (Recommended)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository: `Keerthanavenkatesh16/mern-exam-platform`.
4. Render automatically reads the included [render.yaml](file:///render.yaml):
   - It automatically generates secure 256-bit random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
   - It sets `NODE_ENV=production`.
   - It will prompt you for `MONGO_URI`: paste your MongoDB Atlas connection string from Step 1.
5. Click **Apply**.
6. Render will automatically build the React frontend, install dependencies, and launch the server!

---

### Method B: Manual Web Service Setup

If you prefer setting it up manually:

1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository: `Keerthanavenkatesh16/mern-exam-platform`.
3. Configure the service settings:
   - **Name**: `secure-exam-platform` (or any name you like)
   - **Language**: `Node`
   - **Branch**: `master`
   - **Root Directory**: *(leave blank to use repository root)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, add:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables static serving & cookie security |
   | `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0...` | From Step 1 |
   | `JWT_ACCESS_SECRET` | *(64-character random string)* | Can generate with `openssl rand -hex 32` |
   | `JWT_REFRESH_SECRET` | *(64-character random string)* | Can generate with `openssl rand -hex 32` |
   | `JWT_ACCESS_EXPIRES` | `15m` | Token lifetime |
   | `JWT_REFRESH_EXPIRES` | `7d` | Refresh token lifetime |
   | `COOKIE_SAME_SITE` | `lax` | Browser cookie policy |
5. Click **Create Web Service**.

---

## Step 4: Seed Initial Admin, Faculty & Student Accounts

Once Render finishes deploying and the service status displays **Live**:

1. In your Render Dashboard, click on your service and open the **Shell** tab on the left.
2. In the interactive terminal, type:
   ```bash
   npm run seed
   ```
3. You will see:
   ```
   MongoDB connected: ...
   Seed complete.
   Admin login:    admin@example.com / Admin@123
   Faculty login:  faculty@example.com / Faculty@123
   Student login:  student@example.com / Student@123
   Sample exam created: Full Stack Web Development - Mid-Term Exam
   ```

---

## Step 5: Test and Verify

1. Open your live application URL provided by Render (e.g. `https://secure-exam-platform.onrender.com`).
2. Test logins with each seeded role:
   - **Admin**: `admin@example.com` / `Admin@123` -> Access platform analytics & user management.
   - **Faculty**: `faculty@example.com` / `Faculty@123` -> Manage Question Banks, create and schedule exams.
   - **Student**: `student@example.com` / `Student@123` -> Take the sample exam with timer and autosave.
3. Test Health Check:
   - Visit `https://your-service.onrender.com/api/health` -> should return `{"success":true,"status":"ok"}`.

---

## 🛠️ Maintenance & Future Updates

Whenever you make improvements or changes to your app in the future:
1. Make your changes locally.
2. Run `git add .`, `git commit -m "Your update"`, and `git push origin master`.
3. Render will automatically detect the new commit, recompile the frontend bundle, and redeploy seamlessly with zero manual intervention.
