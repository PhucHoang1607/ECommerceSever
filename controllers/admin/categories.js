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

exports.getCategoryById = async function (req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Categories not found' });
        }
        return res.json(category);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
}

// exports.addCategory = async (req, res) => {

//     try {
//         //const imageUrl = req.body.image;
//         let imagePath;

//         if (req.body.image && req.body.image.startsWith('http')) {
//             imagePath = req.body.image;
//         }
//         else if (req.files && req.files['image']) {
//             const image = req.files['image'][0];
//             const uploadImage = util.promisify(
//                 media_helper.upload.fields([{
//                     name: 'image', maxCount: 1
//                 }])
//             );
//             try {
//                 await uploadImage(req, res);
//             } catch (error) {
//                 console.error(error);
//                 return res.status(500).json({
//                     type: error.code,
//                     message: `${error.message}{${err.field}}`,
//                     storageError: error.storageError
//                 });
//             }

//             if (!image) return res.status(404).json({ message: 'No file found' });


//             imagePath = `${req.protocol}://${req.get('host')}/${image.path}`;
//         } else {
//             return res.status(400).json({ message: 'No image URL or file found' });
//         }


//         req.body['image'] = imagePath;

//         let category = new Category(req.body);
//         category = category.save();

//         if (!category) {
//             return res
//                 .status(500)
//                 .json({ message: "The category could not be created" });
//         }

//         return res.status(201).json(category);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ type: error.name, message: error.message });
//     }
// }

exports.addCategory = async (req, res) => {
    try {
        let imagePath;

        // Kiểm tra nếu người dùng gửi URL ảnh (http URL)
        if (req.body.image) {
            imagePath = req.body.image; // Sử dụng URL ảnh
        }
        // Kiểm tra nếu người dùng gửi file ảnh qua form-data
        else {
            //const image = req.files['image']; // Lấy file ảnh từ req.files

            // if (!image) {
            //     return res.status(404).json({ message: 'No file found' });
            // }

            // Tạo uploadImage để xử lý tải ảnh lên
            const uploadImage = util.promisify(
                media_helper.upload.fields([{
                    name: 'image', maxCount: 1
                }])
            );
            // Tiến hành tải ảnh lên
            try {
                await uploadImage(req, res);
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    type: error.code,
                    message: `${error.message} {${error.field}}`,
                    storageError: error.storageError
                });
            }
            const image = req.files['image'];
            if (!image || image.length === 0) return res.status(404).json({ message: "No file found" });

            // Sau khi ảnh được tải lên, lấy đường dẫn của ảnh
            imagePath = `${req.protocol}://${req.get('host')}/public/uploads/${image.filename}`;
            // imagePath = `${req.protocol}://${req.get('host')}/${image.filename}`;
        }
        //else {
        //     // Nếu không có URL ảnh hoặc tệp ảnh
        //     return res.status(400).json({ message: 'No image URL or file found' });
        // }

        // Cập nhật imagePath vào body request
        req.body['image'] = imagePath;

        // Tạo category và lưu vào MongoDB
        let category = new Category(req.body);
        category = await category.save();

        if (!category) {
            return res.status(500).json({ message: "The category could not be created" });
        }

        // Trả về thông tin category mới tạo
        return res.status(201).json(category);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ type: error.name, message: error.message });
    }
};




exports.editCategory = async (req, res) => {
    try {
        const { name, color, image } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, image, color },
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