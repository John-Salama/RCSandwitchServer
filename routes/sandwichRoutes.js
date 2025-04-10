const express = require('express');
const sandwichController = require('../controllers/sandwichController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(sandwichController.getAllSandwiches)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    sandwichController.createSandwich
  );

router
  .route('/:id')
  .get(sandwichController.getSandwich)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    sandwichController.updateSandwich
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    sandwichController.deleteSandwich
  );

module.exports = router;
