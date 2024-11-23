const express = require('express');
const router = express.Router();

const checkoutController = require('../controllers/checkout');

router.post('/', checkoutController.checkout);
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    checkoutController.webhook
);

router.post('/checkout-cod', checkoutController.checkoutCod);

module.exports = router;