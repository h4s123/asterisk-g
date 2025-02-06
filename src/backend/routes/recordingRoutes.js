const express = require("express");
const multer = require("multer");
const {
  processAndUploadRecording,
  startCalls,
  uploadNumbers,
  processAndUploadTts
} = require("../controllers/recordingController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary directory for file uploads

// Routes
router.post(  "/upload-recording",  upload.single("file"),  processAndUploadRecording);
router.post("/text-to-speech", processAndUploadTts);
router.post("/upload-numbers", upload.single("file"), uploadNumbers);
router.post("/start-calls", startCalls);

module.exports = router;
