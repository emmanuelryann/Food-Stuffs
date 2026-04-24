import { body, validationResult, param, query } from 'express-validator';
// import { sanitize } from 'express-mongo-sanitize';

export const validateProductId = [
  param('id')
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

  body('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock must be a boolean'),

  body('image.url')
    .optional()
    .isURL()
    .withMessage('Must be a valid URL'),
  
  body('image.fileId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('File ID is required if image is provided')
];

export const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }),

  body('price')
    .optional()
    .isFloat({ min: 0 }),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }),

  body('countInStock')
    .optional()
    .isInt({ min: 0 }),

  body('isActive')
    .optional()
    .isBoolean(),

  body('inStock')
    .optional()
    .isBoolean(),

  body('image.url')
    .optional()
    .isURL(),

  body('image.fileId')
    .optional()
    .trim()
];

export const validateCheckout = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),

  body('items.*.productId')
    .matches(/^\d{8}$/)
    .withMessage('Each product ID must be an 8-digit number'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer of at least 1'),

  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Customer name must be between 2 and 255 characters'),

  body('customerPhone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Customer phone must not be empty if provided'),

  body('customerAddress')
    .trim()
    .notEmpty()
    .withMessage('Customer address is required')
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
];

export const validateSettings = [
  body('fixedDeliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fixed delivery fee must be a non-negative number'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be a non-negative number'),

  body('whatsappNumber')
    .optional()
    .trim(),

  body('currencySymbol')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Currency symbol must be between 1 and 5 characters'),

  body('isStoreOpen')
    .optional()
    .isBoolean()
    .withMessage('isStoreOpen must be a boolean'),

  body('promoBanner')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Promo banner must not exceed 500 characters'),
];

export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
    .escape(),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email is too long'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateOrderId = [
  param('id')
    .matches(/^ORD-\d{4}$/)
    .withMessage('Order ID must be in the format ORD-XXXX')
];

export const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, completed, cancelled')
];

export const validateBulkDelete = [
  body('orderIds')
    .isArray({ min: 1 })
    .withMessage('orderIds must be a non-empty array'),

  body('orderIds.*')
    .matches(/^ORD-\d{4}$/)
    .withMessage('Each order ID must be in the format ORD-XXXX')
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