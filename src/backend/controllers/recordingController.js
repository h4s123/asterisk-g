// const fs = require("fs");
// const path = require("path");
// const util = require("util");
// const { initializeAri } = require("../ari/ari-connection");
// const unlinkFile = util.promisify(fs.unlink);
// const gtts = require("gtts");

// const uploadRecording = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ message: "No file uploaded." });

//     const recordingsDir = path.join(__dirname, "../recordings");
//     if (!fs.existsSync(recordingsDir)) {
//       fs.mkdirSync(recordingsDir, { recursive: true });
//     }

//     const targetPath = path.join(recordingsDir, file.originalname);
//     fs.renameSync(file.path, targetPath);

//     res
//       .status(200)
//       .json({ message: "Recording uploaded successfully.", path: targetPath });
//   } catch (error) {
//     console.error("Error uploading recording:", error);
//     res.status(500).json({ message: "Failed to upload recording." });
//   }
// };

// const textToSpeech = async (req, res) => {
//   const { text } = req.body;

//   if (!text || text.trim() === "") {
//     return res
//       .status(400)
//       .json({ message: "Text input is required for conversion." });
//   }

//   try {
//     const recordingsDir = path.join(__dirname, "../recordings");
//     if (!fs.existsSync(recordingsDir)) {
//       fs.mkdirSync(recordingsDir, { recursive: true });
//     }

//     const filePath = path.join(recordingsDir, `speech_${Date.now()}.ulaw`);
//     const gttsInstance = new gtts(text, "en");

//     gttsInstance.save(filePath, (err) => {
//       if (err) {
//         console.error("Error generating speech:", err);
//         return res
//           .status(500)
//           .json({ message: "Failed to convert text to speech." });
//       }

//       res.status(200).json({
//         message: "Text successfully converted to speech.",
//         filePath: `/recordings/${path.basename(filePath)}`,
//       });
//     });
//   } catch (error) {
//     console.error("Error during text-to-speech processing:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while processing your request." });
//   }
// };

// const uploadNumbers = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ message: "No file uploaded." });

//     const data = fs.readFileSync(file.path, "utf-8");
//     const numbers = data
//       .split("\n")
//       .map((num) => num.trim())
//       .filter(Boolean);

//     global.callNumbers = numbers;

//     await unlinkFile(file.path);

//     res
//       .status(200)
//       .json({ message: "Numbers uploaded successfully.", numbers });
//   } catch (error) {
//     console.error("Error uploading numbers:", error);
//     res.status(500).json({ message: "Failed to upload numbers." });
//   }
// };

// const generateRandomCallerId = () => {
//   const prefix = "100"; // Prefix for caller ID
//   return `${prefix}${Math.floor(100000 + Math.random() * 900000)}`; // Random 6-digit number
// };

// const startCalls = async (req, res) => {
//   try {
//     if (!global.callNumbers || global.callNumbers.length === 0) {
//       return res.status(400).json({ message: "No numbers available to call." });
//     }

//     const recordingsDir = path.join(__dirname, "../recordings");
//     const files = fs.readdirSync(recordingsDir);

//     // Find valid audio files
//     const audioFiles = files.filter(
//       (file) => file.endsWith(".ulaw") || file.endsWith(".wav")
//     );

//     if (audioFiles.length !== 1) {
//       return res.status(400).json({
//         message:
//           "Please upload either a recording or a text-to-speech file, but not both.",
//       });
//     }

//     const audioFile = audioFiles[0];
//     const recordingPath = path.join(recordingsDir, audioFile);

//     const trunk = "my-trunk-endpoint"; // Replace with your actual trunk configuration
//     const ari = await initializeAri();

//     for (const number of global.callNumbers) {
//       try {
//         const randomCallerId = generateRandomCallerId(); // Generate random caller ID

//         console.log(`Placing call to ${number} using trunk ${trunk}...`);
//         await ari.channels.originate({
//           endpoint: `PJSIP/${trunk}/${number}`,
//           app: "my-ari-app",
//           appArgs: recordingPath,
//           callerId: randomCallerId, // Assign random caller ID
//           timeout: 30,
//           variables: {
//             RECORDING_PATH: recordingPath,
//           },
//         });

//         console.log(
//           `Call to ${number} initiated successfully with caller ID ${randomCallerId}.`
//         );
//       } catch (error) {
//         console.error(`Error placing call to ${number}:`, error);
//       }
//     }

//     res.status(200).json({ message: "Calls started successfully." });
//   } catch (error) {
//     console.error("Error starting calls:", error);
//     res.status(500).json({ message: "Failed to start calls." });
//   }
// };

// module.exports = { uploadRecording, textToSpeech, uploadNumbers, startCalls };

