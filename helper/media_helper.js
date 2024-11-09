const { unlink } = require('fs/promises');
const multer = require('multer');
const path = require('path');

//Specified some Allowed image type can be use
const ALLOWED_EXTENSION = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/jpg': 'jpg',
    'application/octet-stream': 'jpg',
    'application/octet-stream': 'png',
    'application/octet-stream': 'jpg',
};


//Storage Configuration
const storage = multer.diskStorage({
    //where the uploaded images will be saved.
    destination: function (_, _, cb) {
        cb(null, 'public/uploads/');
    },
    //Generates a unique filename for each uploaded image by taking 
    //the original filename, replacing spaces, and stripping the extension. 
    //It then appends a timestamp and the appropriate extension to avoid naming conflicts
    filename: function (_, file, cb) {
        const filename = file.originalname
            .replace(' ', '-')
            .replace('.png', '')
            .replace('.jpg', '')
            .replace('.jpeg', '')
            .replace(/\s/g, '-')  // Thay thế khoảng trắng bằng dấu gạch ngang
            .replace(/\.(png|jpg|jpeg)$/i, ''); // Loại bỏ phần mở rộng;
        const extension = ALLOWED_EXTENSION[file.mimetype] || 'jpg';
        cb(null, `${filename}-${Date.now()}.${extension}`)


    }

});

exports.upload = multer({
    storage: storage,
    //Limits: Restricts file size to a maximum of 5MB.
    limits: { fileSize: 1024 * 1024 * 5 },

    //: Checks if the uploaded file’s MIME type is allowed. If not, it returns an error specifying the invalid MIME type.
    fileFilter: (_, file, cb) => {
        const isValid = ALLOWED_EXTENSION[file.mimetype];
        let uploadError = new Error(`Invalid image type\n${file.mimetype} is not allowed`);
        if (!isValid) return cb(uploadError);
        return cb(null, true);
    }
});


exports.deleteImages = async function (imageUrls, continueOnErrorName) {
    await Promise.all(imageUrls.map(async (imageUrl) => {
        const imagePath = path.resolve(
            __dirname,
            '..',
            'public',
            'uploads',
            path.basename(imageUrl)
        );
        try {
            await unlink(imagePath);
        } catch (error) {
            if (error.code === continueOnErrorName) {
                console.error(`Continuing with the next image: ${error.message}`);
            } else {
                console.error(`Error deleting image: ${error.message}`);
                throw error;
            }
        }
    })
    );
};