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
    console.log("hello1");

    const client = await AriClient.connect(ARI_URL, ARI_USERNAME, ARI_PASSWORD);
    console.log("hello2");
    clientInstance = client;
    console.log("Connected to ARI");

    const appName = "my-ari-app";

    // Start listening to Stasis events
    client.on("StasisStart", async (event, channel) => {
      console.log(`Call received on channel: ${channel.name}`);

      const recordingPath = channel.dialplan.variables
        ? channel.dialplan.variables.RECORDING_PATH
        : null;

      if (!recordingPath) {
        console.error("RECORDING_PATH variable is missing or undefined.");
        return;
      }

      try {
        // Play the recording
        await client.channels.play({
          channelId: channel.id,
          media: `sound:${recordingPath}`,
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

// client.on("StasisStart", async (event, channel) => {
//   console.log(`Call received on channel: ${channel.name}`);

//   let isInputReceived = false; // Flag to track if valid input was received
//   let timeoutId; // Timeout ID for clearing

//   try {
//     // Timeout for unanswered calls
//     timeoutId = setTimeout(async () => {
//       if (!isInputReceived) {
//         try {
//           const channelState = await client.channels.get({
//             channelId: channel.id,
//           }); // Fetch the channel state
//           if (
//             channelState.state === "Ring" ||
//             channelState.state === "Down"
//           ) {
//             console.log(
//               `Call unanswered - adding ${channel.caller.number} to COLD list`
//             );
//             await saveCallStatusToDatabase(channel.caller.number, "cold"); // Save to DB
//           } else if (channelState.state === "Up") {
//             console.log(
//               `Call answered but no input received - adding ${channel.caller.number} to STEAM list`
//             );
//             await saveCallStatusToDatabase(channel.caller.number, "steam"); // Save to DB
//           }
//         } catch (error) {
//           console.error("Error fetching channel state:", error.message);
//         }
//       }
//     }, 10000); // 10 seconds timeout

//     // Answer the call
//     if (channel.state !== "Hangup") {
//       await channel.answer();
//       console.log("Call answered.");
//     }

//     // Play the pre-recorded file
//     if (channel.state !== "Hangup") {
//       await channel.play({ media: `sound:${helloPath}` });
//       const recordingPath = channel.getChannelVar("appArgs"); // Pass the recording path as a variable
//       if (recordingPath && channel.state !== "Hangup") {
//         await channel.play({ media: `file://${recordingPath}` }); // Ensure the path is valid
//       }

//       console.log("Playing pre-recorded message.");
//     }

//     // Listen for DTMF (key presses)
//     channel.on("ChannelDtmfReceived", async (dtmfEvent) => {
//       if (isInputReceived || channel.state === "Hangup") return;

//       const digit = dtmfEvent.digit;
//       console.log(`DTMF received: ${digit}`);

//       if (digit === "1") {
//         console.log("User pressed 1 - adding to HOT list");
//         await saveCallStatusToDatabase(channel.caller.number, "hot"); // Save to DB
//       } else {
//         console.log("User pressed an invalid key - adding to STEAM list");
//         await saveCallStatusToDatabase(channel.caller.number, "steam"); // Save to DB
//       }

//       isInputReceived = true;
//       clearTimeout(timeoutId); // Clear the timeout
//       if (channel.state !== "Hangup") {
//         await channel.hangup();
//         console.log("Call hung up after DTMF input.");
//       }
//     });

//     // Handle hangup before any input or timeout
//     channel.on("ChannelHangupRequest", async () => {
//       if (!isInputReceived) {
//         console.log(
//           `Call ended before input - adding ${channel.caller.number} to COLD list`
//         );
//         await saveCallStatusToDatabase(channel.caller.number, "cold"); // Save to DB
//       }
//       isInputReceived = true; // Prevent double saving
//       clearTimeout(timeoutId); // Clear the timeout
//     });
//   } catch (err) {
//     console.error("Error in StasisStart handler:", err);
//   }
// });
