import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of our custom ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Something went wrong on the server';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Resource not found with id: ${err.value}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };