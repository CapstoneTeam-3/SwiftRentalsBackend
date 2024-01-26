// src/routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware.authenticate, authController.profile);

module.exports = router;
