const { Schema, model } = require('mongoose');

const productSchema = Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    color: [{ type: String }],
    image: { type: String },
    imageDetail: [{ type: String }],
    sizes: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', require: true },
    genderAgecategory: { type: String, enum: ['men', 'woman', 'kids', 'modern'] },
    dateAdded: { type: Date, default: Date.now() },

    // rating: { type: Number, default: 0.0 },
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // numberOfReviews: { type: Number, default: 0 },
    // countInStock: [{ type: Number, require: true, min: 0, max: 255 }]
});
//pre-save hook
// productSchema.pre('save', async function (next) {
//     if (this.reviews.length > 0) {
//         await this.populate('reveiws');

//         const totalRating = this.reviews.reduce((acc, review) =>
//             acc + review.rating, 0
//         );

//         this.rating = totalRating / this.reviews.length;
//         this.rating = parseFloat((totalRating / this.reviews.length).toFixed(1));
//         this.numberOfReviews = this.revies.length;
//     }
//     next();
// });

productSchema.index({ name: 'text', description: 'text' });

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });



exports.Product = model('Product', productSchema);