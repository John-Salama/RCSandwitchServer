const express = require('express');
const sandwichRoutes = require('./sandwichRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Mount the routes
router.use('/sandwiches', sandwichRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);

module.exports = router;
