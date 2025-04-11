const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.protect, authController.getMe);
router.get(
  '/users',
  authController.protect,
  authController.restrictTo('admin'),
  authController.getAllUsers
);

module.exports = router;
