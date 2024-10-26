const { Schema, model } = require('mongoose');

const categorySchema = Schema(
    {
        name: { type: String, require: true },
        image: { type: String, require: true },
        markedForDeletion: { type: Boolean, default: false },


    }
);

categorySchema.set('toObject', { virtuals: true });
cate.set('toJSON', { virtuals: true });

exports.Category = model('Category', categorySchema);