import {
  isValidEmail,
  isValidPhone,
  isNonEmptyString,
} from "../utils/validation.js";

const allowedRoles = ["admin", "sales_executive"];

const validateCreateUser = (req) => {
  const { name, email, password, phone, role } = req.body;

  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push({
      field: "name",
      message: "Name is required",
    });
  }

  if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email is required",
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  }

  if (phone !== undefined && !isValidPhone(phone)) {
    errors.push({
      field: "phone",
      message: "Invalid phone number",
    });
  }

  if (role !== undefined && !allowedRoles.includes(role)) {
    errors.push({
      field: "role",
      message: "Invalid user role",
    });
  }

  return errors;
};

const validateUpdateUser = (req) => {
  const { name, email, password, phone, role, isActive } = req.body;

  const errors = [];

  if (name !== undefined && !isNonEmptyString(name)) {
    errors.push({
      field: "name",
      message: "Name cannot be empty",
    });
  }

  if (email !== undefined && !isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email is required",
    });
  }

  if (
    password !== undefined &&
    (typeof password !== "string" || password.length < 8)
  ) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters",
    });
  }

  if (phone !== undefined && !isValidPhone(phone)) {
    errors.push({
      field: "phone",
      message: "Invalid phone number",
    });
  }

  if (role !== undefined && !allowedRoles.includes(role)) {
    errors.push({
      field: "role",
      message: "Invalid user role",
    });
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push({
      field: "isActive",
      message: "isActive must be a boolean",
    });
  }

  return errors;
};

const validateUserStatus = (req) => {
  const errors = [];

  if (typeof req.body.isActive !== "boolean") {
    errors.push({
      field: "isActive",
      message: "isActive must be a boolean",
    });
  }

  return errors;
};

export { validateCreateUser, validateUpdateUser, validateUserStatus };
