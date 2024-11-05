const { User } = require('../models/user');
const { Product } = require('../models/product');
const { default: mongoose } = require('mongoose');

exports.getUserWishList = async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const wishlists = [];
        for (const wishProduct of user.wishlists) {
            const product = await Product.findById(wishlists.productId);
            // productExists: 
            if (!product) {
                wishlists.push({
                    ...wishProduct,
                    productExists: false,
                    productOutOfStockL: false,
                });
            }
            else if (product.countInStock < 1) {
                wishlists.push({
                    ...wishProduct,
                    productExists: true,
                    productOutOfStock: true,
                });
            }
            else {
                wishlists.push({
                    productId: product._id,
                    productName: product.name,
                    productImage: product.image,
                    productPrice: product.price,
                    productExists: true,
                    productOutOfStock: false,
                });
            }
        }
        return res.json(wishlists);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.addToWishList = async function (req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        const product = await Product.findById(req.body.productId);
        if (!product) {
            return res
                .status(404)
                .json({ message: "Could not add product. Product not found" });
        }

        const productAlreadyExist = user.wishlists.find(
            (item) => item.productId.equals(
                new mongoose.Schema.Types.ObjectId(req.body.productId)
            )
        );
        if (productAlreadyExist) {
            return res.status(409).json({ message: "Product already exists in wishlists" })
        }

        user.wishlists.push({
            productId: req.body.productId,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price,
        });

        await user.save();
        return res.status(200).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}


exports.removeFromWishList = async function (req, res) {
    try {
        const userId = req.params.id;
        const productId = req.params.productId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.wishlists.findIndex(
            (item) => item.productId.equals(
                new mongoose.Schema.Types.ObjectId(productId)
            )
        );

        if (index === -1) {
            return res.status(404).json({ message: 'Product not found in wishlist' });
        }

        user.wishlists.splice(index, 1);

        await user.save();
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}