# SpiritualTech Marketplace

A full-stack, containerized web application designed for browsing, booking, and managing spiritual sessions (Meditation, Yoga, Astrology, etc.).

This application allows **Users** to explore and securely book sessions, while empowering **Creators** with a dedicated studio to spin up new sessions and track their incoming bookings. The entire system is Docker-orchestrated, utilizing a Django REST Framework backend mapped to a modern, fully-responsive React/Vite frontend.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TailwindCSS (v4), React Query (TanStack), Axios.
- **Backend:** Django, Django REST Framework, SimpleJWT.
- **Database:** PostgreSQL.
- **Infrastructure:** Docker, Docker Compose, Nginx (Reverse Proxy).
- **Authentication:** OAuth2 (Google & GitHub) with secure JWT issuance.
- **Payments:** Razorpay Integration (Test Mode).

---

## 🚀 Setup & Installation

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/Kumar-Adarsh-Singh/SpiritualTech-Marketplace.git
cd SpiritualTech-Marketplace
```

### 2. Environment Variables Integration
You must create a local `.env` file to hold your secrets.
A template is provided as `.env.example`.

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your OAuth configuration keys (see the **OAuth Setup** section below) and any dummy passwords required for Postgres.

### 3. Launching the App (Docker)
The entire multi-container architecture is orchestrated by Docker Compose. You can launch the database, backend, frontend, and reverse proxy with a single command:

```bash
docker-compose up -d --build
```

That's it! 
- The frontend will be accessible at: `http://localhost`
- The backend API will be accessible at: `http://localhost/api/`

---

## 🔐 OAuth Client Setup Instructions

To allow users to log in securely, you will need to generate OAuth credentials for Google and/or GitHub.

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials** -> **OAuth client ID**.
5. Select **Web application**.
6. Under **Authorized redirect URIs**, add exactly:
   ```
   http://localhost/auth/google/callback
   ```
7. Click **Create**. Copy the `Client ID` and `Client Secret`.
8. Paste them into your `.env` file under `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. *(Note: the Client ID also needs to be duplicated into `VITE_GOOGLE_CLIENT_ID` for the frontend)*.

### GitHub OAuth Setup
1. Go to your [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Fill in the details:
   - **Homepage URL:** `http://localhost`
   - **Authorization callback URL:** `http://localhost/auth/github/callback`
4. Register the application.
5. Copy the `Client ID` and generate a new `Client Secret`.
6. Paste these into your `.env` file under `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. *(Duplicate the Client ID into `VITE_GITHUB_CLIENT_ID`)*.

---

## 📖 Test Demo Flow

Once your application is running (`docker-compose up -d --build`), try the following flow to verify everything is working perfectly:

### Step 1: Login
1. Navigate to `http://localhost` in your browser.
2. Click **"Get Started"** (Google) or **"Sign in with GitHub"**.
3. Follow the standard OAuth prompt. Upon success, you'll be redirected back to the app and see a "Signed in successfully" notification.

### Step 2: Create a Session (Creator Flow)
1. By default, new users are assigned the `user` role. You can optionally connect to the database or Django Admin to elevate your user role to `creator`.
2. Once you are a Creator, click the profile dropdown in the navbar and select **Creator Studio**.
3. Click **New Session**.
4. Fill out the form (e.g., "Sunrise Yoga", Set Price to `500` INR, set the date into the future). Save it.
5. Returning to the main catalog (`http://localhost`), you will now see your newly created session!

### Step 3: Book a Session (User Flow)
1. Sign in with a *different* account (Creators cannot buy their own sessions).
2. Locate the "Sunrise Yoga" session on the homepage and click on it.
3. Click **Book & Pay**.
4. A Razorpay test-mode checkout overlay will appear. Use any dummy test details to complete the payment.
5. Upon success, you will be redirected to your **User Dashboard**, where your newly booked session will be tracked in the "Active" tab!

---

## 🛠 Design Decisions & Optimizations

- **N-Tier Nginx Routing**: Nginx routes `/api/*` heavily isolated to the backend, cleanly splitting requests away from the Vite frontend while utilizing a single universal port (`80`) to eliminate painful CORS issues.
- **N+1 Query Elimination**: The backend explicitly prevents devastating N+1 capacity queries via the `annotate()` and specialized serializers to maximize load performance.
- **Debounced Searching**: Real-time Catalog search applies an invisible 500ms debounce buffer against your requests, massively lowering database CPU strain during active typing.
- **Containerization**: Volume mappings permit live-reloading (HMR for React and Django reloads) while running fully isolated inside standard Alpine environments.
