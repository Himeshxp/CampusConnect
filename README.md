# CampusConnect

CampusConnect is a centralized student portal built to simplify complaint management and event handling within a college environment.

In many colleges, students often rely on scattered WhatsApp groups, Google Forms, or informal communication channels to report issues or stay updated about events. CampusConnect aims to solve this by providing a structured platform where students and administrators can interact through a single system.

---

## Core Features

### Complaint Management
Students can submit complaints related to:
- Food services
- IT services
- Departments
- Campus facilities

The system includes:
- Complaint status tracking
- Complaint ratings and feedback
- File upload support for complaints

### Event Management
CampusConnect provides a centralized event system where students can:
- View upcoming college events
- Register for events directly through the platform
- Access event-related information in one place

### Authentication & Authorization
The application uses role-based authentication to separate student and admin functionalities and secure protected routes and operations.

### Admin Panel
Administrators can:
- Manage complaints
- Create and update events
- Monitor registrations
- Moderate platform activity

---

## Backend Development

The backend system was designed and implemented using Spring Boot with a strong focus on scalable API design and database management.

Key backend responsibilities included:
- Designing and implementing RESTful APIs
- Building authentication and authorization workflows
- Managing complaint and event registration logic
- Designing relational database schemas using JPA/Hibernate
- Handling validation and structured error responses
- Configuring the application for production deployment

---

## Tech Stack

### Backend
- Java
- Spring Boot
- REST APIs
- Spring Data JPA / Hibernate

### Database
- PostgreSQL

### Security
- Role-Based Authentication & Authorization

---

## Future Improvements

- Real-time notifications
- Email notifications
- Analytics dashboard
