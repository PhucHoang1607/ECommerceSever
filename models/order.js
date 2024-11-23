const { Schema, model } = require('mongoose');

const orderSchema = Schema({
    orderItems: [{
        type: Schema.Types.ObjectId, ref: 'OrderItem', require: true
    }],
    shippingAdress: { type: String, require: true },
    phone: { type: String, require: true },
    country: { type: String, require: true },
    paymentId: String,
    paymentMethod: String,
    status: {
        type: String,
        require: true,
        default: 'pending',
        enum: [
            'pending',
            'processed',
            'shipped',
            'out-for-delivery',
            'cancelled',
            'on-hold',
            'expired'
        ],
    },
    statusHistory: {
        type: [{ type: String }],
        enum: [
            'pending',
            'processed',
            'shipped',
            'out-for-delivery',
            'cancelled',
            'on-hold',
            'expired'
        ],
        //require: true,
        default: ['pending'],

    },
    totalPrice: Number,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    dateOrdered: { type: Date, default: Date.now() },

    postalCode: String,



});

orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

exports.Order = model('Order', orderSchema);