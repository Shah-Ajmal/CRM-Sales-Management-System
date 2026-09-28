import {
  isValidObjectId,
  isNonEmptyString,
  isValidDate,
} from "../utils/validation.js";

const allowedTypes = ["call", "email", "meeting", "follow_up"];

const allowedStatuses = ["pending", "completed"];

const validateRelatedResources = ({
  relatedLead,
  relatedCustomer,
  relatedDeal,
}) => {
  const errors = [];

  const resources = [relatedLead, relatedCustomer, relatedDeal].filter(
    (value) => value !== undefined && value !== null,
  );

  /*
   * At least one related resource
   * is required.
   */
  if (resources.length === 0) {
    errors.push({
      field: "relatedResource",
      message: "Activity must be related to a lead, customer, or deal",
    });
  }

  /*
   * An activity can only be related
   * to one CRM resource.
   */
  if (resources.length > 1) {
    errors.push({
      field: "relatedResource",
      message: "Activity can only be related to one CRM resource",
    });
  }

  if (
    relatedLead !== undefined &&
    relatedLead !== null &&
    !isValidObjectId(relatedLead)
  ) {
    errors.push({
      field: "relatedLead",
      message: "Invalid lead ID",
    });
  }

  if (
    relatedCustomer !== undefined &&
    relatedCustomer !== null &&
    !isValidObjectId(relatedCustomer)
  ) {
    errors.push({
      field: "relatedCustomer",
      message: "Invalid customer ID",
    });
  }

  if (
    relatedDeal !== undefined &&
    relatedDeal !== null &&
    !isValidObjectId(relatedDeal)
  ) {
    errors.push({
      field: "relatedDeal",
      message: "Invalid deal ID",
    });
  }

  return errors;
};

const validateCreateActivity = (req) => {
  const {
    subject,
    type,
    status,
    dueDate,
    assignedTo,
    relatedLead,
    relatedCustomer,
    relatedDeal,
  } = req.body;

  const errors = [];

  // Subject
  if (!isNonEmptyString(subject)) {
    errors.push({
      field: "subject",
      message: "Activity subject is required",
    });
  }

  // Type
  if (!allowedTypes.includes(type)) {
    errors.push({
      field: "type",
      message: "Invalid activity type",
    });
  }

  // Status
  if (status !== undefined && !allowedStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: "Invalid activity status",
    });
  }

  // Due date
  if (!isValidDate(dueDate)) {
    errors.push({
      field: "dueDate",
      message: "Valid due date is required",
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

  errors.push(
    ...validateRelatedResources({
      relatedLead,
      relatedCustomer,
      relatedDeal,
    }),
  );

  return errors;
};

const validateUpdateActivity = (req) => {
  const {
    subject,
    type,
    status,
    dueDate,
    assignedTo,
    relatedLead,
    relatedCustomer,
    relatedDeal,
    description,
  } = req.body;

  const errors = [];

  // Subject
  if (subject !== undefined && !isNonEmptyString(subject)) {
    errors.push({
      field: "subject",
      message: "Activity subject cannot be empty",
    });
  }

  // Type
  if (type !== undefined && !allowedTypes.includes(type)) {
    errors.push({
      field: "type",
      message: "Invalid activity type",
    });
  }

  // Status
  if (status !== undefined && !allowedStatuses.includes(status)) {
    errors.push({
      field: "status",
      message: "Invalid activity status",
    });
  }

  // Due date
  if (dueDate !== undefined && !isValidDate(dueDate)) {
    errors.push({
      field: "dueDate",
      message: "Invalid due date",
    });
  }

  // Assigned user
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

  // Description
  if (description !== undefined && typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description must be a string",
    });
  }

  if (
    relatedLead !== undefined ||
    relatedCustomer !== undefined ||
    relatedDeal !== undefined
  ) {
    errors.push(
      ...validateRelatedResources({
        relatedLead,
        relatedCustomer,
        relatedDeal,
      }),
    );
  }

  return errors;
};

export { validateCreateActivity, validateUpdateActivity };
