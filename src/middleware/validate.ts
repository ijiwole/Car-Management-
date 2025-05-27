import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { body, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  // Filter out null and undefined values before validation
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== null && value !== undefined && value !== '')
    );
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For empty update requests, return a specific error
    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: 'No valid fields provided for update'
      });
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      errors: errors.array()
    });
  }
  next();
};

export const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  validate
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Validation for creating a new car (all fields required)
export const carValidation = [
  body('brand').notEmpty().withMessage('Brand is required'),
  body('carModel').notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Please enter a valid year'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('mileage')
    .isFloat({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('color').notEmpty().withMessage('Color is required'),
  body('fuelType').notEmpty().withMessage('Fuel type is required'),
  body('transmission').notEmpty().withMessage('Transmission is required'),
  validate
];

// Validation for updating a car (all fields optional, but if present must be valid)
export const carUpdateValidation = [
  body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
  body('carModel').optional().notEmpty().withMessage('Model cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Please enter a valid year'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('mileage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('color').optional().notEmpty().withMessage('Color cannot be empty'),
  body('fuelType').optional().notEmpty().withMessage('Fuel type cannot be empty'),
  body('transmission').optional().notEmpty().withMessage('Transmission cannot be empty'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  validate
];