const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let errors = error.errors || [];

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    statusCode = 409;

    const duplicateField = Object.keys(error.keyValue)[0];

    message = `${duplicateField} already exists`;
    errors = [];
  }

  // Invalid MongoDB ObjectId
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
    errors = [];
  }

  console.error(`[${req.method}] ${req.originalUrl}`, error);

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
