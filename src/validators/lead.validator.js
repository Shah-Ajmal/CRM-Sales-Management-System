import {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  isNonEmptyString,
} from "../utils/validation.js";

const allowedStatuses = ["new", "contacted", "qualified", "lost", "converted"];

const allowedPriorities = ["low", "medium", "high"];

const validateLead = (req) => {
  const { name, email, phone, status, priority, assignedTo } = req.body;

  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push({
      field: "name",
      message: "Lead name is required",
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

  if (status !== undefined && !allowedStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: "Invalid lead status",
    });
  }

  if (priority !== undefined && !allowedPriorities.includes(priority)) {
    errors.push({
      field: "priority",
      message: "Invalid lead priority",
    });
  }

  if (
    assignedTo !== undefined &&
    assignedTo !== null &&
    !isValidObjectId(assignedTo)
  ) {
    errors.push({
      field: "assignedTo",
      message: "Invalid assigned user ID",
    });
  }

  return errors;
};

const validateLeadStatus = (req) => {
  const errors = [];

  if (!allowedStatuses.includes(req.body.status)) {
    errors.push({
      field: "status",
      message: "Invalid lead status",
    });
  }

  return errors;
};

const validateLeadAssignment = (req) => {
  const errors = [];

  if (!isValidObjectId(req.body.assignedTo)) {
    errors.push({
      field: "assignedTo",
      message: "Valid assigned user ID is required",
    });
  }

  return errors;
};

export { validateLead, validateLeadStatus, validateLeadAssignment };
