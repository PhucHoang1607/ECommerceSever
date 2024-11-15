const express = require('express');
const router = express.Router();
const { Category } = require('../models/category');
const { Product } = require('../models/product');

exports.getCategories = async function (_, res) {
    try {
        const categories = await Category.find();
        if (!categories) {
            return res.status(404).json({ message: 'Categories not found' });
        }
        return res.json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getCategoryId = async function (req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categories not found' });
        }
        return res.json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProductsByCategoryId = async function (req, res) {
    try {
        const categoryId = req.params.id;

        const products = await Product.find({ category: categoryId });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for this category' });
        }
        return res.status(200).json({ products });
    } catch (error) {

    }
}