# HackHub 🚀

> A full-stack web platform for managing hackathons — from registration to winner declaration.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Roles & Actors](#roles--actors)
- [Hackathon Lifecycle](#hackathon-lifecycle)
- [Design Patterns](#design-patterns)
- [License](#license)

---

## About

**HackHub** is a web platform for organizing and participating in hackathons. It supports the full lifecycle of an event — from team registration and project submission to evaluation and winner proclamation — with a role-based access system for organizers, judges, mentors, and participants.

---

## Features

- 🏆 Create and manage hackathons with full lifecycle support
- 👥 Team creation, invites, and membership management
- 📁 Project submission and update system (GitHub repository link)
- ⭐ Judge evaluation with score (0–10) and written feedback
- 🚩 Mentor flagging of teams for rule violations
- 🔒 Role-based access control (Visitor, User, Staff, Admin)
- 📅 External calendar integration for mentor/team calls
- 💰 External payment system for prize disbursement
- 🔍 Advanced filtering and sorting for hackathon discovery
- 📱 Progressive Web App (PWA) support

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| Angular | 21 |
| TypeScript | - |
| SCSS | — |
| Bootstrap | - |

### Backend
| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 4 |
| Spring Security | — |
| Spring Data JPA | — |
| H2 Database | — |
| Maven | — |

---

## Architecture

TODO
```
HackHubWeb/
├── hackhub_frontend/       # Angular SPA
│   └── src/
│       ├── app/
│       │   ├── auth/       # Authentication & guards
│       │   ├── features/   # Feature modules (hackathons, teams, submissions...)
│       │   └── shared/     # Shared components, models, services
│       └── environments/
├── hackhub_backend/        # Spring Boot REST API
│   └── src/
│       ├── main/java/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   └── model/
│       └── resources/
│           └── application.properties
└── database/               # SQL scripts
```

---

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- npm 9+
- Maven 3.8+

---

### Backend Setup

```bash
# Navigate to the backend folder
cd hackhub_backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`.

```

> Default credentials are configured in `application.properties`.

---

### Frontend Setup

```bash
# Navigate to the frontend folder
cd hackhub_frontend

# Install dependencies
npm install

# Start the development server
ng serve
```

The app will be available at `http://localhost:4200`.

#### Build for production (PWA)

```bash
ng build
ng serve --configuration=production
```

---

## Roles & Actors

| Role | Description |
|---|---|
| **Visitor** | Unauthenticated user, can browse public hackathon info |
| **User** | Registered user, can create or join a team |
| **Team Member** | Can register their team in a hackathon and submit a project |
| **Mentor** | Staff member who supports teams, can flag rule violations |
| **Judge** | Staff member who evaluates submissions with a score (0–10) and feedback |
| **Organizer** | Staff member who creates hackathons and declares the winner |

---

## Hackathon Lifecycle

```
REGISTRATION → ONGOING → EVALUATION → CLOSED
```

| Status | Description |
|---|---|
| `REGISTRATION` | Teams can register for the hackathon |
| `ONGOING` | Hackathon is active; teams can submit their projects |
| `EVALUATION` | Submissions are closed; the judge evaluates all projects |
| `COMPLETED` | All submissions evaluated; organizer declares the winner |


---

## License

This project is licensed under the [MIT License](LICENSE).

---