require("dotenv").config();
const AriClient = require("ari-client");
const { saveCallStatusToDatabase } = require("./db-utils");
const path = require("path"); // Node.js module to handle file paths

const helloPath = path.resolve(__dirname, "../../../public/hello.wav"); // Get the full file path

const ARI_URL = process.env.ARI_URL || "http://localhost:8088";
const ARI_USERNAME = process.env.ARI_USERNAME || "asterisk";
const ARI_PASSWORD = process.env.ARI_PASSWORD || "asterisk";

let clientInstance; // To reuse the client once initialized

// Function to initialize ARI
async function initializeAri() {
  if (clientInstance) {
    console.log("Reusing existing ARI client instance.");
    return clientInstance;
  }

  try {
    const client = await AriClient.connect(ARI_URL, ARI_USERNAME, ARI_PASSWORD);
    clientInstance = client;
    console.log("Connected to ARI");

    const appName = "my-ari-app";

    client.on("StasisStart", async (event, channel) => {
      console.log(`Incoming call on channel: ${channel.name}`);

      const playback = client.Playback();
      const recordingFile = event.args[0]; // Get the recording file from appArgs

      if (!recordingFile) {
        console.error("No recording file found in appArgs. Hanging up.");
        await channel.hangup();
        return;
      }

      // Play the uploaded recording
      try {
        await channel.answer();
        await channel.play({
          // media: `sound:/var/lib/asterisk/sounds/uploads/hello`,
          media: `sound:/var/lib/asterisk/sounds/uploads/${recordingFile.replace('.ul', '')}`, // Remove .ul extension if needed
          playbackId: playback.id,
        });
        console.log("Playing recording.");
      } catch (error) {
        console.error("Error playing the recording:", error);
      }

      playback.on("PlaybackFinished", async () => {
        console.log("Playback finished, hanging up.");
        await channel.hangup();
      });
    });

    client.on("StasisEnd", async (event, channel) => {
      const callStatus = channel?.dialplan?.app_data || "UNKNOWN";
      const phoneNumber = channel?.caller?.number || "UNKNOWN";

      // Categorize results
      const list =
        callStatus === "ANSWERED"
          ? "hot"
          : callStatus === "NO_ANSWER"
          ? "cold"
          : "steam";

      try {
        await saveCallStatusToDatabase(phoneNumber, list);
        console.log(`Saved ${phoneNumber} as ${list}`);
      } catch (err) {
        console.error("Error saving call status:", err);
      }
    });

    client.start(appName);
    console.log(`ARI application "${appName}" registered successfully`);
    return client;
  } catch (err) {
    console.error("Error connecting to ARI:", err);
    throw err; // Propagate the error
  }
}

module.exports = { initializeAri };
