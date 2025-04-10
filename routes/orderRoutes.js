const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public order creation endpoint
router.post('/', orderController.createOrder);

// Protected admin endpoints
router.get(
  '/admin',
  authController.protect,
  authController.restrictTo('admin'),
  orderController.getAllOrders
);

router.get(
  '/admin/stats',
  authController.protect,
  authController.restrictTo('admin'),
  orderController.getAdminStats
);

module.exports = router;
