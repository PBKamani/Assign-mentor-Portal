# Assignmentor

> **"Your Assignments. Organized. Simplified."**

Assignmentor is a full-stack academic assignment management and study platform designed around a clean 3-level navigation hierarchy:
$$\text{Subject} \longrightarrow \text{Assignment} \longrightarrow \text{Question} \longrightarrow \text{Answer}$$

---

## Architecture Overview

```text
                        React Frontend (UI Only)
                                   │
                                   │ HTTP / REST API (Bearer Token)
                                   ▼
                            FastAPI Backend
                                   │
                       Firebase Admin SDK (Server)
                      ┌────────────┼────────────┐
                      ▼            ▼            ▼
                 Cloud Auth    Firestore    Cloud Storage
```

### Core Architecture Guarantees
- **Strict Decoupling:** React performs UI operations only and does **not** directly perform Firestore database operations.
- **FastAPI Core:** All authentication verification, role authorization, validation, CRUD, and diagram uploads go through FastAPI.
- **Login Error Security:** Any authentication failure returns strictly the generic message `"Invalid username or password."` without credential leakage or password logging.
- **Diagram Placement Enforced:**
  - **Question Diagram:** Renders strictly **OUTSIDE** the answer box.
  - **Answer Diagram:** Renders strictly **INSIDE** the answer box.
- **Design System:** Pure **Neomorphism** with dual theme support:
  - Cream Light Theme (`#F3EFE6`)
  - Dark Blue Dark Theme (`#101827`)
  - Persistent in `localStorage`.

---

## Default Login Credentials

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Admin** | `ADMIN` | `admin@040905` | Full CRUD access to Subjects, Assignments, Questions & Uploads |
| **Student** | `USER` | `user@123` | Read-only access to browse curriculum, study questions, and search |

---

## Directory Structure

```text
assignmentor/
├── backend/
│   ├── app/
│   │   ├── routes/       # Auth, Subjects, Assignments, Questions, Uploads, Search
│   │   ├── services/     # Business logic & Firebase integration
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── utils/        # Standard response formatting
│   │   ├── config.py     # Settings with pydantic-settings
│   │   ├── firebase.py   # Firebase Admin SDK & High-fidelity local emulator
│   │   ├── dependencies.py # JWT Auth & Admin RBAC guards
│   │   └── main.py       # FastAPI application & CORS
│   ├── requirements.txt
│   ├── test_api.py       # Automated test suite
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/   # Button, Modal, Loader, EmptyState, ThemeToggle
│   │   │   ├── layout/   # Navbar, Sidebar, MainLayout
│   │   │   ├── questions/# QuestionCard, AnswerBox, DiagramViewer
│   │   │   └── admin/    # DataTable, QuestionEditor, ImageUploader
│   │   ├── pages/        # Login, User Dashboard/Study, Admin Management
│   │   ├── services/     # api.js & firebase.js
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── routes/       # AppRoutes & ProtectedRoute
│   │   └── styles/       # global.css, theme.css, neomorphism.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── Assignmentor-Project-Specification.md
└── README.md
```

---

## Running Locally

### 1. Start FastAPI Backend

```bash
cd backend

# Run backend test suite
python test_api.py

# Launch FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

### 2. Start React Frontend

In a separate terminal:

```bash
cd frontend

# Start Vite dev server
npm run dev
```
- **Frontend App:** `http://localhost:5173`
