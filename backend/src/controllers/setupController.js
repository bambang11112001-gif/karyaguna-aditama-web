const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createDefaultAdmin = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Cek apakah user admin sudah ada
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', ['admin']);
        
        if (existing.length > 0) {
            // Update password jika sudah ada
            await db.execute(
                'UPDATE users SET password = ?, email = ? WHERE username = ?',
                [hashedPassword, 'karyagunaaditama88@gmail.com', 'admin']
            );
            return res.json({ success: true, message: 'Password akun admin berhasil di-reset ulang menjadi "admin123"!' });
        } else {
            // Insert baru jika belum ada
            await db.execute(
                'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
                ['Super Admin', 'admin', 'karyagunaaditama88@gmail.com', hashedPassword, 'superadmin']
            );
            return res.json({ success: true, message: 'Akun admin berhasil dibuat dengan password "admin123"!' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};