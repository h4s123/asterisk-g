const db = require('../config/db');

const getUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const getUserById = async (id) => {
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return null; // User not found
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
};

const createUser = async (name, email, password, role, ip_address) => {
  const result = await db.query(
    'INSERT INTO users (name, email, password, role, ip_address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, password, role, ip_address]
  );
  return result.rows[0];
};

const updateUserBalance = async (userId, balance) => {
  const result = await db.query(
    'UPDATE users SET balance = $1 WHERE id = $2 RETURNING *',
    [balance, userId]
  );
  return result.rows[0];
};

const allocateTrunks = async (userId, trunks) => {
  const result = await db.query(
    'UPDATE users SET trunks = $1 WHERE id = $2 RETURNING *',
    [JSON.stringify(trunks), userId]
  );
  return result.rows[0];
};

const freezeUser = async (userId) => {
  const result = await db.query(
    'UPDATE users SET is_frozen = true WHERE id = $1 RETURNING *',
    [userId]
  );
  return result.rows[0];
};

module.exports = { getUserByEmail, getUserById, createUser, updateUserBalance, allocateTrunks, freezeUser };
