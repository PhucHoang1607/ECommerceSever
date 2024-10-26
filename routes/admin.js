
const express = require('express');
const router = express.Router();

const userAdController = require('../controllers/admin/users');
const categoryAdController = require('../controllers/admin/categories');

//USERS
router.get('/users/count', userAdController.getUserCount);
router.delete('/user/:id', userAdController.deleteUser);


//CATEGORY
router.post('/categories', categoryAdController.addCategory);
router.put('/categories/:id', categoryAdController.editCategory);
router.delete('/categories/:id', categoryAdController.deleteCategory);

//PRODUCTS
router.get('/products/count', adminController.getProductCount);
router.post('/products', adminController.addProduct);
router.put('/products/:id', adminController.editProduct);
router.delete('/products/:id', adminController.deleteProduct);

//ORDER
router.get('/orders', adminController.getOrders);
router.get('/orders/count', adminController.getOrdersCount);
router.put('/orders/:id', adminController.changeOrderStatus);

module.exports = router;
