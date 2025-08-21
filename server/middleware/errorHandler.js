import { ValidationError, UniqueConstraintError } from 'sequelize';

export const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Sequelize validation errors
  if (error instanceof ValidationError) {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
    }));
    return res.status(400).json({
      message: 'Validation error',
      errors,
    });
  }

  // Sequelize unique constraint errors
  if (error instanceof UniqueConstraintError) {
    const field = error.errors[0]?.path;
    return res.status(409).json({
      message: `${field} already exists`,
      field,
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default server error
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};