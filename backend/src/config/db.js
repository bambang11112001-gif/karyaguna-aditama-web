const mysql = require('mysql2/promise');
const path = require('node:path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const requiredVariables = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASS',
    'DB_NAME'
];

const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]
);

if (missingVariables.length > 0) {
    throw new Error(
        `Konfigurasi database belum lengkap: ${missingVariables.join(', ')}`
    );
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000
});

async function checkDatabaseConnection() {
    const connection = await pool.getConnection();

    try {
        await connection.query('SELECT 1');
        console.log('Database Aiven berhasil terhubung!');
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    checkDatabaseConnection
};