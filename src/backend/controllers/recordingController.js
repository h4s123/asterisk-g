const fs = require("fs");
const path = require("path");
const util = require("util");
const { spawn } = require("child_process");
const ari = require("../ari/ari-connection"); // Ensure ARI connection is configured
const unlinkFile = util.promisify(fs.unlink);
const gtts = require("gtts"); // Import gtts

const uploadRecording = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded." });

    const recordingsDir = path.join(__dirname, "../recordings");
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    const targetPath = path.join(recordingsDir, file.originalname);
    fs.renameSync(file.path, targetPath);

    res
      .status(200)
      .json({ message: "Recording uploaded successfully.", path: targetPath });
  } catch (error) {
    console.error("Error uploading recording:", error);
    res.status(500).json({ message: "Failed to upload recording." });
  }
};

const textToSpeech = async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res
      .status(400)
      .json({ message: "Text input is required for conversion." });
  }

  try {
    const recordingsDir = path.join(__dirname, "../recordings");
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    const filePath = path.join(recordingsDir, `speech_${Date.now()}.mp3`);
    const gttsInstance = new gtts(text, "en");

    gttsInstance.save(filePath, (err) => {
      if (err) {
        console.error("Error generating speech:", err);
        return res
          .status(500)
          .json({ message: "Failed to convert text to speech." });
      }

      res.status(200).json({
        message: "Text successfully converted to speech.",
        filePath: `/recordings/${path.basename(filePath)}`, // Adjusted path
      });
    });
  } catch (error) {
    console.error("Error during text-to-speech processing:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

const uploadNumbers = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded." });

    const data = fs.readFileSync(file.path, "utf-8");
    const numbers = data
      .split("\n")
      .map((num) => num.trim())
      .filter(Boolean);

    // Store the numbers in memory or database
    global.callNumbers = numbers;

    // Delete the uploaded file
    await unlinkFile(file.path);

    res
      .status(200)
      .json({ message: "Numbers uploaded successfully.", numbers });
  } catch (error) {
    console.error("Error uploading numbers:", error);
    res.status(500).json({ message: "Failed to upload numbers." });
  }
};

const startCalls = async (req, res) => {
  try {
    // Ensure numbers are available
    if (!global.callNumbers || global.callNumbers.length === 0) {
      return res.status(400).json({ message: "No numbers available to call." });
    }

    // Ensure recording is uploaded
    const recordingDir = path.join(__dirname, "../recordings");
    const files = fs.readdirSync(recordingDir);
    const recordingFile = files.find(
      (file) => file.endsWith(".mp3") || file.endsWith(".wav")
    );

    if (!recordingFile) {
      return res.status(400).json({ message: "No recording file uploaded." });
    }

    const trunk = "my-trunk"; // Replace with your configured trunk
    const recordingPath = path.join(recordingDir, recordingFile);

    // Place calls sequentially
    for (const number of global.callNumbers) {
      try {
        console.log(`Placing call to ${number}...`);

        // Initiate call using ARI
        await ari.channels.originate({
          endpoint: `SIP/${trunk}/${number}`,
          app: "my-ari-app", // Ensure this matches your ARI app
            appArgs: recordingPath, // Path to the recording file
        });

        console.log(`Call to ${number} initiated successfully.`);
      } catch (error) {
        console.error(`Error placing call to ${number}:`, error);
      }
    }

    res.status(200).json({ message: "Calls started successfully." });
  } catch (error) {
    console.error("Error starting calls:", error);
    res.status(500).json({ message: "Failed to start calls." });
  }
};

module.exports = { uploadRecording, textToSpeech, uploadNumbers, startCalls };

// const path = require("path");
// const { GoogleTTS } = require("gtts");

// exports.textToSpeech = async (req, res) => {
//   const { text } = req.body;

//   if (!text || text.trim() === "") {
//     return res.status(400).json({ message: "Text input is required for conversion." });
//   }

//   try {
//     const gtts = new GoogleTTS(text, "en"); // English
//     const filePath = path.join(__dirname, "../uploads", `speech_${Date.now()}.mp3`);

//     gtts.save(filePath, (err) => {
//       if (err) {
//         console.error("Error generating speech:", err);
//         return res.status(500).json({ message: "Failed to convert text to speech." });
//       }

//       res.status(200).json({
//         message: "Text successfully converted to speech.",
//         filePath: `/uploads/${path.basename(filePath)}`,
//       });
//     });
//   } catch (error) {
//     console.error("Error during text-to-speech processing:", error);
//     res.status(500).json({ message: "An error occurred while processing your request." });
//   }
// };
