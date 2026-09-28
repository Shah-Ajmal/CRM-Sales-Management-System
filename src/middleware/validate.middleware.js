import ApiError from "../utils/ApiError.js";

const validate = (validator) => {
  return (req, res, next) => {
    const errors = validator(req);

    if (errors.length > 0) {
      throw new ApiError(400, "Validation failed", errors);
    }

    next();
  };
};

export default validate;
