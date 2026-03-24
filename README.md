# TaskFlow Pro

TaskFlow Pro is a real-time enterprise task and project management platform built to manage hierarchical task distribution, monitor project progress, and support live team collaboration from a centralized dashboard.

## Overview

TaskFlow Pro is designed for teams that need structured project control, role-based access, and instant visibility into ongoing work.

The system supports two main roles:

- **Team Lead**
- **Employee**

Team Leads can create and archive projects, add or remove employees from projects, assign tasks, monitor workflows, and manage urgent incidents.

Employees can access only the projects they are assigned to and update only the tasks assigned to them.

The platform also includes real-time notifications, presence tracking, and incident rooms for urgent project-specific collaboration.

---

## Core Features

### Project Management
- Create and archive projects
- View project details and assigned members
- Prevent modifications on archived projects

### Task Management
- Create tasks under projects
- Assign tasks to employees
- Update task status in real time
- Support dynamic task statuses:
  - Pending
  - In Progress
  - Awaiting Approval
  - Completed

### Role-Based Access Control
- Team Lead and Employee permissions are enforced
- Employees can only access authorized projects and tasks
- Sensitive actions are protected on both backend and frontend

### Real-Time Collaboration
- Instant task update delivery
- Live notifications for:
  - new assignments
  - task updates
  - status changes
- Presence tracking:
  - active users
  - focused task tracking
- Incident rooms for urgent project-specific communication

### Notifications
- In-app notification system
- Real-time notification broadcasting
- Recipient-aware notification handling

### Security and Validation
- JWT authentication
- bcrypt password hashing
- strict Zod validation at request boundaries
- standardized error response structure

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod

### Backend
- NestJS
- TypeScript (strict mode)
- Drizzle ORM
- PostgreSQL
- Redis
- Socket.io
- Swagger

### DevOps / Infrastructure
- Docker
- Docker Compose
- CI pipeline
- Google Cloud deployment target

---

## Architecture

TaskFlow Pro follows a clean layered architecture on the backend:

`Controller → Service → Repository → Drizzle ORM → PostgreSQL`

### Backend Rules
- Controllers contain no business logic
- Services do not access ORM directly
- Repositories are the only layer allowed to use Drizzle
- Domain-to-database mapping happens in the repository layer
- Dependency Injection is mandatory
- Environment variables are accessed only through `ConfigService`
- Configuration is validated centrally with Zod

### Frontend Principles
- Role-aware UI
- Protected routes
- Reusable components
- Schema-driven forms
- Real-time UI updates
- Strict typing with centralized types
- Proper loading, error, empty, and skeleton states

---

## Modules

### Backend Modules
- Auth
- Users
- Projects
- Project Members
- Tasks
- Notifications
- Presence
- Incidents
- Realtime / WebSocket
- Common (exceptions, filters, guards, interceptors, config)

### Frontend Areas
- Authentication pages
- Dashboard
- Projects
- Tasks
- Notifications
- Incidents
- Shared UI components
- Role-based sidebar and protected workspace layout

---

## Standardized Error Format

All backend errors follow a unified response structure:

```json
{
  "type": "ValidationError",
  "error": "Bad Request",
  "message": "Invalid request payload",
  "timestamp": "2026-03-24T10:00:00.000Z",
  "path": "/tasks",
  "statusCode": 400
}
```

---

## API Documentation

Swagger is enabled for backend endpoint documentation.

After running the backend, Swagger can be accessed from the configured API documentation route.

---

## Getting Started

### Prerequisites
- pnpm
- Node.js
- Docker
- Docker Compose
- PostgreSQL
- Redis

### Install Dependencies

```bash
pnpm install
```

### Run Development Environment

```bash
pnpm dev
```

If the project is split into separate frontend and backend apps, run them according to the workspace scripts.

### Run with Docker

```bash
docker compose up --build
```

---

## Environment Variables

Environment configuration is validated centrally using Zod.

Typical variables include:

- database connection URL
- redis connection URL
- JWT secret
- frontend URL
- backend URL
- WebSocket-related settings

Direct `process.env` usage is not allowed outside the configuration layer.

---

## Real-Time Features

TaskFlow Pro uses WebSocket communication with Socket.io for:

- task status synchronization
- notification delivery
- presence updates
- incident room broadcasts

Real-time events are scoped to relevant users and project members to avoid unnecessary broadcasts.

---

## Current Project Status

Implemented and in progress:

- authentication and authorization structure
- role-based project/task access
- project and task workflows
- notifications module improvements
- incident management flow
- presence-related backend structure
- standardized exception handling
- production-oriented architecture

Planned / ongoing improvements:

- deployment to Google Cloud
- final production environment checks
- profile management UI
- additional UX polish
- final presentation preparation

---

## Project Goals

This project was built with the following priorities:

- clean architecture
- strict type safety
- maintainability
- scalability
- real-time collaboration correctness
- production-style engineering practices

---

## Author

Graduation Project — **TaskFlow Pro**
