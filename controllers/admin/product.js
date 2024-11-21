const { Product } = require('../../models/product')
const media_helper = require('../../helper/media_helper');
const util = require('util');
const { Category } = require('../../models/category');
const multer = require('multer');
const { default: mongoose } = require('mongoose');

exports.getProducts = async function (req, res) {
    try {
        const page = req.query.page || 1;

        const pageSize = 30;

        const products = await Product.find()
            .select()
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        if (!products) {
            return res.status(404).json({ message: "Product not found" })
        }
        return res.json(products);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.getProductCount = async function (req, res) {
    try {
        const count = await Product.countDocuments();
        if (!count) {
            return res.status(500).json({ message: 'Could not count product' });
        }
        return res.json({ count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}




// exports.addProduct = async function (req, res) {

//     try {
//         const uploadImage = util.promisify(
//             media_helper.upload.fields([
//                 { name: 'image', maxCount: 1 },
//                 { name: 'imageDetail', maxCount: 10 },
//             ])
//         );
//         try {
//             await uploadImage(req, res);
//         } catch (error) {
//             console.error(error);
//             return res.status(500).json({
//                 type: error.code,
//                 message: `${error.message}{${err.field}}`,
//                 storageError: error.storageError
//             });
//         }

//         const category = Category.findById(req.body.category);
//         if (!category) return res.status(404).json({ message: "Invalid Category" });

//         if (category.markedForDeletion) {
//             return res.status(404).json({
//                 message:
//                     'Category marked for deletion, you cannot add products to this category'
//             });
//         }

//         const image = req.files['image'][0];
//         if (!image) return res.status(404).json({ message: 'No file found' });

//         req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;

//         const gallery = req.files['imageDetail'];
//         const imagePaths = [];
//         if (gallery) {
//             for (const image of gallery) {
//                 const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
//                 imagePaths.push(imagePath);
//             }
//         }
//         if (imagePaths.length > 0) {
//             req.body['imageDetail'] = imagePaths;
//         }

//         const product = new Product(req.body).save();
//         if (!product) {
//             return res
//                 .status(500)
//                 .json({ message: "The product could not be created" });
//         }

//         return res.status(201).json({ product });
//     } catch (error) {
//         console.error(error);
//         if (err instanceof multer.MulterError) {
//             return res.status(err.code).json({ message: err.message });
//         }
//         return res.status(500).json({ type: error.name, message: error.message });
//     }
// }

exports.addProduct = async function (req, res) {
    try {
        const uploadImage = util.promisify(
            media_helper.upload.fields([
                { name: 'image', maxCount: 1 },
                { name: 'imageDetail', maxCount: 10 },
            ])
        );

        try {
            await uploadImage(req, res);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                type: error.code,
                message: `${error.message}{${error.field}}`,
                storageError: error.storageError
            });
        }

        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).json({ message: "Invalid Category" });
        if (category.markedForDeletion) {
            return res.status(404).json({
                message: 'Category marked for deletion, you cannot add products to this category'
            });
        }

        // Check if 'image' is provided as a file or URL
        let imagePath;
        if (req.files && req.files['image'] && req.files['image'][0]) {
            imagePath = `${req.protocol}://${req.get('host')}/${req.files['image'][0].path}`;
        } else if (req.body.image) {
            imagePath = req.body.image; // Assume it's a URL
        }
        // } else {
        //     return res.status(404).json({ message: 'No image provided' });
        // }
        req.body['image'] = imagePath;

        // Handle 'imageDetail' similarly, either as files or URLs
        let imagePaths = [];
        if (req.files && req.files['imageDetail']) {
            imagePaths = req.files['imageDetail'].map(file => `${req.protocol}://${req.get('host')}/${file.path}`);
        } else if (req.body.imageDetail) {
            imagePaths = Array.isArray(req.body.imageDetail) ? req.body.imageDetail : [req.body.imageDetail];
        }
        req.body['imageDetail'] = imagePaths;

        const product = await new Product(req.body).save();
        if (!product) {
            return res.status(500).json({ message: "The product could not be created" });
        }


        return res.status(201).json({ product });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
};


exports.editProduct = async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id) ||
            !(await Product.findById(req.params.id))) {
            return res.status(404).json({ message: "Invalid product" });
        }

        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(404).json({ message: 'Invalid category' });
            }
            if (category.markedForDeletion) {
                return res.status(404).json({
                    message:
                        'Category marked for deletion, you cannot add products to this category'
                });
            }

            if (req.body.imageDetail) {
                const product = await Product.findById(req.params.id);

                const limit = 10 - product.imageDetail.length;
                const uploadGallery = util.promisify(
                    media_helper.upload.fields([{ name: 'imaageDetail', maxCount: limit }])
                );

                try {
                    await uploadGallery(req, res);
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        type: error.code,
                        message: `${error.message}{${err.field}}`,
                        storageError: error.storageError
                    });
                }

                const imageFiles = req.files['imageDetail'];
                const updateGallery = imageFiles && imageFiles.length > 0;

                if (updateGallery) {
                    const imagePaths = [];
                    for (const image of updateGallery) {
                        const imagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
                        imagePaths.push(imagePath);
                    }
                    req.body['imageDetail'] = [...product.imageDetail, ...imagePaths];
                }
            }
            if (req.body.image) {
                const uploadImage = util.promisify(
                    media_helper.upload.fields([{
                        name: 'image', maxCount: 1
                    }])
                );
                try {
                    await uploadImage(req, res);
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        type: error.code,
                        message: `${error.message}{${err.field}}`,
                        storageError: error.storageError
                    });
                }
                const image = req.files['image'][0];
                if (!image) return res.status(404).json({ message: 'No file found' });

                req.body['image'] = `${req.protocol}://${req.get('host')}/${image.path}`;
            }
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.json(updatedProduct);
    } catch (error) {
        console.error(error);
        if (err instanceof multer.MulterError) {
            return res.status(err.code).json({ message: err.message });
        }
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.deleteProductImages = async function (req, res) {
    try {
        const productId = req.params.id;
        const { deletedImageUrls } = req.body;

        if (!mongoose.isValidObjectId(productId) || !Array.isArray(deletedImageUrls)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        await media_helper.deleteImages(deletedImageUrls);
        const product = await product.findById(productId);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.imageDetail = product.imageDetail.filter(
            (image) => !deletedImageUrls.includes(image)
        );

        await product.save();

        return res.status(204).end();
    } catch (error) {
        console.error(`Error deleting product: ${error.message}`);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: 'Image not found' });
        }
        return res.status(500).json({ message: error.message });
    }
}

exports.deleteProduct = async function (req, res) {
    try {
        const productId = req.params.id;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(404).json('Invalid Product');
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // const imageDetails = Array.isArray(product.imageDetail) ? product.imageDetail : [];
        // const images = Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []);

        // await media_helper.deleteImages([...imageDetails, ...images]);
        // //await media_helper.deleteImages([...product.imageDetail, ...product.image],);

        await Product.findByIdAndDelete(productId);

        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}