# Project Manager - Architecture

This document describes the technical architecture of the Project Manager application.

## System Overview

Project Manager follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                              │
│                                                                          │
│    ┌──────────────────────────────────────────────────────────────┐     │
│    │                     Angular Application                       │     │
│    │                                                               │     │
│    │   Components ─── Services ─── Guards ─── Interceptors        │     │
│    └──────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│                                    │ HTTP/REST (JSON)                    │
│                                    ▼                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                            APPLICATION TIER                              │
│                                                                          │
│    ┌──────────────────────────────────────────────────────────────┐     │
│    │                   Node.js / Express Server                    │     │
│    │                                                               │     │
│    │   Routes ─── Controllers ─── Middleware ─── Entities         │     │
│    └──────────────────────────────────────────────────────────────┘     │
│                                    │                                     │
│                                    │ TypeORM                             │
│                                    ▼                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                              DATA TIER                                   │
│                                                                          │
│    ┌──────────────────────────────────────────────────────────────┐     │
│    │                         MySQL Database                        │     │
│    │                                                               │     │
│    │   user ─── project ─── project_member ─── task               │     │
│    └──────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (Angular)

### Module Structure

The Angular application uses **standalone components** with lazy loading for optimal performance.

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Component                             │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│   ┌───────────┐      ┌─────────────┐      ┌────────────┐       │
│   │ Auth      │      │ Main        │      │ Admin      │       │
│   │ Layout    │      │ Layout      │      │ Layout     │       │
│   └─────┬─────┘      └──────┬──────┘      └─────┬──────┘       │
│         │                   │                    │              │
│    ┌────┴────┐        ┌─────┴─────┐        ┌────┴────┐        │
│    │ Login   │        │ Dashboard │        │ Users   │        │
│    │ Register│        │ Projects  │        │ (CRUD)  │        │
│    └─────────┘        │ Tasks     │        └─────────┘        │
│                       └───────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Core Services

| Service | Responsibility |
|---------|----------------|
| `AuthService` | Login, logout, register, session management |
| `UserService` | User CRUD operations (admin) |
| `ProjectService` | Project CRUD, member management |
| `TaskService` | Task CRUD operations |

### Guards

| Guard | Purpose |
|-------|---------|
| `AuthGuard` | Blocks unauthenticated access to protected routes |
| `AdminGuard` | Blocks non-admin access to admin routes |

### Interceptors

| Interceptor | Purpose |
|-------------|---------|
| `AuthInterceptor` | Adds `withCredentials: true` for session cookies |

### Data Flow

```
User Action
    │
    ▼
Component ───► Service ───► HTTP Client ───► Backend API
    ▲                                              │
    │                                              │
    └────────────── Observable Response ◄──────────┘
```

## Backend Architecture (Node.js/Express)

### Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      HTTP Request                        │
│                           │                              │
│                           ▼                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │                    ROUTES                        │    │
│  │         Define endpoints and HTTP methods        │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  MIDDLEWARE                      │    │
│  │    Authentication, Authorization, Validation     │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 CONTROLLERS                      │    │
│  │         Handle request/response logic            │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  ENTITIES                        │    │
│  │          TypeORM models + repositories           │    │
│  └─────────────────────┬───────────────────────────┘    │
│                        │                                 │
│                        ▼                                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   DATABASE                       │    │
│  │                     MySQL                        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Middleware Chain

```
Request ──► CORS ──► JSON Parser ──► Session ──► Auth ──► Admin ──► Route Handler
```

| Middleware | Description |
|------------|-------------|
| `cors` | Enables cross-origin requests from Angular app |
| `express.json` | Parses JSON request bodies |
| `express-session` | Manages user sessions |
| `authMiddleware` | Verifies user is authenticated |
| `adminMiddleware` | Verifies user has admin role |

## Database Architecture (MySQL)

### Entity Relationship Diagram

```
┌──────────────────┐
│      USER        │
├──────────────────┤
│ PK  id           │
│     email        │
│     password     │
│     name         │
│     role         │
│     status       │
│     created_at   │
│     updated_at   │
└────────┬─────────┘
         │
         │ 1
         │
         ├─────────────────────────────────────┐
         │                                     │
         │ N                                   │ N
         ▼                                     ▼
┌──────────────────┐                 ┌──────────────────┐
│    PROJECT       │                 │ PROJECT_MEMBER   │
├──────────────────┤                 ├──────────────────┤
│ PK  id           │ 1             N │ PK  id           │
│     name         │◄────────────────│ FK  project_id   │
│     description  │                 │ FK  user_id      │
│ FK  created_by   │                 │     added_at     │
│     created_at   │                 └──────────────────┘
│     updated_at   │
└────────┬─────────┘
         │
         │ 1
         │
         │ N
         ▼
┌──────────────────┐
│      TASK        │
├──────────────────┤
│ PK  id           │
│ FK  project_id   │
│     title        │
│     description  │
│     status       │
│     priority     │
│     due_date     │
│ FK  assigned_to  │
│ FK  created_by   │
│     created_at   │
│     updated_at   │
└──────────────────┘
```

### Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Project | One-to-Many | User creates multiple projects |
| User ↔ Project | Many-to-Many | Users are members of projects (via `project_member`) |
| Project → Task | One-to-Many | Project contains multiple tasks |
| User → Task | One-to-Many | User is assigned to tasks |
| User → Task | One-to-Many | User creates tasks |

### Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| user | PRIMARY | id | Primary key |
| user | UNIQUE | email | Fast lookup, prevent duplicates |
| project | PRIMARY | id | Primary key |
| project | INDEX | created_by | Filter by creator |
| project_member | PRIMARY | id | Primary key |
| project_member | UNIQUE | (project_id, user_id) | Prevent duplicate memberships |
| task | PRIMARY | id | Primary key |
| task | INDEX | project_id | Filter tasks by project |
| task | INDEX | assigned_to | Filter tasks by assignee |
| task | INDEX | status | Filter tasks by status |

## Authentication Architecture

### Session-Based Authentication

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │         │   Server    │         │   MySQL     │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  POST /auth/login     │                       │
       │  {email, password}    │                       │
       │──────────────────────►│                       │
       │                       │  SELECT user          │
       │                       │──────────────────────►│
       │                       │◄──────────────────────│
       │                       │                       │
       │                       │  Verify password      │
       │                       │  (bcrypt.compare)     │
       │                       │                       │
       │                       │  Create session       │
       │                       │                       │
       │  Set-Cookie: sid=xxx  │                       │
       │  {user data}          │                       │
       │◄──────────────────────│                       │
       │                       │                       │
       │  GET /api/projects    │                       │
       │  Cookie: sid=xxx      │                       │
       │──────────────────────►│                       │
       │                       │  Validate session     │
       │                       │                       │
       │                       │  SELECT projects      │
       │                       │──────────────────────►│
       │                       │◄──────────────────────│
       │  {projects}           │                       │
       │◄──────────────────────│                       │
       │                       │                       │
```

### Authorization Matrix

| Resource | Action | Admin | User (Member) | User (Non-Member) |
|----------|--------|-------|---------------|-------------------|
| Users | List/Create/Edit/Delete | ✓ | ✗ | ✗ |
| Projects | List All | ✓ | ✗ | ✗ |
| Projects | List Assigned | ✓ | ✓ | ✗ |
| Projects | Create/Delete | ✓ | ✗ | ✗ |
| Projects | Edit | ✓ | ✗ | ✗ |
| Projects | Add/Remove Members | ✓ | ✗ | ✗ |
| Tasks | List (in project) | ✓ | ✓ | ✗ |
| Tasks | Create/Edit/Delete | ✓ | ✓ | ✗ |

## API Design

### RESTful Conventions

| Operation | HTTP Method | URL Pattern | Example |
|-----------|-------------|-------------|---------|
| List | GET | /resources | GET /api/projects |
| Get One | GET | /resources/:id | GET /api/projects/1 |
| Create | POST | /resources | POST /api/projects |
| Update | PUT | /resources/:id | PUT /api/projects/1 |
| Delete | DELETE | /resources/:id | DELETE /api/projects/1 |
| Nested | GET | /parent/:id/children | GET /api/projects/1/tasks |

### Response Format

**Success Response:**
```json
{
  "id": 1,
  "name": "Project Alpha",
  "description": "Description here",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "message": "Project not found",
  "statusCode": 404
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized (wrong role) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

## Security Considerations

| Concern | Solution |
|---------|----------|
| Password Storage | Hashed with bcrypt (10+ rounds) |
| Session Security | HttpOnly cookies, secure in production |
| SQL Injection | TypeORM parameterized queries |
| XSS | Angular auto-escaping, no innerHTML |
| CORS | Restricted to frontend origin |
| CSRF | SameSite cookie attribute |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Production                             │
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Nginx     │    │  Node.js    │    │   MySQL     │    │
│   │   (Static)  │───►│  (API)      │───►│  (Data)     │    │
│   │   Port 80   │    │  Port 3000  │    │  Port 3306  │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       Development                            │
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │  Angular    │    │  Node.js    │    │   MySQL     │    │
│   │  Dev Server │───►│  (API)      │───►│  (Local)    │    │
│   │  Port 4200  │    │  Port 3000  │    │  Port 3306  │    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
