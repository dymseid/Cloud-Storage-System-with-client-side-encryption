// multerConfig.js
const multer = require('multer');
const path = require('path');

// Set storage engine for multer (store file in memory)
const storage = multer.memoryStorage();

// Set file type validation (optional)
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs only!');
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
