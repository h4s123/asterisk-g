// // recordingController.js
// require("dotenv").config();
// const fs = require("fs");
// const path = require("path");
// const util = require("util");
// const { initializeAri } = require("../ari/ari-connection");
// const unlinkFile = util.promisify(fs.unlink);
// const gtts = require("gtts");

// const Client = require("ssh2-sftp-client");

// //to convert the file to ulaw
// const convertToUlaw = async (filePath) => {
//   const ulawPath = filePath.replace(/\.\w+$/, ".ulaw");
//   return new Promise((resolve, reject) => {
//     exec(`sox ${filePath} -r 8000 -c 1 ${ulawPath}`, (error) => {
//       if (error) reject(error);
//       else resolve(ulawPath);
//     });
//   });
// };

// // Shared session state
// let activeRecording = null;

// // const uploadRecording = async (req, res) => {
// //   try {
// //     const file = req.file;
// //     if (!file) return res.status(400).json({ message: "No file uploaded." });

// //     if (activeRecording) {
// //       return res.status(400).json({
// //         message:
// //           "An active recording is already in use. Please clear it first.",
// //       });
// //     }

// //     // file = convertToUlaw(file);

// //     const recordingsDir = path.join(__dirname, "../recordings");
// //     if (!fs.existsSync(recordingsDir)) {
// //       fs.mkdirSync(recordingsDir, { recursive: true });
// //     }

// //     const targetPath = path.join(recordingsDir, file.originalname);
// //     fs.renameSync(file.path, targetPath);

// //     activeRecording = targetPath;
// //     res.status(200).json({
// //       message: "Recording uploaded successfully.",
// //       path: targetPath,
// //     });
// //   } catch (error) {
// //     console.error("Error uploading recording:", error);
// //     res.status(500).json({ message: "Failed to upload recording." });
// //   }
// // };

// const textToSpeech = async (req, res) => {
//   const { text } = req.body;

//   if (!text || text.trim() === "") {
//     return res
//       .status(400)
//       .json({ message: "Text input is required for conversion." });
//   }

//   try {
//     if (activeRecording) {
//       return res.status(400).json({
//         message:
//           "An active recording is already in use. Please clear it first.",
//       });
//     }

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

//       activeRecording = filePath;
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
//   const prefix = "1844"; // Prefix for caller ID
//   return `${prefix}${Math.floor(1000000 + Math.random() * 9000000)}`; // Random 11-digit number
// };

// const startCalls = async (req, res) => {
//   try {
//     if (!global.callNumbers || global.callNumbers.length === 0) {
//       return res.status(400).json({ message: "No numbers available to call." });
//     }

//     if (!activeRecording) {
//       return res.status(400).json({
//         message:
//           "No active recording available. Please upload or generate one.",
//       });
//     }

//     const trunk = "my-trunk-endpoint"; // Replace with your actual trunk configuration
//     const ari = await initializeAri();

//     for (const number of global.callNumbers) {
//       try {
//         const randomCallerId = generateRandomCallerId(); // Generate random caller ID

//         console.log(`Placing call to ${number} using trunk ${trunk}...`);

//         await ari.channels.originate({
//           endpoint: `PJSIP/${number}@${trunk}`,
//           extension: number,
//           context: "ari-context",
//           app: "my-ari-app",
//           appArgs: activeRecording,
//           callerId: randomCallerId,
//           timeout: 30,
//           variables: {
//             RECORDING_PATH: activeRecording,
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

// setTimeout(() => {
//   activeRecording = null;
// }, 30000); // Clear after a safe period

// module.exports = { uploadRecording, textToSpeech, uploadNumbers, startCalls };

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const axios = require("axios");
const { initializeAri } = require("../ari/ari-connection");
const unlinkFile = util.promisify(fs.unlink);
const gtts = require("gtts");

const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const Client = require("ssh2-sftp-client");
const sftp = new Client();

// Shared session state
let activeRecording = null;

// Function: Upload file to Asterisk server
const uploadFileToAsterisk = async (filePath) => {
  try {
    console.log("Connecting to Asterisk SFTP...");
    const sftpConfig = {
      host: process.env.ARI_IP || "192.168.31.254", // Asterisk server IP
      port: 22, // Default SFTP port
      username: process.env.ASTERISK_SFTP_USER || "akoma",
      password: process.env.ASTERISK_SFTP_PASSWORD || "akoma",
    };

    const remotePath = `/var/lib/asterisk/sounds/uploads/${path.basename(
      filePath
    )}`;

    console.log("SFTP Config:", sftpConfig);

    await sftp.connect(sftpConfig);
    console.log("Connected successfully to SFTP.");
    await sftp.put(filePath, remotePath);
    await sftp.end();

    console.log(`File uploaded to Asterisk: ${remotePath}`);
    return path.basename(filePath); // Return the file name for further processing
  } catch (error) {
    console.error("Error uploading file to Asterisk server:", error.message);
    throw error;
  }
};

//to convert the file to ulaw
const convertToUlaw = async (filePath) => {
  const ulawPath = filePath.replace(/\.\w+$/, ".ul"); // Change extension to .ul
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .audioChannels(1) // Convert to mono
      .audioFrequency(8000) // Set sample rate to 8000 Hz
      .audioCodec("pcm_mulaw") // Use the ulaw codec
      .format("s16le") // Set the output to raw PCM
      .on("end", () => {
        console.log("Conversion to ulaw successful:", ulawPath);
        resolve(ulawPath);
      })
      .on("error", (error) => {
        console.error("Error converting to ulaw:", error.message);
        reject(error);
      })
      .save(ulawPath); // Save the file with the .ul extension
  });
};

// Function: Convert uploaded file to ulaw and upload to Asterisk
const processAndUploadRecording = async (req, res) => {
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

    // Save the uploaded file locally
    const targetPath = path.join(recordingsDir, file.originalname);
    fs.renameSync(file.path, targetPath);

    const convertedToUlaw= await convertToUlaw(targetPath);
    console.log(convertedToUlaw,"converted to ulaw");
    

    const uploadedFileName = await uploadFileToAsterisk(convertedToUlaw);

    // Clean up local files
    fs.unlinkSync(targetPath);
    // fs.unlinkSync(ulawPath);

    activeRecording = uploadedFileName;

    res.status(200).json({
      message: "Recording uploaded and processed successfully.",
      fileName: uploadedFileName,
    });
  } catch (error) {
    console.error("Error processing recording:", error);
    res.status(500).json({ message: "Failed to process recording." });
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

// Function: Start calls and play the uploaded file
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
        const randomCallerId = `1844${Math.floor(
          1000000 + Math.random() * 9000000
        )}`; // Generate random caller ID

        console.log(`Placing call to ${number} using trunk ${trunk}...`);

        await ari.channels.originate({
          endpoint: `PJSIP/${number}@${trunk}`,
          extension: number,
          context: "ari-context",
          app: "my-ari-app",
          appArgs: activeRecording,
          callerId: randomCallerId,
          timeout: 30,
          variables: {
            RECORDING_PATH: `uploads/${activeRecording}`,
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

// Cleanup: Clear active recording after 24 hours
// setInterval(() => {
//   activeRecording = null;
//   console.log("Cleared active recording after 24 hours.");
// }, 24 * 60 * 60 * 1000);

// Export functions
module.exports = {
  processAndUploadRecording,
  // textToSpeech,
  uploadNumbers,
  startCalls,
};
