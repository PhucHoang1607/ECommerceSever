const { Schema, default: mongoose, model } = require("mongoose");

const userSchema = Schema({
    name: { type: String, require: true, trim: true },
    // email: {
    //     type: String, require: true, trim: true, validate: {
    //         validator: (value) => {
    //             const re = /^\s*[\w\-\+_]+(?:\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(?:\.[\w\-\+_]+)*\s*$/;
    //             return value.match(re);
    //         },
    //         message: "Please enter a valid email address",
    //     }
    // },
    email: { type: String, require: true, trim: true, },
    passwordHash: { type: String, require: true, trim: true },
    paymentCustomerId: String,
    address: String,
    gender: String,
    dateOfBirth: Date,
    phone: { type: String, require: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    resetPasswordOTP: Number,
    resetPasswordOTPExpires: Date,
    cart: [{ type: Schema.Types.ObjectId, ref: "CartProduct" }],
    wishlists: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', require: true },
            productName: { type: String, require: true },
            productImage: { type: String, require: true },
            productPrice: { type: Number, require: true },

        },
    ],


});

userSchema.index({ email: 1 }, { unique: true });
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

exports.User = model('User', userSchema);


