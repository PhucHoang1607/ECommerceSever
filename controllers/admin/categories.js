const media_helper = require('../../helper/media_helper');
const util = require('util');
const { Category } = require('../../models/category');


exports.getAllCategory = async (req, res) => {
    try {
        const category = await Category.find();
        if (!category) return res.status(404).json({ message: "Categories not found" });

        return res.json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.addCategory = async (req, res) => {
    try {
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
        let category = new Category(req.body);

        category = category.save();

        if (!category) {
            return res
                .status(500)
                .json({ message: "The category could not be created" });
        }

        return res.status(201).json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

exports.editCategory = async (req, res) => {
    try {
        const { name, color, icon } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, icon, color },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ type: error.name, message: error.message })
        };

        return res.json(category);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}


exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.markedForDeletion = true;
        await category.save();
        return res.status(204).end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}