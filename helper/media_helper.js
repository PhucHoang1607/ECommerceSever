const multer = require('multer');

exports.upload = multer({
    storage: undefined,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: (_, file, cb) => {

    }
});