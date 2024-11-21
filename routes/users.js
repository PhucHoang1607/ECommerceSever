
const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const wishlistController = require('../controllers/wishlists');
const cartController = require('../controllers/cart');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

//wishlist
router.get('/:id/wishlists', wishlistController.getUserWishList);
router.post('/:id/wishlists', wishlistController.addToWishList);
router.delete('/:id/wishlists/:productId', wishlistController.removeFromWishList);


//cart
router.get('/:id/cart', cartController.getUserCart);
router.get('/:id/cart/count', cartController.getUserCartCount);
router.get('/:id/cart/:cartProductId', cartController.getCartProductById);
router.post('/:id/cart', cartController.addToCart);
router.put('/:id/cart/:cartProductId', cartController.modifiedProductQuantity);
router.delete('/:id/cart/:cartProductId', cartController.removeFromCart);


module.exports = router;