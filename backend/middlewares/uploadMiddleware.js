const upload = require('../config/multer');

// Middleware for host room images: accept up to 10 images in field `images`
const uploadRoomImages = upload.array('images', 10);

module.exports = {
	uploadRoomImages,
};
