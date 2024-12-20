const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');


router.get('/', productsController.getProducts);
router.get('/limitproducts', productsController.get4Products)
router.get('/search', productsController.searchProduct);
router.get('/:id', productsController.getProductById);




// router.post('/:id/reviews', reviewsController.leaveReview);
//router.get('/:id/reviews', reviewsController.getProductReviews)

module.exports = router;