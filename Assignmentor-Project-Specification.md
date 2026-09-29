# Assignmentor

> **Assignmentor** is a full-stack academic assignment management and study platform.
>
> It allows students to navigate:
>
> **Subject → Assignment → Question**
>
> and read structured answers with optional diagrams.
>
> The system has two separate panels:
>
> - **Admin Panel** — Complete CRUD management of academic content (Subjects, Assignments, Questions).
> - **User Panel** — Read-only assignment/question-answer study experience.
>
> The application uses a **Neomorphic UI** with:
>
> - Cream Light Theme
> - Dark Blue Dark Theme
>
> ---
>
> ## Final Architecture
>
> ```text
>                         Assignmentor
>                              │
>               ┌──────────────┴──────────────┐
>               │                             │
>        React Frontend                 FastAPI Backend
>               │                             │
>               └──────────────┬──────────────┘
>                              │
>                       Firebase Services
>                      ┌────────┼────────┐
>                      ↓        ↓        ↓
>                  Firestore  Storage   Auth
> ```
>
> **Important:** React must NOT directly perform database CRUD operations.
> All application data operations must go through the FastAPI backend.

---

# 1. Project Name

## Assignmentor

### Tagline

**"Your Assignments. Organized. Simplified."**

---

# 2. Project Objective

Build a full-stack assignment management platform where students can easily browse academic content through a clean hierarchical navigation system:

```text
Subject
   │
   └── Assignment
         │
         ├── Question 1
         ├── Question 2
         ├── Question 3
         └── ...
```

---

# 3. Technology Stack

## Frontend

```text
React.js
Vite
JavaScript
CSS
React Router
Lucide React
@tiptap/react
@tiptap/starter-kit
```

## Backend

```text
Python
FastAPI
Uvicorn
Pydantic
pydantic-settings
Firebase Admin SDK
python-dotenv
python-multipart
```

## Cloud Services

```text
Firebase Firestore
Firebase Storage
Firebase Authentication
```

---

# 4. Final Architecture

```text
                        USER
                          │
                          ▼
                   React Frontend
                          │
                          │ HTTP / REST API (Bearer Token)
                          ▼
                   FastAPI Backend
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
          Firestore    Firebase     Firebase
          Database     Storage        Auth
                          │
                          ▼
                        Images
```

---

# 5. User Roles

## Admin

Admin can:

- Login
- View dashboard statistics
- Create, Read, Update, Delete Subjects
- Create, Read, Update, Delete Assignments
- Create, Read, Update, Delete Questions
- Edit answers with TipTap Rich Text Editor
- Upload question diagrams (Outside answer box)
- Upload answer diagrams (Inside answer box)
- Replace and delete diagrams
- Reorder content

## User

User can:

- Login
- Browse Subjects
- Browse Assignments
- View Questions and formatted Answers
- View Question diagrams (Outside answer box)
- View Answer diagrams (Inside answer box)
- Search content across hierarchy
- Navigate previous/next questions

User cannot:

- Create, edit, or delete any content
- Upload images or modify storage
- Access admin panel

---

# 6. Login Credentials & Security Requirements

## Credentials

### Admin

```text
Username: ADMIN
Password: admin@040905
```

### User

```text
Username: USER
Password: user@123
```

## Mandatory Login Error Security Rules

1. **Generic Failure Message Only:**
   If either username or password is incorrect, show ONLY:
   > **Invalid username or password.**
2. **Zero Leakage:**
   Do NOT reveal which credential was incorrect. Never show messages such as:
   - "Wrong username"
   - "Wrong password"
   - "Username is incorrect"
   - "Password is incorrect"
   - "Entered username: USER"
3. **Password Masking:**
   Passwords must never be displayed in plain text in the UI. Inputs must strictly use `type="password"`.
4. **No Sensitive Logging:**
   Passwords must never be printed to browser console or backend logs.
