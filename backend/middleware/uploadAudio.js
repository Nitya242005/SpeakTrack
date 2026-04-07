const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter (MOST IMPORTANT FIX)
function fileFilter(req, file, cb) {
  // Accept ALL audio formats + WhatsApp mp4
  if (
    file.mimetype.startsWith("audio") ||
    file.mimetype === "video/mp4" || 
    file.mimetype === "video/mpeg" ||
    file.mimetype === "video/wav"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Only audio files allowed."), false);
  }
}

module.exports = multer({ storage, fileFilter });

