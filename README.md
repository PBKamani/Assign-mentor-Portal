# Assignmentor

> **"Your Assignments. Organized. Simplified."**

**Assignmentor** is a modern full-stack academic assignment management and study platform designed around a clean 3-level navigation hierarchy:

$$\text{Subject} \longrightarrow \text{Assignment} \longrightarrow \text{Question} \longrightarrow \text{Answer}$$

It features two decoupled experiences:
- **Admin Panel:** Complete CRUD management of academic content (Subjects, Assignments, Questions) with TipTap rich text editing and cloud diagram uploads.
- **User Panel:** Read-only hierarchical coursework navigation, previous/next question browsing, universal search, and study workflows.
- **Neomorphic UI:** Soft convex/concave neomorphism with dual theme support (Cream Light & Dark Blue Dark).

---

## 1. Architecture

```text
GitHub Pages (Hosting)
        ↓
React Frontend (Vite SPA)
        ↓ HTTPS (Bearer ID Token)
FastAPI Backend (API & Business Logic)
        ↓ Firebase Admin SDK (Server)
┌───────┼───────┐
↓       ↓       ↓
Auth  Firestore Storage
```

### Architectural Principles
- **Decoupled Architecture:** React handles UI only and **never** directly performs Firestore database operations.
- **FastAPI Backend:** Handles all authentication verification, role-based authorization (RBAC), validation, CRUD, and diagram upload operations.
- **Firebase Services:**
  - **Firebase Authentication:** Handles user identity and ID tokens.
  - **Cloud Firestore:** 4 collections strictly: `users`, `subjects`, `assignments`, `questions` (NO `units`).
  - **Firebase Storage:** Hierarchical diagram storage (`assignmentor/question-diagrams/...` and `assignmentor/answer-diagrams/...`).
- **Diagram Placement Contract:**
  - **Question Diagram:** Rendered strictly **OUTSIDE** the answer box (between question prompt and answer heading).
  - **Answer Diagram:** Rendered strictly **INSIDE** the answer box below the formatted solution text.

---

## 2. Directory Structure

```text
assignmentor/
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # Automated GitHub Pages CI/CD workflow
├── backend/
│   ├── app/
│   │   ├── routes/              # auth, subjects, assignments, questions, upload, search
│   │   ├── services/            # business logic & storage management
│   │   ├── schemas/             # Pydantic validation models
│   │   ├── utils/               # standardized responses
│   │   ├── config.py            # environment settings
│   │   ├── dependencies.py      # RBAC & token security guards
│   │   ├── firebase.py          # Firebase Admin SDK initialization
│   │   └── main.py              # FastAPI app, CORS, health endpoints
│   ├── init_live_firebase.py    # Live Firebase user & collection provisioner
│   ├── test_api.py              # Unit & API test suite (10 tests)
│   ├── test_firebase_live.py    # Firebase & Storage integration tests (18 tests)
│   ├── test_e2e_full.py         # End-to-end full application tests (32 tests)
│   ├── requirements.txt         # Production backend dependencies
│   ├── .env.example             # Backend environment template
│   └── .env                     # (Ignored by Git)
│
├── frontend/
│   ├── public/
│   │   ├── .nojekyll            # Disables Jekyll on GitHub Pages
│   │   └── 404.html             # SPA fallback redirect
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/           # DataTable, QuestionEditor, ImageUploader
│   │   │   ├── common/          # Button, Modal, Loader, EmptyState, ThemeToggle
│   │   │   ├── layout/          # Navbar, Sidebar (responsive drawer), MainLayout
│   │   │   └── questions/       # QuestionCard, AnswerBox, DiagramViewer
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── pages/               # Login, UserDashboard, SubjectPage, AssignmentPage, Admin pages
│   │   ├── routes/              # AppRoutes (HashRouter), ProtectedRoute
│   │   ├── services/            # api.js, firebase.js
│   │   └── styles/              # theme.css, neomorphism.css, global.css
│   ├── package.json
│   ├── vite.config.js           # Base path './' for GitHub Pages
│   ├── .env.example             # Frontend environment template
│   └── .env                     # (Ignored by Git)
│
├── .gitignore                   # Ignores .env, serviceAccountKey.json, uploads
└── README.md
```

---

## 3. Environment Variables

### Backend Configuration (`backend/.env`)

```ini
# Server Settings
PORT=8000
HOST=0.0.0.0

# CORS Allowed Frontend Origin
# Development: http://localhost:5173
# Production (GitHub Pages): https://<your-github-username>.github.io
FRONTEND_URL=http://localhost:5173

# Option 1: Path to Firebase Service Account JSON (Recommended for Local Dev)
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json

# Option 2: Individual Environment Variables (Recommended for Render / Cloud Run)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_WEB_API_KEY=your-firebase-web-api-key
```

### Frontend Configuration (`frontend/.env`)

```ini
# Backend API Base URL
# Development: http://localhost:8000/api
# Production (Render/Railway): https://<your-backend-app>.onrender.com/api
VITE_API_BASE_URL=http://localhost:8000/api

# Base path (defaults to ./ which works on GitHub Pages subpaths)
# VITE_BASE_PATH=./

# Firebase Web App Public Client Credentials
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

---

## 4. Local Development

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ (tested through 3.14)

### Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run all test suites (60 automated assertions)
python test_api.py
python test_firebase_live.py
python test_e2e_full.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

### Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- **Frontend URL:** `http://localhost:5173`

