// db-utils.js

const pool = require("../db/connection");

async function saveCallStatusToDatabase(phoneNumber, status) {
  try {
    const query = `
      INSERT INTO call_list (phone_number, status)
      VALUES ($1, $2)
      ON CONFLICT (phone_number)
      DO UPDATE SET status = EXCLUDED.status
    `;
    const values = [phoneNumber, status];
    await pool.query(query, values);
    console.log(`Saved ${phoneNumber} as ${status} in the database`);
  } catch (err) {
    console.error('Error saving call status to database:', err);
  }
}

module.exports = {
  saveCallStatusToDatabase,
};
