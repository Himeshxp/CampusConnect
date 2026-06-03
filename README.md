# CampusConnect

CampusConnect is a centralized student portal designed to streamline complaint management and event handling within a college environment.

In many colleges, students often rely on scattered WhatsApp groups, Google Forms, or informal communication channels to report issues and stay informed about campus events. CampusConnect addresses this problem by providing a structured platform where students and administrators can interact through a single system.

---

## Core Features

### Complaint Management

Students can submit complaints related to:

* Food Services
* IT Services
* Academic Departments
* Campus Facilities

The complaint system includes:

* Complaint status tracking
* Complaint ratings and feedback
* File upload support
* Administrative complaint management

### Event Management

CampusConnect provides a centralized event platform where students can:

* View upcoming events
* Register for events directly through the application
* Access event-related information from a single location

Administrators can create, update, and manage events while monitoring registrations.

### Authentication & Authorization

The application implements secure authentication and authorization using:

* JWT-based authentication
* HTTP-only cookies
* Role-based access control (Student/Admin)
* Protected routes and endpoint authorization

### Admin Panel

Administrators can:

* Manage complaints
* Update complaint statuses
* Create and manage events
* Monitor event registrations
* Moderate platform activity

---

## Backend Development

The backend was developed using Spring Boot with a focus on maintainability, security, and scalable API design.

Key backend implementations include:

* RESTful API development
* Request DTO and Response DTO architecture
* JWT authentication using Spring Security
* HTTP-only cookie based session handling
* Centralized exception handling
* Input validation and structured error responses
* Relational database design using JPA/Hibernate
* Service-layer and controller-layer separation
* Role-based authorization and access control
* Production deployment configuration

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* REST APIs
* Spring Data JPA / Hibernate

### Database

* PostgreSQL

### Security

* JWT Authentication
* HTTP-only Cookies
* Role-Based Authorization

### Tools

* Maven
* Git
* GitHub
* Postman

---

## Future Improvements

* Real-time notifications
* Email notifications
* Analytics dashboard
* Refresh token support
* API documentation using Swagger/OpenAPI

---
