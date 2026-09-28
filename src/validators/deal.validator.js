import {
  isValidObjectId,
  isNonEmptyString,
  isValidDate,
} from "../utils/validation.js";

const allowedStages = [
  "qualification",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const validateCreateDeal = (req) => {
  const { title, customer, assignedTo, amount, stage, expectedClosingDate } =
    req.body;

  const errors = [];

  // Title
  if (!isNonEmptyString(title)) {
    errors.push({
      field: "title",
      message: "Deal title is required",
    });
  }

  // Customer
  if (!isValidObjectId(customer)) {
    errors.push({
      field: "customer",
      message: "Valid customer ID is required",
    });
  }

  // Assigned user
  if (!isValidObjectId(assignedTo)) {
    errors.push({
      field: "assignedTo",
      message: "Valid assigned user ID is required",
    });
  }

  // Amount
  if (
    amount === undefined ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    errors.push({
      field: "amount",
      message: "Deal amount must be a valid non-negative number",
    });
  }

  // Stage
  if (stage !== undefined && !allowedStages.includes(stage)) {
    errors.push({
      field: "stage",
      message: "Invalid deal stage",
    });
  }

  // Expected closing date
  if (!isValidDate(expectedClosingDate)) {
    errors.push({
      field: "expectedClosingDate",
      message: "Valid expected closing date is required",
    });
  }

  return errors;
};

const validateUpdateDeal = (req) => {
  const {
    title,
    customer,
    assignedTo,
    amount,
    stage,
    expectedClosingDate,
    description,
  } = req.body;

  const errors = [];

  // Title
  if (title !== undefined && !isNonEmptyString(title)) {
    errors.push({
      field: "title",
      message: "Deal title cannot be empty",
    });
  }

  // Customer
  if (customer !== undefined && !isValidObjectId(customer)) {
    errors.push({
      field: "customer",
      message: "Invalid customer ID",
    });
  }

  // Assigned user
  if (assignedTo !== undefined && !isValidObjectId(assignedTo)) {
    errors.push({
      field: "assignedTo",
      message: "Invalid assigned user ID",
    });
  }

  // Amount
  if (
    amount !== undefined &&
    (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)
  ) {
    errors.push({
      field: "amount",
      message: "Deal amount must be a valid non-negative number",
    });
  }

  // Stage
  if (stage !== undefined && !allowedStages.includes(stage)) {
    errors.push({
      field: "stage",
      message: "Invalid deal stage",
    });
  }

  // Expected closing date
  if (expectedClosingDate !== undefined && !isValidDate(expectedClosingDate)) {
    errors.push({
      field: "expectedClosingDate",
      message: "Invalid expected closing date",
    });
  }

  // Description
  if (description !== undefined && typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description must be a string",
    });
  }

  return errors;
};

const validateDealStage = (req) => {
  const errors = [];

  if (!allowedStages.includes(req.body.stage)) {
    errors.push({
      field: "stage",
      message: "Invalid deal stage",
    });
  }

  return errors;
};

export { validateCreateDeal, validateUpdateDeal, validateDealStage };
