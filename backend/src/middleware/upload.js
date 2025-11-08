const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Guardamos en buffer (mejor para SSR/cloud)

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

module.exports = upload;