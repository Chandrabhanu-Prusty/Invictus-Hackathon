// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { login } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    body('email')
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Must be a valid email address.'),
    body('password')
      .notEmpty().withMessage('Password is required.')
  ],
  validate,
  login
);

module.exports = router;
