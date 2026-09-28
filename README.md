# CRM Sales Management System - Backend

A RESTful backend API for a CRM Sales Management System built using Node.js, Express.js, MongoDB, Mongoose and JWT authentication.

The application provides APIs for managing users, leads, customers, deals and sales activities with authentication, role-based authorization, validation, filtering, sorting, pagination and centralized error handling.

---

## 1. Features

- User registration and login
- JWT-based authentication
- Role-based authorization
- Admin and Sales Executive roles
- User management
- User activation/deactivation
- Lead management
- Lead assignment
- Lead status management
- Lead conversion to customer
- Customer management
- Deal management
- Deal stage management
- Sales activity management
- Activity completion
- Dashboard statistics
- Search and filtering
- Pagination
- Sorting
- Date-range filtering
- Duplicate record prevention
- Request validation
- Centralized error handling
- Password hashing using bcryptjs
- MongoDB database with Mongoose
- RESTful API architecture

---

## 2. Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- Cookie Parser
- Postman
- Render

---

## 3. User Roles

The application supports two user roles:

### Admin

Admins can:

- Manage users
- View all leads
- Assign leads
- View all customers
- View all deals
- View dashboard statistics
- Manage CRM data according to authorization rules

### Sales Executive

Sales Executives can:

- Create leads
- View assigned leads
- Update assigned leads
- Convert qualified leads
- View assigned customers
- Manage assigned deals
- Manage assigned activities

Sales Executives cannot access or modify resources belonging to other users.

---

# 4. Project Structure

```text
src/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── lead.controller.js
│   ├── customer.controller.js
│   ├── deal.controller.js
│   ├── activity.controller.js
│   └── dashboard.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   ├── error.middleware.js
│   └── requestLogger.middleware.js
│
├── models/
│   ├── User.js
│   ├── Lead.js
│   ├── Customer.js
│   ├── Deal.js
│   └── Activity.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── lead.routes.js
│   ├── customer.routes.js
│   ├── deal.routes.js
│   ├── activity.routes.js
│   └── dashboard.routes.js
│
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── lead.service.js
│   ├── customer.service.js
│   ├── deal.service.js
│   ├── activity.service.js
│   └── dashboard.service.js
│
├── validators/
│   ├── auth.validator.js
│   ├── user.validator.js
│   ├── lead.validator.js
│   ├── customer.validator.js
│   ├── deal.validator.js
│   └── activity.validator.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── jwt.js
│   └── validation.js
│
├── scripts/
│   └── createAdmin.js
│
├── app.js
└── server.js