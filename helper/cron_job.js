const cron = require('node-cron');
const { Category } = require('../models/category')
const { Product } = require('../models/product');
const { CartProduct } = require('../models/cart_product');
const { default: mongoose } = require('mongoose');


cron.schedule('0 0 * * *', async function () {
    try {
        const categoriesToBeDeleted = await Category.find({
            markedForDeletion: true,
        });
        for (const category of categoriesToBeDeleted) {
            const categoryProductCount = await Product.countDocuments({
                category: category.id,
            });
            if (categoryProductCount < 1) await category.deleteOne();
        }
        console.log('CRON job completes at', new Date());
    } catch (error) {
        console.error('CRON job error: ', error);
    }
});

cron.schedule('*/240 * * * *', async function () {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log("Reservation Release CRON job started at:", new Date());

        const expiredReservation = await CartProduct.find({
            reserved: true,
            reservationExpiry: { $lte: new Date() }
        }).session(session);

        for (const cartProduct of expiredReservation) {
            const product = await Product.findById(cartProduct.product)
                .session(session);
            if (product) {
                const updatedProduct = await Product.findByIdAndUpdate(
                    product._id,
                    { $inc: { countInStock: cartProduct.quantity } },
                    { new: true, runValidators: true, session },
                );

                if (!updatedProduct) {
                    console.error(
                        'Error Orcured: Product update failed. Potential Concurrency issue'
                    );
                    await session.abortTransaction();
                    return;
                }
            }
            await CartProduct.findByIdAndUpdate(
                cartProduct._id,
                { reserved: false },
                { session }
            );
        }

        await session.commitTransaction();
        console.log("Reservation Release CRON job started at:", new Date());
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        return res.status(500).json({ type: error.name, message: error.message });
    } finally {
        await session.endSession();
    }
});