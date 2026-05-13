# Project Manager

A full-stack project management application with Angular frontend and Node.js/TypeScript backend.

## Project Structure

```
project-manager/
├── client/                 # Angular frontend
├── server/                 # Node.js/Express backend
│   └── src/
│       ├── config/         # Database configuration
│       ├── controllers/    # Request handlers
│       ├── entities/       # TypeORM entities
│       ├── middleware/     # Auth & Admin middleware
│       ├── routes/         # API routes
│       ├── seeds/          # Database seeders
│       └── types/          # TypeScript declarations
├── docs/                   # Documentation
│   ├── Project_Manager.md  # Product Definition
│   └── Architecture.md     # Technical Architecture
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE project_manager;
```

## Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your MySQL credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

The server runs on `http://localhost:3000`. On first run, an admin user is created automatically.

**Default Admin Credentials:**
- Email: admin@admin.com
- Password: admin123

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| POST | /api/auth/logout | User logout |
| GET | /api/auth/me | Get current user |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| GET | /api/projects/:id | Get project |
| POST | /api/projects | Create project (Admin) |
| PUT | /api/projects/:id | Update project (Admin) |
| DELETE | /api/projects/:id | Delete project (Admin) |
| GET | /api/projects/:id/members | List members |
| POST | /api/projects/:id/members | Add member (Admin) |
| DELETE | /api/projects/:id/members/:userId | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects/:projectId/tasks | List project tasks |
| GET | /api/tasks/:id | Get task |
| POST | /api/projects/:projectId/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Get dashboard statistics |

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- TypeORM + MySQL
- bcrypt (password hashing)
- express-session (authentication)

### Frontend (coming soon)
- Angular 21
- Angular Material
- RxJS

## Documentation

- [Product Definition](docs/Project_Manager.md)
- [Architecture](docs/Architecture.md)
