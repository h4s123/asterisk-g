const express = require("express");
const multer = require("multer");
const { uploadRecording, textToSpeech, uploadNumbers, startCalls } = require("../controllers/recordingController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary directory for file uploads

// Routes
router.post("/upload-recording", upload.single("file"), uploadRecording);
router.post("/text-to-speech", textToSpeech);
router.post("/upload-numbers", upload.single("file"), uploadNumbers);
router.post("/start-calls", startCalls);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { textToSpeech } = require("../controllers/recordingController");

// router.post("/api/text-to-speech", textToSpeech);

// module.exports = router;
