const multer = require('multer');

const storage = multer.memoryStorage(); // Using in-memory storage for demonstration, you can configure disk storage as well

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB file size limit (adjust as needed)
    },
});

module.exports = upload;