5. **No Client Hardcoding:**
   Passwords are never stored in client-side code.

---

# 7. Authentication Flow

```text
User enters credentials
  ↓
React submits credentials to FastAPI (/api/auth/login)
  ↓
FastAPI verifies credentials against Firebase
  ↓ (On failure: return HTTP 401 with "Invalid username or password.")
FastAPI returns Bearer token and user profile
  ↓
React saves token in AuthContext
  ↓
Subsequent requests send Authorization: Bearer <token>
  ↓
FastAPI checks role for RBAC enforcement
```

---

# 8. Firestore Database Structure

Four collections:

```text
users
subjects
assignments
questions
```

### Subjects Collection
```json
{
  "name": "Machine Learning",
  "description": "Comprehensive study of ML algorithms.",
  "order": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Assignments Collection
```json
{
  "subjectId": "subject123",
  "name": "Assignment 1",
  "assignmentNumber": 1,
  "description": "Supervised learning problem set",
  "order": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Questions Collection
```json
{
  "subjectId": "subject123",
  "assignmentId": "assignment123",
  "questionNumber": 1,
  "questionText": "Explain supervised learning and give two examples.",
  "answer": "<formatted answer>",
  "questionDiagramUrl": "https://...",
  "answerDiagramUrl": "https://...",
  "order": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

# 9. Diagram Placement Rules

```text
1) Explain Supervised Learning.

[Question Diagram - STRICTLY OUTSIDE ANSWER BOX]

Answer:

┌──────────────────────────────────────────────┐
│                                              │
│ Answer content...                            │
│                                              │
│ [Answer Diagram - STRICTLY INSIDE]           │
│                                              │
│ Additional explanation...                    │
│                                              │
└──────────────────────────────────────────────┘
```

- **Question diagram = OUTSIDE answer box**
- **Answer diagram = INSIDE answer box**

---

# 10. Firebase Storage Structure

```text
assignmentor/
├── question-diagrams/{subjectId}/{assignmentId}/{questionId}/
└── answer-diagrams/{subjectId}/{assignmentId}/{questionId}/
```

---

# 11. FastAPI API Design

Base URL: `/api`

### Auth APIs
```text
POST /api/auth/login
POST /api/auth/verify
GET  /api/auth/me
```

### Dashboard Stats API
```text
GET  /api/stats
```
Returns: `{ "subjects": int, "assignments": int, "questions": int }`

### Subject APIs
```text
GET    /api/subjects
GET    /api/subjects/{subject_id}
POST   /api/subjects
PUT    /api/subjects/{subject_id}
DELETE /api/subjects/{subject_id}
GET    /api/subjects/{subject_id}/assignments
```

### Assignment APIs
```text
GET    /api/assignments
GET    /api/assignments/{assignment_id}
POST   /api/assignments
PUT    /api/assignments/{assignment_id}
DELETE /api/assignments/{assignment_id}
GET    /api/assignments/{assignment_id}/questions
```

### Question APIs
```text
GET    /api/questions
GET    /api/questions/{question_id}
POST   /api/questions
PUT    /api/questions/{question_id}
DELETE /api/questions/{question_id}
```

### Diagram APIs
```text
POST   /api/upload/question-diagram
DELETE /api/upload/question-diagram
POST   /api/upload/answer-diagram
DELETE /api/upload/answer-diagram
```

### Search API
```text
GET    /api/search?q={term}
```
Returns hierarchical results: `Subject → Assignment → Question`.

---

# 12. Neomorphic Design & Themes

- **Cream Light Theme:**
  - Background & Surface: `#F3EFE6`
  - Text: `#202020`
  - Accent: `#8A795D`
- **Dark Blue Dark Theme:**
  - Background & Surface: `#101827`
  - Text: `#E8EDF5`
  - Accent: `#6D8DB8`
- Soft shadows, extruded cards, inset fields, pressed buttons, minimal borders.
- Persistent in `localStorage`.
