const express = require("express");
const multer = require("multer");
const {
  processAndUploadRecording,
  startCalls,
  uploadNumbers,
} = require("../controllers/recordingController");
// const { uploadRecording, textToSpeech, uploadNumbers, startCalls } =
//   require("../controllers/recordingController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary directory for file uploads

// Routes
router.post(
  "/upload-recording",
  upload.single("file"),
  processAndUploadRecording
);
// router.post("/upload-recording", upload.single("file"), uploadRecording);
// router.post("/text-to-speech", textToSpeech);
router.post("/upload-numbers", upload.single("file"), uploadNumbers);
router.post("/start-calls", startCalls);

module.exports = router;
