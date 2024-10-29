const { Schema, model } = require('mongoose');

const categorySchema = Schema(
    {
        name: { type: String, require: true },
        color: { type: String, default: "#0000000" },
        image: { type: String, require: true },
        markedForDeletion: { type: Boolean, default: false },


    }
);

categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

exports.Category = model('Category', categorySchema);