// const startCalls = async (req, res) => {
//   try {
//     if (!global.callNumbers || global.callNumbers.length === 0) {
//       return res.status(400).json({ message: "No numbers available to call." });
//     }

//     const recordingDir = path.join(__dirname, "../recordings");
//     const files = fs.readdirSync(recordingDir);
//     const recordingFile = files.find(
//       (file) => file.endsWith(".ulaw") || file.endsWith(".wav")
//     );

//     if (!recordingFile) {
//       return res.status(400).json({ message: "No recording file uploaded." });
//     }

//     const trunk = "my-trunk-endpoint"; // Matches your trunk configuration
//     const recordingPath = path.join(recordingDir, recordingFile);

//     const ari = await initializeAri();

//     for (const number of global.callNumbers) {
//       try {
//         console.log(`Placing call to ${number} using trunk ${trunk}...`);

//         await ari.channels.originate({
//           // endpoint: `PJSIP/${trunk}/${number}`,
//           endpoint: `PJSIP/my-trunk-endpoint/sip:+17194038503@sip.controsepticon.us`,
//           app: "my-ari-app",
//           appArgs: recordingPath,
//           callerId: "7894561230", // Set your caller ID
//           timeout: 30,
//           variables: {
//             RECORDING_PATH: recordingPath,
//           },
//         });

//         console.log(`Call to ${number} initiated successfully.`)
//       } catch (error) {
//         console.error(`Error placing call to ${number}:`, error);
//       }
//     }

//     res.status(200).json({ message: "Calls started successfully." });
//   } catch (error) {
//     console.error("Error starting calls:", error);
//     res.status(500).json({ message: "Failed to start calls." });
//   }
// };

// module.exports = { uploadRecording, textToSpeech, uploadNumbers, startCalls };

// recordingController.js
const fs = require("fs");
const path = require("path");
const util = require("util");
const { initializeAri } = require("../ari/ari-connection");
const unlinkFile = util.promisify(fs.unlink);
const gtts = require("gtts");

// Shared session state
let activeRecording = null;

const uploadRecording = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded." });

    if (activeRecording) {
      return res.status(400).json({
        message:
          "An active recording is already in use. Please clear it first.",
      });
    }

    const recordingsDir = path.join(__dirname, "../recordings");
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    const targetPath = path.join(recordingsDir, file.originalname);
    fs.renameSync(file.path, targetPath);

    activeRecording = targetPath;
    res.status(200).json({
      message: "Recording uploaded successfully.",
      path: targetPath,
    });
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
    if (activeRecording) {
      return res.status(400).json({
        message:
          "An active recording is already in use. Please clear it first.",
      });
    }

    const recordingsDir = path.join(__dirname, "../recordings");
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    const filePath = path.join(recordingsDir, `speech_${Date.now()}.ulaw`);
    const gttsInstance = new gtts(text, "en");

    gttsInstance.save(filePath, (err) => {
      if (err) {
        console.error("Error generating speech:", err);
        return res
          .status(500)
          .json({ message: "Failed to convert text to speech." });
      }

      activeRecording = filePath;
      res.status(200).json({
        message: "Text successfully converted to speech.",
        filePath: `/recordings/${path.basename(filePath)}`,
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

    global.callNumbers = numbers;

    await unlinkFile(file.path);

    res
      .status(200)
      .json({ message: "Numbers uploaded successfully.", numbers });
  } catch (error) {
    console.error("Error uploading numbers:", error);
    res.status(500).json({ message: "Failed to upload numbers." });
  }
};

const generateRandomCallerId = () => {
  const prefix = "+1"; // Prefix for caller ID
  return `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`; // Random 11-digit number
};

const startCalls = async (req, res) => {
  try {
    if (!global.callNumbers || global.callNumbers.length === 0) {
      return res.status(400).json({ message: "No numbers available to call." });
    }

    if (!activeRecording) {
      return res.status(400).json({
        message:
          "No active recording available. Please upload or generate one.",
      });
    }

    const trunk = "my-trunk-endpoint"; // Replace with your actual trunk configuration
    const ari = await initializeAri();

    for (const number of global.callNumbers) {
      try {
        const randomCallerId = generateRandomCallerId(); // Generate random caller ID

        console.log(`Placing call to ${number} using trunk ${trunk}...`);
        await ari.channels.originate({
          endpoint: `PJSIP/${number}@${trunk}`,
          extension: number,
          context: "ari-context",
          app: "my-ari-app",
          appArgs: activeRecording,
          callerId: randomCallerId, // Assign random caller ID
          timeout: 30,
          variables: {
            RECORDING_PATH: activeRecording,
          },
        });

        console.log(
          `Call to ${number} initiated successfully with caller ID ${randomCallerId}.`
        );
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
