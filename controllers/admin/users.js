const { User } = require('../models/user');
const { Order } = require('../models/order');
const { OrderItem } = require('../models/order_items');
const { CartProduct } = require('../models/cart_product');
const { Token } = require('../models/token');

exports.getUserCount = async (_, res) => {
    try {
        const userCount = await User.countDocuments();
        if (!userCount) {
            return res.status(500).json({ messgae: 'Could not count users' });
        }
        return res.json({ userCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, messgae: error.messgae });
    }

}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User Not found' });

        const orders = await Order.find({ user: userId });
        const orderItemIds = orders.flatMap((order) => order.orderItems);

        await Order.deleteMany({ user: userId });
        await OrderItem.deleteMany({ _id: { $in: orderItemIds } });

        await CartProduct.deleteMany({ _id: { $in: user.cart } });

        await User.findByIdAndUpdate(userId, {
            $pull: { cart: { $exists: true } }
        });



        await Token.deleteOne({ userId: userId });

        await User.deleteOne({ _is: userId });

        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, messgae: error.messgae });
    }
}