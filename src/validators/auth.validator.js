import {
  isValidEmail,
  isValidPhone,
  isNonEmptyString,
} from "../utils/validation.js";

const validateRegister = (req) => {
  const { name, email, password, phone } = req.body;

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

  return errors;
};

const validateLogin = (req) => {
  const { email, password } = req.body;

  const errors = [];

  if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email is required",
    });
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  }

  return errors;
};

export { validateRegister, validateLogin };
