import mongoose from "mongoose";

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidEmail = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidPhone = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  return /^\+?[0-9]{7,15}$/.test(value);
};

const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

export {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isNonEmptyString,
};
