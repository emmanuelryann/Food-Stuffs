import { body, validationResult, param, query } from 'express-validator';
// import { sanitize } from 'express-mongo-sanitize';

export const validateProductId = [
  param('productId')
    .matches(/^\d{8}$/)
    .withMessage('Product ID must be an 8-digit number')
];

export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),

  body('countInStock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('image.url')
    .optional()
    .isURL()
    .withMessage('Must be a valid URL'),
  
  body('image.public_id')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Public ID is required if image is provided')
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};