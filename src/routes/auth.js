const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /api/auth/signup
 * body: { username, password, firstName, lastName, phoneNumber, address, storeId }
 */
router.post('/signup', authController.signup);

/**
 * @route POST /api/auth/login
 * body: { username, password }
 */
router.post('/login', authController.login);

module.exports = router;
