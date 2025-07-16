import multer from 'multer';
import fs from 'fs';
import path from 'path';

// resolve absolute path to "public/temp" regardless of where process runs from
const tempDir = path.resolve(__dirname, '../../public/temp');

// Ensure directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // optionally use UUID here
  }
});

const upload = multer({ storage });
export default upload;
