# CRM Sales Management System - Backend

A RESTful backend API for a CRM Sales Management System built using Node.js, Express.js, MongoDB, Mongoose and JWT authentication.

The system provides functionality for:

- User management
- Authentication and authorization
- Lead management
- Lead conversion
- Customer management
- Deal management
- Follow-up activities
- Dashboard statistics
- Validation
- Pagination
- Filtering
- Sorting
- Centralized error handling

---

## 1. Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- REST API
- Postman

---

## 2. User Roles

The application supports two roles:

### Admin

Admin users can:

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

## 3. Project Structure

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