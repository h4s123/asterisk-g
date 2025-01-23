require("dotenv").config();
const AriClient = require("ari-client");
const { saveCallStatusToDatabase } = require("./db-utils");
const path = require("path"); // Node.js module to handle file paths
// const speech = require('../recordings/speech.ulaw');
// const speech1 = require('../recordings/speech1.mp3');
// const hello = require('../recordings/hello.wav');

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
    console.log("hello1");

    const client = await AriClient.connect(ARI_URL, ARI_USERNAME, ARI_PASSWORD);
    console.log("hello2");
    clientInstance = client;
    console.log("Connected to ARI");

    const appName = "my-ari-app";

    // Start listening to Stasis events
    client.on("StasisStart", async (event, channel) => {
      console.log(`Call received on channel: ${channel.name}`);
      console.log(channel?.dialplan?.app_data, "my dialplan variables");

      const recordingPath = channel?.dialplan?.app_data
        ? channel?.dialplan?.app_data
        : null;

      if (!recordingPath) {
        console.error("RECORDING_PATH variable is missing or undefined.");
        return;
      }

      try {
        // Play the recording
        await client.channels.play({
          channelId: channel.id,
          // media: `sound:${recordingPath}`,
          media: `sound:${speech}`,
        });

        console.log(`Playback started for channel: ${channel.name}`);
      } catch (error) {
        console.error(
          `Error playing back audio on channel: ${channel.name}`,
          error
        );
      }

      // Hang up the call after playback
      setTimeout(async () => {
        try {
          await client.channels.hangup({ channelId: channel.id });
          console.log(`Call ended for channel: ${channel.name}`);
        } catch (error) {
          console.error(`Error hanging up channel: ${channel.name}`, error);
        }
      }, 30000); // Adjust the timeout based on the audio length
    });

    client.on("StasisEnd", (event, channel) => {
      console.log(`Call ended on channel: ${channel.name}`);
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
