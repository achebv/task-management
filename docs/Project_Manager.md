# Project Manager

A web application for managing projects and tasks in a team.

## About the Project

Project Manager is a web application that allows users to organize projects and manage tasks within a team. The application provides a simple and efficient way to divide work, track progress, and collaborate on projects.

Built as a single-page application with Angular on the frontend, Node.js/Express on the backend, and MySQL for data persistence.

## User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full access: manage users, create/edit/delete all projects and tasks |
| **User** | Access assigned projects, create/manage tasks within those projects |

## Features

### Authentication
- User login with email and password
- User registration (requires admin approval)
- Session-based authentication
- Logout

### Admin Panel
- View all users
- Create new users
- Edit user details (name, email, role)
- Activate/deactivate users
- Delete users

### Projects
- Create new projects (Admin only)
- Edit project details
- Delete projects (Admin only)
- Assign/remove members to projects
- View project list (filtered by role: Admin sees all, User sees assigned)

### Tasks
- Create tasks within a project
- Edit task details
- Delete tasks
- Assign task to a project member
- Set task priority (Low, Medium, High)
- Set task status (To Do, In Progress, Done)
- Set due date
- View tasks by project

### Dashboard
- Overview of projects count
- Overview of tasks by status
- Recent activity

## Tech Stack

### Frontend
- **Angular 21** — main framework (TypeScript)
- **Angular Material** — UI component library
- **RxJS** — reactive programming with Observables

### Backend
- **Node.js** + **TypeScript**
- **Express** — web framework
- **TypeORM** — database ORM
- **mysql2** — MySQL driver
- **bcrypt** — password hashing
- **express-session** — session management
- **CORS** — cross-origin requests

### Database
- **MySQL 8** — relational database

## Architecture

```
┌─────────────────────┐         HTTP/REST          ┌─────────────────────┐
│     Frontend        │ ◄─────────────────────────► │      Backend        │
│     Angular         │         JSON                │   Node.js/Express   │
│     (Browser)       │                             │                     │
└─────────────────────┘                             └──────────┬──────────┘
                                                               │
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │       MySQL         │
                                                    └─────────────────────┘
```

## Database Structure

### Tables

#### `user`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| email | VARCHAR(255) | Unique, required |
| password | VARCHAR(255) | Hashed with bcrypt |
| name | VARCHAR(100) | Display name |
| role | ENUM | 'admin', 'user' |
| status | ENUM | 'active', 'inactive' |
| created_at | DATETIME | Auto-generated |
| updated_at | DATETIME | Auto-updated |

#### `project`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(255) | Project name |
| description | TEXT | Optional description |
| created_by | INT (FK) | References user.id |
| created_at | DATETIME | Auto-generated |
| updated_at | DATETIME | Auto-updated |

#### `project_member`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| project_id | INT (FK) | References project.id |
| user_id | INT (FK) | References user.id |
| added_at | DATETIME | Auto-generated |

#### `task`
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| project_id | INT (FK) | References project.id |
| title | VARCHAR(255) | Task title |
| description | TEXT | Optional description |
| status | ENUM | 'todo', 'in_progress', 'done' |
| priority | ENUM | 'low', 'medium', 'high' |
| due_date | DATE | Optional due date |
| assigned_to | INT (FK) | References user.id (nullable) |
| created_by | INT (FK) | References user.id |
| created_at | DATETIME | Auto-generated |
| updated_at | DATETIME | Auto-updated |

### Entity Relationships

```
user (1) ──────< project (created_by)
user (1) ──────< project_member >────── (1) project
user (1) ──────< task (assigned_to)
user (1) ──────< task (created_by)
project (1) ──────< task
```

## Application Structure

### Frontend (`client/src/app/`)

```
app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts          # Protects authenticated routes
│   │   └── admin.guard.ts         # Protects admin-only routes
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Adds session/credentials to requests
│   └── services/
│       ├── auth.service.ts        # Login, logout, register
│       ├── user.service.ts        # User CRUD (admin)
│       ├── project.service.ts     # Project CRUD
│       └── task.service.ts        # Task CRUD
├── shared/
│   ├── components/                # Reusable components
│   └── models/                    # TypeScript interfaces
├── layouts/
│   ├── auth-layout/               # Layout for login/register
│   └── main-layout/               # Layout with sidebar/header
└── pages/
    ├── auth/
    │   ├── login/
    │   └── register/
    ├── dashboard/
    ├── admin/
    │   └── users/                 # User management
    ├── projects/
    │   ├── project-list/
    │   ├── project-form/
    │   └── project-detail/
    └── tasks/
        ├── task-list/
        └── task-form/
```

### Backend (`server/src/`)

```
src/
├── index.ts                       # Entry point
├── config/
│   └── database.ts                # TypeORM configuration
├── entities/
│   ├── User.ts
│   ├── Project.ts
│   ├── ProjectMember.ts
│   └── Task.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── project.controller.ts
│   └── task.controller.ts
├── middleware/
│   ├── auth.middleware.ts         # Verify authenticated session
│   └── admin.middleware.ts        # Verify admin role
└── routes/
    ├── index.ts                   # Route aggregator
    ├── auth.routes.ts
    ├── user.routes.ts
    ├── project.routes.ts
    └── task.routes.ts
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/logout | User logout | Authenticated |
| GET | /api/auth/me | Get current user | Authenticated |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/projects | List projects | Authenticated (filtered) |
| GET | /api/projects/:id | Get project details | Member or Admin |
| POST | /api/projects | Create project | Admin |
| PUT | /api/projects/:id | Update project | Admin |
| DELETE | /api/projects/:id | Delete project | Admin |
| GET | /api/projects/:id/members | List project members | Member or Admin |
| POST | /api/projects/:id/members | Add member | Admin |
| DELETE | /api/projects/:id/members/:userId | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/projects/:projectId/tasks | List tasks in project | Member or Admin |
| GET | /api/tasks/:id | Get task details | Member or Admin |
| POST | /api/projects/:projectId/tasks | Create task | Member or Admin |
| PUT | /api/tasks/:id | Update task | Member or Admin |
| DELETE | /api/tasks/:id | Delete task | Member or Admin |

## Authentication Flow

1. User submits login form with email and password
2. Backend verifies credentials against database (bcrypt compare)
3. If valid, session is created and user data is returned
4. Frontend stores user info and redirects to dashboard
5. `AuthGuard` checks for valid session on protected routes
6. `AdminGuard` additionally checks for admin role
7. On logout, session is destroyed and user is redirected to login

## Screen Mockups

### Login
- Email input
- Password input
- Login button
- Link to register

### Dashboard
- Welcome message
- Project count card
- Tasks summary (by status)
- Recent projects list

### Admin - Users
- Users table (name, email, role, status, actions)
- Add user button
- Edit/Delete actions per row

### Projects List
- Project cards or table
- Project name, description preview, member count
- Add project button (Admin)

### Project Detail
- Project info header
- Members section (with add/remove for Admin)
- Tasks list
- Add task button

### Task Form
- Title input
- Description textarea
- Status dropdown
- Priority dropdown
- Due date picker
- Assignee dropdown
- Save/Cancel buttons
