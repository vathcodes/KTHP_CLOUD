// middleware/upload.js
import multer from 'multer';
import path from 'path';

// Cấu hình storage: lưu vào folder 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

// Lọc file ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ được phép upload file ảnh'), false);
  }
};

export const upload = multer({ storage, fileFilter });
