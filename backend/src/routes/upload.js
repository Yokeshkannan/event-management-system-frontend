  /**
 * src/routes/upload.js
 * Image upload route — stores files locally in /uploads
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Multer config ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

// POST /api/upload — upload a single image
router.post('/', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  // Build the public URL
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return res.status(200).json({
    message: 'Image uploaded successfully',
    image_url: imageUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