---

## 5. Default Credentials & Roles

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADMIN` | `admin@040905` | Full CRUD on Subjects, Assignments, Questions; Diagram upload/delete |
| **User** | `USER` | `user@123` | Read-only access to browse, search, and view questions & answers |

---

## 6. Firebase Setup

1. **Create Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Enable Authentication:** In the *Authentication* tab, enable **Email/Password** provider.
3. **Enable Firestore:** In the *Firestore Database* tab, create a database in production mode.
4. **Enable Storage:** In the *Storage* tab, create a bucket.
5. **Generate Service Account Key:**
   - Go to *Project Settings* $\rightarrow$ *Service Accounts*.
   - Click **Generate new private key** and save as `backend/serviceAccountKey.json` (already ignored by Git).
6. **Provision Default Users & Roles:**
   ```bash
   cd backend
   python init_live_firebase.py
   ```
   This automatically provisions the `ADMIN` and `USER` accounts in Firebase Auth with custom claims and syncs their profile documents into Firestore `users/{uid}`.

---

## 7. Production Deployment Steps

### Phase A: Deploy FastAPI Backend (Render / Railway / Cloud Run)

1. **Create Web Service:**
   - Connect your GitHub repository to [Render](https://render.com/).
   - Set **Root Directory** to `backend`.
   - Set **Environment** to `Python 3`.
2. **Build & Start Commands:**
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
3. **Configure Environment Variables in Render:**
   - `PORT`: Automatically set by Render.
   - `FRONTEND_URL`: `https://<your-github-username>.github.io`
   - `FIREBASE_PROJECT_ID`: `<your-project-id>`
   - `FIREBASE_CLIENT_EMAIL`: `<your-client-email>`
   - `FIREBASE_PRIVATE_KEY`: `<your-private-key-with-newlines>`
   - `FIREBASE_STORAGE_BUCKET`: `<your-project-id>.appspot.com`
   - `FIREBASE_WEB_API_KEY`: `<your-firebase-web-api-key>`
4. **Verify Deployment:**
   - Visit `https://<your-render-app>.onrender.com/health` $\rightarrow$ should return `{"status": "healthy"}`.
   - Visit `https://<your-render-app>.onrender.com/docs` $\rightarrow$ Swagger UI.

### Phase B: Deploy React Frontend (GitHub Pages)

1. **Repository Settings:**
   - In your GitHub repository, go to **Settings** $\rightarrow$ **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.
2. **Set Repository Secrets:**
   - Go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
   - Add the following repository secrets:
     - `VITE_API_BASE_URL`: `https://<your-render-app>.onrender.com/api`
     - `VITE_FIREBASE_API_KEY`: `<your-firebase-web-api-key>`
     - `VITE_FIREBASE_AUTH_DOMAIN`: `<your-project-id>.firebaseapp.com`
     - `VITE_FIREBASE_PROJECT_ID`: `<your-project-id>`
     - `VITE_FIREBASE_STORAGE_BUCKET`: `<your-project-id>.appspot.com`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `<your-sender-id>`
     - `VITE_FIREBASE_APP_ID`: `<your-app-id>`
3. **Trigger Deployment:**
   - Push to `main` branch or manually dispatch the **Deploy Frontend to GitHub Pages** action under the **Actions** tab.
   - The workflow compiles the Vite SPA to `dist/`, includes `.nojekyll` and `404.html`, and deploys to `https://<your-github-username>.github.io/<repo-name>/`.
4. **Router Compatibility:**
   - Uses `HashRouter` (`/#/...`) and relative `base: './'`, ensuring zero 404 errors on page reload, subpaths, and direct links on GitHub Pages.

---

## 8. Security & Production Guarantees

1. **Generic Login Failure Message (Change 1 Security):**
   - On failed authentication, the system returns strictly:
     > `Invalid username or password.`
   - No hint is ever given whether the username or the password was incorrect.
2. **Zero Password Leakage:**
   - Passwords use `<input type="password" />`.
   - Passwords are never logged in browser console or backend server logs.
   - Plaintext passwords are never stored in Firestore.
3. **Private Credential Protection:**
   - `.env`, `*.env.local`, and `serviceAccountKey.json` are excluded via `.gitignore`.
   - Firebase Admin SDK credentials remain strictly server-side and are never exposed to the frontend.
4. **Strict CORS Policy:**
   - Wildcard `allow_origins=["*"]` is **not** used.
   - Only configured local origins and verified GitHub Pages origins (`r"^https:\/\/[a-zA-Z0-9-]+\.github\.io$"`) are accepted.
5. **Role-Based Access Control (RBAC):**
   - All mutation endpoints (`POST`, `PUT`, `DELETE`) require `role: "admin"`.
   - Regular users attempting any mutation receive an immediate `HTTP 403 Forbidden`.
6. **Cascade Data Integrity:**
   - Deleting a Subject cascades to delete all child Assignments, Questions, and Storage diagram files.
   - Deleting a Question deletes both its Question Diagram and Answer Diagram from Cloud Storage.
