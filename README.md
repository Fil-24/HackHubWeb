# HackHub
---

## 📖 Project Overview

**HackHub** is a web application designed to fully digitalize the management of hackathons — time-limited competitions where teams develop and deliver a project to achieve a common goal. The platform centralizes every phase of the event, from participant registration to winner proclamation.

Built with a **Java Spring Boot** backend and an **Angular 21** frontend, HackHub provides a role-based environment where organizers can create and manage events, teams can register and submit their projects, judges can evaluate submissions, and mentors can support participants throughout the competition.

---

## ✨ Features

- 🏆 Create and manage hackathons with a full 4-state lifecycle
- 👥 Team creation, invitations, and membership management
- 📁 Project submission via GitHub repository link, updatable until deadline
- ⭐ Judge evaluation system with numerical score (0–10) and written feedback
- 🚩 Mentor flagging of teams for rule violations
- 🔒 Role-based access control (Visitor, User, Staff, Admin)
- 🔐 JWT-based authentication with role claims
- 🛡️ Angular route guards for frontend protection
- 🔍 Advanced filtering, sorting, and pagination for hackathon and team discovery

---

## 🛠️ Tech Stack

### Backend
| Technology | Details |
|---|---|
| Java | 21 |
| Spring Boot | 4 |
| Spring Web | REST API with `@RestController` |
| Spring Security | JWT authentication + RBAC |
| Spring Data JPA | Repository-based persistence (Hibernate) |
| SQL Server | Azure SQL Database |
| Apache Maven | Build tool and dependency management |

### Frontend
| Technology | Details |
|---|---|
| Angular | 21 |
| TypeScript | Statically typed JavaScript |
| SCSS | Advanced CSS with variables, mixins, nesting |
| Bootstrap 5 | Responsive grid layout and UI components |

---

## 👤 Roles & Actors

| Role | Description |
|---|---|
| **Visitor** | Unauthenticated user, can browse public hackathon info |
| **User** | Registered user, can create or join a team |
| **Staff** | Personnel assigned to specific hackathons as Organizers, Judges, or Mentors |
| **Team Leader** |	Team creator who manages membership, event registration, and invites|
| **Team Member** | Can register their team in a hackathon and submit a project |
| **Mentor** | Staff member who supports teams, can flag rule violations |
| **Judge** | Staff member who evaluates submissions with a score (0–10) and feedback |
| **Organizer** | Staff member who creates hackathons and declares the winner |

---


## ⚙️ Architecture

<img width="1725" height="952" alt="Architettura" src="https://github.com/user-attachments/assets/46baf624-f6d9-4b20-b2ef-1bdbc0ab0988" />

### Design Choices

* **Cloud Infrastructure:** Adopted **Microsoft Azure** via the *Azure for Students* program, which provided a $100 credit (without requiring a credit card) and access to services under cost-effective tiers.
* **Containerization & Deployment:** Both Frontend and Backend are containerized using **Docker**, with images versioned on **Docker Hub**. Container deployment and execution are managed through **Azure Container Apps**.
* **Database:** Utilized **Azure SQL Database** as the managed relational database solution for data persistence.
* **Networking & Security:** Configured a **Virtual Network (VNet)** with dedicated subnets and implemented a **Private Endpoint** to secure resources, ensuring access is strictly restricted to authorized internal services.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** to automate build and deployment on every push to `main`.

Two separate pipelines are configured in `.github/workflows/`:

| Pipeline | File | Trigger |
|---|---|---|
| Backend | `cn-hackhub-backend-AutoDeployTrigger-....yml` | Changes in `hackhub_backend/**` |
| Frontend | `cn-hackhub-frontend-AutoDeployTrigger-....yml` | Changes in `hackhub_frontend/**` |

### Workflow Phases

Both workflows are divided into two sequential macro-phases: **Continuous Integration (CI)** for code validation and **Continuous Deployment (CD)** for production release.

