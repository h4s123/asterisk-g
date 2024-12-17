// ari-connection.js
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

      // Answer the call
      await channel.answer();

      // Play your pre-recorded file
      await channel.play({ media: `sound:${helloPath}` }); // Use the correct file format for Asterisk

      // Listen for DTMF (key presses)
      channel.on('ChannelDtmfReceived', async (dtmfEvent) => {
        const digit = dtmfEvent.digit;
        console.log(`DTMF received: ${digit}`);

        if (digit === '1') {
          console.log('User pressed 1 - adding to HOT list');
          saveCallStatusToDatabase(channel.caller.number, 'hot'); // Save to DB
        } else {
          console.log('No key pressed - adding to COLD list');
          saveCallStatusToDatabase(channel.caller.number, 'cold'); // Save to DB
        }

        // Hang up the call
        await channel.hangup();
      });

      // Timeout handling: If no DTMF is received within 10 seconds, mark as COLD
      setTimeout(async () => {
        if (!channel.hungup) {
          console.log('No input received - adding to COLD list');
          saveCallStatusToDatabase(channel.caller.number, 'cold'); // Save to DB
          await channel.hangup();
        }
      }, 10000);
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
