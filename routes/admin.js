
const express = require('express');
const router = express.Router();

const userAdController = require('../controllers/admin/users');
const categoryAdController = require('../controllers/admin/categories');
const orderAdController = require('../controllers/admin/order');
const productAdController = require('../controllers/admin/product');
//USERS
router.get('/users/count', userAdController.getUserCount);
router.get('/user', userAdController.getAllUsers);
router.get('/user/:id', userAdController.getUserById)
router.delete('/user/:id', userAdController.deleteUser);


//CATEGORY
router.get('/categories', categoryAdController.getAllCategory);
router.get('/categories/:id', categoryAdController.getCategoryById);
router.post('/categories', categoryAdController.addCategory);
router.put('/categories/:id', categoryAdController.editCategory);
router.delete('/categories/:id', categoryAdController.deleteCategory);

//PRODUCTS
router.get('/products', productAdController.getProducts);
router.get('/products/count', productAdController.getProductCount);
router.post('/products', productAdController.addProduct);
router.put('/products/:id', productAdController.editProduct);
router.delete('/products/:id/images', productAdController.deleteProductImages);
router.delete('/products/:id', productAdController.deleteProduct);

//ORDER
router.get('/orders', orderAdController.getOrders);
router.get('/orders/count', orderAdController.getOrdersCount);
router.put('/orders/:id', orderAdController.changeOrderStatus);
router.delete('/orders/:id', orderAdController.deleteOrder);

module.exports = router;
