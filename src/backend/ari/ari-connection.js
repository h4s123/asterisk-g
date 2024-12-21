// require('dotenv').config();
// const AriClient = require('ari-client');
// const { saveCallStatusToDatabase } = require('./db-utils');
// const path = require('path'); // Node.js module to handle file paths

// const helloPath = path.resolve(__dirname, '../../../public/hello.wav'); // Get the full file path

// const ARI_URL = process.env.ARI_URL || 'http://localhost:8088';
// const ARI_USERNAME = process.env.ARI_USERNAME || 'asterisk';
// const ARI_PASSWORD = process.env.ARI_PASSWORD || 'asterisk';

// (async () => {
//   try {
//     // Connect to the ARI client
//     const client = await AriClient.connect(ARI_URL, ARI_USERNAME, ARI_PASSWORD);

//     console.log('Connected to ARI');

//     // Define the ARI app to handle calls
//     const appName = 'my-ari-app';

//     client.on('StasisStart', async (event, channel) => {
//       console.log(`Call received on channel: ${channel.name}`);

//       let isInputReceived = false; // Flag to track if valid input was received
//       let timeoutId; // Timeout ID for clearing

//       try {
//         // Answer the call
//         if (channel.state !== 'Hangup') {
//           await channel.answer();
//           console.log('Call answered.');
//         }

//         // Play the pre-recorded file
//         if (channel.state !== 'Hangup') {
//           await channel.play({ media: `sound:${helloPath}` });
//           console.log('Playing pre-recorded message.');
//         }

//         // Listen for DTMF (key presses)
//         channel.on('ChannelDtmfReceived', async (dtmfEvent) => {
//           if (isInputReceived || channel.state === 'Hangup') return;

//           const digit = dtmfEvent.digit;
//           console.log(`DTMF received: ${digit}`);

//           if (digit === '1') {
//             console.log('User pressed 1 - adding to HOT list');
//             await saveCallStatusToDatabase(channel.caller.number, 'hot'); // Save to DB
//           } else {
//             console.log('User pressed an invalid key - adding to STEAM list');
//             await saveCallStatusToDatabase(channel.caller.number, 'steam'); // Save to DB
//           }

//           isInputReceived = true;
//           clearTimeout(timeoutId); // Clear the timeout
//           if (channel.state !== 'Hangup') {
//             await channel.hangup();
//             console.log('Call hung up after DTMF input.');
//           }
//         });

//         // Timeout for no input
//         timeoutId = setTimeout(async () => {
//           if (!isInputReceived && channel.state !== 'Hangup') {
//             console.log('No input received - adding to COLD list');
//             await saveCallStatusToDatabase(channel.caller.number, 'cold'); // Save to DB
//             if (channel.state !== 'Hangup') {
//               await channel.hangup();
//               console.log('Call hung up due to no input.');
//             }
//           }
//         }, 10000); // 10 seconds timeout

//       } catch (err) {
//         console.error('Error in StasisStart handler:', err);
//       }
//     });

//     client.on('StasisEnd', (event, channel) => {
//       console.log(`Call ended on channel: ${channel.name}`);
//     });

//     client.start(appName);
//     console.log('ARI application "my-ari-app" registered successfully');
//   } catch (err) {
//     console.error('Error connecting to ARI:', err);
//   }
// })();



require('dotenv').config();
const AriClient = require('ari-client');
const { saveCallStatusToDatabase } = require('./db-utils');
const path = require('path'); // Node.js module to handle file paths

const helloPath = path.resolve(__dirname, '../../../public/hello.wav'); // Get the full file path

const ARI_URL = process.env.ARI_URL || 'http://localhost:8088';
const ARI_USERNAME = process.env.ARI_USERNAME || 'asterisk';
const ARI_PASSWORD = process.env.ARI_PASSWORD || 'asterisk';

(async () => {
  try {
    // Connect to the ARI client
    const client = await AriClient.connect(ARI_URL, ARI_USERNAME, ARI_PASSWORD);

    console.log('Connected to ARI');

    // Define the ARI app to handle calls
    const appName = 'my-ari-app';

    client.on('StasisStart', async (event, channel) => {
      console.log(`Call received on channel: ${channel.name}`);

      let isInputReceived = false; // Flag to track if valid input was received
      let timeoutId; // Timeout ID for clearing

      try {
        // Timeout for unanswered calls
        timeoutId = setTimeout(async () => {
          if (!isInputReceived) {
            try {
              const channelState = await client.channels.get({ channelId: channel.id }); // Fetch the channel state
              if (channelState.state === 'Ring' || channelState.state === 'Down') {
                console.log(`Call unanswered - adding ${channel.caller.number} to COLD list`);
                await saveCallStatusToDatabase(channel.caller.number, 'cold'); // Save to DB
              } else if (channelState.state === 'Up') {
                console.log(`Call answered but no input received - adding ${channel.caller.number} to STEAM list`);
                await saveCallStatusToDatabase(channel.caller.number, 'steam'); // Save to DB
              }
            } catch (error) {
              console.error('Error fetching channel state:', error.message);
            }
          }
        }, 10000); // 10 seconds timeout

        // Answer the call
        if (channel.state !== 'Hangup') {
          await channel.answer();
          console.log('Call answered.');
        }

        // Play the pre-recorded file
        if (channel.state !== 'Hangup') {
          await channel.play({ media: `sound:${helloPath}` });
          console.log('Playing pre-recorded message.');
        }

        // Listen for DTMF (key presses)
        channel.on('ChannelDtmfReceived', async (dtmfEvent) => {
          if (isInputReceived || channel.state === 'Hangup') return;

          const digit = dtmfEvent.digit;
          console.log(`DTMF received: ${digit}`);

          if (digit === '1') {
            console.log('User pressed 1 - adding to HOT list');
            await saveCallStatusToDatabase(channel.caller.number, 'hot'); // Save to DB
          } else {
            console.log('User pressed an invalid key - adding to STEAM list');
            await saveCallStatusToDatabase(channel.caller.number, 'steam'); // Save to DB
          }

          isInputReceived = true;
          clearTimeout(timeoutId); // Clear the timeout
          if (channel.state !== 'Hangup') {
            await channel.hangup();
            console.log('Call hung up after DTMF input.');
          }
        });

        // Handle hangup before any input or timeout
        channel.on('ChannelHangupRequest', async () => {
          if (!isInputReceived) {
            console.log(`Call ended before input - adding ${channel.caller.number} to COLD list`);
            await saveCallStatusToDatabase(channel.caller.number, 'cold'); // Save to DB
          }
          isInputReceived = true; // Prevent double saving
          clearTimeout(timeoutId); // Clear the timeout
        });
      } catch (err) {
        console.error('Error in StasisStart handler:', err);
      }
    });

    client.on('StasisEnd', (event, channel) => {
      console.log(`Call ended on channel: ${channel.name}`);
    });

    client.start(appName);
    console.log('ARI application "my-ari-app" registered successfully');
  } catch (err) {
    console.error('Error connecting to ARI:', err);
  }
})();
