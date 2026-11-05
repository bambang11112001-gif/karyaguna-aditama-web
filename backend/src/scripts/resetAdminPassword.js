const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function resetAdminPassword(username, password) {
    if (!username || !password) {
        throw new Error('ADMIN_USERNAME dan ADMIN_PASSWORD wajib diisi.');
    }

    if (password.length < 12) {
        throw new Error('Password baru harus terdiri dari minimal 12 karakter.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, username]
    );

    if (result.affectedRows === 0) {
        throw new Error('Akun dengan username tersebut tidak ditemukan.');
    }
}

if (require.main === module) {
    resetAdminPassword(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD)
        .then(() => {
            console.log('Password admin berhasil direset.');
        })
        .catch((error) => {
            console.error('Gagal mereset password admin:', error.message);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}

module.exports = { resetAdminPassword };
