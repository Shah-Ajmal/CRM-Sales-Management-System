import {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  isNonEmptyString,
} from "../utils/validation.js";

const validateCustomer = (req) => {
  const { name, email, phone, assignedTo, originalLead } = req.body;

  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push({
      field: "name",
      message: "Customer name is required",
    });
  }

  if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Valid email is required",
    });
  }

  if (!isValidPhone(phone)) {
    errors.push({
      field: "phone",
      message: "Valid phone number is required",
    });
  }

  if (assignedTo !== undefined && !isValidObjectId(assignedTo)) {
    errors.push({
      field: "assignedTo",
      message: "Invalid assigned user ID",
    });
  }

  if (
    originalLead !== undefined &&
    originalLead !== null &&
    !isValidObjectId(originalLead)
  ) {
    errors.push({
      field: "originalLead",
      message: "Invalid original lead ID",
    });
  }

  return errors;
};

export { validateCustomer };
