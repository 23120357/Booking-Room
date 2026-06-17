const multer = require('multer');

// Use memory storage so service can validate size and persist files manually
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    // accept common image mime types
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    return cb(new Error('Only image files are allowed'));
  },
});

module.exports = upload;
