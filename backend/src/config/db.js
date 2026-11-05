const mysql = require('mysql2/promise');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkDatabaseConnection() {
    const missingVariables = requiredVariables.filter((name) => !process.env[name]);
    if (missingVariables.length > 0) {
        throw new Error(`Konfigurasi database belum lengkap: ${missingVariables.join(', ')}`);
    }

    await pool.query('SELECT 1');
}

module.exports = { pool, checkDatabaseConnection };