#### Backend Pipeline
* **CI Phase (Validation):**
  * **Environment Setup:** Configuration of **JDK 21** with Maven dependency caching.
  * **Automated Testing:** Execution of tests to verify the correct behavior of CORS and the public base APIs accessible to any visitor.
* **CD Phase (Deployment):**
  * **Authentication:** Secure access to Microsoft Azure via OIDC protocol.
  * **Build & Push:** Generation of the backend Docker image and upload to **Docker Hub** with a unique tag linked to the commit SHA.
  * **Deploy:** Automatic release and update of the container on **Azure Container Apps**.

#### Frontend Pipeline
* **CI Phase (Validation):**
  * **Environment Setup:** Configuration of **Node.js** and build time optimization via `npm` cache.
  * **Code Quality:** Clean installation of dependencies (`npm ci`), formal code checking (*linting*), and execution of Angular tests.
* **CD Phase (Deployment):**
  * **Authentication:** Secure access to Azure via OIDC identity tokens.
  * **Build & Push:** Creation of the frontend Docker image and upload to **Docker Hub**.
  * **Deploy:** Immediate release of the new image on the **Azure Container Apps** instance.

---

## 🚀 Getting Started

### 🌐 Live Demo

The project is deployed on the cloud and is accessible at the following address via Azure:

* **HackHub Web App:** [https://cn-hackhub-frontend.graysand-4ebad077.germanywestcentral.azurecontainerapps.io](https://cn-hackhub-frontend.graysand-4ebad077.germanywestcentral.azurecontainerapps.io)

---

### 💻 Local Development

### Clone the repository

```bash
git clone https://github.com/Fil-24/HackHubWeb
cd HackHubWeb
```


### Backend Setup

```bash
# Navigate to the backend folder
cd hackhub_backend

# Build the project
.\mvnw clean install

# Run the application
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The backend starts at: `http://localhost:8080`

> Default datasource credentials are configured in `src/main/resources/application-dev.properties`.

---

### Frontend Setup

```bash
# Navigate to the frontend folder
cd hackhub_frontend

# Install dependencies
npm install

# Start the development server
ng serve --open
```

The app will be available at: `http://localhost:4200`


## 🔐 Security

### JWT Authentication

On login, the backend issues a signed JWT containing the user's identity and static role as a custom claim. This token is attached to every subsequent HTTP request in the `Authorization` header (`Bearer <token>`), enabling stateless authentication without server-side session management.

### Role-Based Access Control (RBAC)

Every REST endpoint is protected by Spring Security annotations that define which roles are authorized to access it:

- `USER` — basic team and participation features
- `STAFF` — hackathon management for assigned events
- `ADMIN` — full platform access

### Frontend Protection

Angular route guards prevent navigation to restricted pages for unauthenticated users or users with insufficient roles. Backend authorization remains the authoritative security layer — the API rejects any request with an invalid token or insufficient permissions with `401 Unauthorized` or `403 Forbidden`. Furthermore, proper CORS (Cross-Origin Resource Sharing) configurations ensure that the API only accepts requests originating from trusted front-end origins.

### Network

Within the cloud infrastructure, a VNet was configured and structured into two distinct subnets: the first hosts the frontend and backend, while the second is dedicated to the database server. This network segmentation, combined with the use of a private endpoint, ensures a secure and isolated connection between the database and the backend

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Authors

- **Duda Daniel**: [@danielduda76](https://github.com/danielduda76) (Backend)
- **Coacci Victoria**: [@vichy1004](https://github.com/vichy1004) (Backend e Frontend)
- **Fattori Filippo**: [@Fil-24](https://github.com/Fil-24) (Backend, Frontend e Deploy)
- **Pigliapoco Simone**: [@simonepigliapoco-gif](https://github.com/simonepigliapoco-gif) (Frontend e Deploy)


Developed as a university project at **Università di Camerino (UNICAM)**.

---

> HackHub — Where ideas compete.
